from app import create_app
from app.database.extensions import db
from app.database.models import User, TechnicianProfile

# Creamos la aplicación para tener acceso a la base de datos
app = create_app()

def seed_technicians():
    with app.app_context():
        # Verificamos si ya hay técnicos para no duplicarlos
        if User.query.filter_by(role='technician').first():
            print("⚠️ Los técnicos ya existen en la base de datos.")
            return

        print("🚀 Inyectando técnicos a la base de datos...")

        # --- PASO 1: Crear los Usuarios (Técnicos) ---
        tech1 = User(
            name="Carlos Plomero",
            email="carlos@plomaap.com",
            phone="3001234567",
            address="Bogotá, Zona Norte",
            role="technician",
            status="active"
        )
        tech1.set_password("123456") # Contraseña por defecto para pruebas

        tech2 = User(
            name="Roberto Destapes",
            email="roberto@plomaap.com",
            phone="3109876543",
            address="Bogotá, Zona Sur",
            role="technician",
            status="active"
        )
        tech2.set_password("123456")

        # Guardamos los usuarios en la base de datos para que se generen sus IDs
        db.session.add_all([tech1, tech2])
        db.session.commit()

        print("👤 Usuarios de técnicos creados. Generando perfiles...")

        # --- PASO 2: Crear sus Perfiles de Técnico ---
        # El horario estándar de lunes a viernes de 9am a 5pm
        horario_base = {
            'mon': [[9, 17]], 'tue': [[9, 17]], 'wed': [[9, 17]],
            'thu': [[9, 17]], 'fri': [[9, 17]]
        }

        profile1 = TechnicianProfile(
            user_id=tech1.id, # Enlazamos con el usuario recién creado
            specialties=["Fugas de agua", "Duchas y baños"],
            rating=4.8,
            bio="Especialista en fugas y grifería fina con más de 10 años de experiencia.",
            schedule=horario_base,
            available=True
        )

        profile2 = TechnicianProfile(
            user_id=tech2.id,
            specialties=["Destapes", "Instalaciones"],
            rating=4.9,
            bio="Experto en tuberías complejas y destapes con maquinaria especializada.",
            schedule=horario_base,
            available=True
        )

        # Guardamos los perfiles
        db.session.add_all([profile1, profile2])
        db.session.commit()

        print("✅ ¡Técnicos y sus perfiles agregados con éxito!")

if __name__ == '__main__':
    seed_technicians()#