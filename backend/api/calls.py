# backend/api/calls.py
"""API endpoints for managing call records."""

from typing import List
from fastapi import APIRouter, HTTPException
from supabase_client import supabase

router = APIRouter(prefix="/api/v1", tags=["Calls"])


@router.get("/calls")
def list_calls():
    """List all calls, most recent first."""
    try:
        result = supabase.table("calls").select("*").order("created_at", desc=True).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/calls/{call_id}")
def get_call(call_id: str):
    """Get a single call with full details."""
    try:
        result = supabase.table("calls").select("*").eq("id", call_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Call not found")
        
        call = result.data
        metadata = call.get("metadata", {}) or {}
        
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
                "transcript": metadata.get("transcript", ""),
                "transcript_object": metadata.get("transcript_object", []),
                "structured_data": metadata.get("structured_data", {}),
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/calls/{call_id}")
def delete_call(call_id: str):
    """Delete a single call."""
    try:
        supabase.table("calls").delete().eq("id", call_id).execute()
        return {"success": True, "deleted_id": call_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/calls")
def bulk_delete_calls(ids: List[str]):
    """Delete multiple calls."""
    try:
        supabase.table("calls").delete().in_("id", ids).execute()
        return {"success": True, "deleted_count": len(ids)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
