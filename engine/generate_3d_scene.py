# -*- coding: utf-8 -*-
"""Dynamic Shots Generator for 3D Zack D Films Animation.
Generates customized src/shots.js per topic for the Three.js 3D engine.
"""

import json
from pathlib import Path

def generate_3d_shots_code(topic, lines_meta):
    lines = lines_meta["lines"]
    total_dur = lines_meta["duration"]
    topic_id = topic["id"]

    # Generate Captions array
    captions = []
    for line in lines:
        words = line["text"].split()
        # chunk into 2-3 words
        i = 0
        while i < len(words):
            chunk_words = words[i:i+3]
            chunk_text = " ".join(chunk_words).upper()
            # Highlight first word or dramatic word
            if len(chunk_words) > 1:
                highlighted = f'<span class="hl">{chunk_words[0].upper()}</span> ' + " ".join(chunk_words[1:]).upper()
            else:
                highlighted = f'<span class="hl">{chunk_text}</span>'
            
            # Approximate timestamp within line
            ratio = i / max(1, len(words))
            t_cap = line["start"] + ratio * (line["end"] - line["start"])
            captions.append([round(t_cap, 2), highlighted])
            i += 3

    code = f"""import * as THREE from 'three';
import {{ makeHuman }} from './human.js';
import {{ floatingIndia, glowSprite, sparks, rippleOverlay }} from './props.js';
import {{ materials }} from './materials.js';
import {{ earthTexture, cloudTexture, codeTexture }} from './textures.js';
import {{ lerp, easeOut, easeIn, easeInOut, cam, place }} from './anim.js';

export const DURATION = {total_dur:.2f};

export const CAPTIONS = {json.dumps(captions, indent=2)};

export const FADES = [
  [{lines[0]['end'] - 0.2:.2f}, {lines[0]['end']:.2f}, {lines[0]['end'] + 0.1:.2f}, {lines[0]['end'] + 0.3:.2f}],
  [{lines[1]['end'] - 0.2:.2f}, {lines[1]['end']:.2f}, {lines[1]['end'] + 0.1:.2f}, {lines[1]['end'] + 0.3:.2f}],
  [{lines[2]['end'] - 0.2:.2f}, {lines[2]['end']:.2f}, {lines[2]['end'] + 0.1:.2f}, {lines[2]['end'] + 0.3:.2f}],
  [{lines[3]['end'] - 0.2:.2f}, {lines[3]['end']:.2f}, {lines[3]['end'] + 0.1:.2f}, {lines[3]['end'] + 0.3:.2f}]
];

function makeCelestialSphere({{ radius = 0.5, color = 0x38bdf8, emissive = 0x0284c7, textureType = 'earth' }} = {{}}) {{
  const g = new THREE.Group();
  let mat;
  if (textureType === 'earth') {{
    mat = new THREE.MeshStandardMaterial({{ map: earthTexture({{ highlightIndia: true }}), roughness: 0.4 }});
  }} else {{
    mat = new THREE.MeshStandardMaterial({{ color, emissive, emissiveIntensity: 0.6, roughness: 0.3 }});
  }}
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 40, 40), mat);
  g.add(mesh);

  // Atmospheric glow rings
  const ringMat = new THREE.MeshBasicMaterial({{ color, transparent: true, opacity: 0.3 }});
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.2, 0.004, 8, 48), ringMat);
  ring.rotation.x = Math.PI * 0.35;
  g.add(ring);

  return {{ root: g, mesh, ring }};
}}
"""

    # Generate 5 shots
    for i, line in enumerate(lines):
        shot_start = 0.0 if i == 0 else lines[i-1]["end"]
        shot_end = line["end"] if i == len(lines) - 1 else lines[i+1]["start"]
        dur = shot_end - shot_start

        code += f"""
// Shot {i+1}: {line['text'][:40]}
function shot{i+1}({{ makeStage }}) {{
  const scene = makeStage({{ shadowSize: 3.2 }});
  const man = makeHuman('casual', {{ shirtColor: '{ "blue" if i%2==0 else "orange" }' }});
  man.root.position.set(0, 0, 0.1);
  scene.add(man.root);

  const sphere = makeCelestialSphere({{
    radius: 0.45,
    color: { "0x38bdf8" if "moon" in topic_id or "ice" in topic_id else ("0xf59e0b" if "sun" in topic_id else "0x4ade80") },
    emissive: 0x1e3a8a
  }});
  sphere.root.position.set(0.42, 1.35, -0.2);
  scene.add(sphere.root);

  const c = cam(36);
  return {{
    scene, camera: c,
    update(t) {{
      const u = t / {dur:.2f};
      sphere.root.rotation.y = u * 0.5;
      sphere.ring.rotation.z = u * 0.3;

      man.speak(t, 0.85);
      man.blink(t);
      man.idle(t);
      man.setPose({{
        head: [Math.sin(t * 3.5) * 0.05, Math.cos(t * 2.5) * 0.08, 0],
        chest: [0, Math.sin(t * 2.0) * 0.04, 0],
        armL: [{ -0.3 + i*0.1 }, { 0.2 + (i%2)*0.2 }, { -0.1 }],
        armR: [{ 0.4 - (i%2)*0.3 }, { -0.3 + (i%2)*0.2 }, { 0.1 }]
      }});

      c.position.set(Math.sin(t * 0.4) * 0.05, 1.25 + Math.cos(t * 0.5) * 0.02, 1.85 - u * 0.15);
      c.lookAt(0, 1.15, 0);
    }}
  }};
}}
"""

    # Build SHOTS array
    code += "\nexport const SHOTS = [\n"
    for i, line in enumerate(lines):
        shot_start = 0.0 if i == 0 else lines[i-1]["end"]
        shot_end = line["end"] if i == len(lines) - 1 else lines[i+1]["start"]
        code += f"  {{ start: {shot_start:.3f}, end: {shot_end:.3f}, build: shot{i+1} }},\n"
    code += "];\n"

    return code

