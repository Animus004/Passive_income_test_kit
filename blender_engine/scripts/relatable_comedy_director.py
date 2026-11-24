"""
Relatable AI Comedy 3D Director Engine (Phase 3 Autonomous Master)

Features & Upgrades:
- Pure 1-on-1 dynamic between Human and Gemini (AI Companion)
- Expressive, cute Human mouth movement (smooth 7.5 Hz jaw drop, natural Bezier easing)
- Gemini mouth movement (synchronized nozzle/spout pulsing & voice articulation)
- Magical animated floating orbs in Gemini's dome (harmonic orbits, accelerated thinking state)
- Natural synchronized eye blinks for both Human and Gemini
- 4 Rich, Diverse Environments:
    * 'daylight_walk': Sunny suburban stroll with passing cars, trees, sidewalk, fire hydrant
    * 'latenight_desk': Cyberpunk 3:14 AM coding sanctuary with glowing monitors & LED clock
    * 'cafe_corner': Cozy warm coffee shop with wooden counter, espresso machine & Edison lights
    * 'neon_datacenter': High-tech server room with glowing cyan & purple server racks
- Multi-camera cutting (Close portrait cuts + Wide two-shots + Crash zooms) via Timeline Markers
- Automated NVENC/EEVEE Next fast rendering (~0.08s/frame)
"""

import bpy
import json
import math
import sys
import os
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.append(SCRIPT_DIR)
from mathutils import Vector, Euler
import bmesh
import action_library

def hex_to_linear(hex_code, alpha=1.0):
    hex_code = hex_code.lstrip('#')
    s_r = int(hex_code[0:2], 16) / 255.0
    s_g = int(hex_code[2:4], 16) / 255.0
    s_b = int(hex_code[4:6], 16) / 255.0
    def to_lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (to_lin(s_r), to_lin(s_g), to_lin(s_b), alpha)

def create_mat(name, base_color, roughness=0.5, metallic=0.0, emission_color=None, emission_strength=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if emission_color and emission_strength > 0:
            if len(emission_color) == 3:
                emission_color = (emission_color[0], emission_color[1], emission_color[2], 1.0)
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission_color
                bsdf.inputs["Emission Strength"].default_value = emission_strength
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = emission_color
    return mat

def set_smooth(obj):
    if obj and obj.type == 'MESH':
        for p in obj.data.polygons:
            p.use_smooth = True

def set_parent(child, parent):
    if child and parent:
        child.parent = parent
        child.matrix_parent_inverse = parent.matrix_world.inverted()

def make_fcurves_linear(obj):
    if obj.animation_data and obj.animation_data.action:
        for fcurve in obj.animation_data.action.fcurves:
            for kp in fcurve.keyframe_points:
                kp.interpolation = 'BEZIER'
                kp.easing = 'AUTO'

# =========================================================================
# PURGE HELPERS
# =========================================================================

def purge_claude():
    """Completely purges all Claude objects so Claude never appears."""
    for o in list(bpy.data.objects):
        if 'Claude' in o.name:
            bpy.data.objects.remove(o, do_unlink=True)

def purge_indoor_room():
    """Removes all bedroom/office props when outdoor or custom stages are active."""
    indoor_names = ['Desk_Top', 'Laptop_Base', 'Laptop_Root', 'Laptop_Screen_Hinge', 'Laptop_Keyboard', 'Laptop_Lid_Logo', 'Laptop_Screen', 'BackWall', 'LeftWall', 'Floor',
                    'Light_Key_Sun', 'Light_Fill_Sky', 'Light_Rim_Back']
    for name in indoor_names:
        o = bpy.data.objects.get(name)
        if o:
            bpy.data.objects.remove(o, do_unlink=True)

    for o in list(bpy.data.objects):
        if 'laptop' in o.name.lower():
            bpy.data.objects.remove(o, do_unlink=True)
        elif any(k in o.name for k in ['Cube', 'Cylinder', 'Plane', 'Torus']):
            if o.parent is None:
                bpy.data.objects.remove(o, do_unlink=True)

# =========================================================================
# STAGE 1: SUNNY DAYLIGHT WALK ENVIRONMENT
# =========================================================================

def build_stylized_car(name, color):
    root = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(root)
    mat_paint = create_mat(f'Mat_{name}_Paint', color, roughness=0.2, metallic=0.7)
    mat_glass = create_mat(f'Mat_{name}_Glass', (0.1, 0.15, 0.22, 0.6), roughness=0.1)
    mat_tire = create_mat('Mat_Car_Tire', (0.05, 0.05, 0.05, 1.0), roughness=0.9)
    mat_rim = create_mat('Mat_Car_Rim', (0.8, 0.82, 0.85, 1.0), roughness=0.3, metallic=0.9)
    mat_headlight = create_mat('Mat_Car_Headlight', (1.0, 0.95, 0.7, 1.0), roughness=0.1)
    mat_taillight = create_mat('Mat_Car_Taillight', (1.0, 0.1, 0.1, 1.0), roughness=0.1)

    # Chassis
    bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
    chassis = bpy.context.active_object
    chassis.name = f'{name}_Chassis'
    chassis.scale = (0.38, 0.85, 0.16)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    chassis.data.materials.append(mat_paint)
    set_smooth(chassis)
    chassis.parent = root

    # Cabin Roof
    bpy.ops.mesh.primitive_cube_add(location=(0, -0.08, 0.22))
    cabin = bpy.context.active_object
    cabin.name = f'{name}_Cabin'
    cabin.scale = (0.32, 0.45, 0.12)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    cabin.data.materials.append(mat_glass)
    set_smooth(cabin)
    cabin.parent = root

    # Wheels
    for wx in [-0.40, 0.40]:
        for wy in [-0.50, 0.50]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=0.08, location=(wx, wy, -0.08), rotation=(0, math.radians(90), 0))
            wheel = bpy.context.active_object
            wheel.data.materials.append(mat_tire)
            set_smooth(wheel)
            wheel.parent = root

            bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=0.09, location=(wx * 1.02, wy, -0.08), rotation=(0, math.radians(90), 0))
            rim = bpy.context.active_object
            rim.data.materials.append(mat_rim)
            set_smooth(rim)
            rim.parent = root

    # Headlights
    for lx in [-0.24, 0.24]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.02, location=(lx, -0.85, 0.02), rotation=(math.radians(90), 0, 0))
        hl = bpy.context.active_object
        hl.data.materials.append(mat_headlight)
        hl.parent = root

    # Taillights
    for lx in [-0.24, 0.24]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.040, depth=0.02, location=(lx, 0.85, 0.02), rotation=(math.radians(90), 0, 0))
        tl = bpy.context.active_object
        tl.data.materials.append(mat_taillight)
        tl.parent = root

    return root

def ensure_human_lower_body(human, is_seated=False, is_barstool=False):
    """Ensures dark denim jeans and sneakers are attached to Human_Avatar with realistic proportions and grounded feet."""
    if not human:
        return

    # Clear any old or misconfigured legs/shoes
    for name in ['Human_Leg_L', 'Human_Leg_R', 'Human_Shoe_L', 'Human_Shoe_R', 
                 'Human_Calf_L', 'Human_Calf_R', 'Human_Knee_L', 'Human_Knee_R',
                 'Human_Sole_L', 'Human_Sole_R']:
        old_obj = bpy.data.objects.get(name)
        if old_obj:
            bpy.data.objects.remove(old_obj, do_unlink=True)

    mat_pants = create_mat('Mat_Human_Pants', (0.10, 0.14, 0.22, 1.0), roughness=0.8)
    mat_shoe = create_mat('Mat_Human_Shoes', (0.92, 0.94, 0.96, 1.0), roughness=0.3)
    mat_sole = create_mat('Mat_Shoe_Sole', (0.15, 0.16, 0.18, 1.0), roughness=0.9)
    hip_z = 0.94

    if is_barstool:
        # High Barstool Seated Ergonomics:
        # Wooden stool seat cushion is at Z=0.868m, Y=0.82m
        # Steel circular footrest ring is at Z=0.306m, Y=0.60m
        thigh_len = 0.26
        calf_len = 0.52

        for side in [-1, 1]:
            s_name = "L" if side == -1 else "R"
            hip_x = side * 0.11
            knee_x = side * 0.16
            mid_x = (hip_x + knee_x) * 0.5
            knee_y = 0.88 - thigh_len # Y = 0.62

            # 1. Thigh resting on barstool cushion
            bpy.ops.mesh.primitive_cylinder_add(radius=0.076, depth=thigh_len, vertices=24, location=(mid_x, 0.88 - (thigh_len / 2.0), 0.90))
            thigh = bpy.context.active_object
            thigh.name = f'Human_Leg_{s_name}'
            thigh.rotation_euler = (math.radians(90), side * math.radians(6.0), 0)
            thigh.data.materials.append(mat_pants)
            set_smooth(thigh)
            thigh.parent = human

            # 2. Smooth Knee Joint
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.075, location=(knee_x, knee_y, 0.90))
            knee = bpy.context.active_object
            knee.name = f'Human_Knee_{s_name}'
            knee.data.materials.append(mat_pants)
            set_smooth(knee)
            knee.parent = human

            # 3. Calf dropping down towards footrest ring
            calf_z = 0.90 - (calf_len / 2.0)
            bpy.ops.mesh.primitive_cylinder_add(radius=0.068, depth=calf_len, vertices=24, location=(knee_x, knee_y, calf_z))
            calf = bpy.context.active_object
            calf.name = f'Human_Calf_{s_name}'
            calf.data.materials.append(mat_pants)
            set_smooth(calf)
            calf.parent = human

            # 4. Sneaker Resting Flush on Barstool Footrest Ring (Z = 0.335m)
            bpy.ops.mesh.primitive_cylinder_add(radius=0.065, depth=0.045, vertices=24, location=(knee_x, knee_y - 0.04, 0.335))
            shoe = bpy.context.active_object
            shoe.name = f'Human_Shoe_{s_name}'
            shoe.scale = (1.0, 1.8, 1.0)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            shoe.data.materials.append(mat_shoe)
            set_smooth(shoe)
            shoe.parent = human

            # 5. Rubber Sole resting on footrest ring (Z = 0.306m)
            bpy.ops.mesh.primitive_cylinder_add(radius=0.068, depth=0.012, vertices=24, location=(knee_x, knee_y - 0.04, 0.306))
            sole = bpy.context.active_object
            sole.name = f'Human_Sole_{s_name}'
            sole.scale = (1.0, 1.85, 1.0)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            sole.data.materials.append(mat_sole)
            sole.parent = human
    elif is_seated:
        # Anatomical Seated Posture: Thighs splayed outward naturally, smooth knee joint, vertical calves down to floor, soles flush
        thigh_len = 0.33
        calf_len = 0.44
        for side in [-1, 1]:
            s_name = "L" if side == -1 else "R"
            hip_x = side * 0.11
            knee_x = side * 0.17
            mid_x = (hip_x + knee_x) * 0.5
            knee_y = 0.93 - thigh_len

            # 1. Thigh (angled outward along Y and X from hip to knee)
            bpy.ops.mesh.primitive_cylinder_add(radius=0.076, depth=thigh_len, vertices=24, location=(mid_x, 0.93 - (thigh_len / 2.0), 0.92))
            thigh = bpy.context.active_object
            thigh.name = f'Human_Leg_{s_name}'
            thigh.rotation_euler = (math.radians(90), side * math.radians(8.5), 0)
            thigh.data.materials.append(mat_pants)
            set_smooth(thigh)
            thigh.parent = human

            # 2. Smooth Knee joint
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.075, location=(knee_x, knee_y, 0.92))
            knee = bpy.context.active_object
            knee.name = f'Human_Knee_{s_name}'
            knee.data.materials.append(mat_pants)
            set_smooth(knee)
            knee.parent = human

            # 3. Calf / Shin (vertical cylinder down from knee to floor)
            calf_z = 0.92 - (calf_len / 2.0)
            bpy.ops.mesh.primitive_cylinder_add(radius=0.068, depth=calf_len, vertices=24, location=(knee_x, knee_y, calf_z))
            calf = bpy.context.active_object
            calf.name = f'Human_Calf_{s_name}'
            calf.data.materials.append(mat_pants)
            set_smooth(calf)
            calf.parent = human

            # 4. Sneaker upper body (rounded bevel / stylish sneaker)
            bpy.ops.mesh.primitive_cylinder_add(radius=0.065, depth=0.045, vertices=24, location=(knee_x, knee_y - 0.04, 0.535))
            shoe = bpy.context.active_object
            shoe.name = f'Human_Shoe_{s_name}'
            shoe.scale = (1.0, 1.8, 1.0)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            shoe.data.materials.append(mat_shoe)
            set_smooth(shoe)
            shoe.parent = human

            # 5. Dark rubber sole (touches floor at world Z=0.0m)
            bpy.ops.mesh.primitive_cylinder_add(radius=0.068, depth=0.012, vertices=24, location=(knee_x, knee_y - 0.04, 0.506))
            sole = bpy.context.active_object
            sole.name = f'Human_Sole_{s_name}'
            sole.scale = (1.0, 1.85, 1.0)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            sole.data.materials.append(mat_sole)
            sole.parent = human
    else:
        # Full Standing Posture: Full length legs down to floor (Z=0.0m) - 100% physically grounded!
        leg_len = 0.90
        for side in [-1, 1]:
            s_name = "L" if side == -1 else "R"
            sx = side * 0.11

            # Leg cylinder
            bpy.ops.mesh.primitive_cylinder_add(radius=0.078, depth=leg_len, vertices=24, location=(sx, 0.95, hip_z - (leg_len / 2.0)))
            leg = bpy.context.active_object
            leg.name = f'Human_Leg_{s_name}'
            leg.data.materials.append(mat_pants)
            set_smooth(leg)

            # Move origin to hip joint (sx, 0.95, hip_z) so it pivots naturally from hip
            bpy.context.scene.cursor.location = (sx, 0.95, hip_z)
            bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
            set_parent(leg, human)

            # Sneaker upper body (Z = 0.015 to 0.075) - parented to leg so it strides with leg
            bpy.ops.mesh.primitive_cube_add(location=(sx, 0.90, 0.045))
            shoe = bpy.context.active_object
            shoe.name = f'Human_Shoe_{s_name}'
            shoe.scale = (0.075, 0.13, 0.03)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            shoe.data.materials.append(mat_shoe)
            set_smooth(shoe)
            set_parent(shoe, leg)

            # Dark rubber sole (Z = 0.000 to 0.015) - flush contact with sidewalk Z=0.0!
            bpy.ops.mesh.primitive_cube_add(location=(sx, 0.90, 0.0075))
            sole = bpy.context.active_object
            sole.name = f'Human_Sole_{s_name}'
            sole.scale = (0.078, 0.135, 0.0075)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            sole.data.materials.append(mat_sole)
            set_parent(sole, leg)

def load_stylized_street_sedans():
    """Extracts, cleans, normalizes, and shaders real low-poly sports sedans from vehicle pack."""
    glb_path = r"D:\New folder (2)\blender_engine\assets\vehicles\low_poly_vehicle_pack.glb"
    if not os.path.exists(glb_path):
        glb_path = r"D:\New folder (2)\assets\downloads\low_poly_vehicle_pack_ef3c9ca5\low_poly_vehicle_pack.glb"
    if not os.path.exists(glb_path):
        return None, None
        
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    def extract_and_join(body_name, wheel_name, result_name, color_tint=None):
        b = bpy.data.objects.get(body_name)
        w = bpy.data.objects.get(wheel_name)
        if not b or not w:
            return None
            
        for obj in [b, w]:
            mw = obj.matrix_world.copy()
            obj.parent = None
            obj.matrix_world = mw
            bpy.ops.object.select_all(action='DESELECT')
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
            
        bpy.ops.object.select_all(action='DESELECT')
        b.select_set(True)
        w.select_set(True)
        bpy.context.view_layer.objects.active = b
        bpy.ops.object.join()
        
        car = b
        car.name = result_name
        bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
        
        # Scale to realistic sedan dimensions (~3.5m length)
        cur_len = car.dimensions.y
        scale_fac = 3.4 / max(cur_len, 0.001)
        car.scale = (scale_fac, scale_fac, scale_fac)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        
        # Offset bottom contact flush to Z = 0 in local space
        min_z = min(v.co.z for v in car.data.vertices)
        for v in car.data.vertices:
            v.co.z -= min_z
        car.data.update()
        
        # 1. Sanitize materials to OPAQUE and apply deep clearcoat to car body
        for s in car.material_slots:
            if s.material and s.material.use_nodes:
                s.material.blend_method = 'OPAQUE'
                bsdf = s.material.node_tree.nodes.get('Principled BSDF')
                if bsdf:
                    bsdf.inputs['Specular IOR Level'].default_value = 0.60
                    bsdf.inputs['Coat Weight'].default_value = 0.95
                    bsdf.inputs['Coat Roughness'].default_value = 0.02

        # 2. Add Luxury Tinted Automotive Glass Material
        mat_glass = bpy.data.materials.new(f'Mat_Glass_{result_name}')
        mat_glass.use_nodes = True
        mat_glass.blend_method = 'OPAQUE'
        nodes = mat_glass.node_tree.nodes
        links = mat_glass.node_tree.links
        nodes.clear()
        
        bsdf_glass = nodes.new('ShaderNodeBsdfPrincipled')
        out_glass = nodes.new('ShaderNodeOutputMaterial')
        links.new(bsdf_glass.outputs['BSDF'], out_glass.inputs['Surface'])
        
        # Deep sapphire/obsidian tint with sky reflections
        bsdf_glass.inputs['Base Color'].default_value = (0.025, 0.045, 0.075, 1.0)
        bsdf_glass.inputs['Roughness'].default_value = 0.015
        bsdf_glass.inputs['Metallic'].default_value = 0.15
        bsdf_glass.inputs['Specular IOR Level'].default_value = 1.0
        bsdf_glass.inputs['IOR'].default_value = 1.52
        bsdf_glass.inputs['Coat Weight'].default_value = 1.0
        bsdf_glass.inputs['Coat Roughness'].default_value = 0.005
        
        car.data.materials.append(mat_glass)
        glass_slot_idx = len(car.data.materials) - 1
        
        # 3. Assign glass faces across windshield, rear window, and side windows
        bm = bmesh.new()
        bm.from_mesh(car.data)
        for f in bm.faces:
            c = f.calc_center_median()
            n = f.normal
            area = f.calc_area()
            is_front_rear = (c.z >= 0.70 and abs(n.y) >= 0.08 and n.z <= 0.99 and area > 0.003)
            is_side = (c.z >= 0.70 and abs(n.x) >= 0.70 and area > 0.003)
            if is_front_rear or is_side:
                f.material_index = glass_slot_idx
        bm.to_mesh(car.data)
        bm.free()
        car.data.update()
                        
        return car
        
    car1 = extract_and_join('sedan_body.002_sedan_red_0', 'sedan_wheel.002_sedan_red_0', 'Car_Red_Sedan')
    car2 = extract_and_join('sedan_body_sedan_white_0', 'sedan_wheel_sedan_white_0', 'Car_White_Hatch')
    
    # Clean up other unneeded meshes from vehicle pack
    for o in list(bpy.data.objects):
        if any(k in o.name for k in ['sedan', 'pickup', 'btr', 'van', 'Sketchfab', 'RootNode']) and o not in [car1, car2]:
            try:
                bpy.data.objects.remove(o, do_unlink=True)
            except Exception:
                pass
                
    return car1, car2

def configure_daylight_walk_stage():
    """Builds a vibrant urban streetscape with modern architecture, paved sidewalks, and passing traffic."""
    print("☀️ Configuring Daylight Walk (True Tracking Dolly, City Street HDRI, Urban Architecture)...")

    purge_claude()
    purge_indoor_room()

    for name in ['Env_Walk', 'Env_Road', 'Env_Lawn', 'Env_Curb', 'Car_Red_Sedan', 'Car_White_Hatch']:
        o = bpy.data.objects.get(name)
        if o:
            bpy.data.objects.remove(o, do_unlink=True)

    for o in list(bpy.data.objects):
        if any(k in o.name for k in ['Env_Building', 'Env_Tree', 'Env_Road', 'Env_Sidewalk', 'Env_Storm', 'Env_Curb', 'Env_Lamp']):
            bpy.data.objects.remove(o, do_unlink=True)

    # 1. Poly Haven Urban Street HDRI Sky World
    world = bpy.context.scene.world or bpy.data.worlds.new('HDRI_World')
    bpy.context.scene.world = world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    links = world.node_tree.links
    nodes.clear()

    node_bg = nodes.new(type='ShaderNodeBackground')
    node_out = nodes.new(type='ShaderNodeOutputWorld')
    node_env = nodes.new(type='ShaderNodeTexEnvironment')

    hdri_path = r"D:\New folder (2)\blender_engine\assets\hdri\wide_street_01_1k.hdr"
    if not os.path.exists(hdri_path):
        hdri_path = r"D:\New folder (2)\scratch\assets_cache\wide_street_01_1k.hdr"
    if not os.path.exists(hdri_path):
        hdri_path = r"D:\New folder (2)\blender_engine\assets\hdri\urban_street_01_1k.hdr"
    if not os.path.exists(hdri_path):
        hdri_path = r"D:\New folder (2)\scratch\assets_cache\urban_street_01_1k.hdr"
    if not os.path.exists(hdri_path):
        hdri_path = r"D:\New folder (2)\blender_engine\assets\hdri\stuttgart_suburbs_1k.hdr"

    if os.path.exists(hdri_path):
        node_env.image = bpy.data.images.load(hdri_path)
        links.new(node_env.outputs['Color'], node_bg.inputs['Color'])
        node_bg.inputs['Strength'].default_value = 1.10

    links.new(node_bg.outputs['Background'], node_out.inputs['Surface'])

    # 2. Golden Outdoor Sun
    sun = bpy.data.objects.get('Outdoor_Sun')
    if not sun:
        bpy.ops.object.light_add(type='SUN', location=(-8.0, -10.0, 15.0))
        sun = bpy.context.active_object
        sun.name = 'Outdoor_Sun'
    sun.data.energy = 4.2
    sun.data.color = (1.0, 0.98, 0.94)
    sun.rotation_euler = (math.radians(52), math.radians(20), math.radians(38))

    # 3. Sidewalk (Light grey concrete paver, surface flush at Z = 0.00m, spans X = -0.80m to X = +0.38m)
    mat_walk = create_mat('Mat_Sidewalk_Paver', (0.80, 0.82, 0.84, 1.0), roughness=0.75)
    bpy.ops.mesh.primitive_cube_add(location=(-0.21, -10.0, -0.05))
    walk = bpy.context.active_object
    walk.name = 'Env_Walk'
    walk.scale = (0.59, 45.0, 0.05)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    walk.data.materials.append(mat_walk)

    # Sidewalk Expansion Joint Grooves
    mat_joint = create_mat('Mat_Sidewalk_Joint', (0.45, 0.47, 0.50, 1.0), roughness=0.9)
    for y_joint in range(20, -42, -2):
        bpy.ops.mesh.primitive_cube_add(location=(-0.21, y_joint, 0.001))
        joint = bpy.context.active_object
        joint.name = f'Env_Sidewalk_Joint_{y_joint}'
        joint.scale = (0.59, 0.015, 0.002)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        joint.data.materials.append(mat_joint)

    # 4. Beveled Concrete Curb (Separating sidewalk from road at X = 0.40m)
    mat_curb = create_mat('Mat_Street_Curb', (0.70, 0.72, 0.75, 1.0), roughness=0.7)
    bpy.ops.mesh.primitive_cube_add(location=(0.40, -10.0, -0.02))
    curb = bpy.context.active_object
    curb.name = 'Env_Curb'
    curb.scale = (0.04, 45.0, 0.02)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    curb.data.materials.append(mat_curb)

    # 5. Asphalt Road (Dark textured asphalt, surface at Z = -0.04m, spans X = 0.44m to X = 3.00m)
    mat_road = create_mat('Mat_Road_Asphalt', (0.13, 0.14, 0.16, 1.0), roughness=0.85)
    bpy.ops.mesh.primitive_cube_add(location=(1.72, -10.0, -0.09))
    road = bpy.context.active_object
    road.name = 'Env_Road'
    road.scale = (1.28, 45.0, 0.05)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    road.data.materials.append(mat_road)

    # 6. Road Markings: Solid White Shoulder Line (X = 0.52m)
    mat_line_white = create_mat('Mat_Road_White_Line', (0.95, 0.95, 0.95, 1.0), roughness=0.4)
    bpy.ops.mesh.primitive_cube_add(location=(0.52, -10.0, -0.038))
    shoulder = bpy.context.active_object
    shoulder.name = 'Env_Road_Shoulder_Line'
    shoulder.scale = (0.04, 45.0, 0.002)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    shoulder.data.materials.append(mat_line_white)

    # Road Markings: Dashed Center Divider Line (X = 1.48m)
    mat_line_yellow = create_mat('Mat_Road_Yellow_Line', (0.95, 0.78, 0.12, 1.0), roughness=0.4)
    for y_dash in range(18, -44, -5):
        bpy.ops.mesh.primitive_cube_add(location=(1.48, y_dash, -0.038))
        dash = bpy.context.active_object
        dash.name = f'Env_Road_Divider_{y_dash}'
        dash.scale = (0.04, 1.25, 0.002)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        dash.data.materials.append(mat_line_yellow)

    # Storm Drain Grates along Gutter
    mat_grate = create_mat('Mat_Storm_Grate', (0.06, 0.06, 0.08, 1.0), roughness=0.4, metallic=0.9)
    for y_grate in [8, -6, -20, -34]:
        bpy.ops.mesh.primitive_cube_add(location=(0.52, y_grate, -0.037))
        grate = bpy.context.active_object
        grate.name = f'Env_Storm_Grate_{y_grate}'
        grate.scale = (0.06, 0.40, 0.003)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        grate.data.materials.append(mat_grate)

    # 7. Modern Streetscape Architecture along Sidewalk (Left side: X = -0.85m to X = -2.5m)
    mat_facade_cafe = create_mat('Mat_Facade_Cafe', (0.24, 0.14, 0.10, 1.0), roughness=0.8)
    mat_facade_modern = create_mat('Mat_Facade_Modern', (0.16, 0.20, 0.26, 1.0), roughness=0.7)
    mat_facade_cream = create_mat('Mat_Facade_Cream', (0.86, 0.84, 0.80, 1.0), roughness=0.85)
    mat_glass_display = create_mat('Mat_Storefront_Glass', (0.85, 0.92, 0.98, 0.35), roughness=0.1, metallic=0.2)
    mat_warm_interior = create_mat('Mat_Store_Interior', (1.0, 0.85, 0.60, 1.0), emission_color=(1.0, 0.85, 0.60, 1.0), emission_strength=2.2)
    mat_awning_navy = create_mat('Mat_Awning_Navy', (0.10, 0.16, 0.28, 1.0), roughness=0.6)
    mat_awning_terracotta = create_mat('Mat_Awning_Terracotta', (0.75, 0.30, 0.15, 1.0), roughness=0.6)
    mat_trim = create_mat('Mat_Storefront_Trim', (0.08, 0.09, 0.11, 1.0), roughness=0.3, metallic=0.8)

    building_configs = [
        {"y": 14.0, "len": 12.0, "mat": mat_facade_cafe, "awning": mat_awning_terracotta, "height": 6.5},
        {"y": 1.0,  "len": 14.0, "mat": mat_facade_modern, "awning": mat_awning_navy, "height": 7.5},
        {"y": -14.0, "len": 14.0, "mat": mat_facade_cream, "awning": mat_awning_terracotta, "height": 6.8},
        {"y": -28.0, "len": 14.0, "mat": mat_facade_modern, "awning": mat_awning_navy, "height": 7.2},
    ]

    for b_idx, b in enumerate(building_configs):
        by = b["y"]
        blen = b["len"] * 0.5
        bh = b["height"] * 0.5
        
        # Main Building Facade Wall (X = -1.75m, front edge at X = -0.85m)
        bpy.ops.mesh.primitive_cube_add(location=(-1.75, by, bh))
        b_wall = bpy.context.active_object
        b_wall.name = f"Env_Building_{b_idx}_Wall"
        b_wall.scale = (0.90, blen, bh)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        b_wall.data.materials.append(b["mat"])

        # Large Retail / Cafe Display Window
        bpy.ops.mesh.primitive_cube_add(location=(-0.84, by, 1.40))
        win = bpy.context.active_object
        win.name = f"Env_Building_{b_idx}_Window"
        win.scale = (0.02, blen * 0.65, 0.85)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        win.data.materials.append(mat_glass_display)

        # Warm Illuminated Store Interior Plane
        bpy.ops.mesh.primitive_cube_add(location=(-0.90, by, 1.40))
        glow = bpy.context.active_object
        glow.name = f"Env_Building_{b_idx}_Glow"
        glow.scale = (0.01, blen * 0.60, 0.80)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        glow.data.materials.append(mat_warm_interior)

        # Canvas Awning
        bpy.ops.mesh.primitive_cube_add(location=(-0.68, by, 2.35))
        awning = bpy.context.active_object
        awning.name = f"Env_Building_{b_idx}_Awning"
        awning.scale = (0.16, blen * 0.70, 0.04)
        awning.rotation_euler = (0, math.radians(-14), 0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        awning.data.materials.append(b["awning"])

        # Upper floor windows
        for wy in [by - (blen * 0.45), by + (blen * 0.45)]:
            for wz in [3.8, 5.5]:
                if wz < b["height"]:
                    bpy.ops.mesh.primitive_cube_add(location=(-0.84, wy, wz))
                    u_win = bpy.context.active_object
                    u_win.name = f"Env_Building_{b_idx}_UpperWin_{wy}_{wz}"
                    u_win.scale = (0.02, 0.55, 0.60)
                    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
                    u_win.data.materials.append(mat_trim)

    # 8. Load Real Stylized Sedans
    car1, car2 = load_stylized_street_sedans()
    if not car1:
        car1 = build_stylized_car('Car_Red_Sedan', (0.85, 0.15, 0.18, 1.0))
    if not car2:
        car2 = build_stylized_car('Car_White_Hatch', (0.92, 0.94, 0.96, 1.0))

    if car1:
        car1.location = (1.15, 2.50, -0.04)
        car1.rotation_euler = (0, 0, math.pi)
    if car2:
        car2.location = (1.95, 8.50, -0.04)
        car2.rotation_euler = (0, 0, 0)

    # Human Lower Body: Dark Denim Jeans & Sneakers
    human = bpy.data.objects.get('Human_Avatar')
    ensure_human_lower_body(human)

# =========================================================================
# STAGE 2: LATE-NIGHT DESK (3:00 AM CYBERPUNK SANCTUARY)
# =========================================================================

def configure_latenight_desk_stage():
    """Converts the master stage into a cozy 3:14 AM coding sanctuary with real indoor room geometry."""
    print("🌙 Configuring Late-Night Desk Environment (3:00 AM Midnight Mood)...")

    purge_claude()
    purge_indoor_room()

    # 1. World Environment: Deep dark midnight ambient tone
    world = bpy.context.scene.world or bpy.data.worlds.new('Midnight_World')
    bpy.context.scene.world = world
    world.use_nodes = True
    tree = world.node_tree
    for n in list(tree.nodes):
        tree.nodes.remove(n)

    node_out = tree.nodes.new(type='ShaderNodeOutputWorld')
    node_bg = tree.nodes.new(type='ShaderNodeBackground')
    node_bg.inputs['Color'].default_value = (0.02, 0.02, 0.04, 1.0)
    node_bg.inputs['Strength'].default_value = 0.35
    tree.links.new(node_bg.outputs['Background'], node_out.inputs['Surface'])

    # 2. Indoor Room Floor (Dark Wood Planks)
    mat_floor = create_mat("Mat_Midnight_Floor", hex_to_linear("#0F131A"), roughness=0.75)
    bpy.ops.mesh.primitive_plane_add(location=(0.0, 0.0, 0.0), size=25.0)
    floor = bpy.context.active_object
    floor.name = "Floor"
    floor.data.materials.append(mat_floor)

    # 3. Solid Interior Back Wall (Deep matte midnight charcoal/navy drywall at Y = 2.25m)
    mat_wall = create_mat("Mat_Midnight_BackWall", hex_to_linear("#161922"), roughness=0.92)
    bpy.ops.mesh.primitive_plane_add(location=(0.0, 2.25, 1.80))
    wall = bpy.context.active_object
    wall.name = "BackWall"
    wall.scale = (8.0, 1.0, 2.5)
    wall.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wall.data.materials.append(mat_wall)

    # 4. Modern Acoustic Oak Wood Slats on the left (behind Gemini)
    mat_slat = create_mat("Mat_Midnight_WoodSlat", (0.45, 0.32, 0.18, 1.0), roughness=0.55)
    for i, sx in enumerate([-1.25, -1.15, -1.05, -0.95, -0.85, -0.75, -0.65, -0.55]):
        bpy.ops.mesh.primitive_cube_add(location=(sx, 2.22, 1.75))
        slat = bpy.context.active_object
        slat.name = f"Acoustic_Slat_{i}"
        slat.scale = (0.025, 0.012, 1.75)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        slat.data.materials.append(mat_slat)

    # 5. Night Window Frame on Right (subtle ambient city bokeh in deep night glass)
    mat_night_glass = create_mat("Mat_Night_Window_Glass", (0.04, 0.06, 0.12, 1.0), roughness=0.15, metallic=0.2, emission_color=(0.02, 0.04, 0.08), emission_strength=0.5)
    bpy.ops.mesh.primitive_cube_add(location=(0.95, 2.23, 1.85))
    window = bpy.context.active_object
    window.name = "Indoor_Window"
    window.scale = (0.45, 0.015, 0.65)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    window.data.materials.append(mat_night_glass)

    # 6. Dark wooden desk with surface at Z = 0.88m
    mat_desk = create_mat("Mat_Midnight_Desk", hex_to_linear("#1E293B"), roughness=0.35, metallic=0.2)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 0.50, 0.44))
    desk = bpy.context.active_object
    desk.name = "Desk_Surface"
    desk.scale = (1.10, 0.28, 0.44)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    desk.data.materials.append(mat_desk)

    # 7. Real 3D Stylized Laptop from Sketchfab
    laptop_path = r"D:\New folder (2)\assets\downloads\stylized_laptop_d55ed81f\stylized_laptop.glb"
    if os.path.exists(laptop_path):
        import auto_prop_manager
        auto_prop_manager.import_and_normalize_prop(
            laptop_path,
            prop_name="Stylized_Laptop",
            category="electronic",
            target_height=0.18,
            target_location=(0.02, 0.42, 0.88),
            target_rotation=(0, 0, 180),
            snap_surface_z=0.88
        )

    # 8. Coffee Cup on desk next to laptop
    cup_path = r"D:\New folder (2)\assets\downloads\coffee_cup_low_poly_e1ba83d0\coffee_cup_low_poly.glb"
    if os.path.exists(cup_path):
        import auto_prop_manager
        auto_prop_manager.import_and_normalize_prop(
            cup_path,
            prop_name="Desk_Coffee_Cup",
            category="table_prop",
            target_height=0.08,
            target_location=(0.33, 0.46, 0.88),
            snap_surface_z=0.88
        )

    # 9. LED Digital Clock (3:14 AM)
    clock_mat = create_mat("Mat_Clock_Body", hex_to_linear("#0F172A"), roughness=0.4)
    led_red_mat = create_mat("Mat_LED_Red", hex_to_linear("#EF4444"), emission_color=hex_to_linear("#EF4444"), emission_strength=4.0)

    bpy.ops.mesh.primitive_cube_add(location=(-0.45, 0.52, 0.915))
    clock = bpy.context.active_object
    clock.name = "Env_Clock_Body"
    clock.scale = (0.07, 0.035, 0.035)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    clock.data.materials.append(clock_mat)

    bpy.ops.mesh.primitive_plane_add(location=(-0.45, 0.484, 0.915), rotation=(math.radians(90), 0, 0))
    led = bpy.context.active_object
    led.name = "Env_Clock_LED"
    led.scale = (0.05, 0.02, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    led.data.materials.append(led_red_mat)
    set_parent(led, clock)

    # 10. Warm 3 AM Incandescent Lighting Rig
    # A. Desk Lamp Warm Amber Cone (Incandescent 2700K)
    bpy.ops.object.light_add(type='SPOT', location=(-0.45, 0.48, 1.35))
    desk_lamp = bpy.context.active_object
    desk_lamp.name = "Light_Desk_Lamp_Spot"
    desk_lamp.data.energy = 45.0
    desk_lamp.data.color = (1.0, 0.68, 0.28) # Warm amber 2700K
    desk_lamp.data.spot_size = math.radians(65)
    desk_lamp.data.spot_blend = 0.45
    desk_lamp.rotation_euler = (math.radians(-25), math.radians(20), 0)

    # B. Soft Cool Cyan Laptop Screen Fill
    bpy.ops.object.light_add(type='POINT', location=(0.0, 0.45, 1.05))
    screen_light = bpy.context.active_object
    screen_light.name = "Light_Screen_Glow"
    screen_light.data.energy = 16.0
    screen_light.data.color = (0.35, 0.78, 1.0)

    # C. Soft Warm Rim Accent (Subtle edge separation, not blinding)
    bpy.ops.object.light_add(type='POINT', location=(0.4, 1.7, 2.2))
    rim = bpy.context.active_object
    rim.name = "Light_Rim_Back"
    rim.data.energy = 32.0
    rim.data.color = (1.0, 0.60, 0.25)

    # D. Soft Dedicated Front Fill for Gemini (Ensures both eyes, snout & tentacles are never half-dark)
    bpy.ops.object.light_add(type='POINT', location=(-0.48, -0.20, 1.40))
    gemini_fill = bpy.context.active_object
    gemini_fill.name = "Light_Gemini_Front_Fill"
    gemini_fill.data.energy = 22.0
    gemini_fill.data.color = (0.60, 0.78, 1.0)
    if hasattr(gemini_fill.data, 'shadow_soft_size'):
        gemini_fill.data.shadow_soft_size = 0.35

    # E. Soft Ambient Fill for Dev (Prevents pitch black shadows on neck and left cheek)
    bpy.ops.object.light_add(type='POINT', location=(0.40, -0.20, 1.45))
    dev_fill = bpy.context.active_object
    dev_fill.name = "Light_Dev_Front_Fill"
    dev_fill.data.energy = 14.0
    dev_fill.data.color = (1.0, 0.88, 0.75)
    if hasattr(dev_fill.data, 'shadow_soft_size'):
        dev_fill.data.shadow_soft_size = 0.35

# =========================================================================
# STAGE 3: COZY CAFE CORNER (WARM EDISON LIGHTS, WOODEN COUNTER)
# =========================================================================

def create_pbr_material(name, diff_path, rough_path=None, nor_path=None, uv_scale=(1.0, 1.0)):
    """Creates a Principled BSDF PBR material with automatic texture mapping."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])

    node_tex_coord = nodes.new(type='ShaderNodeTexCoord')
    node_mapping = nodes.new(type='ShaderNodeMapping')
    node_mapping.inputs['Scale'].default_value = (uv_scale[0], uv_scale[1], 1.0)
    links.new(node_tex_coord.outputs['Generated'], node_mapping.inputs['Vector'])

    if diff_path and os.path.exists(diff_path):
        tex_diff = nodes.new(type='ShaderNodeTexImage')
        tex_diff.image = bpy.data.images.load(diff_path)
        links.new(node_mapping.outputs['Vector'], tex_diff.inputs['Vector'])
        links.new(tex_diff.outputs['Color'], node_bsdf.inputs['Base Color'])

    if rough_path and os.path.exists(rough_path):
        tex_rough = nodes.new(type='ShaderNodeTexImage')
        tex_rough.image = bpy.data.images.load(rough_path)
        tex_rough.image.colorspace_settings.name = 'Non-Color'
        links.new(node_mapping.outputs['Vector'], tex_rough.inputs['Vector'])
        links.new(tex_rough.outputs['Color'], node_bsdf.inputs['Roughness'])
    else:
        node_bsdf.inputs['Roughness'].default_value = 0.5

    if nor_path and os.path.exists(nor_path):
        tex_nor = nodes.new(type='ShaderNodeTexImage')
        tex_nor.image = bpy.data.images.load(nor_path)
        tex_nor.image.colorspace_settings.name = 'Non-Color'
        node_norm_map = nodes.new(type='ShaderNodeNormalMap')
        node_norm_map.inputs['Strength'].default_value = 0.70
        links.new(node_mapping.outputs['Vector'], tex_nor.inputs['Vector'])
        links.new(tex_nor.outputs['Color'], node_norm_map.inputs['Color'])
        links.new(node_norm_map.outputs['Normal'], node_bsdf.inputs['Normal'])

    return mat

def configure_cafe_corner_stage():
    """Builds a warm, authentic 3D coffee shop interior using verified PBR and Sketchfab assets."""
    print("☕ Configuring Cozy Cafe Corner Environment with Verified 3D Assets...")

    purge_claude()
    purge_indoor_room()

    # Clear previous cafe test objects
    for obj_name in list(bpy.data.objects.keys()):
        if any(k in obj_name for k in ['Cafe_', 'Menu_', 'Stool', 'Table', 'Espresso', 'Shelf', 'Pendant', 'Wall_']):
            try:
                bpy.data.objects.remove(bpy.data.objects[obj_name], do_unlink=True)
            except Exception:
                pass

    # 1. Poly Haven Comfy Cafe HDRI for Realistic 360 Warm Environment & Reflections
    world = bpy.context.scene.world or bpy.data.worlds.new('Cafe_World')
    bpy.context.scene.world = world
    world.use_nodes = True
    tree = world.node_tree
    tree.nodes.clear()

    node_bg = tree.nodes.new(type='ShaderNodeBackground')
    node_bg.inputs['Strength'].default_value = 0.75

    node_env = tree.nodes.new(type='ShaderNodeTexEnvironment')
    hdr_path = r"D:\New folder (2)\scratch\assets_cache\comfy_cafe_1k.hdr"
    if os.path.exists(hdr_path):
        node_env.image = bpy.data.images.load(hdr_path)

    node_output = tree.nodes.new(type='ShaderNodeOutputWorld')
    tree.links.new(node_env.outputs['Color'], node_bg.inputs['Color'])
    tree.links.new(node_bg.outputs['Background'], node_output.inputs['Surface'])

    # 2. Floor: Poly Haven Brown Planks PBR Wood
    floor_diff = r"D:\New folder (2)\scratch\assets_cache\brown_planks_04\brown_planks_04_diff_1k.jpg"
    floor_rough = r"D:\New folder (2)\scratch\assets_cache\brown_planks_04\brown_planks_04_rough_1k.jpg"
    floor_nor = r"D:\New folder (2)\scratch\assets_cache\brown_planks_04\brown_planks_04_nor_gl_1k.jpg"
    mat_floor = create_pbr_material("Cafe_PBR_Floor", floor_diff, floor_rough, floor_nor, uv_scale=(6.0, 6.0))

    bpy.ops.mesh.primitive_plane_add(size=12.0, location=(0.0, 1.0, 0.0))
    floor = bpy.context.active_object
    floor.name = "Cafe_Floor"
    floor.data.materials.append(mat_floor)

    # 3. Back Wall: Poly Haven Brick Wall 005 PBR (Warm Artisanal Cafe Brick)
    wall_diff = r"D:\New folder (2)\scratch\assets_cache\brick_wall_005\brick_wall_005_diff_1k.jpg"
    wall_rough = r"D:\New folder (2)\scratch\assets_cache\brick_wall_005\brick_wall_005_rough_1k.jpg"
    wall_nor = r"D:\New folder (2)\scratch\assets_cache\brick_wall_005\brick_wall_005_nor_gl_1k.jpg"
    mat_brick = create_pbr_material("Cafe_PBR_BrickWall", wall_diff, wall_rough, wall_nor, uv_scale=(3.5, 2.2))

    bpy.ops.mesh.primitive_plane_add(size=8.0, location=(0.0, 2.50, 2.20))
    wall = bpy.context.active_object
    wall.name = "Cafe_BackWall"
    wall.rotation_euler = (math.radians(90), 0, 0)
    wall.scale = (1.5, 1.0, 1.0)
    wall.data.materials.append(mat_brick)

    # Dark Wooden Baseboard Trim
    mat_trim = create_mat("Cafe_Wall_Trim", (0.08, 0.05, 0.04, 1.0), roughness=0.40)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 2.48, 0.07))
    trim = bpy.context.active_object
    trim.name = "Cafe_Wall_Trim"
    trim.scale = (5.0, 0.03, 0.07)
    trim.data.materials.append(mat_trim)

    # 4. Sketchfab 3D Coffee Menu Board (Authentic chalkboard typography, facing camera)
    menu_path = r"D:\New folder (2)\assets\downloads\coffee_menu_board_b43ab23e\coffee_menu_board.glb"
    if os.path.exists(menu_path):
        before = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=menu_path)
        new_objs = set(bpy.data.objects) - before
        menu_mesh = bpy.data.objects.get('Menu_Menu_0')
        if menu_mesh:
            parent = menu_mesh.parent
            menu_mesh.parent = None
            while parent:
                p_next = parent.parent
                bpy.data.objects.remove(parent, do_unlink=True)
                parent = p_next

            from mathutils import Matrix
            mat_rot = Euler((math.radians(-90), 0, 0)).to_matrix().to_4x4()
            mat_loc = Matrix.Translation(Vector((0.62, 2.44, 1.82)))
            mat_scale = Matrix.Diagonal(Vector((0.55, 0.55, 0.55, 1.0)))
            menu_mesh.matrix_world = mat_loc @ mat_rot @ mat_scale
            print("☕ Appended 3D Coffee Menu Board to brick wall facing camera")

    # 5. Side Espresso Bar Counter with Rich Wood Textures & Vintage Espresso Machine
    mat_counter_top = create_mat("Cafe_Espresso_Counter_Top", (0.28, 0.16, 0.09, 1.0), roughness=0.30)
    mat_counter_base = create_mat("Cafe_Espresso_Counter_Base", (0.06, 0.05, 0.05, 1.0), roughness=0.65)

    # Base Cabinet
    bpy.ops.mesh.primitive_cube_add(location=(1.05, 1.30, 0.44))
    side_base = bpy.context.active_object
    side_base.name = "Cafe_SideBar_Base"
    side_base.scale = (0.40, 0.82, 0.44)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    side_base.data.materials.append(mat_counter_base)

    # Top Wooden Counter Slab
    bpy.ops.mesh.primitive_cube_add(location=(1.03, 1.30, 0.92))
    side_top = bpy.context.active_object
    side_top.name = "Cafe_SideBar_Top"
    side_top.scale = (0.44, 0.86, 0.04)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    side_top.data.materials.append(mat_counter_top)

    # Brass foot rail on side bar
    mat_brass = create_mat("Cafe_Brass_Rail", (0.85, 0.65, 0.22, 1.0), roughness=0.25, metallic=0.90)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.02, depth=1.65, vertices=16, location=(0.62, 1.30, 0.18))
    rail = bpy.context.active_object
    rail.name = "Cafe_Brass_Rail"
    rail.rotation_euler = (math.radians(90), 0, 0)
    rail.data.materials.append(mat_brass)

    # Stylized Vintage Espresso Machine on Counter
    machine_path = r"D:\New folder (2)\assets\downloads\stylized_vintage_coffee_machine_f04cee3f\stylized_vintage_coffee_machine.glb"
    if os.path.exists(machine_path):
        try:
            before = set(bpy.data.objects)
            bpy.ops.import_scene.gltf(filepath=machine_path)
            new_objs = set(bpy.data.objects) - before
            m_root = bpy.data.objects.new("EspressoMachine_Root", None)
            bpy.context.collection.objects.link(m_root)
            for o in new_objs:
                if o.parent is None or o.parent not in new_objs:
                    o.parent = m_root
            m_root.location = (0.92, 1.15, 0.96)
            m_root.rotation_euler = (0, 0, math.radians(-32))
            m_root.scale = (0.62, 0.62, 0.62)
            print("☕ Appended Vintage Espresso Machine to sidebar")
        except Exception as e:
            print(f"⚠️ Espresso machine warning: {e}")

    # 6. High Quality 4K Bistro Table & Barstools (Sketchfab)
    gltf_table_stool = r"D:\New folder (2)\assets\downloads\cafe_table_and_stools_95c4acc3\cafe_table_and_stools.glb"
    if os.path.exists(gltf_table_stool):
        before = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=gltf_table_stool)
        new_objs = set(bpy.data.objects) - before

        stool1 = bpy.data.objects.get('cafe_stool_1')
        stool2 = bpy.data.objects.get('cafe_stool_2')
        table = bpy.data.objects.get('cafe_table')

        # Stool 1 (Directly under Human Avatar at Y=0.82)
        if stool1:
            stool1.location = (0.0, 82.0, 84.4179) # In FBX cm coords

        # Stool 2 (Secondary stool on the left for natural depth)
        if stool2:
            stool2.location = (-65.0, 32.0, 84.4179)

        # High Bistro Table (Centered in front of Human at Y=0.30)
        if table:
            table.location = (0.0, 30.0, 96.0) # Height Z=0.96m (ergonomic elbow level)
            t_mesh = bpy.data.objects.get('cafe_table_cafe_table_4k_0')
            if t_mesh:
                t_mesh.scale = (1.0, 0.86, 1.0)

        print("☕ Appended 4K PBR Bistro Table & Barstools")

    # 7. Sketchfab Cappuccino Cup on Table
    cup_path = r"D:\New folder (2)\assets\downloads\coffee_cup_low_poly_e1ba83d0\coffee_cup_low_poly.glb"
    if os.path.exists(cup_path):
        try:
            before = set(bpy.data.objects)
            bpy.ops.import_scene.gltf(filepath=cup_path)
            new_objs = set(bpy.data.objects) - before
            cap_objs = [o for o in new_objs if 'cappuccino' in o.name.lower()]
            for o in new_objs:
                if o not in cap_objs:
                    bpy.data.objects.remove(o, do_unlink=True)
            cup_root = bpy.data.objects.new('Cappuccino_Root', None)
            bpy.context.collection.objects.link(cup_root)
            for o in cap_objs:
                if o.parent is None or o.parent not in cap_objs:
                    o.parent = cup_root
            cup_root.location = (0.08, 0.28, 0.96) # Flush on table surface!
            cup_root.scale = (0.016, 0.016, 0.016)
            print("☕ Appended Cappuccino Cup with Latte Art on table")
        except Exception as e:
            print(f"⚠️ Cup warning: {e}")

    # 8. Human Lower Body Anatomical Barstool Rig (Jeans & Sneakers resting flush on footrest)
    human = bpy.data.objects.get('Human_Avatar')
    if human:
        human.location = (0.0, 0.0, 0.0)
        ensure_human_lower_body(human, is_seated=True, is_barstool=True)

    # 9. Hanging Brass Edison Pendant Lamps
    mat_pendant_cord = create_mat("Cafe_Lamp_Cord", (0.05, 0.05, 0.05, 1.0), roughness=0.8)
    mat_pendant_brass = create_mat("Cafe_Lamp_Brass", (0.85, 0.65, 0.25, 1.0), roughness=0.25, metallic=0.9)
    mat_filament = create_mat("Cafe_Filament_Glow", (1.0, 0.70, 0.30, 1.0), emission_color=(1.0, 0.75, 0.35, 1.0), emission_strength=12.0)

    for px, py in [(0.0, 0.25), (0.90, 1.25)]:
        # Cord
        bpy.ops.mesh.primitive_cylinder_add(radius=0.006, depth=1.0, vertices=12, location=(px, py, 2.90))
        cord = bpy.context.active_object
        cord.name = f"Cafe_Cord_{px}"
        cord.data.materials.append(mat_pendant_cord)

        # Brass Shade
        bpy.ops.mesh.primitive_cone_add(radius1=0.14, radius2=0.04, depth=0.10, vertices=24, location=(px, py, 2.40))
        shade = bpy.context.active_object
        shade.name = f"Cafe_Shade_{px}"
        shade.data.materials.append(mat_pendant_brass)

        # Bulb / Filament
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.04, location=(px, py, 2.35))
        bulb = bpy.context.active_object
        bulb.name = f"Cafe_Bulb_{px}"
        bulb.data.materials.append(mat_filament)

    # 10. Warm Cinematic Lighting Rig
    bpy.ops.object.light_add(type='POINT', location=(-0.85, -1.20, 2.30))
    l_key = bpy.context.active_object
    l_key.name = "Cafe_Key_Light"
    l_key.data.energy = 85.0
    l_key.data.shadow_soft_size = 0.40
    l_key.data.color = (1.0, 0.92, 0.80)

    bpy.ops.object.light_add(type='POINT', location=(1.10, -0.80, 2.00))
    l_fill = bpy.context.active_object
    l_fill.name = "Cafe_Fill_Light"
    l_fill.data.energy = 45.0
    l_fill.data.shadow_soft_size = 0.50
    l_fill.data.color = (0.95, 0.85, 0.72)

    bpy.ops.object.light_add(type='POINT', location=(0.0, 1.90, 2.60))
    l_rim = bpy.context.active_object
    l_rim.name = "Cafe_Rim_Light"
    l_rim.data.energy = 95.0
    l_rim.data.shadow_soft_size = 0.25
    l_rim.data.color = (1.0, 0.95, 0.86)

    bpy.ops.object.light_add(type='POINT', location=(0.0, 0.25, 2.34))
    l_pendant = bpy.context.active_object
    l_pendant.name = "Cafe_Table_Pendant"
    l_pendant.data.energy = 60.0
    l_pendant.data.shadow_soft_size = 0.30
    l_pendant.data.color = (1.0, 0.82, 0.52)

    bpy.ops.object.light_add(type='POINT', location=(0.90, 1.25, 2.34))
    l_esp_light = bpy.context.active_object
    l_esp_light.name = "Cafe_Espresso_Pendant"
    l_esp_light.data.energy = 45.0
    l_esp_light.data.shadow_soft_size = 0.30
    l_esp_light.data.color = (1.0, 0.82, 0.52)

# =========================================================================
# STAGE 4: NEON CYBERPUNK DATACENTER / SERVER ROOM
# =========================================================================

def configure_neon_datacenter_stage(daylight=True):
    """Builds a cinematic, pre-cooked AAA enterprise server room / datacenter using real textured 3D assets."""
    print(f"🖥️ Configuring Pre-Cooked Server Room ({'Daylight Enterprise IT Facility' if daylight else 'Neon Cyberpunk Server Room'})...")

    purge_claude()
    purge_indoor_room()

    import auto_prop_manager

    # 1. World Environment & Sky
    world = bpy.context.scene.world or bpy.data.worlds.new('Datacenter_World')
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get('Background')

    if daylight:
        # Crisp enterprise daylight ambient
        if bg:
            bg.inputs['Color'].default_value = (0.75, 0.82, 0.90, 1.0)
            bg.inputs['Strength'].default_value = 1.20

        # Sunlight streaming through high datacenter architectural vents
        bpy.ops.object.light_add(type='SUN', location=(-2.5, -2.0, 4.0))
        sun = bpy.context.active_object
        sun.name = "Data_Sun_Daylight"
        sun.data.energy = 4.5
        sun.data.color = (1.0, 0.96, 0.90)
        sun.rotation_euler = (math.radians(50), math.radians(15), math.radians(-30))

        # Soft character key light
        bpy.ops.object.light_add(type='POINT', location=(-0.8, -0.4, 1.8))
        key = bpy.context.active_object
        key.name = "Data_Key_Daylight"
        key.data.energy = 70.0
        key.data.color = (0.95, 0.98, 1.0)

        # Soft fill light
        bpy.ops.object.light_add(type='POINT', location=(0.8, -0.4, 1.6))
        fill = bpy.context.active_object
        fill.name = "Data_Fill_Daylight"
        fill.data.energy = 45.0
        fill.data.color = (0.85, 0.92, 1.0)

    else:
        # Dark Cyberpunk After-Hours Mood with moody neon reflections
        if bg:
            bg.inputs['Color'].default_value = (0.008, 0.015, 0.035, 1.0)
            bg.inputs['Strength'].default_value = 0.35

        bpy.ops.object.light_add(type='POINT', location=(-0.7, -0.4, 2.0))
        key = bpy.context.active_object
        key.name = "Data_Key_Cyan"
        key.data.energy = 75.0
        key.data.color = (0.22, 0.75, 1.0)

        bpy.ops.object.light_add(type='POINT', location=(0.7, -0.5, 1.8))
        mfill = bpy.context.active_object
        mfill.name = "Data_Fill_Magenta"
        mfill.data.energy = 48.0
        mfill.data.color = (0.85, 0.20, 0.95)

    # Dedicated soft front fill for flattering character faces (no harsh shadows)
    bpy.ops.object.light_add(type='POINT', location=(0.0, -1.0, 1.35))
    dfront = bpy.context.active_object
    dfront.name = "Data_Front_Soft_Fill"
    dfront.data.energy = 32.0
    dfront.data.color = (1.0, 0.98, 0.95)
    if hasattr(dfront.data, 'shadow_soft_size'):
        dfront.data.shadow_soft_size = 0.40

    # 2. AAA Pre-Cooked Server Room Enclosure (Full 25.4 MB architectural shell)
    room_glb = r"D:\New folder (2)\assets\downloads\server_room_enclosure_57a48059\server_room_enclosure.glb"
    if os.path.exists(room_glb):
        bpy.ops.import_scene.gltf(filepath=room_glb)
        room_root = None
        for obj in bpy.context.scene.objects:
            if ("Sketchfab_model" in obj.name or "Server Room" in obj.name) and obj.parent is None:
                room_root = obj
                break
        if room_root:
            room_root.name = "PreCooked_Server_Room_Root"
            room_root.scale = (0.55, 0.55, 0.55)
            room_root.location = (0.0, 1.8, 0.0)

        # Hide end walls and ceiling that clip with corridor walk cameras
        for obj in bpy.context.scene.objects:
            if any(k in obj.name.lower() for k in ['wall04', 'wall01', 'ceiling', 'door']):
                obj.hide_render = True
                obj.hide_viewport = True

    # 3. Authentic 42U Enterprise Datacenter Server Racks with Blinking Blue/Cyan Activity LEDs
    rack_glb = r"D:\New folder (2)\assets\downloads\server_racking_system_6fe2cacf\server_racking_system.glb"
    if os.path.exists(rack_glb):
        y_positions = [2.2, 0.2, -1.8, -3.8]
        for idx, y_pos in enumerate(y_positions):
            auto_prop_manager.import_and_normalize_prop(
                rack_glb,
                prop_name=f"Datacenter_Rack_L_{idx}",
                category="furniture",
                target_height=2.25,
                target_location=(-1.05, y_pos, 0.0),
                target_rotation=(0, 0, 10),
                snap_surface_z=0.0
            )
            auto_prop_manager.import_and_normalize_prop(
                rack_glb,
                prop_name=f"Datacenter_Rack_R_{idx}",
                category="furniture",
                target_height=2.25,
                target_location=(1.05, y_pos, 0.0),
                target_rotation=(0, 0, -10),
                snap_surface_z=0.0
            )

        # Ensure Gemini's character materials are completely non-emissive (restore soft natural shading)
        for mat_name in ['Mat_Antigravity_Blue_Skin', 'Mat_Antigravity_Sky_Belly']:
            m = bpy.data.materials.get(mat_name)
            if m and m.use_nodes:
                bsdf = m.node_tree.nodes.get("Principled BSDF")
                if bsdf and 'Emission Strength' in bsdf.inputs:
                    bsdf.inputs['Emission Strength'].default_value = 0.0
                if bsdf:
                    bsdf.inputs['Roughness'].default_value = 0.45

        # Boost emission ONLY on the actual server rack LED activity strips and link lights
        for mat in bpy.data.materials:
            if any(k in mat.name.lower() for k in ['antigravity', 'popapus', 'human', 'orb', 'eye', 'belly', 'skin']):
                continue
            if any(k in mat.name.lower() for k in ['light', 'led', 'glow']):
                if mat.use_nodes:
                    bsdf = mat.node_tree.nodes.get("Principled BSDF")
                    if bsdf:
                        if 'Emission Strength' in bsdf.inputs:
                            bsdf.inputs['Emission Strength'].default_value = 8.0
                        if 'Emission Color' in bsdf.inputs:
                            bsdf.inputs['Emission Color'].default_value = (0.15, 0.75, 1.0, 1.0)

    # 4. Attach Full Standing Legs & Sneakers to Human Avatar (100% physically grounded)
    human = bpy.data.objects.get('Human_Avatar')
    if human:
        human.location = (0.0, 0.0, 0.0)
        ensure_human_lower_body(human, is_seated=False)

# =========================================================================
# STAGE 5: SUNNY BOTANICAL PARK & GARDEN
# =========================================================================

def configure_park_garden_stage():
    """Builds a vibrant sunny botanical park with autumn trees, winding stone path, and a wooden bench."""
    print("🌳 Configuring Sunny Botanical Park & Garden Environment...")

    purge_claude()
    purge_indoor_room()

    # 1. Poly Haven Autumn Park 360 HDRI
    world = bpy.context.scene.world or bpy.data.worlds.new('Park_World')
    bpy.context.scene.world = world
    world.use_nodes = True
    tree = world.node_tree
    tree.nodes.clear()

    node_bg = tree.nodes.new(type='ShaderNodeBackground')
    node_bg.inputs['Strength'].default_value = 1.05

    node_env = tree.nodes.new(type='ShaderNodeTexEnvironment')
    hdr_path = r"D:\New folder (2)\scratch\assets_cache\autumn_park_1k.hdr"
    if not os.path.exists(hdr_path):
        import polyhaven_connector
        hdr_path = polyhaven_connector.fetch_hdri_for_theme("park")

    if os.path.exists(hdr_path):
        node_env.image = bpy.data.images.load(hdr_path)
        tree.links.new(node_env.outputs['Color'], node_bg.inputs['Color'])

    node_output = tree.nodes.new(type='ShaderNodeOutputWorld')
    tree.links.new(node_bg.outputs['Background'], node_output.inputs['Surface'])

    # 2. Golden Outdoor Sunlight
    bpy.ops.object.light_add(type='SUN', location=(-5.0, -8.0, 12.0))
    sun = bpy.context.active_object
    sun.name = 'Park_Sun'
    sun.data.energy = 4.5
    sun.data.color = (1.0, 0.96, 0.90)
    sun.rotation_euler = (math.radians(52), math.radians(18), math.radians(35))

    # 3. Soft Green Lawn Ground
    mat_grass = create_mat("Mat_Park_Lawn", (0.18, 0.52, 0.16, 1.0), roughness=0.88)
    bpy.ops.mesh.primitive_plane_add(location=(0.0, 0.0, 0.0), size=40.0)
    lawn = bpy.context.active_object
    lawn.name = "Park_Lawn"
    lawn.data.materials.append(mat_grass)

    # 4. Cobblestone / Gravel Walking Path
    mat_path = create_mat("Mat_Park_Path", (0.72, 0.68, 0.62, 1.0), roughness=0.85)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 0.50, 0.02))
    path_mesh = bpy.context.active_object
    path_mesh.name = "Park_Path"
    path_mesh.scale = (1.40, 20.0, 0.02)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    path_mesh.data.materials.append(mat_path)

    # 5. Stylized Wooden Park Bench with Iron Frame
    mat_bench_wood = create_mat("Mat_Bench_Wood", (0.42, 0.24, 0.12, 1.0), roughness=0.45)
    mat_bench_iron = create_mat("Mat_Bench_Iron", (0.08, 0.09, 0.10, 1.0), roughness=0.3, metallic=0.9)

    bench_root = bpy.data.objects.new("Park_Bench_Root", None)
    bpy.context.collection.objects.link(bench_root)

    # Bench Seat - centered directly at human position (X = 0.0, Y = 0.95)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 0.95, 0.45))
    bench_seat = bpy.context.active_object
    bench_seat.name = "Bench_Seat"
    bench_seat.scale = (0.50, 0.22, 0.03)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bench_seat.data.materials.append(mat_bench_wood)
    set_parent(bench_seat, bench_root)

    # Bench Backrest
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 1.15, 0.70))
    bench_back = bpy.context.active_object
    bench_back.name = "Bench_Back"
    bench_back.scale = (0.50, 0.03, 0.22)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bench_back.data.materials.append(mat_bench_wood)
    set_parent(bench_back, bench_root)

    # Bench Iron Legs
    for lx in [-0.40, 0.40]:
        bpy.ops.mesh.primitive_cube_add(location=(lx, 0.95, 0.22))
        leg = bpy.context.active_object
        leg.name = f"Bench_Leg_{lx}"
        leg.scale = (0.03, 0.20, 0.22)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        leg.data.materials.append(mat_bench_iron)
        set_parent(leg, bench_root)

    # 6. Botanical Trees & Canopies
    mat_bark = create_mat('Mat_Park_Bark', (0.30, 0.18, 0.12, 1.0), roughness=0.9)
    mat_leaves_1 = create_mat('Mat_Park_Leaves_Warm', (0.75, 0.45, 0.12, 1.0), roughness=0.6)
    mat_leaves_2 = create_mat('Mat_Park_Leaves_Green', (0.22, 0.58, 0.18, 1.0), roughness=0.6)

    tree_coords = [(-1.8, 1.5), (2.0, 2.2), (-2.2, -1.0), (2.2, -0.5)]
    for i, (tx, ty) in enumerate(tree_coords):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=3.0, location=(tx, ty, 1.5))
        trunk = bpy.context.active_object
        trunk.name = f"Park_Tree_Trunk_{i}"
        trunk.data.materials.append(mat_bark)
        set_smooth(trunk)

        m_leaf = mat_leaves_1 if i % 2 == 0 else mat_leaves_2
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=1.35, location=(tx, ty, 3.4))
        canopy = bpy.context.active_object
        canopy.name = f"Park_Tree_Canopy_{i}"
        canopy.data.materials.append(m_leaf)
        set_smooth(canopy)

    # Stylized Flowering Shrub Accents (Clean procedural materials, no missing textures)
    mat_shrub_leaf = create_mat('Mat_Park_Shrub', (0.20, 0.55, 0.22, 1.0), roughness=0.7)
    mat_flower_red = create_mat('Mat_Park_Flower_Red', (0.90, 0.25, 0.35, 1.0), roughness=0.5)
    for bx, by in [(-1.20, 1.20), (1.30, 0.80)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35, location=(bx, by, 0.30))
        shrub = bpy.context.active_object
        shrub.name = f"Park_Shrub_{bx}"
        shrub.data.materials.append(mat_shrub_leaf)
        set_smooth(shrub)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(bx + 0.05, by - 0.05, 0.58))
        fl = bpy.context.active_object
        fl.name = f"Park_Flower_{bx}"
        fl.data.materials.append(mat_flower_red)
        fl.parent = shrub

    # Ensure Human has complete lower body (jeans & sneakers) in open garden
    human = bpy.data.objects.get('Human_Avatar')
    ensure_human_lower_body(human)

# =========================================================================
# STAGE 5: CORPORATE OFFICE (DAYTIME TECH WORKPLACE)
# =========================================================================

def configure_corporate_office_stage():
    """Builds a bright, modern corporate tech office with desk, laptop, coffee cup, whiteboard, and swivel chair."""
    print("🏢 Configuring Modern Corporate Office Environment...")

    purge_claude()
    purge_indoor_room()

    # 1. Poly Haven Studio/Office HDRI for Crisp Reflections & Neutral Ambient Light
    world = bpy.context.scene.world or bpy.data.worlds.new('Office_World')
    bpy.context.scene.world = world
    world.use_nodes = True
    tree = world.node_tree
    tree.nodes.clear()

    node_bg = tree.nodes.new(type='ShaderNodeBackground')
    node_bg.inputs['Strength'].default_value = 0.95

    node_env = tree.nodes.new(type='ShaderNodeTexEnvironment')
    hdr_path = r"D:\New folder (2)\scratch\assets_cache\studio_small_08_1k.hdr"
    if not os.path.exists(hdr_path):
        import polyhaven_connector
        hdr_path = polyhaven_connector.fetch_hdri_for_theme("office")

    if os.path.exists(hdr_path):
        node_env.image = bpy.data.images.load(hdr_path)
        tree.links.new(node_env.outputs['Color'], node_bg.inputs['Color'])

    node_output = tree.nodes.new(type='ShaderNodeOutputWorld')
    tree.links.new(node_bg.outputs['Background'], node_output.inputs['Surface'])

    # 2. Key Office Lighting: Soft Overhead Downlight, Window Sun & Warm Amber Hair/Rim Light
    bpy.ops.object.light_add(type='AREA', location=(0.0, 0.60, 2.70))
    ceiling_light = bpy.context.active_object
    ceiling_light.name = 'Office_Ceiling_Light'
    ceiling_light.data.energy = 90.0
    ceiling_light.data.size = 1.8
    ceiling_light.data.color = (0.96, 0.98, 1.0)

    bpy.ops.object.light_add(type='SUN', location=(-5.0, -4.0, 8.0))
    sun = bpy.context.active_object
    sun.name = 'Office_Window_Sun'
    sun.data.energy = 3.6
    sun.data.color = (1.0, 0.98, 0.94)
    sun.rotation_euler = (math.radians(55), math.radians(15), math.radians(45))

    bpy.ops.object.light_add(type='POINT', location=(1.00, 1.20, 1.70))
    rim = bpy.context.active_object
    rim.name = 'Office_Rim_Light'
    rim.data.energy = 45.0
    rim.data.color = (1.0, 0.82, 0.58)

    # 3. Office Floor (Commercial Carpet Tiles)
    mat_carpet = create_mat("Mat_Office_Carpet", (0.22, 0.23, 0.26, 1.0), roughness=0.92)
    bpy.ops.mesh.primitive_plane_add(location=(0.0, 0.0, 0.0), size=25.0)
    floor = bpy.context.active_object
    floor.name = "Office_Floor"
    floor.data.materials.append(mat_carpet)

    # 4. Office Back Wall (Contemporary Neutral Drywall at Y = 2.25m)
    mat_wall = create_mat("Mat_Office_Wall", (0.90, 0.90, 0.92, 1.0), roughness=0.85)
    bpy.ops.mesh.primitive_plane_add(location=(0.0, 2.25, 1.80))
    wall = bpy.context.active_object
    wall.name = "Office_BackWall"
    wall.scale = (6.0, 1.0, 2.2)
    wall.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wall.data.materials.append(mat_wall)

    # 5. Modern Acoustic Oak Wood Slat Wall Accent (Left Side behind Gemini)
    mat_slat = create_mat("Mat_Oak_Slat", (0.76, 0.55, 0.36, 1.0), roughness=0.55)
    mat_slat_felt = create_mat("Mat_Slat_Felt_Black", (0.07, 0.07, 0.08, 1.0), roughness=0.95)

    bpy.ops.mesh.primitive_cube_add(location=(-0.85, 2.23, 1.75))
    felt = bpy.context.active_object
    felt.name = "Office_Slat_Felt"
    felt.scale = (0.55, 0.01, 1.75)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    felt.data.materials.append(mat_slat_felt)

    for i, sx in enumerate([-1.35, -1.25, -1.15, -1.05, -0.95, -0.85, -0.75, -0.65, -0.55, -0.45, -0.35]):
        bpy.ops.mesh.primitive_cube_add(location=(sx, 2.21, 1.75))
        slat = bpy.context.active_object
        slat.name = f"Acoustic_Slat_{i}"
        slat.scale = (0.025, 0.012, 1.75)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        slat.data.materials.append(mat_slat)

    # 6. Modern Minimalist Office Desk (Light Scandinavian Wood, surface at Z = 0.88m)
    mat_desk_top = create_mat("Mat_Office_Desk_Wood", (0.78, 0.68, 0.55, 1.0), roughness=0.42)
    mat_desk_steel = create_mat("Mat_Office_Desk_Steel", (0.12, 0.13, 0.15, 1.0), roughness=0.3, metallic=0.9)

    desk_root = bpy.data.objects.new("Office_Desk_Root", None)
    bpy.context.collection.objects.link(desk_root)

    bpy.ops.mesh.primitive_cube_add(location=(0.0, 0.50, 0.86))
    desk_top = bpy.context.active_object
    desk_top.name = "Desk_Surface"
    desk_top.scale = (1.15, 0.32, 0.02)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    desk_top.data.materials.append(mat_desk_top)
    set_parent(desk_top, desk_root)

    for lx in [-0.95, 0.95]:
        bpy.ops.mesh.primitive_cube_add(location=(lx, 0.50, 0.43))
        leg = bpy.context.active_object
        leg.name = f"Desk_Steel_Leg_{lx}"
        leg.scale = (0.025, 0.28, 0.43)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        leg.data.materials.append(mat_desk_steel)
        set_parent(leg, desk_root)

    # 7. Real 3D Stylized Laptop (open on desk directly in front of human)
    laptop_path = r"D:\New folder (2)\assets\downloads\stylized_laptop_d55ed81f\stylized_laptop.glb"
    if os.path.exists(laptop_path):
        import auto_prop_manager
        auto_prop_manager.import_and_normalize_prop(
            laptop_path,
            prop_name="Stylized_Laptop",
            category="electronic",
            target_height=0.18,
            target_location=(0.02, 0.42, 0.88),
            target_rotation=(0, 0, 180),
            snap_surface_z=0.88
        )

    # 8. Real 3D Ceramic Coffee Mug & Saucer (on desk beside laptop)
    cup_path = r"D:\New folder (2)\assets\downloads\coffee_cup_low_poly_e1ba83d0\coffee_cup_low_poly.glb"
    if os.path.exists(cup_path):
        import auto_prop_manager
        auto_prop_manager.import_and_normalize_prop(
            cup_path,
            prop_name="Desk_Coffee_Cup",
            category="table_prop",
            target_height=0.08,
            target_location=(0.33, 0.46, 0.88),
            snap_surface_z=0.88
        )

    # 9. Desk Accessories: Orange Spiral Notebook & Cute Desktop Succulent
    mat_notebook = create_mat("Mat_Desk_Notebook", (0.95, 0.45, 0.15, 1.0), roughness=0.5)
    bpy.ops.mesh.primitive_cube_add(location=(-0.25, 0.48, 0.888))
    nb = bpy.context.active_object
    nb.name = "Desk_Spiral_Notebook"
    nb.scale = (0.08, 0.11, 0.007)
    nb.rotation_euler = (0, 0, math.radians(-12))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    nb.data.materials.append(mat_notebook)
    set_parent(nb, desk_root)

    mat_planter_white = create_mat("Mat_Planter_Ceramic", (0.94, 0.94, 0.96, 1.0), roughness=0.25)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.042, depth=0.05, location=(0.42, 0.50, 0.905))
    succ_pot = bpy.context.active_object
    succ_pot.name = "Desk_Succulent_Pot"
    succ_pot.data.materials.append(mat_planter_white)
    set_parent(succ_pot, desk_root)

    mat_succ_leaf = create_mat("Mat_Succulent_Green", (0.28, 0.68, 0.38, 1.0), roughness=0.35)
    for s_idx in range(6):
        s_ang = s_idx * (math.pi / 3.0)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.02, location=(0.42 + math.cos(s_ang)*0.022, 0.50 + math.sin(s_ang)*0.022, 0.935))
        sp = bpy.context.active_object
        sp.name = f"Succulent_Leaf_{s_idx}"
        sp.scale = (1.0, 1.0, 0.5)
        sp.data.materials.append(mat_succ_leaf)
        set_parent(sp, succ_pot)

    # 10. Office Whiteboard on Back Wall with Post-it Notes & Synergy Growth Chart
    mat_board_frame = create_mat("Mat_Board_Frame", (0.20, 0.22, 0.25, 1.0), roughness=0.35, metallic=0.8)
    mat_board_surface = create_mat("Mat_Board_Surface", (0.97, 0.98, 0.99, 1.0), roughness=0.15)

    bpy.ops.mesh.primitive_cube_add(location=(0.22, 2.20, 1.62))
    wb_frame = bpy.context.active_object
    wb_frame.name = "Office_Whiteboard_Frame"
    wb_frame.scale = (0.48, 0.02, 0.44)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wb_frame.data.materials.append(mat_board_frame)

    bpy.ops.mesh.primitive_plane_add(location=(0.22, 2.18, 1.62))
    wb_surf = bpy.context.active_object
    wb_surf.name = "Office_Whiteboard_Surface"
    wb_surf.scale = (0.45, 1.0, 0.41)
    wb_surf.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wb_surf.data.materials.append(mat_board_surface)

    # Marker tray & 3 colored pens
    bpy.ops.mesh.primitive_cube_add(location=(0.22, 2.16, 1.18))
    tray = bpy.context.active_object
    tray.name = "Office_Whiteboard_Tray"
    tray.scale = (0.35, 0.025, 0.008)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    tray.data.materials.append(mat_board_frame)

    for p_idx, (px, pcol) in enumerate([
        (0.12, (0.1, 0.1, 0.1, 1.0)),
        (0.20, (0.9, 0.15, 0.12, 1.0)),
        (0.28, (0.12, 0.35, 0.9, 1.0))
    ]):
        mat_pen = create_mat(f"Mat_Pen_{p_idx}", pcol, roughness=0.3)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.007, depth=0.06, location=(px, 2.155, 1.19))
        pen = bpy.context.active_object
        pen.rotation_euler = (0, math.radians(90), 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        pen.data.materials.append(mat_pen)

    # Colorful Post-it Notes on Whiteboard
    postit_colors = {
        'yellow': create_mat("Mat_Postit_Yellow", (0.98, 0.88, 0.22, 1.0), roughness=0.7),
        'pink': create_mat("Mat_Postit_Pink", (0.96, 0.32, 0.52, 1.0), roughness=0.7),
        'cyan': create_mat("Mat_Postit_Cyan", (0.18, 0.80, 0.95, 1.0), roughness=0.7),
        'green': create_mat("Mat_Postit_Green", (0.42, 0.88, 0.35, 1.0), roughness=0.7),
    }

    notes_layout = [
        (0.18, 1.92, 'yellow', 3.0),
        (0.26, 1.91, 'pink', -2.5),
        (0.34, 1.93, 'cyan', 1.5),
        (0.42, 1.92, 'green', -3.0),
        (0.18, 1.80, 'cyan', -1.5),
        (0.26, 1.81, 'yellow', 4.0),
        (0.34, 1.79, 'pink', -2.0),
        (0.42, 1.80, 'yellow', 2.0),
    ]
    for idx, (nx, nz, color_key, rot_deg) in enumerate(notes_layout):
        bpy.ops.mesh.primitive_plane_add(location=(nx, 2.175, nz))
        note = bpy.context.active_object
        note.name = f"Postit_{idx}"
        note.scale = (0.028, 0.028, 1.0)
        note.rotation_euler = (math.radians(90), math.radians(rot_deg), 0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        note.data.materials.append(postit_colors[color_key])

    # Red exponential "Synergy" trend line and blue bars on whiteboard
    mat_red_pen = create_mat("Mat_Marker_Red", (0.92, 0.15, 0.12, 1.0), roughness=0.3)
    mat_blue_pen = create_mat("Mat_Marker_Blue", (0.12, 0.35, 0.90, 1.0), roughness=0.3)

    for b_idx, (bx, bh) in enumerate([(0.20, 0.08), (0.27, 0.14), (0.34, 0.22)]):
        bpy.ops.mesh.primitive_cube_add(location=(bx, 2.176, 1.34 + bh * 0.5))
        bar = bpy.context.active_object
        bar.scale = (0.016, 0.001, bh * 0.5)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        bar.data.materials.append(mat_blue_pen)

    bpy.ops.mesh.primitive_cube_add(location=(0.27, 2.176, 1.58))
    arrow = bpy.context.active_object
    arrow.scale = (0.10, 0.001, 0.006)
    arrow.rotation_euler = (0, math.radians(-38), 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    arrow.data.materials.append(mat_red_pen)

    # 11. Lush Elevated Greenery to the Left of Gemini (X = -0.80m, framing the shot)
    mat_stand = create_mat("Mat_Plant_Stand_Wood", (0.65, 0.45, 0.30, 1.0), roughness=0.6)
    mat_snake_leaf = create_mat("Mat_Snake_Leaf", (0.12, 0.52, 0.18, 1.0), roughness=0.45)
    mat_snake_yellow = create_mat("Mat_Snake_Yellow", (0.78, 0.85, 0.22, 1.0), roughness=0.45)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.10, depth=0.60, location=(-0.80, 1.05, 0.30))
    stand = bpy.context.active_object
    stand.name = "Plant_Stand"
    stand.data.materials.append(mat_stand)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.11, depth=0.28, location=(-0.80, 1.05, 0.74))
    pot = bpy.context.active_object
    pot.name = "Office_Pot_Tall"
    pot.data.materials.append(mat_planter_white)

    for l_idx, (deg, h_scale, tilt, color_mat) in enumerate([
        (20, 0.85, 6, mat_snake_leaf), (65, 0.95, -5, mat_snake_yellow),
        (110, 0.80, 7, mat_snake_leaf), (155, 0.90, -6, mat_snake_yellow),
        (200, 0.82, 5, mat_snake_leaf), (245, 1.00, -4, mat_snake_leaf),
        (290, 0.88, 6, mat_snake_yellow), (335, 0.92, -7, mat_snake_leaf)
    ]):
        bpy.ops.mesh.primitive_cube_add(location=(-0.80, 1.05, 0.88 + h_scale * 0.5))
        leaf = bpy.context.active_object
        leaf.name = f"Office_Snake_Leaf_{l_idx}"
        leaf.scale = (0.02, 0.045, h_scale * 0.5)
        leaf.rotation_euler = (math.radians(tilt), math.radians(tilt * 0.5), math.radians(deg))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        leaf.data.materials.append(color_mat)
        set_parent(leaf, pot)

    # 12. Ergonomic Office Swivel Chair behind Human
    mat_chair_mesh = create_mat("Mat_Chair_Mesh", (0.10, 0.12, 0.14, 1.0), roughness=0.7)
    chair_root = bpy.data.objects.new("Office_Chair_Root", None)
    bpy.context.collection.objects.link(chair_root)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 1.25, 1.25))
    c_back = bpy.context.active_object
    c_back.name = "Chair_Backrest"
    c_back.scale = (0.28, 0.04, 0.35)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    c_back.data.materials.append(mat_chair_mesh)
    set_parent(c_back, chair_root)

    bpy.ops.mesh.primitive_cube_add(location=(0.0, 1.26, 1.68))
    c_head = bpy.context.active_object
    c_head.name = "Chair_Headrest"
    c_head.scale = (0.16, 0.03, 0.08)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    c_head.data.materials.append(mat_chair_mesh)
    set_parent(c_head, chair_root)

    # 13. The Boss Character in Background Corridor (Suit, Red Tie, Silver Hair, Clipboard)
    # Created at origin first so children local coordinates align with parent root!
    boss_root = bpy.data.objects.new("Boss_Character_Root", None)
    bpy.context.collection.objects.link(boss_root)
    boss_root.location = (0.0, 0.0, 0.0)

    mat_boss_suit = create_mat("Mat_Boss_Suit", (0.12, 0.14, 0.16, 1.0), roughness=0.6)
    mat_boss_shirt = create_mat("Mat_Boss_Shirt", (0.95, 0.95, 0.97, 1.0), roughness=0.4)
    mat_boss_tie = create_mat("Mat_Boss_Tie", (0.85, 0.12, 0.12, 1.0), roughness=0.3)
    mat_boss_skin = create_mat("Mat_Boss_Skin", (0.82, 0.65, 0.52, 1.0), roughness=0.5)
    mat_boss_hair = create_mat("Mat_Boss_Hair", (0.38, 0.39, 0.42, 1.0), roughness=0.8)

    bpy.ops.mesh.primitive_cube_add(location=(0.0, 0.0, 1.35))
    b_torso = bpy.context.active_object
    b_torso.name = "Boss_Torso"
    b_torso.scale = (0.20, 0.11, 0.32)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    b_torso.data.materials.append(mat_boss_suit)
    set_parent(b_torso, boss_root)

    bpy.ops.mesh.primitive_cube_add(location=(0.0, -0.08, 1.62))
    b_collar = bpy.context.active_object
    b_collar.name = "Boss_Collar"
    b_collar.scale = (0.07, 0.04, 0.035)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    b_collar.data.materials.append(mat_boss_shirt)
    set_parent(b_collar, boss_root)

    bpy.ops.mesh.primitive_cube_add(location=(0.0, -0.10, 1.48))
    b_tie = bpy.context.active_object
    b_tie.name = "Boss_Tie"
    b_tie.scale = (0.022, 0.012, 0.12)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    b_tie.data.materials.append(mat_boss_tie)
    set_parent(b_tie, boss_root)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.11, location=(0.0, 0.0, 1.75))
    b_head = bpy.context.active_object
    b_head.name = "Boss_Head"
    b_head.data.materials.append(mat_boss_skin)
    set_parent(b_head, boss_root)

    bpy.ops.mesh.primitive_cube_add(location=(0.0, 0.015, 1.83))
    b_hair = bpy.context.active_object
    b_hair.name = "Boss_Hair"
    b_hair.scale = (0.12, 0.12, 0.055)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    b_hair.data.materials.append(mat_boss_hair)
    set_parent(b_hair, boss_root)

    bpy.ops.mesh.primitive_cube_add(location=(-0.16, -0.06, 1.32))
    b_board = bpy.context.active_object
    b_board.name = "Boss_Clipboard"
    b_board.scale = (0.012, 0.09, 0.13)
    b_board.rotation_euler = (math.radians(15), 0, math.radians(-15))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    b_board.data.materials.append(mat_stand)
    set_parent(b_board, boss_root)

    # Move Boss to starting position in background corridor (Y = 2.05m, off-screen right at X = 2.4m)
    boss_root.location = (2.4, 2.05, 0.0)

    # Ensure Human has complete lower body
    human = bpy.data.objects.get('Human_Avatar')
    ensure_human_lower_body(human)

# =========================================================================
# STAGE 6: COZY LIVING COUCH (AFTER-HOURS SANCTUARY & RELATABLE TALKS)
# =========================================================================

def configure_cozy_living_couch_stage():
    """Builds a warm, authentic home living room with designer green velvet sofa, plush throw pillows, framed gallery wall art, living room area rug, corner monstera planter, floor lamp, and ceramic cappuccino mug (NO LAPTOP)."""
    print("🛋️ Configuring Cozy Living Couch Environment (Home Living Room Sanctuary)...")

    purge_claude()
    purge_indoor_room()

    # 1. World Lighting: Deep, warm, atmospheric evening tone
    world = bpy.context.scene.world or bpy.data.worlds.new('Couch_World')
    bpy.context.scene.world = world
    world.use_nodes = True
    tree = world.node_tree
    tree.nodes.clear()

    node_out = tree.nodes.new(type='ShaderNodeOutputWorld')
    node_bg = tree.nodes.new(type='ShaderNodeBackground')
    node_bg.inputs['Color'].default_value = (0.018, 0.020, 0.028, 1.0)
    node_bg.inputs['Strength'].default_value = 0.55
    tree.links.new(node_bg.outputs['Background'], node_out.inputs['Surface'])

    # 2. Living Room Floor (Warm Dark Oak Planks)
    mat_floor = create_mat("Mat_Couch_Floor", (0.16, 0.13, 0.10, 1.0), roughness=0.55)
    bpy.ops.mesh.primitive_plane_add(location=(0.0, 0.0, 0.0), size=25.0)
    floor = bpy.context.active_object
    floor.name = "Floor"
    floor.data.materials.append(mat_floor)

    # 3. Living Room Area Rug under sofa & coffee table
    rug_path = r"D:\New folder (2)\assets\downloads\living_room_rug_e45054df\living_room_rug.glb"
    if os.path.exists(rug_path):
        import auto_prop_manager
        auto_prop_manager.import_and_normalize_prop(
            rug_path,
            prop_name="Living_Room_Rug",
            category="furniture",
            target_height=0.015,
            target_location=(0.0, 0.65, 0.002),
            target_rotation=(0, 0, 90),
            snap_surface_z=0.001
        )
        r_obj = bpy.data.objects.get("Living_Room_Rug_Root")
        if r_obj:
            r_obj.scale = (0.55, 0.45, 1.0)

    # 4. Cozy Residential Back Wall (Warm Greige / Oatmeal with subtle molding)
    mat_wall = create_mat("Mat_Living_Wall", (0.58, 0.55, 0.50, 1.0), roughness=0.90)
    bpy.ops.mesh.primitive_plane_add(location=(0.0, 2.30, 1.80))
    wall = bpy.context.active_object
    wall.name = "Living_Wall"
    wall.scale = (8.0, 1.0, 2.5)
    wall.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wall.data.materials.append(mat_wall)

    # Wall baseboard (White architectural trim)
    mat_baseboard = create_mat("Mat_Baseboard", (0.92, 0.92, 0.90, 1.0), roughness=0.35)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 2.29, 0.08))
    baseboard = bpy.context.active_object
    baseboard.name = "Baseboard"
    baseboard.scale = (8.0, 0.02, 0.08)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    baseboard.data.materials.append(mat_baseboard)

    # 5. Coder Vibe Sarcastic Framed Wall Art (Gallery Duo with Soft Emission)
    def add_framed_poster(name, img_path, loc, width=0.44, height=0.58):
        mat_frame = create_mat(f"Mat_Frame_{name}", (0.08, 0.08, 0.09, 1.0), roughness=0.4)
        fw, fh = width + 0.04, height + 0.04
        bpy.ops.mesh.primitive_cube_add(location=(loc[0], loc[1] + 0.008, loc[2]))
        frame = bpy.context.active_object
        frame.name = f"Frame_{name}"
        frame.scale = (fw * 0.5, 0.012, fh * 0.5)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        frame.data.materials.append(mat_frame)

        mat_mat = create_mat(f"Mat_Mat_{name}", (0.94, 0.94, 0.92, 1.0), roughness=0.85)
        bpy.ops.mesh.primitive_plane_add(location=(loc[0], loc[1] - 0.002, loc[2]))
        mat_plane = bpy.context.active_object
        mat_plane.name = f"MatBoard_{name}"
        mat_plane.scale = (width * 0.5, height * 0.5, 1.0)
        mat_plane.rotation_euler = (math.radians(90), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        mat_plane.data.materials.append(mat_mat)

        pw, ph = width - 0.06, height - 0.06
        poster_mat = bpy.data.materials.new(f"Mat_Poster_{name}")
        poster_mat.use_nodes = True
        p_tree = poster_mat.node_tree
        p_nodes = p_tree.nodes
        p_links = p_tree.links
        p_nodes.clear()

        node_out = p_nodes.new(type='ShaderNodeOutputMaterial')
        node_bsdf = p_nodes.new(type='ShaderNodeBsdfPrincipled')
        node_bsdf.inputs['Roughness'].default_value = 0.25
        node_tex = p_nodes.new(type='ShaderNodeTexImage')
        if os.path.exists(img_path):
            node_tex.image = bpy.data.images.load(img_path)

        p_links.new(node_tex.outputs['Color'], node_bsdf.inputs['Base Color'])
        p_links.new(node_tex.outputs['Color'], node_bsdf.inputs['Emission Color'])
        node_bsdf.inputs['Emission Strength'].default_value = 0.65
        p_links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])

        bpy.ops.mesh.primitive_plane_add(location=(loc[0], loc[1] - 0.005, loc[2]))
        art_plane = bpy.context.active_object
        art_plane.name = f"Art_{name}"
        art_plane.scale = (pw * 0.5, ph * 0.5, 1.0)
        art_plane.rotation_euler = (math.radians(90), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        art_plane.data.materials.append(poster_mat)

    p1 = r"d:\New folder (2)\assets\posters\poster_terminal.png"
    p2 = r"d:\New folder (2)\assets\posters\poster_hard_problems.png"
    if not os.path.exists(p1):
        p1 = r"d:\New folder (2)\scratch\posters\poster_terminal.png"
    if not os.path.exists(p2):
        p2 = r"d:\New folder (2)\scratch\posters\poster_hard_problems.png"
    add_framed_poster("Terminal", p1, (-0.48, 2.26, 1.56), width=0.44, height=0.58)
    add_framed_poster("HardProblems", p2, (0.48, 2.26, 1.56), width=0.44, height=0.58)

    # 6. Designer Quilted Green Velvet Sofa (Top-tier showroom piece)
    green_sofa = r"D:\New folder (2)\assets\downloads\green_velvet_sofa_3dc93078\green_velvet_sofa.glb"
    chesterfield_sofa = r"D:\New folder (2)\assets\downloads\chesterfield_sofa_66ba4225\chesterfield_sofa.glb"
    sofa_path = green_sofa if os.path.exists(green_sofa) else chesterfield_sofa

    if os.path.exists(sofa_path):
        try:
            import auto_prop_manager
            auto_prop_manager.import_and_normalize_prop(
                sofa_path,
                prop_name="Designer_Green_Sofa",
                category="furniture",
                target_height=0.82,
                target_location=(0.0, 0.95, 0.0),
                target_rotation=(0, 0, 0),
                snap_surface_z=0.0
            )
            print("🛋️ Imported Photoreal Designer Velvet Sofa GLB")
        except Exception as e:
            print(f"⚠️ Sofa GLB import warning: {e}")

    # 7. Sofa Pillows (Plush decorative throw pillows in left and right sofa corners)
    pillow_path = r"D:\New folder (2)\assets\downloads\decorative_pillows_8c746b5d\decorative_pillows.glb"
    if os.path.exists(pillow_path):
        import auto_prop_manager
        # Left pillow
        auto_prop_manager.import_and_normalize_prop(
            pillow_path,
            prop_name="Sofa_Pillow_L",
            category="furniture",
            target_height=0.28,
            target_location=(-0.48, 0.88, 0.44),
            target_rotation=(10, 15, 20),
            snap_surface_z=0.44
        )
        # Right pillow
        auto_prop_manager.import_and_normalize_prop(
            pillow_path,
            prop_name="Sofa_Pillow_R",
            category="furniture",
            target_height=0.28,
            target_location=(0.46, 0.88, 0.44),
            target_rotation=(10, -15, -20),
            snap_surface_z=0.44
        )

    # 8. Low Modern Coffee Table (Walnut & Matte Black Steel)
    mat_table_wood = create_mat("Mat_CoffeeTable_Wood", (0.24, 0.16, 0.10, 1.0), roughness=0.45)
    mat_table_steel = create_mat("Mat_CoffeeTable_Steel", (0.08, 0.08, 0.09, 1.0), roughness=0.3, metallic=0.9)

    table_root = bpy.data.objects.new("Coffee_Table_Root", None)
    bpy.context.collection.objects.link(table_root)

    bpy.ops.mesh.primitive_cube_add(location=(0.0, 0.28, 0.38))
    tbl_top = bpy.context.active_object
    tbl_top.name = "CoffeeTable_Top"
    tbl_top.scale = (0.55, 0.22, 0.018)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    tbl_top.data.materials.append(mat_table_wood)
    set_parent(tbl_top, table_root)

    for tx, ty in [(-0.48, 0.12), (0.48, 0.12), (-0.48, 0.44), (0.48, 0.44)]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.014, depth=0.36, location=(tx, ty, 0.18))
        tleg = bpy.context.active_object
        tleg.name = f"CoffeeTable_Leg_{tx}_{ty}"
        tleg.data.materials.append(mat_table_steel)
        set_parent(tleg, table_root)

    # 9. Ceramic Hot Coffee/Chai Mug on table (NO LAPTOP!)
    cup_path = r"D:\New folder (2)\assets\downloads\coffee_cup_low_poly_e1ba83d0\coffee_cup_low_poly.glb"
    if os.path.exists(cup_path):
        import auto_prop_manager
        auto_prop_manager.import_and_normalize_prop(
            cup_path,
            prop_name="Couch_Coffee_Cup",
            category="table_prop",
            target_height=0.08,
            target_location=(0.18, 0.28, 0.398),
            snap_surface_z=0.398
        )

    # 10. Little Indoor Potted Succulent Plant on Left Side of Coffee Table
    succulent_path = r"D:\New folder (2)\assets\downloads\succulent_plant_2c0dfe7f\scene.gltf"
    if os.path.exists(succulent_path):
        import auto_prop_manager
        auto_prop_manager.import_and_normalize_prop(
            succulent_path,
            prop_name="Table_Indoor_Plant",
            category="table_prop",
            target_height=0.12,
            target_location=(-0.18, 0.28, 0.398),
            target_rotation=(0, 0, 30),
            snap_surface_z=0.398
        )

    # 11. Floor Lamp with Weighted Ground Pedestal Base & Warm Amber Glow (Framed in 9:16 view beside sofa)
    mat_lamp_brass = create_mat("Mat_Lamp_Brass", (0.85, 0.70, 0.35, 1.0), roughness=0.3, metallic=0.85)
    lamp_root = bpy.data.objects.new("Floor_Lamp_Root", None)
    bpy.context.collection.objects.link(lamp_root)

    # Place lamp outside the sofa right armrest (sofa ends at X=1.09m)
    lamp_x, lamp_y = 1.25, 0.82
    # Heavy circular brass pedestal base firmly resting on floor (Z=0.0 to 0.024m)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=0.024, location=(lamp_x, lamp_y, 0.012))
    lamp_base = bpy.context.active_object
    lamp_base.name = "Floor_Lamp_Base"
    lamp_base.data.materials.append(mat_lamp_brass)
    set_smooth(lamp_base)
    set_parent(lamp_base, lamp_root)

    # Vertical lamp pole standing directly on the pedestal base
    pole_height = 1.72
    bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=pole_height, location=(lamp_x, lamp_y, 0.024 + pole_height * 0.5))
    lamp_pole = bpy.context.active_object
    lamp_pole.name = "Floor_Lamp_Pole"
    lamp_pole.data.materials.append(mat_lamp_brass)
    set_parent(lamp_pole, lamp_root)

    # Fabric cone lamp shade
    bpy.ops.mesh.primitive_cone_add(radius1=0.17, radius2=0.08, depth=0.22, location=(lamp_x, lamp_y, 1.76))
    lamp_shade = bpy.context.active_object
    lamp_shade.name = "Floor_Lamp_Shade"
    mat_shade = create_mat("Mat_Lamp_Shade", (0.95, 0.90, 0.80, 1.0), roughness=0.6, emission_color=(1.0, 0.75, 0.40), emission_strength=2.2)
    lamp_shade.data.materials.append(mat_shade)
    set_parent(lamp_shade, lamp_root)

    # Warm 2700K point light inside shade
    bpy.ops.object.light_add(type='POINT', location=(lamp_x, lamp_y, 1.72))
    floor_light = bpy.context.active_object
    floor_light.name = "Light_Floor_Lamp"
    floor_light.data.energy = 55.0
    floor_light.data.color = (1.0, 0.72, 0.35)
    floor_light.data.shadow_soft_size = 0.45
    set_parent(floor_light, lamp_root)

    # 11. Potted Monstera Planter in corner
    plant_path = r"D:\New folder (2)\assets\downloads\potted_monstera_7366ebf9\potted_monstera.glb"
    if os.path.exists(plant_path):
        import auto_prop_manager
        auto_prop_manager.import_and_normalize_prop(
            plant_path,
            prop_name="Living_Corner_Plant",
            category="furniture",
            target_height=0.95,
            target_location=(1.05, 1.25, 0.0),
            target_rotation=(0, 0, 45),
            snap_surface_z=0.0
        )

    # 12. Soft Overhead Living Room Area Bounce
    bpy.ops.object.light_add(type='AREA', location=(0.0, -0.30, 2.40))
    ceil_bounce = bpy.context.active_object
    ceil_bounce.name = "Light_Living_Ceil_Bounce"
    ceil_bounce.data.energy = 38.0
    ceil_bounce.data.size = 2.4
    ceil_bounce.data.color = (1.0, 0.92, 0.82)

    # 13. Gemini Dedicated 360 Wrap Fills
    bpy.ops.object.light_add(type='POINT', location=(-0.70, -0.20, 1.35))
    gem_key = bpy.context.active_object
    gem_key.name = "Light_Gemini_Key_Fill"
    gem_key.data.energy = 28.0
    gem_key.data.color = (0.85, 0.92, 1.0)
    gem_key.data.shadow_soft_size = 0.45

    bpy.ops.object.light_add(type='POINT', location=(-0.15, -0.15, 1.30))
    gem_wrap = bpy.context.active_object
    gem_wrap.name = "Light_Gemini_Wrap_Fill"
    gem_wrap.data.energy = 22.0
    gem_wrap.data.color = (0.95, 0.88, 0.80)
    gem_wrap.data.shadow_soft_size = 0.45

    # 14. Seety Front Warm Key
    bpy.ops.object.light_add(type='POINT', location=(0.20, -0.30, 1.25))
    seety_key = bpy.context.active_object
    seety_key.name = "Light_Seety_Key_Fill"
    seety_key.data.energy = 26.0
    seety_key.data.color = (1.0, 0.90, 0.80)
    seety_key.data.shadow_soft_size = 0.40

    # Ensure Human is naturally seated flush in the couch cushions (-7.5 deg recline)
    human = bpy.data.objects.get('Human_Avatar')
    if human:
        human.location = (0.0, 0.0, -0.50)
    torso = bpy.data.objects.get('Human_Torso')
    if torso:
        torso.rotation_euler = (math.radians(-7.5), 0, 0)
    head = bpy.data.objects.get('Human_Head_Pivot')
    if head:
        head.rotation_euler = (math.radians(7.5), math.radians(-1.5), math.radians(6.0))
    ensure_human_lower_body(human, is_seated=True)

    # Popapus positioned at eye level with seated Seety
    pop = bpy.data.objects.get('Popapus_Root')
    if pop:
        pop.location = (-0.46, 0.50, 0.95)

# =========================================================================
# STAGE 7: NIGHT BALCONY SKYLINE (HIGH-RISE CITY ROOFTOP & SKYLINE BOKEH)
# =========================================================================

def configure_night_balcony_skyline_stage():
    """Builds an outdoor high-rise apartment balcony with premium glass railing, teak decking, night skyline HDRI, monstera planter, lantern, and coffee mug (NO LAPTOP)."""
    print("🌃 Configuring Night Balcony Skyline Environment (10:00 PM City Rooftop)...")

    purge_claude()
    purge_indoor_room()

    # 1. World HDRI: Modern Buildings Night 1K (Panoramic glowing city skyline & bokeh)
    world = bpy.context.scene.world or bpy.data.worlds.new('Balcony_World')
    bpy.context.scene.world = world
    world.use_nodes = True
    tree = world.node_tree
    tree.nodes.clear()

    node_bg = tree.nodes.new(type='ShaderNodeBackground')
    node_bg.inputs['Strength'].default_value = 0.75

    node_env = tree.nodes.new(type='ShaderNodeTexEnvironment')
    hdr_path = r"D:\New folder (2)\scratch\assets_cache\modern_buildings_night_1k.hdr"

    if os.path.exists(hdr_path):
        node_env.image = bpy.data.images.load(hdr_path)
        tree.links.new(node_env.outputs['Color'], node_bg.inputs['Color'])
        print(f"🌆 Loaded Night City Skyline HDRI: {hdr_path}")
    else:
        node_bg.inputs['Color'].default_value = (0.02, 0.03, 0.06, 1.0)

    node_output = tree.nodes.new(type='ShaderNodeOutputWorld')
    tree.links.new(node_bg.outputs['Background'], node_output.inputs['Surface'])

    # 2. Balcony Floor Decking (Rich Teak Planks)
    mat_deck = bpy.data.materials.new("Mat_Luxury_Teak")
    mat_deck.use_nodes = True
    d_bsdf = mat_deck.node_tree.nodes.get('Principled BSDF')
    d_bsdf.inputs['Base Color'].default_value = (0.16, 0.11, 0.07, 1.0)
    d_bsdf.inputs['Roughness'].default_value = 0.35

    bpy.ops.mesh.primitive_plane_add(location=(0.0, 0.0, 0.0), size=25.0)
    floor = bpy.context.active_object
    floor.name = "Floor"
    floor.data.materials.append(mat_deck)

    # 3. Apartment Exterior Facade Wall (Right side architecture)
    mat_facade = create_mat("Mat_Balcony_Facade", (0.12, 0.13, 0.16, 1.0), roughness=0.88)
    bpy.ops.mesh.primitive_cube_add(location=(1.40, 0.60, 1.50))
    facade = bpy.context.active_object
    facade.name = "Balcony_Facade_Wall"
    facade.scale = (0.15, 1.60, 1.50)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    facade.data.materials.append(mat_facade)

    # 4. Premium Modern Glass & Steel Balcony Railing (Shortened top rail at Z = 0.82m)
    mat_steel = create_mat("Mat_Balcony_Steel", (0.08, 0.09, 0.10, 1.0), roughness=0.20, metallic=0.95)
    mat_chrome = create_mat("Mat_Balcony_Chrome", (0.90, 0.91, 0.93, 1.0), roughness=0.10, metallic=0.98)

    # Real Architectural Tinted Glass
    mat_glass = bpy.data.materials.new("Mat_Luxury_Glass")
    mat_glass.use_nodes = True
    g_bsdf = mat_glass.node_tree.nodes.get('Principled BSDF')
    g_bsdf.inputs['Base Color'].default_value = (0.85, 0.92, 0.98, 1.0)
    g_bsdf.inputs['Roughness'].default_value = 0.02
    g_bsdf.inputs['IOR'].default_value = 1.52
    if 'Transmission Weight' in g_bsdf.inputs:
        g_bsdf.inputs['Transmission Weight'].default_value = 0.90
    elif 'Transmission' in g_bsdf.inputs:
        g_bsdf.inputs['Transmission'].default_value = 0.90

    railing_root = bpy.data.objects.new("Balcony_Railing_Root", None)
    bpy.context.collection.objects.link(railing_root)

    # Sleek Top Handrail / Ledge (Z = 0.82m)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 1.08, 0.82))
    rail_top = bpy.context.active_object
    rail_top.name = "Balcony_Top_Ledge"
    rail_top.scale = (1.60, 0.05, 0.018)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    rail_top.data.materials.append(mat_steel)
    set_parent(rail_top, railing_root)

    # Architectural Glass Panels (Z from 0.08m to 0.80m)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 1.08, 0.44))
    glass_panel = bpy.context.active_object
    glass_panel.name = "Balcony_Glass_Panels"
    glass_panel.scale = (1.55, 0.008, 0.36)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    glass_panel.data.materials.append(mat_glass)
    set_parent(glass_panel, railing_root)

    # Stainless Steel Glass Clamps / Spigots at base
    for cx in [-1.20, -0.60, 0.0, 0.60, 1.20]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.025, depth=0.16, location=(cx, 1.08, 0.08))
        clamp = bpy.context.active_object
        clamp.name = f"Balcony_Clamp_{cx}"
        clamp.data.materials.append(mat_chrome)
        set_parent(clamp, railing_root)

    # LED Under-Rail Strip (warm 2800K glow washing down glass)
    bpy.ops.object.light_add(type='AREA', location=(0.0, 1.07, 0.80))
    led = bpy.context.active_object
    led.name = "Balcony_LED_Strip"
    led.data.energy = 25.0
    led.data.size = 2.4
    led.data.size_y = 0.02
    led.data.color = (1.0, 0.82, 0.55)
    led.rotation_euler = (math.radians(-90), 0, 0)

    # 5. Hot Ceramic Coffee Mug Resting on Balcony Ledge (NO LAPTOP!)
    cup_path = r"D:\New folder (2)\assets\downloads\coffee_cup_low_poly_e1ba83d0\coffee_cup_low_poly.glb"
    if os.path.exists(cup_path):
        import auto_prop_manager
        auto_prop_manager.import_and_normalize_prop(
            cup_path,
            prop_name="Balcony_Coffee_Cup",
            category="table_prop",
            target_height=0.08,
            target_location=(0.28, 1.08, 0.83),
            snap_surface_z=0.83
        )

    # 6. Real 3D Monstera Deliciosa Planter from Sketchfab (textured, vibrant foliage framing left)
    plant_path = r"D:\New folder (2)\assets\downloads\monstera_plant_1ab9bf84\monstera_plant.glb"
    if os.path.exists(plant_path):
        try:
            import auto_prop_manager
            auto_prop_manager.import_and_normalize_prop(
                plant_path,
                prop_name="Balcony_Monstera_Plant",
                category="furniture",
                target_height=0.92,
                target_location=(-0.82, 0.88, 0.0),
                snap_surface_z=0.0
            )
            print("🌿 Imported Photoreal Monstera Plant on Balcony")
        except Exception as e:
            print(f"⚠️ Monstera plant import warning: {e}")

    # 7. Modern Hurricane Lantern with Candle Flame on ledge
    mat_candle = create_mat("Mat_Candle_Wax", (0.95, 0.92, 0.85, 1.0), roughness=0.2)
    mat_flame = create_mat("Mat_Candle_Flame", (1.0, 0.85, 0.4, 1.0), emission_color=(1.0, 0.65, 0.2), emission_strength=8.0)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.18, location=(0.65, 1.08, 0.91))
    lantern_glass = bpy.context.active_object
    lantern_glass.name = "Lantern_Glass"
    lantern_glass.data.materials.append(mat_glass)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.025, depth=0.08, location=(0.65, 1.08, 0.86))
    candle = bpy.context.active_object
    candle.name = "Lantern_Candle"
    candle.data.materials.append(mat_candle)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.012, location=(0.65, 1.08, 0.91))
    flame = bpy.context.active_object
    flame.name = "Lantern_Flame"
    flame.data.materials.append(mat_flame)

    bpy.ops.object.light_add(type='POINT', location=(0.65, 1.08, 0.93))
    c_light = bpy.context.active_object
    c_light.name = "Light_Lantern_Candle"
    c_light.data.energy = 16.0
    c_light.data.color = (1.0, 0.68, 0.28) # Warm candle 2200K
    c_light.data.shadow_soft_size = 0.15

    # 8. Cinematic Balcony Night Lighting Rig
    # A. Warm Architectural Wall Sconce on Facade (3000K Amber)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.18, location=(1.24, 0.60, 1.75))
    sconce = bpy.context.active_object
    sconce.name = "Balcony_Sconce_Body"
    sconce.data.materials.append(mat_steel)

    bpy.ops.object.light_add(type='POINT', location=(1.18, 0.60, 1.75))
    sconce_light = bpy.context.active_object
    sconce_light.name = "Light_Balcony_Sconce"
    sconce_light.data.energy = 45.0
    sconce_light.data.color = (1.0, 0.78, 0.45)
    sconce_light.data.shadow_soft_size = 0.35

    # B. Crisp Cool Blue-Cyan Skyline Rim Light (From City Skyline behind characters)
    bpy.ops.object.light_add(type='POINT', location=(0.0, 3.20, 1.90))
    skyline_rim = bpy.context.active_object
    skyline_rim.name = "Light_Skyline_Rim"
    skyline_rim.data.energy = 55.0
    skyline_rim.data.color = (0.35, 0.70, 1.0)

    # C. Gemini Dedicated 360 Wrap Fills (NO PITCH BLACK HALF-FACE!)
    bpy.ops.object.light_add(type='POINT', location=(-0.65, -0.30, 1.45))
    gem_key = bpy.context.active_object
    gem_key.name = "Light_Gemini_Key_Fill"
    gem_key.data.energy = 28.0
    gem_key.data.color = (0.85, 0.92, 1.0)
    gem_key.data.shadow_soft_size = 0.45

    bpy.ops.object.light_add(type='POINT', location=(-0.15, -0.25, 1.40))
    gem_wrap = bpy.context.active_object
    gem_wrap.name = "Light_Gemini_Wrap_Fill"
    gem_wrap.data.energy = 22.0
    gem_wrap.data.color = (0.92, 0.88, 0.82)
    gem_wrap.data.shadow_soft_size = 0.45

    # D. Seety Front Key Light
    bpy.ops.object.light_add(type='POINT', location=(0.20, -0.35, 1.45))
    seety_key = bpy.context.active_object
    seety_key.name = "Light_Seety_Key_Fill"
    seety_key.data.energy = 26.0
    seety_key.data.color = (1.0, 0.92, 0.84)
    seety_key.data.shadow_soft_size = 0.40

    # Ensure Human is 100% physically grounded on the deck floor!
    human = bpy.data.objects.get('Human_Avatar')
    if human:
        human.location = (0.0, 0.0, 0.0)
    ensure_human_lower_body(human, is_seated=False)
    human = bpy.data.objects.get('Human_Avatar')
    if human:
        human.location = (0.0, 0.0, 0.0)
    ensure_human_lower_body(human, is_seated=False)

# =========================================================================
# ACTING, ANIMATION, MOUTH MOVEMENT & CAMERA DIRECTOR
# =========================================================================

def setup_master_cinematography_and_acting(manifest):
    """Binds camera markers, animates stroll tracking dolly, expressive mouth movement, and orbs."""
    scene = bpy.context.scene
    fps = manifest.get('fps', 30)
    total_frames = manifest.get('totalFrames', 720)
    lines = manifest.get('lines', [])
    env_type = manifest.get('environment', 'daylight_walk')

    human = bpy.data.objects.get("Human_Avatar")
    head_pivot = bpy.data.objects.get("Human_Head_Pivot")
    mouth = bpy.data.objects.get("Human_Mouth")
    arm_l = bpy.data.objects.get("Human_Arm_L")
    arm_r = bpy.data.objects.get("Human_Arm_R")
    hand_l = bpy.data.objects.get("Human_Hand_L")
    hand_r = bpy.data.objects.get("Human_Hand_R")
    leg_l = bpy.data.objects.get("Human_Leg_L")
    leg_r = bpy.data.objects.get("Human_Leg_R")

    # Eyes & Eyebrows
    eye_l = bpy.data.objects.get("Human_Eye_L")
    eye_r = bpy.data.objects.get("Human_Eye_R")
    brow_l = bpy.data.objects.get("Human_Brow_L")
    brow_r = bpy.data.objects.get("Human_Brow_R")

    # Gemini (AI Companion)
    gemini_root = bpy.data.objects.get("Antigravity_Popapus_Root")
    gemini_nozzle = bpy.data.objects.get("Popapus_Nozzle")
    gemini_spout = bpy.data.objects.get("Popapus_Spout")
    gemini_eye_l = bpy.data.objects.get("Popapus_Eye_L")
    gemini_eye_r = bpy.data.objects.get("Popapus_Eye_R")

    # 4 Glowing Orbs in Gemini's Dome
    orbs = {
        'blue': bpy.data.objects.get("Orb_Antigravity_Blue"),
        'green': bpy.data.objects.get("Orb_Antigravity_Green"),
        'red': bpy.data.objects.get("Orb_Antigravity_Red"),
        'yellow': bpy.data.objects.get("Orb_Antigravity_Yellow"),
    }

    stage_recipe = manifest.get('stage_recipe') or {}
    env_type = stage_recipe.get('theme') or manifest.get('environment', 'daylight_walk')
    is_walk_scene = env_type in ['daylight_walk', 'neon_datacenter', 'datacenter', 'server_room', 'daylight_server_room']
    walk_speed = 0.35 if is_walk_scene else 0.0
    is_couch = 'couch' in env_type.lower()
    is_balcony = 'balcony' in env_type.lower()

    car1 = bpy.data.objects.get("Car_Red_Sedan")
    car2 = bpy.data.objects.get("Car_White_Hatch")

    cam_wide = bpy.data.objects.get("Cam_Wide")
    cam_human = bpy.data.objects.get("Cam_Human")
    cam_gemini = bpy.data.objects.get("Cam_Popapus")

    # Calibrate Cam_Human to tight chest-up close-up framing face and hands clearly
    if cam_human:
        cam_human.location = (0.0, -0.85, 1.45)
        cam_human.rotation_euler = (math.radians(84), 0, 0)
        cam_human.data.lens = 38.0

    # Calibrate Cam_Popapus (Gemini) to crisp cinematic framing with healthy headroom
    if cam_gemini:
        cam_gemini.data.lens = 38.0

    # Calibrate Cam_Wide for clean 9:16 vertical 2-shot framing (Human, Gemini, Street & Traffic)
    if cam_wide:
        cam_wide.data.lens = 30.0

    # 1. Timeline Camera Markers (Pacing & Angles)
    scene.timeline_markers.clear()

    first_line = lines[0] if lines else None
    first_speaker = first_line.get('speaker', '').lower() if first_line else 'human'
    if first_speaker in ['gemini', 'popapus', 'ai']:
        shot1_cam = cam_gemini
        shot1_tag = "Tight_Gemini"
    else:
        shot1_cam = cam_human
        shot1_tag = "Tight_Human"

    # MANDATORY SHOT 1 RULE: Shot 1 (0.0s - 2.5s) ALWAYS starts on tight chest-up close-up
    m_init = scene.timeline_markers.new(f"Shot_0_{shot1_tag}", frame=1)
    m_init.camera = shot1_cam
    scene.camera = shot1_cam

    total_lines = len(lines)
    for i, line in enumerate(lines):
        s_frame = max(1, line.get('startFrame', 1))
        idx = line.get('lineIndex', i)
        speaker = line.get('speaker', '').lower()
        cam_pref = line.get('camera', '').lower()

        # CINEMATOGRAPHY DIRECTING RULES:
        # Rule 1: Shot 1 (Line 0 hook) MUST ALWAYS be super-tight face close-up (thumb-stopping retention)
        # Rule 2: Intermediate turns stay on tight alternating single shots
        # Rule 3: Wide Shot is reserved for towards the end (penultimate or final beat)
        #         where Gemini is talking/roasting and Human reacts with bewildered expression in 2-shot!
        is_hook = (idx == 0)
        is_towards_end = (i >= max(1, total_lines - 2))

        if is_hook:
            target_cam = shot1_cam
            tag = shot1_tag
        elif is_towards_end and (cam_pref == 'wide' or i == total_lines - 1 or (i == total_lines - 2 and any(k in speaker for k in ['gemini', 'popapus', 'ai']))):
            target_cam = cam_wide
            tag = "Wide_Ending_Reaction"
        elif any(k in speaker for k in ['gemini', 'popapus', 'ai']):
            target_cam = cam_gemini
            tag = "Gemini"
        elif 'human' in speaker:
            target_cam = cam_human
            tag = "Human"
        else:
            target_cam = cam_gemini if i % 2 == 1 else cam_human
            tag = "Turn_Reaction"

        if s_frame > 1:
            marker = scene.timeline_markers.new(f"Turn_{idx}_{tag}", frame=s_frame)
            marker.camera = target_cam

    # 1b. SEAMLESS LOOP MARKER: In the final 10 frames (trailing tail), snap camera back to shot1_cam
    # so the ending frame visually and cinematographically matches Frame 1's starting camera angle!
    if total_frames > 24:
        loop_snap_frame = max(1, total_frames - 10)
        marker_loop = scene.timeline_markers.new("Seamless_Loop_Snap", frame=loop_snap_frame)
        marker_loop.camera = shot1_cam

    # 2. Reset Moving Cars animation data for daylight_walk (animated continuously in frame loop)
    if car1:
        car1.animation_data_clear()
    if car2:
        car2.animation_data_clear()

    # 2b. Animate Boss Walking Past in Corporate Office Corridor
    boss = bpy.data.objects.get("Boss_Character_Root")
    if boss:
        boss.animation_data_clear()
        for f in range(1, total_frames + 1):
            t_prog = (f - 70) / max(1.0, 560.0)
            bx = 2.4 - (4.6 * max(0.0, min(1.0, t_prog)))
            b_bounce = abs(math.sin((f / 30.0) * 8.0)) * 0.015 if 0.0 < t_prog < 1.0 else 0.0
            boss.location = (bx, 2.05, b_bounce)
            boss.keyframe_insert(data_path="location", frame=f)

    # 3. Rest Positions
    base_human_x = human.location.x if human else 0.0
    base_human_y = human.location.y if human else 0.0
    base_human_z = human.location.z if human else 0.0
    base_gemini_loc = gemini_root.location.copy() if gemini_root else Vector((-0.46, 0.50, 1.35))
    base_gemini_rot = gemini_root.rotation_euler.copy() if gemini_root else Euler((0, 0, math.radians(20)))

    base_cam_wide_loc = cam_wide.location.copy() if cam_wide else Vector((0, -2.40, 1.45))
    base_cam_human_loc = cam_human.location.copy() if cam_human else Vector((0, -0.25, 1.62))
    base_cam_gemini_loc = cam_gemini.location.copy() if cam_gemini else Vector((-0.48, -0.55, 1.38))

    # Determine if scene is Seated (desk/console/cafe) or Standing/Walking (outdoors, park, mars surface, street)
    recipe_mode = manifest.get('stage_recipe', {}).get('camera_mode') if manifest.get('stage_recipe') else None
    if recipe_mode == 'standing_walk' or env_type in ['daylight_walk', 'neon_datacenter', 'datacenter', 'server_room', 'daylight_server_room', 'park_garden', 'sunny_park']:
        is_seated = False
    elif recipe_mode == 'seated':
        is_seated = True
    else:
        is_seated = (
            env_type in ['latenight_desk', 'cafe_corner', 'corporate_office', 'office', 'workplace', 'cozy_living_couch', 'couch', 'living_room'] or
            any(k in env_type.lower() for k in ['bridge', 'desk', 'console', 'station', 'cockpit', 'couch', 'living'])
        )

    if is_seated:
        # Desk/Couch seated mode vs Cafe Barstool mode
        ring = bpy.data.objects.get("Popapus_Hover_Ring")
        if env_type == 'cafe_corner':
            if ring:
                ring.hide_render = False
                ring.hide_viewport = False
            base_gemini_loc = Vector((-0.52, 0.38, 1.38))
            base_cam_gemini_loc = Vector((-0.52, -0.65, 1.40))
            if cam_gemini:
                cam_gemini.data.lens = 38.0
                cam_gemini.location = base_cam_gemini_loc
                cam_gemini.rotation_euler = (math.radians(86.5), 0, 0)
            base_cam_human_loc = Vector((0.0, -0.75, 1.50))
            if cam_human:
                cam_human.data.lens = 40.0
                cam_human.location = base_cam_human_loc
                cam_human.rotation_euler = (math.radians(85.5), 0, 0)
            base_cam_wide_loc = Vector((0.0, -2.60, 1.35))
            if cam_wide:
                cam_wide.data.lens = 30.0
                cam_wide.location = base_cam_wide_loc
                cam_wide.rotation_euler = (math.radians(88.0), 0, 0)
        else:
            if ring:
                ring.hide_render = True
                ring.hide_viewport = True

            cam_z_offset = base_human_z if base_human_z < -0.1 else 0.0
            base_gemini_loc = Vector((-0.48, 0.50, 1.48 + cam_z_offset * 0.55))
            # Medium close-up for Gemini with perfect headroom, centered framing and 38mm lens
            base_cam_gemini_loc = Vector((-0.48, -0.68, 1.40 + cam_z_offset * 0.55))
            if cam_gemini:
                cam_gemini.data.lens = 38.0
                cam_gemini.location = base_cam_gemini_loc
                cam_gemini.rotation_euler = (math.radians(87.5), 0, 0)
            # Super Tight Chest-and-Face Close-up for Human (Viral Retention Hook)
            base_cam_human_loc = Vector((0.0, -0.78, 1.48 + cam_z_offset))
            if cam_human:
                cam_human.data.lens = 42.0
                cam_human.location = base_cam_human_loc
                cam_human.rotation_euler = (math.radians(85.5), 0, 0)
            base_cam_wide_loc = Vector((0.0, -2.80, 1.50 + cam_z_offset * 0.45))
            if cam_wide:
                cam_wide.data.lens = 28.0
                cam_wide.location = base_cam_wide_loc
                cam_wide.rotation_euler = (math.radians(88.0), 0, 0)
    else:
        # Standing / Walking / Balcony mode
        cam_z_offset = base_human_z if base_human_z < -0.1 else 0.0
        # Gemini floats gracefully alongside Human at shoulder/eye level
        base_gemini_loc = Vector((-0.52, 0.45, 1.40 + cam_z_offset))
        # Medium shot for Gemini with clean headroom
        base_cam_gemini_loc = Vector((-0.52, -0.70, 1.38 + cam_z_offset))
        if cam_gemini:
            cam_gemini.data.lens = 40.0
            cam_gemini.location = base_cam_gemini_loc
            cam_gemini.rotation_euler = (math.radians(87.5), 0, 0)
        # Super Tight Chest-and-Face Close-up for Human (Viral Retention Hook)
        base_cam_human_loc = Vector((0.0, -0.78, 1.48 + cam_z_offset))
        if cam_human:
            cam_human.data.lens = 42.0
            cam_human.location = base_cam_human_loc
            cam_human.rotation_euler = (math.radians(85.5), 0, 0)
        # Full Dynamic Two-Shot showing both characters, grounded feet and environment
        base_cam_wide_loc = Vector((-0.18, -2.50, 1.25 + cam_z_offset))
        if cam_wide:
            cam_wide.data.lens = 28.0
            cam_wide.location = base_cam_wide_loc
            cam_wide.rotation_euler = (math.radians(88), 0, 0)

    base_cam_human_rot = cam_human.rotation_euler.copy() if cam_human else Euler((math.radians(85.5), 0, 0))
    base_cam_gemini_rot = cam_gemini.rotation_euler.copy() if cam_gemini else Euler((math.radians(87.5), 0, 0))
    base_cam_wide_rot = cam_wide.rotation_euler.copy() if cam_wide else Euler((math.radians(88.0), 0, 0))

    # =========================================================================
    # PROCEDURAL HOOK CAMERA PROFILE SELECTION
    # =========================================================================
    # Camera angles are emotional amplifiers. The hook style dynamically adapts
    # to the episode's topic, emotion, and environment for maximum 35%+ retention.
    hook_profile = manifest.get('camera_hook_profile')
    if not hook_profile:
        theme_str = (str(manifest.get('theme', '')) + ' ' + str(manifest.get('category', '')) + ' ' + str(manifest.get('title', ''))).lower()
        l0_emotion = lines[0].get('emotion', '').lower() if lines else ''
        l0_action = lines[0].get('action', '').lower() if lines else ''
        l0_text = lines[0].get('text', '').lower() if lines else ''
        combined_meta = f"{theme_str} {l0_emotion} {l0_action} {l0_text}".lower()

        if is_walk_scene:
            hook_profile = 'tracking_stroll'
        elif any(k in combined_meta for k in ['existential', 'crisis', 'burnout', '2 am', '2am', 'hard work', 'pointless', 'overthinking', 'exhausted', 'cope', 'failure', 'stress', 'why am i', 'question', 'doubt']):
            hook_profile = 'crisis_low_angle'
        elif any(k in combined_meta for k in ['panic', 'caught', 'boss', 'emergency', 'freakout', 'alarm', 'crash in prod', 'fired', 'danger', 'deadline']):
            hook_profile = 'panic_overhead'
        elif any(k in combined_meta for k in ['secret', 'conspiracy', 'truth', 'rant', 'nobody tells you', 'replace', 'dirty secret', 'whisper', 'gossip', 'unpopular']):
            hook_profile = 'dutch_whisper'
        elif any(k in combined_meta for k in ['roast', 'sarcasm', 'mockery', 'deadpan', 'smug', 'laugh', 'banter', 'resume', 'linkedin', 'interview', 'comedy']):
            hook_profile = 'mockumentary_snap'
        else:
            hook_profile = 'crisis_low_angle' if any(k in env_type.lower() for k in ['desk', 'balcony', 'latenight']) else 'mockumentary_snap'

    print(f"🎬 PROCEDURAL HOOK CAMERA PROFILE: [{hook_profile.upper()}]")

    # Dynamic Focal Length Tuning based on Hook Profile
    if shot1_cam:
        if hook_profile == 'crisis_low_angle':
            shot1_cam.data.lens = 28.0  # Dynamic wide-angle portrait lens for late night crisis
        elif hook_profile == 'panic_overhead':
            shot1_cam.data.lens = 28.0  # Wide-angle overhead view
        elif hook_profile == 'mockumentary_snap':
            shot1_cam.data.lens = 45.0  # Crisp comedy documentary portrait lens
        elif hook_profile == 'dutch_whisper':
            shot1_cam.data.lens = 32.0  # Cinematic conspiratorial wide
        elif hook_profile == 'tracking_stroll':
            shot1_cam.data.lens = 30.0  # Environmental walking 2-shot lens

    base_arm_r_rot = arm_r.rotation_euler.copy() if arm_r else Euler((math.radians(10), 0, math.radians(5)))
    base_mouth_scale = mouth.scale.copy() if mouth else Vector((1.0, 1.0, 1.0))
    base_nozzle_scale = gemini_nozzle.scale.copy() if gemini_nozzle else Vector((1.0, 1.0, 1.0))
    base_spout_scale = gemini_spout.scale.copy() if gemini_spout else Vector((1.0, 1.0, 1.0))

    base_orb_locs = {
        name: obj.location.copy() for name, obj in orbs.items() if obj
    }

    # Identify Speaking Frames
    gemini_speaking_frames = set()
    human_speaking_frames = set()
    for line in lines:
        spk = line.get('speaker', '').lower()
        if 'gemini' in spk or 'popapus' in spk or 'ai' in spk:
            for f in range(line.get('startFrame', 1), line.get('endFrame', 1) + 1):
                gemini_speaking_frames.add(f)
        elif 'human' in spk:
            for f in range(line.get('startFrame', 1), line.get('endFrame', 1) + 1):
                human_speaking_frames.add(f)

    # Build per-character action map from manifest lines for pre-cooked action triggers
    action_map = {}
    for i, line in enumerate(lines):
        spk = line.get('speaker', '').lower()
        speaker_type = 'gemini' if any(k in spk for k in ['gemini', 'popapus', 'ai']) else 'human'
        act = line.get('action') or line.get('emotion')
        st = line.get('startFrame', 1)
        en = line.get('endFrame', st + 60)
        dur = max(1, en - st)
        attack_frames = min(12, max(6, int(dur * 0.18)))
        release_frames = min(12, max(6, int(dur * 0.15)))

        if act:
            for f in range(st, en + 1):
                local_f = f - st
                if local_f < attack_frames:
                    if i == 0 and st <= 3:
                        # CRITICAL RETENTION HOOK: Frame 1 must NOT start in neutral rest pose!
                        # Start at 0.65+ velocity so speaker is ALREADY in sudden motion at 0.0s
                        p_raw = min(1.0, 0.65 + (local_f / float(max(1, attack_frames))) * 0.35)
                        p_ease = p_raw
                    else:
                        p_raw = local_f / float(attack_frames)
                        p_ease = 1.0 - math.pow(1.0 - p_raw, 3.0)  # Snappy 0.35s attack pop
                elif local_f > (dur - release_frames):
                    p_raw = (en - f) / float(release_frames)
                    p_ease = p_raw * p_raw  # Clean settle back to neutral
                else:
                    p_ease = 1.0  # Sustained hold with alive nodding/gestures
                action_map[(speaker_type, f)] = (act, p_ease)

        # Reactive listener acting: when Gemini speaks, Human reacts with active facial expressions & gestures!
        react_act = line.get('reaction') or line.get('human_reaction')
        if not react_act and speaker_type == 'gemini':
            # Default reaction while Gemini speaks/roasts: skeptical lean, double take, or shrug
            react_act = 'shrug' if i >= len(lines) - 2 else 'skeptical_lean'

        if react_act:
            listener_type = 'human' if speaker_type == 'gemini' else 'gemini'
            for f in range(st, en + 1):
                local_f = f - st
                if local_f < attack_frames:
                    p_raw = local_f / float(attack_frames)
                    p_ease = 1.0 - math.pow(1.0 - p_raw, 3.0)
                elif local_f > (dur - release_frames):
                    p_raw = (en - f) / float(release_frames)
                    p_ease = p_raw * p_raw
                else:
                    p_ease = 1.0
                action_map[(listener_type, f)] = (react_act, p_ease)

    # Clear old animations
    anim_objects = [human, gemini_root, cam_wide, cam_human, cam_gemini,
                    leg_l, leg_r, arm_l, arm_r, hand_l, hand_r,
                    head_pivot, mouth, gemini_nozzle, gemini_spout,
                    eye_l, eye_r, gemini_eye_l, gemini_eye_r]
    for obj in anim_objects + list(orbs.values()):
        if obj:
            obj.animation_data_clear()

    # Kinematic Arm-Hand Solver (Zero Floating Gap)
    def update_arm_hand_kinematics(arm, hand, shoulder_pos, hand_pos, frame_num):
        if not arm or not hand:
            return
        hand.location = hand_pos
        hand.keyframe_insert(data_path="location", frame=frame_num)

        vec = hand_pos - shoulder_pos
        dist = vec.length
        arm.location = (shoulder_pos + hand_pos) * 0.5
        arm.scale = Vector((1.0, 1.0, max(0.1, dist / 0.46)))
        rot_quat = Vector((0, 0, -1)).rotation_difference(vec.normalized())
        arm.rotation_euler = rot_quat.to_euler()
        arm.keyframe_insert(data_path="location", frame=frame_num)
        arm.keyframe_insert(data_path="rotation_euler", frame=frame_num)
        arm.keyframe_insert(data_path="scale", frame=frame_num)

    # 4. Continuous Stroll or Conversational Motion
    is_walk_scene = env_type in ['daylight_walk', 'neon_datacenter', 'datacenter', 'server_room', 'daylight_server_room']
    walk_speed = 0.35 if is_walk_scene else 0.0
    is_couch = 'couch' in env_type.lower()
    is_balcony = 'balcony' in env_type.lower()

    # Natural Blink Frames (~every 3.5 seconds)
    blink_cycles = [f for f in range(40, total_frames, 105)]

    for f in range(1, total_frames + 1):
        t = f / float(fps)
        is_gemini_speaking = f in gemini_speaking_frames
        is_human_speaking = f in human_speaking_frames
        y_walk = -walk_speed * t
        handled_human = False
        handled_gemini = False

        # Check action library for expressive human/gemini gestures (ACTIVE IN ALL SCENES: WALKING OR SEATED!)
        if ('human', f) in action_map:
            act_tag, prog = action_map[('human', f)]
            handled_human = action_library.trigger_action('human', act_tag, bpy.data.objects, prog, f, time_sec=t)
        if ('gemini', f) in action_map:
            act_tag, prog = action_map[('gemini', f)]
            handled_gemini = action_library.trigger_action('gemini', act_tag, bpy.data.objects, prog, f, time_sec=t)

        if is_walk_scene:
            # Human Stroll Bounce & Stride
            walk_bounce = abs(math.sin(t * 8.5)) * 0.012
            if human:
                human.location = (0.0, base_human_y + y_walk, walk_bounce)
                human.keyframe_insert(data_path="location", frame=f)

            # Stride rotation: negative X swings forward (-Y), positive X swings backward (+Y)
            stride = math.sin(t * 8.5)
            stride_angle = stride * math.radians(16.0)
            if leg_l:
                leg_l.rotation_euler.x = -stride_angle
                leg_l.keyframe_insert(data_path="rotation_euler", frame=f)
            if leg_r:
                leg_r.rotation_euler.x = stride_angle
                leg_r.keyframe_insert(data_path="rotation_euler", frame=f)

            # Contralateral Arm & Hand Walking Swing (ONLY when no explicit upper-body gesture handled)
            if not handled_human:
                arm_r_pitch = math.radians(12.0) + (stride * math.radians(15.0))
                arm_l_pitch = math.radians(12.0) - (stride * math.radians(15.0))

                sh_r_local = Vector((0.36, 0.95, 1.25))
                sh_l_local = Vector((-0.36, 0.95, 1.25))

                pos_hand_r = Vector((0.34, 0.95 - math.sin(arm_r_pitch) * 0.44, 1.25 - math.cos(arm_r_pitch) * 0.44))
                pos_hand_l = Vector((-0.34, 0.95 - math.sin(arm_l_pitch) * 0.44, 1.25 - math.cos(arm_l_pitch) * 0.44))

                update_arm_hand_kinematics(arm_r, hand_r, sh_r_local, pos_hand_r, f)
                update_arm_hand_kinematics(arm_l, hand_l, sh_l_local, pos_hand_l, f)

            # Gemini Stable Flight Alongside Human
            if gemini_root:
                hover_bob = math.sin(t * 2.2) * 0.012
                forward_glide = -0.06 if is_gemini_speaking else 0.0
                gemini_root.location = (
                    base_gemini_loc.x,
                    base_gemini_loc.y + y_walk + forward_glide,
                    base_gemini_loc.z + hover_bob
                )
                gemini_root.keyframe_insert(data_path="location", frame=f)

            # Environmental Detail: Gentle Wind Sway on Tree Canopies (Daylight Walk Only)
            if env_type == 'daylight_walk':
                tree_y_pos = [18, 11, 4, -3, -10, -17, -24, -31, -38]
                for ti in range(min(9, len(tree_y_pos))):
                    canopy = bpy.data.objects.get(f"Env_Tree_Canopy_{ti}")
                    if canopy:
                        canopy.location.x = -1.6 + math.sin(t * 2.2 + ti * 1.1) * 0.04
                        canopy.location.y = tree_y_pos[ti] + math.cos(t * 1.8 + ti * 0.9) * 0.03
                        canopy.keyframe_insert(data_path="location", frame=f)

                # Continuous Moving Road Traffic (Daylight Walk - Cars never run out of gas!)
                # Car 1: Red Sedan (Overtaking traffic driving in -Y direction, lane X = 1.15)
                # Cycle: 150 frames (5.0s). rel_y sweeps smoothly from +14m down to -14m
                cycle_len = 150
                p1 = (f % cycle_len) / float(cycle_len)
                rel_y1 = 14.0 - p1 * 28.0
                if car1:
                    car1.location = (1.15, base_human_y + y_walk + rel_y1, -0.04)
                    car1.rotation_euler = (0, 0, math.pi)
                    car1.keyframe_insert(data_path="location", frame=f)
                    car1.keyframe_insert(data_path="rotation_euler", frame=f)

                # Car 2: White Hatchback (Oncoming traffic driving in +Y direction, lane X = 1.95)
                # Offset by 75 frames (half cycle) so cars alternate passing
                p2 = ((f + 75) % cycle_len) / float(cycle_len)
                rel_y2 = -14.0 + p2 * 28.0
                if car2:
                    car2.location = (1.95, base_human_y + y_walk + rel_y2, -0.04)
                    car2.rotation_euler = (0, 0, 0)
                    car2.keyframe_insert(data_path="location", frame=f)
                    car2.keyframe_insert(data_path="rotation_euler", frame=f)
        else:
            # Stationary Stage Breathing / Subtle Motion
            if human:
                breathe = math.sin(t * 2.0) * 0.003
                human.location = (base_human_x, base_human_y, base_human_z + breathe)
                human.keyframe_insert(data_path="location", frame=f)

            if is_couch:
                sh_l = Vector((-0.33, 0.98, 1.30))
                sh_r = Vector((0.33, 0.98, 1.30))
            else:
                sh_l = Vector((-0.33, 0.95, 1.30))
                sh_r = Vector((0.33, 0.95, 1.30))

            if not handled_human:
                if any(k in env_type.lower() for k in ['desk', 'office', 'workplace', 'station', 'console', 'latenight']):
                    # Hands rest on laptop keyboard, typing nervously
                    speed = 22.0 if is_human_speaking else 14.0
                    typing_l = (math.sin(t * speed) * 0.010)
                    typing_r = (math.cos(t * (speed * 0.85)) * 0.010)
                    pos_hand_l = Vector((-0.06, 0.48, 0.905 + typing_l))
                    pos_hand_r = Vector((0.12, 0.48, 0.905 + typing_r))
                    update_arm_hand_kinematics(arm_l, hand_l, sh_l, pos_hand_l, f)
                    update_arm_hand_kinematics(arm_r, hand_r, sh_r, pos_hand_r, f)
                elif is_couch:
                    # Cozy Living Couch: relaxed resting on lap or conversational gestures
                    if is_human_speaking:
                        gesture_lift_r = math.sin(t * 4.5) * 0.04
                        gesture_sway_r = math.cos(t * 2.2) * 0.03
                        pos_hand_r = Vector((0.24 + gesture_sway_r, 0.65, 1.05 + gesture_lift_r))
                        update_arm_hand_kinematics(arm_r, hand_r, sh_r, pos_hand_r, f)

                        pos_hand_l = Vector((-0.20, 0.76, 0.96))
                        update_arm_hand_kinematics(arm_l, hand_l, sh_l, pos_hand_l, f)
                    else:
                        pos_hand_l = Vector((-0.20, 0.76, 0.96))
                        update_arm_hand_kinematics(arm_l, hand_l, sh_l, pos_hand_l, f)
                        pos_hand_r = Vector((0.20, 0.76, 0.96))
                        update_arm_hand_kinematics(arm_r, hand_r, sh_r, pos_hand_r, f)
                elif is_balcony:
                    # Night Balcony: leaning on rail ledge or conversational gestures
                    if is_human_speaking:
                        gesture_lift_r = math.sin(t * 4.8) * 0.05
                        pos_hand_r = Vector((0.22, 0.85, 1.05 + gesture_lift_r))
                        update_arm_hand_kinematics(arm_r, hand_r, sh_r, pos_hand_r, f)

                        pos_hand_l = Vector((-0.24, 0.98, 0.84))
                        update_arm_hand_kinematics(arm_l, hand_l, sh_l, pos_hand_l, f)
                    else:
                        pos_hand_l = Vector((-0.24, 0.98, 0.84))
                        update_arm_hand_kinematics(arm_l, hand_l, sh_l, pos_hand_l, f)
                        pos_hand_r = Vector((0.24, 0.98, 0.84))
                        update_arm_hand_kinematics(arm_r, hand_r, sh_r, pos_hand_r, f)
                else:
                    # Cafe / outdoor pose: expressive conversational gestures
                    if is_human_speaking:
                        gesture_lift_r = math.sin(t * 4.8) * 0.055
                        gesture_sway_r = math.cos(t * 2.4) * 0.040
                        pos_hand_r = Vector((0.26 + gesture_sway_r, 0.52, 0.96 + gesture_lift_r))
                        update_arm_hand_kinematics(arm_r, hand_r, sh_r, pos_hand_r, f)

                        gesture_lift_l = math.cos(t * 3.2) * 0.025
                        pos_hand_l = Vector((-0.20, 0.58, 0.90 + gesture_lift_l))
                        update_arm_hand_kinematics(arm_l, hand_l, sh_l, pos_hand_l, f)
                    else:
                        pos_hand_l = Vector((-0.22, 0.62, 0.90))
                        update_arm_hand_kinematics(arm_l, hand_l, sh_l, pos_hand_l, f)
                        pos_hand_r = Vector((0.24, 0.58, 0.90))
                        update_arm_hand_kinematics(arm_r, hand_r, sh_r, pos_hand_r, f)

            if not handled_gemini and gemini_root:
                hover_bob = math.sin(t * 1.8) * 0.012
                forward_glide = -0.05 if is_gemini_speaking else 0.0
                gemini_root.location = (
                    base_gemini_loc.x,
                    base_gemini_loc.y + forward_glide,
                    base_gemini_loc.z + hover_bob
                )
                gemini_root.keyframe_insert(data_path="location", frame=f)

        # 4b. PROCEDURAL RETENTION HOOK: Context-Aware Dynamic Camera Motion (Frames 1-10)
        # Driven by the detected hook_profile (crisis_low_angle, mockumentary_snap, panic_overhead, etc.)
        crash_zoom_offset = 0.0
        crash_z_offset = 0.0
        crash_x_offset = 0.0
        crash_pitch_offset = 0.0
        crash_dutch_roll = 0.0

        if hook_profile == 'crisis_low_angle':
            # Low-angle upward crisis punch (+16 deg pitch, 12 deg Dutch roll, -0.28m Z elevation)
            if f <= 10:
                prog = (f - 1) / 9.0
                ease = math.pow(1.0 - prog, 2.2)
                crash_zoom_offset = -0.75 * ease
                crash_z_offset = -0.28 * ease
                crash_pitch_offset = math.radians(16.0) * ease
                crash_dutch_roll = math.radians(12.0) * ease
        elif hook_profile == 'mockumentary_snap':
            # Snappy The-Office style crash zoom (0.2s rapid snap into extreme close-up)
            if f <= 6:
                prog = (f - 1) / 5.0
                ease = math.pow(1.0 - prog, 3.0)
                crash_zoom_offset = -1.10 * ease
        elif hook_profile == 'panic_overhead':
            # Overhead panic cam (-20 deg down-tilt, +0.38m high Z, diving into desk)
            if f <= 10:
                prog = (f - 1) / 9.0
                ease = math.pow(1.0 - prog, 2.2)
                crash_zoom_offset = -0.50 * ease
                crash_z_offset = 0.38 * ease
                crash_pitch_offset = math.radians(-20.0) * ease
                crash_dutch_roll = math.radians(-10.0) * ease
        elif hook_profile == 'dutch_whisper':
            # Leaked POV / dramatic conspiracy slant (15 deg roll, X sweep)
            if f <= 10:
                prog = (f - 1) / 9.0
                ease = math.pow(1.0 - prog, 2.0)
                crash_zoom_offset = -0.60 * ease
                crash_x_offset = 0.18 * ease
                crash_pitch_offset = math.radians(6.0) * ease
                crash_dutch_roll = math.radians(15.0) * ease
        elif hook_profile == 'tracking_stroll':
            # Dynamic tracking with slight 4 deg organic roll
            if f <= 8:
                prog = (f - 1) / 7.0
                ease = math.pow(1.0 - prog, 2.0)
                crash_zoom_offset = -0.45 * ease
                crash_dutch_roll = math.radians(4.0) * ease

        if cam_wide:
            cam_wide.location = (base_cam_wide_loc.x, base_cam_wide_loc.y + y_walk, base_cam_wide_loc.z)
            cam_wide.keyframe_insert(data_path="location", frame=f)

        if cam_human:
            h_y = crash_zoom_offset if shot1_cam == cam_human else 0.0
            h_z = crash_z_offset if shot1_cam == cam_human else 0.0
            h_x = crash_x_offset if shot1_cam == cam_human else 0.0
            h_roll = crash_dutch_roll if shot1_cam == cam_human else 0.0
            h_pitch = crash_pitch_offset if shot1_cam == cam_human else 0.0

            cam_human.location = (base_cam_human_loc.x + h_x, base_cam_human_loc.y + y_walk + h_y, base_cam_human_loc.z + h_z)
            cam_human.rotation_euler = (base_cam_human_rot.x + h_pitch, base_cam_human_rot.y + h_roll, base_cam_human_rot.z)
            cam_human.keyframe_insert(data_path="location", frame=f)
            cam_human.keyframe_insert(data_path="rotation_euler", frame=f)

        if cam_gemini:
            g_y = crash_zoom_offset if shot1_cam == cam_gemini else 0.0
            g_z = crash_z_offset if shot1_cam == cam_gemini else 0.0
            g_x = crash_x_offset if shot1_cam == cam_gemini else 0.0
            g_roll = crash_dutch_roll if shot1_cam == cam_gemini else 0.0
            g_pitch = crash_pitch_offset if shot1_cam == cam_gemini else 0.0

            cam_gemini.location = (base_cam_gemini_loc.x + g_x, base_cam_gemini_loc.y + y_walk + g_y, base_cam_gemini_loc.z + g_z)
            cam_gemini.rotation_euler = (base_cam_gemini_rot.x + g_pitch, base_cam_gemini_rot.y + g_roll, base_cam_gemini_rot.z)
            cam_gemini.keyframe_insert(data_path="location", frame=f)
            cam_gemini.keyframe_insert(data_path="rotation_euler", frame=f)

        # 5. Natural Conversational Head Nodding & Dynamic Expressive Tilts
        if head_pivot and not handled_human:
            recline_offset = math.radians(7.5) if is_couch else 0.0
            if is_human_speaking:
                speech_nod = math.sin(t * 5.2) * math.radians(5.5)
                speech_tilt = math.cos(t * 2.6) * math.radians(2.5)
                head_pivot.rotation_euler = (recline_offset + speech_nod, speech_tilt, math.radians(6.0))
            else:
                listen_nod = math.sin(t * 1.8) * math.radians(1.8)
                head_pivot.rotation_euler = (recline_offset + listen_nod, math.radians(-1.5), math.radians(8.0))
            head_pivot.keyframe_insert(data_path="rotation_euler", frame=f)

        # 6. Gemini's 4 Floating Head Orbs Animation (Harmonic Floating Orbits)
        orb_speed_mult = 1.7 if is_gemini_speaking else 1.0
        if 'blue' in base_orb_locs and orbs['blue']:
            b_loc = base_orb_locs['blue']
            orbs['blue'].location = (
                b_loc.x + math.cos(t * 2.0 * orb_speed_mult) * 0.024,
                b_loc.y + math.sin(t * 2.0 * orb_speed_mult) * 0.024,
                b_loc.z + math.sin(t * 3.6) * 0.014
            )
            orbs['blue'].keyframe_insert(data_path="location", frame=f)

        if 'green' in base_orb_locs and orbs['green']:
            g_loc = base_orb_locs['green']
            orbs['green'].location = (
                g_loc.x + math.cos(t * 2.4 * orb_speed_mult + 1.2) * 0.020,
                g_loc.y + math.sin(t * 2.4 * orb_speed_mult + 1.2) * 0.020,
                g_loc.z + math.cos(t * 3.2) * 0.016
            )
            orbs['green'].keyframe_insert(data_path="location", frame=f)

        if 'red' in base_orb_locs and orbs['red']:
            r_loc = base_orb_locs['red']
            orbs['red'].location = (
                r_loc.x + math.cos(t * 1.8 * orb_speed_mult + 2.5) * 0.026,
                r_loc.y + math.sin(t * 1.8 * orb_speed_mult + 2.5) * 0.026,
                r_loc.z + math.sin(t * 2.8) * 0.018
            )
            orbs['red'].keyframe_insert(data_path="location", frame=f)

        if 'yellow' in base_orb_locs and orbs['yellow']:
            y_loc = base_orb_locs['yellow']
            orbs['yellow'].location = (
                y_loc.x + math.cos(t * 2.2 * orb_speed_mult + 3.8) * 0.022,
                y_loc.y + math.sin(t * 2.2 * orb_speed_mult + 3.8) * 0.022,
                y_loc.z + math.cos(t * 3.5) * 0.015
            )
            orbs['yellow'].keyframe_insert(data_path="location", frame=f)

        # 7. Natural Cute Eye Blinks (Every 3.5s)
        is_blinking = any(0 <= (f - bc) <= 2 for bc in blink_cycles)
        blink_scale = 0.08 if is_blinking else 1.0

        for eye in [eye_l, eye_r, gemini_eye_l, gemini_eye_r]:
            if eye:
                eye.scale.z = blink_scale
                eye.keyframe_insert(data_path="scale", frame=f)

    # 8. Natural Expressive Lip-Sync (Human & Gemini)
    for line in lines:
        s_frame = line.get('startFrame', 1)
        e_frame = line.get('endFrame', s_frame + 60)
        speaker = line.get('speaker', '').lower()

        if 'human' in speaker and mouth:
            # Natural 7.5 Hz jaw opening with organic syllable cadence
            for f in range(s_frame, e_frame + 1):
                t = f / float(fps)
                syllable = 0.5 + 0.5 * (math.sin(t * 15.0) * math.cos(t * 7.5))
                mouth.scale.x = base_mouth_scale.x * (1.0 + syllable * 1.30) # Vertical jaw drop
                mouth.scale.z = base_mouth_scale.z * (1.0 + (syllable - 0.5) * 0.18) # Width modulation
                mouth.keyframe_insert(data_path="scale", frame=f)

            mouth.scale = base_mouth_scale
            mouth.keyframe_insert(data_path="scale", frame=e_frame + 1)

        elif ('gemini' in speaker or 'popapus' in speaker or 'ai' in speaker):
            # Gemini Vocal Articulation (Nozzle & Spout Pulsing)
            for f in range(s_frame, e_frame + 1):
                t = f / float(fps)
                g_syllable = 0.5 + 0.5 * math.sin(t * 16.0)
                if gemini_nozzle:
                    gemini_nozzle.scale = (
                        base_nozzle_scale.x * (1.0 + g_syllable * 0.28),
                        base_nozzle_scale.y * (1.0 + g_syllable * 0.28),
                        base_nozzle_scale.z * (1.0 + g_syllable * 0.28)
                    )
                    gemini_nozzle.keyframe_insert(data_path="scale", frame=f)

                if gemini_spout:
                    gemini_spout.scale = (
                        base_spout_scale.x * (1.0 + g_syllable * 0.25),
                        base_spout_scale.y * (1.0 + g_syllable * 0.25),
                        base_spout_scale.z * (1.0 + g_syllable * 0.25)
                    )
                    gemini_spout.keyframe_insert(data_path="scale", frame=f)

            if gemini_nozzle:
                gemini_nozzle.scale = base_nozzle_scale
                gemini_nozzle.keyframe_insert(data_path="scale", frame=e_frame + 1)
            if gemini_spout:
                gemini_spout.scale = base_spout_scale
                gemini_spout.keyframe_insert(data_path="scale", frame=e_frame + 1)

    # Smooth Bezier curves on all animated objects
    for obj in anim_objects + list(orbs.values()):
        if obj:
            make_fcurves_linear(obj)

# =========================================================================
# MAIN DIRECTOR ENTRYPOINT
# =========================================================================

def execute_comedy_production(manifest_path, output_path, is_qa_mode=False, corrections_path=None, start_frame=None, end_frame=None):
    manifest_path = os.path.abspath(manifest_path)
    output_path = os.path.abspath(output_path)
    if corrections_path:
        corrections_path = os.path.abspath(corrections_path)

    print(f"\n=================================================================")
    print(f"🎬 RELATABLE COMEDY 3D DIRECTOR: {manifest_path}")
    print(f"=================================================================\n")

    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    total_frames = manifest.get('totalFrames', 720)
    fps = manifest.get('fps', 30)
    stage_recipe = manifest.get('stage_recipe') or {}
    env_type = stage_recipe.get('theme') or manifest.get('environment', 'daylight_walk')

    script_dir = os.path.dirname(os.path.abspath(__file__))
    blend_path = os.path.abspath(os.path.join(script_dir, "..", "agent_comedy_stage.blend"))
    if not os.path.exists(blend_path):
        blend_path = r"D:\New folder (2)\blender_engine\agent_comedy_stage.blend"

    print(f"📦 Loading Master Character Assets from: {blend_path}")
    bpy.ops.wm.open_mainfile(filepath=blend_path)

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 8
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.fps = fps
    scene.frame_start = int(start_frame) if start_frame is not None else 1
    scene.frame_end = int(end_frame) if end_frame is not None else total_frames

    # Dynamic Environment Switching: Check for Declarative Procedural Stage Recipe first
    stage_recipe = manifest.get('stage_recipe')
    if stage_recipe:
        print(f"🎨 [Director] Procedural Stage Recipe detected for theme: '{stage_recipe.get('theme', 'custom')}'")
        from procedural_stage_builder import build_procedural_stage_from_recipe
        build_procedural_stage_from_recipe(stage_recipe, total_frames=total_frames)
    elif env_type in ['latenight_desk', 'desk', 'bedroom']:
        configure_latenight_desk_stage()
    elif env_type in ['cozy_living_couch', 'couch', 'living_room', 'sanctuary']:
        configure_cozy_living_couch_stage()
    elif env_type in ['night_balcony_skyline', 'balcony', 'skyline', 'rooftop']:
        configure_night_balcony_skyline_stage()
    elif env_type == 'cafe_corner':
        configure_cafe_corner_stage()
    elif env_type in ['neon_datacenter', 'datacenter', 'server_room', 'daylight_server_room']:
        is_day = any(k in env_type for k in ['day', 'daylight', 'morning']) or (manifest.get('slot') == 'daytime')
        configure_neon_datacenter_stage(daylight=is_day)
    elif env_type in ['park_garden', 'park', 'garden']:
        configure_park_garden_stage()
    elif env_type in ['corporate_office', 'office', 'workplace']:
        configure_corporate_office_stage()
    else:
        configure_daylight_walk_stage()

    # Deterministic Scene Graph Validation & Self-Correction (Zero API Dependency)
    try:
        import auto_scene_validator
        cam_mode = (manifest.get('stage_recipe') or {}).get('camera_mode', 'seated' if any(k in env_type for k in ['desk', 'office', 'sanctuary', 'couch', 'living', 'cafe']) else 'standing_walk')
        auto_scene_validator.validate_and_autocorrect_scene(stage_theme=env_type, camera_mode=cam_mode)
    except Exception as e:
        print(f"⚠️ [Scene Validator notice]: {e}")

    # Cinematography, Mouth Movement, Orbs & Acting
    setup_master_cinematography_and_acting(manifest)

    # Apply Watchdog Spatial Corrections if provided
    if corrections_path and os.path.exists(corrections_path):
        print(f"🛠️ [Director] Applying Watchdog spatial corrections from: {corrections_path}")
        from apply_watchdog_corrections import apply_watchdog_corrections
        apply_watchdog_corrections(corrections_path)

    # Render QA Stills or Full Animation
    if is_qa_mode:
        print("\n📸 Rendering QA Verification Stills for each dialogue turn...")
        dir_name = os.path.dirname(output_path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)

        lines = manifest.get('lines', [])
        for i, line in enumerate(lines):
            sf = int(line.get('startFrame', i * 60 + 1))
            ef = int(line.get('endFrame', (i + 1) * 60))
            mid_f = (sf + ef) // 2
            scene.frame_set(mid_f)

            active_cam = bpy.data.objects.get('Cam_Wide')
            for marker in sorted(scene.timeline_markers, key=lambda m: m.frame):
                if marker.frame <= mid_f and marker.camera:
                    active_cam = marker.camera
            scene.camera = active_cam

            still_path = f"{output_path}turn_{i:02d}_{line.get('speaker', 'char')}_f{mid_f:04d}.jpg"
            scene.render.filepath = still_path
            scene.render.image_settings.file_format = 'JPEG'
            scene.render.image_settings.quality = 95
            bpy.ops.render.render(write_still=True)
            print(f"  • Turn {i:02d} ({line.get('speaker')} via {active_cam.name} @ frame {mid_f}): {still_path}")

        print("✅ QA Stills Generation Complete!")
    else:
        print(f"\n🚀 Rendering Full Relatable Sequence (Frames 1..{total_frames}) to: {output_path}...")
        dir_name = os.path.dirname(output_path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)

        scene.render.filepath = output_path
        scene.render.image_settings.file_format = 'JPEG'
        scene.render.image_settings.quality = 95
        bpy.ops.render.render(animation=True)
        print("✅ Full Animation Render Complete!")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, help="Path to episode_manifest.json")
    parser.add_argument("--output", required=True, help="Output image sequence or video path")
    parser.add_argument("--qa-stills", action="store_true", help="Render QA stills for dialogue lines")
    parser.add_argument("--frames", action="store_true", help="Render full sequence as image frames")
    parser.add_argument("--corrections", default=None, help="Path to watchdog corrections.json")
    parser.add_argument("--start-frame", type=int, default=None, help="Start frame for sequence render")
    parser.add_argument("--end-frame", type=int, default=None, help="End frame for sequence render")
    if "--" in sys.argv:
        script_args = sys.argv[sys.argv.index("--") + 1:]
    else:
        script_args = sys.argv[1:]
    args = parser.parse_args(script_args)

    execute_comedy_production(args.manifest, args.output, is_qa_mode=args.qa_stills, corrections_path=args.corrections, start_frame=args.start_frame, end_frame=args.end_frame)
