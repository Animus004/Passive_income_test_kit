import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";

interface EarthCurvatureRelayProps {
  title?: string;
  subtext?: string;
}

export const EarthCurvatureRelayScene: React.FC<EarthCurvatureRelayProps> = ({
  title = "THE 30-MILE CURVATURE LIMIT",
  subtext = "LINE-OF-SIGHT MICROWAVE RELAY CHAIN",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Tower pop-up animations (staggered)
  const tower1Spring = spring({ frame: frame - 10, fps, config: { damping: 9, stiffness: 220 } });
  const tower2Spring = spring({ frame: frame - 22, fps, config: { damping: 9, stiffness: 220 } });
  const tower3Spring = spring({ frame: frame - 34, fps, config: { damping: 9, stiffness: 220 } });
  const tower4Spring = spring({ frame: frame - 46, fps, config: { damping: 9, stiffness: 220 } });

  const bannerSpring = spring({
    frame: frame - 55,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Deep orbital space backdrop
    const bg = ctx.createRadialGradient(width / 2, height * 0.9, 50, width / 2, height * 0.9, height);
    bg.addColorStop(0, "#0c4a6e");
    bg.addColorStop(0.3, "#082f49");
    bg.addColorStop(0.7, "#030712");
    bg.addColorStop(1, "#02040a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Stars in space
    for (let s = 0; s < 45; s++) {
      const sx = (s * 73 + 19) % width;
      const sy = (s * 41 + 11) % (height * 0.45);
      const sAlpha = Math.sin(frame * 0.1 + s) * 0.3 + 0.6;
      ctx.fillStyle = `rgba(255, 255, 255, ${sAlpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, (s % 3 === 0) ? 2 : 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // =================================================================
    // EARTH'S DRAMATIC PHYSICAL CURVED HORIZON
    // =================================================================
    const earthCenterX = width / 2;
    const earthCenterY = height * 1.55;
    const earthRadius = height * 0.95;

    // Glowing Atmospheric Limb Halo
    ctx.save();
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 40;
    ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(earthCenterX, earthCenterY, earthRadius, Math.PI * 1.22, Math.PI * 1.78);
    ctx.stroke();
    ctx.restore();

    // Solid Earth Body Fill (Dark deep ocean / continent silhouette)
    ctx.fillStyle = "#031926";
    ctx.beginPath();
    ctx.arc(earthCenterX, earthCenterY, earthRadius, Math.PI * 1.2, Math.PI * 1.8);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Earth Curvature Wireframe Grid lines
    ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius - 30 * r, Math.PI * 1.25, Math.PI * 1.75);
      ctx.stroke();
    }

    // =================================================================
    // 4 STEEL MICROWAVE TOWERS ANCHORED ALONG THE CURVE
    // =================================================================
    const towerAngles = [
      Math.PI * 1.34,
      Math.PI * 1.44,
      Math.PI * 1.55,
      Math.PI * 1.66,
    ];
    const towerSprings = [tower1Spring, tower2Spring, tower3Spring, tower4Spring];
    const towerTops: { x: number; y: number }[] = [];

    towerAngles.forEach((ang, idx) => {
      const sp = Math.min(1.0, towerSprings[idx]);
      if (sp <= 0.01) return;

      const baseX = earthCenterX + Math.cos(ang) * earthRadius;
      const baseY = earthCenterY + Math.sin(ang) * earthRadius;
      const fullTowerH = 110;
      const curTowerH = fullTowerH * sp;

      // Top point extends radially outward from Earth center
      const topX = earthCenterX + Math.cos(ang) * (earthRadius + curTowerH);
      const topY = earthCenterY + Math.sin(ang) * (earthRadius + curTowerH);
      towerTops.push({ x: topX, y: topY });

      ctx.save();
      ctx.translate(baseX, baseY);
      ctx.rotate(ang + Math.PI / 2);

      // Steel Tower Mast
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-4, -curTowerH);
      ctx.lineTo(4, -curTowerH);
      ctx.lineTo(12, 0);
      ctx.stroke();

      // Cross braces
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1.5;
      for (let b = 1; b <= 3; b++) {
        const by = (-curTowerH / 4) * b;
        ctx.beginPath();
        ctx.moveTo(-8, by);
        ctx.lineTo(8, by);
        ctx.stroke();
      }

      // Microwave Dish on top
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(0, -curTowerH, 8, 0, Math.PI * 2);
      ctx.fill();

      // Red flashing beacon
      const beaconAlpha = Math.sin(frame * 0.4 + idx) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(239, 68, 68, ${beaconAlpha})`;
      ctx.beginPath();
      ctx.arc(0, -curTowerH - 6, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // =================================================================
    // LASER BEAM RELAY: HOPPING DISH-TO-DISH
    // =================================================================
    if (towerTops.length >= 2) {
      for (let i = 0; i < towerTops.length - 1; i++) {
        const p1 = towerTops[i];
        const p2 = towerTops[i + 1];

        // Draw straight line-of-sight laser beam!
        ctx.save();
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 15;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();

        // 30 MILES Tag above each link
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 24;

        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(midX - 48, midY - 14, 96, 28, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#facc15";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText("30 MILES", midX, midY + 5);
      }
    }

    // =================================================================
    // TOP BANNER
    // =================================================================
    if (bannerSpring > 0.05) {
      ctx.save();
      const bY = 240;
      const bScale = Math.min(1.0, bannerSpring);
      ctx.translate(width / 2, bY);
      ctx.scale(bScale, bScale);

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
      ctx.fillText("ENGINEERING THE EARTH'S CURVE", 0, -32);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 46px system-ui, sans-serif";
      ctx.fillText("SPACED EVERY 30 MILES", 0, 16);

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 18px monospace";
      ctx.fillText("STRAIGHT LINE-OF-SIGHT MICROWAVE CHAIN ACTIVE", 0, 48);
      ctx.restore();
    }
  }, [frame, fps, width, height, tower1Spring, tower2Spring, tower3Spring, tower4Spring, bannerSpring]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </AbsoluteFill>
  );
};
