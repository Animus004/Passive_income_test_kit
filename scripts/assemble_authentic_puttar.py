import bpy
import math
import os
import mathutils

def build_authentic_puttar():
    print("--- Starting Authentic AI Puttar Build ---")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene

    # Set up Scene & Color Management (Pixar-grade AgX)
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 48
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1440
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Punchy'

    # Master Collection
    col = bpy.context.collection

    # --- 1. Materials Setup ---
    # Mat 1: Pearlescent White Porcelain Clearcoat (Robot Chassis)
    mat_shell = bpy.data.materials.new(name="M_Pearlescent_Porcelain")
    mat_shell.use_nodes = True
    bsdf_s = mat_shell.node_tree.nodes.get("Principled BSDF")
    if bsdf_s:
        bsdf_s.inputs["Base Color"].default_value = (0.97, 0.97, 0.98, 1.0)
        bsdf_s.inputs["Roughness"].default_value = 0.09
        bsdf_s.inputs["Coat Weight"].default_value = 1.0
        bsdf_s.inputs["Coat Roughness"].default_value = 0.02
        bsdf_s.inputs["Subsurface Weight"].default_value = 0.08
        bsdf_s.inputs["Subsurface Radius"].default_value = (0.9, 0.6, 0.4)

    # Mat 2: Polished 24K Gold Trim (Bezel, Seams, Springs)
    mat_gold = bpy.data.materials.new(name="M_Polished_Gold")
    mat_gold.use_nodes = True
    bsdf_g = mat_gold.node_tree.nodes.get("Principled BSDF")
    if bsdf_g:
        bsdf_g.inputs["Base Color"].default_value = (1.0, 0.82, 0.28, 1.0)
        bsdf_g.inputs["Metallic"].default_value = 0.98
        bsdf_g.inputs["Roughness"].default_value = 0.12
        bsdf_g.inputs["Coat Weight"].default_value = 0.6
        bsdf_g.inputs["Coat Roughness"].default_value = 0.03

    # Mat 3: OLED Visor Display (Curved Glossy Screen with Glowing Cyan Face)
    mat_visor = bpy.data.materials.new(name="M_OLED_Screen")
    mat_visor.use_nodes = True
    nv = mat_visor.node_tree.nodes
    lv = mat_visor.node_tree.links
    nv.clear()
    out_v = nv.new(type="ShaderNodeOutputMaterial")
    bsdf_v = nv.new(type="ShaderNodeBsdfPrincipled")
    bsdf_v.inputs["Base Color"].default_value = (0.008, 0.010, 0.014, 1.0)
    bsdf_v.inputs["Roughness"].default_value = 0.025
    bsdf_v.inputs["Coat Weight"].default_value = 1.0

    tex_visor_path = r"D:\New folder (2)\blender_engine\assets\textures\ai_puttar_visor_screen.png"
    if os.path.exists(tex_visor_path):
        tex_v = nv.new(type="ShaderNodeTexImage")
        tex_v.image = bpy.data.images.load(tex_visor_path)
        tex_v.extension = 'CLIP'
        coord_v = nv.new(type="ShaderNodeTexCoord")
        map_v = nv.new(type="ShaderNodeMapping")
        map_v.inputs["Location"].default_value = (0.0, 0.0, 0.0)
        map_v.inputs["Scale"].default_value = (1.0, 1.0, 1.0)
        lv.new(coord_v.outputs["UV"], map_v.inputs["Vector"])
        lv.new(map_v.outputs["Vector"], tex_v.inputs["Vector"])
        lv.new(tex_v.outputs["Color"], bsdf_v.inputs["Emission Color"])
        bsdf_v.inputs["Emission Strength"].default_value = 16.0
    else:
        bsdf_v.inputs["Emission Color"].default_value = (0.0, 0.88, 1.0, 1.0)
        bsdf_v.inputs["Emission Strength"].default_value = 12.0
    lv.new(bsdf_v.outputs["BSDF"], out_v.inputs["Surface"])

    # Mat 4: Incandescent Bulb Glass & Glowing Filament
    mat_glass = bpy.data.materials.new(name="M_Bulb_Glass")
    mat_glass.use_nodes = True
    bsdf_glass = mat_glass.node_tree.nodes.get("Principled BSDF")
    if bsdf_glass:
        bsdf_glass.inputs["Base Color"].default_value = (1.0, 0.98, 0.92, 1.0)
        bsdf_glass.inputs["Roughness"].default_value = 0.03
        bsdf_glass.inputs["Transmission Weight"].default_value = 0.95
        bsdf_glass.inputs["IOR"].default_value = 1.50

    mat_fil = bpy.data.materials.new(name="M_Bulb_Filament")
    mat_fil.use_nodes = True
    bsdf_f = mat_fil.node_tree.nodes.get("Principled BSDF")
    if bsdf_f:
        bsdf_f.inputs["Base Color"].default_value = (1.0, 0.88, 0.40, 1.0)
        bsdf_f.inputs["Emission Color"].default_value = (1.0, 0.85, 0.35, 1.0)
        bsdf_f.inputs["Emission Strength"].default_value = 35.0

    # Mat 5: Tilak Decal
    mat_tilak = bpy.data.materials.new(name="M_Tilak_Decal")
    mat_tilak.use_nodes = True
    nt = mat_tilak.node_tree.nodes
    lt = mat_tilak.node_tree.links
    nt.clear()
    out_t = nt.new(type="ShaderNodeOutputMaterial")
    bsdf_t = nt.new(type="ShaderNodeBsdfPrincipled")
    bsdf_t.inputs["Roughness"].default_value = 0.65
    tilak_path = r"D:\New folder (2)\blender_engine\assets\textures\ai_puttar_tilak_decal.png"
    if os.path.exists(tilak_path):
        tex_t = nt.new(type="ShaderNodeTexImage")
        tex_t.image = bpy.data.images.load(tilak_path)
        lt.new(tex_t.outputs["Color"], bsdf_t.inputs["Base Color"])
        lt.new(tex_t.outputs["Alpha"], bsdf_t.inputs["Alpha"])
    else:
        bsdf_t.inputs["Base Color"].default_value = (0.85, 0.08, 0.06, 1.0)
    lt.new(bsdf_t.outputs["BSDF"], out_t.inputs["Surface"])

    # Mat 6: Hover Board Glowing Energy Core
    mat_hover_core = bpy.data.materials.new(name="M_Hover_Energy_Core")
    mat_hover_core.use_nodes = True
    bsdf_hc = mat_hover_core.node_tree.nodes.get("Principled BSDF")
    if bsdf_hc:
        bsdf_hc.inputs["Base Color"].default_value = (1.0, 0.85, 0.30, 1.0)
        bsdf_hc.inputs["Emission Color"].default_value = (1.0, 0.80, 0.25, 1.0)
        bsdf_hc.inputs["Emission Strength"].default_value = 25.0

    # --- 2. Import Base Chassis (Disney/Pixar Eve high-precision mesh) ---
    eve_glb = r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads\eva_pixar_master.glb"
    bpy.ops.import_scene.gltf(filepath=eve_glb)

    head = bpy.data.objects.get("Sphere_body_0")
    visor = bpy.data.objects.get("Sphere_Material.001_0")
    torso = bpy.data.objects.get("body_body_0")
    hands = bpy.data.objects.get("hand.r_body_0")

    # Clear transforms and unparent
    for o in [head, visor, torso, hands]:
        if o:
            bpy.context.view_layer.objects.active = o
            o.select_set(True)
            bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
            bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
            o.select_set(False)

    for o in list(bpy.data.objects):
        if o.type == 'EMPTY':
            bpy.data.objects.remove(o, do_unlink=True)

    head.name = "Puttar_Head"
    visor.name = "Puttar_Visor_OLED"
    torso.name = "Puttar_Torso"
    hands.name = "Puttar_Hand_R"

    # Separate Left Hand (duplicate and mirror)
    bpy.context.view_layer.objects.active = hands
    hands.select_set(True)
    bpy.ops.object.duplicate()
    hand_l = bpy.context.active_object
    hand_l.name = "Puttar_Hand_L"
    hand_l.scale.x = -1.0
    bpy.ops.object.transform_apply(scale=True)
    hands.select_set(False)
    hand_l.select_set(False)

    # Master Hierarchy
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    master_root = bpy.context.active_object
    master_root.name = "Puttar_Master_Root"

    head.parent = master_root
    visor.parent = head
    torso.parent = master_root
    hands.parent = master_root
    hand_l.parent = master_root

    # Apply High-End Materials
    head.data.materials.clear()
    head.data.materials.append(mat_shell)
    torso.data.materials.clear()
    torso.data.materials.append(mat_shell)
    hands.data.materials.clear()
    hands.data.materials.append(mat_shell)
    hand_l.data.materials.clear()
    hand_l.data.materials.append(mat_shell)
    visor.data.materials.clear()
    visor.data.materials.append(mat_visor)

    # Round out the torso so it's a sleek oval capsule/egg (not a needle)
    # Scale torso slightly on Z and soften the taper
    torso.scale = (1.08, 1.05, 0.88)
    bpy.context.view_layer.objects.active = torso
    torso.select_set(True)
    bpy.ops.object.transform_apply(scale=True)
    torso.select_set(False)

    # --- 3. Metallic Gold Trim & Visor Bezel Ring ---
    # Create the elegant curved gold bezel framing the visor
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.31,
        minor_radius=0.014,
        major_segments=48,
        minor_segments=16,
        location=(0, -0.26, head.location.z + 0.01)
    )
    bezel = bpy.context.active_object
    bezel.name = "Puttar_Visor_Gold_Bezel"
    bezel.scale = (0.92, 0.35, 0.68)
    bezel.rotation_euler = (math.radians(16), 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    bezel.data.materials.append(mat_gold)
    bpy.ops.object.shade_smooth()
    bezel.parent = head

    # Gold Seam Strip over Cranial Dome
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.375,
        minor_radius=0.009,
        major_segments=48,
        minor_segments=12,
        location=(0, 0, head.location.z)
    )
    crown_strip = bpy.context.active_object
    crown_strip.name = "Puttar_Crown_Gold_Seam"
    crown_strip.scale = (1.01, 1.02, 1.14)
    crown_strip.rotation_euler = (math.radians(90), 0, math.radians(90))
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    crown_strip.data.materials.append(mat_gold)
    bpy.ops.object.shade_smooth()
    crown_strip.parent = head

    # Gold Neck Ring
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.28,
        minor_radius=0.012,
        major_segments=48,
        minor_segments=16,
        location=(0, 0, (head.location.z + torso.location.z) / 2.0 - 0.05)
    )
    neck_ring = bpy.context.active_object
    neck_ring.name = "Puttar_Neck_Gold_Ring"
    neck_ring.data.materials.append(mat_gold)
    bpy.ops.object.shade_smooth()
    neck_ring.parent = master_root

    # --- 4. Coiled Helical Spring Antennas & Glowing Edison Bulbs ---
    top_z = head.location.z + head.dimensions.z * 0.46
    for side, sign in [("L", -1), ("R", 1)]:
        bx = sign * 0.17
        by = -0.02
        bz = top_z

        # Gold Base Socket
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.026, location=(bx, by, bz))
        sock = bpy.context.active_object
        sock.name = f"Puttar_Antenna_Socket_{side}"
        sock.scale = (1.0, 1.0, 0.4)
        bpy.ops.object.transform_apply(scale=True)
        sock.data.materials.append(mat_gold)
        bpy.ops.object.shade_smooth()
        sock.parent = head

        # Coiled Helical Spring Wire
        curve_data = bpy.data.curves.new(name=f"Spring_Curve_{side}", type='CURVE')
        curve_data.dimensions = '3D'
        curve_data.bevel_depth = 0.010 # Substantial coiled wire
        curve_data.bevel_resolution = 4
        spline = curve_data.splines.new(type='POLY')
        pts = 90
        spline.points.add(pts - 1)
        radius = 0.024
        height = 0.28
        turns = 5.5
        tilt = math.radians(18) * sign
        pitch = height / pts

        for i in range(pts):
            t = (i / pts) * turns * 2.0 * math.pi
            lx = radius * math.cos(t)
            ly = radius * math.sin(t)
            lz = i * pitch
            rx = lx * math.cos(tilt) - lz * math.sin(tilt)
            rz = lx * math.sin(tilt) + lz * math.cos(tilt)
            spline.points[i].co = (rx, ly, rz, 1.0)

        spring = bpy.data.objects.new(f"Puttar_Antenna_Spring_{side}", curve_data)
        col.objects.link(spring)
        spring.location = (bx, by, bz + 0.01)
        spring.data.materials.append(mat_gold)
        spring.parent = head

        # Tip Bulb Assembly
        tip_x = bx + 0.28 * math.sin(math.radians(18)) * sign
        tip_z = bz + 0.01 + 0.28 * math.cos(math.radians(18))
        tip_y = by

        # Gold Socket Cap
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.020, location=(tip_x, tip_y, tip_z))
        cap = bpy.context.active_object
        cap.name = f"Puttar_Bulb_Cap_{side}"
        cap.data.materials.append(mat_gold)
        bpy.ops.object.shade_smooth()
        cap.parent = spring

        # Glass Bulb Shell
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.048, location=(tip_x, tip_y, tip_z + 0.040))
        bulb = bpy.context.active_object
        bulb.name = f"Puttar_Bulb_Glass_{side}"
        bulb.data.materials.append(mat_glass)
        bpy.ops.object.shade_smooth()
        bulb.parent = spring

        # Glowing Filament
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.026, location=(tip_x, tip_y, tip_z + 0.040))
        fil = bpy.context.active_object
        fil.name = f"Puttar_Bulb_Filament_{side}"
        fil.data.materials.append(mat_fil)
        bpy.ops.object.shade_smooth()
        fil.parent = spring

        # Warm Point Light inside bulb
        b_light = bpy.data.lights.new(name=f"Light_Bulb_{side}", type='POINT')
        b_light.energy = 28.0
        b_light.color = (1.0, 0.88, 0.40)
        b_light.shadow_soft_size = 0.04
        bl_obj = bpy.data.objects.new(f"Light_Bulb_Obj_{side}", b_light)
        col.objects.link(bl_obj)
        bl_obj.location = (tip_x, tip_y, tip_z + 0.040)
        bl_obj.parent = fil

    # --- 5. Vermilion Tilak Decal ---
    bpy.ops.mesh.primitive_plane_add(size=0.13, location=(0, -0.375, head.location.z + 0.23))
    tilak_obj = bpy.context.active_object
    tilak_obj.name = "Puttar_Tilak_Decal"
    tilak_obj.scale = (0.55, 1.25, 1.0)
    tilak_obj.rotation_euler = (math.radians(70), 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    tilak_obj.data.materials.append(mat_tilak)
    tilak_obj.parent = head

    # --- 6. Hollow Hover Board Ring (Floating Underneath) ---
    torso_bottom_z = torso.location.z - torso.dimensions.z * 0.48
    hover_z = torso_bottom_z - 0.15

    # Outer Metallic Gold Chassis of Hover Board
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.36,
        minor_radius=0.038,
        major_segments=48,
        minor_segments=20,
        location=(0, 0, hover_z)
    )
    hover_frame = bpy.context.active_object
    hover_frame.name = "Puttar_Hover_Board_Frame"
    hover_frame.scale = (1.0, 1.0, 0.35)
    bpy.ops.object.transform_apply(scale=True)
    hover_frame.data.materials.append(mat_gold)
    bpy.ops.object.shade_smooth()
    hover_frame.parent = master_root

    # Inner Hollow Glowing Light Ring
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.32,
        minor_radius=0.016,
        major_segments=48,
        minor_segments=16,
        location=(0, 0, hover_z)
    )
    hover_light = bpy.context.active_object
    hover_light.name = "Puttar_Hover_Light_Ring"
    hover_light.data.materials.append(mat_hover_core)
    bpy.ops.object.shade_smooth()
    hover_light.parent = hover_frame

    # Downward Amber Point/Area Light Pool
    down_light_data = bpy.data.lights.new(name="Hover_Down_Light", type='POINT')
    down_light_data.energy = 45.0
    down_light_data.color = (1.0, 0.82, 0.35)
    down_light_data.shadow_soft_size = 0.18
    down_obj = bpy.data.objects.new("Hover_Down_Light_Obj", down_light_data)
    col.objects.link(down_obj)
    down_obj.location = (0, 0, hover_z - 0.05)
    down_obj.parent = hover_frame

    # --- 7. Import Authentic Cutting Chai Glass Prop ---
    chai_gltf = r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads\indian_chai_glass\scene.gltf"
    if os.path.exists(chai_gltf):
        bpy.ops.import_scene.gltf(filepath=chai_gltf)
        chai_root = bpy.data.objects.get("GLTF_SceneRootNode")
        if chai_root:
            chai_root.name = "Prop_Chai_Glass"
            # Scale to realistic cutting chai size relative to Puttar
            chai_root.scale = (1.6, 1.6, 1.6)
            # Position near right hand
            hands.location = (0.42, -0.06, torso.location.z - 0.05)
            hands.rotation_euler = (math.radians(12), math.radians(-24), math.radians(20))
            
            hand_l.location = (-0.42, 0.02, torso.location.z - 0.08)
            hand_l.rotation_euler = (math.radians(-8), math.radians(18), math.radians(-15))

            chai_root.location = (0.43, -0.16, torso.location.z - 0.04)
            chai_root.parent = hands
            print("Successfully attached authentic Indian Cutting Chai Glass!")

    # --- 8. Studio Environment & Table ---
    # Polished dark wood desk table
    mat_table = bpy.data.materials.new(name="M_Polished_Desk")
    mat_table.use_nodes = True
    bsdf_table = mat_table.node_tree.nodes.get("Principled BSDF")
    if bsdf_table:
        bsdf_table.inputs["Base Color"].default_value = (0.16, 0.11, 0.08, 1.0)
        bsdf_table.inputs["Roughness"].default_value = 0.28
        bsdf_table.inputs["Coat Weight"].default_value = 0.4
        bsdf_table.inputs["Coat Roughness"].default_value = 0.08

    bpy.ops.mesh.primitive_plane_add(size=8.0, location=(0, 0, hover_z - 0.35))
    table = bpy.context.active_object
    table.name = "Studio_Desk_Surface"
    table.data.materials.append(mat_table)

    # --- 9. Cinematic 3-Point Portrait Lighting ---
    # Key Light (Warm, upper-right, soft diffused)
    key_l = bpy.data.lights.new(name="Studio_Key_Light", type='AREA')
    key_l.energy = 380.0
    key_l.size = 1.4
    key_l.color = (1.0, 0.96, 0.92)
    key_obj = bpy.data.objects.new("Studio_Key_Light", key_l)
    col.objects.link(key_obj)
    key_obj.location = (1.8, -2.4, 2.2)
    key_obj.rotation_euler = (math.radians(52), math.radians(14), math.radians(34))

    # Fill Light (Cool soft blue, left side)
    fill_l = bpy.data.lights.new(name="Studio_Fill_Light", type='AREA')
    fill_l.energy = 140.0
    fill_l.size = 2.0
    fill_l.color = (0.86, 0.92, 1.0)
    fill_obj = bpy.data.objects.new("Studio_Fill_Light", fill_l)
    col.objects.link(fill_obj)
    fill_obj.location = (-2.0, -1.8, 1.6)
    fill_obj.rotation_euler = (math.radians(58), math.radians(-18), math.radians(-42))

    # Rim / Hair Light (Golden accent rim from behind)
    rim_l = bpy.data.lights.new(name="Studio_Rim_Light", type='AREA')
    rim_l.energy = 420.0
    rim_l.size = 1.0
    rim_l.color = (1.0, 0.86, 0.60)
    rim_obj = bpy.data.objects.new("Studio_Rim_Light", rim_l)
    col.objects.link(rim_obj)
    rim_obj.location = (0.3, 2.2, 2.0)
    rim_obj.rotation_euler = (math.radians(-54), 0, math.radians(175))

    # Warm Studio Environment Ambient
    world = bpy.data.worlds.new("PixarStudioWorld")
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs["Color"].default_value = (0.05, 0.045, 0.040, 1.0)
        bg_node.inputs["Strength"].default_value = 0.4
    scene.world = world

    # --- 10. Camera Setup (85mm Portrait Telephoto with Depth of Field) ---
    cam_d = bpy.data.cameras.new("Hero_Camera")
    cam_d.lens = 85.0 # Flattering portrait focal length
    cam_d.dof.use_dof = True
    cam_d.dof.focus_object = head
    cam_d.dof.aperture_fstop = 3.2 # Beautiful creamy background blur

    cam = bpy.data.objects.new("Hero_Camera_Obj", cam_d)
    col.objects.link(cam)
    cam.location = (0.0, -2.85, 0.52)
    cam.rotation_euler = (math.radians(84), 0, 0)
    scene.camera = cam

    # Save Master Blend File
    blend_out = r"D:\New folder (2)\blender_engine\assets\desi_library\ai_puttar_authentic_master.blend"
    os.makedirs(os.path.dirname(blend_out), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=blend_out)
    print(f"Master asset saved to: {blend_out}")

    # Render High-Fidelity Reveal
    render_out = r"C:\Users\sayan\.gemini\antigravity\brain\f6352432-fa3c-4b63-acbf-21e7ecd31607\ai_puttar_authentic_master_reveal.png"
    scene.render.filepath = render_out
    print(f"Rendering master reveal to {render_out}...")
    bpy.ops.render.render(write_still=True)
    print(f"Successfully rendered: {render_out} ({os.path.getsize(render_out)} bytes)")

build_authentic_puttar()
