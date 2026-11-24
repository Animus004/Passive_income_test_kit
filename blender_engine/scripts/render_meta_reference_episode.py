"""
Master Blender EEVEE Next Director Script:
Recreating the Meta Master Plan Reference Video (0 to 10 Milestone 2).

Features:
- Dynamically loads public/meta_episode.json for exact cut durations and metadata.
- Spawns all 4 vivid 3D hero props (Hyperion Campus, 6.6 GW Tower, MTIA Silicon, Smart Glasses) + Vault.
- Animated dynamic drone camera paths with crisp cinematic hard cuts between scenes.
- Upright floating 3D text HUDs with warm gold bloom and smooth reveal.
- Cyan perspective ground grid and illuminated server racks.
- Renders to blender_engine/renders/meta_reference_raw.mp4 using EEVEE Next on NVIDIA GTX 1660 SUPER.
"""

import bpy
import math
import os
import sys
import json
from mathutils import Vector

def hex_to_rgba(hex_code, alpha=1.0):
    hex_code = hex_code.lstrip('#')
    s_r = int(hex_code[0:2], 16) / 255.0
    s_g = int(hex_code[2:4], 16) / 255.0
    s_b = int(hex_code[4:6], 16) / 255.0
    def to_linear(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (to_linear(s_r), to_linear(s_g), to_linear(s_b), alpha)

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)

def set_smooth(obj):
    if obj and obj.type == 'MESH':
        for p in obj.data.polygons:
            p.use_smooth = True

def create_material(name, base_color=(1,1,1,1), metallic=0.0, roughness=0.5, 
                    emission_color=(0,0,0,1), emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = base_color
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Roughness'].default_value = roughness
        if emission_strength > 0:
            if 'Emission Color' in bsdf.inputs:
                bsdf.inputs['Emission Color'].default_value = emission_color
                bsdf.inputs['Emission Strength'].default_value = emission_strength
            elif 'Emission' in bsdf.inputs:
                bsdf.inputs['Emission'].default_value = emission_color
    return mat

def create_glass_material(name="Mat_Mirrored_Lens"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()
    
    output = tree.nodes.new(type="ShaderNodeOutputMaterial")
    output.location = (400, 0)
    mix = tree.nodes.new(type="ShaderNodeMixShader")
    mix.location = (180, 0)
    mix.inputs['Fac'].default_value = 0.45
    
    transp = tree.nodes.new(type="ShaderNodeBsdfTransparent")
    transp.inputs['Color'].default_value = hex_to_rgba("#1A4B8C")
    transp.location = (-100, 100)
    
    glossy = tree.nodes.new(type="ShaderNodeBsdfGlossy")
    glossy.inputs['Color'].default_value = hex_to_rgba("#6EB4FF")
    glossy.inputs['Roughness'].default_value = 0.05
    glossy.location = (-100, -100)
    
    tree.links.new(transp.outputs['BSDF'], mix.inputs[1])
    tree.links.new(glossy.outputs['BSDF'], mix.inputs[2])
    tree.links.new(mix.outputs['Shader'], output.inputs['Surface'])
    
    mat.blend_method = 'BLEND'
    return mat

def build_materials():
    mats = {}
    mats['floor'] = create_material("Mat_Obsidian_Floor", base_color=(0.015, 0.022, 0.038, 1.0), metallic=0.92, roughness=0.12)
    mats['floor_grid'] = create_material("Mat_Floor_Grid", base_color=hex_to_rgba("#00E5FF"), emission_color=hex_to_rgba("#00E5FF"), emission_strength=4.5)
    
    mats['chassis'] = create_material("Mat_Server_Chassis", base_color=(0.04, 0.06, 0.09, 1.0), metallic=0.85, roughness=0.35)
    mats['led_cyan'] = create_material("Mat_LED_Cyan", base_color=hex_to_rgba("#00E5FF"), emission_color=hex_to_rgba("#00E5FF"), emission_strength=14.0)
    mats['led_green'] = create_material("Mat_LED_Green", base_color=hex_to_rgba("#00E676"), emission_color=hex_to_rgba("#00E676"), emission_strength=12.0)
    mats['led_yellow'] = create_material("Mat_LED_Yellow", base_color=hex_to_rgba("#FFD600"), emission_color=hex_to_rgba("#FFD600"), emission_strength=10.0)
    
    mats['arch_slate'] = create_material("Mat_Arch_Slate", base_color=(0.08, 0.12, 0.18, 1.0), metallic=0.75, roughness=0.25)
    mats['arch_window'] = create_material("Mat_Arch_Window", base_color=hex_to_rgba("#FFF4D0"), emission_color=hex_to_rgba("#FFF4D0"), emission_strength=3.2)
    mats['meta_blue'] = create_material("Mat_Meta_Blue", base_color=hex_to_rgba("#0081FB"), emission_color=hex_to_rgba("#0081FB"), emission_strength=10.0)
    mats['cooling_aluminum'] = create_material("Mat_Cooling_Alum", base_color=(0.75, 0.82, 0.90, 1.0), metallic=0.95, roughness=0.18)
    
    mats['concrete'] = create_material("Mat_Concrete", base_color=(0.35, 0.38, 0.42, 1.0), metallic=0.08, roughness=0.75)
    mats['concrete_rib'] = create_material("Mat_Concrete_Rib", base_color=(0.22, 0.25, 0.28, 1.0), metallic=0.20, roughness=0.60)
    mats['thermal_red'] = create_material("Mat_Thermal_Red", base_color=hex_to_rgba("#FF2E2E"), emission_color=hex_to_rgba("#FF3D3D"), emission_strength=18.0)
    
    mats['silicon_die'] = create_material("Mat_Silicon_Die", base_color=(0.02, 0.04, 0.08, 1.0), metallic=0.96, roughness=0.08)
    mats['gold_24k'] = create_material("Mat_Gold_24K", base_color=hex_to_rgba("#FFC83B"), metallic=0.98, roughness=0.14)
    mats['logic_core'] = create_material("Mat_Logic_Core", base_color=hex_to_rgba("#E8F4FF"), emission_color=hex_to_rgba("#B8E2FF"), emission_strength=16.0)
    
    mats['glasses_frame'] = create_material("Mat_Wayfarer_Frame", base_color=(0.02, 0.03, 0.05, 1.0), metallic=0.45, roughness=0.15)
    mats['glasses_lens'] = create_glass_material("Mat_Polarized_Lens")
    mats['laser_beam'] = create_material("Mat_Laser_Beam", base_color=hex_to_rgba("#00F0FF"), emission_color=hex_to_rgba("#00F0FF"), emission_strength=12.0)
    mats['hud_gold_text'] = create_material("Mat_HUD_Gold_Text", base_color=hex_to_rgba("#FFE28A"), emission_color=hex_to_rgba("#FFE28A"), emission_strength=5.5)
    
    return mats

def build_cyan_grid(size=30.0, spacing=1.2):
    grid_root = bpy.data.objects.new("Floor_Grid_Root", None)
    bpy.context.collection.objects.link(grid_root)
    mat = bpy.data.materials.get("Mat_Floor_Grid")
    half = size / 2.0
    steps = int(size / spacing)
    for i in range(-steps // 2, steps // 2 + 1):
        coord = i * spacing
        bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=size, location=(coord, 0, 0.008), rotation=(0, math.radians(90), 0))
        cx = bpy.context.active_object
        cx.parent = grid_root
        cx.data.materials.append(mat)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=size, location=(0, coord, 0.008), rotation=(math.radians(90), 0, 0))
        cy = bpy.context.active_object
        cy.parent = grid_root
        cy.data.materials.append(mat)
    return grid_root

def build_server_rack(mats, name="ServerRack", location=(0, 0, 0), rotation=(0, 0, 0)):
    rack_root = bpy.data.objects.new(name, None)
    rack_root.location = location
    rack_root.rotation_euler = rotation
    bpy.context.collection.objects.link(rack_root)
    
    width, depth, height = 1.0, 1.2, 3.8
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, height/2))
    cab = bpy.context.active_object
    cab.scale = (width, depth, height)
    cab.name = f"{name}_Cabinet"
    cab.parent = rack_root
    cab.data.materials.append(mats['chassis'])
    
    num_blades = 8
    for b in range(num_blades):
        bz = 0.45 + (b * 0.42)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -depth/2 - 0.02, bz))
        blade = bpy.context.active_object
        blade.scale = (width * 0.88, 0.06, 0.28)
        blade.name = f"{name}_Blade_{b}"
        blade.parent = rack_root
        blade.data.materials.append(mats['chassis'])
        for led_i in range(3):
            lx = -width * 0.35 + (led_i * 0.08)
            bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=0.02, location=(lx, -depth/2 - 0.06, bz), rotation=(math.radians(90), 0, 0))
            led = bpy.context.active_object
            led.name = f"{name}_LED_{b}_{led_i}"
            led.parent = rack_root
            led_mat = mats['led_cyan'] if (b + led_i) % 3 == 0 else (mats['led_green'] if (b + led_i) % 3 == 1 else mats['led_yellow'])
            led.data.materials.append(led_mat)
    return rack_root

def create_floating_3d_text(name, text_str, location=(0, 0, 2.7), scale=0.22):
    font_curve = bpy.data.curves.new(type="FONT", name=f"{name}_Curve")
    font_curve.body = text_str
    font_curve.align_x = 'CENTER'
    font_curve.align_y = 'CENTER'
    font_curve.extrude = 0.08
    font_curve.bevel_depth = 0.015
    font_curve.bevel_resolution = 3
    
    text_obj = bpy.data.objects.new(name, font_curve)
    text_obj.location = location
    text_obj.rotation_euler = (math.radians(90), 0, 0)
    text_obj.scale = (scale, scale, scale)
    bpy.context.collection.objects.link(text_obj)
    
    mat = bpy.data.materials.get("Mat_HUD_Gold_Text")
    if mat:
        text_obj.data.materials.append(mat)
    return text_obj

# --- 4 HERO PROPS BUILDERS ---

def spawn_hyperion_campus(mats, location=(0,0,0)):
    root = bpy.data.objects.new("Prop_Hyperion_Root", None)
    root.location = location
    bpy.context.collection.objects.link(root)
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.4))
    main_bldg = bpy.context.active_object
    main_bldg.scale = (1.5, 1.4, 2.8)
    main_bldg.name = "Hyperion_Monolith"
    main_bldg.parent = root
    main_bldg.data.materials.append(mats['arch_slate'])
    
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 1.55, 0, 0.9))
        wing = bpy.context.active_object
        wing.scale = (1.4, 1.2, 1.8)
        wing.name = f"Hyperion_Wing_{'L' if side == -1 else 'R'}"
        wing.parent = root
        wing.data.materials.append(mats['arch_slate'])
        for f in range(4):
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 1.55, -0.62, 0.35 + f * 0.40))
            strip = bpy.context.active_object
            strip.scale = (1.25, 0.04, 0.12)
            strip.parent = root
            strip.data.materials.append(mats['arch_window'] if f % 2 == 0 else mats['led_cyan'])
            
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_torus_add(major_radius=0.32, minor_radius=0.055, location=(side * 0.24, -0.72, 1.40), rotation=(math.radians(90), 0, 0))
        loop = bpy.context.active_object
        loop.name = f"Meta_Infinity_Loop_{side}"
        loop.parent = root
        loop.data.materials.append(mats['meta_blue'])
        
    for cx in [-0.45, 0, 0.45]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.16, depth=0.35, location=(cx, 0, 2.95))
        chiller = bpy.context.active_object
        chiller.name = f"Roof_Chiller_{cx}"
        chiller.parent = root
        chiller.data.materials.append(mats['cooling_aluminum'])
        
    return root

def spawn_cooling_tower_6_6gw(mats, location=(0,0,0)):
    root = bpy.data.objects.new("Prop_CoolingTower_Root", None)
    root.location = location
    bpy.context.collection.objects.link(root)
    
    bpy.ops.mesh.primitive_cylinder_add(radius=1.35, depth=0.35, vertices=36, location=(0, 0, 0.18))
    plinth = bpy.context.active_object
    plinth.name = "Cooling_Plinth"
    plinth.parent = root
    plinth.data.materials.append(mats['concrete_rib'])
    set_smooth(plinth)
    
    verts = []
    faces = []
    rings = 16
    segments = 32
    height = 2.6
    base_radius = 1.15
    waist_radius = 0.72
    top_radius = 0.95
    waist_h = 1.6
    
    for r in range(rings + 1):
        z = (r / rings) * height
        if z < waist_h:
            t = z / waist_h
            rad = base_radius * (1 - t) + waist_radius * t
        else:
            t = (z - waist_h) / (height - waist_h)
            rad = waist_radius * (1 - t) + top_radius * t
        for s in range(segments):
            angle = (s / segments) * 2 * math.pi
            verts.append((rad * math.cos(angle), rad * math.sin(angle), z + 0.35))
            
    for r in range(rings):
        for s in range(segments):
            cur = r * segments + s
            nxt = r * segments + ((s + 1) % segments)
            above_cur = (r + 1) * segments + s
            above_nxt = (r + 1) * segments + ((s + 1) % segments)
            faces.append((cur, nxt, above_nxt, above_cur))
            
    mesh = bpy.data.meshes.new("CoolingTower_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    tower = bpy.data.objects.new("CoolingTower_Body", mesh)
    tower.parent = root
    bpy.context.collection.objects.link(tower)
    tower.data.materials.append(mats['concrete'])
    set_smooth(tower)
    
    num_ribs = 8
    for i in range(num_ribs):
        angle = (i / num_ribs) * 2 * math.pi
        rx = math.cos(angle) * 1.05
        ry = math.sin(angle) * 1.05
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(rx, ry, 1.45))
        rib = bpy.context.active_object
        rib.scale = (0.08, 0.16, 1.9)
        rib.rotation_euler = (0, 0, angle)
        rib.parent = root
        rib.data.materials.append(mats['concrete_rib'])
        
    bpy.ops.mesh.primitive_torus_add(major_radius=0.96, minor_radius=0.065, location=(0, 0, height + 0.35))
    thermal_rim = bpy.context.active_object
    thermal_rim.name = "Reactor_Thermal_Rim"
    thermal_rim.parent = root
    thermal_rim.data.materials.append(mats['thermal_red'])
    set_smooth(thermal_rim)
    
    return root

def spawn_mtia_microchip(mats, location=(0,0,0)):
    root = bpy.data.objects.new("Prop_MTIA_Root", None)
    root.location = location
    bpy.context.collection.objects.link(root)
    
    chip_size = 1.9
    chip_thickness = 0.14
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, chip_thickness/2 + 0.2))
    base = bpy.context.active_object
    base.scale = (chip_size, chip_size, chip_thickness)
    base.name = "MTIA_Substrate"
    base.parent = root
    base.data.materials.append(mats['silicon_die'])
    
    border_thick = 0.07
    for dx, dy, sx, sy in [
        (0, chip_size/2, chip_size, border_thick),
        (0, -chip_size/2, chip_size, border_thick),
        (chip_size/2, 0, border_thick, chip_size),
        (-chip_size/2, 0, border_thick, chip_size)
    ]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(dx, dy, chip_thickness + 0.21))
        border = bpy.context.active_object
        border.scale = (sx, sy, 0.05)
        border.parent = root
        border.data.materials.append(mats['gold_24k'])
        
    core_size = 0.52
    offset = 0.35
    for cx in [-offset, offset]:
        for cy in [-offset, offset]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx, cy, chip_thickness + 0.23))
            core = bpy.context.active_object
            core.scale = (core_size, core_size, 0.04)
            core.parent = root
            core.data.materials.append(mats['logic_core'])
            
    num_pins = 7
    pin_len = 0.24
    for side in [-1, 1]:
        for i in range(num_pins):
            pos_t = -chip_size * 0.38 + (i * (chip_size * 0.76 / (num_pins - 1)))
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * (chip_size/2 + pin_len/2), pos_t, 0.22))
            pin_x = bpy.context.active_object
            pin_x.scale = (pin_len, 0.065, 0.035)
            pin_x.parent = root
            pin_x.data.materials.append(mats['gold_24k'])
            
    # Gentle tilt for isometric dynamic view
    root.rotation_euler = (math.radians(22), math.radians(-14), math.radians(18))
    return root

def spawn_smart_glasses(mats, location=(0,0,0)):
    root = bpy.data.objects.new("Prop_Glasses_Root", None)
    root.location = location
    bpy.context.collection.objects.link(root)
    
    lens_r = 0.52
    eye_sep = 0.72
    for side in [-1, 1]:
        lx = side * eye_sep
        bpy.ops.mesh.primitive_torus_add(major_radius=lens_r, minor_radius=0.055, location=(lx, 0, 0), rotation=(math.radians(82), 0, 0))
        rim = bpy.context.active_object
        rim.scale = (1.0, 1.0, 1.15)
        rim.parent = root
        rim.data.materials.append(mats['glasses_frame'])
        set_smooth(rim)
        
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=lens_r * 0.94, location=(lx, 0.02, 0))
        lens = bpy.context.active_object
        lens.scale = (1.0, 0.16, 1.12)
        lens.parent = root
        lens.data.materials.append(mats['glasses_lens'])
        set_smooth(lens)
        
        cam_x = lx + (side * (lens_r + 0.10))
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.048, location=(cam_x, -0.06, 0.18))
        sensor = bpy.context.active_object
        sensor.parent = root
        sensor.data.materials.append(mats['led_green'])
        set_smooth(sensor)
        
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.07, location=(cam_x, 0.02, 0.18))
        hinge = bpy.context.active_object
        hinge.parent = root
        hinge.data.materials.append(mats['gold_24k'])
        set_smooth(hinge)
        
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cam_x, 0.9, 0.24), rotation=(math.radians(10), math.radians(-side * 8), 0))
        temple = bpy.context.active_object
        temple.scale = (0.055, 1.8, 0.11)
        temple.parent = root
        temple.data.materials.append(mats['glasses_frame'])
        
        # Holographic scanning laser beam shooting forward
        bpy.ops.mesh.primitive_cylinder_add(radius=0.024, depth=4.5, location=(lx, -2.25, -0.04), rotation=(math.radians(90), 0, 0))
        laser = bpy.context.active_object
        laser.name = f"Laser_Scan_{'L' if side == -1 else 'R'}"
        laser.parent = root
        laser.data.materials.append(mats['laser_beam'])
        
    # Bridge
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.16))
    bridge = bpy.context.active_object
    bridge.scale = (eye_sep * 0.45, 0.06, 0.05)
    bridge.parent = root
    bridge.data.materials.append(mats['glasses_frame'])
    
    # Hero 3/4 dynamic orientation
    root.rotation_euler = (math.radians(-16), math.radians(20), math.radians(-12))
    return root

# --- LIGHTING, COMPOSITOR & RENDER CONFIG ---

def setup_lighting():
    # Key Light (Warm Sunlight / High Key)
    bpy.ops.object.light_add(type='AREA', location=(-2.8, -3.8, 4.8))
    key = bpy.context.active_object
    key.name = "Key_Light"
    key.data.energy = 450.0
    key.data.size = 3.5
    key.data.color = (1.0, 0.96, 0.90)
    
    # Fill Light (Cool Cyan Studio Ambience)
    bpy.ops.object.light_add(type='AREA', location=(3.2, -2.5, 3.2))
    fill = bpy.context.active_object
    fill.name = "Fill_Light"
    fill.data.energy = 220.0
    fill.data.size = 4.0
    fill.data.color = (0.44, 0.68, 1.0)
    
    # Rim / Backlight (High Intensity Edge Specular)
    bpy.ops.object.light_add(type='POINT', location=(0.0, 3.8, 3.5))
    rim = bpy.context.active_object
    rim.name = "Rim_Light"
    rim.data.energy = 280.0
    rim.data.color = (0.75, 0.88, 1.0)

def setup_compositor_glare():
    scene = bpy.context.scene
    scene.use_nodes = True
    tree = scene.node_tree
    tree.nodes.clear()
    
    rl = tree.nodes.new(type="CompositorNodeRLayers")
    rl.location = (0, 0)
    
    glare = tree.nodes.new(type="CompositorNodeGlare")
    glare.glare_type = 'FOG_GLOW'
    glare.quality = 'HIGH'
    glare.threshold = 0.70
    glare.size = 8
    glare.location = (300, 0)
    
    comp = tree.nodes.new(type="CompositorNodeComposite")
    comp.location = (600, 0)
    
    tree.links.new(rl.outputs['Image'], glare.inputs['Image'])
    tree.links.new(glare.outputs['Image'], comp.inputs['Image'])

def setup_render_engine(output_mp4_path, total_frames=982):
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.fps = 30
    
    scene.frame_start = 1
    scene.frame_end = total_frames
    
    scene.render.image_settings.file_format = 'FFMPEG'
    scene.render.ffmpeg.format = 'MPEG4'
    scene.render.ffmpeg.codec = 'H264'
    scene.render.ffmpeg.constant_rate_factor = 'HIGH'
    scene.render.ffmpeg.gopsize = 15
    scene.render.filepath = output_mp4_path
    
    eevee = scene.eevee
    if hasattr(eevee, 'taa_render_samples'):
        eevee.taa_render_samples = 14  # Balanced speed & crispness
    if hasattr(eevee, 'use_raytracing'):
        eevee.use_raytracing = True
    if hasattr(eevee, 'use_gtao'):
        eevee.use_gtao = True
    if hasattr(eevee, 'use_fast_gi'):
        eevee.use_fast_gi = True
        
    world = scene.world
    if not world:
        world = bpy.data.worlds.new("Meta_World")
        scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs['Color'].default_value = (0.02, 0.035, 0.065, 1.0)
        bg.inputs['Strength'].default_value = 0.85

# --- MAIN ANIMATION & CUT DIRECTING ---

def main():
    print("=====================================================")
    print("🎬 DIRECTING META MASTER PLAN 3D EPISODE")
    print("=====================================================")
    
    episode_json_path = r"d:\New folder (2)\public\meta_episode.json"
    if not os.path.exists(episode_json_path):
        raise FileNotFoundError(f"Missing {episode_json_path}")
        
    with open(episode_json_path, "r", encoding="utf-8") as f:
        meta_data = json.load(f)
        
    cuts = meta_data.get("cuts", [])
    total_frames = meta_data.get("totalFrames", 982)
    print(f"Loaded {len(cuts)} cuts, Total timeline: {total_frames} frames (~{total_frames/30:.1f}s)")
    
    clear_scene()
    mats = build_materials()
    
    # 1. Environment & Grid
    bpy.ops.mesh.primitive_plane_add(size=40.0, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.name = "Obsidian_Floor"
    floor.data.materials.append(mats['floor'])
    build_cyan_grid(size=36.0, spacing=1.2)
    
    # Server Racks for architectural depth in background
    for r_idx, (sx, sy, rot) in enumerate([
        (-1.9, -2.4, 15), (-2.3, -0.6, 18), (-2.7, 1.4, 20), (-3.2, 3.4, 22), (-3.6, 5.4, 24),
        (1.9, -2.4, -15), (2.3, -0.6, -18), (2.7, 1.4, -20), (3.2, 3.4, -22), (3.6, 5.4, -24)
    ]):
        build_server_rack(mats, name=f"Env_Server_{r_idx}", location=(sx, sy, 0), rotation=(0, 0, math.radians(rot)))
        
    setup_lighting()
    setup_compositor_glare()
    
    # 2. Spawn 4 Hero Props
    prop_hyperion = spawn_hyperion_campus(mats, location=(0, 0, 0))
    prop_tower = spawn_cooling_tower_6_6gw(mats, location=(0, 0, 0))
    prop_chip = spawn_mtia_microchip(mats, location=(0, 0, 1.1))
    prop_glasses = spawn_smart_glasses(mats, location=(0, 0, 1.2))
    
    all_props = [prop_hyperion, prop_tower, prop_chip, prop_glasses]
    
    # 3. Create 5 Floating 3D Text Objects (Perfect Z Elevations)
    text_hud_1 = create_floating_3d_text("HUD_Hyperion", "HYPERION CAMPUS", location=(0, 0, 3.55), scale=0.22)
    text_hud_2 = create_floating_3d_text("HUD_CoolingTower", "6.6 GIGAWATTS", location=(0, 0, 3.75), scale=0.24)
    text_hud_3 = create_floating_3d_text("HUD_MTIA", "MTIA SILICON", location=(0, 0, 2.65), scale=0.24)
    text_hud_4 = create_floating_3d_text("HUD_Glasses", "CONTINUOUS VIDEO", location=(0, 0, 2.65), scale=0.18)
    text_hud_5 = create_floating_3d_text("HUD_Vault", "THE MASTER PLAN", location=(0, 0, 2.7), scale=0.22)
    
    all_huds = [text_hud_1, text_hud_2, text_hud_3, text_hud_4, text_hud_5]
    
    # Hide all props and HUDs initially at frame 1
    for p in all_props + all_huds:
        p.scale = (0, 0, 0)
        p.keyframe_insert(data_path="scale", frame=1)
        
    # 4. Camera & LookAt Rig
    target_empty = bpy.data.objects.new("Director_LookAt_Target", None)
    target_empty.location = (0, 0, 1.2)
    bpy.context.collection.objects.link(target_empty)
    
    bpy.ops.object.camera_add(location=(0, -7.0, 2.2))
    cam = bpy.context.active_object
    cam.name = "Director_Camera"
    cam.data.lens = 30.0  # 30mm cinematic wide
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = target_empty
    cam.data.dof.aperture_fstop = 2.4
    bpy.context.scene.camera = cam
    
    track = cam.constraints.new(type='TRACK_TO')
    track.target = target_empty
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'
    
    # 5. Direct Each Cut with Exact Frame Ranges and Drone Splines
    current_f = 1
    
    # Define Camera Paths & Active Props per cut
    cut_definitions = [
        {
            # Cut 1: Hyperion Campus
            "prop": prop_hyperion,
            "hud": text_hud_1,
            "prop_scale": (1.0, 1.0, 1.0),
            "hud_scale": (0.22, 0.22, 0.22),
            "cam_start": (0.0, -8.6, 3.8),
            "cam_end":   (0.0, -5.6, 2.6),
            "target_start": (0.0, 0.0, 1.9),
            "target_end":   (0.0, 0.0, 2.0),
        },
        {
            # Cut 2: Cooling Tower 6.6 GW
            "prop": prop_tower,
            "hud": text_hud_2,
            "prop_scale": (1.0, 1.0, 1.0),
            "hud_scale": (0.24, 0.24, 0.24),
            "cam_start": (-1.6, -7.0, 4.6),
            "cam_end":   (0.9, -4.8, 2.9),
            "target_start": (0.0, 0.0, 2.1),
            "target_end":   (0.0, 0.0, 2.3),
        },
        {
            # Cut 3: MTIA Silicon Chip
            "prop": prop_chip,
            "hud": text_hud_3,
            "prop_scale": (1.0, 1.0, 1.0),
            "hud_scale": (0.24, 0.24, 0.24),
            "cam_start": (2.1, -4.6, 2.8),
            "cam_end":   (-1.4, -4.0, 2.0),
            "target_start": (0.0, 0.0, 1.1),
            "target_end":   (0.0, 0.0, 1.25),
        },
        {
            # Cut 4: Ray-Ban Smart Glasses
            "prop": prop_glasses,
            "hud": text_hud_4,
            "prop_scale": (1.0, 1.0, 1.0),
            "hud_scale": (0.18, 0.18, 0.18),
            "cam_start": (-0.8, -4.4, 1.4),
            "cam_end":   (0.3, -3.6, 2.3),
            "target_start": (0.0, 0.0, 1.2),
            "target_end":   (0.0, 0.0, 1.35),
        },
        {
            # Cut 5: Infinite Datacenter Vault Corridor
            "prop": None,  # Environmental showcase
            "hud": text_hud_5,
            "prop_scale": (0, 0, 0),
            "hud_scale": (0.22, 0.22, 0.22),
            "cam_start": (0.0, -2.8, 1.7),
            "cam_end":   (0.0, -8.6, 3.4),
            "target_start": (0.0, 3.0, 1.6),
            "target_end":   (0.0, 1.0, 1.5),
        }
    ]
    
    for idx, c_def in enumerate(cut_definitions):
        c_meta = cuts[idx]
        dur = c_meta["durationFrames"]
        start_f = current_f
        end_f = current_f + dur - 1
        print(f"🎬 Keyframing Cut {idx+1} ({c_meta['hudText']}): Frames {start_f}..{end_f} ({dur} frames, {c_meta['durationSec']}s)")
        
        # 1. Prop & HUD scale keyframes (CONSTANT visibility)
        if c_def["prop"]:
            c_def["prop"].scale = (0, 0, 0)
            c_def["prop"].keyframe_insert(data_path="scale", frame=max(1, start_f - 1))
            c_def["prop"].scale = c_def["prop_scale"]
            c_def["prop"].keyframe_insert(data_path="scale", frame=start_f)
            c_def["prop"].keyframe_insert(data_path="scale", frame=end_f)
            c_def["prop"].scale = (0, 0, 0)
            c_def["prop"].keyframe_insert(data_path="scale", frame=end_f + 1)
            
        c_def["hud"].scale = (0, 0, 0)
        c_def["hud"].keyframe_insert(data_path="scale", frame=max(1, start_f - 1))
        c_def["hud"].scale = c_def["hud_scale"]
        c_def["hud"].keyframe_insert(data_path="scale", frame=start_f)
        c_def["hud"].keyframe_insert(data_path="scale", frame=end_f)
        c_def["hud"].scale = (0, 0, 0)
        c_def["hud"].keyframe_insert(data_path="scale", frame=end_f + 1)
        
        # 2. Camera Motion (Smooth Linear Spline during cut, hard jump at start_f)
        cam.location = c_def["cam_start"]
        cam.keyframe_insert(data_path="location", frame=start_f)
        cam.location = c_def["cam_end"]
        cam.keyframe_insert(data_path="location", frame=end_f)
        
        target_empty.location = c_def["target_start"]
        target_empty.keyframe_insert(data_path="location", frame=start_f)
        target_empty.location = c_def["target_end"]
        target_empty.keyframe_insert(data_path="location", frame=end_f)
        
        # Micro-rotation animation on props during active cut for cinematic dynamic feel
        if c_def["prop"]:
            base_rot = c_def["prop"].rotation_euler.copy()
            c_def["prop"].rotation_euler = (base_rot[0], base_rot[1], base_rot[2] - math.radians(6.0))
            c_def["prop"].keyframe_insert(data_path="rotation_euler", frame=start_f)
            c_def["prop"].rotation_euler = (base_rot[0], base_rot[1], base_rot[2] + math.radians(6.0))
            c_def["prop"].keyframe_insert(data_path="rotation_euler", frame=end_f)
            
        current_f = end_f + 1
        
    # Set Constant interpolation on cuts transition in camera action
    if cam.animation_data and cam.animation_data.action:
        for fcurve in cam.animation_data.action.fcurves:
            for kf in fcurve.keyframe_points:
                # Keep linear motion within cuts
                kf.interpolation = 'LINEAR'
                
    preview_mode = "--preview" in sys.argv
    output_mp4 = r"d:\New folder (2)\blender_engine\renders\meta_reference_raw.mp4"
    os.makedirs(os.path.dirname(output_mp4), exist_ok=True)
    setup_render_engine(output_mp4, total_frames=total_frames)
    
    if preview_mode:
        print("🔍 RUNNING IN PREVIEW MODE: Rendering midpoint frame of each cut...")
        midpoints = [
            (1, 122, "Cut 1: Hyperion Campus"),
            (2, 346, "Cut 2: 6.6 GW Nuclear Cooling Tower"),
            (3, 562, "Cut 3: MTIA Silicon Microchip"),
            (4, 783, "Cut 4: Ray-Ban Smart Glasses"),
            (5, 937, "Cut 5: Datacenter Core Vault")
        ]
        scene = bpy.context.scene
        scene.render.image_settings.file_format = 'PNG'
        for cut_num, mid_f, label in midpoints:
            scene.frame_set(mid_f)
            preview_png = rf"d:\New folder (2)\blender_engine\renders\meta_cut_{cut_num}_preview.png"
            scene.render.filepath = preview_png
            print(f"📸 Rendering {label} at Frame {mid_f} -> {preview_png}")
            bpy.ops.render.render(write_still=True)
            print(f"✅ Saved Preview {cut_num}: {preview_png}")
        print("🎉 ALL 5 CUT PREVIEWS RENDERED!")
        return

    print(f"🚀 Launching Full 3D Render to: {output_mp4}")
    bpy.ops.render.render(animation=True)
    print("🎉 FULL 3D ANIMATION RENDER COMPLETE!")

if __name__ == "__main__":
    main()
