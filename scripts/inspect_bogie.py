import bpy

bogie_path = r'D:\New folder (2)\assets\downloads\Bogie_Type_Y25_59b720c2\Bogie_Type_Y25.glb'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=bogie_path)

for o in bpy.context.scene.objects:
    if o.type == 'MESH':
        vs = o.data.vertices
        # check radii from central axes
        print(f"Object: {o.name}")
        for ax in ['X', 'Y', 'Z']:
            # test standard deviations or bounds
            pass
