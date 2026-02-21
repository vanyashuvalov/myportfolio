#!/usr/bin/env python3
"""
## ANCHOR POINTS
- ENTRY: Vercel serverless function for FastAPI
- MAIN: Single entry point for all API routes
- EXPORTS: ASGI app for Vercel Python runtime
- DEPS: fastapi, backend/api_server
- TODOs: None

UPDATED COMMENTS: Vercel serverless entry point (renamed from app.py to index.py)
CRITICAL: Vercel expects api/index.py as the main entry point
SCALED FOR: Production serverless deployment on Vercel
"""

import sys
import os
from pathlib import Path

# CRITICAL: Fix Python path for Vercel serverless environment
# On Vercel, files are in /var/task/
current_dir = Path(__file__).parent
backend_dir = current_dir.parent / 'backend'

# UPDATED COMMENTS: Add backend to Python path
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(current_dir.parent))

# CRITICAL: Change working directory to backend for data file access
os.chdir(str(backend_dir))

# REUSED: Import FastAPI app from backend
try:
    from api_server import app
except ImportError as e:
    # UPDATED COMMENTS: Fallback error handling
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app = FastAPI()
    
    @app.get("/")
    async def error_root():
        return JSONResponse({
            "error": "Import failed",
            "details": str(e),
            "sys_path": sys.path,
            "cwd": os.getcwd(),
            "backend_dir": str(backend_dir),
            "exists": backend_dir.exists()
        }, status_code=500)

# CRITICAL: Export app for Vercel ASGI handler
