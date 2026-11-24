import bpy
import mathutils

blend_path = r"D:\New folder (2)\blender_engine\assets\desi_library\ai_puttar_authentic_master.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

print("\n--- EXACT BOUNDING BOXES IN WORLD SPACE ---")
for name in ["Puttar_Torso", "Puttar_Head", "Puttar_Visor_OLED", "Puttar_Antenna_Spring_L", "Puttar_Bulb_Glass_L", "Puttar_Hover_Board_Frame"]:
    o = bpy.data.objects.get(name)
    if o:
        world_pts = [o.matrix_world @ mathutils.Vector(v) for v in o.bound_box]
        min_z = min(v.z for v in world_pts)
        max_z = max(v.z for v in world_pts)
        min_y = min(v.y for v in world_pts)
        max_y = max(v.y for v in world_pts)
        print(f"{name:26} | Z: [{min_z:.2f} to {max_z:.2f}] | Y: [{min_y:.2f} to {max_y:.2f}]")
