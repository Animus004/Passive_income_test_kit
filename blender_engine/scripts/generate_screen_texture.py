import os
from PIL import Image, ImageDraw, ImageFont

def generate_laptop_code_texture(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    W, H = 1024, 640
    img = Image.new("RGBA", (W, H), (13, 17, 23, 255)) # Dark GitHub / VS Code slate
    draw = ImageDraw.Draw(img)

    # 1. Top Title Bar / Tab Bar
    draw.rectangle([(0, 0), (W, 42)], fill=(22, 27, 34, 255))
    draw.line([(0, 42), (W, 42)], fill=(48, 54, 61, 255), width=1)

    # Window traffic light buttons
    draw.ellipse([(16, 15), (28, 27)], fill=(255, 95, 86, 255))
    draw.ellipse([(36, 15), (48, 27)], fill=(255, 189, 46, 255))
    draw.ellipse([(56, 15), (68, 27)], fill=(39, 201, 63, 255))

    # Active Tab
    draw.rectangle([(85, 8), (280, 42)], fill=(13, 17, 23, 255))
    draw.line([(85, 8), (280, 8)], fill=(88, 166, 255, 255), width=2) # Top accent blue

    # Try loading default monospace font
    try:
        font_tab = ImageFont.truetype("consola.ttf", 15)
        font_code = ImageFont.truetype("consola.ttf", 18)
        font_num = ImageFont.truetype("consola.ttf", 16)
        font_term = ImageFont.truetype("consola.ttf", 16)
        font_status = ImageFont.truetype("consola.ttf", 13)
    except Exception:
        font_tab = ImageFont.load_default()
        font_code = font_tab
        font_num = font_tab
        font_term = font_tab
        font_status = font_tab

    draw.text((105, 16), "# broken_css_fix.css", fill=(201, 209, 217, 255), font=font_tab)
    draw.text((295, 16), "agent_brain.py", fill=(110, 118, 129, 255), font=font_tab)

    # 2. Gutter / Line Numbers Bar
    draw.rectangle([(0, 43), (55, 460)], fill=(15, 20, 28, 255))
    draw.line([(55, 43), (55, 460)], fill=(33, 38, 45, 255), width=1)

    # Code Lines (Syntax Highlighted)
    code_lines = [
        ("/* =================================================== */", (110, 118, 129)),
        ("/* CRITICAL 3 AM CSS FIX - DO NOT TOUCH                */", (255, 123, 114)),
        ("/* =================================================== */", (110, 118, 129)),
        ("", (201, 209, 217)),
        (".center-the-div {", (121, 192, 255)),
        ("    display: flex;", (210, 168, 255)),
        ("    justify-content: center;", (126, 231, 135)),
        ("    align-items: center;", (126, 231, 135)),
        ("    margin: 0 auto;  /* WHY DOES THIS BREAK PROD */", (255, 123, 114)),
        ("}", (121, 192, 255)),
        ("", (201, 209, 217)),
        ("/* Popapus Agent Status: 99 Warnings, 0 Help */", (240, 136, 62)),
        (".salary-expectation {", (121, 192, 255)),
        ("    visibility: hidden !important;", (255, 123, 114)),
        ("}", (121, 192, 255)),
    ]

    y_cursor = 55
    for idx, (text, color) in enumerate(code_lines, start=1):
        # Line number
        draw.text((20, y_cursor), str(idx).rjust(2), fill=(72, 79, 88, 255), font=font_num)
        # Code text
        draw.text((70, y_cursor), text, fill=(*color, 255), font=font_code)
        y_cursor += 26

    # 3. Bottom Terminal Pane
    draw.rectangle([(0, 460), (W, 610)], fill=(10, 12, 16, 255))
    draw.line([(0, 460), (W, 460)], fill=(48, 54, 61, 255), width=2)

    # Terminal header
    draw.text((18, 468), "TERMINAL  |  DEBUG CONSOLE  |  OUTPUT", fill=(139, 148, 158, 255), font=font_status)
    draw.line([(18, 486), (82, 486)], fill=(88, 166, 255, 255), width=2)

    # Terminal lines
    draw.text((18, 498), "dev@workstation:~/repo$ git commit -m \"1-line css fix\" && git push origin main", fill=(126, 231, 135, 255), font=font_term)
    draw.text((18, 524), "remote: Processing 1 commit... Verifying CI/CD pipeline...", fill=(139, 148, 158, 255), font=font_term)
    draw.text((18, 550), "remote: [FATAL ERROR] 42 microservices collapsed in AWS us-east-1", fill=(255, 123, 114, 255), font=font_term)
    draw.text((18, 576), "remote: ❌ Deployment Rejected. Please ask Gemini Popapus for assistance.", fill=(240, 136, 62, 255), font=font_term)

    # 4. Status Bar at Bottom
    draw.rectangle([(0, 610), (W, H)], fill=(31, 111, 235, 255))
    draw.text((16, 618), "⚡ main*  |  UTF-8  |  CSS  |  Prettier  |  Errors: 1  Warnings: 42", fill=(255, 255, 255, 255), font=font_status)
    draw.text((W - 170, 618), "Antigravity Dev IDE", fill=(220, 235, 255, 255), font=font_status)

    img.save(output_path, "PNG")
    print(f"✅ Generated high-res glowing laptop code screen texture at: {output_path}")

if __name__ == "__main__":
    out = os.path.abspath(r"D:\New folder (2)\blender_engine\textures\laptop_screen_code.png")
    generate_laptop_code_texture(out)
