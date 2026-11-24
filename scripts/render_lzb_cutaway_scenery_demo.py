import bpy
import math
import os

bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.eevee.taa_render_samples = 32
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920

# 1. World & Lighting
world = bpy.data.worlds.new("SkyWorld")
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs['Color'].default_value = (0.04, 0.08, 0.15, 1.0) # cinematic dusk/dawn navy
bg.inputs['Strength'].default_value = 0.8
scene.world = world

sun_data = bpy.data.lights.new("Sun", type='SUN')
sun_data.energy = 4.5
sun_data.color = (1.0, 0.92, 0.82)
sun_obj = bpy.data.objects.new("Sun", sun_data)
sun_obj.rotation_euler = (math.radians(45), math.radians(-25), math.radians(65))
scene.collection.objects.link(sun_obj)

# 2. Mountain Ridge Backdrop
def create_mountain_range():
    # Multi-peak background silhouette
    mesh = bpy.data.meshes.new("Mountains")
    obj = bpy.data.objects.new("Mountains", mesh)
    scene.collection.objects.link(obj)
    
    verts = []
    faces = []
    # Create jagged ridge line along X = -80 to +80 at Y = 60
    xs = [-100, -75, -55, -40, -25, -10, 5, 20, 38, 55, 75, 100]
    heights = [0, 22, 12, 35, 18, 28, 14, 40, 24, 32, 18, 0]
    y_dist = 70.0
    
    for i, (x, h) in enumerate(zip(xs, heights)):
        verts.append((x, y_dist, -5.0)) # bottom
        verts.append((x, y_dist + 5.0, h)) # peak
        
    for i in range(len(xs) - 1):
        b1 = i * 2
        p1 = i * 2 + 1
        b2 = (i + 1) * 2
        p2 = (i + 1) * 2 + 1
        faces.append((b1, b2, p2, p1))
        
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    
    mat = bpy.data.materials.new("MountainMat")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs['Base Color'].default_value = (0.08, 0.14, 0.22, 1.0) # misty alpine blue
    bsdf.inputs['Roughness'].default_value = 0.95
    obj.data.materials.append(mat)
    return obj

create_mountain_range()

# 3. Pine Trees on Embankment
tree_glb = r"D:\New folder (2)\assets\downloads\Pine_Trees_Pack_e1e9c07b\Pine_Trees_Pack.glb"
if os.path.exists(tree_glb):
    bpy.ops.import_scene.gltf(filepath=tree_glb)
    imported = [o for o in scene.collection.objects if "Pine" in o.name or "Tree" in o.name or "tree" in o.name.lower()]
    # Distribute trees along track margins
    tree_spots = [
        (-6.0, 15.0, 0.0), (-8.0, 25.0, 1.2), (-7.5, 38.0, 0.5), (-10.0, 50.0, 2.0),
        (7.0, 18.0, 0.2), (9.0, 28.0, 1.5), (8.5, 42.0, 0.8), (11.0, 55.0, 2.5)
    ]
    if imported:
        base_tree = imported[0]
        base_tree.scale = (0.8, 0.8, 0.8)
        base_tree.location = tree_spots[0]
        for i, spot in enumerate(tree_spots[1:]):
            dup = base_tree.copy()
            dup.data = base_tree.data
            dup.location = spot
            s = 0.6 + (i % 4) * 0.15
            dup.scale = (s, s, s)
            dup.rotation_euler = (0, 0, i * 1.1)
            scene.collection.objects.link(dup)

# 4. Railway Track & Cutaway Ballast Bed
# We create an architectural cutaway slice of the ground:
# The front portion (Y < 0) has a cutaway revealing ballast stone & sub-base
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 15, -0.6))
ground = bpy.context.active_object
ground.name = "Ground_Subgrade"
ground.scale = (18.0, 60.0, 1.0)
mat_earth = bpy.data.materials.new("EarthMat")
mat_earth.use_nodes = True
mat_earth.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.12, 0.15, 0.10, 1.0)
ground.data.materials.append(mat_earth)

# Ballast Bed (cutaway prism)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 15, 0.15))
ballast = bpy.context.active_object
ballast.name = "Ballast_Bed"
ballast.scale = (5.6, 60.0, 0.5)
mat_ballast = bpy.data.materials.new("BallastMat")
mat_ballast.use_nodes = True
mat_ballast.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.28, 0.28, 0.30, 1.0)
ballast.data.materials.append(mat_ballast)

# Sleepers (Concrete ties)
mat_tie = bpy.data.materials.new("ConcreteTie")
mat_tie.use_nodes = True
mat_tie.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.45, 0.45, 0.47, 1.0)

for y in range(-2, 35, 2):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, y * 0.8, 0.42))
    tie = bpy.context.active_object
    tie.name = f"Tie_{y}"
    tie.scale = (3.4, 0.32, 0.18)
    tie.data.materials.append(mat_tie)

# Dual Steel Rails
mat_steel = bpy.data.materials.new("PolishedRailSteel")
mat_steel.use_nodes = True
bsdf_steel = mat_steel.node_tree.nodes.get("Principled BSDF")
bsdf_steel.inputs['Base Color'].default_value = (0.85, 0.88, 0.92, 1.0)
bsdf_steel.inputs['Metallic'].default_value = 0.95
bsdf_steel.inputs['Roughness'].default_value = 0.18

for rail_x in [-1.0, 1.0]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=60.0, location=(rail_x, 15.0, 0.58))
    rail = bpy.context.active_object
    rail.rotation_euler = (math.radians(90), 0, 0)
    rail.data.materials.append(mat_steel)

# 5. LZB Sub-Ballast Inductive Cable Loop
# Two copper conductors running in the track center, one crossing over every 100m
mat_lzb_cable = bpy.data.materials.new("LZB_CopperCable")
mat_lzb_cable.use_nodes = True
bsdf_lzb = mat_lzb_cable.node_tree.nodes.get("Principled BSDF")
bsdf_lzb.inputs['Base Color'].default_value = (0.9, 0.45, 0.1, 1.0) # bright copper
bsdf_lzb.inputs['Metallic'].default_value = 0.9

for cx in [-0.25, 0.25]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=60.0, location=(cx, 15.0, 0.38))
    cable = bpy.context.active_object
    cable.rotation_euler = (math.radians(90), 0, 0)
    cable.data.materials.append(mat_lzb_cable)

# Inductive Electromagnetic Flux Rings (Visualizing the wireless telemetry field)
mat_flux = bpy.data.materials.new("FluxEmission")
mat_flux.use_nodes = True
bsdf_flux = mat_flux.node_tree.nodes.get("Principled BSDF")
bsdf_flux.inputs['Emission Color'].default_value = (0.0, 0.85, 1.0, 1.0) # vibrant cyan neon
bsdf_flux.inputs['Emission Strength'].default_value = 15.0

# Pulse rings expanding from the cable toward the train
for i, ry in enumerate([2.5, 4.0, 5.5, 7.0]):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.45 + (i * 0.15),
        minor_radius=0.02,
        location=(0.0, ry, 0.48 + (i * 0.18))
    )
    ring = bpy.context.active_object
    ring.rotation_euler = (math.radians(90), 0, 0)
    ring.data.materials.append(mat_flux)

# 6. Import Y25 Bogie directly above the cutaway
bogie_glb = r"D:\New folder (2)\assets\downloads\Bogie_Type_Y25_59b720c2\Bogie_Type_Y25.glb"
if os.path.exists(bogie_glb):
    bpy.ops.import_scene.gltf(filepath=bogie_glb)
    # The bogie root is imported as Sketchfab_model
    for obj in scene.objects:
        if "Sketchfab_model" in obj.name:
            obj.location = (0.0, 4.8, 0.95)
            obj.rotation_euler = (0, 0, math.radians(90))
            obj.scale = (0.95, 0.95, 0.95)
            break

# 7. Add Train Pickup Antenna Receiver under the bogie
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 4.8, 0.92))
antenna = bpy.context.active_object
antenna.name = "LZB_Pickup_Antenna"
antenna.scale = (0.6, 0.9, 0.08)
mat_antenna = bpy.data.materials.new("AntennaMat")
mat_antenna.use_nodes = True
bsdf_ant = mat_antenna.node_tree.nodes.get("Principled BSDF")
bsdf_ant.inputs['Base Color'].default_value = (0.95, 0.75, 0.1, 1.0) # warning yellow housing
antenna.data.materials.append(mat_antenna)

# 8. Camera: Macro Low-Angle Cutaway Perspective
cam_data = bpy.data.cameras.new("MacroCam")
cam_data.lens = 32
cam_obj = bpy.data.objects.new("MacroCam", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

# Camera sits at low front cutaway, looking up through the track cross-section toward bogie and mountains
cam_obj.location = (2.2, -1.8, 0.95)

target = bpy.data.objects.new("LookTarget", None)
scene.collection.objects.link(target)
target.location = (0.0, 4.5, 1.25)

track = cam_obj.constraints.new(type='TRACK_TO')
track.target = target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'

# Accent Fill Rim Light (Cool Cyan & Warm Amber)
rim = bpy.data.lights.new("CutawayAccent", type='SPOT')
rim.energy = 600
rim.color = (0.0, 0.9, 1.0) # high-tech blue
rim_obj = bpy.data.objects.new("CutawayAccent", rim)
rim_obj.location = (-3.0, 2.0, 0.4)
scene.collection.objects.link(rim_obj)

# Output Render Still
out_path = r"C:\Users\sayan\.gemini\antigravity\brain\f6352432-fa3c-4b63-acbf-21e7ecd31607\lzb_cutaway_scenery_proof.png"
scene.render.filepath = out_path
print("Rendering Subsurface LZB Cutaway + Scenery Demonstration...")
bpy.ops.render.render(write_still=True)
print(f"✅ Render Complete: {out_path}")
