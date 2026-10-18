// ---------- Notion Video Compositor & Animation Engine ----------

const DUR = window.DURATION || 30.0;
const WORDS = window.WORDS || [];
const SHOTS = window.SHOTS || [];

// Captions chunking: 2-3 words per kinetic caption card
const CHUNKS = (() => {
  const ch = [];
  let cur = null;
  WORDS.forEach((w, i) => {
    const prev = WORDS[i - 1];
    const brk = !cur || cur.words.length >= 3 || (cur.text + ' ' + w.w).length > 18 || /[.,?!]$/.test(prev ? prev.w : '');
    if (brk) {
      cur = { words: [w], text: w.w, s: w.s, e: w.e };
      ch.push(cur);
    } else {
      cur.words.push(w);
      cur.text += ' ' + w.w;
      cur.e = w.e;
    }
  });
  ch.forEach((c, i) => {
    const n = ch[i + 1];
    c.e = n && n.s - c.e < 0.3 ? n.s : c.e + 0.2;
  });
  return ch;
})();

const stageEl = document.getElementById('stage');
const titleEl = document.getElementById('title-text');
const captionEl = document.getElementById('caption-text');
const cursorEl = document.getElementById('cursor');
const rippleEl = document.getElementById('ripple');

let currentShotIndex = -1;

function updateCaptions(t) {
  const chunk = CHUNKS.find(c => t >= c.s && t < c.e);
  if (!chunk) return;

  const words = chunk.text.split(' ');
  // highlight middle or first word
  const hlIdx = Math.floor(words.length / 2);
  const formatted = words.map((w, idx) => idx === hlIdx ? `<span class="hl">${w}</span>` : w).join(' ');
  captionEl.innerHTML = formatted.toUpperCase();
}

function updateCursor(t, curPos = { x: 540, y: 1100 }, clicking = false) {
  cursorEl.style.transform = `translate(${curPos.x}px, ${curPos.y}px)`;
  if (clicking) {
    rippleEl.style.left = `${curPos.x + 8}px`;
    rippleEl.style.top = `${curPos.y + 8}px`;
    rippleEl.style.transform = 'translate(-50%, -50%) scale(1.6)';
    rippleEl.style.opacity = '1';
  } else {
    rippleEl.style.opacity = '0';
    rippleEl.style.transform = 'translate(-50%, -50%) scale(0)';
  }
}

function renderAt(t) {
  // 1. Find active shot
  let shotIdx = SHOTS.findIndex(s => t >= s.start && t < s.end);
  if (shotIdx < 0) shotIdx = SHOTS.length - 1;
  const shot = SHOTS[shotIdx];

  // 2. Shot transition
  if (shotIdx !== currentShotIndex) {
    currentShotIndex = shotIdx;
    stageEl.innerHTML = shot.html;
  }

  // 3. Typewriter title effect
  if (shot.title) {
    const titleProgress = Math.min(1, Math.max(0, (t - shot.start) / 1.5));
    const charsToShow = Math.floor(titleProgress * shot.title.length);
    titleEl.textContent = shot.title.slice(0, charsToShow);
  }

  // 4. Run shot frame update (poses, progress bar, checkmarks, cursor)
  if (shot.update) {
    shot.update(t - shot.start, t);
  }

  // 5. Update bottom kinetic captions
  updateCaptions(t);
}

window.renderAt = renderAt;
window.TOTAL_FRAMES = Math.round(DUR * 30);
window.ready = true;

