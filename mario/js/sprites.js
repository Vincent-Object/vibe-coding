/* sprites.js — NES-palette pixel art, all generated in code (no image assets). */
'use strict';

// ---- NES palette ----------------------------------------------------------
const PAL = {
  R: '#d82800', // mario red
  S: '#fca044', // skin
  D: '#882000', // brown (hair / shoes / shirt)
  K: '#000000', // black
  W: '#fcfcfc', // white
  G: '#00a800', // green
  L: '#80d010', // light green
  O: '#c84c0c', // goomba / brick orange-brown
  Y: '#fac000', // gold
  F: '#fcbcb0', // cream / highlight
  B: '#5c94fc', // sky blue
  P: '#e45c10', // dark orange (shading)
  T: '#fcd8a8', // koopa skin
  N: '#005800', // dark green
  A: '#bcbcbc', // light gray
  H: '#7c7c7c', // gray
};

// Build a canvas from rows of palette chars ('.' = transparent).
function px(rows, override) {
  const h = rows.length, w = rows[0].length;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === '.' || ch === ' ') continue;
      g.fillStyle = (override && override[ch]) || PAL[ch] || '#f0f';
      g.fillRect(x, y, 1, 1);
    }
  }
  return c;
}
function flipped(c) {
  const f = document.createElement('canvas');
  f.width = c.width; f.height = c.height;
  const g = f.getContext('2d');
  g.translate(c.width, 0); g.scale(-1, 1);
  g.drawImage(c, 0, 0);
  return f;
}

// ---- Mario (small) 12x16, faces right -------------------------------------
const SM_STAND = [
  '...RRRRRR...',
  '..RRRRRRRRR.',
  '..DDDSSKS...',
  '.DSDSSSKSSS.',
  '.DSDDSSSKSSS',
  '.DDSSSSDDDD.',
  '...SSSSSSS..',
  '..DDRRRDD...',
  '.DDDRRRRDDD.',
  'DDDDRRRRRDDD',
  'SSDRRYRRYRSS',
  'SSSRRRRRRSSS',
  'SSRRRRRRRRSS',
  '..RRR..RRR..',
  '.DDDD..DDDD.',
  'DDDDD..DDDDD',
];
const SM_WALK1 = [
  '...RRRRRR...',
  '..RRRRRRRRR.',
  '..DDDSSKS...',
  '.DSDSSSKSSS.',
  '.DSDDSSSKSSS',
  '.DDSSSSDDDD.',
  '...SSSSSSS..',
  '..DDRRRDDD..',
  '.DDDRRRRDDD.',
  '.DDRRYRRYDD.',
  '..SRRRRRRS..',
  '..SRRRRRRS..',
  '...RRRRRR...',
  '..RRRDDRR...',
  '.RRRDDDD....',
  '.DDDDDDD....',
];
const SM_WALK2 = [
  '...RRRRRR...',
  '..RRRRRRRRR.',
  '..DDDSSKS...',
  '.DSDSSSKSSS.',
  '.DSDDSSSKSSS',
  '.DDSSSSDDDD.',
  '...SSSSSSS..',
  '..DDRRRDD...',
  '.DDDRRRRDD..',
  '.DDRRYRRYD..',
  '.SSRRRRRRSS.',
  '.SRRRRRRRRS.',
  '.RRRR..RRRR.',
  'RRRR....RRRR',
  'DDDD.....DDD',
  'DDD.......DD',
];
const SM_JUMP = [
  '...RRRRRR.SS',
  '..RRRRRRRRSS',
  '..DDDSSKS.SS',
  '.DSDSSSKSSS.',
  '.DSDDSSSKSSS',
  '.DDSSSSDDDD.',
  '...SSSSSSSD.',
  '.SSDDRRRDDD.',
  'SSDDDRRRRDD.',
  'SSDDRRYRRYD.',
  '.DDRRRRRRRR.',
  '.DRRRRRRRRR.',
  'DDRRRR.RRRR.',
  'DDRRR...RRRR',
  'DD.DDD...DDD',
  '....DDD..DDD',
];
const SM_DIE = [
  '............',
  '...RRRRRR...',
  '..RRRRRRRR..',
  '..DDDSSDS...',
  '.DSDSSSDSSS.',
  '.DDSSSSDDD..',
  '..SSKSSKSS..',
  'SS.SSSSSS.SS',
  'SSDDRRRRDDSS',
  'SSDRRRRRRDSS',
  '.DDRRYYRRDD.',
  '..RRRRRRRR..',
  '..RRR..RRR..',
  '.DDDD..DDDD.',
  'DDDDD..DDDDD',
  '............',
];

// ---- Mario (big) 16x32, faces right ---------------------------------------
const BM_STAND = [
  '....RRRRRRR.....',
  '...RRRRRRRRRRR..',
  '...RRRRRRRRRRR..',
  '...DDDDSSSKS....',
  '..DSSDSSSSKSSS..',
  '..DSSDDSSSSKSSS.',
  '..DSSDDSSSSKSSSS',
  '..DDSSSSSSDDDD..',
  '....SSSSSSSS....',
  '...DDDDRRDDDD...',
  '..DDDDRRRRDDDD..',
  '.DDDDRRRRRRDDDD.',
  '.DDDRRRRRRRRDDD.',
  '.DDDRRYRRYRRDDD.',
  'SSDDRRYRRYRRDDSS',
  'SSSRRRRRRRRRRSSS',
  'SSSRRRRRRRRRRSSS',
  'SSRRRRRRRRRRRRSS',
  '..RRRRRRRRRRRR..',
  '..RRRRRRRRRRRR..',
  '..RRRRRRRRRRRR..',
  '..RRRRR..RRRRR..',
  '..RRRRR..RRRRR..',
  '..RRRR....RRRR..',
  '..RRRR....RRRR..',
  '..RRRR....RRRR..',
  '..DRRR....RRRD..',
  '..DDDD....DDDD..',
  '.DDDDD....DDDDD.',
  '.DDDDD....DDDDD.',
  'DDDDDD....DDDDDD',
  'DDDDDD....DDDDDD',
];
const BM_WALK1 = [
  '....RRRRRRR.....',
  '...RRRRRRRRRRR..',
  '...RRRRRRRRRRR..',
  '...DDDDSSSKS....',
  '..DSSDSSSSKSSS..',
  '..DSSDDSSSSKSSS.',
  '..DSSDDSSSSKSSSS',
  '..DDSSSSSSDDDD..',
  '....SSSSSSSS....',
  '...DDDDRRDDDD...',
  '..DDDDRRRRDDDD..',
  '..DDDRRRRRRDDD..',
  '..DDRRRRRRRRDD..',
  '..DDRRYRRYRRDD..',
  '..SDRRYRRYRRDS..',
  '..SSRRRRRRRRSS..',
  '...SRRRRRRRRS...',
  '...RRRRRRRRRR...',
  '...RRRRRRRRR....',
  '...RRRRRRRR.....',
  '...RRRRRRRR.....',
  '...RRRRDDRR.....',
  '...RRRDDDDR.....',
  '..RRRRDDDD......',
  '..RRRDDDD.......',
  '..RRDDDDD.......',
  '..DDDDDDDD......',
  '..DDDDDDDDD.....',
  '...DDDDDDDDD....',
  '....DDDDDDDD....',
  '.....DDDDDDD....',
  '......DDDDDD....',
];
const BM_WALK2 = [
  '....RRRRRRR.....',
  '...RRRRRRRRRRR..',
  '...RRRRRRRRRRR..',
  '...DDDDSSSKS....',
  '..DSSDSSSSKSSS..',
  '..DSSDDSSSSKSSS.',
  '..DSSDDSSSSKSSSS',
  '..DDSSSSSSDDDD..',
  '....SSSSSSSS....',
  '...DDDDRRDDDD...',
  '..DDDDRRRRDDDD..',
  '.DDDDRRRRRRDDDD.',
  '.DDDRRRRRRRRDDD.',
  '.DDDRRYRRYRRDDD.',
  'SSDDRRYRRYRRDDSS',
  'SSSRRRRRRRRRRSSS',
  'SSRRRRRRRRRRRRSS',
  '.RRRRRRRRRRRRRR.',
  '.RRRRRR..RRRRRR.',
  '.RRRRR....RRRRR.',
  'RRRRR......RRRRR',
  'RRRR........RRRR',
  'RRRR........RRRR',
  'RRR..........RRR',
  'DRR..........RRD',
  'DDD..........DDD',
  'DDDD........DDDD',
  'DDDD........DDDD',
  'DDDD........DDDD',
  'DDDD........DDDD',
  'DDDDD......DDDDD',
  'DDDDD......DDDDD',
];
const BM_JUMP = [
  '....RRRRRRR..SSS',
  '...RRRRRRRRRRSSS',
  '...RRRRRRRRRRSSS',
  '...DDDDSSSKS.SS.',
  '..DSSDSSSSKSSS..',
  '..DSSDDSSSSKSSS.',
  '..DSSDDSSSSKSSSS',
  '..DDSSSSSSDDDD..',
  '..SSSSSSSSSSD...',
  '.SSDDDDRRDDDD...',
  'SSDDDDRRRRDDDD..',
  'SSDDDRRRRRRDDDD.',
  'SSDDRRRRRRRRDDD.',
  '.DDDRRYRRYRRDDD.',
  '.DDDRRYRRYRRDDD.',
  '..DRRRRRRRRRRDD.',
  '..RRRRRRRRRRRRD.',
  '.RRRRRRRRRRRRRR.',
  '.RRRRRR..RRRRRR.',
  '.RRRRR....RRRRR.',
  'RRRRR......RRRRR',
  'RRRR........RRRR',
  'RRRR........RRRR',
  'RRRR.......RRRR.',
  'DRRR.......RRRD.',
  'DDDD......DDDD..',
  'DDDD.....DDDDD..',
  'DDDD....DDDDDD..',
  'DDD.....DDDDD...',
  '........DDDD....',
  '................',
  '................',
];
const BM_CROUCH = [
  '....RRRRRRR.....',
  '...RRRRRRRRRRR..',
  '...RRRRRRRRRRR..',
  '...DDDDSSSKS....',
  '..DSSDSSSSKSSS..',
  '..DSSDDSSSSKSSS.',
  '..DSSDDSSSSKSSSS',
  '..DDSSSSSSDDDD..',
  '....SSSSSSSS....',
  '..DDDDRRRRDDDD..',
  '.DDDRRRRRRRRDDD.',
  'SSDDRRYRRYRRDDSS',
  'SSRRRRRRRRRRRRSS',
  '.RRRRRR..RRRRRR.',
  '.DDDDD....DDDDD.',
  'DDDDDD....DDDDDD',
];

// ---- Enemies ---------------------------------------------------------------
const GOOMBA = [
  '......OOOO......',
  '....OOOOOOOO....',
  '...OOOOOOOOOO...',
  '..OOWWKOOKWWOO..',
  '.OOWWWKOOKWWWOO.',
  '.OOOKKOOOOKKOOO.',
  'OOOOOOOOOOOOOOOO',
  'OOOOOOOOOOOOOOOO',
  '.OOOOOOOOOOOOOO.',
  '..OFFFFFFFFFFO..',
  '.KKFFFFFFFFFFKK.',
  '.KKKK......KKKK.',
  'KKKKKK....KKKKKK',
];
const GOOMBA_FLAT = [
  '....OOOOOOOO....',
  '..OOOOOOOOOOOO..',
  '.OOWWKOOOOKWWOO.',
  'OFFFFFFFFFFFFFFO',
  'KKKKKK....KKKKKK',
];
// Koopa (green) 16x23, faces right
const KOOPA1 = [
  '...........GG...',
  '..........GGGG..',
  '.........GTKTG..',
  '.........TTKTT..',
  '.........TTTTT..',
  '........TTTTT...',
  '...GGGG.TTTT....',
  '..GLLLLGGTT.....',
  '.GLLGGLLGGT.....',
  '.GLGLLGLLGG.....',
  'GLLGLLGGLLG.....',
  'GLGGLLGGLLGG....',
  'GLGLLGGLLGGG....',
  'GLLGGLLGGLGG....',
  '.GLLLLLLLLG.....',
  '..GGGGGGGGG.....',
  '..TTT..TTT......',
  '..TTT..TTT......',
  '.TTT...TTT......',
  '.TTT...TTTT.....',
];
const KOOPA2 = [
  '...........GG...',
  '..........GGGG..',
  '.........GTKTG..',
  '.........TTKTT..',
  '.........TTTTT..',
  '........TTTTT...',
  '...GGGG.TTTT....',
  '..GLLLLGGTT.....',
  '.GLLGGLLGGT.....',
  '.GLGLLGLLGG.....',
  'GLLGLLGGLLG.....',
  'GLGGLLGGLLGG....',
  'GLGLLGGLLGGG....',
  'GLLGGLLGGLGG....',
  '.GLLLLLLLLG.....',
  '..GGGGGGGGG.....',
  '...TTTTTT.......',
  '...TTTTTT.......',
  '..TTTTTTTT......',
  '..TTT..TTTT.....',
];
const SHELL = [
  '....GGGGGGGG....',
  '..GGLLLLLLLLGG..',
  '.GLLGGLLLLGGLLG.',
  '.GLGLLGGGGLLGLG.',
  'GLLGLLGLLGLLGLLG',
  'GLGGLLGLLGLLGGLG',
  'GLLGGLLGGLLGGLLG',
  '.GLLLLLLLLLLLLG.',
  '.GGGGGGGGGGGGGG.',
  '..WWWWWWWWWWWW..',
  '...GGGGGGGGGG...',
];
// Piranha plant 16x23
const PLANT1 = [
  '....WWWWWW......',
  '...WRRRRRRW.....',
  '..WRRWWRRRRW....',
  '..WRWWRRRRRRW...',
  '..WRRWWRRWWRW...',
  '.WWWWWWWWWWWWW..',
  '.WRRRRRRRRRRRW..',
  '..WRRWWRRWWRW...',
  '..WRRRRRRRRW....',
  '...WRRRRRRW.....',
  '....WWWWWW......',
  'GG....GG....GG..',
  '.GG...GG...GG...',
  '..GGG.GG.GGG....',
  '....GGGGGG......',
  '......GG........',
  '......GG........',
  '......GG........',
  '......GG........',
  '......GG........',
];
const PLANT2 = [
  '....WWWWWW......',
  '...WRRRRRRW.....',
  '..WRRWWRRRRW....',
  '..WRWWRRRRRRW...',
  '..WRRWWRRWWRW...',
  '..WRRRRRRRRRW...',
  '..WRRRRRRRRW....',
  '..WRRWWRRWWW....',
  '..WRRRRRRRW.....',
  '...WRRRRRW......',
  '....WWWWW.......',
  'GG....GG....GG..',
  '.GG...GG...GG...',
  '..GGG.GG.GGG....',
  '....GGGGGG......',
  '......GG........',
  '......GG........',
  '......GG........',
  '......GG........',
  '......GG........',
];
// Bowser 32x32, faces left (he confronts mario coming from left)
const BOWSER1 = [
  '..........GGGG..................',
  '.........GGGGGG......GGGG.......',
  '........GGWWKGG.....GGGGGG......',
  '........GWWWKGG....GGGGGGGG.....',
  '.....R..GWWKKGG...GGLLLLGG......',
  '....RRR.GGGGGGG..GGLLLLLLGG.....',
  '....RRRGGGGGGGGGGGLLGGGGLLGG....',
  '.....RRGGTTTTGGGGLLGWWWWGLLG....',
  '.....RGGTTTTTTGGGLLGWGGWGLLG....',
  '....GGGTTTTTTTTGGLLGWWWWGLLG....',
  '...GGTTTTKTTKTTTGGLLGGGGLLGG....',
  '...GTTTTTKTTKTTTTGGLLLLLLGG.....',
  '...GTTTTTTTTTTTTTGGGLLLLGGG.....',
  '...GTTKTTKTTKTTKTGGGGGGGGGG.....',
  '...GTTTKTTKTTKTTGGTTTTTTTGG.....',
  '....GTTTTTTTTTTGGTTTTTTTTTGG....',
  '.....GGTTTTTTGGTTTTTTTTTTTGG....',
  '......GGGGGGGTTTTTTTTTTTTTGG....',
  '....GGGTTTTTTTTTTTTTTTTTTGG.....',
  '...GGTTTTTTTTTTTTTTTTTTTGGG.....',
  '..GGTTTTTTTTTTTTTTTTTTGGGGGG....',
  '..GTTKTTTTTTTTTTTTTTGGGGGGGGG...',
  '..GTTTTTTTTTTTTTTTGGGGGGGGGGG...',
  '..GGTTTTTTTTTTTTTGGGGGGGGGGGG...',
  '...GGTTTTTTTTTTTGGGGGGGGGGGG....',
  '....GGGTTTTTTTGGGGGGGGGGGGG.....',
  '.....GGGGGGGGGGGGGGGGGGGG.......',
  '....GTTTGGGG....GGGGGTTTG.......',
  '...GTTTTTG........GTTTTTTG......',
  '..GTTTTTTG........GTTTTTTTG.....',
  '..GTTKKKTG........GTTKKKTTG.....',
  '..KKKKKKKK........KKKKKKKKK.....',
];
const BOWSER2 = [
  '..........GGGG..................',
  '.........GGGGGG......GGGG.......',
  '........GGWWKGG.....GGGGGG......',
  '........GWWWKGG....GGGGGGGG.....',
  '.....R..GWWKKGG...GGLLLLGG......',
  '....RRR.GGGGGGG..GGLLLLLLGG.....',
  '....RRRGGGGGGGGGGGLLGGGGLLGG....',
  '.....RRGGTTTTGGGGLLGWWWWGLLG....',
  '.....RGGTTTTTTGGGLLGWGGWGLLG....',
  '....GGGTTTTTTTTGGLLGWWWWGLLG....',
  '...GGTTTTKTTKTTTGGLLGGGGLLGG....',
  '...GTTTTTKTTKTTTTGGLLLLLLGG.....',
  '...GTTTTTTTTTTTTTGGGLLLLGGG.....',
  '...GTKTTKTTKTTKTTGGGGGGGGGG.....',
  '...GTTKTTKTTKTTTGGTTTTTTTGG.....',
  '....GTTTTTTTTTTGGTTTTTTTTTGG....',
  '.....GGTTTTTTGGTTTTTTTTTTTGG....',
  '......GGGGGGGTTTTTTTTTTTTTGG....',
  '....GGGTTTTTTTTTTTTTTTTTTGG.....',
  '...GGTTTTTTTTTTTTTTTTTTTGGG.....',
  '..GGTTTTTTTTTTTTTTTTTTGGGGGG....',
  '..GTTKTTTTTTTTTTTTTTGGGGGGGGG...',
  '..GTTTTTTTTTTTTTTTGGGGGGGGGGG...',
  '..GGTTTTTTTTTTTTTGGGGGGGGGGGG...',
  '...GGTTTTTTTTTTTGGGGGGGGGGGG....',
  '....GGGTTTTTTTGGGGGGGGGGGGG.....',
  '.....GGGGGGGGGGGGGGGGGGGG.......',
  '.....GTTTGGGG...GGGGTTTG........',
  '....GTTTTTG......GTTTTTTG.......',
  '....GTTTTTG......GTTTTTTG.......',
  '....GTTKKKTG.....GTTKKKTG.......',
  '....KKKKKKKK.....KKKKKKKK.......',
];

// ---- Items -----------------------------------------------------------------
const MUSHROOM = [
  '.....KKKKKK.....',
  '...KKRRWWRRKK...',
  '..KRRRWWWWRRRK..',
  '.KRWWRWWWWRRRRK.',
  '.KRWWRRWWRRWWRK.',
  'KRRWWRRRRRRWWRRK',
  'KRRRRRRRRRRWWRRK',
  'KRRRRRRRRRRRRRRK',
  '.KKKKKKKKKKKKKK.',
  '..KFFFKFFKFFFK..',
  '..KFFFKFFKFFFK..',
  '..KFFFFFFFFFFK..',
  '...KFFFFFFFFK...',
  '....KKKKKKKK....',
];
const FLOWER = [
  '....WWWWWW......',
  '...WPPPPPPW.....',
  '..WPPYYYYPPW....',
  '..WPPYWWYPPW....',
  '..WPPYWWYPPW....',
  '..WPPYYYYPPW....',
  '...WPPPPPPW.....',
  '....WWWWWW......',
  '.......GG.......',
  '.GGG...GG...GGG.',
  '.GGGG..GG..GGGG.',
  '..GGGGGGGGGGGG..',
  '.......GG.......',
  '.......GG.......',
];
const COIN_FRAMES = (() => {
  const mk = (w) => {
    const rows = [];
    for (let y = 0; y < 14; y++) {
      let r = '';
      for (let x = 0; x < 10; x++) {
        const cx = Math.abs(x - 4.5), half = w / 2;
        if (cx > half) { r += '.'; continue; }
        const edge = (y === 0 || y === 13 || cx > half - 1);
        r += edge ? 'P' : (x < 5 ? 'Y' : 'P') ;
      }
      rows.push(r);
    }
    // shine
    if (w >= 6) {
      for (let y = 3; y < 11; y++) rows[y] = rows[y].slice(0, 4) + 'W' + rows[y].slice(5);
    }
    return rows;
  };
  return [mk(8), mk(5), mk(2), mk(5)];
})();
const FIREBALL = [
  '..YY....',
  '.YWWY...',
  'YWWWWY..',
  'YWWWWPP.',
  '.YWWPP..',
  '..YPP...',
  '...P....',
  '........',
];
const BFIRE = [
  '......PPRR..............',
  '..PPRRRRRRRR....RRRR....',
  'PPRRYYYYYYRRRRRRRRYYRR..',
  'RRYYWWWWYYYYYYYYYYYYYYRR',
  'PPRRYYYYYYRRRRRRRRYYRR..',
  '..PPRRRRRRRR....RRRR....',
  '......PPRR..............',
  '........................',
];
const FLAG = [
  'GGGGGGGGGGGGGG..',
  '.GGGGGWWGGGGG...',
  '..GGGWWWWGGG....',
  '...GGWWWWGG.....',
  '....GGWWGG......',
  '.....GGGG.......',
  '......GG........',
  '................',
];
const SHARD = [
  'OOOO',
  'OFFO',
  'OFOO',
  'OOOO',
];

// ---- Sprite registry --------------------------------------------------------
const SPR = {};
function buildSprites() {
  const firePal = { R: '#fcfcfc', D: '#c84c0c' }; // fire mario: white + orange
  const setOf = (frames, ov) => frames.map((f) => {
    const c = px(f, ov);
    return { r: c, l: flipped(c) };
  });

  SPR.small = setOf([SM_STAND, SM_WALK1, SM_WALK2, SM_JUMP, SM_DIE]);
  SPR.big = setOf([BM_STAND, BM_WALK1, BM_WALK2, BM_JUMP, BM_CROUCH]);
  SPR.fire = setOf([BM_STAND, BM_WALK1, BM_WALK2, BM_JUMP, BM_CROUCH], firePal);
  SPR.goomba = setOf([GOOMBA, GOOMBA_FLAT]);
  SPR.koopa = setOf([KOOPA1, KOOPA2]);
  SPR.koopaRed = setOf([KOOPA1, KOOPA2], { G: '#d82800', L: '#fc9838', N: '#882000' });
  SPR.shell = setOf([SHELL]);
  SPR.shellRed = setOf([SHELL], { G: '#d82800', L: '#fc9838' });
  SPR.plant = setOf([PLANT1, PLANT2]);
  SPR.bowser = setOf([BOWSER1, BOWSER2]);
  SPR.mushroom = setOf([MUSHROOM]);
  SPR.mushroom1up = setOf([MUSHROOM], { R: '#00a800' });
  SPR.flower = setOf([FLOWER]);
  SPR.coin = setOf(COIN_FRAMES);
  SPR.fireball = setOf([FIREBALL]);
  SPR.bfire = setOf([BFIRE]);
  SPR.flag = setOf([FLAG]);
  SPR.shard = setOf([SHARD]);
}
buildSprites();

// ---- Tiles (procedural, per theme) ------------------------------------------
// Tile ids: 0 air, 1 ground, 2 brick, 3 ?coin, 4 ?power, 5 hard block,
// 6 used block, 7 coin, 8 pipeTL, 9 pipeTR, 10 pipeL, 11 pipeR,
// 12 pole, 13 pole ball, 14 bridge, 15 lava, 16 axe.
const THEMES = {
  ow: { base: '#c84c0c', hi: '#fcbcb0', lo: '#000000', bg: '#5c94fc' },
  ug: { base: '#2470d8', hi: '#88b8fc', lo: '#000000', bg: '#000000' },
  ca: { base: '#7c7c7c', hi: '#bcbcbc', lo: '#000000', bg: '#000000' },
  ni: { base: '#c84c0c', hi: '#fcbcb0', lo: '#000000', bg: '#000000' },
};
const TILESET = {};

function tcv(draw) {
  const c = document.createElement('canvas');
  c.width = 16; c.height = 16;
  draw(c.getContext('2d'));
  return c;
}

function buildTiles() {
  for (const name in THEMES) {
    const t = THEMES[name];
    const set = {};

    set[1] = tcv((g) => { // ground
      g.fillStyle = t.base; g.fillRect(0, 0, 16, 16);
      g.fillStyle = t.hi;
      g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16);
      g.fillRect(2, 2, 5, 1); g.fillRect(9, 9, 5, 1);
      g.fillStyle = t.lo;
      g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16);
      g.fillRect(7, 2, 1, 6); g.fillRect(2, 9, 1, 6);
      g.fillRect(8, 8, 7, 1); g.fillRect(2, 8, 6, 1);
    });
    set[2] = tcv((g) => { // brick
      g.fillStyle = t.base; g.fillRect(0, 0, 16, 16);
      g.fillStyle = t.hi; g.fillRect(0, 0, 16, 1);
      g.fillStyle = t.lo;
      g.fillRect(0, 7, 16, 1); g.fillRect(0, 15, 16, 1);
      g.fillRect(7, 1, 1, 6); g.fillRect(3, 8, 1, 7); g.fillRect(11, 8, 1, 7);
    });
    const qblock = (used) => tcv((g) => {
      g.fillStyle = used ? '#9c4a00' : '#fc9838';
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#000';
      g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1);
      g.fillRect(0, 0, 1, 16); g.fillRect(15, 0, 1, 16);
      g.fillRect(1, 1, 1, 1); g.fillRect(14, 1, 1, 1);
      g.fillRect(1, 14, 1, 1); g.fillRect(14, 14, 1, 1);
      g.fillStyle = used ? '#5c2800' : '#e45c10';
      g.fillRect(1, 14, 14, 1); g.fillRect(14, 1, 1, 14);
      if (!used) {
        g.fillStyle = '#fcbcb0';
        g.fillRect(2, 1, 2, 2); // glint
        g.fillStyle = '#000';
        // question mark
        g.fillRect(5, 3, 6, 2); g.fillRect(4, 4, 2, 2); g.fillRect(10, 4, 2, 3);
        g.fillRect(8, 7, 3, 2); g.fillRect(7, 8, 2, 2); g.fillRect(7, 12, 2, 2);
      }
    });
    set[3] = qblock(false); set[4] = set[3]; set[6] = qblock(true);
    set[5] = tcv((g) => { // hard block
      g.fillStyle = t.base; g.fillRect(0, 0, 16, 16);
      g.fillStyle = t.hi;
      g.fillRect(0, 0, 16, 2); g.fillRect(0, 0, 2, 16);
      g.fillStyle = t.lo;
      g.fillRect(0, 14, 16, 2); g.fillRect(14, 0, 2, 16);
      g.fillStyle = t.hi; g.fillRect(0, 0, 1, 1);
    });
    const pipe = (lip, left) => tcv((g) => {
      const x0 = left ? 2 : 0, w = left ? 14 : 14;
      g.fillStyle = '#00a800';
      g.fillRect(left ? (lip ? 0 : 2) : 0, 0, 16, 16);
      g.fillStyle = '#80d010';
      if (left) { g.fillRect(lip ? 1 : 3, 0, 3, 16); g.fillRect(lip ? 5 : 7, 0, 2, 16); }
      else { g.fillRect(2, 0, 4, 16); }
      g.fillStyle = '#004000';
      if (left) g.fillRect(lip ? 0 : 2, 0, 1, 16);
      else { g.fillRect(15 - (lip ? 0 : 2), 0, 1, 16); g.fillRect(10, 0, 2, 16); }
      if (lip) { g.fillStyle = '#004000'; g.fillRect(0, 15, 16, 1); g.fillStyle = '#80d010'; g.fillRect(left ? 1 : 0, 0, left ? 15 : 16, 1); }
      void x0; void w;
    });
    set[8] = pipe(true, true); set[9] = pipe(true, false);
    set[10] = pipe(false, true); set[11] = pipe(false, false);
    set[12] = tcv((g) => { // pole
      g.fillStyle = '#80d010'; g.fillRect(7, 0, 2, 16);
      g.fillStyle = '#004000'; g.fillRect(9, 0, 1, 16);
    });
    set[13] = tcv((g) => { // pole ball
      g.fillStyle = '#80d010';
      g.fillRect(5, 8, 6, 8); g.fillRect(4, 9, 8, 6);
      g.fillStyle = '#fcfcfc'; g.fillRect(6, 9, 2, 2);
      g.fillStyle = '#80d010'; g.fillRect(7, 14, 2, 2);
    });
    set[14] = tcv((g) => { // bridge
      g.fillStyle = '#c84c0c'; g.fillRect(0, 0, 16, 8);
      g.fillStyle = '#fcbcb0'; g.fillRect(0, 0, 16, 1);
      g.fillStyle = '#000';
      g.fillRect(0, 7, 16, 1); g.fillRect(4, 1, 1, 6); g.fillRect(9, 1, 1, 6); g.fillRect(14, 1, 1, 6);
    });
    set[15] = tcv((g) => { // lava (frame handled in draw via offset)
      g.fillStyle = '#d82800'; g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#fc9838';
      g.fillRect(0, 0, 4, 2); g.fillRect(8, 0, 4, 2);
      g.fillRect(2, 2, 4, 1); g.fillRect(10, 2, 4, 1);
    });
    set[16] = tcv((g) => { // axe
      g.fillStyle = '#bcbcbc';
      g.fillRect(8, 1, 6, 3); g.fillRect(11, 4, 4, 3); g.fillRect(12, 7, 3, 2);
      g.fillStyle = '#fcfcfc'; g.fillRect(8, 1, 2, 2);
      g.fillStyle = '#882000';
      g.fillRect(7, 4, 3, 3); g.fillRect(5, 7, 3, 3) ; g.fillRect(3, 9, 3, 3); g.fillRect(1, 11, 3, 4);
      g.fillStyle = '#c84c0c'; g.fillRect(7, 4, 1, 2); g.fillRect(5, 7, 1, 2);
    });
    TILESET[name] = set;
  }
}
buildTiles();

// ---- Background decorations --------------------------------------------------
const DECOR = {};
function buildDecor() {
  // cloud (one hump 32x16); multi-hump drawn by repeating middle
  const cloudRows = [
    '...........WWWWW............',
    '.........WWWWWWWWW..........',
    '....W...WWWWWWWWWWW...W.....',
    '...WWW.WWWWWWWWWWWWW.WWW....',
    '..WWWWWWWWWWWWWWWWWWWWWWW...',
    '.WWWWWWWWWWWWWWWWWWWWWWWWW..',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWW.',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    '.WWWWWWWWWWWWWWWWWWWWWWWWWW.',
    '..WWWWWWWWWWWWWWWWWWWWWWWW..',
  ];
  DECOR.cloud = px(cloudRows);
  DECOR.bush = px(cloudRows, { W: '#00a800' });

  // hill 80x35
  const hc = document.createElement('canvas');
  hc.width = 80; hc.height = 35;
  const hg = hc.getContext('2d');
  hg.fillStyle = '#00a800';
  for (let y = 0; y < 35; y++) {
    const w = Math.min(80, 10 + y * 2.3);
    hg.fillRect(Math.round(40 - w / 2), y, Math.round(w), 1);
  }
  hg.fillStyle = '#005800';
  hg.fillRect(30, 10, 2, 2); hg.fillRect(44, 16, 2, 2); hg.fillRect(34, 22, 2, 2);
  hg.fillRect(52, 24, 2, 2); hg.fillRect(22, 26, 2, 2);
  DECOR.hill = hc;

  // castle 80x80
  const cc = document.createElement('canvas');
  cc.width = 80; cc.height = 80;
  const cg = cc.getContext('2d');
  const brick = (x, y, w, h) => {
    cg.fillStyle = '#c84c0c'; cg.fillRect(x, y, w, h);
    cg.fillStyle = '#000';
    for (let yy = y + 4; yy < y + h; yy += 5) cg.fillRect(x, yy, w, 1);
    cg.fillStyle = '#fcbcb0'; cg.fillRect(x, y, w, 1);
  };
  // battlements
  for (let i = 0; i < 5; i++) brick(i * 16 + 2, 16, 8, 8);
  brick(0, 24, 80, 24);
  for (let i = 0; i < 3; i++) brick(20 + i * 16, 0, 8, 8);
  brick(16, 8, 48, 16);
  brick(16, 48, 48, 32);
  brick(0, 48, 80, 32);
  cg.fillStyle = '#000';
  cg.fillRect(34, 60, 12, 20); cg.fillRect(36, 56, 8, 4); // door
  cg.fillRect(24, 30, 6, 8); cg.fillRect(50, 30, 6, 8);   // windows
  cg.fillRect(37, 12, 6, 8);
  DECOR.castle = cc;
}
buildDecor();

// ---- 5x7 bitmap font (NES look, 8px cell) ------------------------------------
const FONT = {
  '0':[0x0E,0x11,0x13,0x15,0x19,0x11,0x0E],'1':[0x04,0x0C,0x04,0x04,0x04,0x04,0x0E],
  '2':[0x0E,0x11,0x01,0x06,0x08,0x10,0x1F],'3':[0x1F,0x02,0x04,0x02,0x01,0x11,0x0E],
  '4':[0x02,0x06,0x0A,0x12,0x1F,0x02,0x02],'5':[0x1F,0x10,0x1E,0x01,0x01,0x11,0x0E],
  '6':[0x06,0x08,0x10,0x1E,0x11,0x11,0x0E],'7':[0x1F,0x01,0x02,0x04,0x08,0x08,0x08],
  '8':[0x0E,0x11,0x11,0x0E,0x11,0x11,0x0E],'9':[0x0E,0x11,0x11,0x0F,0x01,0x02,0x0C],
  A:[0x0E,0x11,0x11,0x1F,0x11,0x11,0x11],B:[0x1E,0x11,0x11,0x1E,0x11,0x11,0x1E],
  C:[0x0E,0x11,0x10,0x10,0x10,0x11,0x0E],D:[0x1C,0x12,0x11,0x11,0x11,0x12,0x1C],
  E:[0x1F,0x10,0x10,0x1E,0x10,0x10,0x1F],F:[0x1F,0x10,0x10,0x1E,0x10,0x10,0x10],
  G:[0x0E,0x11,0x10,0x17,0x11,0x11,0x0F],H:[0x11,0x11,0x11,0x1F,0x11,0x11,0x11],
  I:[0x0E,0x04,0x04,0x04,0x04,0x04,0x0E],J:[0x07,0x02,0x02,0x02,0x02,0x12,0x0C],
  K:[0x11,0x12,0x14,0x18,0x14,0x12,0x11],L:[0x10,0x10,0x10,0x10,0x10,0x10,0x1F],
  M:[0x11,0x1B,0x15,0x15,0x11,0x11,0x11],N:[0x11,0x19,0x15,0x13,0x11,0x11,0x11],
  O:[0x0E,0x11,0x11,0x11,0x11,0x11,0x0E],P:[0x1E,0x11,0x11,0x1E,0x10,0x10,0x10],
  Q:[0x0E,0x11,0x11,0x11,0x15,0x12,0x0D],R:[0x1E,0x11,0x11,0x1E,0x14,0x12,0x11],
  S:[0x0F,0x10,0x10,0x0E,0x01,0x01,0x1E],T:[0x1F,0x04,0x04,0x04,0x04,0x04,0x04],
  U:[0x11,0x11,0x11,0x11,0x11,0x11,0x0E],V:[0x11,0x11,0x11,0x11,0x11,0x0A,0x04],
  W:[0x11,0x11,0x11,0x15,0x15,0x1B,0x11],X:[0x11,0x11,0x0A,0x04,0x0A,0x11,0x11],
  Y:[0x11,0x11,0x0A,0x04,0x04,0x04,0x04],Z:[0x1F,0x01,0x02,0x04,0x08,0x10,0x1F],
  '-':[0,0,0,0x0E,0,0,0],'.':[0,0,0,0,0,0x0C,0x0C],'!':[0x04,0x04,0x04,0x04,0x04,0,0x04],
  '?':[0x0E,0x11,0x01,0x02,0x04,0,0x04],'*':[0,0x11,0x0A,0x04,0x0A,0x11,0],
  ':':[0,0x0C,0x0C,0,0x0C,0x0C,0],'<':[0x02,0x04,0x08,0x10,0x08,0x04,0x02],
  '>':[0x08,0x04,0x02,0x01,0x02,0x04,0x08],"'":[0x04,0x04,0,0,0,0,0],
  ',':[0,0,0,0,0x0C,0x04,0x08],' ':[0,0,0,0,0,0,0],
};
function drawText(g, str, x, y, color) {
  g.fillStyle = color || '#fcfcfc';
  str = String(str).toUpperCase();
  for (let i = 0; i < str.length; i++) {
    const gl = FONT[str[i]];
    if (!gl) continue;
    const ox = x + i * 8;
    for (let r = 0; r < 7; r++) {
      const bits = gl[r];
      for (let b = 0; b < 5; b++) {
        if (bits & (0x10 >> b)) g.fillRect(ox + b + 1, y + r, 1, 1);
      }
    }
  }
}
