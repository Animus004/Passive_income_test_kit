import urllib.request
import urllib.parse
import json

TOKEN = os.getenv('SKETCHFAB_API_KEY', '')
queries = ['Eve Wall-E', 'Eve Pixar', 'Cute Flying Robot', 'Drone Companion', 'Hover Ring']

for q in queries:
    params = urllib.parse.urlencode({'type': 'models', 'q': q, 'downloadable': 'true', 'sort_by': '-likeCount'})
    url = f'https://api.sketchfab.com/v3/search?{params}'
    req = urllib.request.Request(url, headers={'Authorization': f'Token {TOKEN}', 'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            d = json.loads(resp.read().decode('utf-8'))
            print(f"=== {q} ===")
            for m in d.get('results', [])[:4]:
                name = m.get('name')
                uid = m.get('uid')
                likes = m.get('likeCount')
                verts = m.get('vertexCount')
                print(f"  * {name} | UID: {uid} | Likes: {likes} | Verts: {verts}")
    except Exception as e:
        print(f"Error {q}: {e}")
