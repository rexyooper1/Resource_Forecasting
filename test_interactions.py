from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})

    # Test 1: Role switcher dropdown
    print("=== Test 1: Role Switcher ===")
    page.goto('http://localhost:3000/dashboard')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    # Click the role switcher button
    role_btn = page.locator('text=Viewing as')
    if role_btn.count() > 0:
        role_btn.first.click()
        page.wait_for_timeout(500)
        page.screenshot(path='/tmp/role_switcher_open.png', full_page=True)
        print("Role switcher clicked, screenshot saved")

        # Try clicking BD Program Manager
        bd_option = page.locator('text=BD Program Manager')
        if bd_option.count() > 0:
            bd_option.first.click()
            page.wait_for_timeout(1000)
            page.screenshot(path='/tmp/role_switched.png', full_page=True)
            print("Switched to BD Manager role")
        else:
            print("BD Program Manager option not found")
    else:
        print("Role switcher button not found")

    # Switch back to eng_manager
    role_btn2 = page.locator('text=Viewing as')
    if role_btn2.count() > 0:
        role_btn2.first.click()
        page.wait_for_timeout(500)
        eng_option = page.locator('text=Engineering Manager')
        if eng_option.count() > 0:
            eng_option.first.click()
            page.wait_for_timeout(500)

    # Test 2: Matching page Select dropdown
    print("\n=== Test 2: Matching Select ===")
    page.goto('http://localhost:3000/matching')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    # Click the Select trigger
    select_trigger = page.locator('[role="combobox"]')
    if select_trigger.count() > 0:
        select_trigger.first.click()
        page.wait_for_timeout(500)
        page.screenshot(path='/tmp/matching_select_open.png', full_page=True)
        print("Select opened, screenshot saved")

        # Try clicking first option
        options = page.locator('[role="option"]')
        print(f"Found {options.count()} options")
        if options.count() > 0:
            options.first.click()
            page.wait_for_timeout(1000)
            page.screenshot(path='/tmp/matching_selected.png', full_page=True)
            print("Project selected, screenshot saved")
    else:
        print("Select trigger not found")

    # Test 3: Project detail link
    print("\n=== Test 3: Project Detail ===")
    page.goto('http://localhost:3000/projects')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    # Click first project card
    project_link = page.locator('a[href^="/projects/proj-"]')
    if project_link.count() > 0:
        project_link.first.click()
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='/tmp/project_detail.png', full_page=True)
        print(f"Project detail page loaded: {page.url}")
        # Check for errors
        error_text = page.locator('text=error').count()
        print(f"Error elements on page: {error_text}")
    else:
        print("No project links found")

    # Also capture browser console errors
    print("\n=== Console Errors ===")
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.goto('http://localhost:3000/dashboard')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    for err in errors:
        print(f"Console error: {err}")
    if not errors:
        print("No console errors")

    browser.close()
    print("\nDone!")
