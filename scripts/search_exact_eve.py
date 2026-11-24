import urllib.request
import urllib.parse
import json

TOKEN = os.getenv('SKETCHFAB_API_KEY', '')
HEADERS = {
    'Authorization': f'Token {TOKEN}',
    'User-Agent': 'Mozilla/5.0'
}

queries = [
    'eve walle',
    'eve pixar',
    'eva robot',
    'eva walle',
    'wall-e eve probe'
]

for q in queries:
    params = urllib.parse.urlencode({
        'type': 'models',
        'q': q,
        'downloadable': 'true',
        'sort_by': '-likeCount'
    })
    url = f'https://api.sketchfab.com/v3/search?{params}'
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"=== {q.upper()} (Found {len(data.get('results', []))}) ===")
            for m in data.get('results', [])[:5]:
                print(f"  * {m['name']} | UID: {m['uid']} | Likes: {m.get('likeCount')} | Verts: {m.get('vertexCount')}")
    except Exception as e:
        print(f"Error {q}: {e}")
