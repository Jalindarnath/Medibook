import json
import time
from datetime import date, timedelta
import pytest

class TestHealthCheck:
    def test_health_endpoint(self, client):
        res = client.get('/api/health')
        assert res.status_code == 200
        data = res.get_json()
        assert data['status'] == 'healthy'
        assert 'MediBook' in data['app']

class TestUserAuthentication:
    def test_registration_validation_missing_fields(self, client):
        # Empty payload
        res = client.post('/api/auth/register', json={})
        assert res.status_code == 400
        assert 'Full name is required' in res.get_json()['error']

    def test_registration_validation_invalid_email(self, client):
        res = client.post('/api/auth/register', json={
            'full_name': 'Test User',
            'email': 'invalid-email-string',
            'phone': '9876543210',
            'password': 'Password123!',
            'confirm_password': 'Password123!'
        })
        assert res.status_code == 400
        assert 'valid email' in res.get_json()['error'].lower()

    def test_registration_validation_invalid_phone(self, client):
        res = client.post('/api/auth/register', json={
            'full_name': 'Test User',
            'email': 'valid@example.com',
            'phone': '12345',  # Not 10 digits
            'password': 'Password123!',
            'confirm_password': 'Password123!'
        })
        assert res.status_code == 400
        assert '10 digits' in res.get_json()['error']

    def test_registration_validation_short_password(self, client):
        res = client.post('/api/auth/register', json={
            'full_name': 'Test User',
            'email': 'valid@example.com',
            'phone': '9876543210',
            'password': '123',  # Less than 8 chars
            'confirm_password': '123'
        })
        assert res.status_code == 400
        assert '8 characters' in res.get_json()['error']

    def test_registration_validation_password_mismatch(self, client):
        res = client.post('/api/auth/register', json={
            'full_name': 'Test User',
            'email': 'valid@example.com',
            'phone': '9876543210',
            'password': 'Password123!',
            'confirm_password': 'DifferentPassword456!'
        })
        assert res.status_code == 400
        assert 'match' in res.get_json()['error'].lower()

    def test_successful_registration(self, client):
        unique_email = f'new_patient_{int(time.time()*1000)}@test.com'
        res = client.post('/api/auth/register', json={
            'full_name': 'Priyanka Patil',
            'email': unique_email,
            'phone': '9876543210',
            'password': 'SecurePassword123!',
            'confirm_password': 'SecurePassword123!'
        })
        assert res.status_code == 201
        data = res.get_json()
        assert 'token' in data
        assert data['user']['email'] == unique_email
        assert data['user']['role'] == 'patient'

    def test_duplicate_email_rejection(self, client):
        res = client.post('/api/auth/register', json={
            'full_name': 'Duplicate Aarav',
            'email': 'patient@medibook.com',  # Default seeded email
            'phone': '9876543210',
            'password': 'Password123!',
            'confirm_password': 'Password123!'
        })
        assert res.status_code == 409
        assert 'already exists' in res.get_json()['error'].lower()

    def test_login_success(self, client):
        res = client.post('/api/auth/login', json={
            'email': 'patient@medibook.com',
            'password': 'Patient123!'
        })
        assert res.status_code == 200
        data = res.get_json()
        assert 'token' in data
        assert data['user']['email'] == 'patient@medibook.com'

    def test_login_invalid_credentials(self, client):
        res = client.post('/api/auth/login', json={
            'email': 'patient@medibook.com',
            'password': 'WrongPassword123!'
        })
        assert res.status_code == 401

    def test_protected_me_route(self, client, patient_headers):
        res = client.get('/api/auth/me', headers=patient_headers)
        assert res.status_code == 200
        data = res.get_json()
        assert data['user']['email'] == 'patient@medibook.com'

class TestAppointmentBooking:
    def test_get_categories_and_doctors(self, client):
        res = client.get('/api/categories')
        assert res.status_code == 200
        data = res.get_json()
        assert 'Cardiology' in data['categories']
        assert 'Dental Care' in data['categories']
        assert len(data['doctors_by_category']) >= 5

    def test_get_available_slots(self, client):
        tomorrow = (date.today() + timedelta(days=2)).strftime('%Y-%m-%d')
        res = client.get(f'/api/available-slots?doctor=Dr.+Milind+Kadam+(Cardiologist)&date={tomorrow}')
        assert res.status_code == 200
        data = res.get_json()
        assert 'available_slots' in data
        assert len(data['all_slots']) == 12

    def test_booking_past_date_rejected(self, client, patient_headers):
        yesterday = (date.today() - timedelta(days=1)).strftime('%Y-%m-%d')
        res = client.post('/api/appointments', headers=patient_headers, json={
            'patient_name': 'Aarav Deshmukh',
            'phone': '9123456780',
            'category': 'Cardiology',
            'doctor': 'Dr. Milind Kadam (Cardiologist)',
            'appointment_date': yesterday,
            'appointment_time': '10:00 AM',
            'reason': 'Past date test check'
        })
        assert res.status_code == 400
        assert 'past' in res.get_json()['error'].lower()

    def test_successful_booking(self, client, patient_headers):
        booking_date = (date.today() + timedelta(days=14)).strftime('%Y-%m-%d')
        res = client.post('/api/appointments', headers=patient_headers, json={
            'patient_name': 'Aarav Deshmukh',
            'phone': '9123456780',
            'category': 'Cardiology',
            'doctor': 'Dr. Milind Kadam (Cardiologist)',
            'appointment_date': booking_date,
            'appointment_time': '02:00 PM',
            'reason': 'Annual cardiovascular checkup'
        })
        assert res.status_code == 201
        data = res.get_json()
        assert data['appointment']['id'].startswith('MB-')
        assert data['appointment']['status'] == 'confirmed'

    def test_duplicate_slot_booking_prevention(self, client, patient_headers):
        booking_date = (date.today() + timedelta(days=15)).strftime('%Y-%m-%d')
        # 1. First booking
        res1 = client.post('/api/appointments', headers=patient_headers, json={
            'patient_name': 'Tanvi Kulkarni',
            'phone': '9123456780',
            'category': 'Dental Care',
            'doctor': 'Dr. Pooja Deshmukh (Dental Surgeon)',
            'appointment_date': booking_date,
            'appointment_time': '09:00 AM',
            'reason': 'First booking on slot'
        })
        assert res1.status_code == 201

        # 2. Second booking on exact same doctor, date and time
        res2 = client.post('/api/appointments', headers=patient_headers, json={
            'patient_name': 'Siddhesh Shinde',
            'phone': '9876543210',
            'category': 'Dental Care',
            'doctor': 'Dr. Pooja Deshmukh (Dental Surgeon)',
            'appointment_date': booking_date,
            'appointment_time': '09:00 AM',
            'reason': 'Conflict booking attempt'
        })
        assert res2.status_code == 409
        assert 'already booked' in res2.get_json()['error'].lower()

    def test_cancellation_and_slot_release(self, client, patient_headers):
        booking_date = (date.today() + timedelta(days=16)).strftime('%Y-%m-%d')
        # 1. Book
        res = client.post('/api/appointments', headers=patient_headers, json={
            'patient_name': 'Aarav Deshmukh',
            'phone': '9123456780',
            'category': 'Eye Care',
            'doctor': 'Dr. Sneha Patil (Ophthalmologist)',
            'appointment_date': booking_date,
            'appointment_time': '11:00 AM',
            'reason': 'Routine eye check'
        })
        assert res.status_code == 201
        app_id = res.get_json()['appointment']['id']

        # 2. Cancel
        cancel_res = client.put(f'/api/appointments/{app_id}/cancel', headers=patient_headers)
        assert cancel_res.status_code == 200
        assert cancel_res.get_json()['appointment']['status'] == 'cancelled'

        # 3. Verify slot is released and re-bookable
        rebook_res = client.post('/api/appointments', headers=patient_headers, json={
            'patient_name': 'Aarav Deshmukh',
            'phone': '9123456780',
            'category': 'Eye Care',
            'doctor': 'Dr. Sneha Patil (Ophthalmologist)',
            'appointment_date': booking_date,
            'appointment_time': '11:00 AM',
            'reason': 'Re-booking released slot'
        })
        assert rebook_res.status_code == 201

class TestAdminModuleAndRBAC:
    def test_patient_blocked_from_admin_portal(self, client, patient_headers):
        res = client.get('/api/admin/dashboard', headers=patient_headers)
        assert res.status_code == 403
        assert 'denied' in res.get_json()['error'].lower()

    def test_admin_dashboard_metrics(self, client, admin_headers):
        res = client.get('/api/admin/dashboard', headers=admin_headers)
        assert res.status_code == 200
        data = res.get_json()
        assert 'total_users' in data['stats']
        assert 'total_appointments' in data['stats']
        assert 'pending_appointments' in data['stats']
        assert 'confirmed_appointments' in data['stats']
        assert 'cancelled_appointments' in data['stats']

    def test_admin_status_update(self, client, admin_headers):
        # Sample appointment MB-10102 starts pending in seeded database
        res = client.put('/api/admin/appointments/MB-10102/status', headers=admin_headers, json={
            'status': 'confirmed'
        })
        assert res.status_code == 200
        assert res.get_json()['appointment']['status'] == 'confirmed'

