import { mkdir, writeFile } from 'node:fs/promises';
import { NARRATION } from '../narration.js';
import { spokenMath } from '../audio.js';

const escapeXml = text => text.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const separator = '<break time="0.65s"/>';
const batches = [];
let batch = [];
for (const entry of NARRATION) {
  const line = { ...entry, spoken: spokenMath(entry.text) };
  const ssml = entries => `<speak>${entries.map(e => escapeXml(e.spoken)).join(separator)}</speak>`;
  if (batch.length && ssml([...batch, line]).length > 4300) { batches.push({ entries: batch, ssml: ssml(batch) }); batch = []; }
  batch.push(line);
}
if (batch.length) batches.push({ entries: batch, ssml: `<speak>${batch.map(e => escapeXml(e.spoken)).join(separator)}</speak>` });
await mkdir('output/audio/batches', { recursive: true });
await writeFile('output/audio/batches/requests.json', JSON.stringify(batches, null, 2));
console.log(`${NARRATION.length} recordings in ${batches.length} batches. No network calls or credentials are used by this preparation script.`);
