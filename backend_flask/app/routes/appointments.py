from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from app.database.models import Appointment, Service, User
from app.database.extensions import db
from app.utils.decorators import jwt_required_custom, admin_only
from app.utils.validators import validate_appointment_status, validate_date_time
from app.services.appointment_service import find_available_technician, validate_appointment_transition

appointments_bp = Blueprint('appointments', __name__, url_prefix='/api/appointments')

@appointments_bp.route('', methods=['GET'])
@jwt_required_custom
def list_appointments():
    """List appointments based on user role"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    date_filter = request.args.get('date')
    status_filter = request.args.get('status')
    
    # Determine what appointments to show based on role
    if user.role == 'customer':
        query = Appointment.query.filter(Appointment.user_id == user_id)
    elif user.role == 'technician':
        query = Appointment.query.filter(Appointment.technician_id == user_id)
    elif user.role == 'admin':
        query = Appointment.query
    else:
        return jsonify({'error': 'Invalid user role'}), 403
    
    if date_filter:
        query = query.filter(Appointment.date == date_filter)
    
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    
    appointments = query.all()
    
    return jsonify({
        'appointments': [apt.to_dict(enriched=True) for apt in appointments]
    }), 200

@appointments_bp.route('/<int:appointment_id>', methods=['GET'])
@jwt_required_custom
def get_appointment(appointment_id):
    """Get single appointment details"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    # Check permissions
    if user.role == 'customer' and appointment.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    elif user.role == 'technician' and appointment.technician_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(appointment.to_dict(enriched=True)), 200

@appointments_bp.route('', methods=['POST'])
@jwt_required_custom
def create_appointment():
    """Create new appointment"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'customer':
        return jsonify({'error': 'Only customers can create appointments'}), 403
    
    data = request.get_json() or {}
    
    service_id = data.get('service_id') or data.get('serviceId')
    date_value = data.get('date')
    time_value = data.get('time')
    
    # Validate required fields
    if not service_id or not date_value or not time_value:
        return jsonify({'success': False, 'message': 'service_id, date, and time are required'}), 400
    
    # Validate date and time format
    if not validate_date_time(date_value, time_value):
        return jsonify({'success': False, 'message': 'Invalid date or time format'}), 400
    
    # Check service exists
    service = Service.query.get(int(service_id)) if str(service_id).isdigit() else None
    if not service:
        return jsonify({'success': False, 'message': 'Service not found'}), 404
    
    supplied_technician_id = data.get('technician_id') or data.get('technicianId')
    technician = None
    if supplied_technician_id:
        technician = User.query.get(int(supplied_technician_id)) if str(supplied_technician_id).isdigit() else None
    if not technician:
        technician = find_available_technician(date_value, time_value, service.id)
    
    appointment = Appointment(
        user_id=user_id,
        technician_id=technician.id if technician else None,
        service_id=service.id,
        date=date_value,
        time=time_value,
        status='pending' if not technician else 'scheduled',
        notes=data.get('notes')
    )
    
    db.session.add(appointment)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Appointment created', 'appointment': appointment.to_dict(enriched=True)}), 201

@appointments_bp.route('/<int:appointment_id>', methods=['PATCH'])
@jwt_required_custom
def update_appointment(appointment_id):
    """Update appointment"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    # Check permissions
    if user.role == 'customer' and appointment.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json() or {}
    
    # Update based on role
    if user.role == 'customer':
        # Customers can only cancel pending appointments
        if 'status' in data:
            if appointment.status != 'pending':
                return jsonify({'success': False, 'message': 'Can only cancel pending appointments'}), 400
            appointment.status = 'cancelled'
    else:
        # Admins can update more fields
        if 'status' in data:
            if not validate_appointment_status(data['status']):
                return jsonify({'success': False, 'message': 'Invalid status'}), 400
            if not validate_appointment_transition(appointment.status, data['status']):
                return jsonify({'success': False, 'message': f'Cannot transition from {appointment.status} to {data["status"]}'}), 400
            appointment.status = data['status']
        
        if 'technician_id' in data or 'technicianId' in data:
            appointment.technician_id = data.get('technician_id') or data.get('technicianId')
        
        if 'date' in data:
            appointment.date = data['date']
        
        if 'time' in data:
            appointment.time = data['time']
        
        if 'notes' in data:
            appointment.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Appointment updated', 'appointment': appointment.to_dict(enriched=True)}), 200
