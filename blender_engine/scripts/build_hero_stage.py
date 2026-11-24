"""
Autonomous 3D Hero Stage Builder for Antigravity AI Agent
Builds procedural 3D Antigravity Agent, Datacenter Server Corridor,
Cinematic Lighting, Camera Rails, and EEVEE Next Render Configuration.
"""

import bpy
import math
import os

def clear_scene():
    """Wipe default objects and start fresh"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # Remove orphan data
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)

def create_material(name, base_color=(1,1,1,1), metallic=0.0, roughness=0.5, emission_color=(0,0,0,1), emission_strength=0.0, transmission=0.0):
    """Helper to create Principled BSDF materials"""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    
    if bsdf:
        bsdf.inputs['Base Color'].default_value = base_color
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Roughness'].default_value = roughness
        
        # Emission
        if emission_strength > 0:
            if 'Emission Color' in bsdf.inputs:
                bsdf.inputs['Emission Color'].default_value = emission_color
                bsdf.inputs['Emission Strength'].default_value = emission_strength
            elif 'Emission' in bsdf.inputs:
                bsdf.inputs['Emission'].default_value = emission_color
                
        if transmission > 0 and 'Transmission Weight' in bsdf.inputs:
            bsdf.inputs['Transmission Weight'].default_value = transmission
            
    return mat

def build_materials():
    """Create the core futuristic shader palette"""
    mats = {}
    
    # 1. Dark Obsidian Ceramic (Agent Armor & Servers)
    mats['obsidian'] = create_material(
        name="Mat_Obsidian",
        base_color=(0.03, 0.04, 0.06, 1.0),
        metallic=0.88,
        roughness=0.18
    )
    
    # 2. DeepMind Quantum Cyan Core (High-intensity glow)
    mats['cyan_glow'] = create_material(
        name="Mat_DeepMind_Cyan",
        base_color=(0.05, 0.75, 1.0, 1.0),
        metallic=0.1,
        roughness=0.1,
        emission_color=(0.08, 0.82, 1.0, 1.0),
        emission_strength=12.0
    )
    
    # 3. DeepMind Quantum Violet (Secondary orbital glow)
    mats['violet_glow'] = create_material(
        name="Mat_DeepMind_Violet",
        base_color=(0.6, 0.2, 1.0, 1.0),
        metallic=0.1,
        roughness=0.1,
        emission_color=(0.65, 0.22, 1.0, 1.0),
        emission_strength=9.0
    )
    
    # 4. Gold Microchip Traces
    mats['gold'] = create_material(
        name="Mat_Gold_Traces",
        base_color=(1.0, 0.78, 0.18, 1.0),
        metallic=1.0,
        roughness=0.22
    )
    
    # 5. Server Chassis Matte Metal
    mats['chassis'] = create_material(
        name="Mat_Server_Chassis",
        base_color=(0.08, 0.10, 0.14, 1.0),
        metallic=0.75,
        roughness=0.45
    )
    
    # 6. Status LEDs
    mats['led_green'] = create_material(
        name="Mat_LED_Green",
        base_color=(0.1, 1.0, 0.3, 1.0),
        emission_color=(0.1, 1.0, 0.3, 1.0),
        emission_strength=15.0
    )
    
    mats['led_amber'] = create_material(
        name="Mat_LED_Amber",
        base_color=(1.0, 0.6, 0.05, 1.0),
        emission_color=(1.0, 0.6, 0.05, 1.0),
        emission_strength=12.0
    )
    
    # 7. Floor Grid Material
    mats['floor'] = create_material(
        name="Mat_Floor",
        base_color=(0.02, 0.03, 0.05, 1.0),
        metallic=0.92,
        roughness=0.12
    )
    
    return mats

def set_smooth(obj):
    """Enables smooth shading on meshes"""
    if obj and obj.type == 'MESH':
        for p in obj.data.polygons:
            p.use_smooth = True

def build_antigravity_agent(mats, location=(0, 0, 1.35)):
    """Procedurally assemble the Antigravity DeepMind Hero Agent"""
    agent_root = bpy.data.objects.new("Antigravity_Agent_Root", None)
    agent_root.location = location
    bpy.context.collection.objects.link(agent_root)
    
    # 1. Inner Quantum Energy Core (Glowing Cyan Icosphere)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=0.38, location=(0, 0, 0))
    inner_core = bpy.context.active_object
    inner_core.name = "Agent_Inner_Core"
    inner_core.parent = agent_root
    inner_core.data.materials.append(mats['cyan_glow'])
    set_smooth(inner_core)
    
    # 2. Outer Protective Obsidian Shell (Segmented Geo-Sphere)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=48, radius=0.54, location=(0, 0, 0))
    outer_shell = bpy.context.active_object
    outer_shell.name = "Agent_Outer_Shell"
    outer_shell.parent = agent_root
    outer_shell.data.materials.append(mats['obsidian'])
    set_smooth(outer_shell)
    
    # 3. Primary Inner Orbital Quantum Ring
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.82,
        minor_radius=0.038,
        major_segments=64,
        minor_segments=24,
        location=(0, 0, 0),
        rotation=(math.radians(35), math.radians(20), 0)
    )
    inner_ring = bpy.context.active_object
    inner_ring.name = "Agent_Orbital_Ring_Inner"
    inner_ring.parent = agent_root
    inner_ring.data.materials.append(mats['cyan_glow'])
    set_smooth(inner_ring)
    
    # 4. Secondary Outer Orbital Quantum Ring
    bpy.ops.mesh.primitive_torus_add(
        major_radius=1.05,
        minor_radius=0.032,
        major_segments=64,
        minor_segments=24,
        location=(0, 0, 0),
        rotation=(math.radians(-40), math.radians(45), math.radians(15))
    )
    outer_ring = bpy.context.active_object
    outer_ring.name = "Agent_Orbital_Ring_Outer"
    outer_ring.parent = agent_root
    outer_ring.data.materials.append(mats['violet_glow'])
    set_smooth(outer_ring)
    
    # 5. Front Holographic Optical Sensor (The "Eye")
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.20,
        depth=0.12,
        vertices=48,
        location=(0, -0.50, 0.05),
        rotation=(math.radians(90), 0, 0)
    )
    optic = bpy.context.active_object
    optic.name = "Agent_Optic_Lens"
    optic.parent = agent_root
    optic.data.materials.append(mats['cyan_glow'])
    set_smooth(optic)
    
    # Optic Outer Bezel
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.24,
        minor_radius=0.032,
        major_segments=48,
        minor_segments=24,
        location=(0, -0.50, 0.05),
        rotation=(math.radians(90), 0, 0)
    )
    bezel = bpy.context.active_object
    bezel.name = "Agent_Optic_Bezel"
    bezel.parent = agent_root
    bezel.data.materials.append(mats['gold'])
    set_smooth(bezel)
    
    # 6. Bottom Holographic Downlight Projector
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.15,
        radius2=0.04,
        depth=0.16,
        vertices=32,
        location=(0, 0, -0.50),
        rotation=(math.radians(180), 0, 0)
    )
    projector = bpy.context.active_object
    projector.name = "Agent_Holo_Projector"
    projector.parent = agent_root
    projector.data.materials.append(mats['cyan_glow'])
    set_smooth(projector)
    
    return agent_root

def build_server_rack(mats, name="ServerRack", location=(0, 0, 0), rotation=(0, 0, 0)):
    """Constructs a high-detail modular server chassis"""
    rack_root = bpy.data.objects.new(name, None)
    rack_root.location = location
    rack_root.rotation_euler = rotation
    bpy.context.collection.objects.link(rack_root)
    
    # Main Cabinet Frame
    width, depth, height = 1.0, 1.2, 3.2
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, height/2))
    cab = bpy.context.active_object
    cab.scale = (width, depth, height)
    cab.name = f"{name}_Cabinet"
    cab.parent = rack_root
    cab.data.materials.append(mats['chassis'])
    
    # Front Blade Slots (6 server blade levels)
    num_blades = 7
    for b in range(num_blades):
        bz = 0.45 + (b * 0.40)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -depth/2 - 0.02, bz))
        blade = bpy.context.active_object
        blade.scale = (width * 0.88, 0.06, 0.28)
        blade.name = f"{name}_Blade_{b}"
        blade.parent = rack_root
        blade.data.materials.append(mats['obsidian'])
        
        # Add 3 Blinking LEDs on each blade
        for led_i in range(3):
            lx = -width * 0.35 + (led_i * 0.08)
            bpy.ops.mesh.primitive_cylinder_add(
                radius=0.016,
                depth=0.02,
                location=(lx, -depth/2 - 0.06, bz),
                rotation=(math.radians(90), 0, 0)
            )
            led = bpy.context.active_object
            led.name = f"{name}_LED_{b}_{led_i}"
            led.parent = rack_root
            led_mat = mats['led_green'] if (b + led_i) % 3 != 0 else mats['led_amber']
            led.data.materials.append(led_mat)
            
    # Vertical Cable Conduit
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.035,
        depth=height,
        location=(width/2 + 0.05, -depth/2 + 0.1, height/2)
    )
    conduit = bpy.context.active_object
    conduit.name = f"{name}_Conduit"
    conduit.parent = rack_root
    conduit.data.materials.append(mats['cyan_glow'])
    
    return rack_root

def build_environment(mats):
    """Builds the futuristic server corridor environment"""
    # 1. Reflective Floor
    bpy.ops.mesh.primitive_plane_add(size=30.0, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.name = "Corridor_Floor"
    floor.data.materials.append(mats['floor'])
    
    # 2. Server Racks lining both sides of corridor
    # Left Row
    build_server_rack(mats, name="Server_L1", location=(-1.6, 0.2, 0), rotation=(0, 0, math.radians(18)))
    build_server_rack(mats, name="Server_L2", location=(-2.2, 2.2, 0), rotation=(0, 0, math.radians(18)))
    
    # Right Row
    build_server_rack(mats, name="Server_R1", location=(1.6, 0.2, 0), rotation=(0, 0, math.radians(-18)))
    build_server_rack(mats, name="Server_R2", location=(2.2, 2.2, 0), rotation=(0, 0, math.radians(-18)))
    
    # 3. Glowing Floor Fiber Optic Lines
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.03,
            depth=12.0,
            location=(side * 1.0, 1.0, 0.02),
            rotation=(math.radians(90), 0, 0)
        )
        fiber = bpy.context.active_object
        fiber.name = f"Fiber_Line_{'L' if side == -1 else 'R'}"
        fiber.data.materials.append(mats['cyan_glow'])

def setup_lighting_and_camera():
    """Sets up high-impact 3-point cinematic lighting & 9:16 vertical camera"""
    # 1. Key Light (Cool Cyan Area Light from upper left)
    bpy.ops.object.light_add(type='AREA', location=(-2.8, -2.5, 3.6))
    key_light = bpy.context.active_object
    key_light.name = "Key_Light_Cyan"
    key_light.data.energy = 220.0
    key_light.data.color = (0.2, 0.85, 1.0)
    key_light.data.size = 2.5
    key_light.rotation_euler = (math.radians(45), math.radians(-20), math.radians(-40))
    
    # 2. Backlight / Rim Light (Warm Amber/Magenta Rim from behind servers)
    bpy.ops.object.light_add(type='SPOT', location=(2.5, 3.8, 3.2))
    rim_light = bpy.context.active_object
    rim_light.name = "Rim_Light_Amber"
    rim_light.data.energy = 350.0
    rim_light.data.color = (1.0, 0.45, 0.12)
    rim_light.data.spot_size = math.radians(70)
    rim_light.rotation_euler = (math.radians(-40), math.radians(25), math.radians(-140))
    
    # 3. Soft Bottom Ground Uplight (DeepMind Violet floor glow)
    bpy.ops.object.light_add(type='POINT', location=(0, -0.5, 0.2))
    ground_light = bpy.context.active_object
    ground_light.name = "Ground_Light_Violet"
    ground_light.data.energy = 80.0
    ground_light.data.color = (0.6, 0.15, 1.0)
    
    # 4. Cinematic Camera (Vertical 9:16 Portrait)
    bpy.ops.object.camera_add(location=(0, -4.6, 1.6))
    cam = bpy.context.active_object
    cam.name = "Hero_Camera"
    cam.rotation_euler = (math.radians(84), 0, 0)
    cam.data.lens = 32.0  # Wide-angle cinematic portrait lens
    cam.data.sensor_width = 36.0
    
    # Depth of Field focusing on Antigravity Agent
    agent_target = bpy.data.objects.get("Agent_Inner_Core")
    if agent_target:
        cam.data.dof.use_dof = True
        cam.data.dof.focus_object = agent_target
        cam.data.dof.aperture_fstop = 3.2
        
    bpy.context.scene.camera = cam

def setup_render_engine():
    """Configures Blender 4.3 EEVEE Next engine for vertical 1080x1920"""
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.fps = 30
    
    # Enable EEVEE Next Raytracing and Ambient Occlusion
    eevee = scene.eevee
    if hasattr(eevee, 'use_raytracing'):
        eevee.use_raytracing = True
    if hasattr(eevee, 'use_gtao'):
        eevee.use_gtao = True
    if hasattr(eevee, 'use_fast_gi'):
        eevee.use_fast_gi = True
        
    # World background: Deep space / dark server vault ambiance
    world = scene.world
    if not world:
        world = bpy.data.worlds.new("SciFi_World")
        scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.012, 0.015, 0.025, 1.0)
        bg_node.inputs['Strength'].default_value = 0.65

def setup_compositor_glare():
    """Adds sci-fi bloom & glare in Blender Compositor"""
    scene = bpy.context.scene
    scene.use_nodes = True
    tree = scene.node_tree
    
    # Clear existing compositor nodes
    tree.nodes.clear()
    
    # 1. Render Layers Node
    rl = tree.nodes.new(type="CompositorNodeRLayers")
    rl.location = (0, 0)
    
    # 2. Glare (Bloom) Node
    glare = tree.nodes.new(type="CompositorNodeGlare")
    glare.glare_type = 'FOG_GLOW'
    glare.quality = 'HIGH'
    glare.threshold = 0.8
    glare.size = 8
    glare.location = (300, 0)
    
    # 3. Composite Output Node
    comp = tree.nodes.new(type="CompositorNodeComposite")
    comp.location = (600, 0)
    
    # Link nodes: Render Layers -> Glare -> Composite
    tree.links.new(rl.outputs['Image'], glare.inputs['Image'])
    tree.links.new(glare.outputs['Image'], comp.inputs['Image'])

def main():
    print("=====================================================")
    print("🚀 BUILDING 3D HERO STAGE: ANTIGRAVITY AGENT & DATA CHAMBER")
    print("=====================================================")
    
    clear_scene()
    mats = build_materials()
    agent = build_antigravity_agent(mats)
    build_environment(mats)
    setup_lighting_and_camera()
    setup_render_engine()
    setup_compositor_glare()
    
    # Save the master .blend template
    template_dir = r"d:\New folder (2)\blender_engine\templates"
    os.makedirs(template_dir, exist_ok=True)
    blend_path = os.path.join(template_dir, "hero_stage.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"💾 Master 3D Template Saved: {blend_path}")
    
    # Render 1-frame hero proof to renders/
    render_dir = r"d:\New folder (2)\blender_engine\renders"
    os.makedirs(render_dir, exist_ok=True)
    out_img = os.path.join(render_dir, "hero_agent_test.png")
    bpy.context.scene.render.filepath = out_img
    
    print("🎬 Rendering Hero Agent Proof Frame (1080x1920)...")
    bpy.ops.render.render(write_still=True)
    print(f"✅ Render Complete! Saved to: {out_img}")

if __name__ == "__main__":
    main()
