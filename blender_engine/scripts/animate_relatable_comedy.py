"""
Blender 4.3 EEVEE Next Animation Script for Relatable AI Comedy (Phase 2)
Authentic 1-on-1 Banter between Friend (Developer) and Gemini (AI Assistant)

Features:
- Boiled shrimp posture for Friend (slouched, rubbing eyes, typing on laptop at 3 AM)
- Sassy head-tilt & clock-pointing gestures for Gemini
- Desk props: Smartphone with glowing notification screen & buzz jitter at frame 40
- Wall clock hands set permanently to 3:00 AM
- Claude hidden (clean 1-on-1 dynamic)
- Timeline camera switching: Cam_Human -> Cam_Popapus (Gemini) -> Cam_Human -> Cam_Wide
"""

import bpy
import json
import math
import sys
import os

def load_manifest(manifest_path):
    with open(manifest_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def setup_props_and_scene():
    scene = bpy.context.scene

    # 1. Hide Claude from render & viewport
    claude = bpy.data.objects.get("Agent_Claude_Root")
    if claude:
        claude.hide_render = True
        claude.hide_viewport = True
        claude.scale = (0, 0, 0)

    # 2. Add Smartphone on desk next to Friend's hand
    phone_name = "Smartphone_Desk"
    if not bpy.data.objects.get(phone_name):
        phone_mat = bpy.data.materials.new("Mat_Phone_Body")
        phone_mat.use_nodes = True
        bsdf = phone_mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.06, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.2
            bsdf.inputs["Metallic"].default_value = 0.9

        screen_mat = bpy.data.materials.new("Mat_Phone_Screen")
        screen_mat.use_nodes = True
        bsdf_screen = screen_mat.node_tree.nodes.get("Principled BSDF")
        if bsdf_screen:
            bsdf_screen.inputs["Base Color"].default_value = (0.1, 0.8, 0.4, 1.0) # glowing notification badge
            if "Emission Color" in bsdf_screen.inputs:
                bsdf_screen.inputs["Emission Color"].default_value = (0.1, 0.8, 0.4, 1.0)
                bsdf_screen.inputs["Emission Strength"].default_value = 3.5

        bpy.ops.mesh.primitive_cube_add(location=(0.32, 0.35, 0.77), scale=(0.045, 0.085, 0.005))
        phone = bpy.context.object
        phone.name = phone_name
        phone.data.materials.append(phone_mat)

        # Phone screen overlay
        bpy.ops.mesh.primitive_plane_add(location=(0.32, 0.35, 0.776), size=0.07)
        screen = bpy.context.object
        screen.name = "Smartphone_Screen"
        screen.scale = (0.55, 1.1, 1.0)
        screen.data.materials.append(screen_mat)
        screen.parent = phone

    # 3. Position clock hands to show 3:00 AM
    for obj in bpy.data.objects:
        if "Clock" in obj.name and obj.type == 'MESH':
            # Identify clock hands
            if obj.dimensions.z > 0.05 and obj.dimensions.x < 0.03:
                # Minute hand: straight up to 12
                obj.rotation_euler = (0, 0, 0)
            elif obj.dimensions.x > 0.04 and obj.dimensions.z < 0.03:
                # Hour hand: pointing to 3 (horizontal right)
                obj.rotation_euler = (0, math.radians(90), 0)

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
        cam_key = line.get('camera', 'wide').lower()
        if cam_key == 'gemini':
            cam_key = 'popapus'

        # Shot 1 Rule: Line 0 MUST be tight close up!
        if idx == 0:
            target_cam = shot1_cam
            tag = "tight_closeup"
        else:
            target_cam = cameras.get(cam_key, cameras['wide'])
            tag = cam_key

        start_frame = max(1, line['startFrame'])
        if start_frame > 1:
            m = scene.timeline_markers.new(f"Shot_{idx}_{tag}", frame=start_frame)
            m.camera = target_cam

def animate_gemini(gemini_obj, manifest, total_frames):
    if not gemini_obj:
        return
    
    gemini_obj.animation_data_clear()
    base_loc = gemini_obj.location.copy()
    base_rot = gemini_obj.rotation_euler.copy()

    # Find Gemini speech intervals
    gemini_lines = [l for l in manifest['lines'] if l['speaker'].lower() == 'gemini']

    step = 4
    for f in range(1, total_frames + 1, step):
        t = f / 30.0
        
        # Check active speaking
        is_speaking = False
        active_line = None
        for l in gemini_lines:
            if l['startFrame'] <= f <= l['endFrame']:
                is_speaking = True
                active_line = l
                break

        # Idle hover bob
        z_offset = math.sin(t * 3.0) * 0.02
        rot_z_offset = math.sin(t * 1.6) * 0.03

        if is_speaking:
            if active_line['lineIndex'] == 1:
                # Sassy roast head tilt & pointing at clock
                z_offset += math.sin(t * 8.0) * 0.015
                rot_x_offset = math.sin(t * 6.5) * 0.04
                rot_y_offset = -0.12 + math.sin(t * 4.0) * 0.03 # Sassy head tilt
                rot_z_offset += 0.08 # Turned slightly toward clock/friend
            else:
                # Line 3: Gentle bedtime punchline
                z_offset += math.sin(t * 5.0) * 0.01
                rot_x_offset = math.sin(t * 4.0) * 0.02
                rot_y_offset = -0.05
        else:
            # Listening to Friend
            rot_x_offset = math.sin(t * 2.0) * 0.015
            rot_y_offset = 0.06 # Attentive tilt toward Friend

        gemini_obj.location.z = base_loc.z + z_offset
        gemini_obj.rotation_euler.x = base_rot.x + rot_x_offset
        gemini_obj.rotation_euler.y = base_rot.y + rot_y_offset
        gemini_obj.rotation_euler.z = base_rot.z + rot_z_offset

        gemini_obj.keyframe_insert(data_path="location", frame=f)
        gemini_obj.keyframe_insert(data_path="rotation_euler", frame=f)

def animate_friend(head_pivot, human_root, manifest, total_frames):
    if not head_pivot:
        return

    head_pivot.animation_data_clear()
    base_rot = head_pivot.rotation_euler.copy()
    base_loc = head_pivot.location.copy()

    mouth = bpy.data.objects.get("Human_Mouth")
    eye_l = bpy.data.objects.get("Human_Eye_L")
    eye_r = bpy.data.objects.get("Human_Eye_R")
    brow_l = bpy.data.objects.get("Human_Brow_L")
    brow_r = bpy.data.objects.get("Human_Brow_R")
    arm_l = bpy.data.objects.get("Human_Arm_L")
    arm_r = bpy.data.objects.get("Human_Arm_R")
    hand_l = bpy.data.objects.get("Human_Hand_L")
    hand_r = bpy.data.objects.get("Human_Hand_R")

    for obj in [mouth, eye_l, eye_r, brow_l, brow_r, arm_l, arm_r, hand_l, hand_r]:
        if obj:
            obj.animation_data_clear()

    base_eye_scale_l = eye_l.scale.copy() if eye_l else (0.9, 0.35, 1.25)
    base_eye_scale_r = eye_r.scale.copy() if eye_r else (0.9, 0.35, 1.25)
    base_arm_loc_l = arm_l.location.copy() if arm_l else (-0.36, 0.70, 1.05)
    base_arm_loc_r = arm_r.location.copy() if arm_r else (0.36, 0.70, 1.05)
    base_hand_loc_l = hand_l.location.copy() if hand_l else (-0.24, 0.44, 0.89)
    base_hand_loc_r = hand_r.location.copy() if hand_r else (0.24, 0.44, 0.89)
    # Ensure base resting height sits flush on top of desk (0.88m + 0.01m)
    if hasattr(base_hand_loc_l, 'z'):
        base_hand_loc_l.z = max(0.89, base_hand_loc_l.z)
    if hasattr(base_hand_loc_r, 'z'):
        base_hand_loc_r.z = max(0.89, base_hand_loc_r.z)

    # Phone obj
    phone = bpy.data.objects.get("Smartphone_Desk")

    friend_lines = [l for l in manifest['lines'] if l['speaker'].lower() in ['friend', 'human']]

    step = 3
    for f in range(1, total_frames + 1, step):
        t = f / 30.0

        is_speaking = False
        active_line = None
        for l in friend_lines:
            if l['startFrame'] <= f <= l['endFrame']:
                is_speaking = True
                active_line = l
                break

        # -------------------------------------------------------------
        # 1. Head Pose: Boiled shrimp curve (slouched forward, drooping)
        # -------------------------------------------------------------
        if f <= 168:
            # Line 0: Slouched forward at 3 AM, tired nod
            head_pivot.location.y = base_loc.y + 0.04 # slumped forward
            head_pivot.location.z = base_loc.z - 0.02
            head_pivot.rotation_euler.x = base_rot.x + 0.12 + (math.sin(t * 7.0) * 0.03 if is_speaking else 0.0)
            head_pivot.rotation_euler.z = base_rot.z + math.sin(t * 3.5) * 0.02
        elif 177 <= f <= 516:
            # Line 1: Listening to Gemini's roast, head hangs down in guilt
            head_pivot.location.y = base_loc.y + 0.05
            head_pivot.location.z = base_loc.z - 0.03
            head_pivot.rotation_euler.x = base_rot.x + 0.18 # looking down at desk
            head_pivot.rotation_euler.z = base_rot.z - 0.04
        elif 525 <= f <= 682:
            # Line 2: Exasperated plea, head pulls back and tilts up
            head_pivot.location.y = base_loc.y - 0.02
            head_pivot.location.z = base_loc.z
            head_pivot.rotation_euler.x = base_rot.x - 0.10 + math.sin(t * 8.0) * 0.04
            head_pivot.rotation_euler.z = base_rot.z + math.sin(t * 5.0) * 0.03
        else:
            # Line 3: Resigned surrender, head slowly tilts down to close laptop
            head_pivot.location.y = base_loc.y + 0.03
            head_pivot.location.z = base_loc.z - 0.02
            head_pivot.rotation_euler.x = base_rot.x + 0.14
            head_pivot.rotation_euler.z = base_rot.z

        head_pivot.keyframe_insert(data_path="location", frame=f)
        head_pivot.keyframe_insert(data_path="rotation_euler", frame=f)

        # -------------------------------------------------------------
        # 2. Eyes: Tired, half-closed drooping eyelids
        # -------------------------------------------------------------
        is_blink = f > 20 and ((f % 90) in [0, 1, 2])
        for eye, base_eye_scale in [(eye_l, base_eye_scale_l), (eye_r, base_eye_scale_r)]:
            if eye:
                if is_blink:
                    eye.scale.z = 0.03
                elif 525 <= f <= 682:
                    # Pleading eyes wide open
                    eye.scale.z = base_eye_scale.z * 1.3
                    eye.scale.x = base_eye_scale.x * 1.1
                else:
                    # Tired 3 AM heavy eyelids (scale down vertically)
                    eye.scale.z = base_eye_scale.z * 0.65
                    eye.scale.x = base_eye_scale.x * 1.05
                eye.keyframe_insert(data_path="scale", frame=f)

        # -------------------------------------------------------------
        # 3. Mouth: Lip-sync
        # -------------------------------------------------------------
        if mouth:
            if is_speaking:
                flap = 0.4 + 0.6 * abs(math.sin(t * 18.0))
                mouth.scale.x = max(0.4, flap * 2.4)
                mouth.scale.z = 1.0 + 0.12 * math.cos(t * 12.0)
            else:
                mouth.scale.x = 0.32
                mouth.scale.z = 0.90
            mouth.keyframe_insert(data_path="scale", frame=f)

        # -------------------------------------------------------------
        # 4. Arms & Hands: Rubbing eyes -> Typing -> Pleading gestures
        # -------------------------------------------------------------
        if arm_l and arm_r and hand_l and hand_r:
            if f <= 60:
                # Frame 1-60: Rubbing eyes with right hand
                hand_r.location.x = 0.12
                hand_r.location.y = 0.68
                hand_r.location.z = 1.55 + math.sin(t * 8.0) * 0.015
                arm_r.location.x = 0.22
                arm_r.location.y = 0.72
                arm_r.location.z = 1.35
                arm_r.rotation_euler.x = math.radians(-30)

                # Left hand rests on desk
                hand_l.location.x = base_hand_loc_l.x
                hand_l.location.y = base_hand_loc_l.y
                hand_l.location.z = max(0.89, base_hand_loc_l.z)
                arm_l.location.x = base_arm_loc_l.x
                arm_l.location.y = base_arm_loc_l.y
                arm_l.location.z = base_arm_loc_l.z
            elif 61 <= f <= 168:
                # Fast keyboard typing centered over workstation laptop (Z: 0.90m)
                hand_l.location.x = -0.07
                hand_l.location.y = 0.38
                hand_l.location.z = 0.90 + abs(math.sin(t * 22.0)) * 0.015

                hand_r.location.x = 0.07
                hand_r.location.y = 0.38
                hand_r.location.z = 0.90 + abs(math.cos(t * 22.0)) * 0.015

                arm_l.location = base_arm_loc_l
                arm_r.location = base_arm_loc_r
                arm_l.rotation_euler.x = math.radians(45)
                arm_r.rotation_euler.x = math.radians(45)
            elif 525 <= f <= 682:
                # Exasperated plea: Both hands raised up off desk
                hand_l.location.x = -0.25
                hand_l.location.y = 0.52
                hand_l.location.z = 1.15 + math.sin(t * 7.0) * 0.03
                hand_r.location.x = 0.25
                hand_r.location.y = 0.52
                hand_r.location.z = 1.15 + math.sin(t * 7.0) * 0.03

                arm_l.location.z = base_arm_loc_l.z + 0.12
                arm_r.location.z = base_arm_loc_r.z + 0.12
                arm_l.rotation_euler.x = math.radians(65)
                arm_r.rotation_euler.x = math.radians(65)
            else:
                # Resting on desk / defeated slump
                hand_l.location = base_hand_loc_l
                hand_r.location = base_hand_loc_r
                arm_l.location = base_arm_loc_l
                arm_r.location = base_arm_loc_r
                arm_l.rotation_euler.x = math.radians(38)
                arm_r.rotation_euler.x = math.radians(38)

            hand_l.keyframe_insert(data_path="location", frame=f)
            hand_r.keyframe_insert(data_path="location", frame=f)
            arm_l.keyframe_insert(data_path="location", frame=f)
            arm_r.keyframe_insert(data_path="location", frame=f)
            arm_l.keyframe_insert(data_path="rotation_euler", frame=f)
            arm_r.keyframe_insert(data_path="rotation_euler", frame=f)

        # -------------------------------------------------------------
        # 5. Smartphone Buzz / Vibration at frame 38-55
        # -------------------------------------------------------------
        if phone:
            base_phone_x = 0.32
            if 38 <= f <= 56:
                jitter_x = math.sin(t * 60.0) * 0.006
                jitter_y = math.cos(t * 60.0) * 0.006
                phone.location.x = base_phone_x + jitter_x
                phone.location.y = 0.35 + jitter_y
            else:
                phone.location.x = base_phone_x
                phone.location.y = 0.35
            phone.keyframe_insert(data_path="location", frame=f)

def configure_render(scene, output_mp4, total_frames):
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.fps = 30
    scene.frame_start = 1
    scene.frame_end = total_frames

    # Fast high-velocity production quality
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 8

    scene.render.image_settings.file_format = 'FFMPEG'
    scene.render.ffmpeg.format = 'MPEG4'
    scene.render.ffmpeg.codec = 'H264'
    scene.render.ffmpeg.constant_rate_factor = 'HIGH'
    scene.render.ffmpeg.ffmpeg_preset = 'REALTIME'
    scene.render.filepath = output_mp4

def main():
    args = sys.argv
    manifest_path = r"D:\New folder (2)\scratch\relatable_manifest.json"
    output_mp4 = r"D:\New folder (2)\scratch\relatable_test\raw_relatable.mp4"
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
    total_frames = manifest.get('totalFrames', 880)
    print(f"📖 Loaded relatable manifest: '{manifest.get('title')}' ({total_frames} frames)")

    scene = bpy.context.scene

    # Map cameras
    cameras = {
        "wide": bpy.data.objects.get("Cam_Wide"),
        "human": bpy.data.objects.get("Cam_Human"),
        "popapus": bpy.data.objects.get("Cam_Popapus")
    }

    # Setup scene props
    setup_props_and_scene()

    # Setup cameras
    setup_camera_markers(scene, manifest, cameras)
    print("📷 Camera markers configured!")

    # Animate Gemini
    gemini_obj = bpy.data.objects.get("Antigravity_Popapus_Root")
    animate_gemini(gemini_obj, manifest, total_frames)

    # Animate Friend
    head_pivot = bpy.data.objects.get("Human_Head_Pivot")
    human_root = bpy.data.objects.get("Human_Avatar")
    animate_friend(head_pivot, human_root, manifest, total_frames)
    print("🕺 Character animations keyframed!")

    # Configure render
    configure_render(scene, output_mp4, total_frames)

    out_blend = r"D:\New folder (2)\scratch\relatable_test\relatable_stage.blend"
    bpy.ops.wm.save_as_mainfile(filepath=out_blend)
    print(f"💾 Saved stage blend to: {out_blend}")

    if do_render:
        print(f"🚀 Rendering Relatable Episode in Blender ({total_frames} frames)...")
        bpy.ops.render.render(animation=True)
        print(f"✅ Render complete! Output: {output_mp4}")

if __name__ == "__main__":
    main()
