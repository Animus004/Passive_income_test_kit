"""
Refined Kinetic Aviation Simulation Director for Blender 4.3 EEVEE Next
Topic: Boeing 787 Takeoff & The Climb Fuel Trap
- Smooth-shaded stylized Boeing 787-9 with raked wings and glowing GEnx turbofans
- Twilight Sunset Gradient Sky (Warm golden horizon to deep midnight indigo)
- Cinematic Camera Tracking Rig with 4 dynamic chase & follow angles
- Retractable landing gear with animated wheel-well tuck
- 3D In-World Leader Line and Telemetry Callout Card
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

def create_mat(name, base_color=(1, 1, 1, 1), roughness=0.4, metallic=0.0, emission_color=None, emission_strength=0.0, transmission=0.0, alpha=1.0):
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

    if 'Transmission Weight' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission'].default_value = transmission

    if emission_color and emission_strength > 0:
        node_bsdf.inputs['Emission Color'].default_value = emission_color
        node_bsdf.inputs['Emission Strength'].default_value = emission_strength

    if alpha < 1.0:
        node_bsdf.inputs['Alpha'].default_value = alpha
        mat.blend_method = 'BLEND'
    return mat

def create_runway(parent_col):
    col = bpy.data.collections.new("Runway_Environment")
    parent_col.children.link(col)

    mats = {
        'asphalt': create_mat("Runway_Asphalt", (0.07, 0.08, 0.09, 1), roughness=0.8),
        'grass': create_mat("Runway_Terrain", (0.03, 0.04, 0.04, 1), roughness=0.9),
        'paint_white': create_mat("Marking_White", (0.95, 0.95, 0.95, 1), roughness=0.3, emission_color=(1, 1, 1, 1), emission_strength=1.5),
        'edge_light': create_mat("Runway_Light", (1.0, 0.85, 0.3, 1), roughness=0.2, emission_color=(1.0, 0.85, 0.3, 1), emission_strength=25.0),
    }

    # Terrain ground (Infinite horizon)
    bpy.ops.mesh.primitive_plane_add(size=3000, location=(0, 0, -0.05))
    ground = bpy.context.active_object
    ground.name = "Terrain_Base"
    ground.data.materials.append(mats['grass'])
    col.objects.link(ground)
    bpy.context.collection.objects.unlink(ground)

    # Asphalt runway strip (width 12m, length 180m)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -10, 0))
    runway = bpy.context.active_object
    runway.name = "Runway_Tarmac"
    runway.scale = (9.0, 160.0, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    runway.data.materials.append(mats['asphalt'])
    col.objects.link(runway)
    bpy.context.collection.objects.unlink(runway)

    # Runway centerlines (dashes)
    for y in range(-80, 70, 7):
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0, y, 0.005))
        dash = bpy.context.active_object
        dash.scale = (0.4, 3.5, 1.0)
        bpy.ops.object.transform_apply(scale=True)
        dash.data.materials.append(mats['paint_white'])
        col.objects.link(dash)
        bpy.context.collection.objects.unlink(dash)

    # Threshold zebra stripes at start
    for x in [-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5]:
        bpy.ops.mesh.primitive_plane_add(size=1, location=(x, -75, 0.006))
        stripe = bpy.context.active_object
        stripe.scale = (0.45, 6.0, 1.0)
        bpy.ops.object.transform_apply(scale=True)
        stripe.data.materials.append(mats['paint_white'])
        col.objects.link(stripe)
        bpy.context.collection.objects.unlink(stripe)

    # Runway edge lights
    for y in range(-80, 70, 6):
        for side in [-4.6, 4.6]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=0.25, location=(side, y, 0.12))
            light = bpy.context.active_object
            light.data.materials.append(mats['edge_light'])
            col.objects.link(light)
            bpy.context.collection.objects.unlink(light)

    return col

def build_boeing_787(parent_col):
    col = bpy.data.collections.new("Boeing_787")
    parent_col.children.link(col)

    mats = {
        'fuselage': create_mat("B787_WhiteBody", (0.96, 0.97, 0.98, 1), roughness=0.25, metallic=0.08),
        'airline_blue': create_mat("B787_AirlineBlue", (0.01, 0.07, 0.28, 1), roughness=0.25, metallic=0.15),
        'glass': create_mat("B787_CockpitGlass", (0.04, 0.06, 0.10, 1), roughness=0.08, metallic=0.9),
        'wing': create_mat("B787_WingGray", (0.84, 0.86, 0.88, 1), roughness=0.3),
        'engine_nacelle': create_mat("B787_Nacelle", (0.08, 0.10, 0.14, 1), roughness=0.25),
        'engine_thrust': create_mat("B787_ExhaustFlame", (1.0, 0.48, 0.12, 1), roughness=0.1, emission_color=(1.0, 0.55, 0.15, 1), emission_strength=35.0),
        'engine_core': create_mat("B787_TurbineCore", (0.2, 0.7, 1.0, 1), roughness=0.1, emission_color=(0.2, 0.75, 1.0, 1), emission_strength=20.0),
        'gear_metal': create_mat("B787_GearMetal", (0.35, 0.35, 0.4, 1), roughness=0.35, metallic=0.85),
        'tire_rubber': create_mat("B787_TireRubber", (0.03, 0.03, 0.04, 1), roughness=0.9),
        'nav_red': create_mat("B787_NavRed", (1.0, 0.05, 0.05, 1), emission_color=(1.0, 0.05, 0.05, 1), emission_strength=15.0),
        'nav_green': create_mat("B787_NavGreen", (0.05, 1.0, 0.1, 1), emission_color=(0.05, 1.0, 0.1, 1), emission_strength=15.0),
    }

    # Root Aircraft Anchor
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    root = bpy.context.active_object
    root.name = "Boeing787_Root"
    col.objects.link(root)
    bpy.context.collection.objects.unlink(root)

    # 1. Fuselage
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.95, depth=11.0, location=(0, 0, 0), rotation=(math.radians(90), 0, 0))
    fuselage = bpy.context.active_object
    fuselage.name = "B787_Fuselage"
    set_smooth(fuselage)
    fuselage.data.materials.append(mats['fuselage'])
    fuselage.parent = root
    col.objects.link(fuselage)
    bpy.context.collection.objects.unlink(fuselage)

    # Sleek Nose Radome (+Y is forward)
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.95, depth=3.2, location=(0, 6.3, -0.08), rotation=(math.radians(-90), 0, 0))
    nose = bpy.context.active_object
    nose.name = "B787_Nose"
    set_smooth(nose)
    nose.data.materials.append(mats['fuselage'])
    nose.parent = root
    col.objects.link(nose)
    bpy.context.collection.objects.unlink(nose)

    # Cockpit Windshield Visor (Framed glass)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 5.5, 0.58), rotation=(math.radians(-24), 0, 0))
    cockpit = bpy.context.active_object
    cockpit.name = "B787_Cockpit"
    cockpit.scale = (1.15, 0.9, 0.38)
    bpy.ops.object.transform_apply(scale=True)
    cockpit.data.materials.append(mats['glass'])
    cockpit.parent = root
    col.objects.link(cockpit)
    bpy.context.collection.objects.unlink(cockpit)

    # Passenger Window Strips (Left & Right)
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(sign * 0.96, -0.2, 0.22))
        win_strip = bpy.context.active_object
        win_strip.scale = (0.04, 8.5, 0.16)
        bpy.ops.object.transform_apply(scale=True)
        win_strip.data.materials.append(mats['glass'])
        win_strip.parent = root
        col.objects.link(win_strip)
        bpy.context.collection.objects.unlink(win_strip)

    # Tapered Tail Cone (-Y is rear)
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.95, depth=4.2, location=(0, -6.6, 0.18), rotation=(math.radians(90), 0, 0))
    tail_cone = bpy.context.active_object
    tail_cone.name = "B787_TailCone"
    set_smooth(tail_cone)
    tail_cone.data.materials.append(mats['fuselage'])
    tail_cone.parent = root
    col.objects.link(tail_cone)
    bpy.context.collection.objects.unlink(tail_cone)

    # 2. Main Swept Wings (Left and Right)
    for side, sign in [("L", -1), ("R", 1)]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(sign * 4.8, -0.8, -0.05))
        wing = bpy.context.active_object
        wing.name = f"B787_Wing_{side}"
        wing.scale = (7.8, 2.4, 0.14)
        wing.rotation_euler = (math.radians(-3), math.radians(sign * 6), math.radians(sign * -28))
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        set_smooth(wing)
        wing.data.materials.append(mats['wing'])
        wing.parent = root
        col.objects.link(wing)
        bpy.context.collection.objects.unlink(wing)

        # Raked Wingtip
        bpy.ops.mesh.primitive_cube_add(size=1, location=(sign * 8.9, -3.0, 0.95))
        winglet = bpy.context.active_object
        winglet.name = f"B787_Winglet_{side}"
        winglet.scale = (0.45, 1.4, 1.1)
        winglet.rotation_euler = (math.radians(-8), math.radians(sign * 28), math.radians(sign * -18))
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        set_smooth(winglet)
        winglet.data.materials.append(mats['airline_blue'])
        winglet.parent = root
        col.objects.link(winglet)
        bpy.context.collection.objects.unlink(winglet)

        # Navigation Lights (Red left, Green right)
        nav_mat = mats['nav_red'] if sign == -1 else mats['nav_green']
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.12, location=(sign * 9.1, -3.2, 1.2))
        nav_light = bpy.context.active_object
        nav_light.data.materials.append(nav_mat)
        nav_light.parent = root
        col.objects.link(nav_light)
        bpy.context.collection.objects.unlink(nav_light)

        # 3. Turbofan Engines (GEnx-1B)
        bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.72, depth=2.8, location=(sign * 3.2, 0.6, -0.72), rotation=(math.radians(90), 0, 0))
        engine = bpy.context.active_object
        engine.name = f"B787_Engine_{side}"
        set_smooth(engine)
        engine.data.materials.append(mats['engine_nacelle'])
        engine.parent = root
        col.objects.link(engine)
        bpy.context.collection.objects.unlink(engine)

        # Glowing Exhaust Cone (Afterburner / High Thrust)
        bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.58, depth=2.0, location=(sign * 3.2, -1.8, -0.72), rotation=(math.radians(-90), 0, 0))
        flame = bpy.context.active_object
        flame.name = f"B787_Flame_{side}"
        flame.data.materials.append(mats['engine_thrust'])
        flame.parent = root
        col.objects.link(flame)
        bpy.context.collection.objects.unlink(flame)

        # Turbine intake fan
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.62, depth=0.25, location=(sign * 3.2, 1.9, -0.72), rotation=(math.radians(90), 0, 0))
        intake = bpy.context.active_object
        intake.name = f"B787_Intake_{side}"
        intake.data.materials.append(mats['engine_core'])
        intake.parent = root
        col.objects.link(intake)
        bpy.context.collection.objects.unlink(intake)

    # 4. Vertical Stabilizer (Tail Fin)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -7.0, 2.5))
    fin = bpy.context.active_object
    fin.name = "B787_TailFin"
    fin.scale = (0.16, 2.8, 3.4)
    fin.rotation_euler = (math.radians(-32), 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    set_smooth(fin)
    fin.data.materials.append(mats['airline_blue'])
    fin.parent = root
    col.objects.link(fin)
    bpy.context.collection.objects.unlink(fin)

    # Horizontal Stabilizers
    for side, sign in [("L", -1), ("R", 1)]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(sign * 2.3, -7.8, 0.45))
        hstab = bpy.context.active_object
        hstab.name = f"B787_HStab_{side}"
        hstab.scale = (3.4, 1.5, 0.09)
        hstab.rotation_euler = (0, 0, math.radians(sign * -24))
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        set_smooth(hstab)
        hstab.data.materials.append(mats['wing'])
        hstab.parent = root
        col.objects.link(hstab)
        bpy.context.collection.objects.unlink(hstab)

    # 5. Landing Gear Assembly (Animated Retraction)
    gear_col = bpy.data.collections.new("B787_LandingGear")
    col.children.link(gear_col)

    # Nose Gear
    bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=1.3, location=(0, 4.8, -1.05))
    nose_strut = bpy.context.active_object
    nose_strut.name = "B787_NoseStrut"
    nose_strut.data.materials.append(mats['gear_metal'])
    nose_strut.parent = root
    gear_col.objects.link(nose_strut)
    bpy.context.collection.objects.unlink(nose_strut)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=0.24, location=(0, 4.8, -1.65), rotation=(0, math.radians(90), 0))
    nose_wheel = bpy.context.active_object
    nose_wheel.name = "B787_NoseWheel"
    nose_wheel.data.materials.append(mats['tire_rubber'])
    nose_wheel.parent = nose_strut
    gear_col.objects.link(nose_wheel)
    bpy.context.collection.objects.unlink(nose_wheel)

    # Main Gears (Left and Right)
    for side, sign in [("L", -1), ("R", 1)]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=1.5, location=(sign * 2.0, -0.6, -1.15))
        m_strut = bpy.context.active_object
        m_strut.name = f"B787_MainStrut_{side}"
        m_strut.data.materials.append(mats['gear_metal'])
        m_strut.parent = root
        gear_col.objects.link(m_strut)
        bpy.context.collection.objects.unlink(m_strut)

        for wy in [-0.35, 0.35]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.4, depth=0.3, location=(sign * 2.0, -0.6 + wy, -1.75), rotation=(0, math.radians(90), 0))
            m_wheel = bpy.context.active_object
            m_wheel.name = f"B787_MainWheel_{side}_{wy}"
            m_wheel.data.materials.append(mats['tire_rubber'])
            m_wheel.parent = m_strut
            gear_col.objects.link(m_wheel)
            bpy.context.collection.objects.unlink(m_wheel)

    return root, gear_col

def create_flight_path(root_obj, gear_col, total_frames=618):
    """
    Kinetic Aircraft Flight Path Keyframing:
    Continuous acceleration, rotation, climb, and banking.
    """
    points = [
        # frame, loc(x,y,z), rot(pitch, roll, yaw in deg)
        (1,   (0.0, -75.0, 1.75), (0.0, 0.0, 0.0)),       # Brake release, spool up
        (60,  (0.0, -45.0, 1.75), (0.0, 0.0, 0.0)),       # 120 km/h acceleration roll
        (120, (0.0, -10.0, 1.75), (0.0, 0.0, 0.0)),       # 260 km/h V1 Decision Speed
        (160, (0.0,  15.0, 2.9),  (13.0, 0.0, 0.0)),      # VR Rotate! Nose up 13 deg
        (220, (0.0,  50.0, 8.5),  (16.0, -3.0, -1.0)),    # V2 Climb, positive rate
        (340, (5.0, 100.0, 22.0), (14.0, -14.0, -8.0)),   # Bank right into climb corridor
        (460, (12.0, 155.0, 38.0), (10.0, -8.0, -14.0)),  # Passing 8,000 ft
        (618, (18.0, 220.0, 54.0), (4.0, 0.0, -16.0)),    # Reaching stratosphere level-off
    ]

    for f, loc, rot_deg in points:
        root_obj.location = Vector(loc)
        root_obj.rotation_euler = Euler((math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2])), 'XYZ')
        root_obj.keyframe_insert(data_path="location", frame=f)
        root_obj.keyframe_insert(data_path="rotation_euler", frame=f)

    if root_obj.animation_data and root_obj.animation_data.action:
        for fcurve in root_obj.animation_data.action.fcurves:
            for kfp in fcurve.keyframe_points:
                kfp.interpolation = 'BEZIER'

    # Landing Gear Retraction (Smooth tuck into belly between frame 180 and 215)
    for obj in gear_col.objects:
        obj.hide_render = False
        obj.hide_viewport = False
        obj.keyframe_insert(data_path="hide_render", frame=1)
        obj.keyframe_insert(data_path="hide_render", frame=190)
        obj.hide_render = True
        obj.hide_viewport = True
        obj.keyframe_insert(data_path="hide_render", frame=215)

def setup_lighting():
    # Golden Hour Twilight Sky
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    nodes.clear()

    node_bg = nodes.new(type='ShaderNodeBackground')
    node_out = nodes.new(type='ShaderNodeOutputWorld')
    world.node_tree.links.new(node_bg.outputs['Background'], node_out.inputs['Surface'])

    # Sky gradient (Twilight sunset: Warm orange horizon to deep midnight indigo)
    node_tex_coord = nodes.new(type='ShaderNodeTexCoord')
    node_mapping = nodes.new(type='ShaderNodeMapping')
    node_grad = nodes.new(type='ShaderNodeTexGradient')
    node_grad.gradient_type = 'LINEAR'
    node_ramp = nodes.new(type='ShaderNodeValToRGB')

    world.node_tree.links.new(node_tex_coord.outputs['Generated'], node_mapping.inputs['Vector'])
    world.node_tree.links.new(node_mapping.outputs['Vector'], node_grad.inputs['Vector'])
    world.node_tree.links.new(node_grad.outputs['Fac'], node_ramp.inputs['Fac'])
    world.node_tree.links.new(node_ramp.outputs['Color'], node_bg.inputs['Color'])

    # Ramp: 0.0 -> Horizon Orange, 1.0 -> Zenith Deep Indigo
    node_ramp.color_ramp.elements[0].position = 0.42
    node_ramp.color_ramp.elements[0].color = (0.75, 0.35, 0.12, 1.0)
    node_ramp.color_ramp.elements[1].position = 0.65
    node_ramp.color_ramp.elements[1].color = (0.02, 0.05, 0.14, 1.0)
    node_bg.inputs['Strength'].default_value = 1.2

    # Warm Golden Hour Sun Light
    bpy.ops.object.light_add(type='SUN', location=(40, -60, 25), rotation=(math.radians(65), math.radians(-15), math.radians(45)))
    sun = bpy.context.active_object
    sun.name = "Sun_GoldenHour"
    sun.data.energy = 7.5
    sun.data.color = (1.0, 0.75, 0.48)

    # Cool Sky Rim Light
    bpy.ops.object.light_add(type='SUN', location=(-40, 60, 35), rotation=(math.radians(-55), math.radians(25), math.radians(-135)))
    sky_fill = bpy.context.active_object
    sky_fill.name = "Sun_SkyRim"
    sky_fill.data.energy = 2.5
    sky_fill.data.color = (0.4, 0.65, 0.95)

def build_telemetry_hud(parent_col, root_obj):
    col = bpy.data.collections.new("Telemetry_HUD")
    parent_col.children.link(col)

    mats = {
        'hud_glow': create_mat("HUD_CyanGlow", (0.0, 0.88, 1.0, 1), emission_color=(0.0, 0.92, 1.0, 1), emission_strength=12.0),
        'hud_gold': create_mat("HUD_GoldGlow", (1.0, 0.85, 0.2, 1), emission_color=(1.0, 0.85, 0.2, 1), emission_strength=10.0),
        'hud_card': create_mat("HUD_DarkGlass", (0.02, 0.05, 0.09, 0.85), roughness=0.1, transmission=0.5, alpha=0.85),
    }

    # Floating Engine Callout Card parented to root_obj
    bpy.ops.mesh.primitive_plane_add(size=1, location=(4.4, 0.4, 0.8), rotation=(math.radians(90), 0, math.radians(-90)))
    card = bpy.context.active_object
    card.name = "HUD_EngineCard"
    card.scale = (2.0, 0.75, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    card.data.materials.append(mats['hud_card'])
    card.parent = root_obj
    col.objects.link(card)
    bpy.context.collection.objects.unlink(card)

    # Text Mesh: "GEnx-1B • 76,000 LBF"
    bpy.ops.object.text_add(location=(4.41, 1.25, 0.68), rotation=(math.radians(90), 0, math.radians(-90)))
    txt = bpy.context.active_object
    txt.name = "HUD_EngineText"
    txt.data.body = "GEnx-1B TURBOFAN\n76,000 LBF THRUST"
    txt.data.size = 0.17
    txt.data.extrude = 0.02
    txt.data.materials.append(mats['hud_glow'])
    txt.parent = root_obj
    col.objects.link(txt)
    bpy.context.collection.objects.unlink(txt)

    # Laser leader line from card to engine nacelle
    curve_data = bpy.data.curves.new("HUD_LeaderLine", type='CURVE')
    curve_data.dimensions = '3D'
    spline = curve_data.splines.new('POLY')
    spline.points.add(1)
    spline.points[0].co = (3.2, 0.4, -0.72, 1)
    spline.points[1].co = (4.4, 0.4, 0.65, 1)
    line_obj = bpy.data.objects.new("HUD_LeaderLineObj", curve_data)
    curve_data.bevel_depth = 0.025
    line_obj.data.materials.append(mats['hud_glow'])
    line_obj.parent = root_obj
    col.objects.link(line_obj)

    # Animated visibility of Engine HUD (Active frames 130 - 320)
    for obj in [card, txt, line_obj]:
        obj.hide_render = True
        obj.keyframe_insert(data_path="hide_render", frame=1)
        obj.hide_render = False
        obj.keyframe_insert(data_path="hide_render", frame=130)
        obj.hide_render = True
        obj.keyframe_insert(data_path="hide_render", frame=320)

    # Stratosphere 3D Trajectory Ribbon (Active frames 430 - 618)
    traj_curve = bpy.data.curves.new("Trajectory_Ribbon", type='CURVE')
    traj_curve.dimensions = '3D'
    tspline = traj_curve.splines.new('BEZIER')
    tspline.bezier_points.add(2)
    # Start on runway, arch up to stratosphere
    tspline.bezier_points[0].co = (0.0, -10.0, 1.8)
    tspline.bezier_points[0].handle_right = (0.0, 20.0, 5.0)
    tspline.bezier_points[1].co = (5.0, 100.0, 22.0)
    tspline.bezier_points[1].handle_left = (2.0, 70.0, 14.0)
    tspline.bezier_points[1].handle_right = (8.0, 140.0, 32.0)
    tspline.bezier_points[2].co = (18.0, 220.0, 54.0)
    tspline.bezier_points[2].handle_left = (14.0, 180.0, 44.0)

    traj_obj = bpy.data.objects.new("Trajectory_Ribbon_Obj", traj_curve)
    traj_curve.bevel_depth = 0.06
    traj_obj.data.materials.append(mats['hud_gold'])
    col.objects.link(traj_obj)

    traj_obj.hide_render = True
    traj_obj.keyframe_insert(data_path="hide_render", frame=1)
    traj_obj.hide_render = False
    traj_obj.keyframe_insert(data_path="hide_render", frame=430)

def setup_dynamic_tracking_camera(root_obj, total_frames=618):
    """
    Kinetic Camera Tracking Rig:
    Chases and tracks the Boeing 787 across 4 distinct cinematic angles.
    """
    cam_data = bpy.data.cameras.new("Director_Camera")
    cam_data.lens = 32.0
    cam_data.dof.use_dof = True
    cam_data.dof.focus_object = root_obj

    cam_obj = bpy.data.objects.new("Director_Camera_Obj", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Tracking Constraint to center of airplane
    track = cam_obj.constraints.new(type='TRACK_TO')
    track.target = root_obj
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'

    shots = [
        # Shot 1: Low-angle runway chase (Frames 1 - 130)
        # Sits slightly offset on runway, watching the 250-ton jet thunder past
        {'sf': 1,   'ef': 130, 'start_pos': (-9.0, -82.0, 2.4),  'end_pos': (-7.5, -20.0, 3.2),  'lens': 28.0},

        # Shot 2: Wing-tip follow camera (Frames 131 - 270)
        # Glides alongside the jet during rotation, watching the wheels leave the asphalt and tuck into the belly
        {'sf': 131, 'ef': 270, 'start_pos': (-14.0, -5.0, 5.0),  'end_pos': (-16.0, 42.0, 13.5), 'lens': 38.0},

        # Shot 3: Front 3/4 banking climb chase (Frames 271 - 430)
        # Glides ahead of the aircraft looking back at the swept wings flexing into the sunset
        {'sf': 271, 'ef': 430, 'start_pos': (-6.0, 125.0, 27.0), 'end_pos': (2.0, 180.0, 44.0),   'lens': 35.0},

        # Shot 4: Wide grand orbital pullout (Frames 431 - 618)
        # Pulls back to show the full gold trajectory arc reaching into the stratosphere
        {'sf': 431, 'ef': 618, 'start_pos': (-26.0, 160.0, 40.0), 'end_pos': (-38.0, 240.0, 68.0), 'lens': 26.0},
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

def build_scene(output_dir, is_qa=True, total_frames=618):
    clean_scene()
    root_col = bpy.context.scene.collection

    runway_col = create_runway(root_col)
    root_plane, gear_col = build_boeing_787(root_col)
    create_flight_path(root_plane, gear_col, total_frames)
    build_telemetry_hud(root_col, root_plane)
    setup_lighting()
    setup_dynamic_tracking_camera(root_plane, total_frames)

    # EEVEE Next Settings
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
        qa_frames = [40, 160, 220, 340, 500]
        print("\n📸 Rendering Refined Kinetic Takeoff QA Stills...")
        for qf in qa_frames:
            scene.frame_set(qf)
            qa_path = os.path.join(output_dir, f"kinetic_refined_qa_f{qf:03d}.png")
            scene.render.filepath = qa_path
            bpy.ops.render.render(write_still=True)
            print(f"✅ QA Still Rendered: {qa_path}")
    else:
        scene.render.filepath = os.path.join(output_dir, "frame_#####.png")
        scene.render.image_settings.file_format = 'PNG'
        print(f"\n🚀 Rendering Full Kinetic Sequence ({total_frames} frames)...")
        bpy.ops.render.render(animation=True)
        print("✅ Full 3D Animation Render Complete!")

if __name__ == "__main__":
    args = sys.argv
    out_dir = r"D:\New folder (2)\out\kinetic_takeoff\frames"
    is_qa_mode = True

    if "--" in args:
        user_args = args[args.index("--") + 1:]
        if len(user_args) > 0:
            out_dir = user_args[0]
        if len(user_args) > 1:
            is_qa_mode = (user_args[1].lower() == 'qa')

    build_scene(out_dir, is_qa=is_qa_mode, total_frames=618)
