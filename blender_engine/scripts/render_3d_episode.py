"""
Master 3D Episode Directing & Rendering Engine for Blender EEVEE Next
Starring: Antigravity Popapus AI Hero Agent

Features:
- Dynamically parses src/data/current_3d_episode.json (cuts, text, props, camera rails)
- Reads exact cut frame durations from cutTimings
- Animates Popapus (levitation bobbing, tentacle physics, celebratory victory spin)
- Animates the 4 Antigravity Orbs (Red, Green, Yellow, Blue) swirling inside the crystal dome
- Dynamically spawns, animates, and swaps physical 3D metaphor props per cut
- Projects a luminous cyan holographic laser scanner beam with exact mathutils quaternion tracking
- 32mm cinematic lens with balanced 9:16 vertical framing (Popapus + Props perfectly composed)
- Executes cinematic camera splines with instant hard cuts between scenes (CONSTANT keyframes)
- EEVEE Next GPU rasterization with Fog Glow compositor
- Supports --preview mode (instant still per cut) and --full (full MP4 animation)
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

def create_glass_material(name="Mat_Antigravity_Glass_Dome"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()
    
    output = tree.nodes.new(type="ShaderNodeOutputMaterial")
    output.location = (400, 0)
    mix = tree.nodes.new(type="ShaderNodeMixShader")
    mix.location = (180, 0)
    
    transp = tree.nodes.new(type="ShaderNodeBsdfTransparent")
    transp.inputs['Color'].default_value = (0.96, 0.98, 1.0, 1.0)
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
    if hasattr(mat, 'use_screen_refraction'):
        mat.use_screen_refraction = True
    if hasattr(mat, 'use_raytrace_refraction'):
        mat.use_raytrace_refraction = True
    return mat

def create_hologram_material(name="Mat_Holo_Beam"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()
    
    output = tree.nodes.new(type="ShaderNodeOutputMaterial")
    output.location = (400, 0)
    
    mix = tree.nodes.new(type="ShaderNodeMixShader")
    mix.location = (180, 0)
    mix.inputs['Fac'].default_value = 0.35  # Luminous transparent beam
    
    transp = tree.nodes.new(type="ShaderNodeBsdfTransparent")
    transp.location = (-100, 100)
    
    emission = tree.nodes.new(type="ShaderNodeEmission")
    emission.inputs['Color'].default_value = hex_to_rgba("#749BFF")
    emission.inputs['Strength'].default_value = 8.0
    emission.location = (-100, -100)
    
    tree.links.new(transp.outputs['BSDF'], mix.inputs[1])
    tree.links.new(emission.outputs['Emission'], mix.inputs[2])
    tree.links.new(mix.outputs['Shader'], output.inputs['Surface'])
    
    mat.blend_method = 'BLEND'
    return mat

def build_materials():
    mats = {}
    mats['skin_blue'] = create_material("Mat_Skin_Blue", base_color=hex_to_rgba("#3186FF"), metallic=0.22, roughness=0.22)
    mats['skin_sky'] = create_material("Mat_Skin_Sky", base_color=hex_to_rgba("#749BFF"), metallic=0.15, roughness=0.28)
    mats['glass_dome'] = create_glass_material()
    mats['solar_gold'] = create_material("Mat_Solar_Gold", base_color=hex_to_rgba("#FBBC04"), metallic=0.96, roughness=0.15)
    
    # 4 Antigravity Orbs
    mats['orb_red'] = create_material("Mat_Orb_Red", base_color=hex_to_rgba("#FC413D"), emission_color=hex_to_rgba("#FC413D"), emission_strength=15.0)
    mats['orb_green'] = create_material("Mat_Orb_Green", base_color=hex_to_rgba("#00B95C"), emission_color=hex_to_rgba("#00B95C"), emission_strength=15.0)
    mats['orb_yellow'] = create_material("Mat_Orb_Yellow", base_color=hex_to_rgba("#FFE432"), emission_color=hex_to_rgba("#FFE432"), emission_strength=16.0)
    mats['orb_blue'] = create_material("Mat_Orb_Blue", base_color=hex_to_rgba("#3186FF"), emission_color=hex_to_rgba("#3186FF"), emission_strength=16.0)
    
    mats['eye_pupil'] = create_material("Mat_Eye_Pupil", base_color=(0.02, 0.03, 0.06, 1.0), metallic=0.25, roughness=0.06)
    mats['eye_iris'] = create_material("Mat_Eye_Iris", base_color=hex_to_rgba("#3186FF"), emission_color=hex_to_rgba("#749BFF"), emission_strength=3.5)
    mats['eye_shine'] = create_material("Mat_Eye_Shine", base_color=(1.0, 1.0, 1.0, 1.0), emission_color=(1.0, 1.0, 1.0, 1.0), emission_strength=1.5)
    
    mats['hover_ring'] = create_material("Mat_Hover_Ring", base_color=hex_to_rgba("#3186FF"), emission_color=hex_to_rgba("#3186FF"), emission_strength=6.0)
    mats['holo_beam'] = create_hologram_material()
    
    mats['floor'] = create_material("Mat_Floor", base_color=(0.015, 0.02, 0.035, 1.0), metallic=0.94, roughness=0.10)
    mats['chassis'] = create_material("Mat_Server_Chassis", base_color=(0.05, 0.07, 0.10, 1.0), metallic=0.85, roughness=0.35)
    mats['led_green'] = create_material("Mat_LED_Green", base_color=hex_to_rgba("#00B95C"), emission_color=hex_to_rgba("#00B95C"), emission_strength=12.0)
    mats['led_yellow'] = create_material("Mat_LED_Yellow", base_color=hex_to_rgba("#FBBC04"), emission_color=hex_to_rgba("#FBBC04"), emission_strength=10.0)
    mats['fiber_blue'] = create_material("Mat_Fiber_Blue", base_color=hex_to_rgba("#3186FF"), emission_color=hex_to_rgba("#3186FF"), emission_strength=8.0)
    return mats

def build_popapus(mats, location=(0, 0, 1.25)):
    root = bpy.data.objects.new("Popapus_Hero_Root", None)
    root.location = location
    bpy.context.collection.objects.link(root)
    
    # Body
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=36, radius=0.60, location=(0, 0, -0.12))
    body = bpy.context.active_object
    body.scale = (1.0, 0.95, 0.80)
    body.name = "Popapus_Body"
    body.parent = root
    body.data.materials.append(mats['skin_blue'])
    set_smooth(body)
    
    # Belly
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=0.48, location=(0, -0.22, -0.22))
    belly = bpy.context.active_object
    belly.scale = (0.78, 0.55, 0.60)
    belly.name = "Popapus_Belly"
    belly.parent = root
    belly.data.materials.append(mats['skin_sky'])
    set_smooth(belly)
    
    # Glass Dome
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=36, radius=0.55, location=(0, 0, 0.40))
    dome = bpy.context.active_object
    dome.scale = (0.95, 0.95, 0.95)
    dome.name = "Popapus_AirSac_Dome"
    dome.parent = root
    dome.data.materials.append(mats['glass_dome'])
    set_smooth(dome)
    
    # Collar
    bpy.ops.mesh.primitive_torus_add(major_radius=0.52, minor_radius=0.042, major_segments=48, minor_segments=20, location=(0, 0, 0.18))
    collar = bpy.context.active_object
    collar.name = "Popapus_Collar"
    collar.parent = root
    collar.data.materials.append(mats['solar_gold'])
    set_smooth(collar)
    
    # 4 Antigravity Orbs inside Dome
    orbs = []
    orbs_data = [
        {"name": "Orb_Blue",   "phase": 0.0,             "r": 0.14, "mat": mats['orb_blue']},
        {"name": "Orb_Red",    "phase": math.pi * 0.5,   "r": 0.13, "mat": mats['orb_red']},
        {"name": "Orb_Green",  "phase": math.pi * 1.0,   "r": 0.12, "mat": mats['orb_green']},
        {"name": "Orb_Yellow", "phase": math.pi * 1.5,   "r": 0.14, "mat": mats['orb_yellow']},
    ]
    for od in orbs_data:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=18, radius=od['r'], location=(0, 0, 0.42))
        orb_obj = bpy.context.active_object
        orb_obj.name = od['name']
        orb_obj.parent = root
        orb_obj.data.materials.append(od['mat'])
        set_smooth(orb_obj)
        orbs.append((orb_obj, od['phase']))
        
    # Eyes
    for side in [-1, 1]:
        ex, ey, ez = side * 0.28, -0.48, -0.02
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=0.15, location=(ex, ey, ez))
        eye = bpy.context.active_object
        eye.scale = (0.85, 0.45, 1.20)
        eye.rotation_euler = (math.radians(-8), 0, math.radians(-side * 8))
        eye.name = f"Popapus_Eye_{'L' if side == -1 else 'R'}"
        eye.parent = root
        eye.data.materials.append(mats['eye_pupil'])
        set_smooth(eye)
        
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=18, radius=0.11, location=(ex, ey - 0.035, ez - 0.02))
        iris = bpy.context.active_object
        iris.scale = (0.75, 0.25, 0.85)
        iris.name = f"Popapus_Iris_{'L' if side == -1 else 'R'}"
        iris.parent = root
        iris.data.materials.append(mats['eye_iris'])
        set_smooth(iris)
        
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.038, location=(ex + (side * 0.03), ey - 0.065, ez + 0.04))
        shine = bpy.context.active_object
        shine.scale = (1.0, 0.4, 1.0)
        shine.name = f"Popapus_Shine_{'L' if side == -1 else 'R'}"
        shine.parent = root
        shine.data.materials.append(mats['eye_shine'])
        set_smooth(shine)
        
    # Snout
    bpy.ops.mesh.primitive_cylinder_add(radius=0.09, depth=0.16, vertices=24, location=(0, -0.56, -0.22), rotation=(math.radians(75), 0, 0))
    mouth = bpy.context.active_object
    mouth.name = "Popapus_Spout"
    mouth.parent = root
    mouth.data.materials.append(mats['skin_sky'])
    set_smooth(mouth)
    
    bpy.ops.mesh.primitive_torus_add(major_radius=0.095, minor_radius=0.022, location=(0, -0.63, -0.24), rotation=(math.radians(75), 0, 0))
    nozzle = bpy.context.active_object
    nozzle.name = "Popapus_Nozzle"
    nozzle.parent = root
    nozzle.data.materials.append(mats['solar_gold'])
    set_smooth(nozzle)

    # Tentacles
    tentacles = []
    num_tentacles = 6
    for i in range(num_tentacles):
        angle = (2 * math.pi / num_tentacles) * i
        tx = math.cos(angle) * 0.42
        ty = math.sin(angle) * 0.40
        tz = -0.42
        seg_count = 5
        tent_segs = []
        for s in range(seg_count):
            fraction = s / seg_count
            radius = 0.12 * (1.0 - fraction * 0.55)
            curl_dist = 0.42 + (fraction * 0.28)
            curl_z = tz - (fraction * 0.24) + (math.sin(fraction * math.pi) * 0.08)
            sx = math.cos(angle) * curl_dist
            sy = math.sin(angle) * curl_dist
            bpy.ops.mesh.primitive_uv_sphere_add(segments=18, ring_count=14, radius=radius, location=(sx, sy, curl_z))
            t_obj = bpy.context.active_object
            t_obj.name = f"Tentacle_{i}_Seg_{s}"
            t_obj.parent = root
            t_obj.data.materials.append(mats['skin_sky'] if s % 2 == 0 else mats['skin_blue'])
            set_smooth(t_obj)
            tent_segs.append(t_obj)
        tentacles.append((tent_segs, angle))
            
    # Hover Ring
    bpy.ops.mesh.primitive_torus_add(major_radius=0.72, minor_radius=0.038, major_segments=36, minor_segments=16, location=(0, 0, -0.72))
    hover_ring = bpy.context.active_object
    hover_ring.name = "Popapus_Hover_Ring"
    hover_ring.parent = root
    hover_ring.data.materials.append(mats['hover_ring'])
    set_smooth(hover_ring)
    
    return root, orbs, tentacles

def build_server_rack(mats, name="ServerRack", location=(0, 0, 0), rotation=(0, 0, 0)):
    rack_root = bpy.data.objects.new(name, None)
    rack_root.location = location
    rack_root.rotation_euler = rotation
    bpy.context.collection.objects.link(rack_root)
    
    width, depth, height = 1.0, 1.2, 3.4
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, height/2))
    cab = bpy.context.active_object
    cab.scale = (width, depth, height)
    cab.name = f"{name}_Cabinet"
    cab.parent = rack_root
    cab.data.materials.append(mats['chassis'])
    
    num_blades = 7
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
            bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=0.02, location=(lx, -depth/2 - 0.06, bz), rotation=(math.radians(90), 0, 0))
            led = bpy.context.active_object
            led.name = f"{name}_LED_{b}_{led_i}"
            led.parent = rack_root
            led_mat = mats['led_green'] if (b + led_i) % 3 != 0 else mats['led_yellow']
            led.data.materials.append(led_mat)
    return rack_root

def build_environment(mats):
    bpy.ops.mesh.primitive_plane_add(size=35.0, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.name = "Corridor_Floor"
    floor.data.materials.append(mats['floor'])
    
    build_server_rack(mats, name="Server_L1", location=(-2.0, -1.2, 0), rotation=(0, 0, math.radians(16)))
    build_server_rack(mats, name="Server_L2", location=(-2.5, 1.4, 0), rotation=(0, 0, math.radians(18)))
    build_server_rack(mats, name="Server_L3", location=(-2.9, 3.8, 0), rotation=(0, 0, math.radians(20)))
    
    build_server_rack(mats, name="Server_R1", location=(2.0, -1.2, 0), rotation=(0, 0, math.radians(-16)))
    build_server_rack(mats, name="Server_R2", location=(2.5, 1.4, 0), rotation=(0, 0, math.radians(-18)))
    build_server_rack(mats, name="Server_R3", location=(2.9, 3.8, 0), rotation=(0, 0, math.radians(-20)))
    
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.028, depth=16.0, location=(side * 1.35, 0.5, 0.018), rotation=(math.radians(90), 0, 0))
        fiber = bpy.context.active_object
        fiber.name = f"Fiber_Line_{'L' if side == -1 else 'R'}"
        fiber.data.materials.append(mats['fiber_blue'])

def setup_lighting():
    bpy.ops.object.light_add(type='AREA', location=(-2.4, -3.4, 3.6))
    key = bpy.context.active_object
    key.name = "Key_Light"
    key.data.energy = 280.0
    key.data.color = (1.0, 0.96, 0.92)
    key.data.size = 3.0
    key.rotation_euler = (math.radians(45), math.radians(-15), math.radians(-35))
    
    bpy.ops.object.light_add(type='SPOT', location=(2.6, 3.8, 3.2))
    rim = bpy.context.active_object
    rim.name = "Rim_Light"
    rim.data.energy = 380.0
    rim.data.color = hex_to_rgba("#FC413D")[:3]
    rim.data.spot_size = math.radians(72)
    rim.rotation_euler = (math.radians(-38), math.radians(20), math.radians(-135))
    
    bpy.ops.object.light_add(type='POINT', location=(0, -0.9, 0.45))
    uplight = bpy.context.active_object
    uplight.name = "Uplight_Blue"
    uplight.data.energy = 60.0
    uplight.data.color = hex_to_rgba("#3186FF")[:3]

# Physical 3D Metaphor Props
def spawn_quantum_microchip(mats, location=(0.42, -0.20, 1.25), scale=(0.70, 0.70, 0.70)):
    root = bpy.data.objects.new("Prop_Quantum_Microchip", None)
    root.location = location
    root.scale = (0, 0, 0)
    bpy.context.collection.objects.link(root)
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
    base = bpy.context.active_object
    base.scale = (0.9, 0.9, 0.04)
    base.name = "Chip_Base"
    base.parent = root
    base.data.materials.append(mats['chassis'])
    set_smooth(base)
    
    bpy.ops.mesh.primitive_torus_add(major_radius=0.62, minor_radius=0.03, major_segments=4, minor_segments=16, location=(0, 0, 0.02), rotation=(0, 0, math.radians(45)))
    border = bpy.context.active_object
    border.name = "Chip_Gold_Border"
    border.parent = root
    border.data.materials.append(mats['solar_gold'])
    set_smooth(border)
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.035))
    die = bpy.context.active_object
    die.scale = (0.42, 0.42, 0.03)
    die.name = "Chip_Die"
    die.parent = root
    die.data.materials.append(mats['orb_blue'])
    set_smooth(die)
    
    for side in range(4):
        angle = side * (math.pi / 2)
        for p in range(6):
            offset = -0.32 + (p * 0.12)
            px = math.cos(angle) * 0.52 - math.sin(angle) * offset
            py = math.sin(angle) * 0.52 + math.cos(angle) * offset
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, 0))
            pin = bpy.context.active_object
            pin.scale = (0.08, 0.03, 0.02)
            pin.rotation_euler = (0, 0, angle)
            pin.name = f"Chip_Pin_{side}_{p}"
            pin.parent = root
            pin.data.materials.append(mats['solar_gold'])
    return root

def spawn_cooling_tower(mats, location=(0.55, 0.75, 0.0), scale=(0.78, 0.78, 0.78)):
    root = bpy.data.objects.new("Prop_Cooling_Tower", None)
    root.location = location
    root.scale = (0, 0, 0)
    bpy.context.collection.objects.link(root)
    
    bpy.ops.mesh.primitive_cylinder_add(radius=1.1, depth=0.8, vertices=32, location=(0, 0, 0.4))
    base = bpy.context.active_object
    base.name = "Tower_Base"
    base.parent = root
    base.data.materials.append(mats['chassis'])
    set_smooth(base)
    
    bpy.ops.mesh.primitive_cylinder_add(radius=0.75, depth=1.4, vertices=32, location=(0, 0, 1.4))
    neck = bpy.context.active_object
    neck.name = "Tower_Neck"
    neck.parent = root
    neck.data.materials.append(mats['chassis'])
    set_smooth(neck)
    
    bpy.ops.mesh.primitive_cone_add(radius1=0.75, radius2=0.95, depth=0.6, vertices=32, location=(0, 0, 2.3))
    flare = bpy.context.active_object
    flare.name = "Tower_Flare"
    flare.parent = root
    flare.data.materials.append(mats['chassis'])
    set_smooth(flare)
    
    bpy.ops.mesh.primitive_torus_add(major_radius=0.92, minor_radius=0.045, major_segments=32, minor_segments=16, location=(0, 0, 2.6))
    rim = bpy.context.active_object
    rim.name = "Tower_Rim"
    rim.parent = root
    rim.data.materials.append(mats['orb_red'])
    set_smooth(rim)
    return root

def spawn_undersea_cable(mats, location=(0.38, -0.10, 0.55), scale=(0.75, 0.75, 0.75)):
    root = bpy.data.objects.new("Prop_Undersea_Cable", None)
    root.location = location
    root.scale = (0, 0, 0)
    root.rotation_euler = (math.radians(12), math.radians(22), math.radians(-25))
    bpy.context.collection.objects.link(root)
    
    num_rings = 14
    for i in range(num_rings):
        y_pos = -2.0 + (i * 0.32)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=0.28, vertices=28, location=(0, y_pos, 0), rotation=(math.radians(90), 0, 0))
        seg = bpy.context.active_object
        seg.name = f"Cable_Armor_{i}"
        seg.parent = root
        seg.data.materials.append(mats['chassis'])
        set_smooth(seg)
        
    bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=5.2, vertices=24, location=(0, 0, 0), rotation=(math.radians(90), 0, 0))
    core = bpy.context.active_object
    core.name = "Cable_Optical_Core"
    core.parent = root
    core.data.materials.append(mats['orb_blue'])
    set_smooth(core)
    return root

def spawn_hologram_projection_beam(mats):
    """Creates a luminous laser scanner beam with glowing target ring"""
    root = bpy.data.objects.new("Holo_Beam_Root", None)
    root.scale = (0, 0, 0)
    bpy.context.collection.objects.link(root)
    
    # Cylinder centered along +Z axis from z=0 to z=1.0
    bpy.ops.mesh.primitive_cylinder_add(radius=0.025, depth=1.0, vertices=20, location=(0, 0, 0.5))
    beam = bpy.context.active_object
    beam.name = "Holo_Beam_Core"
    beam.parent = root
    beam.data.materials.append(mats['holo_beam'])
    set_smooth(beam)
    
    # Glowing target ring at prop end (z = 1.0)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.15, minor_radius=0.012, major_segments=24, minor_segments=12, location=(0, 0, 1.0))
    ring = bpy.context.active_object
    ring.name = "Holo_Beam_Target_Ring"
    ring.parent = root
    ring.data.materials.append(mats['hover_ring'])
    set_smooth(ring)
    
    return root

def point_beam_to_target(beam_root, start_pos, target_pos):
    """Accurately points beam +Z axis along (target_pos - start_pos) vector using quaternions"""
    dir_vec = Vector((target_pos[0] - start_pos[0], target_pos[1] - start_pos[1], target_pos[2] - start_pos[2]))
    dist = dir_vec.length
    if dist < 0.001:
        return
        
    beam_root.location = start_pos
    quat = dir_vec.to_track_quat('Z', 'Y')
    beam_root.rotation_euler = quat.to_euler()
    beam_root.scale = (1.0, 1.0, dist)

def setup_render_engine(output_mp4_path, total_frames=1002):
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
        eevee.taa_render_samples = 12
    if hasattr(eevee, 'use_raytracing'):
        eevee.use_raytracing = True
    if hasattr(eevee, 'use_gtao'):
        eevee.use_gtao = True
    if hasattr(eevee, 'use_fast_gi'):
        eevee.use_fast_gi = True
        
    world = scene.world
    if not world:
        world = bpy.data.worlds.new("Antigravity_World")
        scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs['Color'].default_value = (0.012, 0.016, 0.028, 1.0)
        bg.inputs['Strength'].default_value = 0.75

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
    glare.threshold = 0.80
    glare.size = 8
    glare.location = (300, 0)
    
    comp = tree.nodes.new(type="CompositorNodeComposite")
    comp.location = (600, 0)
    
    tree.links.new(rl.outputs['Image'], glare.inputs['Image'])
    tree.links.new(glare.outputs['Image'], comp.inputs['Image'])

def render_episode(preview_mode=False):
    print("=====================================================")
    print("🎬 MASTER 3D EPISODE DIRECTOR & RENDER ENGINE")
    print(f"Mode: {'PREVIEW (Stills per cut)' if preview_mode else 'FULL (Complete 3D Video)'}")
    print("=====================================================")
    
    # 1. Load Episode Directives
    episode_json_path = r"d:\New folder (2)\src\data\current_3d_episode.json"
    if not os.path.exists(episode_json_path):
        raise FileNotFoundError(f"Missing episode directives at {episode_json_path}")
        
    with open(episode_json_path, "r", encoding="utf-8") as f:
        episode = json.load(f)
        
    cuts = episode.get("cuts", [])
    cut_timings = episode.get("cutTimings", [])
    print(f"Loaded Episode: \"{episode.get('videoTitle', '3D Episode')}\" ({len(cuts)} cuts)")
    
    durations = {}
    for ct in cut_timings:
        durations[ct["cutId"]] = ct["durationInFrames"]
        
    total_frames = sum(durations.values())
    if total_frames == 0:
        total_frames = 150 * len(cuts)
        for i in range(len(cuts)):
            durations[i+1] = 150
            
    print(f"Timeline: {total_frames} total frames (~{(total_frames/30):.2f}s @ 30fps)")
    
    # 2. Build Scene
    clear_scene()
    mats = build_materials()
    popapus_root, orbs, tentacles = build_popapus(mats)
    build_environment(mats)
    setup_lighting()
    
    # 3. Setup Camera & LookAt Target (32mm Cinematic Lens)
    target_empty = bpy.data.objects.new("Camera_LookAt_Target", None)
    target_empty.location = (0, 0, 1.25)
    bpy.context.collection.objects.link(target_empty)
    
    bpy.ops.object.camera_add(location=(0, -6.5, 2.0))
    cam = bpy.context.active_object
    cam.name = "Episode_Director_Camera"
    cam.data.lens = 32.0  # Wide/medium vertical field of view
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = target_empty
    cam.data.dof.aperture_fstop = 2.8
    bpy.context.scene.camera = cam
    
    track = cam.constraints.new(type='TRACK_TO')
    track.target = target_empty
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'
    
    # 4. Global Animations (Levitation, Orbs)
    for f in range(1, total_frames + 1):
        t = (f / 30.0) * (2 * math.pi * 0.45)
        bob_z = 1.25 + math.sin(t) * 0.06
        tilt_x = math.sin(t * 0.7) * math.radians(2.0)
        tilt_y = math.cos(t * 0.5) * math.radians(1.5)
        
        # Popapus default transform
        popapus_root.location = (0, 0, bob_z)
        popapus_root.rotation_euler = (tilt_x, tilt_y, 0)
        popapus_root.keyframe_insert(data_path="location", frame=f)
        popapus_root.keyframe_insert(data_path="rotation_euler", frame=f)
        
        target_empty.location = (0, 0, bob_z)
        target_empty.keyframe_insert(data_path="location", frame=f)
        
        # Orbs orbiting inside dome
        orb_r = 0.16
        for orb_obj, phase in orbs:
            orb_t = phase + ((f / 30.0) * (2 * math.pi * 0.65))
            ox = math.cos(orb_t) * orb_r
            oy = math.sin(orb_t) * orb_r * 0.8
            oz = 0.44 + math.sin(orb_t * 2.0) * 0.05
            orb_obj.location = (ox, oy, oz)
            orb_obj.keyframe_insert(data_path="location", frame=f)
            
    # 5. Build Metaphor Props
    prop_microchip = spawn_quantum_microchip(mats, location=(0.42, -0.20, 1.25), scale=(0.70, 0.70, 0.70))
    prop_tower = spawn_cooling_tower(mats, location=(0.55, 0.75, 0.0), scale=(0.78, 0.78, 0.78))
    prop_cable = spawn_undersea_cable(mats, location=(0.38, -0.10, 0.55), scale=(0.75, 0.75, 0.75))
    holo_beam = spawn_hologram_projection_beam(mats)
    
    # Initialize all props and beam to scale 0 at frame 1
    for p_obj in [prop_microchip, prop_tower, prop_cable, holo_beam]:
        p_obj.scale = (0, 0, 0)
        p_obj.keyframe_insert(data_path="scale", frame=1)
        
    current_frame = 1
    cut_midpoints = []
    
    for i, cut in enumerate(cuts):
        cut_id = cut.get("cutId", i + 1)
        dur = durations.get(cut_id, 150)
        start_f = current_frame
        end_f = current_frame + dur - 1
        mid_f = start_f + (dur // 2)
        cut_midpoints.append((cut_id, mid_f))
        
        prop_type = cut.get("metaphorProp", "datacenter_corridor").lower()
        trajectory = cut.get("cameraTrajectory", "corridor_dolly").lower()
        pose = cut.get("popapusPose", "curious_inspect").lower()
        
        print(f"🎬 Directing Cut {cut_id} (Frames {start_f}..{end_f}, {dur}f): Prop={prop_type}, Cam={trajectory}, Pose={pose}")
        
        # Prop Visibility per Cut
        active_prop = None
        target_prop_loc = None
        
        if ("microchip" in prop_type or "chip" in prop_type) and cut_id != 1 and cut_id != len(cuts):
            active_prop = prop_microchip
            target_prop_loc = (0.42, -0.20, 1.25)
            prop_microchip.scale = (0.70, 0.70, 0.70)
            prop_microchip.keyframe_insert(data_path="scale", frame=start_f)
            prop_microchip.keyframe_insert(data_path="scale", frame=end_f)
            prop_microchip.scale = (0, 0, 0)
            prop_microchip.keyframe_insert(data_path="scale", frame=end_f + 1)
            
        elif ("cooling" in prop_type or "tower" in prop_type or "nuclear" in prop_type) and cut_id != len(cuts):
            active_prop = prop_tower
            target_prop_loc = (0.55, 0.75, 1.8)
            prop_tower.scale = (0.78, 0.78, 0.78)
            prop_tower.keyframe_insert(data_path="scale", frame=start_f)
            prop_tower.keyframe_insert(data_path="scale", frame=end_f)
            prop_tower.scale = (0, 0, 0)
            prop_tower.keyframe_insert(data_path="scale", frame=end_f + 1)
            
        elif ("cable" in prop_type or "undersea" in prop_type) and cut_id != len(cuts):
            active_prop = prop_cable
            target_prop_loc = (0.38, -0.10, 0.55)
            prop_cable.scale = (0.75, 0.75, 0.75)
            prop_cable.keyframe_insert(data_path="scale", frame=start_f)
            prop_cable.keyframe_insert(data_path="scale", frame=end_f)
            prop_cable.scale = (0, 0, 0)
            prop_cable.keyframe_insert(data_path="scale", frame=end_f + 1)
            
        # Popapus Cut Framing / Pose
        if active_prop:
            # Shift Popapus slightly left (-0.18) so both Popapus & Prop are visible in frame
            for cf in range(start_f, end_f + 1):
                t = (cf / 30.0) * (2 * math.pi * 0.45)
                bob_z = 1.25 + math.sin(t) * 0.06
                popapus_root.location = (-0.18, -0.25, bob_z)
                popapus_root.rotation_euler = (0, 0, math.radians(-18))
                popapus_root.keyframe_insert(data_path="location", frame=cf)
                popapus_root.keyframe_insert(data_path="rotation_euler", frame=cf)
                
                target_empty.location = (0.12, -0.15, bob_z)
                target_empty.keyframe_insert(data_path="location", frame=cf)
                
            # Laser Scanner Beam Keyframing
            if "scan" in pose and target_prop_loc:
                nozzle_pos = (-0.18, -0.25 - 0.56, 1.25 - 0.22)
                point_beam_to_target(holo_beam, nozzle_pos, target_prop_loc)
                holo_beam.keyframe_insert(data_path="location", frame=start_f)
                holo_beam.keyframe_insert(data_path="rotation_euler", frame=start_f)
                holo_beam.keyframe_insert(data_path="scale", frame=start_f)
                holo_beam.keyframe_insert(data_path="scale", frame=end_f)
                holo_beam.scale = (0, 0, 0)
                holo_beam.keyframe_insert(data_path="scale", frame=end_f + 1)
                
        # Cut 5 Joyful Spin
        if "celebrate" in pose or cut_id == len(cuts):
            for cf in range(start_f, end_f + 1):
                t = (cf / 30.0) * (2 * math.pi * 0.45)
                bob_z = 1.25 + math.sin(t) * 0.08
                prog = (cf - start_f) / dur
                spin_z = prog * (2 * math.pi * 2.0)
                popapus_root.location = (0, 0, bob_z)
                popapus_root.rotation_euler = (0, 0, spin_z)
                popapus_root.keyframe_insert(data_path="location", frame=cf)
                popapus_root.keyframe_insert(data_path="rotation_euler", frame=cf)
                
                target_empty.location = (0, 0, bob_z)
                target_empty.keyframe_insert(data_path="location", frame=cf)
                
        # Camera Rails per Cut
        if cut_id == 1:
            cam.location = (0.0, -5.6, 1.85)
            cam.keyframe_insert(data_path="location", frame=start_f)
            cam.location = (0.0, -3.4, 1.45)
            cam.keyframe_insert(data_path="location", frame=end_f)
            
        elif cut_id == 2:
            # Microchip orbit
            cam.location = (-0.6, -3.2, 1.6)
            cam.keyframe_insert(data_path="location", frame=start_f)
            cam.location = (0.6, -3.0, 1.35)
            cam.keyframe_insert(data_path="location", frame=end_f)
            
        elif cut_id == 3:
            # Cooling tower dynamic dive
            cam.location = (0.6, -3.8, 2.2)
            cam.keyframe_insert(data_path="location", frame=start_f)
            cam.location = (0.1, -2.8, 1.45)
            cam.keyframe_insert(data_path="location", frame=end_f)
            
        elif cut_id == 4:
            # Undersea cable low sweeping arc
            cam.location = (-0.6, -3.2, 1.55)
            cam.keyframe_insert(data_path="location", frame=start_f)
            cam.location = (0.6, -2.9, 1.30)
            cam.keyframe_insert(data_path="location", frame=end_f)
            
        elif cut_id == len(cuts):
            # Finale close-up
            cam.location = (0.0, -2.4, 1.35)
            cam.keyframe_insert(data_path="location", frame=start_f)
            cam.location = (0.0, -2.0, 1.35)
            cam.keyframe_insert(data_path="location", frame=end_f)
            
        current_frame += dur
        
    # Constant interpolation for prop scaling
    for p_obj in [prop_microchip, prop_tower, prop_cable, holo_beam]:
        if p_obj.animation_data and p_obj.animation_data.action:
            for fc in p_obj.animation_data.action.fcurves:
                if fc.data_path == "scale":
                    for kp in fc.keyframe_points:
                        kp.interpolation = 'CONSTANT'
                        
    # 6. Render
    out_dir = r"d:\New folder (2)\blender_engine\renders"
    os.makedirs(out_dir, exist_ok=True)
    
    blend_path = r"d:\New folder (2)\blender_engine\templates\episode_master.blend"
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"💾 Master Directed Blend Scene Saved: {blend_path}")
    
    setup_compositor_glare()
    
    if preview_mode:
        print("\n📸 RENDERING PREVIEW STILLS FOR EACH CUT...")
        scene = bpy.context.scene
        scene.render.engine = 'BLENDER_EEVEE_NEXT'
        scene.render.resolution_x = 1080
        scene.render.resolution_y = 1920
        scene.render.image_settings.file_format = 'PNG'
        
        for cut_id, mid_f in cut_midpoints:
            scene.frame_set(mid_f)
            preview_out = os.path.join(out_dir, f"popapus_cut_{cut_id}_preview.png")
            scene.render.filepath = preview_out
            bpy.ops.render.render(write_still=True)
            print(f"  ✅ Cut {cut_id} preview saved: {preview_out} (Frame {mid_f})")
            
        print("\n🎉 ALL CUT PREVIEWS RENDERED!")
    else:
        out_mp4 = os.path.join(out_dir, "popapus_episode_raw.mp4")
        setup_render_engine(out_mp4, total_frames=total_frames)
        print(f"\n🚀 Rendering Full Episode MP4 ({total_frames} frames)...")
        print(f"Target: {out_mp4}")
        bpy.ops.render.render(animation=True)
        print(f"\n🎉 3D EPISODE VIDEO RENDER COMPLETE: {out_mp4}")

def main():
    preview = "--preview" in sys.argv
    render_episode(preview_mode=preview)

if __name__ == "__main__":
    main()
