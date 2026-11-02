import os
import sys
import time
import subprocess
import requests
import pytest
from datetime import datetime

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

BASE_URL = os.environ.get("MEDIBOOK_FRONTEND_URL", "http://localhost:5173")
API_URL = os.environ.get("MEDIBOOK_API_URL", "http://127.0.0.1:5000")
HEADLESS = os.environ.get("SELENIUM_HEADLESS", "true").lower() == "true"
CHROMEDRIVER_PATH = os.path.expanduser(r"~\.cache\selenium\chromedriver\win64\156.0.8078.80\chromedriver.exe")

SCREENSHOTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'screenshots'))
REPORTS_SCREENSHOTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'reports', 'screenshots'))
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
os.makedirs(REPORTS_SCREENSHOTS_DIR, exist_ok=True)


@pytest.fixture(scope="session", autouse=True)
def manage_servers():
    """Ensures backend and frontend servers are alive for the test run."""
    backend_proc = None
    frontend_proc = None

    # 1. Check / Start Backend
    backend_running = False
    try:
        r = requests.get(f"{API_URL}/api/health", timeout=1.5)
        if r.status_code == 200:
            backend_running = True
    except Exception:
        backend_running = False

    if not backend_running:
        backend_proc = subprocess.Popen(
            [sys.executable, "app.py"],
            cwd=backend_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        # Wait for backend health
        for _ in range(15):
            time.sleep(0.5)
            try:
                r = requests.get(f"{API_URL}/api/health", timeout=1)
                if r.status_code == 200:
                    break
            except Exception:
                pass

    # 2. Check / Start Frontend
    frontend_running = False
    try:
        r = requests.get(BASE_URL, timeout=1.5)
        if r.status_code in (200, 304):
            frontend_running = True
    except Exception:
        frontend_running = False

    if not frontend_running:
        frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
        frontend_proc = subprocess.Popen(
            ["npm.cmd", "run", "preview", "--", "--port", "5173", "--strictPort"],
            cwd=frontend_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        for _ in range(15):
            time.sleep(0.5)
            try:
                r = requests.get(BASE_URL, timeout=1)
                if r.status_code in (200, 304):
                    break
            except Exception:
                pass

    yield

    # Teardown processes if started by this session
    if backend_proc:
        backend_proc.terminate()
        try:
            backend_proc.wait(timeout=3)
        except Exception:
            backend_proc.kill()

    if frontend_proc:
        frontend_proc.terminate()
        try:
            frontend_proc.wait(timeout=3)
        except Exception:
            frontend_proc.kill()


@pytest.fixture(scope="function")
def driver(request):
    """Initializes Google Chrome WebDriver with test options."""
    if not SELENIUM_AVAILABLE:
        pytest.skip("Selenium WebDriver is not installed.")

    options = Options()
    if HEADLESS:
        options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1280,800")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    service = Service(CHROMEDRIVER_PATH) if os.path.exists(CHROMEDRIVER_PATH) else None

    if service:
        driver_instance = webdriver.Chrome(service=service, options=options)
    else:
        driver_instance = webdriver.Chrome(options=options)

    driver_instance.implicitly_wait(6)

    # Attach driver to request node for screenshot hook
    request.node.driver = driver_instance

    yield driver_instance

    driver_instance.quit()


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def api_url():
    return API_URL


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Capture screenshot on test failure and attach to HTML report."""
    outcome = yield
    report = outcome.get_result()

    if report.when == "call" and report.failed:
        driver_instance = getattr(item, "driver", None)
        if driver_instance:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            sanitized_name = item.name.replace("[", "_").replace("]", "_").replace("/", "_")
            filename = f"FAIL_{sanitized_name}_{timestamp}.png"
            filepath = os.path.join(SCREENSHOTS_DIR, filename)
            reports_path = os.path.join(REPORTS_SCREENSHOTS_DIR, filename)

            try:
                driver_instance.save_screenshot(filepath)
                driver_instance.save_screenshot(reports_path)
                # Attach to pytest-html if available
                pytest_html = item.config.pluginmanager.getplugin('html')
                if pytest_html:
                    extra = getattr(report, 'extra', [])
                    extra.append(pytest_html.extras.image(reports_path))
                    report.extra = extra
            except Exception as e:
                print(f"Failed to capture screenshot: {e}")
