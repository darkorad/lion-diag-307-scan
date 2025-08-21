from playwright.sync_api import sync_playwright, expect, Page

def verify_changes(page: Page):
    """
    This script verifies that the "Quick Connect" tab is functional.
    """

    # Listen for console events and print them
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    # Navigate to the connections page
    page.goto("http://127.0.0.1:8084/connections", wait_until="networkidle")

    # Set a mobile viewport
    page.set_viewport_size({"width": 375, "height": 667})

    # Click the "Quick Connect" tab
    quick_connect_tab = page.get_by_role("tab", name="Quick Connect")
    expect(quick_connect_tab).to_be_visible()
    quick_connect_tab.click()

    # Find the scan button in the tab panel and click it
    scan_button = page.locator('div[role="tabpanel"][data-state="active"] button:has-text("Scan for Devices")')
    expect(scan_button).to_be_visible()
    scan_button.click()

    # Wait for the UI to update
    page.wait_for_timeout(2000)

    # Take a screenshot to verify the layout and state
    page.screenshot(path="jules-scratch/verification/quick_connect_verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_changes(page)
        browser.close()

if __name__ == "__main__":
    main()
