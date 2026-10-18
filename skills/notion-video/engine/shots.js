window.DURATION = 39.735;
window.SHOTS = [
  {
    start: 0.0,
    end: 7.021,
    title: "What If the Moon Disappeared?",
    html: "<div class=\"callout\" style=\"animation: popIn 0.4s ease;\">\n                <div class=\"callout-icon\">\ud83d\udca1</div>\n                <div class=\"callout-content\">\n                  <div class=\"callout-title\">Hypothetical Simulation</div>\n                  <div class=\"callout-text\">What if the Moon suddenly vanished into thin air tonight?</div>\n                </div>\n                <span class=\"badge badge-blue\">Active Run</span>\n              </div>\n              <div class=\"avatar-card\">\n                <div class=\"avatar-graphic\" id=\"avatar-slot\"></div>\n                <div class=\"avatar-speech\">\n                  \"Let's simulate exactly what happens step-by-step...\"\n                </div>\n              </div>",
    update(t, totalT) {
      const blink = Math.sin(t * 4) > 0.85;
              document.getElementById('avatar-slot').innerHTML = makeNotionAvatarSVG('thinking', blink);
              const curX = 450 + Math.sin(t * 2) * 80;
              const curY = 620 + Math.cos(t * 1.5) * 40;
              updateCursor(t, { x: curX, y: curY }, t > 1.2 && t < 1.6);
    }
  },
  {
    start: 6.771,
    end: 14.082,
    title: "What If the Moon Disappeared?",
    html: "<div class=\"todo-list\">\n                <div class=\"todo-item\" id=\"todo-1\">\n                  <div class=\"checkbox\" id=\"check-1\"><svg viewBox=\"0 0 24 24\"><path d=\"M5 13l4 4L19 7\"/></svg></div>\n                  <div class=\"todo-text\" id=\"text-1\">Instantly, ocean tides would</div>\n                  <span class=\"badge badge-yellow\">Phase 1</span>\n                </div>\n                <div class=\"todo-item\" id=\"todo-2\">\n                  <div class=\"checkbox\" id=\"check-2\"><svg viewBox=\"0 0 24 24\"><path d=\"M5 13l4 4L19 7\"/></svg></div>\n                  <div class=\"todo-text\" id=\"text-2\">weaken by sixty percent,</div>\n                  <span class=\"badge badge-red\">Critical</span>\n                </div>\n                <div class=\"todo-item\" id=\"todo-3\">\n                  <div class=\"checkbox\" id=\"check-3\"><svg viewBox=\"0 0 24 24\"><path d=\"M5 13l4 4L19 7\"/></svg></div>\n                  <div class=\"todo-text\" id=\"text-3\">causing marine life utter chaos.</div>\n                  <span class=\"badge badge-purple\">Pending</span>\n                </div>\n              </div>\n              <div class=\"avatar-card\">\n                <div class=\"avatar-graphic\" id=\"avatar-slot\"></div>\n                <div class=\"avatar-speech\">\n                  \"Immediate consequence takes effect within seconds...\"\n                </div>\n              </div>",
    update(t, totalT) {
      const blink = Math.sin(t * 3.5) > 0.9;
              document.getElementById('avatar-slot').innerHTML = makeNotionAvatarSVG('coffee', blink);
              // Interactive checkbox ticks
              const c1 = document.getElementById('check-1');
              const t1 = document.getElementById('text-1');
              if (t > 0.8) { c1.classList.add('checked'); t1.classList.add('checked'); }
              const c2 = document.getElementById('check-2');
              const t2 = document.getElementById('text-2');
              if (t > 2.2) { c2.classList.add('checked'); t2.classList.add('checked'); }
              // Cursor gliding over items
              const curX = 320 + t * 40;
              const curY = 480 + (t > 1.5 ? 120 : 0);
              updateCursor(t, { x: curX, y: curY }, (t > 0.7 && t < 1.0) || (t > 2.1 && t < 2.4));
    }
  },
  {
    start: 13.832,
    end: 24.223,
    title: "What If the Moon Disappeared?",
    html: "<div class=\"progress-container\">\n                <div class=\"progress-header\">\n                  <span>SYSTEM IMPACT ACCELERATION</span>\n                  <span id=\"prog-pct\" style=\"color: #2563eb;\">0%</span>\n                </div>\n                <div class=\"progress-track\">\n                  <div class=\"progress-fill\" id=\"prog-fill\"></div>\n                </div>\n              </div>\n              <div class=\"callout\" style=\"background: #eff6ff; border-color: #bfdbfe;\">\n                <div class=\"callout-icon\">\ud83d\udcc8</div>\n                <div class=\"callout-content\">\n                  <div class=\"callout-title\" style=\"color: #1e40af;\">Consequence Escalation</div>\n                  <div class=\"callout-text\" style=\"color: #1e3a8a;\">Without the Moon's gravitational anchor, Earth's axis would start violently wobbling!</div>\n                </div>\n                <span class=\"badge badge-blue\">Escalating</span>\n              </div>\n              <div class=\"avatar-card\">\n                <div class=\"avatar-graphic\" id=\"avatar-slot\"></div>\n                <div class=\"avatar-speech\">\n                  \"Notice how the impact compounds across the globe!\"\n                </div>\n              </div>",
    update(t, totalT) {
      const blink = Math.sin(t * 5) > 0.9;
              document.getElementById('avatar-slot').innerHTML = makeNotionAvatarSVG('thinking', blink);
              const p = Math.min(100, Math.floor((t / 10.39) * 95));
              document.getElementById('prog-pct').textContent = p + '%';
              document.getElementById('prog-fill').style.width = p + '%';
              updateCursor(t, { x: 540 + Math.sin(t*3)*70, y: 520 }, false);
    }
  },
  {
    start: 23.973,
    end: 28.924,
    title: "What If the Moon Disappeared?",
    html: "<div class=\"callout\" style=\"background: #fef2f2; border-color: #fecaca;\">\n                <div class=\"callout-icon\">\ud83d\udea8</div>\n                <div class=\"callout-content\">\n                  <div class=\"callout-title\" style=\"color: #991b1b;\">Extreme Crisis Alert</div>\n                  <div class=\"callout-text\" style=\"color: #7f1d1d; font-weight: 600;\">Days would shrink to just six to twelve hours as Earth spins much faster.</div>\n                </div>\n                <span class=\"badge badge-red\" style=\"animation: pulse 1s infinite;\">CRITICAL WARNING</span>\n              </div>\n              <div class=\"avatar-card\" style=\"border-color: #fecaca; background: #fffaf0;\">\n                <div class=\"avatar-graphic\" id=\"avatar-slot\"></div>\n                <div class=\"avatar-speech\" style=\"color: #991b1b; font-weight: 700;\">\n                  \"Absolute chaos! The entire planet enters panic mode!\"\n                </div>\n              </div>",
    update(t, totalT) {
      document.getElementById('avatar-slot').innerHTML = makeNotionAvatarSVG('shock', false);
              const shakeX = (Math.random() - 0.5) * 12;
              const shakeY = (Math.random() - 0.5) * 8;
              updateCursor(t, { x: 540 + shakeX, y: 780 + shakeY }, true);
    }
  },
  {
    start: 28.674,
    end: 38.935,
    title: "What If the Moon Disappeared?",
    html: "<div class=\"callout\" style=\"background: #f0fdf4; border-color: #bbf7d0;\">\n                <div class=\"callout-icon\">\ud83c\udf89</div>\n                <div class=\"callout-content\">\n                  <div class=\"callout-title\" style=\"color: #166534;\">Final Takeaway Verdict</div>\n                  <div class=\"callout-text\" style=\"color: #14532d; font-weight: 600;\">Nights would become pitch black, leaving nocturnal animals completely disoriented forever!</div>\n                </div>\n                <span class=\"badge badge-green\">100% COMPLETE</span>\n              </div>\n              <div class=\"progress-container\">\n                <div class=\"progress-header\">\n                  <span>SCENARIO RESOLUTION</span>\n                  <span style=\"color: #16a34a; font-weight: 700;\">100% DONE</span>\n                </div>\n                <div class=\"progress-track\">\n                  <div class=\"progress-fill\" style=\"width: 100%; background: #16a34a;\"></div>\n                </div>\n              </div>\n              <div class=\"avatar-card\" style=\"background: #f0fdf4; border-color: #bbf7d0;\">\n                <div class=\"avatar-graphic\" id=\"avatar-slot\"></div>\n                <div class=\"avatar-speech\" style=\"color: #166534; font-weight: 600;\">\n                  \"Hit Follow & Subscribe for more mind-blowing 'What If' simulations!\"\n                </div>\n              </div>",
    update(t, totalT) {
      const blink = Math.sin(t * 3) > 0.9;
              document.getElementById('avatar-slot').innerHTML = makeNotionAvatarSVG('victory', blink);
              updateCursor(t, { x: 740, y: 640 }, t > 1.0 && t < 1.4);
    }
  },
];
