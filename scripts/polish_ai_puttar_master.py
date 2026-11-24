import bpy
import math

def polish_master():
    # 1. Camera Framing: Move back slightly to show full bulbs and hover board with breathing room
    cam = bpy.data.objects.get("Camera_Master")
    if cam:
        cam.location = (0.0, -4.35, 1.22)
        cam.rotation_euler = (math.radians(88.5), 0.0, 0.0)
        cam.data.lens = 48.0 # Natural cinematic portrait field of view
        cam.data.dof.focus_distance = 4.35
        cam.data.dof.aperture_fstop = 3.5

    # 2. Floating Oval Hands: Position in a charismatic, floating hover pose
    hand_l = bpy.data.objects.get("Puttar_Hand_L")
    hand_l_trim = bpy.data.objects.get("Puttar_Hand_L_Gold_Trim")
    if hand_l:
        hand_l.location = (-0.56, -0.12, 0.72)
        hand_l.rotation_euler = (math.radians(15), math.radians(28), math.radians(-18))
        if hand_l_trim:
            hand_l_trim.location = (0, 0, 0) # Parented to hand_l, relative (0,0,0)

    hand_r = bpy.data.objects.get("Puttar_Hand_R")
    hand_r_trim = bpy.data.objects.get("Puttar_Hand_R_Gold_Trim")
    if hand_r:
        hand_r.location = (0.56, -0.12, 0.72)
        hand_r.rotation_euler = (math.radians(15), math.radians(-28), math.radians(18))
        if hand_r_trim:
            hand_r_trim.location = (0, 0, 0)

    # Clean up any stray rings in the background if they exist
    for o in bpy.data.objects:
        if "Trim" in o.name and not o.parent:
            if "Hand" in o.name:
                bpy.data.objects.remove(o, do_unlink=True)

    # 3. Antenna Bulbs: Boost warm incandescent glow
    mat_fil = bpy.data.materials.get("M_Bulb_Filament_Glow")
    if mat_fil:
        bsdf = mat_fil.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Emission Strength"].default_value = 35.0
            bsdf.inputs["Emission Color"].default_value = (1.0, 0.85, 0.35, 1.0)

    # Boost Point Lights inside the bulbs
    for side in ["L", "R"]:
        light = bpy.data.lights.get(f"Light_Bulb_{side}")
        if light:
            light.energy = 24.0
            light.color = (1.0, 0.85, 0.40)

    # 4. Forehead Tilak: Position perfectly in center above visor bezel
    tilak = bpy.data.objects.get("Puttar_Tilak_Decal")
    if tilak:
        tilak.location = (0.0, -0.32, 1.67)
        tilak.scale = (0.50, 1.15, 1.0)
        tilak.rotation_euler = (math.radians(72), 0.0, 0.0)

    # 5. Hollow Hover Board: Boost warm amber under-glow
    hover_light = bpy.data.lights.get("Hover_Pool_Spot")
    if hover_light:
        hover_light.energy = 95.0
        hover_light.color = (1.0, 0.72, 0.15)

    # Save Blend
    bpy.ops.wm.save_mainfile()
    print("AI Puttar Master Asset polished and saved.")

if __name__ == "__main__":
    polish_master()
