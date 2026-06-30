#!/usr/bin/env python
"""
Debug script to verify test users and password hashing
"""

from app import create_app
from app.database.models import User

app = create_app('development')

with app.app_context():
    print("🔍 Checking test users in database...\n")
    
    # Check customer
    customer = User.query.filter_by(email='cliente@test.com').first()
    if customer:
        print("✅ Customer found:")
        print(f"   Email: {customer.email}")
        print(f"   Name: {customer.name}")
        print(f"   Role: {customer.role}")
        print(f"   Status: {customer.status}")
        print(f"   Password hash (first 20 chars): {customer.password_hash[:20]}...")
        
        # Test password verification
        test_password = 'cliente123'
        is_valid = customer.verify_password(test_password)
        print(f"   Password '{test_password}' verification: {'✅ PASS' if is_valid else '❌ FAIL'}")
        print()
    else:
        print("❌ Customer not found")
        print()
    
    # Check technician
    technician = User.query.filter_by(email='tecnico@test.com').first()
    if technician:
        print("✅ Technician found:")
        print(f"   Email: {technician.email}")
        print(f"   Name: {technician.name}")
        print(f"   Role: {technician.role}")
        print(f"   Status: {technician.status}")
        print(f"   Password hash (first 20 chars): {technician.password_hash[:20]}...")
        
        # Test password verification
        test_password = 'tecnico123'
        is_valid = technician.verify_password(test_password)
        print(f"   Password '{test_password}' verification: {'✅ PASS' if is_valid else '❌ FAIL'}")
        print()
    else:
        print("❌ Technician not found")
        print()
    
    # Check admin
    admin = User.query.filter_by(email='admin@test.com').first()
    if admin:
        print("✅ Admin found:")
        print(f"   Email: {admin.email}")
        print(f"   Name: {admin.name}")
        print(f"   Role: {admin.role}")
        print(f"   Status: {admin.status}")
        print(f"   Password hash (first 20 chars): {admin.password_hash[:20]}...")
        
        # Test password verification
        test_password = 'admin123'
        is_valid = admin.verify_password(test_password)
        print(f"   Password '{test_password}' verification: {'✅ PASS' if is_valid else '❌ FAIL'}")
        print()
    else:
        print("❌ Admin not found")
        print()
