import sys
import os

# Add backend directory to path so imports work seamlessly on Vercel
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app

# Vercel looks for 'app' as the ASGI application entrypoint
