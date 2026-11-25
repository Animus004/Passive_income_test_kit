import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { LEGEND_PROFILES, LegendCharacterRig, LegendId } from '../components/legends';

const GALLERY_GROUPS: LegendId[][] = [
  ['krishna', 'arjuna', 'karna', 'bhishma'],
  ['shakuni', 'duryodhana', 'rama', 'hanuman'],
  ['shiva', 'ravana', 'chanakya', 'shivaji'],
  ['maharana_pratap', 'ashoka', 'lakshmibai', 'vivekananda'],
];

const SLOTS = [
  { x: 280, y: 580 },
  { x: 800, y: 580 },
  { x: 280, y: 1420 },
  { x: 800, y: 1420 },
];

export const LegendGallery: React.FC = () => {
  const frame = useCurrentFrame();
  // Cycle page every 10 frames so frame 0, 10, 20, 30 render all 4 gallery sheets cleanly
  const pageIdx = Math.min(GALLERY_GROUPS.length - 1, Math.floor(frame / 10));
  const legends = GALLERY_GROUPS[pageIdx];

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 35%, #1E1B4B 0%, #0F172A 65%, #020617 100%)',
        width: 1080,
        height: 1920,
      }}
    >
      {/* Top Header Banner */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#D97706',
          border: '6px solid #000000',
          borderRadius: 28,
          padding: '12px 36px',
          color: '#FFFFFF',
          fontSize: 30,
          fontWeight: 900,
          boxShadow: '0 8px 0 #000000',
          letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
        }}
      >
        INDIAN LEGENDS ASSET LIBRARY • SHEET {pageIdx + 1}/4
      </div>

      {/* 2x2 Grid Dividers */}
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 150,
          bottom: 60,
          width: 3,
          backgroundColor: 'rgba(250, 204, 21, 0.25)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 1020,
          left: 40,
          right: 40,
          height: 3,
          backgroundColor: 'rgba(250, 204, 21, 0.25)',
        }}
      />

      {legends.map((id, idx) => {
        const slot = SLOTS[idx];
        const profile = LEGEND_PROFILES[id];
        return (
          <React.Fragment key={id}>
            <LegendCharacterRig
              legendId={id}
              x={slot.x}
              y={slot.y}
              scale={0.78}
            />
            <div
              style={{
                position: 'absolute',
                left: slot.x,
                top: slot.y + 345,
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                border: '3px solid #F59E0B',
                borderRadius: 16,
                padding: '6px 20px',
                color: '#FEF08A',
                fontSize: 22,
                fontWeight: 800,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {profile.displayName}
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
