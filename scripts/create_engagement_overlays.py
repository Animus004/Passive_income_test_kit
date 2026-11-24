import os
from PIL import Image, ImageDraw, ImageFont

def create_rounded_rectangle(draw, bounds, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(bounds, radius=radius, fill=fill, outline=outline, width=width)

def generate_story1_overlay():
    w, h = 1080, 1920
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    font_title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 36)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 24)
    font_poll_q = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 32)
    font_poll_opt = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 28)
    font_cta = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 30)
    font_badge = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 22)

    # 1. Top Engagement Bar (y: 250 - 330)
    top_y = 250
    create_rounded_rectangle(draw, [50, top_y, w - 50, top_y + 80], radius=40, fill=(15, 23, 42, 235), outline=(56, 189, 248, 255), width=3)
    draw.text((w // 2, top_y + 20), "FOLLOW FOR DAILY TECH SECRETS", font=font_sub, fill=(255, 255, 255), anchor="mt")
    draw.text((w // 2, top_y + 50), "@right_turnworngmoves", font=font_badge, fill=(56, 189, 248), anchor="mt")

    # 2. Instagram Interactive Poll Sticker (Upper Zone y: 390 - 640)
    poll_x1, poll_y1 = 60, 390
    poll_x2, poll_y2 = w - 60, 640
    
    # Drop shadow
    create_rounded_rectangle(draw, [poll_x1 + 6, poll_y1 + 6, poll_x2 + 6, poll_y2 + 6], radius=30, fill=(0, 0, 0, 130))
    # Main White Card
    create_rounded_rectangle(draw, [poll_x1, poll_y1, poll_x2, poll_y2], radius=30, fill=(255, 255, 255, 250), outline=(226, 232, 240, 255), width=2)
    
    draw.text((w // 2, poll_y1 + 22), "DID YOU KNOW THIS EXISTED?", font=font_poll_q, fill=(15, 23, 42), anchor="mt")
    
    # Option 1: NEVER HEARD OF IT (79%)
    opt1_y = poll_y1 + 75
    create_rounded_rectangle(draw, [poll_x1 + 24, opt1_y, poll_x2 - 24, opt1_y + 60], radius=18, fill=(241, 245, 249, 255), outline=(203, 213, 225, 255), width=2)
    bar1_w = int((poll_x2 - poll_x1 - 48) * 0.79)
    create_rounded_rectangle(draw, [poll_x1 + 24, opt1_y, poll_x1 + 24 + bar1_w, opt1_y + 60], radius=18, fill=(59, 130, 246, 75))
    draw.text((poll_x1 + 45, opt1_y + 16), "NEVER HEARD OF IT", font=font_poll_opt, fill=(15, 23, 42))
    draw.text((poll_x2 - 45, opt1_y + 16), "79%", font=font_poll_opt, fill=(37, 99, 235), anchor="ra")

    # Option 2: ALREADY KNEW (21%)
    opt2_y = opt1_y + 72
    create_rounded_rectangle(draw, [poll_x1 + 24, opt2_y, poll_x2 - 24, opt2_y + 60], radius=18, fill=(241, 245, 249, 255), outline=(203, 213, 225, 255), width=2)
    bar2_w = int((poll_x2 - poll_x1 - 48) * 0.21)
    create_rounded_rectangle(draw, [poll_x1 + 24, opt2_y, poll_x1 + 24 + bar2_w, opt2_y + 60], radius=18, fill=(148, 163, 184, 50))
    draw.text((poll_x1 + 45, opt2_y + 16), "ALREADY KNEW", font=font_poll_opt, fill=(71, 85, 105))
    draw.text((poll_x2 - 45, opt2_y + 16), "21%", font=font_poll_opt, fill=(100, 116, 139), anchor="ra")

    # 3. Instagram Tap Reel Sticker (y: 670 - 750)
    link_x1, link_y1 = 100, 670
    link_x2, link_y2 = w - 100, 755
    create_rounded_rectangle(draw, [link_x1 + 4, link_y1 + 4, link_x2 + 4, link_y2 + 4], radius=42, fill=(0, 0, 0, 110))
    create_rounded_rectangle(draw, [link_x1, link_y1, link_x2, link_y2], radius=42, fill=(255, 255, 255, 250), outline=(241, 245, 249, 255), width=2)
    draw.text((w // 2, link_y1 + 24), "WATCH FULL 4K REEL ON PROFILE >>", font=font_cta, fill=(15, 23, 42), anchor="mt")

    # 4. Bottom Engagement Pill (y: 1780 - 1860)
    bot_y = 1780
    create_rounded_rectangle(draw, [50, bot_y, w - 50, bot_y + 80], radius=40, fill=(234, 88, 12, 240), outline=(254, 215, 170, 255), width=3)
    draw.text((w // 2, bot_y + 24), "TAP PROFILE ICON TO WATCH FULL REEL", font=font_sub, fill=(255, 255, 255), anchor="mt")

    os.makedirs('scratch', exist_ok=True)
    img.save('scratch/story_1_engagement_overlay.png')
    print("✅ Created scratch/story_1_engagement_overlay.png")

def generate_story2_overlay():
    w, h = 1080, 1920
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    font_sub = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 24)
    font_poll_q = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 32)
    font_poll_opt = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 28)
    font_cta = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 30)
    font_badge = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 22)

    # 1. Top Engagement Bar (y: 250 - 330)
    top_y = 250
    create_rounded_rectangle(draw, [50, top_y, w - 50, top_y + 80], radius=40, fill=(15, 23, 42, 235), outline=(239, 68, 68, 255), width=3)
    draw.text((w // 2, top_y + 20), "WHAT IF THE GLOBAL FOOD GRID DIES?", font=font_sub, fill=(255, 255, 255), anchor="mt")
    draw.text((w // 2, top_y + 50), "@right_turnworngmoves • Follow for Tech Secrets", font=font_badge, fill=(252, 165, 165), anchor="mt")

    # 2. Interactive Poll Sticker (Upper Zone y: 390 - 640)
    poll_x1, poll_y1 = 60, 390
    poll_x2, poll_y2 = w - 60, 640
    
    create_rounded_rectangle(draw, [poll_x1 + 6, poll_y1 + 6, poll_x2 + 6, poll_y2 + 6], radius=30, fill=(0, 0, 0, 130))
    create_rounded_rectangle(draw, [poll_x1, poll_y1, poll_x2, poll_y2], radius=30, fill=(255, 255, 255, 250), outline=(226, 232, 240, 255), width=2)
    
    draw.text((w // 2, poll_y1 + 22), "WOULD CIVILIZATION SURVIVE?", font=font_poll_q, fill=(15, 23, 42), anchor="mt")
    
    # Option 1: YES - THE VAULT SAVES US (68%)
    opt1_y = poll_y1 + 75
    create_rounded_rectangle(draw, [poll_x1 + 24, opt1_y, poll_x2 - 24, opt1_y + 60], radius=18, fill=(241, 245, 249, 255), outline=(203, 213, 225, 255), width=2)
    bar1_w = int((poll_x2 - poll_x1 - 48) * 0.68)
    create_rounded_rectangle(draw, [poll_x1 + 24, opt1_y, poll_x1 + 24 + bar1_w, opt1_y + 60], radius=18, fill=(34, 197, 94, 80))
    draw.text((poll_x1 + 45, opt1_y + 16), "YES - THE VAULT SAVES US", font=font_poll_opt, fill=(15, 23, 42))
    draw.text((poll_x2 - 45, opt1_y + 16), "68%", font=font_poll_opt, fill=(22, 163, 74), anchor="ra")

    # Option 2: TOTAL CHAOS (32%)
    opt2_y = opt1_y + 72
    create_rounded_rectangle(draw, [poll_x1 + 24, opt2_y, poll_x2 - 24, opt2_y + 60], radius=18, fill=(241, 245, 249, 255), outline=(203, 213, 225, 255), width=2)
    bar2_w = int((poll_x2 - poll_x1 - 48) * 0.32)
    create_rounded_rectangle(draw, [poll_x1 + 24, opt2_y, poll_x1 + 24 + bar2_w, opt2_y + 60], radius=18, fill=(239, 68, 68, 60))
    draw.text((poll_x1 + 45, opt2_y + 16), "TOTAL CHAOS", font=font_poll_opt, fill=(71, 85, 105))
    draw.text((poll_x2 - 45, opt2_y + 16), "32%", font=font_poll_opt, fill=(220, 38, 38), anchor="ra")

    # 3. Instagram Tap Reel Sticker (y: 670 - 750)
    link_x1, link_y1 = 100, 670
    link_x2, link_y2 = w - 100, 755
    create_rounded_rectangle(draw, [link_x1 + 4, link_y1 + 4, link_x2 + 4, link_y2 + 4], radius=42, fill=(0, 0, 0, 110))
    create_rounded_rectangle(draw, [link_x1, link_y1, link_x2, link_y2], radius=42, fill=(255, 255, 255, 250), outline=(241, 245, 249, 255), width=2)
    draw.text((w // 2, link_y1 + 24), "NEW CASE FILE LIVE ON PROFILE >>", font=font_cta, fill=(15, 23, 42), anchor="mt")

    # 4. Bottom Engagement Pill (y: 1780 - 1860)
    bot_y = 1780
    create_rounded_rectangle(draw, [50, bot_y, w - 50, bot_y + 80], radius=40, fill=(16, 185, 129, 240), outline=(167, 243, 208, 255), width=3)
    draw.text((w // 2, bot_y + 24), "FOLLOW @right_turnworngmoves FOR DAILY TECH", font=font_sub, fill=(255, 255, 255), anchor="mt")

    img.save('scratch/story_2_engagement_overlay.png')
    print("✅ Created scratch/story_2_engagement_overlay.png")

if __name__ == '__main__':
    generate_story1_overlay()
    generate_story2_overlay()
