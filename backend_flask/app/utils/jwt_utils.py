from flask_jwt_extended import create_access_token, get_jwt_identity

def generate_token(user_id):
    """Generate JWT token for user"""
    # Convertimos el user_id a string para cumplir con el estándar JWT
    return create_access_token(identity=str(user_id))

def get_current_user_id():
    """Get current user ID from JWT"""
    return get_jwt_identity()   