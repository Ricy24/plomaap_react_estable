from flask import Blueprint, jsonify, request
from app.database.models import Service
from app.database.extensions import db

services_bp = Blueprint('services', __name__, url_prefix='/api/services')

@services_bp.route('', methods=['GET'])
def list_services():
    """List all services with pagination and search"""
    limit = request.args.get('limit', default=20, type=int)
    offset = request.args.get('offset', default=0, type=int)
    search = request.args.get('search', default='', type=str)
    
    # Limit max results
    if limit > 100:
        limit = 100
    
    query = Service.query
    
    if search:
        query = query.filter(Service.name.ilike(f'%{search}%'))
    
    services = query.limit(limit).offset(offset).all()
    total = query.count()
    
    return jsonify({
        'services': [service.to_dict() for service in services],
        'total': total,
        'limit': limit,
        'offset': offset
    }), 200

@services_bp.route('/<int:service_id>', methods=['GET'])
def get_service(service_id):
    """Get single service by ID"""
    service = Service.query.get(service_id)
    
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    
    return jsonify(service.to_dict()), 200
