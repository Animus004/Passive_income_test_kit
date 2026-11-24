import urllib.request
import urllib.parse
import json

TOKEN = os.getenv('SKETCHFAB_API_KEY', '')
headers = {'Authorization': f'Token {TOKEN}'}

queries = [
    'light bulb',
    'incandescent bulb',
    'spring coil',
    'hover board',
    'hover disk',
    'robot companion'
]

results = {}

for q in queries:
    url = f"https://api.sketchfab.com/v3/search?type=models&q={urllib.parse.quote(q)}&downloadable=true&sort_by=-likeCount"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            items = []
            for r in data.get('results', [])[:6]:
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
            results[q] = items
            print(f"Query '{q}': {len(items)} results")
    except Exception as e:
        print(f"Error for '{q}': {e}")

with open("D:/New folder (2)/data/sketchfab_parts_search2.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("Saved parts search 2")
