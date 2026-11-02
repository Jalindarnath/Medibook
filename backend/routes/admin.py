from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify
from database import db
from models import User, Appointment
from routes.auth import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_admin_dashboard():
    total_users = User.query.filter_by(role='patient').count()
    total_appointments = Appointment.query.count()
    pending_appointments = Appointment.query.filter_by(status='pending').count()
    confirmed_appointments = Appointment.query.filter_by(status='confirmed').count()
    cancelled_appointments = Appointment.query.filter_by(status='cancelled').count()
    completed_appointments = Appointment.query.filter_by(status='completed').count()

    recent_appointments = Appointment.query.order_by(Appointment.created_at.desc()).limit(8).all()

    return jsonify({
        'stats': {
            'total_users': total_users,
            'total_appointments': total_appointments,
            'pending_appointments': pending_appointments,
            'confirmed_appointments': confirmed_appointments,
            'cancelled_appointments': cancelled_appointments,
            'completed_appointments': completed_appointments
        },
        'recent_appointments': [a.to_dict() for a in recent_appointments]
    }), 200

@admin_bp.route('/appointments', methods=['GET'])
@admin_required
def get_all_appointments():
    status = request.args.get('status', '').strip().lower()
    appointment_date = request.args.get('date', '').strip()
    search = request.args.get('search', '').strip().lower()

    query = Appointment.query

    if status and status != 'all':
        query = query.filter(Appointment.status == status)

    if appointment_date:
        query = query.filter(Appointment.appointment_date == appointment_date)

    appointments = query.order_by(Appointment.created_at.desc()).all()

    if search:
        appointments = [
            a for a in appointments
            if search in a.id.lower()
            or search in a.patient_name.lower()
            or search in a.doctor.lower()
            or search in a.category.lower()
            or search in a.phone.lower()
        ]

    return jsonify({
        'appointments': [a.to_dict() for a in appointments],
        'total': len(appointments)
    }), 200

@admin_bp.route('/appointments/<string:id>/status', methods=['PUT'])
@admin_required
def update_appointment_status(id):
    appointment = db.session.get(Appointment, id)
    if not appointment:
        return jsonify({'error': 'Appointment not found.'}), 404

    data = request.get_json() or {}
    new_status = (data.get('status') or '').strip().lower()

    valid_statuses = ['pending', 'confirmed', 'cancelled', 'completed']
    if new_status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Allowed values: {", ".join(valid_statuses)}'}), 400

    # If updating to confirmed, ensure slot is not conflicting with another confirmed appointment
    if new_status == 'confirmed' and appointment.status != 'confirmed':
        conflict = Appointment.query.filter(
            Appointment.id != appointment.id,
            Appointment.doctor == appointment.doctor,
            Appointment.appointment_date == appointment.appointment_date,
            Appointment.appointment_time == appointment.appointment_time,
            Appointment.status == 'confirmed'
        ).first()

        if conflict:
            return jsonify({
                'error': f'Slot {appointment.appointment_time} on {appointment.appointment_date} is already confirmed for another patient ({conflict.patient_name}).'
            }), 409

    old_status = appointment.status
    appointment.status = new_status
    db.session.commit()

    return jsonify({
        'message': f'Appointment {id} status changed from {old_status} to {new_status}.',
        'appointment': appointment.to_dict()
    }), 200

@admin_bp.route('/reset-db', methods=['POST'])
@admin_required
def reset_test_database():
    """Documented development & test automation endpoint to reset and reseed testing data."""
    from app import seed_database
    try:
        # Clear non-admin users and appointments
        Appointment.query.delete()
        User.query.filter(User.role != 'admin').delete()
        db.session.commit()

        # Reseed
        seed_database()
        return jsonify({'message': 'Test database successfully reset and seeded.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to reset database: {str(e)}'}), 500
