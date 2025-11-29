from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from supabase_client import supabase

router = APIRouter()

class AgentConfigInput(BaseModel):
    name: str
    description: Optional[str] = None
    config: Dict[str, Any]

@router.get("/agent-configs")
def list_agent_configs():
    print("hlwoejro")
    result = supabase.table("agent_configs").select("*").execute()
    return result

@router.get("/agent-configs/{config_id}")
def get_agent_config(config_id: str):
    result = supabase.table("agent_configs").select("*").eq("id", config_id).single().execute()
    return result

@router.post("/agent-configs")
def create_agent_config(body: AgentConfigInput):
    result = supabase.table("agent_configs").insert({
        "name": body.name,
        "description": body.description,
        "config": body.config
    }).execute()
    return result

@router.put("/agent-configs/{config_id}")
def update_agent_config(config_id: str, body: AgentConfigInput):
    result = (
        supabase.table("agent_configs")
        .update({
            "name": body.name,
            "description": body.description,
            "config": body.config
        })
        .eq("id", config_id)
        .execute()
    )
    return result

@router.delete("/agent-configs/{config_id}")
def delete_agent_config(config_id: str):
    result = (
        supabase.table("agent_configs")
        .delete()
        .eq("id", config_id)
        .execute()
    )
    return result

@router.delete("/agent-configs")
def bulk_delete_agent_configs(ids: list[str]):
    result = (
        supabase.table("agent_configs")
        .delete()
        .in_("id", ids)
        .execute()
    )
    return result

