// AUTO-GENERATED SHOTS FOR TOPIC: What If the Moon Disappeared?
const walkLegs = (t, sp = 9, amp = .55) => ({
  L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7],
  R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7]
});
const walkArms = (t, sp = 9, amp = .6) => ({
  L: [.3 - Math.sin(t * sp) * amp, -.3],
  R: [.3 + Math.sin(t * sp) * amp, -.3]
});
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);

function studioBG(ctx, t, cam, top, bot) {
  applyCam(ctx, cam, .08);
  drawSky(ctx, top, bot, -400, 1400);
  applyCam(ctx, cam, 1);
  ctx.beginPath();
  ctx.rect(-1000, 1380, 3080, 600);
  ctx.fillStyle = '#e5edf5';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = INK;
  ctx.beginPath();
  ctx.moveTo(-1000, 1380);
  ctx.lineTo(2080, 1380);
  ctx.stroke();
}

const SHOTS = [];

// Shot 1: "What if the Moon suddenly vanished into ..." (0.00s - 7.02s)
SHOTS.push({
  start: 0.000, end: 7.021, tr: 'whip',
  draw(ctx, lt, t) {
    const hh = handheld(t, 3.5);
    const cam = { x: 540 + hh[0], y: 920 + hh[1] - lt * 6, z: 1.0 + lt * 0.02, r: Math.sin(t * 0.5) * 0.006 };
    studioBG(ctx, t, cam, '#0f172a', '#f8fafc');

    applyCam(ctx, cam, 0.4);
    drawMoon(ctx, 780, 520, 180, t, false);

    applyCam(ctx, cam, 1.0);
    const bounce = Math.sin(t * 7) * 4;

    drawStick(ctx, {
      x: 480, y: 1390 + bounce, s: 500,
      cols: PAL.blue,
      hat: 'quiff',
      hairCol: '#281a12',
      face: { eyes: 'wide', mouth: 'o' },
      blush: true,
      glasses: false,
      headphones: false,
      arms: { L: [0.4, -0.2], R: [-0.6, 0.4] }
    });
  }
});

// Shot 2: "Instantly, ocean tides would weaken by s..." (6.77s - 14.08s)
SHOTS.push({
  start: 6.771, end: 14.082, tr: 'whip',
  draw(ctx, lt, t) {
    const hh = handheld(t, 3.5);
    const cam = { x: 540 + hh[0], y: 920 + hh[1] - lt * 6, z: 1.0 + lt * 0.02, r: Math.sin(t * 0.5) * 0.006 };
    studioBG(ctx, t, cam, '#1e293b', '#f8fafc');

    applyCam(ctx, cam, 0.4);
    drawMoon(ctx, 780, 520, 180, t, true);
    drawEarthGlobe(ctx, 320, 680, 160, t);

    applyCam(ctx, cam, 1.0);
    const bounce = Math.sin(t * 7) * 4;

    drawImpactBurst(ctx, 540, 800, 220 + Math.sin(t*8)*20, 14, '#fbbf24');
    drawStick(ctx, {
      x: 540, y: 1390 + bounce, s: 520,
      cols: PAL.orange,
      hat: 'quiff',
      face: { eyes: 'wide', mouth: 'teeth' },
      blush: true,
      arms: { L: [2.2, 0.5], R: [2.2, -0.5] }
    });
    drawSweatDrop(ctx, 600, 1080, 28);
  }
});

// Shot 3: "Without the Moon's gravitational anchor,..." (13.83s - 24.22s)
SHOTS.push({
  start: 13.832, end: 24.223, tr: 'whip',
  draw(ctx, lt, t) {
    const hh = handheld(t, 3.5);
    const cam = { x: 540 + hh[0], y: 920 + hh[1] - lt * 6, z: 1.0 + lt * 0.02, r: Math.sin(t * 0.5) * 0.006 };
    studioBG(ctx, t, cam, '#334155', '#f8fafc');

    applyCam(ctx, cam, 0.4);
    drawMoon(ctx, 780, 520, 180, t, true);
    drawEarthGlobe(ctx, 320, 680, 160, t);

    applyCam(ctx, cam, 1.0);
    const bounce = Math.sin(t * 7) * 4;

    const runX = 420 + Math.sin(t * 3) * 120;
    drawStick(ctx, {
      x: runX, y: 1390 + bounce, s: 500,
      cols: PAL.red,
      hat: 'quiff',
      face: { eyes: 'squint', mouth: 'frown' },
      blush: true,
      legs: walkLegs(t, 12),
      arms: walkArms(t, 12)
    });
    drawSmokePuff(ctx, runX - 90, 1340, 50, t);
  }
});

// Shot 4: "Days would shrink to just six to twelve ..." (23.97s - 28.92s)
SHOTS.push({
  start: 23.973, end: 28.924, tr: 'whip',
  draw(ctx, lt, t) {
    const hh = handheld(t, 3.5);
    const cam = { x: 540 + hh[0], y: 920 + hh[1] - lt * 6, z: 1.0 + lt * 0.02, r: Math.sin(t * 0.5) * 0.006 };
    studioBG(ctx, t, cam, '#1e1b4b', '#f8fafc');

    applyCam(ctx, cam, 0.4);
    drawMoon(ctx, 780, 520, 180, t, true);
    drawEarthGlobe(ctx, 320, 680, 160, t);

    applyCam(ctx, cam, 1.0);
    const bounce = Math.sin(t * 7) * 4;

    drawStick(ctx, {
      x: 480, y: 1390 + bounce, s: 510,
      cols: PAL.purple,
      hat: 'quiff',
      face: { eyes: 'spiral', mouth: 'teeth' },
      blush: true,
      arms: { L: [2.1, 0.6], R: [2.1, -0.6] }
    });
    drawSweatDrop(ctx, 540, 1060, 32);
    drawSweatDrop(ctx, 420, 1070, 26);
  }
});

// Shot 5: "Nights would become pitch black, leaving..." (28.67s - 38.94s)
SHOTS.push({
  start: 28.674, end: 38.935, tr: 'whip',
  draw(ctx, lt, t) {
    const hh = handheld(t, 3.5);
    const cam = { x: 540 + hh[0], y: 920 + hh[1] - lt * 6, z: 1.0 + lt * 0.02, r: Math.sin(t * 0.5) * 0.006 };
    studioBG(ctx, t, cam, '#020617', '#f8fafc');

    applyCam(ctx, cam, 0.4);
    drawMoon(ctx, 780, 520, 180, t, true);
    drawEarthGlobe(ctx, 320, 680, 160, t);

    applyCam(ctx, cam, 1.0);
    const bounce = Math.sin(t * 7) * 4;

    drawStick(ctx, {
      x: 540, y: 1390 + bounce, s: 530,
      cols: PAL.yellow,
      hat: 'crown',
      face: { eyes: 'happy', mouth: 'grin' },
      blush: true,
      arms: { L: [1.8, -0.3], R: [1.8, 0.3] }
    });
    for (let c = 0; c < 15; c++) {
      const cx = ((c * 73 + t * 180) % 1000) + 40;
      const cy = ((t * 300 + c * 130) % 1800);
      sparkle(ctx, cx, cy, 14, 1);
    }
  }
});
