import bpy
import math
import os

def build_ai_puttar_master_asset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # 1. Import Sketchfab Eve base mesh
    glb_path = r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads\eva_pixar_master.glb"
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    # Identify meshes
    head_shell = bpy.data.objects.get("Sphere_body_0")
    visor_face = bpy.data.objects.get("Sphere_Material.001_0")
    torso_body = bpy.data.objects.get("body_body_0")
    hands_mesh = bpy.data.objects.get("hand.r_body_0")

    # Rename cleanly
    if head_shell: head_shell.name = "Puttar_Head_Shell"
    if visor_face: visor_face.name = "Puttar_Visor_OLED"
    if torso_body: torso_body.name = "Puttar_Torso"
    if hands_mesh: hands_mesh.name = "Puttar_Hands_Floating"

    # Scale and center character to standard height (~1.8m)
    # The imported FBX/GLB might have root scale or rotation
    root_node = bpy.data.objects.get("Sketchfab_model")
    if root_node:
        root_node.rotation_euler = (0, 0, 0)
    
    # 2. Setup High-Fidelity Master Materials
    tex_dir = r"D:\New folder (2)\blender_engine\assets\textures"
    visor_tex_path = os.path.join(tex_dir, "ai_puttar_visor_screen.png")
    tilak_tex_path = os.path.join(tex_dir, "ai_puttar_tilak_decal.png")

    # Material A: Pearlescent White Clearcoat Chassis
    mat_shell = bpy.data.materials.new(name="M_Pearlescent_Shell")
    mat_shell.use_nodes = True
    bsdf_s = mat_shell.node_tree.nodes.get("Principled BSDF")
    if bsdf_s:
        bsdf_s.inputs["Base Color"].default_value = (0.97, 0.97, 0.99, 1.0)
        bsdf_s.inputs["Roughness"].default_value = 0.08
        bsdf_s.inputs["Coat Weight"].default_value = 1.0
        bsdf_s.inputs["Coat Roughness"].default_value = 0.02
        bsdf_s.inputs["Subsurface Weight"].default_value = 0.05
        bsdf_s.inputs["Subsurface Radius"].default_value = (0.9, 0.6, 0.4)

    # Apply to head, torso, hands
    if head_shell:
        head_shell.data.materials.clear()
        head_shell.data.materials.append(mat_shell)
    if torso_body:
        torso_body.data.materials.clear()
        torso_body.data.materials.append(mat_shell)
    if hands_mesh:
        hands_mesh.data.materials.clear()
        hands_mesh.data.materials.append(mat_shell)

    # Material B: Polished Gold Trim
    mat_gold = bpy.data.materials.new(name="M_Polished_Gold")
    mat_gold.use_nodes = True
    bsdf_g = mat_gold.node_tree.nodes.get("Principled BSDF")
    if bsdf_g:
        bsdf_g.inputs["Base Color"].default_value = (1.0, 0.82, 0.28, 1.0)
        bsdf_g.inputs["Metallic"].default_value = 0.98
        bsdf_g.inputs["Roughness"].default_value = 0.12
        bsdf_g.inputs["Coat Weight"].default_value = 0.4

    # Material C: Visor OLED Screen with Glowing Cyan Eyes
    mat_visor = bpy.data.materials.new(name="M_Visor_OLED")
    mat_visor.use_nodes = True
    nodes_v = mat_visor.node_tree.nodes
    links_v = mat_visor.node_tree.links
    nodes_v.clear()

    out_v = nodes_v.new(type="ShaderNodeOutputMaterial")
    bsdf_v = nodes_v.new(type="ShaderNodeBsdfPrincipled")
    bsdf_v.inputs["Base Color"].default_value = (0.012, 0.015, 0.02, 1.0)
    bsdf_v.inputs["Roughness"].default_value = 0.025
    bsdf_v.inputs["Coat Weight"].default_value = 1.0
    bsdf_v.inputs["Emission Strength"].default_value = 10.0

    if os.path.exists(visor_tex_path):
        tex_v = nodes_v.new(type="ShaderNodeTexImage")
        tex_v.image = bpy.data.images.load(visor_tex_path)
        coord_v = nodes_v.new(type="ShaderNodeTexCoord")
        map_v = nodes_v.new(type="ShaderNodeMapping")
        map_v.inputs["Location"].default_value = (0.5, 0.5, 0)
        map_v.inputs["Scale"].default_value = (1.2, 1.8, 1.0)
        links_v.new(coord_v.outputs["UV"], map_v.inputs["Vector"])
        links_v.new(map_v.outputs["Vector"], tex_v.inputs["Vector"])
        links_v.new(tex_v.outputs["Color"], bsdf_v.inputs["Emission Color"])
    else:
        bsdf_v.inputs["Emission Color"].default_value = (0.0, 0.88, 1.0, 1.0)

    links_v.new(bsdf_v.outputs["BSDF"], out_v.inputs["Surface"])

    if visor_face:
        visor_face.data.materials.clear()
        visor_face.data.materials.append(mat_visor)

    # 3. Add Golden Spring Antennas with Glowing Bulbs
    # Get head top location
    head_loc = head_shell.matrix_world.translation if head_shell else (0, 0, 1.45)
    head_dim = head_shell.dimensions if head_shell else (1.0, 0.8, 0.9)
    top_z = head_loc.z + head_dim.z * 0.48

    for side, sign in [("L", -1), ("R", 1)]:
        # Helical Spring Curve
        curve_data = bpy.data.curves.new(name=f"Antenna_Spring_Curve_{side}", type='CURVE')
        curve_data.dimensions = '3D'
        curve_data.bevel_depth = 0.007
        curve_data.bevel_resolution = 4
        spline = curve_data.splines.new(type='POLY')
        pts_count = 70
        spline.points.add(pts_count - 1)
        
        radius = 0.018
        height = 0.22
        turns = 4.5
        tilt = math.radians(18) * sign
        pitch = height / pts_count

        for i in range(pts_count):
            t = (i / pts_count) * turns * 2.0 * math.pi
            lx = radius * math.cos(t)
            ly = radius * math.sin(t)
            lz = i * pitch
            rx = lx * math.cos(tilt) - lz * math.sin(tilt)
            rz = lx * math.sin(tilt) + lz * math.cos(tilt)
            spline.points[i].co = (rx, ly, rz, 1.0)

        spring_obj = bpy.data.objects.new(f"Puttar_Antenna_Spring_{side}", curve_data)
        bpy.context.collection.objects.link(spring_obj)
        spring_obj.location = (head_loc.x + sign * 0.16, head_loc.y, top_z)
        spring_obj.data.materials.append(mat_gold)
        if head_shell: spring_obj.parent = head_shell

        # Glowing Filament Bulb at Tip
        tip_x = head_loc.x + sign * (0.16 + 0.22 * math.sin(math.radians(18)))
        tip_z = top_z + 0.22 * math.cos(math.radians(18))
        tip_y = head_loc.y

        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.038, location=(tip_x, tip_y, tip_z + 0.025))
        bulb = bpy.context.active_object
        bulb.name = f"Puttar_Antenna_Bulb_{side}"
        bulb.data.materials.append(mat_gold)
        bpy.ops.object.shade_smooth()
        bulb.parent = spring_obj

        # Point Light inside bulb
        b_light = bpy.data.lights.new(name=f"Light_Bulb_{side}", type='POINT')
        b_light.energy = 20.0
        b_light.color = (1.0, 0.88, 0.40)
        bl_obj = bpy.data.objects.new(f"Light_Bulb_Obj_{side}", b_light)
        bpy.context.collection.objects.link(bl_obj)
        bl_obj.location = (tip_x, tip_y, tip_z + 0.025)
        bl_obj.parent = bulb

    # 4. Add Hollow Hover Board Ring under Torso
    torso_loc = torso_body.matrix_world.translation if torso_body else (0, 0, 0.6)
    torso_dim = torso_body.dimensions if torso_body else (1.0, 1.3, 1.0)
    bot_z = torso_loc.z - torso_dim.z * 0.48

    # Outer Gold Torus Chassis
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.32,
        minor_radius=0.036,
        location=(torso_loc.x, torso_loc.y, bot_z - 0.12),
        major_segments=48,
        minor_segments=24
    )
    hover_chassis = bpy.context.active_object
    hover_chassis.name = "Puttar_Hover_Board"
    hover_chassis.scale = (1.0, 0.90, 0.55)
    bpy.ops.object.transform_apply(scale=True)
    hover_chassis.data.materials.append(mat_gold)
    bpy.ops.object.shade_smooth()

    # Inner Amber Light Emitter Ring (Hollow Center!)
    mat_hover = bpy.data.materials.new(name="M_Hover_Glow")
    mat_hover.use_nodes = True
    bsdf_h = mat_hover.node_tree.nodes.get("Principled BSDF")
    if bsdf_h:
        bsdf_h.inputs["Base Color"].default_value = (1.0, 0.72, 0.15, 1.0)
        bsdf_h.inputs["Emission Color"].default_value = (1.0, 0.75, 0.20, 1.0)
        bsdf_h.inputs["Emission Strength"].default_value = 16.0

    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.26,
        minor_radius=0.012,
        location=(torso_loc.x, torso_loc.y, bot_z - 0.12),
        major_segments=48,
        minor_segments=16
    )
    hover_ring = bpy.context.active_object
    hover_ring.name = "Puttar_Hover_Light_Ring"
    hover_ring.scale = (1.0, 0.90, 0.6)
    bpy.ops.object.transform_apply(scale=True)
    hover_ring.data.materials.append(mat_hover)
    bpy.ops.object.shade_smooth()
    hover_ring.parent = hover_chassis

    # Hover pool light
    h_light = bpy.data.lights.new("Hover_Light_Spot", 'SPOT')
    h_light.energy = 85.0
    h_light.color = (1.0, 0.72, 0.15)
    h_light.spot_size = math.radians(95)
    hl_obj = bpy.data.objects.new("Hover_Spot_Obj", h_light)
    bpy.context.collection.objects.link(hl_obj)
    hl_obj.location = (torso_loc.x, torso_loc.y, bot_z - 0.08)
    hl_obj.rotation_euler = (math.radians(180), 0, 0)
    hl_obj.parent = hover_chassis

    # 5. Studio Teak Desk Surface
    mat_desk = bpy.data.materials.new(name="M_Teak_Desk")
    mat_desk.use_nodes = True
    bsdf_d = mat_desk.node_tree.nodes.get("Principled BSDF")
    if bsdf_d:
        bsdf_d.inputs["Base Color"].default_value = (0.16, 0.09, 0.06, 1.0)
        bsdf_d.inputs["Roughness"].default_value = 0.28
        bsdf_d.inputs["Coat Weight"].default_value = 0.5

    bpy.ops.mesh.primitive_plane_add(size=14.0, location=(0, 0, bot_z - 0.35))
    desk = bpy.context.active_object
    desk.name = "Studio_Desk"
    desk.data.materials.append(mat_desk)

    # 6. Studio Lighting & Camera
    cam_data = bpy.data.cameras.new("Puttar_Camera")
    cam_data.lens = 52.0
    cam = bpy.data.objects.new("Camera_Master", cam_data)
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam

    # Center camera on character
    char_center_z = (head_loc.z + bot_z) / 2.0
    cam.location = (0.0, -3.85, char_center_z)
    cam.rotation_euler = (math.radians(90), 0, 0)

    # 3-Point Lights
    key_l = bpy.data.lights.new("Key", 'AREA')
    key_l.energy = 240.0
    key_l.color = (1.0, 0.96, 0.88)
    key_l.size = 1.6
    ko = bpy.data.objects.new("Light_Key", key_l)
    bpy.context.collection.objects.link(ko)
    ko.location = (-2.2, -2.8, char_center_z + 1.2)
    ko.rotation_euler = (math.radians(50), math.radians(-16), math.radians(-35))

    fill_l = bpy.data.lights.new("Fill", 'AREA')
    fill_l.energy = 85.0
    fill_l.color = (0.85, 0.92, 1.0)
    fill_l.size = 2.0
    fo = bpy.data.objects.new("Light_Fill", fill_l)
    bpy.context.collection.objects.link(fo)
    fo.location = (2.4, -2.0, char_center_z + 0.5)
    fo.rotation_euler = (math.radians(45), math.radians(20), math.radians(55))

    rim_l = bpy.data.lights.new("Rim", 'AREA')
    rim_l.energy = 360.0
    rim_l.color = (1.0, 0.98, 0.95)
    rim_l.size = 1.2
    ro = bpy.data.objects.new("Light_Rim", rim_l)
    bpy.context.collection.objects.link(ro)
    ro.location = (1.8, 2.2, char_center_z + 1.4)
    ro.rotation_euler = (math.radians(-50), math.radians(25), math.radians(140))

    # Configure Render
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    out_blend = r"D:\New folder (2)\blender_engine\assets\desi_library\ai_puttar_sketchfab_master.blend"
    bpy.ops.wm.save_as_mainfile(filepath=out_blend)
    print("Saved Master Blend:", out_blend)

    out_png = r"D:\New folder (2)\blender_engine\output\ai_puttar_sketchfab_master_render.png"
    scene.render.filepath = out_png
    print("Rendering...")
    bpy.ops.render.render(write_still=True)
    print("Render complete:", out_png)

if __name__ == "__main__":
    build_ai_puttar_master_asset()
