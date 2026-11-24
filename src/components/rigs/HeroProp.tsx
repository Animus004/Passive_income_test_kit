import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import vectorsManifest from '../../data/vectors_manifest.json';

export type HeroPropType =
  // Original Props
  | 'alarm_clock_retro'
  | 'duvet_cocoon'
  | 'candelabra_vintage'
  | 'coffee_mug_spill'
  | 'poster_rise_grind'
  | 'desk_monitor_clock'
  | 'deflated_balloon_brain'
  | 'pillow_cloud_heaven'
  | 'phone_alarm_toggle'
  // Workplace, Tech & Anxiety Props
  | 'slack_card'
  | 'slack_notification_card'
  | 'typing_dots_bubble'
  | 'bomb_wires_defusal'
  | 'slack_huddle_window'
  | 'reply_all_nuke'
  | 'reply_all_button'
  | 'incident_report_stack'
  | 'loose_paperwork_stack'
  | 'smartphone_message'
  | 'cartoon_hand_holding_phone'
  | 'boss_call_tile'
  | 'deflated_melt_puddle'
  | 'desk_laptop_open'
  | 'glowing_laptop'
  | 'desk_plant'
  | 'siren_red_beacon'
  // Ancient Strategy & History (Chanakya / Mahabharata)
  | 'chanakya_scroll'
  | 'poison_kanya_goblet'
  | 'sword_shield_emblem'
  | 'ashoka_pillar_emblem'
  | 'two_faced_mask'
  | 'golden_lock_padlock'
  | 'clay_kulhad_tea'
  | 'viral_comment_bubbles'
  // Ancient Wealth & Trade ("Sone Ki Chidiya")
  | 'golden_sparrow_bird'
  | 'gold_coins_overflow_chest'
  | 'spices_trade_ship'
  | 'weighing_scale_gold'
  // Middle-Class Money Traps & Finance
  | 'salary_slip_drain'
  | 'emi_chains_lock'
  | 'credit_card_trap'
  | 'money_drain_sink'
  // Unsolved Mysteries & Temple Lore
  | 'vault_b_door'
  | 'forbidden_temple_lock'
  | 'kuldhara_abandoned_ruin'
  | 'mystic_diya_flame'
  | string;

export interface HeroPropProps {
  type: HeroPropType;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  shakeIntensity?: number;
  opacity?: number;
  accentColor?: string;
  customText?: string;
  customSubtext?: string;
  [key: string]: any;
}

export const HeroProp: React.FC<HeroPropProps> = ({
  type,
  x = 0,
  y = 0,
  scale = 1,
  rotation = 0,
  shakeIntensity = 0,
  opacity = 1,
  accentColor = '#EF4444',
  customText,
  customSubtext,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Natural snappy entrance impact & decaying shake (Decays to 0 within 14 frames - NO endless vibrating!)
  const decayFactor = Math.max(0, 1 - frame / 14);
  const effectiveShake = (shakeIntensity || 0) * decayFactor;
  const shakeX = effectiveShake > 0.005 ? Math.sin(frame * 2.5) * effectiveShake * 10 : 0;
  const shakeY = effectiveShake > 0.005 ? Math.cos(frame * 3.1) * effectiveShake * 7 : 0;

  // Gentle, organic idle breathing pulse (only 1% scale fluctuation, perfectly calm and rock-solid)
  const pulseScale = 1 + Math.sin((frame / fps) * Math.PI * 1.5) * 0.012;

  const STROKE = '#000000';
  const STROKE_WIDTH = 10;

  const renderPropContent = () => {
    // Robust, zero-regex fuzzy alias matching to guarantee real vector art
    const rawType = (type || '').toLowerCase();
    let resolvedType = rawType;

    if (rawType.includes('mask') || rawType.includes('two_face') || rawType.includes('betrayal') || rawType.includes('shadow')) {
      resolvedType = 'two_faced_mask';
    } else if (rawType.includes('lock') || rawType.includes('padlock')) {
      resolvedType = 'golden_lock_padlock';
    } else if (rawType.includes('tea') || rawType.includes('chai') || rawType.includes('kulhad')) {
      resolvedType = 'clay_kulhad_tea';
    } else if (rawType.includes('bubble') || rawType.includes('comment') || rawType.includes('chat') || rawType.includes('notification')) {
      resolvedType = 'viral_comment_bubbles';
    } else if (rawType.includes('scroll') || rawType.includes('niti')) {
      resolvedType = 'chanakya_scroll';
    } else if (rawType.includes('chest') || rawType.includes('treasure')) {
      resolvedType = 'gold_coins_overflow_chest';
    } else if (rawType.includes('sparrow') || rawType.includes('chidiya') || rawType.includes('bird')) {
      resolvedType = 'golden_sparrow_bird';
    } else if (rawType.includes('sword') || rawType.includes('shield') || rawType.includes('warrior')) {
      resolvedType = 'sword_shield_emblem';
    } else if (rawType.includes('vault') || rawType.includes('temple_door') || rawType.includes('naga')) {
      resolvedType = 'vault_b_door';
    } else if (rawType.includes('diya') || rawType.includes('lamp') || rawType.includes('flame')) {
      resolvedType = 'mystic_diya_flame';
    } else if (rawType.includes('poison') || rawType.includes('kanya') || rawType.includes('goblet')) {
      resolvedType = 'poison_kanya_goblet';
    } else if (rawType.includes('ship') || rawType.includes('trade_boat') || rawType.includes('dhow')) {
      resolvedType = 'spices_trade_ship';
    } else if (rawType.includes('scale') || rawType.includes('weigh')) {
      resolvedType = 'weighing_scale_gold';
    } else if (rawType.includes('salary') || rawType.includes('slip') || rawType.includes('statement')) {
      resolvedType = 'salary_slip_drain';
    } else if (rawType.includes('emi') || rawType.includes('chain')) {
      resolvedType = 'emi_chains_lock';
    } else if (rawType.includes('credit') || rawType.includes('trap')) {
      resolvedType = 'credit_card_trap';
    } else if (rawType.includes('slack')) {
      resolvedType = 'slack_card';
    } else if (rawType.includes('phone') || rawType.includes('mobile') || rawType.includes('whatsapp')) {
      resolvedType = 'smartphone_message';
    } else if (rawType.includes('laptop') || rawType.includes('macbook')) {
      resolvedType = 'desk_laptop_open';
    } else if (rawType.includes('alarm') || rawType.includes('clock')) {
      resolvedType = 'alarm_clock_retro';
    } else if (rawType.includes('coffee') || rawType.includes('mug')) {
      resolvedType = 'coffee_mug_spill';
    } else if (rawType.includes('chakra') || rawType.includes('pillar') || rawType.includes('ashoka')) {
      resolvedType = 'ashoka_pillar_emblem';
    }

    switch (resolvedType) {
      // =========================================================================
      // 1. SLACK NOTIFICATION CARD (Glowing dark-mode alert)
      // =========================================================================
      case 'slack_card':
      case 'slack_notification_card': {
        const pingGlow = 0.5 + Math.sin(frame * 0.3) * 0.5;
        return (
          <g id="prop_slack_card">
            {/* Pulsing Red Warning Glow Ring */}
            <rect
              x="30"
              y="110"
              width="440"
              height="280"
              rx="32"
              fill="none"
              stroke="#EF4444"
              strokeWidth={14 * pingGlow}
              opacity={0.7 * pingGlow}
            />

            {/* Main Window Container */}
            <rect
              x="40"
              y="120"
              width="420"
              height="260"
              rx="28"
              fill="#1E1F22"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />

            {/* Window Top Bar */}
            <path
              d="M 40 148 Q 40 120 68 120 L 432 120 Q 460 120 460 148 L 460 175 L 40 175 Z"
              fill="#111215"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />

            {/* Window Control Dots */}
            <circle cx="75" cy="148" r="8" fill="#EF4444" stroke={STROKE} strokeWidth="3" />
            <circle cx="100" cy="148" r="8" fill="#F59E0B" stroke={STROKE} strokeWidth="3" />
            <circle cx="125" cy="148" r="8" fill="#10B981" stroke={STROKE} strokeWidth="3" />

            {/* Slack Logo Quadrant Icon */}
            <g transform="translate(70, 205)">
              <rect x="0" y="0" width="14" height="28" rx="7" fill="#E01E5A" stroke={STROKE} strokeWidth="3" />
              <rect x="18" y="14" width="28" height="14" rx="7" fill="#36C5F0" stroke={STROKE} strokeWidth="3" />
              <rect x="28" y="-14" width="14" height="28" rx="7" fill="#2EB67D" stroke={STROKE} strokeWidth="3" />
              <rect x="-14" y="0" width="28" height="14" rx="7" fill="#ECB22E" stroke={STROKE} strokeWidth="3" />
            </g>

            {/* Header: Manager Name & Timestamp */}
            <text x="135" y="215" fill="#FFFFFF" fontSize="22" fontWeight="900" fontFamily="sans-serif">
              Manager (Direct Message)
            </text>
            <text x="135" y="240" fill="#94A3B8" fontSize="16" fontWeight="700" fontFamily="sans-serif">
              Today at 9:02 AM • 🔴 Urgent
            </text>

            {/* Two Fatal Words with Red Highlight Box */}
            <rect x="70" y="265" width="360" height="85" rx="18" fill="#EF4444" stroke={STROKE} strokeWidth="6" />
            <text x="250" y="320" textAnchor="middle" fill="#FFFFFF" fontSize="34" fontWeight="900" fontFamily="sans-serif">
              {customText || '"Got a minute?"'}
            </text>
          </g>
        );
      }

      // =========================================================================
      // 2. TYPING DOTS BUBBLE (The Agony of Waiting)
      // =========================================================================
      case 'typing_dots_bubble': {
        const dot1Y = Math.sin(frame * 0.25) * 16;
        const dot2Y = Math.sin(frame * 0.25 + 1.1) * 16;
        const dot3Y = Math.sin(frame * 0.25 + 2.2) * 16;
        return (
          <g id="prop_typing_dots_bubble">
            {/* Ominous Radiating Aura */}
            <circle cx="250" cy="220" r="190" fill="#EF4444" opacity="0.15" />

            {/* Comic Speech Bubble Body */}
            <rect
              x="60"
              y="110"
              width="380"
              height="200"
              rx="40"
              fill="#FFFFFF"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />

            {/* Speech Bubble Pointer Tail */}
            <polygon
              points="150,310 120,380 200,310"
              fill="#FFFFFF"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Clean Tail Overwrite */}
            <polygon points="152,305 125,372 195,305" fill="#FFFFFF" />

            {/* Three Heavy Bouncing Pulsing Dots */}
            <circle cx="160" cy={210 + dot1Y} r="26" fill="#3B82F6" stroke={STROKE} strokeWidth="6" />
            <circle cx="250" cy={210 + dot2Y} r="26" fill="#EF4444" stroke={STROKE} strokeWidth="6" />
            <circle cx="340" cy={210 + dot3Y} r="26" fill="#F59E0B" stroke={STROKE} strokeWidth="6" />

            {/* Dramatic Comic Sweat Drops */}
            <path d="M 440 130 Q 465 110 455 145 Q 445 145 440 130 Z" fill="#38BDF8" stroke={STROKE} strokeWidth="5" />
            <path d="M 50 160 Q 30 140 38 175 Q 48 175 50 160 Z" fill="#38BDF8" stroke={STROKE} strokeWidth="5" />
          </g>
        );
      }

      // =========================================================================
      // 3. BOMB DEFUSAL KIT / WIRE CUTTERS
      // =========================================================================
      case 'bomb_wires_defusal':
      case 'slack_huddle_window': {
        const cutterVibe = Math.sin(frame * 1.6) * 8;
        const blinkSec = Math.floor(frame / 15) % 2 === 0;
        return (
          <g id="prop_bomb_wires_defusal">
            {/* Defusal Case Base */}
            <rect x="50" y="100" width="400" height="300" rx="32" fill="#334155" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="70" y="120" width="360" height="120" rx="20" fill="#0F172A" stroke={STROKE} strokeWidth="8" />

            {/* 7-Segment Countdown Timer */}
            <text x="250" y="200" textAnchor="middle" fill="#EF4444" fontSize="64" fontWeight="900" fontFamily="monospace">
              00:0{blinkSec ? '3' : '2'}
            </text>

            {/* Snaking Wires */}
            {/* Red Wire (Cut = Disaster) */}
            <path
              d="M 100 240 C 130 330 180 330 220 280 C 250 240 280 240 310 320"
              fill="none"
              stroke="#EF4444"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M 100 240 C 130 330 180 330 220 280 C 250 240 280 240 310 320"
              fill="none"
              stroke={STROKE}
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Green Wire (The Huddle Link Wire) */}
            <path
              d="M 120 270 C 170 360 230 370 280 310 C 330 250 370 300 400 320"
              fill="none"
              stroke="#22C55E"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M 120 270 C 170 360 230 370 280 310 C 330 250 370 300 400 320"
              fill="none"
              stroke={STROKE}
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Hovering Heavy Wire Cutters vibrating */}
            <g transform={`translate(${280 + cutterVibe}, 280) rotate(-25)`}>
              {/* Handles */}
              <line x1="-30" y1="90" x2="0" y2="20" stroke="#F97316" strokeWidth="24" strokeLinecap="round" />
              <line x1="30" y1="90" x2="0" y2="20" stroke="#F97316" strokeWidth="24" strokeLinecap="round" />
              <circle cx="0" cy="20" r="16" fill="#94A3B8" stroke={STROKE} strokeWidth="6" />
              {/* Steel Blades clamping on green wire */}
              <polygon points="0,20 -24,-30 -8,-35" fill="#E2E8F0" stroke={STROKE} strokeWidth="6" />
              <polygon points="0,20 24,-30 8,-35" fill="#CBD5E1" stroke={STROKE} strokeWidth="6" />
            </g>
          </g>
        );
      }

      // =========================================================================
      // 4. GIANT "REPLY ALL" EMERGENCY BUTTON (The System Nuke)
      // =========================================================================
      case 'reply_all_nuke':
      case 'reply_all_button': {
        const pressPop = Math.abs(Math.sin(frame * 0.4)) * 12;
        return (
          <g id="prop_reply_all_nuke">
            {/* Caution Striped Mounting Board */}
            <rect x="50" y="80" width="400" height="340" rx="36" fill="#FBBF24" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Diagonal Hazard Stripes */}
            <path d="M 50 140 L 110 80 L 170 80 L 50 200 Z" fill="#000000" />
            <path d="M 50 260 L 230 80 L 290 80 L 50 320 Z" fill="#000000" />
            <path d="M 80 420 L 420 80 L 450 80 L 450 110 L 140 420 Z" fill="#000000" />
            <path d="M 200 420 L 450 170 L 450 230 L 260 420 Z" fill="#000000" />
            <path d="M 320 420 L 450 290 L 450 350 L 380 420 Z" fill="#000000" />

            {/* Industrial Button Pedestal */}
            <circle cx="250" cy="250" r="140" fill="#334155" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="250" cy="250" r="115" fill="#1E293B" stroke={STROKE} strokeWidth="8" />

            {/* Giant Red Dome Button */}
            <ellipse
              cx="250"
              cy={240 + pressPop}
              rx="95"
              ry="80"
              fill="#EF4444"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            <ellipse
              cx="230"
              cy={215 + pressPop}
              rx="60"
              ry="35"
              fill="#F87171"
              opacity="0.6"
            />

            {/* Text on Button */}
            <text
              x="250"
              y={255 + pressPop}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="28"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              REPLY ALL
            </text>

            {/* Flashing Alert Beacon Top */}
            <g transform="translate(250, 40)">
              <polygon points="-30,30 30,30 20,0 -20,0" fill="#EF4444" stroke={STROKE} strokeWidth="6" />
              <circle cx="0" cy="0" r="24" fill="#EF4444" stroke={STROKE} strokeWidth="6" />
              <circle cx="0" cy="0" r="40" fill="#EF4444" opacity={0.3 + 0.3 * Math.sin(frame * 0.5)} />
            </g>
          </g>
        );
      }

      // =========================================================================
      // 5. INCIDENT REPORT STACK / FLASHING DISASTERS
      // =========================================================================
      case 'incident_report_stack':
      case 'loose_paperwork_stack': {
        const floatWave = Math.sin(frame * 0.1) * 8;
        return (
          <g id="prop_incident_report_stack" transform={`translate(0, ${floatWave})`}>
            {/* Background Folder 1 */}
            <g transform="rotate(-15, 230, 250)">
              <rect x="100" y="110" width="260" height="320" rx="16" fill="#FDE68A" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
              <text x="130" y="170" fill="#78350F" fontSize="20" fontWeight="900">INCIDENT #404</text>
              <line x1="130" y1="200" x2="310" y2="200" stroke="#B45309" strokeWidth="6" strokeLinecap="round" />
              <line x1="130" y1="230" x2="280" y2="230" stroke="#B45309" strokeWidth="6" strokeLinecap="round" />
            </g>

            {/* Middle Folder 2 */}
            <g transform="rotate(12, 270, 240)">
              <rect x="140" y="100" width="260" height="320" rx="16" fill="#FCA5A5" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
              <text x="170" y="160" fill="#991B1B" fontSize="20" fontWeight="900">DB PROD DROP</text>
              <line x1="170" y1="190" x2="350" y2="190" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />
              <line x1="170" y1="220" x2="320" y2="220" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />
            </g>

            {/* Front Document with Giant Red Stamp */}
            <rect x="110" y="120" width="280" height="330" rx="16" fill="#FFFFFF" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="140" y="150" width="60" height="12" rx="4" fill="#0284C7" />
            <line x1="140" y1="180" x2="340" y2="180" stroke="#64748B" strokeWidth="8" strokeLinecap="round" />
            <line x1="140" y1="210" x2="320" y2="210" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            <line x1="140" y1="235" x2="350" y2="235" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            <line x1="140" y1="260" x2="280" y2="260" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />

            {/* Bloody Red Rubber Stamp */}
            <g transform="rotate(-18, 250, 320)">
              <rect x="130" y="280" width="240" height="75" rx="12" fill="none" stroke="#EF4444" strokeWidth="12" />
              <text x="250" y="332" textAnchor="middle" fill="#EF4444" fontSize="32" fontWeight="900" fontFamily="sans-serif">
                GUILTY
              </text>
            </g>
          </g>
        );
      }

      // =========================================================================
      // 6. SMARTPHONE / BANK SMS / NOTIFICATION ALERT
      // =========================================================================
      case 'smartphone_message':
      case 'bank_sms_alert':
      case 'cartoon_hand_holding_phone': {
        const phoneTremble = Math.sin(frame * 1.8) * 3;
        const isFinanceAlert = !customText || customText.includes('₹') || customText.includes('0.00') || customText.includes('Bal') || customText.includes('Salary') || customSubtext?.includes('Bank');
        const headerTitle = customSubtext || (isFinanceAlert ? 'BANK ALERT • SMS' : 'NOTIFICATION • URGENT');
        const headerColor = isFinanceAlert ? '#10B981' : '#3B82F6';

        return (
          <g id="prop_smartphone_message" transform={`translate(${phoneTremble}, 0)`}>
            {/* Phone Outer Shadow / Glow */}
            <rect x="86" y="56" width="328" height="408" rx="42" fill="#000000" opacity="0.3" />

            {/* Phone Metallic Bezel */}
            <rect x="90" y="60" width="320" height="400" rx="40" fill="#0F172A" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Phone Screen Glass */}
            <rect x="105" y="78" width="290" height="364" rx="28" fill="#0B0F19" stroke={STROKE} strokeWidth="6" />

            {/* Dynamic Island / Speaker Pill at Top */}
            <rect x="200" y="88" width="100" height="18" rx="9" fill="#000000" />
            <circle cx="282" cy="97" r="4" fill="#1E293B" />

            {/* Notification App Header */}
            <rect x="115" y="118" width="270" height="45" rx="14" fill="#1E293B" stroke={STROKE} strokeWidth="4" />
            <circle cx="138" cy="140" r="10" fill={headerColor} />
            <text x="156" y="146" fill="#F8FAFC" fontSize="14" fontWeight="900" fontFamily="sans-serif">
              {headerTitle}
            </text>
            <circle cx="365" cy="140" r="5" fill="#22C55E" />

            {/* Ingoing Message 1 (Salary Credit Card) */}
            <rect x="115" y="172" width="270" height="68" rx="16" fill="#1E293B" stroke={STROKE} strokeWidth="4" />
            <text x="130" y="198" fill="#94A3B8" fontSize="13" fontWeight="700">A/C **4892: SALARY CREDITED</text>
            <text x="130" y="226" fill="#10B981" fontSize="20" fontWeight="900">+ ₹ 75,000.00</text>

            {/* Urgent Alert Bubble 2 (Zero Balance Trap) */}
            <rect x="115" y="250" width="270" height="100" rx="18" fill="#7F1D1D" stroke="#EF4444" strokeWidth="5" />
            <rect x="125" y="258" width="96" height="22" rx="6" fill="#EF4444" />
            <text x="173" y="274" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">5TH OF MONTH</text>
            <text x="130" y="306" fill="#FCA5A5" fontSize="14" fontWeight="800">CURRENT AVAILABLE BAL</text>
            <text x="130" y="338" fill="#FFFFFF" fontSize="28" fontWeight="900" fontFamily="sans-serif">
              {customText || '₹ 0.00'}
            </text>

            {/* Warning Pill at Bottom */}
            <rect x="135" y="362" width="230" height="32" rx="16" fill="#DC2626" stroke={STROKE} strokeWidth="3" />
            <text x="250" y="384" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900">
              🚨 100% SALARY DRAINED
            </text>
          </g>
        );
      }

      case 'mom_browser_meme': {
        const phoneTremble = Math.sin(frame * 1.8) * 4;
        return (
          <g id="prop_mom_browser_meme" transform={`translate(${phoneTremble}, 0)`}>
            <rect x="90" y="60" width="320" height="400" rx="40" fill="#0F172A" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="105" y="80" width="290" height="360" rx="28" fill="#1E293B" stroke={STROKE} strokeWidth="6" />
            <rect x="105" y="80" width="290" height="60" rx="18" fill="#334155" />
            <circle cx="140" cy="110" r="18" fill="#EC4899" stroke={STROKE} strokeWidth="4" />
            <text x="170" y="116" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="sans-serif">
              Mom 💖
            </text>
            <circle cx="360" cy="110" r="6" fill="#22C55E" />
            <rect x="120" y="160" width="180" height="55" rx="16" fill="#475569" stroke={STROKE} strokeWidth="4" />
            <text x="135" y="195" fill="#FFFFFF" fontSize="16" fontWeight="700">Beta dinner kar liya?</text>
            <rect x="140" y="235" width="240" height="110" rx="18" fill="#0284C7" stroke={STROKE} strokeWidth="5" />
            <text x="155" y="270" fill="#FFFFFF" fontSize="16" fontWeight="800">Mom if anything</text>
            <text x="155" y="295" fill="#FFFFFF" fontSize="16" fontWeight="800">happens... I love you</text>
            <text x="155" y="325" fill="#FDE047" fontSize="15" fontWeight="900">DELETE MY BROWSER 😭</text>
          </g>
        );
      }

      // =========================================================================
      // 7. SMILING BOSS VIDEO CALL TILE (The Reveal: False Alarm!)
      // =========================================================================
      case 'boss_call_tile': {
        const cupSip = Math.sin(frame * 0.2) * 6;
        return (
          <g id="prop_boss_call_tile">
            {/* Video Call Window */}
            <rect x="50" y="90" width="400" height="320" rx="32" fill="#1E293B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Header bar with Green LIVE dot */}
            <rect x="50" y="90" width="400" height="50" rx="16" fill="#0F172A" />
            <circle cx="85" cy="115" r="8" fill="#22C55E" />
            <text x="110" y="122" fill="#FFFFFF" fontSize="18" fontWeight="800">HUDDLE • Boss (Smiling)</text>

            {/* Happy Boss Cartoon Torso */}
            <circle cx="250" cy="220" r="60" fill="#FED7AA" stroke={STROKE} strokeWidth="8" />
            {/* Slick Gray Boss Hair */}
            <path d="M 190 200 Q 250 140 310 200 Q 250 170 190 200 Z" fill="#94A3B8" stroke={STROKE} strokeWidth="7" />
            {/* Happy Closed Smiling Eyes */}
            <path d="M 220 220 Q 235 210 240 220" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
            <path d="M 260 220 Q 265 210 280 220" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
            {/* Warm Big Grin */}
            <path d="M 230 240 Q 250 265 270 240 Z" fill="#EF4444" stroke="#000000" strokeWidth="5" />

            {/* Suit & Tie */}
            <path d="M 170 280 L 330 280 L 340 400 L 160 400 Z" fill="#3B82F6" stroke={STROKE} strokeWidth="8" />
            <polygon points="250,280 240,360 250,380 260,360" fill="#F59E0B" stroke={STROKE} strokeWidth="5" />

            {/* Hand Holding Steaming Coffee Cup */}
            <g transform={`translate(320, ${260 + cupSip})`}>
              <rect x="0" y="0" width="55" height="70" rx="12" fill="#FFFFFF" stroke={STROKE} strokeWidth="6" />
              <path d="M 55 15 Q 75 35 55 55" fill="none" stroke={STROKE} strokeWidth="6" />
              <text x="27" y="42" textAnchor="middle" fill="#EF4444" fontSize="18" fontWeight="900">#1</text>
            </g>

            {/* Innocent Speech Bubble: "PDF link?" */}
            <g transform="translate(190, 40)">
              <rect x="0" y="0" width="220" height="60" rx="20" fill="#FFFFFF" stroke={STROKE} strokeWidth="6" />
              <text x="110" y="38" textAnchor="middle" fill="#000000" fontSize="18" fontWeight="900">
                "Hey, send that PDF?"
              </text>
            </g>
          </g>
        );
      }

      // =========================================================================
      // 8. DEFLATED MELTED PUDDLE (Total Exhaustion)
      // =========================================================================
      case 'deflated_melt_puddle': {
        const meltWave = Math.sin(frame * 0.15) * 6;
        return (
          <g id="prop_deflated_melt_puddle">
            {/* Floor/Desk Shadow */}
            <ellipse cx="250" cy="380" rx="200" ry="40" fill="rgba(0,0,0,0.25)" />

            {/* Melted Character Pool */}
            <path
              d={`M 80 370 Q 150 ${330 + meltWave} 250 ${340 - meltWave} Q 360 ${330 + meltWave} 420 370 Q 360 410 250 400 Q 140 410 80 370 Z`}
              fill="#3B82F6"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />

            {/* Flat Slumped Head in Puddle */}
            <ellipse cx="250" cy="345" rx="75" ry="40" fill="#FED7AA" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* X_X Dead/Exhausted Eyes */}
            <path d="M 215 335 L 235 355 M 235 335 L 215 355" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
            <path d="M 265 335 L 285 355 M 285 335 L 265 355" stroke="#000000" strokeWidth="6" strokeLinecap="round" />

            {/* Exhaustion Steam Rising */}
            <path d="M 220 300 Q 210 260 225 230" fill="none" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
            <path d="M 250 290 Q 260 250 245 220" fill="none" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
            <path d="M 280 300 Q 290 260 275 230" fill="none" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" opacity="0.6" />

            {/* Clock Reading 10:02 AM */}
            <g transform="translate(320, 240)">
              <rect x="0" y="0" width="110" height="50" rx="12" fill="#0F172A" stroke={STROKE} strokeWidth="5" />
              <text x="55" y="34" textAnchor="middle" fill="#22C55E" fontSize="20" fontWeight="900" fontFamily="monospace">
                10:02 AM
              </text>
            </g>
          </g>
        );
      }

      // =========================================================================
      // 9. DESK LAPTOP (Backlit open laptop)
      // =========================================================================
      case 'desk_laptop_open':
      case 'glowing_laptop': {
        const glowPulse = 0.8 + Math.sin(frame * 0.3) * 0.2;
        return (
          <g id="prop_desk_laptop_open">
            {/* Screen Glow */}
            <polygon points="120,160 380,160 440,320 60,320" fill="#38BDF8" opacity={0.25 * glowPulse} />

            {/* Laptop Screen Lid */}
            <rect x="110" y="130" width="280" height="190" rx="16" fill="#1E293B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="125" y="145" width="250" height="155" rx="8" fill="#0F172A" stroke="#000000" strokeWidth="4" />

            {/* Code / Slack lines on screen */}
            <rect x="140" y="165" width="80" height="10" rx="3" fill="#EF4444" />
            <rect x="140" y="185" width="140" height="8" rx="2" fill="#38BDF8" />
            <rect x="140" y="200" width="180" height="8" rx="2" fill="#94A3B8" />
            <rect x="140" y="215" width="120" height="8" rx="2" fill="#94A3B8" />
            <rect x="140" y="235" width="100" height="12" rx="4" fill="#22C55E" />

            {/* Keyboard Base */}
            <polygon points="80,330 420,330 450,370 50,370" fill="#475569" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="210" y="345" width="80" height="16" rx="4" fill="#334155" />
          </g>
        );
      }

      // =========================================================================
      // 10. DESK PLANT (Potted green succulent)
      // =========================================================================
      case 'desk_plant': {
        return (
          <g id="prop_desk_plant">
            {/* Plant Pot */}
            <polygon points="190,260 310,260 290,370 210,370" fill="#EA580C" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="180" y="245" width="140" height="25" rx="8" fill="#C2410C" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Succulent Leaves */}
            <path d="M 250 245 C 220 190 200 130 250 110 C 300 130 280 190 250 245 Z" fill="#22C55E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <path d="M 230 245 C 170 210 140 160 170 130 C 210 140 220 190 230 245 Z" fill="#16A34A" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <path d="M 270 245 C 330 210 360 160 330 130 C 290 140 280 190 270 245 Z" fill="#15803D" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Smiling Pot Face */}
            <circle cx="235" cy="310" r="6" fill="#000000" />
            <circle cx="265" cy="310" r="6" fill="#000000" />
            <path d="M 243 325 Q 250 335 257 325" fill="none" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      }

      // =========================================================================
      // 11. RED EMERGENCY BEACON SIREN
      // =========================================================================
      case 'siren_red_beacon':
      case 'emergency_sparks': {
        const sweepAngle = (frame * 12) % 360;
        return (
          <g id="prop_siren_red_beacon">
            {/* Sweeping Light Cones */}
            <g transform={`rotate(${sweepAngle}, 250, 240)`}>
              <polygon points="250,240 50,60 150,20" fill="#EF4444" opacity="0.35" />
              <polygon points="250,240 450,420 350,460" fill="#EF4444" opacity="0.35" />
            </g>

            {/* Industrial Mount Base */}
            <rect x="180" y="270" width="140" height="70" rx="16" fill="#334155" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Red Glass Dome */}
            <path d="M 195 270 C 195 180 305 180 305 270 Z" fill="#EF4444" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <ellipse cx="230" cy="220" rx="20" ry="35" fill="#FCA5A5" opacity="0.6" />
          </g>
        );
      }

      // =========================================================================
      // ORIGINAL MORNING PROPS (Kept for full backward compatibility)
      // =========================================================================
      case 'alarm_clock_retro': {
        const bellShake = Math.sin(frame * 1.5) * 15;
        return (
          <g id="prop_alarm_clock_retro">
            <circle cx="250" cy="250" r="190" stroke={accentColor} strokeWidth="8" strokeDasharray="16 12" fill="none" opacity="0.6" />
            <g transform={`rotate(${-bellShake}, 160, 140)`}>
              <path d="M 120 160 C 120 100 200 100 200 160 Z" fill="#F59E0B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            </g>
            <g transform={`rotate(${bellShake}, 340, 140)`}>
              <path d="M 300 160 C 300 100 380 100 380 160 Z" fill="#F59E0B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            </g>
            <rect x="245" y="100" width="10" height="40" fill="#475569" stroke={STROKE} strokeWidth="6" />
            <circle cx="250" cy="95" r="14" fill="#E2E8F0" stroke={STROKE} strokeWidth="6" />
            <line x1="170" y1="340" x2="130" y2="400" stroke={STROKE} strokeWidth="16" strokeLinecap="round" />
            <line x1="330" y1="340" x2="370" y2="400" stroke={STROKE} strokeWidth="16" strokeLinecap="round" />
            <circle cx="250" cy="250" r="120" fill="#EF4444" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="250" cy="250" r="95" fill="#FFFFFF" stroke={STROKE} strokeWidth="8" />
            <circle cx="215" cy="235" r="12" fill="#000000" />
            <circle cx="285" cy="235" r="12" fill="#000000" />
            <line x1="250" y1="250" x2="250" y2="180" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
            <line x1="250" y1="250" x2="295" y2="295" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
            <circle cx="250" cy="250" r="8" fill="#EF4444" />
          </g>
        );
      }

      case 'coffee_mug_spill':
      case 'steamy_coffee_mug':
      case 'coffee_mug_spilling':
      case 'coffee_mug_dripping':
      case 'coffee_mug': {
        const liquidWobble = Math.sin(frame * 0.4) * 8;
        return (
          <g id="prop_coffee_mug_spill">
            <g transform="rotate(-35, 250, 250)">
              <rect x="180" y="160" width="130" height="150" rx="20" fill="#F8FAFC" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
              <path d="M 310 190 Q 360 235 310 280" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
              <ellipse cx="245" cy="160" rx="65" ry="24" fill="#3E2723" stroke={STROKE} strokeWidth="6" />
            </g>
            <path
              d={`M 170 170 Q 110 ${190 + liquidWobble} 80 250 Q 130 250 180 210 Z`}
              fill="#5D4037"
              stroke={STROKE}
              strokeWidth="7"
            />
            <circle cx="65" cy="285" r="14" fill="#5D4037" stroke={STROKE} strokeWidth="5" />
            <circle cx="95" cy="315" r="9" fill="#5D4037" stroke={STROKE} strokeWidth="4" />
          </g>
        );
      }

      case 'phone_alarm_toggle': {
        const phoneVibe = Math.sin(frame * 1.4) * 4;
        return (
          <g id="prop_phone_alarm_toggle" transform={`translate(${phoneVibe}, 0)`}>
            <rect x="140" y="80" width="220" height="340" rx="36" fill="#0F172A" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="155" y="95" width="190" height="310" rx="24" fill="#1E293B" stroke={STROKE} strokeWidth="6" />
            <rect x="210" y="105" width="80" height="14" rx="7" fill="#0F172A" />
            <text x="250" y="175" textAnchor="middle" fill="#FFFFFF" fontSize="38" fontWeight="900" fontFamily="sans-serif">
              05:00
            </text>
            <text x="250" y="205" textAnchor="middle" fill="#94A3B8" fontSize="16" fontWeight="700" fontFamily="sans-serif">
              AM • Alarm
            </text>
            <rect x="195" y="240" width="110" height="55" rx="28" fill="#22C55E" stroke={STROKE} strokeWidth="6" />
            <circle cx="275" cy="268" r="22" fill="#FFFFFF" stroke={STROKE} strokeWidth="5" />
          </g>
        );
      }

      // =========================================================================
      // 12. ANCIENT CHANAKYA SCROLL (Ancient Parchment & Royal Seal)
      // =========================================================================
      case 'chanakya_scroll':
      case 'ancient_scroll': {
        return (
          <g id="prop_chanakya_scroll">
            {/* Scroll Parchment Body */}
            <path
              d="M 110 130 C 110 100 140 100 170 110 L 370 110 C 400 100 430 100 430 130 L 410 370 C 410 400 380 400 350 390 L 150 390 C 120 400 90 400 90 370 Z"
              fill="#FEF08A"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Curled Top Roll */}
            <ellipse cx="270" cy="115" rx="140" ry="24" fill="#FDE047" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Curled Bottom Roll */}
            <ellipse cx="250" cy="385" rx="140" ry="24" fill="#EAB308" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Ancient Text Line Markings */}
            <line x1="140" y1="180" x2="360" y2="180" stroke="#854D0E" strokeWidth="8" strokeLinecap="round" />
            <line x1="140" y1="220" x2="330" y2="220" stroke="#854D0E" strokeWidth="8" strokeLinecap="round" />
            <line x1="140" y1="260" x2="370" y2="260" stroke="#854D0E" strokeWidth="8" strokeLinecap="round" />
            <line x1="140" y1="300" x2="280" y2="300" stroke="#854D0E" strokeWidth="8" strokeLinecap="round" />
            {/* Royal Wax Seal */}
            <circle cx="340" cy="320" r="34" fill="#DC2626" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="340" cy="320" r="22" fill="#B91C1C" />
            <text x="340" y="327" textAnchor="middle" fill="#FEF08A" fontSize="20" fontWeight="900">
              ॐ
            </text>

            {/* Ornate Carved Wooden Scroll Stand (Firm Floor Grounding) */}
            <rect x="150" y="405" width="200" height="20" rx="5" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <polygon points="170,425 330,425 310,490 190,490" fill="#92400E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="160" y="485" width="180" height="15" rx="5" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Floor Contact Ground Shadow */}
            <ellipse cx="250" cy="505" rx="95" ry="14" fill="#000000" opacity="0.35" />
          </g>
        );
      }

      // =========================================================================
      // 13. VAULT B DOOR (Padmanabhaswamy Forbidden Iron Gate & Cobras)
      // =========================================================================
      case 'vault_b_door':
      case 'temple_vault_door': {
        return (
          <g id="prop_vault_b_door">
            {/* Ancient Carved Granite Portal Arch */}
            <rect x="50" y="30" width="400" height="440" rx="24" fill="#0F172A" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="70" y="50" width="360" height="400" rx="16" fill="#1E293B" stroke={STROKE} strokeWidth="6" />

            {/* Heavy Iron Door Slabs with Rivets */}
            <rect x="85" y="65" width="160" height="370" fill="#020617" stroke={STROKE} strokeWidth="8" />
            <rect x="255" y="65" width="160" height="370" fill="#020617" stroke={STROKE} strokeWidth="8" />
            {/* Steel Rivet Studs */}
            <circle cx="105" cy="85" r="8" fill="#475569" stroke={STROKE} strokeWidth="3" />
            <circle cx="105" cy="200" r="8" fill="#475569" stroke={STROKE} strokeWidth="3" />
            <circle cx="105" cy="320" r="8" fill="#475569" stroke={STROKE} strokeWidth="3" />
            <circle cx="105" cy="415" r="8" fill="#475569" stroke={STROKE} strokeWidth="3" />
            <circle cx="395" cy="85" r="8" fill="#475569" stroke={STROKE} strokeWidth="3" />
            <circle cx="395" cy="200" r="8" fill="#475569" stroke={STROKE} strokeWidth="3" />
            <circle cx="395" cy="320" r="8" fill="#475569" stroke={STROKE} strokeWidth="3" />
            <circle cx="395" cy="415" r="8" fill="#475569" stroke={STROKE} strokeWidth="3" />

            {/* Left Majestic Naga (Cobra Guardian) */}
            <path
              d="M 120 410 Q 180 330 130 250 Q 170 170 145 105"
              fill="none"
              stroke="#065F46"
              strokeWidth="32"
              strokeLinecap="round"
            />
            {/* Cobra Underbelly Scales */}
            <path
              d="M 120 410 Q 180 330 130 250 Q 170 170 145 105"
              fill="none"
              stroke="#10B981"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="16 12"
            />
            {/* Flared Cobra Hood (Left) */}
            <ellipse cx="145" cy="100" rx="36" ry="26" fill="#047857" stroke={STROKE} strokeWidth="6" />
            <circle cx="138" cy="98" r="6" fill="#FEF08A" stroke={STROKE} strokeWidth="2" />
            <circle cx="138" cy="98" r="2" fill="#000000" />
            <path d="M 145 78 L 145 68" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />

            {/* Right Majestic Naga (Cobra Guardian) */}
            <path
              d="M 380 410 Q 320 330 370 250 Q 330 170 355 105"
              fill="none"
              stroke="#065F46"
              strokeWidth="32"
              strokeLinecap="round"
            />
            {/* Cobra Underbelly Scales */}
            <path
              d="M 380 410 Q 320 330 370 250 Q 330 170 355 105"
              fill="none"
              stroke="#10B981"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="16 12"
            />
            {/* Flared Cobra Hood (Right) */}
            <ellipse cx="355" cy="100" rx="36" ry="26" fill="#047857" stroke={STROKE} strokeWidth="6" />
            <circle cx="362" cy="98" r="6" fill="#FEF08A" stroke={STROKE} strokeWidth="2" />
            <circle cx="362" cy="98" r="2" fill="#000000" />
            <path d="M 355 78 L 355 68" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />

            {/* Massive Sacred Center Lock Plate (Ancient Brass / Gold) */}
            <rect x="195" y="195" width="110" height="130" rx="18" fill="#F59E0B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="210" y="210" width="80" height="100" rx="10" fill="#D97706" stroke={STROKE} strokeWidth="4" />
            {/* Mystical Naga Rune Inscription */}
            <circle cx="250" cy="245" r="18" fill="#0F172A" stroke={STROKE} strokeWidth="4" />
            <polygon points="244,250 256,250 258,285 242,285" fill="#0F172A" />
            {/* Glowing Golden Lock Aura */}
            <circle cx="250" cy="260" r="30" fill="#FDE047" opacity="0.25" />
          </g>
        );
      }

      // =========================================================================
      // 14. GOLDEN SPARROW (Sone Ki Chidiya Icon & Grounded Royal Pedestal)
      // =========================================================================
      case 'golden_sparrow_bird':
      case 'sone_ki_chidiya': {
        const wingFlap = Math.sin(frame * 0.2) * 6;
        return (
          <g id="prop_golden_sparrow">
            {/* Carved Royal Stone Pedestal (Grounded Base) */}
            <rect x="150" y="380" width="200" height="80" rx="12" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="130" y="440" width="240" height="30" rx="8" fill="#92400E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Golden Carved Perch Pillar */}
            <rect x="225" y="310" width="50" height="80" fill="#CA8A04" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <ellipse cx="250" cy="310" rx="70" ry="18" fill="#EAB308" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Radiant Golden Bird Placed Proudly on Perch */}
            {/* Tail Feathers */}
            <path d="M 160 250 L 70 290 L 100 250 L 60 230 L 150 220 Z" fill="#EAB308" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Bird Body */}
            <ellipse cx="250" cy="230" rx="90" ry="70" fill="#FACC15" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Bird Head */}
            <circle cx="325" cy="160" r="50" fill="#FACC15" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Royal Crown */}
            <polygon points="305,115 315,90 325,110 340,85 350,110 360,90 370,115" fill="#EF4444" stroke={STROKE} strokeWidth="6" />
            <circle cx="337" cy="95" r="5" fill="#10B981" />
            {/* Gemstone Eye */}
            <circle cx="340" cy="150" r="11" fill="#0F172A" />
            <circle cx="343" cy="147" r="4" fill="#FFFFFF" />
            {/* Golden Beak */}
            <polygon points="375,155 425,170 375,185" fill="#F97316" stroke={STROKE} strokeWidth="6" />
            {/* Majestic Wing */}
            <path
              d={`M 220 200 C 180 ${120 + wingFlap} 290 ${80 + wingFlap} 310 180 C 270 220 230 220 220 200 Z`}
              fill="#FDE047"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
          </g>
        );
      }

      // =========================================================================
      // 15. SALARY SLIP DRAIN (Middle-Class Financial Black Hole)
      // =========================================================================
      case 'salary_slip_drain':
      case 'bank_balance_zero': {
        const spinAngle = (frame * 3) % 360;
        return (
          <g id="prop_salary_slip_drain">
            {/* Swirling Red Drain Whirlpool */}
            <g transform={`rotate(${spinAngle} 250 270)`}>
              <ellipse cx="250" cy="270" rx="170" ry="70" fill="#1E293B" stroke="#EF4444" strokeWidth="8" strokeDasharray="16 12" />
              <ellipse cx="250" cy="270" rx="110" ry="45" fill="#0F172A" stroke="#DC2626" strokeWidth="8" />
              <ellipse cx="250" cy="270" rx="50" ry="20" fill="#000000" />
            </g>
            {/* Falling Rupee Notes Swirling In */}
            <rect x="120" y="160" width="90" height="50" rx="8" fill="#86EFAC" stroke={STROKE} strokeWidth="5" transform="rotate(-25 165 185)" />
            <text x="165" y="192" textAnchor="middle" fill="#065F46" fontSize="20" fontWeight="900" transform="rotate(-25 165 185)">
              ₹500
            </text>
            <rect x="300" y="170" width="90" height="50" rx="8" fill="#86EFAC" stroke={STROKE} strokeWidth="5" transform="rotate(30 345 195)" />
            <text x="345" y="202" textAnchor="middle" fill="#065F46" fontSize="20" fontWeight="900" transform="rotate(30 345 195)">
              ₹2000
            </text>
            {/* The Main Salary Statement Card sinking */}
            <rect x="90" y="60" width="320" height="150" rx="20" fill="#FFFFFF" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="90" y="60" width="320" height="38" rx="18" fill="#0F172A" />
            <text x="250" y="85" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900">
              SALARY STATEMENT • 1ST OF MONTH
            </text>
            <text x="120" y="130" fill="#64748B" fontSize="18" fontWeight="700">
              CREDITED: ₹1,00,000
            </text>
            <text x="120" y="175" fill="#EF4444" fontSize="28" fontWeight="900">
              5TH: ₹0.00 (DRAINED)
            </text>
            <line x1="110" y1="125" x2="350" y2="125" stroke="#EF4444" strokeWidth="6" />
          </g>
        );
      }

      // =========================================================================
      // 16. EMI CHAINS & CREDIT CARD BEAR TRAP
      // =========================================================================
      case 'emi_chains_lock':
      case 'credit_card_trap': {
        return (
          <g id="prop_emi_chains">
            {/* Gold Credit Card Container */}
            <rect x="80" y="110" width="340" height="210" rx="24" fill="#FACC15" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Magnetic Stripe / Chip */}
            <rect x="80" y="150" width="340" height="40" fill="#0F172A" />
            <rect x="120" y="210" width="55" height="42" rx="8" fill="#E2E8F0" stroke={STROKE} strokeWidth="4" />
            <text x="200" y="240" fill="#0F172A" fontSize="22" fontWeight="900" fontFamily="monospace">
              **** 0000 0% EMI
            </text>
            {/* Bear Trap Teeth Along Edges */}
            <polygon points="80,110 105,70 130,110 155,70 180,110 205,70 230,110 255,70 280,110 305,70 330,110 355,70 380,110 405,70 420,110" fill="#64748B" stroke={STROKE} strokeWidth="5" />
            {/* Heavy Iron Chains Criss-Cross */}
            <line x1="70" y1="100" x2="430" y2="330" stroke="#334155" strokeWidth="22" strokeLinecap="round" />
            <line x1="70" y1="100" x2="430" y2="330" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeDasharray="18 10" />
            <line x1="70" y1="330" x2="430" y2="100" stroke="#334155" strokeWidth="22" strokeLinecap="round" />
            <line x1="70" y1="330" x2="430" y2="100" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeDasharray="18 10" />
            {/* Giant Padlock In Center */}
            <rect x="190" y="250" width="120" height="110" rx="20" fill="#EF4444" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <path d="M 215 250 L 215 200 Q 250 160 285 200 L 285 250" fill="none" stroke="#64748B" strokeWidth="20" />
            <circle cx="250" cy="295" r="14" fill="#0F172A" />
            <polygon points="246,295 254,295 256,325 244,325" fill="#0F172A" />
            <text x="250" y="348" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="900">
              TRAP LOCKED
            </text>
          </g>
        );
      }

      // =========================================================================
      // 17. OVERFLOWING GOLD COINS CHEST
      // =========================================================================
      case 'gold_coins_overflow_chest':
      case 'gold_coins_chest': {
        return (
          <g id="prop_gold_chest">
            {/* Chest Lower Box */}
            <rect x="90" y="210" width="320" height="190" rx="16" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Chest Iron Bands */}
            <rect x="140" y="210" width="30" height="190" fill="#1E293B" stroke={STROKE} strokeWidth="5" />
            <rect x="330" y="210" width="30" height="190" fill="#1E293B" stroke={STROKE} strokeWidth="5" />
            {/* Open Lid Angled Up */}
            <path d="M 70 210 Q 250 110 430 210 L 410 160 Q 250 70 90 160 Z" fill="#92400E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Sparkling Mountain of Gold Coins */}
            <ellipse cx="250" cy="210" rx="150" ry="50" fill="#FACC15" stroke={STROKE} strokeWidth="6" />
            <circle cx="160" cy="190" r="18" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
            <circle cx="210" cy="180" r="20" fill="#FEF08A" stroke={STROKE} strokeWidth="4" />
            <circle cx="260" cy="175" r="22" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
            <circle cx="310" cy="185" r="19" fill="#FACC15" stroke={STROKE} strokeWidth="4" />
            <circle cx="350" cy="200" r="16" fill="#FEF08A" stroke={STROKE} strokeWidth="4" />
            {/* Sparkling Rubies */}
            <polygon points="230,195 240,180 250,195 240,210" fill="#EF4444" stroke={STROKE} strokeWidth="3" />
            <polygon points="290,205 298,190 306,205 298,220" fill="#10B981" stroke={STROKE} strokeWidth="3" />
            {/* Lock Plate */}
            <rect x="225" y="220" width="50" height="60" rx="10" fill="#F59E0B" stroke={STROKE} strokeWidth="6" />
            <circle cx="250" cy="245" r="8" fill="#0F172A" />
          </g>
        );
      }

      // =========================================================================
      // 18. SPICES TRADE SHIP (Ancient Indian Ocean Trade Merchant Dhow)
      // =========================================================================
      case 'spices_trade_ship': {
        const waveSway = Math.sin(frame * 0.15) * 5;
        return (
          <g id="prop_spices_ship" transform={`translate(0, ${waveSway})`}>
            {/* Ship Wooden Hull */}
            <path
              d="M 60 270 Q 120 370 260 370 Q 400 370 440 270 L 410 240 L 90 240 Z"
              fill="#92400E"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Main Wooden Mast */}
            <line x1="250" y1="240" x2="250" y2="80" stroke="#78350F" strokeWidth="16" strokeLinecap="round" />
            {/* Triangular Canvas Sail */}
            <path d="M 250 90 L 390 200 L 250 220 Z" fill="#FEF08A" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Spice Sacks on Deck */}
            <circle cx="150" cy="225" r="28" fill="#D97706" stroke={STROKE} strokeWidth="6" />
            <text x="150" y="232" textAnchor="middle" fill="#000000" fontSize="12" fontWeight="900">
              PEPPER
            </text>
            <circle cx="200" cy="225" r="28" fill="#FACC15" stroke={STROKE} strokeWidth="6" />
            <text x="200" y="232" textAnchor="middle" fill="#000000" fontSize="12" fontWeight="900">
              GOLD
            </text>
            {/* Ocean Waves Beneath */}
            <path
              d="M 20 370 Q 70 340 120 370 Q 170 400 220 370 Q 270 340 320 370 Q 370 400 420 370 Q 470 340 500 370"
              fill="none"
              stroke="#0284C7"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </g>
        );
      }

      // =========================================================================
      // 19. WEIGHING SCALE GOLD (Trade Equilibrium)
      // =========================================================================
      case 'weighing_scale_gold': {
        return (
          <g id="prop_weighing_scale">
            {/* Central Pillar & Base */}
            <rect x="235" y="100" width="30" height="260" rx="8" fill="#F59E0B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <polygon points="160,400 340,400 280,360 220,360" fill="#B45309" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Crossbeam tilting towards gold (Right side low) */}
            <line x1="80" y1="110" x2="420" y2="170" stroke="#D97706" strokeWidth="16" strokeLinecap="round" />
            {/* Left Pan (Empty / Light Paper) */}
            <line x1="80" y1="110" x2="40" y2="200" stroke="#000000" strokeWidth="5" />
            <line x1="80" y1="110" x2="120" y2="200" stroke="#000000" strokeWidth="5" />
            <path d="M 30 200 Q 80 240 130 200 Z" fill="#FBBF24" stroke={STROKE} strokeWidth="6" />
            <text x="80" y="220" textAnchor="middle" fill="#000000" fontSize="14" fontWeight="900">
              PAPER
            </text>
            {/* Right Pan (Heavy Solid Gold) */}
            <line x1="420" y1="170" x2="380" y2="260" stroke="#000000" strokeWidth="5" />
            <line x1="420" y1="170" x2="460" y2="260" stroke="#000000" strokeWidth="5" />
            <path d="M 370 260 Q 420 300 470 260 Z" fill="#FBBF24" stroke={STROKE} strokeWidth="6" />
            <circle cx="410" cy="250" r="14" fill="#FEF08A" stroke={STROKE} strokeWidth="3" />
            <circle cx="430" cy="250" r="14" fill="#FEF08A" stroke={STROKE} strokeWidth="3" />
            <circle cx="420" cy="235" r="14" fill="#FDE047" stroke={STROKE} strokeWidth="3" />
          </g>
        );
      }

      // =========================================================================
      // 20. POISON GOBLET (Chanakya's Vishakanya Strategy)
      // =========================================================================
      case 'poison_kanya_goblet': {
        const fumeOffset = Math.sin(frame * 0.2) * 10;
        return (
          <g id="prop_poison_goblet">
            {/* Rising Purple Poison Vapor */}
            <path
              d={`M 230 140 Q ${210 + fumeOffset} 90 240 50 Q ${260 - fumeOffset} 20 230 0`}
              fill="none"
              stroke="#A855F7"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d={`M 270 140 Q ${290 - fumeOffset} 80 260 40 Q ${280 + fumeOffset} 10 260 0`}
              fill="none"
              stroke="#C084FC"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Golden Goblet Cup */}
            <path d="M 160 140 Q 250 250 340 140 Z" fill="#FACC15" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Sinister Skull Emblem on Goblet */}
            <circle cx="250" cy="180" r="16" fill="#0F172A" />
            <circle cx="244" cy="177" r="4" fill="#EF4444" />
            <circle cx="256" cy="177" r="4" fill="#EF4444" />
            {/* Goblet Stem & Ornate Base */}
            <rect x="235" y="210" width="30" height="90" fill="#EAB308" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <ellipse cx="250" cy="310" rx="70" ry="24" fill="#CA8A04" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Ornate Carved Wooden Pedestal Table (Firm Floor Grounding) */}
            <rect x="160" y="330" width="180" height="20" rx="5" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <polygon points="180,350 320,350 300,490 200,490" fill="#92400E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="170" y="485" width="160" height="15" rx="5" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Floor Contact Ground Shadow */}
            <ellipse cx="250" cy="505" rx="90" ry="14" fill="#000000" opacity="0.35" />
          </g>
        );
      }

      // =========================================================================
      // 21. SWORD & SHIELD EMBLEM (Warrior Kings & Maurya Strategy)
      // =========================================================================
      case 'sword_shield_emblem': {
        return (
          <g id="prop_sword_shield">
            {/* Crossed Sword 1 */}
            <line x1="80" y1="80" x2="420" y2="420" stroke="#E2E8F0" strokeWidth="18" strokeLinecap="round" />
            <line x1="80" y1="80" x2="420" y2="420" stroke="#000000" strokeWidth="6" strokeDasharray="20 10" />
            <line x1="60" y1="120" x2="120" y2="60" stroke="#F59E0B" strokeWidth="22" strokeLinecap="round" />
            {/* Crossed Sword 2 */}
            <line x1="420" y1="80" x2="80" y2="420" stroke="#E2E8F0" strokeWidth="18" strokeLinecap="round" />
            <line x1="420" y1="80" x2="80" y2="420" stroke="#000000" strokeWidth="6" strokeDasharray="20 10" />
            <line x1="440" y1="120" x2="380" y2="60" stroke="#F59E0B" strokeWidth="22" strokeLinecap="round" />
            {/* Central Round Warrior Shield */}
            <circle cx="250" cy="250" r="120" fill="#92400E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="250" cy="250" r="95" fill="#B45309" stroke={STROKE} strokeWidth="8" />
            <circle cx="250" cy="250" r="50" fill="#F59E0B" stroke={STROKE} strokeWidth="8" />
            <circle cx="250" cy="250" r="20" fill="#0F172A" />
            {/* 4 Shield Boss Studs */}
            <circle cx="250" cy="180" r="10" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
            <circle cx="250" cy="320" r="10" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
            <circle cx="180" cy="250" r="10" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
            <circle cx="320" cy="250" r="10" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
          </g>
        );
      }

      // =========================================================================
      // 22. MYSTIC DIYA FLAME (Sacred Ancient Lamp)
      // =========================================================================
      case 'mystic_diya_flame': {
        const flicker = Math.sin(frame * 0.4) * 6;
        return (
          <g id="prop_mystic_diya">
            {/* Warm Golden Glow Halo */}
            <circle cx="250" cy="150" r="110" fill="#FEF08A" opacity="0.35" />
            <circle cx="250" cy="150" r="70" fill="#FDE047" opacity="0.45" />
            {/* Flickering Teardrop Flame */}
            <path
              d={`M 250 ${70 + flicker} Q ${280 + flicker} 130 250 170 Q ${220 - flicker} 130 250 ${70 + flicker} Z`}
              fill="#F97316"
              stroke={STROKE}
              strokeWidth="6"
            />
            <path
              d={`M 250 ${95 + flicker} Q ${265 + flicker} 135 250 160 Q ${235 - flicker} 135 250 ${95 + flicker} Z`}
              fill="#FEF08A"
            />
            {/* Brass Diya Bowl */}
            <path d="M 140 220 Q 250 280 360 220 Q 250 190 140 220 Z" fill="#D97706" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <ellipse cx="250" cy="210" rx="100" ry="20" fill="#B45309" stroke={STROKE} strokeWidth="5" />
            {/* Diya Pedestal Stand */}
            <rect x="235" y="240" width="30" height="90" fill="#B45309" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <ellipse cx="250" cy="335" rx="80" ry="25" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );
      }

      // =========================================================================
      // 23. TWO-FACED MASK (Betrayal, Fake Friends & Duality)
      // =========================================================================
      case 'two_faced_mask': {
        const floatSway = Math.sin(frame * 0.12) * 6;
        return (
          <g id="prop_two_faced_mask" transform={`translate(0, ${floatSway})`}>
            {/* Dark Aura of Deception */}
            <ellipse cx="250" cy="240" rx="150" ry="170" fill="#4C1D95" opacity="0.2" />

            {/* Left Half: Golden Gentle Mask Face */}
            <path
              d="M 250 80 Q 140 80 130 200 Q 120 320 250 400 Z"
              fill="#FDE047"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Friendly Gentle Eye & Smile */}
            <circle cx="190" cy="210" r="14" fill="#0F172A" />
            <path d="M 170 185 Q 190 170 210 185" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
            <path d="M 180 280 Q 215 310 250 290" fill="none" stroke="#000000" strokeWidth="8" strokeLinecap="round" />

            {/* Right Half: Sinister Shadow Face */}
            <path
              d="M 250 80 Q 360 80 370 200 Q 380 320 250 400 Z"
              fill="#1E1B4B"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Wicked Crimson Slit Eye & Scheming Grin */}
            <polygon points="290,205 330,195 305,215" fill="#EF4444" stroke="#7F1D1D" strokeWidth="3" />
            <path d="M 290 175 Q 315 160 335 180" fill="none" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
            <path d="M 250 290 Q 285 320 320 275" fill="none" stroke="#EF4444" strokeWidth="8" strokeLinecap="round" />

            {/* Center Division Seam */}
            <line x1="250" y1="80" x2="250" y2="400" stroke={STROKE} strokeWidth="8" strokeLinecap="round" />

            {/* Red Silk Ribbon Ties */}
            <path d="M 130 220 Q 80 250 60 340" fill="none" stroke="#DC2626" strokeWidth="12" strokeLinecap="round" />
            <path d="M 370 220 Q 420 250 440 340" fill="none" stroke="#DC2626" strokeWidth="12" strokeLinecap="round" />

            {/* Antique Carved Wooden Display Stand (Firm Floor Grounding) */}
            <rect x="242" y="380" width="16" height="110" rx="4" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <ellipse cx="250" cy="490" rx="90" ry="20" fill="#451A03" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <ellipse cx="250" cy="485" rx="60" ry="12" fill="#78350F" />
            {/* Floor Contact Ground Shadow */}
            <ellipse cx="250" cy="505" rx="95" ry="14" fill="#000000" opacity="0.35" />
          </g>
        );
      }

      // =========================================================================
      // 24. GOLDEN LOCK PADLOCK (Ancient Temple Lock / Sealed Secrets)
      // =========================================================================
      case 'golden_lock_padlock':
      case 'forbidden_temple_lock': {
        return (
          <g id="prop_golden_lock">
            {/* Heavy Curved Golden Steel Shackle */}
            <path
              d="M 170 210 L 170 140 Q 170 70 250 70 Q 330 70 330 140 L 330 210"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="38"
              strokeLinecap="round"
            />
            <path
              d="M 170 210 L 170 140 Q 170 70 250 70 Q 330 70 330 140 L 330 210"
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />

            {/* Heavy Ornate Brass Body */}
            <rect
              x="130"
              y="190"
              width="240"
              height="220"
              rx="36"
              fill="#D97706"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Front Raised Faceplate */}
            <rect
              x="150"
              y="210"
              width="200"
              height="180"
              rx="24"
              fill="#FBBF24"
              stroke={STROKE}
              strokeWidth="6"
            />

            {/* Corner Decorative Brass Studs */}
            <circle cx="165" cy="225" r="10" fill="#78350F" />
            <circle cx="335" cy="225" r="10" fill="#78350F" />
            <circle cx="165" cy="375" r="10" fill="#78350F" />
            <circle cx="335" cy="375" r="10" fill="#78350F" />

            {/* Sacred Engraved Chakra Ring */}
            <circle cx="250" cy="300" r="45" fill="#B45309" stroke={STROKE} strokeWidth="6" />
            {/* Deep Dark Keyhole */}
            <circle cx="250" cy="290" r="16" fill="#0F172A" />
            <polygon points="244,290 256,290 260,325 240,325" fill="#0F172A" />

            {/* Carved Royal Mauryan Pedestal Stand (Grounded on Stone Floor) */}
            <rect x="150" y="410" width="200" height="24" rx="6" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <polygon points="170,434 330,434 310,490 190,490" fill="#92400E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="160" y="485" width="180" height="15" rx="5" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Floor Contact Ground Shadow */}
            <ellipse cx="250" cy="505" rx="100" ry="14" fill="#000000" opacity="0.35" />
          </g>
        );
      }

      // =========================================================================
      // 25. CLAY KULHAD TEA (Steaming Traditional Chai Cup)
      // =========================================================================
      case 'clay_kulhad_tea': {
        const steamWobble = Math.sin(frame * 0.25) * 8;
        return (
          <g id="prop_clay_kulhad">
            {/* Rising Hot Chai Steam Wisps */}
            <path
              d={`M 220 180 Q ${200 + steamWobble} 120 230 70 Q ${210 - steamWobble} 30 220 0`}
              fill="none"
              stroke="#FEF3C7"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d={`M 280 180 Q ${290 - steamWobble} 110 265 60 Q ${280 + steamWobble} 20 270 0`}
              fill="none"
              stroke="#FEF3C7"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Rustic Terracotta Kulhad Body */}
            <polygon
              points="160,200 340,200 310,380 190,380"
              fill="#C2410C"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Terracotta Ridges */}
            <line x1="175" y1="260" x2="325" y2="260" stroke="#7C2D12" strokeWidth="8" />
            <line x1="185" y1="320" x2="315" y2="320" stroke="#7C2D12" strokeWidth="8" />

            {/* Steaming Chai Surface with Foam */}
            <ellipse cx="250" cy="200" rx="90" ry="24" fill="#D97706" stroke={STROKE} strokeWidth="6" />
            <ellipse cx="250" cy="200" rx="65" ry="15" fill="#FDE68A" />

            {/* Base Saucer Plate */}
            <ellipse cx="250" cy="390" rx="110" ry="18" fill="#7C2D12" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Sturdy Maurya Carved Wooden Pedestal Table (Grounded on Floor) */}
            <rect x="150" y="400" width="200" height="24" rx="6" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <polygon points="170,424 330,424 310,490 190,490" fill="#92400E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="160" y="485" width="180" height="15" rx="5" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );
      }

      // =========================================================================
      // 26. VIRAL COMMENT & DISCUSSION BUBBLES
      // =========================================================================
      case 'viral_comment_bubbles': {
        const floatY = Math.sin(frame * 0.15) * 5;
        return (
          <g id="prop_viral_bubbles" transform={`translate(0, ${floatY})`}>
            {/* Top Comic Bubble */}
            <rect
              x="60"
              y="120"
              width="360"
              height="110"
              rx="28"
              fill="#FFFFFF"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Speech Pointer Tail */}
            <polygon points="120,230 150,230 110,270" fill="#FFFFFF" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <polygon points="122,228 148,228 112,266" fill="#FFFFFF" />
            {/* Heart & Fire Badges */}
            <circle cx="110" cy="175" r="24" fill="#EF4444" stroke={STROKE} strokeWidth="4" />
            <text x="110" y="183" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900">
              ❤️
            </text>
            <text x="150" y="183" fill="#0F172A" fontSize="24" fontWeight="900" fontFamily="sans-serif">
              {customText || 'KABHI MAT BATAO!'}
            </text>

            {/* Lower Reply Bubble */}
            <rect
              x="120"
              y="260"
              width="340"
              height="100"
              rx="24"
              fill="#06B6D4"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            <circle cx="170" cy="310" r="20" fill="#FFFFFF" stroke={STROKE} strokeWidth="4" />
            <text x="170" y="318" textAnchor="middle" fill="#0F172A" fontSize="18" fontWeight="900">
              🔥
            </text>
            <text x="205" y="318" fill="#FFFFFF" fontSize="22" fontWeight="900" fontFamily="sans-serif">
              {customSubtext || '100% Sach!'}
            </text>
          </g>
        );
      }

      // =========================================================================
      // 26b. ANCIENT SHAKUNI DICE (PASHAS ON CARVED PEDESTAL)
      // =========================================================================
      case 'dice_in_hand':
      case 'ancient_dice':
      case 'dice': {
        return (
          <g id="prop_ancient_dice_pedestal">
            {/* Floor Contact Ground Shadow */}
            <ellipse cx="250" cy="505" rx="90" ry="14" fill="#000000" opacity="0.35" />

            {/* Carved Stone Plinth */}
            <rect x="180" y="440" width="140" height="60" rx="8" fill="#475569" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="160" y="420" width="180" height="25" rx="6" fill="#64748B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Pair of Carved Ivory & Gold Dice (Chaupar / Pashas) */}
            {/* Left Die (Tilted) */}
            <rect x="150" y="270" width="110" height="110" rx="18" fill="#FEF3C7" stroke={STROKE} strokeWidth={STROKE_WIDTH} transform="rotate(-15 205 325)" />
            {/* Left Die Dots (Golden Red) */}
            <circle cx="185" cy="305" r="9" fill="#DC2626" />
            <circle cx="225" cy="345" r="9" fill="#DC2626" />
            <circle cx="205" cy="325" r="11" fill="#D97706" />

            {/* Right Die (Resting on top) */}
            <rect x="240" y="220" width="120" height="120" rx="20" fill="#FFFBEB" stroke={STROKE} strokeWidth={STROKE_WIDTH} transform="rotate(12 300 280)" />
            {/* Right Die Dots */}
            <circle cx="275" cy="255" r="10" fill="#DC2626" />
            <circle cx="325" cy="255" r="10" fill="#DC2626" />
            <circle cx="300" cy="280" r="12" fill="#D97706" />
            <circle cx="275" cy="305" r="10" fill="#DC2626" />
            <circle cx="325" cy="305" r="10" fill="#DC2626" />
          </g>
        );
      }

      // =========================================================================
      // 26c. ANCIENT BRASS LENS / TELESCOPE ON PLINTH
      // =========================================================================
      case 'magnifying_glass':
      case 'ancient_lens': {
        return (
          <g id="prop_ancient_brass_lens">
            {/* Floor Contact Ground Shadow */}
            <ellipse cx="250" cy="505" rx="85" ry="14" fill="#000000" opacity="0.35" />

            {/* Carved Wooden Pedestal */}
            <rect x="220" y="380" width="60" height="120" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="170" y="470" width="160" height="30" rx="6" fill="#92400E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Brass Ring & Glass Crystal */}
            <circle cx="250" cy="230" r="110" fill="#38BDF8" opacity="0.4" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="250" cy="230" r="110" fill="none" stroke="#F59E0B" strokeWidth="18" />
            <circle cx="250" cy="230" r="95" fill="none" stroke="#D97706" strokeWidth="6" />

            {/* Specular Glint */}
            <path d="M 180 180 Q 210 160 250 160" fill="none" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
          </g>
        );
      }

      // =========================================================================
      // 26d. CHAUPAR BOARD MACRO (ANCIENT ROYAL GAMING MAT WITH PAWNS)
      // =========================================================================
      case 'chaupar_board_macro':
      case 'chaupar_board': {
        return (
          <g id="prop_chaupar_board_macro">
            {/* Ground Contact Shadow */}
            <ellipse cx="250" cy="505" rx="140" ry="20" fill="#000000" opacity="0.35" />

            {/* Carved Stone Low Gaming Table */}
            <rect x="100" y="440" width="300" height="60" rx="12" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="80" y="420" width="340" height="25" rx="8" fill="#92400E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Crimson Silk Chaupar Cross Mat */}
            <rect x="110" y="240" width="280" height="180" rx="16" fill="#991B1B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <line x1="250" y1="240" x2="250" y2="420" stroke="#FACC15" strokeWidth="8" />
            <line x1="110" y1="330" x2="390" y2="330" stroke="#FACC15" strokeWidth="8" />

            {/* Ancient Ivory & Ebony Pawns (Gotis) */}
            <polygon points="170,300 190,300 180,260" fill="#FEF08A" stroke={STROKE} strokeWidth="6" />
            <circle cx="180" cy="255" r="9" fill="#FACC15" stroke={STROKE} strokeWidth="4" />
            <polygon points="310,360 330,360 320,320" fill="#1E1B4B" stroke={STROKE} strokeWidth="6" />
            <circle cx="320" cy="315" r="9" fill="#0F172A" stroke={STROKE} strokeWidth="4" />

            {/* Pair of Tilted Dice */}
            <rect x="220" y="300" width="50" height="50" rx="8" fill="#FFFBEB" stroke={STROKE} strokeWidth="6" transform="rotate(15 245 325)" />
            <circle cx="235" cy="315" r="4" fill="#DC2626" />
            <circle cx="255" cy="335" r="4" fill="#DC2626" />
          </g>
        );
      }

      // =========================================================================
      // 26e. PUPPET CONTROL CROSS (GLOWING RED/GOLD STRINGS)
      // =========================================================================
      case 'puppet_control_cross':
      case 'puppet_strings': {
        return (
          <g id="prop_puppet_control_cross">
            {/* Ground Contact Shadow */}
            <ellipse cx="250" cy="505" rx="80" ry="14" fill="#000000" opacity="0.35" />

            {/* Carved Pedestal Plinth */}
            <rect x="220" y="440" width="60" height="60" fill="#475569" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="190" y="420" width="120" height="20" rx="6" fill="#64748B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Wooden Puppeteer Cross suspended */}
            <rect x="140" y="160" width="220" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="238" y="90" width="24" height="160" rx="8" fill="#92400E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Glowing Strings Dropping Down */}
            <line x1="160" y1="184" x2="140" y2="380" stroke="#EF4444" strokeWidth="6" strokeDasharray="12 6" />
            <line x1="210" y1="184" x2="210" y2="360" stroke="#F59E0B" strokeWidth="6" strokeDasharray="12 6" />
            <line x1="290" y1="184" x2="290" y2="360" stroke="#F59E0B" strokeWidth="6" strokeDasharray="12 6" />
            <line x1="340" y1="184" x2="360" y2="380" stroke="#EF4444" strokeWidth="6" strokeDasharray="12 6" />

            {/* Mini Golden Puppet Crowns attached to strings */}
            <polygon points="125,410 155,410 155,395 147,402 140,392 133,402 125,395" fill="#FACC15" stroke={STROKE} strokeWidth="5" />
            <polygon points="345,410 375,410 375,395 367,402 360,392 353,402 345,395" fill="#FACC15" stroke={STROKE} strokeWidth="5" />
          </g>
        );
      }

      // =========================================================================
      // 27. DYNAMIC OPEN-SOURCE VECTOR RENDERER & UNIVERSAL ASHOKA SEAL
      // =========================================================================
      case 'ashoka_pillar_emblem':
      default: {
        const rawTypeStr = String(type || '').toLowerCase().trim();
        const allowedSlugChars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
        let slug = '';
        for (let sc = 0; sc < rawTypeStr.length; sc++) {
          const char = rawTypeStr[sc];
          slug += allowedSlugChars.includes(char) ? char : '_';
        }
        const onlineEntry = (vectorsManifest as any)[slug] || (vectorsManifest as any)[type];

        if (onlineEntry && onlineEntry.innerHtml) {
          return (
            <g id={`online_vector_${slug}`}>
              {/* Golden Outer Aura Glow */}
              <circle cx="250" cy="240" r="140" fill="#F59E0B" opacity="0.18" />

              {/* Floor Contact Ground Shadow */}
              <ellipse cx="250" cy="505" rx="95" ry="14" fill="#000000" opacity="0.35" />

              {/* Carved Stone Plinth Base */}
              <rect x="180" y="440" width="140" height="60" rx="8" fill="#475569" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
              <rect x="160" y="420" width="180" height="25" rx="6" fill="#64748B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

              {/* Dynamic Open-Source Vector Graphic (Auto-Scaled & Centered at X=250, Y=220 on Stone Plinth) */}
              <svg
                x="120"
                y="100"
                width="260"
                height="260"
                viewBox={onlineEntry.viewBox || '0 0 512 512'}
                style={{ overflow: 'visible' }}
                dangerouslySetInnerHTML={{ __html: onlineEntry.innerHtml }}
              />
            </g>
          );
        }

        return (
          <g id="prop_ashoka_pillar_capital">
            {/* Outer Golden Aura Glow */}
            <circle cx="250" cy="230" r="170" fill="#F59E0B" opacity="0.25" />

            {/* Carved Stone Pillar Base & Abacus */}
            <rect x="180" y="340" width="140" height="150" fill="#B45309" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <line x1="215" y1="340" x2="215" y2="490" stroke="#78350F" strokeWidth="6" />
            <line x1="250" y1="340" x2="250" y2="490" stroke="#78350F" strokeWidth="6" />
            <line x1="285" y1="340" x2="285" y2="490" stroke="#78350F" strokeWidth="6" />
            <rect x="160" y="320" width="180" height="30" rx="8" fill="#D97706" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Floor Contact Ground Shadow */}
            <ellipse cx="250" cy="505" rx="100" ry="14" fill="#000000" opacity="0.35" />

            {/* Central Sacred Ashoka Chakra on Abacus */}
            <circle cx="250" cy="230" r="100" fill="#FDE047" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="250" cy="230" r="85" fill="#FEF08A" stroke={STROKE} strokeWidth="5" />
            <circle cx="250" cy="230" r="28" fill="#B45309" stroke={STROKE} strokeWidth="6" />

            {/* 16 Stylized Spokes */}
            {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg) => (
              <line
                key={deg}
                x1="250"
                y1="230"
                x2={250 + 82 * Math.cos((deg * Math.PI) / 180)}
                y2={230 + 82 * Math.sin((deg * Math.PI) / 180)}
                stroke="#78350F"
                strokeWidth="6"
                strokeLinecap="round"
              />
            ))}

            {/* Four Stylized Golden Lions on Capital Crown */}
            <path
              d="M 170 140 Q 180 80 210 70 Q 250 85 250 140 Q 250 85 290 70 Q 320 80 330 140 Z"
              fill="#F59E0B"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Lion Mane Curls */}
            <circle cx="210" cy="100" r="14" fill="#D97706" stroke={STROKE} strokeWidth="4" />
            <circle cx="290" cy="100" r="14" fill="#D97706" stroke={STROKE} strokeWidth="4" />
            <circle cx="250" cy="90" r="16" fill="#D97706" stroke={STROKE} strokeWidth="4" />
          </g>
        );
      }
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: x + shakeX,
        top: y + shakeY,
        transform: `translate(-50%, -50%) scale(${scale * pulseScale}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        opacity,
        pointerEvents: 'none',
      }}
    >
      <svg
        width="500"
        height="500"
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {renderPropContent()}
      </svg>
    </div>
  );
};
