import bpy
import math
import os

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_master_materials():
    mats = {}

    # 1. Pearlescent White Automotive Clearcoat Lacquer
    mat_white = bpy.data.materials.new(name="M_Pearlescent_White")
    mat_white.use_nodes = True
    nodes = mat_white.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.97, 0.97, 0.99, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.12
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = 0.08
        if "Clearcoat Weight" in bsdf.inputs:
            bsdf.inputs["Clearcoat Weight"].default_value = 1.0
            bsdf.inputs["Clearcoat Roughness"].default_value = 0.03
        elif "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = 1.0
            bsdf.inputs["Clearcoat Roughness"].default_value = 0.03
        if "Subsurface Weight" in bsdf.inputs:
            bsdf.inputs["Subsurface Weight"].default_value = 0.07
            bsdf.inputs["Subsurface Radius"].default_value = (0.9, 0.5, 0.3)
        elif "Subsurface" in bsdf.inputs:
            bsdf.inputs["Subsurface"].default_value = 0.07
    mats["white"] = mat_white

    # 2. Visor Specular Glass (Outer Lens)
    mat_glass = bpy.data.materials.new(name="M_Visor_Glass")
    mat_glass.use_nodes = True
    bsdf = mat_glass.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.015, 0.015, 0.02, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.025
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.25
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.25
        if "IOR" in bsdf.inputs:
            bsdf.inputs["IOR"].default_value = 1.52
    mats["visor_glass"] = mat_glass

    # 3. Visor Emissive Digital Eyes & Mouth (Vibrant Cyan)
    mat_cyan = bpy.data.materials.new(name="M_Visor_Cyan_Emission")
    mat_cyan.use_nodes = True
    bsdf = mat_cyan.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.1, 0.88, 1.0, 1.0)
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (0.12, 0.92, 1.0, 1.0)
            bsdf.inputs["Emission Strength"].default_value = 6.5
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (0.12, 0.92, 1.0, 1.0)
            bsdf.inputs["Emission Strength"].default_value = 6.5
    mats["cyan_emission"] = mat_cyan

    # 4. Royal Blue Silk Nehru Jacket PBR
    mat_jacket = bpy.data.materials.new(name="M_Royal_Blue_Silk")
    mat_jacket.use_nodes = True
    nodes = mat_jacket.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.04, 0.12, 0.45, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.42
        if "Sheen Weight" in bsdf.inputs:
            bsdf.inputs["Sheen Weight"].default_value = 0.85
            bsdf.inputs["Sheen Tint"].default_value = (0.2, 0.45, 1.0, 1.0)
        elif "Sheen" in bsdf.inputs:
            bsdf.inputs["Sheen"].default_value = 0.85
    mats["jacket"] = mat_jacket

    # 5. Antique Gold / Brass Trim & Buttons
    mat_gold = bpy.data.materials.new(name="M_Polished_Gold")
    mat_gold.use_nodes = True
    bsdf = mat_gold.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (1.0, 0.82, 0.28, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.95
        bsdf.inputs["Roughness"].default_value = 0.18
    mats["gold"] = mat_gold

    # 6. Red Silk Pocket Square
    mat_red_silk = bpy.data.materials.new(name="M_Red_Silk_Square")
    mat_red_silk.use_nodes = True
    bsdf = mat_red_silk.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.85, 0.06, 0.12, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.35
        if "Sheen Weight" in bsdf.inputs:
            bsdf.inputs["Sheen Weight"].default_value = 0.9
        elif "Sheen" in bsdf.inputs:
            bsdf.inputs["Sheen"].default_value = 0.9
    mats["red_silk"] = mat_red_silk

    # 7. Red Tilak / Teeka with Rice
    mat_tilak = bpy.data.materials.new(name="M_Red_Tilak")
    mat_tilak.use_nodes = True
    bsdf = mat_tilak.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.82, 0.04, 0.08, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.75
    mats["tilak"] = mat_tilak

    # 8. Golden Anti-Gravity Hover Glow
    mat_hover = bpy.data.materials.new(name="M_Hover_Glow")
    mat_hover.use_nodes = True
    bsdf = mat_hover.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (1.0, 0.72, 0.15, 1.0)
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (1.0, 0.75, 0.2, 1.0)
            bsdf.inputs["Emission Strength"].default_value = 9.0
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (1.0, 0.75, 0.2, 1.0)
            bsdf.inputs["Emission Strength"].default_value = 9.0
    mats["hover"] = mat_hover

    # 9. Fluted Cutting Chai Glass & Tea Liquid
    mat_chai_glass = bpy.data.materials.new(name="M_Chai_Glass")
    mat_chai_glass.use_nodes = True
    bsdf = mat_chai_glass.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.92, 0.95, 0.95, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.08
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.88
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.88
        if "IOR" in bsdf.inputs:
            bsdf.inputs["IOR"].default_value = 1.51
    mats["chai_glass"] = mat_chai_glass

    mat_tea = bpy.data.materials.new(name="M_Chai_Liquid")
    mat_tea.use_nodes = True
    bsdf = mat_tea.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.68, 0.42, 0.22, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.1
    mats["chai_liquid"] = mat_tea

    # 10. Warm Teak / Mahogany Desk Surface
    mat_desk = bpy.data.materials.new(name="M_Warm_Teak_Desk")
    mat_desk.use_nodes = True
    bsdf = mat_desk.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.24, 0.14, 0.09, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.32
    mats["desk"] = mat_desk

    return mats

def build_ai_puttar_master(mats):
    # =========================================================================
    # 1. HEAD & VISOR ASSEMBLY
    # =========================================================================
    # Pearlescent Cranial Shell
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=0.42, location=(0, 0, 1.42))
    head = bpy.context.active_object
    head.name = "AI_Puttar_Head_Shell"
    head.scale = (0.96, 0.92, 1.02)
    bpy.ops.object.transform_apply(scale=True)
    head.data.materials.append(mats["white"])
    bpy.ops.object.shade_smooth()

    # Curved Specular OLED Visor Screen (Recessed in front)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=0.39, location=(0, -0.065, 1.42))
    visor = bpy.context.active_object
    visor.name = "AI_Puttar_OLED_Visor"
    visor.scale = (0.92, 0.78, 0.72)
    bpy.ops.object.transform_apply(scale=True)
    visor.data.materials.append(mats["visor_glass"])
    bpy.ops.object.shade_smooth()

    # Digital Cyan Eyes (The Skeptical Bhuvan Bam Side-Glance)
    # Left Eye: Sharp judging slit, slightly narrowed
    bpy.ops.mesh.primitive_cylinder_add(radius=0.075, depth=0.015, location=(-0.12, -0.41, 1.44))
    eye_l = bpy.context.active_object
    eye_l.name = "Eye_Digital_L"
    eye_l.rotation_euler = (math.radians(90), 0, math.radians(6))
    eye_l.scale = (1.15, 0.52, 1.0) # Sarcastic judging slit
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    eye_l.data.materials.append(mats["cyan_emission"])
    bpy.ops.object.shade_smooth()

    # Left Eyebrow (Arched flat)
    bpy.ops.mesh.primitive_cube_add(size=0.012, location=(-0.12, -0.415, 1.53))
    brow_l = bpy.context.active_object
    brow_l.scale = (6.0, 0.5, 0.5)
    brow_l.rotation_euler = (0, 0, math.radians(4))
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    brow_l.data.materials.append(mats["cyan_emission"])

    # Right Eye: Arched higher, intensely judging
    bpy.ops.mesh.primitive_cylinder_add(radius=0.075, depth=0.015, location=(0.12, -0.41, 1.46))
    eye_r = bpy.context.active_object
    eye_r.name = "Eye_Digital_R"
    eye_r.rotation_euler = (math.radians(90), 0, math.radians(-10))
    eye_r.scale = (1.1, 0.72, 1.0) # Open, mocking curve
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    eye_r.data.materials.append(mats["cyan_emission"])
    bpy.ops.object.shade_smooth()

    # Right Eyebrow (The Signature Raised Brow Arch!)
    bpy.ops.mesh.primitive_cube_add(size=0.012, location=(0.12, -0.415, 1.57))
    brow_r = bpy.context.active_object
    brow_r.scale = (6.2, 0.5, 0.5)
    brow_r.rotation_euler = (0, 0, math.radians(-14)) # Arched high in skepticism
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    brow_r.data.materials.append(mats["cyan_emission"])

    # Witty Crooked Mouth Waveform
    bpy.ops.mesh.primitive_cube_add(size=0.014, location=(0.02, -0.415, 1.30))
    mouth = bpy.context.active_object
    mouth.name = "Digital_Mouth"
    mouth.scale = (5.8, 0.4, 0.35)
    mouth.rotation_euler = (0, 0, math.radians(-7)) # Classic Desi smirk
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    mouth.data.materials.append(mats["cyan_emission"])

    # Red Tilak / Teeka (Sindoor with Rice Grains)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.042, depth=0.01, location=(0, -0.40, 1.68))
    tilak = bpy.context.active_object
    tilak.name = "Red_Vermilion_Tilak"
    tilak.rotation_euler = (math.radians(80), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)
    tilak.data.materials.append(mats["tilak"])
    bpy.ops.object.shade_smooth()

    # Rice Grains on Tilak (Modeled 3D Details)
    for i, (rx, rz, rang) in enumerate([(0.006, 1.685, 20), (-0.008, 1.678, -35)]):
        bpy.ops.mesh.primitive_cube_add(size=0.007, location=(rx, -0.408, rz))
        rice = bpy.context.active_object
        rice.name = f"Tilak_Rice_{i}"
        rice.scale = (0.6, 1.6, 0.6)
        rice.rotation_euler = (0, 0, math.radians(rang))
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        rice.data.materials.append(mats["white"])

    # Twin Golden Spring Antennas with Glowing Orb Tips
    for side, sign in [("L", -1), ("R", 1)]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.013, depth=0.25, location=(sign * 0.18, 0.14, 1.88))
        ant = bpy.context.active_object
        ant.name = f"Antenna_Stem_{side}"
        ant.rotation_euler = (math.radians(-16), sign * math.radians(28), 0)
        bpy.ops.object.transform_apply(rotation=True)
        ant.data.materials.append(mats["gold"])
        bpy.ops.object.shade_smooth()

        # Glowing Orb Tip
        tip_x = sign * 0.24
        tip_z = 2.01
        tip_y = 0.18
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.038, location=(tip_x, tip_y, tip_z))
        tip = bpy.context.active_object
        tip.name = f"Antenna_Orb_{side}"
        tip.data.materials.append(mats["hover"])
        bpy.ops.object.shade_smooth()

    # Magnetic Neck Ring (Decoupled Gap)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.24, minor_radius=0.022, location=(0, 0, 1.05))
    neck = bpy.context.active_object
    neck.name = "Neck_Gold_Ring"
    neck.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()

    # =========================================================================
    # 2. TORSO & ROYAL BLUE SILK NEHRU JACKET
    # =========================================================================
    # White Torso Core (Capsule)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=0.45, location=(0, 0, 0.65))
    torso = bpy.context.active_object
    torso.name = "Torso_Core"
    torso.scale = (0.86, 0.80, 1.18)
    bpy.ops.object.transform_apply(scale=True)
    torso.data.materials.append(mats["white"])
    bpy.ops.object.shade_smooth()

    # Tailored Royal Blue Silk Nehru Jacket (Sleeveless Waistcoat)
    # Modeled fitted slightly over the torso capsule
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=0.465, location=(0, -0.01, 0.65))
    jacket = bpy.context.active_object
    jacket.name = "Nehru_Jacket_Silk"
    jacket.scale = (0.88, 0.82, 1.12)
    bpy.ops.object.transform_apply(scale=True)
    jacket.data.materials.append(mats["jacket"])
    bpy.ops.object.shade_smooth()

    # Mandarin Collar (Gold-embroidered standing collar around neck)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.28, minor_radius=0.032, location=(0, 0, 1.01))
    collar = bpy.context.active_object
    collar.name = "Jacket_Mandarin_Collar"
    collar.scale = (0.86, 0.80, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    collar.data.materials.append(mats["jacket"])
    bpy.ops.object.shade_smooth()

    # Gold Zari Piping around Collar Edge
    bpy.ops.mesh.primitive_torus_add(major_radius=0.29, minor_radius=0.008, location=(0, 0, 1.04))
    collar_gold = bpy.context.active_object
    collar_gold.name = "Collar_Zari_Piping"
    collar_gold.scale = (0.86, 0.80, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    collar_gold.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()

    # Front Placket (Center button seam strip)
    bpy.ops.mesh.primitive_cube_add(size=0.02, location=(0, -0.385, 0.64))
    placket = bpy.context.active_object
    placket.name = "Jacket_Front_Placket"
    placket.scale = (2.2, 0.3, 26.0)
    bpy.ops.object.transform_apply(scale=True)
    placket.data.materials.append(mats["jacket"])

    # 5 Engraved Brass Buttons
    for b_idx in range(5):
        bz = 0.88 - (b_idx * 0.12)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.022, depth=0.012, location=(0, -0.395, bz))
        btn = bpy.context.active_object
        btn.name = f"Brass_Button_{b_idx + 1}"
        btn.rotation_euler = (math.radians(88), 0, 0)
        bpy.ops.object.transform_apply(rotation=True)
        btn.data.materials.append(mats["gold"])
        bpy.ops.object.shade_smooth()

    # Left Breast Pocket with Red Silk Handkerchief (Pocket Square)
    bpy.ops.mesh.primitive_cube_add(size=0.01, location=(-0.18, -0.36, 0.78))
    pocket = bpy.context.active_object
    pocket.name = "Jacket_Breast_Pocket"
    pocket.scale = (8.0, 0.4, 1.5)
    bpy.ops.object.transform_apply(scale=True)
    pocket.data.materials.append(mats["jacket"])

    # Red Silk Kerchief Point Peeking Out
    bpy.ops.mesh.primitive_cone_add(radius1=0.035, depth=0.05, location=(-0.18, -0.365, 0.81))
    kerchief = bpy.context.active_object
    kerchief.name = "Red_Silk_Pocket_Square"
    kerchief.rotation_euler = (0, math.radians(15), math.radians(-10))
    bpy.ops.object.transform_apply(rotation=True)
    kerchief.data.materials.append(mats["red_silk"])
    bpy.ops.object.shade_smooth()

    # Gold Hem Trim along the bottom of the jacket
    bpy.ops.mesh.primitive_torus_add(major_radius=0.37, minor_radius=0.012, location=(0, 0, 0.28))
    hem = bpy.context.active_object
    hem.name = "Jacket_Gold_Hem_Trim"
    hem.scale = (0.88, 0.82, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    hem.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()

    # =========================================================================
    # 3. HOVER THRUSTER & ANTI-GRAVITY LIGHT
    # =========================================================================
    bpy.ops.mesh.primitive_cylinder_add(radius=0.24, depth=0.08, location=(0, 0, 0.20))
    thruster = bpy.context.active_object
    thruster.name = "Hover_Thruster_Engine"
    thruster.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()

    # Concentric Golden Glow Ring (Real Emissive Engine)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.26, minor_radius=0.035, location=(0, 0, 0.16))
    glow_ring = bpy.context.active_object
    glow_ring.name = "Hover_AntiGrav_Glow_Ring"
    glow_ring.data.materials.append(mats["hover"])
    bpy.ops.object.shade_smooth()

    # Downward Point Light under Hover Ring (Casting warm pool of light onto desk)
    hover_light = bpy.data.lights.new(name="Hover_Pool_Light", type="POINT")
    hover_light.energy = 85
    hover_light.color = (1.0, 0.75, 0.2)
    hover_light.shadow_soft_size = 0.15
    hover_light_obj = bpy.data.objects.new("Hover_Pool_Light", hover_light)
    bpy.context.collection.objects.link(hover_light_obj)
    hover_light_obj.location = (0, 0, 0.08)

    # =========================================================================
    # 4. FLOATING MAGNETIC HANDS & CUTTING CHAI GLASS
    # =========================================================================
    # Left Floating Hand (Slightly relaxed, hovering beside waist)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.095, location=(-0.52, -0.06, 0.62))
    hand_l = bpy.context.active_object
    hand_l.name = "Floating_Hand_L"
    hand_l.scale = (0.72, 1.12, 0.82)
    bpy.ops.object.transform_apply(scale=True)
    hand_l.data.materials.append(mats["white"])
    bpy.ops.object.shade_smooth()

    # Left Wrist Gold Band
    bpy.ops.mesh.primitive_torus_add(major_radius=0.075, minor_radius=0.012, location=(-0.52, -0.02, 0.62))
    wrist_l = bpy.context.active_object
    wrist_l.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)
    wrist_l.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()

    # Right Floating Hand (Holding Cutting Chai Glass!)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.095, location=(0.48, -0.22, 0.68))
    hand_r = bpy.context.active_object
    hand_r.name = "Floating_Hand_R"
    hand_r.scale = (0.72, 1.12, 0.82)
    hand_r.rotation_euler = (math.radians(25), math.radians(-15), math.radians(40))
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    hand_r.data.materials.append(mats["white"])
    bpy.ops.object.shade_smooth()

    # Right Wrist Kalawa / Sacred Thread (Red & Gold)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.075, minor_radius=0.012, location=(0.48, -0.18, 0.68))
    wrist_r = bpy.context.active_object
    wrist_r.rotation_euler = (math.radians(90), 0, math.radians(35))
    bpy.ops.object.transform_apply(rotation=True)
    wrist_r.data.materials.append(mats["tilak"]) # Red thread
    bpy.ops.object.shade_smooth()

    # Fluted Cutting Chai Glass
    glass_loc = (0.54, -0.32, 0.68)
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.055, depth=0.12, location=glass_loc)
    chai_glass = bpy.context.active_object
    chai_glass.name = "Cutting_Chai_Glass"
    chai_glass.data.materials.append(mats["chai_glass"])
    bpy.ops.object.shade_smooth()

    # Steaming Amber Tea Liquid inside Glass
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.05, depth=0.09, location=(0.54, -0.32, 0.67))
    chai_tea = bpy.context.active_object
    chai_tea.name = "Cutting_Chai_Tea_Liquid"
    chai_tea.data.materials.append(mats["chai_liquid"])
    bpy.ops.object.shade_smooth()

    # =========================================================================
    # 5. DESK ENVIRONMENT & STUDIO LIGHTING RIG
    # =========================================================================
    # Warm Teak Desk Surface
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.2, -0.04))
    desk = bpy.context.active_object
    desk.name = "Teak_Desk_Surface"
    desk.scale = (3.2, 2.5, 0.08)
    bpy.ops.object.transform_apply(scale=True)
    desk.data.materials.append(mats["desk"])
    bpy.ops.object.shade_smooth()

    # Soft Background Studio Wall (Slate Indigo)
    mat_wall = bpy.data.materials.new(name="M_Slate_Indigo_Wall")
    mat_wall.use_nodes = True
    bsdf = mat_wall.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.05, 0.07, 0.12, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.8
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 2.2, 1.5))
    wall = bpy.context.active_object
    wall.name = "Background_Wall"
    wall.scale = (6.0, 0.1, 4.0)
    bpy.ops.object.transform_apply(scale=True)
    wall.data.materials.append(mat_wall)

    # -------------------------------------------------------------------------
    # CINEMATIC 3-POINT STUDIO LIGHTING
    # -------------------------------------------------------------------------
    # 1. Warm Soft Key Light (Front Right, 45 deg)
    key_light = bpy.data.lights.new(name="Studio_Key_Light", type="AREA")
    key_light.energy = 520
    key_light.color = (1.0, 0.94, 0.86)
    key_light.size = 1.4
    key_obj = bpy.data.objects.new("Studio_Key_Light", key_light)
    bpy.context.collection.objects.link(key_obj)
    key_obj.location = (1.4, -2.1, 2.3)
    key_obj.rotation_euler = (math.radians(50), math.radians(8), math.radians(32))

    # 2. Cool Soft Fill Light (Front Left)
    fill_light = bpy.data.lights.new(name="Studio_Fill_Light", type="AREA")
    fill_light.energy = 180
    fill_light.color = (0.84, 0.92, 1.0)
    fill_light.size = 1.8
    fill_obj = bpy.data.objects.new("Studio_Fill_Light", fill_light)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.location = (-1.8, -1.6, 1.5)
    fill_obj.rotation_euler = (math.radians(58), math.radians(-10), math.radians(-48))

    # 3. High-Intensity Golden Rim Light (High Rear, creates iconic silhouette rim)
    rim_light = bpy.data.lights.new(name="Studio_Rim_Light", type="AREA")
    rim_light.energy = 850
    rim_light.color = (1.0, 0.80, 0.35)
    rim_light.size = 1.2
    rim_obj = bpy.data.objects.new("Studio_Rim_Light", rim_light)
    bpy.context.collection.objects.link(rim_obj)
    rim_obj.location = (-0.3, 1.8, 2.5)
    rim_obj.rotation_euler = (math.radians(-42), 0, math.radians(170))

    # 4. Kicker Light (Low Front Bounce)
    kicker_light = bpy.data.lights.new(name="Studio_Kicker_Light", type="POINT")
    kicker_light.energy = 90
    kicker_light.color = (1.0, 0.92, 0.82)
    kicker_obj = bpy.data.objects.new("Studio_Kicker_Light", kicker_light)
    bpy.context.collection.objects.link(kicker_obj)
    kicker_obj.location = (0, -1.2, 0.45)

    # -------------------------------------------------------------------------
    # CINEMATIC CAMERA (65mm Portrait, Soft Depth of Field)
    # -------------------------------------------------------------------------
    cam = bpy.data.cameras.new("Master_Hero_Camera")
    cam.lens = 65
    cam.dof.use_dof = True
    cam.dof.focus_object = head
    cam.dof.aperture_fstop = 2.4 # Cinematic soft bokeh background

    cam_obj = bpy.data.objects.new("Master_Hero_Camera", cam)
    bpy.context.collection.objects.link(cam_obj)
    cam_obj.location = (0.32, -2.25, 1.18)
    cam_obj.rotation_euler = (math.radians(82.5), 0, math.radians(8.5))
    bpy.context.scene.camera = cam_obj

def render_master_scene(output_png, blend_file):
    scene = bpy.context.scene
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1350
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = output_png

    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderEngine') else 'BLENDER_EEVEE'

    print(f"\n🎬 Rendering Master 'AI Puttar' 3D Portrait to: {output_png}...")
    bpy.ops.render.render(write_still=True)
    print("✅ High-fidelity 3D render complete!")

    print(f"\n💾 Saving Master 3D Asset File to: {blend_file}...")
    bpy.ops.wm.save_as_mainfile(filepath=blend_file)
    print("✅ Master Blender asset file saved successfully!\n")

def main():
    print("===================================================================")
    print("🚀 BUILDING MASTER 'AI PUTTAR' 3D ASSET IN BLENDER 4.3")
    print("   (Nehru Jacket, OLED Eyes, Tilak, Cutting Chai, Golden Hover Ring)")
    print("===================================================================\n")
    
    reset_scene()
    mats = create_master_materials()
    build_ai_puttar_master(mats)

    out_dir = os.path.abspath("scratch/ai_puttar_preview")
    os.makedirs(out_dir, exist_ok=True)
    output_png = os.path.join(out_dir, "ai_puttar_master_render.png")
    blend_file = os.path.abspath("blender_engine/assets/desi_library/ai_puttar_master.blend")
    os.makedirs(os.path.dirname(blend_file), exist_ok=True)

    render_master_scene(output_png, blend_file)

if __name__ == "__main__":
    main()
