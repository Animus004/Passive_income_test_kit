import bpy, os

base_dir = r"D:\New folder (2)\assets\downloads"
trains = [
    ("Bullet_Train_Poly", os.path.join(base_dir, "Bullet_Train_Poly_af454108", "Bullet_Train_Poly.glb")),
    ("Bullet_Train_CC", os.path.join(base_dir, "Bullet_Train_CC_cc071a8b", "Bullet_Train_CC.glb")),
    ("Bullet_Train_Modern", os.path.join(base_dir, "Bullet_Train_Modern_e6e19f90", "Bullet_Train_Modern.glb"))
]

for name, path in trains:
    if not os.path.exists(path):
        print(f"Missing: {name}")
        continue
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    print(f"=== {name} ===")
    for o in bpy.context.scene.objects:
        if o.type == 'MESH':
            print(f"  Mesh: {o.name}, dims: {o.dimensions}, loc: {o.location}")
