from flask import Blueprint, jsonify, request
from sqlalchemy import func
from app.database.models import User, Appointment, Service
from app.database.extensions import db
from app.utils.decorators import admin_only
from app.utils.validators import validate_role, validate_status, validate_appointment_status
from app.services.appointment_service import validate_appointment_transition

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/dashboard', methods=['GET'])
@admin_only
def dashboard():
    """Get admin dashboard stats"""
    # Count users by role
    total_customers = User.query.filter_by(role='customer').count()
    total_technicians = User.query.filter_by(role='technician').count()
    total_users = User.query.count()
    
    # Appointment stats
    total_appointments = Appointment.query.count()
    completed_appointments = Appointment.query.filter_by(status='completed').count()
    pending_appointments = Appointment.query.filter_by(status='pending').count()
    
    # Revenue calculation (sum of base_price for completed appointments)
    revenue_result = db.session.query(func.sum(Service.base_price)).join(
        Appointment, Service.id == Appointment.service_id
    ).filter(Appointment.status == 'completed').scalar()
    
    total_revenue = float(revenue_result) if revenue_result else 0.0
    
    # Average rating
    from app.database.models import TechnicianProfile
    avg_rating_result = db.session.query(func.avg(TechnicianProfile.rating)).scalar()
    avg_rating = float(avg_rating_result) if avg_rating_result else 0.0
    
    # Recent appointments
    recent_appointments = Appointment.query.order_by(Appointment.created_at.desc()).limit(10).all()
    
    return jsonify({
        'users': {
            'total': total_users,
            'customers': total_customers,
            'technicians': total_technicians
        },
        'appointments': {
            'total': total_appointments,
            'completed': completed_appointments,
            'pending': pending_appointments
        },
        'revenue': total_revenue,
        'avg_rating': avg_rating,
        'recent_appointments': [apt.enrich() for apt in recent_appointments]
    }), 200

@admin_bp.route('/users', methods=['GET'])
@admin_only
def list_users():
    """List all users with filters"""
    role_filter = request.args.get('role')
    status_filter = request.args.get('status')
    search = request.args.get('search', default='', type=str)
    limit = request.args.get('limit', default=20, type=int)
    offset = request.args.get('offset', default=0, type=int)
    
    if limit > 100:
        limit = 100
    
    query = User.query
    
    if role_filter and validate_role(role_filter):
        query = query.filter_by(role=role_filter)
    
    if status_filter and validate_status(status_filter):
        query = query.filter_by(status=status_filter)
    
    if search:
        query = query.filter(
            (User.name.ilike(f'%{search}%')) | (User.email.ilike(f'%{search}%'))
        )
    
    users = query.limit(limit).offset(offset).all()
    total = query.count()
    
    return jsonify({
        'users': [user.to_dict() for user in users],
        'total': total,
        'limit': limit,
        'offset': offset
    }), 200

@admin_bp.route('/users', methods=['POST'])
@admin_only
def create_user():
    """Create new user (admin only)"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'email and password are required'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
    
    user = User(
        name=data.get('name', 'New User'),
        email=data['email'],
        role=data.get('role', 'customer'),
        phone=data.get('phone'),
        address=data.get('address'),
        status=data.get('status', 'active')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201

@admin_bp.route('/users/<int:user_id>', methods=['PATCH'])
@admin_only
def update_user(user_id):
    """Update user"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        user.name = data['name']
    
    if 'phone' in data:
        user.phone = data['phone']
    
    if 'address' in data:
        user.address = data['address']
    
    if 'avatar' in data:
        user.avatar = data['avatar']
    
    if 'role' in data and validate_role(data['role']):
        user.role = data['role']
    
    if 'status' in data and validate_status(data['status']):
        user.status = data['status']
    
    db.session.commit()
    
    return jsonify(user.to_dict()), 200

@admin_bp.route('/appointments/<int:appointment_id>', methods=['PATCH'])
@admin_only
def update_appointment(appointment_id):
    """Update appointment (admin only)"""
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    data = request.get_json()
    
    if 'status' in data:
        if not validate_appointment_status(data['status']):
            return jsonify({'error': 'Invalid status'}), 400
        if not validate_appointment_transition(appointment.status, data['status']):
            return jsonify({'error': f'Cannot transition from {appointment.status} to {data["status"]}'}), 400
        appointment.status = data['status']
    
    if 'technician_id' in data:
        appointment.technician_id = data['technician_id']
    
    if 'date' in data:
        appointment.date = data['date']
    
    if 'time' in data:
        appointment.time = data['time']
    
    if 'notes' in data:
        appointment.notes = data['notes']
    
    db.session.commit()
    
    return jsonify(appointment.enrich()), 200
