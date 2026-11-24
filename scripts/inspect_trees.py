import bpy, os
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=r'D:\New folder (2)\assets\downloads\Pine_Trees_Pack_e1e9c07b\Pine_Trees_Pack.glb')
for o in bpy.context.scene.objects:
    if o.type == 'MESH':
        print(f"{o.name}: dims={o.dimensions}, mats={[m.name for m in o.data.materials if m]}")
