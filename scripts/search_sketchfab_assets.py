import urllib.request
import urllib.parse
import json
import os

TOKEN = os.getenv('SKETCHFAB_API_KEY', '')
headers = {'Authorization': f'Token {TOKEN}'}

queries = [
    'cute robot',
    'companion robot',
    'floating robot',
    'hover robot',
    'assistant robot',
    'eve robot',
    'chibi robot',
    'scifi drone',
    'hoverboard scifi',
    'spring antenna'
]

output_data = {}

for q in queries:
    url = f'https://api.sketchfab.com/v3/search?type=models&q={urllib.parse.quote(q)}&downloadable=true&sort_by=-likeCount'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            print(f'=== Query: {q} (Found {len(results)}) ===')
            parsed_list = []
            for r in results[:8]:
                thumb = 'none'
                imgs = r.get('thumbnails', {}).get('images', [])
                if imgs:
                    thumb = imgs[-1].get('url', 'none')
                
                item = {
                    'uid': r.get('uid'),
                    'name': r.get('name'),
                    'likes': r.get('likeCount'),
                    'faceCount': r.get('faceCount'),
                    'vertexCount': r.get('vertexCount'),
                    'thumb': thumb,
                    'isDownloadable': r.get('isDownloadable')
                }
                parsed_list.append(item)
                print(f"  [{r.get('uid')}] {r.get('name')} | likes: {r.get('likeCount')} | faces: {r.get('faceCount')}")
            output_data[q] = parsed_list
    except Exception as e:
        print(f'Error for {q}: {e}')

with open('D:/New folder (2)/data/sketchfab_search_results.json', 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2)

print("\nSaved search results to D:/New folder (2)/data/sketchfab_search_results.json")
