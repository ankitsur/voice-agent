# backend/services/postprocess.py
"""
Post-call processing to extract structured data from call transcripts.
Primary source: Retell AI's post-call analysis (if available)
Fallback: Basic regex extraction from transcript
"""

from typing import Dict, Any, Optional
import re

# Emergency trigger keywords
EMERGENCY_TRIGGERS = frozenset([
    "accident", "crash", "blowout", "breakdown", "emergency",
    "hurt", "injured", "injury", "medical", "fire", "wreck",
    "collision", "stuck"
])


def extract_structured_data(
    transcript: str,
    retell_analysis: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Extract structured data from a call.
    
    Args:
        transcript: Full call transcript text
        retell_analysis: Structured data from Retell AI (if available)
    
    Returns:
        Dict with structured call data
    """
    # Use Retell's analysis if available (preferred)
    if retell_analysis and isinstance(retell_analysis, dict):
        return _normalize_retell_data(retell_analysis)
    
    # Fallback to regex extraction
    return _extract_from_transcript(transcript)


def _normalize_retell_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize and validate Retell's structured data."""
    call_type = data.get("call_type", "normal")
    
    if call_type == "emergency":
        return {
            "call_type": "emergency",
            "call_outcome": data.get("call_outcome", "Emergency Escalation"),
            "emergency_type": data.get("emergency_type", "Other"),
            "safety_status": data.get("safety_status"),
            "injury_status": data.get("injury_status"),
            "emergency_location": data.get("emergency_location"),
            "load_secure": data.get("load_secure"),
            "escalation_status": data.get("escalation_status", "Connected to Human Dispatcher"),
        }
    
    return {
        "call_type": "normal",
        "call_outcome": data.get("call_outcome", "In-Transit Update"),
        "driver_status": data.get("driver_status", "Unknown"),
        "current_location": data.get("current_location"),
        "eta": data.get("eta"),
        "delay_reason": data.get("delay_reason", "None"),
        "unloading_status": data.get("unloading_status", "N/A"),
        "pod_reminder_acknowledged": bool(data.get("pod_reminder_acknowledged", False)),
    }


def _extract_from_transcript(transcript: str) -> Dict[str, Any]:
    """Fallback: Extract structured data using regex patterns."""
    if not transcript:
        return _empty_normal_response()
    
    text = transcript.lower()
    
    # Check for emergency
    if _is_emergency(text):
        return _extract_emergency_data(text, transcript)
    
    return _extract_normal_data(text, transcript)


def _is_emergency(text: str) -> bool:
    """Check if transcript contains emergency keywords."""
    return any(trigger in text for trigger in EMERGENCY_TRIGGERS)


def _extract_emergency_data(text: str, original: str) -> Dict[str, Any]:
    """Extract emergency-related data from transcript."""
    return {
        "call_type": "emergency",
        "call_outcome": "Emergency Escalation",
        "emergency_type": _detect_emergency_type(text),
        "safety_status": _extract_safety_status(text),
        "injury_status": _extract_injury_status(text),
        "emergency_location": _extract_location(original),
        "load_secure": _check_load_secure(text),
        "escalation_status": "Connected to Human Dispatcher",
    }


def _extract_normal_data(text: str, original: str) -> Dict[str, Any]:
    """Extract normal check-in data from transcript."""
    driver_status = _detect_driver_status(text)
    
    return {
        "call_type": "normal",
        "call_outcome": _determine_call_outcome(driver_status),
        "driver_status": driver_status,
        "current_location": _extract_location(original),
        "eta": _extract_eta(original),
        "delay_reason": _extract_delay_reason(text),
        "unloading_status": "N/A",
        "pod_reminder_acknowledged": _check_pod_acknowledged(text),
    }


def _empty_normal_response() -> Dict[str, Any]:
    """Return empty normal response structure."""
    return {
        "call_type": "normal",
        "call_outcome": "Unknown",
        "driver_status": "Unknown",
        "current_location": None,
        "eta": None,
        "delay_reason": "None",
        "unloading_status": "N/A",
        "pod_reminder_acknowledged": False,
    }


# --- Detection helpers ---

def _detect_emergency_type(text: str) -> str:
    if any(w in text for w in ["accident", "crash", "collision", "hit"]):
        return "Accident"
    if any(w in text for w in ["blowout", "tire", "broke", "breakdown", "mechanical"]):
        return "Breakdown"
    if any(w in text for w in ["hurt", "injured", "injury", "medical", "sick", "pain"]):
        return "Medical"
    return "Other"


def _detect_driver_status(text: str) -> str:
    if any(w in text for w in ["arrived", "i'm here", "i am here", "got here"]):
        return "Arrived"
    if any(w in text for w in ["unloading", "at the dock", "door", "backing in"]):
        return "Unloading"
    if any(w in text for w in ["delayed", "stuck", "traffic", "waiting"]):
        return "Delayed"
    if any(w in text for w in ["driving", "on the way", "on route", "in transit", "moving"]):
        return "Driving"
    return "Unknown"


def _determine_call_outcome(driver_status: str) -> str:
    outcomes = {
        "Arrived": "Arrival Confirmation",
        "Unloading": "Unloading Update",
        "Delayed": "Delayed Update",
    }
    return outcomes.get(driver_status, "In-Transit Update")


def _extract_safety_status(text: str) -> Optional[str]:
    if re.search(r"(everyone.*(ok|safe|fine)|we('re| are) (ok|safe|fine)|i('m| am) (ok|safe))", text):
        return "Driver confirmed everyone is safe"
    return None


def _extract_injury_status(text: str) -> Optional[str]:
    if re.search(r"(no injur|no one.*hurt|nobody.*hurt|everyone.*ok)", text):
        return "No injuries reported"
    if re.search(r"(injur|hurt|bleeding)", text):
        return "Injuries reported"
    return None


def _check_load_secure(text: str) -> Optional[bool]:
    if re.search(r"load.*(secure|fine|ok|good)", text):
        return True
    if re.search(r"load.*(damage|spill|shift)", text):
        return False
    return None


def _check_pod_acknowledged(text: str) -> bool:
    return bool(re.search(r"(pod|proof of delivery|will send|i'll send)", text))


def _extract_delay_reason(text: str) -> str:
    reasons = ["traffic", "weather", "breakdown", "mechanical", "inspection", "waiting"]
    for reason in reasons:
        if reason in text:
            return reason.capitalize()
    return "None"


def _extract_location(text: str) -> Optional[str]:
    """Extract location from transcript."""
    patterns = [
        r"(on\s+(?:i-?\d+|interstate\s+\d+|highway\s+\d+))",
        r"(near\s+[A-Za-z\s]+)",
        r"(mile\s+marker\s+\d+)",
        r"(exit\s+\d+)",
        r"(at\s+door\s+\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def _extract_eta(text: str) -> Optional[str]:
    """Extract ETA from transcript."""
    patterns = [
        r"((?:tomorrow|today|tonight)\s*(?:at\s*)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?)",
        r"(\d{1,2}:\d{2}\s*(?:am|pm)?)",
        r"(in\s+\d+\s+(?:hour|hours|minute|minutes))",
        r"(\d+\s+(?:hour|hours)\s+(?:away|out))",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


# Legacy function name for backward compatibility
def run_post_processing_from_event(
    transcript: Optional[str],
    analysis_obj: Optional[Dict[str, Any]],
    raw_transcript: Optional[str]
) -> Dict[str, Any]:
    """Legacy wrapper - use extract_structured_data instead."""
    return extract_structured_data(
        transcript=transcript or raw_transcript or "",
        retell_analysis=analysis_obj
    )
