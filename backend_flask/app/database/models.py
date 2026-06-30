from datetime import datetime
import bcrypt
from app.database.extensions import db

class User(db.Model):
    """User model for customers, technicians, and admins"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(255))
    avatar = db.Column(db.String(255))
    role = db.Column(db.Enum('customer', 'technician', 'admin'), default='customer', nullable=False)
    status = db.Column(db.Enum('active', 'inactive', 'suspended'), default='active', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    technician_profile = db.relationship('TechnicianProfile', backref='user', uselist=False, foreign_keys='TechnicianProfile.user_id', cascade='all, delete-orphan')
    appointments_as_customer = db.relationship('Appointment', backref='customer', foreign_keys='Appointment.user_id', cascade='all, delete-orphan')
    appointments_as_technician = db.relationship('Appointment', backref='technician', foreign_keys='Appointment.technician_id', cascade='all, delete-orphan')
    devices = db.relationship('Device', backref='user', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        salt = bcrypt.gensalt(rounds=12)
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password):
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'avatar': self.avatar,
            'role': self.role,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def has_role(self, role):
        """Check if user has specific role"""
        return self.role == role
    
    def is_active(self):
        """Check if user is active"""
        return self.status == 'active'

class TechnicianProfile(db.Model):
    """Technician profile details"""
    __tablename__ = 'technician_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False, index=True)
    specialties = db.Column(db.JSON, default=list)  # ['plumbing', 'gas', 'heating']
    rating = db.Column(db.Float, default=0.0)  # 0-5
    bio = db.Column(db.Text)
    schedule = db.Column(db.JSON, default=dict)  # {'mon': [[9,17]], 'tue': [[9,17]], ...}
    available = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'specialties': self.specialties or [],
            'rating': self.rating,
            'bio': self.bio,
            'schedule': self.schedule or {},
            'available': self.available
        }

class Service(db.Model):
    """Service catalog"""
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    icon = db.Column(db.String(255))
    color = db.Column(db.String(7))  # Hex color
    base_price = db.Column(db.Numeric(10, 2), default=0.00)
    description = db.Column(db.Text)
    
    # Relationships
    appointments = db.relationship('Appointment', backref='service')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'color': self.color,
            'base_price': float(self.base_price),
            'description': self.description
        }

class Appointment(db.Model):
    """Appointment schedule"""
    __tablename__ = 'appointments'
    __table_args__ = (
        db.Index('idx_user_date', 'user_id', 'date'),
        db.Index('idx_technician_date', 'technician_id', 'date'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    technician_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(5), nullable=False)  # HH:MM format
    status = db.Column(db.Enum('pending', 'scheduled', 'in_progress', 'completed', 'cancelled'), 
                       default='pending', nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def enrich(self):
        """Return appointment with related data"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'customer': self.customer.to_dict() if hasattr(self, 'customer') and self.customer else None,   
            'technician_id': self.technician_id,
            'technician': self.technician.to_dict() if hasattr(self, 'technician') and self.technician else None,
            'service_id': self.service_id,
            'service': self.service.to_dict() if hasattr(self, 'service') and self.service else None,
            'date': self.date.isoformat() if self.date else None,
            'time': self.time,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_dict(self, enriched=False):
        """Convert to dictionary"""
        if enriched:
            return self.enrich()
        return {
            'id': self.id,
            'user_id': self.user_id,
            'technician_id': self.technician_id,
            'service_id': self.service_id,
            'date': self.date.isoformat() if self.date else None,
            'time': self.time,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Device(db.Model):
    """User device tracking for multi-device support"""
    __tablename__ = 'devices'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user_agent = db.Column(db.String(500))
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_access = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_agent': self.user_agent,
            'registered_at': self.registered_at.isoformat() if self.registered_at else None,
            'last_access': self.last_access.isoformat() if self.last_access else None
        }
