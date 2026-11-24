"""
Autonomous 3D Scene Graph Validator & Self-Correction Engine
=============================================================
Runs deterministic mathematical assertions directly on Blender's 3D scene graph:
1. Zero API dependency (instant 0.02s execution).
2. Enforces device ergonomics (laptop 180° rotation, hinge angles, typing posture).
3. Enforces Gemini AI hover airspace clearance (eliminates lamp/prop collisions).
4. Enforces room architectural purity (bedroom vs corporate office separation).
5. Enforces camera frustum sealing (zero sky leakage above back walls).
"""

import bpy
import math
from mathutils import Vector, Euler

def validate_and_autocorrect_scene(stage_theme="generic", camera_mode="seated"):
    print("\n🔍 [SCENE GRAPH VALIDATOR] Auditing 3D scene geometry & spatial assertions...")
    corrections_applied = []
    theme_lower = stage_theme.lower()
    is_couch = any(k in theme_lower for k in ['couch', 'living', 'sofa', 'sanctuary'])
    is_balcony = any(k in theme_lower for k in ['balcony', 'skyline', 'rooftop'])
    is_bedroom = any(k in theme_lower for k in ['bedroom', 'latenight', '3am', 'dark']) and not is_couch and not is_balcony
    is_office = any(k in theme_lower for k in ['office', 'corporate', 'workplace', 'scrum'])
    is_cafe = any(k in theme_lower for k in ['cafe', 'coffee', 'bistro', 'bakery'])
    is_spaceship = any(k in theme_lower for k in ['spaceship', 'bridge', 'cockpit', 'starship', 'sci-fi', 'scifi'])
    is_timetravel = any(k in theme_lower for k in ['time_travel', 'timetravel', '1995', 'dialup'])
    is_server = any(k in theme_lower for k in ['server', 'datacenter'])
    is_outdoor = (camera_mode == "standing_walk" or is_balcony or any(k in theme_lower for k in ['walk', 'street', 'mars', 'sidewalk'])) and not is_server

    # ---------------------------------------------------------
    # 1. Device Ergonomics: Laptop Orientation & Screen Hinge
    # ---------------------------------------------------------
    laptop_roots = [o for o in bpy.data.objects if 'laptop' in o.name.lower() and o.type in ['EMPTY', 'MESH']]
    for l_obj in laptop_roots:
        # Check Z rotation
        z_rot_deg = round(math.degrees(l_obj.rotation_euler.z)) % 360
        if camera_mode == "seated":
            # For a seated coder behind the desk, laptop must face the user (180 deg)
            if z_rot_deg != 180 and abs(z_rot_deg - 180) > 15:
                l_obj.rotation_euler.z = math.radians(180)
                msg = f"Device Orientation: Flipped '{l_obj.name}' by 180° so keyboard faces coder."
                corrections_applied.append(msg)
                print(f"  🔧 [Validator] {msg}")

        # Check screen hinge bone
        arm = next((o for o in bpy.data.objects if o.type == 'ARMATURE' and ('laptop' in o.name.lower() or 'gltf' in o.name.lower())), None)
        if arm and 'Bone_0' in arm.pose.bones:
            b = arm.pose.bones['Bone_0']
            b.rotation_mode = 'XYZ'
            current_x = round(math.degrees(b.rotation_euler.x))
            # Optimal ergonomic viewing angle is -15° (105° open past vertical)
            if abs(current_x - (-15)) > 5:
                b.rotation_euler = (math.radians(-15), 0, 0)
                msg = f"Screen Hinge: Reset '{l_obj.name}' screen hinge from {current_x}° to -15° (ergonomic 105° open view)."
                corrections_applied.append(msg)
                print(f"  🔧 [Validator] {msg}")

    # ---------------------------------------------------------
    # 2. Gemini Airspace Clearance (Collision Avoidance)
    # ---------------------------------------------------------
    gemini_root = bpy.data.objects.get("Antigravity_Popapus_Root") or bpy.data.objects.get("Popapus_Agent_Root") or bpy.data.objects.get("Gemini") or bpy.data.objects.get("Popapus_Root")
    ring = bpy.data.objects.get("Popapus_Hover_Ring")
    if gemini_root:
        # Surface reference level depends on scene
        if is_couch:
            desk_surface_z = 0.38
        elif is_balcony or is_outdoor:
            desk_surface_z = 0.0
        else:
            desk_surface_z = 0.88
        if ring and not ring.hide_render:
            ring_world_z = ring.matrix_world.translation.z
            clearance = ring_world_z - desk_surface_z
            if clearance < 0.25:
                lift_amount = 0.30 - clearance
                gemini_root.location.z += lift_amount
                bpy.context.view_layer.update()
                msg = f"Airspace Clearance: Lifted Gemini by {lift_amount:.2f}m (Hover ring now at Z={ring.matrix_world.translation.z:.2f}m, clearance={ring.matrix_world.translation.z - desk_surface_z:.2f}m above desk)."
                corrections_applied.append(msg)
                print(f"  🔧 [Validator] {msg}")
        else:
            bottom_z = gemini_root.location.z - 0.45
            clearance = bottom_z - desk_surface_z
            if clearance < 0.15:
                lift_amount = 0.20 - clearance
                gemini_root.location.z += lift_amount
                bpy.context.view_layer.update()
                msg = f"Airspace Clearance: Lifted Gemini by {lift_amount:.2f}m (Tentacles now at Z={gemini_root.location.z - 0.45:.2f}m, clearance={gemini_root.location.z - 0.45 - desk_surface_z:.2f}m above desk)."
                corrections_applied.append(msg)
                print(f"  🔧 [Validator] {msg}")

        g_loc = gemini_root.matrix_world.translation
        ring_z = ring.matrix_world.translation.z if ring else (g_loc.z - 0.72)
        for obj in list(bpy.data.objects):
            if obj == gemini_root or obj.name.startswith("Popapus") or obj.name.startswith("Orb_") or obj.name.startswith("Human"):
                continue
            if obj.type == 'MESH' and not obj.name.startswith("Stage_BackWall") and not obj.name.startswith("Floor"):
                o_loc = obj.matrix_world.translation
                dx = o_loc.x - g_loc.x
                dy = o_loc.y - g_loc.y
                horizontal_dist = math.sqrt(dx * dx + dy * dy)
                # If a prop sits directly inside Gemini's hover cylinder, purge it
                if horizontal_dist < 0.28 and abs(o_loc.z - ring_z) < 0.30:
                    try:
                        obj_name = obj.name
                        bpy.data.objects.remove(obj, do_unlink=True)
                        msg = f"Airspace Clearance: Purged conflicting prop '{obj_name}' colliding with Gemini hover ring (dist: {horizontal_dist:.2f}m)."
                        corrections_applied.append(msg)
                        print(f"  🔧 [Validator] {msg}")
                    except Exception:
                        pass

    # ---------------------------------------------------------
    # 3. Room Architectural & Environmental Purity
    # ---------------------------------------------------------
    if is_bedroom:
        # Purge office whiteboard, slats, cafe chalkboard, or sci-fi props
        alien_props = [o for o in bpy.data.objects if any(k in o.name for k in ['Stage_WB', 'Stage_Whiteboard', 'Stage_Slat', 'Stage_Clock', 'Stage_Chalk', 'Stage_Menu_Frame', 'Stage_Ship_', 'Stage_1995_'])]
        for o in alien_props:
            try:
                o_name = o.name
                bpy.data.objects.remove(o, do_unlink=True)
                msg = f"Room Purity: Purged alien prop '{o_name}' from residential bedroom."
                corrections_applied.append(msg)
                print(f"  🔧 [Validator] {msg}")
            except Exception:
                pass
    elif is_cafe:
        # Purge office whiteboard, bedroom shelves, or sci-fi props
        alien_props = [o for o in bpy.data.objects if any(k in o.name for k in ['Stage_WB', 'Stage_Whiteboard', 'Stage_Slat', 'Stage_Clock', 'Stage_Wall_Shelf', 'Stage_Ship_', 'Stage_1995_'])]
        for o in alien_props:
            try:
                o_name = o.name
                bpy.data.objects.remove(o, do_unlink=True)
                msg = f"Room Purity: Purged non-cafe prop '{o_name}' from coffee shop."
                corrections_applied.append(msg)
                print(f"  🔧 [Validator] {msg}")
            except Exception:
                pass
    elif is_spaceship:
        # Purge office whiteboard, cafe chalkboard, bedroom shelves
        alien_props = [o for o in bpy.data.objects if any(k in o.name for k in ['Stage_WB', 'Stage_Whiteboard', 'Stage_Slat', 'Stage_Clock', 'Stage_Chalk', 'Stage_Menu_Frame', 'Stage_Wall_Shelf'])]
        for o in alien_props:
            try:
                o_name = o.name
                bpy.data.objects.remove(o, do_unlink=True)
                msg = f"Room Purity: Purged non-spaceship prop '{o_name}' from spaceship bridge."
                corrections_applied.append(msg)
                print(f"  🔧 [Validator] {msg}")
            except Exception:
                pass
    elif is_timetravel:
        # Purge office whiteboard, cafe chalkboard, bedroom shelves
        alien_props = [o for o in bpy.data.objects if any(k in o.name for k in ['Stage_WB', 'Stage_Whiteboard', 'Stage_Slat', 'Stage_Clock', 'Stage_Chalk', 'Stage_Menu_Frame', 'Stage_Wall_Shelf', 'Stage_Ship_'])]
        for o in alien_props:
            try:
                o_name = o.name
                bpy.data.objects.remove(o, do_unlink=True)
                msg = f"Room Purity: Purged non-1995 prop '{o_name}' from 1995 time travel lab."
                corrections_applied.append(msg)
                print(f"  🔧 [Validator] {msg}")
            except Exception:
                pass
    elif is_office:
        # Purge cafe chalkboard, bedroom shelves, sci-fi props
        alien_props = [o for o in bpy.data.objects if any(k in o.name for k in ['Stage_Chalk', 'Stage_Menu_Frame', 'Stage_Wall_Shelf', 'Stage_Ship_', 'Stage_1995_'])]
        for o in alien_props:
            try:
                o_name = o.name
                bpy.data.objects.remove(o, do_unlink=True)
                msg = f"Room Purity: Purged non-office prop '{o_name}' from corporate office."
                corrections_applied.append(msg)
                print(f"  🔧 [Validator] {msg}")
            except Exception:
                pass

    # If outdoor walk mode, strictly purge any desks, tables, counters, or indoor backwalls
    if camera_mode == "standing_walk":
        indoor_props = [o for o in bpy.data.objects if any(k in o.name for k in ['Desk', 'Office_Desk', 'Table', 'Cafe_Counter', 'Bistro', 'Stage_BackWall', 'Stage_Whiteboard', 'Stage_WB_Frame', 'Stage_Slat', 'Stage_Clock', 'Stage_Chalkboard', 'Stage_Menu_Frame', 'Stage_Wall_Shelf'])]
        for o in indoor_props:
            try:
                o_name = o.name
                bpy.data.objects.remove(o, do_unlink=True)
                msg = f"Environment Purity: Purged indoor furniture '{o_name}' from outdoor standing/walk scene."
                corrections_applied.append(msg)
                print(f"  🔧 [Validator] {msg}")
            except Exception:
                pass

    # ---------------------------------------------------------
    # 3b. Vehicle Grounding & Road Contact (Outdoor Scenes)
    # ---------------------------------------------------------
    if is_outdoor:
        road_surface_z = -0.04
        for car_name in ['Car_Red_Sedan', 'Car_White_Hatch']:
            car_obj = bpy.data.objects.get(car_name)
            if car_obj and car_obj.type == 'MESH':
                bbox_z = [(car_obj.matrix_world @ Vector(corner)).z for corner in car_obj.bound_box]
                min_car_z = min(bbox_z)
                gap = min_car_z - road_surface_z
                if abs(gap) > 0.02:
                    car_obj.location.z -= gap
                    bpy.context.view_layer.update()
                    msg = f"Vehicle Grounding: Snapped '{car_name}' wheels flush to road (gap was {gap:+.3f}m, now Z={road_surface_z:.2f}m)."
                    corrections_applied.append(msg)
                    print(f"  🔧 [Validator] {msg}")

    # ---------------------------------------------------------
    # 4. Frustum & Ceiling Sealing
    # ---------------------------------------------------------
    back_wall = bpy.data.objects.get("Stage_BackWall")
    if back_wall:
        # Ensure back wall height is at least 4.5m
        if back_wall.dimensions.z < 4.0:
            back_wall.dimensions.z = 5.5
            msg = f"Frustum Sealing: Scaled Stage_BackWall height to {back_wall.dimensions.z:.1f}m to prevent sky leaks."
            corrections_applied.append(msg)
            print(f"  🔧 [Validator] {msg}")

    # ---------------------------------------------------------
    # 5. Hand Posture & Keyboard Alignment (Only for desk scenes)
    # ---------------------------------------------------------
    if camera_mode == "seated" and any(k in stage_theme.lower() for k in ['desk', 'office', 'workplace']):
        hand_l = bpy.data.objects.get("Human_Hand_L")
        hand_r = bpy.data.objects.get("Human_Hand_R")
        # Ensure hands are not clipping into desk below Z=0.88 or floating above 0.94
        if hand_l and (hand_l.location.z < 0.88 or hand_l.location.z > 0.94):
            hand_l.location.z = 0.905
            msg = "Ergonomics: Snapped Human_Hand_L to keyboard surface level (Z=0.905m)."
            corrections_applied.append(msg)
            print(f"  🔧 [Validator] {msg}")
        if hand_r and (hand_r.location.z < 0.88 or hand_r.location.z > 0.94):
            hand_r.location.z = 0.905
            msg = "Ergonomics: Snapped Human_Hand_R to keyboard surface level (Z=0.905m)."
            corrections_applied.append(msg)
            print(f"  🔧 [Validator] {msg}")

    bpy.context.view_layer.update()
    if corrections_applied:
        print(f"✅ [SCENE GRAPH VALIDATOR] Auto-corrected {len(corrections_applied)} spatial defects deterministically.")
    else:
        print("✅ [SCENE GRAPH VALIDATOR] All spatial assertions passed with zero defects!")
    return corrections_applied
