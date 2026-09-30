import { BANK } from './bank.js';
import { QuestAudio } from './audio.js';
import { chapters, scenes, FRAME } from './story.js';
import { narrationFor } from './narration.js';
import { KEY, newPlayer, loadStore, accuracy, bestScore, unlocked, startTier, answerQuestion, advance, useHint } from './state.js';

const app = document.querySelector('#app');
let storageWorks = true;
let store;
try { store = loadStore(localStorage.getItem(KEY)); } catch { store = loadStore(null); storageWorks = false; }

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const player = () => store.players.find(p => p.id === store.active);
function screenNarration() {
  const route = location.hash.slice(1);
  if (route === 'teacher') return null;
  if (!/^tier-[123]$/.test(route)) return narrationFor('intro');
  const tier = Number(route.at(-1));
  const record = player().tiers[tier - 1], run = record?.run;
  if (!run) return null;
  if (run.index === 8) return narrationFor(tier === 3 ? 'badge-3' : `badge-${tier}-${bestScore(record) >= 80 ? 'open' : 'retry'}`);
  const q = BANK[(tier - 1) * 8 + run.index];
  const kind = run.phase === 'success' ? 'success' : run.feedback && !run.feedback.correct ? 'retry' : run.phase;
  return narrationFor(`${q.id}-${kind}`);
}

const audio = new QuestAudio(document.querySelector('#audio-panel'), screenNarration);
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); storageWorks = true; }
  catch { storageWorks = false; }
}
function storageNotice() { return storageWorks ? '' : '<p class="notice">This browser can’t save progress right now. Keep this tab open to continue your adventure.</p>'; }
function progressHeader() {
  const p = player(), xp = p.earned.length * 10;
  return `<section class="playerbar"><label>Playing as <select id="player" aria-label="Choose student">${store.players.map(p => `<option value="${esc(p.id)}" ${p.id === store.active ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label><div class="xp"><strong>✦ ${xp} XP</strong><div class="meter" role="progressbar" aria-label="Quest XP" aria-valuenow="${xp}" aria-valuemin="0" aria-valuemax="240"><i style="width:${xp / 240 * 100}%"></i></div><span>${p.earned.length} / 24 quests</span></div></section>${storageNotice()}`;
}
function islandArt(tier) {
  const colors = ['#a9d8c3', '#f0b6a1', '#bdafe1'];
  return `<svg class="island-art" viewBox="0 0 320 180" aria-hidden="true"><ellipse cx="160" cy="147" rx="132" ry="23" fill="${colors[tier-1]}"/><ellipse cx="160" cy="132" rx="128" ry="30" fill="#fff9e9"/><path d="M59 129h201" stroke="#dfd5bb" stroke-width="3" stroke-dasharray="6 6"/>${tier === 1 ? '<path d="M98 59h123v75H98z" fill="#467b6b"/><path d="M86 56l19-27h111l18 27z" fill="#ffd46b"/><path d="M90 56h142v15H90z" fill="#fff4cb"/><path d="M114 97h24v26h-24zm35 0h24v26h-24z" fill="#ffe289"/><circle cx="204" cy="113" r="15" fill="#ffd46b"/><path d="M202 96l10-10" stroke="#467b6b" stroke-width="4"/>' : tier === 2 ? '<path d="M100 65h124v71H100z" fill="#cb7659"/><path d="M87 65l74-43 74 43z" fill="#6a4235"/><path d="M103 72h118v22H103z" fill="#fff1cf"/><path d="M112 72h15v22h-15zm31 0h15v22h-15zm31 0h15v22h-15zm31 0h15v22h-15z" fill="#f0b6a1"/><path d="M146 103h30v33h-30z" fill="#6a4235"/><circle cx="84" cy="122" r="17" fill="#e3aa6b"/><circle cx="79" cy="116" r="3" fill="#6a4235"/><circle cx="91" cy="125" r="3" fill="#6a4235"/>' : '<path d="M97 67h126v69H97z" fill="#8073ae"/><path d="M86 66l74-45 74 45z" fill="#44395f"/><path d="M111 79h19v42h-19zm35 0h19v42h-19zm35 0h19v42h-19z" fill="#fff1cf"/><path d="M93 130h135v9H93z" fill="#44395f"/><path d="M76 119h16v22H76z" fill="#ffd46b"/><path d="M235 114h12v28h-12z" fill="#cb7659"/>'}<path d="M51 118v-22m-7 7l7-7 7 7m209 14v-22m-7 7l7-7 7 7" stroke="${colors[tier-1]}" stroke-width="5" stroke-linecap="round"/></svg>`;
}
function home() {
  const p = player();
  const next = [1,2,3].find(t => unlocked(p,t) && bestScore(p.tiers[t-1]) < 80) ?? 3;
  app.innerHTML = `${progressHeader()}<section class="hero"><div><p class="eyebrow">A GRADE 7 ADVENTURE · RATIOS & PROPORTIONS</p><h1>Small batches.<br>Big <span>book energy.</span></h1><p class="intro">${FRAME}</p><button class="primary" data-start="${next}">${p.earned.length ? 'Continue quest' : 'Start quest'} <span>↗</span></button><p class="tiny">24 decisions. One library to save. Your pace.</p></div><div class="hero-art"><div class="sticker">THE GREAT<br><strong>BOOK BAKE</strong><span>✦</span></div><div class="book-stack"><i>THE ADVENTURE STARTS HERE</i><i>ONE SMART CHOICE AT A TIME</i><i>FOR ALINA & HER CREW</i></div><span class="floating lemon">🍋</span><span class="floating cookie">🍪</span><span class="spark spark1">✦</span><span class="spark spark2">✧</span></div></section><section class="map-section" aria-labelledby="map-title"><div class="section-heading"><div><p class="eyebrow">YOUR ADVENTURE</p><h2 id="map-title">Three stops. A whole lot of good.</h2></div><span class="pill">${p.tiers.filter(t => t?.completed).length} / 3 badges earned</span></div><div class="islands">${chapters.map((c,i) => {
    const tier = i+1, open = unlocked(p,tier), rec=p.tiers[i];
    return `<article class="island ${c.color} ${open?'':'locked'}"><div class="island-top"><span class="eyebrow">TIER 0${tier}</span><span class="pill">${!open?'Locked':rec?.completed?'Badge earned':'Ready to explore'}</span></div>${islandArt(tier)}<div class="island-content"><p class="place">${c.place}</p><h3>${c.name}</h3><p>${c.desc}</p><div class="chapter-progress">${rec?`${rec.run.index} / 8 quests · Best score ${bestScore(rec)}%`:'8 story quests · 80 XP'}</div><button class="${open?'dark':'lock-button'}" data-start="${tier}" ${open?'':'disabled'}>${open?(rec?.completed?'Replay tier ↗':rec?'Continue tier ↗':'Explore island ↗'):'🔒 Locked'}</button>${!open?'<p class="unlock-rule">Score 80%+ on the previous tier to unlock.</p>':''}</div></article>`;
  }).join('')}</div></section><section class="badge-shelf"><div><p class="eyebrow">YOUR TROPHY SHELF</p><h2>Good math. Great crew.</h2></div><div class="badges">${chapters.map((c,i)=>`<div class="badge ${p.tiers[i]?.completed?'earned':''}"><span>${p.tiers[i]?.completed?'✦':'◇'}</span><strong>${c.badge}</strong></div>`).join('')}</div></section><p class="save-note">Progress saves on this browser. Switch students above, or build a roster in Teacher view.</p>`;
}
function quest(tier) {
  const p = player();
  if (!unlocked(p,tier)) { location.hash='home'; return; }
  if (!p.tiers[tier-1]) startTier(p,tier);
  const rec=p.tiers[tier-1], run=rec.run, c=chapters[tier-1];
  if (run.index === 8) { badge(tier); return; }
  const q=BANK[(tier-1)*8+run.index], scene=scenes[(tier-1)*8+run.index];
  app.innerHTML=`${progressHeader()}<div class="quest-top"><a href="#home">← Back to map</a><span>${c.place} · Quest ${run.index+1} of 8</span></div><div class="quest-progress" aria-label="${run.index} of 8 quests complete">${Array.from({length:8},(_,i)=>`<i class="${i<run.index?'done':i===run.index?'current':''}"></i>`).join('')}</div><section class="quest-layout"><aside class="scene ${c.color}"><p class="eyebrow">THE CREW NEEDS YOU</p><h2>${scene[1]}</h2><div class="scene-stage ${run.feedback?.correct?'celebrate':''}"><span class="scene-object">${scene[0]}</span><div class="workbench"></div><span class="scene-star">✦</span></div><div class="scene-label">${scene[2]}</div><div class="decision">${run.feedback?`Your decision: <strong>${esc(run.feedback.option)}</strong>`:'Your next decision makes the story happen.'}</div><div class="crew-note">${run.feedback?(run.feedback.correct?scene[4]:scene[3]):'The crew is ready. You call the shots.'}</div></aside><div class="quest-card"><p class="eyebrow">CHAPTER ${tier} · ${c.name.toUpperCase()}</p><h1>${run.phase==='story'?'Your next move.':run.phase==='success'?'Nice move, crew!':'Make the call.'}</h1><p class="story">${q.story}</p>${run.phase==='story'?`<p class="mission-note">${scene[1]} to move the fundraiser forward.</p><button class="primary" id="decision">Make a decision ↗</button>`:run.phase==='success'?`<div class="success" role="status"><span class="xp-pop">✦ ${run.feedback?.xp?'+10 XP':'Quest solved'}</span><h2>${q.answer}</h2><p>${scene[4]}</p></div><button class="primary" id="next">${run.index===7?'Claim your badge ✦':'Keep the story going →'}</button>`:`<h2 class="question">${q.question}</h2><div class="options">${q.options.map((o,i)=>`<button class="option" data-option="${i}"><span>${'ABCD'[i]}</span>${esc(o)}</button>`).join('')}</div>${run.feedback&&!run.feedback.correct?`<div class="nudge" role="status"><strong>Plot twist! Try another move.</strong><p>${q.hint}</p><span>Your crew’s got you. Choose again.</span></div>`:''}<div class="hint-row"><button class="hint" id="hint" ${run.hints===2?'disabled':''}>☀ ${run.hints===2?'Hints used':'Need a hint?'} <span>${2-run.hints} left</span></button><span>No rush. Think it through.</span></div>${run.hints?`<div class="hint-note" role="status"><strong>Hint ${run.hints} of 2${run.hints===2?' · One more look':''}</strong><p>${q.hint}</p></div>`:''}`}</div></section>`;
}
function badge(tier) {
  const c=chapters[tier-1], p=player(), rec=p.tiers[tier-1], score=accuracy(rec.run), open=bestScore(rec)>=80;
  app.innerHTML=`${progressHeader()}<section class="badge-moment ${c.color}"><p class="eyebrow">CHAPTER COMPLETE · THE CREW CHEERS</p><div class="medallion">✦</div><h1>${c.badge}</h1><p>Eight decisions. Eight steps closer to new books.</p><div class="completion-stats"><span><strong>${tier*8}</strong>story milestones reached</span><span><strong>${score}%</strong>first-answer accuracy</span><span><strong>${p.earned.length*10}</strong>total XP</span></div><p>${tier===3?'The fundraiser is ready. The library’s next chapter starts with you.':open?`${chapters[tier].place} is unlocked. Your crew is ready for the next stop.`:'Your badge is yours! Replay this tier and get 7 of 8 first answers right to unlock the next island.'}</p><div class="badge-actions">${tier<3&&open?`<button class="primary" data-start="${tier+1}">Next island →</button>`:`<button class="primary" data-start="${tier}">Replay this tier ↗</button>`}<a class="outline" href="#home">Back to map</a></div><p class="tiny">XP is earned once per quest. Replays improve your best score.</p></section>`;
}
function teacher() {
  app.innerHTML=`<section class="teacher"><p class="eyebrow">TEACHER VIEW · THIS BROWSER ONLY</p><h1>Your bake-sale crew.</h1><p class="intro">Add students’ first names, then choose a student before they play. Each student keeps a separate adventure on this browser.</p><div class="notice">This roster lives on this device. Results from other Chromebooks do not appear here automatically. No names or answers are sent to a server.</div>${storageNotice()}<form id="roster-form"><label for="names">Student first names <span>One per line, or separated by commas</span></label><textarea id="names" rows="3" maxlength="2000" required></textarea><button class="primary" type="submit">Add to roster +</button><p id="roster-status" role="status"></p></form><div class="roster-grid"><div class="roster-head"><strong>Student</strong>${chapters.map((c,i)=>`<strong>Tier ${i+1}<small>${c.badge}</small></strong>`).join('')}</div>${store.players.map(p=>`<div class="roster-row"><div class="roster-name"><strong>${esc(p.name)}</strong><button class="small-button" data-play="${esc(p.id)}">Play as ${esc(p.name)}</button><span>${p.earned.length*10} XP</span></div>${p.tiers.map((t,i)=>`<div class="roster-cell"><strong>${t?`${t.run.index}/8 complete`:'Not started'}</strong><span>${t?.run.first.length?`${accuracy(t.run)}% accuracy (${t.run.first.filter(Boolean).length}/${t.run.first.length})`:'No answers yet'}</span><small>${t?.completed?`Badge earned · Best ${t.best}%`:unlocked(p,i+1)?'Unlocked':'Locked'}</small></div>`).join('')}</div>`).join('')}</div><p class="save-note">Accuracy counts each question’s first answer in the current run. A completed tier needs at least 7/8 (87.5%) to meet 80%. Best completed score controls unlocking. Replays keep badges and earned XP.</p><a class="outline" href="#home">← Back to quest map</a></section>`;
}
function render() {
  const route=location.hash.slice(1);
  if(route==='teacher') teacher();
  else if(/^tier-[123]$/.test(route)) quest(Number(route.at(-1)));
  else home();
  app.querySelector('h1')?.setAttribute('tabindex','-1');
  const tier = /^tier-[123]$/.test(route) ? Number(route.at(-1)) : null;
  const run = tier ? player().tiers[tier - 1]?.run : null;
  const key = JSON.stringify([store.active, route, run?.index, run?.phase, run?.feedback?.option, run?.feedback?.correct]);
  audio.screenChanged(key, route === 'teacher');
}
function notify(message) {
  const toast=document.querySelector('#toast');
  toast.textContent=message;
  toast.classList.add('visible');
  clearTimeout(notify.timer);
  notify.timer=setTimeout(()=>toast.classList.remove('visible'),2500);
}
app.addEventListener('change',e=>{
  if(e.target.id==='player') { store.active=e.target.value; save(); location.hash='home'; render(); }
});
app.addEventListener('submit',e=>{
  if(e.target.id!=='roster-form') return;
  e.preventDefault();
  const names=app.querySelector('#names').value.split(/[\n,]+/).map(n=>n.trim()).filter(Boolean);
  let added=0;
  for(const name of names) {
    if(name.length>40 || store.players.some(p=>p.name.toLowerCase()===name.toLowerCase())) continue;
    store.players.push(newPlayer(crypto.randomUUID(),name)); added++;
  }
  save(); teacher();
  app.querySelector('#roster-status').textContent=`${added} student${added===1?'':'s'} added. Duplicate names and names over 40 characters were skipped.`;
});
app.addEventListener('click',e=>{
  const button=e.target.closest('button');
  if(!button || button.disabled) return;
  if(button.dataset.start) {
    const tier=Number(button.dataset.start);
    if(startTier(player(),tier)) { audio.effect('click'); save(); location.hash=`tier-${tier}`; render(); window.scrollTo(0,0); }
    return;
  }
  if(button.dataset.play) { store.active=button.dataset.play; save(); location.hash='home'; return; }
  const route=location.hash.slice(1);
  if(!/^tier-[123]$/.test(route)) return;
  const tier=Number(route.at(-1)), run=player().tiers[tier-1]?.run;
  if(!run) return;
  if(button.id==='decision') { audio.effect('click'); run.phase='question'; }
  if(button.dataset.option!==undefined) {
    const q=BANK[(tier-1)*8+run.index], result=answerQuestion(player(),tier,q.options[Number(button.dataset.option)]);
    if(result?.correct) notify(result.xp?'+10 XP · Smart move!':'Smart move! Best score in progress.');
    if(result) audio.effect(result.correct ? 'success' : 'retry');
  }
  if(button.id==='hint' && useHint(run)) audio.effect('hint');
  if(button.id==='next') { audio.effect(run.index === 7 ? 'badge' : 'click'); advance(player(),tier); window.scrollTo(0,0); }
  save(); render();
  if(button.id==='hint') audio.speak(narrationFor(`${BANK[(tier-1)*8+run.index].id}-hint`));
  if(button.dataset.option!==undefined) app.querySelector('.success, .nudge')?.scrollIntoView({block:'nearest',behavior:'smooth'});
});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);app.querySelector('h1')?.focus({preventScroll:true});});
render();
