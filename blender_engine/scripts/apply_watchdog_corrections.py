"""
Watchdog Spatial Correction Applier for Blender
Applies structured spatial deltas (shift, scale, lift_clearance, light_adjust)
to objects in the Blender scene to fix any visual defects detected by Gemini Multimodal Vision.
"""

import bpy
import json
import sys
import os

def find_target_object(target_name):
    """Finds an object by exact name, suffix, alias, or fuzzy keyword match."""
    t_clean = target_name.lower().replace('_', '').replace(' ', '')

    # 1. Hero Character Aliases
    if any(k in t_clean for k in ['gemini', 'popapus', 'ai', 'companion']):
        return bpy.data.objects.get("Antigravity_Popapus_Root") or bpy.data.objects.get("Popapus_Agent_Root") or bpy.data.objects.get("Gemini")
    if any(k in t_clean for k in ['human', 'dev', 'avatar', 'coder']):
        return bpy.data.objects.get("Human_Avatar") or bpy.data.objects.get("Human_Root")

    # 1b. Vehicle Aliases
    if any(k in t_clean for k in ['car', 'sedan', 'vehicle', 'redcar', 'traffic']):
        return bpy.data.objects.get("Car_Red_Sedan") or bpy.data.objects.get("Car_White_Hatch")

    # 2. Light Aliases
    if 'rim' in t_clean:
        return bpy.data.objects.get("Light_Rim_Back")
    if 'sun' in t_clean or 'key' in t_clean or t_clean == 'light':
        return bpy.data.objects.get("Light_Rim_Back") or bpy.data.objects.get("Light_Key_Sun")

    # 3. Exact match
    obj = bpy.data.objects.get(target_name)
    if obj: return obj

    # 4. Match with _Root suffix
    obj = bpy.data.objects.get(f"{target_name}_Root")
    if obj: return obj

    # 5. Fuzzy search in scene objects
    for o in bpy.data.objects:
        o_clean = o.name.lower().replace('_', '').replace(' ', '')
        if t_clean in o_clean or o_clean in t_clean:
            return o

    return None

def apply_watchdog_corrections(corrections_file, snapshot_out_path=None):
    if not os.path.exists(corrections_file):
        print(f"⚠️ Corrections file not found: {corrections_file}")
        return

    with open(corrections_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    corrections = data.get("corrections", [])
    print(f"\n🛠️ [WATCHDOG APPLIER] Applying {len(corrections)} spatial corrections...")

    for c in corrections:
        target_name = c.get("target")
        action = c.get("action", "shift")
        obj = find_target_object(target_name)

        if not obj:
            print(f"⚠️ Target object '{target_name}' not found in Blender scene.")
            continue

        if action == "shift":
            # Clamp deltas to realistic physical micro-adjustments
            dx = max(-0.15, min(0.15, float(c.get("dx", 0.0))))
            dy = max(-0.15, min(0.15, float(c.get("dy", 0.0))))
            dz = max(-0.10, min(0.15, float(c.get("dz", 0.0))))

            # Clamp to safe 9:16 frustum bounds [-0.75m, +0.45m]
            new_x = max(-0.75, min(0.45, obj.location.x + dx))
            new_y = obj.location.y + dy

            # If object is on a desk/table (Z >= 0.85), prevent falling below desk surface (Z=0.88m)
            if obj.location.z >= 0.85:
                new_z = max(0.88, obj.location.z + dz)
            else:
                new_z = max(0.0, obj.location.z + dz)

            obj.location.x = new_x
            obj.location.y = new_y
            obj.location.z = new_z
            print(f"  • Shifted '{obj.name}' safely by ({dx:.2f}, {dy:.2f}, {dz:.2f}) -> now at {obj.location}")

        elif action == "lift_clearance":
            dz = float(c.get("dz", 0.10))
            obj.location.z += dz
            print(f"  • Lifted '{obj.name}' by {dz:.2f}m -> now at Z={obj.location.z:.2f}m")

        elif action == "scale":
            factor = float(c.get("factor", 1.0))
            factor = max(0.2, min(2.5, factor))
            obj.scale = (obj.scale.x * factor, obj.scale.y * factor, obj.scale.z * factor)
            print(f"  • Scaled '{obj.name}' by factor {factor:.2f}")

        elif action == "light_adjust":
            d_energy = float(c.get("d_energy", 0.0))
            if obj.type == 'LIGHT' and obj.data:
                obj.data.energy = max(1.0, obj.data.energy + d_energy)
                print(f"  • Adjusted light '{obj.name}' energy by {d_energy:+.1f} -> now {obj.data.energy}")

    bpy.context.view_layer.update()

    # Re-render verification snapshot if requested
    if snapshot_out_path:
        scene = bpy.context.scene
        scene.render.filepath = snapshot_out_path
        scene.render.image_settings.file_format = 'JPEG'
        scene.render.image_settings.quality = 95
        bpy.ops.render.render(write_still=True)
        print(f"📸 [WATCHDOG APPLIER] Saved updated verification snapshot: {snapshot_out_path}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[-1].endswith('.json'):
        corr_file = sys.argv[-1]
        out_snap = sys.argv[-2] if len(sys.argv) > 2 and sys.argv[-2].endswith('.jpg') else None
        apply_watchdog_corrections(corr_file, out_snap)
