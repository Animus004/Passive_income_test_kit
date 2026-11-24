import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { ColorTheme } from '../theme/tokens';
import { GooglyEyes } from '../components/GooglyEyes';

export interface ClusterNode {
  label: string;
  badge?: string;
  angleDeg: number;
  distance: number;
  color?: string;
  delay?: number;
}

export interface ExplodingClusterProps {
  theme: ColorTheme;
  title?: string;
  badgeText?: string;
  centerEmoji?: string;
  nodes?: ClusterNode[];
}

export const ExplodingCluster: React.FC<ExplodingClusterProps> = ({
  theme,
  title = 'WORST CASE SCENARIOS',
  badgeText = 'BRAIN SPIRAL',
  nodes = [
    { label: 'FIRED IMMEDIATELY', badge: '💥', angleDeg: -45, distance: 280, color: '#EF4444', delay: 8 },
    { label: 'DEMOTED TO INTERN', badge: '📉', angleDeg: 35, distance: 300, color: '#F59E0B', delay: 14 },
    { label: 'LIVING IN A BOX', badge: '📦', angleDeg: 120, distance: 270, color: '#8B5CF6', delay: 20 },
    { label: 'CALLED OUT IN ALL-HANDS', badge: '📢', angleDeg: -135, distance: 290, color: '#EC4899', delay: 26 },
  ],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Central Character Pop
  const centerSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 220, mass: 0.6 },
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 220,
        position: 'relative',
      }}
    >
      {/* Badge at top */}
      {badgeText && (
        <div
          style={{
            position: 'absolute',
            top: 130,
            backgroundColor: theme.accent,
            color: '#FFFFFF',
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 26,
            fontWeight: 900,
            textTransform: 'uppercase',
            padding: '10px 28px',
            borderRadius: 30,
            border: `5px solid ${theme.ink}`,
            boxShadow: `0 6px 0 ${theme.ink}`,
            letterSpacing: '1px',
            zIndex: 30,
          }}
        >
          {badgeText}
        </div>
      )}

      {/* Central Assembly */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Radiating connector lines to each satellite node */}
        <svg
          style={{
            position: 'absolute',
            width: 800,
            height: 800,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          viewBox="-400 -400 800 800"
        >
          {nodes.map((node, i) => {
            const rad = (node.angleDeg * Math.PI) / 180;
            const targetX = Math.cos(rad) * node.distance;
            const targetY = Math.sin(rad) * node.distance;
            const s = spring({
              frame: Math.max(0, frame - (node.delay || 10)),
              fps,
              config: { damping: 12, stiffness: 200, mass: 0.7 },
            });
            const currentX = targetX * s;
            const currentY = targetY * s;

            return (
              <line
                key={i}
                x1={0}
                y1={0}
                x2={currentX}
                y2={currentY}
                stroke={theme.ink}
                strokeWidth={5}
                strokeDasharray="8 6"
                opacity={s > 0.1 ? 0.7 : 0}
              />
            );
          })}
        </svg>

        {/* Orbiting Satellite Nodes */}
        {nodes.map((node, i) => {
          const s = spring({
            frame: Math.max(0, frame - (node.delay || 10)),
            fps,
            config: { damping: 9, stiffness: 220, mass: 0.6 },
          });

          const rad = (node.angleDeg * Math.PI) / 180;
          const x = Math.cos(rad) * (node.distance * s);
          const y = Math.sin(rad) * (node.distance * s);
          const wobble = Math.sin((frame + i * 20) * 0.15) * 4;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                transform: `translate(${x}px, ${y + wobble}px) scale(${s})`,
                backgroundColor: node.color || theme.primary,
                color: '#FFFFFF',
                fontFamily: 'Inter, Arial, sans-serif',
                fontWeight: 900,
                fontSize: 20,
                padding: '10px 22px',
                borderRadius: 24,
                border: `5px solid ${theme.ink}`,
                boxShadow: `0 8px 0 ${theme.ink}`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                zIndex: 20,
              }}
            >
              <span>{node.badge || '⚡'}</span>
              <span>{node.label}</span>
            </div>
          );
        })}

        {/* Central Panicked Head */}
        <div
          style={{
            width: 260,
            height: 260,
            backgroundColor: theme.primary,
            borderRadius: 130,
            border: `8px solid ${theme.ink}`,
            boxShadow: `0 14px 0 ${theme.ink}`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${centerSpring})`,
            zIndex: 10,
          }}
        >
          <GooglyEyes size={72} spacing={14} glance="center" inkColor={theme.ink} panicked={frame > 15} />

          {/* Screaming O mouth */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              width: 32,
              height: 28,
              borderRadius: '50%',
              backgroundColor: theme.ink,
            }}
          />
        </div>
      </div>

      {/* Title */}
      {title && (
        <div
          style={{
            position: 'absolute',
            top: 200,
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 36,
            fontWeight: 900,
            color: theme.text,
            textTransform: 'uppercase',
            letterSpacing: '-1px',
            textAlign: 'center',
            zIndex: 30,
            backgroundColor: `${theme.bg}D9`,
            padding: '8px 28px',
            borderRadius: 20,
            border: `3px solid ${theme.ink}20`,
          }}
        >
          {title}
        </div>
      )}
    </div>
  );
};
