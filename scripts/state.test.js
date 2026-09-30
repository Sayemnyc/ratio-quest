import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BANK } from '../bank.js';
import { newPlayer, startTier, answerQuestion, advance, useHint, accuracy, bestScore, unlocked, loadStore } from '../state.js';

function complete(p, tier, misses=[]) {
  assert.equal(startTier(p,tier),true);
  for(let i=0;i<8;i++) {
    const r=p.tiers[tier-1].run, q=BANK[(tier-1)*8+i];
    r.phase='question';
    if(misses.includes(i)) answerQuestion(p,tier,q.options.find(o=>o!==q.answer));
    answerQuestion(p,tier,q.answer);
    advance(p,tier);
  }
}
test('all 24 question records match the supplied contract verbatim',()=>{
  const text=readFileSync(new URL('./question-contract.txt',import.meta.url),'utf8');
  const matches=[...text.matchAll(/(\d)\.(\d) Story: "(.*?)" Q: "(.*?)" Options: (.*?)\. Answer: (.*?)\. Hint: "(.*?)"/g)];
  assert.equal(matches.length,24);
  assert.equal(BANK.length,24);
  matches.forEach((m,i)=>{
    const [,t,n,story,question,options,answer,hint]=m;
    assert.deepEqual(BANK[i],{id:`${t}.${n}`,tier:Number(t),story,question,options:options.split(' / '),answer,hint});
    assert.equal(BANK[i].options.length,4);
    assert.ok(BANK[i].options.includes(answer));
  });
});
test('new students have only tier 1 and no XP',()=>{
  const p=newPlayer(); assert.equal(p.earned.length,0);
  assert.deepEqual([1,2,3].map(t=>unlocked(p,t)),[true,false,false]);
  assert.equal(startTier(p,3),false);
});
test('retry keeps the first-answer record, both hints are available, XP awards once',()=>{
  const p=newPlayer(); startTier(p,1); const r=p.tiers[0].run; r.phase='question';
  assert.equal(useHint(r),true);assert.equal(useHint(r),true);assert.equal(useHint(r),false);
  assert.deepEqual(answerQuestion(p,1,'4:1'),{correct:false,xp:0});
  assert.equal(r.phase,'question');assert.deepEqual(r.first,[false]);
  assert.deepEqual(answerQuestion(p,1,'1:4'),{correct:true,xp:10});
  assert.deepEqual(r.first,[false]);assert.equal(answerQuestion(p,1,'1:4'),null);
  advance(p,1); assert.equal(r.index,1);assert.equal(r.hints,0);
});
test('6/8 stays locked; replay at 7/8 opens next tier and retains badge and XP',()=>{
  const p=newPlayer();complete(p,1,[0,1]);
  assert.equal(accuracy(p.tiers[0].run),75);assert.equal(unlocked(p,2),false);
  assert.equal(p.tiers[0].completed,true);assert.equal(p.earned.length*10,80);
  complete(p,1,[0]);assert.equal(bestScore(p.tiers[0]),87.5);assert.equal(unlocked(p,2),true);
  assert.equal(p.earned.length*10,80);
  startTier(p,1);assert.equal(unlocked(p,2),true);assert.equal(p.tiers[0].completed,true);
});
test('all tiers award badges, max 240 XP, final correct option is 167',()=>{
  const p=newPlayer();for(const tier of [1,2,3])complete(p,tier);
  assert.equal(p.earned.length*10,240);assert.equal(p.tiers.filter(t=>t.completed).length,3);
  assert.ok(p.tiers.every(t=>t.run.index===8&&t.run.phase==='badge'));
  assert.equal(BANK[23].answer,'167');
  complete(p,3);assert.equal(p.earned.length*10,240);
});
test('student records survive save and load with independent progress; invalid saves recover',()=>{
  const a=newPlayer('a','Alina'),b=newPlayer('b','Sam');complete(a,1);
  const data={version:1,active:'a',players:[newPlayer(),a,b]};
  assert.deepEqual(loadStore(JSON.stringify(data)),data);
  assert.equal(b.earned.length,0);assert.equal(unlocked(b,2),false);
  assert.equal(loadStore('{broken').active,'solo');
  assert.equal(loadStore(JSON.stringify({version:1,players:[{}]})).active,'solo');
});
