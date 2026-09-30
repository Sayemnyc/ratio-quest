import { BANK } from './bank.js';
export const KEY = 'ratio-quest-v1';
export function newPlayer(id = 'solo', name = 'Solo adventurer') {
  return { id, name, earned: [], tiers: [null, null, null] };
}
export function newRun() { return { index: 0, first: [], solved: [], hints: 0, phase: 'story', feedback: null }; }
export function accuracy(run) { return run?.first.length ? Math.round(run.first.filter(Boolean).length / run.first.length * 1000) / 10 : 0; }
export function bestScore(tier) { return Math.max(tier?.best ?? 0, tier?.run?.index === 8 ? accuracy(tier.run) : 0); }
export function unlocked(player, tier) { return tier === 1 || bestScore(player.tiers[tier - 2]) >= 80; }
export function startTier(player, tier) {
  if (!unlocked(player, tier)) return false;
  const old = player.tiers[tier - 1];
  if (!old || old.run.index === 8) player.tiers[tier - 1] = { best: old?.best ?? 0, completed: old?.completed ?? false, run: newRun() };
  return true;
}
export function answerQuestion(player, tier, option) {
  const record = player.tiers[tier - 1];
  const run = record.run;
  if (run.phase !== 'question' || run.index >= 8) return null;
  const q = BANK[(tier - 1) * 8 + run.index];
  if (!q.options.includes(option)) return null;
  const correct = q.answer === option;
  if (run.first.length === run.index) run.first.push(correct);
  run.feedback = { correct, option, xp: 0 };
  let xp = 0;
  if (correct) {
    run.solved.push(q.id);
    run.phase = 'success';
    if (!player.earned.includes(q.id)) { player.earned.push(q.id); xp = 10; }
  }
  run.feedback.xp = xp;
  return { correct, xp };
}
export function advance(player, tier) {
  const record = player.tiers[tier - 1], run = record.run;
  if (run.phase !== 'success') return false;
  run.index++;
  run.hints = 0;
  run.feedback = null;
  run.phase = run.index === 8 ? 'badge' : 'story';
  if (run.index === 8) { record.completed = true; record.best = Math.max(record.best, accuracy(run)); }
  return true;
}
export function useHint(run) {
  if (run.phase !== 'question' || run.hints >= 2) return false;
  run.hints++;
  return true;
}
export function loadStore(raw) {
  try {
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.players) || !data.players.length) throw new Error('Invalid save');
    for (const p of data.players) {
      if (typeof p.id !== 'string' || typeof p.name !== 'string' || !Array.isArray(p.earned) || p.earned.some(id => !BANK.some(q => q.id === id)) || new Set(p.earned).size !== p.earned.length || !Array.isArray(p.tiers) || p.tiers.length !== 3) throw new Error('Invalid player');
      for (const t of p.tiers) if (t && (!Number.isInteger(t.run?.index) || t.run.index < 0 || t.run.index > 8 || !Array.isArray(t.run.first) || !t.run.first.every(v => typeof v === 'boolean') || !Array.isArray(t.run.solved) || !['story', 'question', 'success', 'badge'].includes(t.run.phase) || !Number.isInteger(t.run.hints) || t.run.hints < 0 || t.run.hints > 2 || typeof t.best !== 'number' || t.best < 0 || t.best > 100)) throw new Error('Invalid tier');
    }
    if (!data.players.some(p => p.id === data.active)) data.active = data.players[0].id;
    return data;
  } catch { return { version: 1, active: 'solo', players: [newPlayer()] }; }
}
