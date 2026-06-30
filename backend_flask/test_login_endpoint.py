#!/usr/bin/env python
"""
Test the login endpoint directly
"""

from app import create_app
from flask_jwt_extended import decode_token
from app.routes.auth import login_route
from flask import Flask, request

app = create_app('development')

# Create a test request context
with app.test_client() as client:
    print("🧪 Testing login endpoint...\n")
    
    # Test 1: Login with valid credentials
    print("Test 1: Valid login")
    response = client.post('/api/auth/login', 
        json={
            'email': 'cliente@test.com',
            'password': 'cliente123',
            'role': 'customer'
        },
        headers={'Content-Type': 'application/json'}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.get_json()}")
    
    if response.status_code == 200:
        data = response.get_json()
        print(f"✅ Login successful!")
        print(f"   Token: {data.get('token', 'N/A')[:50]}...")
        print(f"   User: {data.get('user', {}).get('name')}")
    else:
        print(f"❌ Login failed")
    print()
    
    # Test 2: Login with wrong password
    print("Test 2: Wrong password")
    response = client.post('/api/auth/login',
        json={
            'email': 'cliente@test.com',
            'password': 'wrongpassword',
            'role': 'customer'
        },
        headers={'Content-Type': 'application/json'}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.get_json()}")
    print()
    
    # Test 3: Login with non-existent email
    print("Test 3: Non-existent user")
    response = client.post('/api/auth/login',
        json={
            'email': 'nonexistent@test.com',
            'password': 'password123',
            'role': 'customer'
        },
        headers={'Content-Type': 'application/json'}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.get_json()}")
