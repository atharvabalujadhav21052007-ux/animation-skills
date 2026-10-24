---
name: nyt-animation
description: >-
  Studio-grade skill to create viral Indian comedic 2D animated videos in the exact
  style, humor, motion, and voice energy of NOT YOUR TYPE (NYT - Ayug Soni / Aryan Soni).
  Covers the 5-beat escalation script formula, expressive Hinglish voice direction (Gemini/TTS),
  snappy 2D puppet motion rules, meme camera grammar (zooms/shakes), and audio/SFX pacing.
---

# NOT YOUR TYPE (NYT) Animation Studio Skill

This skill guides the creation of viral Indian 2D comedy-animation videos modeled after **NOT YOUR TYPE (NYT)** (e.g., *Every Indian Street Food Ever!*, *Indian School Life*, *Gym Struggles*).

NYT is defined by **hyper-relatable Indian slice-of-life observations**, **sudden hyper-escalation into anime-level battle drama**, **explosive Hinglish voice acting**, **minimalist 2D puppet motion**, and **impeccable meme sound timing**.

---

## The 6 Golden Invariants of NYT

1. **Voice is the Spine (80% of Energy):** An NYT video is an animated podcast/stand-up bit. The voiceover MUST be recorded or generated first. The animation exists only to serve the voice acting and punchlines.
2. **The Escalation Ladder (0 to 100 in 3 seconds):** A mundane problem (e.g., asking for extra sukkha puri) must escalate into a dramatic cosmic catastrophe before deflating into a deadpan reality check.
3. **Low-FPS Character, High-FPS Camera:** Characters move snappy on 8–12 FPS (pose-to-pose cutouts). The camera (zooms, pans, screen-shakes) moves at fluid 30–60 FPS.
4. **The Pre-Punchline Silence Rule:** Always cut background music completely 0.4–0.6 seconds before a punchline or awkward reaction. Silence IS the punchline.
5. **Anime Trope Injections:** Everyday Indian uncles, street vendors, and kids must randomly unleash anime tropes: speed lines, flaming eyes, glowing glasses, giant sweat drops, or DBZ teleport sounds.
6. **Snappy Smash Cuts:** No slow fades or dissolves. Transitions are 100% hard cuts or fast whip-pans with whoosh SFX.

---

## Routing & Reference Modules

Read the relevant reference module depending on your current phase:

| Phase | Read Module | Description |
|---|---|---|
| **Scriptwriting & Concept** | `references/comedy_writing_bible.md` | The 5-beat structure, Hinglish slang, relatable Indian conflict formulas |
| **Voice Acting & TTS** | `references/voice_direction_tts.md` | Gemini Audio / TTS prompt engineering, scream/whisper markup, phonetic spelling |
| **Visuals & Motion** | `references/visual_motion_rules.md` | Modular 2D puppet rigs, visemes/lipsync, camera zoom/shake math, anime FX |
| **Sound Design** | `references/sfx_music_bible.md` | Curated meme SFX cue sheet, BGM pacing, and comedic timing rules |

---

## Step-by-Step Production Pipeline

### Step 1: Script & Beat Sheet (`nyt_script`)
Generate the script in the strict NYT 5-column format:
`[Timestamp | Character | Dialogue (with emotion tags) | Visual Action & Poses | Camera & SFX]`

### Step 2: Voice Generation & Timing (`nyt_voice`)
- Use Gemini native speech or expressive TTS.
- Include emotional directions: `[screaming with voice crack]`, `[whispering conspiratorially]`, `[deadpan sigh]`.
- Phonetically spell Hinglish words for authentic cadence: *"Arrey bhaaiii!"*, *"Momos wale bhaiya!"*, *"Swaad anusaaar!"*.

### Step 3: Lip-Sync & Viseme Mapping (`nyt_lipsync`)
- Pass generated `.wav` to Rhubarb Lip Sync or amplitude-based viseme extractor.
- Map to the 8 standard viseme mouths: `REST`, `A`, `E`, `O`, `U`, `SCREAM`, `SMIRK`, `SKEPTICAL`.

### Step 4: Asset & Scene Composition (`nyt_animate`)
- Background: Flat/vector stylized backdrop (Chaat counter, street stall, tuition room).
- Character Puppet: Base body, interchangeable eyes (Shock, Rage, Squint, Neutral), and dynamic mouth visemes.
- Apply camera zooms on emphasis words and screen shakes on scream/boom cues.

### Step 5: Sound Mix & Master (`nyt_audio`)
- Add jaunty, upbeat comedic bassline for casual dialogue.
- Hard cut music to zero on dramatic beats.
- Layer iconic meme SFX: Vine boom, Metal pipe, Anime whoosh, Cartoon bonk.

