# UPDATED COMMENTS: Vercel serverless function entry point
# CRITICAL: This file is required for Vercel Python runtime
# REUSED: Imports main FastAPI app from backend

import sys
from pathlib import Path

# CRITICAL: Add backend directory to Python path for imports
backend_path = Path(__file__).parent.parent / 'backend'
sys.path.insert(0, str(backend_path))

from api_server import app

# SCALED FOR: Vercel serverless deployment
# CRITICAL: Vercel expects 'app' not 'handler' for FastAPI
# The app variable is automatically used by Vercel's Python runtime
