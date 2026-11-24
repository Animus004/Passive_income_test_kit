import React from "react";
import { useCurrentFrame, useVideoConfig, spring, Audio, staticFile } from "remotion";
import { useInkBoil } from "./useInkBoil";

interface InkStampProps {
  text: string;
  subtext?: string;
  startFrame?: number;
  appearFrame?: number;
  color?: string;
  rotation?: number;
  size?: "small" | "medium" | "large";
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  style?: React.CSSProperties;
}

export const InkStamp: React.FC<InkStampProps> = ({
  text,
  subtext,
  startFrame = 0,
  appearFrame,
  color = "#dc2626", // Bold ink red
  rotation = -3,
  size = "medium",
  top,
  left,
  right,
  bottom,
  style,
}) => {
  const actualStartFrame = appearFrame !== undefined ? appearFrame : startFrame;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const boil = useInkBoil(3);

  if (frame < actualStartFrame) {
    return null;
  }

  const dropSpring = spring({
    frame: frame - actualStartFrame,
    fps,
    config: {
      damping: 12,
      stiffness: 300,
      mass: 0.5,
    },
  });

  const fontSize = size === "small" ? "24px" : size === "medium" ? "36px" : "50px";
  const padding = size === "small" ? "8px 18px" : size === "medium" ? "12px 28px" : "18px 40px";

  const isPositioned = top !== undefined || left !== undefined || right !== undefined || bottom !== undefined;

  return (
    <>
      {frame === actualStartFrame && (
        <Audio src={staticFile("sfx/stamp_thud.mp3")} volume={0.6} />
      )}
      <div
        style={{
          position: isPositioned ? "absolute" : "relative",
          top,
          left,
          right,
          bottom,
          zIndex: 40,
          transform: `scale(${dropSpring}) rotate(${rotation + boil.angle}deg) translate(${boil.dx}px, ${boil.dy}px)`,
          transformOrigin: "center center",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: `4px solid ${color}`,
          borderRadius: "8px",
          padding,
          backgroundColor: "#fcfbf7",
          boxShadow: `0 4px 14px rgba(15, 23, 42, 0.08), inset 0 0 0 2px ${color}`,
          ...style,
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace, monospace",
            fontSize,
            fontWeight: 900,
            letterSpacing: "3px",
            color,
            textTransform: "uppercase",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {text}
        </span>
        {subtext && (
          <span
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              color,
              marginTop: "4px",
              opacity: 0.9,
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            {subtext}
          </span>
        )}
      </div>
    </>
  );
};
