import bpy
import math
import os
from mathutils import Vector

def assemble():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # 1. Import Sketchfab Eve base mesh
    glb_path = r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads\eva_pixar_master.glb"
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    head = bpy.data.objects.get("Sphere_body_0")
    visor = bpy.data.objects.get("Sphere_Material.001_0")
    torso = bpy.data.objects.get("body_body_0")
    hands = bpy.data.objects.get("hand.r_body_0")
    
    if head: head.name = "Puttar_Head"
    if visor: visor.name = "Puttar_Visor_OLED"
    if torso: torso.name = "Puttar_Torso"
    if hands: hands.name = "Puttar_Hands"

    # Master Root
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    master_root = bpy.context.active_object
    master_root.name = "Puttar_Master_Root"

    # Parent Eve's root node to master_root
    sketchfab_root = bpy.data.objects.get("Sketchfab_model")
    if sketchfab_root:
        sketchfab_root.parent = master_root

    # Textures
    tex_dir = r"D:\New folder (2)\blender_engine\assets\textures"
    visor_tex_path = os.path.join(tex_dir, "ai_puttar_visor_screen.png")
    tilak_tex_path = os.path.join(tex_dir, "ai_puttar_tilak_decal.png")

    # 2. High-End Materials
    # Material A: Pearlescent White Clearcoat
    mat_shell = bpy.data.materials.new(name="M_Pearlescent_Shell")
    mat_shell.use_nodes = True
    bsdf_s = mat_shell.node_tree.nodes.get("Principled BSDF")
    if bsdf_s:
        bsdf_s.inputs["Base Color"].default_value = (0.96, 0.96, 0.98, 1.0)
        bsdf_s.inputs["Roughness"].default_value = 0.08
        bsdf_s.inputs["Coat Weight"].default_value = 1.0
        bsdf_s.inputs["Coat Roughness"].default_value = 0.02
        bsdf_s.inputs["Subsurface Weight"].default_value = 0.05
        bsdf_s.inputs["Subsurface Radius"].default_value = (0.9, 0.6, 0.4)

    # Material B: Polished Gold Trim
    mat_gold = bpy.data.materials.new(name="M_Polished_Gold")
    mat_gold.use_nodes = True
    bsdf_g = mat_gold.node_tree.nodes.get("Principled BSDF")
    if bsdf_g:
        bsdf_g.inputs["Base Color"].default_value = (1.0, 0.82, 0.28, 1.0)
        bsdf_g.inputs["Metallic"].default_value = 0.98
        bsdf_g.inputs["Roughness"].default_value = 0.12
        bsdf_g.inputs["Coat Weight"].default_value = 0.5
        bsdf_g.inputs["Coat Roughness"].default_value = 0.02

    # Material C: Visor OLED Screen with Cyan Cartoon Eyes
    mat_visor = bpy.data.materials.new(name="M_Visor_OLED_Screen")
    mat_visor.use_nodes = True
    nodes_v = mat_visor.node_tree.nodes
    links_v = mat_visor.node_tree.links
    nodes_v.clear()

    out_v = nodes_v.new(type="ShaderNodeOutputMaterial")
    bsdf_v = nodes_v.new(type="ShaderNodeBsdfPrincipled")
    bsdf_v.inputs["Base Color"].default_value = (0.015, 0.018, 0.025, 1.0)
    bsdf_v.inputs["Roughness"].default_value = 0.025
    bsdf_v.inputs["Coat Weight"].default_value = 1.0
    bsdf_v.inputs["Emission Strength"].default_value = 14.0

    if os.path.exists(visor_tex_path):
        tex_v = nodes_v.new(type="ShaderNodeTexImage")
        tex_v.image = bpy.data.images.load(visor_tex_path)
        coord_v = nodes_v.new(type="ShaderNodeTexCoord")
        map_v = nodes_v.new(type="ShaderNodeMapping")
        map_v.inputs["Location"].default_value = (0.5, -0.5, 0)
        map_v.inputs["Rotation"].default_value = (0, 0, math.radians(180))
        map_v.inputs["Scale"].default_value = (1.5, 2.5, 1.0)
        links_v.new(coord_v.outputs["Object"], map_v.inputs["Vector"])
        links_v.new(map_v.outputs["Vector"], tex_v.inputs["Vector"])
        links_v.new(tex_v.outputs["Color"], bsdf_v.inputs["Emission Color"])
    else:
        bsdf_v.inputs["Emission Color"].default_value = (0.0, 0.88, 1.0, 1.0)

    links_v.new(bsdf_v.outputs["BSDF"], out_v.inputs["Surface"])

    # Apply materials
    if head:
        head.data.materials.clear()
        head.data.materials.append(mat_shell)
    if torso:
        torso.data.materials.clear()
        torso.data.materials.append(mat_shell)
    if hands:
        hands.data.materials.clear()
        hands.data.materials.append(mat_shell)
    if visor:
        visor.data.materials.clear()
        visor.data.materials.append(mat_visor)

    # 3. Add Helical Spring Antennas on Top of Head
    head_z = 1.24
    head_top = head_z + 0.44

    for side, sign in [("L", -1), ("R", 1)]:
        # Gold Socket
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.022, location=(sign * 0.18, 0.02, head_top))
        sock = bpy.context.active_object
        sock.name = f"Puttar_Antenna_Socket_{side}"
        sock.scale = (1.0, 1.0, 0.5)
        sock.data.materials.append(mat_gold)
        bpy.ops.object.shade_smooth()
        if head: sock.parent = head

        # Coiled Helical Spring
        curve_data = bpy.data.curves.new(name=f"Spring_Curve_{side}", type='CURVE')
        curve_data.dimensions = '3D'
        curve_data.bevel_depth = 0.008
        curve_data.bevel_resolution = 4
        spline = curve_data.splines.new(type='POLY')
        pts = 80
        spline.points.add(pts - 1)
        radius = 0.022
        height = 0.24
        turns = 5.0
        tilt = math.radians(16) * sign
        pitch = height / pts

        for i in range(pts):
            t = (i / pts) * turns * 2.0 * math.pi
            lx = radius * math.cos(t)
            ly = radius * math.sin(t)
            lz = i * pitch
            rx = lx * math.cos(tilt) - lz * math.sin(tilt)
            rz = lx * math.sin(tilt) + lz * math.cos(tilt)
            spline.points[i].co = (rx, ly, rz, 1.0)

        spring = bpy.data.objects.new(f"Puttar_Antenna_Spring_{side}", curve_data)
        bpy.context.collection.objects.link(spring)
        spring.location = (sign * 0.18, 0.02, head_top + 0.01)
        spring.data.materials.append(mat_gold)
        if head: spring.parent = head

        # Glowing Bulb at Spring Tip
        tip_x = sign * (0.18 + 0.24 * math.sin(math.radians(16)))
        tip_z = head_top + 0.01 + 0.24 * math.cos(math.radians(16))
        tip_y = 0.02

        # Gold Bulb Socket Cap
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.018, location=(tip_x, tip_y, tip_z))
        cap = bpy.context.active_object
        cap.name = f"Puttar_Bulb_Cap_{side}"
        cap.data.materials.append(mat_gold)
        bpy.ops.object.shade_smooth()
        cap.parent = spring

        # Glass Bulb
        mat_bulb_glass = bpy.data.materials.new(name="M_Bulb_Glass")
        mat_bulb_glass.use_nodes = True
        bsdf_bg = mat_bulb_glass.node_tree.nodes.get("Principled BSDF")
        if bsdf_bg:
            bsdf_bg.inputs["Base Color"].default_value = (0.98, 0.98, 0.95, 1.0)
            bsdf_bg.inputs["Roughness"].default_value = 0.03
            bsdf_bg.inputs["Transmission Weight"].default_value = 0.94
            bsdf_bg.inputs["IOR"].default_value = 1.50

        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.046, location=(tip_x, tip_y, tip_z + 0.035))
        bulb = bpy.context.active_object
        bulb.name = f"Puttar_Bulb_Glass_{side}"
        bulb.data.materials.append(mat_bulb_glass)
        bpy.ops.object.shade_smooth()
        bulb.parent = spring

        # Glowing Filament
        mat_fil = bpy.data.materials.new(name="M_Bulb_Filament_Glow")
        mat_fil.use_nodes = True
        bsdf_fil = mat_fil.node_tree.nodes.get("Principled BSDF")
        if bsdf_fil:
            bsdf_fil.inputs["Base Color"].default_value = (1.0, 0.88, 0.45, 1.0)
            bsdf_fil.inputs["Emission Color"].default_value = (1.0, 0.88, 0.40, 1.0)
            bsdf_fil.inputs["Emission Strength"].default_value = 28.0

        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.024, location=(tip_x, tip_y, tip_z + 0.035))
        fil = bpy.context.active_object
        fil.name = f"Puttar_Bulb_Filament_{side}"
        fil.data.materials.append(mat_fil)
        bpy.ops.object.shade_smooth()
        fil.parent = spring

        # Real Point Light inside bulb
        b_light = bpy.data.lights.new(name=f"Light_Bulb_{side}", type='POINT')
        b_light.energy = 22.0
        b_light.color = (1.0, 0.88, 0.40)
        bl_obj = bpy.data.objects.new(f"Light_Bulb_Obj_{side}", b_light)
        bpy.context.collection.objects.link(bl_obj)
        bl_obj.location = (tip_x, tip_y, tip_z + 0.035)
        bl_obj.parent = fil

    # 4. Forehead Vermilion Tilak Decal
    mat_tilak = bpy.data.materials.new(name="M_Tilak_Decal")
    mat_tilak.use_nodes = True
    nodes_t = mat_tilak.node_tree.nodes
    links_t = mat_tilak.node_tree.links
    nodes_t.clear()
    out_t = nodes_t.new(type="ShaderNodeOutputMaterial")
    bsdf_t = nodes_t.new(type="ShaderNodeBsdfPrincipled")
    bsdf_t.inputs["Roughness"].default_value = 0.65
    if os.path.exists(tilak_tex_path):
        tex_t = nodes_t.new(type="ShaderNodeTexImage")
        tex_t.image = bpy.data.images.load(tilak_tex_path)
        links_t.new(tex_t.outputs["Color"], bsdf_t.inputs["Base Color"])
        links_t.new(tex_t.outputs["Alpha"], bsdf_t.inputs["Alpha"])
    else:
        bsdf_t.inputs["Base Color"].default_value = (0.82, 0.05, 0.08, 1.0)
    links_t.new(bsdf_t.outputs["BSDF"], out_t.inputs["Surface"])

    bpy.ops.mesh.primitive_plane_add(size=0.12, location=(0, -0.36, 1.48))
    tilak_obj = bpy.context.active_object
    tilak_obj.name = "Puttar_Tilak_Decal"
    tilak_obj.scale = (0.55, 1.25, 1.0)
    tilak_obj.rotation_euler = (math.radians(70), 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    tilak_obj.data.materials.append(mat_tilak)
    if head: tilak_obj.parent = head

    # 5. Golden Panel Strips (Waistband & Neck Ring)
    # Neck Ring
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.24,
        minor_radius=0.016,
        location=(0, 0, 1.02),
        major_segments=48,
        minor_segments=24
    )
    neck_ring = bpy.context.active_object
    neck_ring.name = "Puttar_Neck_Gold_Ring"
    neck_ring.data.materials.append(mat_gold)
    bpy.ops.object.shade_smooth()
    if torso: neck_ring.parent = torso

    # Waistband Gold Strip
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.48,
        minor_radius=0.008,
        location=(0, 0, 0.62),
        major_segments=48,
        minor_segments=16
    )
    waist_ring = bpy.context.active_object
    waist_ring.name = "Puttar_Waist_Gold_Ring"
    waist_ring.data.materials.append(mat_gold)
    bpy.ops.object.shade_smooth()
    if torso: waist_ring.parent = torso

    # 6. Hollow Hover Board Ring (Floating under torso)
    hover_z = 0.08
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.34,
        minor_radius=0.038,
        location=(0, 0, hover_z),
        major_segments=54,
        minor_segments=24
    )
    hover_chassis = bpy.context.active_object
    hover_chassis.name = "Puttar_Hover_Board_Chassis"
    hover_chassis.scale = (1.0, 0.90, 0.55)
    bpy.ops.object.transform_apply(scale=True)
    hover_chassis.data.materials.append(mat_gold)
    bpy.ops.object.shade_smooth()
    hover_chassis.parent = master_root

    # Inner Amber Light Emitter Ring
    mat_hover = bpy.data.materials.new(name="M_Hollow_Hover_Glow")
    mat_hover.use_nodes = True
    bsdf_h = mat_hover.node_tree.nodes.get("Principled BSDF")
    if bsdf_h:
        bsdf_h.inputs["Base Color"].default_value = (1.0, 0.72, 0.15, 1.0)
        bsdf_h.inputs["Emission Color"].default_value = (1.0, 0.75, 0.20, 1.0)
        bsdf_h.inputs["Emission Strength"].default_value = 18.0

    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.28,
        minor_radius=0.014,
        location=(0, 0, hover_z),
        major_segments=48,
        minor_segments=16
    )
    hover_emitter = bpy.context.active_object
    hover_emitter.name = "Puttar_Hover_Energy_Ring"
    hover_emitter.scale = (1.0, 0.90, 0.6)
    bpy.ops.object.transform_apply(scale=True)
    hover_emitter.data.materials.append(mat_hover)
    bpy.ops.object.shade_smooth()
    hover_emitter.parent = hover_chassis

    # Hover pool light
    h_light = bpy.data.lights.new("Hover_Light_Spot", 'SPOT')
    h_light.energy = 95.0
    h_light.color = (1.0, 0.72, 0.15)
    h_light.spot_size = math.radians(95)
    h_light.spot_blend = 0.5
    hl_obj = bpy.data.objects.new("Hover_Spot_Obj", h_light)
    bpy.context.collection.objects.link(hl_obj)
    hl_obj.location = (0, 0, hover_z + 0.05)
    hl_obj.rotation_euler = (math.radians(180), 0, 0)
    hl_obj.parent = hover_chassis

    # 7. Studio Teak Desk Surface
    mat_desk = bpy.data.materials.new(name="M_Studio_Teak_Desk")
    mat_desk.use_nodes = True
    bsdf_d = mat_desk.node_tree.nodes.get("Principled BSDF")
    if bsdf_d:
        bsdf_d.inputs["Base Color"].default_value = (0.16, 0.09, 0.06, 1.0)
        bsdf_d.inputs["Roughness"].default_value = 0.28
        bsdf_d.inputs["Coat Weight"].default_value = 0.5
        bsdf_d.inputs["Coat Roughness"].default_value = 0.06

    bpy.ops.mesh.primitive_plane_add(size=14.0, location=(0, 0, -0.18))
    desk = bpy.context.active_object
    desk.name = "Studio_Desk"
    desk.data.materials.append(mat_desk)

    # 8. Camera Setup (Full Body Vertical 9:16 framing with zero cropping)
    cam_data = bpy.data.cameras.new("Puttar_Master_Camera")
    cam_data.lens = 48.0
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = 4.80
    cam_data.dof.aperture_fstop = 3.5

    cam = bpy.data.objects.new("Camera_Master", cam_data)
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam

    cam.location = (0.0, -4.80, 1.05)
    cam.rotation_euler = (math.radians(88.5), 0.0, 0.0)

    # 9. 3-Point Studio Lighting
    key_l = bpy.data.lights.new("Key", 'AREA')
    key_l.energy = 240.0
    key_l.color = (1.0, 0.96, 0.88)
    key_l.size = 1.6
    ko = bpy.data.objects.new("Light_Key_Warm", key_l)
    bpy.context.collection.objects.link(ko)
    ko.location = (-2.2, -2.8, 2.2)
    ko.rotation_euler = (math.radians(50), math.radians(-16), math.radians(-35))

    fill_l = bpy.data.lights.new("Fill", 'AREA')
    fill_l.energy = 75.0
    fill_l.color = (0.85, 0.92, 1.0)
    fill_l.size = 2.0
    fo = bpy.data.objects.new("Light_Fill_Cool", fill_l)
    bpy.context.collection.objects.link(fo)
    fo.location = (2.4, -2.0, 1.6)
    fo.rotation_euler = (math.radians(45), math.radians(20), math.radians(55))

    rim_l = bpy.data.lights.new("Rim", 'AREA')
    rim_l.energy = 360.0
    rim_l.color = (1.0, 0.98, 0.95)
    rim_l.size = 1.2
    ro = bpy.data.objects.new("Light_Rim_Sharp", rim_l)
    bpy.context.collection.objects.link(ro)
    ro.location = (1.8, 2.2, 2.4)
    ro.rotation_euler = (math.radians(-50), math.radians(25), math.radians(140))

    # Configure Render
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'

    if hasattr(scene.view_settings, "view_transform"):
        try:
            scene.view_settings.view_transform = 'AgX'
            scene.view_settings.look = 'AgX - High Contrast'
        except Exception:
            try:
                scene.view_settings.view_transform = 'Filmic'
                scene.view_settings.look = 'High Contrast'
            except Exception:
                pass

    out_blend = r"D:\New folder (2)\blender_engine\assets\desi_library\ai_puttar_master_asset.blend"
    bpy.ops.wm.save_as_mainfile(filepath=out_blend)
    print("Master Asset Saved:", out_blend)

    out_png = r"D:\New folder (2)\blender_engine\output\ai_puttar_master_assembled_render.png"
    scene.render.filepath = out_png
    print("Rendering Master Asset...")
    bpy.ops.render.render(write_still=True)
    print("Render Complete:", out_png)

if __name__ == "__main__":
    assemble()
