import * as THREE from 'three';

// Deterministic RNG so every render is identical
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function tex(c, { repeat = [1, 1], srgb = false } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Smudgy / scratched steel: used as roughness + color variation
export function steelTextures(seed = 3) {
  const r = rng(seed);
  const S = 1024;
  const [c, g] = canvas(S);
  g.fillStyle = '#8a8a8a'; g.fillRect(0, 0, S, S);
  // blotches
  for (let i = 0; i < 260; i++) {
    const x = r() * S, y = r() * S, rad = 20 + r() * 120;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    const v = r() < 0.5 ? 40 : 200;
    gr.addColorStop(0, `rgba(${v},${v},${v},${0.06 + r() * 0.1})`);
    gr.addColorStop(1, `rgba(${v},${v},${v},0)`);
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  // fine scratches
  for (let i = 0; i < 1400; i++) {
    const x = r() * S, y = r() * S, a = r() * Math.PI, l = 4 + r() * 40;
    g.strokeStyle = `rgba(${r() < .5 ? 230 : 30},${r() < .5 ? 230 : 30},${r() < .5 ? 230 : 30},${0.08 + r() * 0.18})`;
    g.lineWidth = 0.6 + r() * 0.8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // pits / dents
  for (let i = 0; i < 500; i++) {
    g.fillStyle = `rgba(20,20,20,${0.1 + r() * 0.3})`;
    g.beginPath(); g.arc(r() * S, r() * S, 0.5 + r() * 2.2, 0, 7); g.fill();
  }
  const rough = tex(c);
  // color map: same image remapped lighter
  const [c2, g2] = canvas(S);
  g2.drawImage(c, 0, 0);
  g2.globalCompositeOperation = 'screen';
  g2.fillStyle = 'rgba(150,150,155,1)'; g2.fillRect(0, 0, S, S);
  const color = tex(c2, { srgb: true });
  return { rough, color };
}

// Chainmail: rows of interlinked rings. Returns color, metalness/alpha and bump maps.
export function chainmailTextures(repeat = [10, 10]) {
  const S = 512, N = 8; // rings per tile row
  const step = S / N;
  const [c, g] = canvas(S);
  const [b, gb] = canvas(S);
  g.fillStyle = '#0b0b0c'; g.fillRect(0, 0, S, S);
  gb.fillStyle = '#000'; gb.fillRect(0, 0, S, S);
  const rows = N * 2;
  const rowH = S / rows;
  for (let row = -1; row <= rows + 1; row++) {
    for (let col = -1; col <= N + 1; col++) {
      const x = col * step + (row % 2 ? step / 2 : 0);
      const y = row * rowH;
      const tilt = row % 2 ? 0.45 : -0.45;
      for (const [ctx, isBump] of [[g, false], [gb, true]]) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
        // outer shading ring
        ctx.lineWidth = step * 0.17;
        if (isBump) {
          ctx.strokeStyle = '#fff';
        } else {
          const gr = ctx.createLinearGradient(-step * .4, -step * .3, step * .4, step * .3);
          gr.addColorStop(0, '#f2f2f2'); gr.addColorStop(.45, '#9a9a9e'); gr.addColorStop(1, '#4a4a4e');
          ctx.strokeStyle = gr;
        }
        ctx.beginPath(); ctx.ellipse(0, 0, step * 0.42, step * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
        if (isBump) { ctx.lineWidth = step * 0.06; ctx.strokeStyle = '#888'; ctx.stroke(); }
        ctx.restore();
      }
    }
  }
  const color = tex(c, { repeat, srgb: true });
  const bump = tex(b, { repeat });
  return { color, bump };
}

export function woodTexture(seed = 7) {
  const r = rng(seed);
  const [c, g] = canvas(256, 1024);
  g.fillStyle = '#9a6b3f'; g.fillRect(0, 0, 256, 1024);
  for (let i = 0; i < 90; i++) {
    const x = r() * 256;
    g.strokeStyle = `rgba(${r() < .5 ? 70 : 170},${r() < .5 ? 45 : 120},${r() < .5 ? 20 : 70},${0.15 + r() * 0.3})`;
    g.lineWidth = 1 + r() * 4;
    g.beginPath(); g.moveTo(x, 0);
    for (let y = 0; y <= 1024; y += 64) g.lineTo(x + Math.sin(y * 0.01 + i) * 6, y);
    g.stroke();
  }
  return tex(c, { srgb: true });
}

export function fabricTexture(seed = 11) {
  const r = rng(seed);
  const [c, g] = canvas(256);
  g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) for (let x = 0; x < 256; x += 2) {
    const v = 110 + ((x + y) % 4 ? 20 : -20) + r() * 30;
    g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 2, 2);
  }
  return tex(c, { repeat: [6, 6] });
}

export function skinTexture(seed = 5) {
  const r = rng(seed);
  const [c, g] = canvas(256);
  g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) {
    const v = 100 + r() * 60;
    g.fillStyle = `rgba(${v},${v},${v},0.5)`;
    g.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2);
  }
  return tex(c, { repeat: [3, 3] });
}

// soft radial sprite used for flashes, glows and sparks
export function glowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const [c, g] = canvas(128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(0.25, inner.replace(/[\d.]+\)$/, '0.6)')); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Procedural Equirectangular Earth World Map (sharp, vibrant, styled like Geo What-If)
export function earthTexture({ highlightIndia = true, indiaDeleted = false } = {}) {
  const W = 1024, H = 512;
  const [c, g] = canvas(W, H);

  // Vibrant deep ocean blue with atmospheric gradient
  const oceanGrad = g.createLinearGradient(0, 0, 0, H);
  oceanGrad.addColorStop(0, '#10395e');
  oceanGrad.addColorStop(0.5, '#19568c');
  oceanGrad.addColorStop(1, '#10395e');
  g.fillStyle = oceanGrad;
  g.fillRect(0, 0, W, H);

  // Luminous cyan latitude & longitude grid lines
  g.strokeStyle = 'rgba(0, 240, 255, 0.22)';
  g.lineWidth = 1;
  for (let y = 64; y < H; y += 64) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
  }
  for (let x = 64; x < W; x += 64) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
  }

  // Helper to draw continents with glowing coastlines
  function land(pts, fill = '#2e8b57', coast = '#48bb78') {
    g.fillStyle = fill;
    g.strokeStyle = coast;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath();
    g.fill();
    g.stroke();
  }

  // North America
  land([[120, 70], [280, 80], [330, 140], [280, 220], [220, 250], [180, 210], [130, 150]], '#277a4a', '#38a169');
  // South America
  land([[260, 250], [330, 280], [350, 360], [290, 440], [250, 420], [240, 310]], '#226d40', '#2f855a');
  // Eurasia
  land([[440, 85], [830, 75], [900, 150], [800, 220], [670, 200], [530, 190], [440, 135]], '#287d4b', '#38a169');
  // Africa
  land([[450, 190], [570, 200], [600, 280], [550, 385], [480, 365], [435, 260]], '#2c8450', '#48bb78');
  // Australia
  land([[770, 330], [880, 320], [900, 395], [830, 415], [760, 375]], '#8c7646', '#b7791f');

  // Indian Subcontinent (approx x: 670 to 730, y: 195 to 285)
  if (!indiaDeleted) {
    const indiaFill = highlightIndia ? '#00f0ff' : '#2f8f53';
    const indiaStroke = highlightIndia ? '#ffffff' : '#48bb78';
    g.fillStyle = indiaFill;
    g.strokeStyle = indiaStroke;
    g.lineWidth = highlightIndia ? 4 : 2;
    g.beginPath();
    g.moveTo(675, 195); // North-West / Punjab
    g.lineTo(730, 200); // North-East / Himalayas
    g.lineTo(725, 250); // East Coast
    g.lineTo(702, 290); // Kanyakumari Tip
    g.lineTo(670, 240); // Gujarat
    g.closePath();
    g.fill();
    g.stroke();

    if (highlightIndia) {
      // Radiant cyan aura around India
      const aura = g.createRadialGradient(702, 240, 5, 702, 240, 65);
      aura.addColorStop(0, 'rgba(0, 240, 255, 0.7)');
      aura.addColorStop(0.5, 'rgba(0, 240, 255, 0.3)');
      aura.addColorStop(1, 'rgba(0, 240, 255, 0)');
      g.fillStyle = aura;
      g.beginPath();
      g.arc(702, 240, 65, 0, Math.PI * 2);
      g.fill();
    }
  } else {
    // Erased: Deep dark oceanic void abyss
    g.fillStyle = '#06111f';
    g.strokeStyle = '#00f0ff';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(702, 240, 42, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  }

  return tex(c, { srgb: true });
}

// Procedural swirling white cloud texture
export function cloudTexture() {
  const S = 512;
  const [c, g] = canvas(S);
  g.clearRect(0, 0, S, S);
  const r = rng(42);
  g.fillStyle = 'rgba(255, 255, 255, 0.28)';
  for (let i = 0; i < 60; i++) {
    const x = r() * S, y = r() * S, rad = 30 + r() * 55;
    g.beginPath();
    g.ellipse(x, y, rad, rad * 0.4, r() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  return tex(c);
}

// Procedural Code Terminal Screen Texture for Shot 5
export function codeTexture() {
  const [c, g] = canvas(512, 256);
  g.fillStyle = '#0a101d';
  g.fillRect(0, 0, 512, 256);

  // Red error header banner
  g.fillStyle = '#ff1e56';
  g.fillRect(0, 0, 512, 42);
  g.fillStyle = '#ffffff';
  g.font = 'bold 20px monospace';
  g.fillText('CRITICAL: 50% CODEBASE VAPORIZED', 24, 28);

  // Glowing cyan/green code lines
  g.font = '15px monospace';
  const lines = [
    'error: module "dev_india" not found',
    'stack trace: 1.4B engineers offline',
    'fatal: git commit failed [404 NO REPO]',
    'warning: global production servers flatlining...',
    'status: SYSTEM COLLAPSE IMMINENT'
  ];
  lines.forEach((l, i) => {
    g.fillStyle = i === 0 || i === 4 ? '#ff3366' : '#00f0ff';
    g.fillText(l, 24, 80 + i * 34);
  });

  return tex(c, { srgb: true });
}
