from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from app.database.models import User, TechnicianProfile
from app.database.extensions import db
from app.utils.decorators import jwt_required_custom
from app.utils.validators import validate_email, validate_password, validate_name
from app.utils.jwt_utils import generate_token
from app.controllers.auth_controller import login, register, get_profile, update_profile, forgot_password
from google.oauth2 import id_token
import os
from google.auth.transport import requests as google_requests
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/google-login', methods=['POST'])
def google_login():
    """POST /api/auth/google-login"""
    data = request.get_json()
    token = data.get('credential')
    
    if not token:
        return jsonify({'error': 'Token missing'}), 400
        
    try:
        # 1. Leer el Client ID desde el archivo .env
        CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
        
        # Validación de seguridad por si olvidas ponerlo en el .env
        if not CLIENT_ID:
            return jsonify({'error': 'Server configuration error'}), 500
            
        # 2. Usar el CLIENT_ID dinámico
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)
        
        user_email = idinfo['email']
        user = User.query.filter_by(email=user_email).first()
        
        if not user:
            user = User(
                name=idinfo.get('name') or user_email.split('@')[0],
                email=user_email,
                role='customer',
                phone=None,
                address=None,
                avatar=idinfo.get('picture')
            )
            user.set_password(os.getenv('GOOGLE_DEFAULT_PASSWORD', 'GoogleAuth123!'))
            db.session.add(user)
            db.session.commit()
            
        if user.status != 'active':
            return jsonify({'error': 'User account is not active'}), 403
            
        access_token = generate_token(user.id)
        
        return jsonify({
            'token': access_token,
            'user': user.to_dict()
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid Google token'}), 401

        
@auth_bp.route('/login', methods=['POST'])
def login_route():
    """Login endpoint"""
    return login()

@auth_bp.route('/register', methods=['POST'])
def register_route():
    """Register endpoint"""
    return register()

@auth_bp.route('/profile', methods=['GET'])
@jwt_required_custom
def profile_get():
    """Get user profile"""
    user_id = get_jwt_identity()
    return get_profile(user_id)

@auth_bp.route('/profile', methods=['PATCH'])
@jwt_required_custom
def profile_update():
    """Update user profile"""
    user_id = get_jwt_identity()
    return update_profile(user_id)

@auth_bp.route('/logout', methods=['POST'])
@jwt_required_custom
def logout():
    """Logout endpoint"""
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password_route():
    """Forgot password endpoint"""
    return forgot_password()
