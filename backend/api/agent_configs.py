from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from supabase_client import supabase

router = APIRouter(prefix="/api/v1", tags=["Agent Configs"])


class AgentConfigInput(BaseModel):
    name: str
    description: Optional[str] = None
    config: Dict[str, Any]


class AgentConfigResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    config: Dict[str, Any]
    created_at: Optional[str] = None


@router.get("/agent-configs")
def list_agent_configs():
    """List all agent configurations."""
    try:
        result = supabase.table("agent_configs").select("*").order("created_at", desc=True).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agent-configs/{config_id}")
def get_agent_config(config_id: str):
    """Get a single agent configuration by ID."""
    try:
        result = supabase.table("agent_configs").select("*").eq("id", config_id).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Agent config not found")
        return {"data": result.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/agent-configs", status_code=201)
def create_agent_config(body: AgentConfigInput):
    """Create a new agent configuration."""
    try:
        result = supabase.table("agent_configs").insert({
            "name": body.name,
            "description": body.description,
            "config": body.config
        }).execute()
        return {"data": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/agent-configs/{config_id}")
def update_agent_config(config_id: str, body: AgentConfigInput):
    """Update an existing agent configuration."""
    try:
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
        if not result.data:
            raise HTTPException(status_code=404, detail="Agent config not found")
        return {"data": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/agent-configs/{config_id}")
def delete_agent_config(config_id: str):
    """Delete an agent configuration."""
    try:
        result = (
            supabase.table("agent_configs")
            .delete()
            .eq("id", config_id)
            .execute()
        )
        return {"success": True, "deleted_id": config_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/agent-configs")
def bulk_delete_agent_configs(ids: List[str]):
    """Delete multiple agent configurations."""
    try:
        result = (
            supabase.table("agent_configs")
            .delete()
            .in_("id", ids)
            .execute()
        )
        return {"success": True, "deleted_count": len(ids)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

