import React, { useRef, useEffect } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { getShotAtFrame, MolassesShotDef } from "../story";
import {
  drawShot1GaugeAndSpeedo,
  drawShot5CalendarAndThermometer,
  drawShot3AngryMob,
  drawShot12AcidContrast,
  drawShot13ShoePop,
  drawShot14KetchupGag,
  drawShot15PancakeBricks,
} from "./molassesGags";

export interface MolassesGagOverlayProps {
  currentShot?: MolassesShotDef;
}

export const MolassesGagOverlay: React.FC<MolassesGagOverlayProps> = ({ currentShot }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gagBufferRef = useRef<HTMLCanvasElement | null>(null);

  const activeShot = currentShot ?? getShotAtFrame(frame);
  const shotDur = Math.max(1, activeShot.endFrame - activeShot.startFrame);
  const shotProgress = Math.max(0, Math.min(1, (frame - activeShot.startFrame) / shotDur));

  useEffect(() => {
    if (!gagBufferRef.current) {
      gagBufferRef.current = document.createElement("canvas");
      gagBufferRef.current.width = 1024;
      gagBufferRef.current.height = 1024;
    }
  }, []);

  useEffect(() => {
    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;
    const ctx = mainCanvas.getContext("2d");
    if (!ctx) return;

    if (!gagBufferRef.current) {
      gagBufferRef.current = document.createElement("canvas");
      gagBufferRef.current.width = 1024;
      gagBufferRef.current.height = 1024;
    }
    const buf = gagBufferRef.current;
    const bufCtx = buf.getContext("2d");
    if (!bufCtx) return;

    ctx.clearRect(0, 0, 1080, 1920);

    const shotId = activeShot.shotIndex;

    // Check if this shot has a dedicated 2D cartoon visual gag
    let hasGag = false;
    let gagOffsetY = 420; // Default centered vertically on 1080x1920 frame

    if (shotId === 1) {
      // Shot 1: Dedicated direct 1080x1920 draw for exact upper-left gauge (top: 14%, height: 32%)
      // and upper-right speedometer, leaving lower-left character 100% visible!
      drawShot1GaugeAndSpeedo(ctx, frame, shotProgress);
      return;
    } else if (shotId === 3) {
      hasGag = true;
      drawShot3AngryMob(bufCtx, frame, shotProgress);
      gagOffsetY = 580; // Sits at the bottom of the street looking up
    } else if (shotId === 5) {
      hasGag = true;
      drawShot5CalendarAndThermometer(bufCtx, frame, shotProgress);
      gagOffsetY = 300; // Shifted higher by 80px (380 -> 300) so calendar doesn't touch hat!
    } else if (shotId === 12) {
      hasGag = true;
      drawShot12AcidContrast(bufCtx, frame, shotProgress);
      gagOffsetY = 480;
    } else if (shotId === 13) {
      hasGag = true;
      drawShot13ShoePop(bufCtx, frame, shotProgress);
      gagOffsetY = 520;
    } else if (shotId === 14) {
      hasGag = true;
      drawShot14KetchupGag(bufCtx, frame, shotProgress);
      gagOffsetY = 440;
    } else if (shotId === 15) {
      hasGag = true;
      drawShot15PancakeBricks(bufCtx, frame, shotProgress);
      gagOffsetY = 400;
    }

    if (hasGag) {
      // Scale 1024x1024 buffer cleanly to 1080 viewport width
      const scale = 1080 / 1024;
      ctx.save();
      ctx.drawImage(buf, 0, gagOffsetY, 1080, 1024 * scale);
      ctx.restore();
    }
  }, [frame, activeShot, shotProgress]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 10 }}>
      <canvas
        ref={canvasRef}
        width={1080}
        height={1920}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </AbsoluteFill>
  );
};
