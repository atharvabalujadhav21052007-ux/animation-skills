# NOT YOUR TYPE — Comedy Writing Bible & Escalation Formula

This reference guide documents the exact writing mechanics, comedic escalation, dialogue pacing, and Indian cultural archetypes used by **NOT YOUR TYPE** (Ayug Soni & Chinxx).

---

## 1. The 5-Beat Escalation Ladder

Every iconic NYT short or video follows this precise arc:

```
[Beat 1: Setup] ──▶ [Beat 2: Petty Conflict] ──▶ [Beat 3: Anime Escalation] ──▶ [Beat 4: Absurd Climax] ──▶ [Beat 5: Anti-Climax]
  Deadpan Hook           Small Disagreement             Internal Monologue           Vine Boom + Chaos          Awkward Deflation
```

### Beat 1: The Everyday Slice-of-Life Hook (0–3s)
- **Concept:** Start with a universally acknowledged Indian experience.
- **Tone:** Casual, conversational, slightly bored or tired.
- **Example:** *"Har Indian street food stall ka ek universal rule hota hai..."*

### Beat 2: The Petty Conflict (3–6s)
- **Concept:** A ridiculously trivial issue arises.
- **Tone:** Skeptical squint, tilt of the head, raised eyebrow.
- **Example:** *"Bhaiya... do plate momos lagana, lekin pehle batao, extra mayonnaise doge na?"*

### Beat 3: The Hyper-Anime Escalation (6–12s)
- **Concept:** Treat a 5-rupee matter like a life-or-death fight in Naruto / Dragon Ball Z.
- **Tone:** Rapid internal monologue, pitch rising, extreme close-up, dramatic breathing.
- **Example:** *"Inhone mana kar diya?! KYA MATLAB EXTRA MAYO KE 10 RUPEE LAGENGE?! Maine pichle saal isi dukaan par 4000 momos khaye hain!"*

### Beat 4: Absurd Climax & Scream (12–16s)
- **Concept:** Complete vocal and visual chaos.
- **Visuals:** Flaming red eyes, giant screaming mouth, anger veins pulsing, screen shake, Vine boom.
- **Audio:** Voice cracks, shrieking Hinglish, metal pipe clang, intense battle music.

### Beat 5: The Anti-Climactic Deflation (16–20s)
- **Concept:** Instant cut back to reality. The music instantly cuts to dead silence.
- **Tone:** Deadpan, polite, timid, flat voice.
- **Example:** *"Achha theek hai bhaiya... paytm kar diya. Thoda pyaaz daal dena bas."*

---

## 2. Hinglish Slang & Voice Rhythm

To write genuine NYT dialogue:
- **Never translate literally into formal Hindi.** Use conversational Delhi/Mumbai/North Indian casual street Hinglish.
- **Vocabulary Bank:**
  - *Addressed to vendors:* "Bhaiya", "Uncle ji", "Boss", "Ustaad"
  - *Disbelief markers:* "Arrey bhai!", "Kya scene hai?", "Mazaak chal raha hai kya?", "Ye kab hua?!"
  - *Exaggeration phrases:* "Swaad anusaaar", "Cheez ka avalanche", "Khatam, tata, bye-bye"
  - *Food vlogger parodies:* "Dekhiye dosto, yahaan amul butter ki nadiyaan beh rahi hain!"

---

## 3. Screenplay JSON Schema

When generating scripts for the studio engine, format them as:

```json
{
  "title": "Episode Title",
  "shots": [
    {
      "id": "shot_1",
      "dialogue": "Spoken line with authentic phrasing",
      "voice": "hi-IN-MadhurNeural",
      "emotion": "neutral | squint | shock | rage | smug",
      "pause_sec": 0.4,
      "camera": {
        "zoom": 1.0,
        "pan_x": 0.0,
        "pan_y": 0.0,
        "rotation_deg": 0.0,
        "shake": false
      },
      "sfx_cues": [
        { "name": "anime_whoosh", "offset_sec": 0.0, "volume": 1.0 }
      ],
      "pre_punchline_silence": false
    }
  ]
}
```

