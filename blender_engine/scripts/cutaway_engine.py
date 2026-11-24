"""
Procedural Mechanical Cutaway & X-Ray Engine
For "Systems & Hidden Engineering" 3D Visualizations in Blender 4.3 EEVEE Next.

Generates:
1. Macro-to-Micro Camera Dive with smooth Bezier easing.
2. Cross-Section Cutaway beds revealing buried cables, pipes, and internal gears.
3. Pulsing Electromagnetic Induction Flux rings & Wireless Telemetry waves.
4. Thermal / Friction / Eddy-Current Brake glow effects.
5. High-Tech Holographic Technical Annotation Callout Markers.
"""

import math
import bpy
from mathutils import Vector

def animate_camera_dive(cam_obj, focal_target, start_pos, dive_pos, start_frame, end_frame):
    """Smoothly dives the camera from wide contextual shot to close-up mechanical macro view."""
    cam_obj.location = start_pos
    cam_obj.keyframe_insert(data_path="location", frame=start_frame)

    cam_obj.location = dive_pos
    cam_obj.keyframe_insert(data_path="location", frame=end_frame)

    # Ensure TRACK_TO constraint points at focal target
    track = None
    for c in cam_obj.constraints:
        if c.type == 'TRACK_TO':
            track = c
            break
    if not track:
        track = cam_obj.constraints.new(type='TRACK_TO')
        track.track_axis = 'TRACK_NEGATIVE_Z'
        track.up_axis = 'UP_Y'
    track.target = focal_target

def create_pulsing_flux_rings(center_pos, count=5, radius_start=0.35, radius_step=0.12, color=(0.0, 0.88, 1.0, 1.0), emission_str=16.0):
    """Spawns concentric electromagnetic induction flux waves expanding upwards."""
    mat_flux = bpy.data.materials.new("FluxEmissionField")
    mat_flux.use_nodes = True
    bsdf = mat_flux.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs['Emission Color'].default_value = color
    bsdf.inputs['Emission Strength'].default_value = emission_str

    rings = []
    for i in range(count):
        y_offset = i * 1.5
        z_offset = i * 0.14
        bpy.ops.mesh.primitive_torus_add(
            major_radius=radius_start + (i * radius_step),
            minor_radius=0.022,
            location=(center_pos[0], center_pos[1] + y_offset, center_pos[2] + z_offset)
        )
        ring = bpy.context.active_object
        ring.name = f"Flux_Wave_{i}"
        ring.rotation_euler = (math.radians(90), 0, 0)
        ring.data.materials.append(mat_flux)
        rings.append(ring)

    return rings

def create_friction_thermal_glow(contact_pos, start_frame, end_frame, color=(1.0, 0.25, 0.02, 1.0)):
    """Creates an emergency brake friction / eddy-current thermal heat spot on rails or brake discs."""
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=contact_pos)
    glow_sphere = bpy.context.active_object
    glow_sphere.name = "Friction_Thermal_Glow"

    mat_heat = bpy.data.materials.new("ThermalHeatMat")
    mat_heat.use_nodes = True
    bsdf = mat_heat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs['Emission Color'].default_value = color

    glow_sphere.data.materials.append(mat_heat)

    # Animate emission strength: 0 -> 25 -> 0
    bsdf.inputs['Emission Strength'].default_value = 0.0
    bsdf.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=start_frame)

    mid_frame = (start_frame + end_frame) // 2
    bsdf.inputs['Emission Strength'].default_value = 25.0
    bsdf.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=mid_frame)

    bsdf.inputs['Emission Strength'].default_value = 2.0
    bsdf.inputs['Emission Strength'].keyframe_insert(data_path="default_value", frame=end_frame)

    return glow_sphere

def create_ground_cutaway_bed(location=(0, 20, 0), width=5.6, length=60.0, depth=0.8):
    """Creates a clean architectural cutaway cross-section revealing subsurface components."""
    # Subgrade Earth
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(location[0], location[1], location[2] - depth * 1.2))
    earth = bpy.context.active_object
    earth.name = "Cutaway_Earth"
    earth.scale = (width * 3.5, length, depth)
    mat_earth = bpy.data.materials.new("EarthCrossSection")
    mat_earth.use_nodes = True
    mat_earth.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.16, 0.14, 0.12, 1.0)
    earth.data.materials.append(mat_earth)

    # Crushed Ballast Bed
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(location[0], location[1], location[2] - depth * 0.4))
    ballast = bpy.context.active_object
    ballast.name = "Cutaway_Ballast"
    ballast.scale = (width, length, depth * 0.8)
    mat_bal = bpy.data.materials.new("BallastGranite")
    mat_bal.use_nodes = True
    mat_bal.node_tree.nodes.get("Principled BSDF").inputs['Base Color'].default_value = (0.32, 0.32, 0.34, 1.0)
    ballast.data.materials.append(mat_bal)

    return earth, ballast
