import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAudioSettings, spokenMath } from '../audio.js';
import { BANK } from '../bank.js';

test('audio preference corruption recovers and volume stays in safe bounds', () => {
  assert.deepEqual(loadAudioSettings('{broken'), {voice:true,music:true,sounds:true,volume:60});
  assert.deepEqual(loadAudioSettings('null'), {voice:true,music:true,sounds:true,volume:60});
  assert.equal(loadAudioSettings('{"volume":900}').volume, 100);
  assert.equal(loadAudioSettings('{"volume":-5}').volume, 0);
  assert.equal(loadAudioSettings('{"volume":"loud"}').volume, 60);
  assert.deepEqual(loadAudioSettings('{"voice":false,"music":false,"sounds":true,"volume":25}'), {voice:false,music:false,sounds:true,volume:25});
});

test('narration makes ratios, fractions, money and percentages understandable without altering bank', () => {
  assert.equal(spokenMath('1:4 and 12:18'), '1 to 4 and 12 to 18');
  assert.equal(spokenMath('Solve: x/4 = 9/12.'), 'Solve: x divided by 4  equals  9 divided by 12.');
  assert.equal(spokenMath('$8.40 and 20%'), '8.40 dollars and 20 percent');
  assert.equal(spokenMath('through (0,0)'), 'through (zero, zero)');
  const before = JSON.stringify(BANK);
  for (const question of BANK) {
    assert.ok(spokenMath(question.story));
    assert.ok(spokenMath(question.question));
    assert.ok(spokenMath(question.hint));
  }
  assert.equal(JSON.stringify(BANK), before);
});
