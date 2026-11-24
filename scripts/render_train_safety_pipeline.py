"""
Full Production Pipeline: High-Speed Train Collision & Automatic Braking Miracle
Topic: Systems & Hidden Engineering (LZB Automatic Train Control)
Duration: 56.62s (1,698 frames at 30 FPS)
Renders 1,698 Frames in Blender 4.3 EEVEE Next GPU,
Generates Keyword-Highlighted ASS Subtitles,
Muxes Full Video with NVENC, and Extracts Timeline Verification Stills.
"""

import os
import sys
import subprocess
import shutil

PROJECT_ROOT = r"D:\New folder (2)"
BLENDER_BIN = r"D:\Programs\blender\blender-4.3.0-windows-x64\blender.exe"
RUN_DIR = os.path.join(PROJECT_ROOT, "out", "train_safety")
FRAMES_DIR = os.path.join(RUN_DIR, "frames")
OUTPUT_VIDEO = os.path.join(RUN_DIR, "bullet_train_safety_reel.mp4")
AUDIO_FILE = os.path.join(PROJECT_ROOT, "scratch", "train_safety_narration_short.mp3")
ASS_FILE = os.path.join(RUN_DIR, "train_subtitles.ass")

SUBTITLE_CUES = [
    (0.0,   5.2,   "Two bullet trains are hurtling toward each other on the {Y}exact same track{W} at {Y}200 kilometers per hour{W}."),
    (5.2,   11.5,  "A {Y}human dispatcher error{W} left the track switch open, putting {Y}600 passengers{W} on a direct collision course."),
    (11.5,  17.0,  "At {Y}55 meters per second{W}, human eyes cannot see far enough to stop."),
    (17.0,  22.5,  "Bringing {Y}400 tons of steel{W} to a halt takes over {Y}two kilometers{W}. Human reflexes are useless."),
    (22.5,  30.5,  "But buried beneath the ballast lies an invisible safety net: {Y}LZB automatic train control{W}."),
    (30.5,  36.5,  "Every {Y}100 milliseconds{W}, inductive track cables calculate speed and braking physics."),
    (36.5,  45.0,  "{Y}Eighteen hundred meters out{W}, the computer overrides the driver, {Y}cuts traction power{W}, and slams {Y}electromagnetic track brakes{W} into the rails."),
    (45.0,  51.5,  "Both trains screeched to a halt with {Y}300 meters of clearance{W} to spare. {Y}Zero casualties{W}."),
    (51.5,  56.62, "That is the hidden engineering keeping high-speed rail the {Y}safest travel on Earth{W}."),
]

def generate_ass():
    os.makedirs(RUN_DIR, exist_ok=True)
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial Black,72,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,5,0,2,80,80,260,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []
    for start_s, end_s, text in SUBTITLE_CUES:
        m_s, s_s = divmod(start_s, 60)
        h_s, m_s = divmod(m_s, 60)
        start_ts = f"{int(h_s):d}:{int(m_s):02d}:{s_s:05.2f}"

        m_e, s_e = divmod(end_s, 60)
        h_e, m_e = divmod(m_e, 60)
        end_ts = f"{int(h_e):d}:{int(m_e):02d}:{s_e:05.2f}"

        styled_text = text.replace("{Y}", "{\\c&H00D7FF&\\b1}").replace("{W}", "{\\c&H00FFFFFF&\\b0}")
        events.append(f"Dialogue: 0,{start_ts},{end_ts},Default,,0,0,0,,{styled_text}")

    with open(ASS_FILE, 'w', encoding='utf-8') as f:
        f.write(header + "\n".join(events) + "\n")
    print(f"✅ Generated ASS Subtitles: {ASS_FILE}")

def render_3d():
    os.makedirs(FRAMES_DIR, exist_ok=True)
    director_script = os.path.join(PROJECT_ROOT, "blender_engine", "scripts", "bullet_train_safety_director.py")
    print(f"\n🚀 Rendering 1,698 Frames in Blender 4.3 EEVEE Next GPU...")
    cmd = [
        BLENDER_BIN, "-b", "-P", director_script, "--",
        FRAMES_DIR, "render"
    ]
    res = subprocess.run(cmd)
    if res.returncode != 0:
        raise RuntimeError("Blender render failed!")
    print("✅ All 1,698 Frames Rendered!")

def mux_final_video():
    print(f"\n🎞️ Muxing 1,698 Frames + Audio + Subtitles into MP4...")
    rel_input = os.path.join(FRAMES_DIR, "frame_%05d.png")
    rel_ass = os.path.relpath(ASS_FILE, PROJECT_ROOT).replace('\\', '/')

    cmd = (
        f'ffmpeg -y -framerate 30 -i "{rel_input}" -i "{AUDIO_FILE}" '
        f'-vf "ass=\'{rel_ass}\'" -c:v h264_nvenc -preset p4 -b:v 14M '
        f'-c:a aac -b:a 192k -pix_fmt yuv420p "{OUTPUT_VIDEO}"'
    )
    res = subprocess.run(cmd, shell=True)
    if res.returncode != 0:
        print("⚠️ NVENC failed, falling back to libx264...")
        cmd_cpu = (
            f'ffmpeg -y -framerate 30 -i "{rel_input}" -i "{AUDIO_FILE}" '
            f'-vf "ass=\'{rel_ass}\'" -c:v libx264 -crf 18 -preset fast '
            f'-c:a aac -b:a 192k -pix_fmt yuv420p "{OUTPUT_VIDEO}"'
        )
        subprocess.run(cmd_cpu, shell=True, check=True)

    print(f"\n🎉 Finished Final Reel: {OUTPUT_VIDEO}")

    brain_dir = r"C:\Users\sayan\.gemini\antigravity\brain\f6352432-fa3c-4b63-acbf-21e7ecd31607"
    if os.path.exists(brain_dir):
        dest_mp4 = os.path.join(brain_dir, "bullet_train_safety_reel.mp4")
        shutil.copy(OUTPUT_VIDEO, dest_mp4)
        print(f"✅ Copied to Artifacts: {dest_mp4}")

        for sec in [3, 10, 18, 32, 42, 50]:
            p_img = os.path.join(brain_dir, f"train_proof_{sec:02d}s.jpg")
            subprocess.run(['ffmpeg', '-y', '-ss', str(sec), '-i', OUTPUT_VIDEO, '-vframes', '1', '-q:v', '2', p_img],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"📸 Proof Still at {sec}s saved: {p_img}")

if __name__ == "__main__":
    generate_ass()
    render_3d()
    mux_final_video()
