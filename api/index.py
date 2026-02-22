# UPDATED COMMENTS: Vercel serverless entry point
# CRITICAL: Vercel expects handler in api/index.py or uses filename-based routing
# REUSED: Import FastAPI app from main.py

from main import app

# CRITICAL: Vercel serverless handler
# UPDATED COMMENTS: Export app for Vercel Python runtime
handler = app
