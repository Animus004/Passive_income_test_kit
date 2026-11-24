/**
 * Automatic Prop Escalation for Mr. Omi Cartoon Shorts
 * Location: templates/bridge/propEscalation.ts
 * 
 * Wires shot-normalized progress (0 -> 1) into hazard/action props:
 * - Puddles: scale on floor from 0.6 to 1.15 smoothly over shot duration
 * - Leaks / Drips: stretch downwards from seam, sliding and throbbing drip bulbs
 * - Pressure bulges: expand outward with subtle high-frequency groaning vibration
 * - Cracks: propagate and branch along geometry seams
 */

import * as THREE from "three";

export type PropType = "puddle" | "drip" | "drip_bulb" | "pressure_bulge" | "crack" | "rising_level";

export interface PropEscalationOptions {
  minScale?: number;
  maxScale?: number;
  anchorY?: number;
  baseLength?: number;
  frequency?: number;
}

/**
 * Calculates shot-normalized progress [0, 1] clamped safely
 */
export function getShotProgress(frame: number, shotStart: number, shotEnd: number): number {
  if (shotEnd <= shotStart) return 0.0;
  const raw = (frame - shotStart) / (shotEnd - shotStart);
  return Math.max(0.0, Math.min(1.0, raw));
}

/**
 * Applies procedural escalation to a 3D hazard or action prop based on shot progress
 */
export function applyPropEscalation(
  mesh: THREE.Object3D,
  type: PropType,
  progress: number,
  options: PropEscalationOptions = {}
) {
  const p = Math.max(0.0, Math.min(1.0, progress));

  switch (type) {
    case "puddle": {
      // Puddles expand outward horizontally (X and Z) from minScale (default 0.6) to maxScale (default 1.15)
      const minS = options.minScale ?? 0.6;
      const maxS = options.maxScale ?? 1.15;
      const s = minS + (maxS - minS) * p;
      mesh.scale.set(s, 1.0, s);
      break;
    }

    case "drip": {
      // Drips lengthen downward along Y, anchored at anchorY (seam level)
      const minS = options.minScale ?? 1.0;
      const maxS = options.maxScale ?? 1.35;
      const stretch = minS + (maxS - minS) * p;
      const anchorY = options.anchorY ?? mesh.position.y;
      const baseLen = options.baseLength ?? 0.95;

      mesh.scale.set(1.0 + p * 0.15, stretch, 1.0 + p * 0.15);
      mesh.position.y = anchorY - (baseLen * stretch) / 2;
      break;
    }

    case "drip_bulb": {
      // Drip bulb slides downward and pulses/throbs
      const minS = options.minScale ?? 1.0;
      const maxS = options.maxScale ?? 1.3;
      const anchorY = options.anchorY ?? 1.855;
      const baseLen = options.baseLength ?? 0.95;

      const bulbY = anchorY - (baseLen * (1.0 + p * 0.35));
      const pulse = Math.sin(p * Math.PI * 4) * 0.08;
      const bulbScale = (minS + (maxS - minS) * p) + pulse;

      mesh.position.y = bulbY;
      mesh.scale.set(bulbScale, bulbScale * 1.25, bulbScale);
      break;
    }

    case "pressure_bulge": {
      // Pressure bulge expands outward with high-frequency groaning vibration
      const minS = options.minScale ?? 1.0;
      const maxS = options.maxScale ?? 1.45;
      const freq = options.frequency ?? 30.0;
      const vibration = Math.sin(p * freq) * 0.04;
      const scale = minS + (maxS - minS) * p + vibration;

      mesh.scale.set(scale * 1.2, scale * 0.8, scale * 0.6);
      break;
    }

    case "rising_level": {
      // Liquid level rises smoothly over the shot
      const minS = options.minScale ?? 0.1;
      const maxS = options.maxScale ?? 1.0;
      const s = minS + (maxS - minS) * p;
      mesh.scale.set(1.0, s, 1.0);
      break;
    }

    case "crack": {
      // Cracks lengthen and widen
      const minS = options.minScale ?? 0.2;
      const maxS = options.maxScale ?? 1.0;
      const s = minS + (maxS - minS) * p;
      mesh.scale.set(s, s, s);
      break;
    }
  }
}
