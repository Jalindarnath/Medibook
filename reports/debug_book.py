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
    print('Logged in, URL:', driver.current_url)

    driver.get('http://localhost:5173/book')
    time.sleep(2)
    print('Book URL:', driver.current_url)

    # Check input values
    name_val = driver.find_element(By.CSS_SELECTOR, '[data-testid="name-input"]').get_attribute('value')
    phone_val = driver.find_element(By.CSS_SELECTOR, '[data-testid="phone-input"]').get_attribute('value')
    cat_val = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-category"]').get_attribute('value')
    doc_val = driver.find_element(By.CSS_SELECTOR, '[data-testid="doctor-select"]').get_attribute('value')
    date_val = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-date"]').get_attribute('value')
    time_val = driver.find_element(By.CSS_SELECTOR, '[data-testid="appointment-time"]').get_attribute('value')
    reason_val = driver.find_element(By.CSS_SELECTOR, '[data-testid="reason-input"]').get_attribute('value')

    print(f"Form values: name='{name_val}', phone='{phone_val}', cat='{cat_val}', doc='{doc_val}', date='{date_val}', time='{time_val}', reason='{reason_val}'")

    btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="book-appointment-button"]')
    print('Button text:', btn.text, 'enabled:', btn.is_enabled())
    
    # Click button
    btn.click()
    time.sleep(1)

    errors = driver.find_elements(By.CSS_SELECTOR, '[data-testid="booking-error"]')
    print('Error elements count:', len(errors))
    if errors:
        print('Error text:', errors[0].text)
    else:
        print('No error banner found after click.')
        # Check logs
        print('Console logs:')
        for log in driver.get_log('browser'):
            print(log)

except Exception as e:
    print('Exception:', e)
finally:
    driver.quit()
