import * as THREE from 'three';
import { glowTexture, rng, cloudTexture } from './textures.js';

// ==========================================
// UTILITY HELPERS FOR PROCEDURAL TEXTURES
// ==========================================
function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function tex(c, { repeat = [1, 1], srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ==========================================
// 1. PROCEDURAL LUNAR CRATER TEXTURE
// ==========================================
export function createMoonTexture(seed = 42) {
  const S = 1024;
  const [c, g] = canvas(S, S / 2);
  const r = rng(seed);

  // Muted lunar regolith gray base
  const baseGrad = g.createLinearGradient(0, 0, 0, S / 2);
  baseGrad.addColorStop(0, '#5f6775');
  baseGrad.addColorStop(0.5, '#788293');
  baseGrad.addColorStop(1, '#5f6775');
  g.fillStyle = baseGrad;
  g.fillRect(0, 0, S, S / 2);

  // Lunar maria (large dark basaltic plains)
  const maria = [
    { x: 380, y: 190, rx: 140, ry: 90 },
    { x: 550, y: 220, rx: 160, ry: 100 },
    { x: 260, y: 260, rx: 120, ry: 80 },
    { x: 720, y: 210, rx: 110, ry: 75 }
  ];
  maria.forEach(m => {
    const gr = g.createRadialGradient(m.x, m.y, 10, m.x, m.y, Math.max(m.rx, m.ry));
    gr.addColorStop(0, 'rgba(40, 48, 60, 0.75)');
    gr.addColorStop(0.6, 'rgba(55, 65, 80, 0.55)');
    gr.addColorStop(1, 'rgba(120, 130, 145, 0)');
    g.fillStyle = gr;
    g.beginPath();
    g.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
    g.fill();
  });

  // Hundreds of craters of varying diameters
  for (let i = 0; i < 350; i++) {
    const cx = r() * S, cy = r() * (S / 2);
    const rad = 2 + r() * (i < 15 ? 32 : 12);

    // Dark crater bowl
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
    gr.addColorStop(0, 'rgba(28, 33, 42, 0.85)');
    gr.addColorStop(0.7, 'rgba(45, 52, 65, 0.6)');
    gr.addColorStop(1, 'rgba(180, 190, 205, 0.4)');
    g.fillStyle = gr;
    g.beginPath();
    g.arc(cx, cy, rad, 0, Math.PI * 2);
    g.fill();

    // Bright highlighted rim arc (sunlight from top-left)
    g.strokeStyle = 'rgba(235, 242, 255, 0.65)';
    g.lineWidth = Math.max(1, rad * 0.18);
    g.beginPath();
    g.arc(cx, cy, rad, Math.PI * 0.9, Math.PI * 1.8);
    g.stroke();

    // Shadowed rim arc (bottom-right)
    g.strokeStyle = 'rgba(15, 20, 28, 0.75)';
    g.lineWidth = Math.max(1, rad * 0.16);
    g.beginPath();
    g.arc(cx, cy, rad, -Math.PI * 0.1, Math.PI * 0.8);
    g.stroke();

    // Prominent ray systems for top major craters
    if (i < 4) {
      g.strokeStyle = 'rgba(240, 245, 255, 0.22)';
      g.lineWidth = 1.2;
      for (let a = 0; a < 8; a++) {
        const ang = a * (Math.PI / 4) + r() * 0.3;
        const len = rad * (3 + r() * 5);
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
        g.stroke();
      }
    }
  }

  // Fine regolith micro-noise
  for (let j = 0; j < 3000; j++) {
    const nx = r() * S, ny = r() * (S / 2);
    g.fillStyle = r() < 0.5 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
    g.fillRect(nx, ny, 1 + r() * 2, 1 + r() * 2);
  }

  return tex(c);
}

// ==========================================
// 2. PROCEDURAL REALISTIC EARTH MAP
// ==========================================
export function createRealisticEarthTexture() {
  const W = 1024, H = 512;
  const [c, g] = canvas(W, H);

  // Vibrant oceanic depth gradient
  const oceanGrad = g.createLinearGradient(0, 0, 0, H);
  oceanGrad.addColorStop(0, '#0a223d');
  oceanGrad.addColorStop(0.2, '#113b63');
  oceanGrad.addColorStop(0.5, '#174a7a');
  oceanGrad.addColorStop(0.8, '#113b63');
  oceanGrad.addColorStop(1, '#0a223d');
  g.fillStyle = oceanGrad;
  g.fillRect(0, 0, W, H);

  // Subtle longitude & latitude telemetry grid
  g.strokeStyle = 'rgba(56, 189, 248, 0.15)';
  g.lineWidth = 1;
  for (let y = 32; y < H; y += 48) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
  }
  for (let x = 32; x < W; x += 64) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
  }

  // Helper for continental landmasses with coastlines & biomes
  function continent(pts, fill, coast = '#38a169', desertPts = null) {
    g.fillStyle = fill;
    g.strokeStyle = coast;
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath();
    g.fill();
    g.stroke();

    if (desertPts) {
      g.fillStyle = '#b08d57';
      g.beginPath();
      g.moveTo(desertPts[0][0], desertPts[0][1]);
      for (let i = 1; i < desertPts.length; i++) g.lineTo(desertPts[i][0], desertPts[i][1]);
      g.closePath();
      g.fill();
    }
  }

  // North America
  continent(
    [[110, 60], [280, 70], [340, 130], [290, 220], [230, 260], [170, 220], [120, 140]],
    '#226b3e', '#38a169',
    [[180, 170], [240, 180], [230, 230], [170, 210]]
  );
  // South America
  continent(
    [[260, 260], [330, 290], [360, 360], [300, 450], [250, 430], [240, 320]],
    '#1d6037', '#2e8b57'
  );
  // Eurasia
  continent(
    [[430, 75], [840, 65], [920, 140], [820, 230], [680, 210], [530, 190], [430, 130]],
    '#257242', '#34d399',
    [[600, 140], [740, 150], [710, 190], [590, 180]] // Gobi / Central Asia
  );
  // Africa
  continent(
    [[440, 190], [580, 200], [610, 290], [560, 395], [490, 380], [430, 260]],
    '#2d7a48', '#48bb78',
    [[450, 200], [570, 210], [580, 270], [440, 260]] // Sahara
  );
  // Australia
  continent(
    [[770, 330], [890, 320], [910, 400], [840, 420], [760, 380]],
    '#9c773a', '#d97706',
    [[790, 340], [870, 340], [860, 390], [780, 380]] // Outback
  );
  // Antarctica ice shelf
  g.fillStyle = '#f8fafc';
  g.beginPath();
  g.rect(0, 470, W, 42);
  g.fill();

  // Arctic ice
  g.fillStyle = 'rgba(248, 250, 252, 0.85)';
  g.beginPath();
  g.ellipse(W / 2, 20, W * 0.45, 25, 0, 0, Math.PI * 2);
  g.fill();

  return tex(c);
}

// ==========================================
// 3. MAKE MOON PROP
// ==========================================
export function makeMoon({ radius = 0.52 } = {}) {
  const g = new THREE.Group();
  const moonTex = createMoonTexture();

  const mat = new THREE.MeshStandardMaterial({
    map: moonTex,
    roughness: 0.88,
    metalness: 0.05
  });

  const geo = new THREE.SphereGeometry(radius, 48, 48);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);

  // Soft lunar limb glow sprite
  const glow = glowSprite(0xa5c4e8, radius * 2.8);
  glow.material.opacity = 0.32;
  glow.position.z = -0.05;
  g.add(glow);

  return { root: g, mesh, glow, radius };
}

// ==========================================
// 4. MAKE MOON DEBRIS & VAPORIZATION EXPLOSION
// ==========================================
export function makeMoonDebris({ count = 140, radius = 0.52 } = {}) {
  const g = new THREE.Group();
  const r = rng(101);

  // 1. Glowing spark points
  const sparkParticles = sparks(count, {
    speed: 3.5,
    spread: 1.2,
    gravity: 0,
    life: 0.85,
    color: [0.35, 0.85, 1.0],
    size: 0.045
  });
  g.add(sparkParticles);

  // 2. Procedural rocky debris chunks
  const rocks = [];
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x828b9a,
    roughness: 0.9,
    metalness: 0.1
  });

  for (let i = 0; i < 28; i++) {
    const s = 0.025 + r() * 0.045;
    const geo = new THREE.DodecahedronGeometry(s, 0);
    const m = new THREE.Mesh(geo, rockMat);
    const dir = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
    const speed = 1.8 + r() * 2.4;
    const rotSpeed = new THREE.Vector3(r() * 8, r() * 8, r() * 8);
    m.position.set(0, 0, 0);
    m.visible = false;
    g.add(m);
    rocks.push({ mesh: m, dir, speed, rotSpeed, baseScale: s });
  }

  // 3. Expanding force ripple shockwave ring
  const ringGeo = new THREE.TorusGeometry(0.1, 0.02, 16, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const shockwave = new THREE.Mesh(ringGeo, ringMat);
  shockwave.rotation.x = Math.PI * 0.4;
  shockwave.visible = false;
  g.add(shockwave);

  // 4. Central flash burst
  const flash = glowSprite(0xffffff, 2.8);
  flash.material.opacity = 0;
  g.add(flash);

  return {
    group: g,
    root: g,
    explode(progress) {
      if (progress <= 0) {
        g.visible = false;
        sparkParticles.update(-1);
        shockwave.visible = false;
        flash.material.opacity = 0;
        return;
      }
      g.visible = true;

      // Update sparks
      sparkParticles.update(progress * 0.85);

      // Update central flash
      if (progress < 0.25) {
        flash.material.opacity = (1 - progress / 0.25) * 1.5;
        flash.scale.setScalar(2.0 + progress * 6.0);
      } else {
        flash.material.opacity = 0;
      }

      // Update shockwave ring
      shockwave.visible = true;
      const ringScale = 0.2 + progress * 7.5;
      shockwave.scale.set(ringScale, ringScale, ringScale);
      ringMat.opacity = Math.max(0, (1 - progress) * 0.95);

      // Update flying debris chunks
      rocks.forEach(rk => {
        rk.mesh.visible = true;
        const d = rk.dir.clone().multiplyScalar(rk.speed * progress * 1.6);
        rk.mesh.position.copy(d);
        rk.mesh.rotation.x += rk.rotSpeed.x * 0.02;
        rk.mesh.rotation.y += rk.rotSpeed.y * 0.02;
        const fade = Math.max(0.01, 1 - progress * 0.8);
        rk.mesh.scale.setScalar(fade);
      });
    }
  };
}

// ==========================================
// 5. MAKE OCEAN SHELF & FLAPPING FISH
// ==========================================
export function makeOceanShelf() {
  const g = new THREE.Group();
  const r = rng(77);

  // Bedrock shelf plane
  const [bedC, bedCtx] = canvas(512);
  const sandGrad = bedCtx.createLinearGradient(0, 0, 0, 512);
  sandGrad.addColorStop(0, '#c89965');
  sandGrad.addColorStop(0.6, '#9c7348');
  sandGrad.addColorStop(1, '#473c33');
  bedCtx.fillStyle = sandGrad;
  bedCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 400; i++) {
    bedCtx.fillStyle = r() < 0.5 ? 'rgba(40,30,20,0.2)' : 'rgba(255,240,210,0.15)';
    bedCtx.fillRect(r() * 512, r() * 512, 2 + r() * 4, 2 + r() * 4);
  }
  const bedTex = tex(bedC);

  const shelfGeo = new THREE.PlaneGeometry(6, 6, 24, 24);
  const shelfMat = new THREE.MeshStandardMaterial({
    map: bedTex,
    roughness: 0.9,
    metalness: 0.05
  });
  const shelf = new THREE.Mesh(shelfGeo, shelfMat);
  shelf.rotation.x = -Math.PI / 2;
  shelf.position.y = -0.55;
  shelf.receiveShadow = true;
  g.add(shelf);

  // Stepped rocky ridge
  const ridgeGeo = new THREE.BoxGeometry(4.5, 0.45, 1.8);
  const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
  const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
  ridge.position.set(0, -0.4, -0.8);
  ridge.receiveShadow = true;
  g.add(ridge);

  // Coral reef structures (vibrant domes and tubes)
  const coralColors = [0xf43f5e, 0x06b6d4, 0xf59e0b, 0x8b5cf6, 0x10b981];
  for (let i = 0; i < 16; i++) {
    const col = coralColors[i % coralColors.length];
    const cMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.65 });
    if (i % 2 === 0) {
      // Brain coral dome
      const rad = 0.08 + r() * 0.12;
      const dome = new THREE.Mesh(new THREE.SphereGeometry(rad, 16, 12), cMat);
      dome.scale.y = 0.7;
      dome.position.set((r() - 0.5) * 3.2, -0.48 + rad * 0.35, (r() - 0.5) * 2.5);
      dome.castShadow = true;
      g.add(dome);
    } else {
      // Branching coral pillar
      const h = 0.16 + r() * 0.22;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, h, 10), cMat);
      pillar.position.set((r() - 0.5) * 3.2, -0.55 + h / 2, (r() - 0.5) * 2.5);
      pillar.castShadow = true;
      g.add(pillar);
    }
  }

  // Translucent receding ocean water plane
  const waterGeo = new THREE.PlaneGeometry(6.2, 6.2);
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.68,
    roughness: 0.08,
    metalness: 0.15,
    clearcoat: 1.0,
    depthWrite: false
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.12; // Start high
  g.add(water);

  // Procedural stranded marine fish
  const fishList = [];
  const fishColors = [
    { body: 0xf97316, stripe: 0xffffff }, // Clownfish
    { body: 0x0284c7, stripe: 0xfacc15 }, // Blue tang
    { body: 0x14b8a6, stripe: 0xffffff }, // Teal reef fish
    { body: 0xe11d48, stripe: 0xfde047 }  // Crimson snapper
  ];

  for (let f = 0; f < 4; f++) {
    const fg = new THREE.Group();
    const cInfo = fishColors[f % fishColors.length];

    // Fish body (squashed teardrop sphere)
    const bGeo = new THREE.SphereGeometry(0.12, 16, 12);
    bGeo.scale(1.8, 0.9, 0.4);
    const bMat = new THREE.MeshStandardMaterial({ color: cInfo.body, roughness: 0.35 });
    const body = new THREE.Mesh(bGeo, bMat);
    body.castShadow = true;
    fg.add(body);

    // Decorative white/yellow stripe band
    const stripeGeo = new THREE.TorusGeometry(0.08, 0.015, 8, 20);
    const stripeMat = new THREE.MeshStandardMaterial({ color: cInfo.stripe, roughness: 0.4 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.rotation.y = Math.PI / 2;
    stripe.position.x = -0.02;
    fg.add(stripe);

    // Tail fin pivot
    const tailPivot = new THREE.Group();
    tailPivot.position.x = -0.2;
    const finGeo = new THREE.ConeGeometry(0.08, 0.16, 4);
    finGeo.scale(0.3, 1, 1.2);
    const finMat = new THREE.MeshStandardMaterial({ color: cInfo.body, roughness: 0.4 });
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.rotation.z = Math.PI / 2;
    fin.position.x = -0.07;
    tailPivot.add(fin);
    fg.add(tailPivot);

    // Initial position on the exposed rocky shelf
    const posX = -0.55 + f * 0.42;
    const posZ = 0.25 - (f % 2) * 0.4;
    fg.position.set(posX, -0.44, posZ);
    fg.rotation.z = (r() - 0.5) * 0.4;
    fg.rotation.y = r() * Math.PI * 2;
    g.add(fg);

    fishList.push({ root: fg, tailPivot, basePosY: -0.44, seed: f * 2.3 });
  }

  return {
    group: g,
    root: g,
    water,
    setTideLevel(ratio) {
      // ratio: 1.0 (high tide y = 0.12) to 0.4 (-60% collapse y = -0.48)
      const clamped = Math.max(0.35, Math.min(1.0, ratio));
      water.position.y = -0.48 + (clamped - 0.35) * (0.12 - (-0.48)) / (1.0 - 0.35);
      waterMat.opacity = 0.45 + clamped * 0.25;
    },
    updateFish(t) {
      fishList.forEach((fish, idx) => {
        // Frantic flapping motion on dry rocks
        const flap = Math.sin(t * 24.0 + fish.seed) * 0.85;
        fish.tailPivot.rotation.y = flap;
        // Body arching & flopping
        fish.root.rotation.x = Math.sin(t * 12.0 + fish.seed) * 0.3;
        fish.root.position.y = fish.basePosY + Math.abs(Math.sin(t * 14.0 + fish.seed)) * 0.05;
      });
    }
  };
}

// ==========================================
// 6. MAKE WOBBLING EARTH WITH GLOWING AXIS
// ==========================================
export function makeWobblingEarth({ radius = 0.55 } = {}) {
  const g = new THREE.Group();
  const earthGroup = new THREE.Group();
  g.add(earthGroup);

  // 1. Earth crust sphere
  const earthTex = createRealisticEarthTexture();
  const earthGeo = new THREE.SphereGeometry(radius, 48, 48);
  const earthMat = new THREE.MeshStandardMaterial({
    map: earthTex,
    roughness: 0.45,
    metalness: 0.1
  });
  const earthMesh = new THREE.Mesh(earthGeo, earthMat);
  earthMesh.castShadow = true;
  earthMesh.receiveShadow = true;
  earthGroup.add(earthMesh);

  // 2. Swirling cloud layer
  const cloudTex = cloudTexture();
  const cloudGeo = new THREE.SphereGeometry(radius * 1.015, 48, 48);
  const cloudMat = new THREE.MeshStandardMaterial({
    map: cloudTex,
    transparent: true,
    opacity: 0.36,
    depthWrite: false
  });
  const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
  earthGroup.add(cloudMesh);

  // 3. Glowing neon red/amber axis vector cylinder
  const axisGeo = new THREE.CylinderGeometry(0.014, 0.014, radius * 3.0, 16);
  const axisMat = new THREE.MeshStandardMaterial({
    color: 0xff2b45,
    emissive: 0xff2b45,
    emissiveIntensity: 2.8,
    roughness: 0.1
  });
  const axisRod = new THREE.Mesh(axisGeo, axisMat);
  earthGroup.add(axisRod);

  // Glowing beacons at North and South poles
  const northBeacon = glowSprite(0xff3355, 0.35);
  northBeacon.position.y = radius * 1.5;
  earthGroup.add(northBeacon);

  const southBeacon = glowSprite(0xff3355, 0.35);
  southBeacon.position.y = -radius * 1.5;
  earthGroup.add(southBeacon);

  // 4. Snapped gravitational flux lines
  const tetherGroup = new THREE.Group();
  const tetherMat = new THREE.LineDashedMaterial({
    color: 0x38bdf8,
    linewidth: 2,
    scale: 1,
    dashSize: 0.08,
    gapSize: 0.04,
    transparent: true,
    opacity: 0.8
  });

  const tetherPoints = [];
  for (let k = 0; k <= 20; k++) {
    const frac = k / 20;
    tetherPoints.push(new THREE.Vector3(frac * 1.8, Math.sin(frac * Math.PI) * 0.25, -frac * 0.4));
  }
  const tetherGeo = new THREE.BufferGeometry().setFromPoints(tetherPoints);
  const tetherLine = new THREE.Line(tetherGeo, tetherMat);
  tetherLine.computeLineDistances();
  tetherGroup.add(tetherLine);
  g.add(tetherGroup);

  return {
    group: g,
    root: g,
    earthGroup,
    earthMesh,
    cloudMesh,
    axisRod,
    tetherGroup,
    setWobble(t, tiltZ, tiltX, spinMultiplier = 1.0) {
      // Gyroscopic tilt
      earthGroup.rotation.z = tiltZ;
      earthGroup.rotation.x = tiltX;
      // Axial spin
      earthMesh.rotation.y = t * 0.6 * spinMultiplier;
      cloudMesh.rotation.y = t * 0.72 * spinMultiplier;
    },
    setTetherActive(active, progress = 0) {
      if (!active) {
        tetherGroup.visible = false;
      } else {
        tetherGroup.visible = true;
        tetherMat.opacity = Math.max(0, 1 - progress);
      }
    }
  };
}

// ==========================================
// 7. SCI-FI HOLOGRAPHIC TIDE GAUGE HUD
// ==========================================
export function makeTideGaugeHUD() {
  const [c, ctx] = canvas(512, 1024);
  const texHUD = new THREE.CanvasTexture(c);
  texHUD.colorSpace = THREE.SRGBColorSpace;

  function renderGauge(pct) {
    ctx.clearRect(0, 0, 512, 1024);

    // Dark cyber glass backing
    ctx.fillStyle = 'rgba(10, 20, 36, 0.82)';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 992, 24);
    ctx.fill();
    ctx.stroke();

    // Top Header Banner
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(32, 36, 448, 54);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PACIFIC BUOY // TIDE GAUGE', 256, 72);

    // Subheader
    ctx.font = '16px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('TELEMETRY: COASTAL WATERLINE', 256, 126);

    // Vertical Scale Track
    const trackX = 180, trackY = 170, trackW = 72, trackH = 680;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 2;
    ctx.fillRect(trackX, trackY, trackW, trackH);
    ctx.strokeRect(trackX, trackY, trackW, trackH);

    // Graduation ticks & labels
    const levels = [
      { p: 1.0, l: '+100% (NORMAL)' },
      { p: 0.8, l: '+80%' },
      { p: 0.6, l: '+60%' },
      { p: 0.4, l: '+40% (-60%)' },
      { p: 0.2, l: '+20%' },
      { p: 0.0, l: '0% (DRY REEF)' }
    ];
    ctx.textAlign = 'left';
    ctx.font = 'bold 18px monospace';
    levels.forEach(lv => {
      const y = trackY + trackH * (1 - lv.p);
      ctx.strokeStyle = lv.p === 0.4 ? '#ff2a5f' : 'rgba(0, 240, 255, 0.6)';
      ctx.lineWidth = lv.p === 0.4 ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(trackX - 16, y);
      ctx.lineTo(trackX + trackW + 16, y);
      ctx.stroke();

      ctx.fillStyle = lv.p === 0.4 ? '#ff2a5f' : '#cbd5e1';
      ctx.fillText(lv.l, trackX + trackW + 28, y + 6);
    });

    // Dynamic Fill Bar
    const fillRatio = Math.max(0, Math.min(1.0, pct / 100));
    const fillH = trackH * fillRatio;
    const fillY = trackY + trackH - fillH;

    const barGrad = ctx.createLinearGradient(0, fillY, 0, trackY + trackH);
    if (pct <= 45) {
      barGrad.addColorStop(0, '#ff2a5f');
      barGrad.addColorStop(1, '#991b1b');
    } else {
      barGrad.addColorStop(0, '#00f0ff');
      barGrad.addColorStop(1, '#0284c7');
    }
    ctx.fillStyle = barGrad;
    ctx.fillRect(trackX + 4, fillY, trackW - 8, fillH);

    // Bottom Status Box
    ctx.fillStyle = pct <= 45 ? 'rgba(255, 42, 95, 0.25)' : 'rgba(0, 240, 255, 0.15)';
    ctx.strokeStyle = pct <= 45 ? '#ff2a5f' : '#00f0ff';
    ctx.lineWidth = 3;
    ctx.fillRect(40, 870, 432, 100);
    ctx.strokeRect(40, 870, 432, 100);

    ctx.textAlign = 'center';
    ctx.fillStyle = pct <= 45 ? '#ff3b30' : '#38bdf8';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`LEVEL: ${pct.toFixed(0)}%`, 256, 912);

    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = pct <= 45 ? '#ffdd44' : '#e2e8f0';
    ctx.fillText(pct <= 45 ? 'WARNING: 60% TIDE COLLAPSE' : 'STATUS: STABLE EQUILIBRIUM', 256, 948);

    texHUD.needsUpdate = true;
  }

  renderGauge(100);

  const mat = new THREE.MeshBasicMaterial({
    map: texHUD,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.1), mat);
  mesh.renderOrder = 10;

  const g = new THREE.Group();
  g.add(mesh);

  return {
    group: g,
    root: g,
    mesh,
    setPercent(pct) {
      renderGauge(pct);
    }
  };
}

// ==========================================
// 8. AXIS ANGLE PROTRACTOR HUD
// ==========================================
export function makeAxisProtractorHUD() {
  const [c, ctx] = canvas(512, 512);
  const texHUD = new THREE.CanvasTexture(c);
  texHUD.colorSpace = THREE.SRGBColorSpace;

  function renderProtractor(deg) {
    ctx.clearRect(0, 0, 512, 512);

    const ox = 256, oy = 380, rad = 200;

    // Outer backing arc
    ctx.fillStyle = 'rgba(10, 18, 32, 0.85)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ox, oy, rad + 35, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Degree arc
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(ox, oy, rad, Math.PI, 0);
    ctx.stroke();

    // Radial degree ticks (0 to 60 degrees from vertical)
    for (let a = -60; a <= 60; a += 5) {
      const radAng = (-90 + a) * (Math.PI / 180);
      const isMajor = a % 15 === 0;
      const r1 = isMajor ? rad - 28 : rad - 14;
      const r2 = rad;

      ctx.strokeStyle = a === 23.5 || a === -24 ? '#38bdf8' : 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = isMajor ? 2.5 : 1.2;
      ctx.beginPath();
      ctx.moveTo(ox + Math.cos(radAng) * r1, oy + Math.sin(radAng) * r1);
      ctx.lineTo(ox + Math.cos(radAng) * r2, oy + Math.sin(radAng) * r2);
      ctx.stroke();

      if (isMajor) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.abs(a)}°`, ox + Math.cos(radAng) * (r1 - 16), oy + Math.sin(radAng) * (r1 - 16) + 5);
      }
    }

    // Normal 23.5° reference marker
    const normalAng = (-90 + 23.5) * (Math.PI / 180);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + Math.cos(normalAng) * rad, oy + Math.sin(normalAng) * rad);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dynamic Needle (current tilt angle)
    const curAng = (-90 + deg) * (Math.PI / 180);
    ctx.strokeStyle = '#ff2b45';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + Math.cos(curAng) * (rad + 10), oy + Math.sin(curAng) * (rad + 10));
    ctx.stroke();

    // Center pivot knob
    ctx.fillStyle = '#ff2b45';
    ctx.beginPath();
    ctx.arc(ox, oy, 12, 0, Math.PI * 2);
    ctx.fill();

    // Digital readout panel
    ctx.fillStyle = 'rgba(255, 43, 69, 0.2)';
    ctx.strokeStyle = '#ff2b45';
    ctx.lineWidth = 2;
    ctx.fillRect(76, 410, 360, 75);
    ctx.strokeRect(76, 410, 360, 75);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`AXIS TILT: ${deg.toFixed(1)}°`, 256, 445);

    ctx.fillStyle = Math.abs(deg - 23.5) > 8 ? '#ffdd44' : '#38bdf8';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(Math.abs(deg - 23.5) > 8 ? 'STATUS: VIOLENT OSCILLATION' : 'STATUS: STABLE 23.5°', 256, 470);

    texHUD.needsUpdate = true;
  }

  renderProtractor(23.5);

  const mat = new THREE.MeshBasicMaterial({
    map: texHUD,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), mat);
  mesh.renderOrder = 10;

  const g = new THREE.Group();
  g.add(mesh);

  return {
    group: g,
    root: g,
    mesh,
    setAngle(deg) {
      renderProtractor(deg);
    }
  };
}

// ==========================================
// 9. CIRCULAR SPEEDOMETER CLOCK HUD
// ==========================================
export function makeSpeedometerHUD() {
  const [c, ctx] = canvas(512, 512);
  const texHUD = new THREE.CanvasTexture(c);
  texHUD.colorSpace = THREE.SRGBColorSpace;

  function renderClock(hours) {
    ctx.clearRect(0, 0, 512, 512);
    const ox = 256, oy = 256, rad = 200;

    // Dial background
    ctx.fillStyle = 'rgba(8, 16, 30, 0.85)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(ox, oy, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 24-hour tick divisions
    for (let h = 0; h < 24; h++) {
      const ang = (h / 24) * Math.PI * 2 - Math.PI / 2;
      const isMajor = h % 6 === 0;
      const r1 = isMajor ? rad - 28 : rad - 14;
      ctx.strokeStyle = isMajor ? '#00f0ff' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = isMajor ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(ox + Math.cos(ang) * r1, oy + Math.sin(ang) * r1);
      ctx.lineTo(ox + Math.cos(ang) * rad, oy + Math.sin(ang) * rad);
      ctx.stroke();

      if (isMajor) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${h}h`, ox + Math.cos(ang) * (r1 - 18), oy + Math.sin(ang) * (r1 - 18) + 6);
      }
    }

    // Dynamic hand needle
    const handAng = ((24 - hours) / 24) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + Math.cos(handAng) * (rad - 40), oy + Math.sin(handAng) * (rad - 40));
    ctx.stroke();

    // Center pivot
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(ox, oy, 14, 0, Math.PI * 2);
    ctx.fill();

    // Digital readout panel in center-bottom
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.fillRect(106, 310, 300, 90);
    ctx.strokeRect(106, 310, 300, 90);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('DAY LENGTH', 256, 335);

    ctx.fillStyle = hours <= 12 ? '#ff3b30' : '#38bdf8';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`${hours.toFixed(1)} HOURS`, 256, 375);

    texHUD.needsUpdate = true;
  }

  renderClock(24);

  const mat = new THREE.MeshBasicMaterial({
    map: texHUD,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), mat);
  mesh.renderOrder = 10;

  const g = new THREE.Group();
  g.add(mesh);

  return {
    group: g,
    root: g,
    mesh,
    setHours(hours) {
      renderClock(hours);
    }
  };
}

// ==========================================
// 10. NOCTURNAL PREDATOR EYES
// ==========================================
export function makeNocturnalEyes() {
  const g = new THREE.Group();

  // Dark framing tree silhouettes on left and right borders
  const treeMat = new THREE.MeshBasicMaterial({ color: 0x020408 });
  const trunkL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 3.5, 8), treeMat);
  trunkL.position.set(-1.1, 0, 0);
  trunkL.rotation.z = -0.15;
  g.add(trunkL);

  const trunkR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, 3.5, 8), treeMat);
  trunkR.position.set(1.1, 0, 0);
  trunkR.rotation.z = 0.12;
  g.add(trunkR);

  // Predator head silhouette
  const headGeo = new THREE.SphereGeometry(0.42, 16, 16);
  headGeo.scale(1.2, 0.85, 0.8);
  const headMesh = new THREE.Mesh(headGeo, treeMat);
  headMesh.position.set(0, -0.15, -0.1);
  g.add(headMesh);

  // Left & Right eye groups
  const eyes = [];
  [-0.18, 0.18].forEach(xOff => {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(xOff, 0.05, 0.1);

    // Glowing almond sclera / iris
    const irisGeo = new THREE.SphereGeometry(0.085, 24, 16);
    irisGeo.scale(1.1, 0.7, 0.4);
    const irisMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0xffaa00,
      emissiveIntensity: 3.5,
      roughness: 0.2
    });
    const iris = new THREE.Mesh(irisGeo, irisMat);
    eyeGroup.add(iris);

    // Dark slit pupil
    const pupilGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.11, 8);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.z = 0.035;
    eyeGroup.add(pupil);

    // Upper and lower eyelids for blinking
    const lidMat = new THREE.MeshBasicMaterial({ color: 0x020408 });
    const upperLid = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.12), lidMat);
    upperLid.position.set(0, 0.06, 0.04);
    eyeGroup.add(upperLid);

    const lowerLid = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.12), lidMat);
    lowerLid.position.set(0, -0.06, 0.04);
    eyeGroup.add(lowerLid);

    // Intense amber/gold flare sprite
    const flare = glowSprite(0xffaa00, 0.45);
    flare.material.opacity = 0.75;
    flare.position.z = 0.05;
    eyeGroup.add(flare);

    g.add(eyeGroup);
    eyes.push({ root: eyeGroup, iris, pupil, upperLid, lowerLid, flare });
  });

  return {
    group: g,
    root: g,
    update(t, blink, lookDir = new THREE.Vector2(0, 0), pupilDilation = 1.0, emissive = 3.5, flareOpacity = 0.85) {
      eyes.forEach(eye => {
        // Blink logic: lids close
        const lidOffset = blink ? 0.01 : 0.07;
        eye.upperLid.position.y = lidOffset;
        eye.lowerLid.position.y = -lidOffset;
        eye.flare.material.opacity = blink ? 0.0 : flareOpacity;
        if (eye.iris && eye.iris.material) eye.iris.material.emissiveIntensity = emissive;

        // Pupil dilation & darting gaze
        eye.pupil.scale.set(pupilDilation, 1.0, 1.0);
        eye.pupil.position.x = lookDir.x * 0.035;
        eye.pupil.position.y = lookDir.y * 0.025;
      });
    }
  };
}

// ==========================================
// GLOW SPRITE, SPARKS, RIPPLE (RETAINED)
// ==========================================
let _glow;
export function glowSprite(color = 0xffffff, size = 1) {
  _glow = _glow || glowTexture();
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: _glow,
      color,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      toneMapped: false
    })
  );
  s.scale.setScalar(size);
  return s;
}

export function sparks(count = 50, { speed = 2.0, spread = 1, gravity = -4, life = 0.6, color = [0.0, 0.9, 1.0], size = 0.03, seed = 9 } = {}) {
  const r = rng(seed);
  _glow = _glow || glowTexture();
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size,
    map: _glow,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    toneMapped: false
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  const V = [], Lf = [];
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(speed * (0.4 + r() * 0.8));
    V.push(v);
    Lf.push(life * (0.5 + r() * 0.8));
  }
  pts.update = (t) => {
    for (let i = 0; i < count; i++) {
      const tt = Math.max(0, t), v = V[i];
      pos[i * 3] = v.x * tt;
      pos[i * 3 + 1] = v.y * tt + 0.5 * gravity * tt * tt;
      pos[i * 3 + 2] = v.z * tt;
      const a = t < 0 ? 0 : Math.max(0, 1 - tt / Lf[i]);
      col[i * 3] = color[0] * a * 2.5;
      col[i * 3 + 1] = color[1] * a * 2.5;
      col[i * 3 + 2] = color[2] * a * 2.5;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  };
  pts.update(-1);
  return pts;
}

export function rippleOverlay(target) {
  const NOISE = `
  float h3(vec3 p){ p = fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float n3(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
    return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }
  `;
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uCenter: { value: new THREE.Vector3() }, uRadius: { value: 0 }, uAmp: { value: 0 },
      uTime: { value: 0 }, uRings: { value: 140 }, uSpot: { value: 0.05 }, uSpotAmp: { value: 1 },
    },
    vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: NOISE + `
      uniform vec3 uCenter; uniform float uRadius,uAmp,uTime,uRings,uSpot,uSpotAmp; varying vec3 vPos;
      void main(){
        float d = distance(vPos,uCenter);
        float front = 1.0 - smoothstep(uRadius*0.75, uRadius, d);
        float rings = pow(0.5+0.5*sin(d*uRings - uTime*9.0), 6.0);
        float core = exp(-d*d/(uSpot*uSpot));
        float a = rings*front*uAmp + core*uSpotAmp*uAmp;
        a = clamp(a, 0., 1.);
        vec3 c = mix(vec3(0.0, 0.8, 1.0), vec3(1.0, 0.2, 0.2), core);
        gl_FragColor = vec4(c, a*0.85);
      }`,
    transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, side: THREE.FrontSide,
  });
  const m = new THREE.Mesh(target.geometry, mat);
  m.renderOrder = 5;
  target.add(m);
  return m;
}
