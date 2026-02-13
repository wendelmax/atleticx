# Setup do Projeto

## Pre-requisitos

- Node.js 20+
- npm 10+
- Firebase CLI
- Conta Google Cloud/Firebase

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar variaveis de ambiente web

Criar `apps/web/.env` com base em `apps/web/.env.example`.

## 3. Configurar variaveis de ambiente mobile

Criar `apps/mobile/.env` com base em `apps/mobile/.env.example`.

## 4. Ativar servicos no Firebase

- Authentication com provider Google
- Firestore em modo nativo
- Cloud Storage
- Cloud Functions

## 5. Deploy de regras e funcoes

```bash
npm run deploy:rules
npm run deploy:functions
```

## 6. Rodar localmente

```bash
npm run dev:web
npm run dev:mobile
```

## 7. Fluxo de uso inicial

1. Logar no web admin com Google.
2. Criar academia.
3. Criar turma.
4. Gerar token de pre-cadastro.
5. Logar no mobile com Google.
6. Ativar token no app.
