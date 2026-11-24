import bpy
import math
import os

bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.eevee.taa_render_samples = 32
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920

# 1. World & Cinematic Atmosphere
world = bpy.data.worlds.new("SkyWorld")
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs['Color'].default_value = (0.45, 0.65, 0.88, 1.0) # Clear Alpine Sky
bg.inputs['Strength'].default_value = 1.2
scene.world = world

# Sun Light (Warm crisp sunlight)
sun_data = bpy.data.lights.new("Sun", type='SUN')
sun_data.energy = 6.0
sun_data.color = (1.0, 0.96, 0.88)
sun_obj = bpy.data.objects.new("Sun", sun_data)
sun_obj.rotation_euler = (math.radians(50), math.radians(-30), math.radians(45))
scene.collection.objects.link(sun_obj)

# 2. Mountain Ridge Backdrop
mesh_mtn = bpy.data.meshes.new("Mountains")
obj_mtn = bpy.data.objects.new("Mountains", mesh_mtn)
scene.collection.objects.link(obj_mtn)

xs = [-120, -90, -65, -45, -25, -5, 15, 35, 55, 80, 105, 130]
heights = [0, 28, 15, 42, 22, 35, 18, 48, 26, 38, 20, 0]
y_dist = 60.0
verts, faces = [], []
for i, (x, h) in enumerate(zip(xs, heights)):
    verts.append((x, y_dist, -8.0))
    verts.append((x, y_dist + 5.0, h))
for i in range(len(xs) - 1):
    faces.append((i*2, (i+1)*2, (i+1)*2+1, i*2+1))
mesh_mtn.from_pydata(verts, [], faces)
mesh_mtn.update()

mat_mtn = bpy.data.materials.new("MountainMat")
mat_mtn.use_nodes = True
bsdf_mtn = mat_mtn.node_tree.nodes.get("Principled BSDF")
bsdf_mtn.inputs['Base Color'].default_value = (0.22, 0.28, 0.35, 1.0)
bsdf_mtn.inputs['Roughness'].default_value = 0.9
obj_mtn.data.materials.append(mat_mtn)

# 3. Ground / Grass Valley
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 20, -1.0))
ground = bpy.context.active_object
ground.name = "Ground"
ground.scale = (40.0, 70.0, 1.0)
mat_ground = bpy.data.materials.new("GrassMat")
mat_ground.use_nodes = True
mat_ground.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.24, 0.38, 0.18, 1.0)
ground.data.materials.append(mat_ground)

# 4. Ballast Bed (Clean Beveled Raised Embankment)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 20, -0.15))
ballast = bpy.context.active_object
ballast.name = "Ballast_Bed"
ballast.scale = (5.5, 70.0, 0.7)
mat_ballast = bpy.data.materials.new("BallastMat")
mat_ballast.use_nodes = True
mat_ballast.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.35, 0.34, 0.33, 1.0)
ballast.data.materials.append(mat_ballast)

# Sleepers (Concrete Ties)
mat_tie = bpy.data.materials.new("ConcreteTie")
mat_tie.use_nodes = True
mat_tie.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.6, 0.6, 0.62, 1.0)

for y in range(-5, 45, 2):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, y * 0.75, 0.25))
    tie = bpy.context.active_object
    tie.scale = (3.2, 0.28, 0.15)
    tie.data.materials.append(mat_tie)

# Dual Polished Steel Rails
mat_steel = bpy.data.materials.new("PolishedRailSteel")
mat_steel.use_nodes = True
bsdf_steel = mat_steel.node_tree.nodes.get("Principled BSDF")
bsdf_steel.inputs['Base Color'].default_value = (0.9, 0.92, 0.95, 1.0)
bsdf_steel.inputs['Metallic'].default_value = 0.98
bsdf_steel.inputs['Roughness'].default_value = 0.15

for rx in [-0.95, 0.95]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=70.0, location=(rx, 20.0, 0.38))
    rail = bpy.context.active_object
    rail.rotation_euler = (math.radians(90), 0, 0)
    rail.data.materials.append(mat_steel)

# 5. LZB Sub-Surface Inductive Cables & Cross-over Loop
mat_copper = bpy.data.materials.new("CopperCable")
mat_copper.use_nodes = True
mat_copper.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.95, 0.45, 0.1, 1.0)
mat_copper.node_tree.nodes.get("Principled BSDF").inputs['Metallic'].default_value = 0.9

for cx in [-0.22, 0.22]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=70.0, location=(cx, 20.0, 0.23))
    cable = bpy.context.active_object
    cable.rotation_euler = (math.radians(90), 0, 0)
    cable.data.materials.append(mat_copper)

# Glowing Inductive Flux Field Waves
mat_flux = bpy.data.materials.new("FluxWaves")
mat_flux.use_nodes = True
bsdf_flux = mat_flux.node_tree.nodes.get("Principled BSDF")
bsdf_flux.inputs['Emission Color'].default_value = (0.0, 0.88, 1.0, 1.0) # Electric cyan
bsdf_flux.inputs['Emission Strength'].default_value = 18.0

for i, y_pos in enumerate([1.5, 3.0, 4.5, 6.0, 7.5]):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.38 + (i * 0.08),
        minor_radius=0.022,
        location=(0.0, y_pos, 0.35 + (i * 0.12))
    )
    torus = bpy.context.active_object
    torus.rotation_euler = (math.radians(90), 0, 0)
    torus.data.materials.append(mat_flux)

# 6. Import Y25 Bogie Model
bogie_glb = r"D:\New folder (2)\assets\downloads\Bogie_Type_Y25_59b720c2\Bogie_Type_Y25.glb"
if os.path.exists(bogie_glb):
    bpy.ops.import_scene.gltf(filepath=bogie_glb)
    for obj in scene.objects:
        if "Sketchfab_model" in obj.name:
            obj.location = (0.0, 4.2, 0.82)
            obj.rotation_euler = (0, 0, math.radians(90))
            obj.scale = (0.85, 0.85, 0.85)
            break

# 7. Import Tree Pack (and strip helper planes)
tree_glb = r"D:\New folder (2)\assets\downloads\Pine_Trees_Pack_e1e9c07b\Pine_Trees_Pack.glb"
if os.path.exists(tree_glb):
    bpy.ops.import_scene.gltf(filepath=tree_glb)
    # Delete reference planes and checker boxes
    to_delete = [o for o in scene.objects if any(k in o.name.lower() for k in ["plane", "checker", "ref", "billboard"])]
    for o in to_delete:
        bpy.data.objects.remove(o, do_unlink=True)
        
    tree_objs = [o for o in scene.objects if "Pine" in o.name and o.type == 'MESH']
    if tree_objs:
        base_t = tree_objs[0]
        tree_coords = [
            (-5.5, 8.0, 0.0), (-7.0, 16.0, 0.3), (-6.5, 26.0, 0.2), (-8.5, 36.0, 0.5),
            (6.0, 10.0, 0.0), (7.5, 18.0, 0.2), (6.8, 28.0, 0.4), (9.0, 40.0, 0.6)
        ]
        base_t.scale = (0.015, 0.015, 0.015)
        base_t.location = tree_coords[0]
        for i, pt in enumerate(tree_coords[1:]):
            dup = base_t.copy()
            dup.data = base_t.data
            dup.location = pt
            s = 0.012 + (i % 3) * 0.003
            dup.scale = (s, s, s)
            scene.collection.objects.link(dup)

# 8. High-Tech Camera Setup
cam_data = bpy.data.cameras.new("MacroCutawayCam")
cam_data.lens = 38
cam_obj = bpy.data.objects.new("MacroCutawayCam", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

# Camera is positioned at a low side angle looking forward-down at the rails, cable, and bogie
cam_obj.location = (2.6, -1.0, 1.4)

target = bpy.data.objects.new("CamFocus", None)
scene.collection.objects.link(target)
target.location = (0.0, 4.2, 0.75)

track = cam_obj.constraints.new(type='TRACK_TO')
track.target = target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'

# Fill Accent Light
fill = bpy.data.lights.new("AccentFill", type='AREA')
fill.energy = 400
fill.size = 3.0
fill.color = (0.2, 0.7, 1.0)
fill_obj = bpy.data.objects.new("AccentFill", fill)
fill_obj.location = (-3.5, 2.0, 1.5)
scene.collection.objects.link(fill_obj)

# Output Render Still
out_path = r"C:\Users\sayan\.gemini\antigravity\brain\f6352432-fa3c-4b63-acbf-21e7ecd31607\lzb_cutaway_scenery_clean.png"
scene.render.filepath = out_path
print(f"Rendering Clean LZB Cutaway + Scenery to {out_path}...")
bpy.ops.render.render(write_still=True)
print(f"✅ Rendered Successfully: {out_path}")
