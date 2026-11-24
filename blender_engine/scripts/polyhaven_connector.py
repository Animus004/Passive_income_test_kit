"""
Poly Haven CC0 HDRI Auto-Fetcher and Caching Engine
Fetches 360-degree environment HDRIs via the public Poly Haven API.
Zero authentication required (CC0 Public Domain).
"""

import os
import sys
import json
import urllib.request
import urllib.parse

CACHE_DIR = r"D:\New folder (2)\scratch\assets_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

# Pre-mapped high quality Poly Haven HDRIs for common narrative settings
CURATED_HDRIS = {
    "cafe": "comfy_cafe",
    "coffee": "comfy_cafe",
    "desk": "modern_buildings_night",
    "night": "modern_buildings_night",
    "latenight": "modern_buildings_night",
    "living_room": "warm_restaurant",
    "couch": "warm_restaurant",
    "datacenter": "modern_buildings_night",
    "office": "studio_small_08",
    "corporate": "studio_small_08",
    "workplace": "studio_small_08",
    "street": "kloppenheim_06",
    "walk": "kloppenheim_06",
    "daylight": "kloppenheim_06",
    "sunset": "sunset_in_the_chalk_quarry",
    "rooftop": "sunset_in_the_chalk_quarry",
    "studio": "studio_small_08",
    "space": "modern_buildings_night",
    "sci-fi": "modern_buildings_night",
    "spaceship": "modern_buildings_night",
    "mars": "sunset_in_the_chalk_quarry",
    "desert": "sunset_in_the_chalk_quarry",
    "beach": "kloppenheim_06",
    "garden": "kloppenheim_06",
    "park": "kloppenheim_06",
}

def get_hdri_download_url(asset_id, resolution="1k"):
    """Gets direct download URL for 1k HDR from Poly Haven."""
    return f"https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/{resolution}/{asset_id}_{resolution}.hdr"

def fetch_hdri_for_theme(theme_query, resolution="1k"):
    """
    Finds and downloads a matching 360 HDRI for a theme query.
    Returns the absolute path to the local .hdr file.
    """
    theme = theme_query.lower()
    
    # 1. Match curated mapping
    selected_id = None
    for kw, asset_id in CURATED_HDRIS.items():
        if kw in theme:
            selected_id = asset_id
            break
            
    if not selected_id:
        selected_id = "comfy_cafe" # Fallback to warm interior

    # Check local engine assets first
    local_street = r"D:\New folder (2)\blender_engine\assets\hdri\wide_street_01_1k.hdr"
    if any(k in theme for k in ["street", "walk", "suburb", "road"]) and os.path.exists(local_street):
        print(f"📦 [Poly Haven] Using local urban street HDRI: {local_street}")
        return local_street

    target_path = os.path.join(CACHE_DIR, f"{selected_id}_{resolution}.hdr")
    
    # Check if already cached
    if os.path.exists(target_path) and os.path.getsize(target_path) > 100000:
        print(f"📦 [Poly Haven] Using cached HDRI: {target_path}")
        return target_path

    # Download
    url = get_hdri_download_url(selected_id, resolution)
    print(f"⬇️ [Poly Haven] Downloading HDRI '{selected_id}' ({resolution}) from: {url}")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req) as resp, open(target_path, "wb") as f:
            f.write(resp.read())
        print(f"✅ [Poly Haven] HDRI downloaded: {target_path} ({os.path.getsize(target_path):,} bytes)")
        return target_path
    except Exception as e:
        print(f"⚠️ [Poly Haven] Download failed ({e}), checking fallback...")
        fallback = os.path.join(CACHE_DIR, "comfy_cafe_1k.hdr")
        if os.path.exists(fallback):
            return fallback
        raise e

if __name__ == "__main__":
    test_theme = sys.argv[1] if len(sys.argv) > 1 else "night"
    hdr_file = fetch_hdri_for_theme(test_theme)
    print("Resolved HDR:", hdr_file)
