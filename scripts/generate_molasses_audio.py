import os
import sys
import json
import asyncio
import subprocess
import edge_tts

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
TEMP_DIR_HI = os.path.join(PUBLIC_DIR, "temp_tts_molasses_hi")
TEMP_DIR_EN = os.path.join(PUBLIC_DIR, "temp_tts_molasses_en")
os.makedirs(TEMP_DIR_HI, exist_ok=True)
os.makedirs(TEMP_DIR_EN, exist_ok=True)

# 8 Narrative Beats: The Great Boston Molasses Tsunami of 1919
BEATS = [
    {
        "id": 1,
        "name": "The Impossible Hook",
        "en": "In 1919, a two-million-gallon wave of warm syrup drowned a city at thirty-five miles an hour.",
        "hi": "1919 mein, pachees lakh gallon meetha syrup paintis mile per hour ki speed se poore shahar ko baha le gaya!",
        "hinglish": "1919 mein, 25 lakh gallon meetha syrup 35 mph ki speed se poore shahar ko baha le gaya!"
    },
    {
        "id": 2,
        "name": "The Brown Paint Hack",
        "en": "The problem? The company built the giant steel tank way too thin. When locals complained that syrup was dripping through the seams, the company literally painted the entire tank brown so nobody could see the leaks.",
        "hi": "Lekin company ne tank ko itna patla banaya tha ki syrup tapakta rehta tha. Aur unhone is leak ko theek karne ke bajaye poore tank par dark brown paint laga diya taaki kisi ko leak dikhe hi na!",
        "hinglish": "Lekin company ne tank itna patla banaya tha ki syrup tapakta tha. Unhone is leak ko theek karne ke bajaye poore tank par brown paint laga diya taaki leak dikhe hi na!"
    },
    {
        "id": 3,
        "name": "The January Heatwave",
        "en": "Then, on January fifteenth, the temperature jumped thirty degrees in a few hours. The cold molasses began fermenting, releasing gas, and ballooning the internal pressure.",
        "hi": "Phir 15 January ko achanak dhoop nikli aur temperature tezi se badh gaya! Andar bhara syrup ferment hone laga aur gas ka pressure balloon ki tarah phool gaya!",
        "hinglish": "Phir 15 January ko achanak dhoop nikli aur temperature badh gaya! Andar bhara syrup ferment hone laga aur gas ka pressure balloon ki tarah phool gaya!"
    },
    {
        "id": 4,
        "name": "Machine-Gun Rivets",
        "en": "Chains groaned, the steel warped, and suddenly the heavy iron rivets sheared off like machine-gun fire.",
        "hi": "Lohe ki chains hilne lagi, aur achanak machine gun ki tarah lohe ke bolts hawa mein udne lage!",
        "hinglish": "Lohe ki chains hilne lagi, aur achanak machine gun ki tarah lohe ke bolts hawa mein udne lage!"
    },
    {
        "id": 5,
        "name": "The 25-Foot Tsunami",
        "en": "Two point three million gallons of sticky syrup exploded into the street as a twenty-five-foot tidal wave moving at thirty-five miles an hour.",
        "hi": "Aur achanak pachees lakh gallon ka ek pachees foot uncha sticky sailaab sadkon par nikal pada!",
        "hinglish": "Aur achanak 25 lakh gallon ka ek 25 foot uncha sticky sailaab sadkon par nikal pada!"
    },
    {
        "id": 6,
        "name": "The Buckling Tracks",
        "en": "It snapped elevated train tracks like matchsticks, flattened brick buildings, and knocked horses right off their feet.",
        "hi": "Isne train ki patriyan tod di, imaaratein gira di, aur logon ko sadak par hi chipka diya!",
        "hinglish": "Isne train ki patriyan tod di, imaaratein gira di, aur logon ko sadak par hi chipka diya!"
    },
    {
        "id": 7,
        "name": "Luckily / Unluckily",
        "en": "Luckily, it was sweet molasses, not boiling acid. Unluckily, cold molasses doesn't splash like water — it sets like wet concrete, gluing people to the sidewalk.",
        "hi": "Kismat achhi thi ki ye meetha syrup tha, koi acid nahi. Lekin kismat itni buri thi ki thanda hone par ye paani ke bajaye geeli cement ki tarah jam gaya!",
        "hinglish": "Kismat achhi thi ki ye meetha syrup tha. Lekin kismat itni buri thi ki thanda hone par ye paani ke bajaye geeli cement ki tarah jam gaya!"
    },
    {
        "id": 8,
        "name": "The Ketchup & Pancake Ending",
        "en": "You see, syrup is a non-Newtonian fluid. Ever banged a cold ketchup bottle? Nothing moves, until the whole bottle dumps on your plate at once. And even today, Boston locals swear that on a hot summer day, the old bricks still smell of pancakes.",
        "hi": "Ye non-Newtonian fluid tha — jaise ketchup ki bottle ko thoko toh pehle kuch nahi nikalta, fir achanak poora ketchup plate par gir jaata hai! Aur aaj bhi Boston ke log kehte hain ki garmiyon mein deewaron se pancakes ki khushboo aati hai!",
        "hinglish": "Ye non-Newtonian fluid tha — jaise ketchup ki bottle ko thoko toh pehle kuch nahi nikalta, fir achanak poora ketchup gir jaata hai! Aur aaj bhi Boston mein deewaron se pancakes ki khushboo aati hai!"
    }
]

sys.path.insert(0, os.path.join(PROJECT_ROOT, "scripts"))
from kokoro_tts import synthesize as kokoro_synthesize

# Audio Synthesis Configuration
VOICE_EN = "narrator" # Kokoro-82M High-Fidelity Local Voice (am_adam)
SPEED_EN = 1.02

VOICE_HI = "hi-IN-MadhurNeural"
RATE_HI = "+5%"
PITCH_HI = "+0Hz"

def get_duration(file_path):
    cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{file_path}"'
    res = subprocess.check_output(cmd, shell=True).decode().strip()
    return float(res)

async def synth_en_beat(idx, text):
    out_file = os.path.join(TEMP_DIR_EN, f"molasses_beat_{idx}.mp3")
    # Synthesize offline locally using Kokoro-82M
    res = kokoro_synthesize(text, voice_name=VOICE_EN, speed=SPEED_EN, out_path=out_file)
    return out_file

async def synth_hi_beat(idx, text):
    out_file = os.path.join(TEMP_DIR_HI, f"molasses_beat_hi_{idx}.mp3")
    comm = edge_tts.Communicate(text=text, voice=VOICE_HI, rate=RATE_HI, pitch=PITCH_HI)
    await comm.save(out_file)
    return out_file

async def generate_language(lang):
    is_hi = (lang == "hi")
    print(f"\n--- Generating Master Voiceover for: {lang.upper()} ---")
    
    beat_files = []
    all_words = []
    current_time = 0.0
    cut_timings = []
    
    for item in BEATS:
        idx = item["id"]
        text = item["hi"] if is_hi else item["en"]
        sub_text = item["hinglish"] if is_hi else item["en"]
        
        fpath = await (synth_hi_beat(idx, text) if is_hi else synth_en_beat(idx, text))
        dur = get_duration(fpath)
        beat_files.append(fpath)
        
        beat_start_frame = int(round(current_time * 30))
        beat_end_frame = int(round((current_time + dur + 0.120) * 30))
        
        cut_timings.append({
            "sceneIndex": idx,
            "name": item["name"],
            "startFrame": beat_start_frame,
            "endFrame": beat_end_frame,
            "startSec": round(current_time, 3),
            "endSec": round(current_time + dur, 3),
            "text": text,
            "subText": sub_text
        })
        
        words = sub_text.split()
        word_dur = dur / len(words)
        for w_idx, w in enumerate(words):
            w_start = round(current_time + (w_idx * word_dur), 3)
            w_end = round(w_start + word_dur, 3)
            all_words.append({
                "word": w,
                "start": w_start,
                "end": w_end
            })
            
        current_time += dur + 0.080  # Natural conversational breath pause
        
    total_duration = current_time
    total_frames = int(round(total_duration * 30))
    
    list_path = os.path.join(PUBLIC_DIR, f"concat_list_molasses_{lang}.txt")
    with open(list_path, "w", encoding="utf-8") as f:
        for bf in beat_files:
            f.write(f"file '{bf.replace(os.sep, '/')}'\n")
            
    master_mp3 = os.path.join(PUBLIC_DIR, f"voiceover_molasses_{lang}.mp3")
    concat_cmd = f'ffmpeg -y -f concat -safe 0 -i "{list_path.replace(os.sep, "/")}" -c copy "{master_mp3.replace(os.sep, "/")}"'
    subprocess.check_call(concat_cmd, shell=True)
    
    subs_path = os.path.join(PUBLIC_DIR, f"subtitles_molasses_{lang}.json")
    with open(subs_path, "w", encoding="utf-8") as f:
        json.dump(all_words, f, indent=2, ensure_ascii=False)
        
    print(f"✅ {lang.upper()} Master Generated: {master_mp3}")
    print(f"   Duration: {total_duration:.2f}s | Total Frames: {total_frames} @ 30fps")
    print(f"   Subtitles saved: {subs_path} ({len(all_words)} words)")
    
    return {
        "lang": lang,
        "masterMp3": master_mp3,
        "subsPath": subs_path,
        "totalFrames": total_frames,
        "totalDuration": total_duration,
        "cuts": cut_timings
    }

async def main():
    en_res = await generate_language("en")
    hi_res = await generate_language("hi")
    
    manifest = {
        "title": "The Great Boston Molasses Tsunami of 1919",
        "series": "Absurd History Anomalies",
        "en": en_res,
        "hi": hi_res,
        "totalFramesEn": en_res["totalFrames"],
        "totalFramesHi": hi_res["totalFrames"]
    }
    
    manifest_path = os.path.join(PROJECT_ROOT, "src", "data", "molasses_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        
    print(f"\n🎉 Molasses Tsunami Manifest saved to: {manifest_path}")

if __name__ == "__main__":
    asyncio.run(main())
