const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sfxDir = path.resolve(__dirname, '..', 'public', 'sfx');
if (!fs.existsSync(sfxDir)) {
  fs.mkdirSync(sfxDir, { recursive: true });
}

console.log('Generating programmatic SFX library...');

// 1. Bass Thud (Hook reveal)
execSync('ffmpeg -y -f lavfi -i "sine=frequency=75:duration=0.6" -af "afade=t=out:st=0.08:d=0.52,volume=2.2" "' + path.join(sfxDir, 'thud.mp3') + '"', { stdio: 'ignore' });

// 2. Whoosh (Card transition sweep)
execSync('ffmpeg -y -f lavfi -i "anoisesrc=d=0.35:c=pink:r=44100" -af "afade=t=in:st=0:d=0.12,afade=t=out:st=0.12:d=0.23,lowpass=f=1400,volume=1.8" "' + path.join(sfxDir, 'whoosh.mp3') + '"', { stdio: 'ignore' });

// 3. UI Blip / Counter tick
execSync('ffmpeg -y -f lavfi -i "sine=frequency=1400:duration=0.08" -af "afade=t=out:st=0.01:d=0.07,volume=0.9" "' + path.join(sfxDir, 'blip.mp3') + '"', { stdio: 'ignore' });

// 4. Pop (Snappy card entrance)
execSync('ffmpeg -y -f lavfi -i "sine=frequency=420:duration=0.12" -af "afade=t=out:st=0.02:d=0.1,volume=2.0" "' + path.join(sfxDir, 'pop.mp3') + '"', { stdio: 'ignore' });

// 5. Submarine Sonar Ping (Ocean/Depth topics)
execSync('ffmpeg -y -f lavfi -i "sine=frequency=1850:duration=1.2" -af "afade=t=out:st=0.04:d=1.16,volume=1.4" "' + path.join(sfxDir, 'sonar.mp3') + '"', { stdio: 'ignore' });

// 6. Laser Pitch Drop (Cyber/Space speed transitions)
execSync('ffmpeg -y -f lavfi -i "sine=frequency=2200:duration=0.3" -af "asetrate=44100*0.5,aresample=44100,afade=t=out:st=0.05:d=0.25,volume=1.6" "' + path.join(sfxDir, 'laser.mp3') + '"', { stdio: 'ignore' });

// 7. Digital Glitch / Noise Stutter (Danger and technical cuts)
execSync('ffmpeg -y -f lavfi -i "anoisesrc=d=0.25:c=white:r=44100" -af "tremolo=f=40:d=0.9,afade=t=out:st=0.08:d=0.17,volume=1.5" "' + path.join(sfxDir, 'glitch.mp3') + '"', { stdio: 'ignore' });

// 8. Warning Alarm Horn / Alert Buzzer (Scene 4 Hazards)
execSync('ffmpeg -y -f lavfi -i "sine=frequency=880:duration=0.4" -af "tremolo=f=12:d=0.8,afade=t=out:st=0.1:d=0.3,volume=1.5" "' + path.join(sfxDir, 'alarm.mp3') + '"', { stdio: 'ignore' });

// 9. Ultra Heavy Sub-Bass Boom (Impact drops)
execSync('ffmpeg -y -f lavfi -i "sine=frequency=50:duration=0.9" -af "afade=t=out:st=0.1:d=0.8,volume=2.6" "' + path.join(sfxDir, 'sub_boom.mp3') + '"', { stdio: 'ignore' });

// 10. Camera Shutter Snap (Instant snap-cuts)
execSync('ffmpeg -y -f lavfi -i "anoisesrc=d=0.12:c=pink:r=44100" -af "highpass=f=2000,afade=t=out:st=0.02:d=0.1,volume=2.2" "' + path.join(sfxDir, 'camera_snap.mp3') + '"', { stdio: 'ignore' });

console.log('✅ Extended SFX Library ready in public/sfx/:');
console.log('  - sonar.mp3       (Deep-sea / telemetry ping)');
console.log('  - laser.mp3       (High-speed laser whoosh)');
console.log('  - glitch.mp3      (Digital stutter / wipe)');
console.log('  - alarm.mp3       (Hazard alert siren)');
console.log('  - sub_boom.mp3    (Massive bass impact)');
console.log('  - camera_snap.mp3 (Mechanical snap-cut click)');

