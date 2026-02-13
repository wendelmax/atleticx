# AtleticX

AtleticX e uma plataforma multiacademia para gestao esportiva e gamificacao de treino, com app mobile e painel web administrativo, usando Firebase como backend.

## Descricao do projeto

O sistema conecta alunos, responsaveis, professores e staff em uma unica plataforma para:

- pre-cadastro de usuarios via token com vinculacao por academia e turma;
- controle de perfis e permissoes com Google SSO;
- operacao multiacademia para redes com varias unidades;
- evolucao para trilhas de desafio, desempenho, ranking e graduacao.

## Tecnologias

- `Web`: React, Vite, TypeScript, Firebase SDK
- `Mobile`: Expo, React Native, TypeScript, Firebase SDK
- `Backend`: Firebase Auth, Firestore, Storage, Cloud Functions
- `Shared`: pacote `@atleticx/shared` com tipos e contratos comuns

## Estrutura do repositorio

- `apps/mobile`: aplicativo mobile (aluno, responsavel, professor)
- `apps/web`: painel web (admin, professor, staff)
- `packages/shared`: contratos e modelos compartilhados
- `firebase`: regras, indices, storage e Cloud Functions
- `docs`: visao de produto, backlog, naming, arquitetura e setup

## Fluxo principal atual

1. Gestor entra no painel web com Google.
2. Cria academia e turma.
3. Gera token de pre-cadastro por papel.
4. Usuario entra no app mobile com Google.
5. Usuario ativa token no app.
6. Sistema cria ou atualiza vinculo em `organizations/{orgId}/members/{uid}`.

## Setup rapido

1. Instale dependencias:

```bash
npm install
```

2. Configure variaveis de ambiente:

- `apps/web/.env` com base em `apps/web/.env.example`
- `apps/mobile/.env` com base em `apps/mobile/.env.example`

3. Rode os apps:

```bash
npm run dev:web
npm run dev:mobile
```

## Firebase

1. Crie um projeto no Firebase.
2. Ative Google Provider no Authentication.
3. Configure Firestore e Storage.
4. Publique regras e funcoes:

```bash
npm run deploy:rules
npm run deploy:functions
```

## Scripts uteis

- `npm run dev:web`
- `npm run dev:mobile`
- `npm run build:web`
- `npm run typecheck:web`
- `npm run emulators`

## Documentacao complementar

- `docs/README.md`
- `docs/sistema-gamificacao-artes-marciais.md`
- `docs/arquitetura-tecnica.md`
- `docs/setup-projeto.md`
