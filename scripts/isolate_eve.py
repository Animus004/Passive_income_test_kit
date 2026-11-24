import bpy
import math

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads\a41f75a4af0142c680e1a26e904e5bec_glb.glb")

# Find objects by material
eve_objs = []
walle_objs = []

for o in bpy.data.objects:
    if o.type == 'MESH':
        mat_names = [slot.material.name for slot in o.material_slots if slot.material]
        if 'material' in mat_names:
            eve_objs.append(o)
        else:
            walle_objs.append(o)

print(f"Eve objects count: {len(eve_objs)}")
for o in eve_objs:
    print(f"  Eve Mesh: {o.name}, loc: {o.location}, dim: {o.dimensions}")

# Delete Wall-E & ground/plant to isolate Eve
for o in walle_objs:
    bpy.data.objects.remove(o, do_unlink=True)

# Set up Camera
cam_data = bpy.data.cameras.new("Eve_Cam")
cam_data.lens = 50
cam = bpy.data.objects.new("Camera_Eve", cam_data)
bpy.context.collection.objects.link(cam)
bpy.context.scene.camera = cam

# Calculate bounding box of Eve
min_z = min([o.location.z for o in eve_objs])
max_z = max([o.location.z + o.dimensions.z for o in eve_objs])
center_z = (min_z + max_z) / 2
print(f"Eve Z bounds: {min_z} to {max_z}, center: {center_z}")

cam.location = (0, -4.0, center_z)
cam.rotation_euler = (math.radians(90), 0, 0)

# Add studio light
light_data = bpy.data.lights.new("Studio_Light", 'AREA')
light_data.energy = 300.0
light_data.size = 2.0
light = bpy.data.objects.new("Light_Studio", light_data)
bpy.context.collection.objects.link(light)
light.location = (-2.0, -3.0, center_z + 1.5)
light.rotation_euler = (math.radians(45), math.radians(-20), math.radians(-40))

# Configure render
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920
scene.render.filepath = r"D:\New folder (2)\blender_engine\output\sketchfab_eve_isolated.png"

# Save blend
blend_path = r"D:\New folder (2)\blender_engine\assets\desi_library\sketchfab_eve_isolated.blend"
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print("Saved isolated blend:", blend_path)

bpy.ops.render.render(write_still=True)
print("Rendered:", scene.render.filepath)
