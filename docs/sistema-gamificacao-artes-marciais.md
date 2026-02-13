# Sistema de Gamificacao para Artes Marciais

## 0. Decisao de naming

- Nome oficial da plataforma: `AtleticX`
- Assinatura institucional: `Athlete Extreme`
- Tagline principal: `Evolua no seu maximo.`
- Documento de referencia: `decisao-marca-atleticx.md`

## 1. Objetivo do produto

Criar uma plataforma digital com app mobile e painel web para:

- aumentar engajamento e disciplina dos alunos;
- apoiar evolucao tecnica, fisica e comportamental;
- dar rastreabilidade para graduacao e ranking;
- permitir acompanhamento por professores, staff e responsaveis;
- transformar dados esportivos em gestao clara para academia e dojo.

## 2. Perfis e permissoes

- `Super Admin`: padroes globais, templates oficiais, regras multiacademia.
- `Admin da Academia`: unidade, turmas, professores, configuracoes e planos.
- `Professor/Coach`: desafios, avaliacoes, pontuacoes, conteudos e feedback.
- `Staff`: operacao diaria, suporte e comunicacoes.
- `Aluno/Atleta`: execucao de trilhas, envio de evidencias e progresso.
- `Responsavel Financeiro`: acompanhamento de evolucao, pagamentos e alertas.

## 3. Dominios de negocio

### 3.1 Identidade e acesso

- Google SSO para entrada rapida.
- Vinculo aluno-responsavel financeiro.
- Controle de perfil e escopo de acesso por papel.
- Consentimentos para uso de dados e midia.

### 3.2 Academia e estrutura esportiva

- Unidades, turmas, modalidades e categorias.
- Regras por faixa, idade, peso e nivel.
- Calendario de treinos e eventos.

### 3.3 Treino e performance

- Plano de treino por fase esportiva.
- Metas de condicionamento, agilidade e elasticidade.
- Check-ins diarios e avaliacao periodica.
- Painel de evolucao individual e da turma.

### 3.4 Nutricao e rotina

- Diario alimentar e hidratacao.
- Rotina de sono e recuperacao.
- Evidencias em foto/video para validacao.

### 3.5 Conteudo e aprendizado

- Biblioteca de aulas, materiais e videos.
- Regras de conclusao por tempo minimo, paginas minimas e quiz.
- Controle de consumo e taxa de conclusao.

### 3.6 Gamificacao

- Missoes e desafios por objetivo.
- Pontos, badges, streaks e niveis.
- Bonus de constancia e reducao de fraude.

### 3.7 Graduacao e ranking

- Regua de criterios com pesos por faixa.
- Pontuacao por eventos e competicoes.
- Ranking por categoria para comparacao justa.

### 3.8 Financeiro

- Mensalidade e status de pagamento.
- Politicas de bolsa, desconto e inadimplencia.
- Visao do responsavel com historico.

### 3.9 Comunicacao e alertas

- Notificacoes push e lembretes.
- Alertas de atraso, pendencias e metas.
- Comunicados segmentados por turma.

### 3.10 Auditoria e compliance

- Trilha de auditoria para pontuacao e avaliacao.
- Polticas LGPD, retencao e exclusao de dados.
- Regras de moderacao de conteudo.

## 4. Fluxos de negocio principais

### 4.1 Jornada do aluno no ciclo semanal

```mermaid
flowchart TD
    A[Aluno cadastrado] --> B[Avaliacao inicial]
    B --> C[Plano semanal]
    C --> D[Desafios e conteudos]
    D --> E[Envio de evidencias]
    E --> F[Avaliacao do professor]
    F --> G[Atualiza pontos e badges]
    G --> H[Atualiza percentual de faixa]
    H --> I[Feedback e ajustes da semana]
```

### 4.2 Fluxo de graduacao e elegibilidade de faixa

```mermaid
flowchart LR
    A[Criterios por faixa] --> B[Pesos por criterio]
    B --> C[Dados de treino, conteudo e eventos]
    C --> D[Calculo percentual de faixa]
    D --> E{Atingiu limiar?}
    E -- Sim --> F[Elegivel para avaliacao final]
    E -- Nao --> G[Plano corretivo]
    F --> H[Homologacao professor/admin]
    H --> I[Atualiza faixa e ranking]
```

### 4.3 Fluxo de conteudo com regra minima

```mermaid
sequenceDiagram
    participant P as Professor
    participant S as Sistema
    participant A as Aluno
    P->>S: Publica video/material com regra minima
    A->>S: Inicia consumo do conteudo
    S->>S: Valida tempo minimo, paginas e quiz
    S-->>A: Libera status concluido
    S-->>P: Notifica conclusao e desempenho
    S->>S: Concede pontos e badge
```

## 5. Modelo de pontuacao e progresso

## 5.1 Exemplo de pesos para percentual de faixa

- Tecnica: 40%
- Condicionamento fisico: 20%
- Frequencia e disciplina: 20%
- Conteudo e teoria: 10%
- Conduta e valores: 10%

## 5.2 Regras recomendadas

- Ranking separado por categoria.
- Pontuacao com teto por periodo para evitar distorcao.
- Evidencia obrigatoria em desafios criticos.
- Janela de revisao do professor com SLA definido.

## 6. Arquitetura proposta (Google SSO + Firebase)

```mermaid
flowchart TB
    subgraph Mobile
      A1[App Aluno]
      A2[App Professor]
      A3[App Responsavel]
    end

    subgraph Web
      W1[Painel Admin]
      W2[Painel Professor]
    end

    subgraph Firebase
      F1[Firebase Auth Google SSO]
      F2[Firestore]
      F3[Cloud Storage]
      F4[Cloud Functions]
      F5[FCM Notificacoes]
      F6[Analytics]
      F7[Remote Config]
    end

    A1 --> F1
    A2 --> F1
    A3 --> F1
    W1 --> F1
    W2 --> F1

    A1 --> F2
    A2 --> F2
    A3 --> F2
    W1 --> F2
    W2 --> F2

    A1 --> F3
    A2 --> F3
    A3 --> F3

    F2 --> F4
    F3 --> F4
    F4 --> F5
    F2 --> F6
    W1 --> F7
```

## 7. Modelo de dados conceitual

```mermaid
erDiagram
    ACADEMIA ||--o{ TURMA : possui
    ACADEMIA ||--o{ PROFESSOR : possui
    TURMA ||--o{ ALUNO : possui
    ALUNO ||--o{ CHECKIN_TREINO : registra
    ALUNO ||--o{ CHECKIN_NUTRICAO : registra
    ALUNO ||--o{ EVIDENCIA : envia
    ALUNO ||--o{ PROGRESSO_FAIXA : acumula
    PROFESSOR ||--o{ DESAFIO : cria
    DESAFIO ||--o{ EVIDENCIA : exige
    CONTEUDO ||--o{ CONSUMO_CONTEUDO : gera
    ALUNO ||--o{ CONSUMO_CONTEUDO : realiza
    EVENTO ||--o{ RESULTADO_EVENTO : gera
    ALUNO ||--o{ RESULTADO_EVENTO : recebe
    ALUNO ||--o{ BADGE : conquista
    ALUNO }o--|| RESPONSAVEL_FINANCEIRO : vinculado_a
    RESPONSAVEL_FINANCEIRO ||--o{ PAGAMENTO : realiza
```

## 8. Politicas e seguranca

- Regras de acesso por papel no app e no painel.
- Dados de menores com consentimento formal.
- Criptografia em transito e em repouso.
- Logs de auditoria em alteracoes de nota/pontuacao.
- Politica de retencao para fotos e videos.

## 9. Notificacoes e alertas essenciais

- Lembrete de check-in de treino e alimentacao.
- Alerta de desafio perto do vencimento.
- Aviso de pendencia de avaliacao do professor.
- Notificacao de badge conquistado.
- Alerta de inadimplencia para responsavel.
- Alerta de sobrecarga quando houver excesso de treino.

## 10. Monetizacao

- `SaaS por academia`: preco por unidade e por faixa de alunos ativos.
- `Planos Start/Pro/Enterprise`: recursos e limites progressivos.
- `Add-ons`: armazenamento extra, BI, automacoes de comunicacao.
- `White-label`: customizacao de marca para redes maiores.
- `Taxa de transacao`: em pagamentos e inscricoes de evento.
- `Licenciamento confederativo`: padroes oficiais de pontuacao e ranking.

## 11. Indicadores de sucesso

- Retencao mensal de alunos por academia.
- Frequencia de check-ins por semana.
- Taxa de conclusao de desafios.
- Tempo medio de avaliacao do professor.
- Percentual de alunos com progresso de faixa no prazo.
- Engajamento de responsaveis financeiros.

## 12. Roadmap sugerido

```mermaid
gantt
    title Roadmap inicial (90 dias)
    dateFormat  YYYY-MM-DD
    section Fase 1 Base
    Auth e perfis                :a1, 2026-02-16, 14d
    Turmas e cadastro            :a2, after a1, 10d
    Desafios e evidencias        :a3, after a2, 14d
    section Fase 2 Gamificacao
    Pontuacao e badges           :b1, after a3, 10d
    Ranking por turma            :b2, after b1, 10d
    Notificacoes                 :b3, after b2, 7d
    section Fase 3 Evolucao
    Regua de faixa e pesos       :c1, after b3, 14d
    Conteudo com regras minimas  :c2, after c1, 10d
    Relatorios basicos           :c3, after c2, 7d
```

## 13. Riscos e mitigacoes

- Fraude de evidencias: usar metadados, janela de revisao e trilha de auditoria.
- Perda de engajamento: ciclos curtos de desafio e recompensas de constancia.
- Sobrecarga do professor: automacoes e fila priorizada por SLA.
- Injustica no ranking: segmentacao por categoria e pesos transparentes.
- Complexidade excessiva no inicio: escopo de MVP com iteracoes quinzenais.
