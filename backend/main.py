# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import routers
from api.agent_configs import router as agent_router
from api.start_call import router as start_call_router   # ✅ NEW FIXED IMPORT

app = FastAPI(title="VoiceAgent Backend")

# Allow local frontend + ngrok (dev mode)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agent_router)
app.include_router(start_call_router)

@app.get("/")
def root():
    return {"message": "Backend is running!"}


@app.get("/test-supabase")
def test_supabase():
    response = supabase.table("agent_configs").select("*").limit(1).execute()
    return {"success": True, "data": response.data}
