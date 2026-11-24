/**
 * Character2D: Base Procedural 2D-in-3D Character Component for Mr. Omi Cartoon Shorts
 * Location: scripts/claude-animated-shorts/templates/bridge/Character2D.ts
 * 
 * Provides automatic life-loops so characters never look frozen during camera holds:
 * - Idle breathing (scaleY ±1.5% via Math.sin(frame * 0.12))
 * - Gentle head micro-tilts (Math.sin(frame * 0.08) * 0.035 rad)
 * - Automatic 4-frame eye blink every ~95 frames ([0.5, 1.0, 1.0, 0.5])
 * - Procedural pose drives: idle, painting, pointing, panic, talking
 * - Permanent 2.5px solid #000000 inner outline on foreground arms/hands to prevent torso bleed
 */

export * from "../../../../templates/bridge/Character2D";
