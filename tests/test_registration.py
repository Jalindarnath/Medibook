import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestRegistration:
    """
    STQA Automated Test Cases: Patient Registration Module
    """

    def test_tc_reg_01_valid_registration(self, driver, base_url):
        """TC_REG_01: Verify successful patient registration with valid data."""
        driver.get(f"{base_url}/register")
        wait = WebDriverWait(driver, 10)

        timestamp = int(time.time() * 1000)
        unique_email = f"patient_{timestamp}@medibook.in"

        # Fill registration form with Maharashtrian patient details
        name_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]')))
        name_input.send_keys("Aarav Deshmukh")

        driver.find_element(By.CSS_SELECTOR, '[data-testid="email-input"]').send_keys(unique_email)
        driver.find_element(By.CSS_SELECTOR, '[data-testid="phone-input"]').send_keys("9876543210")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]').send_keys("SecurePass123!")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="confirm-password-input"]').send_keys("SecurePass123!")

        reg_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="register-button"]')
        reg_btn.click()

        # Registration should succeed and navigate to patient dashboard
        wait.until(EC.url_contains("/dashboard"))
        assert "/dashboard" in driver.current_url

    def test_tc_reg_02_duplicate_email(self, driver, base_url):
        """TC_REG_02: Verify rejection of registration with an already registered email."""
        driver.get(f"{base_url}/register")
        wait = WebDriverWait(driver, 10)

        # Existing seeded patient email
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]'))).send_keys("Tanvi Patil")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="email-input"]').send_keys("patient@medibook.com")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="phone-input"]').send_keys("9876543211")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]').send_keys("Password123!")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="confirm-password-input"]').send_keys("Password123!")

        driver.find_element(By.CSS_SELECTOR, '[data-testid="register-button"]').click()

        err_banner = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="register-error"]')))
        assert "already exists" in err_banner.text.lower()

    def test_tc_reg_03_empty_fields(self, driver, base_url):
        """TC_REG_03: Verify form submission with empty fields is blocked."""
        driver.get(f"{base_url}/register")
        wait = WebDriverWait(driver, 10)

        reg_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="register-button"]')))
        reg_btn.click()

        err_banner = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="register-error"]')))
        assert "required" in err_banner.text.lower()

    def test_tc_reg_04_invalid_email(self, driver, base_url):
        """TC_REG_04: Verify rejection of invalid email format."""
        driver.get(f"{base_url}/register")
        wait = WebDriverWait(driver, 10)

        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]'))).send_keys("Rohan Shinde")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="email-input"]').send_keys("notanemail_address")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="phone-input"]').send_keys("9876543210")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]').send_keys("Password123!")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="confirm-password-input"]').send_keys("Password123!")

        driver.find_element(By.CSS_SELECTOR, '[data-testid="register-button"]').click()

        err_banner = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="register-error"]')))
        assert "valid email" in err_banner.text.lower()

    def test_tc_reg_05_invalid_phone_number(self, driver, base_url):
        """TC_REG_05: Verify phone number must be exactly 10 digits."""
        driver.get(f"{base_url}/register")
        wait = WebDriverWait(driver, 10)

        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="name-input"]'))).send_keys("Siddhesh Joshi")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="email-input"]').send_keys("siddhesh@example.com")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="phone-input"]').send_keys("98765") # only 5 digits
        driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]').send_keys("Password123!")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="confirm-password-input"]').send_keys("Password123!")

        driver.find_element(By.CSS_SELECTOR, '[data-testid="register-button"]').click()

        err_banner = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="register-error"]')))
        assert "10 digits" in err_banner.text.lower()

