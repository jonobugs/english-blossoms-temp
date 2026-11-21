'use strict';
const KEY = 'teamManager.v1', ROLES = ['Left', 'Right', 'Setter', 'Receiver'];
const W = { pair: 3, lr: 2, team: 40, fit: 3 };
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const mk = (name, mode) => ({ id: uid(), name, mode, players: [], sel: [], pairs: {}, teamsC: {}, round: 0, nTeams: 2, courts: 1, refs: 'rotate', cur: null, hist: [], nid: 1 });
let db = load(), tab = 'lineup', pick = null, flash = [], lpFired = false, msgT, pairsOpen = false, viewI = null, lpPrev = false;

function link(r) {
    if (!r.hist) r.hist = r.cur ? [{ teams: r.cur.teams, subs: r.cur.subs, pl: [], fc: [] }] : [];
    r.cur = r.hist[r.hist.length - 1] || null;
}
function fixGenders(d) {
    d.rosters.forEach(link);
    d.rosters.forEach(r => { if (r.mode === 'gender') r.players.forEach(p => { if (p.gender !== 'Male' && p.gender !== 'Female') p.gender = 'Male'; }); });
}
function load() {
    try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.rosters && d.rosters.length) { fixGenders(d); return d; } } catch (e) { }
    const r = mk('My Roster', 'position');
    return { rosters: [r], active: r.id };
}
const R = () => db.rosters.find(r => r.id === db.active) || db.rosters[0];
const noCur = (k, v) => k === 'cur' ? undefined : v;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db, noCur)); } catch (e) { } };
const P = id => R().players.find(p => p.id === id);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------- rotation history & scoring ----------
const pk = (a, b) => a < b ? a + '-' + b : b + '-' + a;
const mem = t => Object.values(t).filter(v => v != null);
function adjust(teams, d) {
    const r = R();
    teams.forEach(t => {
        const m = mem(t);
        for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const k = pk(m[i], m[j]); r.pairs[k] = (r.pairs[k] || 0) + d; }
        if (m.length > 1) { const s = [...m].sort((a, b) => a - b).join('-'); r.teamsC[s] = (r.teamsC[s] || 0) + d; }
    });
}
const lr = (a, b) => (a.pos === 'Left' && b.pos === 'Right') || (a.pos === 'Right' && b.pos === 'Left');
// 0 = natural. Left can play anywhere, Right can play Setter/Receiver, Setter/Receiver rarely play Left/Right.
const fit = (p, role) => p.pos === role ? 0 : p.pos === 'Left' ? 1 : p.pos === 'Right' ? (role === 'Left' ? 2 : 1) : (role === 'Left' || role === 'Right' ? 4 : 3);

function score(teams) {
    const r = R(); let c = 0;
    teams.forEach(t => {
        const m = [];
        for (const k in t) {
            const p = t[k] != null && P(t[k]); if (!p) continue;
            m.push(p);
            if (r.mode === 'position') c += W.fit * fit(p, k);
        }
        for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) {
            const n = r.pairs[pk(m[i].id, m[j].id)] || 0;
            c += (lr(m[i], m[j]) ? W.lr : 1) * W.pair * n * n;
        }
        if (m.length > 1) c += W.team * (r.teamsC[m.map(p => p.id).sort((a, b) => a - b).join('-')] || 0);
    });
    return c;
}

function genPos(pool, n) {
    let rem = shuffle([...pool]); const teams = [];
    for (let i = 0; i < n; i++) {
        const t = {};
        for (const role of ROLES) {
            let b = null;
            for (const p of rem) if (!b || fit(p, role) < fit(b, role)) b = p;
            if (b) rem = rem.filter(p => p !== b);
            t[role] = b ? b.id : null;
        }
        teams.push(t);
    }
    return { teams, subs: rem.map(p => p.id) };
}
// Gender mode: deal everyone out so sizes differ by at most one; players beyond 4 are labelled Sub
function genGen(pool, n) {
    const order = [].concat(...['Male', 'Female'].map(g => shuffle(pool.filter(p => p.gender === g))));
    const buckets = Array.from({ length: n }, () => []);
    order.forEach((p, i) => buckets[i % n].push(p.id));
    return { teams: buckets.map(a => { const t = {}; a.forEach((id, i) => t[i < 4 ? 'P' + (i + 1) : 'S' + (i - 3)] = id); return t; }), subs: [] };
}

function generate() {
    const r = R(), pool = r.players.filter(p => r.sel.includes(p.id));
    if (!pool.length) return toast('Select players on the Lineup tab first');
    const g = r.mode === 'gender' ? genGen : genPos; let best = null;
    for (let i = 0; i < 1000; i++) { const c = g(pool, r.nTeams); c.cost = score(c.teams); if (!best || c.cost < best.cost) best = c; }
    const before = snap(r), pl = [], fc = [];
    best.teams.forEach(t => { for (const k in t) { const p = t[k] != null && P(t[k]); if (!p) continue; p.played++; pl.push(p.id); if (r.mode === 'position' && fit(p, k)) { p.forced = (p.forced || 0) + 1; fc.push(p.id); } } });
    adjust(best.teams, 1);
    r.hist.push({ teams: best.teams, subs: best.subs, pl, fc }); r.round = r.hist.length; link(r);
    r.sched = null; pick = null; viewI = null; save(); setTab('teams');
    toast('Round ' + r.round + ' created', 'Undo', () => restore(r, before));
}
function resetHist() {
    const r = R(); if (!r.hist.length) return;
    if (!confirm('Reset this session?\n\nThis clears all rounds, teams and pairing history. Player counts are kept.')) return;
    const before = snap(r);
    r.hist = []; r.pairs = {}; r.teamsC = {}; r.round = 0; link(r); r.sched = null; viewI = null; pick = null; pairsOpen = false; save(); render();
    toast('Session reset', 'Undo', () => restore(r, before));
}
function snap(r) { return JSON.stringify({ hist: r.hist, pairs: r.pairs, teamsC: r.teamsC, round: r.round, pl: r.players.map(p => [p.id, p.played, p.forced]) }); }
function restore(r, s) {
    const o = JSON.parse(s); r.hist = o.hist; r.pairs = o.pairs; r.teamsC = o.teamsC; r.round = o.round;
    o.pl.forEach(([id, a, b]) => { const p = r.players.find(x => x.id === id); if (p) { p.played = a; p.forced = b; } });
    link(r); r.sched = null; viewI = null; pick = null; save(); render();
}
// Delete every round after idx and roll back the counts and pairing stats they added
function truncateAfter(r, idx) {
    const before = snap(r); let n = 0;
    while (r.hist.length - 1 > idx) {
        const h = r.hist.pop(); n++;
        adjust(h.teams, -1);
        h.pl.forEach(id => { const p = P(id); if (p) p.played = Math.max(0, p.played - 1); });
        h.fc.forEach(id => { const p = P(id); if (p) p.forced = Math.max(0, (p.forced || 0) - 1); });
    }
    r.round = r.hist.length; link(r); r.sched = null; viewI = null; pick = null; save(); render();
    toast('Deleted ' + n + ' round' + (n > 1 ? 's' : ''), 'Undo', () => restore(r, before));
}
const vIdx = r => viewI == null ? r.hist.length - 1 : Math.min(viewI, r.hist.length - 1);
function stepRound(d) {
    const r = R(); if (!r.hist.length) return;
    if (d < 0 && lpPrev) { lpPrev = false; return; }
    const vi = vIdx(r), last = r.hist.length - 1;
    if (d < 0) { if (vi === 0) return; viewI = vi - 1; }
    else if (vi < last) viewI = vi + 1 === last ? null : vi + 1;
    else return generate();
    pick = null; render();
}
// Pair counts over rounds 0..vi (computed from the rounds themselves, so swaps are always reflected)
function pairCountsTo(r, vi) {
    const c = {};
    for (let i = 0; i <= vi; i++) r.hist[i].teams.forEach(t => { const m = mem(t); for (let a = 0; a < m.length; a++) for (let b = a + 1; b < m.length; b++) { const k = pk(m[a], m[b]); c[k] = (c[k] || 0) + 1; } });
    return c;
}
function pairInfo(r, vi) {
    const cnt = pairCountsTo(r, vi), c = r.hist[vi], rep = [];
    c.teams.forEach(t => { const m = mem(t); for (let a = 0; a < m.length; a++) for (let b = a + 1; b < m.length; b++) { const n = cnt[pk(m[a], m[b])]; if (n > 1) rep.push([m[a], m[b], n]); } });
    rep.sort((x, y) => y[2] - x[2]);
    const ids = [...new Set([].concat(...c.teams.map(mem), c.subs))], none = [];
    for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) if (!cnt[pk(ids[a], ids[b])]) none.push([ids[a], ids[b]]);
    return { rep, none };
}
function openPairs() { pairsOpen = true; render(); }
function renderPairs() {
    const el = $('#pairs'), r = R(), on = pairsOpen && tab === 'teams' && r.hist.length > 0;
    document.body.classList.toggle('pairsOn', !!on); el.classList.toggle('on', !!on);
    if (!on) return;
    const vi = vIdx(r), { rep, none } = pairInfo(r, vi), nm = id => { const p = P(id); return p ? esc(p.name) : '?'; };
    const row = (a, b, n) => `<div class="prow"><span>${nm(a)} &amp; ${nm(b)}</span>${n ? `<b>${n}×</b>` : ''}</div>`;
    el.innerHTML = `<div class="ph"><b>Round ${vi + 1} pairings</b><button class="lnk" onclick="pairsOpen=false;render()">Close</button></div>`
        + `<h3>Repeated (${rep.length})</h3>` + (rep.map(x => row(...x)).join('') || '<p class="legend">None. Every pairing is new.</p>')
        + `<h3 style="margin-top:12px">Not paired yet (${none.length})</h3>` + (none.map(x => row(x[0], x[1])).join('') || '<p class="legend">Everyone has played with everyone.</p>');
}

// ---------- tap-to-swap ----------
const get = s => s.t === 'b' ? R().cur.subs[s.k] : R().cur.teams[s.t][s.k];
const set = (s, v) => { if (s.t === 'b') R().cur.subs[s.k] = v; else R().cur.teams[s.t][s.k] = v; };
function tapSlot(t, k) {
    const c = R().cur;
    if (!pick) { pick = { t, k }; return render(); }
    if (pick.t === t && pick.k === k) { pick = null; return render(); }
    const a = pick, b = { t, k };
    adjust(c.teams, -1);
    const x = get(a); set(a, get(b)); set(b, x);
    c.subs = c.subs.filter(v => v != null);
    adjust(c.teams, 1);
    flash = [a, b]; pick = null; save(); render(); flash = [];
}

// ---------- schedule ----------
function build(n, courts, refs) {
    const ids = [...Array(n)].map((_, i) => i + 1), rounds = [], rc = {}, pl = {};
    ids.forEach(i => { rc[i] = 0; pl[i] = 0; });
    if (n === 6 && courts === 2) { // two groups of three, each plays 1v2, 2v3, 3v1
        const gs = [ids.slice(0, 3), ids.slice(3)];
        for (let k = 0; k < 3; k++) rounds.push(gs.map((g, c) => ({ court: c + 1, a: g[k], b: g[(k + 1) % 3], ref: refs === 'none' ? null : g[(k + 2) % 3] })));
        return rounds;
    }
    if (n === 3) { // natural order, the third team refs
        return [[1, 2, 3], [2, 3, 1], [3, 1, 2]].map(([a, b, c]) => [{ court: 1, a, b, ref: refs === 'none' ? null : c }]);
    }
    const pairs = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([ids[i], ids[j]]);
    shuffle(pairs);
    while (pairs.length) {
        const used = new Set(), games = [];
        for (let c = 1; c <= courts; c++) {
            let bi = -1, bs = 1e9;
            pairs.forEach((p, i) => { if (used.has(p[0]) || used.has(p[1])) return; const s = pl[p[0]] + pl[p[1]]; if (s < bs) { bs = s; bi = i; } });
            if (bi < 0) break;
            const p = pairs.splice(bi, 1)[0];
            used.add(p[0]); used.add(p[1]); pl[p[0]]++; pl[p[1]]++;
            games.push({ court: c, a: p[0], b: p[1], ref: null });
        }
        const free = shuffle(ids.filter(i => !used.has(i))).sort((x, y) => rc[x] - rc[y]);
        if (refs !== 'none' && free.length) { rc[free[0]]++; games.forEach(g => g.ref = free[0]); }
        rounds.push(games);
    }
    return rounds;
}
function setOpt(k, v) { R()[k] = v; R().sched = null; save(); render(); }
function reshuffle() { R().sched = null; render(); }
const freeTeams = (games, n) => { const used = new Set(); games.forEach(g => { used.add(g.a); used.add(g.b); }); return Array.from({ length: n }, (_, i) => i + 1).filter(i => !used.has(i)); };
function refTotals(rounds, skip) {
    const rc = {};
    rounds.forEach((g, i) => { if (i !== skip && g[0] && g[0].ref) rc[g[0].ref] = (rc[g[0].ref] || 0) + 1; });
    return rc;
}
// After a manual change, re-plan the later rounds so ref duty stays as even as possible.
// Rounds the user edited by hand (lock) are never touched.
function replan(rounds, from, n) {
    const rc = {};
    rounds.forEach((g, i) => { if (i < from && g[0] && g[0].ref) rc[g[0].ref] = (rc[g[0].ref] || 0) + 1; });
    for (let i = from; i < rounds.length; i++) {
        const g = rounds[i];
        if (g[0].lock) { if (g[0].ref) rc[g[0].ref] = (rc[g[0].ref] || 0) + 1; continue; }
        const free = shuffle(freeTeams(g, n)).sort((x, y) => (rc[x] || 0) - (rc[y] || 0));
        if (!free.length) continue;
        g.forEach(x => x.ref = free[0]);
        rc[free[0]] = (rc[free[0]] || 0) + 1;
    }
}
function pickRef(ri) {
    const r = R(), { n, rounds } = r.sched, games = rounds[ri], free = freeTeams(games, n), rc = refTotals(rounds, ri), cur = games[0].ref;
    openSheet(`<h2>Round ${ri + 1} ref</h2>` + free.map(t => `<div class="ritem${t === cur ? ' on' : ''}" onclick="setRef(${ri},${t})"><b>Team ${t}</b><small>refs ${rc[t] || 0}× in other rounds</small></div>`).join('')
        + `<div class="ritem${cur ? '' : ' on'}" onclick="setRef(${ri},0)"><b>No ref</b></div><div class="acts"><button class="lnk" onclick="closeSheet()">Cancel</button></div>`);
}
function setRef(ri, t) {
    const r = R(), { n, rounds } = r.sched;
    rounds[ri].forEach(x => { x.ref = t || null; x.lock = true; });
    if (r.refs !== 'none') replan(rounds, ri + 1, n);
    save(); closeSheet(); render(); toast('Ref changed');
}

// ---------- rendering ----------
function render() {
    const r = R();
    $('#rosterBtn').innerHTML = esc(r.name) + ' ▾';
    $('#count').textContent = r.sel.length + ' in';
    renderLineup(); renderTeams(); renderSched(); renderRoster(); renderPairs();
    document.querySelectorAll('.tab').forEach(s => s.classList.toggle('on', s.id === tab));
    document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
}
function setTab(t) { tab = t; pick = null; render(); window.scrollTo(0, 0); }

function renderLineup() {
    const r = R(), el = $('#lineup');
    if (!r.players.length) { el.innerHTML = '<p class="empty">No players yet.<br>Add them in the Roster tab.</p>'; return; }
    const chip = p => `<button class="chip${r.sel.includes(p.id) ? ' on' : ''}" data-id="${p.id}" onclick="toggle(${p.id})">${esc(p.name)}</button>`;
    const sorted = a => [...a].sort((x, y) => y.played - x.played);
    const body = r.mode === 'position'
        ? `<div class="quads">${ROLES.map(q => `<div class="quad"><h3>${q}</h3><div class="chips">${sorted(r.players.filter(p => p.pos === q)).map(chip).join('')}</div></div>`).join('')}</div>`
        : `<div class="chips big">${sorted(r.players).map(chip).join('')}</div>`;
    el.innerHTML = body + `<div class="bar"><span>${r.sel.length} in</span><div class="step"><button onclick="teamsN(-1)">−</button><b>${r.nTeams}</b><button onclick="teamsN(1)">+</button><small>teams</small></div><button class="go" onclick="generate()">Generate</button></div>`;
}
function toggle(id) { if (lpFired) { lpFired = false; return; } const r = R(), i = r.sel.indexOf(id); i < 0 ? r.sel.push(id) : r.sel.splice(i, 1); save(); render(); }
function teamsN(d) { const r = R(); r.nTeams = Math.max(1, Math.min(10, r.nTeams + d)); save(); render(); }

function renderTeams() {
    const r = R(), el = $('#teams');
    if (!r.hist.length) { el.innerHTML = '<p class="empty">No teams yet.<br>Pick players on Lineup and tap Generate.</p>'; return; }
    const vi = vIdx(r), c = r.hist[vi], latest = vi === r.hist.length - 1, pos = r.mode === 'position';
    const rep = pairInfo(r, vi).rep.length;
    const cell = (t, k, label, id) => {
        const p = id != null && P(id);
        const on = latest && pick && pick.t === t && pick.k === k, fl = latest && flash.some(f => f.t === t && f.k === k);
        const a = typeof t === 'number' ? t : `'${t}'`, b = typeof k === 'number' ? k : `'${k}'`;
        const slotted = typeof t === 'number';
        const colour = p ? ' t-' + (pos ? (slotted ? k : p.pos) : p.gender).toLowerCase() : '';
        const lead = pos ? badge(slotted ? k : (p && p.pos)) : (label ? `<i>${label}</i>` : '') + badge(p && p.gender);
        return `<button class="cell${colour}${on ? ' sel' : ''}${fl ? ' flash' : ''}"${latest ? ` onclick="tapSlot(${a},${b})"` : ' tabindex="-1"'}>${lead}<span>${p ? esc(p.name) : '—'}</span>${p && pos && slotted && fit(p, k) ? '<em>*</em>' : ''}</button>`;
    };
    const lab = k => pos ? k : (k[0] === 'S' ? 'Sub' : '');
    const ico = d => `<svg viewBox="0 0 24 24"><path d="${d}"/></svg>`;
    el.innerHTML = `<div class="tbar"><div><b>Round ${vi + 1}</b> <span class="of">of ${r.hist.length}</span><small><button class="plink" onclick="openPairs()">${rep ? rep + ' repeated pairing' + (rep > 1 ? 's' : '') : 'All teammate pairings new'}</button></small></div>`
        + `<div class="nav"><button class="ic" id="prevBtn" aria-label="Previous round"${vi === 0 ? ' disabled' : ''} onclick="stepRound(-1)">${ico('M15 6l-6 6 6 6')}</button>`
        + `<button class="ic" aria-label="${latest ? 'New round' : 'Next round'}" onclick="stepRound(1)">${ico('M9 6l6 6-6 6')}</button><span class="sep"></span>`
        + `<button class="ic" aria-label="Reset" onclick="resetHist()">${ico('M3 12a9 9 0 1 0 3-6.7M3 4v5h5')}</button></div></div>`
        + (latest ? '' : '<p class="pasthint">Past round, read-only. Hold ‹ to delete the rounds after this one.</p>')
        + `<div class="tgrid${latest ? '' : ' ro'}">${c.teams.map((t, i) => `<div class="team"><h3>Team ${i + 1}</h3>${Object.keys(t).map(k => cell(i, k, lab(k), t[k])).join('') || '<small>Empty</small>'}</div>`).join('')}`
        + (c.subs.length ? `<div class="team wide"><h3>Bench</h3><div class="chips">${c.subs.map((id, i) => cell('b', i, '', id)).join('')}</div></div>` : '') + '</div>'
        + '<p class="empty" style="margin:14px 0">' + (latest ? 'Tap two players to swap them.' + (pos ? '<br>* = playing out of position' : '') : '') + '</p>';
}

function renderSched() {
    const r = R(), el = $('#schedule');
    if (!r.cur) { el.innerHTML = '<p class="empty">Generate teams first.</p>'; return; }
    const n = r.cur.teams.length;
    if (n < 2) { el.innerHTML = '<p class="empty">You need at least 2 teams.</p>'; return; }
    if (!r.sched || r.sched.n !== n) { r.sched = { n, rounds: build(n, r.courts, r.refs) }; save(); }
    const seg = (k, opts) => `<div class="seg">${opts.map(([v, l]) => `<button class="${r[k] === v ? 'on' : ''}" onclick="setOpt('${k}',${typeof v === 'number' ? v : `'${v}'`})">${l}</button>`).join('')}</div>`;
    const refTag = (x, i, free) => x.ref
        ? (free ? `<button class="ref" onclick="pickRef(${i})">Ref · Team ${x.ref} ▾</button>` : `<span class="ref">Ref · Team ${x.ref}</span>`)
        : (free ? `<button class="ref none" onclick="pickRef(${i})">No ref ▾</button>` : '');
    el.innerHTML = seg('courts', [[1, '1 court'], [2, '2 courts']]) + seg('refs', [['rotate', 'Teams ref'], ['none', 'Self-ref']])
        + '<button class="lnk" onclick="reshuffle()">Reshuffle</button>'
        + r.sched.rounds.map((g, i) => {
            const free = freeTeams(g, n).length;
            return `<div class="rnd"><h3>Round ${i + 1}</h3>${g.map(x => `<div class="game">${r.courts > 1 ? `<small>Court ${x.court}</small>` : ''}<b>Team ${x.a}</b> vs <b>Team ${x.b}</b>${refTag(x, i, free)}</div>`).join('')}</div>`;
        }).join('');
}

function renderRoster() {
    const r = R();
    $('#roster').innerHTML = (r.players.length
        ? r.players.map(p => `<div class="rw"><div class="del">Delete</div><div class="rin" data-id="${p.id}"><b>${esc(p.name)}</b>${badge(r.mode === 'position' ? p.pos : p.gender)}<i>${p.played}</i><button class="x" onclick="event.stopPropagation();rmPlayer(${p.id})" aria-label="Delete">✕</button></div></div>`).join('')
        : '<p class="empty">No players yet.<br>Tap + to add one.</p>') + '<button class="fab" onclick="editPlayer()">+</button>';
}

// ---------- players ----------
function editPlayer(id) {
    const r = R(), p = id ? P(id) : null, pos = r.mode === 'position';
    const cur = p ? (pos ? p.pos : p.gender) : (pos ? 'Left' : 'Male');
    const vals = pos ? ROLES : ['Male', 'Female'];
    openSheet(`<h2>${p ? 'Edit player' : 'Add players'}</h2>
        <div class="nrow"><input id="fName" placeholder="Name" value="${p ? esc(p.name) : ''}" autocomplete="off" enterkeyhint="done"><button class="go" onclick="savePlayer(${id || 0})">${p ? 'Save' : 'Add'}</button></div>
        <div id="fMsg" class="fmsg"></div>
        <div class="badges" id="fSeg">${vals.map(v => `<button type="button" class="bdg c-${BADGE[v][1]}${cur === v ? ' on' : ''}" data-v="${v}">${BADGE[v][0]}</button>`).join('')}</div>
        <small class="legend">${vals.map(v => BADGE[v][0] + ' ' + (v === 'Receiver' ? 'Passer' : v)).join(' · ')}</small>
        ${p ? `<label class="plab">Played <input id="fPlayed" type="number" inputmode="numeric" min="0" value="${p.played}"></label>` : ''}
        <div class="acts"><button class="lnk" onclick="closeSheet()">${p ? 'Cancel' : 'Done'}</button></div>`);
    $('#fName').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); savePlayer(id || 0); } });
    if (!p) $('#fName').focus();
}
function savePlayer(id) {
    const r = R(), name = $('#fName').value.trim(), v = $('#fSeg .on').dataset.v;
    if (!name) return fmsg('Please enter a name', true);
    const p = id ? P(id) : { id: r.nid++, played: 0, forced: 0, pos: 'Left', gender: 'Male' };
    p.name = name; if (r.mode === 'position') p.pos = v; else p.gender = v;
    if (id) { const f = $('#fPlayed'); if (f && f.value !== '') p.played = Math.max(0, parseInt(f.value, 10) || 0); }
    else r.players.push(p);
    save(); if (id) closeSheet(); else finishSave(name); render();
}
function rmPlayer(id) {
    const r = R(), i = r.players.findIndex(p => p.id === id), p = r.players[i], wasSel = r.sel.includes(id);
    r.players.splice(i, 1); r.sel = r.sel.filter(x => x !== id); save(); render();
    toast('Removed ' + p.name, 'Undo', () => { r.players.splice(i, 0, p); if (wasSel) r.sel.push(id); save(); render(); });
}

function finishSave(name) {
    $('#fName').value = ''; $('#fName').focus();
    fmsg('✓ ' + name + ' added');
}
function fmsg(text, bad) {
    const m = $('#fMsg'); if (!m) return;
    m.textContent = text; m.classList.toggle('bad', !!bad); m.classList.add('show');
    clearTimeout(msgT); msgT = setTimeout(() => m.classList.remove('show'), 2200);
}

// ---------- rosters, backup ----------
function openRosters() {
    const items = db.rosters.map(r => `<div class="rw rst"><div class="del">Reset counts</div><div class="ritem${r.id === db.active ? ' on' : ''}" data-rid="${r.id}" onclick="switchRoster('${r.id}')"><b>${esc(r.name)}</b><small>${r.players.length} players · ${r.mode === 'gender' ? 'Gender' : 'Positions'}</small>${db.rosters.length > 1 ? `<button class="x" style="display:inline" onclick="event.stopPropagation();delRoster('${r.id}')">✕</button>` : ''}</div></div>`).join('');
    openSheet(`<h2>Rosters</h2>${items}<p class="legend" style="margin:8px 0">Swipe a roster left to reset its counts.</p><div class="newr"><input id="nName" placeholder="New roster name" autocomplete="off"><div class="seg"><button type="button" class="on" data-v="position">Positions</button><button type="button" data-v="gender">Gender</button></div><button class="go" onclick="addRoster()">Add</button></div><div class="acts"><button class="lnk" onclick="exportData()">Export backup</button><label class="lnk">Import<input type="file" accept=".json" hidden onchange="importData(this.files[0])"></label></div>`);
}
function switchRoster(id) {
    if (id === db.active) { const n = prompt('Rename roster', R().name); if (n && n.trim()) { R().name = n.trim(); save(); render(); openRosters(); } return; }
    db.active = id; pick = null; viewI = null; save(); closeSheet(); render();
}
function addRoster() {
    const name = $('#nName').value.trim(); if (!name) return toast('Please enter a name');
    const r = mk(name, $('.newr .seg .on').dataset.v); db.rosters.push(r); db.active = r.id; viewI = null; save(); closeSheet(); render(); setTab('roster');
}
function delRoster(id) {
    if (!confirm('Delete this roster and all its players?')) return;
    db.rosters = db.rosters.filter(r => r.id !== id); if (db.active === id) db.active = db.rosters[0].id;
    save(); render(); openRosters();
}
function exportData() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(db, noCur)], { type: 'application/json' }));
    a.download = 'team-manager-backup.json'; a.click();
}
function importData(f) {
    if (!f) return; const fr = new FileReader();
    fr.onload = () => {
        try {
            const d = JSON.parse(fr.result); if (!d.rosters || !d.rosters.length) throw 0;
            if (!confirm('Replace all current data with this backup?')) return;
            fixGenders(d); db = d; save(); closeSheet(); render();
        } catch (e) { toast('Not a valid backup file'); }
    };
    fr.readAsText(f);
}

// ---------- sheet & toast ----------
function openSheet(h) { const s = $('#sheet'); s.innerHTML = `<div class="panel">${h}</div>`; s.classList.add('on'); }
function closeSheet() { $('#sheet').classList.remove('on'); }
$('#sheet').addEventListener('click', e => {
    if (e.target.id === 'sheet') return closeSheet();
    const b = e.target.closest('.seg button, .badges button');
    if (b) { b.parentNode.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); }
});
let tt;
function toast(msg, label, fn) {
    const t = $('#toast'); t.innerHTML = esc(msg) + (label ? ` <button>${label}</button>` : ''); t.className = 'show';
    if (label) t.querySelector('button').onclick = () => { fn(); t.className = ''; };
    clearTimeout(tt); tt = setTimeout(() => t.className = '', label ? 12000 : 3500);
}

// ---------- swipe to delete / tap to edit ----------
(() => {
    let el, sx, sy, dx = 0, mv = false; const L = $('#roster');
    L.addEventListener('touchstart', e => { el = e.target.closest('.rin'); if (!el) return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; mv = false; }, { passive: true });
    L.addEventListener('touchmove', e => {
        if (!el) return;
        const x = e.touches[0].clientX - sx, y = e.touches[0].clientY - sy;
        if (!mv && Math.abs(y) > Math.abs(x)) { el = null; return; }
        mv = true; dx = Math.min(0, x); el.style.transition = 'none'; el.style.transform = `translateX(${dx}px)`;
    }, { passive: true });
    L.addEventListener('touchend', () => {
        if (!el) return; el.style.transition = '';
        if (dx < -100) rmPlayer(+el.dataset.id); else el.style.transform = '';
        el = null;
    });
    L.addEventListener('click', e => {
        const r = e.target.closest('.rin');
        if (r && !e.target.closest('.x')) { if (!mv) editPlayer(+r.dataset.id); mv = false; }
    });
})();

// ---------- badges ----------
const BADGE = { Left: ['L', 'left'], Right: ['R', 'right'], Setter: ['S', 'setter'], Receiver: ['P', 'receiver'], Male: ['M', 'male'], Female: ['F', 'female'] };
const badge = v => BADGE[v] ? `<span class="bdg c-${BADGE[v][1]}">${BADGE[v][0]}</span>` : '';

// ---------- swipe-left helper (mouse + touch) ----------
let swiped = 0;
function swipeLeft(root, sel, th, move, commit) {
    let el, sx, sy, dx, drag;
    root.addEventListener('pointerdown', e => { el = e.target.closest(sel); if (!el) return; sx = e.clientX; sy = e.clientY; dx = 0; drag = false; });
    root.addEventListener('pointermove', e => {
        if (!el) return;
        const x = e.clientX - sx, y = e.clientY - sy;
        if (!drag) {
            if (Math.abs(y) > 10 && Math.abs(y) > Math.abs(x)) { el = null; return; }
            if (x > -8) return;
            drag = true; try { el.setPointerCapture(e.pointerId); } catch (_) {}
        }
        dx = Math.min(0, x); move(el, dx, dx < -th, false);
    });
    root.addEventListener('pointerup', () => {
        if (!el) return;
        const t = el, hit = drag && dx < -th, d = drag; el = null;
        if (d) { swiped = Date.now(); move(t, 0, false, true); if (hit) commit(t); }
    });
    root.addEventListener('pointercancel', () => { if (el) { move(el, 0, false, true); el = null; } });
    root.addEventListener('click', e => { if (Date.now() - swiped < 400 && e.target.closest(sel)) { e.stopPropagation(); e.preventDefault(); } }, true);
}
const slide = (el, x, end) => { el.style.transition = end ? 'transform .2s' : 'none'; el.style.transform = end ? '' : `translateX(${x}px)`; };

// Swipe the roster title: clear the selected players (undoable)
function clearSel() {
    const r = R(); if (!r.sel.length) return toast('Nothing selected');
    const prev = [...r.sel]; r.sel = []; save(); render();
    toast('Cleared ' + prev.length + ' selected', 'Undo', () => { r.sel = prev; save(); render(); });
}
swipeLeft($('header'), '#rosterBtn', 80, (el, dx, ready, end) => {
    slide(el, Math.max(dx, -120) * 0.5, end);
    const h = $('#ttlHint'); h.style.opacity = end ? 0 : Math.min(1, -dx / 80);
    h.textContent = ready ? 'Release to clear' : 'Keep swiping…'; h.classList.toggle('ready', ready && !end);
}, clearSel);

// Swipe a roster row in the Rosters dialog: reset every player's count (undoable)
function resetCounts(rid) {
    const r = db.rosters.find(x => x.id === rid); if (!r) return;
    const prev = r.players.map(p => [p.id, p.played]); r.players.forEach(p => p.played = 0); save(); closeSheet(); render();
    toast('Counts reset: ' + r.name, 'Undo', () => { prev.forEach(([id, v]) => { const p = r.players.find(x => x.id === id); if (p) p.played = v; }); save(); render(); });
}
swipeLeft($('#sheet'), '.rst .ritem', 80, (el, dx, ready, end) => slide(el, dx, end), el => resetCounts(el.dataset.rid));

// Long-press a name on Lineup: edit it (selection is not changed)
(() => {
    let t, x0, y0; const L = $('#lineup');
    L.addEventListener('pointerdown', e => {
        lpFired = false; const c = e.target.closest('.chip'); if (!c) return;
        x0 = e.clientX; y0 = e.clientY;
        t = setTimeout(() => { lpFired = true; editPlayer(+c.dataset.id); }, 500);
    });
    L.addEventListener('pointermove', e => { if (t && Math.hypot(e.clientX - x0, e.clientY - y0) > 10) clearTimeout(t); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => L.addEventListener(ev, () => clearTimeout(t)));
    L.addEventListener('contextmenu', e => { if (e.target.closest('.chip')) e.preventDefault(); });
})();

// Hold ‹ while viewing an earlier round: delete the rounds after it
(() => {
    let t; const T = $('#teams');
    T.addEventListener('pointerdown', e => {
        lpPrev = false; if (!e.target.closest('#prevBtn')) return;
        const r = R();
        t = setTimeout(() => { if (r.hist.length && vIdx(r) < r.hist.length - 1) { lpPrev = true; if (navigator.vibrate) navigator.vibrate(30); truncateAfter(r, vIdx(r)); } }, 600);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => T.addEventListener(ev, () => clearTimeout(t)));
    T.addEventListener('contextmenu', e => { if (e.target.closest('#prevBtn')) e.preventDefault(); });
})();
$('#toast').addEventListener('click', e => { if (!e.target.closest('button')) $('#toast').className = ''; });

render();
