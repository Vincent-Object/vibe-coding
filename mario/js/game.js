/* game.js — engine: physics, collisions, entities, state machine, rendering. */
'use strict';

const cvs = document.getElementById('screen');
const ctx = cvs.getContext('2d');
ctx.imageSmoothingEnabled = false;

const TILE = 16, VIEW_W = 256, VIEW_H = 240;
const SOLID = new Set([1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 14]);
const GRAV = 0.75, GRAV_HOLD = 0.3, MAX_FALL = 7;
const MUSIC_OF = { ow: 'overworld', ug: 'underground', ca: 'castle', ni: 'athletic' };

// ------------------------------------------------------------------ input
const keys = {};
let jumpEdge = false, fireEdge = false, enterEdge = false;
window.addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
  AudioSys.init();
  if (e.repeat) return;
  keys[e.key] = true;
  if (e.key === 'ArrowUp' || e.key === ' ') jumpEdge = true;
  if (e.key === 'x' || e.key === 'X' || e.key === 'Shift') fireEdge = true;
  if (e.key === 'Enter') enterEdge = true;
  if (e.key === 'm' || e.key === 'M') AudioSys.toggleMute();
});
window.addEventListener('keyup', (e) => { keys[e.key] = false; });
const held = {
  left: () => keys.ArrowLeft, right: () => keys.ArrowRight,
  up: () => keys.ArrowUp || keys[' '], down: () => keys.ArrowDown,
  run: () => keys.x || keys.X || keys.Shift,
};

// ------------------------------------------------------------------ state
const G = {
  state: 'title',     // title intro play flag axe msg dying gameover win
  level: 0, sel: 0,
  score: 0, coins: 0, lives: 3,
  top: parseInt(localStorage.getItem('smb_top') || '0', 10),
  unlock: parseInt(localStorage.getItem('smb_unlock') || '0', 10),
  frame: 0, time: 0, camX: 0, paused: false,
  tiles: null, lvl: null,
  ents: [], pending: [], parts: [], pops: [], bounce: [],
  mario: null, t: 0, // generic state timer
  msgLines: [], flagY: 0, axeStep: 0,
};

function newMario() {
  return {
    x: 40, y: 0, vx: 0, vy: 0, w: 10, h: 14,
    power: 0, dir: 1, onGround: false, crouch: false,
    animT: 0, invuln: 0, prevBottom: 0, fireCD: 0, hidden: false,
  };
}
function marioH(m) { return m.power > 0 ? (m.crouch ? 14 : 28) : 14; }

function loadLevel(i) {
  const lvl = LEVELS[i];
  G.lvl = lvl;
  G.tiles = lvl.tiles.map((r) => r.slice());
  G.time = lvl.time;
  G.camX = 0;
  G.ents = []; G.parts = []; G.pops = []; G.bounce = [];
  G.pending = lvl.ents.map((e) => Object.assign({ spawned: false }, e));
  const keepPower = G.mario ? G.mario.power : 0;
  G.mario = newMario();
  G.mario.power = keepPower;
  G.mario.h = marioH(G.mario);
  G.mario.y = 13 * TILE - G.mario.h;
  G.state = 'intro'; G.t = 0;
  G.unlock = Math.max(G.unlock, i);
  localStorage.setItem('smb_unlock', String(G.unlock));
  AudioSys.stopSong();
}
function startGame(levelIdx) {
  G.level = levelIdx; G.score = 0; G.coins = 0; G.lives = 3;
  G.mario = null;
  loadLevel(levelIdx);
}
function nextLevel() {
  if (G.level + 1 >= LEVELS.length) { G.state = 'win'; G.t = 0; AudioSys.jingle('win'); saveTop(); return; }
  G.level++;
  loadLevel(G.level);
}
function saveTop() {
  if (G.score > G.top) { G.top = G.score; localStorage.setItem('smb_top', String(G.top)); }
}
function addScore(n, x, y) {
  G.score += n;
  if (x !== undefined) G.pops.push({ x, y, txt: String(n), t: 0 });
}
function addCoin() {
  G.coins++;
  if (G.coins >= 100) { G.coins -= 100; G.lives++; AudioSys.sfx('1up'); }
}

// ------------------------------------------------------------------ tiles
function tileAt(px, py) {
  const c = Math.floor(px / TILE), r = Math.floor(py / TILE);
  if (c < 0 || c >= G.lvl.len) return 1; // walls at level edges
  if (r < 0 || r >= ROWS) return 0;
  return G.tiles[r][c];
}
function setTile(c, r, v) { if (r >= 0 && r < ROWS && c >= 0 && c < G.lvl.len) G.tiles[r][c] = v; }
function isSolid(id) { return SOLID.has(id); }
function solidAt(px, py) { return isSolid(tileAt(px, py)); }

function bumpBlock(c, r) {
  const id = G.tiles[r][c];
  const m = G.mario;
  if (id === 2) {
    if (m.power > 0) {
      setTile(c, r, 0);
      AudioSys.sfx('break');
      addScore(50);
      for (let i = 0; i < 4; i++) {
        G.parts.push({
          x: c * TILE + 4 + (i % 2) * 6, y: r * TILE + (i < 2 ? 0 : 8),
          vx: (i % 2 ? 1.3 : -1.3), vy: i < 2 ? -4.5 : -2.5, t: 0,
        });
      }
    } else {
      AudioSys.sfx('bump');
      G.bounce.push({ c, r, t: 0 });
    }
    killAtop(c, r);
  } else if (id === 3) {
    setTile(c, r, 6);
    G.bounce.push({ c, r, t: 0 });
    G.ents.push({ t: 'coinpop', x: c * TILE + 3, y: r * TILE - 14, vy: -5, y0: r * TILE - 14 });
    addCoin(); addScore(200, c * TILE, r * TILE - 16);
    AudioSys.sfx('coin');
    killAtop(c, r);
  } else if (id === 4) {
    setTile(c, r, 6);
    G.bounce.push({ c, r, t: 0 });
    AudioSys.sfx('sprout');
    const type = m.power === 0 ? 'mushroom' : 'flower';
    G.ents.push({ t: type, x: c * TILE, y: r * TILE, emerge: 24, vx: 0, vy: 0 });
    killAtop(c, r);
  } else {
    AudioSys.sfx('bump');
  }
}
function killAtop(c, r) {
  const top = r * TILE;
  for (const e of G.ents) {
    if (!e.w || e.dead || e.t === 'corpse') continue;
    if (Math.abs(e.y + e.h - top) < 5 && e.x + e.w > c * TILE && e.x < c * TILE + TILE) {
      flipDie(e, 100);
    }
  }
}

// ------------------------------------------------------------------ entities
const ENT_DIM = {
  goomba: [14, 13], koopa: [12, 20], koopaRed: [12, 20],
  shell: [14, 11], shellRed: [14, 11], plant: [14, 20],
  mushroom: [14, 14], flower: [14, 14], bowser: [30, 30],
  fireball: [7, 7], bfire: [22, 6],
};

function spawnPending() {
  for (const p of G.pending) {
    if (p.spawned || p.x > G.camX + VIEW_W + 32) continue;
    p.spawned = true;
    if (p.t === 'plant') {
      G.ents.push({ t: 'plant', x: p.x, w: 14, h: 20, topY: p.topY, timer: ((p.x / 16) | 0) % 120, y: p.topY + 4 });
      continue;
    }
    if (p.t === 'bowser') {
      G.ents.push({
        t: 'bowser', w: 30, h: 30, x: p.x, y: p.standRow * TILE - 30,
        vx: 0, vy: 0, dir: -1, hp: p.hp, fireRate: p.fireRate,
        fireT: 60, hopT: 100, hurtT: 0, fall: false, onGround: true,
      });
      continue;
    }
    const [w, h] = ENT_DIM[p.t];
    G.ents.push({
      t: p.t, w, h, x: p.x, y: p.standRow * TILE - h,
      vx: -0.45 - (p.t.startsWith('koopa') ? 0.1 : 0), vy: 0, dead: 0, anim: 0,
    });
  }
}

function entPhysics(e, ledgeCheck) {
  // horizontal
  e.x += e.vx;
  if (e.vx < 0 && (solidAt(e.x, e.y + 2) || solidAt(e.x, e.y + e.h - 2))) {
    e.x = Math.floor(e.x / TILE) * TILE + TILE; e.vx = -e.vx;
  } else if (e.vx > 0 && (solidAt(e.x + e.w, e.y + 2) || solidAt(e.x + e.w, e.y + e.h - 2))) {
    e.x = Math.floor((e.x + e.w) / TILE) * TILE - e.w; e.vx = -e.vx;
  }
  // vertical
  e.vy = Math.min(e.vy + 0.5, MAX_FALL);
  e.y += e.vy;
  e.onGround = false;
  if (e.vy >= 0 && (solidAt(e.x + 2, e.y + e.h) || solidAt(e.x + e.w - 2, e.y + e.h))) {
    e.y = Math.floor((e.y + e.h) / TILE) * TILE - e.h;
    e.vy = 0; e.onGround = true;
  }
  // red koopa: turn at ledges
  if (ledgeCheck && e.onGround) {
    const ahead = e.vx > 0 ? e.x + e.w + 1 : e.x - 1;
    if (!solidAt(ahead, e.y + e.h + 2)) e.vx = -e.vx;
  }
}

function flipDie(e, score) {
  AudioSys.sfx('kick');
  if (score) addScore(score, e.x, e.y);
  e.was = e.t;
  e.t = 'corpse'; e.vy = -3.5; e.vxC = e.vx || 0;
}

function hurtMario() {
  const m = G.mario;
  if (m.invuln > 0) return;
  if (m.power > 0) {
    m.power = 0;
    const oldH = m.h; m.h = marioH(m); m.y += oldH - m.h;
    m.invuln = 130;
    AudioSys.sfx('hurt');
  } else {
    killMario();
  }
}
function killMario() {
  if (G.state === 'dying') return;
  G.state = 'dying'; G.t = 0;
  AudioSys.jingle('death');
}

function updateEnts() {
  const m = G.mario;
  for (let i = G.ents.length - 1; i >= 0; i--) {
    const e = G.ents[i];
    switch (e.t) {
      case 'goomba':
        if (e.dead) { if (++e.dead > 30) G.ents.splice(i, 1); break; }
        entPhysics(e, false);
        e.anim++;
        break;
      case 'koopa': entPhysics(e, false); e.anim++; break;
      case 'koopaRed': entPhysics(e, true); e.anim++; break;
      case 'shell': case 'shellRed':
        if (e.vx !== 0) {
          entPhysics(e, false);
          // moving shell kills enemies
          for (const o of G.ents) {
            if (o === e || o.t === 'corpse' || o.t === 'coinpop' || !o.w || o.dead) continue;
            if (['goomba', 'koopa', 'koopaRed', 'plant'].includes(o.t) && overlap(e, o)) flipDie(o, 500);
          }
        } else { e.vy = Math.min(e.vy + 0.5, MAX_FALL); e.y += e.vy;
          if (e.vy >= 0 && (solidAt(e.x + 2, e.y + e.h) || solidAt(e.x + e.w - 2, e.y + e.h))) {
            e.y = Math.floor((e.y + e.h) / TILE) * TILE - e.h; e.vy = 0;
          }
        }
        break;
      case 'plant': {
        // cycle: 0-99 hidden, 100-139 rise, 140-209 out, 210-249 sink (250)
        const t = e.timer % 250;
        const near = Math.abs((m.x + m.w / 2) - e.x - 7) < 40;
        if (!(t < 100 && t > 90 && near)) e.timer++;
        if (t < 100) e.y = e.topY + 4;
        else if (t < 140) e.y = e.topY + 4 - ((t - 100) / 40) * 24;
        else if (t < 210) e.y = e.topY - 20;
        else e.y = e.topY - 20 + ((t - 210) / 40) * 24;
        break;
      }
      case 'mushroom':
        if (e.emerge > 0) { e.emerge--; e.y -= 0.6; if (!e.w) { e.w = 14; e.h = 14; } break; }
        if (!e.started) { e.started = true; e.vx = 1.1; }
        entPhysics(e, false);
        break;
      case 'flower':
        if (e.emerge > 0) { e.emerge--; e.y -= 0.6; if (!e.w) { e.w = 14; e.h = 14; } }
        break;
      case 'coinpop':
        e.vy += 0.45; e.y += e.vy;
        if (e.vy > 0 && e.y >= e.y0) G.ents.splice(i, 1);
        break;
      case 'fireball': {
        e.vy = Math.min(e.vy + 0.4, 6);
        e.x += e.vx; e.y += e.vy;
        if (e.vx < 0 && solidAt(e.x, e.y + 3)) { G.ents.splice(i, 1); break; }
        if (e.vx > 0 && solidAt(e.x + e.w, e.y + 3)) { G.ents.splice(i, 1); break; }
        if (e.vy > 0 && solidAt(e.x + 3, e.y + e.h)) {
          e.y = Math.floor((e.y + e.h) / TILE) * TILE - e.h; e.vy = -3.4;
        }
        if (e.x < G.camX - 16 || e.x > G.camX + VIEW_W + 16 || e.y > 248) { G.ents.splice(i, 1); break; }
        let hit = false;
        for (const o of G.ents) {
          if (o === e || !o.w || o.dead || o.t === 'corpse' || o.t === 'coinpop') continue;
          if (!overlap(e, o)) continue;
          if (o.t === 'bowser') {
            if (!o.fall) { o.hp--; o.hurtT = 12; hit = true;
              if (o.hp <= 0) { o.fall = true; addScore(5000, o.x, o.y); AudioSys.sfx('bowserfall'); } }
          } else if (['goomba', 'koopa', 'koopaRed', 'plant', 'shell', 'shellRed'].includes(o.t)) {
            flipDie(o, 200); hit = true;
          }
          if (hit) break;
        }
        if (hit) G.ents.splice(i, 1);
        break;
      }
      case 'bfire':
        e.x += e.vx;
        if (e.x < G.camX - 32 || e.x > G.camX + VIEW_W + 32) G.ents.splice(i, 1);
        break;
      case 'bowser': {
        if (e.fall) { e.vy += 0.35; e.y += e.vy; if (e.y > 280) G.ents.splice(i, 1); break; }
        if (G.state !== 'play') break;
        if (e.hurtT > 0) e.hurtT--;
        e.dir = m.x > e.x ? 1 : -1;
        // patrol within bridge
        const br = G.lvl.bridge;
        e.vx = e.dir * 0.25;
        e.x = Math.max(br.c0 * TILE, Math.min(br.c1 * TILE + TILE - e.w, e.x + e.vx));
        if (--e.hopT <= 0) { e.hopT = 130 + Math.random() * 80; if (e.onGround) { e.vy = -3.2; e.onGround = false; } }
        e.vy = Math.min(e.vy + 0.3, MAX_FALL);
        e.y += e.vy;
        if (e.vy >= 0 && (solidAt(e.x + 4, e.y + e.h) || solidAt(e.x + e.w - 4, e.y + e.h))) {
          e.y = Math.floor((e.y + e.h) / TILE) * TILE - e.h; e.vy = 0; e.onGround = true;
        }
        if (--e.fireT <= 0) {
          e.fireT = e.fireRate + Math.random() * 60;
          G.ents.push({ t: 'bfire', w: 22, h: 6, x: e.x + (e.dir > 0 ? e.w : -22), y: e.y + 6, vx: e.dir * 1.7 });
          AudioSys.sfx('bowserfire');
        }
        break;
      }
      case 'corpse':
        e.vy += 0.4; e.y += e.vy; e.x += e.vxC || 0;
        if (e.y > 270) G.ents.splice(i, 1);
        break;
    }
    // cull walkers that fell out
    if (G.ents[i] === e && e.y > 280 && e.t !== 'corpse' && e.t !== 'bowser') G.ents.splice(i, 1);
  }
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// mario vs entities
function marioVsEnts() {
  const m = G.mario;
  if (m.invuln > 0) m.invuln--;
  for (let i = G.ents.length - 1; i >= 0; i--) {
    const e = G.ents[i];
    if (!e.w || e.dead || ['corpse', 'coinpop', 'fireball'].includes(e.t)) continue;
    if (e.t === 'plant' && e.y > e.topY - 8) continue; // mostly inside pipe
    if ((e.t === 'mushroom' || e.t === 'flower') && e.emerge > 0) continue;
    if (!overlap(m, e)) continue;

    if (e.t === 'mushroom') {
      G.ents.splice(i, 1);
      AudioSys.sfx('powerup'); addScore(1000, e.x, e.y);
      if (m.power === 0) { m.power = 1; const b = m.y + m.h; m.h = marioH(m); m.y = b - m.h; }
      continue;
    }
    if (e.t === 'flower') {
      G.ents.splice(i, 1);
      AudioSys.sfx('powerup'); addScore(1000, e.x, e.y);
      const b = m.y + m.h;
      m.power = m.power === 0 ? 1 : 2;
      m.h = marioH(m); m.y = b - m.h;
      continue;
    }
    if (e.t === 'bfire' || e.t === 'plant' || e.t === 'bowser') { hurtMario(); continue; }

    const stomping = m.vy > 0.5 && (m.prevBottom <= e.y + 4);
    if (e.t === 'goomba') {
      if (stomping) {
        e.dead = 1; e.vx = 0;
        addScore(100, e.x, e.y); AudioSys.sfx('stomp');
        m.vy = held.up() ? -6.5 : -4.5;
      } else hurtMario();
    } else if (e.t === 'koopa' || e.t === 'koopaRed') {
      if (stomping) {
        const shell = e.t === 'koopa' ? 'shell' : 'shellRed';
        G.ents[i] = { t: shell, w: 14, h: 11, x: e.x, y: e.y + e.h - 11, vx: 0, vy: 0 };
        addScore(100, e.x, e.y); AudioSys.sfx('stomp');
        m.vy = held.up() ? -6.5 : -4.5;
      } else hurtMario();
    } else if (e.t === 'shell' || e.t === 'shellRed') {
      if (e.vx === 0) {
        e.vx = (m.x + m.w / 2 < e.x + e.w / 2) ? 3.4 : -3.4;
        e.x += e.vx * 2;
        addScore(400, e.x, e.y); AudioSys.sfx('kick');
        if (stomping) m.vy = -4.5;
      } else if (stomping) {
        e.vx = 0; AudioSys.sfx('stomp'); addScore(100, e.x, e.y);
        m.vy = -4.5;
      } else hurtMario();
    }
  }
}

// ------------------------------------------------------------------ mario
function updateMario() {
  const m = G.mario;
  m.prevBottom = m.y + m.h;

  // crouch (big only)
  if (m.power > 0 && m.onGround) {
    if (held.down() && !m.crouch) { m.crouch = true; m.y += 14; m.h = marioH(m); }
    else if (!held.down() && m.crouch) {
      // stand up if headroom
      if (!solidAt(m.x + 2, m.y - 15) && !solidAt(m.x + m.w - 2, m.y - 15)) {
        m.crouch = false; m.y -= 14; m.h = marioH(m);
      }
    }
  }

  // horizontal
  const maxV = held.run() ? 2.5 : 1.5;
  const acc = m.onGround ? 0.09 : 0.07;
  if (held.left() && !m.crouch) { m.vx -= acc; m.dir = -1; }
  else if (held.right() && !m.crouch) { m.vx += acc; m.dir = 1; }
  else if (m.onGround) {
    if (m.vx > 0) m.vx = Math.max(0, m.vx - 0.1);
    else m.vx = Math.min(0, m.vx + 0.1);
  }
  m.vx = Math.max(-maxV, Math.min(maxV, m.vx));

  // jump
  if (jumpEdge && m.onGround) {
    m.vy = -6.9 - (Math.abs(m.vx) > 1.8 ? 0.5 : 0);
    m.onGround = false;
    AudioSys.sfx(m.power > 0 ? 'bigjump' : 'jump');
  }
  m.vy += (m.vy < 0 && held.up()) ? GRAV_HOLD : GRAV;
  m.vy = Math.min(m.vy, MAX_FALL);

  // fireball
  if (m.fireCD > 0) m.fireCD--;
  if (fireEdge && m.power === 2 && m.fireCD === 0) {
    const count = G.ents.filter((e) => e.t === 'fireball').length;
    if (count < 2) {
      G.ents.push({ t: 'fireball', w: 7, h: 7, x: m.x + (m.dir > 0 ? m.w : -7), y: m.y + 4, vx: m.dir * 3.2, vy: 1 });
      AudioSys.sfx('fire');
      m.fireCD = 12;
    }
  }

  // move X
  let nx = m.x + m.vx;
  if (nx < G.camX) { nx = G.camX; m.vx = 0; }
  const ys = [m.y + 2, m.y + m.h / 2, m.y + m.h - 2];
  if (m.vx > 0) {
    for (const yy of ys) if (solidAt(nx + m.w, yy)) { nx = Math.floor((nx + m.w) / TILE) * TILE - m.w; m.vx = 0; break; }
  } else if (m.vx < 0) {
    for (const yy of ys) if (solidAt(nx, yy)) { nx = Math.floor(nx / TILE) * TILE + TILE; m.vx = 0; break; }
  }
  m.x = nx;

  // move Y
  let ny = m.y + m.vy;
  m.onGround = false;
  if (m.vy >= 0) {
    if (solidAt(m.x + 1, ny + m.h) || solidAt(m.x + m.w - 1, ny + m.h)) {
      ny = Math.floor((ny + m.h) / TILE) * TILE - m.h;
      m.vy = 0; m.onGround = true;
    }
  } else {
    if (solidAt(m.x + 1, ny) || solidAt(m.x + m.w - 1, ny)) {
      const r = Math.floor(ny / TILE);
      ny = (r + 1) * TILE;
      m.vy = 0;
      // bump the block nearest mario's center
      const cc = Math.floor((m.x + m.w / 2) / TILE);
      let c = cc;
      if (!isSolid(tileAt(cc * TILE + 8, r * TILE + 8))) {
        c = isSolid(tileAt(m.x + 1, r * TILE + 8)) ? Math.floor((m.x + 1) / TILE) : Math.floor((m.x + m.w - 1) / TILE);
      }
      if (c >= 0 && c < G.lvl.len && r >= 0) bumpBlock(c, r);
    }
  }
  m.y = ny;

  // tile pickups / hazards
  const cx0 = Math.floor(m.x / TILE), cx1 = Math.floor((m.x + m.w) / TILE);
  const cy0 = Math.floor(m.y / TILE), cy1 = Math.floor((m.y + m.h - 1) / TILE);
  for (let r = cy0; r <= cy1; r++) {
    for (let c = cx0; c <= cx1; c++) {
      if (r < 0 || r >= ROWS || c < 0 || c >= G.lvl.len) continue;
      const id = G.tiles[r][c];
      if (id === 7) { setTile(c, r, 0); addCoin(); addScore(200); AudioSys.sfx('coin'); }
      else if (id === 15 && m.y + m.h > r * TILE + 4) { killMario(); return; }
      else if (id === 16) { startAxe(c, r); return; }
    }
  }

  // pit
  if (m.y > ROWS * TILE + 16) { killMario(); return; }

  // flag
  if (G.lvl.flagX > 0 && m.x + m.w >= G.lvl.flagX * TILE + 6) { startFlag(); return; }

  // camera (never scrolls left)
  const target = m.x - 100;
  if (target > G.camX) G.camX = Math.min(target, G.lvl.len * TILE - VIEW_W);

  // anim
  m.animT += Math.abs(m.vx);
  marioVsEnts();
}

// ------------------------------------------------------------------ sequences
function startFlag() {
  const m = G.mario;
  G.state = 'flag'; G.t = 0; G.flagJingled = false; G.walkT = 0;
  AudioSys.stopSong();
  AudioSys.sfx('flag');
  m.x = G.lvl.flagX * TILE - 6;
  m.vx = 0; m.vy = 0;
  G.flagY = 3 * TILE;
  const row = Math.floor(m.y / TILE);
  const pts = row <= 4 ? 5000 : row <= 6 ? 2000 : row <= 8 ? 800 : row <= 10 ? 400 : 100;
  addScore(pts, m.x, m.y);
}
function updateFlag() {
  const m = G.mario;
  G.t++;
  const baseY = 12 * TILE - m.h;
  if (m.y < baseY) {
    // slide down the pole
    m.y = Math.min(m.y + 2, baseY);
    G.flagY = Math.min(G.flagY + 2, 10 * TILE);
  } else {
    if (!G.flagJingled) { G.flagJingled = true; AudioSys.jingle('clear'); }
    G.walkT++;
    if (G.walkT > 40) {
      // hop off and walk to castle
      m.dir = 1; m.vx = 1.4;
      m.vy = Math.min(m.vy + GRAV, MAX_FALL);
      let ny = m.y + m.vy;
      if (m.vy >= 0 && (solidAt(m.x + 1, ny + m.h) || solidAt(m.x + m.w - 1, ny + m.h))) {
        ny = Math.floor((ny + m.h) / TILE) * TILE - m.h; m.vy = 0;
      }
      m.y = ny;
      m.x += 1.4;
      m.animT += 1.4;
      const doorX = G.lvl.castleX * TILE + 36;
      if (m.x > doorX) m.hidden = true;
      if (m.x > doorX + 4) {
        if (G.time > 0) { addScore(G.time * 50); G.time = 0; }
        nextLevel();
      }
    }
  }
}
function startAxe(c, r) {
  setTile(c, r, 0);
  G.state = 'axe'; G.t = 0; G.axeStep = G.lvl.bridge.c1;
  AudioSys.stopSong();
  const m = G.mario;
  m.vx = 0; m.vy = 0;
  addScore(2000, c * TILE, r * TILE);
}
function updateAxe() {
  G.t++;
  // collapse bridge right-to-left
  if (G.t % 4 === 0 && G.axeStep >= G.lvl.bridge.c0) {
    setTile(G.axeStep, G.lvl.bridge.r, 0);
    G.axeStep--;
    if (G.axeStep < G.lvl.bridge.c0) {
      const bw = G.ents.find((e) => e.t === 'bowser');
      if (bw && !bw.fall) { bw.fall = true; AudioSys.sfx('bowserfall'); }
    }
  }
  // keep bowser falling
  updateEnts();
  if (G.t === 150) AudioSys.jingle('clear');
  if (G.t > 280) {
    if (G.level + 1 >= LEVELS.length) { G.state = 'win'; G.t = 0; AudioSys.jingle('win'); saveTop(); }
    else {
      G.state = 'msg'; G.t = 0;
      G.msgLines = ['THANK YOU MARIO!', '', 'BUT OUR PRINCESS IS IN', 'ANOTHER CASTLE!'];
    }
  }
}
function updateDying() {
  const m = G.mario;
  G.t++;
  if (G.t === 30) { m.vy = -7; }
  if (G.t > 30) { m.vy += 0.4; m.y += m.vy; }
  if (G.t > 180) {
    G.lives--;
    saveTop();
    if (G.lives < 0) { G.state = 'gameover'; G.t = 0; AudioSys.jingle('gameover'); }
    else { G.mario = null; loadLevel(G.level); }
  }
}

// ------------------------------------------------------------------ update
function update() {
  G.frame++;
  switch (G.state) {
    case 'title':
      if (keys.ArrowLeft && G.sel > 0 && !G._selL) { G.sel--; AudioSys.sfx('coin'); }
      if (keys.ArrowRight && G.sel < G.unlock && !G._selR) { G.sel++; AudioSys.sfx('coin'); }
      G._selL = keys.ArrowLeft; G._selR = keys.ArrowRight;
      if (enterEdge) startGame(G.sel);
      break;
    case 'intro':
      if (++G.t > 110) {
        G.state = 'play';
        AudioSys.playSong(MUSIC_OF[G.lvl.theme]);
      }
      break;
    case 'play':
      if (enterEdge) { G.paused = !G.paused; AudioSys.sfx('pause'); if (G.paused) AudioSys.stopSongTimer(); else AudioSys.playSong(AudioSys._wantSong); }
      if (G.paused) break;
      spawnPending();
      updateMario();
      if (G.state !== 'play') break;
      updateEnts();
      // timer
      if (G.frame % 24 === 0 && G.time > 0) {
        G.time--;
        if (G.time === 0) killMario();
      }
      // particles & pops & bounce
      for (let i = G.parts.length - 1; i >= 0; i--) {
        const p = G.parts[i];
        p.vy += 0.3; p.x += p.vx; p.y += p.vy;
        if (++p.t > 120 || p.y > 260) G.parts.splice(i, 1);
      }
      for (let i = G.pops.length - 1; i >= 0; i--) {
        const p = G.pops[i];
        p.y -= 0.7;
        if (++p.t > 50) G.pops.splice(i, 1);
      }
      for (let i = G.bounce.length - 1; i >= 0; i--) {
        if (++G.bounce[i].t > 14) G.bounce.splice(i, 1);
      }
      break;
    case 'flag': updateFlag(); break;
    case 'axe': updateAxe(); break;
    case 'dying': updateDying(); break;
    case 'msg':
      if (++G.t > 200) nextLevel();
      break;
    case 'gameover':
      G.t++;
      if (enterEdge && G.t > 30) {
        // continue at same world, fresh score
        G.score = 0; G.coins = 0; G.lives = 3; G.mario = null;
        loadLevel(G.level);
      }
      if (keys.Escape) { G.state = 'title'; }
      break;
    case 'win':
      G.t++;
      if (enterEdge && G.t > 60) { G.state = 'title'; G.sel = 0; }
      break;
  }
  jumpEdge = false; fireEdge = false; enterEdge = false;
}

// ------------------------------------------------------------------ drawing
function bigText(g, str, x, y, color, scale) {
  const tmp = document.createElement('canvas');
  tmp.width = str.length * 8; tmp.height = 8;
  const tg = tmp.getContext('2d');
  drawText(tg, str, 0, 0, color);
  g.imageSmoothingEnabled = false;
  g.drawImage(tmp, x, y, tmp.width * scale, 8 * scale);
}

function drawSpr(set, idx, dir, x, y, flipV) {
  const fr = set[idx % set.length];
  const c = dir < 0 ? fr.l : fr.r;
  const sx = Math.round(x - G.camX), sy = Math.round(y);
  if (sx + c.width < 0 || sx > VIEW_W) return;
  if (flipV) {
    ctx.save();
    ctx.translate(sx, sy + c.height);
    ctx.scale(1, -1);
    ctx.drawImage(c, 0, 0);
    ctx.restore();
  } else ctx.drawImage(c, sx, sy);
}

function drawDecor() {
  const th = G.lvl.theme;
  if (th !== 'ow' && th !== 'ni') return;
  const len = G.lvl.len;
  for (let i = 0; i < Math.ceil(len / 24); i++) {
    const hx = i * 24 * TILE + ((i * 7919) % 5) * 16;
    if (hx > G.camX - 96 && hx < G.camX + VIEW_W + 16 && tileAt(hx + 40, 13.5 * TILE) === 1) {
      ctx.drawImage(DECOR.hill, Math.round(hx - G.camX), 13 * TILE - 35);
    }
    const bx = i * 24 * TILE + 180 + ((i * 104729) % 4) * 24;
    if (bx > G.camX - 64 && bx < G.camX + VIEW_W + 16 && tileAt(bx + 14, 13.5 * TILE) === 1) {
      ctx.drawImage(DECOR.bush, Math.round(bx - G.camX), 13 * TILE - 10);
    }
  }
  for (let i = 0; i < Math.ceil(len / 10); i++) {
    const cx = i * 10 * TILE + ((i * 31) % 7) * 20;
    const cy = 24 + ((i * 17) % 4) * 18;
    if (cx > G.camX - 64 && cx < G.camX + VIEW_W + 16) {
      ctx.drawImage(DECOR.cloud, Math.round(cx - G.camX), cy);
    }
  }
}
function drawStars() {
  ctx.fillStyle = '#fcfcfc';
  for (let i = 0; i < 40; i++) {
    const sx = ((i * 67 + i * i * 13) % (VIEW_W + 40)) - 20;
    const sy = (i * 41 + i * i * 7) % 150;
    ctx.fillRect(sx, sy, 1, 1);
  }
}

function drawWorld() {
  const th = G.lvl.theme;
  ctx.fillStyle = THEMES[th].bg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (th === 'ni') drawStars();
  drawDecor();

  // castle decoration
  if (G.lvl.castleX >= 0) {
    const cx = G.lvl.castleX * TILE - G.camX;
    if (cx > -90 && cx < VIEW_W) ctx.drawImage(DECOR.castle, Math.round(cx), 13 * TILE - 80);
  }
  // flag on pole
  if (G.lvl.flagX > 0) {
    const fy = G.state === 'flag' ? G.flagY : 3 * TILE;
    drawSpr(SPR.flag, 0, 1, G.lvl.flagX * TILE - 13, fy);
  }

  // plants (behind pipes)
  for (const e of G.ents) {
    if (e.t === 'plant') drawSpr(SPR.plant, (G.frame >> 4) & 1, 1, e.x - 1, e.y);
  }

  // tiles
  const set = TILESET[th];
  const c0 = Math.floor(G.camX / TILE), c1 = c0 + 17;
  for (let r = 0; r < ROWS; r++) {
    for (let c = c0; c <= c1; c++) {
      if (c < 0 || c >= G.lvl.len) continue;
      const id = G.tiles[r][c];
      if (!id) continue;
      let x = c * TILE - G.camX, y = r * TILE;
      if (id === 7) {
        drawSpr(SPR.coin, (G.frame >> 3) & 3, 1, c * TILE + 3, r * TILE + 1);
        continue;
      }
      for (const b of G.bounce) {
        if (b.c === c && b.r === r) y -= (7 - Math.abs(b.t - 7));
      }
      if (id === 15) {
        ctx.drawImage(set[15], Math.round(x), Math.round(y));
        if ((G.frame >> 4) & 1) { ctx.fillStyle = '#fc9838'; ctx.fillRect(Math.round(x) + 4, Math.round(y), 4, 2); }
        continue;
      }
      const img = set[id];
      if (img) ctx.drawImage(img, Math.round(x), Math.round(y));
    }
  }

  // entities
  for (const e of G.ents) {
    switch (e.t) {
      case 'goomba':
        if (e.dead) drawSpr(SPR.goomba, 1, 1, e.x - 1, e.y + e.h - 5);
        else drawSpr(SPR.goomba, 0, ((e.anim >> 4) & 1) ? -1 : 1, e.x - 1, e.y);
        break;
      case 'koopa': drawSpr(SPR.koopa, (e.anim >> 4) & 1, e.vx > 0 ? 1 : -1, e.x - 2, e.y); break;
      case 'koopaRed': drawSpr(SPR.koopaRed, (e.anim >> 4) & 1, e.vx > 0 ? 1 : -1, e.x - 2, e.y); break;
      case 'shell': drawSpr(SPR.shell, 0, 1, e.x - 1, e.y); break;
      case 'shellRed': drawSpr(SPR.shellRed, 0, 1, e.x - 1, e.y); break;
      case 'mushroom': drawSpr(SPR.mushroom, 0, 1, e.x - 1, e.y); break;
      case 'flower': drawSpr(SPR.flower, 0, 1, e.x - 1, e.y); break;
      case 'coinpop': drawSpr(SPR.coin, (G.frame >> 2) & 3, 1, e.x, e.y); break;
      case 'fireball': drawSpr(SPR.fireball, 0, e.vx > 0 ? 1 : -1, e.x, e.y); break;
      case 'bfire': drawSpr(SPR.bfire, 0, e.vx > 0 ? -1 : 1, e.x, e.y); break;
      case 'bowser':
        if (!(e.hurtT > 0 && (G.frame & 2))) drawSpr(SPR.bowser, (G.frame >> 4) & 1, e.dir > 0 ? -1 : 1, e.x, e.y, e.fall);
        break;
      case 'corpse': {
        const map = { goomba: SPR.goomba, koopa: SPR.koopa, koopaRed: SPR.koopaRed, shell: SPR.shell, shellRed: SPR.shellRed, plant: SPR.plant, bowser: SPR.bowser };
        drawSpr(map[e.was] || SPR.goomba, 0, 1, e.x, e.y, true);
        break;
      }
    }
  }

  drawMario();

  // particles
  for (const p of G.parts) drawSpr(SPR.shard, 0, 1, p.x, p.y);
  // score popups
  for (const p of G.pops) drawText(ctx, p.txt, Math.round(p.x - G.camX), Math.round(p.y), '#fcfcfc');
}

function drawMario() {
  const m = G.mario;
  if (!m || m.hidden) return;
  if (m.invuln > 0 && (G.frame & 4)) return;
  if (G.state === 'dying') {
    drawSpr(SPR.small, 4, 1, m.x - 1, m.y);
    return;
  }
  const set = m.power === 0 ? SPR.small : m.power === 1 ? SPR.big : SPR.fire;
  let idx;
  if (m.crouch && m.power > 0) idx = 4;
  else if (!m.onGround && G.state === 'play') idx = 3;
  else if (Math.abs(m.vx) > 0.3) idx = 1 + (Math.floor(m.animT / 7) % 2);
  else idx = 0;
  const spr = set[idx].r;
  drawSpr(set, idx, m.dir, m.x + m.w / 2 - spr.width / 2, m.y + m.h - spr.height);
}

function drawHUD() {
  drawText(ctx, 'MARIO', 16, 8);
  drawText(ctx, String(G.score).padStart(6, '0'), 16, 16);
  drawSpr(SPR.coin, 0, 1, G.camX + 86, 9);
  drawText(ctx, '*' + String(G.coins).padStart(2, '0'), 96, 9);
  drawText(ctx, 'WORLD', 144, 8);
  drawText(ctx, G.lvl ? G.lvl.name : '1-1', 152, 16);
  drawText(ctx, 'TIME', 200, 8);
  drawText(ctx, String(Math.max(0, G.time)).padStart(3, '0'), 204, 16);
}

function drawTitle() {
  ctx.fillStyle = THEMES.ow.bg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // ground
  const set = TILESET.ow;
  for (let c = 0; c < 16; c++) { ctx.drawImage(set[1], c * 16, 13 * 16); ctx.drawImage(set[1], c * 16, 14 * 16); }
  ctx.drawImage(DECOR.hill, 8, 13 * 16 - 35);
  ctx.drawImage(DECOR.bush, 180, 13 * 16 - 10);
  ctx.drawImage(DECOR.cloud, 150, 30);
  // mario
  const ms = SPR.small[0].r;
  ctx.drawImage(ms, 40, 13 * 16 - ms.height);
  // logo plaque
  ctx.fillStyle = '#c84c0c'; ctx.fillRect(28, 40, 200, 70);
  ctx.fillStyle = '#fcbcb0';
  ctx.fillRect(28, 40, 200, 2); ctx.fillRect(28, 40, 2, 70);
  ctx.fillStyle = '#000';
  ctx.fillRect(28, 108, 200, 2); ctx.fillRect(226, 40, 2, 70);
  bigText(ctx, 'SUPER', 88, 48, '#fcfcfc', 2);
  bigText(ctx, 'MARIO', 48, 70, '#fac000', 4);
  drawText(ctx, 'JS EDITION', 138, 98, '#fcbcb0');
  drawText(ctx, 'TOP-' + String(G.top).padStart(6, '0'), 88, 122, '#fcfcfc');
  const wname = LEVELS[G.sel].name;
  if (G.unlock > 0) {
    drawText(ctx, '< WORLD ' + wname + ' >', 70, 144, '#fcfcfc');
  } else {
    drawText(ctx, 'WORLD ' + wname, 90, 144, '#fcfcfc');
  }
  if ((G.frame >> 5) & 1) drawText(ctx, 'PRESS ENTER TO START', 48, 168, '#fcfcfc');
  drawText(ctx, 'ARROWS MOVE JUMP', 64, 224, '#5c94fc');
}

function drawIntro() {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawHUD();
  drawText(ctx, 'WORLD ' + G.lvl.name, 88, 90);
  const ms = SPR.small[0].r;
  ctx.drawImage(ms, 104, 116);
  drawText(ctx, '* ' + G.lives, 124, 120);
}

function draw() {
  switch (G.state) {
    case 'title': drawTitle(); break;
    case 'intro': drawIntro(); break;
    case 'play': case 'flag': case 'axe': case 'dying':
      drawWorld(); drawHUD();
      if (G.paused) drawText(ctx, 'PAUSE', 108, 112, '#fcfcfc');
      break;
    case 'msg':
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      drawHUD();
      G.msgLines.forEach((l, i) => drawText(ctx, l, Math.round((VIEW_W - l.length * 8) / 2), 90 + i * 14));
      break;
    case 'gameover':
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      drawHUD();
      drawText(ctx, 'GAME OVER', 92, 100);
      if ((G.frame >> 5) & 1) drawText(ctx, 'PRESS ENTER TO CONTINUE', 36, 140);
      break;
    case 'win': {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      drawHUD();
      drawText(ctx, 'THANK YOU MARIO!', 64, 80);
      drawText(ctx, 'YOUR QUEST IS OVER.', 52, 100);
      drawText(ctx, 'PEACE RETURNS TO THE', 48, 120);
      drawText(ctx, 'MUSHROOM KINGDOM!', 60, 134);
      drawText(ctx, 'SCORE ' + String(G.score).padStart(6, '0'), 76, 160);
      if (G.t > 60 && (G.frame >> 5) & 1) drawText(ctx, 'PRESS ENTER', 84, 190);
      break;
    }
  }
}

// ------------------------------------------------------------------ main loop
let last = 0, acc = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  if (!last) last = ts;
  acc += Math.min(ts - last, 100);
  last = ts;
  const STEP = 1000 / 60;
  let n = 0;
  while (acc >= STEP && n < 4) { update(); acc -= STEP; n++; }
  if (n === 4) acc = 0;
  draw();
}
requestAnimationFrame(loop);
