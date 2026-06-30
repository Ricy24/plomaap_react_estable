from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from app.database.models import User, TechnicianProfile, Appointment
from app.database.extensions import db
from app.utils.decorators import jwt_required_custom, technician_only
from app.utils.validators import validate_appointment_status
from app.services.appointment_service import get_available_time_slots, validate_appointment_transition

technicians_bp = Blueprint('technicians', __name__, url_prefix='/api/technicians')

@technicians_bp.route('', methods=['GET'])
def list_technicians():
    """List all active technicians"""
    specialty = request.args.get('specialty', default='', type=str)
    limit = request.args.get('limit', default=20, type=int)
    offset = request.args.get('offset', default=0, type=int)
    
    if limit > 100:
        limit = 100
    
    query = User.query.filter(User.role == 'technician', User.status == 'active')
    
    technicians = query.limit(limit).offset(offset).all()
    
    result = []
    for tech in technicians:
        tech_dict = tech.to_dict()
        if tech.technician_profile:
            tech_dict['profile'] = tech.technician_profile.to_dict()
        result.append(tech_dict)
    
    return jsonify({'technicians': result}), 200

@technicians_bp.route('/available', methods=['GET'])
def available_technicians():
    """Get available technicians for date/time/service"""
    date_str = request.args.get('date')
    time_str = request.args.get('time')
    service_id = request.args.get('service_id', type=int)
    
    if not date_str or not time_str or not service_id:
        return jsonify({'error': 'date, time, and service_id are required'}), 400
    
    # Find technicians with availability
    technicians = User.query.filter(
        User.role == 'technician',
        User.status == 'active'
    ).all()
    
    available = []
    for tech in technicians:
        profile = tech.technician_profile
        if not profile or not profile.available:
            continue
        
        # Check for conflicts
        conflict = Appointment.query.filter(
            Appointment.technician_id == tech.id,
            Appointment.date == date_str,
            Appointment.time == time_str,
            Appointment.status.in_(['pending', 'scheduled', 'in_progress'])
        ).first()
        
        if not conflict:
            tech_dict = tech.to_dict()
            tech_dict['profile'] = profile.to_dict()
            available.append(tech_dict)
    
    # Sort by rating
    available.sort(key=lambda x: x['profile']['rating'], reverse=True)
    
    return jsonify({'technicians': available}), 200

@technicians_bp.route('/slots', methods=['GET'])
def available_slots():
    """Get available time slots for technician on specific date"""
    technician_id = request.args.get('technician_id', type=int)
    date_str = request.args.get('date')
    
    if not technician_id or not date_str:
        return jsonify({'error': 'technician_id and date are required'}), 400
    
    slots = get_available_time_slots(technician_id, date_str)
    
    return jsonify({'slots': slots}), 200

@technicians_bp.route('/profile', methods=['GET'])
@technician_only
def get_technician_profile():
    """Get authenticated technician's profile"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    profile_dict = user.to_dict()
    if user.technician_profile:
        profile_dict['profile'] = user.technician_profile.to_dict()
    
    return jsonify(profile_dict), 200

@technicians_bp.route('/appointments', methods=['GET'])
@technician_only
def technician_appointments():
    """Get technician's appointments"""
    user_id = get_jwt_identity()
    date_filter = request.args.get('date')
    status_filter = request.args.get('status')
    
    query = Appointment.query.filter(Appointment.technician_id == user_id)
    
    if date_filter:
        query = query.filter(Appointment.date == date_filter)
    
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    
    appointments = query.all()
    
    return jsonify({
        'appointments': [apt.enrich() for apt in appointments]
    }), 200

@technicians_bp.route('/appointments/<int:appointment_id>', methods=['PATCH'])
@technician_only
def update_appointment_status(appointment_id):
    """Update appointment status (technician only)"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    if appointment.technician_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if 'status' in data:
        new_status = data['status']
        
        if not validate_appointment_status(new_status):
            return jsonify({'error': 'Invalid status'}), 400
        
        if not validate_appointment_transition(appointment.status, new_status):
            return jsonify({'error': f'Cannot transition from {appointment.status} to {new_status}'}), 400
        
        appointment.status = new_status
    
    db.session.commit()
    
    return jsonify(appointment.enrich()), 200
