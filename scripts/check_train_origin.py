import bpy, os
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=r'D:\New folder (2)\assets\downloads\Bullet_Train_Poly_af454108\Bullet_Train_Poly.glb')
for o in bpy.context.scene.objects:
    if o.type == 'MESH':
        vs = [o.matrix_world @ v.co for v in o.data.vertices]
        min_y = min(v.y for v in vs)
        max_y = max(v.y for v in vs)
        min_z = min(v.z for v in vs)
        max_z = max(v.z for v in vs)
        print(f"{o.name}: Y range [{min_y:.2f}, {max_y:.2f}], Z range [{min_z:.2f}, {max_z:.2f}], length={max_y-min_y:.2f}")
