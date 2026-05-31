import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const ROAD_W = 13;
const SIDEWALK_W = 3;
const TILE_LEN = 12;
const POOL = 60;

function rand(a, b) { return a + Math.random() * (b - a); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

/* ═══ BUS ═══ */
function makeBus() {
  const g = new THREE.Group();
  const m = (c) => new THREE.MeshLambertMaterial({ color: c });
  const gl = (c, o) => new THREE.MeshLambertMaterial({ color: c, transparent: true, opacity: o || 0.45 });
  // chassis
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 9), m(0x1565C0)), { position: new THREE.Vector3(0, 0.8, 0) }));
  // upper body
  const upper = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 8.8), m(0x1E88E5));
  upper.position.y = 2.3; upper.castShadow = true; g.add(upper);
  // roof
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.2, 8.4), m(0x0D47A1)), { position: new THREE.Vector3(0, 3.5, 0) }));
  // windshield
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.6, 0.1), gl(0x90CAF9)), { position: new THREE.Vector3(0, 2.5, -4.5) }));
  // rear window
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 0.1), gl(0x90CAF9)), { position: new THREE.Vector3(0, 2.6, 4.5) }));
  // side windows
  for (let s = -1; s <= 1; s += 2)
    for (let i = -3.2; i <= 3.2; i += 1.6)
      g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 1.1), gl(0xBBDEFB, 0.5)), { position: new THREE.Vector3(s * 1.65, 2.6, i) }));
  // wheels
  const wG = new THREE.CylinderGeometry(0.52, 0.52, 0.45, 14);
  const wM = m(0x222222);
  const wP = [[-1.7, 0.52, -3.2], [1.7, 0.52, -3.2], [-1.7, 0.52, 3.2], [1.7, 0.52, 3.2]];
  const wheels = [];
  wP.forEach(([x, y, z]) => {
    const wh = new THREE.Mesh(wG, wM); wh.rotation.z = Math.PI / 2; wh.position.set(x, y, z); g.add(wh); wheels.push(wh);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.46, 8), m(0x999999));
    hub.rotation.z = Math.PI / 2; hub.position.set(x, y, z); g.add(hub);
  });
  // headlights
  for (let s of [-1, 1]) g.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshBasicMaterial({ color: 0xFFF9C4 })), { position: new THREE.Vector3(s * 1.1, 1.3, -4.55) }));
  // taillights
  for (let s of [-1, 1]) g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.1), new THREE.MeshBasicMaterial({ color: 0xff1744 })), { position: new THREE.Vector3(s * 1.1, 1.3, 4.55) }));
  // bumper
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.45, 0.3), m(0xBDBDBD)), { position: new THREE.Vector3(0, 0.6, -4.6) }));
  // route sign
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 0.08), m(0xFF8F00)), { position: new THREE.Vector3(0, 3.65, -4.3) }));
  g.userData.wheels = wheels;
  return g;
}

/* ═══ SCENERY ═══ */
function makeTree() {
  const g = new THREE.Group();
  const h = rand(3, 7);
  g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, h * 0.45, 6), new THREE.MeshLambertMaterial({ color: 0x6D4C41 })), { position: new THREE.Vector3(0, h * 0.22, 0) }));
  g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0, rand(1.5, 3), h * 0.65, 7), new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL(rand(0.25, 0.4), 0.7, rand(0.3, 0.5)) })), { position: new THREE.Vector3(0, h * 0.65, 0) }));
  return g;
}
function makeBuilding() {
  const g = new THREE.Group();
  const h = rand(6, 22), w = rand(5, 12), d = rand(5, 10);
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL(rand(0, 1), rand(0.15, 0.5), rand(0.5, 0.75)) }));
  body.position.y = h / 2; body.castShadow = true; g.add(body);
  const winM = new THREE.MeshBasicMaterial({ color: 0xFFF9C4 });
  for (let wy = 2; wy < h - 1; wy += 2.2)
    for (let wx = -w / 2 + 1.2; wx < w / 2 - 0.5; wx += 1.8)
      if (Math.random() > 0.3) g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.1), winM), { position: new THREE.Vector3(wx, wy, d / 2 + 0.06) }));
  return g;
}
function makePole() {
  const g = new THREE.Group();
  g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 5, 6), new THREE.MeshLambertMaterial({ color: 0x78909C })), { position: new THREE.Vector3(0, 2.5, 0) }));
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.08), new THREE.MeshLambertMaterial({ color: 0x78909C })), { position: new THREE.Vector3(-0.9, 4.9, 0) }));
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.3), new THREE.MeshBasicMaterial({ color: 0xFFEE58 })), { position: new THREE.Vector3(-1.8, 4.8, 0) }));
  return g;
}
function makeMarker() {
  const g = new THREE.Group();
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.0, 0.15), new THREE.MeshLambertMaterial({ color: 0xffffff })), { position: new THREE.Vector3(0, 0.5, 0) }));
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, 0.18), new THREE.MeshBasicMaterial({ color: 0xff5722 })), { position: new THREE.Vector3(0, 0.85, 0) }));
  return g;
}

/* ═══ COMPONENT ═══ */
export default function BusDrivingGame() {
  const elRef = useRef(null);
  const [hud, setHud] = useState({ speed: 0, dist: 0, fork: false });
  const [started, setStarted] = useState(false);
  const touchR = useRef({ steer: 0, gas: false, brake: false });

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let W = el.clientWidth, H = el.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7EC8E3);
    scene.fog = new THREE.Fog(0x7EC8E3, 100, 380);

    const camera = new THREE.PerspectiveCamera(58, W / H, 0.5, 500);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffeedd, 1.0);
    sun.position.set(60, 120, -40); sun.castShadow = true;
    sun.shadow.camera.left = -80; sun.shadow.camera.right = 80;
    sun.shadow.camera.top = 80; sun.shadow.camera.bottom = -80;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(0x87CEEB, 0x558B2F, 0.35));

    // Ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshLambertMaterial({ color: 0x558B2F }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true; scene.add(ground);

    // Materials
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x37474F });
    const swMat = new THREE.MeshLambertMaterial({ color: 0x9E9E9E });
    const curbMat = new THREE.MeshLambertMaterial({ color: 0xBDBDBD });
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xFFD600 });

    // ── Road Tile Pool ──
    // Tiles are laid along the Z axis. Bus drives in -Z. Tiles recycle.
    function makeTile() {
      const g = new THREE.Group();
      // road surface (raised above ground)
      const surf = new THREE.Mesh(new THREE.BoxGeometry(ROAD_W, 0.18, TILE_LEN), roadMat);
      surf.position.y = 0.09; surf.receiveShadow = true; g.add(surf);
      // sidewalks
      for (let s of [-1, 1]) {
        const sw = new THREE.Mesh(new THREE.BoxGeometry(SIDEWALK_W, 0.3, TILE_LEN), swMat);
        sw.position.set(s * (ROAD_W / 2 + SIDEWALK_W / 2), 0.15, 0); g.add(sw);
        const cu = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.4, TILE_LEN), curbMat);
        cu.position.set(s * (ROAD_W / 2 + 0.12), 0.2, 0); g.add(cu);
      }
      // center dashes
      for (let d = -TILE_LEN / 2 + 1; d < TILE_LEN / 2; d += 3) {
        const da = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 1.8), dashMat);
        da.position.set(0, 0.19, d); g.add(da);
      }
      // lane lines (two lanes each direction = 4 lanes total)
      for (let lane of [-ROAD_W / 4, ROAD_W / 4]) {
        for (let d = -TILE_LEN / 2 + 2; d < TILE_LEN / 2; d += 4) {
          const ll = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 1.2), dashMat);
          ll.position.set(lane, 0.19, d); g.add(ll);
        }
      }
      // edge lines
      for (let s of [-1, 1]) {
        const ed = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, TILE_LEN), edgeMat);
        ed.position.set(s * (ROAD_W / 2 - 0.5), 0.19, 0); g.add(ed);
      }
      return g;
    }

    const tiles = [];
    const tileScenery = new Map();
    for (let i = 0; i < POOL; i++) {
      const t = makeTile();
      const wz = -(i - 10) * TILE_LEN;
      t.position.set(0, 0, wz);
      scene.add(t);
      tiles.push({ mesh: t, wz });
    }

    // Scenery for a tile
    function spawnScenery(tile) {
      const objs = [];
      const z = tile.wz;
      // markers both sides (every tile)
      for (let s of [-1, 1]) {
        const mk = makeMarker();
        mk.position.set(s * (ROAD_W / 2 + SIDEWALK_W + 0.5), 0, z);
        scene.add(mk); objs.push(mk);
      }
      // trees - DENSE, close to road
      for (let s of [-1, 1]) {
        // near tree
        if (Math.random() > 0.15) {
          const t = makeTree();
          t.position.set(s * (ROAD_W / 2 + SIDEWALK_W + rand(1.5, 6)), 0, z + rand(-5, 5));
          scene.add(t); objs.push(t);
        }
        // far tree
        if (Math.random() > 0.3) {
          const t = makeTree();
          t.position.set(s * (ROAD_W / 2 + SIDEWALK_W + rand(7, 20)), 0, z + rand(-5, 5));
          scene.add(t); objs.push(t);
        }
      }
      // street lights every ~3 tiles
      if (Math.round(z / TILE_LEN) % 3 === 0) {
        for (let s of [-1, 1]) {
          const p = makePole();
          p.position.set(s * (ROAD_W / 2 + SIDEWALK_W - 0.3), 0, z);
          p.rotation.y = s < 0 ? 0 : Math.PI;
          scene.add(p); objs.push(p);
        }
      }
      // buildings
      for (let s of [-1, 1]) {
        if (Math.random() > 0.4) {
          const b = makeBuilding();
          b.position.set(s * (ROAD_W / 2 + SIDEWALK_W + rand(12, 35)), 0, z + rand(-4, 4));
          scene.add(b); objs.push(b);
        }
      }
      tileScenery.set(tile, objs);
    }

    function clearScenery(tile) {
      const objs = tileScenery.get(tile);
      if (objs) { objs.forEach(o => scene.remove(o)); tileScenery.delete(tile); }
    }

    // Initial scenery
    tiles.forEach(t => spawnScenery(t));

    // Fork visuals
    let forkGroup = null, forkActive = false, forkZ = 0, nextForkDist = 200;

    function spawnFork(z) {
      const fg = new THREE.Group();
      const bAngle = 0.4;
      for (let dir of [-1, 1]) {
        for (let i = 1; i <= 6; i++) {
          const seg = new THREE.Mesh(new THREE.BoxGeometry(ROAD_W * 0.7, 0.16, TILE_LEN * 0.8), roadMat);
          seg.position.set(dir * Math.sin(bAngle) * i * TILE_LEN * 0.7, 0.08,
            z - Math.cos(bAngle) * i * TILE_LEN * 0.7 - TILE_LEN);
          seg.rotation.y = -dir * bAngle;
          fg.add(seg);
        }
      }
      // road arrows
      for (let dir of [-1, 1]) {
        const arr = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.04, 3.5),
          new THREE.MeshBasicMaterial({ color: dir < 0 ? 0x4CAF50 : 0xFF9800 }));
        arr.position.set(dir * 2.8, 0.2, z + 5);
        arr.rotation.y = -dir * 0.2;
        fg.add(arr);
      }
      // sign post
      const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6, 6),
        new THREE.MeshLambertMaterial({ color: 0x555555 }));
      sp.position.set(ROAD_W / 2 + SIDEWALK_W + 1.5, 3, z + 8);
      fg.add(sp);
      const board = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.2, 0.15),
        new THREE.MeshLambertMaterial({ color: 0x1565C0 }));
      board.position.set(ROAD_W / 2 + SIDEWALK_W + 1.5, 5.5, z + 8);
      fg.add(board);
      // arrows on sign
      for (let dir of [-1, 1]) {
        const a = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.02),
          new THREE.MeshBasicMaterial({ color: dir < 0 ? 0x66BB6A : 0xFFA726 }));
        a.position.set(ROAD_W / 2 + SIDEWALK_W + 1.5 + dir * 0.5, 5.5 + dir * 0.25, z + 7.9);
        a.rotation.z = dir * 0.4;
        fg.add(a);
      }
      scene.add(fg);
      return fg;
    }

    // Bus
    const bus = makeBus();
    scene.add(bus);

    // Clouds
    const cloudM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    for (let i = 0; i < 25; i++) {
      const c = new THREE.Mesh(new THREE.SphereGeometry(rand(6, 18), 7, 5), cloudM);
      c.scale.set(rand(1, 3.5), 0.4, rand(0.8, 2));
      c.position.set(rand(-250, 250), rand(50, 90), rand(-200, 200));
      scene.add(c);
    }

    // ── Game State ──
    const G = { px: 0, pz: 0, heading: 0, speed: 0, dist: 0, keys: {},
      camPos: new THREE.Vector3(0, 9, 18) };

    const kd = (e) => { G.keys[e.key] = true; if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault(); };
    const ku = (e) => { G.keys[e.key] = false; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    const onR = () => { W = el.clientWidth; H = el.clientHeight; camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H); };
    window.addEventListener('resize', onR);

    // ── Loop ──
    const clock = new THREE.Clock();
    let raf;

    function loop() {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      const T = touchR.current;

      // Speed
      if (G.keys['ArrowUp'] || G.keys['w'] || T.gas) G.speed = Math.min(G.speed + 5 * dt, 3.2);
      else if (G.keys['ArrowDown'] || G.keys['s'] || T.brake) G.speed = Math.max(G.speed - 7 * dt, -0.8);
      else G.speed += (1.4 - G.speed) * dt * 1.0;

      // Steer
      let st = 0;
      if (G.keys['ArrowLeft'] || G.keys['a']) st = 1;
      if (G.keys['ArrowRight'] || G.keys['d']) st = -1;
      if (T.steer) st = T.steer;
      G.heading += st * 2.2 * dt * Math.min(Math.abs(G.speed), 1.5);

      // Move
      G.px -= Math.sin(G.heading) * G.speed;
      G.pz -= Math.cos(G.heading) * G.speed;
      G.dist += Math.abs(G.speed) * dt * 30;

      // Bus
      bus.position.set(G.px, 0, G.pz);
      bus.rotation.y = G.heading;
      bus.userData.wheels.forEach(w => { w.rotation.x += G.speed * 0.4; });

      // ── Recycle tiles ──
      // Road tiles are in world-Z. Recycle based on bus pz.
      tiles.forEach(t => {
        let rel = t.wz - G.pz;
        if (rel > (POOL / 2) * TILE_LEN) {
          clearScenery(t);
          t.wz -= POOL * TILE_LEN;
          t.mesh.position.z = t.wz;
          t.mesh.position.x = 0; // road stays at x=0 world
          spawnScenery(t);
        } else if (rel < -(POOL / 2) * TILE_LEN) {
          clearScenery(t);
          t.wz += POOL * TILE_LEN;
          t.mesh.position.z = t.wz;
          t.mesh.position.x = 0;
          spawnScenery(t);
        }
      });

      // ── Fork ──
      nextForkDist -= Math.abs(G.speed) * dt * 30;
      let nearFork = false;
      if (nextForkDist <= 0 && !forkActive) {
        forkZ = G.pz - 80;
        forkGroup = spawnFork(forkZ);
        forkActive = true;
        nextForkDist = rand(250, 500);
      }
      if (forkActive && forkGroup) {
        const d = G.pz - forkZ;
        nearFork = d > -40 && d < 15;
        if (d < -30) {
          scene.remove(forkGroup); forkGroup = null; forkActive = false;
        }
      }

      // Camera
      const cd = 16, ch = 8;
      const ideal = new THREE.Vector3(
        G.px + Math.sin(G.heading) * cd, ch,
        G.pz + Math.cos(G.heading) * cd
      );
      G.camPos.lerp(ideal, 0.065);
      camera.position.copy(G.camPos);
      camera.lookAt(G.px - Math.sin(G.heading) * 14, 2, G.pz - Math.cos(G.heading) * 14);

      // Follow ground + sun
      ground.position.x = G.px; ground.position.z = G.pz;
      sun.position.set(G.px + 60, 120, G.pz - 40);
      sun.target.position.set(G.px, 0, G.pz);
      sun.target.updateMatrixWorld();

      setHud({ speed: Math.abs(Math.round(G.speed * 32)), dist: Math.round(G.dist), fork: nearFork });

      renderer.render(scene, camera);
    }
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('resize', onR);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  const tSet = (k, v) => { touchR.current = { ...touchR.current, [k]: v }; };

  const Btn = ({ label, k, v, off, color }) => (
    <div
      onPointerDown={(e) => { e.preventDefault(); tSet(k, v); }}
      onPointerUp={() => tSet(k, off)}
      onPointerLeave={() => tSet(k, off)}
      onPointerCancel={() => tSet(k, off)}
      style={{
        width: 56, height: 56, borderRadius: 14,
        background: color || 'rgba(255,255,255,0.18)',
        border: '2px solid rgba(255,255,255,0.4)',
        color: '#fff', fontSize: 22, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none',
        cursor: 'pointer', backdropFilter: 'blur(4px)',
      }}
    >{label}</div>
  );

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', background: '#111', fontFamily: "'SF Pro Display','Segoe UI',system-ui,sans-serif" }}>
      <div ref={elRef} style={{ width: '100%', height: '100%' }} />

      {!started && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.75))',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 30, color: '#fff', gap: 16,
        }}>
          <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: 3, textShadow: '0 4px 30px rgba(33,150,243,0.7)', color: '#64B5F6' }}>
            🚌 公交车驾驶员
          </div>
          <div style={{
            fontSize: 15, opacity: 0.85, textAlign: 'center', lineHeight: 2.0,
            background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 28px',
          }}>
            <b style={{ color: '#81D4FA' }}>⬆ W</b> 加速 &nbsp;&nbsp; <b style={{ color: '#EF9A9A' }}>⬇ S</b> 刹车<br />
            <b style={{ color: '#A5D6A7' }}>⬅ A</b> 左转 &nbsp;&nbsp; <b style={{ color: '#FFE082' }}>➡ D</b> 右转<br />
            遇到路口选择方向！触屏可用左下角按钮
          </div>
          <button
            onClick={() => setStarted(true)}
            style={{
              marginTop: 6, padding: '14px 56px', fontSize: 22, fontWeight: 800,
              background: 'linear-gradient(135deg,#1565C0,#42A5F5)',
              color: '#fff', border: 'none', borderRadius: 16, cursor: 'pointer',
              boxShadow: '0 6px 30px rgba(33,150,243,0.5)', letterSpacing: 2,
            }}
          >出发 🚌</button>
        </div>
      )}

      {started && (
        <>
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: 'rgba(0,0,0,0.6)', borderRadius: 16, padding: '10px 20px',
            color: '#fff', backdropFilter: 'blur(8px)', zIndex: 10,
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 2 }}>速度</div>
            <div style={{ fontSize: 34, fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {hud.speed}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4 }}>km/h</span>
            </div>
          </div>
          <div style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(0,0,0,0.6)', borderRadius: 16, padding: '10px 20px',
            color: '#fff', backdropFilter: 'blur(8px)', zIndex: 10,
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 2 }}>里程</div>
            <div style={{ fontSize: 34, fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {hud.dist}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4 }}>m</span>
            </div>
          </div>

          {hud.fork && (
            <div style={{
              position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg,rgba(255,152,0,0.9),rgba(255,87,34,0.9))',
              color: '#fff', padding: '12px 32px', borderRadius: 14,
              fontSize: 20, fontWeight: 800, zIndex: 10,
              boxShadow: '0 4px 24px rgba(255,152,0,0.5)',
              animation: 'fp .6s ease-in-out infinite alternate',
            }}>⚠️ 前方分叉路口！</div>
          )}

          <div style={{
            position: 'absolute', bottom: 18, left: 18, zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <Btn label="▲" k="gas" v={true} off={false} color="rgba(76,175,80,0.35)" />
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn label="◀" k="steer" v={1} off={0} />
              <Btn label="▼" k="brake" v={true} off={false} color="rgba(244,67,54,0.35)" />
              <Btn label="▶" k="steer" v={-1} off={0} />
            </div>
          </div>
        </>
      )}
      <style>{`@keyframes fp{from{opacity:.85;transform:translateX(-50%) scale(.97)}to{opacity:1;transform:translateX(-50%) scale(1.04)}}`}</style>
    </div>
  );
}
