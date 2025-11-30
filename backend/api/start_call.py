# backend/api/start_call.py
"""API endpoint to initiate web calls via Retell AI."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase_client import supabase
import httpx
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/v1", tags=["Calls"])

# Environment variables
RETELL_API_KEY = os.getenv("RETELL_API_KEY")
RETELL_AGENT_ID = os.getenv("RETELL_AGENT_ID")
RETELL_API_URL = os.getenv("RETELL_API_URL", "https://api.retellai.com/v2/create-web-call")


class StartCallInput(BaseModel):
    agent_config_id: str
    driver_name: str
    driver_phone: str
    load_number: str


@router.post("/start-call")
async def start_call(body: StartCallInput):
    """Initiate a new web call via Retell AI with custom prompt from config."""

    # 1. Fetch agent config to get custom prompt
    config_result = supabase.table("agent_configs").select("*").eq("id", body.agent_config_id).single().execute()
    
    if not config_result.data:
        raise HTTPException(status_code=404, detail="Agent config not found")
    
    agent_config = config_result.data
    config_data = agent_config.get("config", {})
    
    # Get custom prompt, first message, post-call summary, and emergency triggers from config
    custom_prompt = config_data.get("prompt", "")
    first_message = config_data.get("first_message", "")
    post_call_summary = config_data.get("post_call_summary", "")
    
    # Get emergency triggers and convert to comma-separated string
    emergency_config = config_data.get("emergency", {})
    emergency_triggers_list = emergency_config.get("triggers", [])
    emergency_triggers = ", ".join(emergency_triggers_list) if emergency_triggers_list else ""

    # 2. Insert call record in Supabase
    inserted = supabase.table("calls").insert({
        "agent_config_id": body.agent_config_id,
        "driver_name": body.driver_name,
        "driver_phone": body.driver_phone,
        "load_number": body.load_number,
        "status": "queued",
        "metadata": {},
        "retell_call_id": None,
        "started_at": None,
        "ended_at": None
    }).execute()

    if not inserted.data:
        raise HTTPException(status_code=500, detail="Failed to insert call into database")

    call_id = inserted.data[0]["id"]

    # 3. Prepare Retell payload with custom prompt
    payload = {
        "agent_id": RETELL_AGENT_ID,
        "metadata": {
            "call_id": call_id,
            "agent_config_id": body.agent_config_id,
            "driver_name": body.driver_name,
            "load_number": body.load_number
        },
        "retell_llm_dynamic_variables": {
            "custom_prompt": custom_prompt,           # YOUR prompt from database!
            "first_message": first_message,           # YOUR first message from database!
            "post_call_summary": post_call_summary,   # YOUR post-call analysis from database!
            "emergency_triggers": emergency_triggers, # YOUR emergency triggers from database!
            "driver_name": body.driver_name,
            "load_number": body.load_number
        }
    }

    headers = {
        "Authorization": f"Bearer {RETELL_API_KEY}",
        "Content-Type": "application/json"
    }

    # 4. Call Retell API
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                RETELL_API_URL,
                json=payload,
                headers=headers
            )
    except Exception as e:
        supabase.table("calls").update({"status": "failed"}).eq("id", call_id).execute()
        raise HTTPException(status_code=500, detail=f"Retell connection error: {str(e)}")

    if response.status_code >= 400:
        supabase.table("calls").update({"status": "failed"}).eq("id", call_id).execute()
        raise HTTPException(status_code=500, detail=f"Retell API error: {response.text}")

    retell_data = response.json()
    retell_call_id = retell_data.get("call_id")
    access_token = retell_data.get("access_token")
    expires_in = retell_data.get("expires_in")

    # 5. Update call record
    supabase.table("calls").update({
        "status": "in_progress",
        "retell_call_id": retell_call_id,
        "started_at": datetime.utcnow().isoformat()
    }).eq("id", call_id).execute()

    # 6. Return to frontend
    return {
        "success": True,
        "call_id": call_id,
        "retell_call_id": retell_call_id,
        "access_token": access_token,
        "access_token_expires_in": expires_in
    }
