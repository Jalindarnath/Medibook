import time
from datetime import datetime, timedelta
import requests
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

def login_patient(driver, base_url):
    """Helper to authenticate patient."""
    driver.get(f"{base_url}/login")
    wait = WebDriverWait(driver, 10)
    email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="email-input"]')))
    email_input.clear()
    email_input.send_keys("patient@medibook.com")
    pwd_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]')
    pwd_input.clear()
    pwd_input.send_keys("Patient123!")
    driver.find_element(By.CSS_SELECTOR, '[data-testid="login-button"]').click()
    wait.until(EC.url_contains("/dashboard"))

class TestCancellation:
    """
    STQA Automated Test Cases: Appointment Cancellation & Slot Release Module
    """

    def test_tc_canc_01_cancel_upcoming_appointment(self, driver, base_url):
        """TC_CANC_01: Verify cancellation of an active confirmed/pending appointment."""
        login_patient(driver, base_url)
        wait = WebDriverWait(driver, 10)

        # 1. Book an appointment first to guarantee an active one exists
        driver.get(f"{base_url}/book")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]')))
        
        future_date = (datetime.now() + timedelta(days=25)).strftime("%Y-%m-%d")
        date_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-date"]')
        driver.execute_script("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", date_input, future_date)

        time.sleep(1)
        slot_select = Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-time"]'))
        for opt in slot_select.options:
            val = opt.get_attribute("value")
            if val and not opt.get_attribute("disabled"):
                slot_select.select_by_value(val)
                break

        driver.find_element(By.CSS_SELECTOR, '[data-testid="reason-input"]').send_keys("Appointment to be cancelled in TC_CANC_01.")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="book-appointment-button"]').click()
        wait.until(EC.url_contains("/booking-confirmation"))

        # 2. Go to My Appointments page
        driver.get(f"{base_url}/my-appointments")
        wait.until(EC.visibility_of_element_located((By.ID, "appointments-table")))

        # 3. Find first active cancel button
        cancel_buttons = driver.find_elements(By.CSS_SELECTOR, '[data-testid="cancel-appointment-button"]')
        assert len(cancel_buttons) > 0, "No cancellable appointment found in list"
        cancel_buttons[0].click()

        # 4. Confirm in modal
        confirm_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="confirm-cancel-button"]')))
        confirm_btn.click()

        # 5. Verify success alert appears
        alert = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="cancellation-alert"]')))
        assert "cancelled" in alert.text.lower()

    def test_tc_canc_02_prevent_cancellation_of_completed_appointment(self, driver, base_url, api_url):
        """TC_CANC_02: Verify system blocks cancellation of completed appointments."""
        login_patient(driver, base_url)
        wait = WebDriverWait(driver, 10)

        # In UI, completed appointments filter check
        driver.get(f"{base_url}/my-appointments")
        wait.until(EC.visibility_of_element_located((By.ID, "appointments-table")))

        # Filter by completed
        status_select = Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="status-filter"]'))
        status_select.select_by_value("completed")
        time.sleep(1)

        # Completed items must not have any active cancel buttons
        cancel_buttons = driver.find_elements(By.CSS_SELECTOR, '[data-testid="cancel-appointment-button"]')
        assert len(cancel_buttons) == 0, "Completed appointments should not render a Cancel button"

    def test_tc_canc_03_verify_slot_availability_after_cancellation(self, driver, base_url):
        """TC_CANC_03: Verify time slot is freed and becomes bookable again following cancellation."""
        login_patient(driver, base_url)
        wait = WebDriverWait(driver, 10)

        # Book a slot on a specific date
        test_date = (datetime.now() + timedelta(days=28)).strftime("%Y-%m-%d")
        driver.get(f"{base_url}/book")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]')))

        date_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-date"]')
        driver.execute_script("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", date_input, test_date)

        time.sleep(1)
        slot_select = Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-time"]'))
        chosen_slot = None
        for opt in slot_select.options:
            val = opt.get_attribute("value")
            if val and not opt.get_attribute("disabled"):
                chosen_slot = val
                slot_select.select_by_value(val)
                break

        assert chosen_slot is not None
        driver.find_element(By.CSS_SELECTOR, '[data-testid="reason-input"]').send_keys("Temporary booking to test slot release.")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="book-appointment-button"]').click()
        wait.until(EC.url_contains("/booking-confirmation"))

        # Navigate to My Appointments and cancel this newly created appointment
        driver.get(f"{base_url}/my-appointments")
        wait.until(EC.visibility_of_element_located((By.ID, "appointments-table")))

        cancel_buttons = driver.find_elements(By.CSS_SELECTOR, '[data-testid="cancel-appointment-button"]')
        cancel_buttons[0].click()

        confirm_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="confirm-cancel-button"]')))
        confirm_btn.click()

        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="cancellation-alert"]')))

        # Now go back to book page and verify the slot is available again
        driver.get(f"{base_url}/book")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]')))

        date_input2 = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-date"]')
        driver.execute_script("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", date_input2, test_date)

        time.sleep(1)
        slot_select2 = Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-time"]'))
        matching_opt = None
        for opt in slot_select2.options:
            if opt.get_attribute("value") == chosen_slot:
                matching_opt = opt
                break

        assert matching_opt is not None
        assert matching_opt.get_attribute("disabled") is None or matching_opt.get_attribute("disabled") == "false"
        assert "(Available)" in matching_opt.text

    def test_tc_canc_04_prevent_cancellation_of_another_user_appointment(self, driver, base_url, api_url):
        """TC_CANC_04: Verify access control prevents cancelling appointments belonging to another patient."""
        # 1. Login as patient@medibook.com and get token
        s1 = requests.Session()
        res_login1 = s1.post(f"{api_url}/api/auth/login", json={
            "email": "patient@medibook.com",
            "password": "Patient123!"
        })
        user1_token = res_login1.json().get("token")

        # 2. Register/login as another distinct patient
        timestamp = int(time.time() * 1000)
        s2 = requests.Session()
        res_reg = s2.post(f"{api_url}/api/auth/register", json={
            "full_name": "Siddharth Deshmukh",
            "email": f"siddharth_{timestamp}@medibook.in",
            "phone": "9822334455",
            "password": "Password123!",
            "confirm_password": "Password123!"
        })
        user2_token = res_reg.json().get("token")

        # 3. Patient 1 creates an appointment
        future_date = (datetime.now() + timedelta(days=35)).strftime("%Y-%m-%d")
        res_book = s1.post(
            f"{api_url}/api/appointments",
            headers={"Authorization": f"Bearer {user1_token}"},
            json={
                "patient_name": "Aarav Deshmukh",
                "phone": "9876543210",
                "category": "General Medicine",
                "doctor": "Dr. Rajesh Kulkarni",
                "appointment_date": future_date,
                "appointment_time": "09:00 AM",
                "reason": "Routine consultation"
            }
        )
        app_id = res_book.json().get("appointment", {}).get("id")
        assert app_id is not None

        # 4. Patient 2 attempts to cancel Patient 1's appointment ID
        res_malicious_cancel = s2.put(
            f"{api_url}/api/appointments/{app_id}/cancel",
            headers={"Authorization": f"Bearer {user2_token}"}
        )

        assert res_malicious_cancel.status_code == 403
        assert "Access denied" in res_malicious_cancel.json().get("error", "")

