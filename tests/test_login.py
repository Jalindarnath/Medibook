import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestLogin:
    """
    STQA Automated Test Cases: User Authentication & Login Module
    """

    def test_tc_log_01_valid_credentials(self, driver, base_url):
        """TC_LOG_01: Verify successful patient login with valid credentials."""
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
        assert "/dashboard" in driver.current_url

        # Check welcome banner displays user name
        welcome_elem = wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
        assert "Welcome" in welcome_elem.text

    def test_tc_log_02_incorrect_password(self, driver, base_url):
        """TC_LOG_02: Verify login failure with an incorrect password."""
        driver.get(f"{base_url}/login")
        wait = WebDriverWait(driver, 10)

        email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="email-input"]')))
        email_input.clear()
        email_input.send_keys("patient@medibook.com")

        pwd_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]')
        pwd_input.clear()
        pwd_input.send_keys("WrongSecretPassword!")

        driver.find_element(By.CSS_SELECTOR, '[data-testid="login-button"]').click()

        err_banner = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="login-error"]')))
        assert "invalid" in err_banner.text.lower() or "password" in err_banner.text.lower()

    def test_tc_log_03_unregistered_email(self, driver, base_url):
        """TC_LOG_03: Verify login rejection for an unregistered email address."""
        driver.get(f"{base_url}/login")
        wait = WebDriverWait(driver, 10)

        email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="email-input"]')))
        email_input.clear()
        email_input.send_keys("nonexistent_user_99999@medibook.com")

        pwd_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]')
        pwd_input.clear()
        pwd_input.send_keys("SomePassword123!")

        driver.find_element(By.CSS_SELECTOR, '[data-testid="login-button"]').click()

        err_banner = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="login-error"]')))
        assert "invalid" in err_banner.text.lower()

    def test_tc_log_04_empty_fields(self, driver, base_url):
        """TC_LOG_04: Verify client-side rejection when login form submitted with empty fields."""
        driver.get(f"{base_url}/login")
        wait = WebDriverWait(driver, 10)

        login_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="login-button"]')))
        login_btn.click()

        err_banner = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="login-error"]')))
        assert "required" in err_banner.text.lower()

    def test_tc_log_05_session_persistence(self, driver, base_url):
        """TC_LOG_05: Verify session token persistence across page refreshes."""
        driver.get(f"{base_url}/login")
        wait = WebDriverWait(driver, 10)

        # Login
        email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="email-input"]')))
        email_input.clear()
        email_input.send_keys("patient@medibook.com")

        pwd_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]')
        pwd_input.clear()
        pwd_input.send_keys("Patient123!")

        driver.find_element(By.CSS_SELECTOR, '[data-testid="login-button"]').click()
        wait.until(EC.url_contains("/dashboard"))

        # Refresh page and verify user remains logged into dashboard
        driver.refresh()
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="stat-total-appointments"]')))
        assert "/dashboard" in driver.current_url

