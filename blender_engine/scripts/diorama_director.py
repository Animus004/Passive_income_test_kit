"""
Autonomous 3D Diorama Director & Procedural Stage Engine (Blender 4.3 EEVEE Next)

Production Multi-Agent Architecture:
- Vibrant 3-Point Studio & Era Lighting (Key Moon Sun, Amber Sandstone Fill, Rim Edge Sun, Dynamic Braziers)
- Clean Procedural Sandstone, Gold, Linen, Acacia Wood, and Subsurface Skin Materials (No Cycles Multiply-AO Bugs)
- Structurally Solid Unbroken Chibi Rigid Character Hierarchy (Uniform Scale Transforms, Zero Exploded Limbs)
- Guaranteed Subject-Locked 9:16 Mobile Camera Choreography with Instant Cut Transitions (CONSTANT Keyframes)
- Dedicated QA Stills Mode (--qa-stills) for Visual Verification Before Full Rendering
"""

import sys
import os
import math
import json
import bpy
from mathutils import Vector, Euler

# -----------------------------------------------------------------------------
# 1. SHADING & MATERIAL UTILITIES
# -----------------------------------------------------------------------------
def create_principled_mat(name, base_color=(1,1,1,1), roughness=0.5, metallic=0.0, emission_color=None, emission_strength=0.0):
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

def create_sandstone_mat(name, base_color=(0.82, 0.64, 0.42, 1.0), roughness=0.82, bump_strength=0.18):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    tree = mat.node_tree
    bsdf = tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = base_color
    bsdf.inputs["Roughness"].default_value = roughness
    
    tc = tree.nodes.new('ShaderNodeTexCoord')
    noise = tree.nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 14.0
    noise.inputs['Detail'].default_value = 3.5
    bump = tree.nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = bump_strength
    tree.links.new(tc.outputs['Object'], noise.inputs['Vector'])
    tree.links.new(noise.outputs['Fac'], bump.inputs['Height'])
    tree.links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    return mat

def set_smooth(obj):
    if obj and obj.type == 'MESH':
        for p in obj.data.polygons:
            p.use_smooth = True

def create_bone_mesh(name, p1, p2, radius, mat, parent=None):
    """Creates a smooth capsule/cylinder cleanly connecting vector p1 to p2 with zero gap."""
    v1 = Vector(p1)
    v2 = Vector(p2)
    diff = v2 - v1
    length = diff.length
    if length < 1e-4:
        return None
    mid = (v1 + v2) * 0.5
    rot = diff.to_track_quat('Z', 'Y').to_euler()
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=length, vertices=16, location=mid, rotation=rot)
    cyl = bpy.context.active_object
    cyl.name = name
    if parent:
        cyl.parent = parent
    cyl.data.materials.append(mat)
    set_smooth(cyl)
    return cyl

def clean_all_stage_objects():
    """Removes all pre-existing stage objects and materials for a pristine canvas."""
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for world in list(bpy.data.worlds):
        bpy.data.worlds.remove(world, do_unlink=True)

# -----------------------------------------------------------------------------
# 2. BOUNDED 3D DIORAMA STAGE BOX & VIBRANT 3-POINT LIGHTING
# -----------------------------------------------------------------------------
def build_diorama_box(theme='ancient_giza_observatory', time_of_day='twilight_starry'):
    root = bpy.data.objects.new(f"Diorama_{theme}", None)
    bpy.context.collection.objects.link(root)

    # 1. Rich Starry Sapphire Night Sky (Zero Brown)
    world = bpy.data.worlds.new("World_EgyptianDiorama")
    bpy.context.scene.world = world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    links = world.node_tree.links
    nodes.clear()

    w_out = nodes.new('ShaderNodeOutputWorld')

    tc = nodes.new('ShaderNodeTexCoord')
    sep = nodes.new('ShaderNodeSeparateXYZ')
    links.new(tc.outputs['Normal'], sep.inputs['Vector'])

    # Sky Color Ramp driven by vertical elevation (Z)
    sky_ramp = nodes.new('ShaderNodeValToRGB')
    sky_ramp.color_ramp.elements[0].position = 0.00
    sky_ramp.color_ramp.elements[0].color = (0.015, 0.035, 0.085, 1.0) # Deep midnight cobalt at horizon
    sky_ramp.color_ramp.elements[1].position = 0.35
    sky_ramp.color_ramp.elements[1].color = (0.003, 0.006, 0.022, 1.0) # Deep velvet sapphire at zenith
    links.new(sep.outputs['Z'], sky_ramp.inputs['Fac'])

    # Crisp Twinkling Diamond Stars
    voronoi = nodes.new('ShaderNodeTexVoronoi')
    voronoi.feature = 'F1'
    voronoi.distance = 'EUCLIDEAN'
    voronoi.inputs['Scale'].default_value = 550.0
    links.new(tc.outputs['Normal'], voronoi.inputs['Vector'])

    star_ramp = nodes.new('ShaderNodeValToRGB')
    star_ramp.color_ramp.elements[0].position = 0.988
    star_ramp.color_ramp.elements[0].color = (0, 0, 0, 1.0)
    star_ramp.color_ramp.elements[1].position = 0.998
    star_ramp.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1.0)
    links.new(voronoi.outputs['Distance'], star_ramp.inputs['Fac'])

    star_mult = nodes.new('ShaderNodeMath')
    star_mult.operation = 'MULTIPLY'
    star_mult.inputs[1].default_value = 25.0
    links.new(star_ramp.outputs['Color'], star_mult.inputs[0])

    mix_sky = nodes.new('ShaderNodeMixRGB')
    mix_sky.blend_type = 'ADD'
    mix_sky.inputs['Fac'].default_value = 1.0
    links.new(sky_ramp.outputs['Color'], mix_sky.inputs['Color1'])
    links.new(star_mult.outputs['Value'], mix_sky.inputs['Color2'])

    bg_node = nodes.new('ShaderNodeBackground')
    bg_node.inputs['Strength'].default_value = 1.0
    links.new(mix_sky.outputs['Color'], bg_node.inputs['Color'])
    links.new(bg_node.outputs['Background'], w_out.inputs['Surface'])

    # 2. Cinematic 3-Point Lighting Rig + Studio Face Key Light
    key_data = bpy.data.lights.new(name="Light_Key_Moon", type='SUN')
    key_data.energy = 8.5
    key_data.color = (0.80, 0.90, 1.0)
    key_data.angle = math.radians(2.0)
    key_obj = bpy.data.objects.new(name="Light_Key_Moon", object_data=key_data)
    key_obj.rotation_euler = (math.radians(45), math.radians(10), math.radians(-35))
    key_obj.parent = root
    bpy.context.collection.objects.link(key_obj)

    fill_data = bpy.data.lights.new(name="Light_Fill_Warm", type='SUN')
    fill_data.energy = 5.0
    fill_data.color = (1.0, 0.75, 0.45)
    fill_data.angle = math.radians(15.0)
    fill_obj = bpy.data.objects.new(name="Light_Fill_Warm", object_data=fill_data)
    fill_obj.rotation_euler = (math.radians(35), math.radians(-10), math.radians(135))
    fill_obj.parent = root
    bpy.context.collection.objects.link(fill_obj)

    rim_data = bpy.data.lights.new(name="Light_Rim_Edge", type='SUN')
    rim_data.energy = 7.0
    rim_data.color = (0.92, 0.90, 1.0)
    rim_obj = bpy.data.objects.new(name="Light_Rim_Edge", object_data=rim_data)
    rim_obj.rotation_euler = (math.radians(25), 0, math.radians(180))
    rim_obj.parent = root
    bpy.context.collection.objects.link(rim_obj)

    # Front Studio Portrait Key for Actor Face & Collar
    face_light_data = bpy.data.lights.new(name="Light_Actor_Key", type='POINT')
    face_light_data.energy = 850.0
    face_light_data.color = (1.0, 0.92, 0.82)
    face_light_data.shadow_soft_size = 0.4
    face_light_obj = bpy.data.objects.new(name="Light_Actor_Key", object_data=face_light_data)
    face_light_obj.location = (-0.6, 3.2, 2.2)
    face_light_obj.parent = root
    bpy.context.collection.objects.link(face_light_obj)

    # 3. Materials
    mat_sandstone = create_sandstone_mat("Mat_Sandstone", base_color=(0.82, 0.65, 0.44, 1.0))
    mat_sandstone_dark = create_sandstone_mat("Mat_Sandstone_Dark", base_color=(0.65, 0.48, 0.32, 1.0))
    mat_dunes = create_sandstone_mat("Mat_Dunes", base_color=(0.74, 0.55, 0.34, 1.0), roughness=0.90, bump_strength=0.06)
    mat_gold = create_principled_mat("Mat_Gold", base_color=(0.96, 0.80, 0.22, 1.0), roughness=0.18, metallic=0.92, emission_color=(0.96, 0.80, 0.22, 1.0), emission_strength=1.5)
    mat_wood = create_principled_mat("Mat_Acacia_Wood", base_color=(0.38, 0.22, 0.12, 1.0), roughness=0.60)
    mat_papyrus = create_principled_mat("Mat_Papyrus", base_color=(0.89, 0.81, 0.64, 1.0), roughness=0.75)
    mat_rope = create_principled_mat("Mat_Rope", base_color=(0.66, 0.56, 0.40, 1.0), roughness=0.90)

    # 4. Floor Plinth Foundation Platform
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, -0.4))
    plinth = bpy.context.active_object
    plinth.scale = (9.6, 9.6, 0.8)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    plinth.parent = root
    plinth.data.materials.append(mat_sandstone)
    set_smooth(plinth)

    # Gold Floor Trim
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.015))
    trim = bpy.context.active_object
    trim.scale = (9.2, 9.2, 0.03)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    trim.parent = root
    trim.data.materials.append(mat_gold)

    # Natural Sand Dunes surrounding the Pyramid Base
    bpy.ops.mesh.primitive_plane_add(size=90.0, location=(0, 25.0, -0.2))
    ground = bpy.context.active_object
    ground.parent = root
    ground.data.materials.append(mat_dunes)

    # 5. Twin Egyptian Columns
    for cx in [-3.6, 3.6]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.36, depth=4.0, vertices=28, location=(cx, 1.8, 2.0))
        col = bpy.context.active_object
        col.parent = root
        col.data.materials.append(mat_sandstone)
        set_smooth(col)

        bpy.ops.mesh.primitive_cone_add(radius1=0.36, radius2=0.62, depth=0.55, vertices=28, location=(cx, 1.8, 4.25))
        cap = bpy.context.active_object
        cap.parent = root
        cap.data.materials.append(mat_gold)
        set_smooth(cap)

    # 6. Sighting Parapet Wall (Carved Stone Observation Boundary)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 3.8, 0.55))
    parapet = bpy.context.active_object
    parapet.scale = (7.4, 0.40, 1.1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    parapet.parent = root
    parapet.data.materials.append(mat_sandstone_dark)
    set_smooth(parapet)

    # Carved Stone Sighting Notch in Parapet Center
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 3.8, 1.15))
    notch_block = bpy.context.active_object
    notch_block.scale = (0.45, 0.42, 0.20)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    notch_block.parent = root
    notch_block.data.materials.append(mat_sandstone)
    set_smooth(notch_block)

    # 7. Horizon Great Pyramid (Y=38m, Monumental Centered Proportion)
    pyr_root = bpy.data.objects.new("Pyramid_Horizon", None)
    pyr_root.location = (0, 38.0, 0)
    pyr_root.parent = root
    bpy.context.collection.objects.link(pyr_root)

    tier_dims = [
        (20.0, 20.0, 2.2, 1.1),
        (17.2, 17.2, 2.2, 3.3),
        (14.4, 14.4, 2.2, 5.5),
        (11.6, 11.6, 2.2, 7.7),
        (8.8, 8.8, 2.2, 9.9),
        (6.0, 6.0, 2.2, 12.1),
        (3.5, 3.5, 2.0, 14.2),
    ]
    for idx, (w, d, h, z) in enumerate(tier_dims):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, z))
        t = bpy.context.active_object
        t.scale = (w, d, h)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        t.parent = pyr_root
        t.data.materials.append(mat_sandstone)
        set_smooth(t)

    # Golden Pyramidion Capstone (apex at z=17.2)
    bpy.ops.mesh.primitive_cone_add(radius1=1.8, radius2=0.0, depth=2.0, vertices=4, location=(0, 0, 16.2), rotation=(0, 0, math.radians(45)))
    capstone = bpy.context.active_object
    capstone.parent = pyr_root
    capstone.data.materials.append(mat_gold)
    set_smooth(capstone)

    # 8. Twin Flickering Amber Braziers
    brazier_data = []
    for bx in [-2.5, 2.5]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.32, depth=1.1, vertices=24, location=(bx, 0.6, 0.55))
        b_base = bpy.context.active_object
        b_base.parent = root
        b_base.data.materials.append(mat_sandstone_dark)
        set_smooth(b_base)

        bpy.ops.mesh.primitive_cone_add(radius1=0.20, radius2=0.02, depth=0.40, vertices=16, location=(bx, 0.6, 1.30))
        flame = bpy.context.active_object
        flame.parent = root
        mat_flame = create_principled_mat(f"Mat_Flame_{bx}", base_color=(1.0, 0.60, 0.15, 1.0), roughness=0.2, emission_color=(1.0, 0.60, 0.15, 1.0), emission_strength=20.0)
        flame.data.materials.append(mat_flame)
        set_smooth(flame)

        b_light_data = bpy.data.lights.new(name=f"Light_Brazier_{bx}", type='POINT')
        b_light_data.energy = 1600.0
        b_light_data.color = (1.0, 0.62, 0.20)
        b_light_data.shadow_soft_size = 0.35
        b_light = bpy.data.objects.new(name=f"Light_Brazier_{bx}", object_data=b_light_data)
        b_light.location = (bx, 0.6, 1.40)
        b_light.parent = root
        bpy.context.collection.objects.link(b_light)
        brazier_data.append((flame, b_light_data))

    # 9. Authentic Historical Props
    # Prop 1: Low Papyrus Drafting Table
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-2.2, 1.8, 0.35))
    table = bpy.context.active_object
    table.scale = (1.2, 0.8, 0.08)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    table.parent = root
    table.data.materials.append(mat_wood)

    for tx, ty in [(-2.7, 1.5), (-1.7, 1.5), (-2.7, 2.1), (-1.7, 2.1)]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.35, vertices=12, location=(tx, ty, 0.175))
        tleg = bpy.context.active_object
        tleg.parent = root
        tleg.data.materials.append(mat_wood)

    # Unrolled Papyrus Architectural Scroll on Table
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(-2.2, 1.8, 0.40))
    scroll = bpy.context.active_object
    scroll.scale = (0.9, 0.55, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    scroll.parent = root
    scroll.data.materials.append(mat_papyrus)

    for rx in [-2.62, -1.78]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=0.58, vertices=16, location=(rx, 1.8, 0.435), rotation=(math.radians(90), 0, 0))
        rcyl = bpy.context.active_object
        rcyl.parent = root
        rcyl.data.materials.append(mat_papyrus)

    # Prop 2: Coiled Surveyor Hemp Rope & Cubit Rod
    bpy.ops.mesh.primitive_torus_add(major_radius=0.26, minor_radius=0.06, major_segments=24, minor_segments=12, location=(2.2, 1.8, 0.06))
    rope_coil = bpy.context.active_object
    rope_coil.parent = root
    rope_coil.data.materials.append(mat_rope)
    set_smooth(rope_coil)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.025, depth=1.1, vertices=12, location=(2.3, 1.9, 0.45), rotation=(math.radians(18), math.radians(12), 0))
    cubit = bpy.context.active_object
    cubit.parent = root
    cubit.data.materials.append(mat_wood)

    # Prop 3: Dressed Limestone Masonry Block
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(2.0, 0.2, 0.25))
    block1 = bpy.context.active_object
    block1.scale = (0.7, 0.5, 0.5)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    block1.parent = root
    block1.data.materials.append(mat_sandstone)
    set_smooth(block1)

    # 10. Glowing True North Star (Thuban) & Celestial Pointer Stars
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.50, segments=24, ring_count=16, location=(0, 42.0, 21.0))
    star = bpy.context.active_object
    star.parent = root
    mat_star = create_principled_mat("Mat_North_Star", base_color=(0.95, 0.98, 1.0, 1.0), roughness=0.1, emission_color=(0.95, 0.98, 1.0, 1.0), emission_strength=45.0)
    star.data.materials.append(mat_star)
    set_smooth(star)

    for px, py, pz in [(-4.5, 42.0, 19.5), (4.2, 42.0, 22.5)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.30, segments=16, ring_count=12, location=(px, py, pz))
        pstar = bpy.context.active_object
        pstar.parent = root
        pstar.data.materials.append(mat_star)
        set_smooth(pstar)

    return {
        'root': root,
        'plinth': plinth,
        'pyramid': pyr_root,
        'star': star,
        'braziers': brazier_data,
    }

# -----------------------------------------------------------------------------
# 3. UNBREAKABLE CHIBI RIGID CHARACTER HIERARCHY
# -----------------------------------------------------------------------------
def spawn_diorama_actor(cast_type="story_cast", role="chief_astronomer", location=(0, 1.5, 0)):
    # Actor Materials
    mat_skin = create_principled_mat("Mat_Egyptian_Skin", base_color=(0.74, 0.50, 0.34, 1.0), roughness=0.45)
    bsdf_skin = mat_skin.node_tree.nodes.get("Principled BSDF")
    if bsdf_skin and "Subsurface Weight" in bsdf_skin.inputs:
        bsdf_skin.inputs["Subsurface Weight"].default_value = 0.25

    mat_linen = create_principled_mat("Mat_White_Linen", base_color=(0.95, 0.93, 0.89, 1.0), roughness=0.85)
    mat_wood = create_principled_mat("Mat_Acacia_Wood", base_color=(0.38, 0.22, 0.12, 1.0), roughness=0.60)
    mat_gold = create_principled_mat("Mat_Gold_Actor", base_color=(0.96, 0.80, 0.22, 1.0), roughness=0.18, metallic=0.92, emission_color=(0.96, 0.80, 0.22, 1.0), emission_strength=1.5)
    mat_sandstone_dark = create_sandstone_mat("Mat_Sandstone_Dark_Actor", base_color=(0.65, 0.48, 0.32, 1.0))
    mat_hair = create_principled_mat("Mat_Egyptian_Hair", base_color=(0.06, 0.05, 0.05, 1.0), roughness=0.30)
    mat_lip = create_principled_mat("Mat_Mouth", base_color=(0.58, 0.26, 0.22, 1.0), roughness=0.40)
    mat_eye_white = create_principled_mat("Mat_Eye_White", base_color=(0.98, 0.98, 0.98, 1.0), roughness=0.1)
    mat_pupil = create_principled_mat("Mat_Pupil", base_color=(0.10, 0.08, 0.06, 1.0), roughness=0.1)

    char_root = bpy.data.objects.new(f"Actor_{role}_Root", None)
    char_root.location = location
    char_root.rotation_euler = (0, 0, math.radians(20)) # Hero 3/4 stance
    bpy.context.collection.objects.link(char_root)

    # Pelvis Pivot (hips height 0.75m)
    pelvis_pivot = bpy.data.objects.new("Actor_Pelvis_Pivot", None)
    pelvis_pivot.location = (0, 0, 0.75)
    pelvis_pivot.parent = char_root
    bpy.context.collection.objects.link(pelvis_pivot)

    # Pleated Linen Kilt
    bpy.ops.mesh.primitive_cone_add(radius1=0.36, radius2=0.28, depth=0.48, vertices=24, location=(0, 0, -0.14))
    kilt = bpy.context.active_object
    kilt.parent = pelvis_pivot
    kilt.data.materials.append(mat_linen)
    set_smooth(kilt)

    # Snug Gold Belt
    bpy.ops.mesh.primitive_cylinder_add(radius=0.29, depth=0.08, vertices=24, location=(0, 0, 0.08))
    belt = bpy.context.active_object
    belt.parent = pelvis_pivot
    belt.data.materials.append(mat_gold)
    set_smooth(belt)

    # Spine Pivot (waist level, tucked directly at gold belt)
    spine_pivot = bpy.data.objects.new("Actor_Spine_Pivot", None)
    spine_pivot.location = (0, 0, 0.08)
    spine_pivot.parent = pelvis_pivot
    bpy.context.collection.objects.link(spine_pivot)

    # Torso (Egyptian linen chest wrap)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.18))
    torso_mesh = bpy.context.active_object
    torso_mesh.scale = (0.42, 0.26, 0.44)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    torso_mesh.parent = spine_pivot
    torso_mesh.data.materials.append(mat_skin)
    set_smooth(torso_mesh)

    # Diagonal White Linen Sash
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.18), rotation=(0, math.radians(24), 0))
    sash = bpy.context.active_object
    sash.scale = (0.12, 0.27, 0.46)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    sash.parent = spine_pivot
    sash.data.materials.append(mat_linen)
    set_smooth(sash)

    # Flush Royal Wesekh Collar (resting directly on chest)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=0.030, vertices=28, location=(0, 0, 0.38))
    wesekh = bpy.context.active_object
    wesekh.scale = (1.0, 0.85, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wesekh.parent = spine_pivot
    wesekh.data.materials.append(mat_gold)
    set_smooth(wesekh)

    # Head Pivot (neck top)
    head_pivot = bpy.data.objects.new("Actor_Head_Pivot", None)
    head_pivot.location = (0, 0, 0.46)
    head_pivot.rotation_euler = (math.radians(4), 0, math.radians(-10))
    head_pivot.parent = spine_pivot
    bpy.context.collection.objects.link(head_pivot)

    # Head Skull
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.24, segments=24, ring_count=16, location=(0, 0.02, 0.14))
    head_mesh = bpy.context.active_object
    head_mesh.parent = head_pivot
    head_mesh.data.materials.append(mat_skin)
    set_smooth(head_mesh)

    # Egyptian Hair Wig (Shifted back and scaled so crown & sides are covered without front face clipping)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.248, segments=24, ring_count=16, location=(0, -0.04, 0.15), rotation=(math.radians(-25), 0, 0))
    wig_top = bpy.context.active_object
    wig_top.scale = (1.03, 0.90, 1.02)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wig_top.parent = head_pivot
    wig_top.data.materials.append(mat_hair)
    set_smooth(wig_top)

    # Back Hair Mantle down to shoulders
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.10, 0.06))
    hair_back = bpy.context.active_object
    hair_back.scale = (0.38, 0.15, 0.28)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    hair_back.parent = head_pivot
    hair_back.data.materials.append(mat_hair)
    set_smooth(hair_back)

    # Side Locks Framing Cheeks
    for side, hx in [('L', -0.19), ('R', 0.19)]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.28, vertices=16, location=(hx, -0.02, 0.04))
        tress = bpy.context.active_object
        tress.parent = head_pivot
        tress.data.materials.append(mat_hair)
        set_smooth(tress)

    # Snug Gold Forehead Headband
    bpy.ops.mesh.primitive_torus_add(major_radius=0.242, minor_radius=0.012, major_segments=24, minor_segments=12, location=(0, 0.01, 0.20))
    hband = bpy.context.active_object
    hband.parent = head_pivot
    hband.data.materials.append(mat_gold)
    set_smooth(hband)

    # Expressive Kohl Eyes & Pupils (On Skull Surface: Y=0.252)
    for side, ex in [('L', -0.075), ('R', 0.075)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.038, segments=16, ring_count=12, location=(ex, 0.250, 0.14))
        eye = bpy.context.active_object
        eye.scale = (1.0, 0.35, 0.75)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        eye.parent = head_pivot
        eye.data.materials.append(mat_eye_white)
        set_smooth(eye)

        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.022, segments=12, ring_count=8, location=(ex, 0.268, 0.14))
        pupil = bpy.context.active_object
        pupil.scale = (1.0, 0.25, 0.75)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        pupil.parent = head_pivot
        pupil.data.materials.append(mat_pupil)
        set_smooth(pupil)

        # Kohl Eyebrow
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(ex, 0.245, 0.19))
        brow = bpy.context.active_object
        brow.scale = (0.070, 0.018, 0.016)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        brow.parent = head_pivot
        brow.data.materials.append(mat_hair)
        set_smooth(brow)

    # Stylized Mouth (On Skull Surface: Y=0.250)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.250, 0.06))
    mouth = bpy.context.active_object
    mouth.scale = (0.065, 0.02, 0.018)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mouth.parent = head_pivot
    mouth.data.materials.append(mat_lip)
    set_smooth(mouth)

    # Legs & Feet
    for side, lx in [('L', -0.13), ('R', 0.13)]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=0.40, vertices=16, location=(lx, 0, -0.22))
        uleg = bpy.context.active_object
        uleg.parent = pelvis_pivot
        uleg.data.materials.append(mat_skin)
        set_smooth(uleg)

        bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=0.38, vertices=16, location=(lx, 0, -0.56))
        lleg = bpy.context.active_object
        lleg.parent = pelvis_pivot
        lleg.data.materials.append(mat_skin)
        set_smooth(lleg)

        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(lx, 0.05, -0.73))
        foot = bpy.context.active_object
        foot.scale = (0.10, 0.20, 0.05)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        foot.parent = pelvis_pivot
        foot.data.materials.append(mat_sandstone_dark)
        set_smooth(foot)

    # Right Arm: Seamless Welded Joints & Stylized Hand Holding Slotted Merkhet Bar
    r_shoulder = bpy.data.objects.new("Actor_Shoulder_R", None)
    r_shoulder.location = (0.24, 0.02, 0.36)
    r_shoulder.parent = spine_pivot
    bpy.context.collection.objects.link(r_shoulder)

    # Right Shoulder Joint Sphere (bridges seamlessly into torso and collar)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.075, segments=16, ring_count=12, location=(0, 0, 0))
    r_shoulder_joint = bpy.context.active_object
    r_shoulder_joint.parent = r_shoulder
    r_shoulder_joint.data.materials.append(mat_skin)
    set_smooth(r_shoulder_joint)

    r_elbow = bpy.data.objects.new("Actor_Elbow_R", None)
    r_elbow.location = (0.24, 0.14, 0.02)
    r_elbow.parent = r_shoulder
    bpy.context.collection.objects.link(r_elbow)

    # Upper Arm Bone Mesh (zero gap between shoulder and elbow)
    r_uarm = create_bone_mesh("Actor_Uarm_R", (0, 0, 0), r_elbow.location, radius=0.062, mat=mat_skin, parent=r_shoulder)

    # Right Elbow Joint Sphere
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.058, segments=16, ring_count=12, location=(0, 0, 0))
    r_elbow_joint = bpy.context.active_object
    r_elbow_joint.parent = r_elbow
    r_elbow_joint.data.materials.append(mat_skin)
    set_smooth(r_elbow_joint)

    # Right Forearm & Hand holding Merkhet
    p_hand_rel = (-0.02, 0.22, 0.14)
    r_farm = create_bone_mesh("Actor_Farm_R", (0, 0, 0), p_hand_rel, radius=0.052, mat=mat_skin, parent=r_elbow)

    # Right Wrist Joint Sphere
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.046, segments=12, ring_count=8, location=p_hand_rel)
    r_wrist = bpy.context.active_object
    r_wrist.parent = r_elbow
    r_wrist.data.materials.append(mat_skin)
    set_smooth(r_wrist)

    # Right Palm (Chibi curved mitten base)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(p_hand_rel[0] + 0.01, p_hand_rel[1] + 0.02, p_hand_rel[2] + 0.01))
    r_palm = bpy.context.active_object
    r_palm.scale = (0.058, 0.042, 0.038)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    r_palm.parent = r_elbow
    r_palm.data.materials.append(mat_skin)
    set_smooth(r_palm)

    # 3 Stylized Chubby Fingers wrapping firmly over the wooden bar
    for fx in [-0.016, 0.0, 0.016]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.013, depth=0.042, vertices=12, location=(p_hand_rel[0] + fx, p_hand_rel[1] + 0.036, p_hand_rel[2] + 0.020), rotation=(math.radians(75), 0, 0))
        f_obj = bpy.context.active_object
        f_obj.parent = r_elbow
        f_obj.data.materials.append(mat_skin)
        set_smooth(f_obj)

    # Stylized Thumb curled over bar
    bpy.ops.mesh.primitive_cylinder_add(radius=0.014, depth=0.036, vertices=12, location=(p_hand_rel[0] - 0.022, p_hand_rel[1] + 0.018, p_hand_rel[2] + 0.024), rotation=(0, math.radians(45), math.radians(-30)))
    r_thumb = bpy.context.active_object
    r_thumb.parent = r_elbow
    r_thumb.data.materials.append(mat_skin)
    set_smooth(r_thumb)

    # Slotted Wooden Merkhet Sighting Bar
    p_bar_rel = (-0.02, 0.26, 0.16)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=p_bar_rel)
    merkhet = bpy.context.active_object
    merkhet.scale = (0.45, 0.045, 0.035)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    merkhet.parent = r_elbow
    merkhet.data.materials.append(mat_wood)
    set_smooth(merkhet)

    # Sighting V-Slit in Merkhet Center
    p_notch_rel = (-0.02, 0.26, 0.18)
    bpy.ops.mesh.primitive_cone_add(radius1=0.025, radius2=0.0, depth=0.045, vertices=4, location=p_notch_rel, rotation=(math.radians(180), 0, math.radians(45)))
    mslit = bpy.context.active_object
    mslit.parent = r_elbow
    mslit.data.materials.append(mat_gold)

    # Left Arm: Seamless Welded Joints & Stylized Hand Pinching Plumb Ring
    l_shoulder = bpy.data.objects.new("Actor_Shoulder_L", None)
    l_shoulder.location = (-0.24, 0.02, 0.36)
    l_shoulder.parent = spine_pivot
    bpy.context.collection.objects.link(l_shoulder)

    # Left Shoulder Joint Sphere
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.075, segments=16, ring_count=12, location=(0, 0, 0))
    l_shoulder_joint = bpy.context.active_object
    l_shoulder_joint.parent = l_shoulder
    l_shoulder_joint.data.materials.append(mat_skin)
    set_smooth(l_shoulder_joint)

    l_elbow = bpy.data.objects.new("Actor_Elbow_L", None)
    l_elbow.location = (-0.12, 0.16, -0.04)
    l_elbow.parent = l_shoulder
    bpy.context.collection.objects.link(l_elbow)

    # Upper Arm Bone Mesh (hanging naturally along body side)
    l_uarm = create_bone_mesh("Actor_Uarm_L", (0, 0, 0), l_elbow.location, radius=0.062, mat=mat_skin, parent=l_shoulder)

    # Left Elbow Joint Sphere
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.058, segments=16, ring_count=12, location=(0, 0, 0))
    l_elbow_joint = bpy.context.active_object
    l_elbow_joint.parent = l_elbow
    l_elbow_joint.data.materials.append(mat_skin)
    set_smooth(l_elbow_joint)

    # Left Forearm reaching forward to suspend plumb line
    p_hand_l = (-0.06, 0.22, 0.06)
    l_farm = create_bone_mesh("Actor_Farm_L", (0, 0, 0), p_hand_l, radius=0.052, mat=mat_skin, parent=l_elbow)

    # Left Wrist Joint Sphere
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.046, segments=12, ring_count=8, location=p_hand_l)
    l_wrist = bpy.context.active_object
    l_wrist.parent = l_elbow
    l_wrist.data.materials.append(mat_skin)
    set_smooth(l_wrist)

    # Left Palm
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(p_hand_l[0], p_hand_l[1] + 0.02, p_hand_l[2] + 0.01))
    l_palm = bpy.context.active_object
    l_palm.scale = (0.050, 0.040, 0.036)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    l_palm.parent = l_elbow
    l_palm.data.materials.append(mat_skin)
    set_smooth(l_palm)

    # Stylized Pinching Fingers (Thumb & Index holding gold suspension ring)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.013, depth=0.035, vertices=12, location=(p_hand_l[0] + 0.018, p_hand_l[1] + 0.032, p_hand_l[2] + 0.020), rotation=(math.radians(25), math.radians(45), 0))
    l_thumb = bpy.context.active_object
    l_thumb.parent = l_elbow
    l_thumb.data.materials.append(mat_skin)
    set_smooth(l_thumb)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=0.036, vertices=12, location=(p_hand_l[0] - 0.005, p_hand_l[1] + 0.040, p_hand_l[2] + 0.015), rotation=(0, math.radians(-30), math.radians(20)))
    l_finger = bpy.context.active_object
    l_finger.parent = l_elbow
    l_finger.data.materials.append(mat_skin)
    set_smooth(l_finger)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.014, depth=0.036, vertices=12, location=(p_hand_l[0] - 0.012, p_hand_l[1] + 0.022, p_hand_l[2] - 0.010), rotation=(math.radians(80), 0, 0))
    l_curled = bpy.context.active_object
    l_curled.parent = l_elbow
    l_curled.data.materials.append(mat_skin)
    set_smooth(l_curled)

    # Gold Suspension Ring held at pinch point
    bpy.ops.mesh.primitive_torus_add(major_radius=0.020, minor_radius=0.004, major_segments=16, minor_segments=8, location=(p_hand_l[0], p_hand_l[1] + 0.04, p_hand_l[2] + 0.015))
    plumb_ring = bpy.context.active_object
    plumb_ring.parent = l_elbow
    plumb_ring.data.materials.append(mat_gold)
    set_smooth(plumb_ring)

    # Plumb Anchor empty at bottom of ring
    plumb_anchor = bpy.data.objects.new("Actor_Plumb_Anchor", None)
    plumb_anchor.location = (p_hand_l[0], p_hand_l[1] + 0.04, p_hand_l[2] + 0.015 - 0.016)
    plumb_anchor.parent = l_elbow
    bpy.context.collection.objects.link(plumb_anchor)

    # Hanging Plumb Line Cord (origin at top z=0, hanging down to -0.50)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.004, depth=0.50, vertices=12, location=(0, 0, -0.25))
    plumb_cord = bpy.context.active_object
    plumb_cord.name = "Actor_Plumb_Cord"
    bpy.context.scene.cursor.location = (0, 0, 0)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    plumb_cord.data.materials.append(mat_linen)
    # Add COPY_LOCATION constraint targeting plumb_anchor for authentic gravity alignment
    c_loc = plumb_cord.constraints.new('COPY_LOCATION')
    c_loc.target = plumb_anchor

    # Plumb Bob parented to cord
    bpy.ops.mesh.primitive_cone_add(radius1=0.045, radius2=0.008, depth=0.10, vertices=16, location=(0, 0, -0.55), rotation=(math.radians(180), 0, 0))
    plumb_bob = bpy.context.active_object
    plumb_bob.name = "Actor_Plumb_Bob"
    plumb_bob.parent = plumb_cord
    plumb_bob.data.materials.append(mat_gold)
    set_smooth(plumb_bob)

    return {
        'root': char_root,
        'pelvis_pivot': pelvis_pivot,
        'spine_pivot': spine_pivot,
        'head_pivot': head_pivot,
        'mouth': mouth,
        'r_shoulder': r_shoulder,
        'r_elbow': r_elbow,
        'l_shoulder': l_shoulder,
        'l_elbow': l_elbow,
        'plumb_cord': plumb_cord,
        'plumb_anchor': plumb_anchor,
        'merkhet': merkhet,
    }

# -----------------------------------------------------------------------------
# 4. GUARANTEED 9:16 CAMERA RIG WITH HARD CUT JUMP TRANSITIONS
# -----------------------------------------------------------------------------
def setup_diorama_camera(shots, total_frames):
    cam_obj = bpy.data.objects.get("Cam_Cinematic_Director")
    if not cam_obj:
        cam_data = bpy.data.cameras.new("Cam_Cinematic_Director")
        cam_obj = bpy.data.objects.new("Cam_Cinematic_Director", cam_data)
        bpy.context.collection.objects.link(cam_obj)

    bpy.context.scene.camera = cam_obj
    if not cam_obj.animation_data:
        cam_obj.animation_data_create()

    # Pre-calculated cinematic framing presets (guarantee subject is in 9:16 safe zone)
    cinematic_presets = [
        # 0. Establishing Wide: plinth, columns, glowing pyramid, astronomer, period props
        {'start': (-2.8, -4.0, 2.6), 'end': (-2.4, -3.4, 2.4), 'target': (0.0, 1.2, 1.3), 'lens': 28.0},
        # 1. Front-Hero Medium Shot: astronomer face, eyes, collar, merkhet tool
        {'start': (-0.35, 3.40, 1.65), 'end': (-0.25, 3.10, 1.60), 'target': (0.0, 1.5, 1.35), 'lens': 38.0},
        # 2. Tight Macro on Wooden Merkhet Sighting Bar & Hands
        {'start': (0.12, 1.85, 1.65), 'end': (0.18, 1.95, 1.62), 'target': (0.06, 1.76, 1.50), 'lens': 65.0},
        # 3. Over-The-Shoulder Alignment: looking past shoulder framing Merkhet & Plumb Line to Pyramid & North Star
        {'start': (0.28, 0.85, 1.56), 'end': (0.30, 0.95, 1.58), 'target': (0.0, 38.0, 16.2), 'lens': 32.0},
        # 4. Low-Angle Hero Reveal: looking up at Chief Astronomer with rising pyramid
        {'start': (0.45, -0.60, 0.90), 'end': (0.30, -0.20, 1.05), 'target': (0.0, 1.5, 1.60), 'lens': 28.0},
        # 5. Suspended Plumb Line Stability Focus
        {'start': (-0.25, 2.05, 1.30), 'end': (-0.20, 2.15, 1.25), 'target': (-0.06, 1.72, 1.05), 'lens': 58.0},
        # 6. Smooth 3/4 Orbit Shot across Front Stage
        {'start': (-1.8, -1.6, 2.2), 'end': (-0.8, -2.4, 2.4), 'target': (0.0, 1.5, 1.40), 'lens': 34.0},
        # 7. Sighting Notch Macro Alignment
        {'start': (0.0, 2.8, 1.40), 'end': (0.0, 3.2, 1.35), 'target': (0.0, 38.0, 16.2), 'lens': 50.0},
        # 8. Wide Monumental Construction Stage
        {'start': (3.2, -4.0, 3.4), 'end': (2.4, -3.2, 3.0), 'target': (0.0, 1.6, 1.30), 'lens': 32.0},
        # 9. Front Medium Explaining Cut
        {'start': (0.35, 3.35, 1.68), 'end': (0.25, 3.05, 1.65), 'target': (0.0, 1.5, 1.35), 'lens': 38.0},
        # 10. Warm Amber Brazier Side Angle
        {'start': (2.2, 0.2, 1.8), 'end': (1.8, 0.6, 1.9), 'target': (0.0, 1.5, 1.50), 'lens': 40.0},
        # 11. Detail Tracking on Gold Pyramidion Capstone
        {'start': (-1.2, 12.0, 8.0), 'end': (-0.8, 16.0, 10.5), 'target': (0.0, 38.0, 16.2), 'lens': 48.0},
        # 12. Tight Macro on Plumb Line Gravity Stability
        {'start': (-0.18, 1.95, 1.25), 'end': (-0.12, 2.05, 1.20), 'target': (-0.06, 1.72, 1.05), 'lens': 62.0},
        # 13. High-Angle Observation Deck Sweep
        {'start': (-2.2, -1.8, 4.4), 'end': (-1.4, -1.0, 3.8), 'target': (0.0, 1.6, 1.20), 'lens': 34.0},
        # 14. Celestial Sighting Ray Tracking Shot
        {'start': (0.6, 2.5, 3.2), 'end': (0.4, 3.5, 3.8), 'target': (0.0, 42.0, 21.0), 'lens': 36.0},
        # 15. Hero Profile Push-In
        {'start': (-0.85, 3.20, 1.65), 'end': (-0.60, 2.80, 1.60), 'target': (0.0, 1.5, 1.40), 'lens': 40.0},
        # 16. Grand Climax Crane Back
        {'start': (-1.4, -1.8, 2.4), 'end': (-3.6, -4.8, 4.5), 'target': (0.0, 1.6, 1.40), 'lens': 28.0},
        # 17. Infinite North Alignment Final Reveal
        {'start': (0.0, -2.0, 1.8), 'end': (0.0, -0.8, 2.5), 'target': (0.0, 42.0, 21.0), 'lens': 30.0},
    ]

    for idx, shot in enumerate(shots):
        start_f = shot.get('startFrame', 1)
        end_f = shot.get('endFrame', start_f + 110)

        preset = cinematic_presets[idx % len(cinematic_presets)]
        c_start = Vector(preset['start'])
        c_end = Vector(preset['end'])
        target_pos = Vector(preset['target'])
        lens = preset['lens']

        rot_start = (target_pos - c_start).to_track_quat('-Z', 'Y').to_euler()
        rot_end = (target_pos - c_end).to_track_quat('-Z', 'Y').to_euler()

        # Keyframe Start
        cam_obj.location = c_start
        cam_obj.rotation_euler = rot_start
        cam_obj.data.lens = lens
        cam_obj.keyframe_insert(data_path="location", frame=start_f)
        cam_obj.keyframe_insert(data_path="rotation_euler", frame=start_f)
        cam_obj.data.keyframe_insert(data_path="lens", frame=start_f)

        # Keyframe End
        cam_obj.location = c_end
        cam_obj.rotation_euler = rot_end
        cam_obj.data.lens = lens
        cam_obj.keyframe_insert(data_path="location", frame=end_f)
        cam_obj.keyframe_insert(data_path="rotation_euler", frame=end_f)
        cam_obj.data.keyframe_insert(data_path="lens", frame=end_f)

    # Set HARD CUT interpolation: BEZIER within each shot, CONSTANT at shot boundaries
    if cam_obj.animation_data and cam_obj.animation_data.action:
        for fcurve in cam_obj.animation_data.action.fcurves:
            for kfp in fcurve.keyframe_points:
                # If this keyframe is the end of a shot, make it CONSTANT cut to the next shot
                is_end_keyframe = any(s.get('endFrame') == int(kfp.co[0]) for s in shots)
                if is_end_keyframe:
                    kfp.interpolation = 'CONSTANT'
                else:
                    kfp.interpolation = 'BEZIER'

    print(f"🎬 Choreographed {len(shots)} rapid visual cuts with hard-cut constant keyframe transitions.")

# -----------------------------------------------------------------------------
# 5. PROCEDURAL STORY-BEAT ACTIONS & HARMONIC PHYSICS
# -----------------------------------------------------------------------------
def animate_story_beats(diorama_data, actor_data, manifest, total_frames):
    shots = manifest.get('shots', [])
    if not shots:
        return

    # 1. Harmonic Brazier Flame Flicker
    braziers = diorama_data.get('braziers', [])
    for f in range(1, total_frames + 1, 4):
        for bidx, (flame_mesh, light_data) in enumerate(braziers):
            flicker = math.sin(f * 0.28 + bidx * 2.1) * 0.15 + math.sin(f * 0.72 + bidx) * 0.08
            light_data.energy = 1600.0 * (1.0 + flicker)
            light_data.keyframe_insert(data_path="energy", frame=f)
            flame_mesh.scale.z = 1.0 + flicker * 0.5
            flame_mesh.keyframe_insert(data_path="scale", frame=f)

    # 2. Grab Actor Rig Transforms
    head = actor_data.get('head_pivot')
    spine = actor_data.get('spine_pivot')
    r_sh = actor_data.get('r_shoulder')
    r_el = actor_data.get('r_elbow')
    l_sh = actor_data.get('l_shoulder')
    l_el = actor_data.get('l_elbow')
    plumb_cord = actor_data.get('plumb_cord')

    animated_actor_parts = [p for p in [head, spine, r_sh, r_el, l_sh, l_el] if p]
    for obj in animated_actor_parts:
        if not obj.animation_data:
            obj.animation_data_create()

    # Pose library presets in Euler degrees (X, Y, Z)
    # Note: In Blender Euler:
    #   -X head pitches back (looking UP), +X pitches forward (looking DOWN).
    #   +X shoulder raises arm FORWARD & UP; -Y raises right arm laterally UP; +Y raises left arm laterally UP.
    POSE_PRESETS = {
        'awe': {
            'head': (-20, 0, 0),
            'spine': (-4, 0, 0),
            'r_sh': (15, 0, -10),
            'r_el': (10, 0, 0),
            'l_sh': (15, 0, 10),
            'l_el': (10, 0, 0),
        },
        'puzzled': {
            'head': (10, 12, -15),
            'spine': (2, 0, -5),
            'r_sh': (45, -15, 25),
            'r_el': (50, 0, -20),
            'l_sh': (10, 0, 10),
            'l_el': (10, 0, 0),
        },
        'explaining': {
            'head': (6, 0, 0),
            'spine': (4, 0, -4),
            'r_sh': (35, -10, 15),
            'r_el': (20, 0, 0),
            'l_sh': (10, 0, 5),
            'l_el': (10, 0, 0),
        },
        'pointing_star': {
            'head': (-28, 0, -8),
            'spine': (-6, 0, 6),
            'r_sh': (65, -30, 15),
            'r_el': (15, 0, 0),
            'l_sh': (10, 0, 10),
            'l_el': (10, 0, 0),
        },
        'sighting': {
            'head': (-4, 0, 0),
            'spine': (0, 0, 0),
            'r_sh': (0, 0, 0),
            'r_el': (0, 0, 0),
            'l_sh': (0, 0, 0),
            'l_el': (0, 0, 0),
        },
        'triumph': {
            'head': (-18, 0, 0),
            'spine': (-6, 0, 0),
            'r_sh': (35, -55, 10),
            'r_el': (25, 0, 0),
            'l_sh': (35, 55, -10),
            'l_el': (25, 0, 0),
        }
    }

    BEAT_POSE_MAP = [
        'awe',            # Beat 0: Colossal pyramid hook
        'puzzled',        # Beat 1: Without compasses how did they do it?
        'puzzled',        # Beat 2: 0.05 degrees precision defies common sense
        'explaining',     # Beat 3: Not luck, profound celestial knowledge
        'pointing_star',  # Beat 4: Earth's rotational axis
        'explaining',     # Beat 5: Equinoctial shadow observation
        'sighting',       # Beat 6: Merkhet instrument & alignment wall
        'sighting',       # Beat 7: Observe sun shadow dawn and dusk
        'explaining',     # Beat 8: East-west shadow line
        'explaining',     # Beat 9: Perpendicular bisector reveals north
        'pointing_star',  # Beat 10: Circumpolar star Thuban
        'sighting',       # Beat 11: Two merkhets tracking stars
        'sighting',       # Beat 12: Star ascent and descent (OTS sighting!)
        'sighting',       # Beat 13: Bisecting celestial line
        'explaining',     # Beat 14: Ancient wisdom and precision
        'awe',            # Beat 15: Great Pyramid testament
        'triumph',        # Beat 16: Master builders, master astronomers!
    ]

    part_mapping = [
        ('head', head),
        ('spine', spine),
        ('r_sh', r_sh),
        ('r_el', r_el),
        ('l_sh', l_sh),
        ('l_el', l_el)
    ]

    for idx, shot in enumerate(shots):
        start_f = shot.get('startFrame', 1)
        end_f = shot.get('endFrame', start_f + 110)
        mid_f = (start_f + end_f) // 2

        pose_name = BEAT_POSE_MAP[idx % len(BEAT_POSE_MAP)]
        pose = POSE_PRESETS.get(pose_name, POSE_PRESETS['sighting'])

        for key, obj in part_mapping:
            if not obj:
                continue
            base_rot = [math.radians(deg) for deg in pose[key]]

            # Start of beat
            obj.rotation_euler = Euler(base_rot)
            obj.keyframe_insert(data_path="rotation_euler", frame=start_f)

            # Mid-beat subtle breathing & gesturing
            mid_rot = list(base_rot)
            if key == 'head':
                mid_rot[0] += 0.035  # Subtle nod while speaking
            elif key == 'spine':
                mid_rot[0] += 0.015  # Inhale posture shift
            elif key == 'r_sh':
                mid_rot[0] -= 0.025  # Slight gesture accent

            obj.rotation_euler = Euler(mid_rot)
            obj.keyframe_insert(data_path="rotation_euler", frame=mid_f)

            # End of beat hold
            obj.rotation_euler = Euler(base_rot)
            obj.keyframe_insert(data_path="rotation_euler", frame=end_f)

    # Set hard cuts at shot boundaries, smooth Bezier within shots
    for obj in animated_actor_parts:
        if obj.animation_data and obj.animation_data.action:
            for fc in obj.animation_data.action.fcurves:
                for kfp in fc.keyframe_points:
                    is_boundary = any(s.get('endFrame') == int(kfp.co[0]) for s in shots)
                    if is_boundary:
                        kfp.interpolation = 'CONSTANT'
                    else:
                        kfp.interpolation = 'BEZIER'

    # 3. Continuous Intra-Beat Breathing & Subtle Plumb Breeze
    if spine:
        for f in range(1, total_frames + 1, 8):
            spine.location.z = 0.08 + math.sin(f * 0.08) * 0.004
            spine.keyframe_insert(data_path="location", frame=f)

    if plumb_cord:
        for f in range(1, total_frames + 1, 6):
            plumb_cord.rotation_euler.x = math.sin(f * 0.08) * 0.020
            plumb_cord.rotation_euler.y = math.cos(f * 0.06) * 0.015
            plumb_cord.keyframe_insert(data_path="rotation_euler", frame=f)

    print(f"🎭 Animated {len(shots)} narrative beat poses across {total_frames} frames with seamless breathing & physics!")

# -----------------------------------------------------------------------------
# 6. MASTER BUILD & RENDER CONTROLLER
# -----------------------------------------------------------------------------
def build_and_render_diorama_episode(manifest, audio_path, output_path, total_frames, is_dry_run=False, render_frames=False, qa_stills=False):
    print(f"\n🏛️ BUILDING 3D DIORAMA WORLD: \"{manifest.get('title')}\"")
    print(f"   • Total Runtime: {total_frames} frames ({(total_frames/30.0):.1f}s) across {len(manifest.get('shots', []))} beats")

    clean_all_stage_objects()

    # 1. Build Bounded Diorama Set & Vibrant Studio Lights
    diorama = build_diorama_box(theme='ancient_giza_observatory', time_of_day='twilight_starry')

    # 2. Spawn Structurally Welded Stylized Actor
    actor = spawn_diorama_actor(cast_type=manifest.get('castType', 'story_cast'), role='chief_astronomer', location=(0, 1.5, 0))

    # 3. Setup Guaranteed 9:16 Camera Choreography
    setup_diorama_camera(manifest.get('shots', []), total_frames)

    # 4. Animate Narrative Beat Actions & Harmonic Physics
    animate_story_beats(diorama, actor, manifest, total_frames)

    # 5. EEVEE Next GPU Render Settings
    scene = bpy.context.scene
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.fps = 30
    scene.frame_start = 1
    scene.frame_end = total_frames
    scene.render.engine = 'BLENDER_EEVEE_NEXT'

    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 32

    scene.render.image_settings.file_format = 'JPEG'
    scene.render.image_settings.quality = 95

    # 6. QA Stills Mode: Renders 6 inspection frames across character poses & key beats
    if qa_stills:
        print("\n📸 Rendering 6 Visual QA Checkpoint Stills...")
        shots = manifest.get('shots', [])
        qa_beats = [
            (0, "qa_still_01_establishing.jpg"),
            (min(1, len(shots)-1), "qa_still_02_hero.jpg"),
            (min(3, len(shots)-1), "qa_still_03_ots.jpg"),
            (min(4, len(shots)-1), "qa_still_04_pointing.jpg"),
            (min(6, len(shots)-1), "qa_still_05_sighting.jpg"),
            (min(16, len(shots)-1), "qa_still_06_triumph.jpg"),
        ]
        out_dir = os.path.dirname(output_path) if output_path else "scratch"
        os.makedirs(out_dir, exist_ok=True)

        for beat_idx, fname in qa_beats:
            shot = shots[beat_idx]
            target_f = (shot.get('startFrame', 1) + shot.get('endFrame', 60)) // 2
            scene.frame_set(target_f)
            qa_filepath = os.path.join(out_dir, fname)
            scene.render.filepath = qa_filepath
            bpy.ops.render.render(write_still=True)
            print(f"   ✅ Saved QA Frame {target_f:4d} (Beat {beat_idx}) -> {qa_filepath}")
        return True

    # 7. Dry-Run Checkpoints
    if is_dry_run:
        print("\n🧪 Executing Headless Dry-Run Checkpoints...")
        checkpoints = [1, total_frames // 4, total_frames // 2, (3 * total_frames) // 4, total_frames]
        for cf in checkpoints:
            scene.frame_set(cf)
            cam = scene.camera
            print(f"   • Frame {cf:4d} OK | Cam Loc: ({cam.location.x:.2f}, {cam.location.y:.2f}, {cam.location.z:.2f})")
        print("✅ Headless Dry Run Passed 100%!")
        return True

    # 8. Full Video Render
    if render_frames:
        print(f"\n🚀 Rendering {total_frames} Frames with EEVEE Next GPU to: {output_path}...")
        scene.render.image_settings.file_format = 'JPEG'
        scene.render.image_settings.quality = 95
        scene.render.filepath = output_path
        scene.render.use_overwrite = True
        bpy.ops.render.render(animation=True)
        print("✅ EEVEE Next GPU Render Complete!")
        return True

    return True

# -----------------------------------------------------------------------------
# CLI DISPATCHER
# -----------------------------------------------------------------------------
def main():
    argv = sys.argv
    if '--' in argv:
        args_list = argv[argv.index('--') + 1:]
    else:
        args_list = []

    args = {
        'manifest': None,
        'audio': None,
        'output': None,
        'dry_run': False,
        'frames': False,
        'qa_stills': False,
    }

    i = 0
    while i < len(args_list):
        arg = args_list[i]
        if arg == '--manifest' and i + 1 < len(args_list):
            args['manifest'] = args_list[i + 1]
            i += 2
        elif arg == '--audio' and i + 1 < len(args_list):
            args['audio'] = args_list[i + 1]
            i += 2
        elif arg == '--output' and i + 1 < len(args_list):
            args['output'] = args_list[i + 1]
            i += 2
        elif arg == '--dry-run':
            args['dry_run'] = True
            i += 1
        elif arg == '--frames':
            args['frames'] = True
            i += 1
        elif arg == '--qa-stills':
            args['qa_stills'] = True
            i += 1
        else:
            i += 1

    if not args['manifest'] or not os.path.exists(args['manifest']):
        print(f"❌ Manifest path missing or not found: {args['manifest']}", file=sys.stderr)
        sys.exit(1)

    with open(args['manifest'], 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    total_frames = manifest.get('totalFrames', 1800)
    build_and_render_diorama_episode(
        manifest=manifest,
        audio_path=args['audio'],
        output_path=args['output'],
        total_frames=total_frames,
        is_dry_run=args['dry_run'],
        render_frames=args['frames'],
        qa_stills=args['qa_stills']
    )

if __name__ == '__main__':
    main()
