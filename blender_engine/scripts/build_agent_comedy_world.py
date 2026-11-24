"""
Master 3D Scene Builder for Multi-Agent Comedy Shorts (Phase 2)
Authentic Antigravity Character Design + Warm Daylight Studio Aesthetic
Clean Hierarchies for Procedural Timeline Animation:
- Human_Head_Pivot: Rotates entire head, hair, eyes, mouth together
- Popapus_Root: Bobbing, hovering, and body gestures
- Claude_Root: Floating sway and antenna animation
"""

import bpy
import math
import sys
import os
from mathutils import Vector

def hex_to_rgba(hex_code, alpha=1.0):
    hex_code = hex_code.lstrip('#')
    s_r = int(hex_code[0:2], 16) / 255.0
    s_g = int(hex_code[2:4], 16) / 255.0
    s_b = int(hex_code[4:6], 16) / 255.0
    
    def to_linear(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
        
    return (to_linear(s_r), to_linear(s_g), to_linear(s_b), alpha)

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def set_smooth(obj):
    if obj and obj.type == 'MESH':
        for p in obj.data.polygons:
            p.use_smooth = True

def set_parent(child, parent):
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()

def create_material(name, base_color, roughness=0.35, metallic=0.0, specular=0.5, emission_color=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if "Specular IOR Level" in bsdf.inputs:
            bsdf.inputs["Specular IOR Level"].default_value = specular
        elif "Specular" in bsdf.inputs:
            bsdf.inputs["Specular"].default_value = specular
        if emission_color and emission_strength > 0:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission_color
                bsdf.inputs["Emission Strength"].default_value = emission_strength
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = emission_color
    return mat

def create_screen_code_texture_material(name="ScreenCodeMat", texture_path=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()

    output = tree.nodes.new(type="ShaderNodeOutputMaterial")
    output.location = (400, 0)

    bsdf = tree.nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (100, 0)
    bsdf.inputs["Roughness"].default_value = 0.12
    bsdf.inputs["Metallic"].default_value = 0.05
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.5
    tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])

    if texture_path and os.path.exists(texture_path):
        tex_node = tree.nodes.new(type="ShaderNodeTexImage")
        tex_node.location = (-250, 0)
        img = bpy.data.images.load(texture_path, check_existing=True)
        tex_node.image = img
        tree.links.new(tex_node.outputs["Color"], bsdf.inputs["Base Color"])
        if "Emission Color" in bsdf.inputs:
            tree.links.new(tex_node.outputs["Color"], bsdf.inputs["Emission Color"])
            bsdf.inputs["Emission Strength"].default_value = 2.0
        elif "Emission" in bsdf.inputs:
            tree.links.new(tex_node.outputs["Color"], bsdf.inputs["Emission"])
    else:
        bsdf.inputs["Base Color"].default_value = (0.05, 0.08, 0.15, 1.0)
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (0.2, 0.6, 0.9, 1.0)
            bsdf.inputs["Emission Strength"].default_value = 2.0

    return mat

def create_transparent_glass_material(name="Mat_Glass_Dome"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()
    
    output = tree.nodes.new(type="ShaderNodeOutputMaterial")
    output.location = (400, 0)
    
    mix = tree.nodes.new(type="ShaderNodeMixShader")
    mix.location = (180, 0)
    
    transp = tree.nodes.new(type="ShaderNodeBsdfTransparent")
    transp.inputs['Color'].default_value = (0.95, 0.98, 1.0, 1.0)
    transp.location = (-100, 100)
    
    glossy = tree.nodes.new(type="ShaderNodeBsdfGlossy")
    glossy.inputs['Color'].default_value = (1.0, 1.0, 1.0, 1.0)
    glossy.inputs['Roughness'].default_value = 0.04
    glossy.location = (-100, -100)
    
    fresnel = tree.nodes.new(type="ShaderNodeFresnel")
    fresnel.inputs['IOR'].default_value = 1.30
    fresnel.location = (-300, 150)
    
    tree.links.new(fresnel.outputs['Fac'], mix.inputs['Fac'])
    tree.links.new(transp.outputs['BSDF'], mix.inputs[1])
    tree.links.new(glossy.outputs['BSDF'], mix.inputs[2])
    tree.links.new(mix.outputs['Shader'], output.inputs['Surface'])
    
    mat.blend_method = 'BLEND'
    if hasattr(mat, 'use_raytrace_refraction'):
        mat.use_raytrace_refraction = True
    return mat

def build_room():
    sage_wall_mat = create_material("SageWallMat", hex_to_rgba("#4B7363"), roughness=0.55)
    cream_side_mat = create_material("CreamWallMat", hex_to_rgba("#E8E0D2"), roughness=0.50)
    floor_wood_mat = create_material("TeakFloorMat", hex_to_rgba("#5C381E"), roughness=0.38)
    trim_mat = create_material("TrimMat", hex_to_rgba("#F2F2EE"), roughness=0.25)

    # Back Wall
    bpy.ops.mesh.primitive_plane_add(location=(0, 2.2, 1.8), rotation=(math.radians(90), 0, 0), size=6)
    back_wall = bpy.context.object
    back_wall.name = "BackWall"
    back_wall.data.materials.append(sage_wall_mat)

    # Left Wall
    bpy.ops.mesh.primitive_plane_add(location=(-2.8, 0, 1.8), rotation=(0, math.radians(90), 0), size=6)
    left_wall = bpy.context.object
    left_wall.name = "LeftWall"
    left_wall.data.materials.append(cream_side_mat)

    # Floor
    bpy.ops.mesh.primitive_plane_add(location=(0, 0, 0), size=8)
    floor = bpy.context.object
    floor.name = "Floor"
    floor.data.materials.append(floor_wood_mat)

    # Baseboard Trim
    bpy.ops.mesh.primitive_cube_add(location=(0, 2.18, 0.08), scale=(3.0, 0.03, 0.08))
    trim = bpy.context.object
    trim.data.materials.append(trim_mat)

    # Wall Clock
    clock_rim_mat = create_material("ClockRimMat", hex_to_rgba("#2B2E33"), roughness=0.25, metallic=0.6)
    clock_face_mat = create_material("ClockFaceMat", hex_to_rgba("#FAFAFA"), roughness=0.15)
    clock_hand_mat = create_material("ClockHandMat", hex_to_rgba("#E8483B"), roughness=0.2)

    bpy.ops.mesh.primitive_cylinder_add(location=(-0.85, 2.15, 2.2), rotation=(math.radians(90), 0, 0), radius=0.32, depth=0.04)
    clock_rim = bpy.context.object
    clock_rim.data.materials.append(clock_rim_mat)
    set_smooth(clock_rim)

    bpy.ops.mesh.primitive_cylinder_add(location=(-0.85, 2.13, 2.2), rotation=(math.radians(90), 0, 0), radius=0.28, depth=0.03)
    clock_face = bpy.context.object
    clock_face.data.materials.append(clock_face_mat)
    set_smooth(clock_face)

    # Hands
    bpy.ops.mesh.primitive_cube_add(location=(-0.85, 2.11, 2.26), scale=(0.012, 0.005, 0.08))
    bpy.context.object.data.materials.append(clock_hand_mat)
    bpy.ops.mesh.primitive_cube_add(location=(-0.79, 2.11, 2.2), rotation=(0, math.radians(60), 0), scale=(0.012, 0.005, 0.06))
    bpy.context.object.data.materials.append(clock_rim_mat)

    # Wall Art
    frame_wood_mat = create_material("FrameMat", hex_to_rgba("#2A1C12"), roughness=0.35)
    art_mat = create_material("ArtMat", hex_to_rgba("#F6EDE0"), roughness=0.3)
    art_accent_mat = create_material("ArtAccentMat", hex_to_rgba("#E76F51"), roughness=0.3)

    bpy.ops.mesh.primitive_cube_add(location=(0.85, 2.16, 2.15), scale=(0.35, 0.02, 0.25))
    art_frame = bpy.context.object
    art_frame.data.materials.append(frame_wood_mat)

    bpy.ops.mesh.primitive_plane_add(location=(0.85, 2.139, 2.15), rotation=(math.radians(90), 0, 0), size=0.45)
    art_canvas = bpy.context.object
    art_canvas.data.materials.append(art_mat)

    bpy.ops.mesh.primitive_cylinder_add(location=(0.85, 2.138, 2.15), rotation=(math.radians(90), 0, 0), radius=0.12, depth=0.002)
    art_circle = bpy.context.object
    art_circle.data.materials.append(art_accent_mat)
    set_smooth(art_circle)

def build_desk_and_props():
    desk_oak_mat = create_material("DeskOakMat", hex_to_rgba("#B87739"), roughness=0.30, specular=0.55)
    desk_edge_mat = create_material("DeskEdgeMat", hex_to_rgba("#7A481B"), roughness=0.35)
    desk_leg_mat = create_material("DeskLegMat", hex_to_rgba("#22252B"), roughness=0.3, metallic=0.7)
    
    laptop_chassis_mat = create_material("LaptopChassisMat", hex_to_rgba("#2A2D34"), roughness=0.25, metallic=0.85)
    texture_path = os.path.abspath(r"D:\New folder (2)\blender_engine\textures\laptop_screen_code.png")
    screen_code_mat = create_screen_code_texture_material("ScreenCodeMat", texture_path)
    mug_mat = create_material("MugMat", hex_to_rgba("#E59838"), roughness=0.25)
    coffee_mat = create_material("CoffeeMat", hex_to_rgba("#1A0E08"), roughness=0.15)

    # Desk Top
    bpy.ops.mesh.primitive_cube_add(location=(0, 0.3, 0.75), scale=(1.35, 0.65, 0.035))
    desk = bpy.context.object
    desk.name = "Desk_Top"
    desk.data.materials.append(desk_oak_mat)

    bpy.ops.mesh.primitive_cube_add(location=(0, -0.025, 0.75), scale=(1.36, 0.015, 0.036))
    desk_edge = bpy.context.object
    desk_edge.data.materials.append(desk_edge_mat)

    # Legs
    for x_pos in [-1.20, 1.20]:
        for y_pos in [-0.2, 0.8]:
            bpy.ops.mesh.primitive_cylinder_add(location=(x_pos, y_pos, 0.375), radius=0.032, depth=0.75)
            leg = bpy.context.object
            leg.data.materials.append(desk_leg_mat)
            set_smooth(leg)

    # -------------------------------------------------------------------------
    # Laptop Hierarchy with Laptop_Root and Screen Facing Dev (+Y)
    # -------------------------------------------------------------------------
    laptop_root = bpy.data.objects.new("Laptop_Root", None)
    laptop_root.location = (0.0, 0.42, 0.795)
    bpy.context.collection.objects.link(laptop_root)

    # Base chassis
    bpy.ops.mesh.primitive_cube_add(location=(0, 0.42, 0.795), scale=(0.25, 0.17, 0.009))
    laptop_base = bpy.context.object
    laptop_base.name = "Laptop_Base"
    laptop_base.data.materials.append(laptop_chassis_mat)
    set_parent(laptop_base, laptop_root)

    # Trackpad (on user side facing Dev, Y = 0.52)
    bpy.ops.mesh.primitive_plane_add(location=(0, 0.52, 0.805), size=0.07)
    trackpad = bpy.context.object
    trackpad.name = "Plane.001"
    trackpad.scale = (1.4, 0.9, 1.0)
    trackpad.data.materials.append(desk_leg_mat)
    set_parent(trackpad, laptop_root)

    # Keyboard well
    bpy.ops.mesh.primitive_cube_add(location=(0, 0.41, 0.805), scale=(0.22, 0.07, 0.002))
    keyboard = bpy.context.object
    keyboard.name = "Laptop_Keyboard"
    keyboard.data.materials.append(desk_leg_mat)
    set_parent(keyboard, laptop_root)

    # Screen Hinge Empty
    screen_hinge = bpy.data.objects.new("Laptop_Screen_Hinge", None)
    screen_hinge.location = (0.0, 0.26, 0.805)
    bpy.context.collection.objects.link(screen_hinge)
    set_parent(screen_hinge, laptop_root)

    # Screen Lid (Cube.005) - Back lid faces camera (-Y), open at ~106 deg towards Dev (+16 deg tilt)
    bpy.ops.mesh.primitive_cube_add(location=(0, 0.28, 0.96), rotation=(math.radians(16), 0, 0), scale=(0.25, 0.007, 0.16))
    laptop_screen = bpy.context.object
    laptop_screen.name = "Cube.005"
    laptop_screen.data.materials.append(laptop_chassis_mat)
    set_parent(laptop_screen, screen_hinge)

    # Display Plane (Plane.002) - Parented directly to Cube.005 front face (+Y), upright & filling screen
    bpy.ops.mesh.primitive_plane_add(size=1.0)
    laptop_display = bpy.context.object
    laptop_display.name = "Plane.002"
    laptop_display.scale = (0.47, 0.29, 1.0)
    laptop_display.parent = laptop_screen
    laptop_display.matrix_parent_inverse.identity()
    laptop_display.location = (0.0, 0.008, 0.0)
    laptop_display.rotation_euler = (math.radians(90), 0, math.radians(180))
    laptop_display.data.materials.append(screen_code_mat)

    # Glowing Antigravity logo on back lid (local -Y face, facing camera by default)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.024, depth=0.003)
    lid_logo = bpy.context.object
    lid_logo.name = "Laptop_Lid_Logo"
    mat_logo = create_material("LaptopLogoMat", (0.2, 0.6, 1.0, 1.0), roughness=0.1, metallic=0.9, emission_color=(0.2, 0.6, 1.0, 1.0), emission_strength=1.5)
    lid_logo.data.materials.append(mat_logo)
    set_smooth(lid_logo)
    lid_logo.parent = laptop_screen
    lid_logo.matrix_parent_inverse.identity()
    lid_logo.location = (0.0, -0.008, 0.0)
    lid_logo.rotation_euler = (math.radians(90), 0, 0)

    # Coffee Mug
    bpy.ops.mesh.primitive_cylinder_add(location=(0.68, 0.26, 0.84), radius=0.052, depth=0.10)
    mug = bpy.context.object
    mug.data.materials.append(mug_mat)
    set_smooth(mug)

    bpy.ops.mesh.primitive_cylinder_add(location=(0.68, 0.26, 0.88), radius=0.046, depth=0.01)
    coffee = bpy.context.object
    coffee.data.materials.append(coffee_mat)
    set_smooth(coffee)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.038, minor_radius=0.009, location=(0.735, 0.26, 0.84), rotation=(0, math.radians(90), 0))
    handle = bpy.context.object
    handle.data.materials.append(mug_mat)
    set_smooth(handle)

def build_human_avatar():
    """
    Builds Human Creator Avatar with dedicated Head Pivot for clean animatable head turns/nods.
    """
    hoodie_mat = create_material("HoodieNavyMat", hex_to_rgba("#1C2B3E"), roughness=0.52)
    skin_mat = create_material("SkinPeachMat", hex_to_rgba("#E2AA88"), roughness=0.45)
    hair_mat = create_material("HairJetBlackMat", hex_to_rgba("#0B0C0E"), roughness=0.28, specular=0.55)
    eye_pupil_mat = create_material("HumanPupilMat", hex_to_rgba("#121318"), roughness=0.1)
    eye_shine_mat = create_material("HumanShineMat", (1.0, 1.0, 1.0, 1.0), roughness=0.05,
                                    emission_color=(1.0, 1.0, 1.0, 1.0), emission_strength=2.0)
    mouth_mat = create_material("HumanMouthMat", hex_to_rgba("#A24C40"), roughness=0.4)
    cord_mat = create_material("HoodieCordMat", hex_to_rgba("#E5E5E0"), roughness=0.4)

    # 1. Main Human Root Empty
    human_root = bpy.data.objects.new("Human_Avatar", None)
    bpy.context.collection.objects.link(human_root)

    # 2. Torso & Hoodie
    bpy.ops.mesh.primitive_cylinder_add(radius=0.28, depth=0.42, vertices=24, location=(0, 0.95, 1.15))
    torso = bpy.context.object
    torso.scale = (1.15, 0.75, 1.0)
    torso.name = "Human_Torso"
    torso.data.materials.append(hoodie_mat)
    set_smooth(torso)
    set_parent(torso, human_root)

    bpy.ops.mesh.primitive_cube_add(location=(0, 0.77, 1.02), scale=(0.20, 0.02, 0.09))
    pocket = bpy.context.object
    pocket.name = "Human_Pocket"
    pocket.data.materials.append(hoodie_mat)
    set_smooth(pocket)
    set_parent(pocket, human_root)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.15, minor_radius=0.038, location=(0, 0.95, 1.40), rotation=(math.radians(12), 0, 0))
    collar = bpy.context.object
    collar.name = "Human_Collar"
    collar.data.materials.append(hoodie_mat)
    set_smooth(collar)
    set_parent(collar, human_root)

    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(location=(side * 0.065, 0.78, 1.28), radius=0.007, depth=0.15)
        cord = bpy.context.object
        cord.name = f"Human_Cord_{'L' if side == -1 else 'R'}"
        cord.data.materials.append(cord_mat)
        set_parent(cord, human_root)

    # 3. Head Pivot Empty (Controls all head, hair, eyes, mouth rotation)
    head_pivot = bpy.data.objects.new("Human_Head_Pivot", None)
    head_pivot.location = (0, 0.95, 1.54)
    bpy.context.collection.objects.link(head_pivot)
    set_parent(head_pivot, human_root)

    # Neck
    bpy.ops.mesh.primitive_cylinder_add(radius=0.078, depth=0.14, vertices=24, location=(0, 0.95, 1.48))
    neck = bpy.context.object
    neck.name = "Human_Neck"
    neck.data.materials.append(skin_mat)
    set_smooth(neck)
    set_parent(neck, human_root)

    # Head Mesh
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=0.22, location=(0, 0.95, 1.74))
    head = bpy.context.object
    head.scale = (0.95, 0.92, 1.08)
    head.name = "Human_Head"
    head.data.materials.append(skin_mat)
    set_smooth(head)
    set_parent(head, head_pivot)

    # Jet Black Hair Crown
    bpy.ops.mesh.primitive_cube_add(location=(0, 0.98, 1.90), scale=(0.23, 0.22, 0.12))
    hair_top = bpy.context.object
    hair_top.name = "Human_Hair_Top"
    hair_top.rotation_euler = (math.radians(-6), 0, 0)
    hair_top.data.materials.append(hair_mat)
    set_parent(hair_top, head_pivot)

    # Front Bangs
    bpy.ops.mesh.primitive_cube_add(location=(-0.04, 0.81, 1.86), scale=(0.16, 0.06, 0.05))
    hair_fringe = bpy.context.object
    hair_fringe.name = "Human_Hair_Fringe"
    hair_fringe.rotation_euler = (math.radians(18), math.radians(-8), math.radians(5))
    hair_fringe.data.materials.append(hair_mat)
    set_parent(hair_fringe, head_pivot)

    # Hair Sides
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(location=(side * 0.21, 0.95, 1.76), scale=(0.03, 0.18, 0.12))
        hair_side = bpy.context.object
        hair_side.name = f"Human_Hair_Side_{'L' if side == -1 else 'R'}"
        hair_side.data.materials.append(hair_mat)
        set_parent(hair_side, head_pivot)

    # Hair Back
    bpy.ops.mesh.primitive_cube_add(location=(0, 1.10, 1.74), scale=(0.21, 0.06, 0.14))
    hair_back = bpy.context.object
    hair_back.name = "Human_Hair_Back"
    hair_back.data.materials.append(hair_mat)
    set_parent(hair_back, head_pivot)

    # Eyebrows
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(location=(side * 0.08, 0.74, 1.80), scale=(0.045, 0.012, 0.010))
        brow = bpy.context.object
        brow.name = f"Human_Brow_{'L' if side == -1 else 'R'}"
        brow.rotation_euler = (0, 0, math.radians(-side * 6))
        brow.data.materials.append(hair_mat)
        set_parent(brow, head_pivot)

    # Eyes
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.026, location=(side * 0.08, 0.745, 1.72))
        eye = bpy.context.object
        eye.scale = (0.9, 0.35, 1.25)
        eye.name = f"Human_Eye_{'L' if side == -1 else 'R'}"
        eye.data.materials.append(eye_pupil_mat)
        set_smooth(eye)
        set_parent(eye, head_pivot)
        
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.007, location=(side * 0.08 + (side * 0.007), 0.735, 1.735))
        catch = bpy.context.object
        catch.name = f"Human_Catch_{'L' if side == -1 else 'R'}"
        catch.data.materials.append(eye_shine_mat)
        set_smooth(catch)
        set_parent(catch, head_pivot)

    # Smile
    bpy.ops.mesh.primitive_cylinder_add(radius=0.007, depth=0.065, vertices=16, location=(0, 0.74, 1.62), rotation=(0, math.radians(90), 0))
    mouth = bpy.context.object
    mouth.name = "Human_Mouth"
    mouth.data.materials.append(mouth_mat)
    set_smooth(mouth)
    set_parent(mouth, head_pivot)

    # Arms
    bpy.ops.mesh.primitive_cylinder_add(location=(-0.36, 0.70, 0.95), rotation=(math.radians(40), 0, math.radians(-16)), radius=0.082, depth=0.46)
    arm_l = bpy.context.object
    arm_l.name = "Human_Arm_L"
    arm_l.data.materials.append(hoodie_mat)
    set_smooth(arm_l)
    set_parent(arm_l, human_root)

    bpy.ops.mesh.primitive_cylinder_add(location=(0.36, 0.70, 0.95), rotation=(math.radians(40), 0, math.radians(16)), radius=0.082, depth=0.46)
    arm_r = bpy.context.object
    arm_r.name = "Human_Arm_R"
    arm_r.data.materials.append(hoodie_mat)
    set_smooth(arm_r)
    set_parent(arm_r, human_root)

    # Hands
    for x_pos in [-0.28, 0.28]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.068, location=(x_pos, 0.48, 0.81))
        hand = bpy.context.object
        hand.name = f"Human_Hand_{'L' if x_pos < 0 else 'R'}"
        hand.data.materials.append(skin_mat)
        set_smooth(hand)
        set_parent(hand, human_root)

    return human_root

def build_authentic_popapus(location=(-0.52, 0.16, 1.04), scale=0.33, rotation=(0, 0, math.radians(16))):
    blue_skin_mat = create_material("Mat_Antigravity_Blue_Skin", hex_to_rgba("#3186FF"), roughness=0.22, metallic=0.18)
    sky_belly_mat = create_material("Mat_Antigravity_Sky_Belly", hex_to_rgba("#749BFF"), roughness=0.26, metallic=0.12)
    glass_dome_mat = create_transparent_glass_material("Mat_Antigravity_Glass_Dome")
    solar_gold_mat = create_material("Mat_Antigravity_Solar_Gold", hex_to_rgba("#FBBC04"), roughness=0.15, metallic=0.96)
    
    orb_red_mat = create_material("Mat_Orb_Red", hex_to_rgba("#FC413D"), emission_color=hex_to_rgba("#FC413D"), emission_strength=8.0)
    orb_green_mat = create_material("Mat_Orb_Green", hex_to_rgba("#00B95C"), emission_color=hex_to_rgba("#00B95C"), emission_strength=8.0)
    orb_yellow_mat = create_material("Mat_Orb_Yellow", hex_to_rgba("#FFE432"), emission_color=hex_to_rgba("#FFE432"), emission_strength=9.0)
    orb_blue_mat = create_material("Mat_Orb_Blue", hex_to_rgba("#3186FF"), emission_color=hex_to_rgba("#3186FF"), emission_strength=9.0)
    
    eye_pupil_mat = create_material("Mat_Eye_Pupil", hex_to_rgba("#0A0E18"), roughness=0.08, metallic=0.2)
    eye_iris_mat = create_material("Mat_Eye_Iris", hex_to_rgba("#3186FF"), emission_color=hex_to_rgba("#749BFF"), emission_strength=3.5)
    eye_shine_mat = create_material("Mat_Eye_Shine", (1.0, 1.0, 1.0, 1.0), emission_color=(1.0, 1.0, 1.0, 1.0), emission_strength=2.0)
    hover_ring_mat = create_material("Mat_Hover_Ring", hex_to_rgba("#3186FF"), emission_color=hex_to_rgba("#3186FF"), emission_strength=6.0)

    root = bpy.data.objects.new("Antigravity_Popapus_Root", None)
    bpy.context.collection.objects.link(root)

    # Body
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=36, radius=0.60, location=(0, 0, -0.12))
    body = bpy.context.active_object
    body.scale = (1.0, 0.95, 0.80)
    body.name = "Popapus_Body"
    body.data.materials.append(blue_skin_mat)
    set_smooth(body)
    set_parent(body, root)

    # Belly
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=0.48, location=(0, -0.22, -0.22))
    belly = bpy.context.active_object
    belly.scale = (0.78, 0.55, 0.60)
    belly.name = "Popapus_Belly"
    belly.data.materials.append(sky_belly_mat)
    set_smooth(belly)
    set_parent(belly, root)

    # Glass Dome
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=36, radius=0.55, location=(0, 0, 0.40))
    dome = bpy.context.active_object
    dome.scale = (0.95, 0.95, 0.95)
    dome.name = "Popapus_AirSac_Dome"
    dome.data.materials.append(glass_dome_mat)
    set_smooth(dome)
    set_parent(dome, root)

    # Collar
    bpy.ops.mesh.primitive_torus_add(major_radius=0.52, minor_radius=0.042, major_segments=48, minor_segments=20, location=(0, 0, 0.18))
    collar = bpy.context.active_object
    collar.name = "Popapus_Collar"
    collar.data.materials.append(solar_gold_mat)
    set_smooth(collar)
    set_parent(collar, root)

    # 4 Orbs
    orbs_cfg = [
        {"name": "Orb_Antigravity_Blue",   "pos": (0.18, 0.08, 0.42),   "r": 0.14, "mat": orb_blue_mat},
        {"name": "Orb_Antigravity_Red",    "pos": (-0.16, 0.10, 0.54),  "r": 0.13, "mat": orb_red_mat},
        {"name": "Orb_Antigravity_Green",  "pos": (0.08, -0.12, 0.35),  "r": 0.12, "mat": orb_green_mat},
        {"name": "Orb_Antigravity_Yellow", "pos": (-0.12, -0.09, 0.46), "r": 0.14, "mat": orb_yellow_mat},
    ]
    for o in orbs_cfg:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=18, radius=o['r'], location=o['pos'])
        sp = bpy.context.active_object
        sp.name = o['name']
        sp.data.materials.append(o['mat'])
        set_smooth(sp)
        set_parent(sp, root)

    # Eyes
    for side in [-1, 1]:
        ex = side * 0.28
        ey = -0.48
        ez = -0.02
        
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=0.15, location=(ex, ey, ez))
        eye = bpy.context.active_object
        eye.scale = (0.85, 0.45, 1.20)
        eye.rotation_euler = (math.radians(-8), 0, math.radians(-side * 8))
        eye.name = f"Popapus_Eye_{'L' if side == -1 else 'R'}"
        eye.data.materials.append(eye_pupil_mat)
        set_smooth(eye)
        set_parent(eye, root)
        
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=18, radius=0.11, location=(ex, ey - 0.035, ez - 0.02))
        iris = bpy.context.active_object
        iris.scale = (0.75, 0.25, 0.85)
        iris.name = f"Popapus_Iris_{'L' if side == -1 else 'R'}"
        iris.data.materials.append(eye_iris_mat)
        set_smooth(iris)
        set_parent(iris, root)
        
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.038, location=(ex + (side * 0.03), ey - 0.065, ez + 0.04))
        shine = bpy.context.active_object
        shine.scale = (1.0, 0.4, 1.0)
        shine.name = f"Popapus_Shine_{'L' if side == -1 else 'R'}"
        shine.data.materials.append(eye_shine_mat)
        set_smooth(shine)
        set_parent(shine, root)

    # Snout
    bpy.ops.mesh.primitive_cylinder_add(radius=0.09, depth=0.16, vertices=24, location=(0, -0.56, -0.22), rotation=(math.radians(75), 0, 0))
    mouth = bpy.context.active_object
    mouth.name = "Popapus_Spout"
    mouth.data.materials.append(sky_belly_mat)
    set_smooth(mouth)
    set_parent(mouth, root)
    
    bpy.ops.mesh.primitive_torus_add(major_radius=0.095, minor_radius=0.022, location=(0, -0.63, -0.24), rotation=(math.radians(75), 0, 0))
    nozzle = bpy.context.active_object
    nozzle.name = "Popapus_Nozzle"
    nozzle.data.materials.append(solar_gold_mat)
    set_smooth(nozzle)
    set_parent(nozzle, root)

    # 6 Tentacles
    num_tentacles = 6
    for i in range(num_tentacles):
        angle = (2 * math.pi / num_tentacles) * i
        tx = math.cos(angle) * 0.42
        ty = math.sin(angle) * 0.40
        tz = -0.42
        
        seg_count = 5
        for s in range(seg_count):
            fraction = s / seg_count
            radius = 0.12 * (1.0 - fraction * 0.55)
            curl_dist = 0.42 + (fraction * 0.28)
            curl_z = tz - (fraction * 0.24) + (math.sin(fraction * math.pi) * 0.08)
            sx = math.cos(angle) * curl_dist
            sy = math.sin(angle) * curl_dist
            
            bpy.ops.mesh.primitive_uv_sphere_add(segments=18, ring_count=14, radius=radius, location=(sx, sy, curl_z))
            tent_seg = bpy.context.active_object
            tent_seg.name = f"Popapus_Tent_{i}_Seg_{s}"
            tent_mat = sky_belly_mat if s % 2 == 0 else blue_skin_mat
            tent_seg.data.materials.append(tent_mat)
            set_smooth(tent_seg)
            set_parent(tent_seg, root)

    # Hover Ring
    bpy.ops.mesh.primitive_torus_add(major_radius=0.72, minor_radius=0.038, major_segments=36, minor_segments=16, location=(0, 0, -0.72))
    hover_ring = bpy.context.active_object
    hover_ring.name = "Popapus_Hover_Ring"
    hover_ring.data.materials.append(hover_ring_mat)
    set_smooth(hover_ring)
    set_parent(hover_ring, root)

    root.location = location
    root.scale = (scale, scale, scale)
    root.rotation_euler = rotation
    bpy.context.view_layer.update()

    return root

def build_companion_claude(location=(0.52, 0.18, 0.96), scale=0.32, rotation=(0, 0, math.radians(-18))):
    body_mat = create_material("ClaudeCoralMat", hex_to_rgba("#D95C2B"), roughness=0.32, specular=0.5)
    belly_mat = create_material("ClaudeCreamMat", hex_to_rgba("#F6EDE0"), roughness=0.38)
    screen_mat = create_material("ClaudeScreenMat", hex_to_rgba("#1C1510"), roughness=0.15)
    led_mat = create_material("ClaudeLEDMat", hex_to_rgba("#FFB443"), roughness=0.1,
                              emission_color=hex_to_rgba("#FFB443"), emission_strength=3.5)
    metal_mat = create_material("ClaudeAntennaMat", hex_to_rgba("#D0D5DD"), roughness=0.2, metallic=0.9)

    root = bpy.data.objects.new("Agent_Claude_Root", None)
    bpy.context.collection.objects.link(root)

    # Body
    bpy.ops.mesh.primitive_uv_sphere_add(segments=36, ring_count=24, radius=0.48, location=(0, 0, 0))
    body = bpy.context.active_object
    body.scale = (0.95, 0.90, 1.15)
    body.name = "Claude_Body"
    body.data.materials.append(body_mat)
    set_smooth(body)
    set_parent(body, root)

    # Belly
    bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=20, radius=0.38, location=(0, -0.16, -0.10))
    belly = bpy.context.active_object
    belly.scale = (0.85, 0.55, 0.85)
    belly.name = "Claude_Belly"
    belly.data.materials.append(belly_mat)
    set_smooth(belly)
    set_parent(belly, root)

    # Visor
    bpy.ops.mesh.primitive_cylinder_add(radius=0.32, depth=0.25, vertices=32, location=(0, -0.32, 0.16), rotation=(math.radians(90), 0, 0))
    visor = bpy.context.active_object
    visor.scale = (0.95, 0.65, 0.65)
    visor.name = "Claude_Visor"
    visor.data.materials.append(screen_mat)
    set_smooth(visor)
    set_parent(visor, root)

    # Eyes
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.03, vertices=20, location=(side * 0.12, -0.46, 0.18), rotation=(math.radians(90), 0, 0))
        eye = bpy.context.active_object
        eye.scale = (1.0, 0.35, 1.0)
        eye.name = f"Claude_Eye_{'L' if side == -1 else 'R'}"
        eye.data.materials.append(led_mat)
        set_smooth(eye)
        set_parent(eye, root)

    # Antenna
    bpy.ops.mesh.primitive_cylinder_add(radius=0.025, depth=0.32, vertices=16, location=(0, 0, 0.68))
    antenna = bpy.context.object
    antenna.name = "Claude_Antenna"
    antenna.data.materials.append(metal_mat)
    set_smooth(antenna)
    set_parent(antenna, root)

    # Antenna Tip (Parented to antenna so it sways naturally)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.075, location=(0, 0, 0.86))
    tip = bpy.context.object
    tip.name = "Claude_Antenna_Tip"
    tip.data.materials.append(led_mat)
    set_smooth(tip)
    set_parent(tip, antenna)

    # Arms
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.12, location=(side * 0.44, 0, -0.08))
        arm = bpy.context.object
        arm.scale = (0.8, 1.1, 0.8)
        arm.name = f"Claude_Arm_{'L' if side == -1 else 'R'}"
        arm.data.materials.append(body_mat)
        set_smooth(arm)
        set_parent(arm, root)

    # Base Pod Ring
    bpy.ops.mesh.primitive_torus_add(major_radius=0.36, minor_radius=0.05, location=(0, 0, -0.48))
    base_ring = bpy.context.active_object
    base_ring.name = "Claude_Base"
    base_ring.data.materials.append(metal_mat)
    set_smooth(base_ring)
    set_parent(base_ring, root)

    root.location = location
    root.scale = (scale, scale, scale)
    root.rotation_euler = rotation
    bpy.context.view_layer.update()

    return root

def setup_studio_lighting():
    world = bpy.context.scene.world or bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = (0.92, 0.90, 0.86, 1.0)
        bg.inputs[1].default_value = 0.65

    # Key Light
    bpy.ops.object.light_add(type='POINT', radius=1.2, location=(-2.4, -2.4, 3.6))
    key_light = bpy.context.object
    key_light.name = "Light_Key_Sun"
    key_light.data.energy = 1600
    key_light.data.color = (1.0, 0.96, 0.91)

    # Fill Light
    bpy.ops.object.light_add(type='POINT', radius=2.5, location=(2.6, -1.6, 2.4))
    fill_light = bpy.context.object
    fill_light.name = "Light_Fill_Sky"
    fill_light.data.energy = 650
    fill_light.data.color = (0.90, 0.95, 1.0)

    # Rim Light
    bpy.ops.object.light_add(type='POINT', radius=1.0, location=(0, 1.9, 3.2))
    rim_light = bpy.context.object
    rim_light.name = "Light_Rim_Back"
    rim_light.data.energy = 550
    rim_light.data.color = (1.0, 1.0, 1.0)

def look_at(camera, point):
    direction = Vector(point) - camera.location
    rotQuat = direction.to_track_quat('-Z', 'Y')
    camera.rotation_euler = rotQuat.to_euler()

def setup_cameras():
    # 1. Wide Two-Shot
    bpy.ops.object.camera_add(location=(0, -2.40, 1.45))
    cam_wide = bpy.context.object
    cam_wide.name = "Cam_Wide"
    cam_wide.data.lens = 40
    look_at(cam_wide, (0, 0.45, 1.25))
    bpy.context.scene.camera = cam_wide

    # 2. Human Close-Up
    bpy.ops.object.camera_add(location=(0, -0.25, 1.62))
    cam_human = bpy.context.object
    cam_human.name = "Cam_Human"
    cam_human.data.lens = 38
    look_at(cam_human, (0, 0.95, 1.68))

    # 3. Popapus Close-Up
    bpy.ops.object.camera_add(location=(-0.52, -0.78, 1.12))
    cam_popapus = bpy.context.object
    cam_popapus.name = "Cam_Popapus"
    cam_popapus.data.lens = 38
    look_at(cam_popapus, (-0.52, 0.16, 1.04))

    # 4. Claude Close-Up
    bpy.ops.object.camera_add(location=(0.52, -0.78, 1.10))
    cam_claude = bpy.context.object
    cam_claude.name = "Cam_Claude"
    cam_claude.data.lens = 38
    look_at(cam_claude, (0.52, 0.18, 0.98))

    return {"wide": cam_wide, "human": cam_human, "popapus": cam_popapus, "claude": cam_claude}

def configure_eevee_next():
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 720
    scene.render.resolution_y = 1280
    scene.render.image_settings.file_format = 'PNG'

    eevee = scene.eevee
    if hasattr(eevee, 'use_gtao'):
        eevee.use_gtao = True
        eevee.gtao_distance = 0.85
        eevee.gtao_quality = 1.0
    if hasattr(eevee, 'use_raytracing'):
        eevee.use_raytracing = True
    if hasattr(eevee, 'use_shadows'):
        eevee.use_shadows = True

def main():
    print("🎬 Building Master Agent Comedy 3D Stage with Pivot Hierarchies...")
    clean_scene()
    build_room()
    build_desk_and_props()
    build_human_avatar()
    build_authentic_popapus()
    build_companion_claude()
    setup_studio_lighting()
    setup_cameras()
    configure_eevee_next()

    blend_path = r"D:\New folder (2)\blender_engine\agent_comedy_stage.blend"
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"💾 Master stage saved to: {blend_path}")

if __name__ == "__main__":
    main()
