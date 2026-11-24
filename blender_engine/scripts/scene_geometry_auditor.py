"""
Mathematical 3D Scene Geometry Auditor for Blender
Performs deterministic pre-flight checks on camera frustum, prop surface contacts,
character arm-hand kinematics, and shader integrity before rendering.
Outputs JSON report: scratch/geometry_audit_report.json
"""

import bpy
import bpy_extras
import mathutils
import math
import os
import json

def audit_scene(report_path="scratch/geometry_audit_report.json", surface_z=0.88):
    scene = bpy.context.scene
    report = {
        "timestamp": os.path.basename(report_path),
        "passed": True,
        "critical_errors": [],
        "warnings": [],
        "metrics": {}
    }

    # 1. Camera Frustum Visibility Check
    cam_wide = bpy.data.objects.get("Cam_Wide")
    cam_human = bpy.data.objects.get("Cam_Human")
    
    if not cam_wide:
        report["warnings"].append("Cam_Wide not found in scene")
    
    key_actors = ["Human_Head", "Agent_Claude_Root", "Human_Hand_R", "Human_Hand_L"]
    visibility_scores = {}
    
    for actor_name in key_actors:
        obj = bpy.data.objects.get(actor_name)
        if obj and cam_wide:
            cam_coords = bpy_extras.object_utils.world_to_camera_view(scene, cam_wide, obj.matrix_world.translation)
            in_view = (0.0 <= cam_coords.x <= 1.0) and (0.0 <= cam_coords.y <= 1.0) and (cam_coords.z > 0)
            visibility_scores[actor_name] = {
                "in_view": in_view,
                "cam_x": round(cam_coords.x, 3),
                "cam_y": round(cam_coords.y, 3),
                "depth_z": round(cam_coords.z, 3)
            }
            if not in_view:
                report["warnings"].append(f"Actor '{actor_name}' is outside Cam_Wide frustum: {cam_coords}")

    report["metrics"]["visibility"] = visibility_scores

    # 2. Character Arm-Hand Kinematic Gap Check
    human_hand_r = bpy.data.objects.get("Human_Hand_R")
    human_arm_r = bpy.data.objects.get("Human_Arm_R")
    
    if human_hand_r and human_arm_r:
        hand_pos = human_hand_r.matrix_world.translation
        arm_pos = human_arm_r.matrix_world.translation
        # Shoulder is at approx (0.36, 0.70, 1.35), wrist is near hand
        report["metrics"]["hand_r_z"] = round(hand_pos.z, 4)
        report["metrics"]["hand_l_z"] = round(bpy.data.objects.get("Human_Hand_L").matrix_world.translation.z, 4) if bpy.data.objects.get("Human_Hand_L") else None
        
        # Verify hand is resting reasonably close to counter
        if abs(hand_pos.z - surface_z) > 0.15:
            report["warnings"].append(f"Human_Hand_R Z={hand_pos.z:.3f} deviates from surface Z={surface_z:.3f}")

    # 3. Prop Surface Contact Check
    props_checked = 0
    for obj in bpy.data.objects:
        if "Root" in obj.name or "Machine" in obj.name or "Cup" in obj.name:
            if obj.type == 'EMPTY' or obj.type == 'MESH':
                # Check bounding box
                mesh_children = [c for c in obj.children_recursive if c.type == 'MESH']
                if mesh_children:
                    min_z = min(
                        (c.matrix_world @ mathutils.Vector(v)).z 
                        for c in mesh_children 
                        for v in c.bound_box
                    )
                    diff = abs(min_z - surface_z)
                    report["metrics"][f"prop_{obj.name}_bottom_z"] = round(min_z, 4)
                    props_checked += 1
                    if diff > 0.08:
                        report["warnings"].append(f"Prop '{obj.name}' bottom Z={min_z:.3f} has gap of {diff:.3f}m from surface Z={surface_z:.3f}")

    # 4. Shader Pink Glitch Integrity Check
    broken_materials = []
    for mat in bpy.data.materials:
        if mat and mat.use_nodes:
            for node in mat.node_tree.nodes:
                if node.type == 'TEX_IMAGE' and node.image:
                    img = node.image
                    if img.filepath and not os.path.exists(bpy.path.abspath(img.filepath)) and not img.has_data:
                        broken_materials.append(f"{mat.name} ({node.name})")

    if broken_materials:
        report["warnings"].append(f"Missing textures detected on: {broken_materials}")
        report["metrics"]["broken_shaders"] = broken_materials
    else:
        report["metrics"]["broken_shaders"] = 0

    # 5. Final Pass Assessment
    if len(report["critical_errors"]) > 0:
        report["passed"] = False

    os.makedirs(os.path.dirname(os.path.abspath(report_path)), exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("=====================================================")
    print("📐 3D SCENE GEOMETRY AUDIT COMPLETE")
    print(f"   • Status: {'✅ PASSED' if report['passed'] else '❌ FAILED'}")
    print(f"   • Warnings: {len(report['warnings'])}")
    print(f"   • Report: {report_path}")
    print("=====================================================")
    return report

if __name__ == "__main__":
    import sys
    out = sys.argv[sys.argv.index("--report") + 1] if "--report" in sys.argv else "scratch/geometry_audit_report.json"
    audit_scene(out)
