from datetime import datetime
from app.database.models import User, Appointment


def _normalize_schedule(schedule):
    if not schedule:
        return {}
    normalized = {}
    for day, ranges in schedule.items():
        if not ranges:
            continue
        normalized[day.lower()] = []
        for item in ranges:
            if isinstance(item, (list, tuple)) and len(item) == 2:
                start, end = item
                try:
                    normalized[day.lower()].append([int(start), int(end)])
                except (TypeError, ValueError):
                    continue
    return normalized


def find_available_technician(date_str, time_str, service_id, exclude_technician_id=None):
    """Find available technician for given date/time/service."""
    try:
        appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        appointment_time = datetime.strptime(time_str, '%H:%M').time()
    except (ValueError, TypeError):
        return None

    technicians = User.query.filter(
        User.role == 'technician',
        User.status == 'active'
    ).all()

    available = []

    for tech in technicians:
        if exclude_technician_id and tech.id == exclude_technician_id:
            continue

        profile = tech.technician_profile
        if not profile or not profile.available:
            continue

        day_name = appointment_date.strftime('%a').lower()
        schedule = _normalize_schedule(profile.schedule or {})
        if day_name not in schedule:
            continue

        is_within_schedule = False
        for start_hour, end_hour in schedule[day_name]:
            if start_hour <= appointment_time.hour < end_hour:
                is_within_schedule = True
                break

        if not is_within_schedule:
            continue

        conflict = Appointment.query.filter(
            Appointment.technician_id == tech.id,
            Appointment.date == appointment_date,
            Appointment.time == time_str,
            Appointment.status.in_(['pending', 'scheduled', 'in_progress'])
        ).first()

        if conflict:
            continue

        available.append({
            'technician': tech,
            'rating': profile.rating or 0
        })

    available.sort(key=lambda x: x['rating'], reverse=True)
    return available[0]['technician'] if available else None


def get_available_time_slots(technician_id, date_str):
    """Get available time slots for technician on specific date."""
    try:
        appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return []

    tech = User.query.get(technician_id)
    if not tech or tech.role != 'technician':
        return []

    profile = tech.technician_profile
    if not profile:
        return []

    day_name = appointment_date.strftime('%a').lower()
    schedule = _normalize_schedule(profile.schedule or {})

    if day_name not in schedule:
        return []

    slots = []
    for start_hour, end_hour in schedule[day_name]:
        current_hour = start_hour
        while current_hour < end_hour:
            slot_time = f"{int(current_hour):02d}:00"
            conflict = Appointment.query.filter(
                Appointment.technician_id == technician_id,
                Appointment.date == appointment_date,
                Appointment.time == slot_time,
                Appointment.status.in_(['pending', 'scheduled', 'in_progress'])
            ).first()

            if not conflict:
                slots.append(slot_time)

            current_hour += 1

    return slots

def validate_appointment_transition(current_status, new_status):
    """Validate appointment status transitions"""
    valid_transitions = {
        'pending': ['scheduled', 'cancelled'],
        'scheduled': ['in_progress', 'cancelled'],
        'in_progress': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': []
    }
    
    return new_status in valid_transitions.get(current_status, [])
