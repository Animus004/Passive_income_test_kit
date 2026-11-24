import urllib.request
import json
import re

url = "https://www.youtube.com/watch?v=OtbLL6OBNE4"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
        
    title_m = re.search(r"<title>(.*?)</title>", html)
    print("TITLE:", title_m.group(1) if title_m else "No title")
    
    match = re.search(r"ytInitialPlayerResponse\s*=\s*({.+?});(?:var|\x3c)", html)
    if not match:
        match = re.search(r"ytInitialPlayerResponse\s*=\s*({.+?});", html)
        
    if match:
        data = json.loads(match.group(1))
        details = data.get("videoDetails", {})
        print("VIDEO DETAILS:")
        print("Title:", details.get("title"))
        print("Author:", details.get("author"))
        print("Length (s):", details.get("lengthSeconds"))
        print("Keywords:", details.get("keywords"))
        print("Short Description:\n", details.get("shortDescription"))
        
        # Check captions
        captions = data.get("captions", {}).get("playerCaptionsTracklistRenderer", {}).get("captionTracks", [])
        if captions:
            print("\nCaptions found:", len(captions))
            for c in captions:
                print("Lang:", c.get("languageCode"), "Name:", c.get("name", {}).get("simpleText"))
                print("BaseUrl:", c.get("baseUrl")[:120])
        else:
            print("\nNo direct caption tracks in initialPlayerResponse.")
    else:
        print("Could not find ytInitialPlayerResponse")
except Exception as e:
    print("Error:", e)
