import unittest
from app import create_app


class ApiContractTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.client = self.app.test_client()

    def test_login_returns_frontend_compatible_payload(self):
        with self.app.app_context():
            from app.database.models import User
            from app.database.extensions import db

            user = User(name='Test User', email='test@example.com', role='customer')
            user.set_password('Password123!')
            db.session.add(user)
            db.session.commit()

        response = self.client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'Password123!'
        })

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertTrue(payload['success'])
        self.assertIn('token', payload)
        self.assertIn('user', payload)
        self.assertEqual(payload['user']['email'], 'test@example.com')

    def test_register_returns_frontend_compatible_payload(self):
        response = self.client.post('/api/auth/register', json={
            'name': 'New User',
            'email': 'new@example.com',
            'password': 'Password123!'
        })

        self.assertEqual(response.status_code, 201)
        payload = response.get_json()
        self.assertTrue(payload['success'])
        self.assertIn('token', payload)
        self.assertIn('user', payload)
        self.assertEqual(payload['user']['email'], 'new@example.com')

    def test_create_appointment_accepts_frontend_payload(self):
        with self.app.app_context():
            from app.database.models import User, Service
            from app.database.extensions import db

            customer = User(name='Customer', email='customer@example.com', role='customer')
            customer.set_password('Password123!')
            technician = User(name='Tech', email='tech@example.com', role='technician')
            technician.set_password('Password123!')
            service = Service(name='Plumbing', base_price=100.0)
            db.session.add_all([customer, technician, service])
            db.session.commit()

            from app.utils.jwt_utils import generate_token
            self.token = generate_token(customer.id)

        response = self.client.post('/api/appointments', headers={'Authorization': f'Bearer {self.token}'}, json={
            'serviceId': service.id,
            'date': '2026-07-01',
            'time': '10:00'
        })

        self.assertEqual(response.status_code, 201)
        payload = response.get_json()
        self.assertIn('appointment', payload)
        self.assertEqual(payload['appointment']['service_id'], service.id)

    def test_slots_endpoint_returns_available_slots_for_technician(self):
        with self.app.app_context():
            from app.database.models import User, TechnicianProfile
            from app.database.extensions import db

            technician = User(name='Slot Tech', email='slot-tech@example.com', role='technician')
            technician.set_password('Password123!')
            db.session.add(technician)
            db.session.flush()
            db.session.add(TechnicianProfile(user_id=technician.id, schedule={'mon': [[9, 17]]}, available=True))
            db.session.commit()
            technician_id = technician.id

        response = self.client.get(f'/api/technicians/slots?date=2026-07-06&technician_id={technician_id}')

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertIn('slots', payload)
        self.assertTrue(payload['slots'])


if __name__ == '__main__':
    unittest.main()
