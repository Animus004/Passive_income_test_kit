import os
import sys
import json
import zipfile
import urllib.request
import urllib.parse
import time

SKETCHFAB_API_KEY = os.getenv("SKETCHFAB_API_KEY", "")
BASE_DIR = r"D:\New folder (2)"
DOWNLOADS_DIR = os.path.join(BASE_DIR, "assets", "downloads")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

HEADERS = {
    "Authorization": f"Token {SKETCHFAB_API_KEY}",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

def search_models(query, count=5):
    params = urllib.parse.urlencode({
        "type": "models",
        "q": query,
        "downloadable": "true",
        "sort_by": "-likeCount",
        "per_page": count
    })
    url = f"https://api.sketchfab.com/v3/search?{params}"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        results = []
        for m in data.get("results", []):
            results.append({
                "uid": m["uid"],
                "name": m["name"],
                "like_count": m.get("likeCount", 0),
                "vertex_count": m.get("vertexCount", 0),
                "face_count": m.get("faceCount", 0),
                "thumbnails": [img["url"] for img in m.get("thumbnails", {}).get("images", [])]
            })
        return results

def download_model(uid, model_name="model"):
    safe_name = "".join(c if c.isalnum() or c in "._-" else "_" for c in model_name)[:40]
    target_dir = os.path.join(DOWNLOADS_DIR, f"{safe_name}_{uid[:8]}")
    
    # Check if already downloaded
    if os.path.exists(target_dir):
        for root, dirs, files in os.walk(target_dir):
            for f in files:
                if f.lower().endswith(('.glb', '.gltf')):
                    return os.path.join(root, f)
    
    os.makedirs(target_dir, exist_ok=True)
    
    # Get download link
    dl_api_url = f"https://api.sketchfab.com/v3/models/{uid}/download"
    req = urllib.request.Request(dl_api_url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as resp:
            dl_info = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 429:
            print("Rate limit hit on download. Waiting 5s...")
            time.sleep(5)
            with urllib.request.urlopen(req) as resp:
                dl_info = json.loads(resp.read().decode("utf-8"))
        else:
            raise e
            
    # Prefer glb, then gltf, then source
    target_format = None
    if "glb" in dl_info:
        target_format = "glb"
    elif "gltf" in dl_info:
        target_format = "gltf"
    elif "source" in dl_info:
        target_format = "source"
    else:
        raise ValueError(f"No usable 3D format in download info: {list(dl_info.keys())}")
        
    download_url = dl_info[target_format]["url"]
    temp_file = os.path.join(target_dir, f"raw_download.{target_format}")
    
    print(f"Downloading {model_name} ({target_format})...")
    dl_req = urllib.request.Request(download_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(dl_req) as src, open(temp_file, "wb") as dst:
        dst.write(src.read())
        
    # Check if it's a zip or direct glb
    with open(temp_file, "rb") as f:
        magic = f.read(4)
        
    final_model_path = None
    if magic == b"glTF":
        final_model_path = os.path.join(target_dir, f"{safe_name}.glb")
        if os.path.exists(final_model_path):
            os.remove(final_model_path)
        os.rename(temp_file, final_model_path)
        print(f"Direct GLB detected: {final_model_path}")
    elif magic == b"PK\x03\x04":
        print(f"Extracting zip archive: {temp_file}...")
        with zipfile.ZipFile(temp_file, 'r') as zip_ref:
            zip_ref.extractall(target_dir)
        try:
            os.remove(temp_file)
        except Exception:
            pass
        # Find extracted glb/gltf
        for root, dirs, files in os.walk(target_dir):
            for f in files:
                if f.lower().endswith(('.glb', '.gltf')):
                    final_model_path = os.path.join(root, f)
                    break
            if final_model_path:
                break
    else:
        final_model_path = temp_file
        
    print(f"✅ Ready: {final_model_path}")
    return final_model_path

if __name__ == "__main__":
    turbine_dir = r"D:\New folder (2)\assets\downloads\Turbine___Turbofan_Engine___Jet_Engine_74c6acee"
    raw_zip = os.path.join(turbine_dir, "model_glb.zip")
    if os.path.exists(raw_zip):
        glb_dest = os.path.join(turbine_dir, "jet_turbofan_engine.glb")
        is_gltf = False
        with open(raw_zip, "rb") as f:
            if f.read(4) == b"glTF":
                is_gltf = True
        if is_gltf:
            if os.path.exists(glb_dest):
                os.remove(glb_dest)
            os.rename(raw_zip, glb_dest)
            print(f"Converted raw_zip to {glb_dest} ({os.path.getsize(glb_dest):,} bytes)")
