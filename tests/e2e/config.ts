// Configuração centralizada para testes E2E
export const E2E_CONFIG = {
    // URLs
    baseURL: 'http://localhost:3000',

    // Credenciais de autenticação
    auth: {
        email: 'teste@email.com',
        password: '12345678'
    },

    // Timeouts
    timeouts: {
        short: 5000,
        medium: 10000,
        long: 30000,
        navigation: 15000
    },

    // Seletores comuns
    selectors: {
        // Login
        emailInput: '[data-testid="email"]',
        passwordInput: '[data-testid="password"]',
        loginButton: '[data-testid="login-button"]',

        // Navegação
        ownersMenu: '[data-testid="owners-menu"]',
        newOwnerButton: '[data-testid="new-owner-button"]',

        // Listas
        ownerList: '[data-testid="owner-list"]',
        ownerCard: '[data-testid="owner-card"]',
        partnerList: '[data-testid="partner-list"]',
        referenceList: '[data-testid="reference-list"]',

        // Formulários
        partnerForm: '[data-testid="partner-form"]',
        referenceForm: '[data-testid="reference-form"]',

        // Botões de ação
        addPartnerButton: '[data-testid="add-partner-button"]',
        addReferenceButton: '[data-testid="add-reference-button"]',
        savePartnerButton: '[data-testid="save-partner-button"]',
        saveReferenceButton: '[data-testid="save-reference-button"]',
        cancelPartnerButton: '[data-testid="cancel-partner-button"]',
        cancelReferenceButton: '[data-testid="cancel-reference-button"]',

        // Estados
        loading: '[data-testid="loading"]',
        errorMessage: '[data-testid="error-message"]',
        emptyState: '[data-testid="empty-state"]',
        noResults: '[data-testid="no-results"]',

        // Filtros e busca
        searchInput: '[data-testid="search-input"]',
        searchButton: '[data-testid="search-button"]',
        clearFilters: '[data-testid="clear-filters"]',
        sortByName: '[data-testid="sort-by-name"]',

        // Paginação
        pagination: '[data-testid="pagination"]',

        // Exportação
        exportPdfButton: '[data-testid="export-pdf-button"]',
        exportDocxButton: '[data-testid="export-docx-button"]',

        // Confirmação
        confirmDelete: '[data-testid="confirm-delete"]'
    },

    // Dados de teste
    testData: {
        owner: {
            full_name: 'João Silva Proprietário E2E',
            cpf: '12345678901',
            rg: '123456789',
            issuing_body: 'SSP',
            uf_rg: 'SP',
            email: 'joao.silva.e2e@email.com',
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
        },

        partner: {
            full_name: 'Maria Silva Cônjuge E2E',
            cpf: '98765432109',
            rg: '987654321',
            issuing_body: 'SSP',
            cellphone: '11987654322',
            email: 'maria.silva.e2e@email.com'
        },

        reference: {
            full_name: 'Pedro Santos Referência E2E',
            telefone: '11987654323',
            email: 'pedro.santos.e2e@email.com',
            kinship: 'Amigo(a)',
            cep: '01310200',
            endereco_completo: 'Rua Augusta, 500, Consolação, São Paulo - SP'
        }
    },

    // Mensagens esperadas
    messages: {
        errors: {
            cpfInvalid: 'CPF inválido',
            cpfDuplicate: 'CPF já cadastrado',
            cepNotFound: 'CEP não encontrado',
            saveError: 'Erro ao salvar'
        },

        success: {
            ownerCreated: 'Proprietário criado com sucesso',
            partnerAdded: 'Parceiro adicionado com sucesso',
            referenceAdded: 'Referência adicionada com sucesso'
        }
    },

    // URLs de navegação
    routes: {
        login: '/login',
        dashboard: '/dashboard',
        owners: '/owners',
        newOwner: '/owners/new',
        editOwner: (id: string) => `/owners/${id}/edit`,
        ownerDetails: (id: string) => `/owners/${id}`
    }
};

// Função para gerar dados únicos de teste
export function generateUniqueTestData() {
    const timestamp = Date.now();
    const suffix = Math.random().toString(36).substring(7);

    return {
        email: `test.${timestamp}.${suffix}@example.com`,
        cpf: `${timestamp}`.slice(-11).padStart(11, '1'),
        phone: `11${timestamp}`.slice(-9),
        name: `Test User ${timestamp} ${suffix}`,
        rg: `${timestamp}`.slice(-9),
        cep: '01310100' // CEP válido para testes
    };
} 
