"""
True Dynamic 3D Scene Transformation Engine (Phase 2 Relatable AI Comedy)
Episode: "When Your AI Cares About Your Sleep More Than You Do" (3:00 AM Late-Night Coding)

Core Rule: ONLY reuse the character models. EVERYTHING else changes based on:
- TIME: 3:00 AM Midnight Chiaroscuro (Pitch dark room, blue moonlight, screen glow, warm tungsten desk lamp)
- ACTION: Friend hunched in 'boiled shrimp' posture; Gemini flies directly in front of monitor to block screen,
          points tentacle at 03:00 AM LED clock, and physically shuts the laptop on 'Goodnight'
- MOOD: Exhausted crunch, messy desk (crumpled energy cans, multiple mugs, sticky notes, red digital clock)
- SCRIPT: Visual beats synchronized to dialogue lines 0, 1, 2, 3
"""

import bpy
import json
import math
import sys
import os
from mathutils import Vector, Euler

def hex_to_rgba(hex_code, alpha=1.0):
    hex_code = hex_code.lstrip('#')
    s_r = int(hex_code[0:2], 16) / 255.0
    s_g = int(hex_code[2:4], 16) / 255.0
    s_b = int(hex_code[4:6], 16) / 255.0
    def to_linear(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (to_linear(s_r), to_linear(s_g), to_linear(s_b), alpha)

def create_mat(name, base_color, roughness=0.35, metallic=0.0, emission_color=None, emission_strength=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if emission_color and emission_strength > 0:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission_color
                bsdf.inputs["Emission Strength"].default_value = emission_strength
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = emission_color
    return mat

def set_parent(child, parent):
    if child and parent:
        child.parent = parent
        child.matrix_parent_inverse = parent.matrix_world.inverted()

def look_at(camera, point):
    direction = Vector(point) - camera.location
    rotQuat = direction.to_track_quat('-Z', 'Y')
    camera.rotation_euler = rotQuat.to_euler()

def transform_environment_to_midnight():
    """Converts the studio into a moody, dark 3:00 AM bedroom/office."""
    print("🌙 Transforming environment to 3:00 AM Midnight Atmosphere...")
    
    # 1. World Background -> Deep Dark Midnight Space with soft ambient silhouette bounce
    world = bpy.context.scene.world or bpy.data.worlds.new("MidnightWorld")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = (0.012, 0.020, 0.045, 1.0) # midnight navy
        bg.inputs[1].default_value = 0.28 # subtle ambient silhouette bounce
        
    # 2. Re-color room walls & floor to dark midnight tones
    sage_mat = bpy.data.materials.get("SageWallMat")
    if sage_mat and sage_mat.node_tree:
        bsdf = sage_mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.025, 0.035, 0.055, 1.0) # midnight charcoal
            bsdf.inputs["Roughness"].default_value = 0.75

    cream_mat = bpy.data.materials.get("CreamWallMat")
    if cream_mat and cream_mat.node_tree:
        bsdf = cream_mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.020, 0.028, 0.045, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.80

    floor_mat = bpy.data.materials.get("TeakFloorMat")
    if floor_mat and floor_mat.node_tree:
        bsdf = floor_mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.015, 0.012, 0.010, 1.0) # dark shadowed wood
            bsdf.inputs["Roughness"].default_value = 0.65

    # 3. Sunlight OFF; Moonlight rim ON
    sun = bpy.data.objects.get("Light_Key_Sun")
    if sun:
        sun.data.energy = 0.0 # kill bright daytime sun!

    fill = bpy.data.objects.get("Light_Fill_Sky")
    if fill:
        fill.data.energy = 25.0 # cool moonlight ambient
        fill.data.color = (0.20, 0.40, 0.90)

    rim = bpy.data.objects.get("Light_Rim_Back")
    if rim:
        rim.data.energy = 140.0 # strong cool moonlight rim light defining shoulders & silhouette
        rim.data.color = (0.35, 0.65, 1.0)
        rim.location = (0.3, 2.2, 2.5)

    # 4. Hide Claude (clean 1-on-1 dynamic between Friend and Gemini)
    claude = bpy.data.objects.get("Agent_Claude_Root")
    if claude:
        claude.hide_render = True
        claude.hide_viewport = True
        claude.scale = (0, 0, 0)

def add_latenight_props_and_lighting():
    """Adds diegetic lights (Laptop Screen Glow, Desk Lamp, 3:00 AM Digital Clock) and late-night clutter."""
    print("💡 Adding 3:00 AM diegetic lights, digital LED clock, and coder clutter...")

    # 1. LAPTOP SCREEN GLOW & EMISSION
    screen_code_mat = bpy.data.materials.get("ScreenCodeMat")
    if screen_code_mat and screen_code_mat.node_tree:
        bsdf = screen_code_mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.1, 0.45, 0.95, 1.0)
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = (0.3, 0.75, 1.0, 1.0)
                bsdf.inputs["Emission Strength"].default_value = 16.0

    # Dedicated point light for the screen glow casting cyan light on Friend's face
    light_screen = bpy.data.objects.get("Light_Screen_Glow")
    if not light_screen:
        bpy.ops.object.light_add(type='POINT', radius=0.35, location=(0.0, 0.42, 1.05))
        light_screen = bpy.context.object
        light_screen.name = "Light_Screen_Glow"
    light_screen.data.energy = 110.0
    light_screen.data.color = (0.28, 0.75, 1.0) # electric blue-cyan monitor glow

    # 2. WARM AMBER DESK LAMP (Left Desk Corner)
    desk_lamp_root = bpy.data.objects.get("Prop_Desk_Lamp")
    if not desk_lamp_root:
        lamp_mat = create_mat("Mat_DeskLamp_Black", (0.03, 0.03, 0.04, 1.0), roughness=0.3, metallic=0.8)
        lamp_brass_mat = create_mat("Mat_DeskLamp_Brass", (0.85, 0.65, 0.25, 1.0), roughness=0.25, metallic=0.9)
        lamp_bulb_mat = create_mat("Mat_DeskLamp_Bulb", (1.0, 0.75, 0.35, 1.0), roughness=0.1,
                                   emission_color=(1.0, 0.75, 0.35, 1.0), emission_strength=18.0)

        desk_lamp_root = bpy.data.objects.new("Prop_Desk_Lamp", None)
        bpy.context.collection.objects.link(desk_lamp_root)
        desk_lamp_root.location = (-0.85, 0.45, 0.785)

        # Base
        bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=0.02, location=(-0.85, 0.45, 0.795))
        base = bpy.context.object
        base.data.materials.append(lamp_mat)
        set_parent(base, desk_lamp_root)

        # Arm
        bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=0.38, location=(-0.85, 0.45, 0.98))
        arm = bpy.context.object
        arm.rotation_euler = (math.radians(-15), math.radians(12), 0)
        arm.data.materials.append(lamp_brass_mat)
        set_parent(arm, desk_lamp_root)

        # Shade (cone pointing down toward desk)
        bpy.ops.mesh.primitive_cone_add(radius1=0.09, depth=0.12, location=(-0.79, 0.41, 1.15))
        shade = bpy.context.object
        shade.rotation_euler = (math.radians(35), math.radians(-15), 0)
        shade.data.materials.append(lamp_mat)
        set_parent(shade, desk_lamp_root)

        # Light bulb inside shade
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.035, location=(-0.78, 0.40, 1.12))
        bulb = bpy.context.object
        bulb.data.materials.append(lamp_bulb_mat)
        set_parent(bulb, desk_lamp_root)

        # Point Light from lamp casting warm tungsten pool
        bpy.ops.object.light_add(type='POINT', radius=0.45, location=(-0.78, 0.39, 1.10))
        lamp_light = bpy.context.object
        lamp_light.name = "Light_Desk_Lamp"
        lamp_light.data.energy = 160.0
        lamp_light.data.color = (1.0, 0.65, 0.22) # warm tungsten amber (2400K)
        set_parent(lamp_light, desk_lamp_root)

    # 3. GLOWING RED DIGITAL ALARM CLOCK WITH 3D "03:00" DIGITS
    clock_obj = bpy.data.objects.get("Prop_Digital_Alarm_Clock")
    if not clock_obj:
        clock_casing_mat = create_mat("Mat_ClockCasing", (0.02, 0.02, 0.02, 1.0), roughness=0.3, metallic=0.8)
        led_red_mat = create_mat("Mat_ClockLED_Red", (1.0, 0.04, 0.04, 1.0), roughness=0.1,
                                 emission_color=(1.0, 0.04, 0.04, 1.0), emission_strength=20.0)
        screen_glass_mat = create_mat("Mat_ClockGlass", (0.01, 0.01, 0.01, 1.0), roughness=0.05, metallic=0.1)

        clock_root = bpy.data.objects.new("Prop_Digital_Alarm_Clock", None)
        bpy.context.collection.objects.link(clock_root)
        # Positioned conspicuously on desk in front-left quadrant
        clock_root.location = (-0.45, 0.22, 0.785)
        clock_root.rotation_euler = (0, 0, math.radians(22))

        # Main Casing
        bpy.ops.mesh.primitive_cube_add(location=(-0.45, 0.22, 0.835), scale=(0.10, 0.04, 0.045))
        casing = bpy.context.object
        casing.name = "Clock_Casing"
        casing.data.materials.append(clock_casing_mat)
        set_parent(casing, clock_root)

        # Dark Glass Display Face
        bpy.ops.mesh.primitive_plane_add(location=(-0.45, 0.178, 0.835), size=0.07)
        face = bpy.context.object
        face.scale = (1.35, 0.58, 1.0)
        face.rotation_euler = (math.radians(90), 0, 0)
        face.data.materials.append(screen_glass_mat)
        set_parent(face, clock_root)

        # 3D Digital Text reading "03:00"
        bpy.ops.object.text_add(location=(-0.52, 0.176, 0.82))
        text_obj = bpy.context.object
        text_obj.name = "Clock_Text_Digits"
        text_obj.data.body = "03:00"
        text_obj.data.size = 0.038
        text_obj.data.extrude = 0.002
        text_obj.rotation_euler = (math.radians(90), 0, 0)
        text_obj.data.materials.append(led_red_mat)
        set_parent(text_obj, clock_root)

        # Red point light glow casting onto desk surface
        bpy.ops.object.light_add(type='POINT', radius=0.18, location=(-0.45, 0.15, 0.835))
        clock_light = bpy.context.object
        clock_light.name = "Light_Clock_LED"
        clock_light.data.energy = 15.0
        clock_light.data.color = (1.0, 0.05, 0.05)
        set_parent(clock_light, clock_root)

    # 4. LATE-NIGHT CODER CLUTTER: Crumpled energy cans & extra coffee mugs
    clutter_root = bpy.data.objects.get("Prop_LateNight_Clutter")
    if not clutter_root:
        can_mat = create_mat("Mat_EnergyCan_Neon", (0.05, 0.95, 0.2, 1.0), roughness=0.2, metallic=0.9)
        silver_can_mat = create_mat("Mat_EnergyCan_Silver", (0.85, 0.85, 0.88, 1.0), roughness=0.25, metallic=0.95)
        extra_mug_mat = create_mat("Mat_ExtraMug_Navy", (0.08, 0.12, 0.22, 1.0), roughness=0.3)

        clutter_root = bpy.data.objects.new("Prop_LateNight_Clutter", None)
        bpy.context.collection.objects.link(clutter_root)

        # Crushed Energy Can 1 (standing on right desk side)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.032, depth=0.11, location=(0.52, 0.32, 0.84))
        can1 = bpy.context.object
        can1.data.materials.append(can_mat)
        set_parent(can1, clutter_root)

        # Crushed Energy Can 2 (tipped over on its side)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.032, depth=0.11, location=(0.42, 0.38, 0.81))
        can2 = bpy.context.object
        can2.rotation_euler = (0, math.radians(88), math.radians(35))
        can2.data.materials.append(silver_can_mat)
        set_parent(can2, clutter_root)

        # Second coffee mug (empty espresso cup on left side)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.042, depth=0.075, location=(-0.62, 0.32, 0.82))
        mug2 = bpy.context.object
        mug2.data.materials.append(extra_mug_mat)
        set_parent(mug2, clutter_root)

    # 5. LAPTOP HINGE PARENTING
    hinge = bpy.data.objects.get("Laptop_Screen_Hinge")
    laptop_lid = bpy.data.objects.get("Cube.005")
    laptop_disp = bpy.data.objects.get("Plane.002")

    if not hinge and laptop_lid:
        hinge = bpy.data.objects.new("Laptop_Screen_Hinge", None)
        bpy.context.collection.objects.link(hinge)
        hinge.location = Vector((0.0, 0.48, 0.80)) # Hinge line at base of screen
        
        set_parent(laptop_lid, hinge)
        if laptop_disp:
            set_parent(laptop_disp, hinge)

def setup_cinematic_timeline_cameras(manifest):
    """Configures cinematic timeline camera cuts with look_at targeting."""
    scene = bpy.context.scene
    scene.timeline_markers.clear()

    cam_wide = bpy.data.objects.get("Cam_Wide")
    cam_human = bpy.data.objects.get("Cam_Human")
    cam_popapus = bpy.data.objects.get("Cam_Popapus")

    # Camera 1: Medium shot of Friend's desk struggle (boiled shrimp posture + screen glow + 03:00 clock)
    if cam_human:
        cam_human.location = Vector((-0.15, -1.05, 1.40))
        look_at(cam_human, (0.0, 0.65, 1.25))
        cam_human.data.lens = 38

    # Camera 2: Gemini confrontation shot (Gemini blocking monitor, looking Friend dead in the eyes)
    if cam_popapus:
        cam_popapus.location = Vector((0.45, -0.65, 1.38))
        look_at(cam_popapus, (0.24, 0.35, 1.22))
        cam_popapus.data.lens = 36

    # Camera 3: Wide cinematic atmospheric master shot (captures lamp, clock, characters, shutdown)
    if cam_wide:
        cam_wide.location = Vector((0.15, -1.95, 1.40))
        look_at(cam_wide, (0.0, 0.45, 1.15))
        cam_wide.data.lens = 32

    # Timeline cuts
    markers = [
        ("Shot_0_FriendCrunch", 1, cam_human),
        ("Shot_1_GeminiBlockScreen", 177, cam_popapus),
        ("Shot_2_FriendDespairPlea", 525, cam_human),
        ("Shot_3_ShutdownAndSleep", 691, cam_wide)
    ]

    for name, frame, cam in markers:
        if cam:
            m = scene.timeline_markers.new(name, frame=frame)
            m.camera = cam

    print("📷 Cinematic timeline camera markers configured with look_at tracking!")

def animate_latenight_choreography(manifest):
    """
    Executes the dynamic narrative choreography:
    - Friend: Hunched 'boiled shrimp' posture, furious typing, exasperated plea, defeated collapse.
    - Gemini: Swoops from side to DIRECTLY IN FRONT OF LAPTOP to block screen on Line 1!
              Points tentacle at 03:00 AM clock!
              Reaches down and shuts laptop screen flat on Line 3 'Goodnight'!
    - Laptop Screen: Hinge folds down to 0 degrees at Line 3; Screen light cuts off.
    """
    total_frames = manifest.get('totalFrames', 880)
    print(f"🎬 Keyframing 3:00 AM dynamic choreography across {total_frames} frames...")

    gemini_root = bpy.data.objects.get("Antigravity_Popapus_Root")
    friend_root = bpy.data.objects.get("Human_Avatar")
    friend_torso = bpy.data.objects.get("Human_Torso")
    friend_head_pivot = bpy.data.objects.get("Human_Head_Pivot")
    mouth = bpy.data.objects.get("Human_Mouth")
    eye_l = bpy.data.objects.get("Human_Eye_L")
    eye_r = bpy.data.objects.get("Human_Eye_R")
    arm_l = bpy.data.objects.get("Human_Arm_L")
    arm_r = bpy.data.objects.get("Human_Arm_R")
    hand_l = bpy.data.objects.get("Human_Hand_L")
    hand_r = bpy.data.objects.get("Human_Hand_R")

    laptop_hinge = bpy.data.objects.get("Laptop_Screen_Hinge")
    light_screen = bpy.data.objects.get("Light_Screen_Glow")

    # Clear animations
    for obj in [gemini_root, friend_torso, friend_head_pivot, mouth, eye_l, eye_r, 
                arm_l, arm_r, hand_l, hand_r, laptop_hinge]:
        if obj:
            obj.animation_data_clear()

    if light_screen and light_screen.data:
        light_screen.data.animation_data_clear()

    base_eye_l_scale = eye_l.scale.copy() if eye_l else Vector((0.9, 0.35, 1.25))
    base_eye_r_scale = eye_r.scale.copy() if eye_r else Vector((0.9, 0.35, 1.25))

    friend_torso_base_rot = friend_torso.rotation_euler.copy() if friend_torso else Euler((0,0,0))
    friend_head_base_loc = friend_head_pivot.location.copy() if friend_head_pivot else Vector((0, 0.95, 1.54))
    friend_head_base_rot = friend_head_pivot.rotation_euler.copy() if friend_head_pivot else Euler((0,0,0))

    step = 3
    for f in range(1, total_frames + 1, step):
        t = f / 30.0

        # =====================================================================
        # 1. FRIEND: BOILED SHRIMP POSTURE & CHOREOGRAPHY
        # =====================================================================
        if friend_torso and friend_head_pivot:
            if f <= 168:
                # LINE 0: Frantic 3 AM typing, severe slouch over laptop
                friend_torso.rotation_euler.x = friend_torso_base_rot.x + math.radians(18) # 18 deg forward slump
                friend_head_pivot.location.y = friend_head_base_loc.y - 0.08
                friend_head_pivot.location.z = friend_head_base_loc.z - 0.05
                friend_head_pivot.rotation_euler.x = friend_head_base_rot.x + math.radians(22) + math.sin(t * 8.0) * 0.02
                friend_head_pivot.rotation_euler.z = friend_head_base_rot.z

                if arm_l and arm_r and hand_l and hand_r:
                    arm_l.rotation_euler.x = math.radians(48)
                    arm_r.rotation_euler.x = math.radians(48)
                    hand_l.location = Vector((-0.14, 0.40, 0.82 + abs(math.sin(t * 24.0)) * 0.015))
                    hand_r.location = Vector((0.14, 0.40, 0.82 + abs(math.cos(t * 24.0)) * 0.015))

            elif 177 <= f <= 516:
                # LINE 1: Gemini roasts Friend. Friend slumps in guilty defeat
                friend_torso.rotation_euler.x = friend_torso_base_rot.x + math.radians(22)
                friend_head_pivot.location.y = friend_head_base_loc.y - 0.06
                friend_head_pivot.location.z = friend_head_base_loc.z - 0.07
                friend_head_pivot.rotation_euler.x = friend_head_base_rot.x + math.radians(8) # looks up sheepishly at Gemini
                friend_head_pivot.rotation_euler.z = friend_head_base_rot.z + math.radians(6)

                if arm_l and arm_r and hand_l and hand_r:
                    arm_l.rotation_euler.x = math.radians(35)
                    arm_r.rotation_euler.x = math.radians(35)
                    hand_l.location = Vector((-0.18, 0.45, 0.79))
                    hand_r.location = Vector((0.18, 0.45, 0.79))

            elif 525 <= f <= 682:
                # LINE 2: "Aren't you supposed to support my dreams?!" Exasperated plea!
                friend_torso.rotation_euler.x = friend_torso_base_rot.x - math.radians(6) # pulls back upright
                friend_head_pivot.location.y = friend_head_base_loc.y + 0.02
                friend_head_pivot.location.z = friend_head_base_loc.z + 0.02
                friend_head_pivot.rotation_euler.x = friend_head_base_rot.x - math.radians(10) + math.sin(t * 7.0) * 0.03
                friend_head_pivot.rotation_euler.z = friend_head_base_rot.z + math.sin(t * 4.0) * 0.04

                if arm_l and arm_r and hand_l and hand_r:
                    # Raised hands despair plea
                    arm_l.rotation_euler.x = math.radians(75)
                    arm_r.rotation_euler.x = math.radians(75)
                    hand_l.location = Vector((-0.26, 0.50, 1.15 + math.sin(t * 6.0) * 0.03))
                    hand_r.location = Vector((0.26, 0.50, 1.15 + math.sin(t * 6.0) * 0.03))

            else:
                # LINE 3: Total surrender, arms fold on desk, head slumps completely
                friend_torso.rotation_euler.x = friend_torso_base_rot.x + math.radians(28)
                friend_head_pivot.location.y = friend_head_base_loc.y - 0.12
                friend_head_pivot.location.z = friend_head_base_loc.z - 0.12
                friend_head_pivot.rotation_euler.x = friend_head_base_rot.x + math.radians(32)

                if arm_l and arm_r and hand_l and hand_r:
                    arm_l.rotation_euler.x = math.radians(22)
                    arm_r.rotation_euler.x = math.radians(22)
                    hand_l.location = Vector((-0.10, 0.44, 0.79))
                    hand_r.location = Vector((0.10, 0.44, 0.79))

            friend_torso.keyframe_insert(data_path="rotation_euler", frame=f)
            friend_head_pivot.keyframe_insert(data_path="location", frame=f)
            friend_head_pivot.keyframe_insert(data_path="rotation_euler", frame=f)

            if arm_l and arm_r and hand_l and hand_r:
                arm_l.keyframe_insert(data_path="rotation_euler", frame=f)
                arm_r.keyframe_insert(data_path="rotation_euler", frame=f)
                hand_l.keyframe_insert(data_path="location", frame=f)
                hand_r.keyframe_insert(data_path="location", frame=f)

        # Eyes: Heavy 3 AM drooping eyelids
        for eye, base_scale in [(eye_l, base_eye_l_scale), (eye_r, base_eye_r_scale)]:
            if eye:
                if 525 <= f <= 682:
                    eye.scale.z = base_scale.z * 1.35
                elif f > 750:
                    eye.scale.z = 0.02 # eyes shut asleep!
                else:
                    eye.scale.z = base_scale.z * 0.42 # exhausted heavy droop
                eye.keyframe_insert(data_path="scale", frame=f)

        # Mouth lip-sync
        if mouth:
            is_friend_speaking = (0 <= f <= 168) or (525 <= f <= 682)
            if is_friend_speaking:
                flap = 0.5 + 0.5 * abs(math.sin(t * 18.0))
                mouth.scale.x = max(0.5, flap * 2.2)
            else:
                mouth.scale.x = 0.35
            mouth.keyframe_insert(data_path="scale", frame=f)

        # =====================================================================
        # 2. GEMINI: ACTIVE INTERVENTION & SCREEN SHUTDOWN
        # =====================================================================
        if gemini_root:
            if f <= 168:
                # LINE 0: Hovering on right side watching Friend
                gemini_root.location = Vector((0.55, 0.35, 1.18 + math.sin(t * 3.5) * 0.025))
                # Facing 3/4 toward camera & Friend
                gemini_root.rotation_euler = Euler((0.04, -0.08, math.radians(-30)))

            elif 177 <= f <= 516:
                # LINE 1: GEMINI SWOOPS TO CENTER-RIGHT TO CONFRONT FRIEND!
                swoop_fac = min(1.0, max(0.0, (f - 177) / 40.0))
                cur_x = 0.55 * (1.0 - swoop_fac) + 0.26 * swoop_fac
                cur_y = 0.35
                cur_z = 1.18 * (1.0 - swoop_fac) + 1.22 * swoop_fac + math.sin(t * 4.0) * 0.02

                gemini_root.location = Vector((cur_x, cur_y, cur_z))
                # 3/4 face toward camera and Friend, sassy head tilt
                gemini_root.rotation_euler = Euler((
                    math.sin(t * 5.0) * 0.03,
                    -0.16 + math.sin(t * 3.0) * 0.04, # Sassy head tilt
                    math.radians(-25) + math.sin(t * 2.5) * 0.04
                ))

            elif 525 <= f <= 682:
                # LINE 2: Gemini hovers at side as Friend pleads
                gemini_root.location = Vector((0.55, 0.35, 1.18 + math.sin(t * 3.0) * 0.02))
                gemini_root.rotation_euler = Euler((
                    0.05,
                    0.10,
                    math.radians(-30)
                ))

            else:
                # LINE 3: "I support your dreams... Goodnight."
                # Gemini glides over laptop and pushes screen down
                if f < 765:
                    gemini_root.location = Vector((0.25, 0.38, 1.20 + math.sin(t * 2.5) * 0.015))
                    gemini_root.rotation_euler = Euler((0.0, -0.06, math.radians(-20)))
                elif 765 <= f <= 810:
                    push_fac = (f - 765) / 45.0
                    gemini_root.location = Vector((0.12 - push_fac * 0.04, 0.42, 1.16 - push_fac * 0.08))
                    gemini_root.rotation_euler = Euler((math.radians(12), 0, math.radians(-15)))
                else:
                    # Victory spin!
                    spin_t = (f - 810) / 30.0
                    spin_angle = spin_t * math.pi * 2.0
                    gemini_root.location = Vector((0.25, 0.35, 1.25 + math.sin(t * 3.0) * 0.02))
                    gemini_root.rotation_euler = Euler((0, -0.05, math.radians(-20) + spin_angle))

            gemini_root.keyframe_insert(data_path="location", frame=f)
            gemini_root.keyframe_insert(data_path="rotation_euler", frame=f)

        # =====================================================================
        # 3. LAPTOP HINGE ROTATION & SCREEN SHUTDOWN AT FRAME 780-820
        # =====================================================================
        if laptop_hinge:
            if f < 780:
                laptop_hinge.rotation_euler.x = 0.0 # Open
            elif 780 <= f <= 815:
                # Fold screen flat onto base (rotate down 78 degrees)
                shut_fac = (f - 780) / 35.0
                laptop_hinge.rotation_euler.x = math.radians(-78) * shut_fac
            else:
                laptop_hinge.rotation_euler.x = math.radians(-78) # Closed flat!

            laptop_hinge.keyframe_insert(data_path="rotation_euler", frame=f)

        # Screen light cuts off when laptop shuts
        if light_screen and light_screen.data:
            if f < 785:
                light_screen.data.energy = 110.0
            elif 785 <= f <= 815:
                dim_fac = 1.0 - ((f - 785) / 30.0)
                light_screen.data.energy = 110.0 * max(0.0, dim_fac)
            else:
                light_screen.data.energy = 0.0 # Screen off! Room lit solely by warm amber lamp!
            light_screen.data.keyframe_insert(data_path="energy", frame=f)

def configure_eevee_render(output_path, total_frames):
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.fps = 30
    scene.frame_start = 1
    scene.frame_end = total_frames

    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 8
        if hasattr(scene.eevee, "use_raytracing"):
            scene.eevee.use_raytracing = True
        if hasattr(scene.eevee, "use_gtao"):
            scene.eevee.use_gtao = True

    scene.render.image_settings.file_format = 'FFMPEG'
    scene.render.ffmpeg.format = 'MPEG4'
    scene.render.ffmpeg.codec = 'H264'
    scene.render.ffmpeg.constant_rate_factor = 'HIGH'
    scene.render.ffmpeg.ffmpeg_preset = 'REALTIME'
    scene.render.filepath = output_path

def main():
    args = sys.argv
    manifest_path = r"D:\New folder (2)\scratch\relatable_manifest.json"
    output_mp4 = r"D:\New folder (2)\scratch\relatable_test\raw_relatable_latenight.mp4"
    do_render = True

    if "--" in args:
        user_args = args[args.index("--") + 1:]
        for i, a in enumerate(user_args):
            if a == "--manifest" and i + 1 < len(user_args):
                manifest_path = user_args[i + 1]
            elif a == "--output" and i + 1 < len(user_args):
                output_mp4 = user_args[i + 1]
            elif a == "--no-render":
                do_render = False

    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    total_frames = manifest.get('totalFrames', 880)

    # 1. Transform environment
    transform_environment_to_midnight()

    # 2. Add diegetic lights & props
    add_latenight_props_and_lighting()

    # 3. Setup cameras
    setup_cinematic_timeline_cameras(manifest)

    # 4. Animate dynamic choreography
    animate_latenight_choreography(manifest)

    # 5. Configure render
    configure_eevee_render(output_mp4, total_frames)

    # Save transformed stage
    out_blend = r"D:\New folder (2)\scratch\relatable_test\latenight_3am_stage.blend"
    os.makedirs(os.path.dirname(out_blend), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=out_blend)
    print(f"💾 Transformed 3:00 AM stage saved to: {out_blend}")

    if do_render:
        print(f"🚀 Rendering Complete 3:00 AM Relatable Episode ({total_frames} frames)...")
        bpy.ops.render.render(animation=True)
        print(f"✅ Render complete! Output: {output_mp4}")

if __name__ == "__main__":
    main()
