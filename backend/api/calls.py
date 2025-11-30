# backend/api/calls.py

from fastapi import APIRouter, HTTPException
from supabase_client import supabase

router = APIRouter(prefix="/api/v1", tags=["Calls"])


@router.get("/calls")
def list_calls():
    """
    List all calls with their status and basic info.
    Most recent calls first.
    """
    result = supabase.table("calls").select("*").order("created_at", desc=True).execute()
    return {"data": result.data}


@router.get("/calls/{call_id}")
def get_call(call_id: str):
    """
    Get a single call with full details including:
    - Call info (driver, load, status)
    - Transcript
    - Structured data summary
    """
    result = supabase.table("calls").select("*").eq("id", call_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Call not found")
    
    call = result.data
    
    # Extract structured data from metadata if available
    metadata = call.get("metadata", {}) or {}
    transcript = metadata.get("transcript", "")
    transcript_object = metadata.get("transcript_object", [])
    structured_data = metadata.get("structured_data", {})
    
    return {
        "data": {
            "id": call.get("id"),
            "agent_config_id": call.get("agent_config_id"),
            "driver_name": call.get("driver_name"),
            "driver_phone": call.get("driver_phone"),
            "load_number": call.get("load_number"),
            "status": call.get("status"),
            "retell_call_id": call.get("retell_call_id"),
            "started_at": call.get("started_at"),
            "ended_at": call.get("ended_at"),
            "created_at": call.get("created_at"),
            "transcript": transcript,
            "transcript_object": transcript_object,
            "structured_data": structured_data
        }
    }

