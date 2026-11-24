import os
import sys
import subprocess

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
OUT_DIR = os.path.join(PROJECT_ROOT, "out")

lang = sys.argv[1] if len(sys.argv) > 1 else "en"
is_hi = (lang == "hi")

voice_file = os.path.join(PUBLIC_DIR, f"voiceover_molasses_{lang}.mp3")
ambient_file = os.path.join(PUBLIC_DIR, "ambient.mp3")
out_audio = os.path.join(OUT_DIR, f"molasses_{lang}_mixed_audio.mp3")

# Get voiceover duration
dur_cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{voice_file}"'
duration = float(subprocess.check_output(dur_cmd, shell=True).decode().strip())

# Cut timings in frames @ 30fps
if is_hi:
    cuts = [0, 297, 726, 1084, 1292, 1500, 1706, 2065]
else:
    cuts = [0, 208, 596, 928, 1132, 1386, 1589, 1915]

sfx_cues = [
    ("sfx/whoosh.mp3", cuts[0], 0.35),
    ("sfx/sub_boom.mp3", cuts[0] + 18, 0.45),
    ("sfx/pen_scratch.mp3", cuts[1], 0.40),
    ("sfx/pop.mp3", cuts[1] + 20, 0.35),
    ("sfx/riser.mp3", cuts[2], 0.45),
    ("sfx/air_release.mp3", cuts[2] + 35, 0.40),
    ("sfx/laser.mp3", cuts[3], 0.40),
    ("sfx/pop.mp3", cuts[3] + 12, 0.45),
    ("sfx/stamp_thud.mp3", cuts[3] + 24, 0.50),
    ("sfx/sub_boom.mp3", cuts[4], 0.55),
    ("sfx/whoosh.mp3", cuts[4] + 8, 0.45),
    ("sfx/rail_friction_screech.wav", cuts[5], 0.40),
    ("sfx/train_track_rumble.wav", cuts[5] + 20, 0.35),
    ("sfx/stamp_thud.mp3", cuts[6], 0.45),
    ("sfx/thud.mp3", cuts[6] + 25, 0.40),
    ("sfx/thud.mp3", cuts[7], 0.45),
    ("sfx/pop.mp3", cuts[7] + 30, 0.40),
    ("sfx/blip.mp3", cuts[7] + 130, 0.35),
]

inputs = [
    "-i", voice_file.replace(os.sep, "/"),
    "-stream_loop", "-1", "-i", ambient_file.replace(os.sep, "/")
]

filter_parts = []
filter_parts.append(f"[0:a]volume=1.0[v0]")
filter_parts.append(f"[1:a]volume=0.06,atrim=0:{duration}[amb0]")

in_idx = 2
mix_inputs = ["[v0]", "[amb0]"]

for sfx_rel, frame_start, vol in sfx_cues:
    sfx_path = os.path.join(PUBLIC_DIR, sfx_rel).replace(os.sep, "/")
    if os.path.exists(sfx_path):
        delay_ms = int(round((frame_start / 30.0) * 1000))
        inputs.extend(["-i", sfx_path])
        filter_parts.append(f"[{in_idx}:a]volume={vol},adelay={delay_ms}|{delay_ms}[sfx{in_idx}]")
        mix_inputs.append(f"[sfx{in_idx}]")
        in_idx += 1

n_tracks = len(mix_inputs)
filter_parts.append(f"{''.join(mix_inputs)}amix=inputs={n_tracks}:duration=first:dropout_transition=2[outa]")

filter_complex = ";".join(filter_parts)

cmd = [
    "ffmpeg", "-y",
    *inputs,
    "-filter_complex", filter_complex,
    "-map", "[outa]",
    "-t", str(duration),
    "-c:a", "mp3",
    "-b:a", "192k",
    out_audio.replace(os.sep, "/")
]

print(f"Mixing {n_tracks} audio tracks via FFmpeg...")
subprocess.check_call(cmd)
print(f"🎉 Pristine Mixed Audio Generated in seconds: {out_audio}")
