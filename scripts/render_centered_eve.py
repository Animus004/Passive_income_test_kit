import bpy
import math
from mathutils import Vector

# Select all mesh objects
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
if not meshes:
    print("No meshes found!")
    exit(1)

# Calculate global bounding center
all_coords = []
for o in meshes:
    for corner in o.bound_box:
        all_coords.append(o.matrix_world @ Vector(corner))

min_c = Vector((min([c.x for c in all_coords]), min([c.y for c in all_coords]), min([c.z for c in all_coords])))
max_c = Vector((max([c.x for c in all_coords]), max([c.y for c in all_coords]), max([c.z for c in all_coords])))
center = (min_c + max_c) / 2.0
dims = max_c - min_c

print(f"Eve bounding box dims: {dims}, center: {center}")

# Position camera looking directly at center
cam = bpy.data.objects.get("Camera_Eve")
if not cam:
    cam_data = bpy.data.cameras.new("Cam_Data")
    cam = bpy.data.objects.new("Camera_Eve", cam_data)
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam

# Set camera distance based on max dimension
max_dim = max(dims.x, dims.y, dims.z)
cam_dist = max_dim * 2.2
cam.location = (center.x, center.y - cam_dist, center.z)
cam.rotation_euler = (math.radians(90), 0, 0)
cam.data.lens = 50

# Add 3-point lights relative to center
light_key = bpy.data.objects.get("Light_Studio")
if light_key:
    light_key.location = (center.x - max_dim * 1.5, center.y - max_dim * 1.5, center.z + max_dim)
    light_key.data.energy = 800.0

# Add fill light
fill_data = bpy.data.lights.new("Light_Fill", 'AREA')
fill_data.energy = 400.0
fill = bpy.data.objects.new("Light_Fill", fill_data)
bpy.context.collection.objects.link(fill)
fill.location = (center.x + max_dim * 1.5, center.y - max_dim, center.z)

# Render
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920
out_path = r"D:\New folder (2)\blender_engine\output\sketchfab_eve_centered.png"
scene.render.filepath = out_path

bpy.ops.wm.save_mainfile()
bpy.ops.render.render(write_still=True)
print(f"Rendered Eve to: {out_path}")
