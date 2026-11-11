import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface CameraRigProps {
  children: React.ReactNode;
}

export const CameraRig: React.FC<CameraRigProps> = ({ children }) => {
  const frame = useCurrentFrame();

  // Subtle organic camera breathing
  const camScale = 1.02 + Math.sin(frame * 0.02) * 0.018;
  const camRotateX = Math.sin(frame * 0.015) * 1.8;
  const camRotateY = Math.cos(frame * 0.018) * 2.2;
  const camTranslateY = Math.sin(frame * 0.025) * 6;

  // Punch-in pulse every 240 frames (scene changes)
  const sceneProgress = frame % 240;
  const punchZ = interpolate(sceneProgress, [0, 8, 35], [25, -5, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        perspective: 1200,
        perspectiveOrigin: "50% 40%",
        transformStyle: "preserve-3d",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transform: `
            scale(${camScale})
            rotateX(${camRotateX}deg)
            rotateY(${camRotateY}deg)
            translateY(${camTranslateY}px)
            translateZ(${punchZ}px)
          `,
          transition: "transform 0.05s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
};
