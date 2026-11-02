import re
from datetime import datetime, timedelta, timezone
from functools import wraps
import jwt
from flask import Blueprint, request, jsonify, current_app
from database import db
from models import User

auth_bp = Blueprint('auth', __name__)

def generate_token(user):
    payload = {
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    secret = current_app.config.get('SECRET_KEY', 'medibook-secret-key-2026')
    return jwt.encode(payload, secret, algorithm='HS256')

def get_current_user_from_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    try:
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None
        token = parts[1]
        secret = current_app.config.get('SECRET_KEY', 'medibook-secret-key-2026')
        decoded = jwt.decode(token, secret, algorithms=['HS256'])
        user = db.session.get(User, decoded['user_id'])
        return user
    except Exception:
        return None

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user_from_token()
        if not user:
            return jsonify({'error': 'Authentication required. Please log in.'}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user_from_token()
        if not user:
            return jsonify({'error': 'Authentication required. Please log in.'}), 401
        if user.role != 'admin':
            return jsonify({'error': 'Access denied. Administrator privileges required.'}), 403
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    full_name = (data.get('full_name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    phone = (data.get('phone') or '').strip()
    password = data.get('password') or ''
    confirm_password = data.get('confirm_password') or ''

    # Validation checks
    if not full_name:
        return jsonify({'error': 'Full name is required.'}), 400
    if not email:
        return jsonify({'error': 'Email address is required.'}), 400
    if not phone:
        return jsonify({'error': 'Phone number is required.'}), 400
    if not password:
        return jsonify({'error': 'Password is required.'}), 400

    # Email format validation
    email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    if not re.match(email_regex, email):
        return jsonify({'error': 'Please enter a valid email address.'}), 400

    # Phone validation: Exactly 10 digits
    if not re.match(r'^\d{10}$', phone):
        return jsonify({'error': 'Phone number must be exactly 10 digits.'}), 400

    # Password length validation: Minimum 8 characters
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long.'}), 400

    # Confirm password matching
    if password != confirm_password:
        return jsonify({'error': 'Password confirmation does not match.'}), 400

    # Duplicate email check
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'An account with this email address already exists.'}), 409

    # Create new user
    new_user = User(
        full_name=full_name,
        email=email,
        phone=phone,
        role='patient'
    )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    token = generate_token(new_user)

    return jsonify({
        'message': 'Registration successful! Welcome to MediBook.',
        'user': new_user.to_dict(),
        'token': token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email:
        return jsonify({'error': 'Email address is required.'}), 400
    if not password:
        return jsonify({'error': 'Password is required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email address or password.'}), 401

    token = generate_token(user)

    return jsonify({
        'message': 'Login successful.',
        'user': user.to_dict(),
        'token': token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({
        'user': request.current_user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({
        'message': 'Logged out successfully.'
    }), 200
