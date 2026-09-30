// Ratio Quest. All state lives in localStorage. No accounts.
const KEY = "ratioQuest.v1";
const PASS = 0.8;
const XP_EACH = 10;
const MAX_XP = TIERS.reduce((n, t) => n + t.questions.length, 0) * XP_EACH;
const OOPS = [
  "The lemonade came out a little... interesting. Let's fix the recipe!",
  "Oops! A pigeon stole a cookie. Good thing you get another try.",
  "The banner paint splashed everywhere. Quick, take another look!",
  "The oven timer went off early. No worries, try again!",
  "The cash box jingled but the numbers did not match. Give it another go!",
  "A rogue muffin rolled off the table. Regroup and try again!"
];

const $ = (id) => document.getElementById(id);
const app = $("app");
let S = load();
let play = null;

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.players) return s;
  } catch (e) {}
  return { roster: [], players: {}, current: null };
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

function esc(t) { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; }
function player(name) {
  return (S.players[name] = S.players[name] || { earned: {}, q: {}, best: {}, badges: [] });
}
const me = () => (S.current ? player(S.current) : null);
const tierDone = (p, t) => t.questions.filter((q) => p.q[q.id]).length;
const tierFirst = (p, t) => t.questions.filter((q) => p.q[q.id] && p.q[q.id].first).length;
const unlocked = (p, i) => i === 0 || (p.best[TIERS[i - 1].id] || 0) >= PASS;
const xpOf = (p) => Object.keys(p.earned).length * XP_EACH;

function addName(name) {
  name = name.trim().slice(0, 20);
  if (!name) return null;
  const known = S.roster.find((n) => n.toLowerCase() === name.toLowerCase());
  if (known) return known;
  S.roster.push(name);
  save();
  return name;
}

function hud() {
  const p = me();
  $("hud").innerHTML = p
    ? `<span>Hi, ${esc(S.current)}!</span>
       <div class="xpbar" title="XP"><i style="transform:scaleX(${Math.min(1, xpOf(p) / MAX_XP)})"></i><b>${xpOf(p)} XP</b></div>
       <div class="shelf">${TIERS.map((t) => `<span class="${p.badges.includes(t.badge) ? "on" : ""}" title="${t.badge}">${t.icon}</span>`).join("")}</div>`
    : "";
}

function route() {
  const h = location.hash;
  hud();
  if (h === "#/teacher") return teacher();
  if (h === "#/play" && play && me()) return step();
  play = null;
  home();
}
window.addEventListener("hashchange", route);

// ---------- Home ----------
function home() {
  const p = me();
  if (!p) return whoIsPlaying();
  const next = TIERS.findIndex((t, i) => unlocked(p, i) && tierDone(p, t) < t.questions.length);
  app.innerHTML = `
    <section class="card hero">
      <h1>Ratio Quest</h1>
      <p>${esc(FRAME)}</p>
      <button class="btn" id="go">${Object.keys(p.q).length ? "Continue quest" : "Start quest"}</button>
      <button class="btn ghost" id="swap">Switch player</button>
    </section>
    <h2>Your adventure map</h2>
    <div class="map">${TIERS.map((t, i) => {
      const open = unlocked(p, i), n = tierDone(p, t);
      return `<button class="island t${t.id} ${open ? "" : "locked"}" data-i="${i}" ${open ? "" : "aria-disabled='true'"}>
        <div class="ico">${open ? t.icon : "🔒"}</div>
        <h3>Tier ${t.id}: ${t.name}</h3>
        <small>${open ? `${n} of ${t.questions.length} quests done` : "Score 80%+ on the previous tier to unlock."}</small>
        <div class="dots">${t.questions.map((q) => `<i class="${p.q[q.id] ? "d" : ""}"></i>`).join("")}</div>
        ${p.badges.includes(t.badge) ? `<small>🏅 ${t.badge}</small>` : ""}
      </button>`;
    }).join("")}</div>`;
  $("go").onclick = () => startTier(next < 0 ? 0 : next);
  $("swap").onclick = () => { S.current = null; save(); route(); };
  app.querySelectorAll(".island").forEach((b) => {
    b.onclick = () => { const i = +b.dataset.i; if (unlocked(p, i)) startTier(i); };
  });
}

function whoIsPlaying() {
  app.innerHTML = `
    <section class="card hero">
      <h1>Ratio Quest</h1>
      <p>${esc(FRAME)}</p>
      <h2>Who's playing?</h2>
      <div class="who" style="justify-content:center">${S.roster.map((n) => `<button class="btn alt pick">${esc(n)}</button>`).join("")}</div>
      <form id="f" class="row" style="justify-content:center">
        <input type="text" id="nm" maxlength="20" placeholder="Type your first name" autocomplete="off" aria-label="Your first name">
        <button class="btn">Let's go</button>
      </form>
    </section>`;
  const pick = (name) => { if (name) { S.current = name; player(name); save(); route(); } };
  app.querySelectorAll(".pick").forEach((b, i) => (b.onclick = () => pick(S.roster[i])));
  $("f").onsubmit = (e) => { e.preventDefault(); pick(addName($("nm").value)); };
}

// ---------- Play ----------
function startTier(ti) {
  const t = TIERS[ti], p = me();
  if (tierDone(p, t) === t.questions.length) return finish(ti, true);
  const i = t.questions.findIndex((q) => !p.q[q.id]);
  play = { ti, i };
  location.hash = "#/play";
  route();
}

const FRIENDS = [["🧑‍🍳", "Mo"], ["🧑‍💼", "Priya"], ["🧑‍🔧", "Jax"]];
const PROPS = {"1.1":"🍋🥤","1.2":"☀️🥤","1.3":"🙋🧑‍🍳","1.4":"🍎🥧","1.5":"🎨🖌️","1.6":"🎟️🎟️","1.7":"🙋‍♂️🙋‍♀️","1.8":"🚚⛽","2.1":"🍪📦","2.2":"🏷️📦","2.3":"📝🌾","2.4":"🍫🧁","2.5":"🗺️📍","2.6":"📚💰","2.7":"🌾🛒","2.8":"🎁🎀","3.1":"🎪📐","3.2":"🚚💵","3.3":"🧁🥚","3.4":"🤝💵","3.5":"📦🏷️","3.6":"🚛🛣️","3.7":"🎨🪣","3.8":"🏆💰"};
const CHEER = ["Yes! That's the one!", "Boom! Bake sale is saved!", "You're a ratio wizard!", "Perfect. Everyone's cheering!", "Nailed it! Add a book to the shelf!"];
let streak = 0;

function burst(emojis, n) {
  for (let i = 0; i < n; i++) {
    const e = document.createElement("span");
    e.className = "conf"; e.textContent = emojis[i % emojis.length];
    e.style.cssText = `--dx:${(Math.random() - .5) * 90}vw;--dy:${-30 - Math.random() * 40}vh;left:50%;top:60%`;
    document.body.appendChild(e); setTimeout(() => e.remove(), 1400);
  }
}

function shelf(p) {
  const total = Object.keys(p.earned).length;
  return `<div class="lib" title="Library shelf"><span>📚 Library shelf ${total}/24</span><div class="slots">${
    Array.from({ length: 24 }, (_, i) => `<i class="${i < total ? "b" : ""}" id="s${i}"></i>`).join("")}</div></div>`;
}

function step() {
  const p = me(), t = TIERS[play.ti], q = t.questions[play.i];
  if (!play.phase || play.phase === "story") play = { ti: play.ti, i: play.i, phase: "q", wrongs: 0, hints: 0, gone: [], tried: [] };
  const [av, who] = FRIENDS[(play.ti * 8 + play.i) % 3];
  const intro = play.ti === 0 && play.i === 0 ? `<div class="chat"><div class="av">🧑‍🍳</div><div class="bubble">Welcome to the bake sale! ${esc(FRAME)}</div></div>` : "";
  app.innerHTML = `<section id="stage" class="stage">
    <div class="scene"><span class="tag">${t.icon} ${t.name} · ${play.i + 1}/${t.questions.length}</span>
      <div class="props" id="props">${PROPS[q.id] || t.icon}</div>${streak > 1 ? `<span class="streak">🔥 ${streak} in a row</span>` : ""}</div>
    ${shelf(p)}
    ${intro}
    <div class="chat"><div class="av">${av}</div><div class="bubble"><b>${who}:</b> ${esc(q.story)}</div></div>
    <div class="ask"><p class="qtext">${esc(q.q)}</p>
      <div class="opts">${q.options.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join("")}</div></div>
    <div id="msg"></div>
    <div class="row"><button class="btn alt" id="hint"></button><a class="btn ghost" href="#/">Map</a><span id="cont"></span></div></section>`;
  const opts = [...app.querySelectorAll(".opt")];
  const paint = () => {
    opts.forEach((b, k) => {
      b.disabled = play.done || play.gone.includes(k) || play.tried.includes(k);
      b.classList.toggle("gone", play.gone.includes(k));
      b.classList.toggle("wrong", play.tried.includes(k));
    });
    $("hint").textContent = play.hints === 0 ? "🙋 Ask a friend" : play.hints === 1 ? "✂️ Cross out two" : "No help left";
    $("hint").disabled = play.hints > 1 || play.done;
  };
  paint();
  const say = (a, html, cls = "") => ($("msg").innerHTML = `<div class="chat ${cls}"><div class="av">${a}</div><div class="bubble">${html}</div></div>`);
  $("hint").onclick = () => {
    if (play.hints === 0) say(av, `Psst. ${esc(q.hint)}`);
    else {
      // 2nd help: fade two wrong options (uses only the bank's own answer key)
      q.options.map((o, k) => k).filter((k) => q.options[k] !== q.answer && !play.gone.includes(k) && !play.tried.includes(k))
        .slice(0, 2).forEach((k) => play.gone.push(k));
      say(av, "I crossed out two that can't be right. Your call!");
    }
    play.hints++; paint();
  };
  opts.forEach((b, k) => (b.onclick = () => answer(q, k, paint, say, av)));
}

function answer(q, k, paint, say, av) {
  const p = me();
  if (q.options[k] === q.answer) {
    play.done = true; streak++;
    const slot = Object.keys(p.earned).length;
    p.q[q.id] = { first: play.wrongs === 0 };
    p.earned[q.id] = 1;
    save(); hud(); paint();
    app.querySelectorAll(".opt")[k].classList.add("right");
    const s = $("s" + slot); if (s) s.classList.add("b", "new");
    burst(["🎉", "⭐", "✨", q.options.length ? TIERS[play.ti].icon : "🎊"], 18);
    const pop = document.createElement("div");
    pop.className = "xppop"; pop.textContent = `+${XP_EACH} XP`;
    document.body.appendChild(pop); setTimeout(() => pop.remove(), 1300);
    const last = play.i === TIERS[play.ti].questions.length - 1;
    say(av, `${CHEER[(play.i + streak) % CHEER.length]} 📗 A new book joins the library shelf.`, "good");
    $("cont").innerHTML = `<button class="btn" id="cn">${last ? "Claim my badge →" : "Next problem →"}</button>`;
    $("cn").onclick = () => (last ? finish(play.ti, false) : ((play = { ti: play.ti, i: play.i + 1 }), step()));
    return;
  }
  play.wrongs++; streak = 0;
  play.tried.push(k);
  paint();
  const st = $("stage"); st.classList.remove("shake"); void st.offsetWidth; st.classList.add("shake");
  $("props").insertAdjacentHTML("beforeend", `<span class="pigeon">🐦</span>`);
  say(av, `${esc(OOPS[(play.wrongs + play.i) % OOPS.length])} Pick another!`);
}

function finish(ti, replayView) {
  const t = TIERS[ti], p = me();
  const n = t.questions.length, first = tierFirst(p, t);
  p.best[t.id] = Math.max(p.best[t.id] || 0, first / n);
  const isNew = !p.badges.includes(t.badge);
  if (isNew) p.badges.push(t.badge);
  save(); hud();
  const pass = first / n >= PASS, nextTier = TIERS[ti + 1];
  const msg = pass
    ? nextTier ? `Tier ${nextTier.id} is unlocked!` : "You've mastered the whole adventure!"
    : `So close! Get ${Math.ceil(n * PASS)} right on the first try to unlock ${nextTier ? "Tier " + nextTier.id : "full mastery"}. Replay for another shot!`;
  const m = document.createElement("div");
  m.className = "moment";
  m.innerHTML = `<div class="big">${t.icon}</div>
    <p>${replayView ? "Tier complete" : isNew ? "New badge earned!" : "Tier complete!"}</p>
    <h2>🏅 ${t.badge}</h2>
    <p>${first} of ${n} right on the first try. ${msg}</p>
    <div class="row">
      ${pass && nextTier ? `<button class="btn" id="mn">Next tier →</button>` : ""}
      <button class="btn alt" id="mr">Replay tier</button>
      <button class="btn ghost" id="mm">Back to map</button></div>`;
  document.body.appendChild(m);
  const close = () => m.remove();
  $("mm").onclick = () => { close(); play = null; location.hash = "#/"; route(); };
  $("mr").onclick = () => { t.questions.forEach((q) => delete p.q[q.id]); save(); close(); startTier(ti); };
  if ($("mn")) $("mn").onclick = () => { close(); startTier(ti + 1); };
}

// ---------- Teacher ----------
function teacher() {
  const cell = (p, t) => {
    if (!p) return "—";
    const d = tierDone(p, t);
    if (!d) return "—";
    return `${d}/${t.questions.length} · <span class="pill">${Math.round((tierFirst(p, t) / d) * 100)}%</span>`;
  };
  app.innerHTML = `<section class="card"><h2>Teacher view</h2>
    <p>Type each student's first name once. They pick their name when they start playing. Everything is saved in this browser only.</p>
    <form id="f" class="row"><input type="text" id="nm" maxlength="20" placeholder="Student first name" autocomplete="off" aria-label="Student first name"><button class="btn">Add student</button></form></section>
    <section class="card"><div class="tablewrap"><table>
      <tr><th>Student</th>${TIERS.map((t) => `<th>Tier ${t.id} done · accuracy</th>`).join("")}<th>XP</th><th>Badges</th><th></th></tr>
      ${S.roster.length ? S.roster.map((n, i) => {
        const p = S.players[n];
        return `<tr><td><b>${esc(n)}</b></td>${TIERS.map((t) => `<td>${cell(p, t)}</td>`).join("")}
          <td>${p ? xpOf(p) : 0}</td><td>${p ? TIERS.filter((t) => p.badges.includes(t.badge)).map((t) => t.icon).join(" ") || "—" : "—"}</td>
          <td><button class="x" data-i="${i}" aria-label="Remove ${esc(n)}">✕</button></td></tr>`;
      }).join("") : `<tr><td colspan="7">No students yet. Add a first name above.</td></tr>`}
    </table></div><p class="recap">Accuracy = questions answered right on the first try.</p></section>`;
  $("f").onsubmit = (e) => { e.preventDefault(); addName($("nm").value); teacher(); };
  app.querySelectorAll(".x").forEach((b) => (b.onclick = () => {
    const n = S.roster[+b.dataset.i];
    if (!confirm(`Remove ${n} and their progress?`)) return;
    S.roster.splice(+b.dataset.i, 1); delete S.players[n];
    if (S.current === n) S.current = null;
    save(); hud(); teacher();
  }));
}

route();
