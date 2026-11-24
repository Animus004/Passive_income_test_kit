import urllib.request
import urllib.parse
import json
import os

TOKEN = os.getenv('SKETCHFAB_API_KEY', '')
headers = {'Authorization': f'Token {TOKEN}'}

queries = [
    'egg robot',
    'capsule robot',
    'cute floating robot',
    'flying companion robot',
    'white robot',
    'chibi bot',
    'hovering bot',
    'cutting chai',
    'nehru jacket',
    'waistcoat'
]

results_map = {}

for q in queries:
    url = f'https://api.sketchfab.com/v3/search?type=models&q={urllib.parse.quote(q)}&downloadable=true&sort_by=-likeCount'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            items = []
            for r in results[:6]:
                thumb = None
                imgs = r.get('thumbnails', {}).get('images', [])
                if imgs:
                    thumb = imgs[-1].get('url')
                items.append({
                    'uid': r.get('uid'),
                    'name': r.get('name'),
                    'likes': r.get('likeCount'),
                    'faceCount': r.get('faceCount'),
                    'thumb': thumb
                })
            results_map[q] = items
            print(f"Query '{q}': {len(items)} results")
    except Exception as e:
        print(f"Error for '{q}': {e}")

out_path = 'D:/New folder (2)/data/sketchfab_extended_search.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(results_map, f, indent=2)

print(f"Done. Saved to {out_path}")
