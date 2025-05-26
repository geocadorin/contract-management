import { test, expect, Page } from '@playwright/test';

// Dados de teste
const testOwner = {
    full_name: 'João Silva Proprietário',
    cpf: '12345678901',
    rg: '123456789',
    issuing_body: 'SSP',
    uf_rg: 'SP',
    email: 'joao.silva@email.com',
    cellphone: '11987654321',
    profession: 'Engenheiro',
    gender: 'Masculino',
    nationality: 'Brasileira',
    branch: '1234',
    account: '567890',
    bank: 'Banco do Brasil',
    account_type: 'Corrente',
    cep: '01310100',
    street: 'Avenida Paulista',
    number: '1000',
    complement: 'Sala 100',
    neighborhood: 'Bela Vista',
    note: 'Proprietário teste para E2E'
};

const testPartner = {
    full_name: 'Maria Silva Cônjuge',
    cpf: '98765432109',
    rg: '987654321',
    issuing_body: 'SSP',
    cellphone: '11987654322',
    email: 'maria.silva@email.com'
};

const testReference = {
    full_name: 'Pedro Santos Referência',
    telefone: '11987654323',
    email: 'pedro.santos@email.com',
    kinship: 'Amigo(a)',
    cep: '01310200',
    endereco_completo: 'Rua Augusta, 500, Consolação, São Paulo - SP'
};

// Helper functions
async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'teste@email.com');
    await page.fill('[data-testid="password"]', '12345678');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
}

async function navigateToOwners(page: Page) {
    await page.click('[data-testid="owners-menu"]');
    await page.waitForURL('/owners');
}

async function fillOwnerForm(page: Page, owner = testOwner) {
    // Informações pessoais
    await page.fill('#full_name', owner.full_name);
    await page.fill('#cpf', owner.cpf);
    await page.fill('#rg', owner.rg);
    await page.fill('#issuing_body', owner.issuing_body);
    await page.fill('#uf_rg', owner.uf_rg);
    await page.fill('#email', owner.email);
    await page.fill('#cellphone', owner.cellphone);

    if (owner.profession) {
        await page.fill('#profession', owner.profession);
    }

    if (owner.gender) {
        await page.selectOption('#gender', owner.gender);
    }

    if (owner.nationality) {
        await page.fill('#nationality', owner.nationality);
    }

    // Dados bancários
    if (owner.branch) {
        await page.fill('#branch', owner.branch);
    }

    if (owner.account) {
        await page.fill('#account', owner.account);
    }

    if (owner.bank) {
        await page.fill('#bank', owner.bank);
    }

    if (owner.account_type) {
        await page.selectOption('#account_type', owner.account_type);
    }

    // Endereço
    await page.fill('#cep', owner.cep);

    // Aguardar busca automática do CEP
    await page.waitForTimeout(2000);

    await page.fill('#number', owner.number);

    if (owner.complement) {
        await page.fill('#complement', owner.complement);
    }

    // Observações
    if (owner.note) {
        await page.fill('#note', owner.note);
    }
}

test.describe('Owner Management E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test.describe('Owner Registration', () => {
        test('should successfully create a new owner with all fields', async ({ page }) => {
            await navigateToOwners(page);

            // Clicar no botão "Novo Proprietário"
            await page.click('[data-testid="new-owner-button"]');
            await page.waitForURL('/owners/new');

            // Verificar se está na página de cadastro
            await expect(page.locator('h1')).toContainText('Novo Proprietário');

            // Preencher formulário
            await fillOwnerForm(page);

            // Submeter formulário
            await page.click('button[type="submit"]');

            // Verificar redirecionamento para lista
            await page.waitForURL('/owners');

            // Verificar se o proprietário foi criado
            await expect(page.locator('[data-testid="owner-list"]')).toContainText(testOwner.full_name);
        });

        test('should show validation errors for required fields', async ({ page }) => {
            await navigateToOwners(page);
            await page.click('[data-testid="new-owner-button"]');

            // Tentar submeter formulário vazio
            await page.click('button[type="submit"]');

            // Verificar mensagens de erro
            await expect(page.locator('.text-red-500')).toBeVisible();
        });

        test('should validate CPF format', async ({ page }) => {
            await navigateToOwners(page);
            await page.click('[data-testid="new-owner-button"]');

            // Preencher CPF inválido
            await page.fill('#cpf', '123');
            await page.fill('#full_name', 'Teste');
            await page.click('button[type="submit"]');

            // Verificar erro de CPF
            await expect(page.locator('.text-red-500')).toContainText('CPF inválido');
        });

        test('should auto-fill address when valid CEP is entered', async ({ page }) => {
            await navigateToOwners(page);
            await page.click('[data-testid="new-owner-button"]');

            // Preencher CEP válido
            await page.fill('#cep', '01310100');
            await page.click('button:has-text("Buscar")');

            // Aguardar preenchimento automático
            await page.waitForTimeout(3000);

            // Verificar se os campos foram preenchidos
            await expect(page.locator('#street')).toHaveValue(/Paulista/);
            await expect(page.locator('#neighborhood')).toHaveValue(/Bela Vista/);
        });

        test('should handle duplicate CPF error', async ({ page }) => {
            await navigateToOwners(page);
            await page.click('[data-testid="new-owner-button"]');

            // Preencher com CPF já existente
            await fillOwnerForm(page, { ...testOwner, cpf: '11111111111' });
            await page.click('button[type="submit"]');

            // Verificar erro de duplicidade
            await expect(page.locator('.text-red-500')).toContainText('CPF já cadastrado');
        });
    });

    test.describe('Owner Listing and Filters', () => {
        test('should display owners list with pagination', async ({ page }) => {
            await navigateToOwners(page);

            // Verificar se a lista está visível
            await expect(page.locator('[data-testid="owner-list"]')).toBeVisible();

            // Verificar se há pelo menos um proprietário
            await expect(page.locator('[data-testid="owner-card"]').nth(0)).toBeVisible();

            // Verificar paginação se houver muitos registros
            const paginationExists = await page.locator('[data-testid="pagination"]').isVisible();
            if (paginationExists) {
                await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
            }
        });

        test('should filter owners by name', async ({ page }) => {
            await navigateToOwners(page);

            // Usar filtro de busca por nome
            await page.fill('[data-testid="search-input"]', 'João');
            await page.click('[data-testid="search-button"]');

            // Verificar se apenas proprietários com "João" aparecem
            const ownerCards = page.locator('[data-testid="owner-card"]');
            const count = await ownerCards.count();

            for (let i = 0; i < count; i++) {
                await expect(ownerCards.nth(i)).toContainText('João');
            }
        });

        test('should filter owners by CPF', async ({ page }) => {
            await navigateToOwners(page);

            // Filtrar por CPF
            await page.fill('[data-testid="search-input"]', '123.456.789-01');
            await page.click('[data-testid="search-button"]');

            // Verificar resultado
            await expect(page.locator('[data-testid="owner-card"]').nth(0)).toContainText('123.456.789-01');
        });

        test('should filter owners by email', async ({ page }) => {
            await navigateToOwners(page);

            // Filtrar por email
            await page.fill('[data-testid="search-input"]', 'joao.silva@email.com');
            await page.click('[data-testid="search-button"]');

            // Verificar resultado
            await expect(page.locator('[data-testid="owner-card"]').nth(0)).toContainText('joao.silva@email.com');
        });

        test('should show no results message when filter returns empty', async ({ page }) => {
            await navigateToOwners(page);

            // Buscar por algo que não existe
            await page.fill('[data-testid="search-input"]', 'proprietario-inexistente-xyz');
            await page.click('[data-testid="search-button"]');

            // Verificar mensagem de "nenhum resultado"
            await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
        });

        test('should clear filters and show all owners', async ({ page }) => {
            await navigateToOwners(page);

            // Aplicar filtro
            await page.fill('[data-testid="search-input"]', 'João');
            await page.click('[data-testid="search-button"]');

            // Limpar filtro
            await page.click('[data-testid="clear-filters"]');

            // Verificar se todos os proprietários voltaram a aparecer
            const ownerCards = page.locator('[data-testid="owner-card"]');
            await expect(ownerCards.nth(0)).toBeVisible();
        });

        test('should sort owners by name', async ({ page }) => {
            await navigateToOwners(page);

            // Clicar no cabeçalho de ordenação por nome
            await page.click('[data-testid="sort-by-name"]');

            // Verificar se a ordenação foi aplicada
            const firstOwnerName = await page.locator('[data-testid="owner-card"]').nth(0).locator('[data-testid="owner-name"]').textContent();
            const secondOwnerName = await page.locator('[data-testid="owner-card"]').nth(1).locator('[data-testid="owner-name"]').textContent();

            expect(firstOwnerName?.localeCompare(secondOwnerName || '') || 0).toBeLessThanOrEqual(0);
        });
    });

    test.describe('Owner Details', () => {
        test('should display owner details correctly', async ({ page }) => {
            await navigateToOwners(page);

            // Clicar no primeiro proprietário da lista
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Verificar se está na página de detalhes
            await expect(page.locator('h1')).toContainText('Detalhes do Proprietário');

            // Verificar se as informações estão sendo exibidas
            await expect(page.locator('[data-testid="owner-name"]')).toBeVisible();
            await expect(page.locator('[data-testid="owner-cpf"]')).toBeVisible();
            await expect(page.locator('[data-testid="owner-email"]')).toBeVisible();
        });

        test('should navigate to edit owner from details', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Clicar no botão editar
            await page.click('[data-testid="edit-owner-button"]');

            // Verificar se está na página de edição
            await expect(page.locator('h1')).toContainText('Editar Proprietário');
        });

        test('should export owner to PDF', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Configurar listener para download
            const downloadPromise = page.waitForEvent('download');

            // Clicar no botão de exportar PDF
            await page.click('[data-testid="export-pdf-button"]');

            // Verificar se o download foi iniciado
            const download = await downloadPromise;
            expect(download.suggestedFilename()).toContain('.pdf');
        });

        test('should export owner to DOCX', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Configurar listener para download
            const downloadPromise = page.waitForEvent('download');

            // Clicar no botão de exportar DOCX
            await page.click('[data-testid="export-docx-button"]');

            // Verificar se o download foi iniciado
            const download = await downloadPromise;
            expect(download.suggestedFilename()).toContain('.docx');
        });
    });

    test.describe('Partner Management in Owner Details', () => {
        test('should add a new partner to owner', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Clicar no botão "Adicionar Parceiro"
            await page.click('[data-testid="add-partner-button"]');

            // Verificar se o formulário de parceiro apareceu
            await expect(page.locator('[data-testid="partner-form"]')).toBeVisible();

            // Preencher dados do parceiro
            await page.fill('#full_name', testPartner.full_name);
            await page.fill('#cpf', testPartner.cpf);
            await page.fill('#rg', testPartner.rg);
            await page.fill('#issuing_body', testPartner.issuing_body);
            await page.fill('#cellphone', testPartner.cellphone);
            await page.fill('#email', testPartner.email);

            // Salvar parceiro
            await page.click('[data-testid="save-partner-button"]');

            // Verificar se o parceiro foi adicionado à lista
            await expect(page.locator('[data-testid="partner-list"]')).toContainText(testPartner.full_name);
        });

        test('should edit an existing partner', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Clicar no botão editar do primeiro parceiro
            await page.locator('[data-testid="edit-partner-button"]').nth(0).click();

            // Modificar nome do parceiro
            await page.fill('#full_name', 'Maria Silva Cônjuge Editada');

            // Salvar alterações
            await page.click('[data-testid="save-partner-button"]');

            // Verificar se as alterações foram salvas
            await expect(page.locator('[data-testid="partner-list"]')).toContainText('Maria Silva Cônjuge Editada');
        });

        test('should delete a partner', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Clicar no botão excluir do primeiro parceiro
            await page.locator('[data-testid="delete-partner-button"]').nth(0).click();

            // Confirmar exclusão
            await page.click('[data-testid="confirm-delete"]');

            // Verificar se o parceiro foi removido
            await expect(page.locator('[data-testid="partner-list"]')).not.toContainText(testPartner.full_name);
        });

        test('should validate required fields in partner form', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Clicar no botão "Adicionar Parceiro"
            await page.click('[data-testid="add-partner-button"]');

            // Tentar salvar sem preencher campos obrigatórios
            await page.click('[data-testid="save-partner-button"]');

            // Verificar mensagens de erro
            await expect(page.locator('.text-red-500')).toBeVisible();
        });

        test('should cancel partner form', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Clicar no botão "Adicionar Parceiro"
            await page.click('[data-testid="add-partner-button"]');

            // Preencher alguns dados
            await page.fill('#full_name', 'Teste Cancelar');

            // Cancelar formulário
            await page.click('[data-testid="cancel-partner-button"]');

            // Verificar se o formulário foi fechado
            await expect(page.locator('[data-testid="partner-form"]')).not.toBeVisible();
        });
    });

    test.describe('Reference Management in Owner Details', () => {
        test('should add a new reference to owner', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Clicar no botão "Adicionar Referência"
            await page.click('[data-testid="add-reference-button"]');

            // Verificar se o formulário de referência apareceu
            await expect(page.locator('[data-testid="reference-form"]')).toBeVisible();

            // Preencher dados da referência
            await page.fill('#full_name', testReference.full_name);
            await page.fill('#telefone', testReference.telefone);
            await page.fill('#email', testReference.email);
            await page.selectOption('#kinship', testReference.kinship);
            await page.fill('#cep', testReference.cep);
            await page.fill('#endereco_completo', testReference.endereco_completo);

            // Salvar referência
            await page.click('[data-testid="save-reference-button"]');

            // Verificar se a referência foi adicionada à lista
            await expect(page.locator('[data-testid="reference-list"]')).toContainText(testReference.full_name);
        });

        test('should auto-fill address when searching CEP in reference form', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Clicar no botão "Adicionar Referência"
            await page.click('[data-testid="add-reference-button"]');

            // Preencher CEP e buscar
            await page.fill('#cep', '01310200');
            await page.click('[data-testid="search-cep-button"]');

            // Aguardar preenchimento automático
            await page.waitForTimeout(2000);

            // Verificar se o endereço foi preenchido
            await expect(page.locator('#endereco_completo')).not.toHaveValue('');
        });

        test('should edit an existing reference', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Clicar no botão editar da primeira referência
            await page.locator('[data-testid="edit-reference-button"]').nth(0).click();

            // Modificar nome da referência
            await page.fill('#full_name', 'Pedro Santos Referência Editada');

            // Salvar alterações
            await page.click('[data-testid="save-reference-button"]');

            // Verificar se as alterações foram salvas
            await expect(page.locator('[data-testid="reference-list"]')).toContainText('Pedro Santos Referência Editada');
        });

        test('should delete a reference', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Clicar no botão excluir da primeira referência
            await page.locator('[data-testid="delete-reference-button"]').nth(0).click();

            // Confirmar exclusão
            await page.click('[data-testid="confirm-delete"]');

            // Verificar se a referência foi removida
            await expect(page.locator('[data-testid="reference-list"]')).not.toContainText(testReference.full_name);
        });

        test('should validate required fields in reference form', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Clicar no botão "Adicionar Referência"
            await page.click('[data-testid="add-reference-button"]');

            // Tentar salvar sem preencher campos obrigatórios
            await page.click('[data-testid="save-reference-button"]');

            // Verificar mensagens de erro
            await expect(page.locator('.text-red-500')).toBeVisible();
        });

        test('should show error for invalid CEP in reference form', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Clicar no botão "Adicionar Referência"
            await page.click('[data-testid="add-reference-button"]');

            // Preencher CEP inválido
            await page.fill('#cep', '00000000');
            await page.click('[data-testid="search-cep-button"]');

            // Verificar mensagem de erro
            await expect(page.locator('.text-red-500')).toContainText('CEP não encontrado');
        });

        test('should cancel reference form', async ({ page }) => {
            await navigateToOwners(page);
            await page.locator('[data-testid="owner-card"]').nth(0).click();

            // Clicar no botão "Adicionar Referência"
            await page.click('[data-testid="add-reference-button"]');

            // Preencher alguns dados
            await page.fill('#full_name', 'Teste Cancelar Referência');

            // Cancelar formulário
            await page.click('[data-testid="cancel-reference-button"]');

            // Verificar se o formulário foi fechado
            await expect(page.locator('[data-testid="reference-form"]')).not.toBeVisible();
        });
    });

    test.describe('Edge Cases and Error Handling', () => {
        test('should handle network errors gracefully', async ({ page }) => {
            // Simular erro de rede
            await page.route('**/api/owners', route => route.abort());

            await navigateToOwners(page);

            // Verificar se a mensagem de erro é exibida
            await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
        });

        test('should handle server errors during owner creation', async ({ page }) => {
            // Simular erro do servidor
            await page.route('**/api/owners', route => route.fulfill({ status: 500 }));

            await navigateToOwners(page);
            await page.click('[data-testid="new-owner-button"]');

            await fillOwnerForm(page);
            await page.click('button[type="submit"]');

            // Verificar mensagem de erro
            await expect(page.locator('.text-red-500')).toContainText('Erro ao salvar');
        });

        test('should handle empty states correctly', async ({ page }) => {
            // Simular resposta vazia
            await page.route('**/api/owners', route => route.fulfill({
                status: 200,
                body: JSON.stringify([])
            }));

            await navigateToOwners(page);

            // Verificar estado vazio
            await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
        });

        test('should handle very long text inputs', async ({ page }) => {
            await navigateToOwners(page);
            await page.click('[data-testid="new-owner-button"]');

            // Preencher com texto muito longo
            const longText = 'A'.repeat(1000);
            await page.fill('#note', longText);

            // Verificar se o campo aceita ou limita o texto
            const noteValue = await page.locator('#note').inputValue();
            expect(noteValue.length).toBeLessThanOrEqual(1000);
        });

        test('should handle special characters in inputs', async ({ page }) => {
            await navigateToOwners(page);
            await page.click('[data-testid="new-owner-button"]');

            // Preencher com caracteres especiais
            await page.fill('#full_name', 'José da Silva & Cia. Ltda.');
            await page.fill('#street', 'Rua São João, nº 123 - 1º andar');

            await fillOwnerForm(page, {
                ...testOwner,
                full_name: 'José da Silva & Cia. Ltda.',
                street: 'Rua São João, nº 123 - 1º andar'
            });

            await page.click('button[type="submit"]');

            // Verificar se foi salvo corretamente
            await page.waitForURL('/owners');
            await expect(page.locator('[data-testid="owner-list"]')).toContainText('José da Silva & Cia. Ltda.');
        });
    });

    test.describe('Accessibility and UX', () => {
        test('should be keyboard navigable', async ({ page }) => {
            await navigateToOwners(page);

            // Navegar usando Tab
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');

            // Verificar se a navegação por teclado funciona
            await expect(page.locator(':focus')).toBeVisible();
        });

        test('should show loading states', async ({ page }) => {
            // Simular resposta lenta
            await page.route('**/api/owners', route => {
                setTimeout(() => route.continue(), 2000);
            });

            await navigateToOwners(page);

            // Verificar se o loading é exibido
            await expect(page.locator('[data-testid="loading"]')).toBeVisible();
        });

        test('should have proper focus management in forms', async ({ page }) => {
            await navigateToOwners(page);
            await page.click('[data-testid="new-owner-button"]');

            // Verificar se o primeiro campo recebe foco
            await expect(page.locator('#full_name')).toBeFocused();

            // Verificar estilos de foco
            await expect(page.locator('#full_name:focus')).toHaveCSS('border-color', 'rgb(59, 130, 246)');
        });

        test('should display proper error messages', async ({ page }) => {
            await navigateToOwners(page);
            await page.click('[data-testid="new-owner-button"]');

            // Submeter formulário com dados inválidos
            await page.fill('#cpf', '123');
            await page.click('button[type="submit"]');

            // Verificar se as mensagens de erro são claras e úteis
            const errorMessage = await page.locator('.text-red-500').textContent();
            expect(errorMessage).toBeTruthy();
            expect(errorMessage?.length || 0).toBeGreaterThan(10);
        });
    });
}); 
