# Selenium Test Suite Directory

This directory is reserved for automated end-to-end testing scripts using:
- **Python 3.x**
- **Selenium WebDriver**
- **Pytest**
- **Google Chrome / ChromeDriver**

## Test Automation Guidelines

All frontend interactive elements contain stable `data-testid` attributes to facilitate robust selector locating:

| Element | Selector / data-testid |
|---------|-------------------------|
| Email input | `[data-testid="email-input"]` |
| Password input | `[data-testid="password-input"]` |
| Login button | `[data-testid="login-button"]` |
| Register button | `[data-testid="register-button"]` |
| Name input | `[data-testid="name-input"]` |
| Phone input | `[data-testid="phone-input"]` |
| Category dropdown | `[data-testid="appointment-category"]` |
| Doctor select | `[data-testid="doctor-select"]` |
| Date picker | `[data-testid="appointment-date"]` |
| Time slot | `[data-testid="appointment-time"]` |
| Reason input | `[data-testid="reason-input"]` |
| Book button | `[data-testid="book-appointment-button"]` |
| Cancel button | `[data-testid="cancel-appointment-button"]` |
| Status badges | `[data-testid^="status-badge-"]` |

## Test Automation Reset Procedure

Before executing an automated test run, developers or test runners can reset the SQLite database to a known baseline state by calling:
- **POST** `http://127.0.0.1:5000/api/admin/reset-db` (with Admin Bearer token)
- Or simply by clicking **Reset Test DB** in the Admin Portal UI.
