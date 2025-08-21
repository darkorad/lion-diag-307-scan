from playwright.sync_api import sync_playwright, expect, Page

def verify_changes(page: Page):
    """
    This script verifies the main layout to prevent content from
    overlapping with the bottom nav bar.
    The Bluetooth fix cannot be verified in this environment because it
    depends on native device features.
    """

    # Listen for console events and print them
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    # Navigate to the dashboard page
    page.goto("http://127.0.0.1:8082/", wait_until="networkidle")

    # Give the page a moment to load
    page.wait_for_timeout(3000)

    # Set a mobile viewport to test the layout fix
    page.set_viewport_size({"width": 375, "height": 667})

    # Take a screenshot to verify the layout
    page.screenshot(path="jules-scratch/verification/verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_changes(page)
        browser.close()

if __name__ == "__main__":
    main()
