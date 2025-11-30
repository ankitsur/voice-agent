# backend/api/webhook.py

import logging
from fastapi import APIRouter, Request, HTTPException
from datetime import datetime
from supabase_client import supabase
from services.postprocess import run_post_processing_from_event

logger = logging.getLogger(__name__)

# Webhook routes don't use /api/v1 prefix - Retell sends to specific URL
router = APIRouter(tags=["Webhooks"])


@router.post("/webhooks/retell")
async def retell_webhook(request: Request):
    """
    Webhook endpoint for Retell AI.
    Called when a call ends with transcript and analysis data.
    """
    try:
        payload = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")

    event_type = payload.get("event")
    
    # Only process "call_ended" events
    if event_type != "call_ended":
        return {"status": "ignored", "event": event_type}

    # Extract call data
    call_data = payload.get("call", {})
    retell_call_id = call_data.get("call_id")
    transcript = call_data.get("transcript", "")
    transcript_object = call_data.get("transcript_object", [])
    call_analysis = call_data.get("call_analysis", {})
    
    # Get our call ID from metadata
    metadata = call_data.get("metadata", {})
    our_call_id = metadata.get("call_id")

    if not our_call_id:
        # Try to find call by retell_call_id
        result = supabase.table("calls").select("*").eq("retell_call_id", retell_call_id).execute()
        if result.data:
            our_call_id = result.data[0]["id"]
        else:
            logger.warning(f"Call not found for retell_call_id: {retell_call_id}")
            return {"status": "error", "message": "Call not found in database"}

    # Run post-processing to extract structured data
    structured_data = run_post_processing_from_event(
        transcript=transcript,
        analysis_obj=call_analysis,
        raw_transcript=transcript
    )

    # Update call record with completion status
    supabase.table("calls").update({
        "status": "completed",
        "ended_at": datetime.utcnow().isoformat(),
        "metadata": {
            "transcript": transcript,
            "transcript_object": transcript_object,
            "call_analysis": call_analysis,
            "structured_data": structured_data
        }
    }).eq("id", our_call_id).execute()

    return {
        "status": "success",
        "call_id": our_call_id,
        "structured_data": structured_data
    }


@router.get("/webhooks/retell")
async def retell_webhook_verify():
    """
    GET endpoint for webhook verification (some services ping this).
    """
    return {"status": "ok", "message": "Retell webhook endpoint is active"}

