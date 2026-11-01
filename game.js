/* Susu & Neko's Block World — game layer: map, islands, daily quests, dream house, sticker books, Writing Workshop, exam castle */
'use strict';

/* ---------- state ---------- */
S.stk = S.stk || []; S.days = S.days || {}; S.plan = S.plan || {}; S.papers = S.papers || []; S.got = S.got || {}; S.chk = S.chk || {};
const pad = n => String(n).padStart(2, '0');
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const TODAY = () => dkey(new Date());
const BOOKS = [
  { id: 'a', name: 'Block Buddies', ids: [...Array(16)].map((_, i) => 'a' + pad(i + 1)) },
  { id: 'b', name: 'Seasons & Festivals', ids: [...Array(16)].map((_, i) => 'b' + pad(i + 1)) },
];
const ALL_STK = BOOKS.flatMap(b => b.ids);
const HOUSE_BLOCKS = 40, STARS_PER_BLOCK = 4;
const stk = id => `<img src="img/stk/${id}.webp" alt="" draggable="false">`;

/* stop writing timers when the screen changes */
let TIMER = null;
const clearTimer = () => { if (TIMER) { clearInterval(TIMER); TIMER = null; } };
const _view = view;
view = html => { clearTimer(); closeAward(); _view(html); };

/* ---------- stickers & awards ---------- */
let awardQ = [];
function giveSticker(why) {
  const id = ALL_STK.find(x => !S.stk.includes(x));
  if (!id) { popText('All stickers collected!'); return; }
  S.stk.push(id); save(); awardQ.push([id, why]);
  if (!$('#award')) setTimeout(showAward, 600);
}
function showAward() {
  const it = awardQ.shift(); if (!it) return;
  const [id, why] = it;
  const book = BOOKS.find(b => b.ids.includes(id));
  const el = document.createElement('div'); el.id = 'award'; el.className = 'award';
  el.innerHTML = `<div class="award-card"><div class="rays"></div><div class="award-stk">${stk(id)}</div>
    <h3>New sticker!</h3><p>${esc(why)}</p><p class="muted">It goes in your <b>${book.name}</b> sticker book (${S.stk.filter(x => book.ids.includes(x)).length}/16).</p>
    <div class="btn-row center"><button class="pill next" id="awBook">Open my sticker book</button><button class="pill" id="awOk">Keep playing</button></div></div>`;
  document.body.appendChild(el);
  tone([[523, .1], [659, .1], [784, .1], [1047, .3]]); confetti();
  $('#awOk').onclick = () => { closeAward(); if (awardQ.length) setTimeout(showAward, 300); };
  $('#awBook').onclick = () => { awardQ = []; closeAward(); stickers(book.id); };
}
function closeAward() { const a = $('#award'); if (a) a.remove(); }

function onStar() {
  if (S.stars % STARS_PER_BLOCK === 0 && S.stars / STARS_PER_BLOCK <= HOUSE_BLOCKS) setTimeout(() => { popText('+1 house block!'); tone([[392, .08], [523, .12]]); }, 700);
}

/* once per activity per day, when the score is good */
function afterResult(mode, ratio) {
  questTick(mode);
  const key = mode + '@' + TODAY();
  if (mode === 'mock') { if (ratio >= .6 && !S.got[key]) { S.got[key] = 1; giveSticker('You finished the mock exam Part A!'); } }
  else if (ratio >= .7 && !S.got[key]) { S.got[key] = 1; giveSticker(`Great score in ${mode === 'spell' ? 'Spelling bee' : title(mode)}!`); }
  save();
  const tp = $('#toPaper'); if (tp) tp.onclick = () => examPaper();
  const hm = $('#hm'); if (hm) hm.onclick = home;
}

/* ---------- daily quest & streak ---------- */
const TOPIC_IDS = () => [...UNITS.map(u => u.id), ...READING.map(r => r.id)];
const SHOP_IDS = ['place', 'rules', 'season'];
function quest() {
  const t = TODAY(); const D = S.days[t] = S.days[t] || { done: {} };
  if (!D.tasks) {
    const ids = TOPIC_IDS(); const n = new Date().getDate();
    const weak = ids.filter(id => (S.best[id] ?? -1) < 7);
    const pickT = (weak.length ? weak : ids)[n % (weak.length || ids.length)];
    D.tasks = [{ k: 'topic', id: pickT }, { k: 'shop', id: SHOP_IDS[n % 3] }, { k: n % 2 ? 'spell' : 'listen' }];
    save();
  }
  return D;
}
function taskLabel(x) {
  if (x.k === 'topic') return [ALL[x.id].kind === 'reading' ? '🌳' : '⛏️', `Play: ${ALL[x.id].title}`, 'Score 7+ out of 10'];
  if (x.k === 'shop') return ['✏️', `Write on paper: ${SHOPS[x.id].title}`, 'Plan → write → check on the iPad'];
  if (x.k === 'spell') return ['🐝', 'Spelling bee', '10 words'];
  return ['👂', 'Listen & choose', '10 words'];
}
function questTick(mode) {
  const D = quest(); let hit = false;
  D.tasks.forEach((x, i) => { if (D.done[i]) return; if ((x.k === 'topic' && x.id === mode) || (x.k === 'shop' && x.id === mode) || (x.k === mode)) { D.done[i] = 1; hit = true; } });
  if (hit) { popText('Quest step done!'); if (D.tasks.every((_, i) => D.done[i]) && !D.all) { D.all = 1; giveSticker('Daily quest complete! A new stamp on your calendar.'); } }
  save();
}
function runTask(x) { if (x.k === 'topic') topic(x.id); else if (x.k === 'shop') shop(x.id); else if (x.k === 'spell') spelling(); else startQuiz('listen'); }
function streakDays() {
  const out = []; const start = new Date(2026, 10, 2), end = new Date(2026, 10, 13);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) out.push(new Date(d));
  return out;
}

/* ---------- dream house ---------- */
function houseHTML(big) {
  const blocks = Math.min(HOUSE_BLOCKS, Math.floor(S.stars / STARS_PER_BLOCK));
  const order = [...Array(HOUSE_BLOCKS).keys()].sort((a, b) => (Math.floor(b / 8) - Math.floor(a / 8)) || ((a * 7) % 8 - (b * 7) % 8));
  const open = new Set(order.slice(0, blocks));
  return `<div class="house ${big ? 'big' : ''}"><img src="img/house.webp" alt="Susu and Neko's dream house">
    <div class="house-grid">${[...Array(HOUSE_BLOCKS).keys()].map(i => `<i class="${open.has(i) ? 'gone' : ''}" style="--d:${(i % 8 + Math.floor(i / 8)) % 4}"></i>`).join('')}</div></div>
    <div class="house-meta"><b>${blocks}/${HOUSE_BLOCKS}</b> blocks built${blocks < HOUSE_BLOCKS ? ` · next block in <b>${STARS_PER_BLOCK - S.stars % STARS_PER_BLOCK}</b> 💎` : ' · The house is finished!'}</div>${blocks===0?'<div class="house-hint">Each block you build shows part of a secret house.</div>':''}`;
}

/* ---------- islands ---------- */
const ISLES = [
  { id: 'school', name: 'School Village', img: 'b-school', sub: 'Textbook & Workbook units', items: () => UNITS.filter(u => u.group === 'ple').map(u => u.id) },
  { id: 'mine', name: 'Grammar Gem Mine', img: 'b-mine', sub: 'Grammar Time units', items: () => UNITS.filter(u => u.group === 'grammar').map(u => u.id) },
  { id: 'forest', name: 'Story Forest', img: 'b-forest', sub: 'Reading comprehension', items: () => READING.map(r => r.id) },
  { id: 'write', name: 'Writing Workshop', img: 'b-write', sub: '3 paragraphs to write on paper', items: () => ['place', 'rules', 'season'] },
  { id: 'bee', name: 'Bee Garden', img: 'b-bee', sub: 'Spelling, listening & mistakes', items: () => ['spell', 'listen'] },
  { id: 'castle', name: 'Exam Castle', img: 'b-castle', sub: 'Mock exam: questions + writing', items: () => ['mock', 'paper'] },
];
const doneOf = id => SHOPS[id] ? S.papers.some(p => p.shop === id) : id === 'spell' ? (S.best.spell ?? 0) >= 7 : id === 'listen' ? (S.best.listen ?? 0) >= 7 : id === 'mock' ? (S.best.mock ?? 0) >= 18 : id === 'paper' ? S.papers.some(p => p.exam) : (S.best[id] ?? -1) >= 7;
const isleProg = I => { const it = I.items(); return [it.filter(doneOf).length, it.length]; };

function daysLeft2() { const exam = new Date(2026, 10, 13); const now = new Date(); now.setHours(0, 0, 0, 0); return Math.round((exam - now) / 864e5); }

function home() {
  const D = quest(); const d = daysLeft2(); const t = TODAY();
  const nDone = D.tasks.filter((_, i) => D.done[i]).length;
  const tot = ISLES.reduce((a, I) => { const [x, y] = isleProg(I); return [a[0] + x, a[1] + y]; }, [0, 0]);
  view(`
  <section class="hero2">
    <img class="hero-bg" src="img/hero.webp" alt="Susu and Neko in a pastel block world">
    <div class="hero-copy">
      <p class="kicker">P.2 English Adventure</p>
      <h1>Susu &amp; Neko's<br>Block World</h1>
      <p class="sub">Mine gems, build the dream house, collect stickers and beat the Exam Castle.</p>
      ${d >= 0 ? `<div class="countdown2"><b>${d}</b> day${d === 1 ? '' : 's'} to the English exam · Fri 13 Nov</div>` : '<div class="countdown2">You did it!</div>'}
    </div>
  </section>

  <div class="dash">
    <section class="panel quest">
      <div class="panel-h"><h2>Today's quest</h2><span class="chipc">${nDone}/3</span></div>
      <p class="muted sm">About 15 minutes. Finish all three for a sticker and a calendar stamp.</p>
      ${D.tasks.map((x, i) => { const [e, l, s] = taskLabel(x); return `<button class="qrow ${D.done[i] ? 'done' : ''}" data-q="${i}"><span class="qe">${D.done[i] ? '✓' : e}</span><span><b>${esc(l)}</b><small>${s}</small></span><span class="go">${D.done[i] ? 'Done' : 'Go'}</span></button>`; }).join('')}
      <div class="streak">${streakDays().map(x => { const k = dkey(x); const st = S.days[k] && S.days[k].all; return `<div class="sd ${st ? 'on' : ''} ${k === t ? 'today' : ''} ${x.getDate() === 13 ? 'exam' : ''}"><small>${x.toLocaleString('en-GB', { weekday: 'short' }).slice(0, 2)}</small><b>${x.getDate()}</b>${st ? '<i>★</i>' : x.getDate() === 13 ? '<i>🏆</i>' : ''}</div>`; }).join('')}</div>
    </section>
    <section class="panel">
      <div class="panel-h"><h2>Dream house</h2><span class="chipc">💎 ${S.stars}</span></div>
      ${houseHTML()}
      <p class="muted sm">Every ${STARS_PER_BLOCK} gems (first-try answers) builds one block.</p>
    </section>
  </div>

  <div class="sec-h"><h2>Choose an island</h2><span class="muted">${tot[0]}/${tot[1]} levels cleared</span></div>
  <div class="isles">${ISLES.map(I => { const [a, b] = isleProg(I); return `<button class="isle" data-i="${I.id}"><img src="img/${I.img}.webp" alt=""><div class="isle-t"><h3>${I.name}</h3><p>${I.sub}</p><div class="bar"><i style="width:${b ? a / b * 100 : 0}%"></i></div><small>${a}/${b} cleared</small></div></button>`; }).join('')}</div>

  <button class="book-cta" id="bookCta"><span class="bstk">${(S.stk.slice(-3).length ? S.stk.slice(-3) : ['a01', 'a02', 'a03']).map(stk).join('')}</span><span><b>My sticker books</b><small>${S.stk.length}/32 stickers collected</small></span><span class="go">Open</span></button>

  <section class="panel tips">
    <h2>How to finish your revision</h2>
    <ol><li><b>Every day:</b> do Today's quest (3 small jobs).</li><li><b>Every island:</b> clear each level with 7 or more out of 10.</li><li><b>Writing Workshop:</b> write each paragraph on real paper with the timer, then check it on the iPad.</li><li><b>Before the exam:</b> go to the Exam Castle for Part A (25 questions) and Part B (writing on paper).</li></ol>
  </section>
  <p class="foot">Made for revision at home. Content follows the P.2 English textbook, workbook, Grammar Time, reading and Writing 1–3.</p>`);
  app.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { sTap(); runTask(D.tasks[+b.dataset.q]); });
  app.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { sTap(); isle(b.dataset.i); });
  $('#bookCta').onclick = () => stickers();
}

const lvStars = id => { const b = S.best[id]; return b == null ? '<span class="lv-s off">◆◆◆</span>' : `<span class="lv-s">${'◆'.repeat(b >= 9 ? 3 : b >= 7 ? 2 : b >= 4 ? 1 : 0)}<span class="off">${'◆'.repeat(3 - (b >= 9 ? 3 : b >= 7 ? 2 : b >= 4 ? 1 : 0))}</span></span>`; };
const lvCard = (n, t, title, sub, right, attrs) => `<button class="lv ${doneOf(t) ? 'clear' : ''}" ${attrs}><span class="lv-n">${n}</span><span class="lv-t"><b>${esc(title)}</b><small>${sub}</small></span>${right}</button>`;

function isle(id) {
  const I = ISLES.find(x => x.id === id); const [a, b] = isleProg(I);
  let body = '';
  if (id === 'school' || id === 'mine') body = I.items().map((u, i) => lvCard(i + 1, u, ALL[u].title, esc(ALL[u].tag) + (ALL[u].sub ? ' · ' + esc(ALL[u].sub) : ''), lvStars(u), `data-t="${u}"`)).join('');
  if (id === 'forest') body = I.items().map((u, i) => lvCard(i + 1, u, ALL[u].title, `${esc(ALL[u].type)} · Skill: ${esc(ALL[u].skill)}`, lvStars(u), `data-t="${u}"`)).join('');
  if (id === 'write') body = SHOP_IDS.map(s => { const sh = SHOPS[s]; const last = S.papers.filter(p => p.shop === s).slice(-1)[0];
      return lvCard(sh.n, s, sh.title, `${sh.tag} · ${last ? `Last check: ${last.c + last.l}/30` : 'Plan → build → write on paper → check'}`, `<span class="lv-e">${sh.emo}</span>`, `data-s="${s}"`); }).join('') +
    `<div class="sec-h sm"><h3>More writing practice</h3></div>` +
    lvCard('▶', 'w5', 'Video: Home is Where the Heart is', 'Writing 2 · Parts A–B questions', lvStars('w5'), 'data-z="w5"') +
    lvCard('1', 'w1', 'Lesson: Plan my favourite place', 'Writing 1 · Part A', lvStars('w1'), 'data-w="w1"') +
    lvCard('2', 'w2', 'Lesson: Write the paragraph', 'Writing 1 · Parts B–C', lvStars('w2'), 'data-w="w2"') +
    lvCard('3', 'w3', 'Lesson: Places like home', 'Writing 2 · Part C rules table', lvStars('w3'), 'data-w="w3"') +
    (S.papers.length ? `<div class="panel hist"><h3>My writing record</h3>${S.papers.slice(-8).reverse().map(p => `<div class="hrow"><span>${p.date.slice(5)}</span><b>${esc(SHOPS[p.shop].title)}</b><span>${p.exam ? 'Exam' : 'Practice'} · ${p.mins} min</span><span class="hs">${p.c + p.l}/30</span></div>`).join('')}</div>` : '');
  if (id === 'bee') body = lvCard(1, 'spell', 'Spelling bee', 'Listen, then spell with letter tiles', S.best.spell != null ? `<span class="lv-b">Best ${S.best.spell}/10</span>` : '', 'data-x="spell"') +
    lvCard(2, 'listen', 'Listen & choose', 'Hear a word, pick the right one', S.best.listen != null ? `<span class="lv-b">Best ${S.best.listen}/10</span>` : '', 'data-x="listen"') +
    lvCard(3, 'mist', 'Mistake book', `${S.mistakes.length} question${S.mistakes.length === 1 ? '' : 's'} to try again`, '', 'data-x="mistakes"');
  if (id === 'castle') body = `<div class="panel castle"><p><b>Real exam practice.</b> Part A has 25 questions from every island. Part B is a writing task on real paper with a 20-minute timer, then you check it on the iPad.</p></div>` +
    lvCard('A', 'mock', 'Part A: Mock exam questions', '25 questions · everything mixed', S.best.mock != null ? `<span class="lv-b">Best ${S.best.mock}/25</span>` : '', 'data-x="mock"') +
    lvCard('B', 'paper', 'Part B: Writing paper', 'A surprise topic · 20 minutes · no hints', '<span class="lv-e">📝</span>', 'data-x="paper"');
  view(`<button class="back" id="bk">← Map</button>
  <section class="isle-head"><img src="img/${I.img}.webp" alt=""><div><p class="kicker">Island</p><h2>${I.name}</h2><p>${I.sub}</p><div class="bar"><i style="width:${b ? a / b * 100 : 0}%"></i></div><small>${a}/${b} cleared · ◆◆ = 7 or more out of 10</small></div></section>
  <div class="lvs">${body}</div>`);
  $('#bk').onclick = home;
  app.querySelectorAll('[data-t]').forEach(x => x.onclick = () => { sTap(); topic(x.dataset.t); });
  app.querySelectorAll('[data-s]').forEach(x => x.onclick = () => { sTap(); shop(x.dataset.s); });
  app.querySelectorAll('[data-w]').forEach(x => x.onclick = () => { sTap(); WPAGES[x.dataset.w](); });
  app.querySelectorAll('[data-z]').forEach(x => x.onclick = () => startQuiz(x.dataset.z));
  app.querySelectorAll('[data-x]').forEach(x => x.onclick = () => { const k = x.dataset.x; if (k === 'spell') spelling(); else if (k === 'paper') examPaper(); else if (k === 'mistakes') S.mistakes.length ? startQuiz('mistakes') : popText('Your mistake book is empty!'); else startQuiz(k); });
}

/* ---------- sticker books ---------- */
function stickers(bk = 'a') {
  const B = BOOKS.find(b => b.id === bk);
  view(`<button class="back" id="bk">← Map</button>
  <div class="book-tabs">${BOOKS.map(b => `<button class="mode-btn ${b.id === bk ? 'on' : ''}" data-b="${b.id}">${b.name} <small>${S.stk.filter(x => b.ids.includes(x)).length}/16</small></button>`).join('')}</div>
  <section class="album ${bk}">
    <h2>${B.name}</h2>
    <p class="muted">Win stickers by scoring 7+ in a level, checking your paper writing, finishing the mock exam and completing Today's quest.</p>
    <div class="slots">${B.ids.map((id, i) => S.stk.includes(id) ? `<button class="slot2 got" data-s="${id}" style="--r:${(i * 37 % 11) - 5}deg">${stk(id)}</button>` : `<div class="slot2"><span>${i + 1}</span></div>`).join('')}</div>
  </section>
  <div class="center"><button class="pill" id="rst">Reset all progress</button></div>`);
  $('#bk').onclick = home;
  app.querySelectorAll('[data-b]').forEach(b => b.onclick = () => stickers(b.dataset.b));
  app.querySelectorAll('.slot2.got').forEach(b => b.onclick = () => { b.classList.remove('wig'); void b.offsetWidth; b.classList.add('wig'); tone([[880, .06], [1175, .1]]); });
  let armed = false; $('#rst').onclick = () => { if (!armed) { armed = true; $('#rst').textContent = 'Tap again to clear everything'; return; } Object.keys(S).forEach(k => { if (k !== 'sound') delete S[k]; }); Object.assign(S, { stars: 0, best: {}, mistakes: [], cards: {}, stk: [], days: {}, plan: {}, papers: [], got: {}, chk: {} }); save(); updStars(); home(); };
}

/* ================= WRITING WORKSHOP ================= */
const STEPS = [['plan', '⛏️ 1 Plan'], ['build', '🧱 2 Build'], ['write', '✏️ 3 Write on paper'], ['check', '✅ 4 Check']];
function shopHead(sh, step) {
  return `<button class="back" id="bk">← Writing Workshop</button>
  <div class="shop-head" style="--c:${sh.col}"><span class="sh-e">${sh.emo}</span><div><p class="kicker">${esc(sh.tag)}</p><h2>${esc(sh.title)}</h2></div></div>
  <div class="steps">${STEPS.map(([k, l]) => `<button class="step2 ${k === step ? 'on' : ''}" data-st="${k}">${l}</button>`).join('')}</div>`;
}
function wireShop(sh) {
  $('#bk').onclick = () => isle('write');
  app.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { sTap(); shop(sh.id, b.dataset.st); });
  app.querySelectorAll('.wb').forEach(b => b.onclick = () => say(b.textContent));
  app.querySelectorAll('.tapsay').forEach(b => b.onclick = () => say(b.textContent));
}
const wordBank = sh => `<div class="panel"><h3>Word bank <small class="muted">tap to hear</small></h3><div class="chips">${sh.words.map(w => `<button class="chip wb">${esc(w)}</button>`).join('')}</div></div>`;
const tipsCard = sh => sh.teacherTips ? `<div class="panel red"><h3>What the teacher's red pen says</h3>${sh.teacherTips.map(([t, e]) => `<div class="rule"><b>${t}:</b> ${e}</div>`).join('')}</div>` : '';

function shop(id, step = 'plan', opt = {}) {
  const sh = SHOPS[id]; S.plan[id] = S.plan[id] || {}; const P = S.plan[id];
  if (step === 'plan') {
    if (sh.plan) {
      view(`${shopHead(sh, 'plan')}
      <div class="panel task"><b>Task:</b> ${esc(sh.task)}</div>
      <div class="plan-wrap"><div id="planQs"></div>
        <aside class="panel paper2 sticky"><div class="ptitle">${esc(sh.title)}</div><p class="pbody" id="pPrev"></p>
          <div class="btn-row"><button class="pill next" id="readP">🔈 Read it</button><button class="pill" id="clrP">↺ Start again</button></div>
          <p class="ptip">This is your plan. In step 3 you write it <b>on paper</b> without copying!</p></aside></div>
      ${tipsCard(sh)}${wordBank(sh)}
      <div class="center btn-row"><button class="pill next" id="nx">Next: Build sentences →</button></div>`);
      const draw = () => {
        $('#planQs').innerHTML = sh.plan.map((x, i) => { const o = x.opts(P); const cur = P[x.k];
          return `<div class="panel pq"><h4><span class="n">${i + 1}</span><span class="tapsay">${esc(x.q)}</span></h4>${o ? `<div class="chips">${o.map(v => { const val = Array.isArray(v) ? v[0] : v, lab = Array.isArray(v) ? `${v[1]} ${v[0]}` : v; const on = x.multi ? (cur || []).includes(val) : cur === val; return `<button class="chip ${on ? 'on' : ''}" data-k="${x.k}" data-v="${esc(val)}">${esc(lab)}</button>`; }).join('')}</div>` : '<span class="muted">Answer the question above first.</span>'}</div>`; }).join('');
        $('#pPrev').innerHTML = sh.lines(P).map(s => `<span class="seg">${fmt(s)}</span>`).join(' ');
        app.querySelectorAll('.pq .chip').forEach(c => c.onclick = () => {
          sTap(); const k = c.dataset.k, v = c.dataset.v, x = sh.plan.find(q => q.k === k);
          if (x.multi) { const a = P[k] = P[k] || []; const j = a.indexOf(v); if (j >= 0) a.splice(j, 1); else { a.push(v); if (a.length > x.multi) a.shift(); } }
          else { if (P[k] !== v && (k === 'season' || k === 'place')) Object.keys(P).forEach(z => delete P[z]); if (P[k] !== v && k === 'fest') delete P.how; P[k] = v; }
          save(); draw(); synth(sh.lines(P)[Math.min(sh.plan.indexOf(x) + (id === 'place' && sh.plan.indexOf(x) >= 3 ? 1 : 0), sh.lines(P).length - 1)]);
        });
        app.querySelectorAll('.tapsay').forEach(b => b.onclick = () => say(b.textContent));
      };
      draw();
      $('#readP').onclick = () => synth(sh.lines(P).join(' '));
      $('#clrP').onclick = () => { S.plan[id] = {}; save(); shop(id, 'plan'); };
    } else {
      /* rules: plan with the Places like home table */
      view(`${shopHead(sh, 'plan')}
      <div class="panel task"><b>Task:</b> ${esc(sh.task)}</div>
      <div class="lvs">
        ${lvCard('▶', 'w5', 'Watch & answer: Home is Where the Heart is', 'Parts A–B · why he leaves, how he feels, what the pictures mean', lvStars('w5'), 'id="vid"')}
        ${lvCard('✎', 'w3', 'Plan my places & rules', 'Part C · choose 3 places and 2 rules + reasons for each', lvStars('w3'), 'id="pl"')}
      </div>
      <div class="panel"><h3>Example from the worksheet</h3>${WRITING.t2.example.map(e => `<p><span class="tapsay">${esc(e[2])}</span> <small class="muted">(rule)</small><br><span class="tapsay rsn">${esc(e[3])}</span> <small class="muted">(reason)</small></p>`).join('')}</div>
      ${tipsCard(sh)}${wordBank(sh)}
      <div class="center btn-row"><button class="pill next" id="nx">Next: Build sentences →</button></div>`);
      $('#vid').onclick = () => startQuiz('w5'); $('#pl').onclick = () => writingHome();
    }
    wireShop(sh); $('#nx').onclick = () => shop(id, 'build');
    return;
  }
  if (step === 'build') {
    const { html, segs } = readerHTML([{ title: sh.title, type: 'Model writing', lines: sh.model }]);
    view(`${shopHead(sh, 'build')}
    <div class="lvs">
      ${lvCard('🧱', sh.quiz, 'Sentence quiz', 'Choose and order the right words', lvStars(sh.quiz), 'id="bq"')}
      ${lvCard('🔍', sh.fix, 'Fix it! Find the mistakes', 'Tap the wrong word in each sentence', lvStars(sh.fix), 'id="bf"')}
    </div>
    <div class="panel" id="mdl"><h3>Read the model aloud with Susu</h3><p class="muted sm">Listen, then say each sentence. Notice the capital letters, full stops and linking words.</p><div class="reader">${readerBar()}${html}</div></div>
    <div class="center btn-row"><button class="pill next" id="nx">Next: Write on paper →</button></div>`);
    wireShop(sh); wireReader($('#mdl'), segs);
    $('#bq').onclick = () => startQuiz(sh.quiz); $('#bf').onclick = () => startQuiz(sh.fix);
    $('#nx').onclick = () => shop(id, 'write');
    return;
  }
  if (step === 'write') return writeStep(sh, opt);
  if (step === 'check') return checkStep(sh, opt);
}

function writeStep(sh, opt) {
  let exam = !!opt.exam, mins = opt.mins || (exam ? 20 : sh.mins), left = mins * 60, running = false, peeks = 0;
  const id = sh.id;
  const draw = () => {
    view(`${opt.exam ? `<button class="back" id="bk">← Exam Castle</button><div class="shop-head exam" style="--c:#F6D2FF"><span class="sh-e">🏰</span><div><p class="kicker">Mock exam · Part B · Writing</p><h2>${esc(sh.title)}</h2></div></div>` : shopHead(sh, 'write')}
    <div class="write-grid">
      <section class="panel timer-card">
        ${MASCOT.think}
        <div class="clock" id="clock">${pad(Math.floor(left / 60))}:${pad(left % 60)}</div>
        ${opt.exam ? '' : `<div class="seg-ctl">${[10, 15, 20].map(m => `<button class="mode-btn ${m === mins ? 'on' : ''}" data-m="${m}">${m} min</button>`).join('')}</div>
        <div class="seg-ctl"><button class="mode-btn ${!exam ? 'on' : ''}" data-e="0">Practice (hints)</button><button class="mode-btn ${exam ? 'on' : ''}" data-e="1">Exam (no hints)</button></div>`}
        <div class="btn-row center"><button class="pill next big" id="go">▶ Start writing</button><button class="pill" id="pause" style="display:none">Pause</button></div>
        <button class="pill c-mint" id="fin">I've finished → Check</button>
      </section>
      <section class="panel paper-task">
        <h3>Get ready</h3>
        <ol class="ready"><li>Take your <b>writing paper</b> and a <b>pencil</b>.</li><li>Write the <b>date</b> at the top right.</li><li>Write the <b>title</b> in the middle: <b>${esc(sh.id === 'rules' ? 'Places like Home' : sh.title)}</b></li><li>Indent the first line. Write neatly.</li></ol>
        <div class="task2"><b>Task:</b> ${esc(sh.task)}</div>
        <div id="hints">${exam ? `<button class="pill" id="peek">Peek at the questions</button>` : `<h4>Answer these in your writing:</h4><ul>${sh.prompts.map(p => `<li class="tapsay">${esc(p)}</li>`).join('')}</ul>`}</div>
      </section>
    </div>`);
    $('#bk').onclick = () => opt.exam ? isle('castle') : isle('write');
    if (!opt.exam) app.querySelectorAll('[data-st]').forEach(b => b.onclick = () => shop(id, b.dataset.st));
    app.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { mins = +b.dataset.m; left = mins * 60; draw(); });
    app.querySelectorAll('[data-e]').forEach(b => b.onclick = () => { exam = b.dataset.e === '1'; draw(); });
    app.querySelectorAll('.tapsay').forEach(b => b.onclick = () => say(b.textContent));
    const pk = $('#peek'); if (pk) pk.onclick = () => { peeks++; $('#hints').innerHTML = `<h4>Answer these in your writing:</h4><ul>${sh.prompts.map(p => `<li>${esc(p)}</li>`).join('')}</ul>`; };
    const tick = () => { left--; const c = $('#clock'); if (c) { c.textContent = `${pad(Math.floor(Math.max(0, left) / 60))}:${pad(Math.max(0, left) % 60)}`; c.classList.toggle('low', left <= 120); }
      if (left === 120) { popText('2 minutes left! Check your full stops.'); tone([[660, .15], [660, .15]]); }
      if (left <= 0) { clearTimer(); tone([[784, .2], [659, .2], [523, .4]]); popText("Time's up! Pencil down."); setTimeout(() => shop(id, 'check', { exam, mins, peeks, examMode: opt.exam }), 1400); } };
    $('#go').onclick = () => { if (running) return; running = true; sTap(); $('#go').style.display = 'none'; $('#pause').style.display = ''; app.querySelectorAll('.seg-ctl').forEach(x => x.style.display = 'none'); TIMER = setInterval(tick, 1000); say('Start writing. You can do it!'); };
    $('#pause').onclick = () => { if (TIMER) { clearTimer(); $('#pause').textContent = 'Resume'; } else { TIMER = setInterval(tick, 1000); $('#pause').textContent = 'Pause'; } };
    $('#fin').onclick = () => { const used = Math.max(1, Math.round((mins * 60 - left) / 60)); clearTimer(); shop(id, 'check', { exam, mins: running ? used : mins, peeks, examMode: opt.exam }); };
  };
  draw();
}

function checkStep(sh, opt) {
  const id = sh.id; const key = id + (opt.examMode ? '-x' : '');
  const C = S.chk[key] = { c: {}, l: {} };
  const { html, segs } = readerHTML([{ title: sh.title, type: 'Model writing', lines: sh.model }]);
  view(`${opt.examMode ? `<button class="back" id="bk">← Exam Castle</button>` : shopHead(sh, 'check')}
  <div class="panel task"><b>Check your paper.</b> Read your writing slowly, one sentence at a time. Tick ✓ if you did it, cross ✗ if not. Fix it on your paper with your pencil.</div>
  <div class="check-grid">
    <section class="panel"><h3>Content <small class="muted">/15</small></h3>${sh.content.map((x, i) => `<div class="check2"><span>${esc(x)}</span><div class="tx"><button class="tick" data-g="c" data-i="${i}" data-v="1">✓</button><button class="tick x" data-g="c" data-i="${i}" data-v="0">✗</button></div></div>`).join('')}</section>
    <section class="panel"><h3>Language <small class="muted">/15</small></h3>${sh.language.map((x, i) => `<div class="check2"><span>${esc(x)}</span><div class="tx"><button class="tick" data-g="l" data-i="${i}" data-v="1">✓</button><button class="tick x" data-g="l" data-i="${i}" data-v="0">✗</button></div></div>`).join('')}</section>
  </div>
  <div class="panel score-card" id="sc"></div>
  <div class="panel" id="mdl"><h3>Compare with the model</h3><p class="muted sm">Did you write all the parts? Can you add a linking word (and, also, because, too)?</p><div class="reader">${readerBar()}${html}</div></div>
  <div class="center btn-row"><button class="pill next big" id="saveB">Save my check & get a sticker</button></div>`);
  if (opt.examMode) $('#bk').onclick = () => isle('castle'); else wireShop(sh);
  wireReader($('#mdl'), segs);
  const nC = sh.content.length, nL = sh.language.length;
  const marks = () => { const c = Object.values(C.c).filter(v => v === 1).length, l = Object.values(C.l).filter(v => v === 1).length; return [Math.round(c / nC * 15), Math.round(l / nL * 15)]; };
  const drawScore = () => {
    const [c, l] = marks(); const answered = Object.keys(C.c).length + Object.keys(C.l).length; const fixes = [...sh.content.filter((_, i) => C.c[i] === 0), ...sh.language.filter((_, i) => C.l[i] === 0)];
    $('#sc').innerHTML = `<div class="marks"><div><small>Content</small><b>${c}</b>/15</div><div><small>Language</small><b>${l}</b>/15</div><div class="tot"><small>Total</small><b>${c + l}</b>/30</div></div>
      <p class="muted sm">${answered < nC + nL ? `Tick or cross every line (${answered}/${nC + nL}).` : 'This is your own estimate. Show your paper to Mummy or your teacher too.'}</p>
      ${fixes.length ? `<div class="fixlist"><b>Fix on your paper now:</b><ul>${fixes.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>` : answered ? '<p class="good">Perfect check! Every part is there.</p>' : ''}`;
  };
  app.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { sTap(); const g = b.dataset.g, i = +b.dataset.i, v = +b.dataset.v; C[g][i] = v; b.parentNode.querySelectorAll('.tick').forEach(t => t.classList.toggle('on', t === b)); save(); drawScore(); });
  drawScore();
  $('#saveB').onclick = () => {
    const answered = Object.keys(C.c).length + Object.keys(C.l).length; if (answered < nC + nL) return popText('Tick or cross every line first!');
    const [c, l] = marks();
    S.papers.push({ shop: id, date: TODAY(), c, l, mins: opt.mins || sh.mins, exam: !!opt.examMode, practiceExam: !!opt.exam }); save();
    questTick(id);
    const k = 'paper-' + id + (opt.examMode ? '-x' : '') + '@' + TODAY();
    if (!S.got[k]) { S.got[k] = 1; save(); giveSticker(opt.examMode ? 'You finished the writing paper in the Exam Castle!' : `You wrote "${sh.title}" on paper and checked it!`); }
    else popText('Saved! Great writing.');
    sGood(); setTimeout(() => opt.examMode ? isle('castle') : isle('write'), 400);
  };
}

function examPaper() {
  const id = pick(SHOP_IDS);
  view(`<button class="back" id="bk">← Exam Castle</button>
  <section class="panel exam-intro"><img src="img/b-castle.webp" alt=""><div><p class="kicker">Mock exam · Part B</p><h2>Writing paper</h2>
    <p>The castle has chosen your topic:</p><div class="topic-pick">${SHOPS[id].emo} <b>${esc(SHOPS[id].title)}</b></div>
    <p class="muted">20 minutes. No hints (you can peek once if you are stuck). Write on real writing paper.</p>
    <div class="btn-row"><button class="pill next big" id="go">I'm ready →</button><button class="pill" id="again">Choose another topic</button></div></div></section>`);
  $('#bk').onclick = () => isle('castle');
  $('#go').onclick = () => writeStep(SHOPS[id], { exam: true, mins: 20 });
  $('#again').onclick = examPaper;
}

/* ---------- boot ---------- */
$('#homeBtn').onclick = home;
$('#stickerBtn').onclick = () => stickers();
const sb = $('#soundBtn'); const setSB = () => sb.textContent = S.sound ? '🔊' : '🔇'; setSB();
sb.onclick = () => { S.sound = !S.sound; save(); setSB(); };
updStars();
if ('speechSynthesis' in window) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = pickVoice; }
home();
