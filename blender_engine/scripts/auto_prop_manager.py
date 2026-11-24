"""
Automated 3D Prop Normalization & Surface Snapping Engine for Blender
Takes any third-party GLB/GLTF model, computes true 3D bounding geometry,
auto-scales it to real-world physical dimensions, snaps it flush to the target surface,
and sanitizes materials to prevent missing texture errors.
"""

import bpy
import mathutils
import math
import os

CATEGORY_DEFAULT_HEIGHTS = {
    "table_prop": 0.12,          # Coffee cup, smartphone, soda can, notebook
    "counter_appliance": 0.55,    # Espresso machine, microwave, blender, toaster
    "decor": 0.35,                # Small potted plant, desk lamp, photo frame
    "electronic": 0.22,           # Laptop, mechanical keyboard, monitor
    "furniture": 0.90,            # Desk, counter, sofa, server rack
    "room_prop": 1.40,            # Standing lamp, coat hanger, water cooler
}

def compute_hierarchy_bounding_box(objects):
    """Computes world-space min and max bounding coordinates across multiple mesh objects."""
    min_x, max_x = float('inf'), float('-inf')
    min_y, max_y = float('inf'), float('-inf')
    min_z, max_z = float('inf'), float('-inf')
    
    mesh_found = False
    for obj in objects:
        if obj.type == 'MESH' and obj.data:
            mesh_found = True
            for v in obj.bound_box:
                w_pos = obj.matrix_world @ mathutils.Vector(v)
                min_x = min(min_x, w_pos.x)
                max_x = max(max_x, w_pos.x)
                min_y = min(min_y, w_pos.y)
                max_y = max(max_y, w_pos.y)
                min_z = min(min_z, w_pos.z)
                max_z = max(max_z, w_pos.z)

    if not mesh_found:
        return mathutils.Vector((-0.1, -0.1, -0.1)), mathutils.Vector((0.1, 0.1, 0.1))
        
    return mathutils.Vector((min_x, min_y, min_z)), mathutils.Vector((max_x, max_y, max_z))

def sanitize_materials(objects):
    """
    Scans all materials on imported meshes.
    Replaces broken image nodes / missing texture files with clean procedural Principled BSDFs
    to eliminate the Blender magenta/pink texture bug completely.
    """
    for obj in objects:
        if obj.type != 'MESH':
            continue
        for slot in obj.material_slots:
            mat = slot.material
            if not mat or not mat.use_nodes:
                continue
            tree = mat.node_tree
            for node in list(tree.nodes):
                if node.type == 'TEX_IMAGE':
                    img = node.image
                    # Check if valid image: packed inside blend/glb, has raw pixel data, or valid path on disk
                    is_valid = False
                    if img:
                        if getattr(img, 'packed_file', None) is not None or getattr(img, 'has_data', False):
                            is_valid = True
                        elif img.filepath and os.path.exists(bpy.path.abspath(img.filepath)):
                            is_valid = True
                    
                    if not is_valid:
                        # Genuinely missing texture file! Remove broken node and set fallback color
                        print(f"⚠️ [Shader Sanitizer] Missing texture on {mat.name}, applying clean fallback.")
                        bsdf = tree.nodes.get("Principled BSDF")
                        if bsdf:
                            bsdf.inputs['Base Color'].default_value = (0.28, 0.28, 0.32, 1.0)
                            bsdf.inputs['Roughness'].default_value = 0.45
                        tree.nodes.remove(node)

def import_and_normalize_prop(
    glb_path,
    prop_name="Auto_Prop",
    category="table_prop",
    target_height=None,
    target_location=(0.0, 0.50, 0.88),
    target_rotation=(0.0, 0.0, 0.0),
    snap_surface_z=0.88
):
    """
    Universal importer and normalizer:
    1. Imports GLTF/GLB file into an isolated collection.
    2. Calculates true bounding box dimensions.
    3. Auto-scales to target physical height (prevents giant/tiny mesh scale bugs).
    4. Snaps the bottom-most vertex flush with snap_surface_z.
    5. Sanitizes shaders.
    Returns the root Empty object controlling the prop.
    """
    if not os.path.exists(glb_path):
        raise FileNotFoundError(f"3D asset not found at: {glb_path}")

    # Set selection baseline
    bpy.ops.object.select_all(action='DESELECT')
    
    # Import GLTF/GLB
    bpy.ops.import_scene.gltf(filepath=glb_path)
    imported_objects = [o for o in bpy.context.selected_objects]

    if not imported_objects:
        raise ValueError(f"No objects imported from {glb_path}")

    # Separate meshes and non-meshes
    mesh_objects = [o for o in imported_objects if o.type == 'MESH']
    
    # Clear any armature actions / animation tracks embedded in imported 3D models
    # This prevents rogue third-party animations from blowing up scales or displacing props
    for o in imported_objects:
        if o.animation_data:
            o.animation_data_clear()

    # Special handling for folding laptops: open screen hinge cleanly at 105 degrees (facing user)
    if "laptop" in glb_path.lower():
        arm = next((o for o in imported_objects if o.type == 'ARMATURE'), None)
        if arm and 'Bone_0' in arm.pose.bones:
            arm.pose.bones['Bone_0'].rotation_mode = 'XYZ'
            arm.pose.bones['Bone_0'].rotation_euler = (math.radians(-15), 0, 0)
            bpy.context.view_layer.update()

    # Special handling for coffee cup low poly collection: isolate single cappuccino cup + saucer + foam
    if "coffee_cup" in glb_path.lower():
        cap_objs = [o for o in imported_objects if 'cappuccino' in o.name.lower()]
        if cap_objs:
            for o in list(imported_objects):
                if o.type == 'MESH' and o not in cap_objs:
                    imported_objects.remove(o)
                    bpy.data.objects.remove(o, do_unlink=True)
            mesh_objects = cap_objs

    # Sanitize materials first
    sanitize_materials(mesh_objects)

    # Determine desired physical height in meters
    if target_height is None or target_height <= 0:
        target_height = CATEGORY_DEFAULT_HEIGHTS.get(category, 0.25)

    # Compute raw bounding box
    min_b, max_b = compute_hierarchy_bounding_box(mesh_objects)
    raw_width = max_b.x - min_b.x
    raw_depth = max_b.y - min_b.y
    raw_height = max_b.z - min_b.z

    print(f"📐 [Auto Prop] Raw dimensions of {prop_name}: W={raw_width:.3f}m, D={raw_depth:.3f}m, H={raw_height:.3f}m")

    # Compute scale factor: normalize laptops by life-size width (0.38m for developer workstation), other props by target height
    if "laptop" in glb_path.lower() or category == "laptop":
        target_width = 0.38
        scale_factor = target_width / max(raw_width, 0.001)
    else:
        scale_factor = target_height / max(raw_height, 0.001)

    # Clamp extreme scaling to prevent zero or overflow
    scale_factor = max(0.0001, min(scale_factor, 1000.0))
    print(f"⚖️ [Auto Prop] Computed scale normalization factor: {scale_factor:.6f} (Target Height: {target_height:.2f}m)")

    # Create dedicated Root Empty
    root = bpy.data.objects.new(f"{prop_name}_Root", None)
    bpy.context.collection.objects.link(root)

    # Center imported geometry so root empty acts as true physical center
    center_x = (min_b.x + max_b.x) * 0.5
    center_y = (min_b.y + max_b.y) * 0.5

    # Identify existing top-level roots among imported objects to preserve hierarchy
    top_level_imported = [o for o in imported_objects if o.parent not in imported_objects]
    for o in top_level_imported:
        o.location.x -= center_x
        o.location.y -= center_y
        o.parent = root
        o.matrix_parent_inverse = root.matrix_world.inverted()

    # Apply uniform scale to root
    root.scale = (scale_factor, scale_factor, scale_factor)

    # Compute vertical offset so bottom vertex touches snap_surface_z
    # When root is at (x, y, z), mesh bottom is min_b.z * scale_factor
    # Therefore: root.z = snap_surface_z - (min_b.z * scale_factor)
    bottom_offset = min_b.z * scale_factor
    final_z = snap_surface_z - bottom_offset

    root.location = (target_location[0], target_location[1], final_z)
    root.rotation_euler = (
        math.radians(target_rotation[0]),
        math.radians(target_rotation[1]),
        math.radians(target_rotation[2])
    )

    print(f"✅ [Auto Prop] Placed '{prop_name}' at {root.location} (Surface Z={snap_surface_z}m, Bottom flush contact)")
    return root
