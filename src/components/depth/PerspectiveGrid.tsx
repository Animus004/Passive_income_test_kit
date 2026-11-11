import React from "react";
import { useCurrentFrame } from "remotion";

interface PerspectiveGridProps {
  color?: string;
}

export const PerspectiveGrid: React.FC<PerspectiveGridProps> = ({
  color = "#38bdf8",
}) => {
  const frame = useCurrentFrame();

  // Forward rush animation
  const gridOffsetY = (frame * 2.5) % 60;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 750,
        perspective: 550,
        perspectiveOrigin: "50% 0%",
        overflow: "hidden",
        pointerEvents: "none",
        maskImage: "linear-gradient(to top, black 50%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to top, black 50%, transparent 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "-25%",
          width: "150%",
          height: 1200,
          transformOrigin: "50% 0%",
          transform: "rotateX(68deg)",
          backgroundImage: `
            linear-gradient(to right, ${color}33 1px, transparent 1px),
            linear-gradient(to bottom, ${color}33 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          backgroundPosition: `0px ${gridOffsetY}px`,
        }}
      >
        {/* Horizon Glow Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 4,
            background: `linear-gradient(90deg, transparent 10%, ${color} 50%, transparent 90%)`,
            boxShadow: `0 0 30px ${color}, 0 0 60px ${color}`,
          }}
        />
      </div>
    </div>
  );
};

