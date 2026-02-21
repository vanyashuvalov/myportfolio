# UPDATED COMMENTS: Vercel serverless function entry point
# CRITICAL: This file is required for Vercel Python runtime
# REUSED: Imports main FastAPI app from backend

from backend.api_server import app

# SCALED FOR: Vercel serverless deployment
# This exports the FastAPI app as a serverless function
handler = app
