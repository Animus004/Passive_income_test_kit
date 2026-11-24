import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface FiberVsAirSceneProps {
  title?: string;
  subtext?: string;
}

export const FiberVsAirScene: React.FC<FiberVsAirSceneProps> = ({
  title = "THE TRANSMISSION SPEED SHOWDOWN",
  subtext = "LIGHT SPEED IN VACUUM/AIR VS. SOLID GLASS",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bannerSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 10, stiffness: 220 },
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Dark high-tech laboratory backdrop
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#030712");
    bgGrad.addColorStop(0.5, "#091224");
    bgGrad.addColorStop(1, "#020617");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Ambient grid lines
    ctx.strokeStyle = "rgba(56, 189, 248, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 60; x < width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 180);
      ctx.lineTo(x, height - 350);
      ctx.stroke();
    }
    for (let y = 200; y < height - 350; y += 80) {
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(width - 60, y);
      ctx.stroke();
    }

    // Top Header Badge
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 280, 210, 560, 64, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "900 22px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚡ SPEED OF LIGHT COMPARISON ⚡", width / 2, 250);
    ctx.restore();

    // =================================================================
    // TRACK 1: OPEN AIR MICROWAVE (TOP TRACK)
    // =================================================================
    const track1Y = 460;
    const trackW = width - 160;
    const trackX = 80;

    // Track 1 Container
    ctx.fillStyle = "rgba(14, 165, 233, 0.08)";
    ctx.strokeStyle = "rgba(14, 165, 233, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(trackX, track1Y - 110, trackW, 200, 20);
    ctx.fill();
    ctx.stroke();

    // Track 1 Header
    ctx.fillStyle = "#38bdf8";
    ctx.font = "900 24px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("📡 OPEN AIR (MICROWAVE RELAY)", trackX + 30, track1Y - 60);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "right";
    ctx.fillText("300,000 KM/S (100% C)", trackX + trackW - 30, track1Y - 60);

    // Air beam guide line
    ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(trackX + 30, track1Y + 20);
    ctx.lineTo(trackX + trackW - 30, track1Y + 20);
    ctx.stroke();

    // Air Light Pulse (Fast: moves across track in 35 frames)
    const airProgress = interpolate(frame, [10, 48], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const airPulseX = trackX + 30 + (trackW - 60) * airProgress;

    // Glowing Laser Beam Trail
    const airGrad = ctx.createLinearGradient(airPulseX - 180, 0, airPulseX, 0);
    airGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
    airGrad.addColorStop(1, "rgba(56, 189, 248, 1)");
    ctx.strokeStyle = airGrad;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(Math.max(trackX + 30, airPulseX - 180), track1Y + 20);
    ctx.lineTo(airPulseX, track1Y + 20);
    ctx.stroke();

    // Air Core Photon Head
    ctx.save();
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 25;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(airPulseX, track1Y + 20, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Finish Goal Gate for Air
    if (airProgress >= 1) {
      ctx.fillStyle = "#10b981";
      ctx.font = "900 16px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("✓ ARRIVED FIRST", trackX + trackW - 30, track1Y + 60);
    }

    // =================================================================
    // TRACK 2: UNDERGROUND FIBER OPTIC (BOTTOM TRACK)
    // =================================================================
    const track2Y = 780;

    // Track 2 Container
    ctx.fillStyle = "rgba(239, 68, 68, 0.06)";
    ctx.strokeStyle = "rgba(239, 68, 68, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(trackX, track2Y - 110, trackW, 220, 20);
    ctx.fill();
    ctx.stroke();

    // Track 2 Header
    ctx.fillStyle = "#f87171";
    ctx.font = "900 24px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("🧪 SOLID GLASS FIBER OPTIC CABLE", trackX + 30, track2Y - 60);

    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "right";
    ctx.fillText("200,000 KM/S (-30% SPEED)", trackX + trackW - 30, track2Y - 60);

    // Glass Cable Tube Cylinder
    const tubeH = 48;
    const tubeY = track2Y - 2;
    ctx.fillStyle = "rgba(148, 163, 184, 0.12)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(trackX + 30, tubeY, trackW - 60, tubeH, 12);
    ctx.fill();
    ctx.stroke();

    // Internal Core Line
    ctx.strokeStyle = "rgba(239, 68, 68, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(trackX + 30, tubeY + 12, trackW - 60, tubeH - 24);

    // Fiber Light Pulse (Sluggish: 30% slower, takes 68 frames)
    const fiberProgress = interpolate(frame, [10, 68], [0, 0.72], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const fiberPulseX = trackX + 30 + (trackW - 60) * fiberProgress;

    // Total internal reflection zigzag line simulation inside the glass!
    const bounceCount = 14;
    const bounceW = (trackW - 60) / bounceCount;
    const currentBounces = Math.floor(fiberProgress * bounceCount);

    ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(trackX + 30, tubeY + tubeH / 2);

    for (let b = 0; b <= currentBounces; b++) {
      const bx = trackX + 30 + b * bounceW;
      const by = b % 2 === 0 ? tubeY + 8 : tubeY + tubeH - 8;
      if (bx <= fiberPulseX) {
        ctx.lineTo(bx, by);
      }
    }
    ctx.stroke();

    // Fiber Photon Head (Lagging)
    ctx.save();
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#ffedd5";
    const headBounceY = Math.sin(frame * 0.45) * (tubeH / 2 - 8) + (tubeY + tubeH / 2);
    ctx.beginPath();
    ctx.arc(fiberPulseX, headBounceY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Fiber Drag Status
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "left";
    ctx.fillText("⚠️ REFRACTION DRAG (n = 1.468): LIGHT SLOWED DOWN BY 30%", trackX + 30, track2Y + 75);

    // =================================================================
    // BOTTOM PUNCHLINE CALLOUT BANNER (Spring entry)
    // =================================================================
    if (bannerSpring > 0.05) {
      ctx.save();
      const bY = 1100;
      const bScale = Math.min(1, bannerSpring);
      ctx.translate(width / 2, bY);
      ctx.scale(bScale, bScale);

      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-420, -75, 840, 150, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 32px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("WHY WALL STREET ABANDONED FIBER", 0, -25);

      ctx.fillStyle = "#facc15";
      ctx.font = "900 38px monospace";
      ctx.fillText("-30% SPEED PENALTY IN GLASS", 0, 22);

      ctx.fillStyle = "rgba(224, 242, 254, 0.85)";
      ctx.font = "600 18px monospace";
      ctx.fillText("AIR TRANSMISSION WINS EVERY SINGLE TRADE", 0, 52);
      ctx.restore();
    }
  }, [frame, fps, width, height, bannerSpring]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </AbsoluteFill>
  );
};
