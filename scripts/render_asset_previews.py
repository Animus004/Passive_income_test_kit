import bpy
import os
import math
import mathutils

preview_dir = r"C:\Users\sayan\.gemini\antigravity\brain\f6352432-fa3c-4b63-acbf-21e7ecd31607"

assets = [
    (r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads\futuristic_flying_robot\scene.gltf", "futuristic_flying_robot_preview.png"),
    (r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads\poddy_m1\scene.gltf", "poddy_m1_preview.png"),
    (r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads\indian_chai_glass\scene.gltf", "indian_chai_glass_preview.png")
]

for gltf_path, out_name in assets:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    out_path = os.path.join(preview_dir, out_name)
    
    # Import GLTF
    bpy.ops.import_scene.gltf(filepath=gltf_path)
    
    # Compute bounding box of all mesh objects to frame camera properly
    min_co = [1e9, 1e9, 1e9]
    max_co = [-1e9, -1e9, -1e9]
    
    mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
    for o in mesh_objs:
        for v in o.bound_box:
            world_v = o.matrix_world @ mathutils.Vector(v)
            for i in range(3):
                min_co[i] = min(min_co[i], world_v[i])
                max_co[i] = max(max_co[i], world_v[i])
                
    center = [(min_co[i] + max_co[i]) / 2.0 for i in range(3)]
    size = [max_co[i] - min_co[i] for i in range(3)]
    max_dim = max(size) if max(size) > 0.001 else 1.0
    
    # Setup Camera
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 65
    cam = bpy.data.objects.new("Cam_Obj", cam_data)
    bpy.context.collection.objects.link(cam)
    
    cam_dist = max_dim * 2.2
    cam.location = (center[0], center[1] - cam_dist, center[2] + max_dim * 0.25)
    cam.rotation_euler = (math.radians(82), 0, 0)
    bpy.context.scene.camera = cam
    
    # 3-Point Studio Lighting
    # Key light
    key_data = bpy.data.lights.new("KeyLight", type='AREA')
    key_data.energy = 300.0 * (max_dim ** 1.5)
    key_data.size = max_dim * 1.5
    key_data.color = (1.0, 0.95, 0.90)
    key_obj = bpy.data.objects.new("KeyLight", key_data)
    bpy.context.collection.objects.link(key_obj)
    key_obj.location = (center[0] + max_dim * 1.5, center[1] - max_dim * 1.5, center[2] + max_dim * 1.5)
    
    # Fill light
    fill_data = bpy.data.lights.new("FillLight", type='AREA')
    fill_data.energy = 100.0 * (max_dim ** 1.5)
    fill_data.size = max_dim * 2.0
    fill_data.color = (0.85, 0.92, 1.0)
    fill_obj = bpy.data.objects.new("FillLight", fill_data)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.location = (center[0] - max_dim * 1.5, center[1] - max_dim * 1.2, center[2] + max_dim * 0.8)
    
    # Rim light
    rim_data = bpy.data.lights.new("RimLight", type='POINT')
    rim_data.energy = 250.0 * (max_dim ** 1.5)
    rim_data.color = (1.0, 0.85, 0.65)
    rim_obj = bpy.data.objects.new("RimLight", rim_data)
    bpy.context.collection.objects.link(rim_obj)
    rim_obj.location = (center[0], center[1] + max_dim * 1.5, center[2] + max_dim * 1.2)
    
    # Render settings
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 32
    scene.render.resolution_x = 960
    scene.render.resolution_y = 1280
    scene.render.film_transparent = False
    
    # Dark warm neutral background
    world = bpy.data.worlds.new("StudioWorld")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.04, 0.035, 0.03, 1.0)
        bg.inputs["Strength"].default_value = 0.5
    scene.world = world
    
    scene.render.filepath = out_path
    print(f"Rendering {out_name}...")
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {out_path} ({os.path.getsize(out_path)} bytes)")

print("\nAll previews rendered successfully!")
