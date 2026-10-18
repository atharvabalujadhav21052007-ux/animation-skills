import http.server
import json
import os
import shutil
import sys
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(r"C:\Users\Atharva\.gemini\config\skills\notion-video\engine")
PROJECT = Path(r"E:\faceless-shorts\batch_engine\projects\01_moon_disappeared")

sys.path.append(str(ROOT))
from notion_shots_generator import generate_notion_shots_js

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, format, *args):
        pass

def main():
    with open(PROJECT / "meta.json", "r", encoding="utf-8") as f:
        meta = json.load(f)

    shots_code = generate_notion_shots_js(meta, meta)
    with open(ROOT / "shots.js", "w", encoding="utf-8") as f:
        f.write(shots_code)

    shutil.copyfile(PROJECT / "words.js", ROOT / "words.js")

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
        page.on('console', lambda msg: print('[page console]', msg.type, msg.text))
        page.on('pageerror', lambda err: print('[page error]', err.message))

        url = f"http://127.0.0.1:{port}/template.html"
        page.goto(url)
        page.wait_for_function("() => window.renderAt && window.ready")

        stills_dir = ROOT / "stills"
        stills_dir.mkdir(exist_ok=True)

        for ts in [1.5, 5.0, 12.0, 20.0, 32.0]:
            page.evaluate(f"(t) => window.renderAt({ts})")
            img_bytes = page.screenshot(clip={'x': 0, 'y': 0, 'width': 1080, 'height': 1920}, type='png')
            still_path = stills_dir / f"notion_t_{ts:.1f}.png"
            with open(still_path, "wb") as f:
                f.write(img_bytes)
            print(f"Captured: {still_path.name}")

        browser.close()
    server.shutdown()
    print("ALL NOTION STILLS CAPTURED!")

if __name__ == "__main__":
    main()

