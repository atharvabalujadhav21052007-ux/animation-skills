# -*- coding: utf-8 -*-
"""Batch Renderer for Notion-Style Motion Graphics Videos.
Renders 1080x1920 MP4 reels into E:\\New folder\\notion_animation\\
"""

import http.server
import json
import os
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).parent / "engine"
sys.path.append(str(ROOT))
sys.path.append("E:/faceless-shorts")

from notion_shots_generator import generate_notion_shots_js
from batch_engine.topics_catalog import TOPICS
from batch_engine.generate_audio_batch import generate_topic_audio

PROJECTS_DIR = Path("E:/faceless-shorts/batch_engine/projects")
OUTPUT_DIR = Path("E:/New folder/notion_animation")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, format, *args):
        pass

def render_topic_notion(page, topic, port, fps=30):
    topic_id = topic["id"]
    final_mp4 = OUTPUT_DIR / f"{topic_id}.mp4"

    if final_mp4.exists() and final_mp4.stat().st_size > 1000000:
        print(f"[SKIP] {final_mp4.name} already rendered.")
        return

    topic_dir = PROJECTS_DIR / topic_id
    meta_json = topic_dir / "meta.json"
    words_js = topic_dir / "words.js"
    wav_file = topic_dir / "narration.wav"

    if not (meta_json.exists() and words_js.exists() and wav_file.exists()):
        print(f"[AUDIO] Generating audio for {topic_id}...")
        try:
            generate_topic_audio(topic)
        except Exception as e:
            print(f"[ERROR] Audio generation failed for {topic_id}: {e}")
            return

    with open(meta_json, "r", encoding="utf-8") as f:
        meta = json.load(f)

    print(f"\n==========================================")
    print(f"Rendering Notion Video: {topic['title']}")
    print(f"Output: {final_mp4}")
    print(f"==========================================")

    # 1. Update engine files
    shots_code = generate_notion_shots_js(topic, meta)
    with open(ROOT / "shots.js", "w", encoding="utf-8") as f:
        f.write(shots_code)
    shutil.copyfile(words_js, ROOT / "words.js")

    # 2. Reload page
    url = f"http://127.0.0.1:{port}/template.html"
    page.goto(url)
    page.wait_for_function("() => window.renderAt && window.ready")

    duration = page.evaluate("() => window.DURATION")
    total_frames = int(duration * fps)
    print(f"Notion Project loaded: {duration:.2f}s, {total_frames} frames.")

    temp_silent = ROOT / "temp_silent_batch.mp4"
    ff_cmd = [
        'ffmpeg', '-y', '-v', 'error',
        '-f', 'image2pipe', '-framerate', str(fps),
        '-c:v', 'mjpeg', '-i', '-',
        '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18',
        '-pix_fmt', 'yuv420p', str(temp_silent)
    ]
    ff = subprocess.Popen(ff_cmd, stdin=subprocess.PIPE)

    t0 = time.time()
    for frame_idx in range(total_frames):
        cur_t = frame_idx / fps
        page.evaluate(f"(t) => window.renderAt({cur_t})")
        frame_jpg = page.screenshot(clip={'x': 0, 'y': 0, 'width': 1080, 'height': 1920}, type='jpeg', quality=93)
        ff.stdin.write(frame_jpg)

        if frame_idx % 90 == 0:
            elapsed = time.time() - t0
            fps_render = (frame_idx + 1) / max(0.1, elapsed)
            print(f"  Frame {frame_idx}/{total_frames} ({frame_idx/total_frames*100:.0f}%) [{fps_render:.1f} fps]")

    ff.stdin.close()
    ff.wait()

    # 3. Merge audio & level
    print("  Merging audio and leveling to -14 LUFS...")
    merge_cmd = [
        'ffmpeg', '-y', '-v', 'error',
        '-i', str(temp_silent),
        '-i', str(wav_file),
        '-map', '0:v', '-map', '1:a',
        '-c:v', 'copy',
        '-af', 'apad,loudnorm=I=-14:TP=-1.5',
        '-c:a', 'aac', '-b:a', '192k',
        '-shortest', str(final_mp4)
    ]
    subprocess.run(merge_cmd, check=True)
    if temp_silent.exists():
        temp_silent.unlink()

    print(f"  SUCCESS! Rendered: {final_mp4.name} ({final_mp4.stat().st_size / (1024*1024):.1f} MB)")

def main():
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    port = server.server_port
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()

    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=chrome_path,
            args=['--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars']
        )
        page = browser.new_page(viewport={'width': 1080, 'height': 1920})
        
        for topic in TOPICS:
            try:
                render_topic_notion(page, topic, port)
            except Exception as e:
                print(f"[ERROR] Rendering Notion {topic['id']}: {e}")
                import traceback
                traceback.print_exc()

        browser.close()
    server.shutdown()
    print("\nALL NOTION VIDEOS COMPLETED!")

if __name__ == "__main__":
    main()

