#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Studio-Grade Vertical Reel Automated E2E Verification Suite.

This script performs comprehensive end-to-end verification of rendered
vertical reels (specifically '01_moon_disappeared' and related 9:16 shorts)
against broadcast, platform, and project specifications.

Validation categories:
1. Container & Stream Integrity (MP4 format, faststart atom layout)
2. Video Resolution & Aspect Ratio (exact 1080x1920, 9:16, yuv420p)
3. Framerate & Codec (30.0 fps CFR, h264)
4. Audio Codec, Rate & Channels (aac, standard sample rate)
5. A/V Synchronization & Narration Alignment (sync delta <= 0.15s, duration >= 39.5s)
6. Broadcast Audio Loudness (EBU R128: -14 LUFS standard, TP <= -1.0 dBTP)
7. Dynamic Camera Motion & Zero-Freeze Verification (ffmpeg freezedetect n=0.003:d=1.5)
8. Black Frame Detection (ffmpeg blackdetect: no accidental cutouts)
9. Multi-Scene Visual Motion across 5 Narrative Beats (t=3.5s, 10.5s, 22.5s, 26.5s, 35.0s)
10. Boundary Frame Integrity (Frame 0 and Outro frame validity)

Usage:
    python batch_engine/verify_reel.py <video_file_path> [options]

Exit codes:
    0: All test assertions PASSED
    1: One or more test assertions FAILED
    2: Video file missing or fatal execution error
"""

import argparse
import io
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from PIL import Image

# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

@dataclass
class TestResult:
    test_id: str
    tier: int
    name: str
    description: str
    status: str  # "PASS", "FAIL", "WARN", "SKIP"
    actual: Any = None
    expected: Any = None
    details: str = ""


@dataclass
class VerificationReport:
    video_path: str
    passed_count: int = 0
    failed_count: int = 0
    warn_count: int = 0
    total_count: int = 0
    results: List[TestResult] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    execution_time_seconds: float = 0.0

    @property
    def is_success(self) -> bool:
        return self.failed_count == 0


# ---------------------------------------------------------------------------
# Reel Verifier Implementation
# ---------------------------------------------------------------------------

class ReelVerifier:
    def __init__(
        self,
        video_path: Path,
        narration_path: Optional[Path] = None,
        verbose: bool = False,
        strict: bool = False,
    ):
        self.video_path = video_path.resolve()
        self.narration_path = narration_path.resolve() if narration_path else None
        self.verbose = verbose
        self.strict = strict
        self.results: List[TestResult] = []
        self.ffprobe_data: Dict[str, Any] = {}
        self.video_stream: Dict[str, Any] = {}
        self.audio_stream: Dict[str, Any] = {}
        self.format_data: Dict[str, Any] = {}
        self.extracted_frames: Dict[float, np.ndarray] = {}

    def _log(self, msg: str) -> None:
        if self.verbose:
            print(f"  [DEBUG] {msg}")

    def _record(
        self,
        test_id: str,
        tier: int,
        name: str,
        description: str,
        passed: bool,
        actual: Any,
        expected: Any,
        details: str = "",
        is_warning: bool = False,
    ) -> bool:
        if passed:
            status = "PASS"
        elif is_warning and not self.strict:
            status = "WARN"
        else:
            status = "FAIL"

        res = TestResult(
            test_id=test_id,
            tier=tier,
            name=name,
            description=description,
            status=status,
            actual=actual,
            expected=expected,
            details=details,
        )
        self.results.append(res)
        sym = "✓" if status == "PASS" else ("⚠" if status == "WARN" else "✗")
        self._log(f"[{sym}] {test_id} - {name}: {status} (actual: {actual}, expected: {expected})")
        return passed

    # -----------------------------------------------------------------------
    # Helper Methods
    # -----------------------------------------------------------------------

    def _run_cmd(self, cmd: List[str], check: bool = False) -> subprocess.CompletedProcess:
        self._log(f"Executing: {' '.join(cmd)}")
        return subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=check,
            encoding="utf-8",
            errors="replace",
        )

    def _extract_frame(self, timestamp: float) -> Optional[np.ndarray]:
        if timestamp in self.extracted_frames:
            return self.extracted_frames[timestamp]

        cmd = [
            "ffmpeg",
            "-ss",
            f"{timestamp:.3f}",
            "-i",
            str(self.video_path),
            "-vframes",
            "1",
            "-f",
            "image2",
            "-c:v",
            "png",
            "pipe:1",
        ]
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if proc.returncode != 0 or not proc.stdout:
            self._log(f"Failed to extract frame at t={timestamp:.3f}s: {proc.stderr[:200]}")
            return None

        try:
            img = Image.open(io.BytesIO(proc.stdout))
            arr = np.array(img)
            self.extracted_frames[timestamp] = arr
            return arr
        except Exception as e:
            self._log(f"Image decode error at t={timestamp:.3f}s: {e}")
            return None

    # -----------------------------------------------------------------------
    # Verification Stages
    # -----------------------------------------------------------------------

    def verify_file_and_container(self) -> bool:
        """Tier 1: Verify file existence, size, container atoms, and faststart."""
        self._log("Verifying file and container headers...")
        
        # T1.01: Existence
        exists = self.video_path.exists() and self.video_path.is_file()
        self._record(
            test_id="T1.01",
            tier=1,
            name="File Existence",
            description="Video file must exist at specified location",
            passed=exists,
            actual=str(self.video_path) if exists else "NOT_FOUND",
            expected="Existing file",
        )
        if not exists:
            return False

        # T1.02: File Size
        size_bytes = self.video_path.stat().st_size
        size_mb = size_bytes / (1024 * 1024)
        size_valid = size_bytes >= 1_000_000  # At least 1 MB
        self._record(
            test_id="T1.02",
            tier=1,
            name="Non-Empty File Size",
            description="Rendered reel file size must be non-empty (>= 1.0 MB)",
            passed=size_valid,
            actual=f"{size_mb:.2f} MB ({size_bytes} bytes)",
            expected=">= 1.0 MB",
        )

        # Probe container using ffprobe
        probe_cmd = [
            "ffprobe",
            "-v", "error",
            "-show_format",
            "-show_streams",
            "-of", "json",
            str(self.video_path),
        ]
        probe_res = self._run_cmd(probe_cmd)
        if probe_res.returncode != 0:
            self._record(
                test_id="T1.03",
                tier=1,
                name="FFprobe Analysis",
                description="ffprobe must inspect container without error",
                passed=False,
                actual=f"Exit code {probe_res.returncode}",
                expected="Exit code 0",
                details=probe_res.stderr,
            )
            return False

        try:
            self.ffprobe_data = json.loads(probe_res.stdout)
        except json.JSONDecodeError as err:
            self._record(
                test_id="T1.03",
                tier=1,
                name="FFprobe JSON Parse",
                description="ffprobe output must be valid JSON",
                passed=False,
                actual="Invalid JSON",
                expected="Valid JSON",
                details=str(err),
            )
            return False

        self.format_data = self.ffprobe_data.get("format", {})
        streams = self.ffprobe_data.get("streams", [])
        for s in streams:
            if s.get("codec_type") == "video" and not self.video_stream:
                self.video_stream = s
            elif s.get("codec_type") == "audio" and not self.audio_stream:
                self.audio_stream = s

        # T1.03: Container format
        fmt_name = self.format_data.get("format_name", "")
        is_mp4 = "mp4" in fmt_name or "mov" in fmt_name
        self._record(
            test_id="T1.03",
            tier=1,
            name="Container Format",
            description="Container format must be MP4/MOV compatible",
            passed=is_mp4,
            actual=fmt_name,
            expected="mov,mp4,m4a,3gp,3g2,mj2",
        )

        # T1.04: Faststart / moov atom layout
        has_faststart = False
        try:
            with open(self.video_path, "rb") as f:
                header = f.read(500_000)
                moov_idx = header.find(b"moov")
                mdat_idx = header.find(b"mdat")
                if moov_idx != -1 and mdat_idx != -1:
                    has_faststart = moov_idx < mdat_idx
                elif moov_idx != -1:
                    has_faststart = True
        except Exception:
            pass

        self._record(
            test_id="T1.04",
            tier=1,
            name="Faststart Atom Layout",
            description="moov atom should precede mdat atom for instant mobile streaming",
            passed=has_faststart,
            actual="moov before mdat" if has_faststart else "moov after mdat / streaming unoptimized",
            expected="moov before mdat (+faststart)",
            is_warning=True,
        )

        return True

    def verify_video_stream(self) -> bool:
        """Tier 1: Verify video codec, 1080x1920 resolution, 9:16 DAR, 30fps CFR."""
        self._log("Verifying video stream attributes...")

        # T1.05: Video stream existence
        has_video = bool(self.video_stream)
        self._record(
            test_id="T1.05",
            tier=1,
            name="Video Stream Existence",
            description="Container must contain an active video stream",
            passed=has_video,
            actual="Found" if has_video else "Missing",
            expected="Found",
        )
        if not has_video:
            return False

        # T1.06: Video codec h264
        codec = self.video_stream.get("codec_name", "")
        self._record(
            test_id="T1.06",
            tier=1,
            name="Video Codec",
            description="Video stream codec must be h264 (AVC)",
            passed=codec.lower() == "h264",
            actual=codec,
            expected="h264",
        )

        # T1.07: Resolution Width (1080)
        width = int(self.video_stream.get("width", 0))
        self._record(
            test_id="T1.07",
            tier=1,
            name="Resolution Width",
            description="Video width must be exactly 1080 pixels",
            passed=width == 1080,
            actual=width,
            expected=1080,
        )

        # T1.08: Resolution Height (1920)
        height = int(self.video_stream.get("height", 0))
        self._record(
            test_id="T1.08",
            tier=1,
            name="Resolution Height",
            description="Video height must be exactly 1920 pixels",
            passed=height == 1920,
            actual=height,
            expected=1920,
        )

        # T1.09: Aspect Ratio 9:16 (0.5625)
        dar = self.video_stream.get("display_aspect_ratio", "")
        calc_ratio = (width / height) if height > 0 else 0
        ratio_valid = dar == "9:16" or abs(calc_ratio - (9.0 / 16.0)) < 0.001
        self._record(
            test_id="T1.09",
            tier=1,
            name="Aspect Ratio (9:16)",
            description="Aspect ratio must equal 9:16 (0.5625)",
            passed=ratio_valid,
            actual=f"{dar} ({calc_ratio:.4f})",
            expected="9:16 (0.5625)",
        )

        # T1.10: Frame Rate (30 fps CFR)
        r_fps = self.video_stream.get("r_frame_rate", "")
        avg_fps = self.video_stream.get("avg_frame_rate", "")
        fps_val = 0.0
        try:
            if "/" in avg_fps:
                num, den = avg_fps.split("/")
                fps_val = float(num) / float(den)
            else:
                fps_val = float(avg_fps)
        except Exception:
            pass

        fps_valid = (r_fps == "30/1" or abs(fps_val - 30.0) < 0.05)
        self._record(
            test_id="T1.10",
            tier=1,
            name="Frame Rate (30 fps CFR)",
            description="Video must be constant 30.0 frames per second",
            passed=fps_valid,
            actual=f"{avg_fps} ({fps_val:.2f} fps)",
            expected="30/1 (30.00 fps)",
        )

        # T1.11: Pixel Format
        pix_fmt = self.video_stream.get("pix_fmt", "")
        pix_valid = pix_fmt in ["yuv420p", "yuvj420p"]
        self._record(
            test_id="T1.11",
            tier=1,
            name="Pixel Format",
            description="Pixel format must be standard 8-bit YUV 4:2:0 planar",
            passed=pix_valid,
            actual=pix_fmt,
            expected="yuv420p or yuvj420p",
        )

        return True

    def verify_audio_stream(self) -> bool:
        """Tier 1: Verify audio codec (aac), channels, and sample rate."""
        self._log("Verifying audio stream attributes...")

        # T1.12: Audio stream existence
        has_audio = bool(self.audio_stream)
        self._record(
            test_id="T1.12",
            tier=1,
            name="Audio Stream Existence",
            description="Container must contain an active audio stream",
            passed=has_audio,
            actual="Found" if has_audio else "Missing",
            expected="Found",
        )
        if not has_audio:
            return False

        # T1.13: Audio codec aac
        codec = self.audio_stream.get("codec_name", "")
        self._record(
            test_id="T1.13",
            tier=1,
            name="Audio Codec",
            description="Audio stream codec must be aac",
            passed=codec.lower() == "aac",
            actual=codec,
            expected="aac",
        )

        # T1.14: Audio channels
        channels = int(self.audio_stream.get("channels", 0))
        chan_layout = self.audio_stream.get("channel_layout", "")
        chan_valid = channels >= 1
        self._record(
            test_id="T1.14",
            tier=1,
            name="Audio Channels",
            description="Audio stream must have at least 1 channel (mono or stereo)",
            passed=chan_valid,
            actual=f"{channels} channel(s) ({chan_layout})",
            expected=">= 1 channel",
        )

        # T1.15: Audio sample rate
        sample_rate = int(self.audio_stream.get("sample_rate", 0))
        rate_valid = sample_rate in [44100, 48000, 96000]
        self._record(
            test_id="T1.15",
            tier=1,
            name="Audio Sample Rate",
            description="Audio sample rate must conform to standard broadcast rates (44.1k/48k/96k)",
            passed=rate_valid,
            actual=f"{sample_rate} Hz",
            expected="48000 Hz or standard (44100/96000)",
        )

        return True

    def verify_durations_and_sync(self) -> bool:
        """Tier 1: Verify audio/video duration sync and match with narration."""
        self._log("Verifying durations and audio-video synchronization...")

        v_dur = float(self.video_stream.get("duration", self.format_data.get("duration", 0.0)))
        a_dur = float(self.audio_stream.get("duration", self.format_data.get("duration", 0.0)))

        # T1.16: A/V Sync Delta within 0.15s
        av_delta = abs(v_dur - a_dur)
        sync_valid = av_delta <= 0.15
        self._record(
            test_id="T1.16",
            tier=1,
            name="Audio-Video Sync Delta",
            description="Audio duration and video duration must match within 0.15s",
            passed=sync_valid,
            actual=f"Delta: {av_delta:.3f}s (V: {v_dur:.3f}s, A: {a_dur:.3f}s)",
            expected="Delta <= 0.150s",
        )

        # T1.17: Minimum Total Duration (>= 39.5s)
        dur_min_valid = v_dur >= 39.5
        self._record(
            test_id="T1.17",
            tier=1,
            name="Minimum Total Duration",
            description="Total video duration must be >= 39.5s (no premature cutoff)",
            passed=dur_min_valid,
            actual=f"{v_dur:.3f}s",
            expected=">= 39.500s",
        )

        # T1.18: Maximum Duration Bound (<= 40.5s)
        dur_max_valid = v_dur <= 40.5
        self._record(
            test_id="T1.18",
            tier=1,
            name="Maximum Total Duration",
            description="Total video duration must be <= 40.5s",
            passed=dur_max_valid,
            actual=f"{v_dur:.3f}s",
            expected="<= 40.500s",
        )

        # T1.19: Narration WAV Match
        ref_narration = self.narration_path
        if not ref_narration:
            default_wav = self.video_path.parent / "narration.wav"
            project_wav = Path("batch_engine/projects/01_moon_disappeared/narration.wav").resolve()
            if default_wav.exists():
                ref_narration = default_wav
            elif project_wav.exists():
                ref_narration = project_wav

        if ref_narration and ref_narration.exists():
            probe_wav = self._run_cmd([
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "json", str(ref_narration),
            ])
            try:
                wav_dur = float(json.loads(probe_wav.stdout)["format"]["duration"])
                wav_delta = abs(v_dur - wav_dur)
                wav_valid = wav_delta <= 0.50  # Within 0.50s of original voiceover
                self._record(
                    test_id="T1.19",
                    tier=1,
                    name="Narration Voiceover Match",
                    description=f"Duration matches voiceover reference '{ref_narration.name}' (~{wav_dur:.2f}s)",
                    passed=wav_valid,
                    actual=f"Video: {v_dur:.3f}s, Narration: {wav_dur:.3f}s (delta: {wav_delta:.3f}s)",
                    expected=f"~{wav_dur:.2f}s (delta <= 0.50s)",
                )
            except Exception as e:
                self._log(f"Failed to probe reference narration WAV: {e}")
        else:
            self._log("Reference narration WAV not specified or not found; skipping T1.19 comparison.")

        return True

    def verify_audio_loudness(self) -> bool:
        """Tier 1 & Tier 2: Verify broadcast audio loudness (-14 LUFS, TP <= -1.0 dBTP)."""
        self._log("Analyzing audio broadcast loudness via ffmpeg loudnorm...")

        cmd = [
            "ffmpeg",
            "-vn",
            "-i", str(self.video_path),
            "-af", "loudnorm=print_format=json",
            "-f", "null",
            "-",
        ]
        proc = self._run_cmd(cmd)
        stderr = proc.stderr

        match = re.search(r"\{\s*\"input_i\"\s*:\s*\"([^\"]+)\"[\s\S]*?\"input_tp\"\s*:\s*\"([^\"]+)\"[\s\S]*?\}", stderr)
        if not match:
            self._record(
                test_id="T1.20",
                tier=1,
                name="Loudness Measurement",
                description="ffmpeg loudnorm filter must produce loudness measurements",
                passed=False,
                actual="No loudnorm JSON found in stderr",
                expected="Valid EBU R128 JSON output",
            )
            return False

        try:
            # Parse loudnorm JSON block
            json_block = match.group(0)
            data = json.loads(json_block)
            input_i = float(data.get("input_i", -99.0))
            input_tp = float(data.get("input_tp", 99.0))
            input_lra = float(data.get("input_lra", 0.0))

            # T1.20: Integrated Loudness (-14 LUFS standard with broadcast tolerance [-17.5, -12.0])
            i_valid = -17.5 <= input_i <= -12.0
            self._record(
                test_id="T1.20",
                tier=1,
                name="Integrated Loudness (LUFS)",
                description="Audio integrated loudness conforms to digital broadcast standard (-14 LUFS nominal)",
                passed=i_valid,
                actual=f"{input_i:.2f} LUFS",
                expected="-14.0 LUFS (range: -17.5 to -12.0 LUFS)",
            )

            # T1.21: True Peak Limit (TP <= -1.0 dBTP)
            tp_valid = input_tp <= -1.00
            self._record(
                test_id="T1.21",
                tier=1,
                name="Maximum True Peak (dBTP)",
                description="Audio True Peak must not exceed -1.0 dBTP to avoid digital clipping",
                passed=tp_valid,
                actual=f"{input_tp:.2f} dBTP",
                expected="<= -1.0 dBTP",
            )

            # T1.22: Loudness Dynamic Range (LRA >= 1.0)
            lra_valid = input_lra >= 1.0
            self._record(
                test_id="T1.22",
                tier=1,
                name="Loudness Dynamic Range (LRA)",
                description="Audio dynamic range indicates active speech rather than silence or monotone tone",
                passed=lra_valid,
                actual=f"{input_lra:.2f} LU",
                expected=">= 1.0 LU",
            )
            return True
        except Exception as e:
            self._record(
                test_id="T1.20",
                tier=1,
                name="Loudness JSON Parsing",
                description="Parse loudnorm JSON data",
                passed=False,
                actual=str(e),
                expected="Successful parsing",
            )
            return False

    def verify_motion_freeze_and_blackouts(self) -> bool:
        """Tier 1: Verify dynamic camera motion (freezedetect) and zero black cutouts (blackdetect)."""
        self._log("Running ffmpeg freezedetect & blackdetect across entire video...")

        # Run single combined pass for high performance
        cmd = [
            "ffmpeg",
            "-i", str(self.video_path),
            "-vf", "freezedetect=n=0.003:d=1.5,blackdetect=d=0.5:pix_th=0.10",
            "-an",
            "-f", "null",
            "-",
        ]
        proc = self._run_cmd(cmd)
        stderr = proc.stderr

        # 1. Parse freezedetect: looking for frozen durations > 1.5s
        freeze_durations = [float(d) for d in re.findall(r"lavfi\.freezedetect\.freeze_duration:\s*([0-9\.]+)", stderr)]
        freeze_starts = [float(s) for s in re.findall(r"lavfi\.freezedetect\.freeze_start:\s*([0-9\.]+)", stderr)]
        
        # If any freeze duration > 1.5s
        long_freezes = [d for d in freeze_durations if d > 1.5]
        has_freeze_failure = len(long_freezes) > 0

        # T1.23: Dynamic camera motion (no freezes > 1.5s)
        self._record(
            test_id="T1.23",
            tier=1,
            name="Dynamic Camera Motion (Zero Freeze Intervals)",
            description="Assert 0 freeze intervals > 1.5 seconds via freezedetect=n=0.003:d=1.5",
            passed=not has_freeze_failure,
            actual=f"{len(long_freezes)} freeze interval(s) > 1.5s ({long_freezes})" if long_freezes else "0 frozen intervals (continuous motion)",
            expected="0 intervals > 1.5s",
        )

        # 2. Parse blackdetect: looking for black intervals
        v_dur = float(self.video_stream.get("duration", 39.7))
        black_matches = re.findall(
            r"black_start:([0-9\.]+)\s+black_end:([0-9\.]+)\s+black_duration:([0-9\.]+)",
            stderr,
        )
        # Accidental black screens before outro fade (ignore black screen in final 1.0s)
        accidental_blacks = []
        for start_s, end_s, dur_s in black_matches:
            st = float(start_s)
            dur = float(dur_s)
            if st < (v_dur - 1.0) and dur >= 0.5:
                accidental_blacks.append((st, dur))

        # T1.24: Black screen cutouts
        self._record(
            test_id="T1.24",
            tier=1,
            name="No Accidental Black Screen Cutouts",
            description="Assert no accidental black screen intervals (> 0.5s) prior to outro",
            passed=len(accidental_blacks) == 0,
            actual=f"{len(accidental_blacks)} black gaps: {accidental_blacks}" if accidental_blacks else "0 accidental black gaps",
            expected="0 accidental black gaps",
        )

        return True

    def verify_multiscene_visual_motion(self) -> bool:
        """Tier 1 & Tier 3: Verify visual motion and distinct scenes across the 5 narrative beats."""
        self._log("Sampling frames across 5 narrative beats for visual motion and distinctness...")

        # Narrative beat timestamps from PROJECT.md & dispatch:
        # Beat 1: t=3.5s (Moon vanishing transition)
        # Beat 2: t=10.5s (Tide collapse transition)
        # Beat 3: t=22.5s (Earth wobble transition)
        # Beat 4: t=26.5s (Equator spin transition)
        # Beat 5: t=35.0s (Nocturnal eyes transition)
        beats = [
            ("T1.25", 3.5, "Beat 1 (t=3.5s): Moon Vanishing Scene Motion"),
            ("T1.26", 10.5, "Beat 2 (t=10.5s): Tide Collapse Scene Motion"),
            ("T1.27", 22.5, "Beat 3 (t=22.5s): Earth Wobble Scene Motion"),
            ("T1.28", 26.5, "Beat 4 (t=26.5s): Equator Spin Scene Motion"),
            ("T1.29", 35.0, "Beat 5 (t=35.0s): Nocturnal Eyes Scene Motion"),
        ]

        beat_frames: List[Tuple[float, np.ndarray]] = []

        for test_id, timestamp, name in beats:
            f1 = self._extract_frame(timestamp)
            f2 = self._extract_frame(timestamp + 0.1)

            if f1 is None or f2 is None:
                self._record(
                    test_id=test_id,
                    tier=1,
                    name=name,
                    description=f"Extract and measure frame motion at t={timestamp}s",
                    passed=False,
                    actual="Frame extraction failed",
                    expected="Valid 1080x1920 RGB frame",
                )
                continue

            beat_frames.append((timestamp, f1))

            # Calculate local motion delta (Mean Absolute Error between t and t+0.1s)
            diff = np.abs(f1.astype(np.float32) - f2.astype(np.float32))
            motion_mae = float(np.mean(diff))

            # Motion must be non-zero (MAE >= 0.15 indicates active camera push-in or geometry animation)
            has_motion = motion_mae >= 0.15
            self._record(
                test_id=test_id,
                tier=1,
                name=name,
                description=f"Verify active visual motion at narrative timestamp t={timestamp:.1f}s",
                passed=has_motion,
                actual=f"Motion MAE: {motion_mae:.3f}",
                expected="Motion MAE >= 0.150",
            )

        # Inter-scene visual distinctness: compare consecutive beats
        # Beat 1 vs 2, Beat 2 vs 3, Beat 3 vs 4, Beat 4 vs 5
        if len(beat_frames) >= 2:
            scene_diffs = []
            all_distinct = True
            for i in range(len(beat_frames) - 1):
                t_a, frame_a = beat_frames[i]
                t_b, frame_b = beat_frames[i + 1]
                scene_mae = float(np.mean(np.abs(frame_a.astype(np.float32) - frame_b.astype(np.float32))))
                scene_diffs.append((f"{t_a:.1f}s vs {t_b:.1f}s", scene_mae))
                if scene_mae < 10.0:  # If scenes are less than 10 MAE apart, they are practically identical
                    all_distinct = False

            summary_str = ", ".join([f"{pair}: {mae:.1f}" for pair, mae in scene_diffs])
            self._record(
                test_id="T1.30",
                tier=1,
                name="Multi-Scene Visual Distinctness",
                description="Visual difference across narrative shot transitions must be substantial (MAE > 10.0)",
                passed=all_distinct,
                actual=summary_str,
                expected="All inter-scene deltas MAE > 10.0",
            )

        return True

    def verify_boundary_and_corner_cases(self) -> bool:
        """Tier 2: Frame 0 valid rendering, outro boundary, and safe framing."""
        self._log("Verifying boundary frames and safe zones...")

        # T2.01: Frame 0 (t=0.05s) valid rendering (non-blank)
        f0 = self._extract_frame(0.05)
        if f0 is not None:
            std_dev = float(np.std(f0))
            mean_val = float(np.mean(f0))
            is_clean = std_dev > 5.0 and mean_val > 1.0  # Not a blank black canvas
            self._record(
                test_id="T2.01",
                tier=2,
                name="Frame 0 Initial Render Integrity",
                description="First video frame (t=0.05s) must be cleanly rendered without blank screen",
                passed=is_clean,
                actual=f"Mean: {mean_val:.1f}, StdDev: {std_dev:.1f}",
                expected="StdDev > 5.0, Mean > 1.0 (Valid graphics)",
            )
        else:
            self._record(
                test_id="T2.01",
                tier=2,
                name="Frame 0 Initial Render Integrity",
                description="First video frame (t=0.05s) extraction",
                passed=False,
                actual="Failed to extract",
                expected="Valid frame",
            )

        # T2.02: Outro Frame (t=39.0s) validity
        v_dur = float(self.video_stream.get("duration", 39.7))
        t_outro = max(35.0, min(39.0, v_dur - 0.7))
        f_outro = self._extract_frame(t_outro)
        if f_outro is not None:
            std_outro = float(np.std(f_outro))
            outro_valid = std_outro > 3.0
            self._record(
                test_id="T2.02",
                tier=2,
                name="Outro Narrative Boundary Frame",
                description=f"Outro frame at t={t_outro:.1f}s retains rendering context before final cut",
                passed=outro_valid,
                actual=f"StdDev: {std_outro:.1f}",
                expected="StdDev > 3.0",
            )

        # T2.03: Frame decoding integrity test via ffmpeg null muxer
        cmd_decode = [
            "ffmpeg",
            "-v", "warning",
            "-i", str(self.video_path),
            "-f", "null",
            "-",
        ]
        res_decode = self._run_cmd(cmd_decode)
        has_errors = any(
            err_keyword in res_decode.stderr.lower()
            for err_keyword in ["corrupt", "invalid data", "error while decoding", "failed to decode"]
        )
        self._record(
            test_id="T2.03",
            tier=2,
            name="Full Frame Stream Decoding Integrity",
            description="Full video decode pass produces zero frame corruption warnings",
            passed=not has_errors,
            actual="No stream corruption detected" if not has_errors else res_decode.stderr[:150],
            expected="Clean stream decode without corruption",
        )

        return True

    def verify_cross_feature_and_scenarios(self) -> bool:
        """Tier 3 & Tier 4: Cross-feature combinations and real-world application playback."""
        self._log("Verifying cross-feature interaction and playback readiness...")

        # T3.01: Full continuous playback momentum across all 5 beats
        # Verified if T1.23, T1.25-T1.29 all passed
        beat_results = [r for r in self.results if r.test_id in ["T1.23", "T1.25", "T1.26", "T1.27", "T1.28", "T1.29"]]
        all_beats_moved = all(r.status == "PASS" for r in beat_results)
        self._record(
            test_id="T3.01",
            tier=3,
            name="Continuous Camera Momentum Across Cuts",
            description="Continuous motion operating across all narrative beats without any static holds",
            passed=all_beats_moved,
            actual="Active continuous motion verified" if all_beats_moved else "Motion interruption detected",
            expected="Continuous dynamic motion",
        )

        # T4.01: Mobile vertical platform compliance
        # Checks 1080x1920, 9:16, 30fps CFR, h264/aac
        core_checks = [r for r in self.results if r.test_id in ["T1.06", "T1.07", "T1.08", "T1.09", "T1.10", "T1.13"]]
        mobile_compliant = all(r.status == "PASS" for r in core_checks)
        self._record(
            test_id="T4.01",
            tier=4,
            name="Mobile Vertical Reel Platform Compliance",
            description="Format complies 100% with TikTok, YouTube Shorts, and Instagram Reels specifications",
            passed=mobile_compliant,
            actual="Fully compliant (1080x1920, 9:16, 30fps CFR, H.264/AAC)" if mobile_compliant else "Non-compliant attributes",
            expected="Full vertical platform compliance",
        )

        return True

    # -----------------------------------------------------------------------
    # Main Execution
    # -----------------------------------------------------------------------

    def run_all(self) -> VerificationReport:
        t0 = time.time()
        self._log(f"Starting E2E verification of reel: {self.video_path}")

        # Run verification pipeline
        if self.verify_file_and_container():
            self.verify_video_stream()
            self.verify_audio_stream()
            self.verify_durations_and_sync()
            self.verify_audio_loudness()
            self.verify_motion_freeze_and_blackouts()
            self.verify_multiscene_visual_motion()
            self.verify_boundary_and_corner_cases()
            self.verify_cross_feature_and_scenarios()

        elapsed = time.time() - t0
        passed_cnt = sum(1 for r in self.results if r.status == "PASS")
        failed_cnt = sum(1 for r in self.results if r.status == "FAIL")
        warn_cnt = sum(1 for r in self.results if r.status == "WARN")
        total_cnt = len(self.results)

        report = VerificationReport(
            video_path=str(self.video_path),
            passed_count=passed_cnt,
            failed_count=failed_cnt,
            warn_count=warn_cnt,
            total_count=total_cnt,
            results=self.results,
            metadata={
                "video_stream": self.video_stream,
                "audio_stream": self.audio_stream,
                "format": self.format_data,
            },
            execution_time_seconds=elapsed,
        )
        return report


# ---------------------------------------------------------------------------
# Formatting and Reporting
# ---------------------------------------------------------------------------

def print_terminal_report(report: VerificationReport) -> None:
    width = 80
    print("\n" + "=" * width)
    print(" " * 22 + "STUDIO-GRADE VERTICAL REEL VERIFIER")
    print("=" * width)
    print(f" Target Video : {report.video_path}")
    print(f" Total Tests  : {report.total_count}")
    print(f" Status       : {'PASSED' if report.is_success else 'FAILED'}")
    print(f" Summary      : {report.passed_count} Passed, {report.failed_count} Failed, {report.warn_count} Warnings")
    print(f" Time Elapsed : {report.execution_time_seconds:.2f} seconds")
    print("-" * width)
    print(f"{'ID':<7} | {'Tier':<4} | {'Test Name':<38} | {'Status':<6} | {'Details'}")
    print("-" * width)

    for r in report.results:
        status_disp = r.status
        actual_short = str(r.actual)
        if len(actual_short) > 28:
            actual_short = actual_short[:25] + "..."
        print(f"{r.test_id:<7} | T{r.tier:<3} | {r.name[:38]:<38} | {status_disp:<6} | {actual_short}")

    print("=" * width)
    if report.is_success:
        print(" >>> ALL REEL SPECIFICATIONS SATISFIED: VIDEO IS VERIFIED PRODUCTION READY <<<")
    else:
        print(" >>> VERIFICATION FAILED: ONE OR MORE REQUIRED CRITERIA NOT MET <<<")
    print("=" * width + "\n")


# ---------------------------------------------------------------------------
# CLI Entry Point
# ---------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(
        description="Studio-Grade Vertical Reel Automated E2E Verification Suite",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "video_path",
        nargs="?",
        default="batch_engine/projects/01_moon_disappeared/01_moon_disappeared_master.mp4",
        help="Path to the rendered vertical video file (.mp4)",
    )
    parser.add_argument(
        "--narration",
        default=None,
        help="Optional path to reference voiceover narration WAV file",
    )
    parser.add_argument(
        "--json-output",
        default=None,
        help="Save structured JSON verification report to file",
    )
    parser.add_argument(
        "--fallback",
        action="store_true",
        help="If default master is missing, attempt fallback to E:/New folder/3d_animation/01_moon_disappeared.mp4",
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose diagnostic debug logging",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Fail on warnings (e.g. streaming faststart atom position)",
    )

    args = parser.parse_args()
    vpath = Path(args.video_path)

    # Fallback support if requested or if default path doesn't exist yet
    if not vpath.exists():
        fallback_path = Path("E:/New folder/3d_animation/01_moon_disappeared.mp4")
        if args.fallback or (args.video_path == parser.get_default("video_path") and fallback_path.exists()):
            print(f"[INFO] Master at '{vpath}' not found, falling back to '{fallback_path}'")
            vpath = fallback_path

    if not vpath.exists():
        print(f"[ERROR] Target video file does not exist: {vpath}", file=sys.stderr)
        return 2

    narration_path = Path(args.narration) if args.narration else None
    verifier = ReelVerifier(
        video_path=vpath,
        narration_path=narration_path,
        verbose=args.verbose,
        strict=args.strict,
    )

    report = verifier.run_all()
    print_terminal_report(report)

    if args.json_output:
        out_p = Path(args.json_output)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        report_dict = {
            "video_path": report.video_path,
            "success": report.is_success,
            "passed": report.passed_count,
            "failed": report.failed_count,
            "warnings": report.warn_count,
            "total": report.total_count,
            "execution_time_seconds": report.execution_time_seconds,
            "results": [
                {
                    "test_id": r.test_id,
                    "tier": r.tier,
                    "name": r.name,
                    "description": r.description,
                    "status": r.status,
                    "actual": str(r.actual),
                    "expected": str(r.expected),
                    "details": r.details,
                }
                for r in report.results
            ],
        }
        with open(out_p, "w", encoding="utf-8") as f:
            json.dump(report_dict, f, indent=2)
        print(f"[INFO] JSON verification report saved to: {out_p}")

    return 0 if report.is_success else 1


if __name__ == "__main__":
    sys.exit(main())
