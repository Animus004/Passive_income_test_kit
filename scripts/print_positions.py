import bpy

blend_path = r"D:\New folder (2)\blender_engine\assets\desi_library\ai_puttar_authentic_master.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

for o in bpy.data.objects:
    if o.type in ['MESH', 'CURVE']:
        t = o.matrix_world.translation
        d = o.dimensions
        print(f"{o.name:32} | loc: ({t.x:.2f}, {t.y:.2f}, {t.z:.2f}) | dim: ({d.x:.2f}, {d.y:.2f}, {d.z:.2f})")
