import bpy
import os

files = [
    r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads\futuristic_flying_robot\scene.gltf",
    r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads\poddy_m1\scene.gltf",
    r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads\indian_chai_glass\scene.gltf"
]

for fp in files:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    name = os.path.basename(os.path.dirname(fp))
    print(f"\n==================== {name} ====================")
    try:
        bpy.ops.import_scene.gltf(filepath=fp)
        for obj in bpy.data.objects:
            parent_name = obj.parent.name if obj.parent else "None"
            mesh_info = ""
            if obj.type == 'MESH':
                mesh_info = f"| verts: {len(obj.data.vertices)}, faces: {len(obj.data.polygons)}"
            print(f"  [{obj.type}] '{obj.name}' -> parent: '{parent_name}' {mesh_info} | dim: {obj.dimensions}")
            if obj.type == 'MESH':
                for slot in obj.material_slots:
                    if slot.material:
                        print(f"      Material: {slot.material.name}")
    except Exception as e:
        print(f"Error importing {fp}: {e}")
