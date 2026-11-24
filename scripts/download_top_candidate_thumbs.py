import urllib.request
import urllib.parse
import json
import os

TOKEN = os.getenv('SKETCHFAB_API_KEY', '')
headers = {'Authorization': f'Token {TOKEN}'}

uids_to_check = [
    ("6b5b90dc52ae4933a103d0a71777ecbd", "Poddy_M1"),
    ("240c1f80db55416a99fa2ccd33da0efc", "Bot_Vipe"),
    ("7b75f204eb3e42b6babd883773e0789d", "Cute_Home_Robot"),
    ("c5b92c281dc444448e64c0607719c7a2", "Futuristic_Flying_Robot"),
    ("5773b360ade74da89746317b345f7d8b", "EVE_Ah"),
    ("12a83f8f84264a5989215a5408358871", "character_Eve"),
    ("a2e042f9e9e643db9705d0687f8db96f", "Capsule_bot"),
    ("a0bd28b7133648848427a5c27975611b", "360_Sphere_Robot"),
    ("7986dbee47cc43818a6e09dd4137b70f", "Companion_Robot_7986"),
    ("20dd7f7bdc9a4c36aef491f12afa14d8", "Floating_Robot_20dd")
]

thumb_dir = r"C:\Users\sayan\.gemini\antigravity\brain\f6352432-fa3c-4b63-acbf-21e7ecd31607\model_candidates"
os.makedirs(thumb_dir, exist_ok=True)

for uid, label in uids_to_check:
    url = f"https://api.sketchfab.com/v3/models/{uid}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            imgs = data.get('thumbnails', {}).get('images', [])
            if imgs:
                thumb_url = imgs[-1].get('url')
                dest = os.path.join(thumb_dir, f"{label}_{uid[:6]}.jpg")
                urllib.request.urlretrieve(thumb_url, dest)
                print(f"Downloaded {label} -> {dest}")
    except Exception as e:
        print(f"Failed {label} ({uid}): {e}")

print("Done downloading candidate thumbnails.")
