"""
Modular 3D Metaphor Props Library for Blender EEVEE Next
Procedurally generates high-tech physical metaphor props:
1. Quantum Microchip (Silicon Wafer with Gold Circuits & Glowing Core)
2. Nuclear Cooling Tower (Hyperboloid Monolith with Steam Exhaust)
3. Subsea Armored Fiber Cable (Coiled Braided Conduit with Optical Core)
4. Satellite Dish Array (Orbital Receiver with Data Needle)
5. Secure Server Vault (Titanium Data Safe with Biometric Glow)
"""

import bpy
import math

def set_smooth(obj):
    if obj and obj.type == 'MESH':
        for p in obj.data.polygons:
            p.use_smooth = True

def spawn_quantum_microchip(mats, location=(0, 0, 1.2), scale=(1.2, 1.2, 1.2)):
    """Spawns an oversized floating high-tech silicon wafer trophy"""
    root = bpy.data.objects.new("Prop_Quantum_Microchip", None)
    root.location = location
    root.scale = scale
    bpy.context.collection.objects.link(root)
    
    # Silicon Substrate Base
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
    base = bpy.context.active_object
    base.scale = (0.9, 0.9, 0.04)
    base.name = "Chip_Base"
    base.parent = root
    base.data.materials.append(mats['chassis'])
    set_smooth(base)
    
    # Gold Border Frame
    bpy.ops.mesh.primitive_torus_add(major_radius=0.62, minor_radius=0.03, major_segments=4, minor_segments=16, location=(0, 0, 0.02), rotation=(0, 0, math.radians(45)))
    border = bpy.context.active_object
    border.name = "Chip_Gold_Border"
    border.parent = root
    border.data.materials.append(mats['solar_gold'])
    set_smooth(border)
    
    # Glowing Quantum Silicon Core (Center Die)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.035))
    die = bpy.context.active_object
    die.scale = (0.42, 0.42, 0.03)
    die.name = "Chip_Die"
    die.parent = root
    die.data.materials.append(mats['orb_blue'])
    set_smooth(die)
    
    # Circuitry Pin Arrays (4 sides)
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

def spawn_cooling_tower(mats, location=(0, 1.2, 0), scale=(1.0, 1.0, 1.0)):
    """Spawns an industrial hyperboloid cooling tower monolith"""
    root = bpy.data.objects.new("Prop_Cooling_Tower", None)
    root.location = location
    root.scale = scale
    bpy.context.collection.objects.link(root)
    
    # Base Cylinder
    bpy.ops.mesh.primitive_cylinder_add(radius=1.1, depth=0.8, vertices=32, location=(0, 0, 0.4))
    base = bpy.context.active_object
    base.name = "Tower_Base"
    base.parent = root
    base.data.materials.append(mats['chassis'])
    set_smooth(base)
    
    # Hyperbolic Neck
    bpy.ops.mesh.primitive_cylinder_add(radius=0.75, depth=1.4, vertices=32, location=(0, 0, 1.4))
    neck = bpy.context.active_object
    neck.name = "Tower_Neck"
    neck.parent = root
    neck.data.materials.append(mats['chassis'])
    set_smooth(neck)
    
    # Top Exhaust Flare
    bpy.ops.mesh.primitive_cone_add(radius1=0.75, radius2=0.95, depth=0.6, vertices=32, location=(0, 0, 2.3))
    flare = bpy.context.active_object
    flare.name = "Tower_Flare"
    flare.parent = root
    flare.data.materials.append(mats['chassis'])
    set_smooth(flare)
    
    # Glowing Core Steam Rim (#FC413D / #FBBC04)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.92, minor_radius=0.04, major_segments=32, minor_segments=16, location=(0, 0, 2.6))
    rim = bpy.context.active_object
    rim.name = "Tower_Rim"
    rim.parent = root
    rim.data.materials.append(mats['orb_red'])
    set_smooth(rim)
    
    return root

def spawn_undersea_cable(mats, location=(0, 0, 0.4), scale=(1.0, 1.0, 1.0)):
    """Spawns an armored subsea telecommunications cable with exposed optical glass core"""
    root = bpy.data.objects.new("Prop_Undersea_Cable", None)
    root.location = location
    root.scale = scale
    bpy.context.collection.objects.link(root)
    
    # Heavy Outer Braided Steel Sheath (Segmented Rings)
    num_rings = 14
    for i in range(num_rings):
        y_pos = -2.0 + (i * 0.32)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=0.28, vertices=28, location=(0, y_pos, 0), rotation=(math.radians(90), 0, 0))
        seg = bpy.context.active_object
        seg.name = f"Cable_Armor_{i}"
        seg.parent = root
        seg.data.materials.append(mats['chassis'])
        set_smooth(seg)
        
    # Exposed Glowing Optical Core running through center
    bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=5.0, vertices=24, location=(0, 0, 0), rotation=(math.radians(90), 0, 0))
    core = bpy.context.active_object
    core.name = "Cable_Optical_Core"
    core.parent = root
    core.data.materials.append(mats['orb_blue'])
    set_smooth(core)
    
    return root

def spawn_hologram_projection_beam(mats, start_pos=(0, -0.63, 1.0), end_pos=(0, 1.0, 1.2)):
    """Spawns an emissive holographic scanner beam connecting Popapus to the prop"""
    root = bpy.data.objects.new("Holo_Beam_Root", None)
    bpy.context.collection.objects.link(root)
    
    # Vector math for conical beam
    dx = end_pos[0] - start_pos[0]
    dy = end_pos[1] - start_pos[1]
    dz = end_pos[2] - start_pos[2]
    dist = math.sqrt(dx*dx + dy*dy + dz*dz)
    
    mid_x = (start_pos[0] + end_pos[0]) / 2
    mid_y = (start_pos[1] + end_pos[1]) / 2
    mid_z = (start_pos[2] + end_pos[2]) / 2
    
    bpy.ops.mesh.primitive_cone_add(radius1=0.04, radius2=0.45, depth=dist, vertices=24, location=(mid_x, mid_y, mid_z))
    cone = bpy.context.active_object
    cone.name = "Holo_Beam_Cone"
    cone.parent = root
    
    # Align cone with beam axis
    phi = math.atan2(dy, dx)
    theta = math.acos(dz / dist) if dist > 0 else 0
    cone.rotation_euler = (theta, 0, phi - math.radians(90))
    
    cone.data.materials.append(mats['hover_ring'])
    set_smooth(cone)
    
    return root

