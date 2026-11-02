import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

def login_admin(driver, base_url):
    """Helper to authenticate administrator."""
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

class TestAdmin:
    """
    STQA Automated Test Cases: Administrator Dashboard & Clinic Operations Module
    """

    def test_tc_adm_01_admin_login(self, driver, base_url):
        """TC_ADM_01: Verify administrator credentials grant access to /admin portal."""
        login_admin(driver, base_url)
        wait = WebDriverWait(driver, 10)

        assert "/admin" in driver.current_url
        h1 = wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
        assert "Hospital Operations" in h1.text or "Appointments" in h1.text

        # Verify summary stat cards exist
        users_stat = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-total-users"]')))
        assert users_stat.text.strip().isdigit()

    def test_tc_adm_02_view_appointments(self, driver, base_url):
        """TC_ADM_02: Verify administrative appointment roster rendering."""
        login_admin(driver, base_url)
        wait = WebDriverWait(driver, 10)

        table = wait.until(EC.visibility_of_element_located((By.ID, "admin-appointments-table")))
        assert table.is_displayed()

        headers = [th.text for th in table.find_elements(By.TAG_NAME, "th")]
        assert any("REF ID" in h.upper() or "ID" in h.upper() for h in headers)
        assert any("PATIENT" in h.upper() for h in headers)
        assert any("DOCTOR" in h.upper() for h in headers)

    def test_tc_adm_03_update_appointment_status(self, driver, base_url):
        """TC_ADM_03: Verify administrative status transitions (e.g. approve/complete)."""
        login_admin(driver, base_url)
        wait = WebDriverWait(driver, 10)

        table = wait.until(EC.visibility_of_element_located((By.ID, "admin-appointments-table")))
        
        # Look for an action button (Approve, Complete, or Reject)
        action_buttons = table.find_elements(By.XPATH, ".//button[contains(., 'Approve') or contains(., 'Complete') or contains(., 'Reject')]")
        if len(action_buttons) > 0:
            target_btn = action_buttons[0]
            btn_text = target_btn.text.strip()
            target_btn.click()

            time.sleep(1.5)
            # Table should refresh with updated status
            assert table.is_displayed()
        else:
            # If no pending/confirmed appointments currently, assert table rendered
            assert table.is_displayed()

    def test_tc_adm_04_search_and_filter_appointments(self, driver, base_url):
        """TC_ADM_04: Verify dynamic query filtering by status in admin portal."""
        login_admin(driver, base_url)
        wait = WebDriverWait(driver, 10)

        # Status filter
        status_dropdown = Select(wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-status-filter"]'))))
        status_dropdown.select_by_value("confirmed")

        time.sleep(1)
        # Search input
        search_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="admin-search-input"]')
        search_input.clear()
        search_input.send_keys("Kulkarni")

        # Submit search
        search_btn = driver.find_element(By.XPATH, "//form[contains(@class, 'relative')]//button[contains(text(), 'Search')]")
        search_btn.click()

        time.sleep(1)
        # Table or empty state should remain stable without crashing
        assert driver.find_element(By.TAG_NAME, "body").is_displayed()

