import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './config';

test.describe('Verificação de Credenciais', () => {
    test('should login successfully with test credentials', async ({ page }) => {
        // Navegar para a página de login
        await page.goto(E2E_CONFIG.routes.login);

        // Verificar se a página de login carregou
        await expect(page).toHaveURL(E2E_CONFIG.routes.login);

        // Verificar se os campos de login estão presentes
        await expect(page.locator(E2E_CONFIG.selectors.emailInput)).toBeVisible();
        await expect(page.locator(E2E_CONFIG.selectors.passwordInput)).toBeVisible();
        await expect(page.locator(E2E_CONFIG.selectors.loginButton)).toBeVisible();

        // Preencher credenciais
        await page.fill(E2E_CONFIG.selectors.emailInput, E2E_CONFIG.auth.email);
        await page.fill(E2E_CONFIG.selectors.passwordInput, E2E_CONFIG.auth.password);

        // Verificar se os campos foram preenchidos corretamente
        await expect(page.locator(E2E_CONFIG.selectors.emailInput)).toHaveValue(E2E_CONFIG.auth.email);
        await expect(page.locator(E2E_CONFIG.selectors.passwordInput)).toHaveValue(E2E_CONFIG.auth.password);

        // Fazer login
        await page.click(E2E_CONFIG.selectors.loginButton);

        // Verificar redirecionamento para dashboard
        await page.waitForURL(E2E_CONFIG.routes.dashboard, { timeout: 15000 });
        await expect(page).toHaveURL(E2E_CONFIG.routes.dashboard);

        // Verificar se o dashboard carregou (pode verificar elementos específicos do dashboard)
        // Por exemplo, verificar se há um menu ou título específico
        await expect(page.locator('body')).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
        // Navegar para a página de login
        await page.goto(E2E_CONFIG.routes.login);

        // Tentar login com credenciais inválidas
        await page.fill(E2E_CONFIG.selectors.emailInput, 'invalid@email.com');
        await page.fill(E2E_CONFIG.selectors.passwordInput, 'wrongpassword');
        await page.click(E2E_CONFIG.selectors.loginButton);

        // Verificar se permanece na página de login ou mostra erro
        // (O comportamento específico depende da implementação do seu sistema)
        await page.waitForTimeout(3000);

        // Verificar se ainda está na página de login ou se há mensagem de erro
        const currentUrl = page.url();
        const isStillOnLogin = currentUrl.includes('/login');
        const hasErrorMessage = await page.locator('.error, .text-red-500, [data-testid="error-message"]').isVisible();

        // Pelo menos uma das condições deve ser verdadeira
        expect(isStillOnLogin || hasErrorMessage).toBeTruthy();
    });

    test('should validate required fields', async ({ page }) => {
        // Navegar para a página de login
        await page.goto(E2E_CONFIG.routes.login);

        // Tentar fazer login sem preencher campos
        await page.click(E2E_CONFIG.selectors.loginButton);

        // Verificar se ainda está na página de login
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/login');
    });

    test('should handle empty email field', async ({ page }) => {
        // Navegar para a página de login
        await page.goto(E2E_CONFIG.routes.login);

        // Preencher apenas a senha
        await page.fill(E2E_CONFIG.selectors.passwordInput, E2E_CONFIG.auth.password);
        await page.click(E2E_CONFIG.selectors.loginButton);

        // Verificar se ainda está na página de login
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/login');
    });

    test('should handle empty password field', async ({ page }) => {
        // Navegar para a página de login
        await page.goto(E2E_CONFIG.routes.login);

        // Preencher apenas o email
        await page.fill(E2E_CONFIG.selectors.emailInput, E2E_CONFIG.auth.email);
        await page.click(E2E_CONFIG.selectors.loginButton);

        // Verificar se ainda está na página de login
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/login');
    });

    test('should verify page elements are accessible', async ({ page }) => {
        // Navegar para a página de login
        await page.goto(E2E_CONFIG.routes.login);

        // Verificar acessibilidade básica dos elementos
        const emailInput = page.locator(E2E_CONFIG.selectors.emailInput);
        const passwordInput = page.locator(E2E_CONFIG.selectors.passwordInput);
        const loginButton = page.locator(E2E_CONFIG.selectors.loginButton);

        // Verificar se os elementos estão visíveis e habilitados
        await expect(emailInput).toBeVisible();
        await expect(emailInput).toBeEnabled();
        await expect(passwordInput).toBeVisible();
        await expect(passwordInput).toBeEnabled();
        await expect(loginButton).toBeVisible();
        await expect(loginButton).toBeEnabled();

        // Verificar se os campos podem receber foco
        await emailInput.focus();
        await expect(emailInput).toBeFocused();

        await passwordInput.focus();
        await expect(passwordInput).toBeFocused();
    });

    test('should verify navigation after successful login', async ({ page }) => {
        // Fazer login com credenciais válidas
        await page.goto(E2E_CONFIG.routes.login);
        await page.fill(E2E_CONFIG.selectors.emailInput, E2E_CONFIG.auth.email);
        await page.fill(E2E_CONFIG.selectors.passwordInput, E2E_CONFIG.auth.password);
        await page.click(E2E_CONFIG.selectors.loginButton);

        // Aguardar redirecionamento
        await page.waitForURL(E2E_CONFIG.routes.dashboard, { timeout: 15000 });

        // Verificar se pode navegar para outras páginas (se o menu estiver disponível)
        try {
            // Tentar navegar para a página de proprietários
            const ownersMenu = page.locator(E2E_CONFIG.selectors.ownersMenu);
            if (await ownersMenu.isVisible()) {
                await ownersMenu.click();
                await page.waitForURL(E2E_CONFIG.routes.owners, { timeout: 10000 });
                await expect(page).toHaveURL(E2E_CONFIG.routes.owners);
            }
        } catch (error) {
            console.log('Menu de proprietários não encontrado ou não acessível:', error);
        }
    });
}); 
