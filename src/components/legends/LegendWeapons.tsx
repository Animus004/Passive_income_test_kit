import React from 'react';
import { LegendWeaponType } from './types';

interface WeaponRenderProps {
  weapon: LegendWeaponType;
  frame: number;
  fps: number;
  ink: string;
}

/**
 * High-Craft Signature Indian Weapons & Artifacts mounted into Legend HandSockets.
 * Anchor point (0, 0) corresponds directly to the gripping palm.
 */
export const LegendWeapon: React.FC<WeaponRenderProps> = ({ weapon, frame, fps, ink }) => {
  const chakraSpin = (frame * 14) % 360;
  const gleamY = ((frame * 3) % 140) - 70;

  switch (weapon) {
    case 'sudarshan_chakra':
      return (
        <g id="weapon_sudarshan_chakra" transform="translate(0, -34)">
          {/* Radiant Halo Glow */}
          <circle cx="0" cy="0" r="64" fill="#38BDF8" opacity="0.22" />
          <circle cx="0" cy="0" r="52" fill="#FACC15" opacity="0.28" />
          <g transform={`rotate(${chakraSpin})`}>
            {/* 12 Blazing Razor Serration Blades */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <polygon
                key={deg}
                points="0,-54 -8,-38 8,-38"
                fill="#FEF08A"
                stroke="#EA580C"
                strokeWidth="2"
                transform={`rotate(${deg})`}
              />
            ))}
            <circle cx="0" cy="0" r="38" fill="#F59E0B" stroke={ink} strokeWidth="3.5" />
            <circle cx="0" cy="0" r="28" fill="#FEF08A" stroke="#D97706" strokeWidth="2.5" />
            {[0, 45, 90, 135].map((d) => (
              <line key={d} x1="-26" y1="0" x2="26" y2="0" stroke="#B45309" strokeWidth="3" transform={`rotate(${d})`} />
            ))}
            <circle cx="0" cy="0" r="12" fill="#0284C7" stroke={ink} strokeWidth="2.5" />
            <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
          </g>
        </g>
      );

    case 'bansuri':
      return (
        <g id="weapon_bansuri" transform="translate(-130, -34) rotate(-5)">
          <rect x="-135" y="-7" width="270" height="14" rx="5" fill="#D97706" stroke={ink} strokeWidth="3" />
          <rect x="-125" y="-7" width="12" height="14" fill="#FDE047" />
          <rect x="108" y="-7" width="12" height="14" fill="#FDE047" />
          {[-70, -40, -10, 20, 50, 80].map((fx) => (
            <circle key={fx} cx={fx} cy="0" r="3" fill="#451A03" />
          ))}
          {/* Peacock crest & golden hanging bell tassel */}
          <path d="M 118 7 Q 124 28 116 42" stroke="#EF4444" strokeWidth="3.5" fill="none" />
          <circle cx="116" cy="44" r="5" fill="#FACC15" stroke={ink} strokeWidth="2" />
        </g>
      );

    case 'gandiva_bow':
    case 'vijaya_bow':
    case 'kodanda_bow': {
      const bowFill =
        weapon === 'vijaya_bow' ? '#DC2626' : weapon === 'kodanda_bow' ? '#D97706' : '#F59E0B';
      const bowHighlight = weapon === 'vijaya_bow' ? '#FDE047' : '#FEF08A';
      return (
        <g id={`weapon_${weapon}`} transform="translate(-6, 0)">
          {/* Grand Double-Recurve Celestial Bow */}
          <path
            d="M 14 -215 C -26 -160 -28 -85 -4 0 C -28 85 -26 160 14 215"
            fill="none"
            stroke={ink}
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 14 -215 C -26 -160 -28 -85 -4 0 C -28 85 -26 160 14 215"
            fill="none"
            stroke={bowFill}
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Gold Inlay & Center Grip */}
          <rect x="-11" y="-26" width="14" height="52" rx="5" fill={bowHighlight} stroke={ink} strokeWidth="2.5" />
          <circle cx="14" cy="-215" r="6" fill={bowHighlight} stroke={ink} strokeWidth="2" />
          <circle cx="14" cy="215" r="6" fill={bowHighlight} stroke={ink} strokeWidth="2" />
          {/* Taut Drawn Bowstring stretching backward toward archer draw hand */}
          <line x1="14" y1="-215" x2="218" y2="-4" stroke="#FEF9C3" strokeWidth="3" />
          <line x1="14" y1="215" x2="218" y2="-4" stroke="#FEF9C3" strokeWidth="3" />
          {/* Nocked Blazing Astra Arrow */}
          <line x1="-68" y1="-4" x2="218" y2="-4" stroke="#FDE047" strokeWidth="5.5" strokeLinecap="round" />
          <polygon points="-92,-4 -56,-14 -62,-4 -56,6" fill="#38BDF8" stroke={ink} strokeWidth="2.2" />
          <polygon points="204,-4 224,-12 214,-4 224,4" fill="#DC2626" stroke={ink} strokeWidth="1.8" />
        </g>
      );
    }

    case 'bhavani_talwar':
    case 'twin_talwars':
    case 'chandrahasa_sword': {
      const bladeColor = weapon === 'chandrahasa_sword' ? '#C4B5FD' : '#E2E8F0';
      return (
        <g id={`weapon_${weapon}`} transform="translate(0, -10) rotate(-32)">
          {/* Curved Heroic Talwar Blade */}
          <path
            d="M -4 -10 Q -26 -125 -8 -235 Q 24 -190 12 -10 Z"
            fill={bladeColor}
            stroke={ink}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Razor Gleam Edge */}
          <path
            d="M -6 -25 Q -22 -120 -7 -224"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Animated specular flash on blade */}
          <ellipse cx="-6" cy={-120 + gleamY * 0.4} rx="5" ry="18" fill="#FFFFFF" opacity="0.6" />
          {/* Ornate Gold Basket Crossguard & Ruby Pommel */}
          <path d="M -20 -8 Q 4 -22 24 -8 L 16 14 Q 2 24 -14 14 Z" fill="#F59E0B" stroke={ink} strokeWidth="3" />
          <rect x="-4" y="-8" width="12" height="28" rx="4" fill="#78350F" stroke={ink} strokeWidth="2.5" />
          <circle cx="2" cy="24" r="7" fill="#DC2626" stroke={ink} strokeWidth="2.2" />
        </g>
      );
    }

    case 'pratap_bhala_spear':
      return (
        <g id="weapon_pratap_bhala" transform="translate(0, 0) rotate(-12)">
          {/* Tall Hardwood Battle Spear Shaft */}
          <line x1="0" y1="-295" x2="0" y2="215" stroke="#78350F" strokeWidth="12" strokeLinecap="round" />
          <line x1="0" y1="-295" x2="0" y2="215" stroke={ink} strokeWidth="3" />
          {/* Saffron Royal Pennant Ribbon snapping in wind */}
          <path
            d={`M 4 -255 Q 38 ${-245 + Math.sin((frame / fps) * 6) * 8} 68 -260 L 48 -236 Q 24 -235 4 -235 Z`}
            fill="#EA580C"
            stroke={ink}
            strokeWidth="2.5"
          />
          {/* Gleaming Double-Edged Mewar Spearhead */}
          <polygon
            points="0,-365 -20,-285 0,-300 20,-285"
            fill="#E2E8F0"
            stroke={ink}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <rect x="-9" y="-290" width="18" height="16" rx="4" fill="#F59E0B" stroke={ink} strokeWidth="2.5" />
        </g>
      );

    case 'trishul_damru':
      return (
        <g id="weapon_trishul_damru" transform="translate(0, 0) rotate(-8)">
          {/* Sacred Iron-Gold Shaft */}
          <line x1="0" y1="-235" x2="0" y2="220" stroke="#D97706" strokeWidth="11" strokeLinecap="round" />
          <line x1="0" y1="-235" x2="0" y2="220" stroke={ink} strokeWidth="3" />
          {/* Three Prongs (Trishul) */}
          <path d="M -38 -255 Q -38 -210 0 -208 Q 38 -210 38 -255" fill="none" stroke="#FDE047" strokeWidth="10" strokeLinecap="round" />
          <path d="M -38 -255 Q -38 -210 0 -208 Q 38 -210 38 -255" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
          <polygon points="-38,-282 -47,-248 -29,-248" fill="#FEF08A" stroke={ink} strokeWidth="2.5" />
          <polygon points="38,-282 29,-248 47,-248" fill="#FEF08A" stroke={ink} strokeWidth="2.5" />
          <polygon points="0,-320 -13,-246 0,-232 13,-246" fill="#FACC15" stroke={ink} strokeWidth="3" />
          {/* Hourglass Damru tied below Prongs */}
          <g transform="translate(16, -155) rotate(18)">
            <polygon points="-14,-16 14,-16 3,0 14,16 -14,16 -3,0" fill="#DC2626" stroke={ink} strokeWidth="3" />
            <line x1="-14" y1="-16" x2="14" y2="-16" stroke="#FEF08A" strokeWidth="3.5" />
            <line x1="-14" y1="16" x2="14" y2="16" stroke="#FEF08A" strokeWidth="3.5" />
          </g>
        </g>
      );

    case 'gada_mace':
    case 'heavy_gada': {
      const mScale = weapon === 'heavy_gada' ? 1.15 : 1.0;
      return (
        <g id={`weapon_${weapon}`} transform={`translate(0, 12) rotate(18) scale(${mScale})`}>
          <rect x="-7" y="-120" width="14" height="190" rx="6" fill="#B45309" stroke={ink} strokeWidth="3.5" />
          {/* Fluted Heavy Gold Sphere Head */}
          <ellipse cx="0" cy="-165" rx="48" ry="44" fill="#F59E0B" stroke={ink} strokeWidth="4" />
          <ellipse cx="0" cy="-165" rx="30" ry="44" fill="#FACC15" stroke={ink} strokeWidth="2.5" />
          <ellipse cx="0" cy="-165" rx="12" ry="44" fill="#FEF08A" stroke={ink} strokeWidth="2" />
          <polygon points="0,-228 -10,-204 10,-204" fill="#FDE047" stroke={ink} strokeWidth="2.8" />
          <circle cx="0" cy="74" r="10" fill="#F59E0B" stroke={ink} strokeWidth="3" />
        </g>
      );
    }

    case 'ashoka_edict_staff':
      return (
        <g id="weapon_ashoka_staff" transform="translate(0, 0) rotate(-6)">
          <line x1="0" y1="-215" x2="0" y2="210" stroke="#92400E" strokeWidth="12" strokeLinecap="round" />
          <line x1="0" y1="-215" x2="0" y2="210" stroke={ink} strokeWidth="3" />
          {/* Golden Ashoka Chakra Finial */}
          <circle cx="0" cy="-242" r="28" fill="#FACC15" stroke={ink} strokeWidth="3.5" />
          <circle cx="0" cy="-242" r="20" fill="#1D4ED8" stroke="#FDE047" strokeWidth="2" />
          <circle cx="0" cy="-242" r="5" fill="#FDE047" />
        </g>
      );

    case 'arthashastra_scroll':
      return (
        <g id="weapon_arthashastra_scroll" transform="translate(-14, -22) rotate(18) scale(1.25)">
          <rect x="-42" y="-13" width="84" height="26" rx="8" fill="#FEF3C7" stroke={ink} strokeWidth="3.2" />
          <circle cx="-42" cy="0" r="8" fill="#D97706" stroke={ink} strokeWidth="2.5" />
          <circle cx="42" cy="0" r="8" fill="#D97706" stroke={ink} strokeWidth="2.5" />
          {/* Crimson silk ribbon */}
          <rect x="-5" y="-14" width="10" height="28" fill="#DC2626" stroke={ink} strokeWidth="2" />
        </g>
      );

    case 'chaupar_dice':
      return (
        <g id="weapon_chaupar_dice" transform="translate(8, -28) scale(1.35)">
          <g transform={`rotate(${Math.sin((frame / fps) * 6) * 14})`}>
            <rect x="-12" y="-20" width="18" height="36" rx="4" fill="#FEF3C7" stroke={ink} strokeWidth="2.6" />
            <circle cx="-3" cy="-8" r="2.5" fill="#DC2626" />
            <circle cx="-3" cy="6" r="2.5" fill="#DC2626" />
          </g>
          <g transform={`translate(24, -12) rotate(${-Math.cos((frame / fps) * 6) * 16})`}>
            <rect x="-10" y="-18" width="18" height="34" rx="4" fill="#FDE68A" stroke={ink} strokeWidth="2.6" />
            <circle cx="-1" cy="-6" r="2.5" fill="#0F172A" />
            <circle cx="-1" cy="2" r="2.5" fill="#0F172A" />
            <circle cx="-1" cy="10" r="2.5" fill="#0F172A" />
          </g>
        </g>
      );

    case 'dhal_shield':
      return (
        <g id="weapon_dhal_shield" transform="translate(-10, -4)">
          <circle cx="0" cy="0" r="48" fill="#7F1D1D" stroke={ink} strokeWidth="3.8" />
          <circle cx="0" cy="0" r="40" fill="none" stroke="#F59E0B" strokeWidth="4" />
          <circle cx="0" cy="0" r="14" fill="#F59E0B" stroke={ink} strokeWidth="3" />
          {[0, 90, 180, 270].map((deg) => (
            <circle
              key={deg}
              cx={26 * Math.cos((deg * Math.PI) / 180)}
              cy={26 * Math.sin((deg * Math.PI) / 180)}
              r="5"
              fill="#FACC15"
              stroke={ink}
              strokeWidth="1.8"
            />
          ))}
        </g>
      );

    case 'none':
    default:
      return null;
  }
};
