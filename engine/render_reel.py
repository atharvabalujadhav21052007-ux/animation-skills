# -*- coding: utf-8 -*-
"""Headless Chromium GPU Reel Renderer & FFmpeg Multiplexer.
Renders "What If the Moon Disappeared" at native 1080x1920 @ 30fps CFR,
pipes raw frames to FFmpeg, and multiplexes with broadcast-leveled narration audio.
"""

import http.server
import json
import os
import subprocess
import sys
import threading
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PROJECT_DIR = ROOT / "batch_engine" / "projects" / "01_moon_disappeared"
WEB_DIR = ROOT / "batch_engine" / "three_d_web"
OUTPUT_MP4 = PROJECT_DIR / "01_moon_disappeared_master.mp4"
TEMP_SILENT = PROJECT_DIR / "temp_silent_1080p.mp4"
WAV_PATH = PROJECT_DIR / "narration.wav"


class SilentHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format, *args):
        pass


def get_audio_duration(wav_path: Path) -> float:
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(wav_path)
    ]
    res = subprocess.check_output(cmd, text=True).strip()
    return float(res)


def render_master_reel():
    assert WAV_PATH.exists(), f"Audio file not found: {WAV_PATH}"
    duration = get_audio_duration(WAV_PATH)
    fps = 30
    total_frames = round(duration * fps)

    print(f"==================================================")
    print(f"Rendering Master Reel: What If the Moon Disappeared")
    print(f"Format: 1080x1920 (9:16) @ {fps} fps CFR")
    print(f"Duration: {duration:.3f} s -> Total Frames: {total_frames}")
    print(f"Target: {OUTPUT_MP4}")
    print(f"==================================================")

    # 1. Start local HTTP daemon
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), SilentHTTPHandler)
    port = server.server_port
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    print(f"-> Local HTTP server running on port {port}")

    if TEMP_SILENT.exists():
        TEMP_SILENT.unlink()

    # 2. Launch Playwright Chromium with GPU hardware acceleration
    browser_args = [
        '--enable-gpu',
        '--ignore-gpu-blocklist',
        '--hide-scrollbars',
        '--disable-infobars',
        '--no-default-browser-check'
    ]

    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    launch_kwargs = {'args': browser_args}
    if os.path.exists(chrome_path):
        launch_kwargs['executable_path'] = chrome_path

    t_start = time.time()
    with sync_playwright() as p:
        browser = p.chromium.launch(**launch_kwargs)
        page = browser.new_page(viewport={'width': 1080, 'height': 1920})
        page.on("pageerror", lambda err: print(f"  [PAGE ERROR] {err}"))
        page.on("console", lambda msg: print(f"  [CONSOLE {msg.type}] {msg.text}") if msg.type in ['error', 'warn'] else None)

        url = f"http://127.0.0.1:{port}/batch_engine/three_d_web/index.html?render=1"
        page.goto(url)
        page.wait_for_function("() => window.RENDER_READY === true", timeout=20000)
        print("-> WebGL Stage & Montserrat Typography Loaded Successfully.")

        # 3. Setup FFmpeg video stream encoder
        ff_cmd = [
            'ffmpeg', '-y', '-v', 'error',
            '-f', 'image2pipe', '-framerate', str(fps),
            '-c:v', 'mjpeg', '-i', '-',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17',
            '-pix_fmt', 'yuv420p', str(TEMP_SILENT)
        ]
        ff = subprocess.Popen(ff_cmd, stdin=subprocess.PIPE)

        print(f"-> Initiating deterministic frame capture (0 to {total_frames - 1})...")
        t_cap_start = time.time()
        for frame_idx in range(total_frames):
            cur_t = frame_idx / fps
            page.evaluate(f"(t) => window.renderAt({cur_t})", cur_t)
            frame_jpg = page.screenshot(
                clip={'x': 0, 'y': 0, 'width': 1080, 'height': 1920},
                type='jpeg',
                quality=95
            )
            ff.stdin.write(frame_jpg)

            if frame_idx % 60 == 0 or frame_idx == total_frames - 1:
                elapsed = time.time() - t_cap_start
                cur_fps = (frame_idx + 1) / max(0.01, elapsed)
                pct = (frame_idx + 1) / total_frames * 100.0
                eta = (total_frames - frame_idx - 1) / max(0.1, cur_fps)
                print(f"  Frame {frame_idx + 1:4d}/{total_frames} ({pct:5.1f}%) | "
                      f"Speed: {cur_fps:4.1f} fps | Elapsed: {elapsed:5.1f}s | ETA: {eta:4.1f}s")

        browser.close()
        ff.stdin.close()
        ff.wait()

    server.shutdown()
    render_time = time.time() - t_start
    print(f"-> Silent video stream rendered in {render_time:.1f} s ({TEMP_SILENT.stat().st_size / (1024*1024):.2f} MB)")

    # 4. Audio Multiplexing with professional broadcast loudness normalization
    print("-> Multiplexing audio narration with -14 LUFS normalization & 48kHz AAC resampling...")
    mux_cmd = [
        'ffmpeg', '-y', '-v', 'error',
        '-i', str(TEMP_SILENT),
        '-i', str(WAV_PATH),
        '-map', '0:v', '-map', '1:a',
        '-c:v', 'copy',
        '-af', 'apad,loudnorm=I=-14:TP=-1.5:LRA=11',
        '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
        '-shortest', '-movflags', '+faststart',
        str(OUTPUT_MP4)
    ]
    subprocess.run(mux_cmd, check=True)

    if TEMP_SILENT.exists():
        TEMP_SILENT.unlink()

    # Mirror copies to requested folders
    dest_final = ROOT / "01_moon_disappeared_final_master.mp4"
    dest_new_folder = Path(r"E:\New folder\3d_animation\01_moon_disappeared.mp4")
    dest_new_folder.parent.mkdir(parents=True, exist_ok=True)

    import shutil
    shutil.copy2(OUTPUT_MP4, dest_final)
    shutil.copy2(OUTPUT_MP4, dest_new_folder)
    print(f"-> Mirrored copy saved to: {dest_final}")
    print(f"-> Mirrored copy saved to: {dest_new_folder}")

    print(f"==================================================")
    print(f"MASTER REEL DELIVERY COMPLETE: {OUTPUT_MP4.name}")
    print(f"File Size: {OUTPUT_MP4.stat().st_size / (1024*1024):.2f} MB")
    print(f"==================================================")


if __name__ == "__main__":
    render_master_reel()
