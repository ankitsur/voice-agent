# backend/supabase_client.py
"""
Supabase client initialization.
Requires SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError(
        "Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY. "
        "Please check your .env file."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
