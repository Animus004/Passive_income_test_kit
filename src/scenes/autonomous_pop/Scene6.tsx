import React from 'react';
import {
	AbsoluteFill,
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
} from 'remotion';
import {
	RoomEnvironment,
	CharacterRig,
	HeroProp,
	StageConnector,
} from '../../components/rigs';

export const Scene6: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Badge punch
	const badgeSpring = spring({
		frame,
		fps,
		config: { damping: 12, stiffness: 220 },
	});

	// Hero prop impact (sword & shield)
	const propSpring = spring({
		frame: Math.max(0, frame - 8),
		fps,
		config: { damping: 14, stiffness: 190 },
	});

	// Character emergence
	const charSpring = spring({
		frame: Math.max(0, frame - 15),
		fps,
		config: { damping: 15, stiffness: 160 },
	});
	const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

	// Hand tug for the puppet strings
	const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

	// Subtle camera zoom
	const cameraZoom = interpolate(frame, [0, 189], [1, 1.05], {
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{ overflow: 'hidden' }}>
			<div
				style={{
					width: '100%',
					height: '100%',
					transform: `scale(${cameraZoom})`,
					transformOrigin: '50% 60%',
				}}
			>
				<RoomEnvironment type="temple_vault">
					{/* Top status badge */}
					<div
						style={{
							position: 'absolute',
							top: 130,
							left: '50%',
							transform: `translateX(-50%) scale(${badgeSpring})`,
							backgroundColor: '#EF4444',
							color: '#FFFFFF',
							border: '8px solid #000000',
							borderRadius: 36,
							padding: '14px 40px',
							fontSize: 32,
							fontWeight: 900,
							boxShadow: '0 10px 0 #000000',
							zIndex: 40,
							display: 'flex',
							alignItems: 'center',
							gap: 14,
							whiteSpace: 'nowrap',
						}}
					>
						<span>🛠️</span>
						<span>CRAFT EXCELLENCE</span>
					</div>

					{/* Hero prop – sword & shield emblem */}
					<HeroProp
						type="sword_shield_emblem"
						x={340}
						y={960}
						scale={1.15}
						shakeIntensity={propSpring}
					/>

					{/* Character – Chanakya pointing proudly */}
					<div
						style={{
							opacity: charSpring,
							transform: `translateY(${charSlide}px)`,
						}}
					>
						<CharacterRig
							era="ancient"
							role="chanakya"
							pose="chanakya_pointing"
							x={760}
							y={940}
							scale={1.15}
							clothColor="#EA580C"
							breathing={true}
							blinking={true}
						/>
					</div>

					{/* Puppet strings connecting Chanakya to the emblem */}
					<StageConnector
						type="puppet_strings"
						fromX={760}
						fromY={640}
						toX={340}
						toY={760}
						tension={1.0}
						tugIntensity={handTug}
						attachCrowns={true}
						crownBob={handTug * 1.5}
						opacity={charSpring}
					/>
				</RoomEnvironment>
			</div>
		</AbsoluteFill>
	);
};