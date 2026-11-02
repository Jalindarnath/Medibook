from datetime import datetime, timezone
from database import db
from werkzeug.security import generate_password_hash, check_password_hash

def get_utc_now():
    return datetime.now(timezone.utc)

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='patient', nullable=False)
    created_at = db.Column(db.DateTime, default=get_utc_now)

    appointments = db.relationship('Appointment', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.String(30), primary_key=True) # e.g., MB-84729
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    patient_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    doctor = db.Column(db.String(100), nullable=False)
    appointment_date = db.Column(db.String(20), nullable=False) # YYYY-MM-DD
    appointment_time = db.Column(db.String(20), nullable=False) # e.g. 10:00 AM
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='confirmed', nullable=False) # pending, confirmed, cancelled, completed
    created_at = db.Column(db.DateTime, default=get_utc_now)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'patient_name': self.patient_name,
            'phone': self.phone,
            'category': self.category,
            'doctor': self.doctor,
            'appointment_date': self.appointment_date,
            'appointment_time': self.appointment_time,
            'reason': self.reason,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
