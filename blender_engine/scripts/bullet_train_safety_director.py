"""
Living Kinetic Simulation Director: The High-Speed Train Miracle (LZB Automatic Train Protection)
Topic: How High-Speed Rail Prevents 200 km/h Head-On Collisions
Duration: 56.62s (1,698 frames at 30 FPS)
Features:
- Dual high-speed bullet trains (Red Train & White Train) physically moving on tracks
- Curved concrete viaduct diorama, catenary poles, signal gantries
- Inductive LZB track cable with glowing data pulse packets
- Live kinetic deceleration physics with wheel brake spark glow
- Dynamic Tracking Camera Rigs across 5 cinematic beats
- 2.5D In-World Telemetry HUD & Safe Clearance Distance Bracket
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Euler

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for col in bpy.data.collections:
        bpy.data.collections.remove(col)

def set_smooth(obj):
    if hasattr(obj, 'data') and hasattr(obj.data, 'polygons'):
        for p in obj.data.polygons:
            p.use_smooth = True

def create_mat(name, base_color=(1, 1, 1, 1), roughness=0.4, metallic=0.0, emission_color=None, emission_strength=0.0, alpha=1.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()

    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    mat.node_tree.links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])

    node_bsdf.inputs['Base Color'].default_value = base_color
    node_bsdf.inputs['Roughness'].default_value = roughness
    node_bsdf.inputs['Metallic'].default_value = metallic

    if emission_color and emission_strength > 0:
        node_bsdf.inputs['Emission Color'].default_value = emission_color
        node_bsdf.inputs['Emission Strength'].default_value = emission_strength

    if alpha < 1.0:
        node_bsdf.inputs['Alpha'].default_value = alpha
        mat.blend_method = 'BLEND'
    return mat

def build_environment(parent_col):
    col = bpy.data.collections.new("Environment_Corridor")
    parent_col.children.link(col)

    mats = {
        'terrain': create_mat("Env_Terrain", (0.16, 0.22, 0.12, 1), roughness=0.9),
        'ballast': create_mat("Env_Ballast", (0.18, 0.18, 0.20, 1), roughness=0.85),
        'concrete': create_mat("Env_Concrete", (0.55, 0.56, 0.58, 1), roughness=0.6),
        'steel_rail': create_mat("Env_SteelRail", (0.75, 0.77, 0.80, 1), roughness=0.2, metallic=0.9),
        'lzb_cable': create_mat("Env_LZBCable", (0.0, 0.85, 1.0, 1), emission_color=(0.0, 0.9, 1.0, 1), emission_strength=12.0),
        'signal_red': create_mat("Env_SignalRed", (1.0, 0.05, 0.05, 1), emission_color=(1.0, 0.05, 0.05, 1), emission_strength=25.0),
        'signal_green': create_mat("Env_SignalGreen", (0.05, 1.0, 0.1, 1), emission_color=(0.05, 1.0, 0.1, 1), emission_strength=25.0),
        'pole_metal': create_mat("Env_CatenaryMetal", (0.25, 0.28, 0.32, 1), roughness=0.4, metallic=0.7),
        'water': create_mat("Env_RiverWater", (0.04, 0.15, 0.25, 1), roughness=0.1, metallic=0.2),
    }

    # Rolling Hills Terrain Base
    bpy.ops.mesh.primitive_plane_add(size=800, location=(0, 0, -2.5))
    ground = bpy.context.active_object
    ground.name = "Terrain_Base"
    ground.data.materials.append(mats['terrain'])
    col.objects.link(ground)
    bpy.context.collection.objects.unlink(ground)

    # Viaduct Concrete Deck (Width 6m, Length 350m along Y axis)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.8))
    viaduct = bpy.context.active_object
    viaduct.name = "Viaduct_Deck"
    viaduct.scale = (5.6, 360.0, 0.8)
    bpy.ops.object.transform_apply(scale=True)
    viaduct.data.materials.append(mats['concrete'])
    col.objects.link(viaduct)
    bpy.context.collection.objects.unlink(viaduct)

    # Ballast gravel bed on top of deck
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 2.3))
    ballast = bpy.context.active_object
    ballast.name = "Ballast_Bed"
    ballast.scale = (4.8, 360.0, 0.25)
    bpy.ops.object.transform_apply(scale=True)
    ballast.data.materials.append(mats['ballast'])
    col.objects.link(ballast)
    bpy.context.collection.objects.unlink(ballast)

    # Viaduct Support Pillars
    for py in range(-140, 150, 35):
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=1.1, depth=4.5, location=(0, py, -0.4))
        pillar = bpy.context.active_object
        pillar.data.materials.append(mats['concrete'])
        set_smooth(pillar)
        col.objects.link(pillar)
        bpy.context.collection.objects.unlink(pillar)

    # Dual Steel Rails (Track 1 at X = -1.2, Track 2 at X = 1.2)
    # We lay down 4 steel rails (2 per track)
    for track_center in [-1.2, 1.2]:
        for rail_offset in [-0.55, 0.55]:
            rx = track_center + rail_offset
            bpy.ops.mesh.primitive_cube_add(size=1, location=(rx, 0, 2.52))
            rail = bpy.context.active_object
            rail.scale = (0.08, 360.0, 0.12)
            bpy.ops.object.transform_apply(scale=True)
            rail.data.materials.append(mats['steel_rail'])
            col.objects.link(rail)
            bpy.context.collection.objects.unlink(rail)

        # LZB Inductive Center Cable running between rails
        bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=360.0, location=(track_center, 0, 2.45), rotation=(math.radians(90), 0, 0))
        lzb = bpy.context.active_object
        lzb.data.materials.append(mats['lzb_cable'])
        col.objects.link(lzb)
        bpy.context.collection.objects.unlink(lzb)

    # Catenary Overhead Masts along viaduct edge
    for my in range(-140, 150, 28):
        # Mast column
        bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=5.5, location=(-3.2, my, 4.5))
        mast = bpy.context.active_object
        mast.data.materials.append(mats['pole_metal'])
        col.objects.link(mast)
        bpy.context.collection.objects.unlink(mast)

        # Horizontal cantilever arm
        bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=4.2, location=(-1.1, my, 6.8), rotation=(0, math.radians(90), 0))
        arm = bpy.context.active_object
        arm.data.materials.append(mats['pole_metal'])
        col.objects.link(arm)
        bpy.context.collection.objects.unlink(arm)

    # Automated Railway Signal Gantry (at Y = 0)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 7.5))
    gantry = bpy.context.active_object
    gantry.scale = (6.8, 0.6, 0.5)
    bpy.ops.object.transform_apply(scale=True)
    gantry.data.materials.append(mats['pole_metal'])
    col.objects.link(gantry)
    bpy.context.collection.objects.unlink(gantry)

    # Signal Lamps (Green lamp and Red lamp)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=0.15, location=(-1.2, -0.4, 7.5), rotation=(math.radians(90), 0, 0))
    green_lamp = bpy.context.active_object
    green_lamp.name = "Signal_Lamp_Green"
    green_lamp.data.materials.append(mats['signal_green'])
    col.objects.link(green_lamp)
    bpy.context.collection.objects.unlink(green_lamp)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=0.15, location=(-1.2, -0.4, 7.5), rotation=(math.radians(90), 0, 0))
    red_lamp = bpy.context.active_object
    red_lamp.name = "Signal_Lamp_Red"
    red_lamp.data.materials.append(mats['signal_red'])
    col.objects.link(red_lamp)
    bpy.context.collection.objects.unlink(red_lamp)

    # Frame 1-280: Green signal active
    green_lamp.hide_render = False
    green_lamp.keyframe_insert(data_path="hide_render", frame=1)
    green_lamp.hide_render = True
    green_lamp.keyframe_insert(data_path="hide_render", frame=281)

    # Frame 281-1698: Red danger signal active
    red_lamp.hide_render = True
    red_lamp.keyframe_insert(data_path="hide_render", frame=1)
    red_lamp.hide_render = False
    red_lamp.keyframe_insert(data_path="hide_render", frame=281)

    return col

def build_bullet_train(parent_col, name="Red_Train", livery_color=(0.85, 0.08, 0.12, 1), is_reverse=False):
    col = bpy.data.collections.new(f"Train_{name}")
    parent_col.children.link(col)

    mats = {
        'body': create_mat(f"{name}_Body", livery_color, roughness=0.25, metallic=0.15),
        'white_strip': create_mat(f"{name}_White", (0.95, 0.96, 0.98, 1), roughness=0.3),
        'glass': create_mat(f"{name}_Glass", (0.05, 0.08, 0.14, 1), roughness=0.1, metallic=0.9),
        'chassis': create_mat(f"{name}_DarkChassis", (0.08, 0.09, 0.11, 1), roughness=0.5),
        'headlight': create_mat(f"{name}_Headlight", (1.0, 0.95, 0.8, 1), emission_color=(1.0, 0.95, 0.8, 1), emission_strength=30.0),
        'sparks': create_mat(f"{name}_BrakeSparks", (1.0, 0.6, 0.1, 1), emission_color=(1.0, 0.7, 0.2, 1), emission_strength=40.0),
    }

    # Root Train Anchor
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    root = bpy.context.active_object
    root.name = f"{name}_Root"
    col.objects.link(root)
    bpy.context.collection.objects.unlink(root)

    dir_sign = -1 if is_reverse else 1

    # 1. Lead Power Car (Locomotive with Duckbill Nose)
    # Main Cabin Box
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 3.8))
    cabin = bpy.context.active_object
    cabin.name = f"{name}_Cabin"
    cabin.scale = (1.8, 12.0, 1.6)
    bpy.ops.object.transform_apply(scale=True)
    set_smooth(cabin)
    cabin.data.materials.append(mats['body'])
    cabin.parent = root
    col.objects.link(cabin)
    bpy.context.collection.objects.unlink(cabin)

    # Aerodynamic Slanted Duckbill Nose (+Y direction or -Y if reverse)
    nose_y = dir_sign * 7.5
    bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=1.0, depth=3.8, location=(0, nose_y, 3.4), rotation=(dir_sign * math.radians(-90), 0, 0))
    nose = bpy.context.active_object
    nose.name = f"{name}_Nose"
    nose.scale = (0.9, 1.0, 0.7)
    bpy.ops.object.transform_apply(scale=True)
    set_smooth(nose)
    nose.data.materials.append(mats['body'])
    nose.parent = root
    col.objects.link(nose)
    bpy.context.collection.objects.unlink(nose)

    # Cockpit Windshield (Angular glass canopy)
    cockpit_y = dir_sign * 6.2
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, cockpit_y, 4.3), rotation=(dir_sign * math.radians(-28), 0, 0))
    cockpit = bpy.context.active_object
    cockpit.name = f"{name}_Cockpit"
    cockpit.scale = (1.4, 1.2, 0.4)
    bpy.ops.object.transform_apply(scale=True)
    cockpit.data.materials.append(mats['glass'])
    cockpit.parent = root
    col.objects.link(cockpit)
    bpy.context.collection.objects.unlink(cockpit)

    # High-Intensity LED Headlights
    for side in [-0.55, 0.55]:
        hl_y = dir_sign * 8.8
        bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=0.15, location=(side, hl_y, 3.1), rotation=(math.radians(90), 0, 0))
        hl = bpy.context.active_object
        hl.data.materials.append(mats['headlight'])
        hl.parent = root
        col.objects.link(hl)
        bpy.context.collection.objects.unlink(hl)

    # Passenger Windows along side
    for sign_x in [-0.91, 0.91]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(sign_x, -dir_sign * 0.5, 3.9))
        win_strip = bpy.context.active_object
        win_strip.scale = (0.04, 9.5, 0.35)
        bpy.ops.object.transform_apply(scale=True)
        win_strip.data.materials.append(mats['glass'])
        win_strip.parent = root
        col.objects.link(win_strip)
        bpy.context.collection.objects.unlink(win_strip)

    # Roof Catenary Pantograph
    panto_y = -dir_sign * 3.5
    bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=1.6, location=(0, panto_y, 5.0), rotation=(math.radians(35), 0, 0))
    panto = bpy.context.active_object
    panto.data.materials.append(mats['chassis'])
    panto.parent = root
    col.objects.link(panto)
    bpy.context.collection.objects.unlink(panto)

    # 2. Coupled Second Passenger Coach
    coach_y = -dir_sign * 14.2
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, coach_y, 3.8))
    coach = bpy.context.active_object
    coach.name = f"{name}_Coach2"
    coach.scale = (1.8, 12.0, 1.6)
    bpy.ops.object.transform_apply(scale=True)
    set_smooth(coach)
    coach.data.materials.append(mats['body'])
    coach.parent = root
    col.objects.link(coach)
    bpy.context.collection.objects.unlink(coach)

    # 3. Wheel Bogies & Brake Spark Emitters (Active during emergency deceleration)
    spark_emitter = None
    for by in [-4.0, 4.0]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, by, 2.75))
        bogie = bpy.context.active_object
        bogie.scale = (1.6, 2.4, 0.3)
        bpy.ops.object.transform_apply(scale=True)
        bogie.data.materials.append(mats['chassis'])
        bogie.parent = root
        col.objects.link(bogie)
        bpy.context.collection.objects.unlink(bogie)

    # Glowing Friction Brake Pad Emitters under wheels
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 2.55))
    sparks = bpy.context.active_object
    sparks.name = f"{name}_BrakeSparks"
    sparks.scale = (1.5, 8.0, 0.08)
    bpy.ops.object.transform_apply(scale=True)
    sparks.data.materials.append(mats['sparks'])
    sparks.parent = root
    col.objects.link(sparks)
    bpy.context.collection.objects.unlink(sparks)

    # Sparks only glow when brakes hit (Frames 980 to 1400)
    sparks.hide_render = True
    sparks.keyframe_insert(data_path="hide_render", frame=1)
    sparks.hide_render = False
    sparks.keyframe_insert(data_path="hide_render", frame=980)
    sparks.hide_render = True
    sparks.keyframe_insert(data_path="hide_render", frame=1380)

    return root

def animate_train_simulation(red_train, white_train, total_frames=1698):
    """
    Keyframes the live physics collision simulation:
    - Red Train starts at Y = -160, moves at 200 km/h toward center on Track 1 (X = -1.2)
    - At frame 980 (32.5s), LZB emergency override engages!
    - Red Train decelerates rapidly from Y = -35 to come to a full stop at Y = -12 at frame 1350!
    - White Train starts at Y = 160, moves toward center on Track 1 (due to wrong switch!)
    - White Train engages LZB brakes at frame 980, stops safely at Y = 14!
    - Safe clearance gap = 26 meters (in-world scaled distance represents 310m).
    """
    # RED TRAIN (Track 1, X = -1.2, travels in +Y direction)
    red_pts = [
        (1,    (-1.2, -150.0, 0.0)),  # Cruising at 200 km/h
        (300,  (-1.2, -100.0, 0.0)),  # Approaching signal block
        (660,  (-1.2, -60.0,  0.0)),  # Inside occupied block
        (980,  (-1.2, -32.0,  0.0)),  # 🚨 LZB AUTO-OVERRIDE ENGAGED! BRAKES SLAM!
        (1160, (-1.2, -19.0,  0.0)),  # Rapid deceleration (skidding)
        (1350, (-1.2, -12.0,  0.0)),  # 🛑 FULL STOP!
        (1698, (-1.2, -12.0,  0.0)),  # Stationary, safe
    ]
    for f, loc in red_pts:
        red_train.location = Vector(loc)
        red_train.keyframe_insert(data_path="location", frame=f)

    # WHITE TRAIN (Track 1, X = -1.2, travels in -Y direction)
    white_pts = [
        (1,    (-1.2, 150.0, 0.0)),   # Cruising at 200 km/h from opposite block
        (300,  (-1.2, 100.0, 0.0)),   # Enters wrongly aligned switch
        (660,  (-1.2, 60.0,  0.0)),   # Head-on closing trajectory
        (980,  (-1.2, 32.0,  0.0)),   # 🚨 LZB AUTO-OVERRIDE ENGAGED!
        (1160, (-1.2, 19.0,  0.0)),   # Rapid deceleration
        (1350, (-1.2, 12.0,  0.0)),   # 🛑 FULL STOP!
        (1698, (-1.2, 12.0,  0.0)),   # Stationary, safe
    ]
    for f, loc in white_pts:
        white_train.location = Vector(loc)
        white_train.keyframe_insert(data_path="location", frame=f)

    # Set Bezier interpolation for physical deceleration
    for train in [red_train, white_train]:
        if train.animation_data and train.animation_data.action:
            for fcurve in train.animation_data.action.fcurves:
                for kfp in fcurve.keyframe_points:
                    kfp.interpolation = 'BEZIER'

def build_telemetry_hud(parent_col):
    col = bpy.data.collections.new("Telemetry_HUD")
    parent_col.children.link(col)

    mats = {
        'hud_glow': create_mat("HUD_Cyan", (0.0, 0.88, 1.0, 1), emission_color=(0.0, 0.9, 1.0, 1), emission_strength=12.0),
        'hud_red': create_mat("HUD_RedAlert", (1.0, 0.1, 0.1, 1), emission_color=(1.0, 0.15, 0.15, 1), emission_strength=20.0),
        'hud_gold': create_mat("HUD_GoldSafe", (1.0, 0.85, 0.2, 1), emission_color=(1.0, 0.85, 0.2, 1), emission_strength=15.0),
        'hud_card': create_mat("HUD_GlassCard", (0.02, 0.05, 0.09, 0.85), roughness=0.1, alpha=0.85),
    }

    # 1. Warning Callout at Switch Junction: "WARNING: DUAL OCCUPANCY" (Frames 200 - 660)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(-1.2, 0, 10.5), rotation=(math.radians(90), 0, 0))
    warn_card = bpy.context.active_object
    warn_card.name = "HUD_WarningCard"
    warn_card.scale = (3.4, 0.9, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    warn_card.data.materials.append(mats['hud_card'])
    col.objects.link(warn_card)
    bpy.context.collection.objects.unlink(warn_card)

    bpy.ops.object.text_add(location=(-2.6, -0.05, 10.3), rotation=(math.radians(90), 0, 0))
    warn_txt = bpy.context.active_object
    warn_txt.name = "HUD_WarningText"
    warn_txt.data.body = "ALARM: CONFLICT DETECTED\nDUAL OCCUPIED BLOCK"
    warn_txt.data.size = 0.24
    warn_txt.data.extrude = 0.03
    warn_txt.data.materials.append(mats['hud_red'])
    col.objects.link(warn_txt)
    bpy.context.collection.objects.unlink(warn_txt)

    for obj in [warn_card, warn_txt]:
        obj.hide_render = True
        obj.keyframe_insert(data_path="hide_render", frame=1)
        obj.hide_render = False
        obj.keyframe_insert(data_path="hide_render", frame=200)
        obj.hide_render = True
        obj.keyframe_insert(data_path="hide_render", frame=660)

    # 2. In-World Brake Override Hologram: "LZB OVERRIDE ENGAGED" (Frames 980 - 1350)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(-1.2, -22.0, 6.5), rotation=(math.radians(90), 0, 0))
    brake_card = bpy.context.active_object
    brake_card.name = "HUD_BrakeCard"
    brake_card.scale = (3.6, 0.9, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    brake_card.data.materials.append(mats['hud_card'])
    col.objects.link(brake_card)
    bpy.context.collection.objects.unlink(brake_card)

    bpy.ops.object.text_add(location=(-2.8, -22.05, 6.3), rotation=(math.radians(90), 0, 0))
    brake_txt = bpy.context.active_object
    brake_txt.name = "HUD_BrakeText"
    brake_txt.data.body = "LZB AUTO-OVERRIDE ENGAGED\nEMERGENCY EDDY BRAKES"
    brake_txt.data.size = 0.22
    brake_txt.data.extrude = 0.03
    brake_txt.data.materials.append(mats['hud_glow'])
    col.objects.link(brake_txt)
    bpy.context.collection.objects.unlink(brake_txt)

    for obj in [brake_card, brake_txt]:
        obj.hide_render = True
        obj.keyframe_insert(data_path="hide_render", frame=1)
        obj.hide_render = False
        obj.keyframe_insert(data_path="hide_render", frame=980)
        obj.hide_render = True
        obj.keyframe_insert(data_path="hide_render", frame=1350)

    # 3. Final Safe Distance Bracket between Stopped Trains (Frames 1351 - 1698)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(-1.2, 0, 5.5), rotation=(math.radians(90), 0, 0))
    safe_card = bpy.context.active_object
    safe_card.name = "HUD_SafeCard"
    safe_card.scale = (3.8, 1.1, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    safe_card.data.materials.append(mats['hud_card'])
    col.objects.link(safe_card)
    bpy.context.collection.objects.unlink(safe_card)

    bpy.ops.object.text_add(location=(-2.9, -0.05, 5.3), rotation=(math.radians(90), 0, 0))
    safe_txt = bpy.context.active_object
    safe_txt.name = "HUD_SafeText"
    safe_txt.data.body = "SAFE CLEARANCE: 310 METERS\nCASUALTIES: 0"
    safe_txt.data.size = 0.25
    safe_txt.data.extrude = 0.03
    safe_txt.data.materials.append(mats['hud_gold'])
    col.objects.link(safe_txt)
    bpy.context.collection.objects.unlink(safe_txt)

    for obj in [safe_card, safe_txt]:
        obj.hide_render = True
        obj.keyframe_insert(data_path="hide_render", frame=1)
        obj.hide_render = False
        obj.keyframe_insert(data_path="hide_render", frame=1351)

def setup_lighting():
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs['Color'].default_value = (0.05, 0.08, 0.12, 1.0)
        bg.inputs['Strength'].default_value = 1.0

    # Directional Key Sunlight (Dramatic side-lighting catching the sleek train body)
    bpy.ops.object.light_add(type='SUN', location=(30, -20, 25), rotation=(math.radians(55), math.radians(-25), math.radians(65)))
    sun = bpy.context.active_object
    sun.name = "Sun_Key"
    sun.data.energy = 6.5
    sun.data.color = (1.0, 0.92, 0.82)

    # Cool Rim Light (Edges of viaduct and train roofs)
    bpy.ops.object.light_add(type='SUN', location=(-35, 20, 30), rotation=(math.radians(-50), math.radians(30), math.radians(-115)))
    rim = bpy.context.active_object
    rim.name = "Sun_Rim"
    rim.data.energy = 3.0
    rim.data.color = (0.45, 0.65, 0.95)

def setup_cinematic_camera(red_train, white_train, total_frames=1698):
    cam_data = bpy.data.cameras.new("Director_Camera")
    cam_data.lens = 32.0
    cam_data.dof.use_dof = True

    cam_obj = bpy.data.objects.new("Director_Camera_Obj", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Tracking target empty that moves with the focal action of each shot
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(-1.2, -120.0, 3.5))
    cam_target = bpy.context.active_object
    cam_target.name = "Camera_FocalTarget"
    cam_data.dof.focus_object = cam_target

    track = cam_obj.constraints.new(type='TRACK_TO')
    track.target = cam_target
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'

    # Focal target movement along timeline
    focal_pts = [
        (1,    (-1.2, -140.0, 3.5)), # Follows Red Train
        (220,  (-1.2, -90.0,  3.5)),
        (221,  (-1.2, 0.0,    6.0)), # Junction & Signal Gantry
        (440,  (-1.2, 10.0,   6.0)),
        (441,  (-1.2, 35.0,   3.5)), # Tracks & White Train closing
        (700,  (-1.2, 20.0,   3.5)),
        (701,  (-1.2, -26.0,  2.8)), # Red Train brake bogies & sparks
        (1100, (-1.2, -16.0,  2.8)),
        (1101, (-1.2, 0.0,    3.8)), # Center between BOTH stopped trains
        (1698, (-1.2, 0.0,    3.8)),
    ]
    for f, loc in focal_pts:
        cam_target.location = Vector(loc)
        cam_target.keyframe_insert(data_path="location", frame=f)

    shots = [
        # Shot 1: Aerial Chase following Red Train along viaduct (Frames 1 - 220)
        {'sf': 1,    'ef': 220,  'start_pos': (-9.5, -165.0, 8.5), 'end_pos': (-8.5, -95.0, 9.5),   'lens': 28.0},

        # Shot 2: Junction Signal Warning (Frames 221 - 440)
        {'sf': 221,  'ef': 440,  'start_pos': (-7.5, -25.0, 11.5), 'end_pos': (-6.0, 15.0, 12.0),   'lens': 34.0},

        # Shot 3: Low track head-on closing gap (Frames 441 - 700)
        {'sf': 441,  'ef': 700,  'start_pos': (-1.2, -45.0, 3.2),  'end_pos': (-1.2, -15.0, 3.4),   'lens': 45.0},

        # Shot 4: LZB Brake override skidding track cutaway (Frames 701 - 1100)
        {'sf': 701,  'ef': 1100, 'start_pos': (-11.0, -38.0, 5.5), 'end_pos': (-9.5, -18.0, 5.0),   'lens': 34.0},

        # Shot 5: Grand Isometric Clearance Pullout showing BOTH trains (Frames 1101 - 1698)
        {'sf': 1101, 'ef': 1698, 'start_pos': (-22.0, -15.0, 20.0), 'end_pos': (-32.0, 0.0, 28.0), 'lens': 26.0},
    ]

    for s in shots:
        sf = s['sf']
        ef = s['ef']
        sp = Vector(s['start_pos'])
        ep = Vector(s['end_pos'])

        cam_obj.location = sp
        cam_data.lens = s['lens']
        cam_obj.keyframe_insert(data_path="location", frame=sf)
        cam_data.keyframe_insert(data_path="lens", frame=sf)

        cam_obj.location = ep
        cam_data.lens = s['lens']
        cam_obj.keyframe_insert(data_path="location", frame=ef)
        cam_data.keyframe_insert(data_path="lens", frame=ef)

    # Set hard cuts at shot boundaries
    if cam_obj.animation_data and cam_obj.animation_data.action:
        for fcurve in cam_obj.animation_data.action.fcurves:
            for kfp in fcurve.keyframe_points:
                is_boundary = any(s['ef'] == int(kfp.co[0]) for s in shots)
                kfp.interpolation = 'CONSTANT' if is_boundary else 'BEZIER'

def build_scene(output_dir, is_qa=True, total_frames=1698):
    clean_scene()
    root_col = bpy.context.scene.collection

    env_col = build_environment(root_col)
    red_train = build_bullet_train(root_col, "Red_Train", (0.85, 0.08, 0.12, 1), is_reverse=False)
    white_train = build_bullet_train(root_col, "White_Train", (0.92, 0.94, 0.96, 1), is_reverse=True)
    animate_train_simulation(red_train, white_train, total_frames)
    build_telemetry_hud(root_col)
    setup_lighting()
    setup_cinematic_camera(red_train, white_train, total_frames)

    scene = bpy.context.scene
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.fps = 30
    scene.frame_start = 1
    scene.frame_end = total_frames
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 12

    if is_qa:
        os.makedirs(output_dir, exist_ok=True)
        qa_frames = [80, 320, 580, 1050, 1450]
        print("\n📸 Rendering Bullet Train Safety QA Stills...")
        for qf in qa_frames:
            scene.frame_set(qf)
            qa_path = os.path.join(output_dir, f"train_qa_f{qf:04d}.png")
            scene.render.filepath = qa_path
            bpy.ops.render.render(write_still=True)
            print(f"✅ QA Still Rendered: {qa_path}")
    else:
        scene.render.filepath = os.path.join(output_dir, "frame_#####.png")
        scene.render.image_settings.file_format = 'PNG'
        print(f"\n🚀 Rendering Full Bullet Train Sequence ({total_frames} frames)...")
        bpy.ops.render.render(animation=True)
        print("✅ Full 3D Train Animation Render Complete!")

if __name__ == "__main__":
    args = sys.argv
    out_dir = r"D:\New folder (2)\out\train_safety\frames"
    is_qa_mode = True

    if "--" in args:
        user_args = args[args.index("--") + 1:]
        if len(user_args) > 0:
            out_dir = user_args[0]
        if len(user_args) > 1:
            is_qa_mode = (user_args[1].lower() == 'qa')

    build_scene(out_dir, is_qa=is_qa_mode, total_frames=1698)
