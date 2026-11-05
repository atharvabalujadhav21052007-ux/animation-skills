// ---------- Cartoon Props & Environment for Stickman Reel ----------

// 1. Comic Action Bursts & Effects
function drawImpactBurst(ctx, x, y, r, rays = 12, col = '#ffd214') {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < rays; i++) {
    const a1 = (i / rays) * TAU;
    const a2 = ((i + 0.5) / rays) * TAU;
    const r1 = r;
    const r2 = r * 0.42;
    ctx.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
    ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
  }
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.restore();
}

function drawSmokePuff(ctx, x, y, r, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  const blobs = [
    [-0.3 * r, -0.2 * r, 0.4 * r],
    [0.2 * r, -0.3 * r, 0.45 * r],
    [-0.1 * r, 0.2 * r, 0.38 * r],
    [0.3 * r, 0.1 * r, 0.35 * r],
    [0, 0, 0.5 * r]
  ];
  ctx.fillStyle = '#f0ecf4';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  blobs.forEach(([bx, by, br]) => {
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, TAU);
    ctx.fill();
    ctx.stroke();
  });
  // little action stars
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + t * 4;
    const d = r * 1.2;
    sparkle(ctx, Math.cos(a) * d, Math.sin(a) * d, 14, 1);
  }
  ctx.restore();
}

function drawSweatDrop(ctx, x, y, s = 24) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.6, 0, s * 0.5, s * 0.5);
  ctx.arc(0, s * 0.5, s * 0.5, 0, Math.PI);
  ctx.quadraticCurveTo(-s * 0.6, 0, 0, -s);
  ctx.closePath();
  ctx.fillStyle = '#6ec5ff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.restore();
}

// 2. Cartoon Stylized India Map
function drawIndiaMap(ctx, x, y, s, opts = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  const pts = [
    [0.0, -1.0],      // Kashmir
    [-0.22, -0.75],   // West Kashmir
    [-0.32, -0.45],   // Punjab
    [-0.48, -0.22],   // Rajasthan
    [-0.68, -0.06],   // Rann of Kutch
    [-0.60, 0.14],    // Kathiawar
    [-0.38, 0.22],    // Gujarat coast
    [-0.32, 0.44],    // Mumbai
    [-0.24, 0.68],    // Goa / Karnataka
    [-0.12, 0.94],    // Kerala
    [0.0, 1.12],      // Kanyakumari
    [0.18, 0.90],     // Tamil Nadu
    [0.32, 0.56],     // Andhra
    [0.46, 0.22],     // Odisha
    [0.54, -0.10],    // Bengal
    [0.44, -0.28],    // Bangladesh border
    [0.72, -0.34],    // Northeast / Assam
    [0.66, -0.56],    // Arunachal
    [0.44, -0.54],    // Sikkim
    [0.28, -0.58],    // Nepal
    [0.12, -0.78]     // Uttarakhand
  ];

  ctx.beginPath();
  ctx.moveTo(pts[0][0] * 120, pts[0][1] * 120);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0] * 120, pts[i][1] * 120);
  }
  ctx.closePath();

  if (opts.tricolor) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#ff9933'; // Saffron
    ctx.fillRect(-150, -150, 300, 100);
    ctx.fillStyle = '#ffffff'; // White
    ctx.fillRect(-150, -50, 300, 100);
    ctx.fillStyle = '#138808'; // Green
    ctx.fillRect(-150, 50, 300, 100);
    // Ashoka Chakra
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, TAU);
    ctx.strokeStyle = '#000088';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  } else if (opts.cyan) {
    ctx.fillStyle = opts.alpha ? `rgba(0, 240, 255, ${opts.alpha})` : '#00e5ff';
    ctx.fill();
  } else {
    ctx.fillStyle = opts.color || '#ffcc33';
    ctx.fill();
  }

  ctx.lineWidth = opts.lw || 6;
  ctx.strokeStyle = opts.stroke || INK;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Sri Lanka drop
  ctx.beginPath();
  ctx.ellipse(22, 145, 12, 18, 0.2, 0, TAU);
  ctx.fillStyle = opts.cyan ? '#00e5ff' : '#ffcc33';
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 3. Cute Cartoon Earth Globe
function drawEarthGlobe(ctx, x, y, r, t = 0) {
  ctx.save();
  ctx.translate(x, y);

  // Ocean
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fillStyle = '#3a8fe8';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Continents (moving with t)
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r - 3, 0, TAU);
  ctx.clip();

  ctx.fillStyle = '#5ec250';
  const shift = (t * 20) % (r * 2);
  for (let k = -1; k <= 2; k++) {
    const cx = k * r * 1.4 + shift;
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.3, -r * 0.2, r * 0.35, r * 0.5, 0.2, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.3, r * 0.25, r * 0.4, r * 0.45, -0.2, 0, TAU);
    ctx.fill();
  }

  // Soft atmosphere clouds
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.2, -r * 0.4, r * 0.5, r * 0.14, -0.1, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(r * 0.1, r * 0.35, r * 0.6, r * 0.16, 0.15, 0, TAU);
  ctx.fill();

  ctx.restore();

  // Outer atmosphere glow ring
  ctx.beginPath();
  ctx.arc(0, 0, r + 8, 0, TAU);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(100, 220, 255, 0.5)';
  ctx.stroke();

  ctx.restore();
}

// 4. Wi-Fi Router with error signals
function drawRouter(ctx, x, y, s, blink = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  // Antennas
  ctx.lineWidth = 5;
  ctx.strokeStyle = INK;
  ctx.beginPath();
  ctx.moveTo(-45, -15);
  ctx.lineTo(-65, -85);
  ctx.moveTo(45, -15);
  ctx.lineTo(65, -85);
  ctx.stroke();

  // Antenna tips
  circle(ctx, -65, -85, 7);
  ctx.fillStyle = INK;
  ctx.fill();
  circle(ctx, 65, -85, 7);
  ctx.fill();

  // Router body
  rrect(ctx, -75, -20, 150, 45, 10);
  ctx.fillStyle = '#2d3340';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Red error ring
  circle(ctx, 0, 2, 10);
  ctx.fillStyle = blink ? '#ff1144' : '#550011';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Red broadcast rings
  if (blink) {
    ctx.strokeStyle = '#ff1144';
    ctx.lineWidth = 4;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 2, 18 + i * 14, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// 5. Workstation Monitors & Desk
function drawWorkstation(ctx, x, y, s, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  // Table
  rrect(ctx, -220, 0, 440, 30, 8);
  ctx.fillStyle = '#4a3b32';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Dual Monitors
  for (const s of [-1, 1]) {
    const mx = s * 110;
    // Stand
    ctx.fillRect(mx - 8, -40, 16, 40);
    ctx.strokeRect(mx - 8, -40, 16, 40);

    // Screen
    rrect(ctx, mx - 95, -160, 190, 120, 6);
    ctx.fillStyle = '#1a1f2c';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = INK;
    ctx.stroke();

    // 404 Code Text Simulation
    ctx.fillStyle = '#ff2255';
    ctx.font = '700 16px Poppins, sans-serif';
    ctx.fillText('CRITICAL: 404', mx - 80, -135);
    ctx.fillStyle = '#00f0ff';
    ctx.font = '600 11px monospace';
    ctx.fillText('dev_india: NULL', mx - 80, -112);
    ctx.fillText('engineers: OFFLINE', mx - 80, -94);
    ctx.fillText('servers flatlining...', mx - 80, -76);

    // Flatline red line
    ctx.strokeStyle = '#ff1133';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mx - 80, -60);
    ctx.lineTo(mx + 80, -60);
    ctx.stroke();
  }

  // Keyboard
  rrect(ctx, -70, -8, 140, 14, 4);
  ctx.fillStyle = '#222834';
  ctx.fill();
  ctx.stroke();

  // Coffee mug
  rrect(ctx, 150, -32, 28, 32, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 6. Food: Curry vs Potato Plate
function drawCurryBowl(ctx, x, y, s, hasSpice = true) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  // Bowl
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI);
  ctx.closePath();
  ctx.fillStyle = '#e8d8c8';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Curry sauce
  ctx.beginPath();
  ctx.ellipse(0, 0, 65, 20, 0, 0, TAU);
  ctx.fillStyle = hasSpice ? '#e85d18' : '#888888';
  ctx.fill();
  ctx.stroke();

  if (hasSpice) {
    // Steam & aroma
    ctx.strokeStyle = 'rgba(255, 140, 40, 0.7)';
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 25, -25);
      ctx.quadraticCurveTo(i * 25 + 10, -55, i * 25 - 5, -85);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawPotatoPlate(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  // Plate
  ctx.beginPath();
  ctx.ellipse(0, 0, 110, 35, 0, 0, TAU);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Inner plate rim
  ctx.beginPath();
  ctx.ellipse(0, 0, 75, 22, 0, 0, TAU);
  ctx.strokeStyle = '#d0d8e0';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Sad bland boiled potato
  ctx.beginPath();
  ctx.ellipse(0, -10, 38, 26, 0.1, 0, TAU);
  ctx.fillStyle = '#cca872';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Fork
  ctx.beginPath();
  ctx.moveTo(60, -30);
  ctx.lineTo(85, 10);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#8892a0';
  ctx.stroke();

  ctx.restore();
}

// 7. Cricket Wickets & Bat Scene
function drawCricketPitchScene(ctx, x, y, s, opts = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  // Green grass field
  rrect(ctx, -260, 40, 520, 120, 20);
  ctx.fillStyle = '#2e7d32';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Pitch strip
  rrect(ctx, -80, 50, 160, 100, 8);
  ctx.fillStyle = '#c7b299';
  ctx.fill();
  ctx.stroke();

  const topple = opts.topple || 0;

  // Stumps
  const stumpMat = '#f5dfb3';
  for (let i = -1; i <= 1; i++) {
    ctx.save();
    const sx = i * 22;
    const sy = 60;
    ctx.translate(sx, sy);
    if (topple > 0) {
      ctx.rotate(i === 0 ? -topple * 1.5 : (i * topple * 0.8));
      ctx.translate(0, -topple * 30);
    }
    rrect(ctx, -5, -120, 10, 120, 3);
    ctx.fillStyle = stumpMat;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.restore();
  }

  // Bails
  if (topple > 0) {
    ctx.save();
    ctx.translate(-25 - topple * 40, -70 - topple * 50);
    ctx.rotate(topple * 4);
    rrect(ctx, -12, -3, 24, 6, 2);
    ctx.fillStyle = stumpMat;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(25 + topple * 40, -70 - topple * 45);
    ctx.rotate(-topple * 4);
    rrect(ctx, -12, -3, 24, 6, 2);
    ctx.fillStyle = stumpMat;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else {
    rrect(ctx, -22, -63, 22, 6, 2);
    ctx.fillStyle = stumpMat;
    ctx.fill();
    ctx.stroke();
    rrect(ctx, 0, -63, 22, 6, 2);
    ctx.fill();
    ctx.stroke();
  }

  // Cricket Bat
  ctx.save();
  ctx.translate(85 + topple * 30, 60 + topple * 20);
  ctx.rotate(0.25 + topple * 1.4);
  // Blade
  rrect(ctx, -10, -110, 20, 110, 4);
  ctx.fillStyle = '#d6a36c';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  // Handle
  rrect(ctx, -4, -155, 8, 45, 2);
  ctx.fillStyle = '#1d54b8';
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Cricket Ball
  ctx.save();
  const bx = opts.ballX || -120;
  const by = opts.ballY || 50;
  circle(ctx, bx, by, 14);
  ctx.fillStyle = '#b71c1c';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}



// ---------------- ADDITIONAL THEMATIC PROPS FOR 25 WHAT-IF TOPICS ----------------

function drawMoon(ctx, x, y, r, t = 0, disappearing = false) {
  ctx.save();
  ctx.translate(x, y);
  if (disappearing) {
    const alpha = Math.max(0.05, 1 - (t * 0.35));
    ctx.globalAlpha = alpha;
  }
  // glow
  const g = ctx.createRadialGradient(0, 0, r * 0.7, 0, 0, r * 1.5);
  g.addColorStop(0, 'rgba(230, 240, 255, 0.4)');
  g.addColorStop(1, 'rgba(230, 240, 255, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.5, 0, TAU);
  ctx.fill();

  // moon body
  ctx.fillStyle = '#f1f5f9';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // craters
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.2, r * 0.22, 0, TAU);
  ctx.arc(r * 0.25, r * 0.3, r * 0.18, 0, TAU);
  ctx.arc(-r * 0.1, r * 0.4, r * 0.12, 0, TAU);
  ctx.arc(r * 0.35, -r * 0.25, r * 0.14, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawSun(ctx, x, y, r, t = 0, isOff = false) {
  ctx.save();
  ctx.translate(x, y);
  if (isOff) {
    ctx.fillStyle = '#27272a';
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // question mark or dead eyes
    ctx.fillStyle = '#a1a1aa';
    text(ctx, 'OFF', 0, 10, 48, '#a1a1aa', '#18181b', 4, 'Poppins', 700);
  } else {
    // animated rays
    ctx.save();
    ctx.rotate(t * 0.3);
    for (let i = 0; i < 12; i++) {
      ctx.rotate(TAU / 12);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-12, -r * 1.1);
      ctx.lineTo(12, -r * 1.1);
      ctx.lineTo(0, -r * 1.45);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawBlackHole(ctx, x, y, r, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  // glowing accretion swirl
  ctx.save();
  ctx.rotate(t * 1.2);
  const grad = ctx.createLinearGradient(-r * 2.2, -r * 2.2, r * 2.2, r * 2.2);
  grad.addColorStop(0, '#f97316');
  grad.addColorStop(0.5, '#ec4899');
  grad.addColorStop(1, '#8b5cf6');
  ctx.strokeStyle = grad;
  ctx.lineWidth = r * 0.35;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.8, r * 0.7, 0.35, 0, TAU);
  ctx.stroke();
  ctx.restore();

  // pitch black event horizon
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.9, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawFlyingCar(ctx, x, y, s = 1.0, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const hover = Math.sin(t * 6) * 8;
  ctx.translate(0, hover);

  // thruster blue flames
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(-70, 20);
  ctx.lineTo(-40, 20);
  ctx.lineTo(-55, 45 + Math.sin(t * 20) * 10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(40, 20);
  ctx.lineTo(70, 20);
  ctx.lineTo(55, 45 + Math.sin(t * 20 + 1) * 10);
  ctx.closePath();
  ctx.fill();

  // car body
  ctx.fillStyle = '#ef4444';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(-90, -15, 180, 40, 16);
  ctx.fill();
  ctx.stroke();

  // glass dome
  ctx.fillStyle = '#bae6fd';
  ctx.beginPath();
  ctx.arc(0, -15, 50, Math.PI, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawWalkingTree(ctx, x, y, s = 1.0, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const walkPhase = Math.sin(t * 6);

  // root legs
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-25, 40);
  ctx.lineTo(-35 + walkPhase * 25, 110);
  ctx.moveTo(25, 40);
  ctx.lineTo(35 - walkPhase * 25, 110);
  ctx.stroke();

  // trunk body
  ctx.fillStyle = '#92400e';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(-45, -60, 90, 120, 15);
  ctx.fill();
  ctx.stroke();

  // tree eyes and mouth
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(-18, -10, 7, 0, TAU);
  ctx.arc(18, -10, 7, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 10, 12, 0, Math.PI);
  ctx.stroke();

  // leafy canopy crown
  ctx.fillStyle = '#16a34a';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, -110, 75, 0, TAU);
  ctx.arc(-55, -90, 50, 0, TAU);
  ctx.arc(55, -90, 50, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawDinosaur(ctx, x, y, s = 1.0, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  // tail sway
  const tailY = Math.sin(t * 5) * 15;
  ctx.strokeStyle = '#65a30d';
  ctx.lineWidth = 28;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(50, 10);
  ctx.quadraticCurveTo(110, 20 + tailY, 150, -10 + tailY);
  ctx.stroke();

  // body
  ctx.fillStyle = '#84cc16';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(0, 10, 75, 55, -0.2, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // head and jaws
  ctx.beginPath();
  ctx.roundRect(-85, -65, 80, 50, 15);
  ctx.fill();
  ctx.stroke();

  // sharp teeth
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.moveTo(-80 + i * 18, -15);
    ctx.lineTo(-72 + i * 18, -2);
    ctx.lineTo(-64 + i * 18, -15);
  }
  ctx.fill();

  // eye
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(-55, -45, 10, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(-55, -45, 5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawCandyRain(ctx, t = 0, count = 18) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const cx = ((i * 197 + 53) % 1000) + 40;
    const cy = ((t * 400 + i * 140) % 2100) - 100;
    const r = (t * 4 + i) % TAU;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(r);
    if (i % 3 === 0) {
      // lollipop
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 35);
      ctx.stroke();
      ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#ec4899';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, TAU);
      ctx.fill();
      ctx.stroke();
    } else {
      // wrapped candy
      ctx.fillStyle = i % 2 === 0 ? '#3b82f6' : '#eab308';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-16, -10, 32, 20, 6);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawGiantSpider(ctx, x, y, s = 1.0, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  // 8 legs
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const legPhase = Math.sin(t * 8 + i * 1.5) * 15;
    // left leg
    ctx.beginPath();
    ctx.moveTo(-20, -10 + i * 12);
    ctx.lineTo(-70, -40 + i * 22 + legPhase);
    ctx.lineTo(-120, 30 + i * 15 + legPhase);
    ctx.stroke();
    // right leg
    ctx.beginPath();
    ctx.moveTo(20, -10 + i * 12);
    ctx.lineTo(70, -40 + i * 22 - legPhase);
    ctx.lineTo(120, 30 + i * 15 - legPhase);
    ctx.stroke();
  }

  // body
  ctx.fillStyle = '#27272a';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 20, 42, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -20, 26, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // glowing red eyes
  ctx.fillStyle = '#ef4444';
  for (let k = -2; k <= 2; k++) {
    ctx.beginPath();
    ctx.arc(k * 10, -26, 4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}
