#!/usr/bin/env python3
"""
Setup Checker for Telegram API
UPDATED COMMENTS: Validates configuration and credentials
SCALED FOR: User-friendly setup verification
"""

import os
import sys
from pathlib import Path

def check_env_file():
    """Check if .env file exists and is configured"""
    env_path = Path('.env')
    
    if not env_path.exists():
        print("❌ .env file not found!")
        print("   Run: cp .env.example .env")
        return False
    
    print("✅ .env file exists")
    
    # UPDATED COMMENTS: Read and validate credentials
    with open(env_path, 'r') as f:
        content = f.read()
    
    issues = []
    
    if 'your_api_id_here' in content:
        issues.append("TELEGRAM_API_ID not configured")
    
    if 'your_api_hash_here' in content:
        issues.append("TELEGRAM_API_HASH not configured")
    
    if '+1234567890' in content:
        issues.append("TELEGRAM_PHONE not configured")
    
    if issues:
        print("⚠️  Configuration issues:")
        for issue in issues:
            print(f"   - {issue}")
        print("\n📝 Edit backend/.env and add your Telegram credentials")
        print("   Get them from: https://my.telegram.org/apps")
        return False
    
    print("✅ Credentials configured")
    return True

def check_dependencies():
    """Check if required Python packages are installed"""
    try:
        import telethon
        print("✅ telethon installed")
    except ImportError:
        print("❌ telethon not installed")
        print("   Run: pip install -r requirements.txt")
        return False
    
    try:
        import fastapi
        print("✅ fastapi installed")
    except ImportError:
        print("❌ fastapi not installed")
        print("   Run: pip install -r requirements.txt")
        return False
    
    return True

def check_session():
    """Check if Telegram session exists"""
    session_path = Path('telegram_scraper_session.session')
    
    if session_path.exists():
        print("✅ Telegram session exists (authenticated)")
        return True
    else:
        print("⚠️  No Telegram session found")
        print("   Run: python telegram_scraper.py --run-now")
        print("   You'll need to enter verification code from Telegram")
        return False

def check_data_directory():
    """Check if data directory exists"""
    data_path = Path('data/telegram')
    
    if not data_path.exists():
        print("⚠️  Data directory doesn't exist, creating...")
        data_path.mkdir(parents=True, exist_ok=True)
        print("✅ Data directory created")
    else:
        print("✅ Data directory exists")
    
    return True

def main():
    """Main setup checker"""
    print("=" * 50)
    print("Telegram API Setup Checker")
    print("=" * 50)
    print()
    
    checks = [
        ("Environment file", check_env_file),
        ("Python dependencies", check_dependencies),
        ("Data directory", check_data_directory),
        ("Telegram session", check_session),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n🔍 Checking {name}...")
        results.append(check_func())
    
    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)
    
    if all(results[:3]):  # First 3 checks are critical
        print("✅ Setup is ready!")
        
        if not results[3]:  # Session check
            print("\n📋 Next steps:")
            print("1. Run: python telegram_scraper.py --run-now")
            print("2. Enter verification code from Telegram")
            print("3. Run: python api_server.py")
        else:
            print("\n🚀 You can start the API server:")
            print("   python api_server.py")
    else:
        print("❌ Setup incomplete")
        print("\n📋 Follow the instructions above to fix issues")
        print("📖 See QUICK_START.md for detailed guide")
    
    print()

if __name__ == "__main__":
    main()