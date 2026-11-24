import bpy
import math
import os
import bmesh

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_quad_capsule(name, radius=1.0, scale=(1.0, 1.0, 1.0), location=(0.0, 0.0, 0.0), subd_levels=2):
    """Creates a seamless quad-topology oval capsule from a subdivided cube."""
    bpy.ops.mesh.primitive_cube_add(size=radius * 2.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    
    subd = obj.modifiers.new(name="Subdivision", type='SUBSURF')
    subd.levels = subd_levels
    subd.render_levels = subd_levels + 1
    
    cast = obj.modifiers.new(name="Cast", type='CAST')
    cast.cast_type = 'SPHERE'
    cast.factor = 1.0
    
    bpy.ops.object.modifier_apply(modifier="Subdivision")
    bpy.ops.object.modifier_apply(modifier="Cast")
    
    obj.scale = scale
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    return obj

def create_spring_antenna(name, side="L", turns=5.0, radius=0.022, height=0.22, points_count=80):
    """Creates a distinct coiled helical spring with substantial wire gauge."""
    sign = -1.0 if side == "L" else 1.0
    
    curve_data = bpy.data.curves.new(name=f"{name}_Curve", type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.bevel_depth = 0.0075 # Substantial spring wire thickness
    curve_data.bevel_resolution = 4
    
    spline = curve_data.splines.new(type='POLY')
    spline.points.add(points_count - 1)
    
    tilt_angle = math.radians(18) * sign
    pitch = height / points_count
    
    for i in range(points_count):
        t = (i / points_count) * turns * 2.0 * math.pi
        local_x = radius * math.cos(t)
        local_y = radius * math.sin(t)
        local_z = i * pitch
        
        # Tilt spring outward
        rot_x = local_x * math.cos(tilt_angle) - local_z * math.sin(tilt_angle)
        rot_z = local_x * math.sin(tilt_angle) + local_z * math.cos(tilt_angle)
        
        spline.points[i].co = (rot_x, local_y, rot_z, 1.0)
    
    spring_obj = bpy.data.objects.new(name, curve_data)
    bpy.context.collection.objects.link(spring_obj)
    return spring_obj

def setup_materials(tex_dir):
    tilak_tex_path = os.path.join(tex_dir, "ai_puttar_tilak_decal.png")
    visor_tex_path = os.path.join(tex_dir, "ai_puttar_visor_screen.png")
    
    mats = {}

    # 1. Pearlescent Clearcoat Chassis (White Automotive Lacquer)
    mat_shell = bpy.data.materials.new(name="M_Pearlescent_Chassis")
    mat_shell.use_nodes = True
    bsdf_shell = mat_shell.node_tree.nodes.get("Principled BSDF")
    if bsdf_shell:
        bsdf_shell.inputs["Base Color"].default_value = (0.96, 0.96, 0.98, 1.0)
        bsdf_shell.inputs["Roughness"].default_value = 0.08
        bsdf_shell.inputs["Coat Weight"].default_value = 1.0
        bsdf_shell.inputs["Coat Roughness"].default_value = 0.02
        bsdf_shell.inputs["Subsurface Weight"].default_value = 0.05
        bsdf_shell.inputs["Subsurface Radius"].default_value = (0.9, 0.6, 0.4)
    mats["shell"] = mat_shell

    # 2. Polished Gold Accent Trim (Golden Strips Throughout Body)
    mat_gold = bpy.data.materials.new(name="M_Polished_Gold_Trim")
    mat_gold.use_nodes = True
    bsdf_g = mat_gold.node_tree.nodes.get("Principled BSDF")
    if bsdf_g:
        bsdf_g.inputs["Base Color"].default_value = (1.0, 0.82, 0.28, 1.0)
        bsdf_g.inputs["Metallic"].default_value = 0.98
        bsdf_g.inputs["Roughness"].default_value = 0.12
        bsdf_g.inputs["Coat Weight"].default_value = 0.5
        bsdf_g.inputs["Coat Roughness"].default_value = 0.02
    mats["gold"] = mat_gold

    # 3. Visor OLED Emissive Glass Screen (Direct Emissive Screen with Specular Clearcoat!)
    mat_screen = bpy.data.materials.new(name="M_Visor_OLED_Screen")
    mat_screen.use_nodes = True
    nodes_s = mat_screen.node_tree.nodes
    links_s = mat_screen.node_tree.links
    nodes_s.clear()

    out_s = nodes_s.new(type="ShaderNodeOutputMaterial")
    bsdf_s = nodes_s.new(type="ShaderNodeBsdfPrincipled")
    bsdf_s.inputs["Base Color"].default_value = (0.015, 0.018, 0.025, 1.0)
    bsdf_s.inputs["Roughness"].default_value = 0.025 # High specular glass gloss
    bsdf_s.inputs["Coat Weight"].default_value = 1.0  # Protective clearcoat reflection
    bsdf_s.inputs["Coat Roughness"].default_value = 0.01
    bsdf_s.inputs["Emission Strength"].default_value = 9.0

    if os.path.exists(visor_tex_path):
        tex_s = nodes_s.new(type="ShaderNodeTexImage")
        tex_s.image = bpy.data.images.load(visor_tex_path)
        # Invert or correct UV coordinates so eyes are upright
        links_s.new(tex_s.outputs["Color"], bsdf_s.inputs["Emission Color"])
    else:
        bsdf_s.inputs["Emission Color"].default_value = (0.0, 0.9, 1.0, 1.0)
    
    links_s.new(bsdf_s.outputs["BSDF"], out_s.inputs["Surface"])
    mats["visor_screen"] = mat_screen

    # 4. Tilak Decal Material (Alpha-blended vermilion with rice grains)
    mat_tilak = bpy.data.materials.new(name="M_Tilak_Decal")
    mat_tilak.use_nodes = True
    nodes_t = mat_tilak.node_tree.nodes
    links_t = mat_tilak.node_tree.links
    nodes_t.clear()

    out_t = nodes_t.new(type="ShaderNodeOutputMaterial")
    bsdf_t = nodes_t.new(type="ShaderNodeBsdfPrincipled")
    bsdf_t.inputs["Roughness"].default_value = 0.65

    if os.path.exists(tilak_tex_path):
        tex_t = nodes_t.new(type="ShaderNodeTexImage")
        tex_t.image = bpy.data.images.load(tilak_tex_path)
        links_t.new(tex_t.outputs["Color"], bsdf_t.inputs["Base Color"])
        links_t.new(tex_t.outputs["Alpha"], bsdf_t.inputs["Alpha"])
    else:
        bsdf_t.inputs["Base Color"].default_value = (0.82, 0.05, 0.08, 1.0)

    links_t.new(bsdf_t.outputs["BSDF"], out_t.inputs["Surface"])
    # Set blend mode for transparent decal
    mat_tilak.blend_method = 'BLEND' if hasattr(mat_tilak, 'blend_method') else 'BLEND'
    mats["tilak"] = mat_tilak

    # 5. Glowing Filament Bulb (Antenna Tips)
    mat_bulb_glass = bpy.data.materials.new(name="M_Bulb_Glass")
    mat_bulb_glass.use_nodes = True
    bsdf_bg = mat_bulb_glass.node_tree.nodes.get("Principled BSDF")
    if bsdf_bg:
        bsdf_bg.inputs["Base Color"].default_value = (0.98, 0.98, 0.95, 1.0)
        bsdf_bg.inputs["Roughness"].default_value = 0.03
        bsdf_bg.inputs["Transmission Weight"].default_value = 0.94
        bsdf_bg.inputs["IOR"].default_value = 1.50
    mats["bulb_glass"] = mat_bulb_glass

    mat_filament = bpy.data.materials.new(name="M_Bulb_Filament_Glow")
    mat_filament.use_nodes = True
    bsdf_fil = mat_filament.node_tree.nodes.get("Principled BSDF")
    if bsdf_fil:
        bsdf_fil.inputs["Base Color"].default_value = (1.0, 0.88, 0.45, 1.0)
        bsdf_fil.inputs["Emission Color"].default_value = (1.0, 0.88, 0.40, 1.0)
        bsdf_fil.inputs["Emission Strength"].default_value = 22.0
    mats["bulb_filament"] = mat_filament

    # 6. Hollow Hover Board Anti-Gravity Emitter Glow
    mat_hover = bpy.data.materials.new(name="M_Hollow_Hover_Glow")
    mat_hover.use_nodes = True
    bsdf_h = mat_hover.node_tree.nodes.get("Principled BSDF")
    if bsdf_h:
        bsdf_h.inputs["Base Color"].default_value = (1.0, 0.72, 0.15, 1.0)
        bsdf_h.inputs["Emission Color"].default_value = (1.0, 0.75, 0.20, 1.0)
        bsdf_h.inputs["Emission Strength"].default_value = 16.0
    mats["hover"] = mat_hover

    # 7. Studio Teak Surface
    mat_desk = bpy.data.materials.new(name="M_Studio_Teak_Desk")
    mat_desk.use_nodes = True
    bsdf_d = mat_desk.node_tree.nodes.get("Principled BSDF")
    if bsdf_d:
        bsdf_d.inputs["Base Color"].default_value = (0.16, 0.09, 0.06, 1.0)
        bsdf_d.inputs["Roughness"].default_value = 0.28
        bsdf_d.inputs["Coat Weight"].default_value = 0.5
        bsdf_d.inputs["Coat Roughness"].default_value = 0.06
    mats["desk"] = mat_desk

    return mats

def build_ai_puttar():
    reset_scene()
    tex_dir = r"D:\New folder (2)\blender_engine\assets\textures"
    mats = setup_materials(tex_dir)

    # Master Root
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    master_root = bpy.context.active_object
    master_root.name = "Puttar_Master_Root"

    # =========================================================================
    # 1. TORSO / BODY (Oval Capsule with Golden Panel Strips)
    # =========================================================================
    torso = create_quad_capsule(
        name="Puttar_Torso",
        radius=0.42,
        scale=(0.86, 0.78, 1.18),
        location=(0, 0, 0.65),
        subd_levels=3
    )
    torso.data.materials.append(mats["shell"])
    torso.parent = master_root

    # Golden Accent Strips across the Torso
    # Waistband Gold Strip
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.355,
        minor_radius=0.007,
        location=(0, 0, 0.65),
        major_segments=48,
        minor_segments=16
    )
    torso_waist = bpy.context.active_object
    torso_waist.name = "Puttar_Torso_Waist_Strip"
    torso_waist.scale = (0.86, 0.78, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    torso_waist.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    torso_waist.parent = torso

    # Lower Hip Accent Strip
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.295,
        minor_radius=0.006,
        location=(0, 0, 0.38),
        major_segments=48,
        minor_segments=16
    )
    torso_hip = bpy.context.active_object
    torso_hip.name = "Puttar_Torso_Hip_Strip"
    torso_hip.scale = (0.86, 0.78, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    torso_hip.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    torso_hip.parent = torso

    # Neck Magnetic Decoupled Collar Ring
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.22,
        minor_radius=0.022,
        location=(0, 0, 1.06),
        major_segments=48,
        minor_segments=24
    )
    neck_ring = bpy.context.active_object
    neck_ring.name = "Puttar_Neck_Gold_Ring"
    neck_ring.scale = (0.88, 0.82, 0.8)
    bpy.ops.object.transform_apply(scale=True)
    neck_ring.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    neck_ring.parent = torso

    # =========================================================================
    # 2. HEAD ASSEMBLY (Oval Head, OLED Visor, Gold Rim, Tilak)
    # =========================================================================
    head = create_quad_capsule(
        name="Puttar_Head",
        radius=0.40,
        scale=(0.92, 0.84, 1.12),
        location=(0, 0, 1.45),
        subd_levels=3
    )
    head.data.materials.append(mats["shell"])
    head.parent = master_root # Independent pivot for head gestures

    # Crown Gold Accent Strip (Running across skull crown)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.34,
        minor_radius=0.006,
        location=(0, 0, 1.62),
        major_segments=48,
        minor_segments=16
    )
    head_crown = bpy.context.active_object
    head_crown.name = "Puttar_Head_Crown_Strip"
    head_crown.scale = (0.88, 0.80, 0.9)
    bpy.ops.object.transform_apply(scale=True)
    head_crown.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    head_crown.parent = head

    # OLED Visor Screen (Slightly protruding curved surface on front face)
    visor = create_quad_capsule(
        name="Puttar_Visor_OLED",
        radius=0.33,
        scale=(0.88, 0.38, 0.54),
        location=(0, -0.22, 1.42),
        subd_levels=2
    )
    visor.data.materials.append(mats["visor_screen"])
    visor.parent = head

    # Set up clean UV map for the visor face texture
    bpy.context.view_layer.objects.active = visor
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.uv.sphere_project(clip_to_bounds=True)
    bpy.ops.object.mode_set(mode='OBJECT')

    # Gold Bezel framing the Visor screen
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.23,
        minor_radius=0.008,
        location=(0, -0.235, 1.42),
        major_segments=48,
        minor_segments=16
    )
    visor_bezel = bpy.context.active_object
    visor_bezel.name = "Puttar_Visor_Gold_Bezel"
    visor_bezel.rotation_euler = (math.radians(90), 0, 0)
    visor_bezel.scale = (1.14, 0.72, 1.0)
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    visor_bezel.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    visor_bezel.parent = head

    # Red Tilak Decal Mesh (Curved patch directly above visor)
    bpy.ops.mesh.primitive_plane_add(size=0.10, location=(0, -0.32, 1.66))
    tilak_obj = bpy.context.active_object
    tilak_obj.name = "Puttar_Tilak_Decal"
    tilak_obj.scale = (0.6, 1.2, 1.0)
    tilak_obj.rotation_euler = (math.radians(72), 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    tilak_obj.data.materials.append(mats["tilak"])
    tilak_obj.parent = head

    # =========================================================================
    # 3. SPRING ANTENNAS (Coiled Helical Springs with Glowing Filament Bulbs)
    # =========================================================================
    for side, sign in [("L", -1), ("R", 1)]:
        # Gold Base Socket
        sock = create_quad_capsule(
            name=f"Puttar_Antenna_Socket_{side}",
            radius=0.024,
            scale=(1.0, 1.0, 0.5),
            location=(sign * 0.16, 0.05, 1.83),
            subd_levels=1
        )
        sock.data.materials.append(mats["gold"])
        sock.parent = head

        # Spring Wire
        spring = create_spring_antenna(
            name=f"Puttar_Antenna_Spring_{side}",
            side=side,
            turns=5.0,
            radius=0.020,
            height=0.22,
            points_count=80
        )
        spring.location = (sign * 0.16, 0.05, 1.84)
        spring.data.materials.append(mats["gold"])
        spring.parent = head

        # Tip Bulb Assembly
        tip_x = sign * (0.16 + 0.22 * math.sin(math.radians(18)))
        tip_z = 1.84 + 0.22 * math.cos(math.radians(18))
        tip_y = 0.05

        # Gold Bulb Socket Cap
        cap = create_quad_capsule(
            name=f"Puttar_Bulb_Cap_{side}",
            radius=0.016,
            scale=(1.0, 1.0, 0.6),
            location=(tip_x, tip_y, tip_z),
            subd_levels=1
        )
        cap.data.materials.append(mats["gold"])
        cap.parent = spring

        # Glass Bulb
        bulb = create_quad_capsule(
            name=f"Puttar_Bulb_Glass_{side}",
            radius=0.040,
            scale=(1.0, 1.0, 1.18),
            location=(tip_x, tip_y, tip_z + 0.030),
            subd_levels=2
        )
        bulb.data.materials.append(mats["bulb_glass"])
        bulb.parent = spring

        # Glowing Filament
        fil = create_quad_capsule(
            name=f"Puttar_Bulb_Filament_{side}",
            radius=0.022,
            scale=(0.7, 0.7, 1.0),
            location=(tip_x, tip_y, tip_z + 0.030),
            subd_levels=1
        )
        fil.data.materials.append(mats["bulb_filament"])
        fil.parent = spring

        # Point Light inside bulb
        b_light = bpy.data.lights.new(name=f"Light_Bulb_{side}", type='POINT')
        b_light.energy = 12.0
        b_light.color = (1.0, 0.88, 0.40)
        b_light_obj = bpy.data.objects.new(f"Light_Bulb_Obj_{side}", b_light)
        bpy.context.collection.objects.link(b_light_obj)
        b_light_obj.location = (tip_x, tip_y, tip_z + 0.030)
        b_light_obj.parent = fil

    # =========================================================================
    # 4. DECOUPLED FLOATING HANDS (Sleek Oval Wing/Pebble Pads)
    # =========================================================================
    # Left Floating Hand (Aerodynamic Oval Wing Pad)
    hand_l = create_quad_capsule(
        name="Puttar_Hand_L",
        radius=0.10,
        scale=(0.55, 0.26, 1.20),
        location=(-0.46, -0.10, 0.66),
        subd_levels=2
    )
    # Gentle hovering gesture angle
    hand_l.rotation_euler = (math.radians(12), math.radians(24), math.radians(-10))
    bpy.ops.object.transform_apply(rotation=True)
    hand_l.data.materials.append(mats["shell"])
    hand_l.parent = master_root

    # Gold Accent Seam on Hand L
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.095,
        minor_radius=0.005,
        location=(-0.46, -0.10, 0.66),
        major_segments=36,
        minor_segments=12
    )
    hand_l_gold = bpy.context.active_object
    hand_l_gold.name = "Puttar_Hand_L_Gold_Trim"
    hand_l_gold.scale = (0.55, 0.26, 1.20)
    bpy.ops.object.transform_apply(scale=True)
    hand_l_gold.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    hand_l_gold.parent = hand_l

    # Right Floating Hand (Aerodynamic Oval Wing Pad)
    hand_r = create_quad_capsule(
        name="Puttar_Hand_R",
        radius=0.10,
        scale=(0.55, 0.26, 1.20),
        location=(0.46, -0.12, 0.68),
        subd_levels=2
    )
    hand_r.rotation_euler = (math.radians(-10), math.radians(-24), math.radians(12))
    bpy.ops.object.transform_apply(rotation=True)
    hand_r.data.materials.append(mats["shell"])
    hand_r.parent = master_root

    # Gold Accent Seam on Hand R
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.095,
        minor_radius=0.005,
        location=(0.46, -0.12, 0.68),
        major_segments=36,
        minor_segments=12
    )
    hand_r_gold = bpy.context.active_object
    hand_r_gold.name = "Puttar_Hand_R_Gold_Trim"
    hand_r_gold.scale = (0.55, 0.26, 1.20)
    bpy.ops.object.transform_apply(scale=True)
    hand_r_gold.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    hand_r_gold.parent = hand_r

    # =========================================================================
    # 5. HOLLOW HOVERING BOARD (Anti-Gravity Floating Halo Disc)
    # =========================================================================
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.30,
        minor_radius=0.038,
        location=(0, 0, 0.12),
        major_segments=54,
        minor_segments=24
    )
    hover_chassis = bpy.context.active_object
    hover_chassis.name = "Puttar_Hover_Board_Chassis"
    hover_chassis.scale = (1.0, 0.90, 0.55)
    bpy.ops.object.transform_apply(scale=True)
    hover_chassis.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    hover_chassis.parent = master_root

    # Inner Amber Anti-Gravity Energy Emitter Ring (Hollow Center!)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.25,
        minor_radius=0.014,
        location=(0, 0, 0.12),
        major_segments=48,
        minor_segments=16
    )
    hover_emitter = bpy.context.active_object
    hover_emitter.name = "Puttar_Hover_Energy_Ring"
    hover_emitter.scale = (1.0, 0.90, 0.6)
    bpy.ops.object.transform_apply(scale=True)
    hover_emitter.data.materials.append(mats["hover"])
    bpy.ops.object.shade_smooth()
    hover_emitter.parent = hover_chassis

    # Studio Teak Desk Surface
    bpy.ops.mesh.primitive_plane_add(size=14.0, location=(0, 0, -0.15))
    desk = bpy.context.active_object
    desk.name = "Studio_Desk"
    desk.data.materials.append(mats["desk"])

    # =========================================================================
    # 6. CAMERA & LIGHTING RIG
    # =========================================================================
    cam_data = bpy.data.cameras.new("Puttar_Hero_Camera")
    cam_data.lens = 55.0
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = 3.65
    cam_data.dof.aperture_fstop = 3.2

    cam_obj = bpy.data.objects.new("Camera_Master", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    cam_obj.location = (0.18, -3.70, 1.15)
    cam_obj.rotation_euler = (math.radians(88), 0.0, math.radians(2.8))

    # 3-Point Studio Lighting
    key_l = bpy.data.lights.new("Key", 'AREA')
    key_l.energy = 220.0
    key_l.color = (1.0, 0.96, 0.88)
    key_l.size = 1.6
    ko = bpy.data.objects.new("Light_Key_Warm", key_l)
    bpy.context.collection.objects.link(ko)
    ko.location = (-2.2, -2.8, 2.4)
    ko.rotation_euler = (math.radians(50), math.radians(-16), math.radians(-35))

    fill_l = bpy.data.lights.new("Fill", 'AREA')
    fill_l.energy = 75.0
    fill_l.color = (0.85, 0.92, 1.0)
    fill_l.size = 2.0
    fo = bpy.data.objects.new("Light_Fill_Cool", fill_l)
    bpy.context.collection.objects.link(fo)
    fo.location = (2.4, -2.0, 1.8)
    fo.rotation_euler = (math.radians(45), math.radians(20), math.radians(55))

    rim_l = bpy.data.lights.new("Rim", 'AREA')
    rim_l.energy = 340.0
    rim_l.color = (1.0, 0.98, 0.95)
    rim_l.size = 1.2
    ro = bpy.data.objects.new("Light_Rim_Sharp", rim_l)
    bpy.context.collection.objects.link(ro)
    ro.location = (1.8, 2.2, 2.5)
    ro.rotation_euler = (math.radians(-50), math.radians(25), math.radians(140))

    hover_spot = bpy.data.lights.new("Hover_Pool_Spot", 'SPOT')
    hover_spot.energy = 70.0
    hover_spot.color = (1.0, 0.72, 0.15)
    hover_spot.spot_size = math.radians(95)
    hover_spot.spot_blend = 0.5
    hso = bpy.data.objects.new("Light_Hover_Spot", hover_spot)
    bpy.context.collection.objects.link(hso)
    hso.location = (0, 0, 0.16)
    hso.rotation_euler = (math.radians(180), 0, 0)
    hso.parent = hover_chassis

    # Configure Render
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'

    if hasattr(scene.view_settings, "view_transform"):
        try:
            scene.view_settings.view_transform = 'AgX'
            scene.view_settings.look = 'AgX - High Contrast'
        except Exception:
            try:
                scene.view_settings.view_transform = 'Filmic'
                scene.view_settings.look = 'High Contrast'
            except Exception:
                pass

    # Save Master Blend
    blend_path = r"D:\New folder (2)\blender_engine\assets\desi_library\ai_puttar_modular_chassis.blend"
    os.makedirs(os.path.dirname(blend_path), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Master Modular Blend Saved: {blend_path}")

    # Render Preview Still
    render_out = r"D:\New folder (2)\blender_engine\output\ai_puttar_modular_v2_render.png"
    scene.render.filepath = render_out
    print("Rendering Modular V2...")
    bpy.ops.render.render(write_still=True)
    print(f"Render Complete: {render_out}")

if __name__ == "__main__":
    build_ai_puttar()
