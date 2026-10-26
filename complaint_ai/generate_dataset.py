"""
generate_dataset.py
--------------------
Builds a synthetic-but-realistic labeled dataset of municipal complaints.

In a real submission you would eventually swap this for actual complaint
records (or a public dataset scraped from a municipal portal / Kaggle).
For the Phase-1 (50%) checkpoint, a well-structured synthetic dataset is
completely acceptable and is a normal thing to disclose to your guide --
what matters is that the *pipeline* (cleaning -> classification -> severity)
is real and working end-to-end.

Run:
    python generate_dataset.py
Produces:
    data/complaints_dataset.csv
"""

import csv
import random

random.seed(42)

# ---------------------------------------------------------------------------
# Category templates. Each category has:
#   - a base list of low-severity phrasings (routine, non-urgent)
#   - a list of high-severity phrasings (danger / large-scale / urgent)
#   - a list of medium-severity phrasings (inconvenient but not dangerous)
# This lets severity emerge from LANGUAGE rather than any user-entered
# "number of people affected" field.
# ---------------------------------------------------------------------------

CATEGORIES = {
    "Water Supply": {
        "low": [
            "Water pressure has been slightly low in our area for two days.",
            "Tap water tastes a bit different than usual, please check.",
            "Water supply timing has shifted by half an hour this week.",
            "Minor leakage near the water meter outside our house.",
        ],
        "medium": [
            "No water supply in our street for the past two days.",
            "Water tanker has not come to our area for a week.",
            "Muddy water is coming from the tap since yesterday.",
            "Water supply pipe is leaking continuously near the main road.",
        ],
        "high": [
            "A major water pipeline has burst and is flooding the entire street.",
            "Sewage water is mixing with drinking water supply, urgent health risk.",
            "No water supply for the whole ward for five days, residents are in distress.",
            "Contaminated water is causing stomach illness in several households.",
        ],
    },
    "Electricity": {
        "low": [
            "Streetlight flickers occasionally near our lane.",
            "Minor voltage fluctuation reported in the evening.",
            "Power went out for ten minutes this morning.",
        ],
        "medium": [
            "Frequent power cuts in our area for the last three days.",
            "Transformer near our house is making a loud humming noise.",
            "Power supply has been unstable since last week's storm.",
        ],
        "high": [
            "A live electric wire has fallen on the road, extremely dangerous.",
            "Transformer caught fire near the residential area, people are panicking.",
            "Exposed electrical wiring near the school gate, children are at risk.",
            "Sparking electric pole after the rain, urgent action needed.",
        ],
    },
    "Roads & Potholes": {
        "low": [
            "Small pothole forming near the bus stop.",
            "Road markings have faded on the main street.",
            "A minor crack has appeared on the footpath.",
        ],
        "medium": [
            "Large pothole on the main road is damaging vehicles.",
            "Road has not been repaired despite several complaints last month.",
            "Uneven road surface is causing traffic slowdowns during peak hours.",
        ],
        "high": [
            "Deep pothole on the highway has caused two accidents this week.",
            "Road collapsed after heavy rain, vehicles cannot pass safely.",
            "Large crater in the road is invisible at night and extremely dangerous.",
        ],
    },
    "Garbage & Sanitation": {
        "low": [
            "Garbage collection was a day late this week.",
            "A few stray plastic bags left near the collection point.",
            "Public dustbin near the park is almost full.",
        ],
        "medium": [
            "Garbage has not been collected from our street for four days.",
            "Overflowing dustbins are attracting stray animals.",
            "Waste is piling up near the market area, causing bad smell.",
        ],
        "high": [
            "Huge pile of uncollected garbage is rotting and causing disease risk.",
            "Medical waste has been dumped illegally near residential homes.",
            "Garbage burning near the school is causing severe air pollution.",
        ],
    },
    "Streetlight": {
        "low": [
            "One streetlight bulb needs replacement on our lane.",
            "Streetlight takes a while to turn on at dusk.",
        ],
        "medium": [
            "Several streetlights in our area have not worked for two weeks.",
            "Entire street is dark at night because streetlights are not functioning.",
        ],
        "high": [
            "No streetlights on the road near the school, unsafe for children walking home.",
            "Dark unlit stretch of road has become a safety risk for women at night.",
        ],
    },
    "Sewage / Drainage": {
        "low": [
            "Minor blockage in the drain near our gate.",
            "Drain water is slightly slow to flow after rain.",
        ],
        "medium": [
            "Drain has been blocked for a week, water is stagnating on the road.",
            "Open drain near the market is overflowing during rains.",
        ],
        "high": [
            "Sewage is overflowing into homes after the drain collapsed.",
            "Open manhole on the main road is a serious accident risk.",
            "Stagnant sewage water has become a breeding ground for mosquitoes, dengue risk rising.",
        ],
    },
}

SEVERITY_TO_PRIORITY = {
    "Low": "Low",
    "Medium": "Medium",
    "High": "Urgent",
}


def build_rows():
    rows = []
    for category, buckets in CATEGORIES.items():
        for severity_key, sentences in buckets.items():
            severity_label = severity_key.capitalize()
            for s in sentences:
                # light augmentation: duplicate a couple of variants so the
                # model sees each pattern more than once
                for _ in range(3):
                    rows.append(
                        {
                            "complaint_text": s,
                            "category": category,
                            "severity": severity_label,
                            "priority": SEVERITY_TO_PRIORITY[severity_label],
                        }
                    )
    random.shuffle(rows)
    return rows


def main():
    rows = build_rows()
    with open("data/complaints_dataset.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["complaint_text", "category", "severity", "priority"]
        )
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to data/complaints_dataset.csv")


if __name__ == "__main__":
    main()
