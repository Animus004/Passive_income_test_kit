import sys
import os
sys.path.append(os.path.abspath("."))
from blender_engine.scripts.sketchfab_connector import search_models

queries = ['pine tree pack', 'mountain landscape', 'city building pack']
for q in queries:
    res = search_models(q, count=3)
    print(f"=== {q.upper()} ===")
    for m in res:
        print(f"  * {m['name']} | UID: {m['uid']} | Likes: {m['like_count']}")
