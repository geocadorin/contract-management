import { test, expect } from '@playwright/test';

test.describe('Real Estate Management', () => {
    test('should list real estates', async ({ page }) => {
        await page.goto('http://localhost:3000/real-estates');
        const realEstateList = await page.locator('table tbody tr');
        await expect(realEstateList).toHaveCount(1);
    });

    // Adicione mais testes para criação, edição e exclusão
}); 
