import bpy
import mathutils

bpy.ops.wm.open_mainfile(filepath=r"D:\New folder (2)\blender_engine\assets\desi_library\ai_puttar_authentic_master.blend")

min_co = [1e9, 1e9, 1e9]
max_co = [-1e9, -1e9, -1e9]

for o in bpy.data.objects:
    if o.type in ['MESH', 'CURVE']:
        for v in o.bound_box:
            wv = o.matrix_world @ mathutils.Vector(v)
            for i in range(3):
                min_co[i] = min(min_co[i], wv[i])
                max_co[i] = max(max_co[i], wv[i])
        print(f"Object {o.name}: loc={o.matrix_world.translation}, dim={o.dimensions}")

print(f"\nTotal BoundBox: min={min_co}, max={max_co}")
center = [(min_co[i] + max_co[i]) / 2.0 for i in range(3)]
size = [max_co[i] - min_co[i] for i in range(3)]
print(f"Center: {center}, Size: {size}")
