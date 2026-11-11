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

console.log('✅ SFX Library ready in public/sfx/:');
console.log('  - thud.mp3  (Deep sub-bass hook reveal)');
console.log('  - whoosh.mp3 (Card slide-in sweep)');
console.log('  - blip.mp3  (Telemetry & counter tick)');
console.log('  - pop.mp3   (Snappy kinetic alert)');

