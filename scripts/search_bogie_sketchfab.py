import sys
import os
sys.path.append(os.path.abspath("."))
from blender_engine.scripts.sketchfab_connector import search_models

queries = ['train bogie', 'train wheel brake', 'railway track cross section', 'electromagnet coil']
for q in queries:
    res = search_models(q, count=4)
    print(f"=== Query: {q} ===")
    for m in res:
        print(f"  * {m['name']} | UID: {m['uid']} | Likes: {m['like_count']}")
