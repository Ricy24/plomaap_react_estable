from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate

db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
migrate = Migrate()

def init_jwt_handlers(app):
    """Configure JWT user lookup and claims"""
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        from app.database.models import User
        # Convertimos a string por seguridad, ya que el token guarda el ID como string
        identity = str(jwt_data["sub"])
        return User.query.get(identity)

    @jwt.additional_claims_loader
    def add_claims_to_jwt(identity):
        # Solo agregamos claims extras, NO sobrescribas "sub"
        return {"role": "customer"} # O la lógica que prefieras