"""
## ANCHOR POINTS
- ENTRY: Vercel serverless entry point
- MAIN: ASGI handler for all API routes
- EXPORTS: app as handler
- DEPS: fastapi from main.py
- TODOs: None

UPDATED COMMENTS: Vercel Python serverless function entry point
CRITICAL: Must be in api/ folder for Vercel auto-detection
REUSED: FastAPI app from main.py module
"""

from api.main import app

# CRITICAL: Vercel serverless handler export
# UPDATED COMMENTS: Vercel Python runtime expects 'app' or 'handler' variable
# SCALED FOR: Production serverless deployment
