"""
Production Systems & Hidden Engineering 3D Director Engine
Blender 4.3 EEVEE Next GPU

Implements Full Mechanical Storytelling Arc & Word-by-Word Narration Sync:
1. Shot 0: High-Speed Alpine Cruise (Bullet train tearing past snow-capped mountains and clean pines).
2. Shot 1: Thermal Melt Breakdown (Extreme macro cutaway on ventilated brake disc glowing incandescent cherry red/white hot, T > 1500°C) with High-Tech Holographic Thermal Hazard Callout.
3. Shot 2: Ballast LZB Inductive Safety Net (Subsurface dive into gravel revealing glowing cables and pulsing cyan data flux) with LZB Telemetry Callout.
4. Shot 3: High-Tech Cockpit HUD Interior (Camera inside driver's cab looking through 3 glowing MFD HUD screens: parabolic braking curve graph, radar, speed telemetry, out curved windshield).
5. Shot 4: Bogie Traction Motor Reverse Flux (Cutaway of motor bogie with reverse polarity cyan/blue flux rings around axle) with Regenerative Braking Callout.
6. Shot 5: Regenerative Power Return to Catenary (Tracking electrical surge up pantograph into overhead catenary wire) with Grid Feedback Callout.
7. Shot 6: Physical Electromagnetic Track Brake Drop (Orange magnetic brake shoe drops 180mm flush onto steel rail) with Clamping Force Callout.
8. Shot 7: Molten Contact Friction & 20-Piece Spark Shower (Contact patch flares white-hot, multi-particle kinetic sparks spraying backward along rail) with Friction & Energy Dissipation Callout.
9. Shot 8: Pneumatic Caliper Clamp & 0 RPM Standstill (Brembo caliper clamps down, wheel and ventilated disc decelerate to dead halt at 0 RPM) with 0 RPM Standstill Callout.
10. Shot 9: Grand 3/4 Diagonal Aerial Crane Zoom-Out Climax (Ultra-wide crane reveals BOTH bullet trains safely stopped facing each other head-to-head with 9.5m clearance gap) with Holographic Neon Cyan Dimension Bar & Collision Averted Callouts.
"""

import os
import sys
import math
import json
from mathutils import Vector, Euler
import bpy

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.append(CURRENT_DIR)

import asset_library_manager as alm
import cutaway_engine as ce

def make_fcurves_linear(obj):
    """Ensures 100% linear, non-overshooting keyframe interpolation for mechanical precision."""
    if obj and obj.animation_data and obj.animation_data.action:
        for fc in obj.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = 'LINEAR'
                kp.handle_left_type = 'VECTOR'
                kp.handle_right_type = 'VECTOR'

def build_snowcapped_alpine_range(distance=85.0, peak_height=52.0):
    """Builds majestic distant mountains with rocky bases and white snow caps."""
    mesh = bpy.data.meshes.new("AlpinePeaks")
    obj = bpy.data.objects.new("AlpinePeaks", mesh)
    bpy.context.scene.collection.objects.link(obj)

    xs = [-140, -110, -80, -50, -20, 10, 40, 70, 100, 130, 160]
    heights = [0, 32, 18, 46, 26, 52, 24, 42, 20, 34, 0]
    scaled_heights = [h * (peak_height / 52.0) for h in heights]

    verts, faces = [], []
    for i, (x, h) in enumerate(zip(xs, scaled_heights)):
        verts.append((x, distance, -10.0))          # Base
        verts.append((x, distance + 8.0, h * 0.52)) # Mid rock
        verts.append((x, distance + 16.0, h))       # Snow peak

    for i in range(len(xs) - 1):
        b1, m1, p1 = i*3, i*3+1, i*3+2
        b2, m2, p2 = (i+1)*3, (i+1)*3+1, (i+1)*3+2
        faces.append((b1, b2, m2, m1)) # Lower rock
        faces.append((m1, m2, p2, p1)) # Upper snow cap

    mesh.from_pydata(verts, [], faces)
    mesh.update()

    mat_rock = bpy.data.materials.new("AlpineRock")
    mat_rock.use_nodes = True
    mat_rock.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.35, 0.38, 0.42, 1.0)
    mat_rock.node_tree.nodes.get("Principled BSDF").inputs['Roughness'].default_value = 0.95

    mat_snow = bpy.data.materials.new("AlpineSnow")
    mat_snow.use_nodes = True
    mat_snow.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.94, 0.96, 0.99, 1.0)
    mat_snow.node_tree.nodes.get("Principled BSDF").inputs['Roughness'].default_value = 0.25

    mesh.materials.append(mat_rock)
    mesh.materials.append(mat_snow)

    for i, poly in enumerate(mesh.polygons):
        poly.material_index = 0 if i % 2 == 0 else 1

    return obj

def build_procedural_pine_tree(name, location, height=6.5):
    """Builds a tall, upright pine tree with a slender brown trunk and lush evergreen conical foliage."""
    pine_empty = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(pine_empty)
    pine_empty.location = location

    # Upright slender trunk
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.18, depth=height * 0.45,
        location=(location[0], location[1], location[2] + height * 0.22)
    )
    trunk = bpy.context.active_object
    trunk.name = f"{name}_Trunk"
    trunk.parent = pine_empty

    mat_trunk = bpy.data.materials.new(f"{name}_Bark")
    mat_trunk.use_nodes = True
    mat_trunk.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.28, 0.18, 0.12, 1.0)
    trunk.data.materials.append(mat_trunk)

    # 3 tiers of conical pine needles
    mat_foliage = bpy.data.materials.new(f"{name}_Foliage")
    mat_foliage.use_nodes = True
    mat_foliage.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.08, 0.26, 0.12, 1.0)
    mat_foliage.node_tree.nodes.get("Principled BSDF").inputs['Roughness'].default_value = 0.7

    tier_specs = [
        (height * 0.38, 1.35, height * 0.35),
        (height * 0.60, 1.05, height * 0.32),
        (height * 0.80, 0.70, height * 0.28)
    ]
    for idx, (z_off, rad, cone_h) in enumerate(tier_specs):
        bpy.ops.mesh.primitive_cone_add(
            radius1=rad, depth=cone_h,
            location=(location[0], location[1], location[2] + z_off + cone_h * 0.5)
        )
        tier = bpy.context.active_object
        tier.name = f"{name}_Tier_{idx}"
        tier.parent = pine_empty
        tier.data.materials.append(mat_foliage)

    return pine_empty

def get_train_y(f, brake_actuate_frame=975, brake_stop_frame=1487):
    """
    Computes exact continuous trajectory along track (Y axis):
    - Frame 1 to brake_actuate_frame: Constant cruising speed (320 km/h = 1.0 m/frame)
    - Frame brake_actuate_frame to brake_stop_frame: Smooth physical deceleration down to 0 m/s
    - Frame brake_stop_frame onwards: Dead halt locked at Y=50.0m
    """
    if f <= brake_actuate_frame:
        return (f - 1.0) * (32.78 / (brake_actuate_frame - 1.0))
    elif f <= brake_stop_frame:
        y_cruise = 32.78
        t = (f - brake_actuate_frame) / float(brake_stop_frame - brake_actuate_frame)
        return y_cruise + (50.0 - y_cruise) * (1.0 - (1.0 - t) ** 2)
    else:
        return 50.0

def build_scene(manifest_path, output_path, is_qa_mode=False):
    """
    Constructs the entire 1650-frame Systems Engineering sequence in Blender.
    """
    print(f"🎬 Initializing Systems Engineering Director for: {manifest_path}")
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    shots = manifest.get('shots', [])
    total_frames = manifest.get('totalFrames', 1650)
    fps = manifest.get('fps', 30)

    # 1. Clear default scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 8
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.fps = fps
    scene.frame_start = 1
    scene.frame_end = total_frames

    # Cinematic Lighting & World Sky
    world = bpy.data.worlds.new("AlpineSkyWorld")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs['Color'].default_value = (0.75, 0.86, 0.96, 1.0) # Crisp alpine sky
    bg.inputs['Strength'].default_value = 1.15

    # Key Directional Sun Light
    bpy.ops.object.light_add(type='SUN', location=(15.0, -15.0, 30.0))
    sun = bpy.context.active_object
    sun.data.energy = 4.2
    sun.data.color = (1.0, 0.98, 0.92) # Warm natural sunlight
    sun.rotation_euler = (math.radians(48), math.radians(22), math.radians(35))

    # Ambient Fill Light
    bpy.ops.object.light_add(type='SUN', location=(-20.0, 20.0, 25.0))
    fill = bpy.context.active_object
    fill.data.energy = 1.2
    fill.data.color = (0.65, 0.78, 0.95)
    fill.rotation_euler = (math.radians(-30), math.radians(-45), 0)

    # 2. Majestic Alpine Environment & Tall Pine Forest
    build_snowcapped_alpine_range(distance=75.0, peak_height=48.0)
    build_snowcapped_alpine_range(distance=110.0, peak_height=65.0)

    pine_glb = os.path.join(alm.DOWNLOADS_DIR, "Pine_Trees_Pack_e1e9c07b", "Pine_Trees_Pack.glb")
    base_tree_root = None
    if pine_glb and os.path.exists(pine_glb):
        before = set(scene.objects)
        bpy.ops.import_scene.gltf(filepath=pine_glb)
        new_objs = list(set(scene.objects) - before)
        if new_objs:
            base_tree_root = [o for o in new_objs if o.parent is None][0]
            for o in list(new_objs):
                o.visible_shadow = False
                if any(term in o.name.lower() for term in ['checker', 'ref_plane', 'plane']):
                    try:
                        bpy.data.objects.remove(o, do_unlink=True)
                    except Exception:
                        pass

    # Plant 40 tall evergreen pine trees at safe clearance (> 2.8m from rail center)
    for i in range(40):
        side = -1 if i % 2 == 0 else 1
        x_pos = side * (3.4 + (i % 5) * 0.9)
        y_pos = -25.0 + (i * 3.8)
        tree_name = f"PineTree_{i:02d}"

        if base_tree_root and i == 0:
            base_tree_root.name = tree_name
            base_tree_root.location = (x_pos, y_pos, 0.0)
            base_tree_root.scale = (0.85, 0.85, 0.95)
        elif base_tree_root:
            new_tree = base_tree_root.copy()
            new_tree.name = tree_name
            new_tree.location = (x_pos, y_pos, 0.0)
            new_tree.scale = (0.85, 0.85, 0.95 + (i % 3) * 0.2)
            scene.collection.objects.link(new_tree)
            for child in base_tree_root.children:
                c_copy = child.copy()
                c_copy.parent = new_tree
                scene.collection.objects.link(c_copy)
        else:
            build_procedural_pine_tree(tree_name, (x_pos, y_pos, 0.0), height=6.0 + (i % 4) * 0.8)

    # 3. Modern High-Speed Ballast Track, Polished Steel Rails, and Subsurface LZB Inductive Cables
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 45.0, 0.05))
    ballast = bpy.context.active_object
    ballast.name = "Ballast_Trackbed"
    ballast.scale = (5.6, 150.0, 0.35)
    mat_b = bpy.data.materials.new("Ballast")
    mat_b.use_nodes = True
    mat_b.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.32, 0.32, 0.35, 1.0)
    ballast.data.materials.append(mat_b)

    # Concrete Sleepers
    mat_tie = bpy.data.materials.new("Tie")
    mat_tie.use_nodes = True
    mat_tie.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.58, 0.58, 0.60, 1.0)

    for y in range(-30, 120, 2):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, y * 0.75, 0.25))
        tie = bpy.context.active_object
        tie.scale = (3.2, 0.28, 0.15)
        tie.data.materials.append(mat_tie)

    # Polished Steel Rails
    mat_steel = bpy.data.materials.new("Steel")
    mat_steel.use_nodes = True
    bsdf_st = mat_steel.node_tree.nodes.get("Principled BSDF")
    bsdf_st.inputs['Base Color'].default_value = (0.92, 0.95, 0.98, 1.0)
    bsdf_st.inputs['Metallic'].default_value = 0.98
    bsdf_st.inputs['Roughness'].default_value = 0.12

    for rx in [-0.95, 0.95]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=150.0, location=(rx, 45.0, 0.38))
        rail = bpy.context.active_object
        rail.rotation_euler = (math.radians(90), 0, 0)
        rail.data.materials.append(mat_steel)

    # Subsurface LZB Inductive Cables (Safety Net)
    mat_cable = bpy.data.materials.new("Cable")
    mat_cable.use_nodes = True
    bsdf_cab = mat_cable.node_tree.nodes.get("Principled BSDF")
    bsdf_cab.inputs['Base Color'].default_value = (0.98, 0.50, 0.10, 1.0)
    bsdf_cab.inputs['Metallic'].default_value = 0.92
    bsdf_cab.inputs['Emission Color'].default_value = (0.98, 0.50, 0.10, 1.0)
    bsdf_cab.inputs['Emission Strength'].default_value = 1.8

    for cx in [-0.22, 0.22]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=150.0, location=(cx, 45.0, 0.23))
        cable = bpy.context.active_object
        cable.rotation_euler = (math.radians(90), 0, 0)
        cable.data.materials.append(mat_cable)

    # Subsurface Pulsing Cyan Data Flux Rings along track for Shot 2
    flux_rings = []
    mat_flux = bpy.data.materials.new("FluxRingMat")
    mat_flux.use_nodes = True
    bsdf_fx = mat_flux.node_tree.nodes.get("Principled BSDF")
    bsdf_fx.inputs['Base Color'].default_value = (0.0, 0.85, 1.0, 1.0)
    bsdf_fx.inputs['Emission Color'].default_value = (0.0, 0.95, 1.0, 1.0)
    bsdf_fx.inputs['Emission Strength'].default_value = 12.0

    for fi in range(8):
        fy = 5.0 + fi * 2.8
        bpy.ops.mesh.primitive_torus_add(major_radius=0.45, minor_radius=0.022, location=(0.0, fy, 0.30))
        fr = bpy.context.active_object
        fr.data.materials.append(mat_flux)
        flux_rings.append(fr)

    # Dynamic Timing: Locate brake actuation and stop points from manifest
    brake_actuate_frame = 975   # Shot 6 start (electromagnetic brake drop)
    brake_stop_frame = 1487     # Shot 8 end (complete standstill)

    for s in shots:
        if s.get('shotIndex') == 6:
            brake_actuate_frame = s['startFrame']
        if s.get('shotIndex') == 8:
            brake_stop_frame = s['endFrame']

    clamp_f = brake_actuate_frame + min(24, (brake_stop_frame - brake_actuate_frame) // 2)
    print(f"   • Dynamic Brake Sequence: Cruise (f1..{brake_actuate_frame}) -> Drop & Friction (f{brake_actuate_frame}..{brake_stop_frame}) -> Halt (f{brake_stop_frame}..{total_frames})")

    # Master analytical keyframe schedule
    cruise_frames = [1, 139, 216, 294, 300, 384, 468, 474, 555, 636, 642, 726, 810, 816, 892, 969, brake_actuate_frame]
    decel_frames = list(range(brake_actuate_frame, brake_stop_frame + 1, 20)) + [brake_stop_frame]
    shot_mid_frames = [(s['startFrame'] + s['endFrame']) // 2 for s in shots]
    shot_start_frames = [s['startFrame'] for s in shots]
    shot_end_frames = [s['endFrame'] for s in shots]
    cockpit_dense = list(range(shots[3]['startFrame'], shots[3]['endFrame'] + 1, 10)) if len(shots) > 3 else []
    sync_frames = sorted(list(set(cruise_frames + decel_frames + shot_mid_frames + shot_start_frames + shot_end_frames + cockpit_dense + [total_frames])))

    # Initialize Master Camera & Focal Target Early so Billboard Callouts can target it
    cam_data = bpy.data.cameras.new("DirectorCam")
    cam_data.lens = 28 # Cinematic lens
    cam_obj = bpy.data.objects.new("DirectorCam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    focal_target = bpy.data.objects.new("Camera_FocalTarget", None)
    scene.collection.objects.link(focal_target)
    focal_target.location = (0, -2.0, 1.2)

    cam_track = cam_obj.constraints.new(type='TRACK_TO')
    cam_track.target = focal_target
    cam_track.track_axis = 'TRACK_NEGATIVE_Z'
    cam_track.up_axis = 'UP_Y'

    # 4. Hero Bullet Train Model + Mechanical Bogie
    train_glb = os.path.join(alm.DOWNLOADS_DIR, "Bullet_Train_Poly_af454108", "Bullet_Train_Poly.glb")
    bogie_path = os.path.join(alm.DOWNLOADS_DIR, "Bogie_Type_Y25_59b720c2", "Bogie_Type_Y25.glb")

    # Create Hero Train Root Empty
    hero_empty = bpy.data.objects.new("Hero_Train_Root", None)
    scene.collection.objects.link(hero_empty)
    hero_empty.scale = (0.85, 0.85, 0.85)
    hero_empty.rotation_euler = (0, 0, math.radians(180)) # Nose points forward in +Y

    if os.path.exists(train_glb):
        before = set(scene.objects)
        bpy.ops.import_scene.gltf(filepath=train_glb)
        hero_body = [o for o in list(set(scene.objects) - before) if o.parent is None][0]
        hero_body.parent = hero_empty
        hero_body.location = (0, 0, 0)

    if os.path.exists(bogie_path):
        before_b = set(scene.objects)
        bpy.ops.import_scene.gltf(filepath=bogie_path)
        hero_bogie = [o for o in list(set(scene.objects) - before_b) if o.parent is None][0]
        hero_bogie.parent = hero_empty
        hero_bogie.location = (0, 0, -1.03) # Sits on rails beneath bullet train

    # Animate Hero Train Movement along Y using exact analytical trajectory at every sync frame:
    for f in sync_frames:
        yf = get_train_y(f, brake_actuate_frame, brake_stop_frame)
        hero_empty.location = (0.0, yf, 1.85)
        hero_empty.keyframe_insert(data_path="location", frame=f)

    make_fcurves_linear(hero_empty)

    # 4B. High-Performance Ventilated Brake Disc & Caliper on Wheel Axle
    bpy.ops.mesh.primitive_cylinder_add(radius=0.42, depth=0.06, location=(0.82, -5.0, 0.82))
    brake_disc = bpy.context.active_object
    brake_disc.name = "Ventilated_Brake_Disc"
    brake_disc.rotation_euler = (0, math.radians(90), 0)

    mat_disc = bpy.data.materials.new("DiscSteel")
    mat_disc.use_nodes = True
    bsdf_d = mat_disc.node_tree.nodes.get("Principled BSDF")
    bsdf_d.inputs['Base Color'].default_value = (0.78, 0.80, 0.84, 1.0)
    bsdf_d.inputs['Metallic'].default_value = 0.95
    bsdf_d.inputs['Roughness'].default_value = 0.22
    bsdf_d.inputs['Emission Color'].default_value = (1.0, 0.25, 0.05, 1.0)
    bsdf_d.inputs['Emission Strength'].default_value = 0.0
    brake_disc.data.materials.append(mat_disc)

    # Keyframe Thermal Melt Glow on Disc during Shot 1 (f139..294):
    bsdf_d.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=1)
    bsdf_d.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=138)
    bsdf_d.inputs['Emission Strength'].default_value = 45.0 # Molten cherry-red to incandescent white!
    bsdf_d.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=216)
    bsdf_d.inputs['Emission Strength'].default_value = 0.0
    bsdf_d.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=294)

    # Brembo Red Brake Caliper
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.82, -4.78, 1.10))
    caliper = bpy.context.active_object
    caliper.scale = (0.16, 0.28, 0.22)
    mat_caliper = bpy.data.materials.new("CaliperMat")
    mat_caliper.use_nodes = True
    mat_caliper.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.85, 0.15, 0.1, 1.0)
    caliper.data.materials.append(mat_caliper)

    # Animate Ventilated Disc & Caliper Location along track (Y axis):
    for f in sync_frames:
        y_pos = get_train_y(f, brake_actuate_frame, brake_stop_frame)
        brake_disc.location = (0.82, y_pos, 0.82)
        brake_disc.keyframe_insert(data_path="location", frame=f)
        caliper.location = (0.82, y_pos + 0.15, 1.05)
        caliper.keyframe_insert(data_path="location", frame=f)

    make_fcurves_linear(brake_disc)
    make_fcurves_linear(caliper)

    # Animate Physical Wheel / Disc Rapid Rotation & Locking at 0 RPM:
    cruise_revs = (brake_actuate_frame - 1) * 0.35
    brake_disc.rotation_euler = (0, math.radians(90), 0)
    brake_disc.keyframe_insert(data_path="rotation_euler", frame=1)

    brake_disc.rotation_euler = (cruise_revs * 2.0 * math.pi, math.radians(90), 0)
    brake_disc.keyframe_insert(data_path="rotation_euler", frame=brake_actuate_frame)

    stop_revs = cruise_revs + (brake_stop_frame - brake_actuate_frame) * 0.08
    brake_disc.rotation_euler = (stop_revs * 2.0 * math.pi, math.radians(90), 0)
    brake_disc.keyframe_insert(data_path="rotation_euler", frame=brake_stop_frame)

    brake_disc.rotation_euler = (stop_revs * 2.0 * math.pi, math.radians(90), 0) # LOCKED SOLID AT 0 RPM!
    brake_disc.keyframe_insert(data_path="rotation_euler", frame=total_frames)

    # =========================================================================
    # 4C. HIGH-TECH COCKPIT INTERIOR & GLASS MFD HUD SUITE (ACTIVE IN SHOT 3: "ONBOARD COMPUTERS")
    # =========================================================================
    y_1 = get_train_y(1, brake_actuate_frame, brake_stop_frame)

    # Cockpit Dashboard Base Console
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, y_1 + 3.65, 1.95))
    dash = bpy.context.active_object
    dash.name = "Cockpit_Dashboard"
    dash.scale = (1.6, 0.55, 0.35)
    mat_dash = bpy.data.materials.new("DashMat")
    mat_dash.use_nodes = True
    mat_dash.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.035, 0.045, 0.065, 1.0)
    mat_dash.node_tree.nodes.get("Principled BSDF").inputs['Roughness'].default_value = 0.5
    dash.data.materials.append(mat_dash)

    cockpit_props = [dash]

    def add_cockpit_text(name, body, location, scale=0.018, color=(0.0, 0.95, 1.0, 1.0), emission=6.0, rot=(math.radians(90), 0, 0)):
        bpy.ops.object.text_add(location=location)
        txt = bpy.context.active_object
        txt.name = name
        txt.data.body = body
        txt.data.size = scale
        txt.rotation_euler = rot
        txt.visible_shadow = False
        mat = bpy.data.materials.new(f"{name}_Mat")
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Emission Color'].default_value = color
        bsdf.inputs['Emission Strength'].default_value = emission
        txt.data.materials.append(mat)
        return txt

    def create_cockpit_mfd(name, center, size, border_color, border_emission=7.0, rot_z=0.0):
        # Dark glass panel
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=center)
        bezel = bpy.context.active_object
        bezel.name = f"{name}_Bezel"
        bezel.scale = size
        bezel.rotation_euler = (0, 0, rot_z)
        bezel.visible_shadow = False
        mat_b = bpy.data.materials.new(f"{name}_BezelMat")
        mat_b.use_nodes = True
        b_bsdf = mat_b.node_tree.nodes.get("Principled BSDF")
        b_bsdf.inputs['Base Color'].default_value = (0.015, 0.022, 0.035, 1.0)
        b_bsdf.inputs['Roughness'].default_value = 0.2
        bezel.data.materials.append(mat_b)

        # Wireframe border outline
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(center[0], center[1] - 0.005, center[2]))
        border = bpy.context.active_object
        border.name = f"{name}_Border"
        border.scale = (size[0] + 0.008, size[1] * 0.5, size[2] + 0.008)
        border.rotation_euler = (0, 0, rot_z)
        border.visible_shadow = False
        mod = border.modifiers.new(name="Wireframe", type='WIREFRAME')
        mod.thickness = 0.004

        mat_br = bpy.data.materials.new(f"{name}_BorderMat")
        mat_br.use_nodes = True
        br_bsdf = mat_br.node_tree.nodes.get("Principled BSDF")
        br_bsdf.inputs['Base Color'].default_value = border_color
        br_bsdf.inputs['Emission Color'].default_value = border_color
        br_bsdf.inputs['Emission Strength'].default_value = border_emission
        border.data.materials.append(mat_br)
        return bezel, border

    # 1. CENTER SCREEN: BRAKING CURVE DISPLAY
    c_center = (0.0, y_1 + 3.58, 2.22)
    b_c, br_c = create_cockpit_mfd("CenterMFD", c_center, (0.36, 0.02, 0.24), (0.0, 0.95, 1.0, 1.0), border_emission=7.0)
    cockpit_props.extend([b_c, br_c])

    # Parabolic Braking Curve 3D Mesh
    curve_data = bpy.data.curves.new('BrakingCurve', type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.bevel_depth = 0.005
    curve_data.bevel_resolution = 4
    polyline = curve_data.splines.new('POLY')
    num_pts = 16
    polyline.points.add(num_pts - 1)
    for idx in range(num_pts):
        u = idx / float(num_pts - 1)
        px = -0.14 + 0.28 * u
        py = y_1 + 3.565
        pz = 2.14 + 0.12 * (1.0 - (u ** 1.8))
        polyline.points[idx].co = (px, py, pz, 1.0)

    braking_curve_obj = bpy.data.objects.new('BrakingCurveObj', curve_data)
    scene.collection.objects.link(braking_curve_obj)
    braking_curve_obj.visible_shadow = False
    mat_curve = bpy.data.materials.new("CurveMat")
    mat_curve.use_nodes = True
    c_bsdf = mat_curve.node_tree.nodes.get("Principled BSDF")
    c_bsdf.inputs['Base Color'].default_value = (0.0, 1.0, 0.85, 1.0)
    c_bsdf.inputs['Emission Color'].default_value = (0.0, 1.0, 0.85, 1.0)
    c_bsdf.inputs['Emission Strength'].default_value = 14.0
    braking_curve_obj.data.materials.append(mat_curve)
    cockpit_props.append(braking_curve_obj)

    # Center Screen Text
    t_c1 = add_cockpit_text("Center_Title", "LZB BRAKING CURVE", (0.0, y_1 + 3.56, 2.30), scale=0.016, color=(0.0, 0.95, 1.0, 1.0), emission=7.0)
    t_c1.data.align_x = 'CENTER'
    t_c2 = add_cockpit_text("Center_Decel", "DECEL PROFILE: -2.8 m/s2", (0.0, y_1 + 3.56, 2.27), scale=0.012, color=(0.3, 0.8, 1.0, 1.0), emission=5.0)
    t_c2.data.align_x = 'CENTER'
    t_c3 = add_cockpit_text("Center_Target", "TARGET: 0 KM/H  [1,200M]", (0.0, y_1 + 3.56, 2.13), scale=0.013, color=(0.1, 1.0, 0.4, 1.0), emission=7.0)
    t_c3.data.align_x = 'CENTER'
    cockpit_props.extend([t_c1, t_c2, t_c3])

    # 2. RIGHT SCREEN: SPEEDOMETER & TELEMETRY
    r_center = (0.28, y_1 + 3.58, 2.22)
    rot_r = math.radians(-10)
    b_r, br_r = create_cockpit_mfd("RightMFD", r_center, (0.20, 0.02, 0.22), (1.0, 0.65, 0.1, 1.0), border_emission=7.0, rot_z=rot_r)
    cockpit_props.extend([b_r, br_r])

    t_r1 = add_cockpit_text("Speed_Title", "SPEED TELEMETRY", (0.28, y_1 + 3.56, 2.29), scale=0.013, color=(1.0, 0.7, 0.2, 1.0), emission=6.0, rot=(math.radians(90), 0, rot_r))
    t_r1.data.align_x = 'CENTER'
    t_r2 = add_cockpit_text("Speed_Val", "320 KM/H", (0.28, y_1 + 3.56, 2.22), scale=0.025, color=(1.0, 0.85, 0.3, 1.0), emission=10.0, rot=(math.radians(90), 0, rot_r))
    t_r2.data.align_x = 'CENTER'
    t_r3 = add_cockpit_text("Speed_Status", "BRAKE: ENGAGED", (0.28, y_1 + 3.56, 2.15), scale=0.012, color=(0.2, 1.0, 0.4, 1.0), emission=6.0, rot=(math.radians(90), 0, rot_r))
    t_r3.data.align_x = 'CENTER'
    t_r4 = add_cockpit_text("Speed_Pwr", "PWR: REVERSE 12MW", (0.28, y_1 + 3.56, 2.12), scale=0.011, color=(0.3, 0.8, 1.0, 1.0), emission=5.0, rot=(math.radians(90), 0, rot_r))
    t_r4.data.align_x = 'CENTER'
    cockpit_props.extend([t_r1, t_r2, t_r3, t_r4])

    # 3. LEFT SCREEN: CAB RADAR & TRACK SIGNALLING
    l_center = (-0.28, y_1 + 3.58, 2.22)
    rot_l = math.radians(10)
    b_l, br_l = create_cockpit_mfd("LeftMFD", l_center, (0.20, 0.02, 0.22), (0.1, 1.0, 0.4, 1.0), border_emission=7.0, rot_z=rot_l)
    cockpit_props.extend([b_l, br_l])

    bpy.ops.mesh.primitive_torus_add(major_radius=0.038, minor_radius=0.002, location=(-0.28, y_1 + 3.565, 2.21))
    radar_ring = bpy.context.active_object
    radar_ring.rotation_euler = (math.radians(90), 0, rot_l)
    radar_ring.visible_shadow = False
    mat_rr = bpy.data.materials.new("RadarMat")
    mat_rr.use_nodes = True
    rr_bsdf = mat_rr.node_tree.nodes.get("Principled BSDF")
    rr_bsdf.inputs['Base Color'].default_value = (0.1, 1.0, 0.4, 1.0)
    rr_bsdf.inputs['Emission Color'].default_value = (0.1, 1.0, 0.4, 1.0)
    rr_bsdf.inputs['Emission Strength'].default_value = 8.0
    radar_ring.data.materials.append(mat_rr)
    cockpit_props.append(radar_ring)

    t_l1 = add_cockpit_text("Radar_Title", "LZB CAB RADAR", (-0.28, y_1 + 3.56, 2.29), scale=0.013, color=(0.2, 1.0, 0.4, 1.0), emission=6.0, rot=(math.radians(90), 0, rot_l))
    t_l1.data.align_x = 'CENTER'
    t_l2 = add_cockpit_text("Radar_Status", "TRACK: CLEAR", (-0.28, y_1 + 3.56, 2.14), scale=0.012, color=(0.2, 1.0, 0.4, 1.0), emission=6.0, rot=(math.radians(90), 0, rot_l))
    t_l2.data.align_x = 'CENTER'
    t_l3 = add_cockpit_text("Radar_Lock", "INTERLOCK: OK", (-0.28, y_1 + 3.56, 2.11), scale=0.011, color=(0.0, 0.9, 1.0, 1.0), emission=5.0, rot=(math.radians(90), 0, rot_l))
    t_l3.data.align_x = 'CENTER'
    cockpit_props.extend([t_l1, t_l2, t_l3])

    # 4. WINDSHIELD HOLOGRAPHIC HUD PROJECTION
    bpy.ops.mesh.primitive_torus_add(major_radius=0.45, minor_radius=0.005, location=(0.0, y_1 + 4.15, 2.45))
    reticle = bpy.context.active_object
    reticle.rotation_euler = (math.radians(78), 0, 0)
    reticle.visible_shadow = False
    mat_ret = bpy.data.materials.new("ReticleMat")
    mat_ret.use_nodes = True
    ret_bsdf = mat_ret.node_tree.nodes.get("Principled BSDF")
    ret_bsdf.inputs['Base Color'].default_value = (0.0, 0.95, 1.0, 1.0)
    ret_bsdf.inputs['Emission Color'].default_value = (0.0, 0.95, 1.0, 1.0)
    ret_bsdf.inputs['Emission Strength'].default_value = 8.0
    reticle.data.materials.append(mat_ret)
    t_wind = add_cockpit_text("HUD_Windshield_Text", "[ COMPUTER CONTROLLED BRAKING ]", (-0.24, y_1 + 4.10, 2.45), scale=0.022, color=(0.0, 0.95, 1.0, 1.0), emission=9.0, rot=(math.radians(78), 0, 0))
    cockpit_props.extend([reticle, t_wind])

    # Animate Cockpit Dashboard, Screens, Curves, and Text along track at EVERY sync frame:
    cockpit_offsets = {}
    for p in cockpit_props:
        cockpit_offsets[p.name] = (p.location.x, p.location.y - y_1, p.location.z)

    for f in sync_frames:
        yf = get_train_y(f, brake_actuate_frame, brake_stop_frame)
        for p in cockpit_props:
            ox, oy, oz = cockpit_offsets[p.name]
            p.location = (ox, yf + oy, oz)
            p.keyframe_insert(data_path="location", frame=f)

    for p in cockpit_props:
        make_fcurves_linear(p)

    # Scoped visibility: Cockpit & HUD active EXCLUSIVELY in Shot 3 (f474..636)
    for p in cockpit_props:
        p.hide_render = True
        p.keyframe_insert(data_path="hide_render", frame=1)
        p.hide_render = False
        p.keyframe_insert(data_path="hide_render", frame=474) # Active during Shot 3!
        p.hide_render = True
        p.keyframe_insert(data_path="hide_render", frame=637) # Hidden for remaining shots

    # =========================================================================
    # 4D. BOGIE TRACTION MOTOR REVERSE FLUX RINGS (FOR SHOT 4)
    # =========================================================================
    mat_motor_flux = bpy.data.materials.new("MotorFluxMat")
    mat_motor_flux.use_nodes = True
    bsdf_mf = mat_motor_flux.node_tree.nodes.get("Principled BSDF")
    bsdf_mf.inputs['Base Color'].default_value = (0.1, 0.65, 1.0, 1.0)
    bsdf_mf.inputs['Emission Color'].default_value = (0.1, 0.85, 1.0, 1.0)
    bsdf_mf.inputs['Emission Strength'].default_value = 0.0

    motor_rings = []
    for mi in range(3):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.38, minor_radius=0.025, location=(0.0, y_1 + 0.3 * (mi - 1), 0.75))
        mr = bpy.context.active_object
        mr.rotation_euler = (0, math.radians(90), 0)
        mr.data.materials.append(mat_motor_flux)
        motor_rings.append((mr, mi))

    for f in sync_frames:
        yf = get_train_y(f, brake_actuate_frame, brake_stop_frame)
        for mr, mi in motor_rings:
            mr.location = (0.0, yf + 0.3 * (mi - 1), 0.75)
            mr.keyframe_insert(data_path="location", frame=f)

    # Keyframe Traction Motor Flux emission in Shot 4 (f642..810):
    bsdf_mf.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=1)
    bsdf_mf.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=640)
    bsdf_mf.inputs['Emission Strength'].default_value = 25.0 # Intense reverse flux!
    bsdf_mf.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=725)
    bsdf_mf.inputs['Emission Strength'].default_value = 0.0
    bsdf_mf.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=810)

    # =========================================================================
    # 5. PHYSICAL ACTUATING ELECTROMAGNETIC TRACK BRAKE SHOE (DROPS ONTO RAIL!)
    # =========================================================================
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.95, -5.0, 0.58))
    brake_shoe = bpy.context.active_object
    brake_shoe.name = "Physical_Brake_Beam"
    brake_shoe.scale = (0.16, 1.45, 0.12)

    mat_brake = bpy.data.materials.new("BrakeMat")
    mat_brake.use_nodes = True
    mat_brake.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.92, 0.38, 0.05, 1.0) # High-vis safety orange
    mat_brake.node_tree.nodes.get("Principled BSDF").inputs['Metallic'].default_value = 0.85
    brake_shoe.data.materials.append(mat_brake)

    # Animate Track Brake Shoe Location along track at every sync frame:
    for f in sync_frames:
        yf = get_train_y(f, brake_actuate_frame, brake_stop_frame)
        z_pos = 0.40 if f >= clamp_f else 0.58 # Drops flush on rail at clamp_f!
        brake_shoe.location = (0.95, yf, z_pos)
        brake_shoe.keyframe_insert(data_path="location", frame=f)

    make_fcurves_linear(brake_shoe)

    # =========================================================================
    # 6. MOLTEN FRICTION THERMAL GLOW & 20-PIECE SPARK SHOWER CLUSTER
    # =========================================================================
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.95, y_1, 0.38))
    friction_glow = bpy.context.active_object
    friction_glow.scale = (0.18, 1.48, 0.04)

    mat_heat = bpy.data.materials.new("ThermalFrictionHeat")
    mat_heat.use_nodes = True
    bsdf_heat = mat_heat.node_tree.nodes.get("Principled BSDF")
    bsdf_heat.inputs['Emission Color'].default_value = (1.0, 0.35, 0.02, 1.0)
    friction_glow.data.materials.append(mat_heat)

    # Dynamic 20-Piece Spark Shower Cluster spraying backward along rail
    spark_particles = []
    mat_spark = bpy.data.materials.new("SparkEmission")
    mat_spark.use_nodes = True
    bsdf_spk = mat_spark.node_tree.nodes.get("Principled BSDF")
    bsdf_spk.inputs['Emission Color'].default_value = (1.0, 0.95, 0.40, 1.0) # White-hot electric spark
    bsdf_spk.inputs['Emission Strength'].default_value = 0.0

    for k in range(20):
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.014,
            depth=0.35 + (k % 4) * 0.18,
            location=(0.95 + ((k % 5) - 2) * 0.025, y_1 - 0.35 - (k * 0.12), 0.42 + (k % 3) * 0.03)
        )
        p = bpy.context.active_object
        p.name = f"Spark_Needle_{k:02d}"
        p.rotation_euler = (math.radians(82 + (k % 5) * 3), math.radians((k % 4) * 4 - 6), 0)
        p.data.materials.append(mat_spark)
        spark_particles.append((p, k))

    # Animate Friction & Spark Needles Location along track at every sync frame:
    for f in sync_frames:
        yf = get_train_y(f, brake_actuate_frame, brake_stop_frame)
        friction_glow.location = (0.95, yf, 0.38)
        friction_glow.keyframe_insert(data_path="location", frame=f)
        for p, k in spark_particles:
            p.location = (0.95 + ((k % 5) - 2) * 0.025, yf - 0.35 - (k * 0.12), 0.42 + (k % 3) * 0.03)
            p.keyframe_insert(data_path="location", frame=f)

    make_fcurves_linear(friction_glow)
    for p, _ in spark_particles:
        make_fcurves_linear(p)

    # Keyframe Friction Glow Emission:
    bsdf_heat.inputs['Emission Strength'].default_value = 0.0
    bsdf_heat.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=1)
    bsdf_heat.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=brake_actuate_frame)
    bsdf_heat.inputs['Emission Strength'].default_value = 55.0 # White-hot molten friction!
    bsdf_heat.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=clamp_f)
    bsdf_heat.inputs['Emission Strength'].default_value = 8.0  # Cooling glow
    bsdf_heat.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=brake_stop_frame)
    bsdf_heat.inputs['Emission Strength'].default_value = 2.0
    bsdf_heat.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=total_frames)

    # Keyframe Dynamic Spark Shower Emission:
    bsdf_spk.inputs['Emission Strength'].default_value = 0.0
    bsdf_spk.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=1)
    bsdf_spk.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=brake_actuate_frame)
    bsdf_spk.inputs['Emission Strength'].default_value = 65.0 # Violent spark shower eruption!
    bsdf_spk.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=clamp_f)
    bsdf_spk.inputs['Emission Strength'].default_value = 55.0
    bsdf_spk.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=brake_stop_frame - 15)
    bsdf_spk.inputs['Emission Strength'].default_value = 0.0  # Immediately extinguished at standstill!
    bsdf_spk.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=brake_stop_frame)

    # =========================================================================
    # 7. REAL ONCOMING BULLET TRAIN (FACING HERO TRAIN HEAD-TO-HEAD)
    # =========================================================================
    oncoming_empty = bpy.data.objects.new("Oncoming_Train_Root", None)
    scene.collection.objects.link(oncoming_empty)
    oncoming_empty.scale = (0.85, 0.85, 0.85)
    oncoming_empty.rotation_euler = (0, 0, 0) # Nose points in -Y toward hero train

    if os.path.exists(train_glb):
        before_onc = set(scene.objects)
        bpy.ops.import_scene.gltf(filepath=train_glb)
        oncoming_body = [o for o in list(set(scene.objects) - before_onc) if o.parent is None][0]
        oncoming_body.parent = oncoming_empty
        oncoming_body.location = (0, 0, 0)

    # Animate oncoming train braking down from Y=95m to safe halt at Y=58.22m (nose at 53.78m)
    # Nose-to-nose clearance = 53.78 - 44.22 = 9.56 meters!
    for f in sync_frames:
        if f <= brake_stop_frame:
            t = (f - 1.0) / max(1.0, float(brake_stop_frame - 1))
            onc_y = 95.0 - t * (95.0 - 58.22)
        else:
            onc_y = 58.22
        oncoming_empty.location = (0.0, onc_y, 1.85)
        oncoming_empty.keyframe_insert(data_path="location", frame=f)

    make_fcurves_linear(oncoming_empty)

    # =========================================================================
    # 8. HIGH-TECH 3D HOLOGRAPHIC ENGINEERING CALLOUTS ACROSS SHOTS
    # =========================================================================
    def create_hud_billboard_callout(name, line1, line2, line3, color1, color2, offset_fn, sf, ef, base_scale=0.18):
        """Creates a camera-facing 3D holographic callout that tracks the mechanical component and is visible strictly within [sf, ef]."""
        items = []

        # Bracket / Frame outline
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
        bracket = bpy.context.active_object
        bracket.name = f"{name}_Bracket"
        bracket.scale = (0.005, base_scale * 3.6, base_scale * 1.8)
        bracket.visible_shadow = False
        mod = bracket.modifiers.new(name="Wireframe", type='WIREFRAME')
        mod.thickness = 0.003

        mat_brk = bpy.data.materials.new(f"{name}_BrkMat")
        mat_brk.use_nodes = True
        bs_b = mat_brk.node_tree.nodes.get("Principled BSDF")
        bs_b.inputs['Base Color'].default_value = color1
        bs_b.inputs['Emission Color'].default_value = color1
        bs_b.inputs['Emission Strength'].default_value = 8.0
        bracket.data.materials.append(mat_brk)

        # Billboarding constraint on bracket
        bc = bracket.constraints.new(type='TRACK_TO')
        bc.target = cam_obj
        bc.track_axis = 'TRACK_X'
        bc.up_axis = 'UP_Z'
        items.append((bracket, (0, 0, 0)))

        # Text Lines
        lines = [(line1, base_scale * 0.40, color1, base_scale * 0.88, 12.0),
                 (line2, 0.0, color2, base_scale * 0.68, 8.0),
                 (line3, -base_scale * 0.40, (0.85, 0.90, 0.95, 1.0), base_scale * 0.54, 6.0)]

        for l_idx, (txt_body, z_off, col, sz, em) in enumerate(lines):
            bpy.ops.object.text_add(location=(0, 0, 0))
            t = bpy.context.active_object
            t.name = f"{name}_Line_{l_idx}"
            t.data.body = txt_body
            t.data.size = sz
            t.data.align_x = 'CENTER'
            t.data.align_y = 'CENTER'
            t.visible_shadow = False

            # Billboard constraint for text
            tc = t.constraints.new(type='TRACK_TO')
            tc.target = cam_obj
            tc.track_axis = 'TRACK_Z'
            tc.up_axis = 'UP_Y'

            mat_t = bpy.data.materials.new(f"{name}_TMat_{l_idx}")
            mat_t.use_nodes = True
            bs_t = mat_t.node_tree.nodes.get("Principled BSDF")
            bs_t.inputs['Base Color'].default_value = col
            bs_t.inputs['Emission Color'].default_value = col
            bs_t.inputs['Emission Strength'].default_value = em
            t.data.materials.append(mat_t)

            items.append((t, (0, 0, z_off)))

        # Animate location across sync_frames
        for f in sync_frames:
            pos = offset_fn(f)
            for obj, z_rel in items:
                obj.location = (pos[0], pos[1], pos[2] + z_rel[2])
                obj.keyframe_insert(data_path="location", frame=f)

        for obj, _ in items:
            make_fcurves_linear(obj)

        # Scoped visibility keyframing: strictly visible in [sf, ef]
        for obj, _ in items:
            obj.hide_render = True
            obj.keyframe_insert(data_path="hide_render", frame=1)
            obj.hide_render = False
            obj.keyframe_insert(data_path="hide_render", frame=sf)
            obj.hide_render = True
            obj.keyframe_insert(data_path="hide_render", frame=ef + 1)

        return items

    # Shot 1 Callout: Thermal Melt Breakdown (f139..294) - Perfectly framed beside glowing disc
    create_hud_billboard_callout(
        name="Callout_Shot1_Thermal",
        line1="TEMP: > 1,500°C",
        line2="[ THERMAL MELT HAZARD ]",
        line3="ROTOR COEFFICIENT: DEGRADED",
        color1=(1.0, 0.25, 0.05, 1.0), # Vivid hot red
        color2=(1.0, 0.70, 0.15, 1.0), # Amber
        offset_fn=lambda f: (1.20, get_train_y(f, brake_actuate_frame, brake_stop_frame) - 0.20, 0.95),
        sf=shots[1]['startFrame'],
        ef=shots[1]['endFrame'],
        base_scale=0.019
    )

    # Shot 2 Callout: LZB Inductive Safety Net (f295..473)
    create_hud_billboard_callout(
        name="Callout_Shot2_LZB",
        line1="LZB INDUCTIVE LOOP",
        line2="36 kHz CAB SIGNALLING",
        line3="FAIL-SAFE TRAIN SEPARATION",
        color1=(0.0, 0.95, 1.0, 1.0),  # Cyan
        color2=(0.1, 1.0, 0.4, 1.0),   # Green
        offset_fn=lambda f: (0.0, get_train_y(f, brake_actuate_frame, brake_stop_frame) + 1.5, 0.55),
        sf=shots[2]['startFrame'],
        ef=shots[2]['endFrame'],
        base_scale=0.045
    )

    # Shot 4 Callout: Bogie Traction Motor Reverse Flux (f637..809)
    create_hud_billboard_callout(
        name="Callout_Shot4_Motor",
        line1="REGENERATIVE BRAKING",
        line2="TRACTION MOTOR: GENERATOR MODE",
        line3="KINETIC RECOVERY: 85%",
        color1=(0.1, 0.85, 1.0, 1.0),
        color2=(0.2, 1.0, 0.4, 1.0),
        offset_fn=lambda f: (0.95, get_train_y(f, brake_actuate_frame, brake_stop_frame) + 0.15, 0.95),
        sf=shots[4]['startFrame'],
        ef=shots[4]['endFrame'],
        base_scale=0.040
    )

    # Shot 5 Callout: Catenary Pantograph Power Return (f810..974)
    create_hud_billboard_callout(
        name="Callout_Shot5_Catenary",
        line1="CATENARY POWER RETURN",
        line2="GRID FEEDBACK: 25 kV AC",
        line3="POWER REGENERATED: 12.4 MW",
        color1=(0.0, 0.95, 1.0, 1.0),
        color2=(1.0, 0.95, 0.8, 1.0),
        offset_fn=lambda f: (1.10, get_train_y(f, brake_actuate_frame, brake_stop_frame) + 1.1, 5.40),
        sf=shots[5]['startFrame'],
        ef=shots[5]['endFrame'],
        base_scale=0.075
    )

    # Shot 6 Callout: Track Brake Drop (f975..1146)
    create_hud_billboard_callout(
        name="Callout_Shot6_TrackBrake",
        line1="ELECTROMAGNETIC TRACK BRAKE",
        line2="[ 180mm PNEUMATIC DROP ]",
        line3="MAGNETIC CLAMP FORCE: 110 kN",
        color1=(1.0, 0.45, 0.05, 1.0), # Safety orange
        color2=(1.0, 0.90, 0.20, 1.0),
        offset_fn=lambda f: (1.35, get_train_y(f, brake_actuate_frame, brake_stop_frame) - 0.12, 0.85),
        sf=shots[6]['startFrame'],
        ef=shots[6]['endFrame'],
        base_scale=0.032
    )

    # Shot 7 Callout: Molten Contact Friction & Spark Shower (f1147..1326)
    create_hud_billboard_callout(
        name="Callout_Shot7_Friction",
        line1="MOLTEN CONTACT INTERFACE",
        line2="KINETIC FRICTION: mu = 0.38",
        line3="ENERGY: 450 MJ DISSIPATION",
        color1=(1.0, 0.85, 0.30, 1.0), # White-hot amber
        color2=(1.0, 0.40, 0.05, 1.0),
        offset_fn=lambda f: (1.35, get_train_y(f, brake_actuate_frame, brake_stop_frame) - 0.45, 0.82),
        sf=shots[7]['startFrame'],
        ef=shots[7]['endFrame'],
        base_scale=0.032
    )

    # Shot 8 Callout: Pneumatic Caliper Clamp & 0 RPM Standstill (f1327..1492)
    create_hud_billboard_callout(
        name="Callout_Shot8_Standstill",
        line1="MECHANICAL STANDSTILL: 0 RPM",
        line2="CALIPER PRESSURE: 120 BAR",
        line3="BEAST HALTED: 400 TONS SAFE",
        color1=(0.1, 1.0, 0.35, 1.0),  # Emerald green
        color2=(1.0, 0.65, 0.10, 1.0),
        offset_fn=lambda f: (1.25, get_train_y(f, brake_actuate_frame, brake_stop_frame) - 0.20, 0.95),
        sf=shots[8]['startFrame'],
        ef=shots[8]['endFrame'],
        base_scale=0.032
    )

    # =========================================================================
    # SHOT 9 CLIMAX: 3D HOLOGRAPHIC NEON CYAN DIMENSION BAR & COLLISION AVERTED
    # =========================================================================
    sf_9 = shots[-1]['startFrame']
    ef_9 = shots[-1]['endFrame']
    gap_y_center = (44.22 + 53.78) / 2.0 # 49.0m
    gap_distance = 53.78 - 44.22         # 9.56m

    dim_props = []

    # Neon Cyan Dimension Bar spanning the 9.56m gap (placed on camera side X=+0.95)
    mat_dim = bpy.data.materials.new("DimLineMat")
    mat_dim.use_nodes = True
    bs_dim = mat_dim.node_tree.nodes.get("Principled BSDF")
    bs_dim.inputs['Base Color'].default_value = (0.0, 0.95, 1.0, 1.0)
    bs_dim.inputs['Emission Color'].default_value = (0.0, 0.95, 1.0, 1.0)
    bs_dim.inputs['Emission Strength'].default_value = 13.0

    bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=gap_distance, location=(0.95, gap_y_center, 1.65))
    dim_bar = bpy.context.active_object
    dim_bar.name = "HUD_Shot09_DimBar"
    dim_bar.rotation_euler = (math.radians(90), 0, 0)
    dim_bar.visible_shadow = False
    dim_bar.data.materials.append(mat_dim)
    dim_props.append(dim_bar)

    # End caps on both ends of the dimension bar
    for cap_y in [44.22, 53.78]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.95, cap_y, 1.65))
        cap = bpy.context.active_object
        cap.name = f"HUD_Shot09_EndCap_{cap_y:.1f}"
        cap.scale = (0.28, 0.05, 0.28)
        cap.visible_shadow = False
        cap.data.materials.append(mat_dim)
        dim_props.append(cap)

    # Floating Camera-Facing 3D Callout Text for Shot 9 (floating cleanly in sky above gap)
    shot9_texts = [
        ("< 9.5 METERS GAP >", 4.80, (0.0, 0.95, 1.0, 1.0), 0.46, 14.0),
        ("COLLISION AVERTED", 4.20, (0.1, 1.0, 0.35, 1.0), 0.34, 12.0),
        ("FAIL-SAFE CLEARANCE: 9.56M", 3.70, (0.9, 0.95, 1.0, 1.0), 0.22, 8.0)
    ]
    for s9_body, s9_z, s9_col, s9_sz, s9_em in shot9_texts:
        bpy.ops.object.text_add(location=(0.85, gap_y_center, s9_z))
        s9_t = bpy.context.active_object
        s9_t.name = f"HUD_Shot09_{s9_body[:8]}"
        s9_t.data.body = s9_body
        s9_t.data.size = s9_sz
        s9_t.data.align_x = 'CENTER'
        s9_t.data.align_y = 'CENTER'
        s9_t.visible_shadow = False

        s9_tc = s9_t.constraints.new(type='TRACK_TO')
        s9_tc.target = cam_obj
        s9_tc.track_axis = 'TRACK_Z'
        s9_tc.up_axis = 'UP_Y'

        mat_s9 = bpy.data.materials.new(f"HUD_Shot09_Mat_{s9_body[:6]}")
        mat_s9.use_nodes = True
        bs_s9 = mat_s9.node_tree.nodes.get("Principled BSDF")
        bs_s9.inputs['Base Color'].default_value = s9_col
        bs_s9.inputs['Emission Color'].default_value = s9_col
        bs_s9.inputs['Emission Strength'].default_value = s9_em
        s9_t.data.materials.append(mat_s9)
        dim_props.append(s9_t)

    # Scoped visibility: Shot 9 Dimension overlay active EXCLUSIVELY in Shot 9 (f1493..1650)
    for p in dim_props:
        p.hide_render = True
        p.keyframe_insert(data_path="hide_render", frame=1)
        p.hide_render = False
        p.keyframe_insert(data_path="hide_render", frame=sf_9)
        p.hide_render = True
        p.keyframe_insert(data_path="hide_render", frame=ef_9 + 1)
    # =========================================================================
    # 9. CAMERA DIRECTOR HARD-CUT CHOREOGRAPHY & 1:1 LINEAR TRACKING
    # =========================================================================
    for i, shot in enumerate(shots):
        sf = shot['startFrame']
        ef = shot['endFrame']

        y_s = get_train_y(sf, brake_actuate_frame, brake_stop_frame)
        y_e = get_train_y(ef, brake_actuate_frame, brake_stop_frame)

        if i == len(shots) - 1:
            # SHOT 9: GRAND 3/4 DIAGONAL AERIAL CRANE ZOOM-OUT CLIMAX!
            cam_data.lens = 22
            c_s = (8.0, 35.0, 9.0)
            c_e = (9.5, 31.0, 12.0)
            f_s = (0.0, 49.0, 1.8)
            f_e = (0.0, 49.0, 1.8)

        elif i == 1:
            # SHOT 1: THERMAL MELT BREAKDOWN (EXTREME MACRO DIVE ON VENTILATED BRAKE DISC)
            cam_data.lens = 38
            c_s = (1.55, y_s - 0.30, 0.90)
            c_e = (1.45, y_e - 0.20, 0.86)
            f_s = (0.82, y_s + 0.05, 0.82)
            f_e = (0.82, y_e + 0.05, 0.82)

        elif i == 2:
            # SHOT 2: TRACK BALLAST LZB INDUCTIVE SAFETY NET ZOOM!
            cam_data.lens = 28
            c_s = (0.0, y_s - 3.2, 0.68)
            c_e = (0.0, y_e - 2.4, 0.62)
            f_s = (0.0, y_s + 1.8, 0.26)
            f_e = (0.0, y_e + 2.0, 0.26)

        elif i == 3:
            # SHOT 3: HIGH-TECH DRIVER'S CABIN / COCKPIT INTERIOR WITH GLOWING DIGITAL HUD!
            cam_data.lens = 22
            c_s = (0.0, y_s + 2.7, 2.32)
            c_e = (0.0, y_e + 2.7, 2.32)
            f_s = (0.0, y_s + 6.0, 2.15)
            f_e = (0.0, y_e + 6.0, 2.15)

        elif i == 4:
            # SHOT 4: TRACTION MOTOR REVERSE MAGNETIC DYNAMICS (BOGIE CUTAWAY)
            cam_data.lens = 32
            c_s = (1.75, y_s - 0.45, 0.95)
            c_e = (1.65, y_e - 0.25, 0.90)
            f_s = (0.0, y_s + 0.15, 0.70)
            f_e = (0.0, y_e + 0.15, 0.70)

        elif i == 5:
            # SHOT 5: REGENERATIVE POWER RETURN TO OVERHEAD CATENARY
            cam_data.lens = 26
            c_s = (3.2, y_s - 2.5, 2.8)
            c_e = (3.4, y_e - 1.0, 3.2)
            f_s = (0.0, y_s + 1.0, 5.2)
            f_e = (0.0, y_e + 1.2, 5.2)

        elif i == 7:
            # SHOT 7: HIGH-VISIBILITY MACRO DIVE ON CONTACT FRICTION & SPARK SHOWER!
            cam_data.lens = 35
            c_s = (2.2, y_s - 0.85, 1.28)
            c_e = (2.0, y_e - 0.70, 1.25)
            f_s = (0.95, y_s - 0.45, 0.40)
            f_e = (0.95, y_e - 0.45, 0.40)

        elif i == 6:
            # SHOT 6: HIGH-VISIBILITY MACRO DIVE ON TRACK BRAKE DROP!
            cam_data.lens = 35
            c_s = (2.3, y_s - 0.4, 1.35)
            c_e = (2.1, y_e - 0.3, 1.30)
            f_s = (0.95, y_s + 0.1, 0.40)
            f_e = (0.95, y_e + 0.1, 0.40)

        elif i == 8:
            # SHOT 8: PNEUMATIC CALIPER CLAMP & RAPID DECELERATION TO 0 RPM
            cam_data.lens = 32
            c_s = (2.1, y_s - 0.5, 1.20)
            c_e = (1.95, y_e - 0.2, 1.10)
            f_s = (0.82, y_s + 0.05, 0.82)
            f_e = (0.82, y_e + 0.05, 0.82)

        else:
            # SHOT 0: WIDE SCENIC TRACKING
            cam_data.lens = 28
            c_s = (3.4, y_s - 4.8, 1.35)
            c_e = (3.6, y_e + 2.5, 1.55)
            f_s = (0.0, y_s + 1.2, 1.4)
            f_e = (0.0, y_e + 1.2, 1.4)

        # Insert keyframe at start of shot:
        cam_obj.location = c_s
        cam_obj.keyframe_insert(data_path="location", frame=sf)
        focal_target.location = f_s
        focal_target.keyframe_insert(data_path="location", frame=sf)

        # Sample camera and focal target along the shot duration for nonlinear deceleration tracking:
        if i in [6, 7, 8]:
            shot_steps = list(range(sf, ef, 20)) + [ef]
            for mf in shot_steps:
                y_m = get_train_y(mf, brake_actuate_frame, brake_stop_frame)
                if i == 6:
                    cam_obj.location = (2.2, y_m - 0.35, 1.32)
                    focal_target.location = (0.95, y_m + 0.1, 0.40)
                elif i == 7:
                    cam_obj.location = (2.1, y_m - 0.75, 1.26)
                    focal_target.location = (0.95, y_m - 0.45, 0.40)
                elif i == 8:
                    cam_obj.location = (2.0, y_m - 0.35, 1.15)
                    focal_target.location = (0.82, y_m + 0.05, 0.82)
                cam_obj.keyframe_insert(data_path="location", frame=mf)
                focal_target.keyframe_insert(data_path="location", frame=mf)

        # Insert keyframe at end of shot:
        cam_obj.location = c_e
        cam_obj.keyframe_insert(data_path="location", frame=ef)
        focal_target.location = f_e
        focal_target.keyframe_insert(data_path="location", frame=ef)

        # Hold position until next shot if gap exists:
        if i + 1 < len(shots):
            next_sf = shots[i+1]['startFrame']
            if next_sf > ef + 1:
                cam_obj.location = c_e
                cam_obj.keyframe_insert(data_path="location", frame=next_sf - 1)
                focal_target.location = f_e
                focal_target.keyframe_insert(data_path="location", frame=next_sf - 1)

    make_fcurves_linear(cam_obj)
    make_fcurves_linear(focal_target)

    # =========================================================================
    # 10. RENDER EXECUTION
    # =========================================================================
    if is_qa_mode:
        print(f"\n📸 Rendering QA Verification Stills for {len(shots)} shots...")
        dir_name = os.path.dirname(output_path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
        for i, s in enumerate(shots):
            mid_f = (s['startFrame'] + s['endFrame']) // 2
            scene.frame_set(mid_f)
            still_path = f"{output_path}shot_{i:02d}_f{mid_f:04d}.jpg"
            scene.render.filepath = still_path
            scene.render.image_settings.file_format = 'JPEG'
            scene.render.image_settings.quality = 95
            bpy.ops.render.render(write_still=True)
            print(f"  • Shot {i:02d} still: {still_path}")
        print("✅ QA Stills Generation Complete!")
    else:
        print(f"\n🚀 Rendering Full Sequence ({scene.frame_start}..{scene.frame_end}) to {output_path}...")
        dir_name = os.path.dirname(output_path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
        scene.render.filepath = output_path
        scene.render.image_settings.file_format = 'JPEG'
        scene.render.image_settings.quality = 95
        bpy.ops.render.render(animation=True)
        print("✅ Full Animation Render Complete!")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, help="Path to episode_manifest.json")
    parser.add_argument("--output", required=True, help="Output image sequence or video path")
    parser.add_argument("--qa-stills", action="store_true", help="Render single mid-frame still for each shot")
    parser.add_argument("--frames", action="store_true", help="Render full sequence as image frames")
    if "--" in sys.argv:
        script_args = sys.argv[sys.argv.index("--") + 1:]
    else:
        script_args = sys.argv[1:]
    args = parser.parse_args(script_args)

    build_scene(args.manifest, args.output, is_qa_mode=args.qa_stills)
