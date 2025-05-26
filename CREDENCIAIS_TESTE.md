# 🔐 Credenciais de Teste - Sistema E2E

## 📋 Informações de Autenticação

### Credenciais Principais
- **Email**: `teste@email.com`
- **Senha**: `12345678`

## 🎯 Uso nos Testes

### Configuração Automática
As credenciais são configuradas automaticamente nos testes E2E através do arquivo `tests/e2e/config.ts`:

```typescript
export const E2E_CONFIG = {
  auth: {
    email: 'teste@email.com',
    password: '12345678'
  }
};
```

### Função de Login
Os testes utilizam a função helper `loginAsAdmin()` que:

1. Navega para a página de login (`/login`)
2. Preenche o campo email com `teste@email.com`
3. Preenche o campo senha com `12345678`
4. Clica no botão de login
5. Aguarda redirecionamento para o dashboard (`/dashboard`)

```typescript
// Exemplo de uso nos testes
test.beforeEach(async ({ page }) => {
  await helpers.loginAsAdmin(page);
});
```

## 🔧 Configuração Manual

### Para Testes Manuais
Se você precisar fazer login manualmente durante o desenvolvimento:

1. Acesse: `http://localhost:3000/login`
2. Digite o email: `teste@email.com`
3. Digite a senha: `12345678`
4. Clique em "Entrar"

### Verificação de Acesso
Após o login bem-sucedido, você deve ser redirecionado para:
- URL: `http://localhost:3000/dashboard`
- Página: Dashboard principal do sistema

## 🚨 Importante

### Segurança
- ⚠️ **Estas credenciais são APENAS para testes**
- ⚠️ **NÃO usar em produção**
- ⚠️ **Manter apenas em ambiente de desenvolvimento**

### Banco de Dados
- As credenciais devem existir no banco de dados de teste
- Verificar se o usuário `teste@email.com` está cadastrado
- Confirmar se a senha `12345678` está correta no sistema

## 🔄 Atualização das Credenciais

### Se Precisar Alterar
Para alterar as credenciais de teste:

1. **Atualizar arquivo de configuração**:
   ```typescript
   // tests/e2e/config.ts
   auth: {
     email: 'novo@email.com',
     password: 'novasenha123'
   }
   ```

2. **Verificar banco de dados**:
   - Criar/atualizar usuário no banco
   - Confirmar permissões adequadas

3. **Atualizar documentação**:
   - Este arquivo (`CREDENCIAIS_TESTE.md`)
   - README dos testes
   - Documentação principal

### Arquivos que Referenciam as Credenciais
- `tests/e2e/config.ts` - Configuração principal
- `tests/e2e/setup.ts` - Helpers de teste
- `tests/e2e/owner.spec.ts` - Testes específicos
- `TESTES_E2E_OWNER.md` - Documentação dos testes
- `README_TESTES.md` - Guia de execução

## 🧪 Validação das Credenciais

### Teste Rápido
Para verificar se as credenciais estão funcionando:

```bash
# Executar apenas um teste simples
npx playwright test -g "should successfully create a new owner"

# Ou executar teste de login específico
npx playwright test -g "login"
```

### Troubleshooting

#### Erro: "Credenciais inválidas"
1. Verificar se o usuário existe no banco
2. Confirmar se a senha está correta
3. Verificar se o usuário tem permissões adequadas

#### Erro: "Timeout no login"
1. Verificar se o servidor está rodando
2. Confirmar se a URL está correta
3. Verificar se os seletores `data-testid` existem

#### Erro: "Redirecionamento falhou"
1. Verificar se o dashboard está acessível
2. Confirmar se as rotas estão configuradas
3. Verificar se não há erros de JavaScript

## 📞 Suporte

### Em Caso de Problemas
1. Verificar logs do servidor
2. Inspecionar elementos da página de login
3. Confirmar se os `data-testid` estão presentes:
   - `[data-testid="email"]`
   - `[data-testid="password"]`
   - `[data-testid="login-button"]`

### Contato
Para problemas relacionados às credenciais de teste, verificar:
- Configuração do banco de dados
- Variáveis de ambiente
- Logs de autenticação do sistema

---

**Última atualização**: Credenciais atualizadas para `teste@email.com` / `12345678` 
