# 🧪 Guia de Execução dos Testes E2E

## 🚀 Configuração Inicial

### 1. Instalar Dependências
```bash
# Instalar dependências do projeto
npm install

# Instalar navegadores do Playwright
npm run test:e2e:install
```

### 2. Credenciais de Teste
Os testes usam as seguintes credenciais para autenticação:
- **Email**: `teste@email.com`
- **Senha**: `12345678`

### 3. Preparar Ambiente
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Em outro terminal, executar os testes
npm run test:e2e
```

## 📋 Comandos Disponíveis

### Testes E2E Completos
```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar apenas testes de Owner
npm run test:e2e:owner

# Verificar credenciais de login
npm run test:e2e:credentials

# Teste rápido de login
npm run test:e2e:login

# Executar com interface gráfica
npm run test:e2e:ui

# Executar em modo debug
npm run test:e2e:debug

# Executar com navegador visível
npm run test:e2e:headed
```

### Relatórios
```bash
# Visualizar relatório HTML
npm run test:e2e:report
```

### Testes Unitários
```bash
# Executar testes unitários
npm run test

# Executar com interface gráfica
npm run test:ui

# Executar com cobertura
npm run test:coverage
```

### Executar Todos os Testes
```bash
# Executar testes unitários + E2E
npm run test:all
```

## 🎯 Estrutura dos Testes

```
tests/
├── e2e/
│   ├── owner.spec.ts          # Testes do sistema de Owner
│   └── setup.ts               # Configurações e helpers
├── unit/                      # Testes unitários (futuro)
└── fixtures/                  # Dados de teste (futuro)
```

## 📊 Cobertura dos Testes E2E

### ✅ Funcionalidades Testadas:

#### 🏠 **Sistema de Proprietários (Owner)**
- ✅ Cadastro completo de proprietário
- ✅ Validação de campos obrigatórios
- ✅ Validação de CPF e duplicidade
- ✅ Busca automática de CEP
- ✅ Listagem com paginação
- ✅ Filtros por nome, CPF e email
- ✅ Ordenação e limpeza de filtros
- ✅ Visualização de detalhes
- ✅ Exportação PDF/DOCX
- ✅ Gerenciamento de parceiros
- ✅ Gerenciamento de referências
- ✅ Tratamento de erros
- ✅ Acessibilidade básica

#### 👥 **Gerenciamento de Parceiros**
- ✅ Adicionar novo parceiro
- ✅ Editar parceiro existente
- ✅ Excluir parceiro
- ✅ Validação de campos
- ✅ Cancelar formulário

#### 📞 **Gerenciamento de Referências**
- ✅ Adicionar nova referência
- ✅ Busca automática de CEP
- ✅ Editar referência existente
- ✅ Excluir referência
- ✅ Validação de campos
- ✅ Cancelar formulário

## 🔧 Configuração Avançada

### Executar em Navegadores Específicos
```bash
# Chrome/Chromium
npx playwright test --project=chromium

# Firefox
npx playwright test --project=firefox

# Safari/WebKit
npx playwright test --project=webkit

# Mobile Chrome
npx playwright test --project="Mobile Chrome"

# Mobile Safari
npx playwright test --project="Mobile Safari"
```

### Executar Testes Específicos
```bash
# Executar apenas testes de cadastro
npx playwright test -g "Owner Registration"

# Executar apenas testes de filtros
npx playwright test -g "Owner Listing and Filters"

# Executar apenas testes de parceiros
npx playwright test -g "Partner Management"

# Executar apenas testes de referências
npx playwright test -g "Reference Management"
```

### Debug e Desenvolvimento
```bash
# Executar com trace habilitado
npx playwright test --trace on

# Executar com screenshots
npx playwright test --screenshot only-on-failure

# Executar com vídeo
npx playwright test --video retain-on-failure

# Executar teste específico em debug
npx playwright test owner.spec.ts:123 --debug
```

## 📱 Testes Multi-Device

Os testes são executados automaticamente em:
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome Android, Safari iOS
- **Tablets**: iPad, Android Tablet

## 🚨 Solução de Problemas

### Erro: "Servidor não está rodando"
```bash
# Verificar se o servidor está ativo
curl http://localhost:3000

# Iniciar servidor se necessário
npm run dev
```

### Erro: "Navegadores não instalados"
```bash
# Reinstalar navegadores
npm run test:e2e:install
```

### Erro: "Timeout nos testes"
```bash
# Aumentar timeout no playwright.config.ts
# ou executar com timeout maior
npx playwright test --timeout 60000
```

### Erro: "Elementos não encontrados"
```bash
# Verificar se os data-testid estão implementados
# Executar em modo headed para visualizar
npm run test:e2e:headed
```

## 📊 Métricas de Qualidade

### Tempo de Execução Esperado:
- **Testes completos**: ~5-10 minutos
- **Testes de Owner**: ~3-5 minutos
- **Teste individual**: ~30-60 segundos

### Taxa de Sucesso Esperada:
- **Ambiente local**: 95-100%
- **CI/CD**: 90-95%
- **Primeira execução**: 85-90%

## 🔄 Integração com CI/CD

### GitHub Actions
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:e2e:install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📝 Próximos Passos

### Expansão dos Testes:
- [ ] Testes para sistema de Inquilinos (Lessee)
- [ ] Testes para sistema de Contratos
- [ ] Testes para sistema de Imóveis
- [ ] Testes de Performance
- [ ] Testes de Acessibilidade avançada
- [ ] Testes de Segurança

### Melhorias:
- [ ] Paralelização de testes
- [ ] Dados de teste dinâmicos
- [ ] Mocks para APIs externas
- [ ] Testes visuais (screenshot comparison)
- [ ] Relatórios customizados

## 🧪 Validação das Credenciais

### Teste Rápido
Para verificar se as credenciais estão funcionando:

```bash
# Verificar credenciais de login (recomendado)
npm run test:e2e:credentials

# Teste rápido apenas do login
npm run test:e2e:login

# Executar apenas um teste simples de Owner
npx playwright test -g "should successfully create a new owner"

# Ou executar teste de login específico
npx playwright test -g "login"
```

### Novo Arquivo de Teste de Credenciais
Foi criado o arquivo `tests/e2e/verify-credentials.spec.ts` que inclui:

- ✅ **Login com credenciais válidas**: Testa `teste@email.com` / `12345678`
- ✅ **Login com credenciais inválidas**: Verifica tratamento de erro
- ✅ **Validação de campos obrigatórios**: Testa campos vazios
- ✅ **Acessibilidade dos elementos**: Verifica se campos estão funcionais
- ✅ **Navegação pós-login**: Confirma redirecionamento para dashboard

### Troubleshooting de Credenciais

#### Erro: "Credenciais inválidas"
1. Verificar se o usuário `teste@email.com` existe no banco
2. Confirmar se a senha `12345678` está correta
3. Verificar se o usuário tem permissões adequadas

#### Erro: "Timeout no login"
1. Verificar se o servidor está rodando em `http://localhost:3000`
2. Confirmar se a URL de login está correta (`/login`)
3. Verificar se os seletores `data-testid` existem nos elementos

#### Erro: "Redirecionamento falhou"
1. Verificar se o dashboard está acessível (`/dashboard`)
2. Confirmar se as rotas estão configuradas corretamente
3. Verificar se não há erros de JavaScript no console

---

**💡 Dica**: Execute `npm run test:e2e:ui` para uma experiência visual interativa dos testes! 
