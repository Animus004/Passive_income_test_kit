import urllib.request
import json
import urllib.parse

TOKEN = os.getenv('SKETCHFAB_API_KEY', '')

queries = [
    'subway station environment',
    'cockpit interior',
    'airport runway',
    'train station interior',
    'power plant',
    'industrial factory scene',
    'cyberpunk city modular',
]

headers = {
    'Authorization': f'Token {TOKEN}',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

for q in queries:
    params = urllib.parse.urlencode({
        'q': q,
        'type': 'models',
        'downloadable': 'true',
        'sort_by': '-likeCount',
        'per_page': 2
    })
    url = f'https://api.sketchfab.com/v3/models?{params}'
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"=== Query: '{q}' (Total found: {data.get('totalCount', 0)}) ===")
            for m in data.get('results', []):
                uid = m['uid']
                name = m['name']
                likes = m.get('likeCount')
                verts = m.get('vertexCount')
                views = m.get('viewCount')
                print(f"  * {name} | UID: {uid} | Likes: {likes} | Verts: {verts:,}")
    except Exception as e:
        print(f"Error querying '{q}': {e}")
