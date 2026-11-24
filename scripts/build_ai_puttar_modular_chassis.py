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

def create_spring_antenna(name, side="L", turns=4.5, radius=0.018, height=0.22, points_count=70):
    """Creates a true helical coiled spring wire with smooth quad bevel depth."""
    sign = -1.0 if side == "L" else 1.0
    
    curve_data = bpy.data.curves.new(name=f"{name}_Curve", type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.bevel_depth = 0.0045 # Spring wire thickness
    curve_data.bevel_resolution = 4
    
    spline = curve_data.splines.new(type='NURBS')
    spline.points.add(points_count - 1)
    
    # Helical coil formula with slight outward tilt
    tilt_angle = math.radians(22) * sign
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
    
    spline.use_endpoint_u = True
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
    nodes = mat_shell.node_tree.nodes
    links = mat_shell.node_tree.links
    nodes.clear()

    out_shell = nodes.new(type="ShaderNodeOutputMaterial")
    out_shell.location = (600, 0)
    bsdf_shell = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf_shell.location = (300, 0)
    bsdf_shell.inputs["Base Color"].default_value = (0.97, 0.97, 0.99, 1.0)
    bsdf_shell.inputs["Roughness"].default_value = 0.08
    bsdf_shell.inputs["Coat Weight"].default_value = 1.0
    bsdf_shell.inputs["Coat Roughness"].default_value = 0.02
    bsdf_shell.inputs["Subsurface Weight"].default_value = 0.05
    bsdf_shell.inputs["Subsurface Radius"].default_value = (0.9, 0.6, 0.4)

    # Tilak Decal Integration on Forehead
    if os.path.exists(tilak_tex_path):
        tex_tilak = nodes.new(type="ShaderNodeTexImage")
        tex_tilak.location = (-300, 200)
        tex_tilak.image = bpy.data.images.load(tilak_tex_path)
        tex_tilak.extension = 'CLIP'

        coord = nodes.new(type="ShaderNodeTexCoord")
        coord.location = (-700, 200)

        mapping = nodes.new(type="ShaderNodeMapping")
        mapping.location = (-500, 200)
        mapping.inputs["Location"].default_value = (0.0, -0.22, -1.62)
        mapping.inputs["Scale"].default_value = (4.8, 4.8, 4.8)
        mapping.inputs["Rotation"].default_value = (math.radians(-90), 0.0, 0.0)

        links.new(coord.outputs["Object"], mapping.inputs["Vector"])
        links.new(mapping.outputs["Vector"], tex_tilak.inputs["Vector"])

        mix_col = nodes.new(type="ShaderNodeMix")
        mix_col.data_type = 'RGBA'
        mix_col.location = (50, 200)
        mix_col.inputs["A"].default_value = (0.97, 0.97, 0.99, 1.0)
        links.new(tex_tilak.outputs["Alpha"], mix_col.inputs["Factor"])
        links.new(tex_tilak.outputs["Color"], mix_col.inputs["B"])
        links.new(mix_col.outputs["Result"], bsdf_shell.inputs["Base Color"])

        bump = nodes.new(type="ShaderNodeBump")
        bump.location = (50, -150)
        bump.inputs["Strength"].default_value = 0.35
        bump.inputs["Distance"].default_value = 0.003
        links.new(tex_tilak.outputs["Alpha"], bump.inputs["Height"])
        links.new(bump.outputs["Normal"], bsdf_shell.inputs["Normal"])
    
    links.new(bsdf_shell.outputs["BSDF"], out_shell.inputs["Surface"])
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

    # 3. Visor OLED Emissive Screen
    mat_screen = bpy.data.materials.new(name="M_Visor_OLED_Screen")
    mat_screen.use_nodes = True
    nodes_s = mat_screen.node_tree.nodes
    links_s = mat_screen.node_tree.links
    nodes_s.clear()

    out_s = nodes_s.new(type="ShaderNodeOutputMaterial")
    bsdf_s = nodes_s.new(type="ShaderNodeBsdfPrincipled")
    bsdf_s.inputs["Base Color"].default_value = (0.01, 0.012, 0.018, 1.0)
    bsdf_s.inputs["Roughness"].default_value = 0.4
    bsdf_s.inputs["Emission Strength"].default_value = 8.5

    if os.path.exists(visor_tex_path):
        tex_s = nodes_s.new(type="ShaderNodeTexImage")
        tex_s.image = bpy.data.images.load(visor_tex_path)
        links_s.new(tex_s.outputs["Color"], bsdf_s.inputs["Emission Color"])
        links_s.new(tex_s.outputs["Color"], bsdf_s.inputs["Base Color"])
    else:
        bsdf_s.inputs["Emission Color"].default_value = (0.0, 0.9, 1.0, 1.0)
    
    links_s.new(bsdf_s.outputs["BSDF"], out_s.inputs["Surface"])
    mats["visor_screen"] = mat_screen

    # 4. Visor Curved Protective Glass Lens
    mat_glass = bpy.data.materials.new(name="M_Visor_Glass_Lens")
    mat_glass.use_nodes = True
    bsdf_gl = mat_glass.node_tree.nodes.get("Principled BSDF")
    if bsdf_gl:
        bsdf_gl.inputs["Base Color"].default_value = (0.012, 0.014, 0.02, 1.0)
        bsdf_gl.inputs["Roughness"].default_value = 0.02
        bsdf_gl.inputs["Transmission Weight"].default_value = 0.85
        bsdf_gl.inputs["IOR"].default_value = 1.52
        bsdf_gl.inputs["Coat Weight"].default_value = 0.8
        bsdf_gl.inputs["Coat Roughness"].default_value = 0.01
    mats["visor_glass"] = mat_glass

    # 5. Glowing Filament Bulb (Antenna Tips)
    mat_bulb_glass = bpy.data.materials.new(name="M_Bulb_Glass")
    mat_bulb_glass.use_nodes = True
    bsdf_bg = mat_bulb_glass.node_tree.nodes.get("Principled BSDF")
    if bsdf_bg:
        bsdf_bg.inputs["Base Color"].default_value = (0.98, 0.98, 0.95, 1.0)
        bsdf_bg.inputs["Roughness"].default_value = 0.04
        bsdf_bg.inputs["Transmission Weight"].default_value = 0.92
        bsdf_bg.inputs["IOR"].default_value = 1.50
    mats["bulb_glass"] = mat_bulb_glass

    mat_filament = bpy.data.materials.new(name="M_Bulb_Filament_Glow")
    mat_filament.use_nodes = True
    bsdf_fil = mat_filament.node_tree.nodes.get("Principled BSDF")
    if bsdf_fil:
        bsdf_fil.inputs["Base Color"].default_value = (1.0, 0.85, 0.40, 1.0)
        bsdf_fil.inputs["Emission Color"].default_value = (1.0, 0.85, 0.35, 1.0)
        bsdf_fil.inputs["Emission Strength"].default_value = 15.0
    mats["bulb_filament"] = mat_filament

    # 6. Hollow Hover Board Anti-Gravity Emitter Glow
    mat_hover = bpy.data.materials.new(name="M_Hollow_Hover_Glow")
    mat_hover.use_nodes = True
    bsdf_h = mat_hover.node_tree.nodes.get("Principled BSDF")
    if bsdf_h:
        bsdf_h.inputs["Base Color"].default_value = (1.0, 0.72, 0.15, 1.0)
        bsdf_h.inputs["Emission Color"].default_value = (1.0, 0.75, 0.20, 1.0)
        bsdf_h.inputs["Emission Strength"].default_value = 14.0
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

def build_ai_puttar_modular_system():
    reset_scene()
    tex_dir = r"D:\New folder (2)\blender_engine\assets\textures"
    mats = setup_materials(tex_dir)

    # Master Root Empty
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    master_root = bpy.context.active_object
    master_root.name = "Puttar_Master_Root"

    # =========================================================================
    # 1. TORSO / BODY (Sleek White Oval Pod with Golden Panel Strips)
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
    # 1a. Waist Circumference Gold Ring
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.36,
        minor_radius=0.007,
        location=(0, 0, 0.65),
        major_segments=48,
        minor_segments=16
    )
    torso_waist_strip = bpy.context.active_object
    torso_waist_strip.name = "Puttar_Torso_Waist_Gold_Strip"
    torso_waist_strip.scale = (0.86, 0.78, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    torso_waist_strip.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    torso_waist_strip.parent = torso

    # 1b. Lower Hip Gold Accent Ring
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.30,
        minor_radius=0.006,
        location=(0, 0, 0.38),
        major_segments=48,
        minor_segments=16
    )
    torso_hip_strip = bpy.context.active_object
    torso_hip_strip.name = "Puttar_Torso_Hip_Gold_Strip"
    torso_hip_strip.scale = (0.86, 0.78, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    torso_hip_strip.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    torso_hip_strip.parent = torso

    # 1c. Magnetic Decoupled Collar Ring (Floating Head Gap)
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
    # 2. HEAD ASSEMBLY (Oval Head, Flush OLED Visor, Gold Rim, Tilak)
    # =========================================================================
    head = create_quad_capsule(
        name="Puttar_Head",
        radius=0.40,
        scale=(0.92, 0.84, 1.12),
        location=(0, 0, 1.45),
        subd_levels=3
    )
    head.data.materials.append(mats["shell"])
    head.parent = master_root # Independent pivot for 360 yaw, pitch, roll

    # Head Golden Panel Strips (Running over crown and framing sides)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.35,
        minor_radius=0.006,
        location=(0, 0, 1.62),
        major_segments=48,
        minor_segments=16
    )
    head_crown_strip = bpy.context.active_object
    head_crown_strip.name = "Puttar_Head_Crown_Gold_Strip"
    head_crown_strip.scale = (0.88, 0.80, 0.9)
    bpy.ops.object.transform_apply(scale=True)
    head_crown_strip.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    head_crown_strip.parent = head

    # OLED Visor Display (Mounted flush on front face curve)
    visor_screen = create_quad_capsule(
        name="Puttar_Visor_OLED",
        radius=0.34,
        scale=(0.88, 0.45, 0.58),
        location=(0, -0.21, 1.44),
        subd_levels=2
    )
    visor_screen.data.materials.append(mats["visor_screen"])
    visor_screen.parent = head

    # UV Sphere Project for facial expressions
    bpy.context.view_layer.objects.active = visor_screen
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.uv.sphere_project(clip_to_bounds=True)
    bpy.ops.object.mode_set(mode='OBJECT')

    # Curved Glass Lens (Sitting directly 3mm over OLED screen)
    visor_glass = create_quad_capsule(
        name="Puttar_Visor_Glass",
        radius=0.345,
        scale=(0.89, 0.46, 0.59),
        location=(0, -0.214, 1.44),
        subd_levels=2
    )
    visor_glass.data.materials.append(mats["visor_glass"])
    visor_glass.parent = head

    # Polished Gold Visor Bezel Ring (Framing the black OLED glass!)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.24,
        minor_radius=0.008,
        location=(0, -0.24, 1.44),
        major_segments=48,
        minor_segments=16
    )
    visor_bezel = bpy.context.active_object
    visor_bezel.name = "Puttar_Visor_Gold_Bezel"
    visor_bezel.rotation_euler = (math.radians(90), 0, 0)
    visor_bezel.scale = (1.18, 0.82, 1.0)
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    visor_bezel.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    visor_bezel.parent = head

    # =========================================================================
    # 3. SPRING ANTENNAS (Coiled Helical Springs with Glowing Filament Bulbs)
    # =========================================================================
    for side, sign in [("L", -1), ("R", 1)]:
        # Gold Mounting Base Socket on Cranial Shell
        base_sock = create_quad_capsule(
            name=f"Puttar_Antenna_Socket_{side}",
            radius=0.024,
            scale=(1.0, 1.0, 0.5),
            location=(sign * 0.17, 0.05, 1.83),
            subd_levels=1
        )
        base_sock.data.materials.append(mats["gold"])
        base_sock.parent = head

        # Helical Coiled Spring Wire
        spring = create_spring_antenna(
            name=f"Puttar_Antenna_Spring_{side}",
            side=side,
            turns=4.5,
            radius=0.016,
            height=0.20,
            points_count=60
        )
        spring.location = (sign * 0.17, 0.05, 1.84)
        spring.data.materials.append(mats["gold"])
        spring.parent = head

        # Tip Bulb Assembly (Glass Orb + Inner Glowing Filament)
        # Tip coordinates calculated from spring height & angle
        tip_x = sign * (0.17 + 0.20 * math.sin(math.radians(22)))
        tip_z = 1.84 + 0.20 * math.cos(math.radians(22))
        tip_y = 0.05

        # Gold Socket Cap at Spring Tip
        bulb_cap = create_quad_capsule(
            name=f"Puttar_Bulb_Cap_{side}",
            radius=0.014,
            scale=(1.0, 1.0, 0.6),
            location=(tip_x, tip_y, tip_z),
            subd_levels=1
        )
        bulb_cap.data.materials.append(mats["gold"])
        bulb_cap.parent = spring

        # Glass Bulb (Clear outer envelope)
        bulb_glass = create_quad_capsule(
            name=f"Puttar_Bulb_Glass_{side}",
            radius=0.034,
            scale=(1.0, 1.0, 1.15),
            location=(tip_x, tip_y, tip_z + 0.025),
            subd_levels=2
        )
        bulb_glass.data.materials.append(mats["bulb_glass"])
        bulb_glass.parent = spring

        # Inner Glowing Filament / Mini Light Core
        filament = create_quad_capsule(
            name=f"Puttar_Bulb_Filament_{side}",
            radius=0.018,
            scale=(0.7, 0.7, 1.0),
            location=(tip_x, tip_y, tip_z + 0.025),
            subd_levels=1
        )
        filament.data.materials.append(mats["bulb_filament"])
        filament.parent = spring

        # Point Light inside the bulb to cast real ambient illumination!
        b_light = bpy.data.lights.new(name=f"Light_Bulb_{side}", type='POINT')
        b_light.energy = 8.0
        b_light.color = (1.0, 0.85, 0.35)
        b_light_obj = bpy.data.objects.new(f"Light_Bulb_Obj_{side}", b_light)
        bpy.context.collection.objects.link(b_light_obj)
        b_light_obj.location = (tip_x, tip_y, tip_z + 0.025)
        b_light_obj.parent = filament

    # =========================================================================
    # 4. DECOUPLED FLOATING HANDS (Sleek Oval Wing/Pebble Pads)
    # =========================================================================
    # Left Floating Hand (Aerodynamic Oval Pad)
    hand_l = create_quad_capsule(
        name="Puttar_Hand_L",
        radius=0.10,
        scale=(0.58, 0.28, 1.25), # Sleek, flat-oval pebble wing
        location=(-0.52, -0.06, 0.66),
        subd_levels=2
    )
    hand_l.rotation_euler = (math.radians(10), math.radians(20), math.radians(-15))
    bpy.ops.object.transform_apply(rotation=True)
    hand_l.data.materials.append(mats["shell"])
    hand_l.parent = master_root # Independent floating movement

    # Gold Accent Seam along Hand L Rim
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.10,
        minor_radius=0.005,
        location=(-0.52, -0.06, 0.66),
        major_segments=36,
        minor_segments=12
    )
    hand_l_gold = bpy.context.active_object
    hand_l_gold.name = "Puttar_Hand_L_Gold_Trim"
    hand_l_gold.scale = (0.58, 0.28, 1.25)
    bpy.ops.object.transform_apply(scale=True)
    hand_l_gold.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    hand_l_gold.parent = hand_l

    # Right Floating Hand (Aerodynamic Oval Pad)
    hand_r = create_quad_capsule(
        name="Puttar_Hand_R",
        radius=0.10,
        scale=(0.58, 0.28, 1.25),
        location=(0.52, -0.12, 0.68),
        subd_levels=2
    )
    hand_r.rotation_euler = (math.radians(-15), math.radians(-22), math.radians(20))
    bpy.ops.object.transform_apply(rotation=True)
    hand_r.data.materials.append(mats["shell"])
    hand_r.parent = master_root # Independent floating movement

    # Gold Accent Seam along Hand R Rim
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.10,
        minor_radius=0.005,
        location=(0.52, -0.12, 0.68),
        major_segments=36,
        minor_segments=12
    )
    hand_r_gold = bpy.context.active_object
    hand_r_gold.name = "Puttar_Hand_R_Gold_Trim"
    hand_r_gold.scale = (0.58, 0.28, 1.25)
    bpy.ops.object.transform_apply(scale=True)
    hand_r_gold.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()
    hand_r_gold.parent = hand_r

    # =========================================================================
    # 5. HOLLOW HOVERING BOARD (Anti-Gravity Floating Halo Disc)
    # =========================================================================
    # Outer Aerodynamic Hover Board Ring
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

    # Studio Teak Desk Surface (Ground plane reflecting warm lighting)
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

    # Full body portrait framing: captures from hover board (z=0.0) to antenna bulbs (z=2.15)
    cam_obj.location = (0.22, -3.75, 1.15)
    cam_obj.rotation_euler = (math.radians(88), 0.0, math.radians(3.5))

    # 3-Point Studio Lighting
    # 1. Warm Key Light
    key_l = bpy.data.lights.new("Key", 'AREA')
    key_l.energy = 220.0
    key_l.color = (1.0, 0.96, 0.88)
    key_l.size = 1.6
    ko = bpy.data.objects.new("Light_Key_Warm", key_l)
    bpy.context.collection.objects.link(ko)
    ko.location = (-2.2, -2.8, 2.4)
    ko.rotation_euler = (math.radians(50), math.radians(-16), math.radians(-35))

    # 2. Cool Fill Light
    fill_l = bpy.data.lights.new("Fill", 'AREA')
    fill_l.energy = 75.0
    fill_l.color = (0.85, 0.92, 1.0)
    fill_l.size = 2.0
    fo = bpy.data.objects.new("Light_Fill_Cool", fill_l)
    bpy.context.collection.objects.link(fo)
    fo.location = (2.4, -2.0, 1.8)
    fo.rotation_euler = (math.radians(45), math.radians(20), math.radians(55))

    # 3. Crisp Rim Backlight (Accentuates gold strips & clearcoat edges)
    rim_l = bpy.data.lights.new("Rim", 'AREA')
    rim_l.energy = 340.0
    rim_l.color = (1.0, 0.98, 0.95)
    rim_l.size = 1.2
    ro = bpy.data.objects.new("Light_Rim_Sharp", rim_l)
    bpy.context.collection.objects.link(ro)
    ro.location = (1.8, 2.2, 2.5)
    ro.rotation_euler = (math.radians(-50), math.radians(25), math.radians(140))

    # 4. Hollow Hover Spot (Casting amber pool on desk beneath hover board)
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

    # Save .blend master
    blend_path = r"D:\New folder (2)\blender_engine\assets\desi_library\ai_puttar_modular_chassis.blend"
    os.makedirs(os.path.dirname(blend_path), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Master Modular Blend Saved: {blend_path}")

    # Render Preview
    render_out = r"D:\New folder (2)\blender_engine\output\ai_puttar_modular_render.png"
    scene.render.filepath = render_out
    print("Rendering Master Modular Character...")
    bpy.ops.render.render(write_still=True)
    print(f"Render Complete: {render_out}")

if __name__ == "__main__":
    build_ai_puttar_modular_system()
