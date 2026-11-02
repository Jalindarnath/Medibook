import os
from datetime import datetime, date, timedelta, timezone
from flask import Flask, jsonify
from flask_cors import CORS
from database import db
from models import User, Appointment
from routes.auth import auth_bp
from routes.appointments import appointments_bp
from routes.admin import admin_bp

def create_app():
    app = Flask(__name__)

    # Directory for SQLite database
    instance_dir = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance')
    os.makedirs(instance_dir, exist_ok=True)
    db_path = os.path.join(instance_dir, 'medibook.db')

    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Configure CORS for local React development server
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "*"]}}, supports_credentials=True)

    db.init_app(app)

    # Register API Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(appointments_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'app': 'MediBook API'
        }), 200

    return app

def seed_database():
    """Initializes tables and seeds default admin and sample test data if needed."""
    db.create_all()

    # 1. Check or create Admin User
    admin = User.query.filter_by(email='admin@medibook.com').first()
    if not admin:
        admin = User(
            full_name='Dr. Rajesh Kulkarni (Admin)',
            email='admin@medibook.com',
            phone='9876543210',
            role='admin'
        )
        admin.set_password('AdminPassword123!')
        db.session.add(admin)
        db.session.commit()
        print("Default admin user created: admin@medibook.com / AdminPassword123!")

    # 2. Check or create Test Patient User
    patient = User.query.filter_by(email='patient@medibook.com').first()
    if not patient:
        patient = User(
            full_name='Aarav Deshmukh',
            email='patient@medibook.com',
            phone='9123456780',
            role='patient'
        )
        patient.set_password('Patient123!')
        db.session.add(patient)
        db.session.commit()
        print("Sample patient user created: patient@medibook.com / Patient123!")

    # 3. Seed Sample Appointments for realistic dashboards if none exist
    if Appointment.query.count() == 0 and patient:
        today = date.today()
        tomorrow = today + timedelta(days=1)
        next_week = today + timedelta(days=5)
        past_date = today - timedelta(days=3)

        sample_appointments = [
            Appointment(
                id='MB-10101',
                user_id=patient.id,
                patient_name='Aarav Deshmukh',
                phone='9123456780',
                category='Cardiology',
                doctor='Dr. Milind Kadam (Cardiologist)',
                appointment_date=tomorrow.strftime('%Y-%m-%d'),
                appointment_time='10:00 AM',
                reason='Routine cardiovascular health checkup and blood pressure monitoring.',
                status='confirmed'
            ),
            Appointment(
                id='MB-10102',
                user_id=patient.id,
                patient_name='Aarav Deshmukh',
                phone='9123456780',
                category='Dental Care',
                doctor='Dr. Pooja Deshmukh (Dental Surgeon)',
                appointment_date=next_week.strftime('%Y-%m-%d'),
                appointment_time='02:30 PM',
                reason='Biannual teeth cleaning and dental sensitivity evaluation.',
                status='pending'
            ),
            Appointment(
                id='MB-10103',
                user_id=patient.id,
                patient_name='Aarav Deshmukh',
                phone='9123456780',
                category='General Consultation',
                doctor='Dr. Anjali Joshi (General Physician)',
                appointment_date=past_date.strftime('%Y-%m-%d'),
                appointment_time='11:00 AM',
                reason='Seasonal allergies and throat checkup.',
                status='completed'
            ),
            Appointment(
                id='MB-10104',
                user_id=patient.id,
                patient_name='Aarav Deshmukh',
                phone='9123456780',
                category='Eye Care',
                doctor='Dr. Sneha Patil (Ophthalmologist)',
                appointment_date=tomorrow.strftime('%Y-%m-%d'),
                appointment_time='04:00 PM',
                reason='Vision clarity check for new prescription glasses.',
                status='cancelled'
            )
        ]
        db.session.bulk_save_objects(sample_appointments)
        db.session.commit()
        print("Sample appointments seeded successfully.")

app = create_app()

with app.app_context():
    seed_database()

if __name__ == '__main__':
    print("Starting MediBook Flask API server on http://127.0.0.1:5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
