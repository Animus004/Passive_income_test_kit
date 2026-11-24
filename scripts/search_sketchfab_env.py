import urllib.request
import json
import urllib.parse

TOKEN = os.getenv('SKETCHFAB_API_KEY', '')
queries = [
    'airplane cockpit',
    'airport runway hangar',
    'train track bridge',
    'server room data center',
    'factory warehouse industrial',
    'city street intersection',
    'subsea pipeline oil'
]

for q in queries:
    params = urllib.parse.urlencode({'type': 'models', 'q': q, 'downloadable': 'true', 'sort_by': '-likeCount'})
    url = f'https://api.sketchfab.com/v3/search?{params}'
    req = urllib.request.Request(url, headers={'Authorization': f'Token {TOKEN}', 'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"=== {q.upper()} (Found: {data.get('totalCount', len(data.get('results', [])))}) ===")
            for m in data.get('results', [])[:3]:
                print(f"  * {m['name']} | UID: {m['uid']} | Likes: {m.get('likeCount')}")
    except Exception as e:
        print(f"Error {q}: {e}")
