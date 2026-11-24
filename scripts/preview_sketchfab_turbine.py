import bpy
import os

bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.eevee.taa_render_samples = 32
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920

# Add camera
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 50
cam_obj = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj
cam_obj.location = (2.5, -3.5, 1.8)

# Import GLB
glb_path = r"D:\New folder (2)\assets\downloads\Turbine___Turbofan_Engine___Jet_Engine_74c6acee\jet_turbofan_engine.glb"
bpy.ops.import_scene.gltf(filepath=glb_path)

# Find bounding box & center
objs = [o for o in scene.collection.objects if o.type == 'MESH']
if objs:
    print(f"Imported {len(objs)} mesh objects from turbine GLB")
    
# Add Target empty at center
target = bpy.data.objects.new("Target", None)
scene.collection.objects.link(target)
target.location = (0, 0, 0.5)

track = cam_obj.constraints.new(type='TRACK_TO')
track.target = target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'

# Studio 3-point lighting
key_light = bpy.data.lights.new("Key", type='AREA')
key_light.energy = 500
key_light.size = 2.0
key_obj = bpy.data.objects.new("Key", key_light)
key_obj.location = (3, -3, 3)
scene.collection.objects.link(key_obj)

rim_light = bpy.data.lights.new("Rim", type='SPOT')
rim_light.energy = 800
rim_light.color = (0.2, 0.8, 1.0)
rim_obj = bpy.data.objects.new("Rim", rim_light)
rim_obj.location = (-2, 3, 2.5)
scene.collection.objects.link(rim_obj)

fill_light = bpy.data.lights.new("Fill", type='AREA')
fill_light.energy = 200
fill_light.color = (1.0, 0.6, 0.2)
fill_obj = bpy.data.objects.new("Fill", fill_light)
fill_obj.location = (-3, -2, 1)
scene.collection.objects.link(fill_obj)

# Output preview still
out_path = r"C:\Users\sayan\.gemini\antigravity\brain\f6352432-fa3c-4b63-acbf-21e7ecd31607\sketchfab_turbofan_preview.png"
scene.render.filepath = out_path
bpy.ops.render.render(write_still=True)
print(f"Rendered preview to: {out_path}")
