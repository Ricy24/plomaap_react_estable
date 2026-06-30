from flask import jsonify, request
from app.database.models import User, TechnicianProfile
from app.database.extensions import db
from app.utils.validators import validate_email, validate_password, validate_name
from app.utils.jwt_utils import generate_token

def login():
    """Handle user login"""
    data = request.get_json() or {}
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.verify_password(data['password']):
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    
    if user.status != 'active':
        return jsonify({'success': False, 'message': 'Account is not active'}), 401
    
    token = generate_token(user.id)
    return jsonify({
        'success': True,
        'message': 'Inicio de sesión correcto',
        'token': token,
        'user': user.to_dict()
    }), 200
    

def register():
    """Handle user registration"""
    data = request.get_json() or {}
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    # Validation
    if not validate_email(data.get('email')):
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400
    
    if not validate_password(data.get('password')):
        return jsonify({'success': False, 'message': 'Password must be at least 8 characters'}), 400
    
    if not validate_name(data.get('name')):
        return jsonify({'success': False, 'message': 'Name must be at least 2 characters'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'message': 'Email already registered'}), 409
    
    # Create user
    user = User(
        name=data['name'],
        email=data['email'],
        role=data.get('role', 'customer'),
        phone=data.get('phone'),
        address=data.get('address')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.flush()  # Get user ID before commit
    
    # Create technician profile if role is technician
    if user.role == 'technician':
        profile = TechnicianProfile(
            user_id=user.id,
            specialties=data.get('specialties', [])
        )
        db.session.add(profile)
    
    db.session.commit()
    
    token = generate_token(user.id)
    return jsonify({
        'success': True,
        'message': 'Registro exitoso',
        'token': token,
        'user': user.to_dict()
    }), 201

def get_profile(user_id):
    """Get user profile"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

def update_profile(user_id):
    """Update user profile"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data and validate_name(data['name']):
        user.name = data['name']
    
    if 'phone' in data:
        user.phone = data['phone']
    
    if 'address' in data:
        user.address = data['address']
    
    if 'avatar' in data:
        user.avatar = data['avatar']
    
    db.session.commit()
    
    return jsonify(user.to_dict()), 200

def forgot_password():
    """Handle password recovery"""
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        # Don't reveal if user exists
        return jsonify({'success': True, 'message': 'If email exists, recovery link has been sent'}), 200
    
    # TODO: Send recovery email with reset token
    
    return jsonify({'success': True, 'message': 'Recovery link sent to email'}), 200
