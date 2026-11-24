import asyncio
import edge_tts
import json

SENTENCE_PAIRS = [
    {
        "hi": "क्या हो अगर पूरी दुनिया का इंटरनेट बहत्तर घंटों के लिए हमेशा के लिए डिलीट हो जाए?",
        "hinglish": "Kya ho agar poori duniya ka internet 72 ghante ke liye delete ho jaye?"
    },
    {
        "hi": "रात बारह बजकर एक मिनट पर, दुनिया की हर स्क्रीन फ्रीज हो जाती है।",
        "hinglish": "Raat 12:01 AM par, duniya ki har screen freeze ho jati hai."
    },
    {
        "hi": "अगले ही पल, तीस हज़ार हवाई जहाज़ अपना जीपीएस खो देते हैं और हवा में अंधे हो जाते हैं!",
        "hinglish": "Agle hi pal, 30,000 hawai jahaz GPS kho dete hain aur andhe ho jate hain!"
    },
    {
        "hi": "सुबह आठ बजे तक, दुनिया का हर एटीएम और क्रेडिट कार्ड ठप हो जाता है, जिससे अरबों लोग खाना भी नहीं खरीद पाते।",
        "hinglish": "Subah 8:00 AM tak, duniya ka har ATM aur credit card dead ho jata hai."
    },
    {
        "hi": "सप्लाई चेन पूरी तरह जम जाती है क्योंकि डिलीवरी ट्रक डिजिटल डिस्पैच पर निर्भर होते हैं।",
        "hinglish": "Supply chains freeze ho jati hain kyunki delivery trucks digital dispatch par chalte hain."
    },
    {
        "hi": "अड़तालीस घंटों में पावर ग्रिड्स बंद होने लगते हैं और पूरे महाद्वीप घुप अंधेरे में डूब जाते हैं!",
        "hinglish": "48 ghanton mein power grids band hote hain aur poore continents andhere mein doob jate hain!"
    },
    {
        "hi": "बारह ट्रिलियन डॉलर की डिजिटल दौलत गायब हो जाती है।",
        "hinglish": "12 trillion dollars ki digital wealth gayab ho jati hai."
    },
    {
        "hi": "यानी आधुनिक दुनिया पैसे से नहीं... अदृश्य डेटा पैकेट्स से चलती है।",
        "hinglish": "Yani modern duniya paise se nahi, invisible data packets se chalti hai."
    },
    {
        "hi": "और यही वजह है कि अगर अचानक आपका वाई-फाई बंद हो जाए...",
        "hinglish": "Aur yahi wajah hai, agar aapka Wi-Fi achanak gayab ho jaye..."
    }
]

async def check():
    full_text = " ".join([p["hi"] for p in SENTENCE_PAIRS])
    comm = edge_tts.Communicate(full_text, "hi-IN-MadhurNeural", boundary="SentenceBoundary", rate="+10%")
    sentences = []
    async for chunk in comm.stream():
        if chunk["type"] == "SentenceBoundary":
            s = chunk["offset"] / 10_000_000
            d = chunk["duration"] / 10_000_000
            sentences.append({"start": round(s, 3), "end": round(s + d, 3), "text": chunk["text"]})
    
    print(f"Detected {len(sentences)} SentenceBoundaries for {len(SENTENCE_PAIRS)} pairs:")
    for i, s in enumerate(sentences):
        print(f"  {i}: {s['start']}s -> {s['end']}s | {s['text']}")

asyncio.run(check())
