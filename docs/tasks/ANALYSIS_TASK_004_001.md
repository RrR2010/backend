# Análise: TASK_004_001 - Adicionar Modelo de Session/RefreshToken ao Prisma

## 1. Análise do Schema Atual

### 1.1 Estado do Schema

O schema atual do Prisma (`backend/prisma/schema.prisma`) contém:

- **Modelo `User`**: Já possui relação com `sessions: Session[]` (linha 49)
- **Modelo `Tenant`**: Sistema de multi-inquilinato bem estruturado
- **Modelo `Membership`**: Relação many-to-many entre User e Tenant
- **Enum `SystemState`**: Estados globais (ACTIVE, LOCKED, HIDDEN)

### 1.2 Observações Importantes

1. **A relação Session → User já está definida** no modelo User, mas o modelo Session ainda não existe
2. **Estrutura de tenant** já está presente - sessão deve ser vinculada a user via membership
3. **Password hash** já existe no User - maturidade para hashes de token

---

## 2. Modelo de Session Recomendado

### 2.1 Design Minimal Viável

```prisma
model Session {
  id                  String    @id @default(uuid())
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  expiresAt           DateTime
  revokedAt           DateTime?
  isRevoked           Boolean   @default(false)
  
  // Refresh token (armazenado como hash para segurança)
  refreshTokenHash    String
  
  // Metadata de segurança
  deviceInfo         String?   // Dispositivo/browser do usuário
  ipAddress          String?   // IP da requisição (opcional por privacidade)
  userAgent          String?   // User agent string
  
  // Relações
  userId             String
  user               User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Índices
  @@index([userId])
  @@index([expiresAt])
  @@index([refreshTokenHash])
  @@index([userId, expiresAt])
}
```

### 2.2 Campos Explicados

| Campo | Tipo | Obrigatório | Justificativa |
|-------|------|-------------|----------------|
| id | UUID | Sim | Identificador único da sessão |
| createdAt | DateTime | Sim | Data de criação |
| updatedAt | DateTime | Sim | Última atividade |
| expiresAt | DateTime | Sim | Quando a sessão expira (importante para cleanup) |
| revokedAt | DateTime? | Não | Quando foi revogada (para audit) |
| isRevoked | Boolean | Sim | Status rápido de consulta |
| refreshTokenHash | String | Sim | **SEMPRE hasheado** -類似 passwordHash |
| deviceInfo | String? | Não | Metadata do dispositivo |
| ipAddress | String? | Não | Para detecção de anomalies |
| userAgent | String? | Não | Browser/client info |
| userId | String | Sim | FK para User |

---

## 3. Considerações de Segurança

### 3.1 Princípios Fundamentais

1. **Refresh Token JAMAIS em texto puro**
   - Usar SHA-256 ou Argon2
   - Same pattern que passwordHash
   - Se o DB for comprometido, tokens não são utilizáveis

2. **Token Rotation Obrigatório**
   - A cada refresh, emitir novo token + invalidar o antigo
   - Impede uso persistente de tokens roubados

3. **Reuse Detection**
   - Se token usado após rotação → revoke sessão + alert user
   - Converte ataque de "roubo de token" em "ataque de uma única vez"

4. **Device Binding**
   - Vincular token a fingerprint do dispositivo
   - Token roubado falha em dispositivo diferente

### 3.2 Checklist de Segurança

| Item | Prioridade | Status no Schema |
|------|-----------|-----------------|
| Refresh token hasheado | CRÍTICA | ✅ Campo presente |
| Token rotation | CRÍTICA | Lógica de aplicação |
| Reuse detection | ALTA | Campo isRevoked |
| Device fingerprint | MÉDIA | Campo deviceInfo |
| IP tracking | MÉDIA | Campo ipAddress |
| Absolute max lifetime | CRÍTICA | Campo expiresAt |
| Logout all sessions | ALTA | Feature de aplicação |

### 3.3 Armazenamento Seguro

- **Web apps**: Usar HttpOnly cookies (não localStorage)
- **Mobile**: Native secure storage (iOS Keychain / Android Keystore)
- ** Nunca retornar refresh token em JSON** -> só em cookies seguros

---

## 4. Recomendações de Índices

### 4.1 Índices Obrigatórios

```prisma
@@index([userId])           // Para listar sessões do usuário
@@index([expiresAt])        // Para cleanup automático
@@index([refreshTokenHash]) // Para lookup de token
```

### 4.2 Índices Compostos (Recomendados)

```prisma
@@index([userId, expiresAt])    // Sessoes ativas por usuário
@@index([userId, isRevoked])    // Sessoes não-revogadas
```

### 4.3 Notas de Performance

- **Cleanup**: Index em `expiresAt` permite DELETE eficiente de sessões expiradas
- **Lookup de token**: Index em `refreshTokenHash` (usar hash como-indexável)
- **Listagem por usuário**: Index em `userId` evita full table scan

---

## 5. Questões Potenciais a Monitorar

### 5.1 Armazenamento a Longo Prazo

- **Problema**: Sessões acumuladas podem afetar performance
- **Solução**: Cleanup automático de sessões revogadas/expiradas mais velhas que 7 dias

### 5.2 Concorrência e Race Conditions

- **Problema**: Múltiplos requests simultâneos tentando fazer refresh
- **Solução**: Usar transação de banco ou lock de linha (`FOR UPDATE`)

### 5.3 Tamanho do Token

- **Problema**: Tokens JWT podem ser grandes
- **Solução**: Hash é de tamanho fixo (64 chars para SHA-256)

### 5.4 Compatibilidade com TTL Existente

- **Nota**: Assegurar que novo schema não quebrar queries existentes
- **Verificação**: Executar migration em staging primeiro

---

## 6. Decisões de Design Pendentes

| Decisão | Opções | Recomendação |
|---------|-------|---------------|
| Hash algorithm | SHA-256, Argon2, Bcrypt | SHA-256 (balance segurança/performance) |
| TTL do refresh token | 7 dias, 30 dias, 60 dias | 30 dias para ViverSorvete |
| Device info storage | Obrigatório, Opcional | Opcional (privacidade) |
| TTL absoluto (force re-login) | 30 dias, 90 dias | 30 dias |

---

## 7. Conclusão

O modelo de Session proposto é **mínimo, seguro e eficiente**:

- ✅ Hash de refresh token (como password)
- ✅ Campos para security hardening
- ✅ Índices otimizados
- ✅ Integração com schema existente (User já tem sessions)
- ✅ Suporte a rotation e revocation
- ✅ Não sobre-engenharia

### Próximos Passos Sugeridos

1. Adicionar modelo Session ao schema.prisma
2. Executar migration: `npx prisma migrate dev --name add_session_model`
3. Gerar client: `npx prisma generate`
4. Implementar lógica de rotation na aplicação
5. Configurar cleanup job para sessões expiradas

---

*Análise baseada em melhores práticas de segurança para refresh tokens (2025-2026)*