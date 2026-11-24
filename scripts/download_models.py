import urllib.request
import json
import os

TOKEN = os.getenv('SKETCHFAB_API_KEY', '')
headers = {'Authorization': f'Token {TOKEN}'}

uids = [
    ('c5b92c281dc444448e64c0607719c7a2', 'futuristic_flying_robot'),
    ('6b5b90dc52ae4933a103d0a71777ecbd', 'poddy_m1'),
    ('bc87e1579d544bbd9f7d132095e40e3d', 'indian_chai_glass'),
    ('c160fc11558142d7a456d8d1021c0a0e', 'chai_glass_indian_style')
]

download_dir = r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads"
os.makedirs(download_dir, exist_ok=True)

for uid, name in uids:
    url = f"https://api.sketchfab.com/v3/models/{uid}/download"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            gltf_info = data.get('gltf', {})
            dl_url = gltf_info.get('url')
            size = gltf_info.get('size', 0)
            print(f"[{name}] Download available: size={size} bytes")
            if dl_url:
                zip_path = os.path.join(download_dir, f"{name}.zip")
                urllib.request.urlretrieve(dl_url, zip_path)
                print(f"  -> Saved {zip_path} ({os.path.getsize(zip_path)} bytes)")
    except Exception as e:
        print(f"Error for {name} ({uid}): {e}")
