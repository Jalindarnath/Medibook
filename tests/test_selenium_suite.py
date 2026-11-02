"""
MediBook Automated End-to-End Test Suite
STQA Final Year Mini Project Testing Script
Framework: Python + Pytest + Selenium WebDriver + Google Chrome

Usage:
    pytest tests/test_selenium_suite.py --html=reports/report.html --self-contained-html
"""

import os
import time
from datetime import date, timedelta
import pytest

# Optional Selenium import with graceful skip message if selenium is not installed in the active environment
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait, Select
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

BASE_URL = os.environ.get("MEDIBOOK_FRONTEND_URL", "http://localhost:5173")
HEADLESS = os.environ.get("SELENIUM_HEADLESS", "true").lower() == "true"

@pytest.fixture(scope="module")
def driver():
    """Initializes Google Chrome WebDriver with test options."""
    if not SELENIUM_AVAILABLE:
        pytest.skip("Selenium WebDriver is not installed. Install with 'pip install selenium'")

    options = Options()
    if HEADLESS:
        options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1280,800")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    try:
        driver = webdriver.Chrome(options=options)
    except Exception as e:
        pytest.skip(f"Chrome WebDriver could not start: {e}")

    driver.implicitly_wait(5)
    yield driver
    driver.quit()

@pytest.mark.skipif(not SELENIUM_AVAILABLE, reason="Selenium not installed")
class TestMediBookE2E:

    def test_01_landing_page_loads_and_displays_hero(self, driver):
        """TC-01: Verify landing page elements, heading, and Call To Action buttons."""
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 10)

        # Verify logo
        logo = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="nav-logo"]')))
        assert "MediBook" in logo.text

        # Verify Hero Book Button
        hero_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="hero-book-button"]')
        assert hero_btn.is_displayed()

    def test_02_registration_validation_and_account_creation(self, driver):
        """TC-02: Test patient registration form with validation and successful submission."""
        driver.get(f"{BASE_URL}/register")
        wait = WebDriverWait(driver, 10)

        # 1. Test empty form submission
        reg_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="register-button"]')))
        reg_btn.click()

        err_banner = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="register-error"]')))
        assert "required" in err_banner.text.lower()

        # 2. Fill valid registration data
        timestamp = int(time.time())
        driver.find_element(By.CSS_SELECTOR, '[data-testid="name-input"]').send_keys(f"Test Patient {timestamp}")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="email-input"]').send_keys(f"patient_{timestamp}@testmedibook.com")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="phone-input"]').send_keys("9876543210")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]').send_keys("SecurePass123!")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="confirm-password-input"]').send_keys("SecurePass123!")

        reg_btn.click()

        # Successful registration redirects to Dashboard
        wait.until(EC.url_contains("/dashboard"))
        assert "/dashboard" in driver.current_url

    def test_03_login_authentication_with_seeded_patient(self, driver):
        """TC-03: Verify logging in with seeded test credentials."""
        driver.get(f"{BASE_URL}/login")
        wait = WebDriverWait(driver, 10)

        email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="email-input"]')))
        email_input.clear()
        email_input.send_keys("patient@medibook.com")

        pwd_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]')
        pwd_input.clear()
        pwd_input.send_keys("Patient123!")

        driver.find_element(By.CSS_SELECTOR, '[data-testid="login-button"]').click()

        wait.until(EC.url_contains("/dashboard"))
        assert "/dashboard" in driver.current_url

    def test_04_book_new_appointment(self, driver):
        """TC-04: Verify booking an appointment with category, doctor, date, and slot selection."""
        driver.get(f"{BASE_URL}/book")
        wait = WebDriverWait(driver, 10)

        # Verify page elements
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="appointment-category"]')))

        # Select category
        category_select = Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-category"]'))
        category_select.select_by_visible_text("General Consultation")

        # Pick date (future date)
        future_date = (date.today() + timedelta(days=7)).strftime("%Y-%m-%d")
        date_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-date"]')
        date_input.clear()
        date_input.send_keys(future_date)

        # Select time slot from the dropdown
        time.sleep(0.5)  # allow slot fetch
        time_select = Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-time"]'))
        time_select.select_by_value("10:00 AM")

        # Enter clinical reason
        reason_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="reason-input"]')
        reason_input.clear()
        reason_input.send_keys("STQA Automated Selenium Verification Appointment.")

        # Confirm booking
        driver.find_element(By.CSS_SELECTOR, '[data-testid="book-appointment-button"]').click()

        # Check confirmation page
        wait.until(EC.url_contains("/booking-confirmation"))
        app_id_el = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="confirmation-appointment-id"]')))
        assert "MB-" in app_id_el.text

    def test_05_cancellation_workflow(self, driver):
        """TC-05: Verify appointment listing, cancellation confirmation modal, and status update."""
        driver.get(f"{BASE_URL}/my-appointments")
        wait = WebDriverWait(driver, 10)

        # Wait for table
        cancel_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="cancel-appointment-button"]')))
        cancel_btn.click()

        # Confirm cancellation in modal
        confirm_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="confirm-cancel-button"]')))
        confirm_btn.click()

        # Check cancellation alert banner
        alert = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="cancellation-alert"]')))
        assert "cancelled" in alert.text.lower()

    def test_06_admin_dashboard_and_controls(self, driver):
        """TC-06: Verify admin login, stats rendering, and admin controls."""
        driver.get(f"{BASE_URL}/login")
        wait = WebDriverWait(driver, 10)

        # Sign in as administrator
        email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="email-input"]')))
        email_input.clear()
        email_input.send_keys("admin@medibook.com")

        pwd_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]')
        pwd_input.clear()
        pwd_input.send_keys("AdminPassword123!")

        driver.find_element(By.CSS_SELECTOR, '[data-testid="login-button"]').click()

        # Should redirect to Admin Dashboard
        wait.until(EC.url_contains("/admin"))
        stats_el = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-total-appointments"]')))
        assert stats_el.text != ""

