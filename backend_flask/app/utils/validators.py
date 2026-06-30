import re
from datetime import datetime

EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
PHONE_REGEX = r'^\+?1?\d{9,15}$'

def validate_email(email):
    """Validate email format"""
    if not email or not isinstance(email, str):
        return False
    return re.match(EMAIL_REGEX, email) is not None

def validate_password(password):
    """Validate password (minimum 8 characters)"""
    if not password or not isinstance(password, str):
        return False
    return len(password) >= 8

def validate_phone(phone):
    """Validate phone format"""
    if not phone or not isinstance(phone, str):
        return False
    return re.match(PHONE_REGEX, phone) is not None

def validate_name(name):
    """Validate name (minimum 2 characters)"""
    if not name or not isinstance(name, str):
        return False
    return len(name.strip()) >= 2

def validate_date_time(date_str, time_str):
    """Validate date (YYYY-MM-DD) and time (HH:MM) formats"""
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        datetime.strptime(time_str, '%H:%M')
        return True
    except (ValueError, TypeError):
        return False

def validate_role(role):
    """Validate user role"""
    return role in ['customer', 'technician', 'admin']

def validate_status(status):
    """Validate user status"""
    return status in ['active', 'inactive', 'suspended']

def validate_appointment_status(status):
    """Validate appointment status"""
    return status in ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']
