"""
Blender Animation Sequencer & Camera Director (Phase 2)
Reads dialogue_manifest.json to drive:
1. Dynamic Camera Cuts via Timeline Markers (Cam_Wide, Cam_Human, Cam_Popapus, Cam_Claude)
2. Character Animation:
   - Popapus: Hover bobbing, confident speech nods, tentacle pulse
   - Human: Talking head movement, shocked recoil, natural gestures
   - Claude: Gentle floating sway, anxious antenna twitching
3. Audio VSE synchronization & automated MP4 render via EEVEE Next
"""

import bpy
import json
import math
import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.append(SCRIPT_DIR)
import action_library

def load_manifest(manifest_path):
    if not os.path.exists(manifest_path):
        raise FileNotFoundError(f"Manifest not found: {manifest_path}")
    with open(manifest_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def setup_camera_markers(scene, manifest, cameras):
    scene.timeline_markers.clear()
    
    first_line = manifest['lines'][0] if manifest.get('lines') else None
    first_speaker = first_line.get('speaker', 'human').lower() if first_line else 'human'

    # Calibrate Cam_Human to tight chest-up close-up framing face and hands clearly
    cam_human = cameras.get("human")
    if cam_human:
        cam_human.location = (0.0, -0.85, 1.45)
        cam_human.rotation_euler = (math.radians(84), 0, 0)
        cam_human.data.lens = 38.0

    # MANDATORY SHOT 1 RULE: Shot 1 (0.0s - 2.5s) ALWAYS starts on tight chest-up close-up
    # framing face and hands clearly (no wide establishing shots on Frame 1)
    if first_speaker in ['popapus', 'gemini']:
        shot1_cam = cameras.get("popapus", cameras.get("human"))
        shot1_name = "Shot_0_tight_gemini"
    else:
        shot1_cam = cameras.get("human", cameras.get("wide"))
        shot1_name = "Shot_0_tight_human"

    m_init = scene.timeline_markers.new(shot1_name, frame=1)
    m_init.camera = shot1_cam
    scene.camera = shot1_cam

    for line in manifest['lines']:
        idx = line.get('lineIndex', 0)
        speaker = line.get('speaker', 'human').lower()
        cam_key = line.get('camera', 'wide').lower()

        # Shot 1 Rule: Line 0 MUST be tight close-up
        if idx == 0:
            target_cam = shot1_cam
            tag = "tight_closeup"
        else:
            if cam_key in ['gemini', 'popapus']:
                target_cam = cameras.get('popapus', cameras['wide'])
            else:
                target_cam = cameras.get(cam_key, cameras['wide'])
            tag = cam_key

        start_frame = max(1, line['startFrame'])
        if start_frame > 1:
            m = scene.timeline_markers.new(f"Shot_{idx}_{tag}", frame=start_frame)
            m.camera = target_cam

def animate_popapus(popapus_obj, manifest, total_frames):
    if not popapus_obj:
        return
    
    popapus_obj.animation_data_clear()
    base_loc = popapus_obj.location.copy()
    base_rot = popapus_obj.rotation_euler.copy()

    # Build active speaking frames set and action map
    speaking_frames = set()
    action_map = {}
    for line in manifest.get('lines', []):
        if line.get('speaker', '').lower() in ['popapus', 'gemini']:
            act = line.get('action') or line.get('emotion')
            st = line['startFrame']
            en = line['endFrame']
            dur = max(1, en - st)
            for f in range(st, en + 1):
                speaking_frames.add(f)
                p = (f - st) / dur
                action_map[f] = (act, p)

    # Keyframe every 4 frames for smooth interpolation
    step = 4
    for f in range(1, total_frames + 1, step):
        t = f / 30.0
        is_speaking = f in speaking_frames

        # Check action library for expressive action
        act_info = action_map.get(f)
        handled = False
        if act_info:
            act_tag, prog = act_info
            handled = action_library.trigger_action('gemini', act_tag, bpy.data.objects, prog, f, time_sec=t)

        if not handled:
            # Idle hover / default speaking bob
            z_offset = math.sin(t * 3.2) * 0.022
            rot_z_offset = math.sin(t * 1.5) * 0.035

            if is_speaking:
                z_offset += math.sin(t * 8.0) * 0.012
                rot_x_offset = math.sin(t * 7.0) * 0.05
                rot_y_offset = math.sin(t * 5.0) * 0.04
            else:
                rot_x_offset = 0.0
                rot_y_offset = 0.0

            popapus_obj.location.z = base_loc.z + z_offset
            popapus_obj.rotation_euler.x = base_rot.x + rot_x_offset
            popapus_obj.rotation_euler.y = base_rot.y + rot_y_offset
            popapus_obj.rotation_euler.z = base_rot.z + rot_z_offset

            popapus_obj.keyframe_insert(data_path="location", frame=f)
            popapus_obj.keyframe_insert(data_path="rotation_euler", frame=f)

def animate_human(head_pivot, human_root, manifest, total_frames):
    if not head_pivot:
        return

    head_pivot.animation_data_clear()
    base_rot = head_pivot.rotation_euler.copy()
    base_loc = head_pivot.location.copy()

    mouth = bpy.data.objects.get("Human_Mouth")
    eye_l = bpy.data.objects.get("Human_Eye_L")
    eye_r = bpy.data.objects.get("Human_Eye_R")
    catch_l = bpy.data.objects.get("Human_Catch_L")
    catch_r = bpy.data.objects.get("Human_Catch_R")
    brow_l = bpy.data.objects.get("Human_Brow_L")
    brow_r = bpy.data.objects.get("Human_Brow_R")
    arm_l = bpy.data.objects.get("Human_Arm_L")
    arm_r = bpy.data.objects.get("Human_Arm_R")
    hand_l = bpy.data.objects.get("Human_Hand_L")
    hand_r = bpy.data.objects.get("Human_Hand_R")

    # Clear existing animations on all facial & body parts
    for obj in [mouth, eye_l, eye_r, catch_l, catch_r, brow_l, brow_r, arm_l, arm_r, hand_l, hand_r]:
        if obj:
            obj.animation_data_clear()

    # Ensure HumanMouthMat is shaded dark maroon (#3B1818)
    mouth_mat = bpy.data.materials.get("HumanMouthMat")
    if mouth_mat and mouth_mat.use_nodes:
        bsdf = mouth_mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.042, 0.009, 0.009, 1.0)

    # Capture base rest transforms
    base_mouth_loc = mouth.location.copy() if mouth else (0, 0.74, 1.62)
    base_mouth_scale = mouth.scale.copy() if mouth else (1.0, 1.0, 1.0)
    base_eye_scale_l = eye_l.scale.copy() if eye_l else (0.9, 0.35, 1.25)
    base_eye_scale_r = eye_r.scale.copy() if eye_r else (0.9, 0.35, 1.25)
    base_brow_loc_l = brow_l.location.copy() if brow_l else (-0.08, 0.74, 1.80)
    base_brow_loc_r = brow_r.location.copy() if brow_r else (0.08, 0.74, 1.80)
    base_brow_rot_l = brow_l.rotation_euler.copy() if brow_l else (0, 0, 0.1)
    base_brow_rot_r = brow_r.rotation_euler.copy() if brow_r else (0, 0, -0.1)
    # Ensure hands are tucked inside sleeve cuffs with zero gap
    if hand_l and arm_l:
        hand_l.parent = arm_l
        hand_l.location = (0.0, 0.0, -0.23)
    if hand_r and arm_r:
        hand_r.parent = arm_r
        hand_r.location = (0.0, 0.0, -0.23)

    base_arm_loc_l = (-0.30, 0.78, 1.12)
    base_arm_loc_r = (0.30, 0.78, 1.12)
    base_arm_rot_l = (math.radians(-30), math.radians(-6), math.radians(-12))
    base_arm_rot_r = (math.radians(-30), math.radians(6), math.radians(12))
    base_hand_loc_l = (0.0, 0.0, -0.23)
    base_hand_loc_r = (0.0, 0.0, -0.23)

    # Identify speaking and shocked frames
    speaking_map = {}
    action_map = {}
    for line in manifest.get('lines', []):
        if line.get('speaker', '').lower() == 'human':
            emotion = line.get('emotion', 'talking').lower()
            act = line.get('action') or line.get('emotion')
            st = line['startFrame']
            en = line['endFrame']
            dur = max(1, en - st)
            for f in range(st, en + 1):
                speaking_map[f] = emotion
                p = (f - st) / dur
                action_map[f] = (act, p)

    step = 3
    for f in range(1, total_frames + 1, step):
        t = f / 30.0
        emotion = speaking_map.get(f)
        is_speaking = emotion is not None

        # Check action library for expressive action
        act_info = action_map.get(f)
        handled_action = False
        if act_info:
            act_tag, prog = act_info
            handled_action = action_library.trigger_action('human', act_tag, bpy.data.objects, prog, f, time_sec=t)

        # ---------------------------------------------------------
        # 1. Head Pose & Dynamic Nodding
        # ---------------------------------------------------------
        if not handled_action:
            if emotion == 'shocked':
                # Shocked recoil: head pulls back and tilts up in disbelief
                head_pivot.location.y = base_loc.y + 0.035
                head_pivot.rotation_euler.x = base_rot.x - 0.12
                head_pivot.rotation_euler.z = base_rot.z + math.sin(t * 14.0) * 0.025 # nervous jitter
            elif is_speaking:
                # Conversational nodding with speech cadence
                head_pivot.location.y = base_loc.y
                head_pivot.rotation_euler.x = base_rot.x + math.sin(t * 8.0) * 0.045
                head_pivot.rotation_euler.z = base_rot.z + math.sin(t * 4.0) * 0.035
            else:
                # Listening idle breathing
                head_pivot.location.y = base_loc.y
                head_pivot.rotation_euler.x = base_rot.x + math.sin(t * 1.8) * 0.012
                head_pivot.rotation_euler.z = base_rot.z

            head_pivot.keyframe_insert(data_path="location", frame=f)
            head_pivot.keyframe_insert(data_path="rotation_euler", frame=f)

        # ---------------------------------------------------------
        # 2. Mouth Lip-Sync & Visemes (Local X is Vertical Opening!)
        # ---------------------------------------------------------
        if mouth:
            if emotion == 'shocked':
                # Shocked jaw drop / gaping 'O' mouth (compact & lowered)
                mouth.scale.x = 2.2
                mouth.scale.z = 0.60
                mouth.location.z = base_mouth_loc.z - 0.015
            elif is_speaking:
                # Scaled speech viseme flap (compact dark mouth)
                flap = 0.3 + 0.45 * abs(math.sin(t * 18.0)) + 0.20 * abs(math.sin(t * 28.0))
                mouth.scale.x = max(0.22, flap * 1.65)
                mouth.scale.z = 0.45 + 0.08 * math.cos(t * 14.0)
                mouth.location.z = base_mouth_loc.z - 0.015
            else:
                # Closed relaxed resting mouth line
                mouth.scale.x = 0.22
                mouth.scale.z = 0.45
                mouth.location.z = base_mouth_loc.z - 0.015
            mouth.keyframe_insert(data_path="scale", frame=f)
            mouth.keyframe_insert(data_path="location", frame=f)

        # ---------------------------------------------------------
        # 3. Eye Blinking & Shock Widening
        # ---------------------------------------------------------
        is_blink = f > 20 and ((f % 84) in [0, 1, 2])
        for eye, base_eye_scale in [(eye_l, base_eye_scale_l), (eye_r, base_eye_scale_r)]:
            if eye:
                if is_blink and emotion != 'shocked':
                    eye.scale.z = 0.04  # Natural blink shut
                elif emotion == 'shocked':
                    # Wide, panicked staring pupils
                    eye.scale.z = base_eye_scale.z * 1.45
                    eye.scale.x = base_eye_scale.x * 1.30
                else:
                    eye.scale.z = base_eye_scale.z
                    eye.scale.x = base_eye_scale.x
                eye.keyframe_insert(data_path="scale", frame=f)

        for catch in [catch_l, catch_r]:
            if catch:
                catch.scale.z = 0.04 if is_blink and emotion != 'shocked' else 1.0
                catch.keyframe_insert(data_path="scale", frame=f)

        # ---------------------------------------------------------
        # 4. Eyebrow Emotional Posing
        # ---------------------------------------------------------
        if not handled_action:
            for side, brow, base_loc_b, base_rot_b in [(-1, brow_l, base_brow_loc_l, base_brow_rot_l), (1, brow_r, base_brow_loc_r, base_brow_rot_r)]:
                if brow:
                    if emotion == 'shocked':
                        # Lift high on forehead and slant outwards in panic
                        brow.location.z = base_loc_b.z + 0.042
                        brow.rotation_euler.z = base_rot_b.z + math.radians(side * -22)
                    elif is_speaking:
                        brow.location.z = base_loc_b.z + math.sin(t * 8.0) * 0.012
                        brow.rotation_euler.z = base_rot_b.z
                    else:
                        brow.location.z = base_loc_b.z
                        brow.rotation_euler.z = base_rot_b.z
                    brow.keyframe_insert(data_path="location", frame=f)
                    brow.keyframe_insert(data_path="rotation_euler", frame=f)

        # ---------------------------------------------------------
        # 5. Arm & Hand Body Language / Gestures (Zero Gap Sleeve Tuck)
        # ---------------------------------------------------------
        if not handled_action:
            if arm_l and arm_r and hand_l and hand_r:
                # Ensure hands are tucked inside sleeve cuffs with zero gap at natural gesture height
                hand_l.location = (0.0, 0.0, -0.23)
                hand_r.location = (0.0, 0.0, -0.23)
                hand_l.keyframe_insert(data_path="location", frame=f)
                hand_r.keyframe_insert(data_path="location", frame=f)

                if emotion == 'shocked':
                    # Panic reaction: Both hands fly up to clutch the head!
                    arm_l.location = (-0.28, 0.76, 1.35)
                    arm_r.location = (0.28, 0.76, 1.35)
                    arm_l.rotation_euler.x = math.radians(-75)
                    arm_l.rotation_euler.y = math.radians(-15)
                    arm_l.rotation_euler.z = math.radians(-20)

                    arm_r.location.x = 0.28
                    arm_r.location.y = 0.76
                    arm_r.location.z = 1.35
                    arm_r.rotation_euler.x = math.radians(-75)
                    arm_r.rotation_euler.y = math.radians(15)
                    arm_r.rotation_euler.z = math.radians(20)
                elif is_speaking:
                    # Conversational gesture: Right arm gestures with speech, left arm relaxed
                    gesture_swing = math.sin(t * 6.5) * 14
                    arm_r.location = base_arm_loc_r
                    arm_r.rotation_euler.x = math.radians(-30 + gesture_swing)
                    arm_r.rotation_euler.y = math.radians(6 + math.cos(t * 6.5) * 4)
                    arm_r.rotation_euler.z = math.radians(12)

                    arm_l.location = base_arm_loc_l
                    arm_l.rotation_euler.x = math.radians(-30 + math.sin(t * 2.0) * 3)
                    arm_l.rotation_euler.y = math.radians(-6)
                    arm_l.rotation_euler.z = math.radians(-12)
                else:
                    # Idle resting pose at natural gesture height (slightly raised, hands connected in cuffs)
                    idle_bob = math.sin(t * 1.8) * 0.008
                    arm_l.location = (base_arm_loc_l[0], base_arm_loc_l[1], base_arm_loc_l[2] + idle_bob)
                    arm_r.location = (base_arm_loc_r[0], base_arm_loc_r[1], base_arm_loc_r[2] + idle_bob)
                    arm_l.rotation_euler = (base_arm_rot_l[0] + math.sin(t * 1.8) * 0.02, base_arm_rot_l[1], base_arm_rot_l[2])
                    arm_r.rotation_euler = (base_arm_rot_r[0] + math.sin(t * 1.8) * 0.02, base_arm_rot_r[1], base_arm_rot_r[2])

                arm_l.keyframe_insert(data_path="location", frame=f)
                arm_r.keyframe_insert(data_path="location", frame=f)
                arm_l.keyframe_insert(data_path="rotation_euler", frame=f)
                arm_r.keyframe_insert(data_path="rotation_euler", frame=f)

def animate_claude(claude_root, antenna_obj, manifest, total_frames):
    if claude_root:
        claude_root.animation_data_clear()
        base_loc = claude_root.location.copy()

        step = 4
        for f in range(1, total_frames + 1, step):
            t = f / 30.0
            # Gentle floating sway
            z_offset = math.sin(t * 2.8 + 1.2) * 0.018
            claude_root.location.z = base_loc.z + z_offset
            claude_root.keyframe_insert(data_path="location", frame=f)

    if antenna_obj:
        antenna_obj.animation_data_clear()
        base_rot = antenna_obj.rotation_euler.copy()

        speaking_frames = set()
        for line in manifest['lines']:
            if line['speaker'].lower() == 'claude':
                for f in range(line['startFrame'], line['endFrame'] + 1):
                    speaking_frames.add(f)

        step = 4
        for f in range(1, total_frames + 1, step):
            t = f / 30.0
            if f in speaking_frames:
                # Anxious antenna twitching/swaying
                sway = math.sin(t * 10.0) * 0.16
            else:
                # Idle gentle sway
                sway = math.sin(t * 2.5) * 0.04

            antenna_obj.rotation_euler.y = base_rot.y + sway
            antenna_obj.keyframe_insert(data_path="rotation_euler", frame=f)

def attach_audio_vse(scene, audio_path):
    if not os.path.exists(audio_path):
        print(f"⚠️ Audio path not found: {audio_path}")
        return

    if not scene.sequence_editor:
        scene.sequence_editor_create()

    # Clear existing strips
    for s in list(scene.sequence_editor.sequences):
        scene.sequence_editor.sequences.remove(s)

    sound_strip = scene.sequence_editor.sequences.new_sound(
        name="MasterDialogue",
        filepath=audio_path,
        channel=1,
        frame_start=1
    )
    print(f"🎵 Attached audio track to VSE: {audio_path}")

def configure_open_floor_staging(scene):
    """
    Open-Floor Standing Staging Mode:
    - Hides desk, laptop, and Claude
    - Attaches denim legs and white streetwear sneakers
    - Positions Gemini hovering comfortably beside Dev at shoulder height
    - Calibrates Cam_Wide for full-body view and Cam_Human for tight chest-up
    """
    desk_objs = ['Desk_Top', 'Cube.004', 'Cube.005', 'Laptop_Base', 'Plane.001', 'Plane.002',
                 'Cylinder.003', 'Cylinder.004', 'Cylinder.005', 'Cylinder.006', 'Cylinder.007', 'Cylinder.008', 'Torus']
    for name in desk_objs:
        obj = bpy.data.objects.get(name)
        if obj:
            obj.hide_render = True
            obj.hide_viewport = True

    claude = bpy.data.objects.get('Agent_Claude_Root')
    if claude:
        claude.hide_render = True
        claude.hide_viewport = True
        for child in claude.children_recursive:
            child.hide_render = True
            child.hide_viewport = True

    # Position Gemini floating beside Dev on open floor (clear of the wall clock)
    gemini = bpy.data.objects.get('Antigravity_Popapus_Root')
    if gemini:
        gemini.location = (-0.68, 0.52, 1.25)
        gemini.rotation_euler = (0, 0, math.radians(28))

    # Add complete lower body: Pelvis + Legs + Chunky Streetwear Sneakers
    human = bpy.data.objects.get('Human_Avatar')
    if human:
        for name in ['Human_Pelvis', 'Human_Leg_L', 'Human_Leg_R', 'Human_Sneaker_Sole_L', 'Human_Sneaker_Sole_R', 'Human_Sneaker_Upper_L', 'Human_Sneaker_Upper_R']:
            old_obj = bpy.data.objects.get(name)
            if old_obj:
                bpy.data.objects.remove(old_obj, do_unlink=True)

        mat_pants = bpy.data.materials.get('Mat_Jeans_Denim') or bpy.data.materials.new('Mat_Jeans_Denim')
        mat_pants.use_nodes = True
        mat_pants.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.10, 0.15, 0.24, 1.0)
        mat_pants.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.75

        mat_sole = bpy.data.materials.get('Mat_Sneaker_Sole') or bpy.data.materials.new('Mat_Sneaker_Sole')
        mat_sole.use_nodes = True
        mat_sole.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.96, 0.96, 0.96, 1.0)
        mat_sole.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.25

        mat_upper = bpy.data.materials.get('Mat_Sneaker_Upper') or bpy.data.materials.new('Mat_Sneaker_Upper')
        mat_upper.use_nodes = True
        mat_upper.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.16, 0.20, 0.28, 1.0)

        bpy.ops.mesh.primitive_cube_add(location=(0.0, 0.95, 0.92))
        pelvis = bpy.context.active_object
        pelvis.name = 'Human_Pelvis'
        pelvis.scale = (0.18, 0.15, 0.035)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        pelvis.data.materials.append(mat_pants)
        pelvis.parent = human
        pelvis.matrix_parent_inverse = human.matrix_world.inverted()

        leg_len = 0.82
        for side in [-1, 1]:
            s_name = 'L' if side == -1 else 'R'
            lx = side * 0.13

            bpy.ops.mesh.primitive_cylinder_add(radius=0.082, depth=leg_len, vertices=24, location=(lx, 0.95, 0.88 - (leg_len/2.0)))
            leg = bpy.context.active_object
            leg.name = f'Human_Leg_{s_name}'
            leg.data.materials.append(mat_pants)
            leg.parent = human
            leg.matrix_parent_inverse = human.matrix_world.inverted()

            bpy.ops.mesh.primitive_cube_add(location=(lx, 0.88, 0.02))
            sole = bpy.context.active_object
            sole.name = f'Human_Sneaker_Sole_{s_name}'
            sole.scale = (0.075, 0.13, 0.02)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            sole.data.materials.append(mat_sole)
            sole.parent = human
            sole.matrix_parent_inverse = human.matrix_world.inverted()

            bpy.ops.mesh.primitive_cube_add(location=(lx, 0.89, 0.065))
            upper = bpy.context.active_object
            upper.name = f'Human_Sneaker_Upper_{s_name}'
            upper.scale = (0.068, 0.11, 0.025)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            upper.data.materials.append(mat_upper)
            upper.parent = human
            upper.matrix_parent_inverse = human.matrix_world.inverted()

    # Wide camera for full-body standing shot
    cam_wide = bpy.data.objects.get('Cam_Wide')
    if cam_wide:
        cam_wide.location = (0.0, -2.35, 1.05)
        cam_wide.rotation_euler = (math.radians(88.5), 0, 0)
        cam_wide.data.lens = 29.0

def configure_render(scene, output_mp4, total_frames):
    scene.frame_start = 1
    scene.frame_end = total_frames
    scene.render.fps = 30

    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.eevee.taa_render_samples = 16 # Fast and clean (~0.4s per frame)

    scene.render.image_settings.file_format = 'FFMPEG'
    scene.render.ffmpeg.format = 'MPEG4'
    scene.render.ffmpeg.codec = 'H264'
    scene.render.ffmpeg.constant_rate_factor = 'HIGH'
    scene.render.ffmpeg.audio_codec = 'AAC'
    scene.render.ffmpeg.audio_bitrate = 192

    scene.render.filepath = output_mp4
    print(f"🎥 Configured render output: {output_mp4} ({total_frames} frames)")

def main():
    print("🎬 Blender Multi-Agent Comedy Animator Starting...")
    
    # Parse CLI arguments passed after '--'
    args = sys.argv
    manifest_path = r"D:\New folder (2)\blender_engine\output\dialogue_manifest.json"
    output_mp4 = r"D:\New folder (2)\blender_engine\output\raw_comedy_render.mp4"
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

    manifest = load_manifest(manifest_path)
    total_frames = manifest.get('totalFrames', 300)
    print(f"📖 Loaded manifest: '{manifest.get('title')}' with {len(manifest['lines'])} lines ({total_frames} frames)")

    scene = bpy.context.scene

    # Map cameras
    cameras = {
        "wide": bpy.data.objects.get("Cam_Wide"),
        "human": bpy.data.objects.get("Cam_Human"),
        "popapus": bpy.data.objects.get("Cam_Popapus"),
        "claude": bpy.data.objects.get("Cam_Claude")
    }

    # Verify cameras
    for k, v in cameras.items():
        if not v:
            print(f"⚠️ Camera missing: {k}")

    # Open-Floor Standing Staging (ONLY when explicitly requested via manifest or CLI flag)
    is_standing = manifest.get('staging') == 'standing' or '--standing' in args
    if is_standing:
        configure_open_floor_staging(scene)
        print("🧍 Open-Floor Standing Staging configured (legs & sneakers attached, desk hidden)!")

    # Set up camera markers
    setup_camera_markers(scene, manifest, cameras)
    print("📷 Camera switching markers set across timeline!")

    # Animate Characters
    popapus_root = bpy.data.objects.get("Antigravity_Popapus_Root")
    animate_popapus(popapus_root, manifest, total_frames)

    human_head_pivot = bpy.data.objects.get("Human_Head_Pivot")
    human_root = bpy.data.objects.get("Human_Avatar")
    animate_human(human_head_pivot, human_root, manifest, total_frames)

    claude_root = bpy.data.objects.get("Agent_Claude_Root")
    claude_antenna = bpy.data.objects.get("Claude_Antenna")
    animate_claude(claude_root, claude_antenna, manifest, total_frames)
    print("🕺 Character animations & speech gestures keyframed!")

    # Attach Audio
    master_audio = manifest.get('masterAudioPath')
    if master_audio and os.path.exists(master_audio):
        attach_audio_vse(scene, master_audio)

    # Configure Render
    configure_render(scene, output_mp4, total_frames)

    # Save animation stage blend
    out_blend = r"D:\New folder (2)\blender_engine\output\animated_episode.blend"
    bpy.ops.wm.save_as_mainfile(filepath=out_blend)
    print(f"💾 Saved animated episode scene to: {out_blend}")

    if do_render:
        print(f"🚀 Launching EEVEE Next Render ({total_frames} frames)...")
        bpy.ops.render.render(animation=True)
        print(f"✅ Render Complete! Video saved to: {output_mp4}")

if __name__ == "__main__":
    main()

