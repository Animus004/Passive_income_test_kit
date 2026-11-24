import os, math, bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920

world = bpy.data.worlds.new("Sky")
world.use_nodes = True
world.node_tree.nodes.get("Background").inputs['Color'].default_value = (0.45, 0.65, 0.90, 1.0)
scene.world = world

sun = bpy.data.lights.new("Sun", type='SUN')
sun.energy = 5.0
sun_obj = bpy.data.objects.new("Sun", sun)
sun_obj.rotation_euler = (math.radians(45), math.radians(-25), math.radians(45))
scene.collection.objects.link(sun_obj)

# Load Bullet Train Poly
train_glb = r"D:\New folder (2)\assets\downloads\Bullet_Train_Poly_af454108\Bullet_Train_Poly.glb"
bpy.ops.import_scene.gltf(filepath=train_glb)

# Find root and position
for o in bpy.context.scene.objects:
    if o.parent is None and o.type == 'EMPTY':
        o.location = (0, 0, 1.2)
        print("Root:", o.name, o.location, o.rotation_euler)

cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 35
cam_obj = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj
cam_obj.location = (5.0, -10.0, 3.5)

target = bpy.data.objects.new("Target", None)
scene.collection.objects.link(target)
target.location = (0, 0, 2.0)
track = cam_obj.constraints.new(type='TRACK_TO')
track.target = target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'

out_path = r"C:\Users\sayan\.gemini\antigravity\brain\f6352432-fa3c-4b63-acbf-21e7ecd31607\test_bullet_train_preview.png"
scene.render.filepath = out_path
bpy.ops.render.render(write_still=True)
print(f"Rendered preview: {out_path}")
