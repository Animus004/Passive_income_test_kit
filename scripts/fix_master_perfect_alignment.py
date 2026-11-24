import bpy
import math
import os
import mathutils

def build_perfect_master():
    print("--- Aligning Authentic Master Asset with Absolute World Coordinates ---")
    blend_path = r"D:\New folder (2)\blender_engine\assets\desi_library\ai_puttar_authentic_master.blend"
    bpy.ops.wm.open_mainfile(filepath=blend_path)
    scene = bpy.context.scene

    # 1. Unparent all objects completely so we work purely in absolute world space
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
    chai_root = bpy.data.objects.get("Prop_Chai_Glass")
    down_light = bpy.data.objects.get("Hover_Down_Light_Obj")
    table = bpy.data.objects.get("Studio_Desk_Surface")

    # 2. Torso at (0, 0, 0)
    torso.location = (0, 0, 0)
    torso.rotation_euler = (0, 0, 0)
    torso.scale = (1.05, 1.02, 0.92)

    # 3. Neck Gold Ring at (0, 0, 0.52)
    neck.location = (0, 0, 0.52)
    neck.rotation_euler = (0, 0, 0)
    neck.scale = (1.0, 1.0, 0.8)

    # 4. Head at (0, 0, 0.95)
    head.location = (0, 0, 0.95)
    head.rotation_euler = (0, 0, 0)
    head.scale = (0.95, 0.90, 0.90)

    # 5. Visor OLED Screen at (0, -0.20, 0.95)
    visor.location = (0, -0.20, 0.95)
    visor.rotation_euler = (math.radians(12), 0, 0)
    visor.scale = (0.90, 0.90, 0.90)

    # 6. Visor Gold Bezel at (0, -0.24, 0.95)
    bezel.location = (0, -0.24, 0.95)
    bezel.rotation_euler = (math.radians(14), 0, 0)
    bezel.scale = (0.78, 0.32, 0.58)

    # 7. Crown Gold Seam at (0, 0, 0.96)
    crown.location = (0, 0, 0.96)
    crown.rotation_euler = (math.radians(90), 0, math.radians(90))
    crown.scale = (0.96, 0.96, 1.04)

    # 8. Tilak Decal at (0, -0.32, 1.16)
    tilak.location = (0, -0.32, 1.16)
    tilak.rotation_euler = (math.radians(68), 0, 0)
    tilak.scale = (0.50, 1.10, 1.0)

    # 9. Helical Spring Antennas & Glowing Bulbs
    skull_top_z = 0.95 + 0.37 # 1.32
    for side, sign in [("L", -1), ("R", 1)]:
        sock = bpy.data.objects.get(f"Puttar_Antenna_Socket_{side}")
        spring = bpy.data.objects.get(f"Puttar_Antenna_Spring_{side}")
        cap = bpy.data.objects.get(f"Puttar_Bulb_Cap_{side}")
        bulb = bpy.data.objects.get(f"Puttar_Bulb_Glass_{side}")
        fil = bpy.data.objects.get(f"Puttar_Bulb_Filament_{side}")
        light = bpy.data.objects.get(f"Light_Bulb_Obj_{side}")

        base_x = sign * 0.16
        base_y = -0.02
        base_z = skull_top_z

        if sock:
            sock.location = (base_x, base_y, base_z)
            sock.rotation_euler = (0, 0, 0)
        if spring:
            spring.location = (base_x, base_y, base_z + 0.01)
            spring.rotation_euler = (0, 0, 0)

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

    # 10. Floating Oval Hands
    hand_r.location = (0.54, -0.06, 0.04)
    hand_r.rotation_euler = (math.radians(14), math.radians(-22), math.radians(14))
    hand_r.scale = (0.28, 0.22, 0.58)

    hand_l.location = (-0.54, 0.04, -0.02)
    hand_l.rotation_euler = (math.radians(-10), math.radians(18), math.radians(-12))
    hand_l.scale = (0.28, 0.22, 0.58)

    # 11. Chai Glass Prop
    if chai_root:
        chai_root.location = (0.52, -0.22, 0.06)
        chai_root.scale = (1.4, 1.4, 1.4)
        chai_root.rotation_euler = (0, 0, 0)

    # 12. Hover Board Ring & Downward Light
    hover_z = -0.62
    h_frame.location = (0, 0, hover_z)
    h_frame.rotation_euler = (0, 0, 0)
    h_frame.scale = (1.0, 1.0, 0.35)

    h_ring.location = (0, 0, hover_z)
    h_ring.rotation_euler = (0, 0, 0)
    h_ring.scale = (1.0, 1.0, 1.0)

    if down_light:
        down_light.location = (0, 0, hover_z - 0.06)

    # 13. Studio Desk Table
    if table:
        table.location = (0, 0, hover_z - 0.25)

    # 14. Establish Clean Parenting (Torso, Head, Hands parented to Master Root)
    # Head child parts parented to Head
    head_children = [visor, bezel, tilak, crown]
    for side in ["L", "R"]:
        for name in [f"Puttar_Antenna_Socket_{side}", f"Puttar_Antenna_Spring_{side}", f"Puttar_Bulb_Cap_{side}", f"Puttar_Bulb_Glass_{side}", f"Puttar_Bulb_Filament_{side}", f"Light_Bulb_Obj_{side}"]:
            o = bpy.data.objects.get(name)
            if o:
                head_children.append(o)

    for c in head_children:
        if c:
            c.parent = head
            c.matrix_parent_inverse = head.matrix_world.inverted()

    # Hover ring & light parented to frame
    if h_ring:
        h_ring.parent = h_frame
        h_ring.matrix_parent_inverse = h_frame.matrix_world.inverted()
    if down_light:
        down_light.parent = h_frame
        down_light.matrix_parent_inverse = h_frame.matrix_world.inverted()

    # Chai parented to right hand
    if chai_root and hand_r:
        chai_root.parent = hand_r
        chai_root.matrix_parent_inverse = hand_r.matrix_world.inverted()

    # Master Root
    root = bpy.data.objects.get("Puttar_Master_Root")
    if root:
        root.location = (0, 0, 0)
        for top_obj in [head, torso, neck, hand_r, hand_l, h_frame]:
            if top_obj:
                top_obj.parent = root
                top_obj.matrix_parent_inverse = root.matrix_world.inverted()

    # 15. Camera Setup - Perfectly Frame Full Body (Z: -0.7 to 1.75 -> Center Z = 0.52)
    cam = bpy.data.objects.get("Hero_Camera_Obj")
    if cam:
        cam.location = (0.0, -3.85, 0.52)
        cam.rotation_euler = (math.radians(88), 0, 0)
        cam.data.lens = 68.0
        cam.data.dof.use_dof = True
        cam.data.dof.focus_object = head
        cam.data.dof.aperture_fstop = 4.0

    # Save Master Blend
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print("Master Blend saved successfully with perfect coordinates!")

    # 16. Render High-Resolution Reveal
    render_out = r"C:\Users\sayan\.gemini\antigravity\brain\f6352432-fa3c-4b63-acbf-21e7ecd31607\ai_puttar_authentic_master_reveal.png"
    scene.render.filepath = render_out
    scene.cycles.samples = 48
    print(f"Rendering perfectly framed master reveal to {render_out}...")
    bpy.ops.render.render(write_still=True)
    print(f"Rendered: {render_out} ({os.path.getsize(render_out)} bytes)")

build_perfect_master()
