"""
Master Infographic Video Production Pipeline
Renders 3D Frames, Generates Studio Narration & Keyword Highlighted Subtitles, and Muxes Final 9:16 MP4.
"""

import os
import sys
import json
import asyncio
import subprocess
import edge_tts

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BLENDER_BIN = r"D:\Programs\blender\blender-4.3.0-windows-x64\blender.exe"
ARTIFACT_DIR = r"C:\Users\sayan\.gemini\antigravity\brain\f6352432-fa3c-4b63-acbf-21e7ecd31607"

SCRIPT_TEXT = """Imagine waking up and every single commercial flight in the United States is grounded.
It's only happened three times in modern history: September 11, January 2023, and right now.
Federal air traffic controllers keep planes safely separated across twenty-nine million square miles of airspace.
And their core communications network was designed in 2002.
That's older than the first iPhone, older than modern cloud computing, running on legacy hardware.
When data packet overload flooded the system at 3:30 PM, the failover crashed.
For over four hours, the entire nation was paralyzed: two hours and forty-four minutes of total gridlock.
The estimated cost to replace this aging infrastructure? Over fifty billion dollars."""

SUBTITLE_CUES = [
    (0.0, 4.2, "Imagine waking up and every single flight is {Y}grounded{W}."),
    (4.5, 12.0, "It's only happened {Y}three times{W} in modern history."),
    (12.3, 20.0, "Controllers keep planes safely separated across {Y}29 million{W} square miles."),
    (20.3, 29.5, "A network older than the first {Y}iPhone{W}."),
    (29.8, 38.0, "Data overload {Y}flooded{W} the system, causing total gridlock."),
    (38.3, 47.6, "The cost to replace it? Over {Y}$50,000,000,000{W} dollars.")
]

async def generate_narration(out_audio_path):
    print(f"🎙️ Generating Studio Voiceover: {out_audio_path}...")
    communicate = edge_tts.Communicate(SCRIPT_TEXT, voice="en-US-ChristopherNeural", rate="+4%")
    await communicate.save(out_audio_path)
    print("✅ Voiceover generated!")

def generate_highlighted_ass(out_ass_path):
    print(f"📝 Generating ASS Subtitles with Keyword Highlights: {out_ass_path}...")
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

    with open(out_ass_path, 'w', encoding='utf-8') as f:
        f.write(header + "\n".join(events) + "\n")
    print("✅ ASS Subtitles generated!")

def main():
    run_dir = os.path.join(PROJECT_ROOT, 'scratch', 'warroom_infographic')
    frames_dir = os.path.join(run_dir, 'frames')
    out_dir = os.path.join(PROJECT_ROOT, 'out', 'infographic_reels')
    os.makedirs(run_dir, exist_ok=True)
    os.makedirs(frames_dir, exist_ok=True)
    os.makedirs(out_dir, exist_ok=True)

    audio_path = os.path.join(run_dir, 'voiceover.wav')
    ass_path = os.path.join(run_dir, 'subtitles_highlight.ass')
    final_video = os.path.join(out_dir, 'faa_network_crash_infographic_reel.mp4')

    # 1. Voiceover
    asyncio.run(generate_narration(audio_path))

    # 2. Subtitles
    generate_highlighted_ass(ass_path)

    # 3. 3D Blender Frame Render
    director_script = os.path.join(PROJECT_ROOT, 'blender_engine', 'scripts', 'infographic_warroom_director.py')
    frame_pattern = os.path.join(frames_dir, 'frame_')
    total_frames = 1430

    print(f"\n🚀 Rendering 1,430 Frames in Blender EEVEE Next GPU...")
    cmd = [
        BLENDER_BIN, "-b", "-P", director_script, "--",
        "--frames", "--output", frame_pattern,
        "--total-frames", str(total_frames)
    ]
    res = subprocess.run(cmd)
    if res.returncode != 0:
        raise RuntimeError(f"Blender render failed with code {res.returncode}")

    # 4. Muxing with NVENC / x264
    print(f"\n🎞️ Muxing Frames with Voiceover & Highlighted Subtitles into MP4...")
    rel_input = os.path.relpath(os.path.join(frames_dir, 'frame_%04d.jpg'), PROJECT_ROOT).replace('\\', '/')
    rel_audio = os.path.relpath(audio_path, PROJECT_ROOT).replace('\\', '/')
    rel_ass = os.path.relpath(ass_path, PROJECT_ROOT).replace('\\', '/')

    mux_cmd = f'ffmpeg -y -framerate 30 -i "{rel_input}" -i "{rel_audio}" -vf "ass={rel_ass}" -c:v h264_nvenc -preset p5 -b:v 8M -c:a aac -b:a 192k -pix_fmt yuv420p "{final_video}"'
    try:
        subprocess.run(mux_cmd, shell=True, check=True)
    except Exception as e:
        print("Falling back to CPU x264...")
        mux_cmd = f'ffmpeg -y -framerate 30 -i "{rel_input}" -i "{rel_audio}" -vf "ass=\'{rel_ass}\'" -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k -pix_fmt yuv420p "{final_video}"'
        subprocess.run(mux_cmd, shell=True, check=True)

    # 5. Extract Verification Proof Stills
    proof_dir = os.path.join(run_dir, 'proof_stills')
    os.makedirs(proof_dir, exist_ok=True)
    for sec in [2, 8, 16, 25, 34, 43]:
        p_file = os.path.join(proof_dir, f'proof_{sec:02d}s.jpg')
        subprocess.run(['ffmpeg', '-y', '-ss', str(sec), '-i', final_video, '-vframes', '1', '-q:v', '2', p_file], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        art_file = os.path.join(ARTIFACT_DIR, f'warroom_proof_{sec:02d}s.jpg')
        try:
            import shutil
            shutil.copy2(p_file, art_file)
        except Exception:
            pass

    # Copy final mp4 to artifact directory
    art_mp4 = os.path.join(ARTIFACT_DIR, 'faa_network_crash_infographic_reel.mp4')
    try:
        import shutil
        shutil.copy2(final_video, art_mp4)
    except Exception:
        pass

    print(f"\n🎉 INFOGRAPHIC REEL COMPLETE: {final_video}")

if __name__ == "__main__":
    main()
