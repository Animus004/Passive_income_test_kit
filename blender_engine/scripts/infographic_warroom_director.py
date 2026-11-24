"""
Infographic War-Room & Diorama 3D Director (Blender 4.3 EEVEE Next)
Re-engineered from forensic analysis of top-tier documentary reels.

Key Architectural Upgrades:
1. Master Diorama Tabletop Plinth (No Black Void): Beveled walnut/metal frame with dark reflective acrylic surface.
2. 3D Continental Map & Dynamic Network: Extruded vector boundaries, glowing airport hubs, arching Bezier flight paths.
3. Detailed Procedural Metaphor Props:
   - 3D Timeline Monolith (2001, 2023, 2026) with gold frames and laser reticle.
   - Stacked Enterprise Server Switches (2002 FAA Telecom) with 24 blinking green LEDs & barcode decal.
   - 1st-Gen iPhone (2007) with aluminum casing and 4x4 app icon grid.
   - Air Traffic Controller Console with circular CRT radar sweep and stylized headset operator.
   - Holographic Metric Cage ($50,000,000,000).
4. 2.5D Motion Graphics Layer:
   - Floating glassmorphism HUD pills (timestamps, locations, alerts).
   - 3D Leader Lines with circular anchor pins and floating label chips.
5. High-End Studio Lighting & Depth of Field (Tilt-shift miniature realism).
"""

import sys
import os
import math
import bpy
from mathutils import Vector, Euler

# -----------------------------------------------------------------------------
# 1. MATERIAL FACTORY
# -----------------------------------------------------------------------------
def get_or_create_mat(name, base_color=(1, 1, 1, 1), roughness=0.5, metallic=0.0, emission_color=None, emission_strength=0.0, transmission=0.0, alpha=1.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = transmission
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = transmission
        if "Alpha" in bsdf.inputs:
            bsdf.inputs["Alpha"].default_value = alpha

        if emission_color and emission_strength > 0:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission_color
                bsdf.inputs["Emission Strength"].default_value = emission_strength
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = emission_color
    return mat

def set_smooth(obj):
    if obj and obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True

def set_hierarchy_vis(obj, hide, frame):
    if not obj: return
    obj.hide_render = hide
    obj.hide_viewport = hide
    obj.keyframe_insert(data_path="hide_render", frame=frame)
    obj.keyframe_insert(data_path="hide_viewport", frame=frame)
    if hasattr(obj, 'children_recursive'):
        for ch in obj.children_recursive:
            ch.hide_render = hide
            ch.hide_viewport = hide
            ch.keyframe_insert(data_path="hide_render", frame=frame)
            ch.keyframe_insert(data_path="hide_viewport", frame=frame)

# -----------------------------------------------------------------------------
# 2. STUDIO ENVIRONMENT & LIGHTING
# -----------------------------------------------------------------------------
def setup_dark_studio_environment():
    # World background: Deep luxury charcoal-navy (never 100% black)
    world = bpy.context.scene.world or bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.015, 0.022, 0.038, 1.0) # #0A1128 tone
        bg.inputs["Strength"].default_value = 0.8

    # Key Spot / Area: Warm directional table light
    bpy.ops.object.light_add(type='SPOT', location=(1.8, -2.5, 3.8))
    key_light = bpy.context.active_object
    key_light.data.energy = 280.0
    key_light.data.spot_size = math.radians(65)
    key_light.data.spot_blend = 0.35
    key_light.data.color = (1.0, 0.94, 0.86) # Warm 4000K
    key_light.rotation_euler = Euler((math.radians(35), math.radians(15), math.radians(25)))

    # Fill Area: Cool cyan ambient fill
    bpy.ops.object.light_add(type='AREA', location=(-2.6, 1.5, 2.8))
    fill_light = bpy.context.active_object
    fill_light.data.energy = 85.0
    fill_light.data.size = 2.5
    fill_light.data.color = (0.65, 0.82, 1.0) # Cool cyan fill

    # Rim / Kicker: High-power back edge highlight (defines bevels and server lines)
    bpy.ops.object.light_add(type='AREA', location=(0.0, 3.2, 2.4))
    rim_light = bpy.context.active_object
    rim_light.data.energy = 220.0
    rim_light.data.size = 3.0
    rim_light.data.color = (0.85, 0.95, 1.0) # Crisp white rim
    rim_light.rotation_euler = Euler((math.radians(-40), 0, 0))

# -----------------------------------------------------------------------------
# 3. WAR-ROOM TABLETOP PLINTH & 3D FLIGHT MAP
# -----------------------------------------------------------------------------
def build_warroom_map_table(mats):
    root = bpy.data.objects.new("WarRoom_Table_Root", None)
    bpy.context.collection.objects.link(root)

    # 1. Beveled Wood/Metal Table Frame
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.4, -0.15))
    frame = bpy.context.active_object
    frame.name = "Table_Frame"
    frame.scale = (3.4, 4.4, 0.22)
    bpy.ops.object.transform_apply(scale=True)
    frame.data.materials.append(mats['table_frame'])
    frame.parent = root

    # 2. Dark Acrylic Glossy Map Plinth Surface
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.4, 0.0))
    surface = bpy.context.active_object
    surface.name = "Table_Surface"
    surface.scale = (3.15, 4.15, 0.08)
    bpy.ops.object.transform_apply(scale=True)
    surface.data.materials.append(mats['table_surface'])
    surface.parent = root

    # 3. Stylized US Continental Map Border (Extruded 3D wire)
    # Scaled and centered on table surface
    us_points = [
        (-1.25, -0.65), (-1.20, 0.25), (-1.15, 0.85), (-1.05, 1.35),
        (-0.55, 1.40), (-0.15, 1.45), (0.25, 1.55), (0.75, 1.45),
        (1.15, 1.35), (1.30, 0.95), (1.25, 0.45), (1.35, 0.15),
        (1.10, -0.55), (0.85, -1.05), (0.45, -0.75), (0.15, -0.95),
        (-0.25, -0.75), (-0.65, -0.85), (-1.10, -0.80)
    ]
    curve_data = bpy.data.curves.new('US_Map_Border', type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.bevel_depth = 0.012
    curve_data.bevel_resolution = 4
    polyline = curve_data.splines.new('POLY')
    polyline.points.add(len(us_points))
    for i, (ux, uy) in enumerate(us_points):
        polyline.points[i].co = (ux * 0.95, uy * 0.95 + 0.35, 0.045, 1.0)
    polyline.points[-1].co = (us_points[0][0] * 0.95, us_points[0][1] * 0.95 + 0.35, 0.045, 1.0)
    border_obj = bpy.data.objects.new('US_Map_Border_Obj', curve_data)
    bpy.context.collection.objects.link(border_obj)
    border_obj.data.materials.append(mats['cyan_glow'])
    border_obj.parent = root

    # 4. Major Hubs (Airports) with Glowing Cores & Runways
    hubs = [
        ('JFK', (1.05, 1.05, 0.045)),
        ('BOS', (1.18, 1.25, 0.045)),
        ('ATL', (0.75, 0.25, 0.045)),
        ('MIA', (0.95, -0.65, 0.045)),
        ('ORD', (0.35, 0.95, 0.045)),
        ('DFW', (0.15, -0.25, 0.045)),
        ('DEN', (-0.35, 0.45, 0.045)),
        ('PHX', (-0.75, -0.15, 0.045)),
        ('LAX', (-1.05, -0.10, 0.045)),
        ('SFO', (-1.15, 0.45, 0.045)),
        ('SEA', (-1.00, 1.25, 0.045)),
    ]
    hub_objs = {}
    for name, pos in hubs:
        # Glowing airport node
        bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=0.015, location=pos)
        node = bpy.context.active_object
        node.name = f"Hub_{name}"
        node.data.materials.append(mats['amber_node'])
        node.parent = root

        # Mini runway strip
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(pos[0] + 0.04, pos[1], pos[2]))
        runway = bpy.context.active_object
        runway.scale = (0.09, 0.015, 0.005)
        bpy.ops.object.transform_apply(scale=True)
        runway.data.materials.append(mats['white_emissive'])
        runway.parent = root

        hub_objs[name] = pos

    # 5. Glowing 3D Arched Flight Paths (Bezier Curves)
    routes = [
        ('LAX', 'JFK'), ('SFO', 'ORD'), ('SEA', 'DEN'),
        ('LAX', 'DFW'), ('DEN', 'ATL'), ('ORD', 'MIA'),
        ('DFW', 'BOS'), ('PHX', 'ORD'), ('ATL', 'JFK')
    ]
    for orig, dest in routes:
        p1 = hub_objs[orig]
        p2 = hub_objs[dest]
        mid = ((p1[0] + p2[0]) / 2.0, (p1[1] + p2[1]) / 2.0, 0.35)

        c_data = bpy.data.curves.new(f'FlightRoute_{orig}_{dest}', type='CURVE')
        c_data.dimensions = '3D'
        c_data.bevel_depth = 0.006
        spline = c_data.splines.new('BEZIER')
        spline.bezier_points.add(1)

        spline.bezier_points[0].co = p1
        spline.bezier_points[0].handle_right = (p1[0] + (mid[0] - p1[0]) * 0.5, p1[1] + (mid[1] - p1[1]) * 0.5, mid[2] * 0.8)
        spline.bezier_points[0].handle_left = p1

        spline.bezier_points[1].co = p2
        spline.bezier_points[1].handle_left = (p2[0] + (mid[0] - p2[0]) * 0.5, p2[1] + (mid[1] - p2[1]) * 0.5, mid[2] * 0.8)
        spline.bezier_points[1].handle_right = p2

        route_obj = bpy.data.objects.new(f'Route_{orig}_{dest}', c_data)
        bpy.context.collection.objects.link(route_obj)
        route_obj.data.materials.append(mats['cyan_route'])
        route_obj.parent = root

    # 6. Dense Airborne Flight Particles (60 glowing aircraft points)
    for i in range(50):
        fx = -1.0 + (i % 10) * 0.22 + (i * 0.03) % 0.15
        fy = -0.5 + (i // 10) * 0.38 + (i * 0.05) % 0.2
        fz = 0.05 + ((i * 7) % 15) * 0.015
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.012, location=(fx, fy + 0.35, fz))
        plane_pt = bpy.context.active_object
        plane_pt.name = f"FlightPt_{i}"
        plane_pt.data.materials.append(mats['white_emissive'])
        plane_pt.parent = root

    return root

# -----------------------------------------------------------------------------
# 4. METAPHOR PROPS: TIMELINE MONOLITH, SERVER SWITCHES, IPHONE, RADAR CONSOLE
# -----------------------------------------------------------------------------
def build_timeline_monolith(mats, location=(0, 0.45, 0.0)):
    """The 3D vertical monolith seen in sec_04.jpg showing the 3 Ground Stops."""
    root = bpy.data.objects.new("Timeline_Monolith_Root", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    # Monolith dark pillar base
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.72))
    pillar = bpy.context.active_object
    pillar.scale = (0.78, 0.18, 1.42)
    bpy.ops.object.transform_apply(scale=True)
    pillar.data.materials.append(mats['monolith_body'])
    pillar.parent = root

    # 3 Gold-bordered year display plaques (2001, 2023, 2026)
    years = [
        ('2001', 'SEPTEMBER 11', 1.15, mats['white_text']),
        ('2023', 'JANUARY 11', 0.72, mats['white_text']),
        ('2026', 'NOVEMBER 13', 0.28, mats['red_glow'])
    ]
    for yr, dt, z_pos, text_mat in years:
        # Gold frame
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.095, z_pos))
        frame = bpy.context.active_object
        frame.scale = (0.66, 0.02, 0.32)
        bpy.ops.object.transform_apply(scale=True)
        frame.data.materials.append(mats['gold_trim'])
        frame.parent = root

        # Black plaque face
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.106, z_pos))
        face = bpy.context.active_object
        face.scale = (0.62, 0.01, 0.28)
        bpy.ops.object.transform_apply(scale=True)
        face.data.materials.append(mats['black_acrylic'])
        face.parent = root

        # 3D Year Text
        bpy.ops.object.text_add(location=(-0.24, -0.12, z_pos - 0.04))
        txt = bpy.context.active_object
        txt.data.body = yr
        txt.data.size = 0.16
        txt.data.extrude = 0.01
        txt.rotation_euler = Euler((math.radians(90), 0, 0))
        txt.data.materials.append(text_mat)
        txt.parent = root

    # Pulsating Red Reticle Target on 2026 plaque
    bpy.ops.mesh.primitive_torus_add(major_radius=0.18, minor_radius=0.015, location=(-0.30, -0.12, 0.28), rotation=(math.radians(90), 0, 0))
    reticle = bpy.context.active_object
    reticle.data.materials.append(mats['red_glow'])
    reticle.parent = root

    return root

def build_server_stack_2002(mats, location=(0.25, 0.35, 0.0)):
    """Stacked 2002 FAA Telecom enterprise switches with 24 blinking LEDs & barcode tag."""
    root = bpy.data.objects.new("Server_Stack_Root", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    for i, sz in enumerate([0.10, 0.30]):
        # Beige switch chassis
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, sz))
        chassis = bpy.context.active_object
        chassis.scale = (1.20, 0.65, 0.18)
        bpy.ops.object.transform_apply(scale=True)
        chassis.data.materials.append(mats['server_beige'])
        chassis.parent = root

        # Front panel darker recessed bay
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.328, sz))
        bay = bpy.context.active_object
        bay.scale = (1.14, 0.01, 0.13)
        bpy.ops.object.transform_apply(scale=True)
        bay.data.materials.append(mats['server_bay_dark'])
        bay.parent = root

        # 16 Green activity LED indicator diodes
        for led_idx in range(16):
            lx = -0.48 + led_idx * 0.065
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(lx, -0.335, sz + 0.02))
            led = bpy.context.active_object
            led.scale = (0.028, 0.01, 0.025)
            bpy.ops.object.transform_apply(scale=True)
            led.data.materials.append(mats['led_green'])
            led.parent = root

        # Left ventilation grilles (black horizontal bars)
        for g_idx in range(4):
            gy = sz - 0.035 + g_idx * 0.022
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.35, -0.334, gy))
            grille = bpy.context.active_object
            grille.scale = (0.24, 0.008, 0.008)
            bpy.ops.object.transform_apply(scale=True)
            grille.data.materials.append(mats['server_bay_dark'])
            grille.parent = root

        # Barcode contract label decal on the top switch
        if i == 1:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.34, -0.332, sz + 0.015))
            label = bpy.context.active_object
            label.scale = (0.34, 0.005, 0.09)
            bpy.ops.object.transform_apply(scale=True)
            label.data.materials.append(mats['white_label'])
            label.parent = root

            # Barcode stripes
            for b_i in range(12):
                bx = -0.46 + b_i * 0.020
                bpy.ops.mesh.primitive_cube_add(size=1.0, location=(bx, -0.336, sz + 0.03))
                bar = bpy.context.active_object
                bar.scale = (0.008, 0.004, 0.035)
                bpy.ops.object.transform_apply(scale=True)
                bar.data.materials.append(mats['server_bay_dark'])
                bar.parent = root

    return root

def build_iphone_2007(mats, location=(-0.55, 0.15, 0.0)):
    """1st-Gen iPhone (2007) with aluminum frame, home button, and 4x4 app grid."""
    root = bpy.data.objects.new("iPhone_2007_Root", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    # Black phone chassis standing upright angled slightly
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.28), rotation=(math.radians(-8), math.radians(12), 0))
    phone = bpy.context.active_object
    phone.scale = (0.28, 0.04, 0.54)
    bpy.ops.object.transform_apply(scale=True)
    phone.data.materials.append(mats['iphone_metal'])
    phone.parent = root

    # Glossy front glass screen
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.005, -0.022, 0.31), rotation=(math.radians(-8), math.radians(12), 0))
    screen = bpy.context.active_object
    screen.scale = (0.23, 0.005, 0.36)
    bpy.ops.object.transform_apply(scale=True)
    screen.data.materials.append(mats['iphone_screen'])
    screen.parent = root

    # Round home button
    bpy.ops.mesh.primitive_cylinder_add(radius=0.024, depth=0.005, location=(0.008, -0.023, 0.09), rotation=(math.radians(82), math.radians(12), 0))
    btn = bpy.context.active_object
    btn.data.materials.append(mats['server_bay_dark'])
    btn.parent = root

    # 4x4 App icon matrix on screen
    app_colors = [
        (0.2, 0.6, 1.0), (0.9, 0.3, 0.1), (0.1, 0.8, 0.3), (0.9, 0.7, 0.1),
        (0.8, 0.2, 0.8), (0.1, 0.7, 0.9), (0.9, 0.2, 0.3), (0.5, 0.5, 0.5),
        (0.2, 0.4, 0.9), (0.9, 0.5, 0.1), (0.3, 0.8, 0.2), (0.8, 0.6, 0.2),
        (0.1, 0.5, 0.8), (0.7, 0.2, 0.5), (0.2, 0.7, 0.4), (0.4, 0.4, 0.4)
    ]
    for row in range(4):
        for col in range(4):
            ax = -0.075 + col * 0.050
            az = 0.42 - row * 0.070
            app_mat = get_or_create_mat(f"AppMat_{row}_{col}", base_color=(*app_colors[row*4 + col], 1.0), roughness=0.3, emission_color=(*app_colors[row*4 + col], 1.0), emission_strength=1.5)
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(ax + 0.015, -0.024, az), rotation=(math.radians(-8), math.radians(12), 0))
            app = bpy.context.active_object
            app.scale = (0.032, 0.004, 0.042)
            bpy.ops.object.transform_apply(scale=True)
            app.data.materials.append(app_mat)
            app.parent = root

    return root

def build_radar_controller_station(mats, location=(-0.35, -0.15, 0.0)):
    """Air traffic controller console with round green radar CRT screen and operator."""
    root = bpy.data.objects.new("Radar_Station_Root", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    # Slanted dark blue workstation console
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.38), rotation=(math.radians(22), 0, 0))
    console = bpy.context.active_object
    console.scale = (0.88, 0.55, 0.52)
    bpy.ops.object.transform_apply(scale=True)
    console.data.materials.append(mats['console_body'])
    console.parent = root

    # Circular Radar CRT Display
    bpy.ops.mesh.primitive_cylinder_add(radius=0.28, depth=0.03, location=(0.08, -0.26, 0.58), rotation=(math.radians(50), 0, 0))
    radar = bpy.context.active_object
    radar.data.materials.append(mats['radar_green'])
    radar.parent = root

    # Radar rings (concentric green lines)
    for r_rad in [0.12, 0.20]:
        bpy.ops.mesh.primitive_torus_add(major_radius=r_rad, minor_radius=0.005, location=(0.08, -0.27, 0.58), rotation=(math.radians(50), 0, 0))
        ring = bpy.context.active_object
        ring.data.materials.append(mats['cyan_glow'])
        ring.parent = root

    # Orange circular target reticle around one blip
    bpy.ops.mesh.primitive_torus_add(major_radius=0.045, minor_radius=0.005, location=(0.04, -0.27, 0.57), rotation=(math.radians(50), 0, 0))
    target = bpy.context.active_object
    target.data.materials.append(mats['amber_node'])
    target.parent = root

    # Stylized Air Traffic Controller (chibi human with headset)
    # Body (light blue shirt)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=0.36, location=(-0.25, -0.32, 0.26))
    char_body = bpy.context.active_object
    char_body.data.materials.append(mats['char_shirt'])
    char_body.parent = root

    # Head
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, location=(-0.25, -0.32, 0.52))
    char_head = bpy.context.active_object
    char_head.data.materials.append(mats['char_skin'])
    char_head.parent = root

    # Headset headband & earcups
    bpy.ops.mesh.primitive_torus_add(major_radius=0.16, minor_radius=0.02, location=(-0.25, -0.32, 0.54), rotation=(0, math.radians(90), 0))
    headband = bpy.context.active_object
    headband.data.materials.append(mats['server_bay_dark'])
    headband.parent = root

    for ex in [-0.41, -0.09]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.04, location=(ex, -0.32, 0.52), rotation=(0, math.radians(90), 0))
        cup = bpy.context.active_object
        cup.data.materials.append(mats['server_bay_dark'])
        cup.parent = root

    return root

def build_holographic_cost_cube(mats, location=(0.0, 0.35, 0.0)):
    """Transparent blue holographic cost cube ($50 Billion) seen in sec_43.jpg."""
    root = bpy.data.objects.new("Holo_Cost_Cube_Root", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    # Semi-transparent glowing blue cube
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.65))
    cube = bpy.context.active_object
    cube.scale = (0.95, 0.85, 1.15)
    bpy.ops.object.transform_apply(scale=True)
    cube.data.materials.append(mats['holo_blue'])
    cube.parent = root

    # Wireframe edge accents
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.65))
    edge = bpy.context.active_object
    edge.scale = (0.96, 0.86, 1.16)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.modifier_add(type='WIREFRAME')
    edge.modifiers["Wireframe"].thickness = 0.015
    edge.data.materials.append(mats['cyan_glow'])
    edge.parent = root

    # 3D Emissive Text "$50,000,000,000"
    bpy.ops.object.text_add(location=(-0.42, -0.44, 0.45))
    txt = bpy.context.active_object
    txt.data.body = "$50,000,000,000"
    txt.data.size = 0.085
    txt.data.extrude = 0.01
    txt.rotation_euler = Euler((math.radians(90), 0, 0))
    txt.data.materials.append(mats['white_text'])
    txt.parent = root

    # Sub-label: "ESTIMATE FOR A WHOLE NEW SYSTEM"
    bpy.ops.object.text_add(location=(-0.38, -0.44, 0.35))
    txt_sub = bpy.context.active_object
    txt_sub.data.body = "ESTIMATE FOR A WHOLE NEW SYSTEM"
    txt_sub.data.size = 0.038
    txt_sub.data.extrude = 0.005
    txt_sub.rotation_euler = Euler((math.radians(90), 0, 0))
    txt_sub.data.materials.append(mats['white_text'])
    txt_sub.parent = root

    return root

# -----------------------------------------------------------------------------
# 5. 2.5D MOTION GRAPHICS: HUD PILLS & LEADER LINES
# -----------------------------------------------------------------------------
def build_leader_callout(mats, target_pos, label_text, year_text, offset=(0.15, -0.25, 0.35)):
    """Creates a 3D leader line with anchor bead and dark glass card."""
    root = bpy.data.objects.new(f"Callout_{year_text}", None)
    bpy.context.collection.objects.link(root)

    # 1. Glowing anchor sphere on the target
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.018, location=target_pos)
    anchor = bpy.context.active_object
    anchor.data.materials.append(mats['white_emissive'])
    anchor.parent = root

    card_pos = (target_pos[0] + offset[0], target_pos[1] + offset[1], target_pos[2] + offset[2])

    # 2. Leader Line (Cylinder line connecting target to card)
    curve_data = bpy.data.curves.new(f'Line_{year_text}', type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.bevel_depth = 0.005
    spline = curve_data.splines.new('POLY')
    spline.points.add(2)
    spline.points[0].co = (target_pos[0], target_pos[1], target_pos[2], 1.0)
    spline.points[1].co = (card_pos[0], card_pos[1], card_pos[2] - 0.08, 1.0)
    line_obj = bpy.data.objects.new(f'LineObj_{year_text}', curve_data)
    bpy.context.collection.objects.link(line_obj)
    line_obj.data.materials.append(mats['white_emissive'])
    line_obj.parent = root

    # 3. Dark Glass Callout Card
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=card_pos)
    card = bpy.context.active_object
    card.scale = (0.42, 0.012, 0.18)
    bpy.ops.object.transform_apply(scale=True)
    card.data.materials.append(mats['glass_hud'])
    card.parent = root

    # 4. White Border Outline
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=card_pos)
    c_border = bpy.context.active_object
    c_border.scale = (0.43, 0.014, 0.19)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.modifier_add(type='WIREFRAME')
    c_border.modifiers["Wireframe"].thickness = 0.006
    c_border.data.materials.append(mats['white_emissive'])
    c_border.parent = root

    # 5. Label Text & Year
    bpy.ops.object.text_add(location=(card_pos[0] - 0.18, card_pos[1] - 0.015, card_pos[2] + 0.025))
    txt_lbl = bpy.context.active_object
    txt_lbl.data.body = label_text
    txt_lbl.data.size = 0.038
    txt_lbl.rotation_euler = Euler((math.radians(90), 0, 0))
    txt_lbl.data.materials.append(mats['white_text'])
    txt_lbl.parent = root

    bpy.ops.object.text_add(location=(card_pos[0] - 0.14, card_pos[1] - 0.015, card_pos[2] - 0.060))
    txt_yr = bpy.context.active_object
    txt_yr.data.body = year_text
    txt_yr.data.size = 0.068
    txt_yr.rotation_euler = Euler((math.radians(90), 0, 0))
    txt_yr.data.materials.append(mats['white_text'])
    txt_yr.parent = root

    return root

def build_hud_timestamp_chip(mats, text, location=(0, -1.2, 0.15)):
    """Dark glassmorphism timestamp chip [FRIDAY 13 NOV 2026 • 3:54 PM ET]."""
    root = bpy.data.objects.new("HUD_Timestamp_Root", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
    chip = bpy.context.active_object
    chip.scale = (1.45, 0.01, 0.12)
    bpy.ops.object.transform_apply(scale=True)
    chip.data.materials.append(mats['glass_hud'])
    chip.parent = root

    bpy.ops.object.text_add(location=(-0.64, -0.015, -0.025))
    txt = bpy.context.active_object
    txt.data.body = text
    txt.data.size = 0.048
    txt.rotation_euler = Euler((math.radians(90), 0, 0))
    txt.data.materials.append(mats['white_text'])
    txt.parent = root

    return root

def build_ground_stop_banner(mats, location=(0, 0.25, 0.35)):
    """Massive glowing red headline: GROUND STOP - EVERY DEPARTURE IN THE U.S."""
    root = bpy.data.objects.new("GroundStop_Banner_Root", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    bpy.ops.object.text_add(location=(-0.75, 0, 0))
    txt = bpy.context.active_object
    txt.data.body = "GROUND STOP"
    txt.data.size = 0.24
    txt.data.extrude = 0.025
    txt.rotation_euler = Euler((math.radians(90), 0, 0))
    txt.data.materials.append(mats['red_glow'])
    txt.parent = root

    bpy.ops.object.text_add(location=(-0.68, 0, -0.12))
    sub = bpy.context.active_object
    sub.data.body = "EVERY DEPARTURE IN THE U.S."
    sub.data.size = 0.075
    sub.data.extrude = 0.01
    sub.rotation_euler = Euler((math.radians(90), 0, 0))
    sub.data.materials.append(mats['white_text'])
    sub.parent = root

    return root

def build_gridlock_clock_card(mats, location=(0, 0.30, 0.28)):
    """The 6:38 PM 2h 44m ground stop callout seen in sec_35s.jpg."""
    root = bpy.data.objects.new("Gridlock_Clock_Root", None)
    root.location = location
    bpy.context.collection.objects.link(root)

    # Big 3D Glowing Red "6:38 PM"
    bpy.ops.object.text_add(location=(-0.46, 0, 0.05))
    txt = bpy.context.active_object
    txt.data.body = "6:38 PM"
    txt.data.size = 0.24
    txt.data.extrude = 0.02
    txt.rotation_euler = Euler((math.radians(90), 0, 0))
    txt.data.materials.append(mats['red_glow'])
    txt.parent = root

    # Subtext: "2 H 44 MIN • NOTHING TAKES OFF"
    bpy.ops.object.text_add(location=(-0.52, 0, -0.08))
    sub = bpy.context.active_object
    sub.data.body = "2 H 44 MIN • NOTHING TAKES OFF"
    sub.data.size = 0.048
    sub.data.extrude = 0.008
    sub.rotation_euler = Euler((math.radians(90), 0, 0))
    sub.data.materials.append(mats['white_text'])
    sub.parent = root

    return root

# -----------------------------------------------------------------------------
# 6. MASTER ENGINE & SHOT CHOREOGRAPHY
# -----------------------------------------------------------------------------
def build_and_render_infographic_reel(output_path, is_qa=True, total_frames=1430):
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # 1. Setup Materials
    mats = {
        'table_frame':     get_or_create_mat("Mat_Table_Frame", base_color=(0.14, 0.10, 0.08, 1.0), roughness=0.35, metallic=0.1),
        'table_surface':   get_or_create_mat("Mat_Table_Surface", base_color=(0.022, 0.035, 0.055, 1.0), roughness=0.12, metallic=0.05),
        'cyan_glow':       get_or_create_mat("Mat_Cyan_Glow", base_color=(0.0, 0.7, 1.0, 1.0), emission_color=(0.0, 0.7, 1.0, 1.0), emission_strength=4.0),
        'cyan_route':      get_or_create_mat("Mat_Cyan_Route", base_color=(0.1, 0.85, 1.0, 1.0), emission_color=(0.1, 0.85, 1.0, 1.0), emission_strength=5.5),
        'amber_node':      get_or_create_mat("Mat_Amber_Node", base_color=(1.0, 0.65, 0.1, 1.0), emission_color=(1.0, 0.65, 0.1, 1.0), emission_strength=6.0),
        'white_emissive':  get_or_create_mat("Mat_White_Emissive", base_color=(1.0, 1.0, 1.0, 1.0), emission_color=(1.0, 1.0, 1.0, 1.0), emission_strength=3.5),
        'red_glow':        get_or_create_mat("Mat_Red_Glow", base_color=(1.0, 0.1, 0.2, 1.0), emission_color=(1.0, 0.1, 0.2, 1.0), emission_strength=7.0),
        'monolith_body':   get_or_create_mat("Mat_Monolith_Body", base_color=(0.08, 0.09, 0.12, 1.0), roughness=0.25, metallic=0.85),
        'gold_trim':       get_or_create_mat("Mat_Gold_Trim", base_color=(0.95, 0.75, 0.25, 1.0), roughness=0.15, metallic=0.95),
        'black_acrylic':   get_or_create_mat("Mat_Black_Acrylic", base_color=(0.02, 0.02, 0.02, 1.0), roughness=0.1),
        'server_beige':    get_or_create_mat("Mat_Server_Beige", base_color=(0.88, 0.86, 0.82, 1.0), roughness=0.55),
        'server_bay_dark': get_or_create_mat("Mat_Server_Bay_Dark", base_color=(0.12, 0.13, 0.15, 1.0), roughness=0.4),
        'led_green':       get_or_create_mat("Mat_LED_Green", base_color=(0.1, 1.0, 0.3, 1.0), emission_color=(0.1, 1.0, 0.3, 1.0), emission_strength=8.0),
        'white_label':     get_or_create_mat("Mat_White_Label", base_color=(0.95, 0.95, 0.92, 1.0), roughness=0.6),
        'iphone_metal':    get_or_create_mat("Mat_iPhone_Metal", base_color=(0.15, 0.15, 0.16, 1.0), roughness=0.2, metallic=0.9),
        'iphone_screen':   get_or_create_mat("Mat_iPhone_Screen", base_color=(0.01, 0.01, 0.01, 1.0), roughness=0.05),
        'console_body':    get_or_create_mat("Mat_Console_Body", base_color=(0.15, 0.20, 0.28, 1.0), roughness=0.35, metallic=0.4),
        'radar_green':     get_or_create_mat("Mat_Radar_Green", base_color=(0.02, 0.15, 0.05, 1.0), emission_color=(0.04, 0.25, 0.08, 1.0), emission_strength=2.2),
        'char_shirt':      get_or_create_mat("Mat_Char_Shirt", base_color=(0.60, 0.78, 0.95, 1.0), roughness=0.6),
        'char_skin':       get_or_create_mat("Mat_Char_Skin", base_color=(0.92, 0.74, 0.62, 1.0), roughness=0.5),
        'holo_blue':       get_or_create_mat("Mat_Holo_Blue", base_color=(0.1, 0.5, 0.9, 0.35), transmission=0.75, alpha=0.35, roughness=0.1, emission_color=(0.1, 0.6, 1.0, 1.0), emission_strength=1.5),
        'glass_hud':       get_or_create_mat("Mat_Glass_HUD", base_color=(0.04, 0.06, 0.10, 0.85), alpha=0.85, roughness=0.15, metallic=0.2),
        'white_text':      get_or_create_mat("Mat_White_Text", base_color=(1.0, 1.0, 1.0, 1.0), emission_color=(1.0, 1.0, 1.0, 1.0), emission_strength=2.8),
    }

    # 2. Lighting & World
    setup_dark_studio_environment()

    # 3. Master Tabletop Map Plinth (Persistent World)
    table = build_warroom_map_table(mats)

    # 4. Cinematic Shot Plan & Focal Prop Instantiation
    # Shots aligned to the narrative:
    # Shot 0: 0-120  (0.0s - 4.0s)  Wide map table with GROUND STOP headline & timestamp chip
    # Shot 1: 121-360 (4.0s - 12.0s) 3D Monolith Tower: 2001, 2023, 2026 ground stops
    # Shot 2: 361-600 (12.0s - 20.0s) Controller at radar screen ("Controllers there keep")
    # Shot 3: 601-900 (20.0s - 30.0s) 2002 Server Switch vs 2007 iPhone with animated leader lines
    # Shot 4: 901-1150 (30.0s - 38.3s) 6:38 PM Map Table showing 2h 44m ground stop
    # Shot 5: 1151-1430 (38.3s - 47.6s) Holographic $50 Billion cost cube with grand crane pullout

    banner_obj = build_ground_stop_banner(mats, location=(0, 0.35, 0.38))
    chip_obj = build_hud_timestamp_chip(mats, "FRIDAY 13 NOV 2026 • 3:54 PM ET", location=(0, -1.05, 0.15))
    monolith_obj = build_timeline_monolith(mats, location=(0, 0.40, 0.04))
    radar_obj = build_radar_controller_station(mats, location=(-0.25, 0.10, 0.04))
    server_obj = build_server_stack_2002(mats, location=(0.35, 0.25, 0.04))
    iphone_obj = build_iphone_2007(mats, location=(-0.45, 0.05, 0.04))
    callout_server = build_leader_callout(mats, (0.35, -0.08, 0.35), "THE NETWORK", "2002", offset=(0.02, -0.28, 0.38))
    callout_iphone = build_leader_callout(mats, (-0.45, 0.05, 0.32), "FIRST IPHONE", "2007", offset=(0.04, -0.28, 0.38))
    clock_obj = build_gridlock_clock_card(mats, location=(0, 0.35, 0.28))
    holo_cube = build_holographic_cost_cube(mats, location=(-0.30, 0.35, 0.04))

    # Keyframe Shot Visibility
    # Shot 0 (1-120): Banner & Chip
    set_hierarchy_vis(banner_obj, False, 1)
    set_hierarchy_vis(banner_obj, True, 121)
    set_hierarchy_vis(chip_obj, False, 1)
    set_hierarchy_vis(chip_obj, True, 121)

    # Shot 1 (121-360): Monolith
    set_hierarchy_vis(monolith_obj, True, 1)
    set_hierarchy_vis(monolith_obj, False, 121)
    set_hierarchy_vis(monolith_obj, True, 361)

    # Shot 2 (361-600): Radar Station
    set_hierarchy_vis(radar_obj, True, 1)
    set_hierarchy_vis(radar_obj, False, 361)
    set_hierarchy_vis(radar_obj, True, 601)

    # Shot 3 (601-900): Server + iPhone + Callouts
    for obj in [server_obj, iphone_obj, callout_server, callout_iphone]:
        set_hierarchy_vis(obj, True, 1)
        set_hierarchy_vis(obj, False, 601)
        set_hierarchy_vis(obj, True, 901)

    # Shot 4 (901-1150): Map Table with Ground Stop + Clock
    set_hierarchy_vis(clock_obj, True, 1)
    set_hierarchy_vis(clock_obj, False, 901)
    set_hierarchy_vis(clock_obj, True, 1151)

    # Shot 5 (1151-1430): Server + Holo Cube
    set_hierarchy_vis(server_obj, False, 1151)
    set_hierarchy_vis(holo_cube, True, 1)
    set_hierarchy_vis(holo_cube, False, 1151)

    # 5. Camera Choreography with Physical Depth of Field (Tilt-Shift Miniature Realism)
    cam_data = bpy.data.cameras.new("WarRoom_Camera")
    cam_data.lens = 36.0
    cam_data.dof.use_dof = True
    cam_data.dof.aperture_fstop = 3.2

    cam_obj = bpy.data.objects.new("Camera_WarRoom", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    shots = [
        # Shot 0: Wide table sweep with GROUND STOP
        {'start_f': 1,    'end_f': 120,  'start_pos': (0.0, -2.5, 2.2),   'end_pos': (0.0, -2.1, 1.8),   'target': (0.0, 0.45, 0.25), 'fdist': 2.5, 'lens': 36.0},
        # Shot 1: Monolith 3-tier timeline with 2026 red reticle
        {'start_f': 121,  'end_f': 360,  'start_pos': (-0.05, -1.35, 1.05), 'end_pos': (0.08, -1.15, 0.95), 'target': (-0.08, 0.40, 0.72), 'fdist': 1.6, 'lens': 40.0},
        # Shot 2: Air Traffic Controller looking at green radar scope
        {'start_f': 361,  'end_f': 600,  'start_pos': (0.05, -1.50, 0.95),  'end_pos': (0.10, -1.25, 0.88), 'target': (-0.17, -0.16, 0.60), 'fdist': 1.4, 'lens': 36.0},
        # Shot 3: 2002 Server Switch vs 2007 iPhone Split with Leader Lines
        {'start_f': 601,  'end_f': 900,  'start_pos': (-0.05, -2.10, 1.15), 'end_pos': (0.05, -1.90, 1.05), 'target': (0.0, 0.15, 0.38), 'fdist': 2.0, 'lens': 28.0},
        # Shot 4: Map table 6:38 PM Gridlock
        {'start_f': 901,  'end_f': 1150, 'start_pos': (0.35, -2.2, 2.1),   'end_pos': (-0.25, -1.9, 1.8), 'target': (0.0, 0.4, 0.15), 'fdist': 2.3, 'lens': 36.0},
        # Shot 5: $50 Billion Holo Cube with Grand Finale Crane
        {'start_f': 1151, 'end_f': 1430, 'start_pos': (-0.35, -1.5, 1.25), 'end_pos': (-0.75, -2.8, 2.5), 'target': (-0.15, 0.35, 0.55), 'fdist': 2.0, 'lens': 32.0},
    ]

    for s in shots:
        sf = s['start_f']
        ef = s['end_f']
        sp = Vector(s['start_pos'])
        ep = Vector(s['end_pos'])
        tgt = Vector(s['target'])

        rot_start = (tgt - sp).to_track_quat('-Z', 'Y').to_euler()
        rot_end = (tgt - ep).to_track_quat('-Z', 'Y').to_euler()

        cam_obj.location = sp
        cam_obj.rotation_euler = rot_start
        cam_data.lens = s['lens']
        cam_data.dof.focus_distance = s['fdist']
        cam_obj.keyframe_insert(data_path="location", frame=sf)
        cam_obj.keyframe_insert(data_path="rotation_euler", frame=sf)
        cam_data.keyframe_insert(data_path="lens", frame=sf)
        cam_data.dof.keyframe_insert(data_path="focus_distance", frame=sf)

        cam_obj.location = ep
        cam_obj.rotation_euler = rot_end
        cam_data.lens = s['lens']
        cam_data.dof.focus_distance = s['fdist']
        cam_obj.keyframe_insert(data_path="location", frame=ef)
        cam_obj.keyframe_insert(data_path="rotation_euler", frame=ef)
        cam_data.keyframe_insert(data_path="lens", frame=ef)
        cam_data.dof.keyframe_insert(data_path="focus_distance", frame=ef)
        cam_obj.keyframe_insert(data_path="location", frame=ef)
        cam_obj.keyframe_insert(data_path="rotation_euler", frame=ef)
        cam_data.dof.keyframe_insert(data_path="focus_distance", frame=ef)

    # Set hard cuts at shot boundaries
    if cam_obj.animation_data and cam_obj.animation_data.action:
        for fcurve in cam_obj.animation_data.action.fcurves:
            for kfp in fcurve.keyframe_points:
                is_boundary = any(s['end_f'] == int(kfp.co[0]) for s in shots)
                kfp.interpolation = 'CONSTANT' if is_boundary else 'BEZIER'

    # 6. Render Settings (EEVEE Next GPU)
    scene = bpy.context.scene
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1920
    scene.render.fps = 30
    scene.frame_start = 1
    scene.frame_end = total_frames
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 12

    if is_qa:
        print("\n📸 Rendering Visual QA Stills for War-Room Infographic Reel...")
        out_dir = os.path.dirname(output_path)
        os.makedirs(out_dir, exist_ok=True)
        qa_frames = [60, 240, 480, 750, 1020, 1280]
        for idx, f_num in enumerate(qa_frames):
            scene.frame_set(f_num)
            qa_p = os.path.join(out_dir, f"warroom_qa_{idx+1:02d}.jpg")
            scene.render.filepath = qa_p
            bpy.ops.render.render(write_still=True)
            print(f"   ✅ Saved QA Still Frame {f_num:4d} (Shot {idx}) -> {qa_p}")
        return True

    # Full animation render
    print(f"\n🎬 Rendering {total_frames} Frames with EEVEE Next GPU...")
    out_dir = os.path.dirname(output_path)
    os.makedirs(out_dir, exist_ok=True)
    scene.render.image_settings.file_format = 'JPEG'
    scene.render.image_settings.quality = 95
    scene.render.filepath = output_path
    bpy.ops.render.render(animation=True)
    print("✅ EEVEE Next Render Complete!")
    return True

if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    out_p = args[args.index("--output") + 1] if "--output" in args else "scratch/warroom_infographic/qa/warroom_qa_"
    qa_mode = "--qa-stills" in args
    frames_mode = "--frames" in args
    total_f = int(args[args.index("--total-frames") + 1]) if "--total-frames" in args else 1430

    build_and_render_infographic_reel(out_p, is_qa=qa_mode, total_frames=total_f)
