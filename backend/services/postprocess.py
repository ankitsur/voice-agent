# backend/services/postprocess.py
from typing import Dict, Any, Optional
import re

# target field shapes for normal & emergency
NORMAL_FIELDS = [
    "call_type", "call_outcome", "driver_status",
    "current_location", "eta", "delay_reason",
    "unloading_status", "pod_reminder_acknowledged"
]

EMERGENCY_FIELDS = [
    "call_type", "call_outcome", "emergency_type",
    "safety_status", "injury_status", "emergency_location",
    "load_secure", "escalation_status"
]

def run_post_processing_from_event(transcript: Optional[str], analysis_obj: Optional[Dict[str, Any]], raw_transcript: Optional[str]) -> Dict[str, Any]:
    """
    If analysis_obj is provided (from Retell), prefer it. Otherwise do a fallback parse.
    """
    if analysis_obj:
        # Try to map keys if analysis is already structured
        # This mapping is defensive — provider's keys may differ
        data = {}
        # Flatten simple fields from analysis_obj
        # Common possibilities: analysis_obj may have keys like 'entities', 'summary', 'fields', etc.
        # Try direct mapping first
        for k in NORMAL_FIELDS + EMERGENCY_FIELDS:
            if k in analysis_obj:
                data[k] = analysis_obj[k]
        # If call_type not provided, try to infer
        if not data.get("call_type"):
            # If emergency-related keys exist in analysis -> emergency
            if any(k in analysis_obj for k in ["emergency_type", "injury_status", "injury"]):
                data["call_type"] = "emergency"
            else:
                data["call_type"] = "normal"

        # Populate missing expected keys with None/defaults
        for f in NORMAL_FIELDS + EMERGENCY_FIELDS:
            if f not in data:
                data[f] = None
        return data

    # Fallback simple rule-based parsing from transcript text
    text = transcript or raw_transcript or ""
    lower = text.lower()

    # emergency detection
    emergency_triggers = ["accident", "blowout", "hurt", "injury", "emergency", "crash", "wreck", "medical"]
    if any(word in lower for word in emergency_triggers):
        # simple extraction heuristics
        emergency_type = "Other"
        if "accident" in lower or "crash" in lower:
            emergency_type = "Accident"
        elif "blowout" in lower or "tire" in lower:
            emergency_type = "Breakdown"
        elif "hurt" in lower or "injury" in lower or "bleed" in lower:
            emergency_type = "Medical"

        # try to find location like "on i-10 near indio" simple regex
        loc = _extract_location(text)

        # injuries/safety
        safety = None
        if re.search(r"\b(no|we are ok|we're ok|everyone safe|everyone is safe)\b", lower):
            safety = "Driver confirmed everyone is safe"
        else:
            safety = None

        injury = None
        if re.search(r"\b(no injuries|no one hurt|nobody is hurt)\b", lower):
            injury = "No injuries reported"
        elif re.search(r"\b(injured|hurt)\b", lower):
            injury = "Injuries reported"

        load_secure = bool(re.search(r"\b(load secure|load is secure|load secured)\b", lower))

        return {
            "call_type": "emergency",
            "call_outcome": "Emergency Escalation",
            "emergency_type": emergency_type,
            "safety_status": safety,
            "injury_status": injury,
            "emergency_location": loc,
            "load_secure": bool(load_secure),
            "escalation_status": "Connected to Human Dispatcher"
        }

    # Non-emergency (normal check-in) fallback
    # find ETA: look for "eta" or times
    eta = _extract_eta(text)
    location = _extract_location(text)
    driver_status = None
    if re.search(r"\b(arrive|arrived|i'm here|i am here|i have arrived)\b", lower):
        driver_status = "Arrived"
    elif re.search(r"\b(unload|unloading|at the dock|door)\b", lower):
        driver_status = "Unloading"
    elif re.search(r"\b(delay|delayed|traffic|stuck|broken)\b", lower):
        driver_status = "Delayed"
    elif re.search(r"\b(driv|driving|on the way|on route|in transit)\b", lower):
        driver_status = "Driving"

    # delay reason
    delay_reason = None
    m = re.search(r"(traffic|weather|truck broke|breakdown|mechanical|inspection)", lower)
    if m:
        delay_reason = m.group(1)

    pod_ack = bool(re.search(r"\b(pod|proof of delivery|i will send pod|i have pod|i'll send pod)\b", lower))

    return {
        "call_type": "normal",
        "call_outcome": "In-Transit Update" if driver_status != "Arrived" else "Arrival Confirmation",
        "driver_status": driver_status or "Unknown",
        "current_location": location,
        "eta": eta,
        "delay_reason": delay_reason or "None",
        "unloading_status": "N/A",
        "pod_reminder_acknowledged": bool(pod_ack)
    }


# ---- helper regex functions ----
def _extract_location(text: str) -> Optional[str]:
    # naive heuristics: look for patterns like "on i-10", "near indio", "mile", "at exit"
    m = re.search(r"(on\s+[A-Za-z0-9\-\s]+|near\s+[A-Za-z0-9\-\s]+|mile\s+marker\s+\d+|at\s+door\s+\d+)", text, re.I)
    if m:
        return m.group(0).strip()
    return None

def _extract_eta(text: str)-> Optional[str]:
    # look for times like "8:00", "tomorrow 8am", "in 2 hours"
    m = re.search(r"((tomorrow|today|tonight)\s*\d{1,2}(:\d{2})?\s*(am|pm)?)|(\b\d{1,2}:\d{2}\b)|in\s+\d+\s+(hour|hours|mins|minutes)", text, re.I)
    if m:
        return m.group(0).strip()
    return None


