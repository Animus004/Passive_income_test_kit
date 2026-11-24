import bpy
import json
import os
import sys

sys.path.insert(0, r"D:\New folder (2)\blender_engine\scripts")
import stage_autonomous_3d

manifest_path = r"D:\New folder (2)\scratch\autonomous_phase2\episode_manifest.json"
with open(manifest_path, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

stage_autonomous_3d.apply_world_and_lighting(manifest)
stage_autonomous_3d.spawn_procedural_props(manifest)
stage_autonomous_3d.setup_cameras(manifest)
stage_autonomous_3d.animate_procedural_choreography(manifest)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
if hasattr(scene, 'eevee'):
    scene.eevee.taa_render_samples = 16
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920
scene.render.image_settings.file_format = 'JPEG'
scene.render.image_settings.quality = 95

proof_frames = [
    (60, "proof_dev_face_glow.jpg"),
    (240, "proof_gemini_confront.jpg"),
    (790, "proof_gemini_shuts_laptop.jpg"),
    (835, "proof_darkness_shutdown.jpg")
]

out_dir = r"D:\New folder (2)\scratch\autonomous_phase2"
os.makedirs(out_dir, exist_ok=True)

for frame_num, filename in proof_frames:
    scene.frame_set(frame_num)
    for m in sorted(scene.timeline_markers, key=lambda x: x.frame):
        if m.frame <= frame_num and m.camera:
            scene.camera = m.camera
    
    out_path = os.path.join(out_dir, filename)
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"✅ Rendered frame {frame_num} ({scene.camera.name}) -> {out_path}")
