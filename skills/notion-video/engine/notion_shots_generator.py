# -*- coding: utf-8 -*-
"""Dynamic Notion Shots Generator for Notion Motion Video Reels.
Generates shots.js with HTML templates and interactive GSAP animations.
"""

import json

def generate_notion_shots_js(topic, lines_meta):
    lines = lines_meta["lines"]
    total_dur = lines_meta["duration"]
    topic_title = topic["title"]
    topic_id = topic["id"]

    shots = []
    for i, line in enumerate(lines):
        start = line["start"]
        end = line["end"]
        shot_start = 0.0 if i == 0 else lines[i-1]["end"]
        shot_end = end if i == len(lines) - 1 else lines[i+1]["start"]
        dur = shot_end - shot_start

        text = line["text"]
        words = text.split()

        # Build shot HTML & update logic based on shot index
        if i == 0:
            # Shot 1: Hook & Question
            html = f"""
              <div class="callout" style="animation: popIn 0.4s ease;">
                <div class="callout-icon">💡</div>
                <div class="callout-content">
                  <div class="callout-title">Hypothetical Simulation</div>
                  <div class="callout-text">{text}</div>
                </div>
                <span class="badge badge-blue">Active Run</span>
              </div>
              <div class="avatar-card">
                <div class="avatar-graphic" id="avatar-slot"></div>
                <div class="avatar-speech">
                  "Let's simulate exactly what happens step-by-step..."
                </div>
              </div>
            """
            update_fn = """
              const blink = Math.sin(t * 4) > 0.85;
              document.getElementById('avatar-slot').innerHTML = makeNotionAvatarSVG('thinking', blink);
              const curX = 450 + Math.sin(t * 2) * 80;
              const curY = 620 + Math.cos(t * 1.5) * 40;
              updateCursor(t, { x: curX, y: curY }, t > 1.2 && t < 1.6);
            """

        elif i == 1:
            # Shot 2: Checklists & Immediate Impact
            w1 = words[0:4]
            w2 = words[4:8] if len(words) > 7 else words[4:]
            w3 = words[8:] if len(words) > 8 else ["Catastrophic Global Chain Reaction"]
            html = f"""
              <div class="todo-list">
                <div class="todo-item" id="todo-1">
                  <div class="checkbox" id="check-1"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div class="todo-text" id="text-1">{" ".join(w1)}</div>
                  <span class="badge badge-yellow">Phase 1</span>
                </div>
                <div class="todo-item" id="todo-2">
                  <div class="checkbox" id="check-2"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div class="todo-text" id="text-2">{" ".join(w2)}</div>
                  <span class="badge badge-red">Critical</span>
                </div>
                <div class="todo-item" id="todo-3">
                  <div class="checkbox" id="check-3"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div class="todo-text" id="text-3">{" ".join(w3)}</div>
                  <span class="badge badge-purple">Pending</span>
                </div>
              </div>
              <div class="avatar-card">
                <div class="avatar-graphic" id="avatar-slot"></div>
                <div class="avatar-speech">
                  "Immediate consequence takes effect within seconds..."
                </div>
              </div>
            """
            update_fn = """
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
            """

        elif i == 2:
            # Shot 3: Escalation & Progress Bar
            html = f"""
              <div class="progress-container">
                <div class="progress-header">
                  <span>SYSTEM IMPACT ACCELERATION</span>
                  <span id="prog-pct" style="color: #2563eb;">0%</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" id="prog-fill"></div>
                </div>
              </div>
              <div class="callout" style="background: #eff6ff; border-color: #bfdbfe;">
                <div class="callout-icon">📈</div>
                <div class="callout-content">
                  <div class="callout-title" style="color: #1e40af;">Consequence Escalation</div>
                  <div class="callout-text" style="color: #1e3a8a;">{text}</div>
                </div>
                <span class="badge badge-blue">Escalating</span>
              </div>
              <div class="avatar-card">
                <div class="avatar-graphic" id="avatar-slot"></div>
                <div class="avatar-speech">
                  "Notice how the impact compounds across the globe!"
                </div>
              </div>
            """
            update_fn = f"""
              const blink = Math.sin(t * 5) > 0.9;
              document.getElementById('avatar-slot').innerHTML = makeNotionAvatarSVG('thinking', blink);
              const p = Math.min(100, Math.floor((t / {dur:.2f}) * 95));
              document.getElementById('prog-pct').textContent = p + '%';
              document.getElementById('prog-fill').style.width = p + '%';
              updateCursor(t, {{ x: 540 + Math.sin(t*3)*70, y: 520 }}, false);
            """

        elif i == 3:
            # Shot 4: Crisis Alert & Shock
            html = f"""
              <div class="callout" style="background: #fef2f2; border-color: #fecaca;">
                <div class="callout-icon">🚨</div>
                <div class="callout-content">
                  <div class="callout-title" style="color: #991b1b;">Extreme Crisis Alert</div>
                  <div class="callout-text" style="color: #7f1d1d; font-weight: 600;">{text}</div>
                </div>
                <span class="badge badge-red" style="animation: pulse 1s infinite;">CRITICAL WARNING</span>
              </div>
              <div class="avatar-card" style="border-color: #fecaca; background: #fffaf0;">
                <div class="avatar-graphic" id="avatar-slot"></div>
                <div class="avatar-speech" style="color: #991b1b; font-weight: 700;">
                  "Absolute chaos! The entire planet enters panic mode!"
                </div>
              </div>
            """
            update_fn = """
              document.getElementById('avatar-slot').innerHTML = makeNotionAvatarSVG('shock', false);
              const shakeX = (Math.random() - 0.5) * 12;
              const shakeY = (Math.random() - 0.5) * 8;
              updateCursor(t, { x: 540 + shakeX, y: 780 + shakeY }, true);
            """

        else:
            # Shot 5: Conclusion & Master Victory
            html = f"""
              <div class="callout" style="background: #f0fdf4; border-color: #bbf7d0;">
                <div class="callout-icon">🎉</div>
                <div class="callout-content">
                  <div class="callout-title" style="color: #166534;">Final Takeaway Verdict</div>
                  <div class="callout-text" style="color: #14532d; font-weight: 600;">{text}</div>
                </div>
                <span class="badge badge-green">100% COMPLETE</span>
              </div>
              <div class="progress-container">
                <div class="progress-header">
                  <span>SCENARIO RESOLUTION</span>
                  <span style="color: #16a34a; font-weight: 700;">100% DONE</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" style="width: 100%; background: #16a34a;"></div>
                </div>
              </div>
              <div class="avatar-card" style="background: #f0fdf4; border-color: #bbf7d0;">
                <div class="avatar-graphic" id="avatar-slot"></div>
                <div class="avatar-speech" style="color: #166534; font-weight: 600;">
                  "Hit Follow & Subscribe for more mind-blowing 'What If' simulations!"
                </div>
              </div>
            """
            update_fn = """
              const blink = Math.sin(t * 3) > 0.9;
              document.getElementById('avatar-slot').innerHTML = makeNotionAvatarSVG('victory', blink);
              updateCursor(t, { x: 740, y: 640 }, t > 1.0 && t < 1.4);
            """

        shots.append({
            "start": round(shot_start, 3),
            "end": round(shot_end, 3),
            "title": topic_title,
            "html": html.strip(),
            "update_fn": update_fn.strip()
        })

    # Assemble shots.js code
    js_code = f"window.DURATION = {total_dur:.3f};\nwindow.SHOTS = [\n"
    for s in shots:
        js_code += f"""  {{
    start: {s['start']},
    end: {s['end']},
    title: {json.dumps(s['title'])},
    html: {json.dumps(s['html'])},
    update(t, totalT) {{
      {s['update_fn']}
    }}
  }},\n"""
    js_code += "];\n"
    return js_code
