# PlomApp Backend - Esquema de Implementación

Este documento proporciona esquemas de alto nivel para los archivos principales del backend.

## app.py - Estructura Principal

```python
from flask import Flask, jsonify
from config import config
from extensions import db, jwt, cors
from routes import auth, services, technicians, appointments, admin, health

def create_app(env='development'):
    """Factory para crear aplicación Flask"""
    app = Flask(__name__)
    
    # Configuración
    app.config.from_object(config[env])
    
    # Inicializar extensiones
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    
    # Registrar blueprints
    app.register_blueprint(auth.bp)
    app.register_blueprint(services.bp)
    app.register_blueprint(technicians.bp)
    app.register_blueprint(appointments.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(health.bp)
    
    # Manejadores de errores globales
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': str(error), 'code': 400}), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized', 'code': 401}), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Forbidden', 'code': 403}), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found', 'code': 404}), 404
    
    # Contexto de la aplicación
    with app.app_context():
        db.create_all()  # Crear tablas si no existen
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000, host='0.0.0.0')
```

---

## config.py - Configuración

```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuración base"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_EXPIRATION_HOURS', 24)) * 3600
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    """Configuración para desarrollo"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('MYSQL_USER')}:"
        f"{os.getenv('MYSQL_PASSWORD')}@"
        f"{os.getenv('MYSQL_HOST')}:"
        f"{os.getenv('MYSQL_PORT')}/"
        f"{os.getenv('MYSQL_DB')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')

class ProductionConfig(Config):
    """Configuración para producción"""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hora en producción

class TestingConfig(Config):
    """Configuración para tests"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
```

---

## extensions.py - Inicialización de Extensiones

```python
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate

# Inicializar extensiones (sin aplicación)
db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
migrate = Migrate()

# Configurar JWT
@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    """Cargar usuario desde el payload del JWT"""
    from models import User
    identity = jwt_data["sub"]
    return User.query.get(identity)

@jwt.additional_claims_loader
def add_claims_to_jwt(identity):
    """Agregar claims adicionales al JWT"""
    from models import User
    user = User.query.get(identity)
    if user:
        return {
            "email": user.email,
            "role": user.role,
            "status": user.status
        }
    return {}
```

---

## models.py - Estructura Básica

```python
from extensions import db
from datetime import datetime
from sqlalchemy.dialects.mysql import JSON

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    avatar = db.Column(db.String(500))
    role = db.Column(
        db.Enum('customer', 'technician', 'admin'),
        default='customer',
        nullable=False
    )
    status = db.Column(
        db.Enum('active', 'inactive', 'suspended'),
        default='active',
        nullable=False
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, 
                          onupdate=datetime.utcnow)
    
    # Relaciones
    technician_profile = db.relationship('TechnicianProfile', uselist=False, 
                                        backref='user')
    appointments_as_customer = db.relationship('Appointment', 
                                              foreign_keys='Appointment.user_id',
                                              backref='customer')
    
    def set_password(self, password: str) -> None:
        """Hashear y almacenar contraseña"""
        import bcrypt
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt(12)
        ).decode('utf-8')
    
    def verify_password(self, password: str) -> bool:
        """Verificar contraseña"""
        import bcrypt
        try:
            return bcrypt.checkpw(
                password.encode('utf-8'),
                self.password_hash.encode('utf-8')
            )
        except:
            return False
    
    def to_dict(self, include_sensitive: bool = False) -> dict:
        """Serializar a diccionario"""
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'avatar': self.avatar,
            'role': self.role,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        return data

class TechnicianProfile(db.Model):
    __tablename__ = 'technician_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), 
                       unique=True, nullable=False)
    specialties = db.Column(JSON, default=[])
    rating = db.Column(db.Float, default=0.0)
    bio = db.Column(db.Text)
    schedule = db.Column(JSON)  # {"mon": [[start, end], ...], ...}
    available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                          onupdate=datetime.utcnow)
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'specialties': self.specialties or [],
            'rating': self.rating,
            'bio': self.bio,
            'schedule': self.schedule,
            'available': self.available
        }

class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    icon = db.Column(db.String(255))
    color = db.Column(db.String(7))
    base_price = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                          onupdate=datetime.utcnow)
    
    appointments = db.relationship('Appointment', backref='service')
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'color': self.color,
            'base_price': str(self.base_price),
            'description': self.description
        }

class Appointment(db.Model):
    __tablename__ = 'appointments'
    __table_args__ = (
        db.Index('idx_user_date', 'user_id', 'date'),
        db.Index('idx_technician_date', 'technician_id', 'date'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), 
                       nullable=False, index=True)
    technician_id = db.Column(db.Integer, db.ForeignKey('users.id'), 
                             nullable=True, index=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), 
                          nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    status = db.Column(
        db.Enum('pending', 'scheduled', 'in_progress', 'completed', 'cancelled'),
        default='pending',
        nullable=False
    )
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                          onupdate=datetime.utcnow)
    
    technician_rel = db.relationship('User', 
                                     foreign_keys=[technician_id],
                                     backref='appointments_as_technician')
    
    def to_dict(self, enriched: bool = False) -> dict:
        data = {
            'id': self.id,
            'date': self.date.isoformat(),
            'time': self.time.isoformat(),
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if enriched:
            data['customer'] = self.customer.to_dict()
            data['service'] = self.service.to_dict()
            if self.technician_rel:
                data['technician'] = {
                    'id': self.technician_rel.id,
                    'name': self.technician_rel.name,
                    'phone': self.technician_rel.phone,
                    'rating': self.technician_rel.technician_profile.rating if self.technician_rel.technician_profile else 0
                }
        
        return data

class Device(db.Model):
    __tablename__ = 'devices'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user_agent = db.Column(db.Text)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_access = db.Column(db.DateTime, default=datetime.utcnow,
                           onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref='devices')
```

---

## utils/decorators.py - Decoradores de Autenticación

```python
from functools import wraps
from flask import g, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def jwt_required_custom(f):
    """Verificar JWT válido"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('status') != 'active':
                return jsonify({'error': 'User is not active'}), 403
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid or expired token'}), 401
    return decorated_function

def admin_only(f):
    """Verificar que sea admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def technician_only(f):
    """Verificar que sea técnico"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get('role') != 'technician':
            return jsonify({'error': 'Technician access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def customer_only(f):
    """Verificar que sea cliente"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get('role') != 'customer':
            return jsonify({'error': 'Customer access required'}), 403
        return f(*args, **kwargs)
    return decorated_function
```

---

## routes/auth.py - Ejemplo de Blueprint

```python
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import User, db
from utils.decorators import jwt_required_custom
from utils.validators import validate_email, validate_password

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    """POST /api/auth/login"""
    data = request.get_json()
    
    # Validar entrada
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    # Buscar usuario
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 400
    
    # Verificar contraseña
    if not user.verify_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 400
    
    # Verificar estado
    if user.status != 'active':
        return jsonify({'error': 'User account is not active'}), 403
    
    # Generar token
    token = create_access_token(identity=user.id)
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200

@bp.route('/profile', methods=['GET'])
@jwt_required_custom
def get_profile():
    """GET /api/auth/profile"""
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@bp.route('/profile', methods=['PATCH'])
@jwt_required_custom
def update_profile():
    """PATCH /api/auth/profile"""
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
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
    
    db.session.commit()
    
    return jsonify(user.to_dict()), 200

@bp.route('/logout', methods=['POST'])
@jwt_required_custom
def logout():
    """POST /api/auth/logout"""
    # El logout real se hace eliminando el token en el cliente
    return jsonify({'message': 'Successfully logged out'}), 200
```

---

## requirements.txt

```
Flask==2.3.0
Flask-SQLAlchemy==3.0.0
Flask-Migrate==4.0.0
Flask-JWT-Extended==4.4.0
Flask-CORS==3.0.10
bcrypt==4.0.1
python-dotenv==1.0.0
PyMySQL==1.1.0
cryptography==40.0.0
Werkzeug==2.3.0
```

---

## .gitignore

```
# Entorno virtual
venv/
env/

# Variables de entorno
.env
.env.local

# Archivos de Python
__pycache__/
*.py[cod]
*$py.class
*.so

# Flask
instance/
.webassets-cache

# IDE
.vscode/
.idea/
*.swp
*.swo

# Base de datos
*.db
*.sqlite
*.sqlite3

# Archivos del sistema
.DS_Store
Thumbs.db

# Logs
*.log

# Migraciones (opcional, mantener en git)
# migrations/
```

---

## Notas de Implementación

### Flujo de Autenticación
1. **Login**: Verificar email+password, generar JWT
2. **Protección**: Decorador `@jwt_required_custom` en rutas protegidas
3. **Validación**: Verificar role y status del usuario
4. **Token**: Incluir en requests como `Authorization: Bearer <token>`

### Manejo de Errores
- Siempre retornar código HTTP correcto (400, 401, 403, 404, 500)
- Incluir campo "error" en JSON de error
- No revelar información sensible en errores

### Performance
- Usar índices en búsquedas frecuentes (user_id, technician_id, date)
- Implementar paginación en listados
- Cache de servicios (bajo cambio)

### Testing
- Usar `TestingConfig` con SQLite en memoria
- Fixtures para usuarios de prueba
- Tests para cada endpoint
- Coverage mínimo 80%

---

**Este documento es un esquema de alto nivel. Consultar BACKEND_DESIGN.md para especificaciones completas.**
