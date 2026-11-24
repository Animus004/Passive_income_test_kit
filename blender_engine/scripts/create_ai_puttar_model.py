import bpy
import math
import os

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_materials():
    mats = {}

    # 1. Pearlescent White Lacquer (Chassis)
    mat_white = bpy.data.materials.new(name="Pearlescent_White")
    mat_white.use_nodes = True
    nodes = mat_white.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.96, 0.96, 0.98, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.15
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = 0.05
        if "Subsurface Weight" in bsdf.inputs:
            bsdf.inputs["Subsurface Weight"].default_value = 0.08
            bsdf.inputs["Subsurface Radius"].default_value = (0.8, 0.4, 0.2)
        elif "Subsurface" in bsdf.inputs:
            bsdf.inputs["Subsurface"].default_value = 0.08
    mats["white"] = mat_white

    # 2. Visor Specular Dark Glass
    mat_visor = bpy.data.materials.new(name="Visor_Dark_Glass")
    mat_visor.use_nodes = True
    nodes = mat_visor.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.02, 0.02, 0.03, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.04
        if "IOR" in bsdf.inputs:
            bsdf.inputs["IOR"].default_value = 1.52
    mats["visor"] = mat_visor

    # 3. Cyan Digital Eye Emission
    mat_cyan_eye = bpy.data.materials.new(name="Cyan_Eye_Emission")
    mat_cyan_eye.use_nodes = True
    nodes = mat_cyan_eye.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.1, 0.85, 1.0, 1.0)
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (0.15, 0.9, 1.0, 1.0)
            bsdf.inputs["Emission Strength"].default_value = 5.0
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (0.15, 0.9, 1.0, 1.0)
            bsdf.inputs["Emission Strength"].default_value = 5.0
    mats["cyan_eye"] = mat_cyan_eye

    # 4. Golden Metallic Trim
    mat_gold = bpy.data.materials.new(name="Gold_Trim")
    mat_gold.use_nodes = True
    nodes = mat_gold.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (1.0, 0.78, 0.22, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.92
        bsdf.inputs["Roughness"].default_value = 0.2
    mats["gold"] = mat_gold

    # 5. Red Tilak (Sindoor / Chandan)
    mat_tilak = bpy.data.materials.new(name="Red_Tilak")
    mat_tilak.use_nodes = True
    nodes = mat_tilak.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.85, 0.05, 0.08, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.65
    mats["tilak"] = mat_tilak

    # 6. Golden Anti-Gravity Hover Glow
    mat_hover = bpy.data.materials.new(name="Hover_Glow")
    mat_hover.use_nodes = True
    nodes = mat_hover.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (1.0, 0.7, 0.1, 1.0)
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (1.0, 0.75, 0.15, 1.0)
            bsdf.inputs["Emission Strength"].default_value = 8.0
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (1.0, 0.75, 0.15, 1.0)
            bsdf.inputs["Emission Strength"].default_value = 8.0
    mats["hover"] = mat_hover

    # 7. Black Rubber Pads (Finger Tips)
    mat_rubber = bpy.data.materials.new(name="Black_Silicone")
    mat_rubber.use_nodes = True
    nodes = mat_rubber.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.05, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.45
    mats["rubber"] = mat_rubber

    return mats

def build_character(mats):
    # Head Capsule
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.38, location=(0, 0, 1.35))
    head = bpy.context.active_object
    head.name = "Head_Shell"
    head.scale = (0.95, 0.9, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    head.data.materials.append(mats["white"])
    bpy.ops.object.shade_smooth()

    # Curved OLED Visor Screen (Slightly recessed in front of head)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.35, location=(0, -0.06, 1.35))
    visor = bpy.context.active_object
    visor.name = "Curved_OLED_Visor"
    visor.scale = (0.9, 0.75, 0.7)
    bpy.ops.object.transform_apply(scale=True)
    visor.data.materials.append(mats["visor"])
    bpy.ops.object.shade_smooth()

    # Digital Cyan Eyes (Expressive Judging Slit Eye Shapes)
    # Left Eye
    bpy.ops.mesh.primitive_cylinder_add(radius=0.065, depth=0.02, location=(-0.11, -0.36, 1.37))
    eye_l = bpy.context.active_object
    eye_l.name = "Eye_Digital_L"
    eye_l.rotation_euler = (math.radians(90), 0, 0)
    eye_l.scale = (1.1, 0.55, 1.0) # Sarcastic judging slit shape
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    eye_l.data.materials.append(mats["cyan_eye"])
    bpy.ops.object.shade_smooth()

    # Right Eye (Slightly arched higher for skeptical BB-style look)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.065, depth=0.02, location=(0.11, -0.36, 1.39))
    eye_r = bpy.context.active_object
    eye_r.name = "Eye_Digital_R"
    eye_r.rotation_euler = (math.radians(90), 0, math.radians(-8))
    eye_r.scale = (1.1, 0.7, 1.0) # Arched slightly more open
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    eye_r.data.materials.append(mats["cyan_eye"])
    bpy.ops.object.shade_smooth()

    # Sarcastic Digital Mouth Waveform
    bpy.ops.mesh.primitive_cube_add(size=0.015, location=(0, -0.365, 1.25))
    mouth = bpy.context.active_object
    mouth.name = "Digital_Mouth"
    mouth.scale = (5.5, 0.5, 0.4)
    mouth.rotation_euler = (0, 0, math.radians(-5)) # Slight crooked smirk
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    mouth.data.materials.append(mats["cyan_eye"])

    # Red Tilak (Sindoor Decal on Forehead)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.038, depth=0.01, location=(0, -0.36, 1.58))
    tilak = bpy.context.active_object
    tilak.name = "Red_Tilak_Teeka"
    tilak.rotation_euler = (math.radians(82), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)
    tilak.data.materials.append(mats["tilak"])
    bpy.ops.object.shade_smooth()

    # Small Rice Grain on Tilak
    bpy.ops.mesh.primitive_cube_add(size=0.008, location=(0.005, -0.368, 1.585))
    rice = bpy.context.active_object
    rice.name = "Tilak_Rice_Grain"
    rice.scale = (0.5, 1.5, 0.5)
    rice.rotation_euler = (0, 0, math.radians(25))
    rice.data.materials.append(mats["white"])

    # Twin Antennas (Left & Right)
    for side, sign in [("L", -1), ("R", 1)]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=0.22, location=(sign * 0.16, 0.12, 1.76))
        ant = bpy.context.active_object
        ant.name = f"Antenna_Stem_{side}"
        ant.rotation_euler = (math.radians(-18), sign * math.radians(26), 0)
        bpy.ops.object.transform_apply(rotation=True)
        ant.data.materials.append(mats["gold"])
        bpy.ops.object.shade_smooth()

        # Antenna Glowing Orb Tip
        tip_x = sign * 0.21
        tip_z = 1.88
        tip_y = 0.16
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.032, location=(tip_x, tip_y, tip_z))
        tip = bpy.context.active_object
        tip.name = f"Antenna_Tip_Glow_{side}"
        tip.data.materials.append(mats["hover"])
        bpy.ops.object.shade_smooth()

    # Gold Trim Ring Under Head (Magnetic Joint Ring)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.22, minor_radius=0.02, location=(0, 0, 1.02))
    neck_ring = bpy.context.active_object
    neck_ring.name = "Neck_Magnetic_Ring"
    neck_ring.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()

    # Torso Core (Egg / Pod Body)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.42, location=(0, 0, 0.65))
    torso = bpy.context.active_object
    torso.name = "Torso_Core"
    torso.scale = (0.85, 0.78, 1.15) # Tapered vertical egg pod
    bpy.ops.object.transform_apply(scale=True)
    torso.data.materials.append(mats["white"])
    bpy.ops.object.shade_smooth()

    # Gold Accent Waist Seam
    bpy.ops.mesh.primitive_torus_add(major_radius=0.36, minor_radius=0.015, location=(0, 0, 0.62))
    waist_ring = bpy.context.active_object
    waist_ring.name = "Waist_Trim_Ring"
    waist_ring.scale = (0.85, 0.78, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    waist_ring.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()

    # Hover Thruster Engine at Base
    bpy.ops.mesh.primitive_cylinder_add(radius=0.22, depth=0.08, location=(0, 0, 0.22))
    thruster = bpy.context.active_object
    thruster.name = "Hover_Thruster_Port"
    thruster.data.materials.append(mats["gold"])
    bpy.ops.object.shade_smooth()

    # Glowing Anti-Gravity Hover Ring
    bpy.ops.mesh.primitive_torus_add(major_radius=0.24, minor_radius=0.03, location=(0, 0, 0.18))
    glow_ring = bpy.context.active_object
    glow_ring.name = "Hover_Glow_Ring"
    glow_ring.data.materials.append(mats["hover"])
    bpy.ops.object.shade_smooth()

    # Floating Magnetic Hands (Left and Right)
    for side, sign in [("L", -1), ("R", 1)]:
        hand_x = sign * 0.46
        hand_y = -0.05
        hand_z = 0.62
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, location=(hand_x, hand_y, hand_z))
        hand = bpy.context.active_object
        hand.name = f"Floating_Hand_{side}"
        hand.scale = (0.7, 1.1, 0.8)
        bpy.ops.object.transform_apply(scale=True)
        hand.data.materials.append(mats["white"])
        bpy.ops.object.shade_smooth()

        # Wrist Gold Band
        bpy.ops.mesh.primitive_torus_add(major_radius=0.07, minor_radius=0.01, location=(hand_x, hand_y + 0.04, hand_z))
        wrist = bpy.context.active_object
        wrist.name = f"Wrist_Ring_{side}"
        wrist.rotation_euler = (math.radians(90), 0, 0)
        bpy.ops.object.transform_apply(rotation=True)
        wrist.data.materials.append(mats["gold"])
        bpy.ops.object.shade_smooth()

    # Desk Surface (Grounding Floor Environment)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, -0.05))
    desk = bpy.context.active_object
    desk.name = "Desk_Surface"
    desk.scale = (2.5, 2.0, 0.08)
    bpy.ops.object.transform_apply(scale=True)
    mat_desk = bpy.data.materials.new(name="Warm_Wood_Desk")
    mat_desk.use_nodes = True
    bsdf = mat_desk.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.28, 0.18, 0.12, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.35
    desk.data.materials.append(mat_desk)
    bpy.ops.object.shade_smooth()

def setup_lighting_and_camera():
    # 3-Point Studio Lighting

    # Key Light (Warm, high-intensity from 45 deg front-right)
    key_light = bpy.data.lights.new(name="Studio_Key_Light", type="AREA")
    key_light.energy = 450
    key_light.color = (1.0, 0.94, 0.85)
    key_light.size = 1.2
    key_obj = bpy.data.objects.new("Studio_Key_Light", key_light)
    bpy.context.collection.objects.link(key_obj)
    key_obj.location = (1.2, -1.8, 2.2)
    key_obj.rotation_euler = (math.radians(52), math.radians(8), math.radians(30))

    # Fill Light (Cool, soft from front-left)
    fill_light = bpy.data.lights.new(name="Studio_Fill_Light", type="AREA")
    fill_light.energy = 160
    fill_light.color = (0.85, 0.92, 1.0)
    fill_light.size = 1.5
    fill_obj = bpy.data.objects.new("Studio_Fill_Light", fill_light)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.location = (-1.6, -1.4, 1.4)
    fill_obj.rotation_euler = (math.radians(60), math.radians(-10), math.radians(-45))

    # Rim / Hair Light (Golden, high-intensity from high rear)
    rim_light = bpy.data.lights.new(name="Studio_Rim_Light", type="AREA")
    rim_light.energy = 600
    rim_light.color = (1.0, 0.82, 0.35)
    rim_light.size = 1.0
    rim_obj = bpy.data.objects.new("Studio_Rim_Light", rim_light)
    bpy.context.collection.objects.link(rim_obj)
    rim_obj.location = (0, 1.6, 2.4)
    rim_obj.rotation_euler = (math.radians(-45), 0, math.radians(180))

    # Camera Setup (Hero 3/4 Eye-Level View)
    cam = bpy.data.cameras.new("Hero_Camera")
    cam.lens = 65 # Flattering portrait focal length
    cam_obj = bpy.data.objects.new("Hero_Camera", cam)
    bpy.context.collection.objects.link(cam_obj)
    cam_obj.location = (0.28, -2.1, 1.15)
    cam_obj.rotation_euler = (math.radians(82), math.radians(0), math.radians(8))
    bpy.context.scene.camera = cam_obj

def render_preview(output_path, blend_path):
    scene = bpy.context.scene
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1350 # Instagram / 4:5 high-detail portrait frame
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = output_path

    # Use EEVEE
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderEngine') else 'BLENDER_EEVEE'

    print(f"🎬 Rendering high-fidelity preview to: {output_path}...")
    bpy.ops.render.render(write_still=True)
    print("✅ Render complete!")

    print(f"💾 Saving master Blender file to: {blend_path}...")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print("✅ Blender file saved successfully!")

def main():
    print("=====================================================")
    print("🤖 MODELING 'AI PUTTAR' BASE RIG IN BLENDER 4.3")
    print("=====================================================")
    reset_scene()
    mats = create_materials()
    build_character(mats)
    setup_lighting_and_camera()

    out_dir = os.path.abspath("scratch/ai_puttar_preview")
    os.makedirs(out_dir, exist_ok=True)
    render_file = os.path.join(out_dir, "ai_puttar_blender_render.png")
    blend_file = os.path.abspath("blender_engine/assets/desi_library/ai_puttar_base.blend")
    os.makedirs(os.path.dirname(blend_file), exist_ok=True)

    render_preview(render_file, blend_file)

if __name__ == "__main__":
    main()
