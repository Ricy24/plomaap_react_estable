from flask import Flask
from flask_migrate import Migrate
from app.config import config_by_name
from app.database.extensions import db, jwt, cors, migrate, init_jwt_handlers
from app.middlewares.error_handler import register_error_handlers
from app.routes.auth import auth_bp
from app.routes.services import services_bp
from app.routes.technicians import technicians_bp
from app.routes.appointments import appointments_bp
from app.routes.admin import admin_bp
from app.routes.health import health_bp

def create_app(env='development'):
    """Create Flask application"""
    
    # Initialize Flask app
    app = Flask(__name__)
    
    # Load configuration
    config_class = config_by_name.get(env, config_by_name['development'])
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    migrate.init_app(app, db)
    
    # Initialize JWT handlers
    init_jwt_handlers(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(technicians_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(health_bp)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app('development')
    app.run(debug=True, host='0.0.0.0', port=5000)
