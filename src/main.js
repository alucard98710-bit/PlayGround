import * as THREE from 'three';

const $ = (id) => document.getElementById(id);
const sceneHost = $('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x12141a);
scene.fog = new THREE.FogExp2(0x12141a, 0.035);
const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 5.2, 14.7);
camera.lookAt(0, 2.45, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
sceneHost.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc9d9ff, 0x201517, 2.15));
const keyLight = new THREE.DirectionalLight(0xffdfc5, 3.2);
keyLight.position.set(-5, 9, 7); keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024); keyLight.shadow.camera.left = -8; keyLight.shadow.camera.right = 8; keyLight.shadow.camera.top = 9; keyLight.shadow.camera.bottom = -6;
scene.add(keyLight);
const coolLight = new THREE.DirectionalLight(0x5b8fff, 2.1); coolLight.position.set(5, 6, -5); scene.add(coolLight);
const redLight = new THREE.SpotLight(0xff594a, 170, 22, Math.PI / 5, 0.45, 1.5); redLight.position.set(-5, 8, 3); redLight.target.position.set(-1, 0, 0); scene.add(redLight, redLight.target);
const blueLight = new THREE.SpotLight(0x438cff, 180, 22, Math.PI / 5, 0.45, 1.5); blueLight.position.set(5, 8, -3); blueLight.target.position.set(1, 0, 0); scene.add(blueLight, blueLight.target);

const mat = (color, roughness = 0.8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x25272a, roughness: .91 });
const cageMat = new THREE.MeshStandardMaterial({ color: 0x11151a, roughness: .72, metalness: .32 });
const addBox = (parent, size, material, pos, cast = false) => { const m = new THREE.Mesh(new THREE.BoxGeometry(...size), material); m.position.set(...pos); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };
const octagon = (radius, y, material, tube = .035) => {
  const points = Array.from({ length: 9 }, (_, i) => { const a = Math.PI / 8 + i * Math.PI / 4; return new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius); });
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal'); const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, tube, 7, false), material); scene.add(mesh); return mesh;
};

function makeArena() {
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(6.7, 6.7, .35, 8), mat(0x151619, .85, .15));
  platform.rotation.y = Math.PI / 8; platform.position.y = -.24; platform.receiveShadow = true; platform.castShadow = true; scene.add(platform);
  const matSurface = new THREE.Mesh(new THREE.CircleGeometry(6.31, 8), floorMat); matSurface.rotation.x = -Math.PI / 2; matSurface.rotation.z = Math.PI / 8; matSurface.position.y = -.045; matSurface.receiveShadow = true; scene.add(matSurface);
  const centerLine = new THREE.Mesh(new THREE.RingGeometry(1.37, 1.4, 8), mat(0x74767a, .86)); centerLine.rotation.x = -Math.PI / 2; centerLine.rotation.z = Math.PI / 8; centerLine.position.y = -.032; scene.add(centerLine);
  const redCorner = new THREE.Mesh(new THREE.CircleGeometry(.83, 8), mat(0x692426)); redCorner.rotation.x = -Math.PI / 2; redCorner.rotation.z = Math.PI / 8; redCorner.position.set(-3.85, -.027, .3); scene.add(redCorner);
  const blueCorner = new THREE.Mesh(new THREE.CircleGeometry(.83, 8), mat(0x1e4166)); blueCorner.rotation.x = -Math.PI / 2; blueCorner.rotation.z = Math.PI / 8; blueCorner.position.set(3.85, -.027, -.3); scene.add(blueCorner);
  octagon(6.31, .03, mat(0x98989b, .6, .2), .045);
  // Cage fence segments follow the eight sides; fine crossed wires are deliberately lightweight.
  const r = 6.34, sides = 8;
  for (let i = 0; i < sides; i++) {
    const a1 = Math.PI / 8 + i * Math.PI / 4, a2 = Math.PI / 8 + (i + 1) * Math.PI / 4;
    const p1 = new THREE.Vector3(Math.cos(a1) * r, 0, Math.sin(a1) * r), p2 = new THREE.Vector3(Math.cos(a2) * r, 0, Math.sin(a2) * r);
    const mid = p1.clone().add(p2).multiplyScalar(.5); const len = p1.distanceTo(p2); const angle = Math.atan2(p2.z - p1.z, p2.x - p1.x);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(len, 3.35), new THREE.MeshBasicMaterial({ color: 0x82909a, transparent: true, opacity: .14, side: THREE.DoubleSide, depthWrite: false }));
    panel.position.set(mid.x, 1.72, mid.z); panel.rotation.y = -angle; scene.add(panel);
    for (let j = 0; j <= 10; j++) {
      const x = -len / 2 + len * j / 10;
      const pts = [new THREE.Vector3(x, .12, 0), new THREE.Vector3(x + (j % 2 ? -len / 10 : len / 10), 3.35, 0)];
      const wire = new THREE.BufferGeometry().setFromPoints(pts); const w = new THREE.Line(wire, new THREE.LineBasicMaterial({ color: 0x89949b, transparent: true, opacity: .14 }));
      w.position.set(mid.x, 0, mid.z); w.rotation.y = -angle; scene.add(w);
    }
    const rail = addBox(scene, [len, .1, .1], cageMat, [mid.x, 3.4, mid.z]); rail.rotation.y = -angle;
    const lowerRail = addBox(scene, [len, .055, .055], mat(0x33373c, .5, .25), [mid.x, .13, mid.z]); lowerRail.rotation.y = -angle;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.075, .085, 3.6, 8), mat(0x25292e, .46, .4)); post.position.set(p1.x, 1.72, p1.z); post.castShadow = true; scene.add(post);
  }
  octagon(6.4, 3.42, cageMat, .07);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat(0x111216, 1)); ground.rotation.x = -Math.PI / 2; ground.position.y = -.48; ground.receiveShadow = true; scene.add(ground);
  // Blurred crowd: thousands of low-poly silhouettes and soft arena lights.
  const crowdGeo = new THREE.BufferGeometry(), positions = [], colors = [];
  const palette = [0x4c3a36, 0x353c49, 0x6a5550, 0x293d4d, 0x4d4a47, 0x7d3434, 0x56606a];
  for (let i = 0; i < 1600; i++) {
    const angle = Math.random() * Math.PI * 2; const radius = 8.5 + Math.random() * 5.5;
    positions.push(Math.cos(angle) * radius, .7 + Math.random() * 3.5, Math.sin(angle) * radius - 1);
    const c = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]); colors.push(c.r, c.g, c.b);
  }
  crowdGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); crowdGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const crowd = new THREE.Points(crowdGeo, new THREE.PointsMaterial({ size: .095, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: .73 })); scene.add(crowd);
  for (let i = 0; i < 14; i++) { const l = new THREE.PointLight(i % 3 ? 0x555f7b : 0x9b4838, 5, 7); const a = i / 14 * Math.PI * 2; l.position.set(Math.cos(a) * 9.5, 4.5 + Math.sin(i * 3) * .5, Math.sin(a) * 9.5); scene.add(l); }
}
makeArena();

const sphereGeo = new THREE.SphereGeometry(1, 16, 12);
function blob(parent, material, scale, pos, cast = true) { const m = new THREE.Mesh(sphereGeo, material); m.scale.set(...scale); m.position.set(...pos); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; }
function linkBetween(parent, a, b, radius, material) { const d = new THREE.Vector3().subVectors(b, a), mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * .82, radius, d.length(), 12), material); mesh.position.copy(a).add(b).multiplyScalar(.5); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); mesh.castShadow = true; parent.add(mesh); return mesh; }

function makeFighter(name, colors, x, facing) {
  const root = new THREE.Group(); root.position.set(x, 0, 0); scene.add(root);
  const body = new THREE.Group(); root.add(body);
  const skin = mat(colors.skin, .76), trunks = mat(colors.trunks, .82), glove = mat(colors.glove, .44), tape = mat(0xe1dfd9, .8), hair = mat(colors.hair, .94);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.72, 22), new THREE.MeshBasicMaterial({ color: 0x07080a, transparent: true, opacity: .48 })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.035; root.add(shadow);
  // Athletic torso, shoulders, neck, head and ears.
  blob(body, skin, [.46, .57, .29], [0, 1.57, 0]);
  blob(body, skin, [.58, .32, .32], [0, 1.95, 0]);
  const shorts = blob(body, trunks, [.48, .34, .31], [0, 1.08, 0]);
  addBox(body, [.12, .31, .018], mat(colors.accent, .85), [-.21, 1.09, .316]);
  const neck = blob(body, skin, [.19, .23, .19], [0, 2.24, 0]);
  const head = new THREE.Group(); head.position.set(0, 2.55, .015); body.add(head);
  blob(head, skin, [.29, .38, .27], [0, 0, 0]);
  blob(head, hair, [.295, .16, .277], [0, .24, -.015]);
  blob(head, skin, [.09, .08, .045], [0, -.02, .25]);
  for (const ex of [-.29, .29]) blob(head, skin, [.06, .09, .045], [ex, .02, -.005]);
  const eyeMat = mat(0x201716, .45); blob(head, eyeMat, [.025, .02, .015], [-.095, .08, .253]); blob(head, eyeMat, [.025, .02, .015], [.095, .08, .253]);
  // Leg joints articulate naturally under movement and recoil.
  const legs = [];
  for (const side of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(side * .22, .99, 0); body.add(hip);
    linkBetween(hip, new THREE.Vector3(0, 0, 0), new THREE.Vector3(side * .015, -.48, .02), .145, skin);
    const knee = new THREE.Group(); knee.position.set(side * .015, -.47, .02); hip.add(knee);
    blob(knee, skin, [.135, .14, .14], [0, -.02, 0]);
    linkBetween(knee, new THREE.Vector3(0, -.04, 0), new THREE.Vector3(0, -.45, .05), .108, skin);
    blob(knee, trunks, [.13, .11, .13], [0, .04, 0]);
    blob(knee, skin, [.17, .095, .25], [0, -.49, .15]);
    legs.push({ hip, knee, side });
  }
  const arms = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group(); shoulder.position.set(side * .53, 1.92, .015); body.add(shoulder);
    blob(shoulder, skin, [.2, .22, .21], [0, 0, 0]);
    linkBetween(shoulder, new THREE.Vector3(0, -.06, 0), new THREE.Vector3(side * .08, -.34, .12), .135, skin);
    const elbow = new THREE.Group(); elbow.position.set(side * .08, -.34, .12); shoulder.add(elbow);
    blob(elbow, skin, [.135, .14, .14], [0, 0, 0]);
    linkBetween(elbow, new THREE.Vector3(0, 0, 0), new THREE.Vector3(side * .04, -.27, .16), .105, skin);
    blob(elbow, tape, [.108, .115, .12], [side * .035, -.22, .12]);
    const fist = new THREE.Group(); fist.position.set(side * .04, -.29, .17); elbow.add(fist);
    blob(fist, glove, [.155, .14, .17], [0, -.025, .035]);
    for (let i = 0; i < 3; i++) blob(fist, glove, [.045, .048, .09], [-.085 + i * .085, -.005, .17]);
    arms.push({ shoulder, elbow, fist, side });
  }
  // Painterly logos on trunks: no real-world league marks.
  const sigil = new THREE.Mesh(new THREE.RingGeometry(.045, .07, 6), mat(colors.accent, .5, .1)); sigil.position.set(.13, 1.12, .303); body.add(sigil);
  return { name, root, body, head, legs, arms, facing, health: 100, stamina: 100, guarding: false, dodging: 0, attack: null, hitStun: 0, knock: 0, combo: 0, lastAttack: 0, walkPhase: 0, skinMat: skin };
}
const player = makeFighter('IRON REED', { skin: 0x9b6248, trunks: 0x222326, glove: 0xe4433c, accent: 0xe84e43, hair: 0x171719 }, -1.42, 1);
const opponent = makeFighter('EL TIGRE', { skin: 0xb77655, trunks: 0x25354b, glove: 0x4c9bea, accent: 0x59a7f2, hair: 0x25201e }, 1.42, -1);
player.root.rotation.y = .3;
opponent.root.rotation.y = -.3;

const state = { phase: 'intro', time: 180, elapsed: 0, playerMove: 0, playerStrafe: 0, aiDecision: 0, aiAction: null, hitStop: 0, sound: true, rounds: 1, totalHits: 0, comboTimer: 0, shake: 0 };
const clockEl = $('clock'), statusEl = $('clockStatus'), tipEl = $('tipText');
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;

function paintHud() {
  $('playerHealth').style.width = `${player.health}%`; $('playerHealthNum').textContent = Math.ceil(player.health);
  $('opponentHealth').style.width = `${opponent.health}%`; $('opponentHealthNum').textContent = Math.ceil(opponent.health);
  $('playerStamina').style.width = `${player.stamina}%`; $('playerStaminaNum').textContent = Math.ceil(player.stamina);
  $('opponentStamina').style.width = `${opponent.stamina}%`; $('opponentStaminaNum').textContent = Math.ceil(opponent.stamina);
  const t = Math.ceil(state.time); clockEl.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  $('roundLabel').textContent = 'ROUND 1';
}
function showBanner(top, bottom, duration = 1500) {
  const banner = $('roundBanner'); banner.querySelector('span').textContent = top; banner.querySelector('b').textContent = bottom;
  banner.classList.add('show'); window.setTimeout(() => banner.classList.remove('show'), duration);
}
function flash() { const el = $('hitFlash'); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
function callCombo(text) { const el = $('combo'); el.textContent = text; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); window.setTimeout(() => el.classList.remove('show'), 700); }

// Synthesized crowd/impact cues are optional and created only after user interaction.
let audioContext = null;
function sound(type = 'hit', strong = false) {
  if (!state.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator(), gain = audioContext.createGain();
    osc.type = type === 'bell' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(type === 'bell' ? 740 : strong ? 95 : 145, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(type === 'bell' ? 320 : 48, audioContext.currentTime + (type === 'bell' ? .48 : .12));
    gain.gain.setValueAtTime(type === 'bell' ? .045 : .075, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + (type === 'bell' ? .5 : .16));
    osc.connect(gain); gain.connect(audioContext.destination); osc.start(); osc.stop(audioContext.currentTime + .52);
  } catch { /* Audio is decorative; never block the game. */ }
}

function beginFight() {
  if (state.phase !== 'intro' && state.phase !== 'result') return;
  Object.assign(state, { phase: 'fight', time: 180, elapsed: 0, totalHits: 0, comboTimer: 0, aiDecision: .8 });
  player.health = 100; opponent.health = 100; player.stamina = 100; opponent.stamina = 100;
  player.root.position.set(-1.42, 0, 0); opponent.root.position.set(1.42, 0, 0);
  $('intro').classList.add('hidden'); $('result').classList.add('hidden');
  statusEl.classList.add('live'); statusEl.innerHTML = '<i></i> FIGHTING';
  $('fightTip').style.opacity = '1'; tipEl.innerHTML = 'Create an opening — <b>GUARD</b> blocks incoming shots';
  paintHud(); showBanner('ROUND 1', 'FIGHT', 1350); sound('bell');
}
function endFight() {
  if (state.phase !== 'fight') return;
  state.phase = 'result'; state.playerMove = state.playerStrafe = 0;
  statusEl.classList.remove('live'); statusEl.innerHTML = '<i></i> FINAL';
  const win = player.health > opponent.health;
  $('resultTitle').textContent = win ? 'VICTORY' : player.health === opponent.health ? 'DRAW' : 'DEFEAT';
  $('resultTitle').style.color = win ? '#f5f2ee' : player.health === opponent.health ? '#f0d47a' : '#70b3ff';
  $('resultCopy').textContent = win ? `A statement made in the cage. ${state.totalHits} clean shots landed.` : player.health === opponent.health ? 'No separation after three hard minutes. Run it back.' : 'The judges went the other way. There is always another round.';
  $('result').classList.remove('hidden'); sound('bell');
}

const attackSpecs = {
  jab: { cost: 5, damage: 6.5, wind: .105, active: .12, recover: .2, reach: 2.45, arm: 0, stun: .2 },
  heavy: { cost: 13, damage: 12, wind: .19, active: .13, recover: .37, reach: 2.35, arm: 1, stun: .4 },
  kick: { cost: 18, damage: 15, wind: .25, active: .15, recover: .45, reach: 2.65, leg: 1, stun: .48 }
};
function startAttack(fighter, type) {
  if (state.phase !== 'fight' || fighter.attack || fighter.hitStun > .02 || fighter.stamina < (attackSpecs[type]?.cost || 0)) return false;
  const spec = attackSpecs[type]; if (!spec) return false;
  fighter.stamina -= spec.cost;
  fighter.attack = { type, t: 0, hit: false, spec };
  if (fighter === player && performance.now() / 1000 - fighter.lastAttack < 1.05) {
    fighter.combo++;
    if (fighter.combo >= 2) { state.comboTimer = .7; callCombo(fighter.combo >= 3 ? `${fighter.combo} HIT COMBO` : '2 HIT COMBO'); }
  } else fighter.combo = 1;
  fighter.lastAttack = performance.now() / 1000;
  return true;
}
function getAttackProgress(attack) {
  const { wind, active, recover } = attack.spec; const t = attack.t;
  return t < wind ? t / wind : t < wind + active ? 1 : Math.max(0, 1 - (t - wind - active) / recover);
}
function attackPose(fighter) {
  const a = fighter.attack; if (!a) return;
  const p = getAttackProgress(a), extend = Math.sin(p * Math.PI);
  if (a.type === 'kick') {
    const leg = fighter.legs[a.spec.leg]; leg.hip.rotation.z = -fighter.facing * extend * 1.1; leg.knee.rotation.z = fighter.facing * extend * .48;
    fighter.body.rotation.z = -fighter.facing * extend * .11;
  } else {
    const arm = fighter.arms[a.spec.arm]; arm.shoulder.rotation.x = -extend * 1.05; arm.shoulder.rotation.z = fighter.facing * extend * (a.type === 'heavy' ? -.74 : -.24);
    arm.elbow.rotation.x = -extend * .28;
    fighter.body.rotation.y = -fighter.facing * extend * (a.type === 'heavy' ? .27 : .12);
  }
}
function landHit(attacker, defender, attack) {
  attack.hit = true; state.totalHits += attacker === player ? 1 : 0;
  const blocked = defender.guarding || defender.dodging > .08;
  if (blocked) {
    defender.stamina = Math.max(0, defender.stamina - attack.spec.damage * .53);
    attacker.stamina = Math.max(0, attacker.stamina - 2);
    if (attacker === player) tipEl.innerHTML = 'They covered up — try a <b>KICK</b> to the body';
    sound('hit', false); return;
  }
  const comboBonus = attacker.combo > 1 ? Math.min(1.4, 1 + .11 * (attacker.combo - 1)) : 1;
  const damage = attack.spec.damage * comboBonus * (defender.health < 28 ? 1.12 : 1);
  defender.health = Math.max(0, defender.health - damage);
  defender.hitStun = attack.spec.stun; defender.knock = attacker.facing * (attack.type === 'heavy' ? .3 : .17);
  state.shake = .16; state.hitStop = .055; flash(); sound('hit', attack.type !== 'jab');
  if (attacker === player) {
    tipEl.innerHTML = defender.health < 35 ? '<b>THEY’RE HURT</b> — keep the pressure on!' : 'Clean shot. Keep mixing up your <b>COMBOS</b>';
    state.comboTimer = .8;
  } else tipEl.innerHTML = defender.health < 35 ? 'You’re hurt — <b>GUARD</b> and circle away' : 'Incoming! Hold <b>GUARD</b> to block';
  // Small impact sweat flecks only; all damage feedback is stylized, non-graphic.
  const pos = new THREE.Vector3(defender.root.position.x, 2.05, .25);
  for (let i = 0; i < 6; i++) {
    const drop = new THREE.Mesh(new THREE.SphereGeometry(.024 + Math.random() * .025, 6, 5), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xf0d4ae : 0xc8b69d, transparent: true, opacity: .8 }));
    drop.position.copy(pos); drop.userData.vel = new THREE.Vector3((Math.random() - .5) * 2, .8 + Math.random() * 1.3, (Math.random() - .5) * 1.3); scene.add(drop); particles.push({ mesh: drop, life: .38 });
  }
  if (defender.health <= 0) { defender.hitStun = 1.3; endFight(); }
}
const particles = [];
function stepFighter(f, dt, opponentF) {
  const regen = f.guarding ? 7 : f.attack ? 4 : 15;
  f.stamina = Math.min(100, f.stamina + regen * dt);
  if (f.hitStun > 0) f.hitStun = Math.max(0, f.hitStun - dt);
  if (f.dodging > 0) f.dodging = Math.max(0, f.dodging - dt);
  f.knock = lerp(f.knock, 0, Math.min(1, dt * 8));
  if (f.attack) {
    f.attack.t += dt;
    const a = f.attack, total = a.spec.wind + a.spec.active + a.spec.recover;
    if (!a.hit && a.t >= a.spec.wind && a.t <= a.spec.wind + a.spec.active) {
      const distance = Math.abs(opponentF.root.position.x - f.root.position.x);
      if (distance < a.spec.reach + (f === player ? state.playerMove * .13 : 0)) landHit(f, opponentF, a);
    }
    attackPose(f);
    if (a.t >= total) f.attack = null;
  }
  for (const arm of f.arms) {
    if (!f.attack) { arm.shoulder.rotation.x = lerp(arm.shoulder.rotation.x, f.guarding ? -.48 : 0, Math.min(1, dt * 12)); arm.shoulder.rotation.z = lerp(arm.shoulder.rotation.z, 0, Math.min(1, dt * 12)); arm.elbow.rotation.x = lerp(arm.elbow.rotation.x, f.guarding ? -.45 : 0, Math.min(1, dt * 12)); }
  }
  for (const leg of f.legs) { if (!f.attack) { leg.hip.rotation.z = lerp(leg.hip.rotation.z, 0, Math.min(1, dt * 9)); leg.knee.rotation.z = lerp(leg.knee.rotation.z, 0, Math.min(1, dt * 9)); } }
}
function doAction(action) {
  if (state.phase !== 'fight') return;
  if (action === 'jab' || action === 'heavy' || action === 'kick') {
    const ok = startAttack(player, action);
    if (ok) { $('fightTip').style.opacity = '.9'; if (action === 'kick') tipEl.innerHTML = 'Body kicks break through a tight <b>GUARD</b>'; }
  } else if (action === 'guard') {
    player.guarding = true;
  } else if (action === 'dodge') {
    player.guarding = false; player.dodging = .36; state.playerStrafe = state.playerStrafe > 0 ? -1 : 1; player.stamina = Math.max(0, player.stamina - 7);
  }
}
function releaseAction(action) { if (action === 'guard') player.guarding = false; }

$('startBtn').addEventListener('click', beginFight); $('rematchBtn').addEventListener('click', beginFight);
$('soundBtn').addEventListener('click', () => { state.sound = !state.sound; $('soundBtn').classList.toggle('muted', !state.sound); $('soundBtn').querySelector('.sound-label').textContent = state.sound ? 'SOUND ON' : 'SOUND OFF'; if (state.sound) sound('bell'); });
document.querySelectorAll('.action-btn').forEach((btn) => {
  const action = btn.dataset.action;
  btn.addEventListener('pointerdown', (ev) => { ev.preventDefault(); btn.classList.add('pressed'); btn.setPointerCapture?.(ev.pointerId); doAction(action); });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) btn.addEventListener(ev, () => { btn.classList.remove('pressed'); releaseAction(action); });
});

// Analog touch stick plus familiar keyboard support.
const joystick = $('joystick'), knob = $('joyKnob'); let joyPointer = null;
function setJoy(e) {
  const rect = joystick.getBoundingClientRect(), cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const dx = e.clientX - cx, dy = e.clientY - cy, max = rect.width * .35, mag = Math.hypot(dx, dy), scale = mag > max ? max / mag : 1;
  knob.style.left = `calc(50% + ${dx * scale}px)`; knob.style.top = `calc(50% + ${dy * scale}px)`;
  state.playerMove = clamp(dx / max, -1, 1); state.playerStrafe = clamp(-dy / max, -1, 1);
}
joystick.addEventListener('pointerdown', (e) => { e.preventDefault(); joyPointer = e.pointerId; joystick.setPointerCapture(e.pointerId); setJoy(e); });
joystick.addEventListener('pointermove', (e) => { if (e.pointerId === joyPointer) setJoy(e); });
function resetJoy() { joyPointer = null; knob.style.left = '50%'; knob.style.top = '50%'; state.playerMove = state.playerStrafe = 0; }
joystick.addEventListener('pointerup', resetJoy); joystick.addEventListener('pointercancel', resetJoy); joystick.addEventListener('lostpointercapture', resetJoy);
const keys = new Set();
window.addEventListener('keydown', (e) => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (keys.has(e.code)) return; keys.add(e.code);
  if (e.code === 'KeyJ') doAction('jab'); if (e.code === 'KeyK') doAction('heavy'); if (e.code === 'KeyL') doAction('kick'); if (e.code === 'Space') doAction('guard'); if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') doAction('dodge');
});
window.addEventListener('keyup', (e) => { keys.delete(e.code); if (e.code === 'Space') releaseAction('guard'); });
window.addEventListener('blur', () => { keys.clear(); player.guarding = false; resetJoy(); });

function aiThink(dt) {
  state.aiDecision -= dt;
  if (state.aiDecision > 0) return;
  state.aiDecision = .42 + Math.random() * .55;
  const distance = Math.abs(opponent.root.position.x - player.root.position.x);
  opponent.guarding = player.attack && Math.random() < .32;
  if (distance > 2.25) state.aiAction = { move: -1, strafe: (Math.random() - .5) * .5, time: .4 + Math.random() * .3 };
  else if (distance < 1.35) state.aiAction = { move: .3, strafe: (Math.random() - .5) * 1.3, time: .24 };
  else {
    const roll = Math.random();
    if (roll < .14) { opponent.dodging = .3; state.aiAction = { move: .1, strafe: Math.random() < .5 ? -1 : 1, time: .25 }; }
    else if (roll < .36) { opponent.guarding = true; state.aiAction = { move: 0, strafe: 0, time: .27 }; }
    else { startAttack(opponent, roll > .78 ? 'kick' : roll > .48 ? 'heavy' : 'jab'); state.aiAction = { move: 0, strafe: 0, time: .3 }; }
  }
}

const clock = new THREE.Clock(); let screenShake = 0;
function animate() {
  requestAnimationFrame(animate);
  let dt = Math.min(clock.getDelta(), .035);
  if (state.hitStop > 0) { state.hitStop -= dt; dt *= .12; }
  state.elapsed += dt;
  if (state.phase === 'fight') {
    state.time = Math.max(0, state.time - dt);
    if (state.time <= 0) endFight();
    const keyX = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
    const keyZ = (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0);
    const move = state.playerMove || keyX, strafe = state.playerStrafe || keyZ;
    if (!player.attack && !player.hitStun) {
      player.root.position.x = clamp(player.root.position.x + move * dt * 2.35, -4.7, 4.7);
      player.root.position.z = clamp(player.root.position.z + strafe * dt * 1.75, -1.6, 1.6);
    }
    aiThink(dt);
    if (state.aiAction && !opponent.attack && !opponent.hitStun) {
      const a = state.aiAction; a.time -= dt;
      opponent.root.position.x = clamp(opponent.root.position.x + a.move * dt * 1.6, -4.7, 4.7);
      opponent.root.position.z = clamp(opponent.root.position.z + a.strafe * dt * 1.4, -1.6, 1.6);
      if (a.time <= 0) { state.aiAction = null; opponent.guarding = false; }
    }
    if (opponent.health < 27 && Math.random() < dt * .12) { opponent.root.position.x = Math.min(4.5, opponent.root.position.x + .22); opponent.guarding = true; }
    // Simple collision radius and opposing stances preserve readable range.
    const sep = opponent.root.position.x - player.root.position.x;
    if (Math.abs(sep) < .83) { const push = (.83 - Math.abs(sep)) * .5; player.root.position.x -= Math.sign(sep) * push; opponent.root.position.x += Math.sign(sep) * push; }
    player.root.rotation.y = lerp(player.root.rotation.y, 0, Math.min(1, dt * 7));
    opponent.root.rotation.y = lerp(opponent.root.rotation.y, -.3, Math.min(1, dt * 7));
    for (const f of [player, opponent]) {
      stepFighter(f, dt, f === player ? opponent : player);
      const moveAmount = f === player ? Math.abs(move) + Math.abs(strafe) : state.aiAction ? Math.abs(state.aiAction.move) + Math.abs(state.aiAction.strafe) : 0;
      f.walkPhase += dt * (5 + moveAmount * 7);
      f.body.position.y = Math.abs(Math.sin(f.walkPhase)) * Math.min(.055, moveAmount * .035);
      f.body.position.x = f.knock;
      f.body.rotation.x = f.hitStun ? Math.sin(state.elapsed * 55) * .055 : 0;
    }
    paintHud();
  } else {
    for (const f of [player, opponent]) {
      const phase = state.elapsed * 2.2 + (f === player ? 0 : 1.7);
      f.body.position.y = Math.sin(phase) * .025;
      f.body.rotation.z = Math.sin(phase * .7) * .018;
      for (const arm of f.arms) arm.shoulder.rotation.x = lerp(arm.shoulder.rotation.x, f.guarding ? -.48 : 0, Math.min(1, dt * 4));
    }
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.life -= dt; p.mesh.userData.vel.y -= 4.5 * dt; p.mesh.position.addScaledVector(p.mesh.userData.vel, dt); p.mesh.material.opacity = Math.max(0, p.life / .38);
    if (p.life <= 0) { scene.remove(p.mesh); p.mesh.geometry.dispose(); p.mesh.material.dispose(); particles.splice(i, 1); }
  }
  screenShake = Math.max(0, screenShake - dt);
  if (state.shake > 0) { screenShake = state.shake; state.shake = 0; }
  const shake = screenShake > 0 ? (Math.random() - .5) * screenShake * 1.4 : 0;
  camera.position.x = lerp(camera.position.x, shake, .35); camera.lookAt(0, 2.35, 0);
  renderer.render(scene, camera);
}
animate();

function resize() {
  const w = innerWidth, h = innerHeight;
  camera.aspect = w / h;
  if (w < 700) { camera.position.set(0, 5.3, 16.4); camera.fov = 39; }
  else { camera.position.set(0, 5.2, 14.7); camera.fov = 36; }
  camera.updateProjectionMatrix(); renderer.setSize(w, h); renderer.setPixelRatio(Math.min(devicePixelRatio, w < 700 ? 1.35 : 1.65));
}
window.addEventListener('resize', resize); resize();
paintHud();
