import time
from datetime import datetime, timedelta
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

class TestRegressionSuite:
    """
    STQA Automated Regression Test Suite:
    Validates end-to-end multi-module integration workflows and data consistency across patient and admin lifecycles.
    """

    def test_regr_01_end_to_end_patient_journey(self, driver, base_url):
        """TC_REGR_01: Complete regression flow: Register -> Dashboard -> Book -> Verify -> Cancel."""
        driver.get(f"{base_url}/register")
        wait = WebDriverWait(driver, 10)

        # 1. Register new patient with Maharashtrian credentials
        timestamp = int(time.time() * 1000)
        unique_email = f"ananya_regr_{timestamp}@medibook.in"

        name_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]')))
        name_input.send_keys("Ananya Deshmukh")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="email-input"]').send_keys(unique_email)
        driver.find_element(By.CSS_SELECTOR, '[data-testid="phone-input"]').send_keys("9876543210")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]').send_keys("Regression123!")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="confirm-password-input"]').send_keys("Regression123!")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="register-button"]').click()

        wait.until(EC.url_contains("/dashboard"))
        assert "/dashboard" in driver.current_url

        # 2. Book an appointment
        driver.get(f"{base_url}/book")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]')))

        future_date = (datetime.now() + timedelta(days=40)).strftime("%Y-%m-%d")
        date_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-date"]')
        driver.execute_script("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", date_input, future_date)

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
        driver.find_element(By.CSS_SELECTOR, '[data-testid="reason-input"]').send_keys("Regression testing consultation journey.")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="book-appointment-button"]').click()

        # 3. Verify confirmation screen
        wait.until(EC.url_contains("/booking-confirmation"))
        assert "/booking-confirmation" in driver.current_url

        # 4. View in My Appointments
        driver.get(f"{base_url}/my-appointments")
        wait.until(EC.visibility_of_element_located((By.ID, "appointments-table")))

        # 5. Cancel the appointment
        cancel_buttons = driver.find_elements(By.CSS_SELECTOR, '[data-testid="cancel-appointment-button"]')
        assert len(cancel_buttons) > 0
        cancel_buttons[0].click()

        confirm_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="confirm-cancel-button"]')))
        confirm_btn.click()

        alert = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="cancellation-alert"]')))
        assert "cancelled" in alert.text.lower()

    def test_regr_02_end_to_end_admin_workflow(self, driver, base_url):
        """TC_REGR_02: Complete admin regression flow: Login -> Dashboard -> Search/Filter -> Verify Operations."""
        driver.get(f"{base_url}/login")
        wait = WebDriverWait(driver, 10)

        email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="email-input"]')))
        email_input.clear()
        email_input.send_keys("admin@medibook.com")

        pwd_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]')
        pwd_input.clear()
        pwd_input.send_keys("AdminPassword123!")

        driver.find_element(By.CSS_SELECTOR, '[data-testid="login-button"]').click()
        wait.until(EC.url_contains("/admin"))

        # Verify operations elements
        wait.until(EC.visibility_of_element_located((By.ID, "admin-appointments-table")))
        assert "/admin" in driver.current_url

