import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def create_tilak_texture(output_path):
    # 512 x 1024 RGBA transparent decal
    w, h = 512, 1024
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = w // 2, h // 2
    
    # 1. Vermilion Red Tilak Body (Vertical teardrop/flame shape)
    tilak_w = 70
    tilak_h = 240
    
    # Draw vermilion flame/capsule
    red_color = (195, 20, 28, 250)
    top_y = cy - tilak_h // 2
    bot_y = cy + tilak_h // 2
    
    # Smooth curved shape
    points = []
    # Top rounded tip
    for a in np.linspace(math.pi, 2 * math.pi, 30):
        px = cx + (tilak_w * 0.45) * math.cos(a)
        py = top_y + (tilak_w * 0.45) + (tilak_w * 0.45) * math.sin(a)
        points.append((px, py))
    # Right edge curving down
    points.append((cx + tilak_w * 0.5, cy))
    # Bottom tapered point
    points.append((cx, bot_y))
    # Left edge curving up
    points.append((cx - tilak_w * 0.5, cy))
    
    draw.polygon(points, fill=red_color)
    
    # Soft powder edge blur
    img = img.filter(ImageFilter.GaussianBlur(radius=2.5))
    draw = ImageDraw.Draw(img)
    
    # Redraw core for rich pigment saturation
    core_points = [(p[0] * 0.9 + cx * 0.1, p[1] * 0.9 + cy * 0.1) for p in points]
    draw.polygon(core_points, fill=(180, 10, 18, 240))
    
    # 2. Yellow Chandan (Sandalwood) subtle under-dot / crescent
    chandan_color = (245, 175, 25, 220)
    draw.ellipse([cx - 24, cy + 10, cx + 24, cy + 58], fill=chandan_color)
    
    # 3. Akshat (Raw White Rice Grains) pressed into center
    rice_color = (252, 252, 248, 255)
    rice_shadow = (140, 15, 20, 200)
    
    # Grain 1 (slightly tilted left)
    draw.ellipse([cx - 10, cy + 18, cx - 1, cy + 42], fill=rice_shadow)
    draw.ellipse([cx - 9, cy + 16, cx, cy + 40], fill=rice_color)
    
    # Grain 2 (tilted right)
    draw.ellipse([cx + 3, cy + 24, cx + 12, cy + 48], fill=rice_shadow)
    draw.ellipse([cx + 4, cy + 22, cx + 13, cy + 46], fill=rice_color)
    
    # Grain 3 (small dot near top)
    draw.ellipse([cx - 2, cy - 10, cx + 5, cy + 8], fill=rice_color)
    
    # Final subtle feathering
    img = img.filter(ImageFilter.GaussianBlur(radius=0.8))
    img.save(output_path, "PNG")
    print(f"Created Tilak Decal: {output_path}")

def create_visor_screen_texture(output_path):
    # 2048 x 1024 RGBA Visor Face Display
    w, h = 2048, 1024
    img = Image.new("RGBA", (w, h), (10, 12, 16, 255)) # Dark OLED base
    glow_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    core_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    
    draw_glow = ImageDraw.Draw(glow_layer)
    draw_core = ImageDraw.Draw(core_layer)
    
    cx, cy = w // 2, h // 2
    
    # Left Eye Center & Right Eye Center
    eye_offset_x = 340
    eye_cy = cy - 40
    
    # Glowing Cyan Colors
    cyan_halo = (0, 210, 255, 90)
    cyan_mid = (20, 235, 255, 220)
    cyan_core = (235, 255, 255, 255)
    
    # ----------------------------------------------------
    # Left Eye: Sarcastic Narrowed Slit (Skeptical judging look)
    # ----------------------------------------------------
    lx = cx - eye_offset_x
    ly = eye_cy
    
    # Arc / Pill shape
    # Glow pass
    draw_glow.ellipse([lx - 160, ly - 70, lx + 160, ly + 70], fill=cyan_halo)
    draw_glow.rounded_rectangle([lx - 130, ly - 45, lx + 130, ly + 45], radius=40, fill=cyan_mid)
    draw_core.rounded_rectangle([lx - 110, ly - 32, lx + 110, ly + 32], radius=30, fill=cyan_core)
    
    # Left Eyebrow (Flat, low judging arch)
    brow_ly = ly - 130
    draw_glow.rounded_rectangle([lx - 140, brow_ly - 20, lx + 140, brow_ly + 20], radius=12, fill=cyan_halo)
    draw_glow.rounded_rectangle([lx - 120, brow_ly - 14, lx + 120, brow_ly + 14], radius=10, fill=cyan_mid)
    draw_core.rounded_rectangle([lx - 105, brow_ly - 9, lx + 105, brow_ly + 9], radius=7, fill=cyan_core)
    
    # ----------------------------------------------------
    # Right Eye: Arched High in Mockery (The Classic Desi "Haan Bhai?" look)
    # ----------------------------------------------------
    rx = cx + eye_offset_x
    ry = eye_cy - 10
    
    # More open oval
    draw_glow.ellipse([rx - 160, ry - 110, rx + 160, ry + 110], fill=cyan_halo)
    draw_glow.rounded_rectangle([rx - 130, ry - 80, rx + 130, ry + 80], radius=50, fill=cyan_mid)
    draw_core.rounded_rectangle([rx - 110, ry - 60, rx + 110, ry + 60], radius=40, fill=cyan_core)
    
    # Right Eyebrow (Arched WAY UP in skeptical disbelief!)
    brow_ry = ry - 180
    # Angled curved eyebrow
    draw_glow.arc([rx - 170, brow_ry - 50, rx + 170, brow_ry + 90], start=200, end=340, fill=cyan_halo, width=42)
    draw_glow.arc([rx - 160, brow_ry - 45, rx + 160, brow_ry + 85], start=205, end=335, fill=cyan_mid, width=28)
    draw_core.arc([rx - 150, brow_ry - 40, rx + 150, brow_ry + 80], start=210, end=330, fill=cyan_core, width=16)
    
    # ----------------------------------------------------
    # Crooked Smirk / Mouth Waveform
    # ----------------------------------------------------
    mouth_y = cy + 220
    # Asymmetric cheeky grin
    draw_glow.arc([cx - 180, mouth_y - 60, cx + 220, mouth_y + 80], start=15, end=165, fill=cyan_halo, width=35)
    draw_glow.arc([cx - 170, mouth_y - 55, cx + 210, mouth_y + 75], start=20, end=160, fill=cyan_mid, width=22)
    draw_core.arc([cx - 160, mouth_y - 50, cx + 200, mouth_y + 70], start=25, end=155, fill=cyan_core, width=12)
    
    # Apply glow diffusion
    glow_blurred = glow_layer.filter(ImageFilter.GaussianBlur(radius=28))
    glow_medium = glow_layer.filter(ImageFilter.GaussianBlur(radius=10))
    
    # Composite layers
    img.paste(glow_blurred, (0, 0), glow_blurred)
    img.paste(glow_medium, (0, 0), glow_medium)
    img.paste(core_layer, (0, 0), core_layer)
    
    # Add subtle OLED scanline grid for authentic high-tech visor feel
    scanline = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(scanline)
    for y in range(0, h, 6):
        s_draw.line([(0, y), (w, y)], fill=(0, 0, 0, 45), width=1)
    img.paste(scanline, (0, 0), scanline)
    
    img.save(output_path, "PNG")
    print(f"Created Visor Screen Texture: {output_path}")

def create_silk_fabric_textures(bump_path, gold_trim_path):
    # 1024 x 1024 Seamless Silk Fabric Weave Bump Map
    size = 1024
    img = Image.new("L", (size, size), 128)
    arr = np.full((size, size), 128, dtype=np.uint8)
    
    # Fine diagonal twill / raw silk weave pattern
    x = np.arange(size)
    y = np.arange(size)
    xx, yy = np.meshgrid(x, y)
    
    twill1 = (np.sin(xx * 0.4 + yy * 0.4) * 20).astype(np.int32)
    twill2 = (np.cos(xx * 0.4 - yy * 0.4) * 15).astype(np.int32)
    noise = np.random.normal(0, 4, (size, size)).astype(np.int32)
    
    bump = np.clip(128 + twill1 + twill2 + noise, 0, 255).astype(np.uint8)
    bump_img = Image.fromarray(bump, mode="L")
    bump_img = bump_img.filter(ImageFilter.GaussianBlur(radius=0.6))
    bump_img.save(bump_path, "PNG")
    print(f"Created Silk Bump Map: {bump_path}")

if __name__ == "__main__":
    import os
    out_dir = r"D:\New folder (2)\blender_engine\assets\textures"
    os.makedirs(out_dir, exist_ok=True)
    
    create_tilak_texture(os.path.join(out_dir, "ai_puttar_tilak_decal.png"))
    create_visor_screen_texture(os.path.join(out_dir, "ai_puttar_visor_screen.png"))
    create_silk_fabric_textures(
        os.path.join(out_dir, "silk_fabric_bump.png"),
        os.path.join(out_dir, "gold_zari_pattern.png")
    )
