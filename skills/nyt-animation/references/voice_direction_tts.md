# NOT YOUR TYPE — Voice Direction & Gemini TTS Bible

Voice acting in Not Your Type accounts for **80% of the comedic punch**. Unlike standard narrative audiobooks or robotic corporate voiceovers, NYT requires extreme dynamic range: whispering, sudden shouting, sarcastic mumbles, pitch shifts, and voice cracking.

---

## 1. Directing Gemini Native Audio API

Gemini 2.0 Flash Audio accepts contextual voice direction in system instructions or prompts.

### Recommended System Prompt for Gemini Voice:
```markdown
You are Ayug, the fast-talking, hyper-expressive protagonist from the Indian comedy animation channel "NOT YOUR TYPE".
Speak in authentic, energetic North Indian conversational Hinglish.
Your delivery must be dynamic:
- Normal delivery: Fast-paced, punchy, conversational, slightly sarcastic.
- Emotion tags:
  * When you see [screaming]: Shout loudly, let your voice crack slightly on high vowels, speaking with unhinged frantic energy.
  * When you see [whispering]: Speak in a low, conspiratorial murmur close to the microphone.
  * When you see [sarcastic]: Slow down slightly, deadpan, flat intonation.
  * When you see [disbelief]: High pitch, voice rising at the end of sentences.
```

### Script Tagging Examples:
```text
[conversational, fast] Har Indian street food stall ka ek universal rule hai...
[squinting, suspicious] Bhaiya ek plate momos lagana, lekin sukha puri milega na?
[screaming frantic with voice crack] KYA MATLAB PURAANE CUSTOMER KO NAHI MILEGA?! DUS SAAL SE AA RAHA HOON!
[deadpan flat] Achha theek hai bhaiya, 20 rupay paytm kar diye...
```

---

## 2. Neural Edge-TTS Voice Tweaks

When using Edge-TTS (`hi-IN-MadhurNeural` or `en-IN-PrabhatNeural`):
- **Rate (`+18%` to `+22%`):** Increases speech tempo to match modern short-form YouTube humor.
- **Pitch (`+6Hz` to `+10Hz`):** Gives the voice an energetic, youthful, lively character.
- **Phonetic Spelling for Cadence:**
  - Instead of standard spelling, stretch vowels when shouting:
    - `"Bhaiyaaaaa..."` instead of `"Bhaiya"`
    - `"Arreeee yaar!"` instead of `"Arrey yaar"`
    - `"Golgappeeee!"` instead of `"Golgappe"`

