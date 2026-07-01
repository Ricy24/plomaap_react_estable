import calendar
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from sqlalchemy import func
from app.database.models import User, Appointment, Service
from app.database.extensions import db
from app.utils.decorators import admin_only
from app.utils.validators import validate_role, validate_status, validate_appointment_status
from app.services.appointment_service import validate_appointment_transition

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


def _format_appointment_for_admin(appointment):
    customer = getattr(appointment, 'customer', None)
    technician = getattr(appointment, 'technician', None)
    service = getattr(appointment, 'service', None)
    return {
        'id': appointment.id,
        'status': appointment.status,
        'date': appointment.date.isoformat() if appointment.date else None,
        'dateFormatted': appointment.date.strftime('%d/%m/%Y') if appointment.date else None,
        'time': appointment.time,
        'serviceName': service.name if service else 'Servicio',
        'serviceId': service.id if service else None,
        'technicianName': technician.name if technician else 'Por asignar',
        'technicianId': appointment.technician_id,
        'clientName': customer.name if customer else 'Cliente',
        'clientAvatar': customer.avatar if customer else None,
        'technicianAvatar': technician.avatar if technician else None,
        'notes': appointment.notes,
        'createdAt': appointment.created_at.isoformat() if appointment.created_at else None,
    }


def _build_week_calendar():
    today = datetime.utcnow().date()
    calendar_items = []
    for offset in range(7):
        day = today + timedelta(days=offset)
        count = Appointment.query.filter(Appointment.date == day).count()
        calendar_items.append({
            'date': day.isoformat(),
            'label': day.strftime('%a').capitalize(),
            'dayNum': day.day,
            'isToday': offset == 0,
            'count': count,
        })
    return calendar_items


def _build_monthly_appointments():
    monthly_map = {}
    for appointment in Appointment.query.all():
        if not appointment.date:
            continue
        month_key = appointment.date.strftime('%Y-%m')
        if month_key not in monthly_map:
            monthly_map[month_key] = {
                'month': calendar.month_abbr[appointment.date.month],
                'year': appointment.date.year,
                'total': 0,
                'completed': 0,
            }
        monthly_map[month_key]['total'] += 1
        if appointment.status == 'completed':
            monthly_map[month_key]['completed'] += 1

    return [monthly_map[key] for key in sorted(monthly_map.keys())][-6:]


def _build_service_breakdown():
    rows = (
        db.session.query(
            Service.id,
            Service.name,
            Service.icon,
            func.count(Appointment.id).label('count')
        )
        .join(Appointment, Appointment.service_id == Service.id, isouter=True)
        .group_by(Service.id, Service.name, Service.icon)
        .order_by(func.count(Appointment.id).desc())
        .all()
    )
    return [
        {
            'id': row[0],
            'name': row[1],
            'icon': row[2] or 'fa-screwdriver-wrench',
            'count': row[3],
        }
        for row in rows
    ]

@admin_bp.route('/dashboard', methods=['GET'])
@admin_only
def dashboard():
    """Get admin dashboard stats"""
    total_customers = User.query.filter_by(role='customer').count()
    total_technicians = User.query.filter_by(role='technician').count()
    total_users = User.query.count()

    total_appointments = Appointment.query.count()
    completed_appointments = Appointment.query.filter_by(status='completed').count()
    pending_appointments = Appointment.query.filter_by(status='pending').count()
    scheduled_appointments = Appointment.query.filter_by(status='scheduled').count()
    in_progress_appointments = Appointment.query.filter_by(status='in_progress').count()
    cancelled_appointments = Appointment.query.filter_by(status='cancelled').count()

    revenue_result = db.session.query(func.sum(Service.base_price)).join(
        Appointment, Service.id == Appointment.service_id
    ).filter(Appointment.status == 'completed').scalar()
    total_revenue = float(revenue_result) if revenue_result else 0.0

    from app.database.models import TechnicianProfile
    avg_rating_result = db.session.query(func.avg(TechnicianProfile.rating)).scalar()
    avg_rating = float(avg_rating_result) if avg_rating_result else 0.0

    today = datetime.utcnow().date()
    today_appointments = Appointment.query.filter(Appointment.date == today).all()
    today_completed = sum(1 for apt in today_appointments if apt.status == 'completed')
    today_scheduled = sum(1 for apt in today_appointments if apt.status == 'scheduled')
    today_in_progress = sum(1 for apt in today_appointments if apt.status == 'in_progress')

    recent_appointments = Appointment.query.order_by(Appointment.date.desc(), Appointment.time.desc()).limit(10).all()
    all_appointments = Appointment.query.order_by(Appointment.date.desc(), Appointment.time.desc()).all()

    completion_rate = round((completed_appointments / total_appointments * 100) if total_appointments else 0)

    return jsonify({
        'stats': {
            'totalClients': total_customers,
            'totalTechnicians': total_technicians,
            'totalAppointments': total_appointments,
            'completionRate': completion_rate,
            'inProgressAppointments': in_progress_appointments,
            'scheduledAppointments': scheduled_appointments,
            'cancelledAppointments': cancelled_appointments,
            'todayTotal': len(today_appointments),
            'todayCompleted': today_completed,
            'todayScheduled': today_scheduled,
            'todayInProgress': today_in_progress,
            'revenueEstimate': total_revenue,
            'totalRevenue': total_revenue,
            'avgRating': avg_rating,
        },
        'weekCalendar': _build_week_calendar(),
        'todaySchedule': [
            {
                'id': apt.id,
                'time': apt.time,
                'endTime': apt.time,
                'title': apt.service.name if apt.service else 'Servicio',
                'clientName': apt.customer.name if getattr(apt, 'customer', None) else 'Cliente',
                'technicianName': apt.technician.name if getattr(apt, 'technician', None) else 'Por asignar',
                'status': apt.status,
                'isPrimary': apt.status == 'in_progress',
            }
            for apt in today_appointments
        ],
        'recentAppointments': [_format_appointment_for_admin(apt) for apt in recent_appointments],
        'allAppointments': [_format_appointment_for_admin(apt) for apt in all_appointments],
        'monthlyAppointments': _build_monthly_appointments(),
        'composition': {
            'total': total_users,
            'clients': total_customers,
            'technicians': total_technicians,
        },
        'serviceBreakdown': _build_service_breakdown(),
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
        'recent_appointments': [_format_appointment_for_admin(apt) for apt in recent_appointments],
        'services': [service.to_dict() for service in Service.query.order_by(Service.name).all()],
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
