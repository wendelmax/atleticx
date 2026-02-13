# Arquitetura Tecnica - AtleticX

## Visao geral

```mermaid
flowchart TB
    subgraph Clientes
      M[App Mobile Expo]
      W[Painel Web React]
    end

    subgraph Firebase
      A[Firebase Auth Google]
      F[Firestore]
      S[Cloud Storage]
      C[Cloud Functions]
      N[Firebase Cloud Messaging]
    end

    M --> A
    W --> A
    M --> F
    W --> F
    M --> S
    W --> S
    M --> C
    W --> C
    C --> F
    C --> N
```

## Modelo de acesso

```mermaid
flowchart LR
    U[Usuario autenticado] --> O{Possui membro ativo na academia?}
    O -- Sim --> R{Papel}
    O -- Nao --> T[Solicita token de pre-cadastro]
    R -- academy_admin --> A1[Gestao completa]
    R -- coach --> A2[Gestao de turma e token]
    R -- staff --> A3[Operacao e leitura]
    R -- athlete --> A4[Rotina e desafios]
    R -- guardian --> A5[Acompanhamento e financeiro]
```

## Fluxo de pre-cadastro com token

```mermaid
sequenceDiagram
    participant Admin as Web Admin
    participant Func as Cloud Functions
    participant App as App Mobile
    participant DB as Firestore
    Admin->>Func: createInviteToken(org, turma, papel, validade)
    Func->>DB: salva inviteTokens status available
    App->>Func: claimInviteToken(token)
    Func->>DB: valida status e validade
    Func->>DB: cria/atualiza organizations/{org}/members/{uid}
    Func->>DB: marca token como used
    Func-->>App: acesso liberado
```

## Colecoes principais

- `users/{uid}`
- `organizations/{orgId}`
- `organizations/{orgId}/members/{uid}`
- `classes/{classId}`
- `inviteTokens/{tokenId}`
- `auditLogs/{logId}`

## Regras de seguranca aplicadas

- leitura e escrita por autenticacao obrigatoria;
- leitura de academia apenas para membro ativo;
- criacao de token apenas para gestor de academia;
- ativacao de token via funcao server-side;
- trilha de auditoria para eventos sensiveis.

## Multiacademia

Um mesmo usuario pode ter:

- memberships em varias academias;
- papeis diferentes por academia;
- turmas diferentes por academia.

A troca de contexto ocorre pelo `organizationId` selecionado no painel e pelos vinculos ativos no app.
