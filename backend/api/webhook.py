# backend/api/webhook.py

from fastapi import APIRouter, Request, HTTPException
from datetime import datetime
from supabase_client import supabase
from services.postprocess import run_post_processing_from_event

router = APIRouter()


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

    print("📥 Webhook received from Retell:")
    print(payload)

    # Extract event type
    event_type = payload.get("event")
    
    # We care about "call_ended" events
    if event_type != "call_ended":
        print(f"ℹ️ Ignoring event type: {event_type}")
        return {"status": "ignored", "event": event_type}

    # Extract call data
    call_data = payload.get("call", {})
    retell_call_id = call_data.get("call_id")
    
    # Get transcript (can be in different formats)
    transcript = call_data.get("transcript", "")
    transcript_object = call_data.get("transcript_object", [])
    
    # Get analysis if Retell provides it
    call_analysis = call_data.get("call_analysis", {})
    
    # Get metadata we sent when creating the call
    metadata = call_data.get("metadata", {})
    our_call_id = metadata.get("call_id")
    
    print(f"📞 Call ended: retell_call_id={retell_call_id}, our_call_id={our_call_id}")

    if not our_call_id:
        # Try to find call by retell_call_id
        result = supabase.table("calls").select("*").eq("retell_call_id", retell_call_id).execute()
        if result.data:
            our_call_id = result.data[0]["id"]
        else:
            print("⚠️ Could not find matching call in database")
            return {"status": "error", "message": "Call not found in database"}

    # Run post-processing to extract structured data
    structured_data = run_post_processing_from_event(
        transcript=transcript,
        analysis_obj=call_analysis,
        raw_transcript=transcript
    )

    print(f"📊 Extracted structured data: {structured_data}")

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

    print(f"✅ Call {our_call_id} updated with transcript and structured data")

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

