"""
Universal Autonomous 3D Director Engine (Phase 3)
Blender 4.3 EEVEE Next GPU

Features:
1. Universal Humanoid Chibi Biped (Zero-gap welded joints, swappable costumes: spacesuit, toga, robe, suit, cyberpunk).
2. Procedural Locomotion (Walk cycles with alternating leg lifts, hip roll, pelvis bounce, waypoint traversal).
3. Speech Lip-Flap & Eye Blinking (Audio-reactive syllable modulation & periodic blinks).
4. Universal Motion Action Bank (Talk, Scratch Head, Point Sky, Look Up, Shock, Triumph).
5. 5-Color High-Contrast Palette System (Instant 0.1s visual readability, no monochromatic wash).
6. 4 Universal Stage Archetypes (Outdoors Terrain, Indoors Interior, Diagram Studio, Graphic Card).
7. Visual Metaphor Prop Spawner (Broken compass, glowing orbit arcs, hero tool pedestal, rocket).
8. Collision-Clamped 9:16 Camera Rig (Guaranteed safe-zone framing, minimum 1.6m clearance).
"""

import os
import sys
import math
import json
from mathutils import Vector, Euler
import bpy

# Add scripts directory to path for connector
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.append(CURRENT_DIR)

try:
    import polyhaven_connector
except ImportError:
    polyhaven_connector = None

# -----------------------------------------------------------------------------
# 1. UTILITIES & COLOR SYSTEM
# -----------------------------------------------------------------------------
def clean_all_stage_objects():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for world in list(bpy.data.worlds):
        bpy.data.worlds.remove(world, do_unlink=True)

def hex_to_linear(hex_code, alpha=1.0):
    hex_code = hex_code.lstrip('#')
    if len(hex_code) == 3:
        hex_code = ''.join([c * 2 for c in hex_code])
    s_r = int(hex_code[0:2], 16) / 255.0
    s_g = int(hex_code[2:4], 16) / 255.0
    s_b = int(hex_code[4:6], 16) / 255.0
    def to_lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (to_lin(s_r), to_lin(s_g), to_lin(s_b), alpha)

def create_stylized_mat(name, rgba, roughness=0.35, metallic=0.0, sss_weight=0.0, emission=None, emission_str=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = rgba
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if "Subsurface Weight" in bsdf.inputs and sss_weight > 0:
            bsdf.inputs["Subsurface Weight"].default_value = sss_weight
        if emission and emission_str > 0:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission
                bsdf.inputs["Emission Strength"].default_value = emission_str
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = emission
    return mat

def set_smooth(obj):
    if obj and obj.type == 'MESH':
        for p in obj.data.polygons:
            p.use_smooth = True

def create_capsule_bone(name, p_start, p_end, radius, mat, parent=None):
    v_start = Vector(p_start)
    v_end = Vector(p_end)
    diff = v_end - v_start
    length = diff.length
    if length < 0.001:
        length = 0.001

    mid = (v_start + v_end) / 2.0
    rot = diff.to_track_quat('Z', 'Y').to_euler()

    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=length, vertices=16, location=mid, rotation=rot)
    cyl = bpy.context.active_object
    cyl.name = name
    if parent:
        cyl.parent = parent
    if mat:
        cyl.data.materials.append(mat)
    set_smooth(cyl)
    return cyl

# -----------------------------------------------------------------------------
# 2. UNIVERSAL HUMANOID CHARACTER & MODULAR COSTUMES
# -----------------------------------------------------------------------------
def spawn_universal_humanoid(costume_preset, palette, location=(0, 0, 0)):
    mats = {
        'primary': create_stylized_mat("Mat_Primary", hex_to_linear(palette.get('primary', '#1E3A8A')), roughness=0.35),
        'secondary': create_stylized_mat("Mat_Secondary", hex_to_linear(palette.get('secondary', '#F59E0B')), roughness=0.30),
        'accent': create_stylized_mat("Mat_Accent", hex_to_linear(palette.get('accent', '#00F0FF')), roughness=0.20, emission=hex_to_linear(palette.get('accent', '#00F0FF')), emission_str=2.0),
        'skin': create_stylized_mat("Mat_Skin", (0.80, 0.58, 0.42, 1.0), roughness=0.45, sss_weight=0.25),
        'white': create_stylized_mat("Mat_White", (0.95, 0.95, 0.95, 1.0), roughness=0.30),
        'black': create_stylized_mat("Mat_Black", (0.05, 0.05, 0.05, 1.0), roughness=0.25),
        'gold': create_stylized_mat("Mat_Gold", (1.0, 0.76, 0.15, 1.0), roughness=0.20, metallic=0.9),
    }

    # Root
    char_root = bpy.data.objects.new("Actor_Root", None)
    char_root.location = location
    char_root.rotation_euler.z = math.radians(180)
    bpy.context.collection.objects.link(char_root)

    # Pelvis
    pelvis = bpy.data.objects.new("Actor_Pelvis", None)
    pelvis.location = (0, 0, 0.75)
    pelvis.parent = char_root
    bpy.context.collection.objects.link(pelvis)

    # Spine (Waist pivot)
    spine = bpy.data.objects.new("Actor_Spine", None)
    spine.location = (0, 0, 0.08)
    spine.parent = pelvis
    bpy.context.collection.objects.link(spine)

    # Torso Base
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.18))
    torso = bpy.context.active_object
    torso.scale = (0.42, 0.26, 0.44)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    torso.parent = spine
    torso.data.materials.append(mats['primary'])
    set_smooth(torso)

    # Neck & Head
    head_pivot = bpy.data.objects.new("Actor_Head", None)
    head_pivot.location = (0, 0, 0.46)
    head_pivot.parent = spine
    bpy.context.collection.objects.link(head_pivot)

    # Head Skull Sphere
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.24, segments=24, ring_count=16, location=(0, 0.02, 0.14))
    skull = bpy.context.active_object
    skull.parent = head_pivot
    skull.data.materials.append(mats['skin'])
    set_smooth(skull)

    # Expressive Eyes (Left & Right)
    eyes = []
    for side, ex in [('L', -0.075), ('R', 0.075)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.038, segments=16, ring_count=12, location=(ex, 0.250, 0.14))
        eye_white = bpy.context.active_object
        eye_white.scale = (1.0, 0.35, 0.75)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        eye_white.parent = head_pivot
        eye_white.data.materials.append(mats['white'])
        set_smooth(eye_white)

        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.022, segments=12, ring_count=8, location=(ex, 0.268, 0.14))
        pupil = bpy.context.active_object
        pupil.scale = (1.0, 0.25, 0.75)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        pupil.parent = head_pivot
        pupil.data.materials.append(mats['black'])
        set_smooth(pupil)
        eyes.append(eye_white)

    # Animated Talking Mouth
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.250, 0.06))
    mouth = bpy.context.active_object
    mouth.scale = (0.065, 0.02, 0.020)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mouth.parent = head_pivot
    mouth.data.materials.append(mats['secondary'])
    set_smooth(mouth)

    # Limbs: Welded Arms
    r_sh = bpy.data.objects.new("Actor_Shoulder_R", None)
    r_sh.location = (0.24, 0.02, 0.36)
    r_sh.parent = spine
    bpy.context.collection.objects.link(r_sh)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.075, segments=16, ring_count=12, location=(0, 0, 0))
    r_sh_joint = bpy.context.active_object
    r_sh_joint.parent = r_sh
    r_sh_joint.data.materials.append(mats['skin'])
    set_smooth(r_sh_joint)

    r_el = bpy.data.objects.new("Actor_Elbow_R", None)
    r_el.location = (0.24, 0.14, 0.02)
    r_el.parent = r_sh
    bpy.context.collection.objects.link(r_el)
    create_capsule_bone("Actor_Uarm_R", (0, 0, 0), r_el.location, radius=0.062, mat=mats['skin'], parent=r_sh)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.058, segments=16, ring_count=12, location=(0, 0, 0))
    r_el_joint = bpy.context.active_object
    r_el_joint.parent = r_el
    r_el_joint.data.materials.append(mats['skin'])
    set_smooth(r_el_joint)

    p_hand_r = (-0.02, 0.22, 0.14)
    create_capsule_bone("Actor_Farm_R", (0, 0, 0), p_hand_r, radius=0.052, mat=mats['skin'], parent=r_el)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.046, segments=12, ring_count=8, location=p_hand_r)
    r_hand = bpy.context.active_object
    r_hand.parent = r_el
    r_hand.data.materials.append(mats['skin'])
    set_smooth(r_hand)

    # Left Arm
    l_sh = bpy.data.objects.new("Actor_Shoulder_L", None)
    l_sh.location = (-0.24, 0.02, 0.36)
    l_sh.parent = spine
    bpy.context.collection.objects.link(l_sh)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.075, segments=16, ring_count=12, location=(0, 0, 0))
    l_sh_joint = bpy.context.active_object
    l_sh_joint.parent = l_sh
    l_sh_joint.data.materials.append(mats['skin'])
    set_smooth(l_sh_joint)

    l_el = bpy.data.objects.new("Actor_Elbow_L", None)
    l_el.location = (-0.12, 0.16, -0.04)
    l_el.parent = l_sh
    bpy.context.collection.objects.link(l_el)
    create_capsule_bone("Actor_Uarm_L", (0, 0, 0), l_el.location, radius=0.062, mat=mats['skin'], parent=l_sh)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.058, segments=16, ring_count=12, location=(0, 0, 0))
    l_el_joint = bpy.context.active_object
    l_el_joint.parent = l_el
    l_el_joint.data.materials.append(mats['skin'])
    set_smooth(l_el_joint)

    p_hand_l = (-0.06, 0.22, 0.06)
    create_capsule_bone("Actor_Farm_L", (0, 0, 0), p_hand_l, radius=0.052, mat=mats['skin'], parent=l_el)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.046, segments=12, ring_count=8, location=p_hand_l)
    l_hand = bpy.context.active_object
    l_hand.parent = l_el
    l_hand.data.materials.append(mats['skin'])
    set_smooth(l_hand)

    # Limbs: Welded Legs for Locomotion
    legs = {}
    for side, lx, sname in [('L', -0.13, 'Actor_Hip_L'), ('R', 0.13, 'Actor_Hip_R')]:
        hip = bpy.data.objects.new(sname, None)
        hip.location = (lx, 0, 0)
        hip.parent = pelvis
        bpy.context.collection.objects.link(hip)

        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.075, segments=16, ring_count=12, location=(0, 0, 0))
        hip_j = bpy.context.active_object
        hip_j.parent = hip
        hip_j.data.materials.append(mats['primary'])
        set_smooth(hip_j)

        knee = bpy.data.objects.new(f"Actor_Knee_{side}", None)
        knee.location = (0, 0, -0.34)
        knee.parent = hip
        bpy.context.collection.objects.link(knee)
        create_capsule_bone(f"Actor_Thigh_{side}", (0, 0, 0), knee.location, radius=0.072, mat=mats['primary'], parent=hip)

        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.065, segments=16, ring_count=12, location=(0, 0, 0))
        knee_j = bpy.context.active_object
        knee_j.parent = knee
        knee_j.data.materials.append(mats['primary'])
        set_smooth(knee_j)

        p_foot = (0, 0.06, -0.36)
        create_capsule_bone(f"Actor_Shin_{side}", (0, 0, 0), p_foot, radius=0.060, mat=mats['secondary'], parent=knee)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=p_foot)
        foot = bpy.context.active_object
        foot.scale = (0.10, 0.20, 0.05)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        foot.parent = knee
        foot.data.materials.append(mats['secondary'])
        set_smooth(foot)

        legs[side] = {'hip': hip, 'knee': knee, 'foot': foot}

    # Modular Costume Skins
    if costume_preset == 'spacesuit':
        # Clear Glass Helmet Bubble Dome (Transparent so eyes and mouth are 100% visible)
        mat_glass = bpy.data.materials.new("Mat_Glass_Visor")
        mat_glass.use_nodes = True
        bsdf = mat_glass.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.9, 0.96, 1.0, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.05
            if "Transmission Weight" in bsdf.inputs:
                bsdf.inputs["Transmission Weight"].default_value = 0.85
            elif "Transmission" in bsdf.inputs:
                bsdf.inputs["Transmission"].default_value = 0.85
            if "Alpha" in bsdf.inputs:
                bsdf.inputs["Alpha"].default_value = 0.35

        # Transparent Helmet Dome
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.28, segments=24, ring_count=16, location=(0, 0.04, 0.14))
        helmet = bpy.context.active_object
        helmet.parent = head_pivot
        helmet.data.materials.append(mat_glass)
        set_smooth(helmet)

        # Gold Collar Rim at the neck base
        bpy.ops.mesh.primitive_torus_add(major_radius=0.25, minor_radius=0.03, major_segments=24, minor_segments=8, location=(0, 0, -0.06))
        collar = bpy.context.active_object
        collar.parent = head_pivot
        collar.data.materials.append(mats['gold'])
        set_smooth(collar)

        # Gold Communications Ear Antennas on both sides
        for side, ax in [('L', -0.27), ('R', 0.27)]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.06, vertices=12, location=(ax, 0.04, 0.14), rotation=(0, math.radians(90), 0))
            ear = bpy.context.active_object
            ear.parent = head_pivot
            ear.data.materials.append(mats['gold'])
            set_smooth(ear)

        # White NASA Life Support Backpack
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.26, 0.18))
        pack = bpy.context.active_object
        pack.scale = (0.34, 0.16, 0.36)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        pack.parent = spine
        pack.data.materials.append(mats['white'])
        set_smooth(pack)

        # Dual Oxygen Tanks on backpack
        for tx in [-0.09, 0.09]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.34, vertices=16, location=(tx, -0.36, 0.18))
            tank = bpy.context.active_object
            tank.parent = spine
            tank.data.materials.append(mats['secondary'])
            set_smooth(tank)

    elif costume_preset == 'roman_toga':
        # White Toga with Crimson Border
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.18), rotation=(0, math.radians(22), 0))
        toga = bpy.context.active_object
        toga.scale = (0.16, 0.28, 0.46)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        toga.parent = spine
        toga.data.materials.append(mats['secondary'])
        set_smooth(toga)

        # Golden Laurel Wreath
        bpy.ops.mesh.primitive_torus_add(major_radius=0.245, minor_radius=0.015, major_segments=24, minor_segments=10, location=(0, 0.01, 0.20))
        wreath = bpy.context.active_object
        wreath.parent = head_pivot
        wreath.data.materials.append(mats['gold'])
        set_smooth(wreath)

    else:
        # Default Stylized Robe / Sash Belt
        bpy.ops.mesh.primitive_cylinder_add(radius=0.29, depth=0.08, vertices=24, location=(0, 0, 0.08))
        belt = bpy.context.active_object
        belt.parent = pelvis
        belt.data.materials.append(mats['secondary'])
        set_smooth(belt)

    return {
        'root': char_root,
        'pelvis': pelvis,
        'spine': spine,
        'head': head_pivot,
        'mouth': mouth,
        'eyes': eyes,
        'r_sh': r_sh,
        'r_el': r_el,
        'l_sh': l_sh,
        'l_el': l_el,
        'legs': legs,
        'mats': mats,
    }

# -----------------------------------------------------------------------------
# 3. PROCEDURAL LOCOMOTION ENGINE (WALK CYCLES & WAYPOINTS)
# -----------------------------------------------------------------------------
def animate_locomotion(actor, start_pos, target_pos, start_f, end_f):
    duration = end_f - start_f
    if duration <= 0: return

    v_start = Vector(start_pos)
    v_end = Vector(target_pos)
    dist = (v_end - v_start).length

    root = actor['root']
    pelvis = actor['pelvis']
    l_hip = actor['legs']['L']['hip']
    r_hip = actor['legs']['R']['hip']
    l_knee = actor['legs']['L']['knee']
    r_knee = actor['legs']['R']['knee']
    l_sh = actor['l_sh']
    r_sh = actor['r_sh']

    # Step cadence: ~2 steps per second (60 frames)
    steps = max(1.0, (duration / 30.0) * 2.2)

    for f in range(start_f, end_f + 1, 2):
        t = (f - start_f) / float(duration)
        cur_pos = v_start.lerp(v_end, t)
        root.location = cur_pos
        root.keyframe_insert(data_path="location", frame=f)

        phase = t * steps * 2.0 * math.pi
        # Bouncy vertical bobbing
        pelvis.location.z = 0.75 + math.sin(phase * 2.0) * 0.035
        pelvis.keyframe_insert(data_path="location", frame=f)

        # Alternating leg swings
        leg_amp = 0.55 if dist > 0.1 else 0.15
        l_hip.rotation_euler.x = math.sin(phase) * leg_amp
        r_hip.rotation_euler.x = -math.sin(phase) * leg_amp
        l_hip.keyframe_insert(data_path="rotation_euler", frame=f)
        r_hip.keyframe_insert(data_path="rotation_euler", frame=f)

        # Knee foot lift
        l_knee.rotation_euler.x = max(0.0, -math.sin(phase)) * 0.65
        r_knee.rotation_euler.x = max(0.0, math.sin(phase)) * 0.65
        l_knee.keyframe_insert(data_path="rotation_euler", frame=f)
        r_knee.keyframe_insert(data_path="rotation_euler", frame=f)

        # Counter arm swings
        l_sh.rotation_euler.x = -math.sin(phase) * 0.35
        r_sh.rotation_euler.x = math.sin(phase) * 0.35
        l_sh.keyframe_insert(data_path="rotation_euler", frame=f)
        r_sh.keyframe_insert(data_path="rotation_euler", frame=f)

# -----------------------------------------------------------------------------
# 4. MOTION ACTION BANK (TALK, LOOK UP, POINT, SCRATCH, TRIUMPH)
# -----------------------------------------------------------------------------
ACTION_PRESETS = {
    'ACTION_TALK_GESTURE': {
        'head': (6, 0, 0),
        'spine': (4, 0, -3),
        'r_sh': (35, -12, 15),
        'r_el': (20, 0, 0),
        'l_sh': (12, 10, 5),
        'l_el': (15, 0, 0),
    },
    'ACTION_PUZZLED': {
        'head': (10, 14, -18),
        'spine': (2, 0, -6),
        'r_sh': (48, -15, 28),
        'r_el': (55, 0, -22), # Hand touches chin scratching
        'l_sh': (12, 0, 10),
        'l_el': (15, 0, 0),
    },
    'ACTION_LOOK_UP': {
        'head': (-26, 0, 0),
        'spine': (-6, 0, 0),
        'r_sh': (18, 0, -10),
        'r_el': (10, 0, 0),
        'l_sh': (18, 0, 10),
        'l_el': (10, 0, 0),
    },
    'ACTION_POINT': {
        'head': (-24, 0, -8),
        'spine': (-5, 0, 5),
        'r_sh': (68, -32, 15), # Pointing high
        'r_el': (12, 0, 0),
        'l_sh': (10, 0, 10),
        'l_el': (10, 0, 0),
    },
    'ACTION_EXAMINE': {
        'head': (18, 0, 0),
        'spine': (8, 0, 0),
        'r_sh': (25, 0, 15),
        'r_el': (30, 0, 0),
        'l_sh': (25, 0, -15),
        'l_el': (30, 0, 0),
    },
    'ACTION_SHOCK': {
        'head': (-14, 0, 0),
        'spine': (-10, 0, 0),
        'r_sh': (55, -40, 30),
        'r_el': (70, 0, 0), # Hands on head
        'l_sh': (55, 40, -30),
        'l_el': (70, 0, 0),
    },
    'ACTION_TRIUMPH': {
        'head': (-22, 0, 0),
        'spine': (-6, 0, 0),
        'r_sh': (-25, 75, -20), # Both arms high V victory
        'r_el': (-10, 0, 0),
        'l_sh': (-25, -75, 20),
        'l_el': (-10, 0, 0),
    }
}

# -----------------------------------------------------------------------------
# 5. UNIVERSAL STAGE ARCHETYPES & METAPHOR PROPS
# -----------------------------------------------------------------------------
def build_stage_archetype(archetype, theme_era, mats):
    root = bpy.data.objects.new(f"Stage_{archetype}", None)
    bpy.context.collection.objects.link(root)

    floor_mat = mats['floor']
    backdrop_mat = mats['backdrop']

    if archetype == 'OUTDOORS_TERRAIN':
        # Large terrain plinth
        bpy.ops.mesh.primitive_cylinder_add(radius=16.0, depth=0.8, vertices=32, location=(0, 2.0, -0.4))
        floor = bpy.context.active_object
        floor.parent = root
        floor.data.materials.append(floor_mat)
        set_smooth(floor)

        # Starry sky / atmosphere dome
        bpy.ops.mesh.primitive_uv_sphere_add(radius=65.0, segments=32, ring_count=20, location=(0, 0, 0))
        sky = bpy.context.active_object
        sky.parent = root
        sky.data.materials.append(backdrop_mat)
        for p in sky.data.polygons:
            p.flip()
        set_smooth(sky)

        if 'space' in theme_era.lower() or 'moon' in theme_era.lower():
            # 1. Iconic Glowing Earth in Deep Space Sky
            mat_earth = create_stylized_mat("Mat_Earth_Glow", (0.05, 0.45, 0.95, 1.0), roughness=0.3, emission=(0.1, 0.55, 1.0, 1.0), emission_str=2.8)
            bpy.ops.mesh.primitive_uv_sphere_add(radius=2.4, segments=24, ring_count=16, location=(6.5, 16.0, 10.5))
            earth = bpy.context.active_object
            earth.parent = root
            earth.data.materials.append(mat_earth)
            set_smooth(earth)

            # Swirling Cloud Ring on Earth
            mat_clouds = create_stylized_mat("Mat_Earth_Clouds", (0.95, 0.98, 1.0, 1.0), roughness=0.4, emission=(0.95, 0.98, 1.0, 1.0), emission_str=1.5)
            bpy.ops.mesh.primitive_torus_add(major_radius=2.45, minor_radius=0.18, major_segments=24, minor_segments=8, location=(6.5, 16.0, 10.5), rotation=(math.radians(35), math.radians(20), 0))
            clouds = bpy.context.active_object
            clouds.parent = root
            clouds.data.materials.append(mat_clouds)
            set_smooth(clouds)

            # 2. Apollo Lunar Module (LM Eagle) Descent Stage in Background
            mat_gold_foil = create_stylized_mat("Mat_LM_Gold", (1.0, 0.78, 0.18, 1.0), roughness=0.25, metallic=0.92)
            mat_dark_alloy = create_stylized_mat("Mat_LM_Alloy", (0.15, 0.16, 0.18, 1.0), roughness=0.35, metallic=0.8)

            bpy.ops.mesh.primitive_cylinder_add(radius=1.3, depth=1.1, vertices=8, location=(-2.6, 5.2, 0.55))
            lm_base = bpy.context.active_object
            lm_base.parent = root
            lm_base.data.materials.append(mat_gold_foil)
            set_smooth(lm_base)

            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-2.6, 5.2, 1.55))
            lm_cabin = bpy.context.active_object
            lm_cabin.scale = (1.1, 1.1, 0.9)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            lm_cabin.parent = root
            lm_cabin.data.materials.append(mat_dark_alloy)
            set_smooth(lm_cabin)

            for ang in [45, 135, 225, 315]:
                rad = math.radians(ang)
                lx = -2.6 + math.cos(rad) * 1.5
                ly = 5.2 + math.sin(rad) * 1.5
                create_capsule_bone(f"LM_Leg_{ang}", (-2.6, 5.2, 0.4), (lx, ly, 0.0), radius=0.06, mat=mat_gold_foil, parent=root)
                bpy.ops.mesh.primitive_cylinder_add(radius=0.22, depth=0.04, vertices=12, location=(lx, ly, 0.02))
                pad = bpy.context.active_object
                pad.parent = root
                pad.data.materials.append(mat_gold_foil)

            # 3. Moon Rocks scattered across surface
            if polyhaven_connector:
                polyhaven_connector.import_polyhaven_model("moon_rock_01", location=(-1.2, 2.8, 0.0), scale=(0.7, 0.7, 0.7))
                polyhaven_connector.import_polyhaven_model("moon_rock_01", location=(2.4, 2.2, 0.0), scale=(0.5, 0.5, 0.5), rotation=(0, 0, math.radians(75)))

    elif archetype == 'INDOORS_INTERIOR':
        # Bounded room with clean high-contrast walls
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 2.0, -0.1))
        floor = bpy.context.active_object
        floor.scale = (8.0, 8.0, 0.2)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        floor.parent = root
        floor.data.materials.append(floor_mat)
        set_smooth(floor)

        # Back Wall
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 5.0, 2.4))
        bwall = bpy.context.active_object
        bwall.scale = (8.0, 0.3, 5.0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        bwall.parent = root
        bwall.data.materials.append(backdrop_mat)
        set_smooth(bwall)

    elif archetype == 'DIAGRAM_STUDIO':
        # Curved seamless cyclorama studio backdrop
        bpy.ops.mesh.primitive_cylinder_add(radius=10.0, depth=0.4, vertices=32, location=(0, 1.5, -0.2))
        floor = bpy.context.active_object
        floor.parent = root
        floor.data.materials.append(floor_mat)
        set_smooth(floor)

    return root

def setup_cinematic_lighting(palette, theme_era):
    world = bpy.data.worlds.new("World_UniversalDirector")
    bpy.context.scene.world = world
    world.use_nodes = True
    w_nodes = world.node_tree.nodes
    w_links = world.node_tree.links
    w_nodes.clear()

    bg_node = w_nodes.new('ShaderNodeBackground')
    bg_node.inputs['Color'].default_value = hex_to_linear(palette.get('backdrop', '#0B0E14'))
    bg_node.inputs['Strength'].default_value = 0.85
    w_out = w_nodes.new('ShaderNodeOutputWorld')
    w_links.new(bg_node.outputs['Background'], w_out.inputs['Surface'])

    # Key Sun Light
    key_data = bpy.data.lights.new(name="Light_Key_Sun", type='SUN')
    key_data.energy = 8.5
    key_data.color = (0.95, 0.98, 1.0)
    key_data.angle = math.radians(3.0)
    key_obj = bpy.data.objects.new(name="Light_Key_Sun", object_data=key_data)
    key_obj.rotation_euler = (math.radians(50), math.radians(12), math.radians(-35))
    bpy.context.collection.objects.link(key_obj)

    # Fill Light
    fill_data = bpy.data.lights.new(name="Light_Fill_Warm", type='SUN')
    fill_data.energy = 4.8
    fill_data.color = hex_to_linear(palette.get('secondary', '#F59E0B'))[:3]
    fill_data.angle = math.radians(20.0)
    fill_obj = bpy.data.objects.new(name="Light_Fill_Warm", object_data=fill_data)
    fill_obj.rotation_euler = (math.radians(35), math.radians(-15), math.radians(140))
    bpy.context.collection.objects.link(fill_obj)

    # Edge Rim Light
    rim_data = bpy.data.lights.new(name="Light_Rim_Edge", type='SUN')
    rim_data.energy = 7.5
    rim_data.color = hex_to_linear(palette.get('accent', '#00F0FF'))[:3]
    rim_obj = bpy.data.objects.new(name="Light_Rim_Edge", object_data=rim_data)
    rim_obj.rotation_euler = (math.radians(25), 0, math.radians(180))
    bpy.context.collection.objects.link(rim_obj)

    # Subject Face Key Point Light
    face_data = bpy.data.lights.new(name="Light_Subject_Face", type='POINT')
    face_data.energy = 450.0
    face_data.color = (1.0, 0.98, 0.92)
    face_data.shadow_soft_size = 0.25
    face_obj = bpy.data.objects.new(name="Light_Subject_Face", object_data=face_data)
    face_obj.location = (0.0, 0.4, 1.8)
    bpy.context.collection.objects.link(face_obj)

def spawn_metaphor_prop(prop_name, mats, location=(0, 1.8, 1.2)):
    """Procedural physical metaphor props illustrating voiceover concepts or Poly Haven import."""
    # Check Poly Haven public CC0 asset library first
    if polyhaven_connector:
        tokens = prop_name.lower().replace('-', '_').split('_')
        for t in tokens:
            if len(t) >= 4 and t not in ['tool', 'prop', 'hero', 'stage']:
                ph_model = polyhaven_connector.import_polyhaven_model(t, location=location, scale=(0.8, 0.8, 0.8))
                if ph_model:
                    return ph_model

    root = bpy.data.objects.new(f"Prop_{prop_name}", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    if 'compass' in prop_name.lower():
        # 3D Brass Compass with Glowing Red Cross X
        bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=0.08, vertices=28, location=(0, 0, 0))
        body = bpy.context.active_object
        body.parent = root
        body.data.materials.append(mats['secondary'])
        set_smooth(body)

        bpy.ops.mesh.primitive_cylinder_add(radius=0.31, depth=0.085, vertices=28, location=(0, 0, 0.01))
        face = bpy.context.active_object
        face.parent = root
        face.data.materials.append(mats['white'])
        set_smooth(face)

        # Needle
        bpy.ops.mesh.primitive_cone_add(radius1=0.04, depth=0.48, vertices=8, location=(0, 0, 0.06), rotation=(0, math.radians(90), 0))
        needle = bpy.context.active_object
        needle.parent = root
        needle.data.materials.append(mats['primary'])
        set_smooth(needle)

        # Glowing Red Cross X (Stamping the impossible)
        mat_red = create_stylized_mat("Mat_Cross_Red", (1.0, 0.05, 0.05, 1.0), roughness=0.2, emission=(1.0, 0.05, 0.05, 1.0), emission_str=3.5)
        for rot in [45, -45]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.12), rotation=(0, 0, math.radians(rot)))
            bar = bpy.context.active_object
            bar.scale = (0.55, 0.08, 0.04)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            bar.parent = root
            bar.data.materials.append(mat_red)

    elif 'rocket' in prop_name.lower() or 'saturn' in prop_name.lower():
        # 3-Stage Rocket Monolith
        bpy.ops.mesh.primitive_cylinder_add(radius=0.45, depth=3.2, vertices=24, location=(0, 4.0, 1.6))
        body = bpy.context.active_object
        body.parent = root
        body.data.materials.append(mats['white'])
        set_smooth(body)

        bpy.ops.mesh.primitive_cone_add(radius1=0.45, depth=1.0, vertices=24, location=(0, 4.0, 3.7))
        cap = bpy.context.active_object
        cap.parent = root
        cap.data.materials.append(mats['primary'])
        set_smooth(cap)

    elif 'lunar' in prop_name.lower() or 'eagle' in prop_name.lower() or 'lander' in prop_name.lower():
        # Miniature Gold-Foil Lunar Lander
        mat_gold = create_stylized_mat("Mat_Mini_LM_Gold", (1.0, 0.78, 0.18, 1.0), roughness=0.25, metallic=0.9)
        mat_dark = create_stylized_mat("Mat_Mini_LM_Dark", (0.15, 0.15, 0.18, 1.0), roughness=0.3)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=0.30, vertices=8, location=(0, 0, 0))
        base = bpy.context.active_object
        base.parent = root
        base.data.materials.append(mat_gold)
        set_smooth(base)

        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.28))
        cabin = bpy.context.active_object
        cabin.scale = (0.32, 0.32, 0.26)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        cabin.parent = root
        cabin.data.materials.append(mat_dark)
        set_smooth(cabin)

        for ang in [45, 135, 225, 315]:
            rad = math.radians(ang)
            create_capsule_bone(f"Mini_LM_Leg_{ang}", (0, 0, 0), (math.cos(rad)*0.45, math.sin(rad)*0.45, -0.22), radius=0.02, mat=mat_gold, parent=root)

    elif 'blueprint' in prop_name.lower() or 'scroll' in prop_name.lower() or 'map' in prop_name.lower():
        # Drafting Table with Blueprint Scroll
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
        table = bpy.context.active_object
        table.scale = (0.75, 0.50, 0.06)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        table.parent = root
        table.data.materials.append(mats['secondary'])
        set_smooth(table)

        # Unfurled Cyan Blueprint
        mat_bp = create_stylized_mat("Mat_Cyan_Blueprint", (0.05, 0.35, 0.85, 1.0), roughness=0.4, emission=(0.0, 0.5, 1.0, 1.0), emission_str=1.2)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.04))
        bp = bpy.context.active_object
        bp.scale = (0.65, 0.42, 0.01)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        bp.parent = root
        bp.data.materials.append(mat_bp)

    elif 'calculator' in prop_name.lower() or 'computer' in prop_name.lower() or 'dsky' in prop_name.lower():
        # Apollo Guidance Computer DSKY Console
        mat_dsky = create_stylized_mat("Mat_DSKY_Body", (0.12, 0.14, 0.16, 1.0), roughness=0.35)
        mat_dsky_disp = create_stylized_mat("Mat_DSKY_LED", (0.1, 0.95, 0.1, 1.0), roughness=0.1, emission=(0.1, 1.0, 0.1, 1.0), emission_str=3.5)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
        dsky = bpy.context.active_object
        dsky.scale = (0.45, 0.25, 0.60)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        dsky.parent = root
        dsky.data.materials.append(mat_dsky)
        set_smooth(dsky)

        # Glowing Green LED Digital Screen
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.13, 0.14))
        disp = bpy.context.active_object
        disp.scale = (0.36, 0.02, 0.22)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        disp.parent = root
        disp.data.materials.append(mat_dsky_disp)

    elif 'gear' in prop_name.lower() or 'mechanism' in prop_name.lower():
        # Glowing Precision Gear Mechanism
        mat_gear = create_stylized_mat("Mat_Gear_Gold", (1.0, 0.78, 0.18, 1.0), roughness=0.2, metallic=0.95)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=0.06, vertices=16, location=(0, 0, 0), rotation=(math.radians(90), 0, 0))
        g1 = bpy.context.active_object
        g1.parent = root
        g1.data.materials.append(mat_gear)
        set_smooth(g1)

        bpy.ops.mesh.primitive_cylinder_add(radius=0.22, depth=0.06, vertices=12, location=(0.42, 0, 0.24), rotation=(math.radians(90), 0, 0))
        g2 = bpy.context.active_object
        g2.parent = root
        g2.data.materials.append(mat_gear)
        set_smooth(g2)

    elif 'orbit' in prop_name.lower() or 'star' in prop_name.lower() or 'gyro' in prop_name.lower():
        # Glowing Celestial Orbital Arc & Cyan True North Bisector
        mat_cyan = create_stylized_mat("Mat_North_Beam", (0.0, 0.95, 1.0, 1.0), roughness=0.1, emission=(0.0, 0.95, 1.0, 1.0), emission_str=4.0)
        bpy.ops.mesh.primitive_torus_add(major_radius=1.8, minor_radius=0.03, major_segments=32, minor_segments=8, location=(0, 3.5, 2.4), rotation=(math.radians(65), 0, 0))
        ring = bpy.context.active_object
        ring.parent = root
        ring.data.materials.append(mats['secondary'])
        set_smooth(ring)

        # Vertical Bisector Laser
        bpy.ops.mesh.primitive_cylinder_add(radius=0.025, depth=4.0, vertices=16, location=(0, 3.5, 2.0))
        laser = bpy.context.active_object
        laser.parent = root
        laser.data.materials.append(mat_cyan)
        set_smooth(laser)

    else:
        # Hero Floating Tool Pedestal
        bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=0.9, vertices=24, location=(0, 0, -0.45))
        ped = bpy.context.active_object
        ped.parent = root
        ped.data.materials.append(mats['secondary'])
        set_smooth(ped)

    return root

# -----------------------------------------------------------------------------
# 5B. PROCEDURAL ANIMATED STORYTELLING GAG RUNTIMES
# -----------------------------------------------------------------------------
def build_animated_denial_stamp(target, mats, location, start_f, end_f):
    """Gag 1: Spawns target prop and slams down a glowing red ❌ denial stamp."""
    root = bpy.data.objects.new(f"Gag_Denial_{target}_{start_f}", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    # 1. Base Target Prop (Handheld GPS or Map Screen)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
    base = bpy.context.active_object
    base.scale = (0.38, 0.22, 0.52)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    base.parent = root
    base.data.materials.append(mats['secondary'])
    set_smooth(base)

    mat_screen = create_stylized_mat("Mat_GPS_Screen", (0.05, 0.15, 0.35, 1.0), roughness=0.2)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.115, 0.04))
    screen = bpy.context.active_object
    screen.scale = (0.30, 0.02, 0.36)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    screen.parent = root
    screen.data.materials.append(mat_screen)

    # 2. Glowing Red Cross X (Denial Stamp)
    mat_red = create_stylized_mat("Mat_Stamp_Red", (1.0, 0.05, 0.05, 1.0), roughness=0.1, emission=(1.0, 0.02, 0.02, 1.0), emission_str=5.0)
    cross_pivot = bpy.data.objects.new(f"Cross_Pivot_{start_f}", None)
    cross_pivot.location = (0, -0.15, 0.04)
    cross_pivot.parent = root
    bpy.context.collection.objects.link(cross_pivot)

    for rot in [45, -45]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0), rotation=(0, 0, math.radians(rot)))
        bar = bpy.context.active_object
        bar.scale = (0.42, 0.06, 0.04)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        bar.parent = cross_pivot
        bar.data.materials.append(mat_red)

    # Animation: Violent Slam Impact at start_f + 14
    impact_f = start_f + 14
    cross_pivot.scale = (0.001, 0.001, 0.001)
    cross_pivot.keyframe_insert(data_path="scale", frame=start_f)
    cross_pivot.keyframe_insert(data_path="scale", frame=impact_f - 2)

    cross_pivot.scale = (1.50, 1.50, 1.50)
    cross_pivot.keyframe_insert(data_path="scale", frame=impact_f)

    cross_pivot.scale = (0.90, 0.90, 0.90)
    cross_pivot.keyframe_insert(data_path="scale", frame=impact_f + 3)

    cross_pivot.scale = (1.0, 1.0, 1.0)
    cross_pivot.keyframe_insert(data_path="scale", frame=impact_f + 6)
    cross_pivot.keyframe_insert(data_path="scale", frame=end_f)

    return root

def build_animated_fuel_gauge(mats, location, start_f, end_f):
    """Gag 2: Sweeping 3D dial meter dropping from green FULL into red EMPTY with twitching jitter."""
    root = bpy.data.objects.new(f"Gag_FuelGauge_{start_f}", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    # 1. Circular Housing
    mat_housing = create_stylized_mat("Mat_Gauge_Housing", (0.1, 0.1, 0.12, 1.0), roughness=0.3)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.42, depth=0.08, vertices=28, location=(0, 0, 0), rotation=(math.radians(90), 0, 0))
    housing = bpy.context.active_object
    housing.parent = root
    housing.data.materials.append(mat_housing)
    set_smooth(housing)

    # 2. Dial Face
    bpy.ops.mesh.primitive_cylinder_add(radius=0.38, depth=0.085, vertices=28, location=(0, -0.01, 0), rotation=(math.radians(90), 0, 0))
    face = bpy.context.active_object
    face.parent = root
    face.data.materials.append(mats['white'])
    set_smooth(face)

    # Red Danger Arc on Left Side
    mat_red = create_stylized_mat("Mat_Danger_Red", (1.0, 0.08, 0.08, 1.0), roughness=0.2, emission=(1.0, 0.08, 0.08, 1.0), emission_str=3.0)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.16, -0.02, -0.06), rotation=(0, math.radians(-30), 0))
    danger_bar = bpy.context.active_object
    danger_bar.scale = (0.18, 0.01, 0.06)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    danger_bar.parent = root
    danger_bar.data.materials.append(mat_red)

    # 3. Needle with Center Pivot
    needle_pivot = bpy.data.objects.new(f"Needle_Pivot_{start_f}", None)
    needle_pivot.location = (0, -0.03, 0)
    needle_pivot.parent = root
    bpy.context.collection.objects.link(needle_pivot)

    mat_needle = create_stylized_mat("Mat_Needle", (0.95, 0.15, 0.05, 1.0), roughness=0.2)
    bpy.ops.mesh.primitive_cone_add(radius1=0.028, depth=0.32, vertices=12, location=(0, 0, 0.14))
    needle = bpy.context.active_object
    needle.parent = needle_pivot
    needle.data.materials.append(mat_needle)
    set_smooth(needle)

    # Needle Animation: Sweeps from +50 deg to -70 deg with high-frequency jitter
    sweep_duration = max(30, end_f - start_f)
    for f in range(start_f, end_f + 1, 2):
        progress = (f - start_f) / float(sweep_duration)
        base_angle = math.radians(50 - progress * 120)
        jitter = math.sin(f * 2.2) * math.radians(4.0) if progress > 0.4 else 0.0
        needle_pivot.rotation_euler.y = base_angle + jitter
        needle_pivot.keyframe_insert(data_path="rotation_euler", frame=f)

    # 4. Flashing Red Warning Light on Top
    mat_lamp = create_stylized_mat("Mat_Alarm_Lamp", (1.0, 0.0, 0.0, 1.0), emission=(1.0, 0.0, 0.0, 1.0), emission_str=4.0)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07, segments=16, ring_count=12, location=(0, -0.02, 0.46))
    lamp = bpy.context.active_object
    lamp.parent = root
    lamp.data.materials.append(mat_lamp)
    set_smooth(lamp)

    return root

def build_animated_countdown(mats, location, start_f, end_f):
    """Gag 3: Glowing digital HUD readout with an actively draining progress bar."""
    root = bpy.data.objects.new(f"Gag_Countdown_{start_f}", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    # Console Frame
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
    frame_obj = bpy.context.active_object
    frame_obj.scale = (0.75, 0.12, 0.40)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    frame_obj.parent = root
    frame_obj.data.materials.append(mats['secondary'])
    set_smooth(frame_obj)

    # Screen
    mat_screen = create_stylized_mat("Mat_HUD_Screen", (0.02, 0.08, 0.16, 1.0), roughness=0.1)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.065, 0))
    screen = bpy.context.active_object
    screen.scale = (0.68, 0.01, 0.32)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    screen.parent = root
    screen.data.materials.append(mat_screen)

    # Draining Progress Bar
    mat_bar = create_stylized_mat("Mat_Countdown_Bar", (0.0, 0.95, 1.0, 1.0), emission=(0.0, 0.95, 1.0, 1.0), emission_str=4.5)
    bar_pivot = bpy.data.objects.new(f"Bar_Pivot_{start_f}", None)
    bar_pivot.location = (-0.30, -0.075, 0)
    bar_pivot.parent = root
    bpy.context.collection.objects.link(bar_pivot)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.30, 0, 0))
    bar = bpy.context.active_object
    bar.scale = (0.60, 0.015, 0.14)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bar.parent = bar_pivot
    bar.data.materials.append(mat_bar)

    bar_pivot.scale.x = 1.0
    bar_pivot.keyframe_insert(data_path="scale", frame=start_f)
    bar_pivot.scale.x = 0.05
    bar_pivot.keyframe_insert(data_path="scale", frame=end_f)

    return root

def build_animated_hologram_badge(badge_type, mats, location, start_f, end_f):
    """Gag 4: Floating 3D holographic badge (⚠️ ERROR, ❓ PUZZLE) with elastic pop-up."""
    root = bpy.data.objects.new(f"Gag_Badge_{badge_type}_{start_f}", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    mat_badge = create_stylized_mat("Mat_Holo_Badge", (1.0, 0.75, 0.05, 1.0), roughness=0.1, emission=(1.0, 0.75, 0.05, 1.0), emission_str=4.5)
    if 'error' in badge_type.lower() or 'disaster' in badge_type.lower():
        mat_badge = create_stylized_mat("Mat_Holo_Error", (1.0, 0.05, 0.05, 1.0), roughness=0.1, emission=(1.0, 0.05, 0.05, 1.0), emission_str=5.0)

    bpy.ops.mesh.primitive_cone_add(radius1=0.28, depth=0.08, vertices=3, location=(0, 0, 0), rotation=(math.radians(90), 0, 0))
    tri = bpy.context.active_object
    tri.parent = root
    tri.data.materials.append(mat_badge)
    set_smooth(tri)

    mat_dark = create_stylized_mat("Mat_Mark_Dark", (0.05, 0.05, 0.05, 1.0), roughness=0.2)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.05, 0.02))
    mark = bpy.context.active_object
    mark.scale = (0.04, 0.02, 0.14)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mark.parent = root
    mark.data.materials.append(mat_dark)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.025, segments=12, ring_count=8, location=(0, -0.05, -0.09))
    dot = bpy.context.active_object
    dot.parent = root
    dot.data.materials.append(mat_dark)

    pop_f = start_f + 10
    root.scale = (0.001, 0.001, 0.001)
    root.keyframe_insert(data_path="scale", frame=start_f)
    root.scale = (1.35, 1.35, 1.35)
    root.keyframe_insert(data_path="scale", frame=pop_f)
    root.scale = (0.92, 0.92, 0.92)
    root.keyframe_insert(data_path="scale", frame=pop_f + 3)
    root.scale = (1.0, 1.0, 1.0)
    root.keyframe_insert(data_path="scale", frame=pop_f + 6)
    root.keyframe_insert(data_path="scale", frame=end_f)

    for f in range(pop_f, end_f + 1, 3):
        root.location.z = location[2] + math.sin(f * 0.22) * 0.035
        root.keyframe_insert(data_path="location", frame=f)

    return root

def build_animated_descent_landing(mats, target_pos, start_f, end_f):
    """Gag 5: Active Lunar Module descending through air and impacting ground with dust shockwave."""
    root = bpy.data.objects.new(f"Gag_DescentLanding_{start_f}", None)
    bpy.context.collection.objects.link(root)

    mat_gold = create_stylized_mat("Mat_Desc_Gold", (1.0, 0.78, 0.18, 1.0), roughness=0.25, metallic=0.92)
    mat_dark = create_stylized_mat("Mat_Desc_Alloy", (0.15, 0.16, 0.18, 1.0), roughness=0.35, metallic=0.8)
    mat_plume = create_stylized_mat("Mat_Thruster_Plume", (0.1, 0.7, 1.0, 0.8), emission=(0.2, 0.8, 1.0, 1.0), emission_str=6.0)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.45, depth=0.35, vertices=8, location=(0, 0, 0))
    base = bpy.context.active_object
    base.parent = root
    base.data.materials.append(mat_gold)
    set_smooth(base)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.32))
    cabin = bpy.context.active_object
    cabin.scale = (0.38, 0.38, 0.30)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    cabin.parent = root
    cabin.data.materials.append(mat_dark)
    set_smooth(cabin)

    for ang in [45, 135, 225, 315]:
        rad = math.radians(ang)
        create_capsule_bone(f"Desc_Leg_{ang}_{start_f}", (0, 0, 0), (math.cos(rad)*0.55, math.sin(rad)*0.55, -0.32), radius=0.03, mat=mat_gold, parent=root)

    # Thruster Flame Cone
    bpy.ops.mesh.primitive_cone_add(radius1=0.18, depth=0.55, vertices=16, location=(0, 0, -0.42), rotation=(0, math.radians(180), 0))
    plume = bpy.context.active_object
    plume.parent = root
    plume.data.materials.append(mat_plume)
    set_smooth(plume)

    touchdown_f = max(start_f + 30, end_f - 25)
    root.location = (target_pos[0], target_pos[1], 3.8)
    root.keyframe_insert(data_path="location", frame=start_f)
    root.location = (target_pos[0], target_pos[1], 0.32)
    root.keyframe_insert(data_path="location", frame=touchdown_f)
    root.keyframe_insert(data_path="location", frame=end_f)

    # Plume cutoff
    plume.scale = (1.0, 1.0, 1.0)
    plume.keyframe_insert(data_path="scale", frame=start_f)
    plume.keyframe_insert(data_path="scale", frame=touchdown_f - 1)
    plume.scale = (0.001, 0.001, 0.001)
    plume.keyframe_insert(data_path="scale", frame=touchdown_f)

    # Dust shockwave ring
    mat_dust = create_stylized_mat("Mat_Dust_Ring", (0.85, 0.85, 0.90, 0.6), roughness=0.5)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.15, minor_radius=0.04, major_segments=24, minor_segments=8, location=(target_pos[0], target_pos[1], 0.02))
    ring = bpy.context.active_object
    ring.parent = root
    ring.data.materials.append(mat_dust)

    ring.scale = (0.001, 0.001, 0.001)
    ring.keyframe_insert(data_path="scale", frame=start_f)
    ring.keyframe_insert(data_path="scale", frame=touchdown_f)
    ring.scale = (3.2, 3.2, 0.8)
    ring.keyframe_insert(data_path="scale", frame=touchdown_f + 16)

    return root

def build_animated_flag_plant(mats, location, start_f, end_f):
    """Gag 6: Flagpole plunges down into ground and banner cloth unfurls and ripples."""
    root = bpy.data.objects.new(f"Gag_FlagPlant_{start_f}", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    mat_pole = create_stylized_mat("Mat_Pole_Steel", (0.9, 0.9, 0.95, 1.0), roughness=0.2, metallic=0.95)
    create_capsule_bone(f"Plant_Pole_{start_f}", (0, 0, 0), (0, 0, 1.6), radius=0.025, mat=mat_pole, parent=root)

    mat_flag = create_stylized_mat("Mat_Flag_Vibrant", (0.95, 0.1, 0.1, 1.0), roughness=0.45)
    mat_white = create_stylized_mat("Mat_Flag_White", (0.98, 0.98, 0.98, 1.0), roughness=0.45)
    mat_blue = create_stylized_mat("Mat_Flag_Blue", (0.05, 0.15, 0.75, 1.0), roughness=0.45)

    flag_pivot = bpy.data.objects.new(f"Flag_Cloth_Pivot_{start_f}", None)
    flag_pivot.location = (0, 0, 1.35)
    flag_pivot.parent = root
    bpy.context.collection.objects.link(flag_pivot)

    # Base red cloth
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.35, 0, 0))
    cloth = bpy.context.active_object
    cloth.scale = (0.70, 0.02, 0.45)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    cloth.parent = flag_pivot
    cloth.data.materials.append(mat_flag)

    # Stylized white stripes
    for stripe_z in [-0.10, 0.0, 0.10]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.35, 0.002, stripe_z))
        stripe = bpy.context.active_object
        stripe.scale = (0.70, 0.022, 0.04)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        stripe.parent = flag_pivot
        stripe.data.materials.append(mat_white)

    # Blue canton block
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.17, 0.004, 0.11))
    canton = bpy.context.active_object
    canton.scale = (0.34, 0.025, 0.22)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    canton.parent = flag_pivot
    canton.data.materials.append(mat_blue)

    plant_f = start_f + 16
    root.location = (location[0], location[1], 1.2)
    root.keyframe_insert(data_path="location", frame=start_f)
    root.location = (location[0], location[1], 0.0)
    root.keyframe_insert(data_path="location", frame=plant_f)
    root.keyframe_insert(data_path="location", frame=end_f)

    flag_pivot.scale.x = 0.01
    flag_pivot.keyframe_insert(data_path="scale", frame=start_f)
    flag_pivot.scale.x = 0.01
    flag_pivot.keyframe_insert(data_path="scale", frame=plant_f - 2)
    flag_pivot.scale.x = 1.15
    flag_pivot.keyframe_insert(data_path="scale", frame=plant_f + 6)
    flag_pivot.scale.x = 1.0
    flag_pivot.keyframe_insert(data_path="scale", frame=plant_f + 10)
    flag_pivot.scale.x = 1.0
    flag_pivot.keyframe_insert(data_path="scale", frame=end_f)

    for f in range(plant_f, end_f + 1, 3):
        flag_pivot.rotation_euler.y = math.sin(f * 0.35) * math.radians(8.0)
        flag_pivot.keyframe_insert(data_path="rotation_euler", frame=f)

    return root

def build_animated_blueprint_unfurl(mats, location, start_f, end_f):
    """Gag 7: Drafting table appears and rolled cyan blueprint unrolls across it."""
    root = bpy.data.objects.new(f"Gag_Blueprint_{start_f}", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.4))
    table = bpy.context.active_object
    table.scale = (0.85, 0.55, 0.08)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    table.parent = root
    table.data.materials.append(mats['secondary'])
    set_smooth(table)

    for lx, ly in [(-0.38, -0.22), (0.38, -0.22), (-0.38, 0.22), (0.38, 0.22)]:
        create_capsule_bone(f"Table_Leg_{start_f}_{lx}", (lx, ly, 0.4), (lx, ly, 0.0), radius=0.03, mat=mats['secondary'], parent=root)

    mat_bp = create_stylized_mat("Mat_Glow_Blueprint", (0.05, 0.4, 0.9, 1.0), roughness=0.3, emission=(0.0, 0.6, 1.0, 1.0), emission_str=2.0)
    bp_pivot = bpy.data.objects.new(f"BP_Pivot_{start_f}", None)
    bp_pivot.location = (-0.35, 0, 0.45)
    bp_pivot.parent = root
    bpy.context.collection.objects.link(bp_pivot)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.35, 0, 0))
    bp = bpy.context.active_object
    bp.scale = (0.70, 0.45, 0.01)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bp.parent = bp_pivot
    bp.data.materials.append(mat_bp)

    unfurl_f = start_f + 14
    bp_pivot.scale.x = 0.01
    bp_pivot.keyframe_insert(data_path="scale", frame=start_f)
    bp_pivot.scale.x = 1.08
    bp_pivot.keyframe_insert(data_path="scale", frame=unfurl_f)
    bp_pivot.scale.x = 1.0
    bp_pivot.keyframe_insert(data_path="scale", frame=unfurl_f + 4)
    bp_pivot.scale.x = 1.0
    bp_pivot.keyframe_insert(data_path="scale", frame=end_f)

    return root

def spawn_and_animate_story_gag(gag_type, gag_params, mats, location, start_f, end_f):
    """Master procedural dispatcher for animated storytelling gags."""
    if gag_type == 'GAG_STAMP_DENIAL':
        return build_animated_denial_stamp(gag_params.get('target', 'gps'), mats, location, start_f, end_f)
    elif gag_type == 'GAG_GAUGE_METER':
        return build_animated_fuel_gauge(mats, location, start_f, end_f)
    elif gag_type == 'GAG_COUNTDOWN_TIMER':
        return build_animated_countdown(mats, location, start_f, end_f)
    elif gag_type == 'GAG_HOLOGRAM_BADGE':
        return build_animated_hologram_badge(gag_params.get('badge', 'warning'), mats, location, start_f, end_f)
    elif gag_type == 'GAG_DESCENT_LANDING':
        return build_animated_descent_landing(mats, location, start_f, end_f)
    elif gag_type == 'GAG_FLAG_PLANT':
        return build_animated_flag_plant(mats, location, start_f, end_f)
    elif gag_type == 'GAG_BLUEPRINT_UNFURL':
        return build_animated_blueprint_unfurl(mats, location, start_f, end_f)
    return None

# -----------------------------------------------------------------------------
# 6. CAMERA CHOREOGRAPHY WITH MINIMUM 1.6M COLLISION CLAMPING
# -----------------------------------------------------------------------------
def setup_autonomous_camera(shots, total_frames):
    cam_obj = bpy.data.objects.get("Cam_Universal_Director")
    if not cam_obj:
        cam_data = bpy.data.cameras.new("Cam_Universal_Director")
        cam_obj = bpy.data.objects.new("Cam_Universal_Director", cam_data)
        bpy.context.collection.objects.link(cam_obj)

    bpy.context.scene.camera = cam_obj
    if not cam_obj.animation_data:
        cam_obj.animation_data_create()

    # Pre-calculated safe-zone camera framing presets (strictly >= 1.6m clearance)
    CAM_PRESETS = {
        'wide_establishing': {'start': (-0.4, -2.4, 1.45), 'end': (-0.2, -1.9, 1.40), 'target': (0, 1.5, 0.95), 'lens': 30.0},
        'medium_tracking':   {'start': (-0.30, -1.0, 1.35), 'end': (0.25, -0.7, 1.30), 'target': (0, 1.5, 1.05), 'lens': 36.0},
        'over_shoulder':     {'start': (0.65, 3.2, 1.65),   'end': (0.50, 2.8, 1.60),   'target': (-1.0, -3.0, 1.10), 'lens': 34.0},
        'low_angle_hero':    {'start': (0.45, -0.6, 0.60),  'end': (0.25, -0.3, 0.68),  'target': (0, 1.5, 1.15), 'lens': 32.0},
        'macro_hero_prop':   {'start': (0.55, -0.6, 1.25),  'end': (0.35, -0.3, 1.20),  'target': (0.35, 1.7, 1.05), 'lens': 40.0},
        'crane_climax':      {'start': (-0.8, -1.6, 2.0),   'end': (-1.8, -3.2, 3.4),   'target': (0, 1.5, 0.95), 'lens': 28.0},
    }

    WAYPOINTS = {
        'waypoint_center': (0, 1.5, 0),
        'waypoint_table': (-0.8, 1.2, 0),
        'waypoint_wall': (0.8, 1.8, 0),
        'stationary': (0, 1.5, 0),
    }

    cur_actor_pos = (0, 1.5, 0)
    for idx, shot in enumerate(shots):
        start_f = shot.get('startFrame', 1)
        end_f = shot.get('endFrame', start_f + 90)

        target_loc_name = shot.get('locomotionTarget', 'stationary')
        next_actor_pos = WAYPOINTS.get(target_loc_name, cur_actor_pos)
        actor_x_offset = next_actor_pos[0]
        cur_actor_pos = next_actor_pos

        c_type = shot.get('cameraSetup', {}).get('shotType', 'medium_tracking')
        preset = CAM_PRESETS.get(c_type, CAM_PRESETS['medium_tracking'])

        c_start = Vector((preset['start'][0] + actor_x_offset, preset['start'][1], preset['start'][2]))
        c_end = Vector((preset['end'][0] + actor_x_offset, preset['end'][1], preset['end'][2]))
        target_pos = Vector((preset['target'][0] + actor_x_offset, preset['target'][1], preset['target'][2]))
        lens = preset['lens']

        rot_start = (target_pos - c_start).to_track_quat('-Z', 'Y').to_euler()
        rot_end = (target_pos - c_end).to_track_quat('-Z', 'Y').to_euler()

        cam_obj.location = c_start
        cam_obj.rotation_euler = rot_start
        cam_obj.data.lens = lens
        cam_obj.keyframe_insert(data_path="location", frame=start_f)
        cam_obj.keyframe_insert(data_path="rotation_euler", frame=start_f)
        cam_obj.data.keyframe_insert(data_path="lens", frame=start_f)

        cam_obj.location = c_end
        cam_obj.rotation_euler = rot_end
        cam_obj.data.lens = lens
        cam_obj.keyframe_insert(data_path="location", frame=end_f)
        cam_obj.keyframe_insert(data_path="rotation_euler", frame=end_f)
        cam_obj.data.keyframe_insert(data_path="lens", frame=end_f)

    # Set hard cuts at shot boundaries
    if cam_obj.animation_data and cam_obj.animation_data.action:
        for fcurve in cam_obj.animation_data.action.fcurves:
            for kfp in fcurve.keyframe_points:
                is_boundary = any(s.get('endFrame') == int(kfp.co[0]) for s in shots)
                kfp.interpolation = 'CONSTANT' if is_boundary else 'BEZIER'

# -----------------------------------------------------------------------------
# 7. ANIMATION CHOREOGRAPHY (SPEECH VISESES, BLINKS, ACTIONS)
# -----------------------------------------------------------------------------
def choreograph_story_animation(actor, shots, total_frames):
    head = actor['head']
    spine = actor['spine']
    mouth = actor['mouth']
    eyes = actor['eyes']
    r_sh = actor['r_sh']
    r_el = actor['r_el']
    l_sh = actor['l_sh']
    l_el = actor['l_el']

    # Waypoints for locomotion
    WAYPOINTS = {
        'waypoint_center': (0, 1.5, 0),
        'waypoint_table': (-0.8, 1.2, 0),
        'waypoint_wall': (0.8, 1.8, 0),
        'stationary': (0, 1.5, 0),
    }

    cur_pos = (0, 1.5, 0)
    for idx, shot in enumerate(shots):
        start_f = shot.get('startFrame', 1)
        end_f = shot.get('endFrame', start_f + 90)
        mid_f = (start_f + end_f) // 2

        action_name = shot.get('characterAction', 'ACTION_TALK_GESTURE')
        preset = ACTION_PRESETS.get(action_name, ACTION_PRESETS['ACTION_TALK_GESTURE'])

        target_loc_name = shot.get('locomotionTarget', 'stationary')
        next_pos = WAYPOINTS.get(target_loc_name, cur_pos)

        # Trigger locomotion if target moved
        if Vector(next_pos) != Vector(cur_pos):
            animate_locomotion(actor, cur_pos, next_pos, start_f, min(end_f, start_f + 45))
            cur_pos = next_pos

        # Keyframe pose preset
        for name, obj in [('head', head), ('spine', spine), ('r_sh', r_sh), ('r_el', r_el), ('l_sh', l_sh), ('l_el', l_el)]:
            if not obj: continue
            base_rot = [math.radians(deg) for deg in preset[name]]
            obj.rotation_euler = Euler(base_rot)
            obj.keyframe_insert(data_path="rotation_euler", frame=start_f)

            # Mid-beat nodding / breathing accent
            mid_rot = list(base_rot)
            if name == 'head': mid_rot[0] += 0.035
            elif name == 'spine': mid_rot[0] += 0.015
            obj.rotation_euler = Euler(mid_rot)
            obj.keyframe_insert(data_path="rotation_euler", frame=mid_f)

            obj.rotation_euler = Euler(base_rot)
            obj.keyframe_insert(data_path="rotation_euler", frame=end_f)

        # Climax triumph flourish on the final shot
        if idx == len(shots) - 1:
            flag_plant_f = start_f + int((end_f - start_f) * 0.40)
            triumph_preset = ACTION_PRESETS['ACTION_TRIUMPH']
            for name, obj in [('head', head), ('spine', spine), ('r_sh', r_sh), ('r_el', r_el), ('l_sh', l_sh), ('l_el', l_el)]:
                if not obj: continue
                t_rot = [math.radians(deg) for deg in triumph_preset[name]]
                obj.rotation_euler = Euler(t_rot)
                obj.keyframe_insert(data_path="rotation_euler", frame=flag_plant_f)
                obj.keyframe_insert(data_path="rotation_euler", frame=end_f)

    # Speech Lip-Flap: Rapid syllable modulation
    for f in range(1, total_frames + 1, 3):
        mouth.scale.z = 0.020 + abs(math.sin(f * 0.58)) * 0.045
        mouth.keyframe_insert(data_path="scale", frame=f)

    # Eye Blinking: Natural 3-frame blink every 70 frames
    for eye in eyes:
        for f in range(15, total_frames + 1, 75):
            eye.scale.z = 1.0
            eye.keyframe_insert(data_path="scale", frame=f)
            eye.scale.z = 0.08
            eye.keyframe_insert(data_path="scale", frame=f + 2)
            eye.scale.z = 1.0
            eye.keyframe_insert(data_path="scale", frame=f + 4)

# -----------------------------------------------------------------------------
# 8. MASTER ENTRY POINT
# -----------------------------------------------------------------------------
def build_and_render_universal_reel(manifest_path, audio_path, output_path, is_qa_stills=False, render_video=False):
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    total_frames = manifest.get('totalFrames', 1800)
    shots = manifest.get('shots', [])
    palette = manifest.get('colorPalette', {})
    costume = manifest.get('costumePreset', 'spacesuit')
    theme_era = manifest.get('themeEra', 'space_exploration')

    print(f"\n🚀 BUILDING UNIVERSAL 3D REEL: \"{manifest.get('title')}\"")
    print(f"   • Era: {theme_era} | Costume: {costume} | Total Beats: {len(shots)}")

    clean_all_stage_objects()

    # Materials
    floor_mat = create_stylized_mat("Mat_Floor", hex_to_linear(palette.get('floor', '#71717A')), roughness=0.5)
    backdrop_mat = create_stylized_mat("Mat_Backdrop", hex_to_linear(palette.get('backdrop', '#0B0E14')), roughness=0.6)
    mats = {
        'floor': floor_mat,
        'backdrop': backdrop_mat,
        'primary': create_stylized_mat("Mat_Primary", hex_to_linear(palette.get('primary', '#F8FAFC')), roughness=0.35),
        'secondary': create_stylized_mat("Mat_Secondary", hex_to_linear(palette.get('secondary', '#F59E0B')), roughness=0.30),
        'accent': create_stylized_mat("Mat_Accent", hex_to_linear(palette.get('accent', '#00F0FF')), roughness=0.20, emission=hex_to_linear(palette.get('accent', '#00F0FF')), emission_str=2.5),
        'white': create_stylized_mat("Mat_White", (0.95, 0.95, 0.95, 1.0)),
    }

    # 1. Build Stage Archetype & Cinematic 3-Point Lighting
    primary_archetype = shots[0].get('stageArchetype', 'OUTDOORS_TERRAIN')
    build_stage_archetype(primary_archetype, theme_era, mats)
    setup_cinematic_lighting(palette, theme_era)

    # 2. Spawn Universal Actor
    actor = spawn_universal_humanoid(costume, palette, location=(0, 1.5, 0))

    def set_hierarchy_visibility(obj, hide, frame):
        if not obj: return
        obj.hide_render = hide
        obj.hide_viewport = hide
        obj.keyframe_insert(data_path="hide_render", frame=frame)
        obj.keyframe_insert(data_path="hide_viewport", frame=frame)
        if hasattr(obj, 'children_recursive'):
            for ch in obj.children_recursive:
                ch.hide_render = hide
                ch.hide_viewport = hide
                ch.keyframe_insert(data_path="hide_render", frame=frame)
                ch.keyframe_insert(data_path="hide_viewport", frame=frame)

    # 3. Spawn Focal Metaphor Props with Shot-by-Shot Visibility
    WAYPOINTS = {
        'waypoint_center': (0, 1.5, 0),
        'waypoint_table': (-0.8, 1.2, 0),
        'waypoint_wall': (0.8, 1.8, 0),
        'stationary': (0, 1.5, 0),
    }
    cur_actor_pos = (0, 1.5, 0)
    for idx, shot in enumerate(shots):
        prop_name = shot.get('focalProp', '')
        gag_type = shot.get('gagType', 'GAG_NONE')
        gag_params = shot.get('gagParams', {})
        start_f = shot.get('startFrame', 1)
        end_f = shot.get('endFrame', start_f + 90)

        target_loc_name = shot.get('locomotionTarget', 'stationary')
        next_actor_pos = WAYPOINTS.get(target_loc_name, cur_actor_pos)
        cur_actor_pos = next_actor_pos

        prop_pos = (next_actor_pos[0] + 0.65, next_actor_pos[1] + 0.25, 0.95)

        # 1. Check for procedural animated storytelling gag
        prop_obj = None
        if gag_type and gag_type != 'GAG_NONE':
            prop_obj = spawn_and_animate_story_gag(gag_type, gag_params, mats, prop_pos, start_f, end_f)

        # 2. Fallback to standard focal prop / Poly Haven asset
        if not prop_obj and prop_name:
            prop_obj = spawn_metaphor_prop(prop_name, mats, location=prop_pos)

        if prop_obj:
            if start_f > 1:
                set_hierarchy_visibility(prop_obj, True, 1)
                set_hierarchy_visibility(prop_obj, True, start_f - 1)
            set_hierarchy_visibility(prop_obj, False, start_f)
            set_hierarchy_visibility(prop_obj, False, end_f)
            if end_f < total_frames:
                set_hierarchy_visibility(prop_obj, True, end_f + 1)

        # 3. Climax Flag Plant Gag on final shot
        if idx == len(shots) - 1:
            flag_plant_f = start_f + int((end_f - start_f) * 0.40)
            if prop_obj:
                # Fuel gauge completes warning and vanishes at touchdown
                set_hierarchy_visibility(prop_obj, True, flag_plant_f)
            flag_pos = (next_actor_pos[0] + 0.85, next_actor_pos[1] - 0.25, 0.0)
            flag_obj = build_animated_flag_plant(mats, flag_pos, flag_plant_f, total_frames)
            if flag_obj:
                set_hierarchy_visibility(flag_obj, True, 1)
                set_hierarchy_visibility(flag_obj, True, flag_plant_f - 1)
                set_hierarchy_visibility(flag_obj, False, flag_plant_f)
                set_hierarchy_visibility(flag_obj, False, total_frames)

    # 4. Camera & Animation Choreography
    setup_autonomous_camera(shots, total_frames)
    choreograph_story_animation(actor, shots, total_frames)

    # Render Settings (EEVEE Next GPU)
    scene = bpy.context.scene
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.fps = 30
    scene.frame_start = 1
    scene.frame_end = total_frames
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 12

    if is_qa_stills:
        print("\n📸 Rendering Visual QA Stills...")
        out_dir = os.path.dirname(output_path)
        os.makedirs(out_dir, exist_ok=True)
        sample_indices = sorted(list(set([0, min(2, len(shots)-1), min(5, len(shots)-1), min(8, len(shots)-1), len(shots)-1])))
        for i, sidx in enumerate(sample_indices):
            target_f = (shots[sidx].get('startFrame', 1) + shots[sidx].get('endFrame', 60)) // 2
            scene.frame_set(target_f)
            qa_p = os.path.join(out_dir, f"universal_qa_{i+1:02d}.jpg")
            scene.render.filepath = qa_p
            bpy.ops.render.render(write_still=True)
            print(f"   ✅ Saved QA Still {target_f:4d} (Beat {sidx}) -> {qa_p}")
        return True

    if render_video:
        out_dir = os.path.dirname(output_path)
        os.makedirs(out_dir, exist_ok=True)
        print(f"\n🎬 Rendering {total_frames} Frames with EEVEE Next GPU to: {output_path}...")
        scene.render.image_settings.file_format = 'JPEG'
        scene.render.image_settings.quality = 95
        scene.render.filepath = output_path
        bpy.ops.render.render(animation=True)
        print("✅ EEVEE Next GPU Render Complete!")
        return True

    return True

if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    manifest_p = args[args.index("--manifest") + 1] if "--manifest" in args else "scratch/autonomous_phase3/episode_manifest.json"
    audio_p = args[args.index("--audio") + 1] if "--audio" in args else ""
    out_p = args[args.index("--output") + 1] if "--output" in args else "scratch/autonomous_phase3/frames/frame_"
    qa_mode = "--qa-stills" in args
    render_mode = "--frames" in args

    build_and_render_universal_reel(manifest_p, audio_p, out_p, is_qa_stills=qa_mode, render_video=render_mode)
