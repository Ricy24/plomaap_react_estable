from app import create_app
from app.database.extensions import db
from app.database.models import Service

# Creamos la aplicación para tener acceso a la base de datos
app = create_app()

def seed_services():
    with app.app_context():
        # Verificamos si ya hay servicios para no duplicarlos
        if Service.query.first():
            print("⚠️ Los servicios ya existen en la base de datos.")
            return

        print("🚀 Inyectando servicios a la base de datos...")

        servicios = [
            Service(
                name="Fugas de agua",
                description="Goteras, tuberías, llaves",
                icon="fa-droplet",
                color="water",
                base_price=80000
            ),
            Service(
                name="Destapes",
                description="Baños, cocinas, cañerías",
                icon="fa-toilet",
                color="drain",
                base_price=60000
            ),
            Service(
                name="Duchas y baños",
                description="Grifería, sanitarios, mamparas",
                icon="fa-shower",
                color="shower",
                base_price=90000
            ),
            Service(
                name="Instalaciones",
                description="Lavaplatos, calentadores, tubería",
                icon="fa-wrench",
                color="pipe",
                base_price=120000
            )
        ]

        db.session.bulk_save_objects(servicios)
        db.session.commit()
        
        print("✅ ¡Servicios agregados con éxito!")

if __name__ == '__main__':
    seed_services()