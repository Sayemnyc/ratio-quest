import { mkdir, copyFile, cp, access } from 'node:fs/promises';
import { NARRATION } from '../narration.js';
import { NARRATION_AUDIO } from '../assets/narration/manifest.js';
if (Object.keys(NARRATION_AUDIO).length !== NARRATION.length) throw new Error('Narration recording set is incomplete');
for (const line of NARRATION) {
  const clip = NARRATION_AUDIO[line.id];
  if (!clip || clip.text !== line.text) throw new Error(`Missing or stale narration: ${line.id}`);
  await access(clip.src);
}
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'style.css', 'app.js', 'audio.js', 'bank.js', 'state.js', 'story.js', 'narration.js', 'icon.svg']) await copyFile(file, `dist/${file}`);
await cp('assets', 'dist/assets', { recursive: true });
console.log('Static app built in dist/');
