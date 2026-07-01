import os

from app import create_app
from app.database.extensions import db
from app.database.models import User

# Creamos la aplicación para tener acceso a la base de datos
app = create_app()

DEFAULT_ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@plomapp.com')
DEFAULT_ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'Admin123!')
DEFAULT_ADMIN_NAME = os.getenv('ADMIN_NAME', 'Administrador Principal')


def seed_admin():
    with app.app_context():
        admin = User.query.filter_by(email=DEFAULT_ADMIN_EMAIL).first()
        if not admin:
            admin = User.query.filter_by(role='admin').first()

        if admin:
            admin.name = DEFAULT_ADMIN_NAME
            admin.email = DEFAULT_ADMIN_EMAIL
            admin.role = 'admin'
            admin.status = 'active'
            admin.set_password(DEFAULT_ADMIN_PASSWORD)
            db.session.commit()
            print(f"✅ Administrador listo: {DEFAULT_ADMIN_EMAIL} / {DEFAULT_ADMIN_PASSWORD}")
            return

        print("🚀 Creando usuario administrador...")

        admin = User(
            name=DEFAULT_ADMIN_NAME,
            email=DEFAULT_ADMIN_EMAIL,
            phone="3000000000",
            address="Oficina Central",
            role="admin",
            status="active"
        )

        admin.set_password(DEFAULT_ADMIN_PASSWORD)

        db.session.add(admin)
        db.session.commit()

        print(f"✅ Administrador creado: {DEFAULT_ADMIN_EMAIL} / {DEFAULT_ADMIN_PASSWORD}")

if __name__ == '__main__':
    seed_admin()#
