import urllib.request
import urllib.parse
import json
import os

TOKEN = os.getenv('SKETCHFAB_API_KEY', '')
HEADERS = {
    'Authorization': f'Token {TOKEN}',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

def search_sketchfab(query, count=5):
    params = urllib.parse.urlencode({
        'type': 'models',
        'q': query,
        'downloadable': 'true',
        'sort_by': '-likeCount'
    })
    url = f'https://api.sketchfab.com/v3/search?{params}'
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            print(f"\n==========================================")
            print(f"QUERY: '{query}' (Found {len(results)} matches)")
            print(f"==========================================")
            items = []
            for m in results[:count]:
                uid = m.get('uid')
                name = m.get('name')
                likes = m.get('likeCount', 0)
                verts = m.get('vertexCount', 0)
                user = m.get('user', {}).get('displayName', 'Unknown')
                thumbs = m.get('thumbnails', {}).get('images', [])
                thumb_url = thumbs[0]['url'] if thumbs else ''
                print(f"  * {name}")
                print(f"    UID: {uid} | Likes: {likes} | Vertices: {verts} | Author: {user}")
                print(f"    Thumbnail: {thumb_url}")
                items.append({
                    'uid': uid,
                    'name': name,
                    'likes': likes,
                    'vertices': verts,
                    'author': user,
                    'thumb': thumb_url
                })
            return items
    except Exception as e:
        print(f"Error searching '{query}': {e}")
        return []

if __name__ == '__main__':
    queries = [
        "eve wall-e",
        "eve robot",
        "cute robot",
        "floating robot",
        "companion robot",
        "spring antenna",
        "hoverboard",
        "nehru jacket",
        "cutting chai"
    ]
    catalog = {}
    for q in queries:
        catalog[q] = search_sketchfab(q, count=4)
        
    out_file = r"D:\New folder (2)\data\desi_3d_library\sketchfab_puttar_candidates.json"
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2)
    print(f"\nSaved candidates to: {out_file}")
