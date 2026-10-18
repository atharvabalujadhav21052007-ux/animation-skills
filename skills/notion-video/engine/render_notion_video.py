# -*- coding: utf-8 -*-
"""Notion Video Reel High-Speed Renderer (1080x1920 @ 30fps).
Renders interactive Notion motion graphics and merges with Gemini TTS audio.
"""

import argparse
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

ROOT = Path(__file__).parent.resolve()
sys.path.append(str(ROOT))

from notion_shots_generator import generate_notion_shots_js

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, format, *args):
        pass

def render_notion_reel(meta_file, words_file, audio_file, output_mp4, fps=30):
    output_mp4 = Path(output_mp4).resolve()
    output_mp4.parent.mkdir(parents=True, exist_ok=True)

    with open(meta_file, "r", encoding="utf-8") as f:
        meta = json.load(f)

    # 1. Generate shots.js
    shots_code = generate_notion_shots_js(meta, meta)
    with open(ROOT / "shots.js", "w", encoding="utf-8") as f:
        f.write(shots_code)

    # 2. Copy words.js into engine
    shutil.copyfile(words_file, ROOT / "words.js")

    # 3. Start local server
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    port = server.server_port
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()

    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    print(f"\n==========================================")
    print(f"Rendering Notion Motion Video: {meta.get('title', 'Notion Reel')}")
    print(f"Output: {output_mp4}")
    print(f"==========================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=chrome_path,
            args=['--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars']
        )
        page = browser.new_page(viewport={'width': 1080, 'height': 1920})
        
        url = f"http://127.0.0.1:{port}/template.html"
        page.goto(url)
        page.wait_for_function("() => window.renderAt && window.ready")

        duration = page.evaluate("() => window.DURATION")
        total_frames = int(duration * fps)
        print(f"Notion Engine Loaded: {duration:.2f}s, {total_frames} frames.")

        temp_silent = ROOT / "temp_silent_notion.mp4"
        ff_cmd = [
            'ffmpeg', '-y', '-v', 'error',
            '-f', 'image2pipe', '-framerate', str(fps),
            '-c:v', 'mjpeg', '-i', '-',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17',
            '-pix_fmt', 'yuv420p', str(temp_silent)
        ]
        ff = subprocess.Popen(ff_cmd, stdin=subprocess.PIPE)

        t0 = time.time()
        for frame_idx in range(total_frames):
            cur_t = frame_idx / fps
            page.evaluate(f"(t) => window.renderAt({cur_t})")
            frame_jpg = page.screenshot(clip={'x': 0, 'y': 0, 'width': 1080, 'height': 1920}, type='jpeg', quality=95)
            ff.stdin.write(frame_jpg)

            if frame_idx % 90 == 0:
                elapsed = time.time() - t0
                fps_render = (frame_idx + 1) / max(0.1, elapsed)
                print(f"  Frame {frame_idx}/{total_frames} ({frame_idx/total_frames*100:.0f}%) [{fps_render:.1f} fps]")

        ff.stdin.close()
        ff.wait()

        # 4. Merge audio and level to -14 LUFS
        print("  Merging Gemini TTS narration and leveling audio...")
        merge_cmd = [
            'ffmpeg', '-y', '-v', 'error',
            '-i', str(temp_silent),
            '-i', str(audio_file),
            '-map', '0:v', '-map', '1:a',
            '-c:v', 'copy',
            '-af', 'apad,loudnorm=I=-14:TP=-1.5',
            '-c:a', 'aac', '-b:a', '192k',
            '-shortest', str(output_mp4)
        ]
        subprocess.run(merge_cmd, check=True)
        if temp_silent.exists():
            temp_silent.unlink()

        print(f"  NOTION VIDEO REEL COMPLETE: {output_mp4.name} ({output_mp4.stat().st_size / (1024*1024):.1f} MB)")
        browser.close()
    server.shutdown()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--meta", required=True, help="Path to meta.json")
    parser.add_argument("--words", required=True, help="Path to words.js")
    parser.add_argument("--audio", required=True, help="Path to narration.wav")
    parser.add_argument("--out", required=True, help="Output MP4 path")
    args = parser.parse_args()

    render_notion_reel(args.meta, args.words, args.audio, args.out)

if __name__ == "__main__":
    main()

