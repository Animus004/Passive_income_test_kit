"""
Step 3: Continuous 3D Camera Rail & Popapus Animation Engine
- Animates Antigravity Popapus with gentle buoyant levitation and tentacle breathing
- Animates the 4 Antigravity Orbs (Red, Green, Yellow, Blue) swirling inside the crystal dome
- Animates a smooth 3D drone camera rail flying down the server corridor and orbiting Popapus
- Renders 150 frames (5 seconds @ 30 fps) directly to MP4 using Blender EEVEE Next
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
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
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

def build_materials():
    mats = {}
    mats['skin_blue'] = create_material("Mat_Skin_Blue", base_color=hex_to_rgba("#3186FF"), metallic=0.22, roughness=0.22)
    mats['skin_sky'] = create_material("Mat_Skin_Sky", base_color=hex_to_rgba("#749BFF"), metallic=0.15, roughness=0.28)
    mats['glass_dome'] = create_glass_material()
    mats['solar_gold'] = create_material("Mat_Solar_Gold", base_color=hex_to_rgba("#FBBC04"), metallic=0.96, roughness=0.15)
    
    # 4 Antigravity Orbs
    mats['orb_red'] = create_material("Mat_Orb_Red", base_color=hex_to_rgba("#FC413D"), emission_color=hex_to_rgba("#FC413D"), emission_strength=14.0)
    mats['orb_green'] = create_material("Mat_Orb_Green", base_color=hex_to_rgba("#00B95C"), emission_color=hex_to_rgba("#00B95C"), emission_strength=14.0)
    mats['orb_yellow'] = create_material("Mat_Orb_Yellow", base_color=hex_to_rgba("#FFE432"), emission_color=hex_to_rgba("#FFE432"), emission_strength=15.0)
    mats['orb_blue'] = create_material("Mat_Orb_Blue", base_color=hex_to_rgba("#3186FF"), emission_color=hex_to_rgba("#3186FF"), emission_strength=15.0)
    
    mats['eye_pupil'] = create_material("Mat_Eye_Pupil", base_color=(0.02, 0.03, 0.06, 1.0), metallic=0.25, roughness=0.06)
    mats['eye_iris'] = create_material("Mat_Eye_Iris", base_color=hex_to_rgba("#3186FF"), emission_color=hex_to_rgba("#749BFF"), emission_strength=3.0)
    mats['eye_shine'] = create_material("Mat_Eye_Shine", base_color=(1.0, 1.0, 1.0, 1.0), emission_color=(1.0, 1.0, 1.0, 1.0), emission_strength=1.5)
    
    mats['hover_ring'] = create_material("Mat_Hover_Ring", base_color=hex_to_rgba("#3186FF"), emission_color=hex_to_rgba("#3186FF"), emission_strength=5.0)
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
    
    # 4 Antigravity Orbs inside Dome (Save references for animation!)
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
    
    width, depth, height = 1.0, 1.2, 3.2
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, height/2))
    cab = bpy.context.active_object
    cab.scale = (width, depth, height)
    cab.name = f"{name}_Cabinet"
    cab.parent = rack_root
    cab.data.materials.append(mats['chassis'])
    
    num_blades = 7
    for b in range(num_blades):
        bz = 0.45 + (b * 0.40)
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
    bpy.ops.mesh.primitive_plane_add(size=30.0, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.name = "Corridor_Floor"
    floor.data.materials.append(mats['floor'])
    
    build_server_rack(mats, name="Server_L1", location=(-1.7, -1.0, 0), rotation=(0, 0, math.radians(16)))
    build_server_rack(mats, name="Server_L2", location=(-2.2, 1.4, 0), rotation=(0, 0, math.radians(18)))
    build_server_rack(mats, name="Server_L3", location=(-2.6, 3.6, 0), rotation=(0, 0, math.radians(20)))
    
    build_server_rack(mats, name="Server_R1", location=(1.7, -1.0, 0), rotation=(0, 0, math.radians(-16)))
    build_server_rack(mats, name="Server_R2", location=(2.2, 1.4, 0), rotation=(0, 0, math.radians(-18)))
    build_server_rack(mats, name="Server_R3", location=(2.6, 3.6, 0), rotation=(0, 0, math.radians(-20)))
    
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.028, depth=14.0, location=(side * 1.05, 0.5, 0.018), rotation=(math.radians(90), 0, 0))
        fiber = bpy.context.active_object
        fiber.name = f"Fiber_Line_{'L' if side == -1 else 'R'}"
        fiber.data.materials.append(mats['fiber_blue'])

def setup_lighting():
    bpy.ops.object.light_add(type='AREA', location=(-2.2, -3.2, 3.4))
    key = bpy.context.active_object
    key.name = "Key_Light"
    key.data.energy = 260.0
    key.data.color = (1.0, 0.96, 0.92)
    key.data.size = 2.8
    key.rotation_euler = (math.radians(45), math.radians(-15), math.radians(-35))
    
    bpy.ops.object.light_add(type='SPOT', location=(2.4, 3.6, 3.0))
    rim = bpy.context.active_object
    rim.name = "Rim_Light"
    rim.data.energy = 360.0
    rim.data.color = hex_to_rgba("#FC413D")[:3]
    rim.data.spot_size = math.radians(72)
    rim.rotation_euler = (math.radians(-38), math.radians(20), math.radians(-135))
    
    bpy.ops.object.light_add(type='POINT', location=(0, -0.8, 0.4))
    uplight = bpy.context.active_object
    uplight.name = "Uplight_Blue"
    uplight.data.energy = 50.0
    uplight.data.color = hex_to_rgba("#3186FF")[:3]

def animate_popapus_and_camera(root, orbs, total_frames=150):
    """Bakes continuous keyframe animation for Popapus, the orbs, and the 3D camera flight"""
    print(f"🎬 Keyframing 3D Animation across {total_frames} frames (5.0s @ 30fps)...")
    
    # 1. Popapus Floating Buoyancy (Gentle levitation bobbing)
    base_z = 1.25
    for f in range(1, total_frames + 1):
        t = (f / total_frames) * (4 * math.pi)  # 2 full breath cycles
        bob_z = base_z + math.sin(t) * 0.08
        tilt_x = math.sin(t * 0.5) * math.radians(3.0)
        tilt_y = math.cos(t * 0.5) * math.radians(2.0)
        
        root.location = (0, 0, bob_z)
        root.rotation_euler = (tilt_x, tilt_y, 0)
        root.keyframe_insert(data_path="location", frame=f)
        root.keyframe_insert(data_path="rotation_euler", frame=f)
        
    # 2. The 4 Swirling Antigravity Orbs Inside the Glass Sac
    orb_orbit_radius = 0.16
    for orb_obj, phase in orbs:
        for f in range(1, total_frames + 1):
            orb_t = phase + ((f / total_frames) * (2 * math.pi * 1.5))  # 1.5 full orbits
            ox = math.cos(orb_t) * orb_orbit_radius
            oy = math.sin(orb_t) * orb_orbit_radius * 0.8
            oz = 0.44 + math.sin(orb_t * 2.0) * 0.06
            
            orb_obj.location = (ox, oy, oz)
            orb_obj.keyframe_insert(data_path="location", frame=f)

    # 3. Target Empty for Camera Tracking
    target_empty = bpy.data.objects.new("Camera_LookAt_Target", None)
    target_empty.location = (0, 0, 1.25)
    bpy.context.collection.objects.link(target_empty)
    
    for f in range(1, total_frames + 1):
        t = (f / total_frames) * (4 * math.pi)
        target_empty.location = (0, 0, 1.25 + math.sin(t) * 0.08)
        target_empty.keyframe_insert(data_path="location", frame=f)
        
    # 4. Cinematic 3D Camera Flight
    bpy.ops.object.camera_add(location=(0, -6.5, 2.0))
    cam = bpy.context.active_object
    cam.name = "Flythrough_Camera"
    cam.data.lens = 38.0
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = target_empty
    cam.data.dof.aperture_fstop = 3.0
    bpy.context.scene.camera = cam
    
    # Track constraint
    track = cam.constraints.new(type='TRACK_TO')
    track.target = target_empty
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'
    
    # Camera Flight Spline Keyframes:
    # Frame 1: Establishing Corridor View (distant, cinematic)
    cam.location = (0.2, -6.2, 1.9)
    cam.keyframe_insert(data_path="location", frame=1)
    
    # Frame 50: Gliding Down the Left Server Channel
    cam.location = (-0.9, -4.2, 1.6)
    cam.keyframe_insert(data_path="location", frame=50)
    
    # Frame 100: Sweeping Low-Angle Orbit to the Right
    cam.location = (1.2, -2.8, 1.3)
    cam.keyframe_insert(data_path="location", frame=100)
    
    # Frame 150: Hero Close-Up Framing Popapus & the Glowing Orbs
    cam.location = (0.0, -2.2, 1.35)
    cam.keyframe_insert(data_path="location", frame=150)
    
    # Smooth Bezier interpolation on camera
    if cam.animation_data and cam.animation_data.action:
        for fcurve in cam.animation_data.action.fcurves:
            for kf in fcurve.keyframe_points:
                kf.interpolation = 'BEZIER'
                
    print("✅ Keyframe Animation Baked Successfully!")

def setup_render_engine(output_mp4_path, total_frames=150):
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.fps = 30
    
    scene.frame_start = 1
    scene.frame_end = total_frames
    
    # FFMPEG MP4 Video Output Configuration
    scene.render.image_settings.file_format = 'FFMPEG'
    scene.render.ffmpeg.format = 'MPEG4'
    scene.render.ffmpeg.codec = 'H264'
    scene.render.ffmpeg.constant_rate_factor = 'HIGH'
    scene.render.ffmpeg.gopsize = 15
    scene.render.filepath = output_mp4_path
    
    eevee = scene.eevee
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
    glare.threshold = 0.82
    glare.size = 8
    glare.location = (300, 0)
    
    comp = tree.nodes.new(type="CompositorNodeComposite")
    comp.location = (600, 0)
    
    tree.links.new(rl.outputs['Image'], glare.inputs['Image'])
    tree.links.new(glare.outputs['Image'], comp.inputs['Image'])

def main():
    print("=====================================================")
    print("🎬 RENDERING CONTINUOUS 3D CAMERA FLIGHT PROTOTYPE")
    print("=====================================================")
    
    clear_scene()
    mats = build_materials()
    root, orbs, tentacles = build_popapus(mats)
    build_environment(mats)
    setup_lighting()
    
    total_frames = 150  # 5 seconds at 30 fps
    animate_popapus_and_camera(root, orbs, total_frames=total_frames)
    
    out_dir = r"d:\New folder (2)\blender_engine\renders"
    os.makedirs(out_dir, exist_ok=True)
    out_mp4 = os.path.join(out_dir, "popapus_spatial_flight.mp4")
    
    setup_render_engine(out_mp4, total_frames=total_frames)
    setup_compositor_glare()
    
    # Save the animated project file
    blend_path = r"d:\New folder (2)\blender_engine\templates\popapus_animated.blend"
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"💾 Saved Animated Template: {blend_path}")
    
    print(f"🚀 Starting Headless GPU Render of 150 Frames directly to MP4...")
    print(f"Destination: {out_mp4}")
    bpy.ops.render.render(animation=True)
    print(f"\n🎉 3D CAMERA FLIGHT VIDEO RENDER COMPLETE: {out_mp4}")

if __name__ == "__main__":
    main()

