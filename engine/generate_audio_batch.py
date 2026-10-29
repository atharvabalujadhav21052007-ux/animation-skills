# -*- coding: utf-8 -*-
"""Batch Audio & Captions Generator for 25 Topics using Gemini TTS.
Generates WAV audio + word-by-word timestamp files for both 2D Stick and 3D engines.
"""

import os
import sys
import json
import time
import re
import wave
from pathlib import Path

# Add root to sys.path
ROOT = Path(__file__).parent.parent.resolve()
sys.path.append(str(ROOT))

from scripts.gemini_voice import call_gemini_tts, DEFAULT_API_KEY
from batch_engine.topics_catalog import TOPICS

DATA_DIR = Path(__file__).parent / "projects"
DATA_DIR.mkdir(exist_ok=True, parents=True)

def generate_topic_audio(topic, api_key=DEFAULT_API_KEY):
    topic_id = topic["id"]
    out_dir = DATA_DIR / topic_id
    out_dir.mkdir(exist_ok=True, parents=True)

    wav_file = out_dir / "narration.wav"
    words_js_file = out_dir / "words.js"
    meta_json = out_dir / "meta.json"

    if wav_file.exists() and words_js_file.exists() and meta_json.exists():
        print(f"[SKIP] {topic_id} audio already exists.")
        return

    print(f"\n==========================================")
    print(f"Generating audio for [{topic['num']}/25]: {topic['title']}")
    print(f"==========================================")

    lead_sec = 0.4
    outro_sec = 0.8
    default_gap = 0.25
    rate = 24000  # 24kHz 16-bit mono

    lines_data = []
    words_data = []
    audio_segments = []
    current_time = lead_sec

    for i, line in enumerate(topic["lines"]):
        text = line["text"]
        emotion = line.get("emotion", "dramatic comedic")
        print(f"  Line {i+1}/{len(topic['lines'])}: \"{text[:45]}...\"")
        
        pcm_bytes = call_gemini_tts(text, api_key, topic.get("voice", "Puck"), f"Deliver this with {emotion}: ")
        duration = len(pcm_bytes) / (rate * 2)
        start_time = current_time
        end_time = current_time + duration

        lines_data.append({
            "i": i,
            "text": text,
            "start": round(start_time, 3),
            "end": round(end_time, 3)
        })

        # Calculate word weights
        tokens = text.split()
        if tokens:
            letters = [len(re.sub(r'[^A-Za-z0-9]', '', w)) or 1 for w in tokens]
            total_weight = sum(l + 2.0 for l in letters)
            cur_w_time = start_time
            for w, l in zip(tokens, letters):
                w_dur = duration * ((l + 2.0) / total_weight)
                w_start = cur_w_time
                w_end = min(end_time, cur_w_time + w_dur * 0.95)
                words_data.append({
                    "w": w,
                    "line": i,
                    "s": round(w_start, 3),
                    "e": round(w_end, 3)
                })
                cur_w_time += w_dur

        audio_segments.append((pcm_bytes, default_gap))
        current_time = end_time + default_gap
        time.sleep(2.5)  # Stay cleanly within RPM rate limits

    total_duration = current_time - default_gap + outro_sec

    # Write combined WAV
    lead_silence = b'\x00\x00' * int(rate * lead_sec)
    outro_silence = b'\x00\x00' * int(rate * outro_sec)

    with wave.open(str(wav_file), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(rate)
        wf.writeframes(lead_silence)
        for pcm, gap in audio_segments:
            wf.writeframes(pcm)
            wf.writeframes(b'\x00\x00' * int(rate * gap))
        wf.writeframes(outro_silence)

    # Write metadata JSON
    meta = {
        "id": topic_id,
        "title": topic["title"],
        "duration": round(total_duration, 3),
        "lines": lines_data
    }
    with open(meta_json, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    # Write words.js for the HTML5 canvas engines
    with open(words_js_file, "w", encoding="utf-8") as f:
        f.write(f"window.WORDS = {json.dumps(words_data, indent=2)};\n")
        f.write(f"window.DURATION = {total_duration:.3f};\n")

    print(f"  -> Generated {wav_file.name} ({total_duration:.2f}s, {len(words_data)} words)")

def main():
    print(f"Starting Batch Audio Generation for {len(TOPICS)} topics...")
    for topic in TOPICS:
        try:
            generate_topic_audio(topic)
        except Exception as e:
            print(f"[ERROR] Failed {topic['id']}: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    main()

