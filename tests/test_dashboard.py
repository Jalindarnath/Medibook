import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def login_patient(driver, base_url):
    """Helper function to log in as patient."""
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

class TestDashboard:
    """
    STQA Automated Test Cases: Patient Dashboard Module
    """

    def test_tc_dash_01_dashboard_loading(self, driver, base_url):
        """TC_DASH_01: Verify dashboard elements and greeting load successfully."""
        login_patient(driver, base_url)
        wait = WebDriverWait(driver, 10)

        # Verify page title / greeting
        greeting = wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
        assert "Welcome back" in greeting.text
        assert "Aarav Deshmukh" in greeting.text

        # Verify profile card elements
        email_elem = driver.find_element(By.XPATH, "//*[contains(text(), 'patient@medibook.com')]")
        assert email_elem.is_displayed()

    def test_tc_dash_02_appointment_statistics(self, driver, base_url):
        """TC_DASH_02: Verify 4 statistic counters render numeric values."""
        login_patient(driver, base_url)
        wait = WebDriverWait(driver, 10)

        # Wait for stats elements
        total_stat = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="stat-total-appointments"]')))
        upcoming_stat = driver.find_element(By.CSS_SELECTOR, '[data-testid="stat-upcoming-appointments"]')
        completed_stat = driver.find_element(By.CSS_SELECTOR, '[data-testid="stat-completed-appointments"]')
        cancelled_stat = driver.find_element(By.CSS_SELECTOR, '[data-testid="stat-cancelled-appointments"]')

        # Verify values are numeric strings
        assert total_stat.text.strip().isdigit()
        assert upcoming_stat.text.strip().isdigit()
        assert completed_stat.text.strip().isdigit()
        assert cancelled_stat.text.strip().isdigit()

    def test_tc_dash_03_navigation(self, driver, base_url):
        """TC_DASH_03: Verify quick action CTA navigates from dashboard to Book Appointment page."""
        login_patient(driver, base_url)
        wait = WebDriverWait(driver, 10)

        book_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="dashboard-book-button"]')))
        book_btn.click()

        wait.until(EC.url_contains("/book"))
        assert "/book" in driver.current_url

        page_heading = wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
        assert "Schedule Your Appointment" in page_heading.text

