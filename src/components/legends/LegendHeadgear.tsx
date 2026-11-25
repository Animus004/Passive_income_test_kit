import React from 'react';
import { LegendProfile } from './types';

interface HeadgearProps {
  profile: LegendProfile;
  frame: number;
  fps: number;
}

/**
 * High-Craft Sculpted Headgear, Crowns (Mukut), Pagadis & Back Hair (All 16 Legends).
 * Built around Skull Center X=350, Crown/Brow Plane Y=165..215 on a 700x920 canvas.
 */
export const LegendHeadgearBack: React.FC<HeadgearProps> = ({ profile, frame, fps }) => {
  const { id, palette } = profile;
  const ink = palette.outlineInk;
  const wave = Math.sin((frame / fps) * 2.2) * 5;

  switch (id) {
    case 'krishna':
    case 'rama':
    case 'arjuna':
    case 'karna':
    case 'duryodhana':
    case 'ravana':
    case 'ashoka':
      return (
        <g id={`hair_back_${id}`}>
          {/* Long flowing regal Kshatriya/divine dark locks cascading behind neck & shoulders */}
          <path
            d={`M 278 220 C 258 270 250 325 ${252 + wave * 0.4} 375 C 266 365 282 355 292 340 L 408 340 C 418 355 434 365 ${448 + wave * 0.4} 375 C 450 325 442 270 422 220 Z`}
            fill={palette.hairBase}
            stroke={ink}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Hair lock highlights */}
          <path
            d="M 272 280 Q 262 325 268 355"
            fill="none"
            stroke={palette.hairHighlight}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M 428 280 Q 438 325 432 355"
            fill="none"
            stroke={palette.hairHighlight}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Imperial Nine-Head Halo Silhouettes for Dashanan Ravana */}
          {id === 'ravana' && (
            <g opacity="0.5">
              {[-120, -82, -46, 46, 82, 120].map((dx, i) => (
                <g key={i} transform={`translate(${350 + dx}, ${166 + Math.abs(dx) * 0.14}) scale(0.45)`}>
                  <path d="M -28 24 C -28 -6 -16 -24 0 -24 C 16 -24 28 -6 28 24 L 18 52 L -18 52 Z" fill="#451A03" stroke="#000000" strokeWidth="3" />
                  <polygon points="-24,0 -16,-36 0,-48 16,-36 24,0" fill="#D97706" stroke="#000000" strokeWidth="3" />
                </g>
              ))}
            </g>
          )}
        </g>
      );

    case 'shiva':
      return (
        <g id="hair_back_shiva">
          {/* Wild Flowing Yogi Jata Locks billowing behind shoulders */}
          <path
            d={`M 275 215 C 235 265 222 335 ${235 + wave} 405 C 255 385 275 375 295 350 L 405 350 C 425 375 445 385 ${465 + wave} 405 C 478 335 465 265 425 215 Z`}
            fill={palette.hairBase}
            stroke={ink}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </g>
      );

    case 'bhishma':
      return (
        <g id="hair_back_bhishma">
          {/* Dignified long silver mane */}
          <path
            d="M 275 215 C 258 275 258 335 275 380 L 425 380 C 442 335 442 275 425 215 Z"
            fill={palette.hairBase}
            stroke={ink}
            strokeWidth="3.5"
          />
        </g>
      );

    case 'lakshmibai':
      return (
        <g id="hair_back_lakshmibai">
          {/* Long warrior queen braided dark tresses swept tightly down back */}
          <path
            d={`M 282 230 C 268 290 272 340 ${282 + wave * 0.4} 385 L 418 385 C 428 340 432 290 418 230 Z`}
            fill={palette.hairBase}
            stroke={ink}
            strokeWidth="3.5"
          />
        </g>
      );

    case 'shakuni':
      return (
        <g id="hair_back_shakuni">
          {/* Heavy dark hooded Gandhara cowl framing face */}
          <path
            d="M 248 250 C 242 140 288 102 350 102 C 412 102 458 140 452 250 L 428 360 L 272 360 Z"
            fill="#1C1917"
            stroke={ink}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
        </g>
      );

    case 'chanakya':
      return (
        <g id="hair_back_chanakya">
          {/* Dynamic flowing braided Shikha sweeping backward */}
          <path
            d={`M 378 165 C 412 128 454 132 ${468 + wave * 0.6} 175 C 445 162 415 166 390 185 Z`}
            fill={palette.hairBase}
            stroke={ink}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <rect x="382" y="158" width="12" height="16" rx="4" fill="#DC2626" stroke={ink} strokeWidth="2.5" />
        </g>
      );

    default:
      return (
        <g id="hair_back_generic">
          <path
            d="M 278 220 C 272 260 276 300 288 320 L 412 320 C 424 300 428 260 422 220 Z"
            fill={palette.hairBase}
            stroke={ink}
            strokeWidth="3"
          />
        </g>
      );
  }
};

export const LegendHeadgearFront: React.FC<HeadgearProps> = ({ profile, frame, fps }) => {
  const { id, palette } = profile;
  const ink = palette.outlineInk;
  const goldGrad = `url(#goldMetal_${id})`;
  const featherSway = Math.sin((frame / fps) * 2.5) * 3.5;

  switch (id) {
    case 'krishna':
      return (
        <g id="crown_krishna_morpankh">
          {/* Dark curly hair locks framing Krishna's temples (Alaka) */}
          <path
            d="M 282 215 Q 272 200 288 188 Q 318 196 350 186 Q 382 196 412 188 Q 428 200 418 215 C 412 198 380 202 350 198 C 320 202 288 198 282 215 Z"
            fill={palette.hairBase}
            stroke={ink}
            strokeWidth="3"
          />
          {/* Delicate Spiral Hair Curls at Temples */}
          <path d="M 282 216 Q 273 230 282 238" fill="none" stroke={palette.hairBase} strokeWidth="5" strokeLinecap="round" />
          <path d="M 418 216 Q 427 230 418 238" fill="none" stroke={palette.hairBase} strokeWidth="5" strokeLinecap="round" />

          {/* Peacock Feather (Mor Pankh) arching gracefully with subtle wind sway */}
          <g transform={`rotate(${featherSway} 312 158)`}>
            {/* Feather Quill Stem */}
            <path d="M 326 160 Q 290 95 272 52" fill="none" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" />
            {/* Radiant Iridescent Barb Halo */}
            <ellipse cx="272" cy="54" rx="28" ry="38" fill="#059669" stroke={ink} strokeWidth="3.2" transform="rotate(-22 272 54)" />
            <ellipse cx="273" cy="54" rx="19" ry="27" fill="#0284C7" transform="rotate(-22 273 54)" />
            <ellipse cx="274" cy="55" rx="12" ry="17" fill="#FACC15" transform="rotate(-22 274 55)" />
            <ellipse cx="274" cy="56" rx="6.5" ry="9.5" fill="#1E1B4B" transform="rotate(-22 274 56)" />
            {/* Feather fine fringe strokes */}
            <path d="M 244 42 L 236 32 M 248 64 L 238 62 M 298 36 L 306 26" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Sculpted Royal Kirit-Mukut Base */}
          <path
            d="M 284 196 C 280 162 296 144 350 140 C 404 144 420 162 416 196 Q 350 184 284 196 Z"
            fill={goldGrad}
            stroke={ink}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Mukut Spire Tier */}
          <path
            d="M 314 144 L 350 86 L 386 144 Q 350 152 314 144 Z"
            fill={goldGrad}
            stroke={ink}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Kalash Jewel Finial */}
          <circle cx="350" cy="78" r="7" fill="#FDE047" stroke={ink} strokeWidth="2.8" />
          {/* Crimson & Emerald Jewels along Mukut Fillet */}
          <circle cx="305" cy="176" r="5" fill="#10B981" stroke={ink} strokeWidth="2" />
          <polygon points="350,152 361,168 350,184 339,168" fill="#DC2626" stroke={ink} strokeWidth="2.5" />
          <circle cx="350" cy="166" r="2.5" fill="#FFFFFF" opacity="0.85" />
          <circle cx="395" cy="176" r="5" fill="#10B981" stroke={ink} strokeWidth="2" />
        </g>
      );

    case 'arjuna':
    case 'karna':
    case 'duryodhana':
    case 'ashoka':
    case 'rama':
    case 'ravana': {
      const hasSunCrest = id === 'karna';
      const hasChakraCrest = id === 'ashoka';
      const spireColor = id === 'duryodhana' || id === 'ravana' ? '#DC2626' : id === 'ashoka' ? '#1D4ED8' : '#059669';
      return (
        <g id={`crown_royal_${id}`}>
          {/* Hairline frame above brow */}
          <path
            d="M 283 212 C 288 194 316 188 350 188 C 384 188 412 194 417 212 Q 350 202 283 212 Z"
            fill={palette.hairBase}
            stroke={ink}
            strokeWidth="3"
          />
          {/* Karna Surya Sun Rays / Halo behind Crown */}
          {hasSunCrest && (
            <g opacity="0.85">
              {[-60, -35, 0, 35, 60].map((deg) => (
                <polygon
                  key={deg}
                  points="350,52 343,108 357,108"
                  fill="#FDE047"
                  stroke={ink}
                  strokeWidth="2"
                  transform={`rotate(${deg} 350 155)`}
                />
              ))}
            </g>
          )}
          {/* Heavy Sculpted 3-Tier Kirit Mukut */}
          <path
            d="M 280 198 L 288 152 Q 350 136 412 152 L 420 198 Q 350 182 280 198 Z"
            fill={goldGrad}
            stroke={ink}
            strokeWidth="3.8"
            strokeLinejoin="round"
          />
          {/* Tier 2 Tapered Regal Dome */}
          <path
            d="M 304 150 L 322 104 L 350 94 L 378 104 L 396 150 Q 350 142 304 150 Z"
            fill={goldGrad}
            stroke={ink}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Tier 3 High Spire */}
          <path d="M 336 98 L 350 52 L 364 98 Z" fill={goldGrad} stroke={ink} strokeWidth="3.2" />
          <circle cx="350" cy="48" r="6" fill="#FEF08A" stroke={ink} strokeWidth="2.5" />

          {/* Ashoka Chakra Emblem or Jewel Shield */}
          {hasChakraCrest ? (
            <g transform="translate(350, 126)">
              <circle cx="0" cy="0" r="18" fill="#1D4ED8" stroke="#FDE047" strokeWidth="3" />
              <circle cx="0" cy="0" r="5" fill="#FDE047" />
              {[0, 45, 90, 135].map((d) => (
                <line key={d} x1="-16" y1="0" x2="16" y2="0" stroke="#FDE047" strokeWidth="2" transform={`rotate(${d})`} />
              ))}
            </g>
          ) : (
            <g>
              <polygon points="350,148 363,168 350,188 337,168" fill={spireColor} stroke={ink} strokeWidth="2.5" />
              <circle cx="350" cy="166" r="2.5" fill="#FFFFFF" />
            </g>
          )}
          <circle cx="305" cy="176" r="4.5" fill="#FEF08A" stroke={ink} strokeWidth="2" />
          <circle cx="395" cy="176" r="4.5" fill="#FEF08A" stroke={ink} strokeWidth="2" />
        </g>
      );
    }

    case 'shiva':
      return (
        <g id="crown_shiva_jata_chandrama">
          {/* Flowing front lock framing */}
          <path d="M 284 214 Q 315 186 350 194 Q 385 186 416 214" fill={palette.hairBase} stroke={ink} strokeWidth="3.5" />
          {/* Sculpted Full Yogi Jata (Multi-tier Matted Crown Topknot) */}
          <path
            d="M 294 192 C 282 140 310 86 350 82 C 390 86 418 140 406 192 Q 350 176 294 192 Z"
            fill={palette.hairBase}
            stroke={ink}
            strokeWidth="3.8"
          />
          <path
            d="M 322 92 C 320 64 340 52 350 52 C 360 52 380 64 378 92 Z"
            fill={palette.hairBase}
            stroke={ink}
            strokeWidth="3.5"
          />
          {/* Jata coiled strands & Rudraksha hair tie */}
          <path d="M 304 156 Q 350 168 396 156" fill="none" stroke={palette.hairHighlight} strokeWidth="3.5" />
          <path d="M 314 126 Q 350 138 386 126" fill="none" stroke={palette.hairHighlight} strokeWidth="3.5" />
          <path d="M 322 92 Q 350 100 378 92" fill="none" stroke="#78350F" strokeWidth="6" strokeDasharray="5 4" strokeLinecap="round" />
          {/* Luminous Crescent Moon (Ardha-Chandra) tucked gracefully */}
          <path
            d="M 384 114 A 24 24 0 1 0 406 150 A 17 17 0 1 1 384 114 Z"
            fill="#F8FAFC"
            stroke="#38BDF8"
            strokeWidth="2.2"
          />
          {/* Flowing Sacred Ganga Stream cresting topknot */}
          <path d="M 346 58 Q 326 32 342 16" fill="none" stroke="#7DD3FC" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
        </g>
      );

    case 'bhishma':
      return (
        <g id="crown_bhishma_patriarch">
          {/* Dignified Silver Hair & Royal Kuru Patriarch Jata Crest */}
          <path
            d="M 282 212 C 282 162 312 140 350 140 C 388 140 418 162 418 212 Q 350 192 282 212 Z"
            fill={palette.hairBase}
            stroke={ink}
            strokeWidth="3.5"
          />
          {/* Tapered Imperial Silver Hair Coil bound by Gold Fillet */}
          <path d="M 318 146 C 318 106 336 92 350 92 C 364 92 382 106 382 146 Z" fill={palette.hairBase} stroke={ink} strokeWidth="3.5" />
          <path d="M 318 142 Q 350 150 382 142" fill="none" stroke={goldGrad} strokeWidth="6" />
          <path d="M 284 186 Q 350 170 416 186 L 414 202 Q 350 188 286 202 Z" fill={goldGrad} stroke={ink} strokeWidth="3" />
          <polygon points="350,174 358,189 350,204 342,189" fill="#38BDF8" stroke={ink} strokeWidth="2" />
        </g>
      );

    case 'hanuman':
      return (
        <g id="crown_hanuman_mukut">
          {/* Golden Crown with Hanuman Tilak Jewel */}
          <path
            d="M 286 196 L 296 146 Q 350 132 404 146 L 414 196 Q 350 182 286 196 Z"
            fill={goldGrad}
            stroke={ink}
            strokeWidth="3.8"
          />
          <path d="M 318 144 L 350 88 L 382 144 Z" fill={goldGrad} stroke={ink} strokeWidth="3.5" />
          <circle cx="350" cy="82" r="7" fill="#EF4444" stroke={ink} strokeWidth="2.5" />
          <polygon points="350,152 360,168 350,184 340,168" fill="#DC2626" stroke={ink} strokeWidth="2.5" />
        </g>
      );

    case 'shivaji':
      return (
        <g id="crown_shivaji_maratha_pagadi">
          {/* Authentic Iconic Asymmetric Maratha Jiratop / Maval Pagadi */}
          {/* Base Velvet Crimson Pagadi Wrap */}
          <path
            d="M 272 208 C 258 144 298 104 356 106 C 414 108 446 142 426 206 Q 350 186 272 208 Z"
            fill="#991B1B"
            stroke={ink}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Overlapping Gold-Zari Crossed Saffron Silk Folds */}
          <path
            d="M 275 186 Q 348 156 424 188"
            fill="none"
            stroke="#EA580C"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 284 154 Q 354 128 422 162"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Elevated Side Jiratop Crest */}
          <path
            d="M 318 112 Q 354 78 394 114"
            fill="#B91C1C"
            stroke={ink}
            strokeWidth="3.5"
          />
          {/* Pearl & Diamond Sarpech + Saffron Plume (Kalgi) */}
          <path d="M 342 126 L 350 84 L 358 126 L 350 138 Z" fill={goldGrad} stroke={ink} strokeWidth="2.8" />
          <circle cx="350" cy="122" r="5" fill="#10B981" />
          <path
            d={`M 350 84 Q ${372 + featherSway} 45 ${356 + featherSway} 28`}
            fill="none"
            stroke="#F8FAFC"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Iconic Pearl Strand (Moti Turra) draping off left edge */}
          <path d="M 280 184 Q 268 228 282 260" fill="none" stroke="#FEF9C3" strokeWidth="5" strokeDasharray="4 6" strokeLinecap="round" />
        </g>
      );

    case 'maharana_pratap':
      return (
        <g id="crown_pratap_mewari_pagdi">
          {/* Tall Proud Mewari Rajputana Pagadi */}
          <path
            d="M 270 206 C 254 134 300 94 352 96 C 412 98 446 138 428 206 Q 350 186 270 206 Z"
            fill="#EA580C"
            stroke={ink}
            strokeWidth="4"
          />
          <path d="M 274 182 Q 350 156 425 182" fill="none" stroke="#B91C1C" strokeWidth="14" />
          <path d="M 286 144 Q 350 122 414 148" fill="none" stroke="#FACC15" strokeWidth="7" />
          {/* Steel Armor Nose/Helmet Plate Rim peeking underneath */}
          <path d="M 280 198 Q 350 184 420 198" fill="none" stroke="#CBD5E1" strokeWidth="5" />
          {/* Tall Rajput Kalgi Plume & Ruby Sarpech */}
          <polygon points="342,130 350,80 358,130" fill={goldGrad} stroke={ink} strokeWidth="2.8" />
          <circle cx="350" cy="116" r="5" fill="#DC2626" />
          <path
            d={`M 350 80 Q ${366 + featherSway} 38 ${348 + featherSway} 18`}
            fill="none"
            stroke="#FDE047"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>
      );

    case 'lakshmibai':
      return (
        <g id="crown_lakshmibai_jhansi_pagdi">
          {/* Regal Crimson & Gold Maratha Warrior Queen Pagdi */}
          <path
            d="M 276 206 C 266 140 302 104 350 104 C 398 104 434 140 424 206 Q 350 184 276 206 Z"
            fill="#9F1239"
            stroke={ink}
            strokeWidth="3.8"
          />
          <path d="M 280 176 Q 350 152 420 176" fill="none" stroke="#F59E0B" strokeWidth="9" />
          <path d="M 288 144 Q 350 126 412 144" fill="none" stroke="#F43F5E" strokeWidth="9" />
          {/* Royal Sarpech & Pearl Chain */}
          <polygon points="343,128 350,86 357,128" fill={goldGrad} stroke={ink} strokeWidth="2.5" />
          <circle cx="350" cy="118" r="5" fill="#10B981" />
          <path d="M 418 176 Q 430 220 416 250" fill="none" stroke="#FEF9C3" strokeWidth="5" strokeDasharray="3 5" strokeLinecap="round" />
        </g>
      );

    case 'vivekananda':
      return (
        <g id="crown_vivekananda_bhagwa_turban">
          {/* Iconic Fuller Rounded Bhagwa Saffron Chicago Turban */}
          <path
            d="M 264 208 C 246 118 292 78 350 78 C 408 78 454 118 436 208 Q 350 180 264 208 Z"
            fill="#EA580C"
            stroke={ink}
            strokeWidth="3.8"
          />
          {/* Overlapping sculpted turban bands */}
          <path d="M 268 188 Q 350 144 432 182" fill="none" stroke="#C2410C" strokeWidth="10" strokeLinecap="round" />
          <path d="M 274 156 Q 350 116 426 150" fill="none" stroke="#FB923C" strokeWidth="8" strokeLinecap="round" />
          <path d="M 290 122 Q 350 94 410 122" fill="none" stroke="#C2410C" strokeWidth="7" strokeLinecap="round" />
          {/* Side dark hair locks peeking cleanly under turban edge */}
          <path d="M 280 206 Q 276 228 282 246" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
          <path d="M 420 206 Q 424 228 418 246" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
        </g>
      );

    case 'chanakya':
      return (
        <g id="crown_chanakya_bald_brow">
          {/* Clean high analytical brow dome sheen */}
          <path d="M 314 182 Q 350 170 384 182" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity="0.35" strokeLinecap="round" />
        </g>
      );

    case 'shakuni':
      return (
        <g id="crown_shakuni_hood_front">
          {/* Shadowed front fold of Gandhara Hood */}
          <path
            d="M 272 208 C 282 146 318 122 350 122 C 382 122 418 146 428 208 C 402 186 376 174 350 172 C 324 174 298 186 272 208 Z"
            fill="#292524"
            stroke={ink}
            strokeWidth="3.8"
          />
          <path d="M 300 172 Q 350 152 400 172" fill="none" stroke="#D97706" strokeWidth="3.5" opacity="0.7" />
        </g>
      );

    default:
      return null;
  }
};
