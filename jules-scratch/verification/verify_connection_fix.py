from playwright.sync_api import sync_playwright, expect, Page

def verify_changes(page: Page):
    """
    This script verifies that the connection page is responsive and that
    the scan button does not cause a crash.
    """

    # Listen for console events and print them
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    # Navigate to the connections page
    # I'll use the port from the last successful server start
    page.goto("http://127.0.0.1:8082/connections", wait_until="networkidle")

    # Set a mobile viewport
    page.set_viewport_size({"width": 375, "height": 667})

    # Find the scan button and click it
    scan_button = page.get_by_role("button", name="Scan for Devices")
    expect(scan_button).to_be_visible()
    scan_button.click()

    # Wait for the UI to update
    page.wait_for_timeout(3000)

    # Take a screenshot to verify the layout and state
    page.screenshot(path="jules-scratch/verification/connection_fix_verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_changes(page)
        browser.close()

if __name__ == "__main__":
    main()
