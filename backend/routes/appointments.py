import random
import re
from datetime import datetime, date
from flask import Blueprint, request, jsonify
from database import db
from models import Appointment, User
from routes.auth import login_required

appointments_bp = Blueprint('appointments', __name__)

ALL_SLOTS = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
]

DOCTORS_BY_CATEGORY = {
    "General Consultation": [
        "Dr. Sarah Jenkins (General Physician)",
        "Dr. Robert Chen (Family Medicine)"
    ],
    "Dental Care": [
        "Dr. Emily Watson (Dental Surgeon)",
        "Dr. Michael Miller (Orthodontist)"
    ],
    "Eye Care": [
        "Dr. David Patel (Ophthalmologist)",
        "Dr. Sophia Rodriguez (Optometrist)"
    ],
    "Dermatology": [
        "Dr. Amanda Brooks (Dermatologist)",
        "Dr. Kevin Vance (Cosmetic Specialist)"
    ],
    "Cardiology": [
        "Dr. Marcus Vance (Cardiologist)",
        "Dr. Elena Rostova (Heart Specialist)"
    ]
}

def generate_appointment_id():
    while True:
        rand_num = random.randint(10000, 99999)
        app_id = f"MB-{rand_num}"
        if not db.session.get(Appointment, app_id):
            return app_id

@appointments_bp.route('/available-slots', methods=['GET'])
def get_available_slots():
    doctor = request.args.get('doctor', '').strip()
    appointment_date = request.args.get('date', '').strip()

    if not doctor or not appointment_date:
        return jsonify({
            'all_slots': ALL_SLOTS,
            'available_slots': ALL_SLOTS,
            'booked_slots': []
        }), 200

    # Query active appointments for this doctor on this date (not cancelled)
    booked_appointments = Appointment.query.filter(
        Appointment.doctor == doctor,
        Appointment.appointment_date == appointment_date,
        Appointment.status != 'cancelled'
    ).all()

    booked_slots = [a.appointment_time for a in booked_appointments]
    available_slots = [slot for slot in ALL_SLOTS if slot not in booked_slots]

    return jsonify({
        'doctor': doctor,
        'date': appointment_date,
        'all_slots': ALL_SLOTS,
        'booked_slots': booked_slots,
        'available_slots': available_slots
    }), 200

@appointments_bp.route('/categories', methods=['GET'])
def get_categories():
    return jsonify({
        'categories': list(DOCTORS_BY_CATEGORY.keys()),
        'doctors_by_category': DOCTORS_BY_CATEGORY
    }), 200

@appointments_bp.route('/appointments', methods=['GET'])
@login_required
def get_user_appointments():
    user = request.current_user
    status = request.args.get('status', '').strip().lower()
    search = request.args.get('search', '').strip().lower()

    query = Appointment.query.filter_by(user_id=user.id)

    if status and status != 'all':
        query = query.filter(Appointment.status == status)

    appointments = query.order_by(Appointment.created_at.desc()).all()

    # Search filter in python for flexibility across multiple fields
    if search:
        appointments = [
            a for a in appointments
            if search in a.id.lower()
            or search in a.doctor.lower()
            or search in a.category.lower()
            or search in a.patient_name.lower()
            or search in a.appointment_date.lower()
        ]

    return jsonify({
        'appointments': [a.to_dict() for a in appointments],
        'total': len(appointments)
    }), 200

@appointments_bp.route('/appointments/<string:id>', methods=['GET'])
@login_required
def get_appointment_by_id(id):
    user = request.current_user
    appointment = db.session.get(Appointment, id)

    if not appointment:
        return jsonify({'error': 'Appointment not found.'}), 404

    # Ensure user owns appointment or is admin
    if appointment.user_id != user.id and user.role != 'admin':
        return jsonify({'error': 'Access denied.'}), 403

    return jsonify({'appointment': appointment.to_dict()}), 200

@appointments_bp.route('/appointments', methods=['POST'])
@login_required
def create_appointment():
    user = request.current_user
    data = request.get_json() or {}

    patient_name = (data.get('patient_name') or '').strip()
    phone = (data.get('phone') or '').strip()
    category = (data.get('category') or '').strip()
    doctor = (data.get('doctor') or '').strip()
    appointment_date = (data.get('appointment_date') or '').strip()
    appointment_time = (data.get('appointment_time') or '').strip()
    reason = (data.get('reason') or '').strip()
    requested_status = (data.get('status') or 'confirmed').strip().lower()

    # Mandatory field check
    if not patient_name:
        return jsonify({'error': 'Patient name is required.'}), 400
    if not phone:
        return jsonify({'error': 'Phone number is required.'}), 400
    if not category:
        return jsonify({'error': 'Appointment category is required.'}), 400
    if not doctor:
        return jsonify({'error': 'Doctor / Service Provider is required.'}), 400
    if not appointment_date:
        return jsonify({'error': 'Appointment date is required.'}), 400
    if not appointment_time:
        return jsonify({'error': 'Appointment time slot is required.'}), 400
    if not reason:
        return jsonify({'error': 'Reason for appointment is required.'}), 400

    # Phone validation
    if not re.match(r'^\d{10}$', phone):
        return jsonify({'error': 'Phone number must be exactly 10 digits.'}), 400

    # Past date validation
    try:
        booking_date = datetime.strptime(appointment_date, '%Y-%m-%d').date()
        today = date.today()
        if booking_date < today:
            return jsonify({'error': 'Appointment date cannot be in the past.'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid date format. Expected YYYY-MM-DD.'}), 400

    # Time slot validity check
    if appointment_time not in ALL_SLOTS:
        return jsonify({'error': 'Invalid time slot selected.'}), 400

    # Duplicate slot check: Is this slot already booked for this doctor?
    existing_booking = Appointment.query.filter(
        Appointment.doctor == doctor,
        Appointment.appointment_date == appointment_date,
        Appointment.appointment_time == appointment_time,
        Appointment.status != 'cancelled'
    ).first()

    if existing_booking:
        return jsonify({
            'error': f'The time slot {appointment_time} on {appointment_date} with {doctor} is already booked. Please select another slot.'
        }), 409

    # Generate unique ID
    appointment_id = generate_appointment_id()

    # Determine status (default: 'confirmed' or 'pending')
    valid_statuses = ['confirmed', 'pending']
    final_status = requested_status if requested_status in valid_statuses else 'confirmed'

    new_appointment = Appointment(
        id=appointment_id,
        user_id=user.id,
        patient_name=patient_name,
        phone=phone,
        category=category,
        doctor=doctor,
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        reason=reason,
        status=final_status
    )

    db.session.add(new_appointment)
    db.session.commit()

    return jsonify({
        'message': 'Appointment booked successfully!',
        'appointment': new_appointment.to_dict()
    }), 201

@appointments_bp.route('/appointments/<string:id>/cancel', methods=['PUT'])
@login_required
def cancel_appointment(id):
    user = request.current_user
    appointment = db.session.get(Appointment, id)

    if not appointment:
        return jsonify({'error': 'Appointment not found.'}), 404

    # Ownership / Admin check
    if appointment.user_id != user.id and user.role != 'admin':
        return jsonify({'error': 'Access denied.'}), 403

    if appointment.status == 'cancelled':
        return jsonify({'error': 'This appointment is already cancelled.'}), 400

    if appointment.status == 'completed':
        return jsonify({'error': 'Completed appointments cannot be cancelled.'}), 400

    appointment.status = 'cancelled'
    db.session.commit()

    return jsonify({
        'message': f'Appointment {id} has been successfully cancelled and the time slot is released.',
        'appointment': appointment.to_dict()
    }), 200

@appointments_bp.route('/user/dashboard-stats', methods=['GET'])
@login_required
def get_user_dashboard_stats():
    user = request.current_user
    all_user_appointments = Appointment.query.filter_by(user_id=user.id).all()

    total = len(all_user_appointments)
    upcoming = len([a for a in all_user_appointments if a.status in ('confirmed', 'pending')])
    completed = len([a for a in all_user_appointments if a.status == 'completed'])
    cancelled = len([a for a in all_user_appointments if a.status == 'cancelled'])

    # Recent 5 appointments
    recent = Appointment.query.filter_by(user_id=user.id)\
        .order_by(Appointment.created_at.desc())\
        .limit(5).all()

    return jsonify({
        'stats': {
            'total': total,
            'upcoming': upcoming,
            'completed': completed,
            'cancelled': cancelled
        },
        'user': user.to_dict(),
        'recent_appointments': [a.to_dict() for a in recent]
    }), 200
