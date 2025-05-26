import { test, expect, Page } from '@playwright/test';
import { E2E_CONFIG, generateUniqueTestData } from './config';

export { test, expect };

// Helper functions
export const helpers = {
    // Login as admin user
    loginAsAdmin: async (page: Page) => {
        await page.goto(E2E_CONFIG.routes.login);
        await page.fill(E2E_CONFIG.selectors.emailInput, E2E_CONFIG.auth.email);
        await page.fill(E2E_CONFIG.selectors.passwordInput, E2E_CONFIG.auth.password);
        await page.click(E2E_CONFIG.selectors.loginButton);
        await page.waitForURL(E2E_CONFIG.routes.dashboard);
    },

    // Navigate to owners page
    navigateToOwners: async (page: Page) => {
        await page.click(E2E_CONFIG.selectors.ownersMenu);
        await page.waitForURL(E2E_CONFIG.routes.owners);
    },

    // Wait for element to be visible
    waitForElement: async (page: Page, selector: string, timeout = E2E_CONFIG.timeouts.medium) => {
        await page.waitForSelector(selector, { state: 'visible', timeout });
    },

    // Fill form field with validation
    fillField: async (page: Page, selector: string, value: string) => {
        await page.fill(selector, value);
        await expect(page.locator(selector)).toHaveValue(value);
    },

    // Click and wait for navigation
    clickAndWait: async (page: Page, selector: string, url?: string) => {
        await page.click(selector);
        if (url) {
            await page.waitForURL(url, { timeout: E2E_CONFIG.timeouts.navigation });
        }
    },

    // Generate unique test data
    generateTestData: generateUniqueTestData,

    // Wait for loading to disappear
    waitForLoadingToDisappear: async (page: Page) => {
        try {
            await page.waitForSelector(E2E_CONFIG.selectors.loading, {
                state: 'hidden',
                timeout: E2E_CONFIG.timeouts.medium
            });
        } catch {
            // Loading element might not exist, which is fine
        }
    },

    // Check for error messages
    checkForErrors: async (page: Page) => {
        const errorElement = page.locator(E2E_CONFIG.selectors.errorMessage);
        const isVisible = await errorElement.isVisible();
        if (isVisible) {
            const errorText = await errorElement.textContent();
            console.warn('Error message found:', errorText);
        }
        return isVisible;
    }
}; 
