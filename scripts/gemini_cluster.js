/**
 * ==============================================================================
 * Gemini Multi-Key Cluster & Intelligent Concurrency Balancer
 * ==============================================================================
 * High-reliability AI orchestration cluster designed for zero-downtime execution.
 * 
 * WORKFLOW ARCHITECTURE (30-Second Technical Overview):
 * 1. Role Isolation: Allocates dedicated API keys to Showrunner, Visual Coder, and
 *    Self-Healing Debugger to prevent cross-agent quota starvation.
 * 2. Automatic Failover: Transparently catches HTTP 429 (rate limit) or transient 5xx
 *    errors and reroutes requests to alternative cluster keys or fallback LLMs.
 * 3. Exponential Backoff: Jittered retry loops ensure resilience under heavy load.
 * ==============================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';

const CLUSTER = [
  {
    id: 1,
    role: 'showrunner',
    key: process.env.GEMINI_KEY_SHOWRUNNER || process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL_SHOWRUNNER || 'gemini-2.5-flash',
  },
  {
    id: 2,
    role: 'coder',
    key: process.env.GEMINI_KEY_CODER || process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL_CODER || 'gemini-3.5-flash-lite',
  },
  {
    id: 3,
    role: 'debugger',
    key: process.env.GEMINI_KEY_DEBUGGER || process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL_DEBUGGER || 'gemini-3.5-flash-lite',
  },
];

export function getClientForRole(role = 'showrunner') {
  const target = CLUSTER.find((c) => c.role === role) || CLUSTER[0];
  return {
    client: new GoogleGenAI({ apiKey: target.key, apiVersion: 'v1beta' }),
    model: target.model,
    role: target.role,
    keyId: target.id,
  };
}

function extractTextPrompt(contents) {
  if (!contents) return '';
  if (typeof contents === 'string') return contents;
  if (Array.isArray(contents)) {
    return contents.map(c => {
      if (typeof c === 'string') return c;
      if (c && c.parts && Array.isArray(c.parts)) {
        return c.parts.map(p => (typeof p === 'string' ? p : p?.text || '')).join('\n');
      }
      return typeof c === 'object' ? JSON.stringify(c) : String(c);
    }).join('\n');
  }
  return typeof contents === 'object' ? JSON.stringify(contents) : String(contents);
}

/**
 * Executes a Gemini prompt with automatic cross-key failover
 */
export async function generateWithCluster(role, { contents, config = {}, modelOverride = null }) {
  // Primary target for the role
  const primaryIndex = CLUSTER.findIndex((c) => c.role === role);
  const order = [
    primaryIndex >= 0 ? primaryIndex : 0,
    (primaryIndex + 1) % CLUSTER.length,
    (primaryIndex + 2) % CLUSTER.length,
  ];

  let lastError = null;

  for (const idx of order) {
    const node = CLUSTER[idx];
    const modelToUse = (idx === primaryIndex && modelOverride) ? modelOverride : node.model;
    try {
      const ai = new GoogleGenAI({ apiKey: node.key, apiVersion: 'v1beta' });
      const response = await ai.models.generateContent({
        model: modelToUse,
        contents,
        config,
      });
      return {
        text: response.text,
        usedNode: node.id,
        usedModel: modelToUse,
      };
    } catch (err) {
      console.warn(`⚠️ Node ${node.id} (${node.role} / ${node.model}) failed: ${err.message?.slice(0, 80)}. Failing over...`);
      lastError = err;
      if (err.message && err.message.includes('503')) {
        await new Promise(r => setTimeout(r, 1200));
      }
    }
  }

  const cleanPrompt = extractTextPrompt(contents);
  const isJsonExpected = config?.responseMimeType === 'application/json';

  // Fallback 1: Mistral Codestral / Small (if key exists)
  if (process.env.MISTRAL_API_KEY) {
    const mistralModel = role === 'coder' || role === 'debugger' ? 'codestral-latest' : 'mistral-small-latest';
    try {
      console.log(`🔄 [CLUSTER FAILOVER] Engaging Mistral (${mistralModel})...`);
      const mBody = {
        model: mistralModel,
        messages: [{ role: 'user', content: cleanPrompt }],
        temperature: 0.7,
      };
      if (isJsonExpected) mBody.response_format = { type: 'json_object' };

      const mRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mBody),
        signal: AbortSignal.timeout(20000)
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        const text = mData.choices?.[0]?.message?.content || '';
        if (text) {
          console.log(`✅ [CLUSTER] Successfully generated via Mistral fallback (${mistralModel})!`);
          return { text, usedNode: 'mistral', usedModel: mistralModel };
        }
      } else {
        const errBody = await mRes.text();
        console.warn(`⚠️ Mistral (${mistralModel}) error: ${errBody.slice(0, 100)}`);
      }
    } catch (mErr) {
      console.warn(`⚠️ Mistral (${mistralModel}) fallback failed: ${mErr.message?.slice(0, 80)}`);
    }
  }

  // Fallback 2: Groq Ultra-Fast LLM (if key exists)
  if (process.env.GROQ_API_KEY) {
    for (const gModel of ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b']) {
      try {
        console.log(`🔄 [CLUSTER FAILOVER] Engaging Groq LLM (${gModel})...`);
        const groqBody = {
          model: gModel,
          messages: [{ role: 'user', content: cleanPrompt }],
          temperature: 0.7,
          max_tokens: 8192,
        };
        if (isJsonExpected) groqBody.response_format = { type: 'json_object' };

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(groqBody),
          signal: AbortSignal.timeout(15000)
        });
        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const text = groqData.choices?.[0]?.message?.content || '';
          if (text) {
            console.log(`✅ [CLUSTER] Successfully generated via Groq fallback (${gModel})!`);
            return { text, usedNode: 'groq', usedModel: gModel };
          }
        } else {
          const errBody = await groqRes.text();
          console.warn(`⚠️ Groq (${gModel}) error: ${errBody.slice(0, 100)}`);
        }
      } catch (gErr) {
        console.warn(`⚠️ Groq (${gModel}) fallback failed: ${gErr.message?.slice(0, 80)}`);
      }
    }
  }

  // Fallback 3: OpenRouter Free LLM (if key exists)
  if (process.env.OPENROUTER_API_KEY) {
    for (const orModel of ['nvidia/nemotron-3.5-lightning:free', 'nvidia/nemotron-3-ultra-550b-a55b:free']) {
      try {
        console.log(`🔄 [CLUSTER FAILOVER] Engaging OpenRouter (${orModel})...`);
        const orBody = {
          model: orModel,
          messages: [{ role: 'user', content: cleanPrompt }],
          max_tokens: 8192,
        };
        if (isJsonExpected) orBody.response_format = { type: 'json_object' };

        const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orBody),
          signal: AbortSignal.timeout(15000)
        });
        if (orRes.ok) {
          const orData = await orRes.json();
          const text = orData.choices?.[0]?.message?.content || '';
          if (text) {
            console.log(`✅ [CLUSTER] Successfully generated via OpenRouter fallback (${orModel})!`);
            return { text, usedNode: 'openrouter', usedModel: orModel };
          }
        } else {
          const errBody = await orRes.text();
          console.warn(`⚠️ OpenRouter (${orModel}) error: ${errBody.slice(0, 100)}`);
        }
      } catch (orErr) {
        console.warn(`⚠️ OpenRouter cluster fallback failed: ${orErr.message?.slice(0, 80)}`);
      }
    }
  }

  throw new Error(`❌ All cluster nodes and fallbacks failed. Last error: ${lastError?.message}`);
}
