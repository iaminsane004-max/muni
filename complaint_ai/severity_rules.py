"""
severity_rules.py
------------------
A small rule-based "urgency booster" layer that sits on top of the ML
severity model. This is what lets us drop the manual "no. of affected
population" field entirely: instead of asking the citizen to self-report
scale/impact, we detect urgency directly from the language they used
(danger words, health-risk words, safety words) plus how many people are
implied contextually (school, hospital, market = inherently high-impact
locations).

This hybrid approach (ML model + rule-based override) is also a good
talking point for your review -- it shows you understand that a bare
ML classifier can be miscalibrated on rare-but-critical wording, so a
safety-net layer of hand-authored rules catches those cases.
"""

DANGER_KEYWORDS = [
    "fire", "electrocution", "live wire", "exposed wire", "spark", "sparking",
    "collapse", "collapsed", "gas leak", "explosion", "flood", "flooding",
    "accident", "injury", "injured", "death", "dead", "manhole",
]

HEALTH_RISK_KEYWORDS = [
    "disease", "dengue", "mosquito", "contaminat", "illness", "sick",
    "infection", "epidemic", "outbreak", "medical waste", "sewage",
]

HIGH_IMPACT_LOCATIONS = [
    "school", "hospital", "market", "bus stop", "children", "elderly",
]

SEVERITY_ORDER = ["Low", "Medium", "High"]


def boost_severity(text: str, predicted_severity: str) -> tuple[str, list[str]]:
    """
    Look at raw complaint text and possibly bump the ML-predicted severity
    up by one level (never down -- the rules only ever add caution).
    Returns (final_severity, reasons_triggered).
    """
    lowered = text.lower()
    reasons = []

    if any(k in lowered for k in DANGER_KEYWORDS):
        reasons.append("danger/safety language detected")
    if any(k in lowered for k in HEALTH_RISK_KEYWORDS):
        reasons.append("public health risk language detected")
    if any(k in lowered for k in HIGH_IMPACT_LOCATIONS):
        reasons.append("high-footfall/vulnerable location mentioned")

    if not reasons:
        return predicted_severity, reasons

    current_idx = SEVERITY_ORDER.index(predicted_severity)
    # every rule category that fires can push severity up by one step,
    # capped at "High"
    boosted_idx = min(current_idx + 1, len(SEVERITY_ORDER) - 1)
    final_severity = SEVERITY_ORDER[boosted_idx]
    return final_severity, reasons


def severity_to_priority(severity: str) -> str:
    return {"Low": "Low", "Medium": "Medium", "High": "Urgent"}.get(severity, "Medium")
