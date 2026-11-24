import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SFX_DIR = path.join(PROJECT_ROOT, 'public', 'sfx');
fs.mkdirSync(SFX_DIR, { recursive: true });

console.log('🔊 Generating Cinema-Grade Engineering SFX Suite...');

// 1. Train High-Speed Track Rumble (Stereo, 60s loopable background bed)
const rumblePath = path.join(SFX_DIR, 'train_track_rumble.wav');
execSync(`ffmpeg -y -f lavfi -i "anoisesrc=d=60:c=pink:r=44100" -af "lowpass=f=320,highpass=f=35,tremolo=f=4.2:d=0.4,volume=0.32" "${rumblePath}"`, { stdio: 'ignore' });
console.log('   • Created train_track_rumble.wav');

// 2. LZB Inductive Telemetry Pulse / High-Tech Chime
const telemetryPath = path.join(SFX_DIR, 'lzb_telemetry_pulse.wav');
execSync(`ffmpeg -y -f lavfi -i "sine=frequency=1650:duration=0.8" -f lavfi -i "sine=frequency=2480:duration=0.5" -filter_complex "[0:a]afade=t=in:st=0:d=0.03,afade=t=out:st=0.08:d=0.7[a0];[1:a]afade=t=in:st=0:d=0.02,afade=t=out:st=0.06:d=0.44,volume=0.6[a1];[a0][a1]amix=inputs=2:normalize=0,volume=1.2" "${telemetryPath}"`, { stdio: 'ignore' });
console.log('   • Created lzb_telemetry_pulse.wav');

// 3. Pneumatic Track Brake Drop & Heavy Metal Clamp Slam
const clampPath = path.join(SFX_DIR, 'brake_pneumatic_clamp.wav');
// Layer 0: High pressure pneumatic hiss burst (0.25s)
// Layer 1: Heavy metallic clamp thud (0.35s)
execSync(`ffmpeg -y -f lavfi -i "anoisesrc=d=0.35:c=white:r=44100" -f lavfi -i "sine=frequency=85:duration=0.5" -filter_complex "[0:a]bandpass=f=3800:w=1400,afade=t=in:st=0:d=0.01,afade=t=out:st=0.06:d=0.28,volume=1.8[hiss];[1:a]afade=t=out:st=0.04:d=0.45,volume=2.8[thud];[hiss][thud]amix=inputs=2:normalize=0" "${clampPath}"`, { stdio: 'ignore' });
console.log('   • Created brake_pneumatic_clamp.wav');

// 4. Rail Friction Screech & Sparks Sizzle (4.5s)
const screechPath = path.join(SFX_DIR, 'rail_friction_screech.wav');
// Layer 0: High frequency harmonic friction resonance (3100Hz vibrato)
// Layer 1: Emissive spark crackle / white noise shimmer
execSync(`ffmpeg -y -f lavfi -i "sine=frequency=2950:duration=4.2" -f lavfi -i "anoisesrc=d=4.2:c=white:r=44100" -filter_complex "[0:a]tremolo=f=16:d=0.65,afade=t=in:st=0:d=0.35,afade=t=out:st=3.2:d=0.95,volume=0.45[screech];[1:a]bandpass=f=5200:w=2200,flanger=delay=2:depth=3:regen=50:width=90:speed=3.0,afade=t=in:st=0:d=0.2,afade=t=out:st=3.4:d=0.8,volume=0.55[sparks];[screech][sparks]amix=inputs=2:normalize=0" "${screechPath}"`, { stdio: 'ignore' });
console.log('   • Created rail_friction_screech.wav');

// 5. Final Pneumatic Bleed & Dead Halt Release
const airReleasePath = path.join(SFX_DIR, 'brake_air_release.wav');
execSync(`ffmpeg -y -f lavfi -i "anoisesrc=d=1.8:c=white:r=44100" -af "lowpass=f=4200,highpass=f=600,afade=t=in:st=0:d=0.04,afade=t=out:st=0.1:d=1.65,volume=0.8" "${airReleasePath}"`, { stdio: 'ignore' });
console.log('   • Created brake_air_release.wav');

console.log('✅ All 5 Cinema-Grade Engineering SFX successfully generated in public/sfx/!');
