"""Render the footer animation to a looping GIF.

Approach: shell out to headless Chrome to screenshot scripts/gif-capture.html at
N evenly-spaced animation phases, then Pillow stitches the PNGs into a GIF.

Usage:
    python scripts/build-gif.py                  # light theme, 180 frames, images/animation.gif
    python scripts/build-gif.py --theme dark     # dark theme variant, sandbox/animation-dark.gif
    python scripts/build-gif.py --combined       # one light cycle + one dark cycle, sandbox/animation-combined.gif

Output locations: the light GIF is tracked (referenced by README); dark / combined GIFs
go to sandbox/ (gitignored, local-only artifacts).
    python scripts/build-gif.py --frames 100     # override frame count (per cycle in combined mode)
    python scripts/build-gif.py --out path.gif   # override output path
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image


CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]

CYCLE_SECONDS = 12
WIDTH, HEIGHT = 800, 180


def find_browser() -> str:
    for path in CHROME_CANDIDATES:
        if Path(path).exists():
            return path
    raise SystemExit("No Chrome or Edge found in standard install locations.")


def capture_frame(browser: str, capture_url: str, out_png: Path) -> None:
    cmd = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--default-background-color=00000000",
        f"--window-size={WIDTH},{HEIGHT}",
        f"--screenshot={out_png}",
        capture_url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if not out_png.exists() or out_png.stat().st_size == 0:
        raise SystemExit(
            f"Chrome failed to write {out_png}.\n"
            f"stdout: {result.stdout}\nstderr: {result.stderr}"
        )


def build_gif(frames: list[Path], out_path: Path, fps: float) -> None:
    images = [Image.open(p).convert("RGBA") for p in frames]
    flattened = []
    for im in images:
        bg = Image.new("RGB", im.size, (240, 230, 211))
        bg.paste(im, mask=im.split()[3])
        flattened.append(bg.convert("P", palette=Image.Palette.ADAPTIVE, colors=256))

    duration_ms = int(round(1000 / fps))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    flattened[0].save(
        out_path,
        save_all=True,
        append_images=flattened[1:],
        duration=duration_ms,
        loop=0,
        optimize=True,
        disposal=2,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--frames", type=int, default=180, help="number of frames per cycle")
    parser.add_argument("--theme", choices=["light", "dark"], default="light")
    parser.add_argument("--combined", action="store_true",
                        help="render one light cycle + one dark cycle into a single GIF (2*frames total)")
    parser.add_argument("--out", type=Path, default=None, help="output gif path")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    capture_html = root / "scripts" / "gif-capture.html"
    if not capture_html.exists():
        raise SystemExit(f"Missing {capture_html}")

    if args.combined:
        themes_seq = ["light", "dark"]
        out_default = root / "sandbox" / "animation-combined.gif"
    elif args.theme == "dark":
        themes_seq = ["dark"]
        out_default = root / "sandbox" / "animation-dark.gif"
    else:
        themes_seq = ["light"]
        out_default = root / "images" / "animation.gif"

    out_path = args.out if args.out is not None else out_default
    out_path = out_path.resolve()

    browser = find_browser()
    total_frames = args.frames * len(themes_seq)
    fps = args.frames / CYCLE_SECONDS
    print(f"Browser: {browser}")
    print(f"Frames:  {args.frames} per cycle × {len(themes_seq)} cycle(s) = {total_frames} total")
    print(f"Themes:  {themes_seq}")
    print(f"Output:  {out_path}")

    with tempfile.TemporaryDirectory(prefix="gif-frames-") as tmp:
        tmp_dir = Path(tmp)
        frame_paths: list[Path] = []
        capture_uri = capture_html.resolve().as_uri()

        idx = 0
        for theme in themes_seq:
            for i in range(args.frames):
                t = i / args.frames
                url = f"{capture_uri}?t={t:.6f}&theme={theme}"
                png = tmp_dir / f"frame_{idx:04d}.png"
                capture_frame(browser, url, png)
                frame_paths.append(png)
                print(f"  frame {idx + 1}/{total_frames}  theme={theme}  t={t:.3f}", flush=True)
                idx += 1

        print("Encoding GIF...")
        build_gif(frame_paths, out_path, fps)

    size_kb = out_path.stat().st_size / 1024
    print(f"Done. {out_path}  ({size_kb:.1f} KB, {total_frames} frames @ {fps:.2f} fps)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
