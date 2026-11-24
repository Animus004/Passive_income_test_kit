"""
Reference 3D Props Library & Preview Showcase for Meta's Master Plan (Vivid Edition)
Updated with:
- Deep cinematic midnight-blue studio lighting (no more pitch black void)
- Rich material colors: slate architectural panels, illuminated office windows, 24K gold, concrete textures
- Dual-color studio fill & rim lights so all shadows have rich depth and metallic specular highlights
- Holographic cyan grid floor lines
- 4 High-Resolution 1080x1920 preview stills
"""

import bpy
import math
import os

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

def create_hologram_material(name="Mat_Holo_Beam"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()
    
    output = tree.nodes.new(type="ShaderNodeOutputMaterial")
    output.location = (400, 0)
    mix = tree.nodes.new(type="ShaderNodeMixShader")
    mix.location = (180, 0)
    mix.inputs['Fac'].default_value = 0.35
    
    transp = tree.nodes.new(type="ShaderNodeBsdfTransparent")
    transp.location = (-100, 100)
    
    emission = tree.nodes.new(type="ShaderNodeEmission")
    emission.inputs['Color'].default_value = hex_to_rgba("#00D2FF")
    emission.inputs['Strength'].default_value = 8.0
    emission.location = (-100, -100)
    
    tree.links.new(transp.outputs['BSDF'], mix.inputs[1])
    tree.links.new(emission.outputs['Emission'], mix.inputs[2])
    tree.links.new(mix.outputs['Shader'], output.inputs['Surface'])
    
    mat.blend_method = 'BLEND'
    return mat

def build_materials():
    mats = {}
    # Architectural & Hardware Materials
    mats['arch_slate'] = create_material("Mat_Arch_Slate", base_color=hex_to_rgba("#2C3E50"), metallic=0.65, roughness=0.25)
    mats['arch_silver'] = create_material("Mat_Arch_Silver", base_color=hex_to_rgba("#B0BEC5"), metallic=0.85, roughness=0.20)
    mats['concrete'] = create_material("Mat_Concrete", base_color=hex_to_rgba("#78909C"), metallic=0.15, roughness=0.55)
    mats['silicon_teal'] = create_material("Mat_Silicon_Teal", base_color=hex_to_rgba("#16323C"), metallic=0.88, roughness=0.12)
    mats['floor'] = create_material("Mat_Studio_Floor", base_color=hex_to_rgba("#0F172A"), metallic=0.92, roughness=0.12)
    
    # 24K Shiny Gold
    mats['gold'] = create_material("Mat_24K_Gold", base_color=hex_to_rgba("#FFD700"), metallic=0.98, roughness=0.10)
    
    # Vibrant Emissive Accents
    mats['meta_blue'] = create_material("Mat_Meta_Blue", base_color=hex_to_rgba("#0081FB"), emission_color=hex_to_rgba("#0081FB"), emission_strength=14.0)
    mats['electric_cyan'] = create_material("Mat_Electric_Cyan", base_color=hex_to_rgba("#00E5FF"), emission_color=hex_to_rgba("#00E5FF"), emission_strength=15.0)
    mats['thermal_red'] = create_material("Mat_Thermal_Red", base_color=hex_to_rgba("#FF334B"), emission_color=hex_to_rgba("#FF334B"), emission_strength=18.0)
    mats['cyber_green'] = create_material("Mat_Cyber_Green", base_color=hex_to_rgba("#00E676"), emission_color=hex_to_rgba("#00E676"), emission_strength=14.0)
    mats['office_warm'] = create_material("Mat_Office_Warm", base_color=hex_to_rgba("#FFE082"), emission_color=hex_to_rgba("#FFE082"), emission_strength=6.0)
    mats['text_gold'] = create_material("Mat_Text_Gold", base_color=hex_to_rgba("#FFD700"), emission_color=hex_to_rgba("#FFE57F"), emission_strength=5.0)
    
    # Smart Glasses Materials
    mats['acetate_frame'] = create_material("Mat_Acetate_Frame", base_color=hex_to_rgba("#1E293B"), metallic=0.35, roughness=0.18)
    mats['lens_mirrored'] = create_material("Mat_Lens_Mirrored", base_color=hex_to_rgba("#0284C7"), metallic=0.95, roughness=0.04)
    mats['holo_beam'] = create_hologram_material()
    return mats

def spawn_floating_3d_text(text_str, location=(0, 0, 2.4), scale=(0.35, 0.35, 0.35), rotation=(math.radians(90), 0, 0), mat=None):
    bpy.ops.object.text_add(location=location, rotation=rotation)
    txt = bpy.context.active_object
    txt.name = f"Text_3D_{text_str.replace(' ', '_')}"
    txt.scale = scale
    txt.data.body = text_str
    txt.data.extrude = 0.07
    txt.data.bevel_depth = 0.014
    txt.data.bevel_resolution = 3
    txt.data.align_x = 'CENTER'
    txt.data.align_y = 'CENTER'
    if mat:
        txt.data.materials.append(mat)
    return txt

# 1. Hyperion Datacenter Campus
def spawn_hyperion_campus(mats, location=(0, 0, 0), scale=(1, 1, 1)):
    root = bpy.data.objects.new("Prop_Hyperion_Campus", None)
    root.location = location
    root.scale = scale
    bpy.context.collection.objects.link(root)
    
    # Main Central Server Hall (Brushed Silver/Slate Architectural Monolith)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.1))
    main_bldg = bpy.context.active_object
    main_bldg.scale = (2.2, 1.4, 2.2)
    main_bldg.name = "Hyperion_Main_Bldg"
    main_bldg.parent = root
    main_bldg.data.materials.append(mats['arch_slate'])
    
    # Facade Architectural Ribbing (Silver trim)
    for rib_x in [-0.9, -0.45, 0.45, 0.9]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(rib_x, -0.71, 1.1))
        rib = bpy.context.active_object
        rib.scale = (0.06, 0.03, 2.15)
        rib.parent = root
        rib.data.materials.append(mats['arch_silver'])
    
    # Left & Right Server Wings
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 1.6, 0.1, 0.8))
        wing = bpy.context.active_object
        wing.scale = (1.0, 1.2, 1.6)
        wing.name = f"Hyperion_Wing_{'L' if side == -1 else 'R'}"
        wing.parent = root
        wing.data.materials.append(mats['arch_silver'])
        
        # Horizontal Glowing Office/Server Windows (Warm glow + Cyan)
        for strip_i in range(4):
            sz = 0.35 + (strip_i * 0.32)
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 1.6, -0.52, sz))
            strip = bpy.context.active_object
            strip.scale = (0.85, 0.04, 0.08)
            strip.name = f"Hyperion_Strip_{side}_{strip_i}"
            strip.parent = root
            strip.data.materials.append(mats['electric_cyan'] if strip_i % 2 == 0 else mats['office_warm'])
            
    # Meta Neon Infinity Logo on Central Facade (Glowing Electric Blue)
    logo_root = bpy.data.objects.new("Meta_Infinity_Logo", None)
    logo_root.location = (0, -0.73, 1.5)
    logo_root.rotation_euler = (math.radians(90), 0, 0)
    logo_root.parent = root
    bpy.context.collection.objects.link(logo_root)
    
    for l_side in [-0.22, 0.22]:
        bpy.ops.mesh.primitive_torus_add(major_radius=0.20, minor_radius=0.042, major_segments=36, minor_segments=18, location=(l_side, 0, 0))
        loop = bpy.context.active_object
        loop.name = f"Infinity_Loop_{'L' if l_side < 0 else 'R'}"
        loop.parent = logo_root
        loop.data.materials.append(mats['meta_blue'])
        set_smooth(loop)
        
    # Roof Chiller Units (Industrial Silver)
    for chiller_x in [-0.7, 0, 0.7]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.24, depth=0.38, vertices=24, location=(chiller_x, 0, 2.38))
        chiller = bpy.context.active_object
        chiller.name = f"Roof_Chiller_{chiller_x}"
        chiller.parent = root
        chiller.data.materials.append(mats['arch_silver'])
        set_smooth(chiller)
        
    # Floating 3D Text Header
    txt = spawn_floating_3d_text("HYPERION CAMPUS", location=(0, -0.6, 3.0), scale=(0.28, 0.28, 0.28), mat=mats['text_gold'])
    txt.parent = root
    return root

# 2. 6.6 GW Nuclear Cooling Tower
def spawn_cooling_tower_6_6gw(mats, location=(0, 0, 0), scale=(1, 1, 1)):
    root = bpy.data.objects.new("Prop_Cooling_Tower_6_6GW", None)
    root.location = location
    root.scale = scale
    bpy.context.collection.objects.link(root)
    
    # Tower Base Plinth (Reinforced Concrete)
    bpy.ops.mesh.primitive_cylinder_add(radius=1.35, depth=0.9, vertices=36, location=(0, 0, 0.45))
    base = bpy.context.active_object
    base.name = "Tower_Plinth"
    base.parent = root
    base.data.materials.append(mats['arch_slate'])
    set_smooth(base)
    
    # Hyperbolic Neck (Industrial Cool Grey Concrete)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.95, depth=1.6, vertices=36, location=(0, 0, 1.6))
    neck = bpy.context.active_object
    neck.name = "Tower_Hyperbolic_Neck"
    neck.parent = root
    neck.data.materials.append(mats['concrete'])
    set_smooth(neck)
    
    # Top Flare & Steam Chimney
    bpy.ops.mesh.primitive_cone_add(radius1=0.95, radius2=1.25, depth=0.8, vertices=36, location=(0, 0, 2.7))
    flare = bpy.context.active_object
    flare.name = "Tower_Flare"
    flare.parent = root
    flare.data.materials.append(mats['concrete'])
    set_smooth(flare)
    
    # Glowing Thermal Energy Rim (#FF334B Hyper Red)
    bpy.ops.mesh.primitive_torus_add(major_radius=1.22, minor_radius=0.075, major_segments=36, minor_segments=18, location=(0, 0, 3.1))
    rim = bpy.context.active_object
    rim.name = "Tower_Thermal_Rim"
    rim.parent = root
    rim.data.materials.append(mats['thermal_red'])
    set_smooth(rim)
    
    # 8 Vertical Structural Buttress Ribs (Silver/Steel reinforcement)
    for r in range(8):
        angle = r * (math.pi / 4)
        rx = math.cos(angle) * 1.15
        ry = math.sin(angle) * 1.15
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(rx, ry, 1.6))
        rib = bpy.context.active_object
        rib.scale = (0.08, 0.14, 2.4)
        rib.rotation_euler = (0, 0, angle)
        rib.name = f"Tower_Rib_{r}"
        rib.parent = root
        rib.data.materials.append(mats['arch_silver'])
        
    # Industrial Substation Transformer Base Modules with Glowing Status Indicators
    for sub_x in [-1.55, 1.55]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sub_x, 0.4, 0.35))
        sub = bpy.context.active_object
        sub.scale = (0.6, 0.8, 0.7)
        sub.name = f"Substation_Transformer_{sub_x}"
        sub.parent = root
        sub.data.materials.append(mats['arch_slate'])
        
        # Power Indicator Light
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.05, location=(sub_x, 0.82, 0.5))
        pwr_led = bpy.context.active_object
        pwr_led.parent = root
        pwr_led.data.materials.append(mats['electric_cyan'])
        
    # Floating 3D Text Header
    txt = spawn_floating_3d_text("6.6 GIGAWATTS", location=(0, -0.8, 3.75), scale=(0.32, 0.32, 0.32), mat=mats['text_gold'])
    txt.parent = root
    return root

# 3. MTIA Custom AI Silicon Chip
def spawn_mtia_microchip(mats, location=(0, 0, 1.25), scale=(1.1, 1.1, 1.1)):
    root = bpy.data.objects.new("Prop_MTIA_Silicon_Chip", None)
    root.location = location
    root.scale = scale
    root.rotation_euler = (math.radians(28), 0, math.radians(20))
    bpy.context.collection.objects.link(root)
    
    # Semiconductor Base Wafer (Dark Iridescent Teal Silicon)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
    base = bpy.context.active_object
    base.scale = (1.1, 1.1, 0.05)
    base.name = "MTIA_Wafer_Base"
    base.parent = root
    base.data.materials.append(mats['silicon_teal'])
    set_smooth(base)
    
    # 24K Polished Gold Beveled Outer Frame
    bpy.ops.mesh.primitive_torus_add(major_radius=0.78, minor_radius=0.042, major_segments=4, minor_segments=16, location=(0, 0, 0.025), rotation=(0, 0, math.radians(45)))
    border = bpy.context.active_object
    border.name = "MTIA_Gold_Border"
    border.parent = root
    border.data.materials.append(mats['gold'])
    set_smooth(border)
    
    # Central Logic Die (High-Energy Electric Cyan)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.04))
    die = bpy.context.active_object
    die.scale = (0.55, 0.55, 0.035)
    die.name = "MTIA_Silicon_Die"
    die.parent = root
    die.data.materials.append(mats['electric_cyan'])
    set_smooth(die)
    
    # Gold Micro-Circuitry Interconnect Tracks (Cross channels)
    for rot in [0, math.pi / 2]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.055), rotation=(0, 0, rot))
        trace = bpy.context.active_object
        trace.scale = (0.85, 0.03, 0.015)
        trace.name = "MTIA_Circuit_Trace"
        trace.parent = root
        trace.data.materials.append(mats['gold'])
        
    # 28 Perimeter 24K Gold Connector Pins
    for side in range(4):
        angle = side * (math.pi / 2)
        for p in range(7):
            offset = -0.42 + (p * 0.14)
            px = math.cos(angle) * 0.65 - math.sin(angle) * offset
            py = math.sin(angle) * 0.65 + math.cos(angle) * offset
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, py, 0))
            pin = bpy.context.active_object
            pin.scale = (0.10, 0.035, 0.025)
            pin.rotation_euler = (0, 0, angle)
            pin.name = f"MTIA_Pin_{side}_{p}"
            pin.parent = root
            pin.data.materials.append(mats['gold'])
            
    # Floating 3D Text Header (World space, level & upright)
    spawn_floating_3d_text("MTIA SILICON", location=(0, -0.2, 2.3), scale=(0.28, 0.28, 0.28), mat=mats['text_gold'])
    return root

# 4. Ray-Ban Meta Smart Glasses
def spawn_smart_glasses(mats, location=(0, 0, 1.25), scale=(1.2, 1.2, 1.2)):
    root = bpy.data.objects.new("Prop_Smart_Glasses", None)
    root.location = location
    root.scale = scale
    root.rotation_euler = (math.radians(16), math.radians(-24), math.radians(6))
    bpy.context.collection.objects.link(root)
    
    # Eyewear Frame: Left & Right Rims (Glossy Dark Slate Acetate)
    for side in [-1, 1]:
        rx = side * 0.42
        bpy.ops.mesh.primitive_torus_add(major_radius=0.32, minor_radius=0.038, major_segments=32, minor_segments=16, location=(rx, 0, 0))
        rim = bpy.context.active_object
        rim.scale = (1.05, 0.6, 0.88)
        rim.name = f"Glasses_Rim_{'L' if side == -1 else 'R'}"
        rim.parent = root
        rim.data.materials.append(mats['acetate_frame'])
        set_smooth(rim)
        
        # Blue/Cyan Mirrored Polarized Glass Lens
        bpy.ops.mesh.primitive_cylinder_add(radius=0.29, depth=0.02, vertices=32, location=(rx, 0, 0), rotation=(math.radians(90), 0, 0))
        lens = bpy.context.active_object
        lens.scale = (1.05, 0.88, 1.0)
        lens.name = f"Glasses_Lens_{'L' if side == -1 else 'R'}"
        lens.parent = root
        lens.data.materials.append(mats['lens_mirrored'])
        set_smooth(lens)
        
        # Smart Camera Sensors (Gold Hinge Modules)
        cam_x = rx + (side * 0.36)
        cam_z = 0.22
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.04, vertices=20, location=(cam_x, -0.04, cam_z), rotation=(math.radians(90), 0, 0))
        sensor = bpy.context.active_object
        sensor.name = f"Smart_Cam_Sensor_{'L' if side == -1 else 'R'}"
        sensor.parent = root
        sensor.data.materials.append(mats['gold'])
        set_smooth(sensor)
        
        # Active Recording Indicator LED (Cyber Green)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.018, location=(cam_x - (side * 0.05), -0.05, cam_z))
        led = bpy.context.active_object
        led.name = f"Smart_Cam_LED_{'L' if side == -1 else 'R'}"
        led.parent = root
        led.data.materials.append(mats['cyber_green'])
        set_smooth(led)
        
        # Temple Arms
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.74, 0.55, 0.15))
        arm = bpy.context.active_object
        arm.scale = (0.04, 1.1, 0.08)
        arm.name = f"Glasses_Temple_{'L' if side == -1 else 'R'}"
        arm.parent = root
        arm.data.materials.append(mats['acetate_frame'])
        
    # Center Nose Bridge
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.01, 0.14))
    bridge = bpy.context.active_object
    bridge.scale = (0.24, 0.05, 0.04)
    bridge.name = "Glasses_Bridge"
    bridge.parent = root
    bridge.data.materials.append(mats['acetate_frame'])
    
    # Forward Laser Scan Beams (Cyan Holographic)
    for r_side in [-1, 1]:
        lx = r_side * 0.42
        bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=1.6, vertices=16, location=(lx, -0.85, 0.0), rotation=(math.radians(90), 0, 0))
        laser = bpy.context.active_object
        laser.name = f"Glasses_Laser_{'L' if r_side == -1 else 'R'}"
        laser.parent = root
        laser.data.materials.append(mats['holo_beam'])
        set_smooth(laser)
        
    # Floating 3D Text Header (World space, level & upright)
    spawn_floating_3d_text("CONTINUOUS VIDEO", location=(0, -0.2, 2.3), scale=(0.18, 0.18, 0.18), mat=mats['text_gold'])
    return root

def setup_stage_and_lighting():
    # Studio Floor with Reflective Deep Midnight Finish
    bpy.ops.mesh.primitive_plane_add(size=40.0, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.name = "Stage_Floor"
    floor.data.materials.append(bpy.data.materials['Mat_Studio_Floor'])
    
    # Glowing Floor Grid Lines (Perspective Runway)
    for g in range(-4, 5):
        # Longitudinal Lines
        bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=30.0, location=(g * 1.2, 0, 0.008), rotation=(math.radians(90), 0, 0))
        grid_line = bpy.context.active_object
        grid_line.name = f"Grid_Line_Y_{g}"
        grid_line.data.materials.append(bpy.data.materials['Mat_Electric_Cyan'])
        
        # Lateral Cross Lines
        bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=14.0, location=(0, g * 2.5, 0.008), rotation=(0, math.radians(90), 0))
        grid_cross = bpy.context.active_object
        grid_cross.name = f"Grid_Line_X_{g}"
        grid_cross.data.materials.append(bpy.data.materials['Mat_Electric_Cyan'])
        
    # Background Server Columns (Left & Right)
    width, depth, height = 1.0, 1.2, 3.6
    for r_i, side in enumerate([-1, 1]):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 3.2, 2.2, height / 2))
        rack = bpy.context.active_object
        rack.scale = (width, depth, height)
        rack.name = f"Bg_Server_Rack_{r_i}"
        rack.data.materials.append(bpy.data.materials['Mat_Arch_Slate'])
        
    # 1. Main Key Light (Warm Sunlight / Studio Key)
    bpy.ops.object.light_add(type='AREA', location=(-2.8, -4.2, 4.2))
    key = bpy.context.active_object
    key.name = "Key_Light"
    key.data.energy = 380.0
    key.data.color = (1.0, 0.98, 0.94)
    key.data.size = 3.5
    key.rotation_euler = (math.radians(45), math.radians(-15), math.radians(-35))
    
    # 2. Ambient Fill Light (Soft Cyan/Sky Blue Fill - lifts all shadows!)
    bpy.ops.object.light_add(type='AREA', location=(2.4, -3.2, 3.0))
    fill = bpy.context.active_object
    fill.name = "Ambient_Fill_Light"
    fill.data.energy = 160.0
    fill.data.color = hex_to_rgba("#70A0D0")[:3]
    fill.data.size = 4.0
    fill.rotation_euler = (math.radians(35), math.radians(20), math.radians(25))
    
    # 3. Dramatic Rim Light (Hyper Red / Gold)
    bpy.ops.object.light_add(type='SPOT', location=(3.2, 3.8, 3.8))
    rim = bpy.context.active_object
    rim.name = "Rim_Light"
    rim.data.energy = 480.0
    rim.data.color = hex_to_rgba("#FC413D")[:3]
    rim.data.spot_size = math.radians(75)
    rim.rotation_euler = (math.radians(-38), math.radians(20), math.radians(-135))
    
    # 4. Uplight (Vibrant Electric Blue)
    bpy.ops.object.light_add(type='POINT', location=(0, -1.2, 0.6))
    uplight = bpy.context.active_object
    uplight.name = "Uplight_Blue"
    uplight.data.energy = 110.0
    uplight.data.color = hex_to_rgba("#0081FB")[:3]

def setup_render_settings():
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.fps = 30
    scene.render.image_settings.file_format = 'PNG'
    
    eevee = scene.eevee
    if hasattr(eevee, 'taa_render_samples'):
        eevee.taa_render_samples = 16
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
        # Deep cinematic midnight navy blue (NOT dead black)
        bg.inputs['Color'].default_value = (0.025, 0.045, 0.085, 1.0)
        bg.inputs['Strength'].default_value = 1.0
        
    # Fog Glow Compositor
    scene.use_nodes = True
    tree = scene.node_tree
    tree.nodes.clear()
    rl = tree.nodes.new(type="CompositorNodeRLayers")
    glare = tree.nodes.new(type="CompositorNodeGlare")
    glare.glare_type = 'FOG_GLOW'
    glare.quality = 'HIGH'
    glare.threshold = 0.75
    glare.size = 8
    comp = tree.nodes.new(type="CompositorNodeComposite")
    tree.links.new(rl.outputs['Image'], glare.inputs['Image'])
    tree.links.new(glare.outputs['Image'], comp.inputs['Image'])

def render_prop_preview(prop_func, prop_name, cam_pos, look_at_pos, out_filename):
    print(f"\n=====================================================")
    print(f"🎬 RENDERING VIVID 3D HERO PROP: {prop_name}")
    print(f"=====================================================")
    clear_scene()
    mats = build_materials()
    setup_stage_and_lighting()
    
    prop_root = prop_func(mats)
    
    target = bpy.data.objects.new("LookAt_Target", None)
    target.location = look_at_pos
    bpy.context.collection.objects.link(target)
    
    bpy.ops.object.camera_add(location=cam_pos)
    cam = bpy.context.active_object
    cam.data.lens = 38.0
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = target
    cam.data.dof.aperture_fstop = 3.2
    bpy.context.scene.camera = cam
    
    track = cam.constraints.new(type='TRACK_TO')
    track.target = target
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'
    
    setup_render_settings()
    
    out_dir = r"d:\New folder (2)\blender_engine\renders"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, out_filename)
    bpy.context.scene.render.filepath = out_path
    
    print(f"🚀 Rendering Still Image ({prop_name}) to: {out_path}")
    bpy.ops.render.render(write_still=True)
    print(f"✅ Saved Preview: {out_path}")

def main():
    props_to_render = [
        (spawn_hyperion_campus, "Hyperion Datacenter Campus", (0, -6.8, 3.2), (0, 0, 1.5), "prop_1_hyperion_campus.png"),
        (spawn_cooling_tower_6_6gw, "6.6 GW Nuclear Cooling Tower", (0, -7.5, 3.6), (0, 0, 1.8), "prop_2_cooling_tower_6_6gw.png"),
        (spawn_mtia_microchip, "MTIA Custom AI Silicon Chip", (0, -4.2, 2.6), (0, 0, 1.25), "prop_3_mtia_microchip.png"),
        (spawn_smart_glasses, "Ray-Ban Meta Smart Glasses", (0, -3.8, 2.1), (0, 0, 1.15), "prop_4_smart_glasses.png"),
    ]
    
    for prop_func, prop_name, cam_pos, look_at_pos, out_filename in props_to_render:
        render_prop_preview(prop_func, prop_name, cam_pos, look_at_pos, out_filename)
        
    print("\n🎉 ALL 4 VIVID REFERENCE HERO PROPS SUCCESSFULLY RENDERED!")

if __name__ == "__main__":
    main()
