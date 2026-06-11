/* levels.js — 10 levels built with a small builder DSL.
   Grid: 15 rows tall (row 0 = top, rows 13-14 = default ground). */
'use strict';

const ROWS = 15;

class LB {
  constructor(len, theme, time) {
    this.len = len; this.theme = theme; this.time = time;
    this.t = [];
    for (let r = 0; r < ROWS; r++) this.t.push(new Array(len).fill(0));
    for (let c = 0; c < len; c++) { this.t[13][c] = 1; this.t[14][c] = 1; }
    this.ents = [];
    this.flagX = -1; this.castleX = -1; this.bridge = null;
  }
  b(c, r, v) { if (c >= 0 && c < this.len && r >= 0 && r < ROWS) this.t[r][c] = v; }
  row(c0, c1, r, v) { for (let c = c0; c <= c1; c++) this.b(c, r, v); }
  col(c, r0, r1, v) { for (let r = r0; r <= r1; r++) this.b(c, r, v); }
  gap(c, w) { for (let i = 0; i < w; i++) { this.b(c + i, 13, 0); this.b(c + i, 14, 0); } }
  lava(c, w) { for (let i = 0; i < w; i++) { this.b(c + i, 13, 15); this.b(c + i, 14, 15); } }
  brick(c, r) { this.b(c, r, 2); }
  q(c, r, power) { this.b(c, r, power ? 4 : 3); }
  hard(c, r) { this.b(c, r, 5); }
  coins(c0, c1, r) { for (let c = c0; c <= c1; c++) this.b(c, r, 7); }
  pipe(c, h, plant) {
    const top = 13 - h;
    this.b(c, top, 8); this.b(c + 1, top, 9);
    for (let r = top + 1; r <= 12; r++) { this.b(c, r, 10); this.b(c + 1, r, 11); }
    if (plant) this.ents.push({ t: 'plant', x: c * 16 + 8, topY: top * 16 });
  }
  stairs(c, h, dir) { // dir 1: ascending right, -1: descending right
    for (let i = 0; i < h; i++) {
      const steps = dir === -1 ? h - i : i + 1;
      for (let k = 0; k < steps; k++) this.hard(c + i, 12 - k);
    }
  }
  plat(c, w, r) { this.row(c, c + w - 1, r, 5); }
  e(t, c, r) { this.ents.push({ t, x: c * 16, standRow: r === undefined ? 13 : r }); }
  flag(c) {
    this.flagX = c;
    this.hard(c, 12);
    for (let r = 3; r <= 11; r++) this.b(c, r, 12);
    this.b(c, 2, 13);
  }
  castle(c) { this.castleX = c; }
  ceiling(n) { for (let r = 0; r < n; r++) this.row(0, this.len - 1, r, 2); }
  arena(c, hp, fireRate) { // bowser bridge over lava + axe
    this.lava(c, 12);
    this.row(c, c + 11, 12, 14);
    this.bridge = { c0: c, c1: c + 11, r: 12 };
    this.ents.push({ t: 'bowser', x: (c + 6) * 16, standRow: 12, hp: hp || 5, fireRate: fireRate || 170 });
    this.b(c + 13, 12, 16); // axe
    this.axeC = c + 13; this.axeR = 12;
  }
  done(name) {
    return {
      name, theme: this.theme, time: this.time, len: this.len, tiles: this.t,
      ents: this.ents, flagX: this.flagX, castleX: this.castleX,
      bridge: this.bridge, axeC: this.axeC, axeR: this.axeR,
    };
  }
}

const LEVELS = [];

// ---------------- WORLD 1-1 (overworld, classic) ----------------
(() => {
  const L = new LB(212, 'ow', 400);
  L.q(17, 9);
  L.brick(20, 9); L.q(21, 9, true); L.brick(22, 9); L.q(23, 9); L.brick(24, 9);
  L.q(22, 5);
  L.pipe(29, 2); L.pipe(38, 3); L.pipe(46, 4); L.pipe(57, 4, true);
  L.e('goomba', 23); L.e('goomba', 41); L.e('goomba', 51); L.e('goomba', 53);
  L.gap(69, 2);
  L.brick(78, 9); L.q(79, 9, true); L.brick(80, 9);
  L.row(81, 88, 5, 2);
  L.e('goomba', 81); L.e('goomba', 83);
  L.gap(87, 3);
  L.row(92, 94, 5, 2); L.q(95, 5); L.brick(95, 9);
  L.coins(100, 103, 9);
  L.e('koopa', 107);
  L.q(106, 9); L.q(109, 9); L.q(109, 5, true); L.q(112, 9);
  L.e('goomba', 114); L.e('goomba', 116);
  L.brick(118, 9);
  L.brick(121, 5); L.brick(122, 5); L.brick(123, 5); L.brick(124, 5);
  L.brick(128, 5); L.brick(129, 5); L.q(130, 5); L.q(131, 5); L.brick(130, 9); L.brick(131, 9);
  L.e('goomba', 124); L.e('goomba', 126);
  L.stairs(134, 4, 1);
  L.stairs(140, 4, -1);
  L.stairs(148, 4, 1);
  L.gap(152, 2);
  L.stairs(154, 4, -1);
  L.pipe(163, 2);
  L.e('goomba', 167); L.e('goomba', 169);
  L.pipe(178, 2);
  L.stairs(181, 8, 1);
  L.flag(193);
  L.castle(199);
  LEVELS.push(L.done('1-1'));
})();

// ---------------- WORLD 1-2 (underground) ----------------
(() => {
  const L = new LB(190, 'ug', 400);
  L.ceiling(1);
  L.q(10, 9, true); L.q(12, 9); L.q(14, 9);
  L.row(20, 24, 9, 2); L.coins(20, 24, 8);
  L.e('goomba', 22); L.e('goomba', 26);
  L.col(30, 10, 12, 2); L.col(31, 11, 12, 2);
  L.coins(34, 38, 11);
  L.pipe(42, 2, true); L.pipe(50, 3);
  L.e('koopa', 55);
  L.gap(60, 3); L.row(60, 62, 10, 5);
  L.coins(60, 62, 8);
  L.col(68, 9, 12, 2); L.col(69, 9, 12, 2);
  L.e('goomba', 74); L.e('goomba', 76);
  L.row(80, 90, 9, 2); L.coins(81, 89, 8);
  L.brick(80, 5); L.brick(81, 5);
  L.e('goomba', 84, 9);
  L.gap(96, 4); L.row(97, 98, 10, 5);
  L.pipe(104, 2, true);
  L.row(110, 113, 9, 2); L.q(114, 9, true);
  L.e('koopa', 118);
  L.col(124, 8, 12, 2); L.col(125, 8, 12, 2);
  L.coins(128, 132, 11);
  L.e('goomba', 130); L.e('goomba', 133); L.e('goomba', 136);
  L.gap(140, 3); L.row(140, 141, 11, 5);
  L.pipe(148, 3, true);
  L.stairs(154, 4, 1); L.stairs(160, 4, -1);
  L.coins(155, 162, 6);
  L.stairs(168, 6, 1);
  L.flag(180);
  L.castle(185);
  LEVELS.push(L.done('1-2'));
})();

// ---------------- WORLD 1-3 (athletic, night) ----------------
(() => {
  const L = new LB(200, 'ni', 300);
  L.gap(16, 148); // big void; platforms across
  L.plat(18, 5, 11); L.coins(19, 21, 9);
  L.plat(26, 4, 9);
  L.plat(33, 4, 7); L.coins(33, 36, 5); L.e('koopaRed', 34, 7);
  L.plat(40, 3, 9);
  L.plat(46, 6, 11); L.e('goomba', 48, 11);
  L.plat(55, 4, 8); L.coins(55, 58, 6);
  L.plat(62, 3, 10);
  L.plat(68, 5, 12); L.e('koopaRed', 70, 12);
  L.plat(76, 4, 9); L.q(77, 6, true);
  L.plat(83, 3, 11);
  // mid island with pipe
  for (let c = 90; c <= 99; c++) { L.b(c, 13, 1); L.b(c, 14, 1); }
  L.pipe(93, 2); L.e('goomba', 97);
  L.plat(103, 4, 10); L.coins(103, 106, 8);
  L.plat(110, 3, 8);
  L.plat(116, 4, 6); L.coins(116, 119, 4); L.e('koopaRed', 117, 6);
  L.plat(123, 3, 9);
  L.plat(129, 5, 11); L.e('goomba', 131, 11);
  L.plat(137, 3, 9);
  L.plat(143, 4, 7); L.coins(143, 146, 5);
  L.plat(150, 4, 10);
  L.plat(157, 5, 12); L.e('koopaRed', 159, 12);
  // ground resumes at 164
  L.stairs(170, 6, 1);
  L.flag(182);
  L.castle(188);
  LEVELS.push(L.done('1-3'));
})();

// ---------------- WORLD 1-4 (castle, Bowser) ----------------
(() => {
  const L = new LB(170, 'ca', 300);
  L.ceiling(2);
  L.row(10, 14, 9, 2); L.coins(10, 14, 8);
  L.lava(20, 3);
  L.e('koopa', 26);
  L.row(30, 33, 9, 2);
  L.lava(36, 4); L.row(37, 38, 10, 5);
  L.e('goomba', 44); L.e('goomba', 46);
  L.col(52, 9, 12, 2); L.col(53, 9, 12, 2);
  L.lava(58, 3);
  L.row(64, 68, 9, 2); L.coins(64, 68, 8); L.e('koopa', 66, 9);
  L.lava(74, 5); L.row(75, 77, 10, 5);
  L.e('goomba', 84); L.e('goomba', 86); L.e('goomba', 88);
  L.col(94, 8, 12, 2); L.col(95, 8, 12, 2);
  L.coins(99, 103, 11);
  L.lava(106, 4); L.row(107, 108, 10, 5);
  L.q(116, 9, true);
  L.e('koopa', 120); L.e('koopa', 123);
  L.lava(128, 3);
  L.arena(138, 5, 170);
  LEVELS.push(L.done('1-4'));
})();

// ---------------- WORLD 2-1 (overworld, pipe land) ----------------
(() => {
  const L = new LB(210, 'ow', 400);
  L.q(14, 9); L.brick(15, 9); L.q(16, 9, true);
  L.pipe(22, 2, true); L.pipe(30, 3, true); L.pipe(38, 4, true);
  L.e('goomba', 27); L.e('koopa', 35);
  L.gap(46, 3);
  L.pipe(52, 3, true);
  L.coins(57, 60, 9);
  L.brick(63, 9); L.q(64, 9, true); L.brick(65, 9); L.q(66, 9); L.brick(67, 9);
  L.e('goomba', 64); L.e('goomba', 66);
  L.pipe(72, 2);
  L.e('koopa', 78); L.e('koopa', 81);
  L.gap(86, 4); L.row(87, 88, 9, 5);
  L.coins(87, 88, 7);
  L.pipe(94, 4, true);
  L.row(100, 106, 5, 2); L.coins(100, 106, 4);
  L.e('goomba', 102); L.e('goomba', 104); L.e('goomba', 106);
  L.q(112, 9); L.q(115, 9, true); L.q(118, 9);
  L.gap(123, 3);
  L.pipe(128, 2, true);
  L.stairs(134, 5, 1); L.gap(139, 3); L.stairs(142, 5, -1);
  L.e('koopa', 152); L.e('goomba', 155); L.e('goomba', 157);
  L.pipe(162, 3, true);
  L.brick(168, 9); L.brick(169, 9); L.q(170, 9, true); L.brick(171, 9);
  L.e('goomba', 172); L.e('goomba', 174);
  L.stairs(180, 8, 1);
  L.flag(193);
  L.castle(199);
  LEVELS.push(L.done('2-1'));
})();

// ---------------- WORLD 2-2 (athletic, day) ----------------
(() => {
  const L = new LB(205, 'ow', 300);
  L.gap(15, 155);
  L.plat(17, 4, 11); L.coins(17, 20, 9);
  L.plat(24, 5, 9); L.e('koopaRed', 26, 9);
  L.plat(32, 3, 7); L.coins(32, 34, 5);
  L.plat(38, 4, 9);
  L.plat(45, 6, 11); L.e('goomba', 47, 11); L.e('goomba', 49, 11);
  L.plat(54, 3, 8); L.q(55, 5, true);
  L.plat(60, 4, 6); L.coins(60, 63, 4);
  L.plat(67, 3, 9);
  L.plat(73, 5, 11); L.e('koopaRed', 75, 11);
  L.plat(81, 3, 9);
  // island
  for (let c = 88, e = 96; c <= e; c++) { L.b(c, 13, 1); L.b(c, 14, 1); }
  L.pipe(91, 2); L.e('goomba', 95);
  L.plat(100, 4, 11); L.coins(100, 103, 9);
  L.plat(107, 3, 9);
  L.plat(113, 4, 7); L.e('koopaRed', 114, 7);
  L.plat(120, 3, 5); L.coins(120, 122, 3);
  L.plat(126, 4, 8);
  L.plat(133, 5, 10); L.e('goomba', 135, 10);
  L.plat(141, 3, 8);
  L.plat(147, 4, 6); L.coins(147, 150, 4);
  L.plat(154, 4, 9);
  L.plat(161, 5, 12); L.e('koopaRed', 163, 12);
  // ground at 170
  L.stairs(176, 6, 1);
  L.flag(188);
  L.castle(194);
  LEVELS.push(L.done('2-2'));
})();

// ---------------- WORLD 2-3 (underground, shells) ----------------
(() => {
  const L = new LB(195, 'ug', 400);
  L.ceiling(1);
  L.q(10, 9, true);
  L.e('koopa', 16); L.e('koopa', 19);
  L.row(24, 28, 9, 2); L.coins(24, 28, 8);
  L.gap(32, 3); L.row(32, 33, 10, 5);
  L.col(38, 10, 12, 2); L.col(39, 10, 12, 2);
  L.e('goomba', 44); L.e('goomba', 46); L.e('goomba', 48);
  L.pipe(52, 2, true);
  L.coins(57, 61, 11);
  L.gap(64, 4); L.row(65, 66, 10, 5);
  L.row(72, 78, 9, 2); L.coins(72, 78, 8); L.e('koopa', 75, 9);
  L.col(84, 8, 12, 2); L.col(85, 8, 12, 2);
  L.e('goomba', 90); L.e('koopa', 93);
  L.pipe(98, 3, true);
  L.gap(104, 3); L.row(104, 105, 11, 5);
  L.row(110, 115, 9, 2); L.q(116, 9, true);
  L.coins(110, 115, 8);
  L.e('goomba', 119); L.e('goomba', 121); L.e('goomba', 123);
  L.col(128, 9, 12, 2); L.col(129, 9, 12, 2);
  L.gap(134, 4); L.row(135, 136, 10, 5);
  L.pipe(142, 2, true);
  L.e('koopa', 148); L.e('koopa', 151);
  L.coins(156, 161, 9);
  L.stairs(166, 6, 1);
  L.flag(180);
  L.castle(186);
  LEVELS.push(L.done('2-3'));
})();

// ---------------- WORLD 2-4 (castle 2) ----------------
(() => {
  const L = new LB(180, 'ca', 300);
  L.ceiling(2);
  L.lava(12, 3);
  L.e('koopa', 18);
  L.row(22, 26, 9, 2); L.coins(22, 26, 8);
  L.lava(30, 5); L.row(31, 33, 10, 5);
  L.e('goomba', 39); L.e('goomba', 41);
  L.col(46, 9, 12, 2); L.col(47, 9, 12, 2);
  L.lava(52, 4); L.row(53, 54, 10, 5);
  L.e('koopa', 60); L.e('koopa', 63);
  L.row(68, 72, 8, 2); L.coins(68, 72, 7);
  L.lava(76, 6); L.row(77, 78, 10, 5); L.row(80, 81, 9, 5);
  L.e('goomba', 87); L.e('goomba', 89); L.e('goomba', 91);
  L.q(96, 9, true);
  L.lava(100, 4); L.row(101, 102, 10, 5);
  L.col(108, 8, 12, 2); L.col(109, 8, 12, 2);
  L.e('koopa', 114); L.e('koopa', 117);
  L.coins(122, 126, 9);
  L.lava(130, 4); L.row(131, 132, 10, 5);
  L.arena(146, 5, 130);
  LEVELS.push(L.done('2-4'));
})();

// ---------------- WORLD 3-1 (overworld night, hard) ----------------
(() => {
  const L = new LB(215, 'ni', 400);
  L.q(12, 9); L.q(14, 9, true);
  L.e('goomba', 18); L.e('goomba', 20); L.e('goomba', 22);
  L.pipe(27, 3, true);
  L.gap(33, 4); L.row(34, 35, 9, 5);
  L.pipe(40, 4, true);
  L.e('koopa', 46); L.e('koopa', 49);
  L.gap(54, 4); L.row(55, 56, 10, 5);
  L.brick(62, 9); L.q(63, 9, true); L.brick(64, 9); L.q(65, 9); L.brick(66, 9);
  L.e('goomba', 63); L.e('goomba', 65); L.e('goomba', 67);
  L.pipe(72, 2, true);
  L.gap(78, 5); L.row(79, 81, 9, 5); L.coins(79, 81, 7);
  L.pipe(87, 3, true);
  L.e('koopa', 93); L.e('goomba', 96); L.e('goomba', 98);
  L.row(102, 108, 5, 2); L.coins(102, 108, 4);
  L.e('goomba', 104); L.e('goomba', 106);
  L.gap(112, 4); L.row(113, 114, 9, 5);
  L.pipe(120, 4, true);
  L.stairs(126, 4, 1); L.gap(130, 4); L.stairs(134, 4, -1);
  L.e('koopa', 143); L.e('koopa', 146);
  L.pipe(150, 2, true);
  L.gap(156, 5); L.row(157, 159, 10, 5);
  L.brick(165, 9); L.q(166, 9, true); L.brick(167, 9);
  L.e('goomba', 168); L.e('goomba', 170); L.e('goomba', 172);
  L.pipe(176, 3, true);
  L.stairs(184, 8, 1);
  L.flag(197);
  L.castle(203);
  LEVELS.push(L.done('3-1'));
})();

// ---------------- WORLD 3-2 (final castle) ----------------
(() => {
  const L = new LB(190, 'ca', 300);
  L.ceiling(2);
  L.e('goomba', 12); L.e('goomba', 14);
  L.lava(18, 4); L.row(19, 20, 10, 5);
  L.e('koopa', 26); L.e('koopa', 29);
  L.row(34, 38, 9, 2); L.coins(34, 38, 8);
  L.lava(42, 5); L.row(43, 45, 10, 5);
  L.col(50, 9, 12, 2); L.col(51, 9, 12, 2);
  L.e('goomba', 56); L.e('goomba', 58); L.e('goomba', 60);
  L.q(64, 9, true);
  L.lava(68, 6); L.row(69, 70, 10, 5); L.row(72, 73, 9, 5);
  L.e('koopa', 79); L.e('koopa', 82); L.e('koopa', 85);
  L.row(90, 94, 8, 2); L.coins(90, 94, 7);
  L.lava(98, 5); L.row(99, 101, 10, 5);
  L.col(106, 8, 12, 2); L.col(107, 8, 12, 2);
  L.e('goomba', 112); L.e('goomba', 114); L.e('koopa', 117);
  L.coins(122, 126, 9);
  L.lava(130, 6); L.row(131, 132, 10, 5); L.row(134, 135, 10, 5);
  L.e('koopa', 141); L.e('koopa', 144);
  L.q(148, 9, true);
  L.arena(156, 8, 110);
  LEVELS.push(L.done('3-2'));
})();
