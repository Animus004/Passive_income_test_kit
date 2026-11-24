"""
Autonomous 3D Stage & Procedural Director Engine (Blender 4.3 EEVEE Next)

Executes dynamically generated procedural 3D scenes (generated_scene.py),
manages cast selection (story_cast vs dev_and_gemini), validates camera choreography,
and handles headless GPU rendering and dry-run verification.
"""

import bpy
import sys
import os
import math
import json
import traceback
from mathutils import Vector, Euler

# -----------------------------------------------------------------------------
# HELPER UTILITIES FOR PROCEDURAL SCENE BUILDERS
# -----------------------------------------------------------------------------

def hex_to_rgba(hex_code, alpha=1.0):
    hex_code = hex_code.lstrip('#')
    if len(hex_code) == 3:
        hex_code = ''.join([c * 2 for c in hex_code])
    s_r = int(hex_code[0:2], 16) / 255.0
    s_g = int(hex_code[2:4], 16) / 255.0
    s_b = int(hex_code[4:6], 16) / 255.0
    def to_linear(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (to_linear(s_r), to_linear(s_g), to_linear(s_b), alpha)

def create_mat(name, base_color, roughness=0.5, metallic=0.0, emission_color=None, emission_strength=0.0):
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

def clean_all_stage_objects():
    """Hides all pre-existing objects in the blend file so the new scene starts with a pristine canvas."""
    for obj in list(bpy.data.objects):
        obj.hide_render = True
        obj.hide_viewport = True

def look_at_euler(eye_pos, target_pos):
    direction = Vector(target_pos) - Vector(eye_pos)
    rot_quat = direction.to_track_quat('-Z', 'Y')
    return rot_quat.to_euler()

def setup_director_camera(shots, total_frames):
    """
    Choreographs a single master camera 'Cam_Cinematic_Director' across multiple shots.
    Each shot defines start/end frame, start/end camera coordinates and focal length.
    Supports either look_at targeting or explicit Euler rotation angles.
    Cuts between shots occur cleanly across 1 frame, with smooth dollies within each shot.
    """
    cam = bpy.data.objects.get("Cam_Cinematic_Director")
    if not cam:
        cam_data = bpy.data.cameras.new("Cam_Cinematic_Director")
        cam = bpy.data.objects.new("Cam_Cinematic_Director", cam_data)
        bpy.context.collection.objects.link(cam)
    
    cam.hide_render = False
    cam.hide_viewport = False
    bpy.context.scene.camera = cam

    if not cam.animation_data:
        cam.animation_data_create()

    for shot in shots:
        start_f = shot.get('startFrame', 0)
        end_f = shot.get('endFrame', start_f + 120)

        c_start_loc = shot.get('cam_start_loc', (-2.0, -3.5, 2.5))
        c_end_loc = shot.get('cam_end_loc', c_start_loc)

        if 'look_at_start' in shot:
            c_start_rot = look_at_euler(c_start_loc, shot['look_at_start'])
        else:
            c_start_rot = Euler([math.radians(a) for a in shot.get('cam_start_rot_deg', [70, 0, -25])])

        if 'look_at_end' in shot:
            c_end_rot = look_at_euler(c_end_loc, shot['look_at_end'])
        elif 'look_at_start' in shot:
            c_end_rot = look_at_euler(c_end_loc, shot['look_at_start'])
        else:
            c_end_rot = Euler([math.radians(a) for a in shot.get('cam_end_rot_deg', shot.get('cam_start_rot_deg', [70, 0, -25]))])

        lens_start = shot.get('lens_start', 35.0)
        lens_end = shot.get('lens_end', lens_start)

        # Keyframe Start of Shot
        bpy.context.scene.frame_set(start_f)
        cam.location = Vector(c_start_loc)
        cam.rotation_euler = c_start_rot
        cam.data.lens = lens_start
        cam.keyframe_insert(data_path="location", frame=start_f)
        cam.keyframe_insert(data_path="rotation_euler", frame=start_f)
        cam.data.keyframe_insert(data_path="lens", frame=start_f)

        # Keyframe End of Shot
        bpy.context.scene.frame_set(end_f)
        cam.location = Vector(c_end_loc)
        cam.rotation_euler = c_end_rot
        cam.data.lens = lens_end
        cam.keyframe_insert(data_path="location", frame=end_f)
        cam.keyframe_insert(data_path="rotation_euler", frame=end_f)
        cam.data.keyframe_insert(data_path="lens", frame=end_f)

    # Set interpolation: BEZIER for dollies, CONSTANT for cuts between shots
    if cam.animation_data and cam.animation_data.action:
        for fcurve in cam.animation_data.action.fcurves:
            for kf in fcurve.keyframe_points:
                kf.interpolation = 'BEZIER'
                kf.easing = 'EASE_IN_OUT'

    return cam

# -----------------------------------------------------------------------------
# MAIN CLI DISPATCHER & HEADLESS RUNNER
# -----------------------------------------------------------------------------

def parse_args():
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = []

    args = {
        'manifest': None,
        'audio': None,
        'scene_script': None,
        'output': None,
        'frames': False,
        'dry_run': False,
        'force_overwrite': False,
    }

    i = 0
    while i < len(argv):
        arg = argv[i]
        if arg == '--manifest' and i + 1 < len(argv):
            args['manifest'] = argv[i + 1]
            i += 2
        elif arg == '--audio' and i + 1 < len(argv):
            args['audio'] = argv[i + 1]
            i += 2
        elif arg == '--scene-script' and i + 1 < len(argv):
            args['scene_script'] = argv[i + 1]
            i += 2
        elif arg == '--output' and i + 1 < len(argv):
            args['output'] = argv[i + 1]
            i += 2
        elif arg == '--frames':
            args['frames'] = True
            i += 1
        elif arg == '--dry-run':
            args['dry_run'] = True
            i += 1
        elif arg == '--force-overwrite':
            args['force_overwrite'] = True
            i += 1
        else:
            i += 1

    return args

def main():
    print("====================================================================")
    print("🎬 BLENDER 4.3 AUTONOMOUS 3D DIRECTOR & SCENE RUNNER")
    print("====================================================================")
    
    args = parse_args()

    manifest_path = args['manifest']
    if not manifest_path or not os.path.exists(manifest_path):
        print(f"❌ Error: Manifest path not provided or does not exist: {manifest_path}", file=sys.stderr)
        sys.exit(1)

    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    total_frames = manifest.get('totalFrames', 850)
    cast_type = manifest.get('castType', 'story_cast').lower()
    print(f"📋 Manifest: \"{manifest.get('title', 'Untitled')}\" | Cast: {cast_type} | Frames: {total_frames}")

    # Set Base Scene Properties
    scene = bpy.context.scene
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.fps = 30
    scene.frame_start = 1
    scene.frame_end = total_frames

    # EEVEE Next GPU Engine Settings
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 48
        if hasattr(scene.eevee, "ray_tracing_options"):
            scene.eevee.ray_tracing_options.use_denoise = True
            scene.eevee.ray_tracing_options.denoise_spatial = True
            scene.eevee.ray_tracing_options.denoise_temporal = True
            scene.eevee.ray_tracing_options.denoise_bilateral = True

    # 1. Clean default stage objects if story_cast or custom scene
    if cast_type == 'story_cast':
        print("🧹 Hiding all default stage objects (pristine canvas for story_cast)...")
        clean_all_stage_objects()

    # 2. Execute Custom LLM-Generated Scene Script
    scene_script = args['scene_script']
    if scene_script and os.path.exists(scene_script):
        print(f"🚀 Executing LLM Procedural Scene Builder: {scene_script}")
        try:
            scope = {
                '__file__': scene_script,
                'bpy': bpy,
                'math': math,
                'Vector': Vector,
                'Euler': Euler,
                'manifest': manifest,
                'audio_path': args['audio'],
                'total_frames': total_frames,
                'create_mat': create_mat,
                'clean_all_stage_objects': clean_all_stage_objects,
                'setup_director_camera': setup_director_camera,
                'hex_to_rgba': hex_to_rgba,
            }
            with open(scene_script, 'r', encoding='utf-8') as sf:
                script_code = sf.read()
            exec(script_code, scope)
            print("✅ LLM Procedural Scene Builder executed successfully!")
        except Exception as e:
            print(f"❌ Error executing generated scene script: {e}", file=sys.stderr)
            traceback.print_exc()
            sys.exit(2)
    else:
        print("⚠️ No custom scene_script provided, using default scene.")

    # 3. Ensure Camera is Set
    if not scene.camera:
        cam = bpy.data.objects.get("Cam_Cinematic_Director") or bpy.data.objects.get("Cam_Wide")
        if cam:
            scene.camera = cam
        else:
            bpy.ops.object.camera_add(location=(0, -4, 2))
            scene.camera = bpy.context.object

    # 4. Handle Headless Dry-Run
    if args['dry_run']:
        print("\n🧪 Executing Headless Dry-Run Validation...")
        try:
            # Test evaluating camera at key checkpoints
            for test_f in [1, max(1, total_frames // 4), max(1, total_frames // 2), total_frames]:
                scene.frame_set(test_f)
                cam_eval = scene.camera.matrix_world
                print(f"   • Frame {test_f} OK | Cam pos: ({scene.camera.location.x:.2f}, {scene.camera.location.y:.2f}, {scene.camera.location.z:.2f})")
            print("✅ DRY RUN PASSED SUCCESSFULLY! 0 errors detected.")
            sys.exit(0)
        except Exception as dre:
            print(f"❌ Dry-run evaluation failed: {dre}", file=sys.stderr)
            traceback.print_exc()
            sys.exit(3)

    # 5. Handle Full Frame Rendering
    if args['frames']:
        output_target = args['output']
        if not output_target:
            output_target = r"D:\New folder (2)\scratch\autonomous_phase2\frames\frame_"
        
        scene.render.image_settings.file_format = 'JPEG'
        scene.render.image_settings.quality = 95
        scene.render.filepath = output_target
        scene.render.use_overwrite = True

        print(f"\n🚀 Rendering Autonomous 3D Episode ({total_frames} frames) to {output_target}...")
        bpy.ops.render.render(animation=True)
        print("✅ Render complete!")

if __name__ == '__main__':
    main()
