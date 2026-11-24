import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface PovDoodleSceneProps {
  stampText?: string;
  subtext?: string;
  topic?: string;
}

export const PovDoodleScene: React.FC<PovDoodleSceneProps> = ({
  stampText = "SYSTEM ONLINE",
  subtext = "TACTICAL OVERVIEW",
  topic = "",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fullContext = `${topic} ${subtext} ${stampText}`.toLowerCase();
  const isFinanceOrSpeed = /stock|wall street|trade|market|finance|dollar|bank|price|latency|microsecond|nasdaq|crypto|tower|relay|order|speed|buy|phone/i.test(fullContext);

  // Transition from phone to countryside tower happens around frame 160
  const isTowerPhase = isFinanceOrSpeed && frame >= 150;
  const towerProgress = interpolate(frame, [150, 195], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const towerStampSpring = spring({
    frame: frame - 185,
    fps,
    config: { damping: 9, stiffness: 240, mass: 0.7 },
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // =================================================================
    // STAGE 1: SMARTPHONE STOCK TRADE (Frames 0 to ~160)
    // =================================================================
    if (!isTowerPhase || towerProgress < 1.0) {
      ctx.save();
      const phoneOpacity = 1.0 - towerProgress;
      ctx.globalAlpha = phoneOpacity;

      // Phone Center
      const phoneCenterX = width / 2;
      const phoneCenterY = height * 0.44;
      ctx.translate(phoneCenterX, phoneCenterY);

      const phoneW = 340;
      const phoneH = 540;
      const px = -phoneW / 2;
      const py = -phoneH / 2;

      // Outer Phone Body
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(px - 6, py - 6, phoneW + 12, phoneH + 12, 38);
      ctx.fill();
      ctx.stroke();

      // OLED Screen
      ctx.fillStyle = "#030712";
      ctx.beginPath();
      ctx.roundRect(px, py, phoneW, phoneH, 32);
      ctx.fill();

      // Notch
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.roundRect(-45, py + 12, 90, 24, 12);
      ctx.fill();

      // Status Bar
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("9:41", px + 28, py + 28);
      ctx.textAlign = "right";
      ctx.fillText("5G  100%", px + phoneW - 28, py + 28);

      // Trading Header
      ctx.fillStyle = "#38bdf8";
      ctx.font = "900 15px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("WALL STREET MOBILE TRADER", 0, py + 68);

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 24px monospace";
      ctx.fillText("NVDA  $142.50 ▲ +4.2%", 0, py + 102);

      // Candlestick Chart Area
      const chartX = px + 24;
      const chartY = py + 125;
      const chartW = phoneW - 48;
      const chartH = 150;

      ctx.strokeStyle = "rgba(56, 189, 248, 0.1)";
      ctx.lineWidth = 1;
      for (let g = 0; g <= 3; g++) {
        const gy = chartY + (chartH / 3) * g;
        ctx.beginPath();
        ctx.moveTo(chartX, gy);
        ctx.lineTo(chartX + chartW, gy);
        ctx.stroke();
      }

      const candleCount = 12;
      const candleW = chartW / candleCount;
      const candleData = [
        { open: 120, close: 132, up: true },
        { open: 132, close: 127, up: false },
        { open: 127, close: 140, up: true },
        { open: 140, close: 136, up: false },
        { open: 136, close: 155, up: true },
        { open: 155, close: 150, up: false },
        { open: 150, close: 168, up: true },
        { open: 168, close: 182, up: true },
        { open: 182, close: 176, up: false },
        { open: 176, close: 198, up: true },
        { open: 198, close: 215, up: true },
        { open: 215, close: 235, up: true },
      ];

      for (let i = 0; i < candleCount; i++) {
        const c = candleData[i];
        const cx = chartX + i * candleW + candleW / 2;
        const color = c.up ? "#10b981" : "#ef4444";
        const bodyTop = chartY + chartH - (Math.max(c.open, c.close) - 100) * 0.9;
        const bodyH = Math.max(6, Math.abs(c.close - c.open) * 0.9);

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, bodyTop - 6);
        ctx.lineTo(cx, bodyTop + bodyH + 6);
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        ctx.fillRect(cx - candleW * 0.35, bodyTop, candleW * 0.7, bodyH);
      }

      // ===============================================================
      // BIG GREEN "BUY 100 SHARES" BUTTON WITH TAP ANIMATION
      // ===============================================================
      const btnY = chartY + chartH + 28;
      const isTapped = frame >= 38;
      const tapPulse = isTapped ? Math.sin((frame - 38) * 0.4) * 4 : 0;

      // Ripple wave when tapped!
      if (isTapped && frame <= 85) {
        const rippleR = (frame - 38) * 5;
        const rippleAlpha = Math.max(0, 1 - (frame - 38) / 45);
        ctx.strokeStyle = `rgba(16, 185, 129, ${rippleAlpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, btnY + 28, rippleR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Button Body
      ctx.fillStyle = isTapped ? "#059669" : "#10b981";
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(px + 20, btnY, phoneW - 40, 56, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(isTapped ? "✓ ORDER EXECUTING..." : "⚡ BUY 100 SHARES", 0, btnY + 35 + tapPulse);

      // Order Status Telemetry Card below Button
      const statusY = btnY + 74;
      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.strokeStyle = isTapped ? "#10b981" : "rgba(56, 189, 248, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(px + 20, statusY, phoneW - 40, 68, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isTapped ? "#10b981" : "#38bdf8";
      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.fillText(isTapped ? "ROUTING TO WALL STREET SPEEDWAY" : "READY TO TRANSMIT", 0, statusY + 28);

      ctx.fillStyle = "#facc15";
      ctx.font = "bold 15px monospace";
      ctx.fillText(isTapped ? "LATENCY: 0.000 ms ➔ MICROWAVE" : "NETWORK: 5G WIRELESS", 0, statusY + 52);

      // First-Person POV Hand Thumbs at bottom!
      ctx.fillStyle = "#d97706";
      ctx.beginPath();
      // Right Thumb
      ctx.ellipse(px + phoneW - 10, py + phoneH - 50, 45, 80, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      // Left Thumb
      ctx.ellipse(px + 10, py + phoneH - 50, 45, 80, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // =================================================================
    // STAGE 2: MASSIVE COUNTRYSIDE MICROWAVE TOWER REVEAL (Frames 150+)
    // =================================================================
    if (isTowerPhase) {
      ctx.save();
      ctx.globalAlpha = towerProgress;

      // Atmospheric Countryside Sky (Twilight dusk gradient)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#091226");
      skyGrad.addColorStop(0.4, "#172554");
      skyGrad.addColorStop(0.7, "#1e3a8a");
      skyGrad.addColorStop(0.85, "#3b0764");
      skyGrad.addColorStop(1, "#020617");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Rolling Countryside Green Hills in distance
      ctx.fillStyle = "#064e3b";
      ctx.beginPath();
      ctx.moveTo(0, height - 260);
      ctx.bezierCurveTo(width * 0.3, height - 320, width * 0.6, height - 240, width, height - 290);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fill();

      // Foreground Dark Grass Hill
      ctx.fillStyle = "#022c22";
      ctx.beginPath();
      ctx.moveTo(0, height - 190);
      ctx.bezierCurveTo(width * 0.4, height - 160, width * 0.7, height - 220, width, height - 170);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fill();

      // ===============================================================
      // 300-FOOT INDUSTRIAL STEEL LATTICE MICROWAVE TOWER
      // ===============================================================
      const towerBaseX = width / 2;
      const towerBaseY = height - 180;
      const towerH = 680;
      const towerTopY = towerBaseY - towerH;
      const baseW = 180;
      const topW = 34;

      // Steel Main Legs
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(towerBaseX - baseW / 2, towerBaseY);
      ctx.lineTo(towerBaseX - topW / 2, towerTopY);
      ctx.lineTo(towerBaseX + topW / 2, towerTopY);
      ctx.lineTo(towerBaseX + baseW / 2, towerBaseY);
      ctx.stroke();

      // Lattice Cross Braces
      const braceCount = 10;
      for (let b = 0; b < braceCount; b++) {
        const t1 = b / braceCount;
        const t2 = (b + 1) / braceCount;
        const y1 = towerBaseY - t1 * towerH;
        const y2 = towerBaseY - t2 * towerH;
        const w1 = baseW - t1 * (baseW - topW);
        const w2 = baseW - t2 * (baseW - topW);

        // Horizontal brace
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(towerBaseX - w1 / 2, y1);
        ctx.lineTo(towerBaseX + w1 / 2, y1);
        ctx.stroke();

        // X-cross brace
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(towerBaseX - w1 / 2, y1);
        ctx.lineTo(towerBaseX + w2 / 2, y2);
        ctx.moveTo(towerBaseX + w1 / 2, y1);
        ctx.lineTo(towerBaseX - w2 / 2, y2);
        ctx.stroke();
      }

      // Microwave Drum Dish Antennas (facing left and right)
      const dishY1 = towerTopY + 70;
      const dishY2 = towerTopY + 160;

      // Left Dish
      ctx.fillStyle = "#cbd5e1";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(towerBaseX - 35, dishY1, 26, 40, -Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right Dish (Main firing dish)
      ctx.beginPath();
      ctx.ellipse(towerBaseX + 35, dishY2, 26, 40, Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Concentric Microwave Radio Waves shooting from the dish!
      for (let w = 0; w < 3; w++) {
        const waveR = ((frame * 3 + w * 45) % 150) + 20;
        const waveAlpha = Math.max(0, 1 - waveR / 170);
        ctx.strokeStyle = `rgba(56, 189, 248, ${waveAlpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(towerBaseX + 45, dishY2, waveR, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
      }

      // Pulsing Red Aviation Warning Beacon on Tower Top
      const beaconPulse = Math.sin(frame * 0.3) * 0.5 + 0.5;
      ctx.save();
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 30 * beaconPulse;
      ctx.fillStyle = `rgba(239, 68, 68, ${0.5 + 0.5 * beaconPulse})`;
      ctx.beginPath();
      ctx.arc(towerBaseX, towerTopY - 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ===============================================================
      // MASSIVE "$300M+ INFRASTRUCTURE" HUD STAMP
      // ===============================================================
      if (towerStampSpring > 0.05) {
        ctx.save();
        const sY = 280;
        const sScale = Math.min(1.0, towerStampSpring);
        ctx.translate(width / 2, sY);
        ctx.scale(sScale, sScale);

        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-420, -75, 840, 150, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "center";
        ctx.fillText("WALL STREET SPEEDWAY • RURAL MICROWAVE TOWER", 0, -32);

        ctx.fillStyle = "#10b981";
        ctx.font = "900 52px system-ui, sans-serif";
        ctx.fillText("$300,000,000+ SPENT", 0, 18);

        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 18px system-ui, sans-serif";
        ctx.fillText("BUILT STRAIGHT ACROSS OPEN COUNTRYSIDE FARMLAND", 0, 48);
        ctx.restore();
      }

      ctx.restore();
    }
  }, [frame, fps, width, height, isTowerPhase, towerProgress, towerStampSpring, isFinanceOrSpeed]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </AbsoluteFill>
  );
};
