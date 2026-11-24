import urllib.request
import xml.etree.ElementTree as ET
import json
import re

# Fetch the caption track
url = "https://www.youtube.com/watch?v=OtbLL6OBNE4"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

match = re.search(r"ytInitialPlayerResponse\s*=\s*({.+?});(?:var|\x3c)", html)
if not match:
    match = re.search(r"ytInitialPlayerResponse\s*=\s*({.+?});", html)

data = json.loads(match.group(1))
captions = data.get("captions", {}).get("playerCaptionsTracklistRenderer", {}).get("captionTracks", [])

if captions:
    caption_url = captions[0]["baseUrl"]
    cap_req = urllib.request.Request(caption_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(cap_req) as cap_resp:
        cap_xml = cap_resp.read().decode("utf-8")
        
    root = ET.fromstring(cap_xml)
    transcript = []
    full_text = []
    for text_el in root.findall("text"):
        start = float(text_el.attrib.get("start", 0))
        dur = float(text_el.attrib.get("dur", 0))
        text = text_el.text or ""
        # decode html entities
        text = text.replace("&amp;#39;", "'").replace("&amp;quot;", '"').replace("&quot;", '"').replace("&#39;", "'")
        transcript.append({"start": start, "dur": dur, "text": text})
        full_text.append(text)
        
    with open("scripts/transcript_OtbLL6OBNE4.json", "w", encoding="utf-8") as f:
        json.dump(transcript, f, indent=2)
        
    with open("scripts/transcript_OtbLL6OBNE4.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(full_text))
        
    print(f"Saved {len(transcript)} transcript segments!")
    print("\n--- FIRST 1500 CHARACTERS OF TRANSCRIPT ---")
    print(" ".join(full_text[:35]))
else:
    print("No captions found")
