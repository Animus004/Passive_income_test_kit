import React from "react";
import { InkMascot } from "../components/InkMascot";

export const TestMascotPreview: React.FC = () => {
  return (
    <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="previewGrid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0284C7" strokeWidth="0.8" strokeOpacity="0.15" />
        </pattern>
      </defs>

      {/* Warm Cream Paper Background */}
      <rect width="1080" height="1920" fill="#F7F5F0" />
      <rect width="1080" height="1920" fill="url(#previewGrid)" />

      {/* --- TOP HEADER HUD --- */}
      <rect x="60" y="70" width="960" height="68" rx="8" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2.8" />
      <circle cx="98" cy="104" r="7" fill="#DC2626" />
      <text x="120" y="111" fill="#1C1917" fontFamily="'Courier New', monospace" fontSize="21" fontWeight="bold" letterSpacing="1px">
        DATA DETECTIVE // CHARACTER ASSET DOSSIER
      </text>
      <text x="990" y="111" textAnchor="end" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="bold" letterSpacing="1px">
        CODENAME: CIPHER 🦊
      </text>

      {/* Subheader Title Banner */}
      <text x="540" y="195" textAnchor="middle" fill="#1C1917" fontFamily="'Arial Black', sans-serif" fontSize="36" fontWeight="900" letterSpacing="1px">
        THE TECHNICAL INK DETECTIVE
      </text>
      <text x="540" y="235" textAnchor="middle" fill="#EA580C" fontFamily="'Courier New', monospace" fontSize="18" fontWeight="bold">
        OFFICIAL REPLACEMENT FOR THE YELLOW DUCK // HIGH-PRECISION INK ANCHOR
      </text>

      {/* --- MAIN HERO SHOWCASE (LARGE 3.6x CENTER STAGE) --- */}
      <rect x="60" y="270" width="960" height="840" rx="12" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2.5" strokeDasharray="8 6" />
      <text x="90" y="315" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="16" fontWeight="bold">
        PRIMARY BLUEPRINT SPECIFICATION // SCALE 3.6X
      </text>

      {/* Blueprint Alignment Guides around Hero */}
      <circle cx="540" cy="680" r="320" fill="none" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="6 6" />
      <line x1="180" y1="680" x2="900" y2="680" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.2" />

      {/* Hero Cipher (Inspecting pose with magnifying caliper & laser beam) */}
      <InkMascot pose="inspecting" x={340} y={430} scale={3.6} />

      {/* Technical Blueprint Callout Annotations */}
      {/* 1. Monocle Callout */}
      <line x1="720" y1="580" x2="880" y2="520" stroke="#1C1917" strokeWidth="2" />
      <line x1="880" y1="520" x2="1000" y2="520" stroke="#1C1917" strokeWidth="2" />
      <circle cx="720" cy="580" r="4" fill="#0284C7" />
      <text x="890" y="505" fill="#0284C7" fontFamily="monospace" fontSize="15" fontWeight="bold">
        CYBER OCULAR MONOCLE
      </text>
      <text x="890" y="540" fill="#1C1917" fontFamily="monospace" fontSize="13">
        480nm Cyan Laser Scanner
      </text>

      {/* 2. Stylus Callout */}
      <line x1="730" y1="840" x2="870" y2="880" stroke="#1C1917" strokeWidth="2" />
      <line x1="870" y1="880" x2="990" y2="880" stroke="#1C1917" strokeWidth="2" />
      <circle cx="730" cy="840" r="4" fill="#EA580C" />
      <text x="880" y="865" fill="#EA580C" fontFamily="monospace" fontSize="15" fontWeight="bold">
        ENGINEER'S STYLUS
      </text>
      <text x="880" y="900" fill="#1C1917" fontFamily="monospace" fontSize="13">
        Safety-Orange Clip
      </text>

      {/* 3. Crosshatch Callout */}
      <line x1="260" y1="780" x2="140" y2="820" stroke="#1C1917" strokeWidth="2" />
      <line x1="140" y1="820" x2="70" y2="820" stroke="#1C1917" strokeWidth="2" />
      <circle cx="260" cy="780" r="4" fill="#1C1917" />
      <text x="75" y="805" fill="#1C1917" fontFamily="monospace" fontSize="15" fontWeight="bold">
        45° INK HATCHING
      </text>
      <text x="75" y="840" fill="#0284C7" fontFamily="monospace" fontSize="13">
        Architectural Texture
      </text>

      {/* --- LOWER MODULAR POSES SHOWCASE ROW --- */}
      <rect x="60" y="1140" width="960" height="540" rx="12" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2.5" />
      <text x="90" y="1185" fill="#1C1917" fontFamily="'Courier New', monospace" fontSize="18" fontWeight="bold">
        DYNAMIC STORYBOARD POSES // MODULAR VISUAL ANCHOR BEATS
      </text>

      {/* Pose 1: Pointing */}
      <g transform="translate(40, 1180)">
        <rect x="40" y="30" width="280" height="420" rx="8" fill="#F7F5F0" stroke="#1C1917" strokeWidth="1.5" strokeDasharray="4 4" />
        <InkMascot pose="pointing" x={100} y={150} scale={1.8} />
        <rect x="70" y="390" width="220" height="36" rx="6" fill="#1C1917" />
        <text x="180" y="414" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontSize="14" fontWeight="bold">
          POSE 01: POINTING
        </text>
      </g>

      {/* Pose 2: Eureka */}
      <g transform="translate(360, 1180)">
        <rect x="40" y="30" width="280" height="420" rx="8" fill="#F7F5F0" stroke="#1C1917" strokeWidth="1.5" strokeDasharray="4 4" />
        <InkMascot pose="eureka" x={100} y={150} scale={1.8} />
        <rect x="70" y="390" width="220" height="36" rx="6" fill="#0284C7" />
        <text x="180" y="414" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontSize="14" fontWeight="bold">
          POSE 02: EUREKA / WIN
        </text>
      </g>

      {/* Pose 3: Alert */}
      <g transform="translate(680, 1180)">
        <rect x="40" y="30" width="280" height="420" rx="8" fill="#F7F5F0" stroke="#1C1917" strokeWidth="1.5" strokeDasharray="4 4" />
        <InkMascot pose="alert" x={100} y={150} scale={1.8} />
        <rect x="70" y="390" width="220" height="36" rx="6" fill="#DC2626" />
        <text x="180" y="414" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontSize="14" fontWeight="bold">
          POSE 03: ALERT // FAIL
        </text>
      </g>

      {/* --- BOTTOM TELEMETRY HUD --- */}
      <rect x="60" y="1730" width="960" height="74" rx="8" fill="#1C1917" />
      <text x="95" y="1774" fill="#EA580C" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="bold" letterSpacing="1px">
        STATUS: ONLINE // READY FOR PHASE 1 ENGINE DEPLOYMENT
      </text>
      <text x="990" y="1774" textAnchor="end" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="bold">
        ASSET ID: CIPHER-V2
      </text>
    </svg>
  );
};
