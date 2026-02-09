from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})

    # Dashboard
    page.goto('http://localhost:3000/dashboard')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    page.screenshot(path='/tmp/dashboard.png', full_page=True)

    # Projects
    page.goto('http://localhost:3000/projects')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)
    page.screenshot(path='/tmp/projects.png', full_page=True)

    # Matching
    page.goto('http://localhost:3000/matching')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)
    page.screenshot(path='/tmp/matching.png', full_page=True)

    # Settings
    page.goto('http://localhost:3000/settings')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)
    page.screenshot(path='/tmp/settings.png', full_page=True)

    print("Screenshots saved")
    browser.close()
