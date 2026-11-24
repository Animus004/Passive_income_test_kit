import bpy
import math
import os
import mathutils

def fix_and_render_master():
    print("--- Fixing Transforms & Parenting in Master Blend ---")
    blend_path = r"D:\New folder (2)\blender_engine\assets\desi_library\ai_puttar_authentic_master.blend"
    bpy.ops.wm.open_mainfile(filepath=blend_path)
    scene = bpy.context.scene

    # 1. Remove unwanted objects from imported chai (like Object_4 floor plane)
    floor_obj = bpy.data.objects.get("Object_4")
    if floor_obj:
        bpy.data.objects.remove(floor_obj, do_unlink=True)
        print("Removed extraneous chai floor plane Object_4")

    # 2. Reset and fix all parent transformations cleanly
    # First unparent all objects keeping transform
    for o in list(bpy.data.objects):
        if o.parent:
            bpy.context.view_layer.objects.active = o
            o.select_set(True)
            bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
            o.select_set(False)

    head = bpy.data.objects.get("Puttar_Head")
    visor = bpy.data.objects.get("Puttar_Visor_OLED")
    torso = bpy.data.objects.get("Puttar_Torso")
    bezel = bpy.data.objects.get("Puttar_Visor_Gold_Bezel")
    tilak = bpy.data.objects.get("Puttar_Tilak_Decal")
    crown = bpy.data.objects.get("Puttar_Crown_Gold_Seam")
    neck = bpy.data.objects.get("Puttar_Neck_Gold_Ring")
    hand_r = bpy.data.objects.get("Puttar_Hand_R")
    hand_l = bpy.data.objects.get("Puttar_Hand_L")
    h_frame = bpy.data.objects.get("Puttar_Hover_Board_Frame")
    h_ring = bpy.data.objects.get("Puttar_Hover_Light_Ring")

    # Position Puttar Head cleanly above Torso
    # Torso is at (0, 0, 0). Height of torso is approx 1.15
    torso.location = (0, 0, 0)
    torso.scale = (1.08, 1.05, 0.90)
    
    # Head at (0, 0, 0.72)
    head.location = (0, 0, 0.72)
    head.scale = (0.95, 0.92, 0.92)

    # Visor flush inside head cavity
    visor.location = (0, -0.16, 0.72)
    visor.scale = (0.92, 0.92, 0.92)

    # Visor Gold Bezel framing the visor rim
    bezel.location = (0, -0.22, 0.72)
    bezel.scale = (0.78, 0.32, 0.58)
    bezel.rotation_euler = (math.radians(14), 0, 0)

    # Crown Gold Seam over the skull
    crown.location = (0, 0, 0.74)
    crown.scale = (0.96, 0.96, 1.04)

    # Tilak Decal on forehead
    tilak.location = (0, -0.32, 0.92)
    tilak.scale = (0.50, 1.10, 1.0)
    tilak.rotation_euler = (math.radians(68), 0, 0)

    # Neck Gold Ring
    neck.location = (0, 0, 0.34)
    neck.scale = (1.0, 1.0, 0.8)

    # Spring Antennas and Bulbs
    head_top_z = 0.72 + 0.38 # ~1.10
    for side, sign in [("L", -1), ("R", 1)]:
        sock = bpy.data.objects.get(f"Puttar_Antenna_Socket_{side}")
        spring = bpy.data.objects.get(f"Puttar_Antenna_Spring_{side}")
        cap = bpy.data.objects.get(f"Puttar_Bulb_Cap_{side}")
        bulb = bpy.data.objects.get(f"Puttar_Bulb_Glass_{side}")
        fil = bpy.data.objects.get(f"Puttar_Bulb_Filament_{side}")
        light = bpy.data.objects.get(f"Light_Bulb_Obj_{side}")

        base_x = sign * 0.16
        base_y = -0.02
        base_z = head_top_z

        if sock:
            sock.location = (base_x, base_y, base_z)
        if spring:
            spring.location = (base_x, base_y, base_z + 0.01)

        tip_x = base_x + 0.28 * math.sin(math.radians(18)) * sign
        tip_z = base_z + 0.01 + 0.28 * math.cos(math.radians(18))
        tip_y = base_y

        if cap:
            cap.location = (tip_x, tip_y, tip_z)
        if bulb:
            bulb.location = (tip_x, tip_y, tip_z + 0.040)
        if fil:
            fil.location = (tip_x, tip_y, tip_z + 0.040)
        if light:
            light.location = (tip_x, tip_y, tip_z + 0.040)

    # Floating Oval Hands
    hand_r.location = (0.56, -0.06, 0.02)
    hand_r.scale = (0.28, 0.22, 0.58)
    hand_r.rotation_euler = (math.radians(15), math.radians(-20), math.radians(12))

    hand_l.location = (-0.56, 0.04, -0.02)
    hand_l.scale = (0.28, 0.22, 0.58)
    hand_l.rotation_euler = (math.radians(-10), math.radians(18), math.radians(-10))

    # Chai Glass positioned in right hand
    chai_root = bpy.data.objects.get("Prop_Chai_Glass")
    if chai_root:
        chai_root.location = (0.54, -0.22, 0.04)
        chai_root.scale = (1.4, 1.4, 1.4)

    # Hover Board underneath Torso
    hover_z = -0.62
    h_frame.location = (0, 0, hover_z)
    h_frame.scale = (1.0, 1.0, 0.35)
    h_ring.location = (0, 0, hover_z)
    h_ring.scale = (1.0, 1.0, 1.0)

    down_light = bpy.data.objects.get("Hover_Down_Light_Obj")
    if down_light:
        down_light.location = (0, 0, hover_z - 0.06)

    # Desk Table
    table = bpy.data.objects.get("Studio_Desk_Surface")
    if table:
        table.location = (0, 0, hover_z - 0.25)

    # 3. Clean Parenting with Matrix Inverses
    # Parent head parts to head
    head_parts = [visor, bezel, tilak, crown]
    for side in ["L", "R"]:
        for name in [f"Puttar_Antenna_Socket_{side}", f"Puttar_Antenna_Spring_{side}", f"Puttar_Bulb_Cap_{side}", f"Puttar_Bulb_Glass_{side}", f"Puttar_Bulb_Filament_{side}", f"Light_Bulb_Obj_{side}"]:
            o = bpy.data.objects.get(name)
            if o:
                head_parts.append(o)

    for hp in head_parts:
        if hp:
            hp.parent = head
            hp.matrix_parent_inverse = head.matrix_world.inverted()

    # Parent hover ring and light to frame
    if h_ring:
        h_ring.parent = h_frame
        h_ring.matrix_parent_inverse = h_frame.matrix_world.inverted()
    if down_light:
        down_light.parent = h_frame
        down_light.matrix_parent_inverse = h_frame.matrix_world.inverted()

    # Parent chai to right hand
    if chai_root and hand_r:
        chai_root.parent = hand_r
        chai_root.matrix_parent_inverse = hand_r.matrix_world.inverted()

    # Master Root
    root = bpy.data.objects.get("Puttar_Master_Root")
    if root:
        for top_obj in [head, torso, neck, hand_r, hand_l, h_frame]:
            if top_obj:
                top_obj.parent = root
                top_obj.matrix_parent_inverse = root.matrix_world.inverted()

    # 4. Camera Setup - Perfectly Framed Full-Body Hero Portrait
    cam = bpy.data.objects.get("Hero_Camera_Obj")
    if cam:
        cam.location = (0.0, -3.4, 0.45)
        cam.rotation_euler = (math.radians(88), 0, 0)
        cam.data.lens = 70.0
        cam.data.dof.use_dof = True
        cam.data.dof.focus_object = head
        cam.data.dof.aperture_fstop = 4.0

    # Save Blend
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print("Blend file updated and saved successfully!")

    # 5. Render High-Resolution Reveal
    render_out = r"C:\Users\sayan\.gemini\antigravity\brain\f6352432-fa3c-4b63-acbf-21e7ecd31607\ai_puttar_authentic_master_reveal.png"
    scene.render.filepath = render_out
    scene.cycles.samples = 48
    print(f"Rendering updated master reveal to {render_out}...")
    bpy.ops.render.render(write_still=True)
    print(f"Successfully rendered: {render_out} ({os.path.getsize(render_out)} bytes)")

fix_and_render_master()
