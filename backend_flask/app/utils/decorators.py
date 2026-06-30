from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.database.models import User

def jwt_required_custom(fn):
    """Custom JWT requirement decorator that checks user status"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Al quitar el try-except, Flask manejará los errores de token correctamente
        verify_jwt_in_request()
        
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.status != 'active':
            return jsonify({'error': 'Unauthorized', 'message': 'User account is not active'}), 401
        
        return fn(*args, **kwargs)
    
    return wrapper

def admin_only(fn):
    """Decorator to restrict access to admin users only"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'admin' or user.status != 'active':
            return jsonify({'error': 'Forbidden', 'message': 'Admin access required'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper

def technician_only(fn):
    """Decorator to restrict access to technician users only"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'technician' or user.status != 'active':
            return jsonify({'error': 'Forbidden', 'message': 'Technician access required'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper

def customer_only(fn):
    """Decorator to restrict access to customer users only"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'customer' or user.status != 'active':
            return jsonify({'error': 'Forbidden', 'message': 'Customer access required'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper