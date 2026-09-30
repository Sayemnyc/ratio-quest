import { BANK } from './bank.js';
import { FRAME, scenes, chapters } from './story.js';

// Shared by the app and recording script so every line has a stable identity.
export const NARRATION = [{
  id: 'intro',
  text: `Welcome to Ratio Quest. The Great Book Bake! ${FRAME} Choose Start quest when you’re ready.`
}];

for (const [index, question] of BANK.entries()) {
  const scene = scenes[index];
  const lines = {
    story: `${scene[1]}. ${question.story}`,
    question: `${question.question} Here are your choices. ${question.options.map((option, i) => `Option ${'ABCD'[i]}: ${option}`).join('. ')}.`,
    hint: question.hint,
    success: `Nice move, crew! ${question.answer}. ${scene[4]}`,
    retry: `Plot twist! ${scene[3]} ${question.hint} Try another move.`
  };
  for (const [kind, text] of Object.entries(lines)) NARRATION.push({ id: `${question.id}-${kind}`, text });
}

for (const tier of [1, 2]) {
  const start = `${chapters[tier - 1].badge}! Eight decisions. Eight steps closer to new books.`;
  NARRATION.push({ id: `badge-${tier}-open`, text: `${start} ${chapters[tier].place} is unlocked. Your crew is ready for the next stop.` });
  NARRATION.push({ id: `badge-${tier}-retry`, text: `${start} Your badge is yours! Replay this tier and get seven of eight first answers right to unlock the next island.` });
}
NARRATION.push({ id: 'badge-3', text: 'Master of Ratios! Eight decisions. Eight steps closer to new books. The fundraiser is ready. The library’s next chapter starts with you.' });

const byId = new Map(NARRATION.map(line => [line.id, line]));
export function narrationFor(id) { return byId.get(id) || null; }
