"""
Action & Pose Library for Dev (Human) and Gemini (Popapus) Rigs
Defines expressive, strictly clamped actions and poses:
- 13 Dev actions with Zero-Gap Inverse Arm Kinematics (hands 100% attached to cuffs at all times)
- 11 Gemini actions with smooth floating transitions, eye squints/winks, and tentacle articulation
- Pre-cooked laptop screen rotation stunt: Dev rotates laptop to show glowing code terminal to viewers!
"""

import bpy
import math
from mathutils import Vector, Euler

# =============================================================================
# REST TRANSFORMS & CLAMP LIMITS
# =============================================================================
REST_HUMAN = {
    "head_pivot": {"loc": (0.0, 0.95, 1.54), "rot": (0.0, 0.0, 0.0)},
    "mouth": {"loc": (0.0, 0.74, 1.62), "rot": (0.0, 1.5708, 0.0), "scale": (0.35, 1.0, 0.95)},
    "eye_l": {"scale": (0.9, 0.35, 1.25)},
    "eye_r": {"scale": (0.9, 0.35, 1.25)},
    "brow_l": {"loc": (-0.08, 0.74, 1.80), "rot": (0.0, 0.0, 0.1047)},
    "brow_r": {"loc": (0.08, 0.74, 1.80), "rot": (0.0, 0.0, -0.1047)},
    "shoulder_l": Vector((-0.34, 0.95, 1.25)),
    "shoulder_r": Vector((0.34, 0.95, 1.25)),
    "hand_l": {"loc": Vector((-0.14, 0.48, 0.88)), "rot": (0.0, 0.0, 0.0)},
    "hand_r": {"loc": Vector((0.12, 0.48, 0.88)), "rot": (0.0, 0.0, 0.0)},
}

REST_GEMINI = {
    "root": {"loc": (-0.52, 0.16, 1.04), "rot": (0.0, 0.0, 0.2793)},
    "eye_l": {"scale": (0.85, 0.45, 1.20)},
    "eye_r": {"scale": (0.85, 0.45, 1.20)},
    "iris_l": {"scale": (0.75, 0.25, 0.85)},
    "iris_r": {"scale": (0.75, 0.25, 0.85)},
    "nozzle": {"rot": (1.309, 0.0, 0.0)}
}

# =============================================================================
# ZERO-GAP INVERSE ARM KINEMATICS SOLVER
# Pins shoulder to torso socket, scales arm cylinder to distance, and places
# hand sphere exactly at cylinder cuff tip. Zero floating gaps under all poses.
# =============================================================================
def solve_arm_hand(objs, side, hand_pos, frame_num):
    """
    Mathematical Inverse Kinematics solver for human arm cylinders and sphere hands.
    Ensures 100% physical attachment to the arm cuff regardless of posture.
    """
    arm = objs.get(f"Human_Arm_{side}")
    hand = objs.get(f"Human_Hand_{side}")
    if not arm or not hand:
        return

    shoulder_pos = REST_HUMAN[f"shoulder_{side.lower()}"]
    if not isinstance(hand_pos, Vector):
        hand_pos = Vector(hand_pos)

    # 1. Position hand sphere
    hand.location = hand_pos
    hand.keyframe_insert(data_path="location", frame=frame_num)

    # 2. Compute direction and distance from shoulder to hand
    vec = hand_pos - shoulder_pos
    dist = vec.length
    if dist < 0.001:
        return

    # 3. Position arm cylinder at midpoint, stretch cylinder height, aim along vector
    arm.location = (shoulder_pos + hand_pos) * 0.5
    arm.scale = Vector((1.0, 1.0, max(0.1, dist / 0.46)))
    rot_quat = Vector((0, 0, -1)).rotation_difference(vec.normalized())
    arm.rotation_euler = rot_quat.to_euler()

    arm.keyframe_insert(data_path="location", frame=frame_num)
    arm.keyframe_insert(data_path="rotation_euler", frame=frame_num)
    arm.keyframe_insert(data_path="scale", frame=frame_num)

# Helper: clamp values safely
def clamp(val, min_v, max_v):
    return max(min_v, min(max_v, val))

# =============================================================================
# 13 HUMAN ACTIONS (STRICTLY CLAMPED & FULLY KINEMATIC)
# =============================================================================

def apply_human_facepalm(objs, p, f):
    """Dev facepalms: right hand rises to forehead, head bows, inner brows furrow."""
    head = objs.get("Human_Head_Pivot")
    brow_l = objs.get("Human_Brow_L")
    brow_r = objs.get("Human_Brow_R")

    if head:
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] + p * 0.20, -0.15, 0.35)
        head.location.y = REST_HUMAN["head_pivot"]["loc"][1] + p * 0.03
        head.keyframe_insert(data_path="rotation_euler", frame=f)
        head.keyframe_insert(data_path="location", frame=f)

    # Left hand stays relaxed on desk
    pos_l = REST_HUMAN["hand_l"]["loc"]
    # Right hand moves from desk to forehead
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.08, 0.74, 1.66)), p)

    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

    if brow_l and brow_r:
        brow_l.rotation_euler.z = REST_HUMAN["brow_l"]["rot"][2] - p * 0.18
        brow_r.rotation_euler.z = REST_HUMAN["brow_r"]["rot"][2] + p * 0.18
        brow_l.keyframe_insert(data_path="rotation_euler", frame=f)
        brow_r.keyframe_insert(data_path="rotation_euler", frame=f)

def apply_human_skeptical_lean(objs, p, f):
    """Dev leans back skeptically with one raised eyebrow."""
    head = objs.get("Human_Head_Pivot")
    brow_l = objs.get("Human_Brow_L")
    brow_r = objs.get("Human_Brow_R")

    if head:
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] - p * 0.12, -0.20, 0.20)
        head.rotation_euler.y = clamp(REST_HUMAN["head_pivot"]["rot"][1] - p * 0.16, -0.25, 0.25)
        head.location.y = REST_HUMAN["head_pivot"]["loc"][1] - p * 0.04
        head.keyframe_insert(data_path="rotation_euler", frame=f)
        head.keyframe_insert(data_path="location", frame=f)

    if brow_l:
        brow_l.location.z = REST_HUMAN["brow_l"]["loc"][2] + p * 0.035
        brow_l.keyframe_insert(data_path="location", frame=f)
    if brow_r:
        brow_r.location.z = REST_HUMAN["brow_r"]["loc"][2] - p * 0.015
        brow_r.keyframe_insert(data_path="location", frame=f)

    solve_arm_hand(objs, 'L', REST_HUMAN["hand_l"]["loc"], f)
    solve_arm_hand(objs, 'R', REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.18, 0.52, 0.88)), p), f)

def apply_human_double_take(objs, p, f):
    """Dev snaps head right toward Gemini in sudden shock."""
    head = objs.get("Human_Head_Pivot")
    eye_l = objs.get("Human_Eye_L")
    eye_r = objs.get("Human_Eye_R")

    if head:
        head.rotation_euler.z = clamp(REST_HUMAN["head_pivot"]["rot"][2] - p * 0.42, -0.50, 0.50)
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] - p * 0.08, -0.15, 0.15)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    for eye in [eye_l, eye_r]:
        if eye:
            eye.scale.z = REST_HUMAN["eye_l"]["scale"][2] * (1.0 + p * 0.35)
            eye.keyframe_insert(data_path="scale", frame=f)

    solve_arm_hand(objs, 'L', REST_HUMAN["hand_l"]["loc"], f)
    solve_arm_hand(objs, 'R', REST_HUMAN["hand_r"]["loc"], f)

def apply_human_frantic_typing(objs, t, f):
    """Dev aggressively hammers on the laptop keyboard."""
    head = objs.get("Human_Head_Pivot")

    tap_l = abs(math.sin(t * 22.0)) * 0.02
    tap_r = abs(math.cos(t * 22.0)) * 0.02

    pos_l = Vector((-0.08 + math.sin(t * 8.0) * 0.015, 0.44, 0.88 + tap_l))
    pos_r = Vector((0.08 + math.cos(t * 8.0) * 0.015, 0.44, 0.88 + tap_r))

    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

    if head:
        head.rotation_euler.x = REST_HUMAN["head_pivot"]["rot"][0] + 0.12 + math.sin(t * 11.0) * 0.015
        head.rotation_euler.z = REST_HUMAN["head_pivot"]["rot"][2] + math.sin(t * 4.0) * 0.03
        head.keyframe_insert(data_path="rotation_euler", frame=f)

def apply_human_shrug(objs, p, f):
    """Dev raises both arms and tilts head in a baffled shrug."""
    head = objs.get("Human_Head_Pivot")
    brow_l = objs.get("Human_Brow_L")
    brow_r = objs.get("Human_Brow_R")

    if head:
        head.rotation_euler.y = clamp(p * 0.15, -0.20, 0.20)
        head.rotation_euler.x = clamp(-p * 0.06, -0.15, 0.15)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    if brow_l and brow_r:
        brow_l.location.z = REST_HUMAN["brow_l"]["loc"][2] + p * 0.03
        brow_r.location.z = REST_HUMAN["brow_r"]["loc"][2] + p * 0.03
        brow_l.keyframe_insert(data_path="location", frame=f)
        brow_r.keyframe_insert(data_path="location", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((-0.34, 0.60, 1.10)), p)
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.34, 0.60, 1.10)), p)

    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_excited_point(objs, p, f):
    """Dev pops upright and points right hand upward in sudden realization."""
    head = objs.get("Human_Head_Pivot")

    if head:
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] - p * 0.10, -0.15, 0.15)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"]
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.22, 0.60, 1.56)), p)

    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_pleading_hands(objs, p, f):
    """Dev clasps hands together at chest height pleading with Gemini."""
    head = objs.get("Human_Head_Pivot")

    if head:
        head.rotation_euler.x = clamp(-p * 0.08, -0.15, 0.15)
        head.location.y = REST_HUMAN["head_pivot"]["loc"][1] + p * 0.03
        head.keyframe_insert(data_path="rotation_euler", frame=f)
        head.keyframe_insert(data_path="location", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((-0.06, 0.68, 1.25)), p)
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.06, 0.68, 1.25)), p)

    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_head_in_hands_slump(objs, p, f):
    """Dev slumps forward with face buried in both hands."""
    head = objs.get("Human_Head_Pivot")

    if head:
        head.rotation_euler.x = clamp(p * 0.28, -0.10, 0.40)
        head.location.y = REST_HUMAN["head_pivot"]["loc"][1] + p * 0.05
        head.location.z = REST_HUMAN["head_pivot"]["loc"][2] - p * 0.05
        head.keyframe_insert(data_path="rotation_euler", frame=f)
        head.keyframe_insert(data_path="location", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((-0.12, 0.78, 1.58)), p)
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.12, 0.78, 1.58)), p)

    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_mic_drop_nod(objs, p, f):
    """Dev leans back confidently and executes a slow mic-drop nod."""
    head = objs.get("Human_Head_Pivot")
    if head:
        head.rotation_euler.x = clamp(p * 0.15, -0.15, 0.20)
        head.rotation_euler.y = 0.0
        head.location.y = REST_HUMAN["head_pivot"]["loc"][1] - p * 0.03
        head.keyframe_insert(data_path="rotation_euler", frame=f)
        head.keyframe_insert(data_path="location", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"]
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.20, 0.42, 0.82)), p)

    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_slow_panic_recoil(objs, p, f):
    """Dev reels back in horror, staring with dilated eyes."""
    head = objs.get("Human_Head_Pivot")
    eye_l = objs.get("Human_Eye_L")
    eye_r = objs.get("Human_Eye_R")
    mouth = objs.get("Human_Mouth")

    if head:
        head.location.y = REST_HUMAN["head_pivot"]["loc"][1] + p * 0.05
        head.rotation_euler.x = clamp(-p * 0.16, -0.22, 0.10)
        head.keyframe_insert(data_path="location", frame=f)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    for eye in [eye_l, eye_r]:
        if eye:
            eye.scale.x = REST_HUMAN["eye_l"]["scale"][0] * (1.0 + p * 0.40)
            eye.scale.z = REST_HUMAN["eye_l"]["scale"][2] * (1.0 + p * 0.40)
            eye.keyframe_insert(data_path="scale", frame=f)

    if mouth:
        mouth.scale.x = 0.35 + p * 2.8
        mouth.scale.z = 1.25
        mouth.keyframe_insert(data_path="scale", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((-0.18, 0.65, 1.15)), p)
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.18, 0.65, 1.15)), p)

    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_panic_head_clutch(objs, p, f):
    """Dev clutches both sides of his head in absolute panic with lively nodding & tremors."""
    hp = objs.get("Human_Head_Pivot")
    bl = objs.get("Human_Brow_L")
    br = objs.get("Human_Brow_R")
    el = objs.get("Human_Eye_L")
    er = objs.get("Human_Eye_R")
    m = objs.get("Human_Mouth")

    # Lively comedic panic nodding and tremors
    t = f / 30.0
    panic_nod = math.sin(t * 16.0) * math.radians(4.0) * p # Rapid comedic pitch nods
    panic_shake = math.cos(t * 9.0) * math.radians(2.2) * p # Micro disbelief wobble
    brow_twitch = math.sin(t * 22.0) * 0.012 * p # Stress twitches
    hand_tremble = math.sin(t * 26.0) * 0.005 * p # Vibrating panic hands

    if hp:
        hp.location.y = REST_HUMAN["head_pivot"]["loc"][1] * (1 - p) + 0.94 * p
        hp.location.z = REST_HUMAN["head_pivot"]["loc"][2] * (1 - p) + 1.52 * p
        hp.rotation_euler.x = (REST_HUMAN["head_pivot"]["rot"][0] * (1 - p) + math.radians(10) * p) + panic_nod
        hp.rotation_euler.z = panic_shake
        hp.keyframe_insert(data_path="location", frame=f)
        hp.keyframe_insert(data_path="rotation_euler", frame=f)

    if bl and br:
        bl.location.z = REST_HUMAN["brow_l"]["loc"][2] * (1 - p) + (1.83 + brow_twitch) * p
        br.location.z = REST_HUMAN["brow_r"]["loc"][2] * (1 - p) + (1.83 - brow_twitch) * p
        bl.rotation_euler.z = REST_HUMAN["brow_l"]["rot"][2] * (1 - p) + math.radians(-20) * p
        br.rotation_euler.z = REST_HUMAN["brow_r"]["rot"][2] * (1 - p) + math.radians(20) * p
        bl.keyframe_insert(data_path="location", frame=f)
        br.keyframe_insert(data_path="location", frame=f)
        bl.keyframe_insert(data_path="rotation_euler", frame=f)
        br.keyframe_insert(data_path="rotation_euler", frame=f)

    for eye in [el, er]:
        if eye:
            eye.scale.x = REST_HUMAN["eye_l"]["scale"][0] * (1.0 + p * 0.35)
            eye.scale.z = REST_HUMAN["eye_l"]["scale"][2] * (1.0 + p * 0.35)
            eye.keyframe_insert(data_path="scale", frame=f)

    if m:
        m.scale.x = REST_HUMAN["mouth"]["scale"][0] * (1 - p) + 0.45 * p
        m.scale.z = REST_HUMAN["mouth"]["scale"][2] * (1 - p) + 1.10 * p
        m.keyframe_insert(data_path="scale", frame=f)

    # Both hands move cleanly to clutch temples with micro-tremble (ZERO GAP)
    pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((-0.24, 0.88, 1.70 + hand_tremble)), p)
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.24, 0.88, 1.70 - hand_tremble)), p)

    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_sad_slump(objs, p, f):
    """Dev drops chin towards desk in dejected, relatable defeat."""
    hp = objs.get("Human_Head_Pivot")
    bl = objs.get("Human_Brow_L")
    br = objs.get("Human_Brow_R")
    el = objs.get("Human_Eye_L")
    er = objs.get("Human_Eye_R")

    if hp:
        hp.location.y = REST_HUMAN["head_pivot"]["loc"][1] * (1 - p) + 0.88 * p
        hp.location.z = REST_HUMAN["head_pivot"]["loc"][2] * (1 - p) + 1.44 * p
        hp.rotation_euler.x = REST_HUMAN["head_pivot"]["rot"][0] * (1 - p) + math.radians(24) * p
        hp.keyframe_insert(data_path="location", frame=f)
        hp.keyframe_insert(data_path="rotation_euler", frame=f)

    if bl and br:
        bl.location.z = REST_HUMAN["brow_l"]["loc"][2] * (1 - p) + 1.77 * p
        br.location.z = REST_HUMAN["brow_r"]["loc"][2] * (1 - p) + 1.77 * p
        bl.rotation_euler.z = REST_HUMAN["brow_l"]["rot"][2] * (1 - p) + math.radians(16) * p
        br.rotation_euler.z = REST_HUMAN["brow_r"]["rot"][2] * (1 - p) + math.radians(-16) * p
        bl.keyframe_insert(data_path="location", frame=f)
        br.keyframe_insert(data_path="location", frame=f)
        bl.keyframe_insert(data_path="rotation_euler", frame=f)
        br.keyframe_insert(data_path="rotation_euler", frame=f)

    for eye in [el, er]:
        if eye:
            eye.scale.z = REST_HUMAN["eye_l"]["scale"][2] * (1.0 - p * 0.45)
            eye.keyframe_insert(data_path="scale", frame=f)

    # Both hands slump flat on the desk/lap (ZERO GAP)
    pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((-0.16, 0.52, 0.84)), p)
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.16, 0.52, 0.84)), p)

    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_show_screen(objs, p, f):
    """
    Dev performs the screen reveal stunt:
    1. Dev grips the corner of the laptop with his right hand.
    2. Rotates the laptop 160 degrees around Z to show viewers the glowing code terminal!
    3. Points with finger at the code lines.
    """
    head = objs.get("Human_Head_Pivot")
    laptop_root = objs.get("Laptop_Root")

    if head:
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] - p * 0.08, -0.15, 0.15)
        head.rotation_euler.y = clamp(p * 0.10, -0.15, 0.15)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    # Rotate laptop to face the camera (Z rotation from 0 to 160 degrees)
    if laptop_root:
        rot_prog = min(1.0, p * 1.8) # Turns around quickly in the first half
        rot_ease = 0.5 - 0.5 * math.cos(rot_prog * math.pi)
        laptop_root.rotation_euler.z = math.radians(160) * rot_ease
        laptop_root.keyframe_insert(data_path="rotation_euler", frame=f)

    # Left hand stays resting or gesturing near table edge
    pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((-0.20, 0.45, 0.86)), p)

    # Right hand moves from keyboard to laptop corner, then points at the code screen
    if p < 0.5:
        # Phase 1: hand grips and turns laptop corner
        turn_p = p / 0.5
        pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.22, 0.40, 0.83)), turn_p)
    else:
        # Phase 2: hand raises and points directly at the glowing code display
        point_p = (p - 0.5) / 0.5
        pos_r = Vector((0.22, 0.40, 0.83)).lerp(Vector((0.12, 0.36, 1.05)), point_p)

    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

# =============================================================================

def apply_human_head_scratch(objs, p, f):
    """Human scratches back of head in awkward confusion."""
    head = objs.get("Human_Head_Pivot")
    brow_l = objs.get("Human_Brow_L")
    brow_r = objs.get("Human_Brow_R")

    if head:
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] - p * 0.10, -0.20, 0.20)
        head.rotation_euler.y = clamp(REST_HUMAN["head_pivot"]["rot"][1] + p * 0.15, -0.25, 0.25)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    if brow_l and brow_r:
        brow_l.location.z = REST_HUMAN["brow_l"]["loc"][2] + p * 0.02
        brow_r.location.z = REST_HUMAN["brow_r"]["loc"][2] - p * 0.02
        brow_l.keyframe_insert(data_path="location", frame=f)
        brow_r.keyframe_insert(data_path="location", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"]
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.16, 0.88, 1.68)), p)
    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_reading_menu_squint(objs, p, f):
    """Human cranes neck forward and squints intensely at counter/menu."""
    head = objs.get("Human_Head_Pivot")
    eye_l = objs.get("Human_Eye_L")
    eye_r = objs.get("Human_Eye_R")

    if head:
        head.location.y = REST_HUMAN["head_pivot"]["loc"][1] - p * 0.08
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] + p * 0.12, -0.10, 0.25)
        head.keyframe_insert(data_path="location", frame=f)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    for eye in [eye_l, eye_r]:
        if eye:
            eye.scale.z = REST_HUMAN["eye_l"]["scale"][2] * max(0.3, (1.0 - p * 0.65))
            eye.keyframe_insert(data_path="scale", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((-0.18, 0.44, 0.88)), p)
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.18, 0.44, 0.88)), p)
    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_finger_guns_pride(objs, p, f):
    """Human shoots confident finger-guns with a proud smirk."""
    head = objs.get("Human_Head_Pivot")
    if head:
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] - p * 0.08, -0.15, 0.15)
        head.rotation_euler.z = clamp(REST_HUMAN["head_pivot"]["rot"][2] + p * 0.10, -0.20, 0.20)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((-0.16, 0.38, 1.15)), p)
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.16, 0.38, 1.15)), p)
    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_chest_puff_proud(objs, p, f):
    """Human stands/sits tall with hands on waist, puffing out chest in pride."""
    head = objs.get("Human_Head_Pivot")
    if head:
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] - p * 0.15, -0.25, 0.10)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((-0.26, 0.82, 0.98)), p)
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.26, 0.82, 0.98)), p)
    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_arm_cross_stubborn(objs, p, f):
    """Human crosses arms across chest stubbornly, looking away."""
    head = objs.get("Human_Head_Pivot")
    if head:
        head.rotation_euler.z = clamp(REST_HUMAN["head_pivot"]["rot"][2] - p * 0.25, -0.35, 0.35)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((0.14, 0.70, 1.10)), p)
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((-0.14, 0.68, 1.12)), p)
    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_hands_out_why(objs, p, f):
    """Human throws both hands forward palms up: 'Why on earth?!'"""
    head = objs.get("Human_Head_Pivot")
    if head:
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] + p * 0.10, -0.15, 0.20)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((-0.24, 0.38, 1.05)), p)
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.24, 0.38, 1.05)), p)
    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_reach_for_coffee(objs, p, f):
    """Human reaches desperately forward toward coffee cup on counter."""
    head = objs.get("Human_Head_Pivot")
    if head:
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] + p * 0.15, -0.10, 0.30)
        head.location.y = REST_HUMAN["head_pivot"]["loc"][1] - p * 0.05
        head.keyframe_insert(data_path="rotation_euler", frame=f)
        head.keyframe_insert(data_path="location", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"]
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.16, 0.52, 0.90)), p)
    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_coffee_sip(objs, p, f):
    """Human lifts cup to mouth level and tilts head back for a sip."""
    head = objs.get("Human_Head_Pivot")
    if head:
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] - p * 0.12, -0.25, 0.10)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"]
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.04, 0.70, 1.55)), p)
    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_table_slam_shock(objs, p, f):
    """Human raises hands then slams palms down onto table in sudden shock."""
    head = objs.get("Human_Head_Pivot")
    if head:
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] + p * 0.18, -0.10, 0.30)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    if p < 0.35:
        lift = p / 0.35
        pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((-0.18, 0.50, 1.25)), lift)
        pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.18, 0.50, 1.25)), lift)
    else:
        slam = (p - 0.35) / 0.65
        pos_l = Vector((-0.18, 0.50, 1.25)).lerp(Vector((-0.18, 0.44, 0.88)), slam)
        pos_r = Vector((0.18, 0.50, 1.25)).lerp(Vector((0.18, 0.44, 0.88)), slam)

    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_chin_rest_listening(objs, p, f):
    """Human rests chin in right palm, listening attentively or patiently."""
    head = objs.get("Human_Head_Pivot")
    if head:
        head.rotation_euler.y = clamp(REST_HUMAN["head_pivot"]["rot"][1] - p * 0.10, -0.20, 0.20)
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] + p * 0.05, -0.10, 0.20)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"]
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.06, 0.72, 1.50)), p)
    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_coffee_stare_daze(objs, p, f):
    """Human stares blankly ahead in an existential caffeine daze."""
    head = objs.get("Human_Head_Pivot")
    if head:
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] - p * 0.04, -0.10, 0.10)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"]
    pos_r = REST_HUMAN["hand_r"]["loc"]
    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

def apply_human_yawn_stretch(objs, p, f):
    """Human raises both arms in a lazy morning stretch, head back."""
    head = objs.get("Human_Head_Pivot")
    if head:
        head.rotation_euler.x = clamp(REST_HUMAN["head_pivot"]["rot"][0] - p * 0.20, -0.30, 0.10)
        head.keyframe_insert(data_path="rotation_euler", frame=f)

    pos_l = REST_HUMAN["hand_l"]["loc"].lerp(Vector((-0.26, 0.85, 1.60)), p)
    pos_r = REST_HUMAN["hand_r"]["loc"].lerp(Vector((0.26, 0.85, 1.60)), p)
    solve_arm_hand(objs, 'L', pos_l, f)
    solve_arm_hand(objs, 'R', pos_r, f)

# =============================================================================
# GEMINI ACTIONS (11)
# =============================================================================

def apply_gemini_sassy_tilt(gemini_root, p, f):
    """Gemini tilts body sideways with a sassy, playful head tilt."""
    if gemini_root:
        gemini_root.rotation_euler.y = clamp(REST_GEMINI["root"]["rot"][1] - p * 0.25, -0.35, 0.35)
        gemini_root.rotation_euler.z = REST_GEMINI["root"]["rot"][2] + p * 0.10
        gemini_root.keyframe_insert(data_path="rotation_euler", frame=f)

def apply_gemini_smug_spin(gemini_root, p, f):
    """Gemini performs a crisp 360-degree victory spin."""
    if gemini_root:
        gemini_root.rotation_euler.z = REST_GEMINI["root"]["rot"][2] + p * (math.pi * 2)
        gemini_root.keyframe_insert(data_path="rotation_euler", frame=f)

def apply_gemini_shock_pop(gemini_root, p, f):
    """Gemini hops upward in comic shock."""
    if gemini_root:
        gemini_root.rotation_euler.x = clamp(-p * 0.15, -0.20, 0.10)
        gemini_root.keyframe_insert(data_path="rotation_euler", frame=f)

def apply_gemini_clock_point(gemini_root, p, f):
    """Gemini turns body toward the clock to roast Dev's bedtime."""
    if gemini_root:
        gemini_root.rotation_euler.z = REST_GEMINI["root"]["rot"][2] - p * 0.45
        gemini_root.rotation_euler.x = p * 0.12
        gemini_root.keyframe_insert(data_path="rotation_euler", frame=f)

def apply_gemini_concerned_float(gemini_root, p, f):
    """Gemini drifts closer to Dev with an affectionate, comforting tilt."""
    if gemini_root:
        gemini_root.rotation_euler.y = p * 0.15
        gemini_root.keyframe_insert(data_path="rotation_euler", frame=f)

def apply_gemini_dramatic_gasp(gemini_root, p, f):
    """Gemini rears backward in dramatic mock gasping."""
    if gemini_root:
        gemini_root.rotation_euler.x = clamp(-p * 0.22, -0.30, 0.10)
        gemini_root.keyframe_insert(data_path="rotation_euler", frame=f)

def apply_gemini_laughing_bob(gemini_root, t, f):
    """Gemini bobs vertically in rapid giggles."""
    if gemini_root:
        gemini_root.rotation_euler.z = REST_GEMINI["root"]["rot"][2] + math.sin(t * 8.0) * 0.04
        gemini_root.keyframe_insert(data_path="rotation_euler", frame=f)

def apply_gemini_mic_drop_descend(gemini_root, p, f):
    """Gemini gently lands flush onto the desk surface in deadpan resignation."""
    if gemini_root:
        gemini_root.rotation_euler = (0.0, 0.0, 0.0)
        gemini_root.keyframe_insert(data_path="rotation_euler", frame=f)

def apply_gemini_wink(objs, p, f):
    """Gemini winks right eye shut with a playful, sassy tilt (preserving camera height)."""
    proot = objs.get("Antigravity_Popapus_Root")
    eye_r = objs.get("Popapus_Eye_R")
    iris_r = objs.get("Popapus_Iris_R")
    shine_r = objs.get("Popapus_Shine_R")

    if proot:
        proot.rotation_euler.y = REST_GEMINI["root"]["rot"][1] * (1 - p) + math.radians(-12) * p
        proot.rotation_euler.z = REST_GEMINI["root"]["rot"][2] * (1 - p) + math.radians(20) * p
        proot.keyframe_insert(data_path="rotation_euler", frame=f)

    if eye_r:
        eye_r.scale.x = 0.85
        eye_r.scale.y = 0.45
        eye_r.scale.z = 1.20 * (1 - p) + 0.05 * p # Tight slit shut
        eye_r.keyframe_insert(data_path="scale", frame=f)
    if iris_r:
        iris_r.scale.x = 0.75 * (1 - p) + 0.0001 * p
        iris_r.scale.y = 0.25 * (1 - p) + 0.0001 * p
        iris_r.scale.z = 0.85 * (1 - p) + 0.0001 * p
        iris_r.keyframe_insert(data_path="scale", frame=f)
    if shine_r:
        shine_r.scale.x = 1.00 * (1 - p) + 0.0001 * p
        shine_r.scale.y = 0.40 * (1 - p) + 0.0001 * p
        shine_r.scale.z = 1.00 * (1 - p) + 0.0001 * p
        shine_r.keyframe_insert(data_path="scale", frame=f)

def apply_gemini_suspicious_squint(objs, p, f):
    """
    Gemini narrows both eyes into sharp, deadpan judgmental slits.
    Controls only the vertical diameter squeeze (Z-axis scale) to avoid any awkward inward rotation.
    """
    proot = objs.get("Antigravity_Popapus_Root")
    eye_l = objs.get("Popapus_Eye_L")
    eye_r = objs.get("Popapus_Eye_R")
    iris_l = objs.get("Popapus_Iris_L")
    iris_r = objs.get("Popapus_Iris_R")
    shine_l = objs.get("Popapus_Shine_L")
    shine_r = objs.get("Popapus_Shine_R")

    # Gentle, subtle forward attitude tilt (no weird inward yaw or Z-drop)
    if proot:
        proot.rotation_euler.x = math.radians(4) * p
        proot.rotation_euler.y = math.radians(-3) * p
        proot.rotation_euler.z = REST_GEMINI["root"]["rot"][2] * (1 - p) + math.radians(16) * p
        proot.keyframe_insert(data_path="rotation_euler", frame=f)

    # Eye Vertical Diameter Squeeze (Z: 1.20 -> 0.30; X & Y kept strictly at rest: 0.85 & 0.45)
    for eye in [eye_l, eye_r]:
        if eye:
            eye.scale.x = 0.85
            eye.scale.y = 0.45
            eye.scale.z = 1.20 * (1 - p) + 0.30 * p
            eye.keyframe_insert(data_path="scale", frame=f)

    # Iris squeezes proportionally along Z (0.85 -> 0.22)
    for iris in [iris_l, iris_r]:
        if iris:
            iris.scale.x = 0.75
            iris.scale.y = 0.25
            iris.scale.z = 0.85 * (1 - p) + 0.22 * p
            iris.keyframe_insert(data_path="scale", frame=f)

    # Eye catch shine shrinks slightly along Z
    for shine in [shine_l, shine_r]:
        if shine:
            shine.scale.x = 1.00
            shine.scale.y = 0.40
            shine.scale.z = 1.00 * (1 - p) + 0.25 * p
            shine.keyframe_insert(data_path="scale", frame=f)

REST_TENT_0 = [
    (0.4200, 0.0000, -0.4200),
    (0.4760, 0.0000, -0.4210),
    (0.5320, 0.0000, -0.4399),
    (0.5880, 0.0000, -0.4879),
    (0.6440, 0.0000, -0.5650),
]

def apply_gemini_tentacle_point(objs, p, f):
    """Gemini reaches front-right tentacle toward screen to point or roast code."""
    for s_idx in range(5):
        seg = objs.get(f"Popapus_Tent_0_Seg_{s_idx}")
        if seg:
            frac = s_idx / 4.0
            rest_loc = REST_TENT_0[s_idx]
            target_x = 0.42 + frac * 0.50
            target_y = frac * -0.22
            target_z = -0.42 + frac * 0.36 + math.sin(frac * math.pi) * 0.08
            seg.location.x = rest_loc[0] * (1 - p) + target_x * p
            seg.location.y = rest_loc[1] * (1 - p) + target_y * p
            seg.location.z = rest_loc[2] * (1 - p) + target_z * p
            seg.keyframe_insert(data_path="location", frame=f)


def apply_gemini_judging_orbit(gemini_root, p, f):
    """Gemini drifts in a small halo arc around Human's head, judging."""
    if gemini_root:
        arc = p * math.pi * 0.6
        gemini_root.location.x = REST_GEMINI["root"]["loc"][0] + math.sin(arc) * 0.15
        gemini_root.location.y = REST_GEMINI["root"]["loc"][1] + math.cos(arc) * 0.10
        gemini_root.keyframe_insert(data_path="location", frame=f)

def apply_gemini_facepalm_spin(gemini_root, p, f):
    """Gemini flips 180 degrees upside down in utter disbelief."""
    if gemini_root:
        gemini_root.rotation_euler.x = clamp(p * math.pi, 0, math.pi)
        gemini_root.keyframe_insert(data_path="rotation_euler", frame=f)

def apply_gemini_whisper_lean(gemini_root, p, f):
    """Gemini floats right next to Human's ear to deliver a secret roast."""
    if gemini_root:
        gemini_root.location = Vector(REST_GEMINI["root"]["loc"]) + Vector((p * 0.22, p * 0.15, p * 0.12))
        gemini_root.rotation_euler.y = p * 0.20
        gemini_root.keyframe_insert(data_path="location", frame=f)
        gemini_root.keyframe_insert(data_path="rotation_euler", frame=f)

def apply_gemini_orbs_overload_fizz(gemini_root, p, f):
    """Gemini jitters slightly in place as if computational capacity is overloaded."""
    if gemini_root:
        jitter_x = math.sin(p * 35.0) * 0.015
        jitter_z = math.cos(p * 35.0) * 0.015
        gemini_root.location = Vector(REST_GEMINI["root"]["loc"]) + Vector((jitter_x, 0, jitter_z))
        gemini_root.keyframe_insert(data_path="location", frame=f)

def apply_gemini_gentle_nudge(gemini_root, p, f):
    """Gemini bumps gently toward Human's shoulder and drifts back."""
    if gemini_root:
        nudge = math.sin(p * math.pi) * 0.12
        gemini_root.location.x = REST_GEMINI["root"]["loc"][0] + nudge
        gemini_root.keyframe_insert(data_path="location", frame=f)

# Master Registry
EXPRESSIVE_ACTIONS = {
    "human_facepalm": apply_human_facepalm,
    "human_skeptical_lean": apply_human_skeptical_lean,
    "human_double_take": apply_human_double_take,
    "human_frantic_typing": apply_human_frantic_typing,
    "human_shrug": apply_human_shrug,
    "human_excited_point": apply_human_excited_point,
    "human_pleading_hands": apply_human_pleading_hands,
    "human_head_in_hands_slump": apply_human_head_in_hands_slump,
    "human_mic_drop_nod": apply_human_mic_drop_nod,
    "human_slow_panic_recoil": apply_human_slow_panic_recoil,
    "human_panic_head_clutch": apply_human_panic_head_clutch,
    "human_sad_slump": apply_human_sad_slump,
    "human_show_screen": apply_human_show_screen,
    "gemini_sassy_tilt": apply_gemini_sassy_tilt,
    "gemini_smug_spin": apply_gemini_smug_spin,
    "gemini_shock_pop": apply_gemini_shock_pop,
    "gemini_clock_point": apply_gemini_clock_point,
    "gemini_concerned_float": apply_gemini_concerned_float,
    "gemini_dramatic_gasp": apply_gemini_dramatic_gasp,
    "gemini_laughing_bob": apply_gemini_laughing_bob,
    "gemini_mic_drop_descend": apply_gemini_mic_drop_descend,
    "gemini_wink": apply_gemini_wink,
    "gemini_suspicious_squint": apply_gemini_suspicious_squint,
    "gemini_tentacle_point": apply_gemini_tentacle_point,
    "human_head_scratch": apply_human_head_scratch,
    "human_reading_menu_squint": apply_human_reading_menu_squint,
    "human_finger_guns_pride": apply_human_finger_guns_pride,
    "human_chest_puff_proud": apply_human_chest_puff_proud,
    "human_arm_cross_stubborn": apply_human_arm_cross_stubborn,
    "human_hands_out_why": apply_human_hands_out_why,
    "human_reach_for_coffee": apply_human_reach_for_coffee,
    "human_coffee_sip": apply_human_coffee_sip,
    "human_table_slam_shock": apply_human_table_slam_shock,
    "human_chin_rest_listening": apply_human_chin_rest_listening,
    "human_coffee_stare_daze": apply_human_coffee_stare_daze,
    "human_yawn_stretch": apply_human_yawn_stretch,
    "gemini_judging_orbit": apply_gemini_judging_orbit,
    "gemini_facepalm_spin": apply_gemini_facepalm_spin,
    "gemini_whisper_lean": apply_gemini_whisper_lean,
    "gemini_orbs_overload_fizz": apply_gemini_orbs_overload_fizz,
    "gemini_gentle_nudge": apply_gemini_gentle_nudge,
}

# Alias dictionary mapping common emotions and action verbs to the specific action functions
ACTION_ALIASES = {
    # Human aliases
    "panic_head_clutch": "human_panic_head_clutch",
    "holding_head": "human_panic_head_clutch",
    "head_clutch": "human_panic_head_clutch",
    "panic": "human_panic_head_clutch",
    "panic_sweat": "human_panic_head_clutch",
    "sad_slump": "human_sad_slump",
    "sad": "human_sad_slump",
    "defeated": "human_sad_slump",
    "depressed": "human_sad_slump",
    "facepalm": "human_facepalm",
    "despair": "human_facepalm",
    "face_in_hands": "human_facepalm",
    "skeptical": "human_skeptical_lean",
    "skeptical_lean": "human_skeptical_lean",
    "suspicious": "human_skeptical_lean",
    "double_take": "human_double_take",
    "disbelief": "human_double_take",
    "typing": "human_frantic_typing",
    "frantic_typing": "human_frantic_typing",
    "coding": "human_frantic_typing",
    "shrug": "human_shrug",
    "confused": "human_shrug",
    "dont_know": "human_shrug",
    "excited_point": "human_excited_point",
    "point": "human_excited_point",
    "eureka": "human_excited_point",
    "pleading": "human_pleading_hands",
    "pleading_hands": "human_pleading_hands",
    "begging": "human_pleading_hands",
    "slump": "human_head_in_hands_slump",
    "head_in_hands": "human_head_in_hands_slump",
    "head_in_hands_slump": "human_head_in_hands_slump",
    "mic_drop_nod": "human_mic_drop_nod",
    "nod": "human_mic_drop_nod",
    "confident_nod": "human_mic_drop_nod",
    "slow_panic_recoil": "human_slow_panic_recoil",
    "shocked": "human_slow_panic_recoil",
    "recoil": "human_slow_panic_recoil",
    "show_screen": "human_show_screen",
    "rotate_laptop": "human_show_screen",
    "turn_laptop": "human_show_screen",
    "show_laptop": "human_show_screen",
    "point_screen": "human_show_screen",

    # Gemini aliases
    "agent_wink": "gemini_wink",
    "wink": "gemini_wink",
    "playful_wink": "gemini_wink",
    "agent_suspicious_squint": "gemini_suspicious_squint",
    "suspicious_squint": "gemini_suspicious_squint",
    "squint": "gemini_suspicious_squint",
    "judgmental": "gemini_suspicious_squint",
    "side_eye": "gemini_suspicious_squint",
    "agent_tentacle_point": "gemini_tentacle_point",
    "tentacle_point": "gemini_tentacle_point",
    "point_laptop": "gemini_tentacle_point",
    "sassy": "gemini_sassy_tilt",
    "sassy_tilt": "gemini_sassy_tilt",
    "smug_spin": "gemini_smug_spin",
    "spin": "gemini_smug_spin",
    "proud": "gemini_smug_spin",
    "shock_pop": "gemini_shock_pop",
    "pop": "gemini_shock_pop",
    "clock_point": "gemini_clock_point",
    "concerned": "gemini_concerned_float",
    "concerned_float": "gemini_concerned_float",
    "dramatic_gasp": "gemini_dramatic_gasp",
    "gasp": "gemini_dramatic_gasp",
    "laughing": "gemini_laughing_bob",
    "laughing_bob": "gemini_laughing_bob",
    "giggle": "gemini_laughing_bob",
    "mic_drop": "gemini_mic_drop_descend",
    "mic_drop_descend": "gemini_mic_drop_descend",
    "head_scratch": "human_head_scratch",
    "scratch_head": "human_head_scratch",
    "reading_menu_squint": "human_reading_menu_squint",
    "menu_squint": "human_reading_menu_squint",
    "finger_guns_pride": "human_finger_guns_pride",
    "finger_guns": "human_finger_guns_pride",
    "confident_smirk": "human_finger_guns_pride",
    "chest_puff_proud": "human_chest_puff_proud",
    "chest_puff": "human_chest_puff_proud",
    "proud_chest": "human_chest_puff_proud",
    "arm_cross_stubborn": "human_arm_cross_stubborn",
    "arms_crossed": "human_arm_cross_stubborn",
    "stubborn": "human_arm_cross_stubborn",
    "hands_out_why": "human_hands_out_why",
    "why_hands": "human_hands_out_why",
    "reach_for_coffee": "human_reach_for_coffee",
    "reach_coffee": "human_reach_for_coffee",
    "coffee_sip": "human_coffee_sip",
    "drinking_coffee": "human_coffee_sip",
    "sip_coffee": "human_coffee_sip",
    "table_slam_shock": "human_table_slam_shock",
    "table_slam": "human_table_slam_shock",
    "chin_rest_listening": "human_chin_rest_listening",
    "chin_rest": "human_chin_rest_listening",
    "listening": "human_chin_rest_listening",
    "coffee_stare_daze": "human_coffee_stare_daze",
    "stare_daze": "human_coffee_stare_daze",
    "existential_daze": "human_coffee_stare_daze",
    "wide_eyed_surprise": "human_double_take",
    "yawn_stretch": "human_yawn_stretch",
    "morning_stretch": "human_yawn_stretch",
    "stretch": "human_yawn_stretch",
    "judging_orbit": "gemini_judging_orbit",
    "orbit_judging": "gemini_judging_orbit",
    "facepalm_spin": "gemini_facepalm_spin",
    "upside_down_spin": "gemini_facepalm_spin",
    "whisper_lean": "gemini_whisper_lean",
    "whisper": "gemini_whisper_lean",
    "orbs_overload_fizz": "gemini_orbs_overload_fizz",
    "overload_fizz": "gemini_orbs_overload_fizz",
    "gentle_nudge": "gemini_gentle_nudge",
    "nudge": "gemini_gentle_nudge",
}

def resolve_action_name(speaker, action_tag):
    if not action_tag:
        return None
    clean = str(action_tag).lower().strip()
    if clean in EXPRESSIVE_ACTIONS:
        return clean
    if clean in ACTION_ALIASES:
        return ACTION_ALIASES[clean]
    # Check with speaker prefix
    prefix = "human_" if (speaker and speaker.lower() == "human") else "gemini_"
    cand = f"{prefix}{clean}"
    if cand in EXPRESSIVE_ACTIONS:
        return cand
    return None

def trigger_action(speaker, action_tag, objs, progress, frame, time_sec=0.0):
    """
    Safely triggers one of the pre-cooked actions from action_library.
    Returns True if an action was executed, or False for safe fallback to default idle.
    """
    resolved = resolve_action_name(speaker, action_tag)
    if not resolved:
        return False

    fn = EXPRESSIVE_ACTIONS.get(resolved)
    if not fn:
        return False

    try:
        if resolved.startswith("human_"):
            if "typing" in resolved:
                fn(objs, time_sec, frame)
            else:
                fn(objs, progress, frame)
        elif resolved.startswith("gemini_"):
            gemini_root = objs.get("Antigravity_Popapus_Root")
            if not gemini_root:
                return False
            if resolved in ["gemini_wink", "gemini_suspicious_squint", "gemini_tentacle_point"]:
                fn(objs, progress, frame)
            elif "laughing" in resolved:
                fn(gemini_root, time_sec, frame)
            else:
                fn(gemini_root, progress, frame)
        return True
    except Exception as e:
        print(f"⚠️ Safe action fallback: {resolved} failed with {e}")
        return False
