import bpy
import math

def fix():
    head = bpy.data.objects.get("Puttar_Head")
    
    # 1. Fix Visor Material Mapping (Single large expressive face, no tiling!)
    mat_v = bpy.data.materials.get("M_Visor_OLED_Screen")
    if mat_v:
        nodes = mat_v.node_tree.nodes
        tex_node = None
        for n in nodes:
            if n.type == 'TEX_IMAGE':
                tex_node = n
                tex_node.extension = 'CLIP'
            elif n.type == 'MAPPING':
                # Center the face texture perfectly on the visor
                n.inputs['Location'].default_value = (0.5, 0.5, 0)
                n.inputs['Rotation'].default_value = (0, 0, 0)
                n.inputs['Scale'].default_value = (0.75, 0.75, 1.0)
    
    # 2. Fix Antennas Position (Parented relative to head)
    for side, sign in [("L", -1), ("R", 1)]:
        sock = bpy.data.objects.get(f"Puttar_Antenna_Socket_{side}")
        spring = bpy.data.objects.get(f"Puttar_Antenna_Spring_{side}")
        
        # In head's local coordinate space, crown is at z ~ 0.42, y ~ 0.05
        local_pos = (sign * 0.16, -0.02, 0.42)
        
        if sock:
            sock.location = local_pos
        if spring:
            spring.location = local_pos
            # Boost wire visibility
            spring.data.bevel_depth = 0.010

    # 3. Fix Tilak Decal Position (Directly on forehead above visor)
    tilak = bpy.data.objects.get("Puttar_Tilak_Decal")
    if tilak:
        tilak.location = (0.0, -0.42, 0.28)
        tilak.scale = (0.6, 1.3, 1.0)
        tilak.rotation_euler = (math.radians(72), 0, 0)
        if head: tilak.parent = head

    # 4. Camera Framing: Show whole robot from hover board to antenna bulbs
    cam = bpy.data.objects.get("Camera_Master")
    if cam:
        cam.location = (0.0, -4.60, 1.15)
        cam.rotation_euler = (math.radians(88.5), 0.0, 0.0)
        cam.data.lens = 45.0 # Wider portrait lens to see full antennas and hover pool

    # Save Blend
    bpy.ops.wm.save_mainfile()
    print("Master Asset updated.")

if __name__ == "__main__":
    fix()
