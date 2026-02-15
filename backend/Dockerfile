# UPDATED COMMENTS: Multi-stage Docker build for Python Telegram scraper
# SCALED FOR: Production deployment with optimized image size

FROM python:3.11-slim as base

# REUSED: System dependencies for Telethon and image processing
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# UPDATED COMMENTS: Create non-root user for security
RUN useradd --create-home --shell /bin/bash telegram_user

# CRITICAL: Set working directory
WORKDIR /app

# SCALED FOR: Dependency caching optimization
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# REUSED: Copy application code
COPY . .

# UPDATED COMMENTS: Create data directory with proper permissions
RUN mkdir -p data/telegram && \
    chown -R telegram_user:telegram_user /app

# SCALED FOR: Security - switch to non-root user
USER telegram_user

# CRITICAL: Expose API port
EXPOSE 8000

# UPDATED COMMENTS: Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# REUSED: Default command runs API server
CMD ["python", "api_server.py"]