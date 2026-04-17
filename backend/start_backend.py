#!/usr/bin/env python
"""
ClassroomAI Backend Starter Script
Ensures proper environment and starts the server
"""
import subprocess
import sys
import os
import time

def main():
    print("=" * 60)
    print("  ClassroomAI Backend Startup")
    print("=" * 60)
    print()

    # Check Python version
    print(f"✓ Python: {sys.version.split()[0]}")
    print(f"✓ Location: {sys.executable}")

    # Check .env file
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        print(f"✓ .env file found: {env_path}")
        with open(env_path) as f:
            for line in f:
                if "OPENAI_API_KEY" in line:
                    print("✓ OPENAI_API_KEY is set")
                    break
    else:
        print(f"✗ .env file NOT found at {env_path}")
        sys.exit(1)

    # Load environment
    from dotenv import load_dotenv
    load_dotenv()

    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        print(f"✓ API Key loaded: {api_key[:20]}...")
    else:
        print("✗ API Key not loaded!")
        sys.exit(1)

    print()
    print("=" * 60)
    print("  Starting Uvicorn Server")
    print("=" * 60)
    print()

    # Start the server
    try:
        subprocess.run(
            [sys.executable, "main.py"],
            cwd=os.path.dirname(__file__)
        )
    except KeyboardInterrupt:
        print("\n\nServer stopped by user.")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
