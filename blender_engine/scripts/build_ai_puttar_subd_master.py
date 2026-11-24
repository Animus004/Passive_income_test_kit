import bpy
import math
import os
import bmesh

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_subd_quad_sphere(name, radius=1.0, scale=(1.0, 1.0, 1.0), location=(0.0, 0.0, 0.0), subd_levels=2):
    """Creates a quad-topology sphere from a subdivided cube (no polar pinching)."""
    bpy.ops.mesh.primitive_cube_add(size=radius * 2.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    
    # Add Subdivision Surface modifier for pure quad roundness
    subd = obj.modifiers.new(name="Subdivision", type='SUBSURF')
    subd.levels = subd_levels
    subd.render_levels = subd_levels + 1
    subd.subdivision_type = 'CATMULL_CLARK'
    
    # Cast to sphere for perfect curvature
    cast = obj.modifiers.new(name="Cast", type='CAST')
    cast.cast_type = 'SPHERE'
    cast.factor = 1.0
    
    # Apply modifiers to get clean base geometry
    bpy.ops.object.modifier_apply(modifier="Subdivision")
    bpy.ops.object.modifier_apply(modifier="Cast")
    
    obj.scale = scale
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    return obj

def setup_materials(texture_dir):
    tilak_tex_path = os.path.join(texture_dir, "ai_puttar_tilak_decal.png")
    visor_tex_path = os.path.join(texture_dir, "ai_puttar_visor_screen.png")
    silk_bump_path = os.path.join(texture_dir, "silk_fabric_bump.png")
    
    mats = {}

    # =========================================================================
    # 1. Pearlescent Clearcoat Cranial Shell with Tilak Decal Integration
    # =========================================================================
    mat_shell = bpy.data.materials.new(name="M_Pearlescent_Shell")
    mat_shell.use_nodes = True
    nodes = mat_shell.node_tree.nodes
    links = mat_shell.node_tree.links
    nodes.clear()

    output_node = nodes.new(type="ShaderNodeOutputMaterial")
    output_node.location = (600, 0)

    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (300, 0)
    bsdf.inputs["Base Color"].default_value = (0.97, 0.97, 0.99, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.09
    bsdf.inputs["Coat Weight"].default_value = 1.0
    bsdf.inputs["Coat Roughness"].default_value = 0.02
    bsdf.inputs["Subsurface Weight"].default_value = 0.06
    bsdf.inputs["Subsurface Radius"].default_value = (0.9, 0.6, 0.4)

    # Tilak Decal Nodes (Mapped to Forehead via Object/Generated Coordinates)
    if os.path.exists(tilak_tex_path):
        tex_tilak = nodes.new(type="ShaderNodeTexImage")
        tex_tilak.location = (-300, 200)
        tex_tilak.image = bpy.data.images.load(tilak_tex_path)
        tex_tilak.extension = 'CLIP'

        coord = nodes.new(type="ShaderNodeTexCoord")
        coord.location = (-700, 200)

        mapping = nodes.new(type="ShaderNodeMapping")
        mapping.location = (-500, 200)
        mapping.inputs["Location"].default_value = (0.0, -0.22, -1.60)
        mapping.inputs["Scale"].default_value = (4.8, 4.8, 4.8)
        mapping.inputs["Rotation"].default_value = (math.radians(-90), 0.0, 0.0)

        links.new(coord.outputs["Object"], mapping.inputs["Vector"])
        links.new(mapping.outputs["Vector"], tex_tilak.inputs["Vector"])

        # Mix Base Color with Tilak Color
        mix_col = nodes.new(type="ShaderNodeMix")
        mix_col.data_type = 'RGBA'
        mix_col.location = (50, 200)
        mix_col.inputs["A"].default_value = (0.97, 0.97, 0.99, 1.0)
        links.new(tex_tilak.outputs["Alpha"], mix_col.inputs["Factor"])
        links.new(tex_tilak.outputs["Color"], mix_col.inputs["B"])
        links.new(mix_col.outputs["Result"], bsdf.inputs["Base Color"])

        # Tilak Micro-Bump (Rice and vermilion texture relief)
        bump = nodes.new(type="ShaderNodeBump")
        bump.location = (50, -150)
        bump.inputs["Strength"].default_value = 0.35
        bump.inputs["Distance"].default_value = 0.003
        links.new(tex_tilak.outputs["Alpha"], bump.inputs["Height"])
        links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    else:
        links.new(bsdf.outputs["BSDF"], output_node.inputs["Surface"])

    links.new(bsdf.outputs["BSDF"], output_node.inputs["Surface"])
    mats["shell"] = mat_shell

    # =========================================================================
    # 2. Visor Specular Glass (Curved Outer Lens)
    # =========================================================================
    mat_glass = bpy.data.materials.new(name="M_Visor_Glass")
    mat_glass.use_nodes = True
    nodes = mat_glass.node_tree.nodes
    bsdf_glass = nodes.get("Principled BSDF")
    if bsdf_glass:
        bsdf_glass.inputs["Base Color"].default_value = (0.015, 0.015, 0.025, 1.0)
        bsdf_glass.inputs["Roughness"].default_value = 0.02
        bsdf_glass.inputs["Transmission Weight"].default_value = 0.82
        bsdf_glass.inputs["IOR"].default_value = 1.52
        bsdf_glass.inputs["Coat Weight"].default_value = 0.6
        bsdf_glass.inputs["Coat Roughness"].default_value = 0.01
    mats["visor_glass"] = mat_glass

    # =========================================================================
    # 3. Visor OLED Emissive Display (Behind Glass)
    # =========================================================================
    mat_screen = bpy.data.materials.new(name="M_Visor_OLED_Screen")
    mat_screen.use_nodes = True
    nodes = mat_screen.node_tree.nodes
    links = mat_screen.node_tree.links
    nodes.clear()

    out_screen = nodes.new(type="ShaderNodeOutputMaterial")
    out_screen.location = (400, 0)

    bsdf_screen = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf_screen.location = (100, 0)
    bsdf_screen.inputs["Base Color"].default_value = (0.01, 0.012, 0.018, 1.0)
    bsdf_screen.inputs["Roughness"].default_value = 0.4
    bsdf_screen.inputs["Emission Strength"].default_value = 7.5

    if os.path.exists(visor_tex_path):
        tex_screen = nodes.new(type="ShaderNodeTexImage")
        tex_screen.location = (-250, 0)
        tex_screen.image = bpy.data.images.load(visor_tex_path)
        links.new(tex_screen.outputs["Color"], bsdf_screen.inputs["Emission Color"])
        links.new(tex_screen.outputs["Color"], bsdf_screen.inputs["Base Color"])
    else:
        bsdf_screen.inputs["Emission Color"].default_value = (0.0, 0.88, 1.0, 1.0)

    links.new(bsdf_screen.outputs["BSDF"], out_screen.inputs["Surface"])
    mats["visor_screen"] = mat_screen

    # =========================================================================
    # 4. Royal Blue Silk Nehru Jacket (With Sheen & Woven Fabric Bump)
    # =========================================================================
    mat_jacket = bpy.data.materials.new(name="M_Royal_Blue_Silk")
    mat_jacket.use_nodes = True
    nodes = mat_jacket.node_tree.nodes
    links = mat_jacket.node_tree.links
    bsdf_j = nodes.get("Principled BSDF")
    if bsdf_j:
        bsdf_j.inputs["Base Color"].default_value = (0.038, 0.11, 0.42, 1.0) # Deep vibrant royal blue
        bsdf_j.inputs["Roughness"].default_value = 0.36
        bsdf_j.inputs["Sheen Weight"].default_value = 0.95
        bsdf_j.inputs["Sheen Tint"].default_value = (0.35, 0.60, 1.0, 1.0)
        bsdf_j.inputs["Sheen Roughness"].default_value = 0.25

        if os.path.exists(silk_bump_path):
            tex_bump = nodes.new(type="ShaderNodeTexImage")
            tex_bump.location = (-400, -200)
            tex_bump.image = bpy.data.images.load(silk_bump_path)

            coord_j = nodes.new(type="ShaderNodeTexCoord")
            coord_j.location = (-800, -200)

            map_j = nodes.new(type="ShaderNodeMapping")
            map_j.location = (-600, -200)
            map_j.inputs["Scale"].default_value = (14.0, 14.0, 14.0)
            links.new(coord_j.outputs["Generated"], map_j.inputs["Vector"])
            links.new(map_j.outputs["Vector"], tex_bump.inputs["Vector"])

            bump_j = nodes.new(type="ShaderNodeBump")
            bump_j.location = (-150, -200)
            bump_j.inputs["Strength"].default_value = 0.22
            bump_j.inputs["Distance"].default_value = 0.001
            links.new(tex_bump.outputs["Color"], bump_j.inputs["Height"])
            links.new(bump_j.outputs["Normal"], bsdf_j.inputs["Normal"])
    mats["jacket"] = mat_jacket

    # =========================================================================
    # 5. Polished Antique Gold / Brass (Buttons, Antennas, Trim)
    # =========================================================================
    mat_gold = bpy.data.materials.new(name="M_Polished_Gold")
    mat_gold.use_nodes = True
    bsdf_g = mat_gold.node_tree.nodes.get("Principled BSDF")
    if bsdf_g:
        bsdf_g.inputs["Base Color"].default_value = (1.0, 0.82, 0.26, 1.0)
        bsdf_g.inputs["Metallic"].default_value = 0.98
        bsdf_g.inputs["Roughness"].default_value = 0.14
        bsdf_g.inputs["Coat Weight"].default_value = 0.4
        bsdf_g.inputs["Coat Roughness"].default_value = 0.02
    mats["gold"] = mat_gold

    # =========================================================================
    # 6. Red Silk Pocket Square
    # =========================================================================
    mat_red = bpy.data.materials.new(name="M_Red_Silk")
    mat_red.use_nodes = True
    bsdf_r = mat_red.node_tree.nodes.get("Principled BSDF")
    if bsdf_r:
        bsdf_r.inputs["Base Color"].default_value = (0.86, 0.05, 0.12, 1.0)
        bsdf_r.inputs["Roughness"].default_value = 0.32
        bsdf_r.inputs["Sheen Weight"].default_value = 0.92
        bsdf_r.inputs["Sheen Tint"].default_value = (1.0, 0.35, 0.35, 1.0)
    mats["red_silk"] = mat_red

    # =========================================================================
    # 7. Authentic Cutting Chai Glass & Tea Liquid
    # =========================================================================
    mat_cglass = bpy.data.materials.new(name="M_Chai_Glass")
    mat_cglass.use_nodes = True
    bsdf_cg = mat_cglass.node_tree.nodes.get("Principled BSDF")
    if bsdf_cg:
        bsdf_cg.inputs["Base Color"].default_value = (0.95, 0.98, 0.98, 1.0)
        bsdf_cg.inputs["Roughness"].default_value = 0.03
        bsdf_cg.inputs["Transmission Weight"].default_value = 0.92
        bsdf_cg.inputs["IOR"].default_value = 1.51
    mats["chai_glass"] = mat_cglass

    mat_tea = bpy.data.materials.new(name="M_Chai_Liquid")
    mat_tea.use_nodes = True
    bsdf_tea = mat_tea.node_tree.nodes.get("Principled BSDF")
    if bsdf_tea:
        bsdf_tea.inputs["Base Color"].default_value = (0.72, 0.44, 0.22, 1.0) # Rich milky spiced tea
        bsdf_tea.inputs["Roughness"].default_value = 0.08
        bsdf_tea.inputs["Subsurface Weight"].default_value = 0.25
        bsdf_tea.inputs["Subsurface Radius"].default_value = (0.7, 0.45, 0.25)
    mats["chai_liquid"] = mat_tea

    # =========================================================================
    # 8. Golden Anti-Gravity Hover Glow
    # =========================================================================
    mat_hover = bpy.data.materials.new(name="M_Hover_Glow")
    mat_hover.use_nodes = True
    bsdf_h = mat_hover.node_tree.nodes.get("Principled BSDF")
    if bsdf_h:
        bsdf_h.inputs["Base Color"].default_value = (1.0, 0.72, 0.15, 1.0)
        bsdf_h.inputs["Emission Color"].default_value = (1.0, 0.75, 0.2, 1.0)
        bsdf_h.inputs["Emission Strength"].default_value = 12.0
    mats["hover"] = mat_hover

    # =========================================================================
    # 9. Teak / Rosewood Studio Desk
    # =========================================================================
    mat_desk = bpy.data.materials.new(name="M_Rosewood_Desk")
    mat_desk.use_nodes = True
    bsdf_d = mat_desk.node_tree.nodes.get("Principled BSDF")
    if bsdf_d:
        bsdf_d.inputs["Base Color"].default_value = (0.16, 0.09, 0.06, 1.0)
        bsdf_d.inputs["Roughness"].default_value = 0.28
        bsdf_d.inputs["Coat Weight"].default_value = 0.5
        bsdf_d.inputs["Coat Roughness"].default_value = 0.08
    mats["desk"] = mat_desk

    return mats

def build_ai_puttar_subd(mats):
    # =========================================================================
    # 1. HEAD CRANIAL SHELL (Quad SubD Geometry)
    # =========================================================================
    # High-curvature cranial pod (tapered top, ergonomic cheek curvature)
    head = create_subd_quad_sphere(
        name="AI_Puttar_Head_Shell",
        radius=0.40,
        scale=(0.94, 0.88, 1.06),
        location=(0, 0, 1.44),
        subd_levels=3
    )
    head.data.materials.append(mats["shell"])

    # Inset Visor Cavity (Curved Boolean Cutter)
    cutter = create_subd_quad_sphere(
        name="Visor_Cutter_Boolean",
        radius=0.36,
        scale=(0.90, 0.65, 0.62),
        location=(0, -0.15, 1.42),
        subd_levels=2
    )
    
    # Apply Boolean Difference to carve out the flush visor socket
    mod_bool = head.modifiers.new(name="Visor_Pocket", type='BOOLEAN')
    mod_bool.operation = 'DIFFERENCE'
    mod_bool.object = cutter
    bpy.context.view_layer.objects.active = head
    bpy.ops.object.modifier_apply(modifier="Visor_Pocket")
    
    # Add smooth SubD on head after cut
    subd_head = head.modifiers.new(name="Smooth_Bezel", type='SUBSURF')
    subd_head.levels = 2
    subd_head.render_levels = 2
    
    # Hide/remove cutter
    bpy.data.objects.remove(cutter, do_unlink=True)

    # =========================================================================
    # 2. FLUSH CURVED OLED VISOR SCREEN & GLASS LENS
    # =========================================================================
    # Visor OLED Emissive Screen (Placed flush inside socket)
    screen = create_subd_quad_sphere(
        name="AI_Puttar_OLED_Display",
        radius=0.355,
        scale=(0.88, 0.62, 0.60),
        location=(0, -0.145, 1.42),
        subd_levels=2
    )
    screen.data.materials.append(mats["visor_screen"])
    # Unwrap UV for screen projection
    bpy.context.view_layer.objects.active = screen
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.uv.sphere_project(clip_to_bounds=True)
    bpy.ops.object.mode_set(mode='OBJECT')

    # Visor Specular Glass Lens (Seated snugly 3mm over the OLED screen)
    glass_lens = create_subd_quad_sphere(
        name="AI_Puttar_Visor_Glass",
        radius=0.362,
        scale=(0.89, 0.64, 0.61),
        location=(0, -0.148, 1.42),
        subd_levels=2
    )
    glass_lens.data.materials.append(mats["visor_glass"])

    # =========================================================================
    # 3. TWIN GOLDEN SPRING ANTENNAS (Curved Bezier with Glowing Amber Tips)
    # =========================================================================
    for side, sign in [("L", -1), ("R", 1)]:
        # Create Bezier Curve for elegant arc
        curve_data = bpy.data.curves.new(name=f"Antenna_Curve_{side}", type='CURVE')
        curve_data.dimensions = '3D'
        curve_data.bevel_depth = 0.012
        curve_data.bevel_resolution = 4
        
        spline = curve_data.splines.new(type='BEZIER')
        spline.bezier_points.add(2)
        
        # P0: Base on head
        spline.bezier_points[0].co = (sign * 0.16, 0.08, 1.82)
        spline.bezier_points[0].handle_left = (sign * 0.15, 0.06, 1.76)
        spline.bezier_points[0].handle_right = (sign * 0.20, 0.12, 1.90)
        
        # P1: Mid graceful arch
        spline.bezier_points[1].co = (sign * 0.24, 0.14, 1.98)
        spline.bezier_points[1].handle_left = (sign * 0.22, 0.12, 1.92)
        spline.bezier_points[1].handle_right = (sign * 0.26, 0.16, 2.04)
        
        # P2: Tip
        spline.bezier_points[2].co = (sign * 0.28, 0.18, 2.08)
        spline.bezier_points[2].handle_left = (sign * 0.27, 0.17, 2.05)
        spline.bezier_points[2].handle_right = (sign * 0.29, 0.19, 2.10)
        
        curve_obj = bpy.data.objects.new(f"Antenna_Stem_{side}", curve_data)
        bpy.context.collection.objects.link(curve_obj)
        curve_obj.data.materials.append(mats["gold"])
        
        # Golden Fitting Base Collar
        base_col = create_subd_quad_sphere(
            name=f"Antenna_Base_{side}",
            radius=0.026,
            scale=(1.0, 1.0, 0.6),
            location=(sign * 0.16, 0.08, 1.82),
            subd_levels=1
        )
        base_col.data.materials.append(mats["gold"])
        
        # Glowing Amber Orb Tip
        orb = create_subd_quad_sphere(
            name=f"Antenna_Orb_{side}",
            radius=0.038,
            scale=(1.0, 1.0, 1.0),
            location=(sign * 0.28, 0.18, 2.08),
            subd_levels=2
        )
        orb.data.materials.append(mats["hover"])

    # =========================================================================
    # 4. MAGNETIC DECOUPLED COLLAR RING (Head Floating Gap)
    # =========================================================================
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.22,
        minor_radius=0.024,
        location=(0, 0, 1.06),
        major_segments=48,
        minor_segments=24
    )
    neck_ring = bpy.context.active_object
    neck_ring.name = "Neck_Decoupled_Gold_Ring"
    neck_ring.scale = (0.92, 0.86, 0.8)
    bpy.ops.object.transform_apply(scale=True)
    neck_ring.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()

    # Dark mechanical magnetic core inside the gap
    core_pod = create_subd_quad_sphere(
        name="Neck_Magnetic_Core",
        radius=0.18,
        scale=(0.85, 0.80, 0.4),
        location=(0, 0, 1.06),
        subd_levels=1
    )
    core_pod.data.materials.append(mats["visor_glass"])

    # =========================================================================
    # 5. TORSO CAPSULE CORE
    # =========================================================================
    torso = create_subd_quad_sphere(
        name="Torso_Capsule_Core",
        radius=0.44,
        scale=(0.88, 0.80, 1.22),
        location=(0, 0, 0.62),
        subd_levels=3
    )
    torso.data.materials.append(mats["shell"])

    # =========================================================================
    # 6. TAILORED ROYAL BLUE SILK NEHRU JACKET (Garment Shell)
    # =========================================================================
    # Garment Shell wrapping torso cleanly with physical thickness
    jacket = create_subd_quad_sphere(
        name="Nehru_Jacket_Silk_Shell",
        radius=0.455,
        scale=(0.895, 0.815, 1.14),
        location=(0, -0.008, 0.62),
        subd_levels=2
    )
    jacket.data.materials.append(mats["jacket"])

    # Solidify modifier for genuine tailored cloth thickness (2.5mm)
    sol_j = jacket.modifiers.new(name="Cloth_Thickness", type='SOLIDIFY')
    sol_j.thickness = 0.016
    sol_j.offset = 1.0
    
    # SubD for smooth cloth drape
    subd_j = jacket.modifiers.new(name="Cloth_SubD", type='SUBSURF')
    subd_j.levels = 2

    # Mandarin Standing Collar (Wrapped snugly around neck opening)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.26,
        minor_radius=0.038,
        location=(0, 0, 1.02),
        major_segments=48,
        minor_segments=24
    )
    collar = bpy.context.active_object
    collar.name = "Mandarin_Collar_Silk"
    collar.scale = (0.88, 0.82, 0.85)
    bpy.ops.object.transform_apply(scale=True)
    collar.data.materials.append(mats["jacket"])
    bpy.ops.object.shade_smooth()

    # Fine Gold Zari Embroidery Piping on Collar Rim
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.27,
        minor_radius=0.009,
        location=(0, 0, 1.05),
        major_segments=48,
        minor_segments=16
    )
    zari_piping = bpy.context.active_object
    zari_piping.name = "Collar_Zari_Piping_Gold"
    zari_piping.scale = (0.88, 0.82, 0.9)
    bpy.ops.object.transform_apply(scale=True)
    zari_piping.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()

    # Front Button Placket (Center vertical overlap seam)
    bpy.ops.mesh.primitive_cube_add(size=0.02, location=(0, -0.38, 0.62))
    placket = bpy.context.active_object
    placket.name = "Jacket_Front_Placket"
    placket.scale = (2.4, 0.25, 27.0)
    bpy.ops.object.transform_apply(scale=True)
    placket.data.materials.append(mats["jacket"])
    bpy.ops.object.shade_smooth()
    
    # Bevel on placket edges for realistic cloth seam
    bev_p = placket.modifiers.new(name="Seam_Bevel", type='BEVEL')
    bev_p.width = 0.004
    bev_p.segments = 3

    # 5 Ornate Engraved Brass Dome Buttons
    for b_idx in range(5):
        bz = 0.86 - (b_idx * 0.115)
        btn = create_subd_quad_sphere(
            name=f"Brass_Dome_Button_{b_idx + 1}",
            radius=0.024,
            scale=(1.0, 0.42, 1.0),
            location=(0, -0.392, bz),
            subd_levels=1
        )
        btn.data.materials.append(mats["gold"])

    # Left Welt Breast Pocket
    bpy.ops.mesh.primitive_cube_add(size=0.01, location=(-0.17, -0.355, 0.77))
    pocket = bpy.context.active_object
    pocket.name = "Jacket_Welt_Pocket"
    pocket.scale = (8.5, 0.35, 1.6)
    bpy.ops.object.transform_apply(scale=True)
    pocket.data.materials.append(mats["jacket"])
    bev_pkt = pocket.modifiers.new(name="Bevel", type='BEVEL')
    bev_pkt.width = 0.003
    bev_pkt.segments = 2

    # Folded Red Silk Pocket Square (Triangular peak peeking out of welt pocket)
    sq = create_subd_quad_sphere(
        name="Red_Silk_Pocket_Square",
        radius=0.038,
        scale=(0.85, 0.28, 1.35),
        location=(-0.17, -0.362, 0.81),
        subd_levels=1
    )
    sq.rotation_euler = (0, math.radians(18), math.radians(-8))
    bpy.ops.object.transform_apply(rotation=True)
    sq.data.materials.append(mats["red_silk"])

    # Bottom Hem Gold Piping
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.38,
        minor_radius=0.011,
        location=(0, 0, 0.25),
        major_segments=48,
        minor_segments=16
    )
    hem_trim = bpy.context.active_object
    hem_trim.name = "Jacket_Hem_Gold_Trim"
    hem_trim.scale = (0.89, 0.81, 0.9)
    bpy.ops.object.transform_apply(scale=True)
    hem_trim.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()

    # =========================================================================
    # 7. DECOUPLED FLOATING HANDS & CUTTING CHAI GLASS
    # =========================================================================
    # Left Floating Hand (Casual hovering pose)
    hand_l = create_subd_quad_sphere(
        name="Hand_Pod_L",
        radius=0.09,
        scale=(1.1, 0.75, 0.85),
        location=(-0.48, -0.06, 0.65),
        subd_levels=2
    )
    hand_l.data.materials.append(mats["shell"])

    # Right Floating Hand (Holding the Cutting Chai Glass!)
    hand_r = create_subd_quad_sphere(
        name="Hand_Pod_R",
        radius=0.09,
        scale=(1.05, 0.78, 0.85),
        location=(0.46, -0.22, 0.66),
        subd_levels=2
    )
    hand_r.rotation_euler = (math.radians(-12), math.radians(18), math.radians(-15))
    bpy.ops.object.transform_apply(rotation=True)
    hand_r.data.materials.append(mats["shell"])

    # Knuckle Accent Rings (Gold joint detail)
    for h_name, h_loc in [("L", (-0.48, -0.06, 0.65)), ("R", (0.46, -0.22, 0.66))]:
        ring = create_subd_quad_sphere(
            name=f"Hand_Knuckle_Ring_{h_name}",
            radius=0.075,
            scale=(1.05, 0.15, 0.8),
            location=h_loc,
            subd_levels=1
        )
        ring.data.materials.append(mats["gold"])

    # Cutting Chai Fluted Glass
    # Glass Outer Cup (SubD Cylinder with tapered fluted profile)
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.065,
        depth=0.15,
        location=(0.46, -0.32, 0.72),
        vertices=24
    )
    glass = bpy.context.active_object
    glass.name = "Cutting_Chai_Fluted_Glass"
    glass.scale = (1.0, 1.0, 1.0)
    
    # SubD & Bevel for crystal clear glass rim
    bev_g = glass.modifiers.new(name="Bevel", type='BEVEL')
    bev_g.width = 0.005
    bev_g.segments = 3
    subd_g = glass.modifiers.new(name="Subsurf", type='SUBSURF')
    subd_g.levels = 2
    glass.data.materials.append(mats["chai_glass"])
    bpy.ops.object.shade_smooth()

    # Spiced Milk Chai Liquid inside Glass
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.058,
        depth=0.11,
        location=(0.46, -0.32, 0.70),
        vertices=24
    )
    liquid = bpy.context.active_object
    liquid.name = "Chai_Masala_Liquid"
    liquid.data.materials.append(mats["chai_liquid"])
    bpy.ops.object.shade_smooth()

    # White Chai Froth / Malai Ring on Surface
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.054,
        minor_radius=0.006,
        location=(0.46, -0.32, 0.752),
        major_segments=32,
        minor_segments=12
    )
    froth = bpy.context.active_object
    froth.name = "Chai_Froth_Ring"
    froth.data.materials.append(mats["shell"])
    bpy.ops.object.shade_smooth()

    # =========================================================================
    # 8. ANTI-GRAVITY HOVER RING & WARM DESK SURFACE
    # =========================================================================
    # Thruster Emitter Nozzle under Torso Pod
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.20,
        minor_radius=0.024,
        location=(0, 0, 0.12),
        major_segments=48,
        minor_segments=24
    )
    thrust_rim = bpy.context.active_object
    thrust_rim.name = "Thruster_Gold_Rim"
    thrust_rim.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()

    # Glowing Amber Anti-Gravity Energy Disc
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.18,
        depth=0.015,
        location=(0, 0, 0.11),
        vertices=32
    )
    hover_disc = bpy.context.active_object
    hover_disc.name = "Hover_Energy_Disc"
    hover_disc.data.materials.append(mats["hover"])
    bpy.ops.object.shade_smooth()

    # Studio Teak Desk Surface (Ground Plane reflecting warm lighting)
    bpy.ops.mesh.primitive_plane_add(size=14.0, location=(0, 0, -0.15))
    desk = bpy.context.active_object
    desk.name = "Studio_Teak_Desk"
    desk.data.materials.append(mats["desk"])

def setup_cinematic_studio():
    # Vertical 9:16 Portrait Camera (1080 x 1920)
    cam_data = bpy.data.cameras.new(name="Puttar_Portrait_Camera")
    cam_data.lens = 85 # 85mm portrait telephoto (zero barrel distortion, cinematic compression)
    cam_data.sensor_width = 36.0
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = 2.45
    cam_data.dof.aperture_fstop = 2.8 # Soft background bokeh

    cam_obj = bpy.data.objects.new("Camera_Master", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Position: Slightly low 3/4 angle looking up at hero
    cam_obj.location = (0.35, -2.40, 1.15)
    cam_obj.rotation_euler = (math.radians(85), math.radians(1), math.radians(8))

    # =========================================================================
    # 3-POINT STUDIO LIGHTING (Pixar Character Rig)
    # =========================================================================
    # 1. Key Light (Warm 4800K Soft Area Light from Front-Left)
    key_light = bpy.data.lights.new(name="Key_Soft_Warm", type='AREA')
    key_light.energy = 160.0
    key_light.color = (1.0, 0.94, 0.86)
    key_light.size = 1.4
    key_obj = bpy.data.objects.new("Light_Key_Warm", key_light)
    bpy.context.collection.objects.link(key_obj)
    key_obj.location = (-1.8, -2.1, 2.2)
    key_obj.rotation_euler = (math.radians(52), math.radians(-18), math.radians(-38))

    # 2. Fill Light (Cool 6800K Soft Area Light from Right)
    fill_light = bpy.data.lights.new(name="Fill_Soft_Cool", type='AREA')
    fill_light.energy = 55.0
    fill_light.color = (0.82, 0.90, 1.0)
    fill_light.size = 1.8
    fill_obj = bpy.data.objects.new("Light_Fill_Cool", fill_light)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.location = (2.2, -1.6, 1.6)
    fill_obj.rotation_euler = (math.radians(45), math.radians(22), math.radians(55))

    # 3. Rim / Kick Light (Crisp 5200K Edge Light from Behind-Right)
    # This separates the white clearcoat and shines on the royal blue silk & gold trim
    rim_light = bpy.data.lights.new(name="Rim_Kick_Light", type='AREA')
    rim_light.energy = 220.0
    rim_light.color = (1.0, 0.98, 0.94)
    rim_light.size = 0.9
    rim_obj = bpy.data.objects.new("Light_Rim_Sharp", rim_light)
    bpy.context.collection.objects.link(rim_obj)
    rim_obj.location = (1.5, 1.8, 2.3)
    rim_obj.rotation_euler = (math.radians(-48), math.radians(28), math.radians(145))

    # 4. Anti-Gravity Hover Spotlight (Casting amber pool on desk)
    hover_light = bpy.data.lights.new(name="Hover_Under_Glow", type='SPOT')
    hover_light.energy = 45.0
    hover_light.color = (1.0, 0.68, 0.12)
    hover_light.spot_size = math.radians(85)
    hover_light.spot_blend = 0.4
    hover_obj = bpy.data.objects.new("Light_Hover_Spot", hover_light)
    bpy.context.collection.objects.link(hover_obj)
    hover_obj.location = (0, 0, 0.18)
    hover_obj.rotation_euler = (math.radians(180), 0, 0)

def configure_render(output_image_path):
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    
    # Render Resolution (High-Res 1080 x 1920 9:16 vertical)
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.filepath = output_image_path

    # Color Management (AgX or Filmic high contrast)
    if hasattr(scene.view_settings, "view_transform"):
        try:
            scene.view_settings.view_transform = 'AgX'
            scene.view_settings.look = 'AgX - High Contrast'
        except Exception:
            try:
                scene.view_settings.view_transform = 'Filmic'
                scene.view_settings.look = 'High Contrast'
            except Exception:
                scene.view_settings.look = 'None'

def run():
    print("=== STARTING AI PUTTAR HIGH-FIDELITY SUBD MODELING ===")
    reset_scene()
    
    tex_dir = r"D:\New folder (2)\blender_engine\assets\textures"
    mats = setup_materials(tex_dir)
    build_ai_puttar_subd(mats)
    setup_cinematic_studio()
    
    # Save Master .blend asset
    blend_path = r"D:\New folder (2)\blender_engine\assets\desi_library\ai_puttar_subd_master.blend"
    os.makedirs(os.path.dirname(blend_path), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved master file: {blend_path}")
    
    # Render Master High-Fidelity Still
    render_out = r"D:\New folder (2)\blender_engine\output\ai_puttar_subd_render.png"
    os.makedirs(os.path.dirname(render_out), exist_ok=True)
    configure_render(render_out)
    
    print("Rendering high-fidelity preview...")
    bpy.ops.render.render(write_still=True)
    print(f"Render complete: {render_out}")

if __name__ == "__main__":
    run()
