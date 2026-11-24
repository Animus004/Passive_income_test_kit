import urllib.request
import json
import os

TOKEN = os.getenv('SKETCHFAB_API_KEY', '')
HEADERS = {
    'Authorization': f'Token {TOKEN}',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

def download_model(uid, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    dl_endpoint = f'https://api.sketchfab.com/v3/models/{uid}/download'
    req = urllib.request.Request(dl_endpoint, headers=HEADERS)
    
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        
    print(f"Download formats for {uid}: {list(data.keys())}")
    
    # Prefer glb or gltf
    target_format = 'glb' if 'glb' in data else ('gltf' if 'gltf' in data else 'source')
    info = data[target_format]
    file_url = info['url']
    size_mb = round(info.get('size', 0) / (1024 * 1024), 2)
    ext = 'glb' if target_format == 'glb' else 'zip'
    dest_path = os.path.join(output_dir, f"{uid}_{target_format}.{ext}")
    
    print(f"Downloading {target_format.upper()} ({size_mb} MB) to {dest_path}...")
    urllib.request.urlretrieve(file_url, dest_path)
    print(f"Successfully downloaded: {dest_path} ({os.path.getsize(dest_path)} bytes)")
    return dest_path

if __name__ == '__main__':
    # Wall-E and Eve
    uid = 'a41f75a4af0142c680e1a26e904e5bec'
    out_dir = r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads"
    download_model(uid, out_dir)
