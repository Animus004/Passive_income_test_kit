import json
import urllib.request
import os

f1 = 'D:/New folder (2)/data/sketchfab_search_results.json'
f2 = 'D:/New folder (2)/data/sketchfab_extended_search.json'

data1 = json.load(open(f1, 'r', encoding='utf-8'))
data2 = json.load(open(f2, 'r', encoding='utf-8'))

all_candidates = {}

for cat, lst in list(data1.items()) + list(data2.items()):
    for item in lst:
        uid = item.get('uid')
        if uid and uid not in all_candidates:
            all_candidates[uid] = item
            all_candidates[uid]['category'] = cat

print(f"Total unique candidates: {len(all_candidates)}")

# Sort by likes
sorted_cand = sorted(all_candidates.values(), key=lambda x: x.get('likes', 0), reverse=True)

thumb_dir = r"C:\Users\sayan\.gemini\antigravity\brain\f6352432-fa3c-4b63-acbf-21e7ecd31607\thumbs"
os.makedirs(thumb_dir, exist_ok=True)

print("\n--- TOP CANDIDATES ---")
for i, c in enumerate(sorted_cand[:25]):
    uid = c['uid']
    name = c['name']
    likes = c['likes']
    faces = c['faceCount']
    cat = c['category']
    thumb = c.get('thumb')
    print(f"{i+1}. [{uid}] '{name}' ({likes} likes, {faces} faces) - query: {cat}")
    
    # Download thumbnail if available
    if thumb and thumb != 'none':
        t_ext = '.jpg'
        t_path = os.path.join(thumb_dir, f"{i+1}_{uid[:8]}_{name.replace(' ', '_')[:20]}{t_ext}")
        # sanitize filename
        t_path = "".join([c for c in t_path if c.isalpha() or c.isdigit() or c in ' :\\/._-'])
        try:
            if not os.path.exists(t_path):
                urllib.request.urlretrieve(thumb, t_path)
                print(f"   -> downloaded thumb: {os.path.basename(t_path)}")
        except Exception as e:
            print(f"   -> failed to download thumb: {e}")
