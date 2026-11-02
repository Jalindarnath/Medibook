import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestAccessControl:
    """
    STQA Automated Test Cases: Access Control, Role-Based Routing & Session Guards
    """

    def test_tc_acc_01_prevent_normal_users_from_accessing_admin_pages(self, driver, base_url):
        """TC_ACC_01: Verify authenticated patient is prevented from accessing /admin."""
        # 1. Login as standard patient
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

        # 2. Try to directly navigate to /admin
        driver.get(f"{base_url}/admin")

        # 3. Patient should be redirected back to /dashboard
        wait.until(EC.url_contains("/dashboard"))
        assert "/dashboard" in driver.current_url
        assert "/admin" not in driver.current_url

    def test_tc_acc_02_prevent_unauthenticated_access_to_protected_pages(self, driver, base_url):
        """TC_ACC_02: Verify unauthenticated visitor cannot access protected routes without signing in."""
        wait = WebDriverWait(driver, 10)

        # Clear any stored credentials/session
        driver.get(f"{base_url}/")
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")

        # Attempt to access /dashboard directly
        driver.get(f"{base_url}/dashboard")
        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url

        # Attempt to access /book directly
        driver.get(f"{base_url}/book")
        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url

        # Attempt to access /my-appointments directly
        driver.get(f"{base_url}/my-appointments")
        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url

        # Attempt to access /admin directly
        driver.get(f"{base_url}/admin")
        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url

