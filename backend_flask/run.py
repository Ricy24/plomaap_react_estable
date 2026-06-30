#!/usr/bin/env python
"""
PlomApp Backend - Run Script
Flask application entry point
"""
import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables
load_dotenv()

# Get environment
env = os.getenv('FLASK_ENV', 'development')

# Create app
app = create_app(env)

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('DEBUG', 'True') == 'True'
    
    print(f"Starting PlomApp Backend - Environment: {env}")
    print(f"Running on http://0.0.0.0:{port}")
    
    app.run(
        debug=debug,
        host='0.0.0.0',
        port=port
    )
