import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface CableSnapSceneProps {
  title?: string;
  metricLabel?: string;
}

export const CableSnapScene: React.FC<CableSnapSceneProps> = ({
  title = "THE 3 MILLISECOND SACRIFICE",
  metricLabel = "SYSTEM LATENCY",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Snapping triggers around frame 30
  const isSnapped = frame >= 30;
  const snapProgress = interpolate(frame, [30, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stampSpring = spring({
    frame: frame - 32,
    fps,
    config: { damping: 9, stiffness: 280, mass: 0.7 },
  });

  const latencyVal = interpolate(frame, [25, 60], [14.2, 11.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }).toFixed(1);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Dark moody ocean floor / trading mainframe gradient
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#020617");
    bg.addColorStop(0.45, "#081329");
    bg.addColorStop(1, "#010409");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // =================================================================
    // TOP HALF: DIGITAL LATENCY TACHOMETER GAUGE
    // =================================================================
    const gaugeX = width / 2;
    const gaugeY = 380;
    const radius = 170;

    // Outer Gauge Arc Track
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 22;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, radius, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();

    // Active Colored Latency Arc (Reduces as latency drops!)
    const startAngle = Math.PI * 0.8;
    const endAngle = Math.PI * 2.2;
    const needleProgress = interpolate(Number(latencyVal), [11.2, 14.2], [0.35, 0.95], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const currentAngle = startAngle + (endAngle - startAngle) * needleProgress;

    const arcGrad = ctx.createLinearGradient(gaugeX - radius, 0, gaugeX + radius, 0);
    arcGrad.addColorStop(0, "#10b981");
    arcGrad.addColorStop(0.6, "#f59e0b");
    arcGrad.addColorStop(1, "#ef4444");

    ctx.strokeStyle = arcGrad;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, radius, startAngle, currentAngle);
    ctx.stroke();

    // Digital Number Readout in Center
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 76px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${latencyVal} ms`, gaugeX, gaugeY + 20);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillText("ONE-WAY TRADING LATENCY", gaugeX, gaugeY + 65);

    // =================================================================
    // BOTTOM HALF: TRANSATLANTIC SUBSEA CABLE CUTAWAY
    // =================================================================
    const seaY = 820;

    // Ocean trench label
    ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.fillText("── TRANSATLANTIC SUBSEA FIBER OPTIC CONDUIT (5,000 KM) ──", width / 2, seaY - 80);

    const cableW = 860;
    const cableH = 50;
    const leftX = width / 2 - cableW / 2;
    const gap = isSnapped ? snapProgress * 120 : 0;
    const segmentW = (cableW - gap) / 2;

    // Left Cable Half
    ctx.fillStyle = isSnapped ? "#475569" : "#0284c7";
    ctx.strokeStyle = isSnapped ? "#64748b" : "#38bdf8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(leftX, seaY, segmentW, cableH, 12);
    ctx.fill();
    ctx.stroke();

    // Right Cable Half
    ctx.beginPath();
    ctx.roundRect(leftX + segmentW + gap, seaY, segmentW, cableH, 12);
    ctx.fill();
    ctx.stroke();

    // Spark Particles if Snapped!
    if (isSnapped) {
      const snapCenter = leftX + segmentW + gap / 2;
      for (let s = 0; s < 18; s++) {
        const seed = s * 73 + frame * 13;
        const sparkDist = (Math.sin(seed) * 0.5 + 0.5) * (40 + snapProgress * 60);
        const sparkAngle = (s / 18) * Math.PI * 2;
        const sx = snapCenter + Math.cos(sparkAngle) * sparkDist;
        const sy = seaY + cableH / 2 + Math.sin(sparkAngle) * sparkDist;
        const sparkSize = (s % 3 === 0) ? 5 : 3;

        ctx.fillStyle = (s % 2 === 0) ? "#facc15" : "#ffffff";
        ctx.beginPath();
        ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Severed Cable Core Sparks Warning
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftX + segmentW, seaY + 10);
      ctx.lineTo(leftX + segmentW + 20, seaY + cableH / 2);
      ctx.lineTo(leftX + segmentW, seaY + cableH - 10);
      ctx.stroke();
    }

    // =================================================================
    // GIANT "ABANDONED" STAMP SLAMS OVER THE OCEAN CABLE
    // =================================================================
    if (stampSpring > 0.05) {
      ctx.save();
      const sScale = Math.min(1.0, stampSpring);
      ctx.translate(width / 2, seaY + 25);
      ctx.rotate(-0.06);
      ctx.scale(sScale, sScale);

      // Stamp Background
      ctx.fillStyle = "rgba(185, 28, 28, 0.95)";
      ctx.strokeStyle = "#fca5a5";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(-300, -50, 600, 100, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 52px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚡ ABANDONED ⚡", 0, 18);
      ctx.restore();
    }

    // =================================================================
    // BOTTOM BANNER: THE 3.0 MS VICTORY
    // =================================================================
    if (frame >= 35) {
      const bannerY = 1080;
      const bannerPop = spring({ frame: frame - 38, fps, config: { damping: 10, stiffness: 200 } });
      const bScale = Math.min(1, bannerPop);

      ctx.save();
      ctx.translate(width / 2, bannerY);
      ctx.scale(bScale, bScale);

      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-420, -75, 840, 150, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.font = "900 48px monospace";
      ctx.textAlign = "center";
      ctx.fillText("-3.0 MILLISECONDS SHAVED", 0, -10);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px system-ui, sans-serif";
      ctx.fillText("HIGH-FREQUENCY MICROWAVE WINS THE RACE", 0, 36);
      ctx.restore();
    }
  }, [frame, fps, width, height, isSnapped, snapProgress, stampSpring, latencyVal]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </AbsoluteFill>
  );
};
