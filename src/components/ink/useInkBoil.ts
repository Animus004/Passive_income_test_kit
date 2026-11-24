import { useCurrentFrame } from "remotion";

export interface InkBoilOffset {
  dx: number;
  dy: number;
  x: number;
  y: number;
  angle: number;
  seed: number;
  jitter: (val: number, intensity?: number) => number;
}

export const useInkBoil = (intervalFrames: number = 3): InkBoilOffset => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / intervalFrames);

  // 3-frame cyclical pseudo-random boil tables
  const xOffsets = [0, 0.75, -0.65, 0.45];
  const yOffsets = [0, -0.6, 0.7, -0.5];
  const angleOffsets = [0, 0.08, -0.07, 0.05];
  const seeds = [101, 203, 307, 409];

  const idx = step % xOffsets.length;
  const dx = xOffsets[idx];
  const dy = yOffsets[idx];
  const angle = angleOffsets[idx];
  const seed = seeds[idx];

  const jitter = (val: number, intensity: number = 1.0): number => {
    const microOffsets = [-0.6, 0.8, -0.4, 0.7];
    const micro = microOffsets[(step + Math.floor(val * 10)) % microOffsets.length];
    return val + micro * intensity;
  };

  return { dx, dy, x: dx, y: dy, angle, seed, jitter };
};
