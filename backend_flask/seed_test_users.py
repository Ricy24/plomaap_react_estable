#!/usr/bin/env python
"""
Seed test users for PlomApp
Run: python seed_test_users.py
"""

from app import create_app
from app.database.extensions import db
from app.database.models import User, TechnicianProfile
import json

app = create_app('development')

def seed_users():
    with app.app_context():
        print("🚀 Seeding test users...")
        
        # Remove existing test users to start fresh
        test_emails = [
            'cliente@test.com',
            'tecnico@test.com',
            'admin@test.com'
        ]
        
        for email in test_emails:
            user = User.query.filter_by(email=email).first()
            if user:
                db.session.delete(user)
        
        db.session.commit()
        
        # Create test customer
        customer = User(
            name='Cliente Test',
            email='cliente@test.com',
            phone='+573012345678',
            address='Calle 85 # 11-53, Chapinero, Bogotá',
            role='customer',
            status='active'
        )
        customer.set_password('cliente123')
        db.session.add(customer)
        
        # Create test technician
        technician = User(
            name='Técnico Test',
            email='tecnico@test.com',
            phone='+573112345678',
            address='Carrera 7 # 100-50, Usaquén, Bogotá',
            role='technician',
            status='active'
        )
        technician.set_password('tecnico123')
        db.session.add(technician)
        
        # Create test admin
        admin = User(
            name='Admin Test',
            email='admin@test.com',
            phone='+573212345678',
            address='Avenida Paseo Diag 127 # 25-75, Suba, Bogotá',
            role='admin',
            status='active'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        db.session.flush()
        
        # Add technician profile with schedule
        tech_profile = TechnicianProfile(
            user_id=technician.id,
            specialties=['plumbing', 'gas', 'heating'],
            rating=4.8,
            bio='Técnico con 10+ años de experiencia',
            available=True,
            schedule={
                'mon': [[9, 17]],
                'tue': [[9, 17]],
                'wed': [[9, 17]],
                'thu': [[9, 17]],
                'fri': [[9, 17]],
                'sat': [[9, 13]],
                'sun': []
            }
        )
        db.session.add(tech_profile)
        
        db.session.commit()
        
        print("✅ Test users created successfully!")
        print("\n📋 Test Credentials:")
        print("=" * 50)
        print("CLIENTE:")
        print("  Email: cliente@test.com")
        print("  Password: cliente123")
        print()
        print("TÉCNICO:")
        print("  Email: tecnico@test.com")
        print("  Password: tecnico123")
        print()
        print("ADMINISTRADOR:")
        print("  Email: admin@test.com")
        print("  Password: admin123")
        print("=" * 50)

if __name__ == '__main__':
    seed_users()
