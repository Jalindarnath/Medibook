import os
import sys
import pytest

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app, seed_database
from database import db
from models import User, Appointment

@pytest.fixture(scope='session')
def app():
    """Create Flask application instance for testing."""
    os.environ['FLASK_ENV'] = 'testing'
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SECRET_KEY': 'test-secret-key-stqa-testing'
    })

    with app.app_context():
        db.create_all()
        seed_database()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture(scope='function')
def client(app):
    """Flask test client."""
    return app.test_client()

@pytest.fixture(scope='function')
def admin_headers(client):
    """Login as default admin and return Authorization headers."""
    res = client.post('/api/auth/login', json={
        'email': 'admin@medibook.com',
        'password': 'AdminPassword123!'
    })
    token = res.get_json()['token']
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture(scope='function')
def patient_headers(client):
    """Login as default patient and return Authorization headers."""
    res = client.post('/api/auth/login', json={
        'email': 'patient@medibook.com',
        'password': 'Patient123!'
    })
    token = res.get_json()['token']
    return {'Authorization': f'Bearer {token}'}

