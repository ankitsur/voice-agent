# backend/api/start_call.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase_client import supabase
import httpx
import os
from datetime import datetime
from dotenv import load_dotenv

# ------------------------------------------------------------------
# Load environment variables
# ------------------------------------------------------------------
load_dotenv()

router = APIRouter()

# ------------------------------------------------------------------
# Read environment variables
# ------------------------------------------------------------------
RETELL_API_KEY = os.getenv("RETELL_API_KEY")
RETELL_AGENT_ID = os.getenv("RETELL_AGENT_ID")
RETELL_API_URL = os.getenv(
    "RETELL_API_URL",
    "https://api.retellai.com/v2/create-web-call"   # fallback correct URL
)
RETELL_WEBHOOK_URL = os.getenv("RETELL_WEBHOOK_URL")

print("🔧 START_CALL LOADED → Retell URL:", RETELL_API_URL)


# ------------------------------------------------------------------
# Request body model
# ------------------------------------------------------------------
class StartCallInput(BaseModel):
    agent_config_id: str
    driver_name: str
    driver_phone: str
    load_number: str


# ------------------------------------------------------------------
# START CALL ENDPOINT
# ------------------------------------------------------------------
@router.post("/start-call")
async def start_call(body: StartCallInput):

    print("▶️ /start-call triggered → Using Retell URL:", RETELL_API_URL)

    # --------------------------------------------------------------
    # 1. Insert call record in Supabase (status = queued)
    # --------------------------------------------------------------
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
        raise HTTPException(status_code=500, detail="❌ Failed to insert call into database")

    call_id = inserted.data[0]["id"]
    print("🟢 Call inserted into DB → call_id:", call_id)

    # --------------------------------------------------------------
    # 2. Prepare Retell V2 Web-Call payload
    # --------------------------------------------------------------
    payload = {
        "agent_id": RETELL_AGENT_ID,
        "metadata": {
            "call_id": call_id,
            "driver_name": body.driver_name,
            "load_number": body.load_number
        },
        # Dynamic variables injected into the agent's prompt
        "retell_llm_dynamic_variables": {
            "driver_name": body.driver_name,
            "load_number": body.load_number
        }
    }

    headers = {
        "Authorization": f"Bearer {RETELL_API_KEY}",
        "Content-Type": "application/json"
    }

    # --------------------------------------------------------------
    # 3. Call Retell API
    # --------------------------------------------------------------
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                RETELL_API_URL,
                json=payload,
                headers=headers
            )
    except Exception as e:
        supabase.table("calls").update({"status": "failed"}).eq("id", call_id).execute()
        raise HTTPException(
            status_code=500,
            detail=f"❌ Retell connection error: {str(e)}"
        )

    if response.status_code >= 400:
        supabase.table("calls").update({"status": "failed"}).eq("id", call_id).execute()
        raise HTTPException(
            status_code=500,
            detail=f"❌ Retell failed: {response.text, RETELL_API_URL}"
        )

    retell_data = response.json()
    print("🟢 Retell created Web Call:", retell_data)

    retell_call_id = retell_data.get("call_id")
    access_token = retell_data.get("access_token")
    expires_in = retell_data.get("expires_in")

    # --------------------------------------------------------------
    # 4. Update call record with Retell call_id + status
    # --------------------------------------------------------------
    supabase.table("calls").update({
        "status": "in_progress",
        "retell_call_id": retell_call_id,
        "started_at": datetime.utcnow().isoformat()
    }).eq("id", call_id).execute()

    print(f"🟢 DB updated → retell_call_id={retell_call_id}")

    # --------------------------------------------------------------
    # 5. Return details to UI
    # --------------------------------------------------------------
    return {
        "success": True,
        "call_id": call_id,
        "retell_call_id": retell_call_id,
        "access_token": access_token,
        "access_token_expires_in": expires_in
    }
