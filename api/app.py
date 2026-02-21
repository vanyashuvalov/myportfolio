# UPDATED COMMENTS: Vercel serverless function entry point for FastAPI
# CRITICAL: This file wraps FastAPI app for Vercel's serverless environment
# REUSED: Imports main FastAPI app from backend
# SCALED FOR: Production deployment with proper ASGI handling

import sys
from pathlib import Path

# CRITICAL: Add backend directory to Python path for imports
backend_path = Path(__file__).parent.parent / 'backend'
sys.path.insert(0, str(backend_path))

# REUSED: Import FastAPI app from backend
from api_server import app

# CRITICAL: Export app for Vercel
# Vercel's Python runtime automatically wraps FastAPI apps as ASGI
# The 'app' variable is the ASGI application that Vercel will serve
