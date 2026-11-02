from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time, os

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--window-size=1280,800')
service = Service(os.path.expanduser(r'~\.cache\selenium\chromedriver\win64\156.0.8078.80\chromedriver.exe'))
driver = webdriver.Chrome(service=service, options=opts)

try:
    driver.get('http://localhost:5173/login')
    wait = WebDriverWait(driver, 10)
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="email-input"]'))).send_keys('patient@medibook.com')
    driver.find_element(By.CSS_SELECTOR, '[data-testid="password-input"]').send_keys('Patient123!')
    driver.find_element(By.CSS_SELECTOR, '[data-testid="login-button"]').click()
    wait.until(EC.url_contains('/dashboard'))

    driver.get('http://localhost:5173/book')
    time.sleep(2)

    # Click first available slot button
    slot_btns = driver.find_elements(By.XPATH, "//button[contains(@class, 'cursor-pointer') and contains(text(), 'M')]")
    print('Slot buttons count:', len(slot_btns))
    if slot_btns:
        print('Clicking slot:', slot_btns[0].text)
        driver.execute_script("arguments[0].click();", slot_btns[0])
    
    # Fill reason
    reason_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="reason-input"]')
    reason_input.send_keys("Automated test consultation for routine evaluation.")

    # Submit
    btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="book-appointment-button"]')
    driver.execute_script("arguments[0].click();", btn)
    time.sleep(2)

    print('Current URL:', driver.current_url)
    errs = driver.find_elements(By.CSS_SELECTOR, '[data-testid="booking-error"]')
    if errs:
        print('Error on page:', errs[0].text)
    else:
        print('No error element.')

    # Check network responses or console
    print('Console logs:')
    for log in driver.get_log('browser'):
        print(log)

finally:
    driver.quit()
