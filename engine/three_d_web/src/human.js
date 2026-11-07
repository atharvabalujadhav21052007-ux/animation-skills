import * as THREE from 'three';
import { materials } from './materials.js';

function sph(r, mat, pos = [0, 0, 0], scl = [1, 1, 1], seg = 32) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), mat);
  m.position.set(...pos); m.scale.set(...scl);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function cyl(rt, rb, h, mat, pos = [0, 0, 0], rot = [0, 0, 0], seg = 24) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(...pos); m.rotation.set(...rot);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function shadowAll(o) {
  o.traverse(c => {
    if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
  });
}

// =========================================================================
// HEAD: Handsome Zack D / Pixar Stylized Hero Face
// =========================================================================
function buildHead(M, { xray = false } = {}) {
  const head = new THREE.Group();
  const jaw = new THREE.Group(); jaw.position.set(0, 0.015, 0.01); head.add(jaw);
  const parts = {};

  const skinMat = xray ? M.xrayHolo : M.skin;

  // 1. Sleek, unified cartoon head shape (tapered egg with handsome jawline)
  const skull = sph(0.095, skinMat, [0, 0.075, 0], [0.92, 1.08, 0.94], 40);
  head.add(skull);

  // Smooth, subtle chin (tucked naturally into the jawline)
  const chin = sph(0.036, skinMat, [0, -0.022, 0.018], [0.85, 0.70, 0.75], 24);
  jaw.add(chin);

  if (xray) {
    // Holographic skull silhouette inside
    const skullCore = sph(0.062, M.xrayBone, [0, 0.078, 0], [0.85, 0.92, 0.88], 20);
    head.add(skullCore);
    const skullJaw = sph(0.032, M.xrayBone, [0, -0.018, 0.018], [0.8, 0.65, 0.75], 16);
    jaw.add(skullJaw);
    for (const s of [-1, 1]) {
      const socket = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.0035, 8, 20), M.xrayBone);
      socket.position.set(s * 0.036, 0.088, 0.055);
      head.add(socket);
    }
  } else {
    // 2. Cute stylized cartoon nose
    const noseBridge = cyl(0.005, 0.007, 0.032, skinMat, [0, 0.070, 0.086], [0.22, 0, 0], 12);
    head.add(noseBridge);
    const noseTip = sph(0.011, skinMat, [0, 0.054, 0.092], [1.0, 0.9, 1.1], 16);
    head.add(noseTip);

    // 3. Friendly, expressive cartoon eyes
    for (const s of [-1, 1]) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(s * 0.035, 0.088, 0.075);
      head.add(eyeGroup);

      // Sclera (crisp glossy white)
      const sclera = sph(0.0195, M.eyeWhite, [0, 0, 0], [1.0, 1.05, 0.75], 24);
      eyeGroup.add(sclera);

      // Iris (warm rich amber-brown)
      const iris = sph(0.0112, M.iris, [0, 0, 0.013], [1.0, 1.0, 0.35], 20);
      eyeGroup.add(iris);

      // Pupil (deep black)
      const pupil = sph(0.0060, M.mouth, [0, 0, 0.0165], [1.0, 1.0, 0.3], 16);
      eyeGroup.add(pupil);

      // Glint (bright white catchlight at top-right for lively expression)
      const glint = sph(0.0032, M.eyeWhite, [0.0032, 0.0038, 0.018], [1, 1, 1], 12);
      eyeGroup.add(glint);

      // Upper eyelid (hidden above eye at rest)
      const lid = new THREE.Mesh(
        new THREE.SphereGeometry(0.021, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
        skinMat
      );
      lid.position.set(0, 0, 0);
      lid.rotation.x = -0.7;
      eyeGroup.add(lid);
      parts['lid' + s] = lid;

      // Eyebrows
      const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.0036, 0.032, 4, 10), M.hair);
      brow.position.set(s * 0.035, 0.118, 0.086);
      brow.rotation.z = Math.PI * 0.5 - s * 0.15;
      brow.scale.z = 0.5;
      head.add(brow);
      parts['brow' + s] = brow;

      // Ears
      const ear = sph(0.021, skinMat, [s * 0.090, 0.072, -0.01], [0.35, 1.0, 0.7], 16);
      ear.rotation.y = s * 0.2;
      head.add(ear);
    }

    // 4. Stylish Modern Swept Hair (Strictly on TOP, SIDES, BACK)
    const hairGroup = new THREE.Group();
    head.add(hairGroup);

    const hairBack = sph(0.098, M.hair, [0, 0.085, -0.025], [0.95, 1.04, 0.88], 32);
    hairGroup.add(hairBack);

    const hairTop = sph(0.086, M.hair, [0, 0.145, 0.005], [1.0, 0.65, 0.95], 24);
    hairGroup.add(hairTop);

    for (const s of [-1, 1]) {
      const sideHair = sph(0.044, M.hair, [s * 0.080, 0.092, -0.015], [0.4, 1.1, 0.9], 16);
      hairGroup.add(sideHair);
    }

    const quiff1 = sph(0.045, M.hair, [0.018, 0.162, 0.045], [1.25, 0.6, 0.85], 20);
    quiff1.rotation.set(-0.25, 0.15, -0.22);
    hairGroup.add(quiff1);

    const quiff2 = sph(0.036, M.hair, [-0.024, 0.155, 0.050], [1.05, 0.55, 0.75], 16);
    quiff2.rotation.set(-0.3, -0.1, -0.12);
    hairGroup.add(quiff2);

    // 5. Stylized lips & mouth
    const lipUpper = sph(0.015, M.lip, [0, 0.020, 0.086], [1.1, 0.18, 0.4], 16);
    head.add(lipUpper);

    const mouthCavity = sph(0.015, M.mouth, [0, 0.015, 0.083], [0.9, 0.25, 0.4], 16);
    head.add(mouthCavity);

    const lipLower = sph(0.014, M.lip, [0, -0.002, 0.082], [1.0, 0.18, 0.4], 16);
    jaw.add(lipLower);

    const teeth = sph(0.013, M.teeth, [0, 0.018, 0.082], [1.0, 0.2, 0.3], 12);
    head.add(teeth);
    teeth.visible = false;

    parts.mouthCavity = mouthCavity;
    parts.lipUpper = lipUpper;
    parts.lipLower = lipLower;
    parts.teeth = teeth;
  }

  shadowAll(head);

  function setMouth(v) {
    jaw.rotation.x = v * 0.20;
    if (!xray && parts.mouthCavity) {
      parts.mouthCavity.scale.set(0.9 + v * 0.35, 0.25 + v * 0.9, 0.4);
      parts.mouthCavity.position.y = 0.015 - v * 0.007;
      parts.teeth.visible = v > 0.2;
    }
  }

  function setBlink(v) {
    if (!xray && parts['lid-1']) {
      const rot = -0.7 + v * 0.95;
      parts['lid-1'].rotation.x = rot;
      parts['lid1'].rotation.x = rot;
    }
  }

  function setBrow(v) {
    if (!xray && parts['brow-1']) {
      parts['brow-1'].position.y = 0.118 + v * 0.012;
      parts['brow1'].position.y = 0.118 + v * 0.012;
    }
  }

  return { head, jaw, setMouth, setBlink, setBrow };
}

// Hand / Fist
function buildHand(M, mat, s) {
  const g = new THREE.Group();
  const palm = sph(0.032, mat, [0, -0.028, 0], [0.85, 1.05, 0.65], 16);
  g.add(palm);
  for (let i = 0; i < 4; i++) {
    const f = sph(0.010, mat, [-0.016 + i * 0.011, -0.060, 0.012], [0.9, 0.9, 1.1], 10);
    g.add(f);
  }
  const th = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.020, 4, 8), mat);
  th.position.set(s * -0.020, -0.032, 0.018);
  th.rotation.set(0.4, 0, s * 0.5);
  g.add(th);
  shadowAll(g);
  return g;
}

// =========================================================================
// FULL CHARACTER: Athletic Casual Fit (Seamless Mesh Overlap)
// =========================================================================
export function makeHuman(outfit = 'casual', opts = {}) {
  const M = materials();
  const isXray = outfit === 'xray';

  const shirtMat = opts.shirtColor === 'orange' ? M.shirtOrange : (opts.shirtColor === 'green' ? M.shirtGreen : M.shirtBlue);
  const pantsMat = opts.pantsColor === 'dark' ? M.pantsDark : M.pantsGrey;

  const bodyMat = isXray ? M.xrayHolo : shirtMat;
  const legMat = isXray ? M.xrayHolo : pantsMat;
  const skinMat = isXray ? M.xrayHolo : M.skin;

  const root = new THREE.Group();
  const pelvis = new THREE.Group(); pelvis.position.y = 0.92; root.add(pelvis);
  const spine = new THREE.Group(); pelvis.add(spine);
  const chest = new THREE.Group(); chest.position.y = 0.18; spine.add(chest);

  const j = { root, pelvis, spine, chest };

  // 1. UNIFIED, ATHLETIC CASUAL TORSO (ZERO GAPS!)
  // Chest mesh: athletic taper from shoulders (0.14) to waist (0.125), height 0.50
  const chestMesh = cyl(0.140, 0.124, 0.50, bodyMat, [0, 0.01, 0], [0, 0, 0], 32);
  chestMesh.scale.set(1.12, 1.0, 0.72);
  chest.add(chestMesh);

  if (!isXray) {
    // Ribbed crewneck collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.010, 10, 32), shirtMat);
    collar.rotation.x = Math.PI * 0.5;
    collar.position.set(0, 0.26, 0.01);
    chest.add(collar);

    // T-shirt waist hem band
    const hem = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.008, 8, 32), shirtMat);
    hem.rotation.x = Math.PI * 0.5;
    hem.scale.set(1.12, 0.72, 1.0);
    hem.position.set(0, -0.23, 0);
    chest.add(hem);

    // Pelvis / Hips in trousers material (overlaps neatly inside shirt hem)
    const pelvisMesh = cyl(0.112, 0.116, 0.16, pantsMat, [0, -0.10, 0], [0, 0, 0], 32);
    pelvisMesh.scale.set(1.06, 1.0, 0.68);
    pelvis.add(pelvisMesh);
  } else {
    const pelvisMesh = cyl(0.112, 0.116, 0.16, M.xrayHolo, [0, -0.10, 0], [0, 0, 0], 32);
    pelvisMesh.scale.set(1.06, 1.0, 0.68);
    pelvis.add(pelvisMesh);
  }

  // 2. NECK & HEAD
  const neck = new THREE.Group(); neck.position.y = 0.26; chest.add(neck);
  const neckMesh = cyl(0.038, 0.044, 0.08, skinMat, [0, 0.035, 0], [0, 0, 0], 20);
  neck.add(neckMesh);

  const H = buildHead(M, { xray: isXray });
  H.head.position.y = 0.068; neck.add(H.head);
  j.neck = neck; j.head = H.head;

  // 3. CONTINUOUS SEAMLESS ARMS (NO GAPS!)
  for (const s of [1, -1]) {
    const k = s > 0 ? 'l' : 'r';

    // Shoulder joint at top-outer edge of chest
    const sh = new THREE.Group();
    sh.position.set(s * 0.165, 0.21, 0);
    chest.add(sh);

    // Shoulder cap sphere
    const shCap = sph(0.048, isXray ? M.xrayHolo : shirtMat, [0, 0, 0], [1, 1, 1], 20);
    sh.add(shCap);

    // Short sleeve cylinder (from y = 0 to y = -0.10)
    const sleeve = cyl(0.047, 0.042, 0.10, isXray ? M.xrayHolo : shirtMat, [0, -0.05, 0], [0, 0, 0], 20);
    sh.add(sleeve);

    // Bare bicep/upper arm (from y = -0.07 down to elbow at y = -0.22)
    const bicep = cyl(0.039, 0.036, 0.15, skinMat, [0, -0.145, 0], [0, 0, 0], 20);
    sh.add(bicep);

    // Elbow joint at y = -0.22 (perfect junction!)
    const el = new THREE.Group();
    el.position.set(0, -0.22, 0);
    sh.add(el);

    // Smooth elbow joint sphere
    const elJoint = sph(0.040, skinMat, [0, 0, 0], [1, 1, 1], 18);
    el.add(elJoint);

    // Forearm (from y = 0 down to wrist at y = -0.20)
    const forearm = cyl(0.036, 0.030, 0.20, skinMat, [0, -0.10, 0], [0, 0, 0], 20);
    el.add(forearm);

    // Wrist joint at y = -0.20
    const wr = new THREE.Group();
    wr.position.set(0, -0.20, 0);
    el.add(wr);

    const wristJoint = sph(0.030, skinMat, [0, 0, 0], [1, 1, 1], 16);
    wr.add(wristJoint);

    const hand = buildHand(M, skinMat, s);
    hand.position.y = -0.015;
    wr.add(hand);

    j[k + 'Sh'] = sh; j[k + 'El'] = el; j[k + 'Wr'] = wr;

    // 4. LEGS & MODERN WHITE SNEAKERS
    const hip = new THREE.Group();
    hip.position.set(s * 0.088, -0.12, 0);
    pelvis.add(hip);

    // Thigh
    const thigh = cyl(0.062, 0.052, 0.34, legMat, [0, -0.17, 0], [0, 0, 0], 20);
    hip.add(thigh);

    // Knee joint
    const kn = new THREE.Group();
    kn.position.set(0, -0.34, 0);
    hip.add(kn);
    const knJoint = sph(0.052, legMat, [0, 0, 0], [1, 1, 1], 16);
    kn.add(knJoint);

    // Shin
    const shin = cyl(0.050, 0.042, 0.36, legMat, [0, -0.18, 0], [0, 0, 0], 20);
    kn.add(shin);

    // Ankle joint
    const an = new THREE.Group();
    an.position.set(0, -0.36, 0);
    kn.add(an);

    if (isXray) {
      const foot = sph(0.042, M.xrayHolo, [0, -0.028, 0.042], [0.95, 0.65, 2.1]);
      an.add(foot);
    } else {
      const shoeBody = sph(0.046, M.sneakerWhite, [0, -0.028, 0.042], [0.95, 0.65, 2.2]);
      an.add(shoeBody);
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.02, 0.22), M.sneakerSole);
      sole.position.set(0, -0.052, 0.042);
      an.add(sole);
      const toeCap = sph(0.040, M.sneakerWhite, [0, -0.034, 0.10], [1.0, 0.55, 0.85]);
      an.add(toeCap);
    }

    j[k + 'Hip'] = hip; j[k + 'Kn'] = kn; j[k + 'An'] = an;
  }

  // =========================================================================
  // 3D X-RAY GLOWING SKELETON (Style Sheet Box 3)
  // =========================================================================
  if (isXray) {
    for (let i = 0; i < 9; i++) {
      const vert = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 12), M.xrayBone);
      vert.position.set(0, -0.08 + i * 0.036, -0.02);
      chest.add(vert);
    }

    for (let r = 0; r < 8; r++) {
      const y = -0.06 + r * 0.034;
      const rx = 0.125 - r * 0.005;
      const rz = 0.076 - r * 0.003;
      const rib = new THREE.Mesh(new THREE.TorusGeometry(rx, 0.006, 8, 36), M.xrayBone);
      rib.rotation.x = Math.PI * 0.5 + 0.05;
      rib.scale.set(1.0, rz / rx, 1.0);
      rib.position.set(0, y, 0.01);
      chest.add(rib);
    }

    const sternum = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.20, 0.01), M.xrayBone);
    sternum.position.set(0, 0.07, 0.082);
    chest.add(sternum);

    for (const s of [1, -1]) {
      const clavicle = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.11, 8), M.xrayBone);
      clavicle.position.set(s * 0.065, 0.19, 0.045);
      clavicle.rotation.set(0.1, 0, s * -0.2);
      chest.add(clavicle);
    }

    const pelvRing = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.011, 8, 24), M.xrayBone);
    pelvRing.rotation.x = Math.PI * 0.5;
    pelvRing.scale.set(1.1, 0.8, 1);
    pelvis.add(pelvRing);

    for (const s of [1, -1]) {
      const k = s > 0 ? 'l' : 'r';
      const armBone = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.16, 8), M.xrayBone);
      armBone.position.y = -0.11; j[k + 'Sh'].add(armBone);

      const foreBone = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8), M.xrayBone);
      foreBone.position.y = -0.10; j[k + 'El'].add(foreBone);

      const thighBone = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.25, 8), M.xrayBone);
      thighBone.position.y = -0.17; j[k + 'Hip'].add(thighBone);

      const shinBone = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.25, 8), M.xrayBone);
      shinBone.position.y = -0.18; j[k + 'Kn'].add(shinBone);
    }
  }

  shadowAll(root);

  const human = {
    root, j, setMouth: H.setMouth, setBlink: H.setBlink, setBrow: H.setBrow,
    setPose(p = {}) {
      if (p.armL && !p.lSh) p.lSh = p.armL;
      if (p.armR && !p.rSh) p.rSh = p.armR;
      if (p.elL && !p.lEl) p.lEl = p.elL;
      if (p.elR && !p.rEl) p.rEl = p.elR;
      for (const k of ['pelvis', 'spine', 'chest', 'neck', 'head', 'lSh', 'lEl', 'lWr', 'rSh', 'rEl', 'rWr', 'lHip', 'lKn', 'lAn', 'rHip', 'rKn', 'rAn']) {
        const v = p[k] || [0, 0, 0];
        if (j[k]) j[k].rotation.set(v[0], v[1], v[2], 'YXZ');
      }
      j.pelvis.position.y = 0.92 + (p.drop || 0);
    },
    speak(t, intensity = 0.7) {
      const open = Math.abs(Math.sin(t * 12)) * 0.6 + Math.abs(Math.sin(t * 7)) * 0.4;
      H.setMouth(open * intensity);
    },
    blink(t) {
      const cycle = t % 3.2;
      const b = cycle < 0.15 ? Math.sin((cycle / 0.15) * Math.PI) : 0;
      H.setBlink(b);
    },
    idle(t, amp = 0.02) {
      j.chest.rotation.x = Math.sin(t * 2.2) * amp;
      j.pelvis.position.y = 0.92 + Math.sin(t * 2.2) * (amp * 0.3);
    }
  };
  human.setPose({});
  H.setMouth(0);
  H.setBlink(0);
  return human;
}

export function lerpPose(a, b, t) {
  const o = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (k === 'drop') { o.drop = (a.drop || 0) + ((b.drop || 0) - (a.drop || 0)) * t; continue; }
    const va = a[k] || [0, 0, 0], vb = b[k] || [0, 0, 0];
    o[k] = [0, 1, 2].map(i => va[i] + (vb[i] - va[i]) * t);
  }
  return o;
}
