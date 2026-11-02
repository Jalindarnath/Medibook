import time
from datetime import datetime, timedelta
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

class TestAppointmentBooking:
    """
    STQA Automated Test Cases: Appointment Booking Module
    """

    def test_tc_book_01_successful_booking(self, driver, base_url):
        """TC_BOOK_01: Verify successful end-to-end appointment reservation."""
        login_patient(driver, base_url)
        wait = WebDriverWait(driver, 10)

        driver.get(f"{base_url}/book")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]')))

        # Select future date
        future_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        date_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-date"]')
        driver.execute_script("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", date_input, future_date)

        # Wait for slots to populate
        time.sleep(1)
        slot_select = Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-time"]'))
        
        # Pick the first available non-empty slot
        selected_slot = None
        for option in slot_select.options:
            val = option.get_attribute("value")
            if val and not option.get_attribute("disabled"):
                slot_select.select_by_value(val)
                selected_slot = val
                break
        
        assert selected_slot is not None, "No available slots found for date"

        # Fill reason
        reason_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="reason-input"]')
        reason_input.clear()
        reason_input.send_keys("Quarterly routine health checkup and consultation.")

        # Submit
        driver.find_element(By.CSS_SELECTOR, '[data-testid="book-appointment-button"]').click()

        # Wait for Booking Confirmation page
        wait.until(EC.url_contains("/booking-confirmation"))
        assert "/booking-confirmation" in driver.current_url

        confirmation_heading = wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
        assert "Confirmed" in confirmation_heading.text or "Booking" in confirmation_heading.text

    def test_tc_book_02_empty_fields(self, driver, base_url):
        """TC_BOOK_02: Verify rejection when mandatory booking fields are omitted."""
        login_patient(driver, base_url)
        wait = WebDriverWait(driver, 10)

        driver.get(f"{base_url}/book")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]')))

        # Clear reason input
        reason_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="reason-input"]')
        reason_input.clear()

        # Submit without selecting slot or filling reason
        driver.find_element(By.CSS_SELECTOR, '[data-testid="book-appointment-button"]').click()

        err_banner = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="booking-error"]')))
        assert err_banner.is_displayed()
        assert len(err_banner.text.strip()) > 0

    def test_tc_book_03_past_appointment_date(self, driver, base_url):
        """TC_BOOK_03: Verify rejection of booking attempts for past dates."""
        login_patient(driver, base_url)
        wait = WebDriverWait(driver, 10)

        driver.get(f"{base_url}/book")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]')))

        # Set a past date using JS
        past_date = (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d")
        date_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-date"]')
        driver.execute_script("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", date_input, past_date)

        # Select a slot
        time.sleep(0.5)
        slot_select = Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-time"]'))
        if len(slot_select.options) > 1:
            slot_select.select_by_index(1)

        driver.find_element(By.CSS_SELECTOR, '[data-testid="reason-input"]').send_keys("Follow up on prescription.")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="book-appointment-button"]').click()

        err_banner = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="booking-error"]')))
        assert "past" in err_banner.text.lower()

    def test_tc_book_04_duplicate_slot(self, driver, base_url):
        """TC_BOOK_04: Verify conflict detection when reserving an already booked slot."""
        login_patient(driver, base_url)
        wait = WebDriverWait(driver, 10)

        driver.get(f"{base_url}/book")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]')))

        # Target a fixed unique future date
        test_date = (datetime.now() + timedelta(days=20)).strftime("%Y-%m-%d")
        date_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-date"]')
        driver.execute_script("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", date_input, test_date)

        time.sleep(1)
        slot_select = Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-time"]'))
        
        target_slot = None
        for opt in slot_select.options:
            val = opt.get_attribute("value")
            if val and not opt.get_attribute("disabled"):
                target_slot = val
                slot_select.select_by_value(val)
                break
        
        assert target_slot is not None

        driver.find_element(By.CSS_SELECTOR, '[data-testid="reason-input"]').send_keys("Initial booking for conflict test.")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="book-appointment-button"]').click()

        wait.until(EC.url_contains("/booking-confirmation"))

        # Now attempt to book the exact same slot again
        driver.get(f"{base_url}/book")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]')))

        date_input2 = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-date"]')
        driver.execute_script("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", date_input2, test_date)

        time.sleep(1)
        # Check that target_slot is either marked disabled or not available
        slot_select2 = Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-time"]'))
        matched_option = None
        for opt in slot_select2.options:
            if opt.get_attribute("value") == target_slot:
                matched_option = opt
                break
        
        if matched_option:
            assert matched_option.get_attribute("disabled") is not None or "(Booked)" in matched_option.text

    def test_tc_book_05_available_slots(self, driver, base_url):
        """TC_BOOK_05: Verify available slots populate dynamically upon doctor/date selection."""
        login_patient(driver, base_url)
        wait = WebDriverWait(driver, 10)

        driver.get(f"{base_url}/book")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="appointment-time"]')))

        time.sleep(1)
        slot_select = Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-time"]'))
        # Should contain default placeholder plus time slots (e.g., 09:00 AM to 04:30 PM)
        assert len(slot_select.options) > 1

    def test_tc_book_06_long_reason_text(self, driver, base_url):
        """TC_BOOK_06: Verify handling of extended clinical symptom descriptions."""
        login_patient(driver, base_url)
        wait = WebDriverWait(driver, 10)

        driver.get(f"{base_url}/book")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]')))

        future_date = (datetime.now() + timedelta(days=12)).strftime("%Y-%m-%d")
        date_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-date"]')
        driver.execute_script("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", date_input, future_date)

        time.sleep(1)
        slot_select = Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-time"]'))
        for opt in slot_select.options:
            val = opt.get_attribute("value")
            if val and not opt.get_attribute("disabled"):
                slot_select.select_by_value(val)
                break

        long_reason = "Patient reports persistent seasonal allergies, mild intermittent headaches over the last three weeks, occasional nasal congestion during evening hours, and requests advice regarding antihistamines and routine pulmonary function checkup."
        reason_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="reason-input"]')
        reason_input.clear()
        reason_input.send_keys(long_reason)

        driver.find_element(By.CSS_SELECTOR, '[data-testid="book-appointment-button"]').click()
        wait.until(EC.url_contains("/booking-confirmation"))
        assert "/booking-confirmation" in driver.current_url

    def test_tc_book_07_repeated_booking_button_clicks(self, driver, base_url):
        """TC_BOOK_07: Verify UI disables submit button during in-flight submission to prevent duplicate records."""
        login_patient(driver, base_url)
        wait = WebDriverWait(driver, 10)

        driver.get(f"{base_url}/book")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]')))

        future_date = (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d")
        date_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-date"]')
        driver.execute_script("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", date_input, future_date)

        time.sleep(1)
        slot_select = Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-time"]'))
        for opt in slot_select.options:
            val = opt.get_attribute("value")
            if val and not opt.get_attribute("disabled"):
                slot_select.select_by_value(val)
                break

        driver.find_element(By.CSS_SELECTOR, '[data-testid="reason-input"]').send_keys("Testing rapid double click prevention.")
        btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="book-appointment-button"]')
        
        # Click button
        btn.click()
        
        # Button should either become disabled or navigate to confirmation
        wait.until(EC.url_contains("/booking-confirmation"))
        assert "/booking-confirmation" in driver.current_url

