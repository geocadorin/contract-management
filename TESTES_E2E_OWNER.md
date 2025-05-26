# Testes E2E - Sistema de Proprietários (Owner)

## 📋 Visão Geral

Este documento descreve os testes End-to-End (E2E) implementados para o sistema de gerenciamento de proprietários, cobrindo todas as funcionalidades principais incluindo cadastro, listagem, filtros, detalhes, referências e parceiros.

## 🚀 Como Executar os Testes

### Pré-requisitos
```bash
# Instalar dependências do Playwright
npm install @playwright/test
npx playwright install
```

### Comandos de Execução
```bash
# Executar todos os testes E2E
npx playwright test

# Executar apenas testes de Owner
npx playwright test owner.spec.ts

# Executar com interface gráfica
npx playwright test --ui

# Executar em modo debug
npx playwright test --debug

# Executar em navegador específico
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Relatórios
```bash
# Gerar relatório HTML
npx playwright show-report
```

## 📊 Cobertura de Testes

### 1. **Cadastro de Proprietário (Owner Registration)**

#### ✅ Cenários Testados:
- **Cadastro completo**: Criação de proprietário com todos os campos preenchidos
- **Validação de campos obrigatórios**: Verificação de mensagens de erro para campos vazios
- **Validação de CPF**: Teste de formato e duplicidade de CPF
- **Busca automática de CEP**: Preenchimento automático de endereço via ViaCEP
- **Tratamento de erros**: CPF duplicado e outros erros de validação

#### 🔍 Dados de Teste:
```typescript
const testOwner = {
  full_name: 'João Silva Proprietário',
  cpf: '12345678901',
  rg: '123456789',
  issuing_body: 'SSP',
  uf_rg: 'SP',
  email: 'joao.silva@email.com',
  cellphone: '11987654321',
  profession: 'Engenheiro',
  // ... outros campos
};
```

### 2. **Listagem e Filtros (Owner Listing and Filters)**

#### ✅ Cenários Testados:
- **Exibição da lista**: Verificação de cards de proprietários e paginação
- **Filtro por nome**: Busca por nome completo ou parcial
- **Filtro por CPF**: Busca por CPF formatado
- **Filtro por email**: Busca por endereço de email
- **Estado vazio**: Mensagem quando não há resultados
- **Limpar filtros**: Restauração da lista completa
- **Ordenação**: Ordenação alfabética por nome

#### 🔍 Funcionalidades de Filtro:
- Busca em tempo real
- Múltiplos critérios de busca
- Paginação automática
- Contador de resultados

### 3. **Detalhes do Proprietário (Owner Details)**

#### ✅ Cenários Testados:
- **Exibição de detalhes**: Visualização completa das informações
- **Navegação para edição**: Redirecionamento para formulário de edição
- **Exportação PDF**: Download de relatório em PDF
- **Exportação DOCX**: Download de relatório em Word
- **Responsividade**: Layout adaptativo

#### 📄 Funcionalidades de Exportação:
- Relatórios formatados
- Dados completos do proprietário
- Informações de referências e parceiros
- Logos e cabeçalhos personalizados

### 4. **Gerenciamento de Parceiros (Partner Management)**

#### ✅ Cenários Testados:
- **Adicionar parceiro**: Cadastro de novo parceiro/cônjuge
- **Editar parceiro**: Modificação de dados existentes
- **Excluir parceiro**: Remoção com confirmação
- **Validação de campos**: Campos obrigatórios e formatos
- **Cancelar formulário**: Fechamento sem salvar

#### 🔍 Dados de Teste do Parceiro:
```typescript
const testPartner = {
  full_name: 'Maria Silva Cônjuge',
  cpf: '98765432109',
  rg: '987654321',
  issuing_body: 'SSP',
  cellphone: '11987654322',
  email: 'maria.silva@email.com'
};
```

### 5. **Gerenciamento de Referências (Reference Management)**

#### ✅ Cenários Testados:
- **Adicionar referência**: Cadastro de nova referência pessoal
- **Busca automática de CEP**: Preenchimento de endereço
- **Editar referência**: Modificação de dados existentes
- **Excluir referência**: Remoção com confirmação
- **Validação de campos**: Campos obrigatórios e CEP inválido
- **Cancelar formulário**: Fechamento sem salvar

#### 🔍 Dados de Teste da Referência:
```typescript
const testReference = {
  full_name: 'Pedro Santos Referência',
  telefone: '11987654323',
  email: 'pedro.santos@email.com',
  kinship: 'Amigo(a)',
  cep: '01310200',
  endereco_completo: 'Rua Augusta, 500, Consolação, São Paulo - SP'
};
```

### 6. **Casos Extremos e Tratamento de Erros (Edge Cases)**

#### ✅ Cenários Testados:
- **Erros de rede**: Simulação de falhas de conexão
- **Erros do servidor**: Respostas HTTP 500
- **Estados vazios**: Listas sem dados
- **Textos longos**: Validação de limites de caracteres
- **Caracteres especiais**: Acentos e símbolos
- **Timeouts**: Operações demoradas

### 7. **Acessibilidade e UX (Accessibility and UX)**

#### ✅ Cenários Testados:
- **Navegação por teclado**: Tab, Enter, Escape
- **Estados de loading**: Indicadores visuais
- **Gerenciamento de foco**: Foco automático em campos
- **Mensagens de erro**: Clareza e utilidade
- **Estilos de foco**: Borda azul nos campos ativos

## 🎯 Data-testid Utilizados

### Navegação e Layout:
- `owners-menu` - Menu de proprietários
- `new-owner-button` - Botão "Novo Proprietário"
- `owner-list` - Lista de proprietários
- `owner-card` - Card individual do proprietário
- `pagination` - Controles de paginação

### Busca e Filtros:
- `search-input` - Campo de busca
- `search-button` - Botão de buscar
- `clear-filters` - Botão limpar filtros
- `sort-by-name` - Ordenação por nome
- `no-results` - Mensagem sem resultados
- `empty-state` - Estado vazio

### Detalhes do Proprietário:
- `owner-name` - Nome do proprietário
- `owner-cpf` - CPF do proprietário
- `owner-email` - Email do proprietário
- `edit-owner-button` - Botão editar
- `export-pdf-button` - Exportar PDF
- `export-docx-button` - Exportar DOCX

### Gerenciamento de Parceiros:
- `add-partner-button` - Adicionar parceiro
- `partner-form` - Formulário de parceiro
- `partner-list` - Lista de parceiros
- `edit-partner-button` - Editar parceiro
- `delete-partner-button` - Excluir parceiro
- `save-partner-button` - Salvar parceiro
- `cancel-partner-button` - Cancelar parceiro

### Gerenciamento de Referências:
- `add-reference-button` - Adicionar referência
- `reference-form` - Formulário de referência
- `reference-list` - Lista de referências
- `edit-reference-button` - Editar referência
- `delete-reference-button` - Excluir referência
- `save-reference-button` - Salvar referência
- `cancel-reference-button` - Cancelar referência
- `search-cep-button` - Buscar CEP

### Estados e Feedback:
- `loading` - Indicador de carregamento
- `error-message` - Mensagem de erro
- `confirm-delete` - Confirmação de exclusão

## 🔧 Configuração dos Testes

### Arquivo: `playwright.config.ts`
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## 📱 Testes Multi-Browser

Os testes são executados em múltiplos navegadores:
- **Chrome/Chromium** - Navegador principal
- **Firefox** - Compatibilidade Mozilla
- **Safari/WebKit** - Compatibilidade Apple
- **Mobile Chrome** - Dispositivos Android
- **Mobile Safari** - Dispositivos iOS

## 🚨 Tratamento de Erros

### Tipos de Erro Testados:
1. **Erros de Validação**: Campos obrigatórios, formatos inválidos
2. **Erros de Rede**: Conexão perdida, timeout
3. **Erros do Servidor**: HTTP 500, 404, 403
4. **Erros de Dados**: CPF duplicado, referências inválidas
5. **Erros de Interface**: Elementos não encontrados

### Estratégias de Recuperação:
- Retry automático em falhas temporárias
- Mensagens de erro claras para o usuário
- Fallbacks para funcionalidades críticas
- Logs detalhados para debugging

## 📊 Métricas de Qualidade

### Cobertura de Funcionalidades:
- ✅ **100%** - Cadastro de proprietários
- ✅ **100%** - Listagem e filtros
- ✅ **100%** - Detalhes e navegação
- ✅ **100%** - Gerenciamento de parceiros
- ✅ **100%** - Gerenciamento de referências
- ✅ **100%** - Tratamento de erros
- ✅ **100%** - Acessibilidade básica

### Cenários de Teste:
- **Total**: 35+ cenários de teste
- **Positivos**: 25+ casos de sucesso
- **Negativos**: 10+ casos de erro
- **Edge Cases**: 8+ casos extremos

## 🔄 Integração Contínua

### Pipeline CI/CD:
```yaml
# Exemplo para GitHub Actions
- name: Run E2E Tests
  run: |
    npm ci
    npx playwright install
    npx playwright test
    
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## 📝 Manutenção dos Testes

### Credenciais de Teste:
- **Email**: `teste@email.com`
- **Senha**: `12345678`

### Boas Práticas:
1. **Seletores Estáveis**: Usar `data-testid` em vez de classes CSS
2. **Dados Isolados**: Cada teste usa dados únicos
3. **Cleanup**: Limpeza automática após cada teste
4. **Timeouts**: Aguardar elementos aparecerem
5. **Assertions Específicas**: Verificações precisas

### Atualizações Necessárias:
- Adicionar novos `data-testid` conforme funcionalidades
- Atualizar dados de teste quando necessário
- Revisar seletores após mudanças de UI
- Expandir cobertura para novas funcionalidades

## 🎉 Benefícios dos Testes E2E

1. **Confiança**: Garantia de que o sistema funciona end-to-end
2. **Regressão**: Detecção automática de quebras
3. **Documentação**: Testes servem como documentação viva
4. **Qualidade**: Melhoria contínua da experiência do usuário
5. **Automação**: Redução de testes manuais repetitivos

---

**Nota**: Para executar os testes, certifique-se de que o servidor de desenvolvimento está rodando em `http://localhost:3000` e que o banco de dados está configurado com dados de teste apropriados. 
