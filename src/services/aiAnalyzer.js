/**
 * CivicPulse AI - Municipal Complaint Intelligent Classifier
 * Runs client-side / serverless NLP evaluation and safety-rule urgency boosting.
 */

const CATEGORY_KEYWORDS = {
  "Electricity & Lighting": [
    "wire", "electric", "power", "light", "streetlight", "transformer", "spark",
    "shock", "voltage", "blackout", "fuse", "pole", "electrocution", "cables",
    "short circuit", "darkness", "bulb", "lamp"
  ],
  "Water Supply & Sewage": [
    "water", "pipe", "pipeline", "leak", "leaking", "burst", "drain", "drainage",
    "sewage", "sewer", "gutter", "contaminated", "dirty water", "no water",
    "drinking water", "gushing", "smell", "clogged", "overflowing drain"
  ],
  "Roads & Infrastructure": [
    "road", "pothole", "potholes", "crater", "asphalt", "culvert", "bridge",
    "flyover", "sidewalk", "pavement", "footpath", "divider", "speed breaker",
    "tar", "street", "highway", "traffic light", "signals"
  ],
  "Garbage & Sanitation": [
    "garbage", "trash", "waste", "dump", "dumping", "rubbish", "litter",
    "debris", "stench", "foul smell", "rotting", "bin", "dustbin", "cleanliness",
    "dead animal", "carcass", "sanitation"
  ],
  "Public Safety & Hazards": [
    "manhole", "open manhole", "collapse", "tree", "branch", "fallen tree",
    "flood", "flooding", "gas leak", "explosion", "fire", "accident", "injury",
    "dog bite", "stray dogs", "unsafe", "danger", "hazard", "landslide"
  ],
  "Parks & Public Amenities": [
    "park", "garden", "bench", "playground", "swing", "public toilet", "restroom",
    "fountain", "community hall", "sports ground"
  ]
};

const DANGER_KEYWORDS = [
  "fire", "electrocution", "live wire", "exposed wire", "spark", "sparking",
  "collapse", "collapsed", "gas leak", "explosion", "flood", "flooding",
  "accident", "injury", "injured", "death", "fatal", "open manhole", "manhole",
  "short circuit", "unconscious"
];

const HEALTH_RISK_KEYWORDS = [
  "disease", "dengue", "malaria", "mosquito", "contaminat", "illness", "sick",
  "infection", "epidemic", "outbreak", "medical waste", "sewage", "hospital waste",
  "toxic", "poisonous", "rotting"
];

const HIGH_IMPACT_LOCATIONS = [
  "school", "hospital", "market", "bus stop", "children", "elderly", "clinic",
  "nursing home", "kindergarten", "railway station", "metro", "junction", "crowd"
];

const DEPARTMENTS = {
  "Electricity & Lighting": "State Power Distribution Corp (Electricity Board)",
  "Water Supply & Sewage": "Municipal Water Supply & Sewerage Authority",
  "Roads & Infrastructure": "Public Works Department (PWD - Roads & Bridges)",
  "Garbage & Sanitation": "Solid Waste Management & Sanitation Wing",
  "Public Safety & Hazards": "Municipal Disaster Management & Public Safety Cell",
  "Parks & Public Amenities": "Horticulture & Public Amenities Board"
};

export function analyzeComplaintText(text = "") {
  if (!text || !text.trim()) {
    return {
      category: "Roads & Infrastructure",
      categoryConfidence: 0.5,
      severity: "Medium",
      priority: "Normal",
      urgencyReasons: [],
      department: "Municipal Public Works",
      estimatedSla: "48-72 Hours",
      keywordsFound: []
    };
  }

  const clean = text.toLowerCase();
  
  // 1. Category Classification
  let bestCategory = "Roads & Infrastructure";
  let maxMatches = 0;
  const matchedKeywords = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let count = 0;
    for (const kw of keywords) {
      if (clean.includes(kw)) {
        count++;
        matchedKeywords.push(kw);
      }
    }
    if (count > maxMatches) {
      maxMatches = count;
      bestCategory = category;
    }
  }

  const confidence = Math.min(0.98, Math.max(0.72, 0.65 + maxMatches * 0.08));

  // 2. Base Severity Estimation
  let baseSeverity = "Medium";
  if (clean.length < 30 && maxMatches === 0) {
    baseSeverity = "Low";
  } else if (maxMatches >= 3) {
    baseSeverity = "High";
  }

  // 3. Rule-based Urgency Boosting
  const urgencyReasons = [];
  if (DANGER_KEYWORDS.some(k => clean.includes(k))) {
    urgencyReasons.push("Immediate danger or structural/electrical hazard detected");
  }
  if (HEALTH_RISK_KEYWORDS.some(k => clean.includes(k))) {
    urgencyReasons.push("Public health or epidemiological contamination risk detected");
  }
  if (HIGH_IMPACT_LOCATIONS.some(k => clean.includes(k))) {
    urgencyReasons.push("Proximity to vulnerable institution (school/hospital/public transport)");
  }

  // Determine Final Severity & Priority
  let finalSeverity = baseSeverity;
  if (urgencyReasons.length >= 2) {
    finalSeverity = "Critical";
  } else if (urgencyReasons.length === 1) {
    if (finalSeverity === "Low") finalSeverity = "Medium";
    else finalSeverity = "High";
  }

  let priority = "Normal";
  let estimatedSla = "48-72 Hours";

  if (finalSeverity === "Critical") {
    priority = "Immediate";
    estimatedSla = "Within 4-12 Hours";
  } else if (finalSeverity === "High") {
    priority = "Urgent";
    estimatedSla = "Within 24 Hours";
  } else if (finalSeverity === "Medium") {
    priority = "Elevated";
    estimatedSla = "2-3 Days";
  } else {
    priority = "Low";
    estimatedSla = "3-5 Days";
  }

  return {
    category: bestCategory,
    categoryConfidence: Math.round(confidence * 100) / 100,
    severity: finalSeverity,
    priority,
    urgencyReasons,
    department: DEPARTMENTS[bestCategory] || "General Municipal Administration",
    estimatedSla,
    keywordsFound: [...new Set(matchedKeywords)].slice(0, 5)
  };
}
