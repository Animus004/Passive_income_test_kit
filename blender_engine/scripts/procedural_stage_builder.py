"""
Universal 3D Procedural Stage Builder for Blender
Builds any 3D environment dynamically from a declarative Stage Recipe JSON:
- Ground & terrain synthesis (sand, metal grid, wood, asphalt, grass, regolith)
- 360 HDRI dome & lighting rig (sun, fill, rim accents)
- Furniture & prop surface snapping with 9:16 safe frustum clipping guards
- Background kinetic elements (pulsing holograms, passing rovers/bosses)
- Dynamic character posture adaptors (seated desk vs standing walk)
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Euler

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.append(SCRIPT_DIR)

from polyhaven_connector import fetch_hdri_for_theme
import auto_prop_manager

def hex_to_linear(hex_code, alpha=1.0):
    hex_code = hex_code.lstrip('#')
    s_r = int(hex_code[0:2], 16) / 255.0
    s_g = int(hex_code[2:4], 16) / 255.0
    s_b = int(hex_code[4:6], 16) / 255.0
    def to_lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (to_lin(s_r), to_lin(s_g), to_lin(s_b), alpha)

def create_mat(name, base_color, roughness=0.5, metallic=0.0, emission_color=None, emission_strength=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if emission_color and emission_strength > 0:
            if len(emission_color) == 3:
                emission_color = (emission_color[0], emission_color[1], emission_color[2], 1.0)
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission_color
                bsdf.inputs["Emission Strength"].default_value = emission_strength
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = emission_color
    return mat

def set_smooth(obj):
    if obj and obj.type == 'MESH':
        for p in obj.data.polygons:
            p.use_smooth = True

def purge_transient_stage():
    """Removes previous stage props, ground, lights, and backgrounds while preserving hero characters."""
    # Purge any legacy Claude objects
    for o in list(bpy.data.objects):
        if 'Claude' in o.name:
            try:
                bpy.data.objects.remove(o, do_unlink=True)
            except Exception:
                pass

    hero_prefixes = [
        'Human_', 'Human', 'Popapus_', 'Popapus', 'Gemini_', 'Gemini',
        'Antigravity_', 'Cam_', 'Camera'
    ]

    for obj in list(bpy.data.objects):
        # Check if object belongs to hero character or core camera
        is_hero = any(obj.name.startswith(p) for p in hero_prefixes)
        if not is_hero:
            try:
                bpy.data.objects.remove(obj, do_unlink=True)
            except Exception:
                pass

    # Clean unlinked mesh data
    for block in list(bpy.data.meshes):
        if block.users == 0:
            bpy.data.meshes.remove(block)

def build_ground(ground_recipe):
    """Procedurally creates the ground plane with realistic PBR shading."""
    mat_type = ground_recipe.get("material", "dark_wood_plank").lower()
    roughness = float(ground_recipe.get("roughness", 0.85))

    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 1.5, 0))
    ground = bpy.context.active_object
    ground.name = "Stage_Ground_Plane"

    mat_name = f"Mat_StageGround_{mat_type}"
    mat = bpy.data.materials.get(mat_name) or bpy.data.materials.new(mat_name)
    mat.use_nodes = True
    tree = mat.node_tree
    bsdf = tree.nodes.get("Principled BSDF")

    if "red_sand" in mat_type or "mars" in mat_type:
        base_col = (0.74, 0.26, 0.12, 1.0)
        bsdf.inputs["Base Color"].default_value = base_col
        bsdf.inputs["Roughness"].default_value = 0.95

        # Procedural Martian Rock Outcrops for Atmospheric Landscape Depth
        mat_rock = create_mat("Mat_Mars_Outcrop", (0.58, 0.22, 0.10, 1.0), roughness=0.90)
        boulder_specs = [
            (-1.50, 3.2, 0.35, (0.55, 0.45, 0.40)),
            (-0.95, 4.5, 0.55, (0.75, 0.65, 0.60)),
            (1.20, 2.8, 0.30, (0.45, 0.38, 0.35)),
            (1.65, 4.2, 0.65, (0.85, 0.70, 0.70)),
            (-0.35, 5.0, 0.40, (0.50, 0.50, 0.45)),
        ]
        for bx, by, bz, bscale in boulder_specs:
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1.0, location=(bx, by, bz))
            bould = bpy.context.active_object
            bould.name = f"Stage_Mars_Boulder_{bx}"
            bould.scale = bscale
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            bould.data.materials.append(mat_rock)
            set_smooth(bould)
    elif "metal_grid" in mat_type or "spaceship" in mat_type or "sci_fi" in mat_type:
        base_col = (0.06, 0.08, 0.11, 1.0)
        bsdf.inputs["Base Color"].default_value = base_col
        bsdf.inputs["Metallic"].default_value = 0.88
        bsdf.inputs["Roughness"].default_value = 0.35
    elif "cafe" in mat_type or "terracotta_tile" in mat_type:
        base_col = (0.35, 0.18, 0.11, 1.0)
        bsdf.inputs["Base Color"].default_value = base_col
        bsdf.inputs["Roughness"].default_value = 0.55
    elif "grass" in mat_type or "lawn" in mat_type:
        base_col = (0.14, 0.42, 0.12, 1.0)
        bsdf.inputs["Base Color"].default_value = base_col
        bsdf.inputs["Roughness"].default_value = 0.90
    elif "concrete" in mat_type or "pavement" in mat_type or "street" in mat_type:
        base_col = (0.35, 0.36, 0.38, 1.0)
        bsdf.inputs["Base Color"].default_value = base_col
        bsdf.inputs["Roughness"].default_value = 0.80
    elif "lunar" in mat_type or "regolith" in mat_type or "moon" in mat_type:
        base_col = (0.42, 0.43, 0.45, 1.0)
        bsdf.inputs["Base Color"].default_value = base_col
        bsdf.inputs["Roughness"].default_value = 0.92
    else: # Default dark wood plank
        base_col = (0.12, 0.08, 0.05, 1.0)
        bsdf.inputs["Base Color"].default_value = base_col
        bsdf.inputs["Roughness"].default_value = roughness

    ground.data.materials.append(mat)
    set_smooth(ground)
    return ground

def build_backdrop(backdrop_recipe, stage_theme=""):
    """Loads 360 HDRI environment map from Poly Haven and sets up lighting environment."""
    hdri_theme = backdrop_recipe.get("hdri_theme", "night")
    sky_tint = backdrop_recipe.get("sky_tint", [1.0, 1.0, 1.0, 1.0])

    try:
        hdr_path = fetch_hdri_for_theme(hdri_theme)
    except Exception as e:
        print(f"⚠️ HDRI fetch notice ({e}), using safe fallback.")
        hdr_path = None

    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("Stage_World")
        bpy.context.scene.world = world
    world.use_nodes = True
    tree = world.node_tree
    tree.nodes.clear()

    bg_node = tree.nodes.new("ShaderNodeBackground")
    out_node = tree.nodes.new("ShaderNodeOutputWorld")
    tree.links.new(bg_node.outputs["Background"], out_node.inputs["Surface"])

    if hdr_path and os.path.exists(hdr_path):
        env_node = tree.nodes.new("ShaderNodeTexEnvironment")
        img = bpy.data.images.load(hdr_path)
        env_node.image = img

        # Mapping and Texture Coordinates for HDRI rotation
        tex_coord = tree.nodes.new("ShaderNodeTexCoord")
        mapping = tree.nodes.new("ShaderNodeMapping")
        mapping.inputs['Rotation'].default_value[2] = math.radians(45.0) # 45 degree aesthetic rotation

        tree.links.new(tex_coord.outputs["Generated"], mapping.inputs["Vector"])
        tree.links.new(mapping.outputs["Vector"], env_node.inputs["Vector"])

        # Color tint mix if specified
        if sky_tint and len(sky_tint) >= 3 and (sky_tint[0] != 1.0 or sky_tint[1] != 1.0 or sky_tint[2] != 1.0):
            mix_rgb = tree.nodes.new("ShaderNodeMix")
            mix_rgb.data_type = 'RGBA'
            mix_rgb.blend_type = 'MULTIPLY'
            mix_rgb.inputs[0].default_value = 0.55
            mix_rgb.inputs[7].default_value = (sky_tint[0], sky_tint[1], sky_tint[2], 1.0)
            tree.links.new(env_node.outputs["Color"], mix_rgb.inputs[6])
            tree.links.new(mix_rgb.outputs[2], bg_node.inputs["Color"])
        else:
            tree.links.new(env_node.outputs["Color"], bg_node.inputs["Color"])

        bg_node.inputs["Strength"].default_value = 1.35
    else:
        # Fallback procedural ambient tint
        bg_node.inputs["Color"].default_value = (sky_tint[0], sky_tint[1], sky_tint[2], 1.0)
        bg_node.inputs["Strength"].default_value = 0.8

def build_bedroom_enclosure():
    """Constructs an authentic cozy late-night bedroom / home study with floating shelves, books, under-glow LED, warm baseboard, accent rug, and corner lamp."""
    # 1. Solid Bedroom Back Wall (Warm cozy midnight slate drywall, scaled high to fully enclose the ceiling)
    mat_wall = create_mat("Mat_Bedroom_Wall", (0.08, 0.09, 0.13, 1.0), roughness=0.95)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 2.25, 2.50))
    wall = bpy.context.active_object
    wall.name = "Stage_BackWall"
    wall.scale = (6.0, 0.05, 3.0) # Dimensions: 12.0m wide, 0.10m thick, 6.0m tall (Z: -0.5m to +5.5m)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wall.data.materials.append(mat_wall)

    # 1b. Warm Oak Wooden Baseboard along the bottom of the wall (giving genuine home bedroom trim)
    mat_baseboard = create_mat("Mat_Bedroom_Baseboard", (0.35, 0.22, 0.12, 1.0), roughness=0.45)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 2.22, 0.06))
    baseboard = bpy.context.active_object
    baseboard.name = "Stage_Bedroom_Baseboard"
    baseboard.scale = (6.0, 0.02, 0.06)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    baseboard.data.materials.append(mat_baseboard)

    # 1c. Cozy Woven Bedroom Accent Rug on Floor in front of desk
    mat_rug = create_mat("Mat_Bedroom_Rug", (0.22, 0.26, 0.32, 1.0), roughness=0.90)
    bpy.ops.mesh.primitive_cube_add(location=(0.02, 0.45, 0.002))
    rug = bpy.context.active_object
    rug.name = "Stage_Bedroom_Rug"
    rug.scale = (0.95, 0.65, 0.002)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    rug.data.materials.append(mat_rug)

    # 2. Lower Floating Oak Shelf on the left (Far left: X=-0.80m so it frames the shot clear of Gemini at X=-0.48m)
    mat_oak = create_mat("Mat_Shelf_Oak", (0.42, 0.28, 0.15, 1.0), roughness=0.45)
    bpy.ops.mesh.primitive_cube_add(location=(-0.80, 2.12, 1.95))
    shelf = bpy.context.active_object
    shelf.name = "Stage_Wall_Shelf"
    shelf.scale = (0.35, 0.08, 0.015)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    shelf.data.materials.append(mat_oak)

    # 3. Stacked Books on Lower Shelf
    book_colors = [
        ((0.15, 0.55, 0.65, 1.0), "Teal"),
        ((0.85, 0.22, 0.18, 1.0), "Red"),
        ((0.92, 0.72, 0.15, 1.0), "Yellow"),
        ((0.20, 0.25, 0.45, 1.0), "Navy")
    ]
    for i, (b_col, b_name) in enumerate(book_colors):
        b_mat = create_mat(f"Mat_Book_{b_name}", b_col, roughness=0.6)
        bx = -0.98 + (i * 0.038)
        bpy.ops.mesh.primitive_cube_add(location=(bx, 2.12, 2.05))
        book = bpy.context.active_object
        book.name = f"Stage_Book_{i}"
        book.scale = (0.015, 0.065, 0.085)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        book.data.materials.append(b_mat)

    # 4. Succulent Plant in Ceramic Pot on Lower Shelf
    mat_pot = create_mat("Mat_Succulent_Pot", (0.92, 0.92, 0.94, 1.0), roughness=0.25)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=0.06, location=(-0.65, 2.12, 2.00))
    pot = bpy.context.active_object
    pot.name = "Stage_Shelf_Pot"
    pot.data.materials.append(mat_pot)

    mat_plant = create_mat("Mat_Succulent_Green", (0.18, 0.62, 0.25, 1.0), roughness=0.5)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.042, location=(-0.65, 2.12, 2.05))
    plant = bpy.context.active_object
    plant.name = "Stage_Shelf_Plant"
    plant.scale = (1.0, 1.0, 0.75)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    plant.data.materials.append(mat_plant)

    # 5. Warm Under-Shelf LED Ambient Strip
    mat_led = create_mat("Mat_Shelf_LED", (1.0, 0.65, 0.30, 1.0), emission_color=(1.0, 0.65, 0.30), emission_strength=4.5)
    bpy.ops.mesh.primitive_cube_add(location=(-0.80, 2.12, 1.932))
    strip = bpy.context.active_object
    strip.name = "Stage_Shelf_LED"
    strip.scale = (0.34, 0.015, 0.003)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    strip.data.materials.append(mat_led)

    # 5b. Upper Floating Oak Shelf on the left (Z=2.25m) with cute wooden mini companion figure
    bpy.ops.mesh.primitive_cube_add(location=(-0.80, 2.12, 2.25))
    shelf2 = bpy.context.active_object
    shelf2.name = "Stage_Wall_Shelf_Upper"
    shelf2.scale = (0.30, 0.07, 0.015)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    shelf2.data.materials.append(mat_oak)

    # Miniature wooden companion toy on upper shelf
    mat_toy = create_mat("Mat_Shelf_Toy", (0.85, 0.55, 0.22, 1.0), roughness=0.4)
    bpy.ops.mesh.primitive_cube_add(location=(-0.84, 2.12, 2.32))
    toy_body = bpy.context.active_object
    toy_body.name = "Stage_Shelf_Toy_Body"
    toy_body.scale = (0.025, 0.025, 0.04)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    toy_body.data.materials.append(mat_toy)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.020, location=(-0.84, 2.12, 2.38))
    toy_head = bpy.context.active_object
    toy_head.name = "Stage_Shelf_Toy_Head"
    toy_head.data.materials.append(mat_toy)

    # Small trailing ivy pot on upper shelf
    bpy.ops.mesh.primitive_cylinder_add(radius=0.028, depth=0.045, location=(-0.70, 2.12, 2.29))
    pot2 = bpy.context.active_object
    pot2.name = "Stage_Shelf_Pot2"
    pot2.data.materials.append(mat_pot)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.035, location=(-0.70, 2.12, 2.33))
    plant2 = bpy.context.active_object
    plant2.name = "Stage_Shelf_Plant2"
    plant2.data.materials.append(mat_plant)

    # 6. Framed Retro Synthwave / Coder Poster on the right
    mat_frame = create_mat("Mat_Poster_Frame", (0.08, 0.08, 0.10, 1.0), roughness=0.4)
    bpy.ops.mesh.primitive_cube_add(location=(0.42, 2.19, 1.95))
    p_frame = bpy.context.active_object
    p_frame.name = "Stage_Poster_Frame"
    p_frame.scale = (0.18, 0.010, 0.24)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    p_frame.data.materials.append(mat_frame)

    mat_art = create_mat("Mat_Poster_Artwork", (0.06, 0.04, 0.12, 1.0), roughness=0.3, emission_color=(0.85, 0.35, 0.55), emission_strength=0.7)
    bpy.ops.mesh.primitive_cube_add(location=(0.42, 2.18, 1.95))
    p_art = bpy.context.active_object
    p_art.name = "Stage_Poster_Art"
    p_art.scale = (0.16, 0.005, 0.21)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    p_art.data.materials.append(mat_art)

    # 7. Modern Arched Bedroom Corner Floor Lamp on Far Right (X=0.98m, Y=1.95m, Z=1.85m)
    mat_brass = create_mat("Mat_Bedroom_LampBrass", (0.85, 0.70, 0.22, 1.0), roughness=0.25, metallic=0.92)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=2.10, location=(0.98, 1.95, 1.05))
    lamp_pole = bpy.context.active_object
    lamp_pole.name = "Stage_Bedroom_FloorLampPole"
    lamp_pole.data.materials.append(mat_brass)
    set_smooth(lamp_pole)

    # Circular heavy brass floor lamp base
    bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=0.02, location=(0.98, 1.95, 0.01))
    l_base = bpy.context.active_object
    l_base.name = "Stage_Bedroom_FloorLampBase"
    l_base.data.materials.append(mat_brass)
    set_smooth(l_base)

    # Warm frosted glass globe emitting cozy 2700K ambient home light
    mat_globe = create_mat("Mat_Bedroom_LampGlobe", (1.0, 0.85, 0.55, 1.0), roughness=0.1, emission_color=(1.0, 0.82, 0.48, 1.0), emission_strength=4.5)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, location=(0.98, 1.95, 2.14))
    globe = bpy.context.active_object
    globe.name = "Stage_Bedroom_LampGlobe"
    globe.data.materials.append(mat_globe)
    set_smooth(globe)

    return wall

def build_office_enclosure():
    """Constructs a modern corporate tech office with Scrum whiteboard, post-it notes, acoustic baffles, and clock."""
    # 1. Solid Office Back Wall (Modern neutral corporate grey-white, scaled high to fully enclose the ceiling)
    mat_wall = create_mat("Mat_Office_Wall", (0.86, 0.88, 0.91, 1.0), roughness=0.85)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 2.25, 2.50))
    wall = bpy.context.active_object
    wall.name = "Stage_BackWall"
    wall.scale = (6.0, 0.05, 3.0) # Dimensions: 12.0m wide, 0.10m thick, 6.0m tall
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wall.data.materials.append(mat_wall)

    # 2. Corporate Acoustic Slats on left
    mat_slat = create_mat("Mat_Office_WoodSlat", (0.76, 0.58, 0.38, 1.0), roughness=0.55)
    for i, sx in enumerate([-1.25, -1.15, -1.05, -0.95, -0.85, -0.75, -0.65, -0.55]):
        bpy.ops.mesh.primitive_cube_add(location=(sx, 2.19, 1.75))
        slat = bpy.context.active_object
        slat.name = f"Stage_Slat_{i}"
        slat.scale = (0.025, 0.012, 1.75)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        slat.data.materials.append(mat_slat)

    # 2b. Modern Ceramic Planter & Saguaro Cactus in the far-left corner beside acoustic slats
    # Positioned at X=-1.08m, Y=2.05m so it's beautifully visible in the room corner while staying 0.55m clear of Gemini (X=-0.48m)
    mat_pot = create_mat("Mat_Office_PlanterPot", (0.92, 0.90, 0.88, 1.0), roughness=0.3)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=0.24, location=(-1.08, 2.05, 0.22))
    pot = bpy.context.active_object
    pot.name = "Stage_Office_Cactus_Pot"
    pot.data.materials.append(mat_pot)
    set_smooth(pot)

    # Tripod wooden legs for planter
    mat_pot_wood = create_mat("Mat_Pot_Legs", (0.35, 0.22, 0.12, 1.0), roughness=0.6)
    for angle in [30, 150, 270]:
        lx = -1.08 + 0.075 * math.cos(math.radians(angle))
        ly = 2.05 + 0.075 * math.sin(math.radians(angle))
        bpy.ops.mesh.primitive_cylinder_add(radius=0.010, depth=0.26, location=(lx, ly, 0.13))
        leg = bpy.context.active_object
        leg.name = f"Stage_Pot_Leg_{angle}"
        leg.rotation_euler = (0, math.radians(6 * math.cos(math.radians(angle))), math.radians(6 * math.sin(math.radians(angle))))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
        leg.data.materials.append(mat_pot_wood)

    # Soil disc
    mat_soil = create_mat("Mat_Cactus_Soil", (0.12, 0.08, 0.05, 1.0), roughness=0.9)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.078, depth=0.02, location=(-1.08, 2.05, 0.33))
    soil = bpy.context.active_object
    soil.name = "Stage_Cactus_Soil"
    soil.data.materials.append(mat_soil)

    # Stylized Saguaro Cactus Body (Z: 0.34m to 0.72m, well below Gemini's hover zone Z > 1.05m)
    mat_cactus = create_mat("Mat_Office_Cactus_Green", (0.16, 0.54, 0.24, 1.0), roughness=0.45)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.038, depth=0.36, location=(-1.08, 2.05, 0.52))
    stem = bpy.context.active_object
    stem.name = "Stage_Cactus_MainStem"
    stem.data.materials.append(mat_cactus)
    set_smooth(stem)

    # Rounded dome top
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.038, location=(-1.08, 2.05, 0.70))
    stem_top = bpy.context.active_object
    stem_top.name = "Stage_Cactus_TopDome"
    stem_top.data.materials.append(mat_cactus)
    set_smooth(stem_top)

    # Left curved arm
    bpy.ops.mesh.primitive_cylinder_add(radius=0.020, depth=0.06, location=(-1.12, 2.05, 0.50))
    arm_l_h = bpy.context.active_object
    arm_l_h.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    arm_l_h.data.materials.append(mat_cactus)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.020, depth=0.12, location=(-1.15, 2.05, 0.56))
    arm_l_v = bpy.context.active_object
    arm_l_v.data.materials.append(mat_cactus)
    set_smooth(arm_l_v)

    # Right curved arm
    bpy.ops.mesh.primitive_cylinder_add(radius=0.020, depth=0.06, location=(-1.04, 2.05, 0.56))
    arm_r_h = bpy.context.active_object
    arm_r_h.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    arm_r_h.data.materials.append(mat_cactus)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.020, depth=0.10, location=(-1.01, 2.05, 0.61))
    arm_r_v = bpy.context.active_object
    arm_r_v.data.materials.append(mat_cactus)
    set_smooth(arm_r_v)

    # Cute blooming flower on cactus top
    mat_flower = create_mat("Mat_Cactus_Flower", (0.95, 0.22, 0.35, 1.0), roughness=0.3, emission_color=(0.95, 0.22, 0.35, 1.0), emission_strength=1.5)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.018, location=(-1.08, 2.05, 0.74))
    flower = bpy.context.active_object
    flower.name = "Stage_Cactus_Flower"
    flower.scale = (1.0, 1.0, 0.6)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    flower.data.materials.append(mat_flower)

    # 3. Agile Scrum Whiteboard on the back wall
    mat_wb_frame = create_mat("Mat_WB_Frame", (0.70, 0.72, 0.75, 1.0), roughness=0.3, metallic=0.85)
    bpy.ops.mesh.primitive_cube_add(location=(0.45, 2.19, 1.95))
    wb_frame = bpy.context.active_object
    wb_frame.name = "Stage_WB_Frame"
    wb_frame.scale = (0.48, 0.012, 0.35)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wb_frame.data.materials.append(mat_wb_frame)

    mat_wb = create_mat("Mat_Whiteboard_Surface", (0.95, 0.96, 0.98, 1.0), roughness=0.15)
    bpy.ops.mesh.primitive_cube_add(location=(0.45, 2.18, 1.95))
    wb = bpy.context.active_object
    wb.name = "Stage_Whiteboard"
    wb.scale = (0.45, 0.005, 0.32)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wb.data.materials.append(mat_wb)

    # Whiteboard Marker Text Helper
    def add_wb_text(text, x, z, size=0.018, color=(0.12, 0.14, 0.18, 1.0)):
        bpy.ops.object.text_add(location=(x, 2.170, z))
        txt = bpy.context.active_object
        txt.name = f"Stage_WB_Txt_{text[:8].replace(' ', '_')}"
        txt.rotation_euler = (math.radians(90), 0, 0)
        txt.data.body = text
        txt.data.size = size
        txt.data.extrude = 0.0005
        mat = create_mat(f"Mat_Marker_{color[0]:.2f}_{color[1]:.2f}", color, roughness=0.3)
        txt.data.materials.append(mat)
        return txt

    # --- Funny Whiteboard Column 1 (Left): Sprint Goal, Panic Warnings, Meme Quotes ---
    add_wb_text('SPRINT 404: "SURVIVE"', 0.08, 2.20, size=0.024, color=(0.10, 0.35, 0.85, 1.0))
    add_wb_text('CRITICAL: DO NOT PUSH TO PROD', 0.08, 2.13, size=0.018, color=(0.88, 0.15, 0.15, 1.0))
    add_wb_text('- "works on my machine"', 0.08, 2.07, size=0.015, color=(0.15, 0.16, 0.20, 1.0))
    add_wb_text('- blame DNS if broken', 0.08, 2.02, size=0.015, color=(0.15, 0.16, 0.20, 1.0))
    add_wb_text('- rewrite in Rust? (NO)', 0.08, 1.97, size=0.015, color=(0.55, 0.18, 0.75, 1.0))
    add_wb_text('BUGS vs COFFEE:', 0.08, 1.89, size=0.015, color=(0.10, 0.35, 0.85, 1.0))

    # Burndown Chart with red trend line shooting UP
    mat_axis = create_mat("Mat_Chart_Axis", (0.2, 0.2, 0.25, 1.0), roughness=0.4)
    bpy.ops.mesh.primitive_cube_add(location=(0.18, 2.171, 1.78))
    c_axis = bpy.context.active_object
    c_axis.scale = (0.08, 0.001, 0.001)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    c_axis.data.materials.append(mat_axis)

    mat_trend = create_mat("Mat_Chart_Trend", (0.9, 0.1, 0.1, 1.0), roughness=0.3, emission_color=(0.9, 0.1, 0.1, 1.0), emission_strength=1.5)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.003, depth=0.14, location=(0.18, 2.169, 1.82))
    trend = bpy.context.active_object
    trend.rotation_euler = (0, math.radians(45), 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    trend.data.materials.append(mat_trend)

    # --- Funny Whiteboard Column 2 (Right): Daily Todo List ---
    add_wb_text('DAILY TODO:', 0.44, 2.20, size=0.022, color=(0.88, 0.15, 0.15, 1.0))
    add_wb_text('[x] Drink 4 coffees', 0.44, 2.13, size=0.016, color=(0.15, 0.16, 0.20, 1.0))
    add_wb_text('[x] Pretend to type fast', 0.44, 2.07, size=0.016, color=(0.15, 0.16, 0.20, 1.0))
    add_wb_text('[ ] Hide from manager', 0.44, 2.01, size=0.016, color=(0.15, 0.16, 0.20, 1.0))
    add_wb_text('[ ] Delete production DB', 0.44, 1.95, size=0.016, color=(0.15, 0.16, 0.20, 1.0))
    add_wb_text('[ ] Push & Pray', 0.44, 1.89, size=0.016, color=(0.15, 0.16, 0.20, 1.0))

    # Colorful Post-it Notes on whiteboard with punchy handwritten notes
    postits = [
        ((0.98, 0.88, 0.20, 1.0), 0.52, 2.169, 1.76, 4, "FIX LATER", 0.008, (0.1, 0.1, 0.1, 1.0)),
        ((0.95, 0.30, 0.55, 1.0), 0.65, 2.169, 1.78, -6, "SOS!!", 0.012, (0.9, 0.1, 0.1, 1.0)),
        ((0.25, 0.75, 0.95, 1.0), 0.76, 2.169, 1.74, 5, "LGTM!", 0.011, (0.1, 0.1, 0.1, 1.0)),
    ]
    for idx, (p_col, px, py, pz, p_rot, p_txt, t_size, t_col) in enumerate(postits):
        p_mat = create_mat(f"Mat_PostIt_{idx}", p_col, roughness=0.6)
        bpy.ops.mesh.primitive_cube_add(location=(px, py, pz))
        note = bpy.context.active_object
        note.name = f"Stage_Note_{idx}"
        note.scale = (0.045, 0.001, 0.045)
        note.rotation_euler = (0, 0, math.radians(p_rot))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        note.data.materials.append(p_mat)

        # Text on sticky note
        bpy.ops.object.text_add(location=(px - 0.035, py - 0.002, pz - 0.008))
        ntxt = bpy.context.active_object
        ntxt.name = f"Stage_Note_Txt_{idx}"
        ntxt.rotation_euler = (math.radians(90), 0, math.radians(p_rot))
        ntxt.data.body = p_txt
        ntxt.data.size = t_size
        ntxt.data.materials.append(create_mat(f"Mat_NoteTxt_{idx}", t_col, roughness=0.4))

    # 4. Corporate Office Wall Clock
    mat_clock_rim = create_mat("Mat_Clock_Rim", (0.1, 0.1, 0.12, 1.0), roughness=0.3)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=0.03, location=(-0.35, 2.22, 2.35))
    clock_rim = bpy.context.active_object
    clock_rim.rotation_euler = (math.radians(90), 0, 0)
    clock_rim.data.materials.append(mat_clock_rim)

    mat_clock_face = create_mat("Mat_Clock_Face", (0.95, 0.95, 0.97, 1.0), roughness=0.2)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=0.005, location=(-0.35, 2.205, 2.35))
    clock_face = bpy.context.active_object
    clock_face.rotation_euler = (math.radians(90), 0, 0)
    clock_face.data.materials.append(mat_clock_face)

    return wall

def build_cafe_enclosure():
    """Constructs an authentic artisan coffee shop back wall with brick wainscot, 3D chalkboard menu, espresso bar, and hanging pendant lights."""
    # 1. Solid Cafe Back Wall: Upper artisan plaster cream, lower terracotta brick
    mat_wall = create_mat("Mat_Cafe_Wall_Plaster", (0.86, 0.82, 0.76, 1.0), roughness=0.85)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 2.25, 2.50))
    wall = bpy.context.active_object
    wall.name = "Stage_BackWall"
    wall.scale = (6.0, 0.05, 3.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wall.data.materials.append(mat_wall)

    # 1b. Lower Terracotta Brick Wainscoting (Z: 0.0 to 0.88m, aligns with desk/table level)
    mat_brick = create_mat("Mat_Cafe_Brick", (0.36, 0.20, 0.14, 1.0), roughness=0.88)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 2.21, 0.44))
    brick = bpy.context.active_object
    brick.name = "Stage_Cafe_BrickWainscot"
    brick.scale = (6.0, 0.02, 0.44)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    brick.data.materials.append(mat_brick)

    # 1c. Warm Oak Dado Trim Rail separating brick and cream wall at Z=0.88m
    mat_rail = create_mat("Mat_Cafe_DadoRail", (0.28, 0.16, 0.08, 1.0), roughness=0.45)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 2.20, 0.88))
    rail = bpy.context.active_object
    rail.name = "Stage_Cafe_DadoRail"
    rail.scale = (6.0, 0.025, 0.03)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    rail.data.materials.append(mat_rail)

    # 2. Chalkboard Menu Frame on the back wall (Right side)
    mat_cb_frame = create_mat("Mat_Menu_Frame", (0.18, 0.11, 0.06, 1.0), roughness=0.5)
    bpy.ops.mesh.primitive_cube_add(location=(0.42, 2.19, 1.95))
    menu_frame = bpy.context.active_object
    menu_frame.name = "Stage_Menu_Frame"
    menu_frame.scale = (0.44, 0.012, 0.35)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    menu_frame.data.materials.append(mat_cb_frame)

    # Chalkboard dark slate surface
    mat_cb = create_mat("Mat_Chalkboard", (0.05, 0.06, 0.06, 1.0), roughness=0.85)
    bpy.ops.mesh.primitive_cube_add(location=(0.42, 2.18, 1.95))
    cb = bpy.context.active_object
    cb.name = "Stage_Chalkboard"
    cb.scale = (0.41, 0.005, 0.32)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    cb.data.materials.append(mat_cb)

    # Chalkboard Menu 3D Lettering Helper
    def add_chalk_text(text, x, z, size=0.018, color=(0.95, 0.95, 0.95, 1.0)):
        bpy.ops.object.text_add(location=(x, 2.170, z))
        txt = bpy.context.active_object
        txt.name = f"Stage_Chalk_Txt_{text[:6].replace(' ', '_')}"
        txt.rotation_euler = (math.radians(90), 0, 0)
        txt.data.body = text
        txt.data.size = size
        txt.data.extrude = 0.0005
        mat = create_mat(f"Mat_Chalk_{color[0]:.2f}_{color[1]:.2f}", color, roughness=0.6)
        txt.data.materials.append(mat)
        return txt

    add_chalk_text('☕ ARTISAN COFFEE', 0.28, 2.20, size=0.024, color=(0.98, 0.88, 0.45, 1.0))
    add_chalk_text('Espresso ...... $3.50', 0.28, 2.13, size=0.017, color=(0.95, 0.95, 0.95, 1.0))
    add_chalk_text('Oat Latte ..... $4.75', 0.28, 2.07, size=0.017, color=(0.95, 0.95, 0.95, 1.0))
    add_chalk_text('Decaf Panic ... $0.00', 0.28, 2.01, size=0.017, color=(0.95, 0.55, 0.55, 1.0))
    add_chalk_text('Croissant ..... $3.25', 0.28, 1.95, size=0.017, color=(0.95, 0.95, 0.95, 1.0))
    add_chalk_text('"Wi-Fi: cafe_guest"', 0.28, 1.87, size=0.014, color=(0.55, 0.85, 0.95, 1.0))

    # 3. Barista Counter Shelf on Back Left Wall (Shifted to X=-1.40m, Z=0.95m, clear of Gemini at X=-0.48m)
    mat_shelf = create_mat("Mat_Cafe_BarShelf", (0.28, 0.16, 0.08, 1.0), roughness=0.5)
    bpy.ops.mesh.primitive_cube_add(location=(-1.40, 2.12, 0.95))
    b_shelf = bpy.context.active_object
    b_shelf.name = "Stage_Cafe_BarShelf"
    b_shelf.scale = (0.42, 0.10, 0.02)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    b_shelf.data.materials.append(mat_shelf)

    # Stylized Chrome Espresso Machine on Barista Shelf
    espresso_glb = r"D:\New folder (2)\assets\downloads\stylized_vintage_coffee_machine_f04cee3f\stylized_vintage_coffee_machine.glb"
    if os.path.exists(espresso_glb):
        try:
            import auto_prop_manager
            auto_prop_manager.import_and_normalize_prop(
                espresso_glb,
                prop_name="Stage_Cafe_EspressoMachine",
                category="counter_appliance",
                target_height=0.38,
                target_location=(-1.40, 2.08, 0.97),
                target_rotation=(0, 0, 15),
                snap_surface_z=0.97
            )
        except Exception as e:
            print(f"⚠️ Espresso GLB import notice: {e}")
    else:
        # Procedural Espresso Machine Body
        mat_chrome = create_mat("Mat_Espresso_Chrome", (0.85, 0.86, 0.88, 1.0), roughness=0.15, metallic=0.92)
        bpy.ops.mesh.primitive_cube_add(location=(-1.40, 2.08, 1.12))
        esp = bpy.context.active_object
        esp.name = "Stage_Cafe_EspressoBody"
        esp.scale = (0.16, 0.08, 0.14)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        esp.data.materials.append(mat_chrome)

    # Coffee Bean Jar on shelf
    mat_jar_glass = create_mat("Mat_Jar_Glass", (0.9, 0.95, 1.0, 0.5), roughness=0.1, metallic=0.1)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.038, depth=0.12, location=(-0.96, 2.08, 1.38))
    jar = bpy.context.active_object
    jar.name = "Stage_Cafe_BeanJar"
    jar.data.materials.append(mat_jar_glass)
    set_smooth(jar)

    # Coffee beans inside jar
    mat_beans = create_mat("Mat_Coffee_Beans", (0.14, 0.08, 0.04, 1.0), roughness=0.8)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=0.09, location=(-0.96, 2.08, 1.36))
    beans = bpy.context.active_object
    beans.name = "Stage_Cafe_Beans"
    beans.data.materials.append(mat_beans)
    set_smooth(beans)

    # Stack of white takeaway cups on shelf
    mat_cup_stack = create_mat("Mat_Cup_Stack", (0.95, 0.95, 0.95, 1.0), roughness=0.6)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=0.15, location=(-1.22, 2.08, 1.345))
    c_stack = bpy.context.active_object
    c_stack.name = "Stage_Cafe_CupStack"
    c_stack.data.materials.append(mat_cup_stack)
    set_smooth(c_stack)

    # 4. Hanging Industrial Cafe Dome Pendant Lights with glowing Edison bulbs
    mat_pendant_shade = create_mat("Mat_Pendant_Shade", (0.12, 0.13, 0.15, 1.0), roughness=0.35, metallic=0.85)
    mat_edison_bulb = create_mat("Mat_Edison_Bulb", (1.0, 0.82, 0.45, 1.0), emission_color=(1.0, 0.78, 0.38, 1.0), emission_strength=6.0)

    for px in [-0.55, 0.45]:
        # Cord
        bpy.ops.mesh.primitive_cylinder_add(radius=0.003, depth=1.20, location=(px, 0.85, 2.80))
        cord = bpy.context.active_object
        cord.name = f"Stage_Pendant_Cord_{px}"
        cord.data.materials.append(mat_pendant_shade)

        # Shade Dome
        bpy.ops.mesh.primitive_cone_add(radius1=0.12, radius2=0.03, depth=0.10, location=(px, 0.85, 2.25))
        shade = bpy.context.active_object
        shade.name = f"Stage_Pendant_Shade_{px}"
        shade.data.materials.append(mat_pendant_shade)
        set_smooth(shade)

        # Glowing Edison Bulb
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.035, location=(px, 0.85, 2.21))
        bulb = bpy.context.active_object
        bulb.name = f"Stage_Pendant_Bulb_{px}"
        bulb.data.materials.append(mat_edison_bulb)
        set_smooth(bulb)

    return wall

def build_spaceship_enclosure():
    """Constructs a cinematic sci-fi spaceship bridge/cockpit with curved bulkhead, starfield viewport, holographic radar, and hazard stripes."""
    # 1. Sci-Fi Titanium Bulkhead Back Wall with Arch Openings (Dark metallic slate: #10141D)
    mat_bulkhead = create_mat("Mat_Ship_Bulkhead", (0.06, 0.08, 0.12, 1.0), roughness=0.35, metallic=0.90)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 2.35, 2.50))
    wall = bpy.context.active_object
    wall.name = "Stage_BackWall"
    wall.scale = (6.0, 0.08, 3.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wall.data.materials.append(mat_bulkhead)

    # 2. Glowing Cyan Conduit Ribs on the left & right bulkhead arches
    mat_cyan_conduit = create_mat("Mat_Ship_CyanConduit", (0.05, 0.85, 1.0, 1.0), emission_color=(0.05, 0.85, 1.0, 1.0), emission_strength=5.5)
    for rx in [-1.30, -0.90, 0.90, 1.30]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.015, depth=4.2, location=(rx, 2.26, 2.20))
        rib = bpy.context.active_object
        rib.name = f"Stage_Ship_Conduit_{rx}"
        rib.data.materials.append(mat_cyan_conduit)
        set_smooth(rib)

    # 3. Yellow/Black Hazard Caution Stripes along the floor seam
    mat_hazard = create_mat("Mat_Ship_Hazard", (0.95, 0.75, 0.05, 1.0), roughness=0.4)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 2.24, 0.05))
    haz = bpy.context.active_object
    haz.name = "Stage_Ship_HazardStrip"
    haz.scale = (6.0, 0.03, 0.05)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    haz.data.materials.append(mat_hazard)

    # 4. Panoramic Cockpit Observation Viewport (Center Z=1.90m)
    mat_view_frame = create_mat("Mat_Ship_ViewportFrame", (0.12, 0.14, 0.18, 1.0), roughness=0.3, metallic=0.92)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 2.26, 2.05))
    v_frame = bpy.context.active_object
    v_frame.name = "Stage_Ship_ViewportFrame"
    v_frame.scale = (1.10, 0.03, 0.55)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    v_frame.data.materials.append(mat_view_frame)

    # Deep Space Viewport Glass showing stars & distant glowing nebula
    mat_space_glass = create_mat("Mat_Ship_SpaceView", (0.02, 0.03, 0.07, 1.0), roughness=0.1, metallic=0.1,
                                 emission_color=(0.12, 0.25, 0.55, 1.0), emission_strength=1.8)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 2.24, 2.05))
    space_view = bpy.context.active_object
    space_view.name = "Stage_Ship_SpaceView"
    space_view.scale = (1.02, 0.01, 0.48)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    space_view.data.materials.append(mat_space_glass)

    # Distant 3D Glowing Ringed Planet through the window
    mat_planet = create_mat("Mat_Ship_Planet", (0.85, 0.45, 0.25, 1.0), roughness=0.5, emission_color=(0.85, 0.45, 0.25, 1.0), emission_strength=1.2)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, location=(0.42, 2.22, 2.20))
    planet = bpy.context.active_object
    planet.name = "Stage_Ship_PlanetSphere"
    planet.data.materials.append(mat_planet)
    set_smooth(planet)

    mat_ring = create_mat("Mat_Ship_PlanetRing", (0.95, 0.85, 0.65, 1.0), roughness=0.4, emission_color=(0.95, 0.85, 0.65, 1.0), emission_strength=1.5)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.30, minor_radius=0.015, location=(0.42, 2.22, 2.20))
    p_ring = bpy.context.active_object
    p_ring.name = "Stage_Ship_PlanetRing"
    p_ring.rotation_euler = (math.radians(25), math.radians(-35), 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    p_ring.data.materials.append(mat_ring)

    # 5. Glowing Holographic Radar Orbit Ring in front of viewport
    mat_holo_radar = create_mat("Mat_Ship_HoloRadar", (0.05, 0.95, 0.85, 1.0), emission_color=(0.05, 0.95, 0.85, 1.0), emission_strength=4.8)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.24, minor_radius=0.006, location=(-0.35, 2.15, 2.05))
    h_radar = bpy.context.active_object
    h_radar.name = "Stage_Ship_HoloRadar"
    h_radar.rotation_euler = (math.radians(15), math.radians(20), 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    h_radar.data.materials.append(mat_holo_radar)

    # 6. Pulsing Amber Alert Beacon on top bulkhead
    mat_beacon = create_mat("Mat_Ship_AlertBeacon", (1.0, 0.45, 0.05, 1.0), emission_color=(1.0, 0.45, 0.05, 1.0), emission_strength=6.0)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.06, location=(0.0, 2.20, 2.70))
    beacon = bpy.context.active_object
    beacon.name = "Stage_Ship_AlertBeacon"
    beacon.data.materials.append(mat_beacon)
    set_smooth(beacon)

    return wall

def build_timetravel_enclosure():
    """Constructs an authentic 1995 dial-up computing room with vintage wood paneling, 90s tech posters, and a glowing temporal portal anomaly."""
    # 1. Vintage 1995 Dark Wood-Paneled Wall
    mat_wall = create_mat("Mat_1995_WoodPanel", (0.32, 0.19, 0.11, 1.0), roughness=0.75)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 2.25, 2.50))
    wall = bpy.context.active_object
    wall.name = "Stage_BackWall"
    wall.scale = (6.0, 0.05, 3.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wall.data.materials.append(mat_wall)

    # Wood panel vertical grooving slats
    mat_groove = create_mat("Mat_1995_Groove", (0.16, 0.09, 0.05, 1.0), roughness=0.9)
    for gx in [-1.2, -0.9, -0.6, -0.3, 0.0, 0.3, 0.6, 0.9, 1.2]:
        bpy.ops.mesh.primitive_cube_add(location=(gx, 2.22, 2.50))
        grv = bpy.context.active_object
        grv.name = f"Stage_1995_Groove_{gx}"
        grv.scale = (0.008, 0.008, 3.0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        grv.data.materials.append(mat_groove)

    # 2. Glowing Swirling Temporal Chrono-Portal Vortex in Background (Elevated to Z=2.30, Warm Golden-Amber)
    mat_portal_ring = create_mat("Mat_1995_PortalRing", (1.0, 0.72, 0.18, 1.0), emission_color=(1.0, 0.72, 0.18, 1.0), emission_strength=7.0)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.48, minor_radius=0.025, location=(0.0, 2.16, 2.30))
    p_ring = bpy.context.active_object
    p_ring.name = "Stage_1995_PortalRing"
    p_ring.data.materials.append(mat_portal_ring)

    # Inner event horizon disc (warm magenta-amber rift)
    mat_portal_core = create_mat("Mat_1995_PortalCore", (0.85, 0.28, 0.50, 1.0), emission_color=(0.85, 0.28, 0.50, 1.0), emission_strength=4.5)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.45, depth=0.005, location=(0.0, 2.18, 2.30))
    p_core = bpy.context.active_object
    p_core.name = "Stage_1995_PortalCore"
    p_core.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    p_core.data.materials.append(mat_portal_core)

    # Floating Temporal Glyphs / Coordinates
    def add_portal_text(text, x, z, size=0.022):
        bpy.ops.object.text_add(location=(x, 2.13, z))
        txt = bpy.context.active_object
        txt.name = f"Stage_1995_Txt_{text[:6].replace(' ', '_')}"
        txt.rotation_euler = (math.radians(90), 0, 0)
        txt.data.body = text
        txt.data.size = size
        txt.data.extrude = 0.001
        mat_glyph = create_mat("Mat_1995_Glyph", (1.0, 0.85, 0.30, 1.0), emission_color=(1.0, 0.85, 0.30, 1.0), emission_strength=5.5)
        txt.data.materials.append(mat_glyph)
        return txt

    add_portal_text("YEAR: 1995 [A.D.]", -0.22, 2.60, size=0.028)
    add_portal_text("TEMPORAL DRIFT: +31Y", -0.20, 2.00, size=0.020)

    # 3. Vintage Framed 90s Posters on Wall
    mat_w95_frame = create_mat("Mat_1995_Frame", (0.1, 0.1, 0.12, 1.0), roughness=0.5)
    bpy.ops.mesh.primitive_cube_add(location=(-0.65, 2.20, 2.05))
    pf1 = bpy.context.active_object
    pf1.name = "Stage_1995_Post1_Frame"
    pf1.scale = (0.18, 0.01, 0.24)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    pf1.data.materials.append(mat_w95_frame)

    mat_w95_art = create_mat("Mat_1995_W95Art", (0.0, 0.45, 0.75, 1.0), emission_color=(0.1, 0.55, 0.85, 1.0), emission_strength=1.5)
    bpy.ops.mesh.primitive_cube_add(location=(-0.65, 2.19, 2.05))
    pa1 = bpy.context.active_object
    pa1.name = "Stage_1995_Post1_Art"
    pa1.scale = (0.16, 0.005, 0.21)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    pa1.data.materials.append(mat_w95_art)

    # Right Poster: "DIAL-UP 28.8K"
    bpy.ops.mesh.primitive_cube_add(location=(0.65, 2.20, 2.05))
    pf2 = bpy.context.active_object
    pf2.name = "Stage_1995_Post2_Frame"
    pf2.scale = (0.18, 0.01, 0.24)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    pf2.data.materials.append(mat_w95_frame)

    mat_dial_art = create_mat("Mat_1995_DialArt", (0.85, 0.25, 0.15, 1.0), emission_color=(0.85, 0.25, 0.15, 1.0), emission_strength=1.2)
    bpy.ops.mesh.primitive_cube_add(location=(0.65, 2.19, 2.05))
    pa2 = bpy.context.active_object
    pa2.name = "Stage_1995_Post2_Art"
    pa2.scale = (0.16, 0.005, 0.21)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    pa2.data.materials.append(mat_dial_art)

    return wall

def build_street_walk_environment():
    """Constructs a vibrant, sunny outdoor sidewalk environment with pavement slabs, curb, asphalt road, street lamp, fire hydrant, and planter."""
    # 1. Concrete Sidewalk Pavement Slabs (Smooth light grey concrete with expansion joints)
    mat_sidewalk = create_mat("Mat_Street_Sidewalk", (0.75, 0.77, 0.80, 1.0), roughness=0.82)
    bpy.ops.mesh.primitive_cube_add(location=(-0.35, 1.5, -0.025))
    sw = bpy.context.active_object
    sw.name = "Stage_Street_Sidewalk"
    sw.scale = (1.20, 25.0, 0.025)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    sw.data.materials.append(mat_sidewalk)

    # 2. Concrete Safety Curb Stone
    mat_curb = create_mat("Mat_Street_Curb", (0.58, 0.60, 0.62, 1.0), roughness=0.75)
    bpy.ops.mesh.primitive_cube_add(location=(0.48, 1.5, 0.02))
    curb = bpy.context.active_object
    curb.name = "Stage_Street_Curb"
    curb.scale = (0.06, 25.0, 0.02)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    curb.data.materials.append(mat_curb)

    # 3. Asphalt Street Road
    mat_asphalt = create_mat("Mat_Street_Asphalt", (0.16, 0.17, 0.19, 1.0), roughness=0.92)
    bpy.ops.mesh.primitive_cube_add(location=(1.80, 1.5, -0.04))
    road = bpy.context.active_object
    road.name = "Stage_Street_Road"
    road.scale = (1.25, 25.0, 0.02)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    road.data.materials.append(mat_asphalt)

    # Crisp Yellow Centerline on Road
    mat_yellow_line = create_mat("Mat_Street_YellowLine", (0.95, 0.78, 0.12, 1.0), roughness=0.5)
    bpy.ops.mesh.primitive_cube_add(location=(1.80, 1.5, -0.018))
    y_line = bpy.context.active_object
    y_line.name = "Stage_Street_YellowLine"
    y_line.scale = (0.05, 25.0, 0.001)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    y_line.data.materials.append(mat_yellow_line)

    # 4. Modern Concrete Urban Planter Box with Lush Green Shrubs & Flowers (far left, clear of Gemini)
    mat_planter_box = create_mat("Mat_Street_PlanterBox", (0.85, 0.85, 0.87, 1.0), roughness=0.6)
    bpy.ops.mesh.primitive_cube_add(location=(-1.15, 2.0, 0.25))
    p_box = bpy.context.active_object
    p_box.name = "Stage_Street_PlanterBox"
    p_box.scale = (0.24, 0.65, 0.25)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    p_box.data.materials.append(mat_planter_box)

    mat_shrub = create_mat("Mat_Street_Shrub", (0.16, 0.55, 0.22, 1.0), roughness=0.7)
    for sx, sy in [(-1.22, 1.7), (-1.12, 2.0), (-1.18, 2.3)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, location=(sx, sy, 0.58))
        shrub = bpy.context.active_object
        shrub.name = f"Stage_Street_Shrub_{sy}"
        shrub.data.materials.append(mat_shrub)
        set_smooth(shrub)

    # Colorful blooming sidewalk flowers
    mat_fl_pink = create_mat("Mat_Street_Flower_Pink", (0.95, 0.35, 0.65, 1.0), emission_color=(0.95, 0.35, 0.65, 1.0), emission_strength=1.5)
    for fx, fy in [(-1.18, 1.8), (-1.08, 2.15)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.035, location=(fx, fy, 0.72))
        fl = bpy.context.active_object
        fl.name = f"Stage_Street_Flower_{fy}"
        fl.data.materials.append(mat_fl_pink)

    # 5. Victorian Dark Green Street Lamp Post (Scaled to 2.4m height, perfectly framed within vertical 9:16 safe bounds)
    mat_lamp_post = create_mat("Mat_Street_LampPost", (0.12, 0.22, 0.16, 1.0), roughness=0.35, metallic=0.85)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=2.4, location=(0.70, 2.4, 1.20))
    l_post = bpy.context.active_object
    l_post.name = "Stage_Street_LampPost"
    l_post.data.materials.append(mat_lamp_post)
    set_smooth(l_post)

    # Lamp lantern head
    mat_lamp_glow = create_mat("Mat_Street_LampGlow", (1.0, 0.95, 0.75, 1.0), emission_color=(1.0, 0.95, 0.75, 1.0), emission_strength=3.5)
    bpy.ops.mesh.primitive_cube_add(location=(0.70, 2.4, 2.45))
    l_head = bpy.context.active_object
    l_head.name = "Stage_Street_LampHead"
    l_head.scale = (0.13, 0.13, 0.18)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    l_head.data.materials.append(mat_lamp_glow)

    # 6. Vibrant Fire Hydrant on Sidewalk (Positioned securely within 9:16 horizontal safety margin)
    mat_hydrant = create_mat("Mat_Street_HydrantRed", (0.88, 0.14, 0.12, 1.0), roughness=0.35)
    mat_brass = create_mat("Mat_Street_HydrantBrass", (0.88, 0.72, 0.20, 1.0), roughness=0.3, metallic=0.9)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.075, depth=0.38, location=(0.28, 0.40, 0.19))
    hyd = bpy.context.active_object
    hyd.name = "Stage_Street_Hydrant"
    hyd.data.materials.append(mat_hydrant)
    set_smooth(hyd)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.075, location=(0.28, 0.40, 0.38))
    hyd_top = bpy.context.active_object
    hyd_top.name = "Stage_Street_HydrantTop"
    hyd_top.data.materials.append(mat_brass)
    set_smooth(hyd_top)

    return sw

def build_room_enclosure(stage_theme=""):
    """
    Constructs an authentic solid indoor room enclosure.
    Radically differentiates Cozy Bedroom, Corporate Office, Coffee Shop, Spaceship Bridge, and 1995 Time Travel Lab.
    """
    theme_lower = stage_theme.lower()
    is_indoor = any(k in theme_lower for k in [
        'desk', 'office', 'bedroom', 'study', 'room', 'latenight', 'sanctuary', 'cozy', 'cafe', 'indoor',
        'datacenter', 'station', 'spaceship', 'bridge', 'cockpit', 'starship', 'timetravel', 'time_travel', '1995', 'lab'
    ])
    if not is_indoor:
        return None

    is_spaceship = any(k in theme_lower for k in ['spaceship', 'bridge', 'cockpit', 'starship', 'sci-fi', 'scifi'])
    is_timetravel = any(k in theme_lower for k in ['timetravel', 'time_travel', '1995', 'dialup'])
    is_cafe = any(k in theme_lower for k in ['cafe', 'coffee', 'barista', 'bakery', 'bistro'])
    is_bedroom = any(k in theme_lower for k in ['night', 'latenight', 'sanctuary', 'dark', '3am', 'midnight', 'bedroom', 'study', 'cozy', 'home'])
    is_office = any(k in theme_lower for k in ['office', 'corporate', 'workplace', 'commute', 'grind', 'meeting', 'cubicle'])

    if is_spaceship:
        print(f"🚀 [STAGE BUILDER] Constructing Spaceship Bridge Enclosure (Curved Bulkhead, Starfield Viewport, Holographic Radar)...")
        return build_spaceship_enclosure()
    elif is_timetravel:
        print(f"⏳ [STAGE BUILDER] Constructing 1995 Time Travel Enclosure (Wood Panels, Temporal Portal, 90s Posters)...")
        return build_timetravel_enclosure()
    elif is_cafe:
        print(f"☕ [STAGE BUILDER] Constructing Coffee Shop / Cafe Enclosure (Chalkboard Menu, Wood Wainscot, Pendants)...")
        return build_cafe_enclosure()
    elif is_bedroom:
        print(f"🏠 [STAGE BUILDER] Constructing Cozy Bedroom / Home Study (Wall Shelf, Books, Succulent, Corner Lamp, Rug)...")
        return build_bedroom_enclosure()
    elif is_office:
        print(f"🏢 [STAGE BUILDER] Constructing Corporate Office Enclosure (Whiteboard, Acoustic Slats, Cactus, Clock)...")
        return build_office_enclosure()
    else:
        print(f"🏢 [STAGE BUILDER] Defaulting unspecified indoor setting to Corporate Office Enclosure...")
        return build_office_enclosure()

def setup_lights(lighting_recipe, stage_theme=""):
    """Sets up an authentic lighting rig customized to each narrative environment."""
    theme_lower = stage_theme.lower()
    is_latenight = any(k in theme_lower for k in ['night', 'latenight', 'sanctuary', 'dark', '3am', 'midnight', 'bedroom', 'home']) and not any(k in theme_lower for k in ['day', 'morning', 'office', 'corporate', 'cafe', 'street', 'walk'])
    is_cafe = any(k in theme_lower for k in ['cafe', 'coffee', 'bistro', 'bakery'])
    is_spaceship = any(k in theme_lower for k in ['spaceship', 'bridge', 'cockpit', 'starship', 'sci-fi', 'scifi'])
    is_timetravel = any(k in theme_lower for k in ['time_travel', 'timetravel', '1995', 'dialup'])
    is_street = any(k in theme_lower for k in ['walk', 'street', 'sidewalk'])
    is_mars = any(k in theme_lower for k in ['mars', 'martian', 'regolith', 'desert'])

    world = bpy.context.scene.world
    bg_node = None
    if world and world.node_tree:
        bg_node = world.node_tree.nodes.get("ShaderNodeBackground") or world.node_tree.nodes.get("Background")

    if is_latenight:
        print("🌙 [STAGE BUILDER] Setting up authentic 3 AM late-night screen-lit lighting rig...")
        if bg_node:
            bg_node.inputs["Strength"].default_value = 0.08

        # 1. Warm Desk Lamp Spot Light (directional cone on desk, deep surrounding shadows)
        spot_data = bpy.data.lights.new("Light_Desk_Lamp_Spot", type='SPOT')
        spot_data.energy = 42.0
        spot_data.color = (1.0, 0.76, 0.40) # Warm 2700K incandescent amber
        spot_data.spot_size = math.radians(65)
        spot_data.spot_blend = 0.50
        spot_obj = bpy.data.objects.new("Light_Desk_Lamp_Spot", spot_data)
        bpy.context.collection.objects.link(spot_obj)
        spot_obj.location = (-0.58, 0.65, 1.40)
        spot_obj.rotation_euler = (math.radians(-25), math.radians(20), 0)

        # 2. Laptop Monitor Face Glow
        screen_data = bpy.data.lights.new("Light_Monitor_Glow", type='POINT')
        screen_data.energy = 7.0
        screen_data.color = (0.82, 0.90, 1.0)
        screen_obj = bpy.data.objects.new("Light_Monitor_Glow", screen_data)
        bpy.context.collection.objects.link(screen_obj)
        screen_obj.location = (0.02, 0.42, 1.05)

        # 3. Soft Warm Ambient Fill Light
        fill_data = bpy.data.lights.new("Light_Ambient_Warm_Fill", type='AREA')
        fill_data.energy = 16.0
        fill_data.size = 2.0
        fill_data.color = (1.0, 0.82, 0.62)
        fill_obj = bpy.data.objects.new("Light_Ambient_Warm_Fill", fill_data)
        bpy.context.collection.objects.link(fill_obj)
        fill_obj.location = (0.2, -1.2, 1.6)
        fill_obj.rotation_euler = (math.radians(45), math.radians(-15), 0)

        # 4. Subtle Warm Edge Rim Light
        rim_data = bpy.data.lights.new("Light_Rim_Back", type='POINT')
        rim_data.energy = 18.0
        rim_data.color = (1.0, 0.65, 0.28)
        rim_obj = bpy.data.objects.new("Light_Rim_Back", rim_data)
        bpy.context.collection.objects.link(rim_obj)
        rim_obj.location = (0.4, 1.6, 2.2)
        return

    elif is_cafe:
        print("☕ [STAGE BUILDER] Setting up warm morning artisan coffee shop lighting rig...")
        if bg_node:
            bg_node.inputs["Strength"].default_value = 0.45

        # 1. Warm morning sun streaming obliquely from window
        sun_data = bpy.data.lights.new("Light_Cafe_Sun", type='SUN')
        sun_data.energy = 4.8
        sun_data.color = (1.0, 0.94, 0.82)
        sun_obj = bpy.data.objects.new("Light_Cafe_Sun", sun_data)
        bpy.context.collection.objects.link(sun_obj)
        sun_obj.location = (2.2, -2.0, 3.8)
        sun_obj.rotation_euler = (math.radians(-32), math.radians(28), math.radians(10))

        # 2. Warm ambient cafe bounce with rich bistro golden warmth
        fill_data = bpy.data.lights.new("Light_Cafe_Fill", type='AREA')
        fill_data.energy = 26.0
        fill_data.size = 2.5
        fill_data.color = (1.0, 0.82, 0.65)
        fill_obj = bpy.data.objects.new("Light_Cafe_Fill", fill_data)
        bpy.context.collection.objects.link(fill_obj)
        fill_obj.location = (-1.2, -1.0, 2.2)
        fill_obj.rotation_euler = (math.radians(50), math.radians(-20), 0)

        # 3. Warm golden Edison bulb pools under pendants
        for idx, px in enumerate([-0.55, 0.55]):
            p_data = bpy.data.lights.new(f"Light_Cafe_Pendant_{idx}", type='POINT')
            p_data.energy = 16.0
            p_data.color = (1.0, 0.72, 0.32)
            p_obj = bpy.data.objects.new(f"Light_Cafe_Pendant_{idx}", p_data)
            bpy.context.collection.objects.link(p_obj)
            p_obj.location = (px, 0.48, 2.15)

        # 4. Warm golden rim
        rim_data = bpy.data.lights.new("Light_Rim_Back", type='POINT')
        rim_data.energy = 28.0
        rim_data.color = (1.0, 0.78, 0.45)
        rim_obj = bpy.data.objects.new("Light_Rim_Back", rim_data)
        bpy.context.collection.objects.link(rim_obj)
        rim_obj.location = (0.5, 1.6, 2.3)
        return

    elif is_street:
        print("☀️ [STAGE BUILDER] Setting up crisp sunny outdoor street walk lighting rig...")
        if bg_node:
            bg_node.inputs["Strength"].default_value = 1.15

        # 1. High-energy outdoor sun
        sun_data = bpy.data.lights.new("Light_Street_Sun", type='SUN')
        sun_data.energy = 4.8
        sun_data.color = (1.0, 0.96, 0.90)
        sun_obj = bpy.data.objects.new("Light_Street_Sun", sun_data)
        bpy.context.collection.objects.link(sun_obj)
        sun_obj.location = (2.5, -3.0, 4.5)
        sun_obj.rotation_euler = (math.radians(-42), math.radians(18), math.radians(20))

        # 2. Open sky ambient fill
        fill_data = bpy.data.lights.new("Light_Street_SkyFill", type='AREA')
        fill_data.energy = 18.0
        fill_data.size = 3.0
        fill_data.color = (0.85, 0.92, 1.0)
        fill_obj = bpy.data.objects.new("Light_Street_SkyFill", fill_data)
        bpy.context.collection.objects.link(fill_obj)
        fill_obj.location = (-1.5, -1.2, 2.4)
        fill_obj.rotation_euler = (math.radians(55), math.radians(-20), 0)

        # 3. Outdoor rim accent
        rim_data = bpy.data.lights.new("Light_Rim_Back", type='POINT')
        rim_data.energy = 28.0
        rim_data.color = (1.0, 0.92, 0.80)
        rim_obj = bpy.data.objects.new("Light_Rim_Back", rim_data)
        bpy.context.collection.objects.link(rim_obj)
        rim_obj.location = (0.6, 1.8, 2.4)
        return

    elif is_spaceship:
        print("🚀 [STAGE BUILDER] Setting up cinematic sci-fi cockpit lighting rig...")
        if bg_node:
            bg_node.inputs["Strength"].default_value = 0.20

        # 1. Cyan holographic instruments face glow (balanced, not blinding)
        hud_data = bpy.data.lights.new("Light_Ship_HUDGlow", type='POINT')
        hud_data.energy = 10.0
        hud_data.color = (0.20, 0.78, 1.0)
        hud_obj = bpy.data.objects.new("Light_Ship_HUDGlow", hud_data)
        bpy.context.collection.objects.link(hud_obj)
        hud_obj.location = (0.0, 0.45, 1.15)

        # 2. Rich warm amber bridge alert rim light (adds depth and warmth)
        rim_data = bpy.data.lights.new("Light_Rim_Back", type='POINT')
        rim_data.energy = 34.0
        rim_data.color = (1.0, 0.60, 0.20)
        rim_obj = bpy.data.objects.new("Light_Rim_Back", rim_data)
        bpy.context.collection.objects.link(rim_obj)
        rim_obj.location = (0.5, 1.8, 2.4)

        # 3. Soft overhead balanced bridge fill
        fill_data = bpy.data.lights.new("Light_Ship_Fill", type='AREA')
        fill_data.energy = 16.0
        fill_data.size = 2.0
        fill_data.color = (0.85, 0.88, 0.95)
        fill_obj = bpy.data.objects.new("Light_Ship_Fill", fill_data)
        bpy.context.collection.objects.link(fill_obj)
        fill_obj.location = (0.0, -1.0, 2.5)
        fill_obj.rotation_euler = (math.radians(60), 0, 0)
        return

    elif is_timetravel:
        print("⏳ [STAGE BUILDER] Setting up 1995 dial-up temporal rift lighting rig...")
        if bg_node:
            bg_node.inputs["Strength"].default_value = 0.25

        # 1. Warm Banker's Desk Lamp Spotlight (Directional warm cone across desk)
        spot_data = bpy.data.lights.new("Light_1995_DeskLamp", type='SPOT')
        spot_data.energy = 44.0
        spot_data.color = (1.0, 0.78, 0.42)
        spot_data.spot_size = math.radians(70)
        spot_data.spot_blend = 0.45
        spot_obj = bpy.data.objects.new("Light_1995_DeskLamp", spot_data)
        bpy.context.collection.objects.link(spot_obj)
        spot_obj.location = (0.42, 0.55, 1.30)
        spot_obj.rotation_euler = (math.radians(35), math.radians(-20), 0)

        # 2. Green phosphor CRT screen bounce on characters' faces
        crt_data = bpy.data.lights.new("Light_1995_CRTGlow", type='POINT')
        crt_data.energy = 22.0
        crt_data.color = (0.05, 1.0, 0.35)
        crt_obj = bpy.data.objects.new("Light_1995_CRTGlow", crt_data)
        bpy.context.collection.objects.link(crt_obj)
        crt_obj.location = (0.0, 0.50, 1.05)

        # 3. Warm incandescent halogen room fill (authentic 90s bedroom/lab lighting)
        fill_data = bpy.data.lights.new("Light_1995_HalogenFill", type='AREA')
        fill_data.energy = 24.0
        fill_data.size = 2.5
        fill_data.color = (1.0, 0.86, 0.68)
        fill_obj = bpy.data.objects.new("Light_1995_HalogenFill", fill_data)
        bpy.context.collection.objects.link(fill_obj)
        fill_obj.location = (-0.8, -1.0, 2.2)
        fill_obj.rotation_euler = (math.radians(50), math.radians(-15), 0)

        # 4. Magenta lava lamp ambient accent
        lava_data = bpy.data.lights.new("Light_1995_LavaFill", type='POINT')
        lava_data.energy = 16.0
        lava_data.color = (0.95, 0.25, 0.75)
        lava_obj = bpy.data.objects.new("Light_1995_LavaFill", lava_data)
        bpy.context.collection.objects.link(lava_obj)
        lava_obj.location = (-0.65, 0.65, 1.20)

        # 5. Temporal portal warm golden-amber rim accent
        rim_data = bpy.data.lights.new("Light_Rim_Back", type='POINT')
        rim_data.energy = 38.0
        rim_data.color = (1.0, 0.78, 0.35)
        rim_obj = bpy.data.objects.new("Light_Rim_Back", rim_data)
        bpy.context.collection.objects.link(rim_obj)
        rim_obj.location = (0.0, 1.95, 2.30)
        return

    elif is_mars:
        print("🔴 [STAGE BUILDER] Setting up dusty orange Martian surface lighting rig...")
        if bg_node:
            bg_node.inputs["Strength"].default_value = 0.35

        # 1. Warm orange/gold Martian sun (soft diffused angle to prevent harsh black ground shadows)
        sun_data = bpy.data.lights.new("Light_Mars_Sun", type='SUN')
        sun_data.energy = 2.8
        sun_data.angle = math.radians(20.0)
        sun_data.color = (1.0, 0.68, 0.38)
        sun_obj = bpy.data.objects.new("Light_Mars_Sun", sun_data)
        bpy.context.collection.objects.link(sun_obj)
        sun_obj.location = (2.2, -2.5, 4.0)
        sun_obj.rotation_euler = (math.radians(-38), math.radians(22), math.radians(15))

        # 2. Rich terracotta regolith ground fill (softens terrain shadows)
        fill_data = bpy.data.lights.new("Light_Mars_GroundBounce", type='AREA')
        fill_data.energy = 36.0
        fill_data.size = 5.0
        fill_data.color = (0.95, 0.38, 0.18)
        fill_obj = bpy.data.objects.new("Light_Mars_GroundBounce", fill_data)
        bpy.context.collection.objects.link(fill_obj)
        fill_obj.location = (0.0, -1.0, 0.8)
        fill_obj.rotation_euler = (math.radians(65), 0, 0)

        # 3. Dramatic warm sunset rim light on astronaut and terrain
        rim_data = bpy.data.lights.new("Light_Rim_Back", type='POINT')
        rim_data.energy = 44.0
        rim_data.color = (1.0, 0.70, 0.35)
        rim_obj = bpy.data.objects.new("Light_Rim_Back", rim_data)
        bpy.context.collection.objects.link(rim_obj)
        rim_obj.location = (0.6, 1.6, 2.3)
        return

    # Standard Daytime Corporate Office Rig
    print("☀️ [STAGE BUILDER] Setting up balanced warm daytime office lighting rig...")
    if bg_node:
        bg_node.inputs["Strength"].default_value = 0.95

    # 1. Key Sun / Daylight
    sun_data = bpy.data.lights.new("Light_Key_Sun", type='SUN')
    sun_data.energy = 2.8
    sun_data.color = (1.0, 0.94, 0.85)
    sun_obj = bpy.data.objects.new("Light_Key_Sun", sun_data)
    bpy.context.collection.objects.link(sun_obj)
    sun_obj.location = (2.0, -2.5, 4.0)
    sun_obj.rotation_euler = (math.radians(-38), math.radians(22), math.radians(15))

    # 2. Fill Sky Area Light (soft corporate ambient bounce)
    fill_data = bpy.data.lights.new("Light_Fill_Sky", type='AREA')
    fill_data.energy = 22.0
    fill_data.size = 2.5
    fill_data.color = (1.0, 0.92, 0.84)
    fill_obj = bpy.data.objects.new("Light_Fill_Sky", fill_data)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.location = (-1.5, -1.0, 2.2)
    fill_obj.rotation_euler = (math.radians(55), math.radians(-25), 0)

    # 3. Rim Accent
    rim_data = bpy.data.lights.new("Light_Rim_Back", type='POINT')
    rim_data.energy = 24.0
    rim_data.color = (1.0, 0.82, 0.62)
    rim_obj = bpy.data.objects.new("Light_Rim_Back", rim_data)
    bpy.context.collection.objects.link(rim_obj)
    rim_obj.location = (0.6, 1.6, 2.3)

def build_procedural_furniture(name, theme="generic", surface_z=0.88):
    """
    Constructs high-end declarative 3D furniture perfectly suited to each environment:
    - Cafe: Modern round bistro table with cast-iron fluted pedestal base, cappuccino & croissant!
    - Spaceship: Sci-Fi cockpit flight helm console with glowing HUD displays & flight joysticks!
    - Time Travel: 1995 Beige melamine computer desk with keyboard tray!
    - Bedroom / Home: Cozy dark walnut writing desk with sleek hairpin legs!
    - Office: Executive Scandinavian light oak standing desk with acoustic cable shield!
    """
    root = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(root)

    t_low = theme.lower()
    is_cafe = any(k in t_low for k in ["cafe", "coffee", "bakery", "bistro"])
    is_spaceship = any(k in t_low for k in ["spaceship", "bridge", "cockpit", "starship", "sci-fi", "scifi"])
    is_timetravel = any(k in t_low for k in ["time_travel", "timetravel", "1995", "retro", "dialup"])
    is_bedroom = any(k in t_low for k in ["bedroom", "latenight", "sanctuary", "cozy", "home", "study"])
    is_mars = any(k in t_low for k in ["mars", "martian", "regolith", "expedition"])

    if is_cafe:
        print("☕ [Furniture Builder] Constructing Cafe Bistro Table...")
        # Round Bistro Tabletop (Radius: 0.42m, Thickness: 0.03m, warm butcher block oak)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.42, depth=0.03, location=(0.02, 0.48, surface_z - 0.015))
        top = bpy.context.active_object
        top.name = f"{name}_BistroTop"
        top.parent = root
        mat_top = create_mat("Mat_Cafe_BistroTop", (0.75, 0.58, 0.40, 1.0), roughness=0.35)
        top.data.materials.append(mat_top)
        set_smooth(top)

        # Fluted Matte Black Cast-Iron Pedestal Column
        mat_iron = create_mat("Mat_Cafe_CastIron", (0.10, 0.11, 0.12, 1.0), roughness=0.45, metallic=0.85)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=surface_z - 0.03, location=(0.02, 0.48, (surface_z - 0.03) / 2.0))
        ped = bpy.context.active_object
        ped.name = f"{name}_Pedestal"
        ped.parent = root
        ped.data.materials.append(mat_iron)
        set_smooth(ped)

        # Heavy Flared Circular Floor Base
        bpy.ops.mesh.primitive_cylinder_add(radius=0.28, depth=0.02, location=(0.02, 0.48, 0.01))
        base = bpy.context.active_object
        base.name = f"{name}_BistroBase"
        base.parent = root
        base.data.materials.append(mat_iron)
        set_smooth(base)

        # Auto-place 2 Cafe Cups and Croissant plate!
        # Cup 1: Ceramic Cappuccino with Latte Leaf Art
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.065, location=(-0.16, 0.42, surface_z + 0.032))
        cup1 = bpy.context.active_object
        cup1.name = "Stage_Cafe_Cup_Ceramic"
        cup1.parent = root
        cup1.data.materials.append(create_mat("Mat_Cafe_CupCeramic", (0.94, 0.94, 0.96, 1.0), roughness=0.2))
        set_smooth(cup1)

        bpy.ops.mesh.primitive_cylinder_add(radius=0.040, depth=0.005, location=(-0.16, 0.42, surface_z + 0.062))
        art = bpy.context.active_object
        art.name = "Stage_Cafe_LatteArt"
        art.parent = root
        art.data.materials.append(create_mat("Mat_Cafe_LatteArt", (0.85, 0.72, 0.58, 1.0), roughness=0.3))

        # Cup 2: Kraft Paper Takeaway Cup with Sleeve
        bpy.ops.mesh.primitive_cylinder_add(radius=0.040, depth=0.10, location=(0.20, 0.44, surface_z + 0.05))
        cup2 = bpy.context.active_object
        cup2.name = "Stage_Cafe_Cup_Takeaway"
        cup2.parent = root
        cup2.data.materials.append(create_mat("Mat_Cafe_PaperCup", (0.95, 0.95, 0.95, 1.0), roughness=0.7))
        set_smooth(cup2)

        bpy.ops.mesh.primitive_cylinder_add(radius=0.042, depth=0.04, location=(0.20, 0.44, surface_z + 0.05))
        sleeve = bpy.context.active_object
        sleeve.name = "Stage_Cafe_CupSleeve"
        sleeve.parent = root
        sleeve.data.materials.append(create_mat("Mat_Cafe_Sleeve", (0.62, 0.45, 0.30, 1.0), roughness=0.85))

        # Golden Butter Croissant on Saucer
        bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=0.008, location=(0.02, 0.38, surface_z + 0.004))
        plate = bpy.context.active_object
        plate.name = "Stage_Cafe_Saucer"
        plate.parent = root
        plate.data.materials.append(create_mat("Mat_Cafe_Saucer", (0.92, 0.92, 0.94, 1.0), roughness=0.2))
        set_smooth(plate)

        bpy.ops.mesh.primitive_torus_add(major_radius=0.045, minor_radius=0.020, location=(0.02, 0.38, surface_z + 0.022))
        croiss = bpy.context.active_object
        croiss.name = "Stage_Cafe_Croissant"
        croiss.scale = (1.2, 0.7, 0.8)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        croiss.parent = root
        croiss.data.materials.append(create_mat("Mat_Cafe_Croissant", (0.88, 0.58, 0.18, 1.0), roughness=0.6))
        set_smooth(croiss)

        return root


    elif is_spaceship:
        print("🚀 [Furniture Builder] Constructing Sci-Fi Flight Helm Console...")
        top_y = 0.50
        # Angular Pilot Avionics Console Chassis
        bpy.ops.mesh.primitive_cube_add(location=(0, top_y, surface_z - 0.04))
        console = bpy.context.active_object
        console.name = f"{name}_ConsoleTop"
        console.scale = (0.64, 0.36, 0.04)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        console.parent = root
        mat_console = create_mat("Mat_Ship_ConsoleChassis", (0.08, 0.10, 0.14, 1.0), roughness=0.3, metallic=0.88)
        console.data.materials.append(mat_console)

        # Angled Dual Holographic HUD Flight Displays (Positioned cleanly at X=±0.11m, well clear of Gemini at X=-0.44m)
        mat_hud = create_mat("Mat_Ship_HUD_Screen", (0.05, 0.85, 1.0, 1.0), roughness=0.1, emission_color=(0.05, 0.85, 1.0, 1.0), emission_strength=5.0)
        for hx, h_rot in [(-0.11, 8), (0.11, -8)]:
            bpy.ops.mesh.primitive_cube_add(location=(hx, top_y - 0.04, surface_z + 0.10))
            screen = bpy.context.active_object
            screen.name = f"{name}_HUDScreen_{hx}"
            screen.scale = (0.14, 0.005, 0.09)
            screen.rotation_euler = (math.radians(-22), 0, math.radians(h_rot))
            bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
            screen.parent = root
            screen.data.materials.append(mat_hud)

        # Dual Flight Control Joysticks (Positioned safely at X=±0.14m right under pilot hands, clear of Gemini)
        mat_stick = create_mat("Mat_Ship_Joystick", (0.15, 0.18, 0.22, 1.0), roughness=0.4, metallic=0.8)
        for jx in [-0.14, 0.14]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=0.14, location=(jx, top_y - 0.10, surface_z + 0.07))
            stick = bpy.context.active_object
            stick.name = f"{name}_Joystick_{jx}"
            stick.rotation_euler = (math.radians(10), 0, 0)
            bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
            stick.parent = root
            stick.data.materials.append(mat_stick)
            set_smooth(stick)

            # Red trigger tip
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.018, location=(jx, top_y - 0.09, surface_z + 0.14))
            grip = bpy.context.active_object
            grip.parent = root
            grip.data.materials.append(create_mat("Mat_Ship_JoyGrip", (0.9, 0.1, 0.1, 1.0), roughness=0.3))

        # Pedestal base
        bpy.ops.mesh.primitive_cube_add(location=(0, top_y, (surface_z - 0.08) / 2.0))
        c_base = bpy.context.active_object
        c_base.name = f"{name}_ConsoleBase"
        c_base.scale = (0.50, 0.26, (surface_z - 0.08) / 2.0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        c_base.parent = root
        c_base.data.materials.append(mat_console)

        return root


    elif is_timetravel:
        print("💾 [Furniture Builder] Constructing 1995 Retro Computer Desk...")
        top_y = 0.50
        # 90s Light Beige Melamine Desktop with black rubber T-molding
        bpy.ops.mesh.primitive_cube_add(location=(0, top_y, surface_z - 0.018))
        desk_top = bpy.context.active_object
        desk_top.name = f"{name}_Top"
        desk_top.scale = (0.64, 0.36, 0.018)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        desk_top.parent = root
        mat_melamine = create_mat("Mat_1995_Melamine", (0.78, 0.75, 0.70, 1.0), roughness=0.6)
        desk_top.data.materials.append(mat_melamine)

        # Pull-Out Keyboard Tray underneath (Z = 0.76m)
        bpy.ops.mesh.primitive_cube_add(location=(0, top_y - 0.08, 0.76))
        tray = bpy.context.active_object
        tray.name = f"{name}_KeyTray"
        tray.scale = (0.35, 0.15, 0.010)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        tray.parent = root
        tray.data.materials.append(mat_melamine)

        # Left PC Tower CPU Stand & Side Panels
        mat_side = create_mat("Mat_1995_DeskSide", (0.35, 0.22, 0.14, 1.0), roughness=0.7)
        for lx in [-0.58, 0.58]:
            bpy.ops.mesh.primitive_cube_add(location=(lx, top_y, (surface_z - 0.036) / 2.0))
            panel = bpy.context.active_object
            panel.name = f"{name}_SidePanel_{lx}"
            panel.scale = (0.02, 0.32, (surface_z - 0.036) / 2.0)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            panel.parent = root
            panel.data.materials.append(mat_side)

        return root


    elif is_bedroom:
        print("🏠 [Furniture Builder] Constructing Cozy Dark Walnut Home Desk...")
        top_y = 0.50
        # Warm Dark Walnut Butcher Block (Rich chocolate brown: #2B1D14)
        bpy.ops.mesh.primitive_cube_add(location=(0, top_y, surface_z - 0.018))
        top = bpy.context.active_object
        top.name = f"{name}_Top"
        top.scale = (0.64, 0.36, 0.018)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        top.parent = root
        mat_walnut = create_mat("Mat_Bedroom_WalnutTop", (0.24, 0.15, 0.09, 1.0), roughness=0.35)
        top.data.materials.append(mat_walnut)
        set_smooth(top)

        # Slim Modern Matte Black Hairpin Legs
        mat_hairpin = create_mat("Mat_Bedroom_Hairpin", (0.10, 0.11, 0.12, 1.0), roughness=0.35, metallic=0.9)
        leg_h = surface_z - 0.036
        for lx in [-0.56, 0.56]:
            for ly in [top_y - 0.28, top_y + 0.28]:
                bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=leg_h, location=(lx, ly, leg_h / 2.0))
                leg = bpy.context.active_object
                leg.name = f"{name}_Hairpin_{lx}_{ly}"
                leg.parent = root
                leg.data.materials.append(mat_hairpin)
                set_smooth(leg)

        # Executive Leather Desk Pad for Laptop & Mouse
        mat_desk_mat = create_mat("Mat_Desk_LeatherPad", (0.12, 0.11, 0.10, 1.0), roughness=0.7)
        bpy.ops.mesh.primitive_cube_add(location=(0.02, 0.42, surface_z + 0.0015))
        dmat = bpy.context.active_object
        dmat.name = "Stage_Desk_Mat"
        dmat.scale = (0.42, 0.22, 0.0015)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        dmat.parent = root
        dmat.data.materials.append(mat_desk_mat)

        return root



    elif is_mars:
        print("🔴 [Furniture Builder] Constructing Deployable Planetary Telemetry Station...")
        top_thickness = 0.03
        top_y = 0.50
        mat_carbon = create_mat("Mat_Mars_FieldDesk", (0.16, 0.17, 0.20, 1.0), roughness=0.35, metallic=0.75)
        bpy.ops.mesh.primitive_cube_add(location=(0.0, top_y, surface_z - top_thickness / 2.0))
        top = bpy.context.active_object
        top.name = f"{name}_FieldTop"
        top.scale = (0.55, 0.28, top_thickness / 2.0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        top.parent = root
        top.data.materials.append(mat_carbon)

        # Rugged telescopic tripod legs
        mat_gold_leg = create_mat("Mat_Mars_Legs", (0.85, 0.70, 0.22, 1.0), roughness=0.3, metallic=0.9)
        leg_h = surface_z - top_thickness
        for lx in [-0.48, 0.48]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.024, depth=leg_h, location=(lx, top_y, leg_h / 2.0))
            leg = bpy.context.active_object
            leg.name = f"{name}_Leg_{lx}"
            leg.parent = root
            leg.data.materials.append(mat_gold_leg)
            set_smooth(leg)

        # Holographic Scanner Disk emitter on Console
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.012, location=(0.0, top_y + 0.10, surface_z + 0.006))
        emitter = bpy.context.active_object
        emitter.name = f"{name}_ScannerEmitter"
        emitter.parent = root
        emitter.data.materials.append(create_mat("Mat_Mars_Scanner", (0.1, 0.85, 1.0, 1.0), emission_color=(0.1, 0.85, 1.0, 1.0), emission_strength=4.5))

        return root

    else:
        # Default Corporate Office: Scandinavian Oak Standing Desk
        print("🏢 [Furniture Builder] Constructing Scandinavian Light Oak Standing Desk...")
        top_thickness = 0.035
        top_y = 0.50
        bpy.ops.mesh.primitive_cube_add(location=(0, top_y, surface_z - top_thickness / 2.0))
        table_top = bpy.context.active_object
        table_top.name = f"{name}_Top"
        table_top.scale = (0.64, 0.36, top_thickness / 2.0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        table_top.parent = root

        bev_mod = table_top.modifiers.new("TableTop_Bevel", 'BEVEL')
        bev_mod.width = 0.008
        bev_mod.segments = 3

        mat_top = create_mat(f"Mat_{name}_Top", (0.78, 0.64, 0.48, 1.0), roughness=0.32)
        table_top.data.materials.append(mat_top)
        set_smooth(table_top)

        mat_steel = create_mat(f"Mat_{name}_SteelFrame", (0.12, 0.13, 0.15, 1.0), roughness=0.35, metallic=0.88)
        leg_h = surface_z - top_thickness

        for lx in [-0.58, 0.58]:
            bpy.ops.mesh.primitive_cube_add(location=(lx, top_y, leg_h / 2.0))
            col = bpy.context.active_object
            col.name = f"{name}_Column_{'L' if lx < 0 else 'R'}"
            col.scale = (0.030, 0.040, leg_h / 2.0)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            col.parent = root
            col.data.materials.append(mat_steel)

            bpy.ops.mesh.primitive_cube_add(location=(lx, top_y, 0.015))
            foot = bpy.context.active_object
            foot.name = f"{name}_Foot_{'L' if lx < 0 else 'R'}"
            foot.scale = (0.040, 0.30, 0.015)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            foot.parent = root
            foot.data.materials.append(mat_steel)

            bpy.ops.mesh.primitive_cube_add(location=(lx, top_y, surface_z - top_thickness - 0.012))
            bracket = bpy.context.active_object
            bracket.name = f"{name}_Bracket_{'L' if lx < 0 else 'R'}"
            bracket.scale = (0.030, 0.25, 0.012)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            bracket.parent = root
            bracket.data.materials.append(mat_steel)

        mat_shield = create_mat(f"Mat_{name}_CableShield", (0.18, 0.20, 0.22, 1.0), roughness=0.75)
        bpy.ops.mesh.primitive_cube_add(location=(0, top_y + 0.05, surface_z - top_thickness - 0.12))
        shield = bpy.context.active_object
        shield.name = f"{name}_AcousticShield"
        shield.scale = (0.52, 0.008, 0.12)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        shield.parent = root
        shield.data.materials.append(mat_shield)
        set_smooth(shield)

        mat_desk_mat = create_mat("Mat_Desk_LeatherPad", (0.10, 0.11, 0.14, 1.0), roughness=0.65)
        bpy.ops.mesh.primitive_cube_add(location=(0.02, 0.42, surface_z + 0.0015))
        dmat = bpy.context.active_object
        dmat.name = "Stage_Desk_Mat"
        dmat.scale = (0.42, 0.22, 0.0015)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        dmat.parent = root
        dmat.data.materials.append(mat_desk_mat)

        return root


def build_procedural_table_prop(prop_name, placement_slot="desk_center", target_height=0.15, surface_z=0.88):
    """Procedurally generates high-quality stylized table props when 3D asset is not on disk."""
    root = bpy.data.objects.new(f"{prop_name}_Root", None)
    bpy.context.collection.objects.link(root)

    p_lower = prop_name.lower()

    # Calculate safe frustum X coordinates (9:16 bounds: [-0.75, +0.45])
    if any(k in p_lower for k in ["monitor", "crt", "terminal"]):
        px, py = 0.0, 0.52
    elif any(k in p_lower for k in ["laptop", "keyboard"]):
        px, py = 0.02, 0.42
    elif any(k in p_lower for k in ["floppy", "drive", "pc"]):
        px, py = 0.42, 0.52
    elif placement_slot == "desk_left":
        px, py = -0.18, 0.44
    elif placement_slot == "desk_right":
        px, py = 0.35, 0.46
    else: # desk_center
        px, py = 0.02, 0.44

    if "floppy" in p_lower or "drive" in p_lower or "pc" in p_lower:
        # Authentic 1995 Desktop PC / Floppy Unit
        bpy.ops.mesh.primitive_cube_add(location=(0, 0, target_height / 2.0))
        box = bpy.context.active_object
        box.scale = (0.12, 0.16, target_height / 2.0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        box.parent = root
        mat_beige = create_mat("Mat_RetroFloppy", (0.75, 0.72, 0.65, 1.0), roughness=0.6)
        box.data.materials.append(mat_beige)

        # Drive slot
        bpy.ops.mesh.primitive_cube_add(location=(0, -0.161, target_height * 0.65))
        slot = bpy.context.active_object
        slot.scale = (0.09, 0.005, 0.008)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        slot.parent = root
        mat_slot = create_mat("Mat_FloppySlot", (0.02, 0.02, 0.02, 1.0), roughness=0.9)
        slot.data.materials.append(mat_slot)

        # Green indicator LED
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.006, location=(0.07, -0.161, target_height * 0.35))
        led = bpy.context.active_object
        led.parent = root
        mat_led = create_mat("Mat_FloppyLED", (0.1, 1.0, 0.2, 1.0), roughness=0.1, emission_color=(0.1, 1.0, 0.2, 1.0), emission_strength=5.0)
        led.data.materials.append(mat_led)

    elif "lever" in p_lower or "panel" in p_lower:
        # Analog Lever / Switch Panel
        bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0.025))
        base = bpy.context.active_object
        base.scale = (0.09, 0.07, 0.025)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        base.parent = root
        base.data.materials.append(create_mat("Mat_LeverBase", (0.1, 0.12, 0.15, 1.0), metallic=0.8, roughness=0.3))

        # Red warning switch
        bpy.ops.mesh.primitive_cylinder_add(radius=0.008, depth=0.08, location=(0, 0, 0.06))
        lever = bpy.context.active_object
        lever.rotation_euler = (math.radians(20), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
        lever.parent = root
        lever.data.materials.append(create_mat("Mat_LeverRed", (0.9, 0.1, 0.1, 1.0), roughness=0.3))

    elif any(k in p_lower for k in ["monitor", "crt", "screen", "terminal", "display"]):
        # Chunky 1995 CRT Phosphor Computer Terminal
        # Base casing
        bpy.ops.mesh.primitive_cube_add(location=(0, 0, target_height * 0.55))
        casing = bpy.context.active_object
        casing.scale = (0.19, 0.16, target_height * 0.45)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        casing.parent = root
        mat_casing = create_mat("Mat_CRT_Casing", (0.78, 0.76, 0.70, 1.0), roughness=0.6)
        casing.data.materials.append(mat_casing)

        # Curved Phosphor Screen Face
        bpy.ops.mesh.primitive_cube_add(location=(0, -0.161, target_height * 0.55))
        screen = bpy.context.active_object
        screen.scale = (0.16, 0.005, target_height * 0.38)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        screen.parent = root
        mat_screen = create_mat("Mat_CRT_Screen", (0.02, 0.15, 0.05, 1.0), roughness=0.1, emission_color=(0.1, 1.0, 0.4, 1.0), emission_strength=4.5)
        screen.data.materials.append(mat_screen)

        # Stand swivel base
        bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=target_height * 0.10, location=(0, 0, target_height * 0.05))
        stand = bpy.context.active_object
        stand.parent = root
        stand.data.materials.append(mat_casing)

    elif "rock" in p_lower or "sample" in p_lower:
        # Specimen containment cylinder with glowing rock
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=target_height, location=(0, 0, target_height / 2.0))
        cyl = bpy.context.active_object
        cyl.parent = root
        mat_glass = create_mat("Mat_SampleGlass", (0.6, 0.9, 1.0, 0.4), roughness=0.1, metallic=0.1)
        cyl.data.materials.append(mat_glass)

        # Floating glowing crystal sample
        bpy.ops.mesh.primitive_ico_sphere_add(radius=0.022, subdivisions=2, location=(0, 0, target_height * 0.50))
        crystal = bpy.context.active_object
        crystal.parent = root
        mat_crys = create_mat("Mat_SampleCrystal", (1.0, 0.35, 0.1, 1.0), roughness=0.2, emission_color=(1.0, 0.45, 0.1, 1.0), emission_strength=4.0)
        crystal.data.materials.append(mat_crys)

    elif "mug" in p_lower or "cup" in p_lower or "coffee" in p_lower:
        # Ceramic Coffee Mug with Curved Handle
        bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=target_height, location=(0, 0, target_height / 2.0))
        mug = bpy.context.active_object
        mug.parent = root
        mat_mug = create_mat("Mat_MugCeramic", (0.92, 0.92, 0.95, 1.0), roughness=0.2)
        mug.data.materials.append(mat_mug)

        # Curved handle
        bpy.ops.mesh.primitive_torus_add(major_radius=0.022, minor_radius=0.006, location=(0.042, 0, target_height * 0.50))
        hnd = bpy.context.active_object
        hnd.rotation_euler = (0, math.radians(90), 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
        hnd.parent = root
        hnd.data.materials.append(mat_mug)

        # Coffee liquid surface
        bpy.ops.mesh.primitive_cylinder_add(radius=0.036, depth=0.005, location=(0, 0, target_height * 0.88))
        liq = bpy.context.active_object
        liq.parent = root
        liq.data.materials.append(create_mat("Mat_CoffeeDark", (0.08, 0.04, 0.02, 1.0), roughness=0.1))

    elif any(k in p_lower for k in ["router", "beacon", "transmitter", "antenna", "modem", "interstellar"]):
        # Futuristic Interstellar Router / Beacon
        bpy.ops.mesh.primitive_cube_add(location=(0, 0, target_height * 0.35))
        r_box = bpy.context.active_object
        r_box.scale = (0.09, 0.08, target_height * 0.30)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        r_box.parent = root
        mat_router = create_mat("Mat_InterstellarRouter", (0.06, 0.08, 0.10, 1.0), roughness=0.3, metallic=0.85)
        r_box.data.materials.append(mat_router)

        # 3 Angled high-gain transmission antennas
        for ax, a_rot in [(-0.06, -18), (0.0, 0), (0.06, 18)]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.005, depth=0.18, location=(ax, 0.04, target_height * 0.65 + 0.08))
            ant = bpy.context.active_object
            ant.rotation_euler = (math.radians(-10), math.radians(a_rot), 0)
            bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
            ant.parent = root
            ant.data.materials.append(mat_router)

        # Prominent front RED BLINKING status warning LED
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.012, location=(0, -0.081, target_height * 0.38))
        red_led = bpy.context.active_object
        red_led.parent = root
        mat_red_led = create_mat("Mat_RouterWarningLED", (1.0, 0.05, 0.05, 1.0), roughness=0.1, emission_color=(1.0, 0.05, 0.05, 1.0), emission_strength=8.0)
        red_led.data.materials.append(mat_red_led)

    elif any(k in p_lower for k in ["laptop", "macbook", "computer", "notebook_pc"]):
        # Sleek Stylized Laptop (Open at 110-degree angle with glowing code screen)
        # 1. Base Keyboard Chassis
        bpy.ops.mesh.primitive_cube_add(location=(0, -0.04, 0.006))
        chassis = bpy.context.active_object
        chassis.scale = (0.16, 0.11, 0.006)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        chassis.parent = root
        mat_chassis = create_mat("Mat_LaptopChassis", (0.12, 0.14, 0.18, 1.0), roughness=0.3, metallic=0.85)
        chassis.data.materials.append(mat_chassis)

        # Keyboard Well
        bpy.ops.mesh.primitive_cube_add(location=(0, -0.03, 0.013))
        keys = bpy.context.active_object
        keys.scale = (0.14, 0.07, 0.002)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        keys.parent = root
        keys.data.materials.append(create_mat("Mat_LaptopKeys", (0.05, 0.05, 0.06, 1.0), roughness=0.7))

        # 2. Angled Display Screen (110 degrees)
        bpy.ops.mesh.primitive_cube_add(location=(0, 0.06, 0.08))
        screen_lid = bpy.context.active_object
        screen_lid.scale = (0.16, 0.005, 0.09)
        screen_lid.rotation_euler = (math.radians(-20), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        screen_lid.parent = root
        screen_lid.data.materials.append(mat_chassis)

        # Glowing IDE / Code Display
        bpy.ops.mesh.primitive_cube_add(location=(0, 0.056, 0.08))
        display = bpy.context.active_object
        display.scale = (0.145, 0.002, 0.078)
        display.rotation_euler = (math.radians(-20), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        display.parent = root
        mat_ide = create_mat("Mat_IDE_Screen", (0.04, 0.12, 0.22, 1.0), roughness=0.1,
                             emission_color=(0.15, 0.70, 0.95, 1.0), emission_strength=4.0)
        display.data.materials.append(mat_ide)

    elif any(k in p_lower for k in ["plant", "succulent", "potted"]):
        # Stylized Terracotta Potted Succulent
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.065, location=(0, 0, 0.032))
        pot = bpy.context.active_object
        pot.parent = root
        mat_pot = create_mat("Mat_TerracottaPot", (0.75, 0.32, 0.16, 1.0), roughness=0.75)
        pot.data.materials.append(mat_pot)

        # Clustered Spherical Succulent Leaves
        mat_leaf = create_mat("Mat_SucculentLeaf", (0.22, 0.62, 0.28, 1.0), roughness=0.5)
        for i, (lx, ly, lz, lr) in enumerate([
            (0, 0, 0.075, 0.025),
            (-0.02, 0.015, 0.068, 0.020),
            (0.02, -0.015, 0.068, 0.020),
            (0.015, 0.02, 0.066, 0.018),
            (-0.015, -0.02, 0.066, 0.018)
        ]):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=lr, location=(lx, ly, lz))
            leaf = bpy.context.active_object
            leaf.name = f"Succulent_Leaf_{i}"
            leaf.parent = root
            leaf.data.materials.append(mat_leaf)
            set_smooth(leaf)

    elif any(k in p_lower for k in ["phone", "smartphone", "mobile"]):
        # Sleek Glass Smartphone
        bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0.005))
        phone = bpy.context.active_object
        phone.scale = (0.038, 0.075, 0.005)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        phone.parent = root
        phone.data.materials.append(create_mat("Mat_PhoneBody", (0.05, 0.06, 0.08, 1.0), roughness=0.2, metallic=0.9))

        # Glowing notification screen
        bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0.009))
        p_screen = bpy.context.active_object
        p_screen.scale = (0.034, 0.070, 0.001)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        p_screen.parent = root
        p_screen.data.materials.append(create_mat("Mat_PhoneScreen", (0.08, 0.10, 0.15, 1.0), roughness=0.1,
                                                  emission_color=(0.95, 0.35, 0.10, 1.0), emission_strength=3.5))

    elif any(k in p_lower for k in ["lamp", "desklamp"]):
        # Modern Angled Minimalist Desk Lamp
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.010, location=(0, 0, 0.005))
        l_base = bpy.context.active_object
        l_base.parent = root
        mat_lamp = create_mat("Mat_DeskLamp", (0.15, 0.16, 0.18, 1.0), roughness=0.35, metallic=0.8)
        l_base.data.materials.append(mat_lamp)

        # Angled Neck
        bpy.ops.mesh.primitive_cylinder_add(radius=0.006, depth=target_height * 0.90, location=(0, 0.04, target_height * 0.45))
        neck = bpy.context.active_object
        neck.rotation_euler = (math.radians(-15), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
        neck.parent = root
        neck.data.materials.append(mat_lamp)

        # Lamp Head Cone with warm light
        bpy.ops.mesh.primitive_cone_add(radius1=0.035, radius2=0.015, depth=0.045, location=(0, -0.02, target_height * 0.88))
        cone = bpy.context.active_object
        cone.rotation_euler = (math.radians(45), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
        cone.parent = root
        cone.data.materials.append(create_mat("Mat_LampLightWarm", (1.0, 0.85, 0.5, 1.0), emission_color=(1.0, 0.85, 0.5, 1.0), emission_strength=5.0))

    elif any(k in p_lower for k in ["keyboard", "keycaps", "mech_keyboard"]):
        # Dedicated Mechanical Keyboard (Sleek angled chassis, PBT keycaps, spacebar)
        bpy.ops.mesh.primitive_cube_add(location=(0, -0.02, 0.008))
        kb_base = bpy.context.active_object
        kb_base.scale = (0.16, 0.065, 0.008)
        kb_base.rotation_euler = (math.radians(-4), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        kb_base.parent = root
        mat_kb = create_mat("Mat_MechKB_Chassis", (0.10, 0.12, 0.15, 1.0), roughness=0.4, metallic=0.7)
        kb_base.data.materials.append(mat_kb)

        # Keycap bed
        bpy.ops.mesh.primitive_cube_add(location=(0, -0.02, 0.018))
        keys = bpy.context.active_object
        keys.scale = (0.15, 0.055, 0.004)
        keys.rotation_euler = (math.radians(-4), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        keys.parent = root
        mat_keys = create_mat("Mat_Keycaps", (0.05, 0.06, 0.07, 1.0), roughness=0.6)
        keys.data.materials.append(mat_keys)

        # Accent Enter / Spacebar
        bpy.ops.mesh.primitive_cube_add(location=(0, -0.055, 0.020))
        spacebar = bpy.context.active_object
        spacebar.scale = (0.06, 0.010, 0.004)
        spacebar.rotation_euler = (math.radians(-4), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        spacebar.parent = root
        mat_accent = create_mat("Mat_KB_Accent", (0.95, 0.45, 0.12, 1.0), roughness=0.3)
        spacebar.data.materials.append(mat_accent)

    else: # Stylized Tech Gadget / Casing
        bpy.ops.mesh.primitive_cube_add(location=(0, 0, target_height / 2.0))
        cube = bpy.context.active_object
        cube.scale = (0.07, 0.07, target_height / 2.0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        cube.parent = root
        cube.data.materials.append(create_mat("Mat_GenericGadget", (0.15, 0.18, 0.22, 1.0), roughness=0.4, metallic=0.7))

        # Blue status indicator ring
        bpy.ops.mesh.primitive_torus_add(major_radius=0.04, minor_radius=0.005, location=(0, 0, target_height * 0.80))
        glow_ring = bpy.context.active_object
        glow_ring.parent = root
        glow_ring.data.materials.append(create_mat("Mat_GadgetLED", (0.2, 0.6, 1.0, 1.0), emission_color=(0.2, 0.6, 1.0, 1.0), emission_strength=3.5))

    root.location = (px, py, surface_z)
    print(f"✅ [Procedural Prop] Created '{prop_name}' at {root.location}")
    return root

def place_stage_props(props_recipe, stage_theme="generic", snap_surface_z=0.88):
    """Iterates through declarative props list and imports GLB or builds procedural models."""
    root_props = []

    # Local asset library locations
    asset_dirs = [
        r"D:\New folder (2)\assets\downloads",
        r"D:\New folder (2)\scratch\assets_cache"
    ]

    # Find active furniture surface height
    has_desk_in_recipe = False
    active_desk_surface_z = 0.0
    for prop_spec in props_recipe:
        name_check = prop_spec.get("name", "").lower()
        if prop_spec.get("category") == "furniture" and any(w in name_check for w in ["desk", "table", "console", "counter", "shelf", "workbench"]):
            has_desk_in_recipe = True
            raw_sz = float(prop_spec.get("surface_z", snap_surface_z))
            # Critical Guard: Furniture in seated scenes MUST provide a surface at standard desk height (0.85m - 0.95m).
            # If the recipe specifies 0 or < 0.5, it represents floor contact rather than surface height.
            if raw_sz < 0.5:
                raw_sz = 0.88
            active_desk_surface_z = raw_sz
            break

    for prop_spec in props_recipe:
        name = prop_spec.get("name", "Prop")
        cat = prop_spec.get("category", "table_prop")
        placement = prop_spec.get("placement", "desk_center")
        target_h = float(prop_spec.get("target_height", 0.15))

        # Check for genuine furniture vs miscategorized table props (e.g. LLM labeling Laptop or Coffee_Mug as 'furniture')
        is_actual_furniture = any(w in name.lower() for w in ["desk", "table", "console", "counter", "shelf", "workbench", "stand", "podium"])
        if cat == "furniture" and is_actual_furniture:
            furn_sz = float(prop_spec.get("surface_z", active_desk_surface_z))
            if furn_sz < 0.5:
                furn_sz = 0.88
            furn = build_procedural_furniture(name, theme=stage_theme, surface_z=furn_sz)
            root_props.append(furn)
            continue
        elif cat == "furniture" and not is_actual_furniture:
            cat = "table_prop"

        if "surface_z" in prop_spec:
            surface_z = float(prop_spec["surface_z"])
        elif has_desk_in_recipe and cat == "table_prop":
            surface_z = active_desk_surface_z
        else:
            surface_z = 0.0

        # Check for available GLB asset match on disk
        matched_glb = None
        p_clean = name.lower().replace('_', ' ')
        for d in asset_dirs:
            if not os.path.exists(d): continue
            for root_dir, _, files in os.walk(d):
                for f in files:
                    if f.endswith('.glb') or f.endswith('.gltf'):
                        f_low = f.lower()
                        if any(token in f_low for token in ["laptop"] if any(k in p_clean for k in ["laptop", "keyboard", "computer", "macbook", "pc", "workstation"])):
                            matched_glb = os.path.join(root_dir, f)
                            break
                        elif any(token in f_low for token in ["coffee", "cup"] if "coffee" in p_clean or "cup" in p_clean):
                            matched_glb = os.path.join(root_dir, f)
                            break
                        elif any(token in f_low for token in ["moon_rock", "rock"] if "rock" in p_clean or "sample" in p_clean):
                            matched_glb = os.path.join(root_dir, f)
                            break
                if matched_glb: break
            if matched_glb: break

        # Calculate safe frustum X coordinates and orientations
        if not has_desk_in_recipe:
            # Outdoor ground props (rocks, containers, routers, beacons)
            if placement in ["desk_left", "ground_left"]:
                pos_x, pos_y = -0.65, 0.65
            elif placement in ["desk_right", "ground_right"]:
                pos_x, pos_y = 0.65, 0.65
            else:
                pos_x, pos_y = 0.45, 0.75
            prop_rot = (0, 0, 0)
        else:
            # Seated desk props
            if any(k in p_clean for k in ["monitor", "crt", "terminal", "laptop", "keyboard"]):
                pos_x, pos_y = 0.05, 0.42
                prop_rot = (0, 0, 180) # Face human user seated behind desk at X=0.05m
            elif placement == "desk_left":
                pos_x, pos_y = -0.22, 0.42
                prop_rot = (0, 0, 0)
            elif placement == "desk_right" or any(k in p_clean for k in ["coffee", "cup", "mug"]):
                pos_x, pos_y = 0.32, 0.44
                prop_rot = (0, 0, 0)
            else: # desk_center
                pos_x, pos_y = 0.02, 0.42
                prop_rot = (0, 0, 0)

        if matched_glb and os.path.exists(matched_glb):
            try:
                prop_root = auto_prop_manager.import_and_normalize_prop(
                    glb_path=matched_glb,
                    prop_name=name,
                    category=cat,
                    target_height=target_h,
                    target_location=(pos_x, pos_y, surface_z),
                    target_rotation=prop_rot,
                    snap_surface_z=surface_z
                )
                if any(k in p_clean for k in ["laptop", "keyboard", "computer"]):
                    # Give screen a sleek glowing code editor look with proper tone
                    mat_screen = bpy.data.materials.get("Material.002")
                    if mat_screen and mat_screen.use_nodes:
                        bsdf = mat_screen.node_tree.nodes.get("Principled BSDF")
                        if bsdf:
                            bsdf.inputs['Base Color'].default_value = (0.05, 0.08, 0.15, 1.0)
                            bsdf.inputs['Emission Color'].default_value = (0.15, 0.55, 0.85, 1.0)
                            bsdf.inputs['Emission Strength'].default_value = 1.0

                root_props.append(prop_root)
                continue
            except Exception as e:
                print(f"⚠️ GLB import failed for '{name}' ({e}), falling back to procedural model.")

        # Build procedural prop
        proc_prop = build_procedural_table_prop(
            prop_name=name,
            placement_slot=placement,
            target_height=target_h,
            surface_z=surface_z
        )
        root_props.append(proc_prop)

    # Workstation Guard:
    # If a desk exists (seated indoor coding scene) and no computing device was spawned, auto-spawn workstation laptop at desk center!
    has_workstation_device = any(any(k in p.name.lower() for k in ["laptop", "keyboard", "monitor", "crt", "computer"]) for p in root_props)
    is_coding_desk_scene = any(k in stage_theme.lower() for k in ["office", "corporate", "bedroom", "latenight", "sanctuary", "cozy", "study", "home"]) and not any(k in stage_theme.lower() for k in ["cafe", "coffee", "bistro", "spaceship", "bridge", "timetravel", "1995", "walk", "street", "mars"])
    if active_desk_surface_z > 0.5 and is_coding_desk_scene and not has_workstation_device:
        print("💻 [STAGE BUILDER] Auto-injecting developer workstation laptop on desk...")
        laptop_glb = r"D:\New folder (2)\assets\downloads\stylized_laptop_d55ed81f\stylized_laptop.glb"
        if os.path.exists(laptop_glb):
            try:
                lap = auto_prop_manager.import_and_normalize_prop(
                    glb_path=laptop_glb,
                    prop_name="Developer_Workstation_Laptop",
                    category="table_prop",
                    target_height=0.20,
                    target_location=(0.02, 0.42, active_desk_surface_z),
                    target_rotation=(0, 0, 180),
                    snap_surface_z=active_desk_surface_z
                )
                mat_screen = bpy.data.materials.get("Material.002")
                if mat_screen and mat_screen.use_nodes:
                    bsdf = mat_screen.node_tree.nodes.get("Principled BSDF")
                    if bsdf:
                        bsdf.inputs['Base Color'].default_value = (0.05, 0.08, 0.15, 1.0)
                        bsdf.inputs['Emission Color'].default_value = (0.15, 0.55, 0.85, 1.0)
                        bsdf.inputs['Emission Strength'].default_value = 1.0
                root_props.append(lap)
            except Exception as e:
                lap = build_procedural_table_prop("Developer_Laptop", placement_slot="desk_center", target_height=0.18, surface_z=active_desk_surface_z)
                root_props.append(lap)
        else:
            lap = build_procedural_table_prop("Developer_Laptop", placement_slot="desk_center", target_height=0.18, surface_z=active_desk_surface_z)
            root_props.append(lap)

    return root_props

def setup_background_motion(motion_recipe, total_frames=900):
    """Creates subtle kinetic background action to keep viewer retention high."""
    if not motion_recipe or not motion_recipe.get("enabled", False):
        return None

    m_type = motion_recipe.get("type", "pulsing_hologram").lower()
    speed = float(motion_recipe.get("speed", 0.5))

    if "hologram" in m_type or "matrix" in m_type or "hud" in m_type:
        # Holographic Gyroscope Orb in Background
        holo_root = bpy.data.objects.new("Hologram_Motion_Root", None)
        bpy.context.collection.objects.link(holo_root)
        holo_root.location = (-0.18, 1.85, 1.45)

        # Outer ring
        bpy.ops.mesh.primitive_torus_add(major_radius=0.35, minor_radius=0.012, location=(0, 0, 0))
        ring1 = bpy.context.active_object
        ring1.parent = holo_root
        mat_ring = create_mat("Mat_HoloRing", (0.1, 0.8, 1.0, 1.0), roughness=0.1, emission_color=(0.1, 0.8, 1.0, 1.0), emission_strength=4.5)
        ring1.data.materials.append(mat_ring)

        # Inner ring
        bpy.ops.mesh.primitive_torus_add(major_radius=0.22, minor_radius=0.009, location=(0, 0, 0))
        ring2 = bpy.context.active_object
        ring2.parent = holo_root
        mat_ring2 = create_mat("Mat_HoloRing2", (1.0, 0.3, 0.7, 1.0), roughness=0.1, emission_color=(1.0, 0.3, 0.7, 1.0), emission_strength=4.0)
        ring2.data.materials.append(mat_ring2)

        # Animate rotation
        ring1.rotation_euler = (0, 0, 0)
        ring1.keyframe_insert(data_path="rotation_euler", frame=1)
        ring1.rotation_euler = (math.radians(360 * speed), math.radians(180 * speed), 0)
        ring1.keyframe_insert(data_path="rotation_euler", frame=total_frames)

        ring2.rotation_euler = (0, 0, 0)
        ring2.keyframe_insert(data_path="rotation_euler", frame=1)
        ring2.rotation_euler = (math.radians(-180 * speed), 0, math.radians(360 * speed))
        ring2.keyframe_insert(data_path="rotation_euler", frame=total_frames)

        return holo_root

    return None

def ensure_human_lower_body(human, is_spacesuit=False, camera_mode="standing_walk"):
    """Ensures legs and footwear are attached to Human_Avatar with proper materials and pivots."""
    if not human:
        return

    # Clear old legs
    for name in ['Human_Leg_L', 'Human_Leg_R', 'Human_Shoe_L', 'Human_Shoe_R', 'Human_Boot_L', 'Human_Boot_R']:
        old_obj = bpy.data.objects.get(name)
        if old_obj:
            bpy.data.objects.remove(old_obj, do_unlink=True)

    if is_spacesuit:
        mat_pants = bpy.data.materials.get("Mat_SpaceSuitPants") or create_mat("Mat_SpaceSuitPants", (0.86, 0.88, 0.92, 1.0), roughness=0.45)
        mat_shoe = create_mat("Mat_SpaceBoots", (0.16, 0.18, 0.22, 1.0), roughness=0.35, metallic=0.7)
    else:
        mat_pants = create_mat('Mat_Human_Pants', (0.12, 0.16, 0.24, 1.0), roughness=0.8)
        mat_shoe = create_mat('Mat_Human_Shoes', (0.9, 0.92, 0.95, 1.0), roughness=0.3)

    leg_len = 0.50
    hip_z = 0.95

    for side in [-1, 1]:
        s_name = "L" if side == -1 else "R"
        hip_pos = (side * 0.11, 0.95, hip_z)

        # 1. Leg Cylinder
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.08, depth=leg_len, vertices=24,
            location=(side * 0.11, 0.95, hip_z - (leg_len / 2.0))
        )
        leg = bpy.context.active_object
        leg.name = f'Human_Leg_{s_name}'
        leg.data.materials.append(mat_pants)
        set_smooth(leg)

        bpy.context.scene.cursor.location = hip_pos
        bpy.ops.object.origin_set(type='ORIGIN_CURSOR')

        leg.parent = human
        leg.matrix_parent_inverse = human.matrix_world.inverted()

        # 2. Footwear / Boot
        shoe_z = hip_z - leg_len - 0.025
        bpy.ops.mesh.primitive_cube_add(location=(side * 0.11, 0.90, shoe_z))
        shoe = bpy.context.active_object
        shoe.name = f'Human_Shoe_{s_name}' if not is_spacesuit else f'Human_Boot_{s_name}'
        shoe.scale = (0.085, 0.15, 0.06) if is_spacesuit else (0.08, 0.14, 0.05)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        shoe.data.materials.append(mat_shoe)
        set_smooth(shoe)

        shoe.parent = leg
        shoe.matrix_parent_inverse = leg.matrix_world.inverted()

def build_spacesuit(human):
    """Equips Human_Avatar with a stylized astronaut suit, metallic collar, and crystal-clear bubble helmet."""
    if not human:
        return

    for name in ['Human_SpaceCollar', 'Human_SpaceHelmet', 'Human_SpacePack']:
        o = bpy.data.objects.get(name)
        if o:
            bpy.data.objects.remove(o, do_unlink=True)

    head_z = 1.56
    neck_z = 1.40

    # 1. Gold Metallic Collar Ring
    bpy.ops.mesh.primitive_torus_add(major_radius=0.28, minor_radius=0.04, location=(0, 0.95, neck_z))
    collar = bpy.context.active_object
    collar.name = 'Human_SpaceCollar'
    collar.parent = human
    collar.matrix_parent_inverse = human.matrix_world.inverted()
    mat_gold = bpy.data.materials.get("Mat_SpaceGold") or bpy.data.materials.new("Mat_SpaceGold")
    mat_gold.use_nodes = True
    bsdf_g = mat_gold.node_tree.nodes.get("Principled BSDF")
    if bsdf_g:
        bsdf_g.inputs['Base Color'].default_value = (0.95, 0.75, 0.15, 1.0)
        bsdf_g.inputs['Metallic'].default_value = 0.92
        bsdf_g.inputs['Roughness'].default_value = 0.22
    collar.data.materials.append(mat_gold)
    set_smooth(collar)

    # 2. Crystal Clear Transparent Astronaut Bubble Helmet
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35, segments=32, ring_count=24, location=(0, 0.95, head_z))
    helmet = bpy.context.active_object
    helmet.name = 'Human_SpaceHelmet'
    helmet.parent = human
    helmet.matrix_parent_inverse = human.matrix_world.inverted()
    set_smooth(helmet)

    # Perfect EEVEE-Next blended glass shader
    mat_dome = bpy.data.materials.get("Mat_Antigravity_Glass_Dome")
    if not mat_dome:
        mat_dome = bpy.data.materials.new("Mat_Antigravity_Glass_Dome")
        mat_dome.use_nodes = True
        if hasattr(mat_dome, 'surface_render_method'):
            mat_dome.surface_render_method = 'BLENDED'
        tree = mat_dome.node_tree
        tree.nodes.clear()
        node_out = tree.nodes.new(type='ShaderNodeOutputMaterial')
        node_mix = tree.nodes.new(type='ShaderNodeMixShader')
        node_trans = tree.nodes.new(type='ShaderNodeBsdfTransparent')
        node_gloss = tree.nodes.new(type='ShaderNodeBsdfGlossy')
        node_fresnel = tree.nodes.new(type='ShaderNodeFresnel')
        node_fresnel.inputs['IOR'].default_value = 1.35
        node_gloss.inputs['Roughness'].default_value = 0.05
        node_trans.inputs['Color'].default_value = (0.92, 0.96, 1.0, 1.0)
        tree.links.new(node_fresnel.outputs['Fac'], node_mix.inputs['Fac'])
        tree.links.new(node_trans.outputs['BSDF'], node_mix.inputs[1])
        tree.links.new(node_gloss.outputs['BSDF'], node_mix.inputs[2])
        tree.links.new(node_mix.outputs['Shader'], node_out.inputs['Surface'])
    helmet.data.materials.append(mat_dome)

    # 3. White Astronaut Life-Support Backpack
    bpy.ops.mesh.primitive_cube_add(location=(0, 1.20, 1.18))
    pack = bpy.context.active_object
    pack.name = 'Human_SpacePack'
    pack.scale = (0.24, 0.08, 0.22)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    pack.parent = human
    pack.matrix_parent_inverse = human.matrix_world.inverted()
    mat_white = create_mat("Mat_SpaceSuitWhite", (0.92, 0.93, 0.95, 1.0), roughness=0.35)
    pack.data.materials.append(mat_white)
    set_smooth(pack)

    # 4. Spacesuit White Torso & Arms
    for p_name in ["Human_Torso", "Human_Pocket", "Human_Arm_L", "Human_Arm_R"]:
        p_obj = bpy.data.objects.get(p_name)
        if p_obj:
            p_obj.data.materials.clear()
            p_obj.data.materials.append(mat_white)

def configure_characters_for_recipe(stage_theme="generic", camera_mode="seated", surface_z=0.88):
    """Adapts character postures, spacesuit, and lower limbs based on theme and camera mode."""
    # Find Human Root
    human = bpy.data.objects.get("Human_Avatar") or bpy.data.objects.get("Human_Root")
    if human:
        # Reset human root to (0,0,0) so all accessories attach at exact local offsets
        human.location = (0.0, 0.0, 0.0)
        human.rotation_euler = (0.0, 0.0, 0.0)
        bpy.context.view_layer.update()

    # Check if outdoor planetary exploration requiring spacesuit
    outdoor_space_keywords = ["mars", "martian", "moon", "lunar", "surface", "spacewalk", "eva"]
    is_outdoor_space = any(k in stage_theme.lower() for k in outdoor_space_keywords) and not any(k in stage_theme.lower() for k in ["bridge", "spaceship", "cockpit", "station"])
    if is_outdoor_space and human:
        print("🧑‍🚀 [Stage Builder] Equipping Human with Astronaut Spacesuit & Bubble Helmet...")
        build_spacesuit(human)
        ensure_human_lower_body(human, is_spacesuit=True, camera_mode=camera_mode)
    elif human:
        # Clear any leftover space accessories when in casual settings
        for name in ['Human_SpaceCollar', 'Human_SpaceHelmet', 'Human_SpacePack']:
            o = bpy.data.objects.get(name)
            if o:
                try:
                    bpy.data.objects.remove(o, do_unlink=True)
                except Exception:
                    pass
        mat_sweater = bpy.data.materials.get("Mat_Human_Sweater") or create_mat("Mat_Human_Sweater", (0.12, 0.16, 0.28, 1.0), roughness=0.7)
        for p_name in ["Human_Torso", "Human_Pocket", "Human_Arm_L", "Human_Arm_R"]:
            p_obj = bpy.data.objects.get(p_name)
            if p_obj:
                p_obj.data.materials.clear()
                p_obj.data.materials.append(mat_sweater)
        ensure_human_lower_body(human, is_spacesuit=False, camera_mode=camera_mode)

    # NOW move human to desired scene position
    t_low = stage_theme.lower()
    is_cafe = any(k in t_low for k in ["cafe", "coffee", "bakery", "bistro"])
    is_spaceship = any(k in t_low for k in ["spaceship", "bridge", "cockpit", "starship", "sci-fi", "scifi"])
    is_timetravel = any(k in t_low for k in ["time_travel", "timetravel", "1995", "retro", "dialup"])

    if human:
        if camera_mode == "seated":
            human.location = (0.05, 0.0, 0.0)
            arm_l = bpy.data.objects.get("Human_Arm_L")
            arm_r = bpy.data.objects.get("Human_Arm_R")
            hand_l = bpy.data.objects.get("Human_Hand_L")
            hand_r = bpy.data.objects.get("Human_Hand_R")
            if arm_l:
                arm_l.location = (-0.30, 0.70, 0.95)
                arm_l.rotation_euler = (math.radians(35), math.radians(-5), math.radians(-10))
            if arm_r:
                arm_r.location = (0.30, 0.70, 0.95)
                arm_r.rotation_euler = (math.radians(35), math.radians(5), math.radians(10))
            if is_cafe:
                if hand_l: hand_l.location = (-0.12, 0.44, 0.89)
                if hand_r: hand_r.location = (0.14, 0.44, 0.89)
            elif is_spaceship:
                if hand_l: hand_l.location = (-0.14, 0.44, 0.94)
                if hand_r: hand_r.location = (0.14, 0.44, 0.94)
            elif is_timetravel:
                # Ergonomic 90s typist posture: left arm tucked naturally close to keyboard tray, clear of Gemini
                if arm_l:
                    arm_l.location = (-0.20, 0.62, 0.95)
                    arm_l.rotation_euler = (math.radians(30), math.radians(-3), math.radians(12))
                if hand_l: hand_l.location = (-0.08, 0.42, 0.89)
                if hand_r: hand_r.location = (0.10, 0.42, 0.89)
            else: # Typing posture on keyboard/laptop
                if hand_l: hand_l.location = (-0.06, 0.48, 0.90)
                if hand_r: hand_r.location = (0.12, 0.48, 0.90)
        else:
            # When standing on the ground (Z=0), lower human by 0.40m so boots touch the floor exactly
            human.location = (0.0, 0.0, -0.40)
            arm_l = bpy.data.objects.get("Human_Arm_L")
            arm_r = bpy.data.objects.get("Human_Arm_R")
            hand_l = bpy.data.objects.get("Human_Hand_L")
            hand_r = bpy.data.objects.get("Human_Hand_R")
            if arm_l:
                arm_l.location = (-0.32, 0.95, 1.05)
                arm_l.rotation_euler = (math.radians(6), 0, math.radians(-3))
            if arm_r:
                arm_r.location = (0.32, 0.95, 1.05)
                arm_r.rotation_euler = (math.radians(-6), 0, math.radians(3))
            if hand_l:
                hand_l.location = (-0.32, 0.95, 0.78)
            if hand_r:
                hand_r.location = (0.32, 0.95, 0.78)
        bpy.context.view_layer.update()

    # Position Gemini floating beside Human
    gemini = (
        bpy.data.objects.get("Antigravity_Popapus_Root") or
        bpy.data.objects.get("Popapus_Agent_Root") or
        bpy.data.objects.get("Gemini")
    )
    # Hide bulky hover ring so Gemini floats authentically on anti-gravity orbs
    ring = bpy.data.objects.get("Popapus_Hover_Ring")
    if ring:
        ring.hide_render = True
        ring.hide_viewport = True

    if gemini:
        if is_spaceship:
            gemini.location = (-0.44, 0.50, 1.50)
        elif is_timetravel:
            gemini.location = (-0.46, 0.50, 1.60)
        elif camera_mode == "seated":
            gemini.location = (-0.48, 0.50, 1.50)
        else:
            # Eye/shoulder level for standing human (Z=1.55m brings Gemini proudly beside astronaut helmet)
            gemini.location = (-0.46, 0.45, 1.55)
        bpy.context.view_layer.update()

def build_procedural_stage_from_recipe(stage_recipe, total_frames=900):
    """
    Main entry point: Constructs a full 3D environment purely from a Stage Recipe dictionary.
    """
    theme = stage_recipe.get("theme", "generic_stage")
    camera_mode = stage_recipe.get("camera_mode", "seated")
    print(f"\n🏗️ [PROCEDURAL STAGE BUILDER] Constructing scene for theme: '{theme}' (Mode: {camera_mode})")

    # 1. Purge old stage props
    purge_transient_stage()

    # 2. Build Ground
    ground = build_ground(stage_recipe.get("ground", {}))

    # 2b. If daylight walk / street walk, build outdoor street environment
    if any(k in theme.lower() for k in ["walk", "street", "sidewalk"]):
        build_street_walk_environment()

    # 3. Build Backdrop & HDRI
    build_backdrop(stage_recipe.get("backdrop", {}), stage_theme=theme)

    # 3b. Build Indoor Room Enclosure (BackWall, Wood Slats, Night Window) if indoor
    build_room_enclosure(stage_theme=theme)

    # 4. Setup Lighting (Adaptive to daylight vs cozy late-night themes)
    setup_lights(stage_recipe.get("lighting", {}), stage_theme=theme)

    # 5. Place Props
    props = place_stage_props(stage_recipe.get("props", []), stage_theme=theme)

    # 6. Setup Background Kinetic Motion
    motion = setup_background_motion(stage_recipe.get("background_motion", {}), total_frames=total_frames)

    # 7. Configure Characters
    configure_characters_for_recipe(stage_theme=theme, camera_mode=camera_mode)

    print(f"✅ [PROCEDURAL STAGE BUILDER] Successfully built stage for '{theme}' ({len(props)} props placed)")
    return {
        "ground": ground,
        "props": props,
        "motion": motion
    }

if __name__ == "__main__":
    import json
    recipe_file = sys.argv[1] if len(sys.argv) > 1 else None
    if recipe_file and os.path.exists(recipe_file):
        with open(recipe_file, 'r', encoding='utf-8') as f:
            recipe = json.load(f)
        build_procedural_stage_from_recipe(recipe)
    else:
        print("Usage: blender -b agent_comedy_stage.blend -P procedural_stage_builder.py -- <recipe.json>")
