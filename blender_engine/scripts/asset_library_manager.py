"""
Unified Asset Library & Environment Manager
Integrates:
1. Sketchfab API Connector (via SKETCHFAB_API_KEY environment variable)
2. Poly Haven CC0 Models & HDRIs
3. Kenney 49 Modular Environment Kits
4. Procedural Scenic Backdrops (Alpine Mountains, Valley, Forests, City Skylines)
5. Clean Asset Importer (Auto-strips reference grids, checkerboards, billboard planes)
"""

import os
import sys
import math
import bpy

# Local paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOWNLOADS_DIR = os.path.join(BASE_DIR, "assets", "downloads")
AIRCRAFT_DIR = os.path.join(BASE_DIR, "assets", "aircraft")
KENNEY_DIR = os.path.join(BASE_DIR, "assets", "kenney")

# Ensure connector importable
SCRIPTS_DIR = os.path.join(BASE_DIR, "blender_engine", "scripts")
if SCRIPTS_DIR not in sys.path:
    sys.path.append(SCRIPTS_DIR)

try:
    import sketchfab_connector
except ImportError:
    sketchfab_connector = None

def get_or_download_asset(query, fallback_local=None):
    """
    Search downloaded assets first. If missing, query Sketchfab API, download GLB, and return path.
    """
    # 1. Check local aircraft
    if os.path.exists(AIRCRAFT_DIR):
        for f in os.listdir(AIRCRAFT_DIR):
            if any(term in f.lower() for term in query.lower().split()):
                return os.path.join(AIRCRAFT_DIR, f)

    # 2. Check existing downloads
    if os.path.exists(DOWNLOADS_DIR):
        for root, dirs, files in os.walk(DOWNLOADS_DIR):
            for f in files:
                if f.lower().endswith(('.glb', '.gltf')):
                    if any(term in root.lower() or term in f.lower() for term in query.lower().split()):
                        return os.path.join(root, f)

    # 3. Query Sketchfab API
    if sketchfab_connector:
        print(f"🔍 Searching Sketchfab for '{query}'...")
        results = sketchfab_connector.search_models(query, count=3)
        if results:
            top_uid = results[0]["uid"]
            top_name = results[0]["name"]
            print(f"⬇️ Downloading '{top_name}' ({top_uid})...")
            return sketchfab_connector.download_model(top_uid, top_name)

    return fallback_local

def import_and_clean_glb(filepath, scale=(1.0, 1.0, 1.0), location=(0.0, 0.0, 0.0), rotation=(0.0, 0.0, 0.0)):
    """
    Imports GLTF/GLB and sanitizes the scene by removing unwanted reference planes,
    checkerboards, and default ground cubes from third-party artists.
    """
    if not filepath or not os.path.exists(filepath):
        print(f"⚠️ GLB path not found: {filepath}")
        return None

    # Track existing objects
    before_objs = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=filepath)
    new_objs = list(set(bpy.context.scene.objects) - before_objs)

    # Delete junk reference planes
    cleaned_objs = []
    for obj in new_objs:
        lower_name = obj.name.lower()
        if any(junk in lower_name for junk in ["ref_plane", "checker", "back_checker", "billboard", "grid", "ground_ref"]):
            bpy.data.objects.remove(obj, do_unlink=True)
        else:
            cleaned_objs.append(obj)

    # Apply transform to root parent or top-level empty
    roots = [o for o in cleaned_objs if o.parent is None]
    if roots:
        root = roots[0]
        root.location = location
        root.rotation_euler = rotation
        root.scale = scale
        return root

    return None

def build_alpine_backdrop(peak_height=45.0, distance=65.0, color=(0.22, 0.28, 0.35, 1.0)):
    """Creates a jagged high-altitude mountain range on the horizon."""
    mesh = bpy.data.meshes.new("MountainBackdrop")
    obj = bpy.data.objects.new("MountainBackdrop", mesh)
    bpy.context.scene.collection.objects.link(obj)

    xs = [-140, -110, -85, -60, -35, -10, 15, 40, 65, 95, 120, 150]
    heights = [0, 26, 14, 40, 20, 34, 16, 45, 24, 36, 18, 0]
    scaled_heights = [h * (peak_height / 45.0) for h in heights]

    verts, faces = [], []
    for i, (x, h) in enumerate(zip(xs, scaled_heights)):
        verts.append((x, distance, -8.0))
        verts.append((x, distance + 5.0, h))

    for i in range(len(xs) - 1):
        faces.append((i * 2, (i + 1) * 2, (i + 1) * 2 + 1, i * 2 + 1))

    mesh.from_pydata(verts, [], faces)
    mesh.update()

    mat = bpy.data.materials.new("MountainAtmosphereMat")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = 0.95
    obj.data.materials.append(mat)
    return obj

def populate_pine_corridor(count=12, spread_x=7.0, spread_y=60.0):
    """Plants pine trees along the transportation corridor using the downloaded Pine Trees pack."""
    tree_glb = os.path.join(DOWNLOADS_DIR, "Pine_Trees_Pack_e1e9c07b", "Pine_Trees_Pack.glb")
    if not os.path.exists(tree_glb):
        return []

    # Import reference tree
    tree_root = import_and_clean_glb(tree_glb, scale=(0.014, 0.014, 0.014))
    if not tree_root:
        return []

    tree_objs = [o for o in bpy.context.scene.objects if "Pine" in o.name and o.type == 'MESH']
    if not tree_objs:
        return []

    base_tree = tree_objs[0]
    spawned = []
    for i in range(count):
        side = -1.0 if (i % 2 == 0) else 1.0
        x = side * (spread_x + (i % 3) * 1.5)
        y = (i / float(count)) * spread_y
        z = (i % 3) * 0.2

        dup = base_tree.copy()
        dup.data = base_tree.data
        dup.location = (x, y, z)
        s = 0.012 + (i % 4) * 0.002
        dup.scale = (s, s, s)
        dup.rotation_euler = (0, 0, (i * 1.3) % 6.28)
        bpy.context.scene.collection.objects.link(dup)
        spawned.append(dup)

    return spawned
