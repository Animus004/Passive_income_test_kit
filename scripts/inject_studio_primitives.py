import json

PRIMITIVE_CONFIGS = [
    {
        "id": 1,
        "primitive": "HeroSolo",
        "iconType": "clock",
        "title": "THE TIME WARP",
        "badge": "5:59 PM CRITICAL ESCAPE",
        "glance": "left"
    },
    {
        "id": 2,
        "primitive": "StackTower",
        "title": "MISSION PACK-UP",
        "badge": "PRE-FLIGHT CHECK",
        "items": [
            {"label": "BACKPACK", "color": "#38BDF8", "hasEyes": True, "dropFrame": 5},
            {"label": "CHARGER", "color": "#FDE047", "hasEyes": False, "dropFrame": 18},
            {"label": "ESCAPE PLAN", "color": "#F87171", "hasEyes": True, "dropFrame": 30}
        ]
    },
    {
        "id": 3,
        "primitive": "SplitPanelComic",
        "title": "THE VISUAL TRAP",
        "badge": "GAZE AVOIDANCE",
        "leftTitle": "EYE CONTACT",
        "leftSub": "MISSION CRITICAL FAILURE",
        "leftColor": "#F87171",
        "rightTitle": "FLOOR GAZE",
        "rightSub": "SAFE EXTRACTION ROUTE",
        "rightColor": "#34D399"
    },
    {
        "id": 4,
        "primitive": "MacroPunchLens",
        "title": "MONITOR CAMOUFLAGE",
        "badge": "CLOAK ENGAGED",
        "macroTarget": "sweating_eye",
        "keyLabel": "STEALTH ENGAGED",
        "alertSubtitle": "HIDDEN BEHIND SCREEN"
    },
    {
        "id": 5,
        "primitive": "PerspectiveFloor",
        "title": "DOOR OF DOOM",
        "badge": "PREDATOR SIGHTED",
        "propType": "laptop",
        "alertText": "MANAGER DOOR CREAKING OPEN"
    },
    {
        "id": 6,
        "primitive": "DialGauge",
        "title": "PANIC LEVEL 100%",
        "badge": "FIGHT OR FLIGHT",
        "dangerText": "QUICK QUESTION?!",
        "needleTargetAngle": 165
    },
    {
        "id": 7,
        "primitive": "ExplodingCluster",
        "title": "THE GREAT ESCAPE",
        "badge": "EVASIVE ACTION",
        "nodes": [
            {"label": "DESK JUMP", "badge": "AGILITY", "angleDeg": 35, "distance": 280, "color": "#38BDF8"},
            {"label": "COFFEE SPILL", "badge": "AVOIDED", "angleDeg": 125, "distance": 310, "color": "#FDE047"},
            {"label": "HR SIGHTED", "badge": "DANGER", "angleDeg": 215, "distance": 290, "color": "#F87171"},
            {"label": "FULL SPRINT", "badge": "MAX SPEED", "angleDeg": 305, "distance": 320, "color": "#34D399"}
        ]
    },
    {
        "id": 8,
        "primitive": "TimeFlipCalendar",
        "title": "DOOR TO LIBERTY",
        "badge": "COUNTDOWN TO FREEDOM",
        "startTime": "5:59:50 PM",
        "endTime": "5:59:59 PM",
        "stampText": "EXTRACTION!"
    },
    {
        "id": 9,
        "primitive": "HeroSolo",
        "iconType": "rocket",
        "title": "ESCAPE VELOCITY!",
        "badge": "MISSION ACCOMPLISHED",
        "glance": "up"
    }
]

for lang in ["en", "hi"]:
    m_path = f"src/data/oddly_manifest_{lang}.json"
    with open(m_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    for i, b in enumerate(data["beats"]):
        if i < len(PRIMITIVE_CONFIGS):
            cfg = PRIMITIVE_CONFIGS[i]
            for k, v in cfg.items():
                if k not in ["title", "badge"]:  # preserve localized title/badge
                    b[k] = v
                elif not b.get(k):
                    b[k] = v
    
    with open(m_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Injected studio primitives into {m_path}")
