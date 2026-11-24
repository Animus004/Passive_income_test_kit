import React from "react";
import {
	AbsoluteFill,
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
} from "remotion";
import { GooglyEyes } from "../../components/GooglyEyes";
import { OddlyBackground } from "../../components/OddlyBackground";
import { tokens, colors } from "../../theme/tokens";

export const Scene10: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	/*** CONSTANTS ***/
	const SCENE_DURATION = 100; // frames 0‑99
	const GROUND_Y = 1180; // drop shadow center Y
	const HERO_START_Y = -300; // start off‑screen top
	const HERO_END_Y = 950; // landing on desk
	const PILLAR_Y = 1000; // pillow Y position
	const ZZZ_Y = 850; // Zzz cloud Y

	/*** HERO FALL ANIMATION ***/
	const heroFall = spring({
		frame,
		fps,
		config: { damping: 12, stiffness: 220 },
	});
	const heroY = interpolate(heroFall, [0, 1], [HERO_START_Y, HERO_END_Y]);

	/*** WORD‑SYNC ANIMATIONS ***/
	// "startup" at frame 1
	const startupActive = frame >= 1;
	const startupScale = spring({
		frame: frame - 1,
		fps,
		config: { damping: 12, stiffness: 220 },
	});
	const startupScaleVal = interpolate(startupScale, [0, 1], [1, 1.4]);

	// "idea" at frame 12
	const ideaActive = frame >= 12;
	const ideaBounce = spring({
		frame: frame - 12,
		fps,
		config: { damping: 12, stiffness: 220 },
	});
	const pillowScale = interpolate(ideaBounce, [0, 1], [1, 1.2]);

	/*** CRASH EFFECT (visual only) ***/
	const crashVisible = frame < 8;
	const crashScale = spring({
		frame,
		fps,
		config: { damping: 12, stiffness: 250 },
	});
	const crashScaleVal = interpolate(crashScale, [0, 1], [0, 1.5]);

	return (
		<AbsoluteFill style={{ backgroundColor: colors.background }}>
			{/* Background */}
			<OddlyBackground />

			{/* Top Badge & Title */}
			<div
				style={{
					position: "absolute",
					top: 120,
					left: "50%",
					transform: "translateX(-50%)",
					padding: "12px 24px",
					backgroundColor: colors.primary,
					color: colors.white,
					fontFamily: tokens.fonts.bold,
					fontSize: 48,
					border: "8px solid #000000",
					borderRadius: 9999,
					boxShadow: "0 10px 0 #000000",
					textTransform: "uppercase",
				}}
			>
				THE CRASH
			</div>
			<div
				style={{
					position: "absolute",
					top: 240,
					left: "50%",
					transform: "translateX(-50%)",
					color: "#000000",
					fontFamily: tokens.fonts.bold,
					fontSize: 72,
					textShadow: "4px 4px #000000",
				}}
			>
				NAPPING MODE
			</div>

			{/* Hero (crash‑landing figure) */}
			<div
				style={{
					position: "absolute",
					left: "50%",
					top: heroY,
					width: 200,
					height: 260,
					backgroundColor: "#FDE047", // Sunny Gold
					borderRadius: 40,
					border: "10px solid #000000",
					boxShadow: "0 12px 0 #000000",
					transform: `translateX(-50%) scale(${startupActive ? startupScaleVal : 1})`,
				}}
			>
				{/* Googly Eyes */}
				<GooglyEyes size={58} spacing={10} glance="center" />
			</div>

			{/* Crash visual effect */}
			{crashVisible && (
				<div
					style={{
						position: "absolute",
						left: "50%",
						top: HERO_END_Y - 100,
						transform: `translateX(-50%) scale(${crashScaleVal})`,
						color: "#F87171", // Sunset Coral
						fontFamily: tokens.fonts.bold,
						fontSize: 96,
						fontWeight: "bold",
						textShadow: "4px 4px #000000",
						userSelect: "none",
					}}
				>
					💥
				</div>
			)}

			{/* Feather Pillow */}
			<div
				style={{
					position: "absolute",
					left: "30%",
					top: PILLAR_Y,
					width: 260,
					height: 140,
					backgroundColor: "#34D399", // Mint
					borderRadius: 70,
					border: "8px solid #000000",
					boxShadow: "0 12px 0 #000000",
					transform: `scale(${ideaActive ? pillowScale : 1})`,
				}}
			>
				{/* Simple feather detail */}
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 260 140"
					style={{ pointerEvents: "none" }}
				>
					<path
						d="M30 70 Q130 20 230 70"
						stroke="#000000"
						strokeWidth="8"
						fill="none"
					/>
					<path
						d="M30 80 Q130 130 230 80"
						stroke="#000000"
						strokeWidth="8"
						fill="none"
					/>
				</svg>
			</div>

			{/* Cartoon Zzz Cloud */}
			<div
				style={{
					position: "absolute",
					left: "70%",
					top: ZZZ_Y,
					width: 180,
					height: 120,
					backgroundColor: "#38BDF8", // Electric Cyan
					borderRadius: 60,
					border: "8px solid #000000",
					boxShadow: "0 12px 0 #000000",
				}}
			>
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%,-50%)",
						fontFamily: tokens.fonts.bold,
						fontSize: 48,
						color: "#FFFFFF",
						letterSpacing: 8,
						userSelect: "none",
					}}
				>
					Zzz
				</div>
			</div>

			{/* Grounding Drop Shadow */}
			<svg
				width={width}
				height={height}
				style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
			>
				<ellipse
					cx={540}
					cy={GROUND_Y}
					rx={220}
					ry={35}
					fill="rgba(0,0,0,0.25)"
				/>
			</svg>

			{/* Narration Caption (safe zone) */}
			<div
				style={{
					position: "absolute",
					left: "50%",
					top: 1500,
					transform: "translateX(-50%)",
					fontFamily: tokens.fonts.bold,
					fontSize: 64,
					color: "#000000",
					textAlign: "center",
					width: "80%",
				}}
			>
				Finally, the crash lands, and you nap like rock.
			</div>
		</AbsoluteFill>
	);
};