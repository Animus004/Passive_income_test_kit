import fs from 'fs';
import readline from 'readline';

async function main() {
  const fileStream = fs.createReadStream('C:/Users/sayan/.gemini/antigravity/brain/f6352432-fa3c-4b63-acbf-21e7ecd31607/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('"step_index":32625')) {
      const obj = JSON.parse(line);
      fs.writeFileSync('scripts/board_full.md', obj.content);
      console.log('Saved board_full.md from transcript_full');
      break;
    }
  }
}
main();
