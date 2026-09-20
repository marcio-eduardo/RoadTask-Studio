# Vanguard Gantt Studio — Estúdio Visual Touch-First de Roadmaps & Cronogramas (Zero Código)

> **Visão Refinada:** Uma ferramenta de modelagem de cronogramas e roadmaps de engenharia **100% visual, touch-first e sem necessidade de código ou sintaxe**. Desenhada com ergonomia tátil para que um engenheiro, segurando apenas um tablet ou smartphone em uma sala de reunião, consiga montar, calibrar e apresentar um projeto executivo completo em menos de 1 minuto, apenas tocando em blocos e chips pré-calibrados.

---

## 1. O Conceito Central: "Tap-and-Build" (Zero Código, Zero Sintaxe)

Em vez de exigir que o usuário digite fórmulas ou sintaxes como `[5d] -> Hardware`, o estúdio adota uma esteira de criação visual tátil (chips, steppers e botões de ação rápida de alta ergonomia):

```
┌────────────────────────────────────────────────────────────────────────┐
│               BARRA DE MONTAGEM TÁTIL (TAP-AND-BUILD)                  │
├────────────────────────────────────────────────────────────────────────┤
│ [1] Tipo:   (•) Fase/Épico   ( ) Sprint   ( ) Story/Tarefa   ( ) Marco │
│ [2] Nome:   [ Sprint 1                      ] (Sugestão auto)          │
│ [3] Duração:[ 1 dia ] [ 3 dias ] [ 5 dias (1 sem) ] [ 2 sem ] [ 1 mês ]│
│ [4] Unidade:[ Horas ] [ Dias Úteis ] [ Semanas ] [ Meses ]             │
│ [5] Ação:   [ 🔗 Encadeia com Anterior ]   [ ➕ Inserir no Cronograma ]│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Inovações e Recursos Touch-First para Tablets & Mobile

### 2.1. Construtor Visual Tátil ("Tap & Construct")
- **Seleção Rápida de Entidades com 1 Toque:**
  - **Fase / Épico:** Agrupador de alto nível para grandes entregas (ex: *Fase 1: Diagnóstico*, *Épico: Telemetria*).
  - **Sprint:** Ciclo ágil pré-calibrado (ex: *Sprint 1*, *Sprint 2*... sugerido e incrementado automaticamente).
  - **Story / Tarefa:** Atividade operacional executiva (ex: *Parametrização de Alertas*, *Treinamento de Equipe*).
  - **Marco (Milestone):** Ponto crítico com duração zero e diamante dourado (ex: *Virada de Chave / Go-Live*, *Aceite do Cliente*, *Homologação Final*).
- **Seletores Táteis de Duração & Granularidade:**
  - **Chips de Duração Instantânea:** Botões de toque largo: `+1d`, `+3d`, `+5d (1 sem)`, `+10d (2 sem)`, `+1 mês`.
  - **Stepper Tátil (+ / -):** Permite aumentar ou diminuir a duração com facilidade no tablet sem abrir o teclado virtual.
  - **Escalas de Tempo:** Alternância instantânea de resolução temporal:
    - **Visão em Horas:** Para cronogramas de cutover / virada de chave no fim de semana.
    - **Visão em Dias Úteis:** Padrão de engenharia com calendário corporativo.
    - **Visão em Semanas:** Visão média de sprints e entregas contínuas.
    - **Visão em Meses / Trimestres:** Roadmap estratégico de nível C-Level.

### 2.2. Conexão Mágica de Dependências (Tap-to-Link)
- **Modo "Encadear com Anterior" (Auto-Chain):** Ao adicionar uma nova história ou sprint com essa opção ativada, a nova tarefa já é criada ligada automaticamente ao término da anterior (relação Término-Início / FS) sem nenhum clique extra.
- **Conexão Tátil Direta no Gráfico:**
  - No tablet, basta tocar na extremidade da barra A e tocar na barra B para criar a conexão de dependência.
  - Botão de ação rápida na barra selecionada: `🔗 Ligar à...` exibindo menu visual das tarefas disponíveis.

### 2.3. Modo Pitch C-Level ("Sala de Guerra Executiva")
- **Apresentação em Tela Cheia com 1 Toque:**
  - Oculta todos os controles de edição e botões de configuração.
  - Painel superior com **Scorecards de KPIs Executivos**:
    - **Prazo Previsto de Entrega** (com indicador de desvio em relação à meta).
    - **Total de Dias Úteis / Duração Total**.
    - **Percentual Concluído** com barra de progresso suave.
    - **Atividades no Caminho Crítico** (alertas de gargalos).
  - Diamantes de Milestones destacados com brilho executivo.

### 2.4. Simulador "What-If" em Tempo Real (Arrasto no Tablet)
- Na reunião presencial com a diretoria do cliente:
  - O cliente pergunta: *"E se o fornecedor de hardware atrasar 2 semanas?"*
  - O engenheiro ativa o modo **Simulação What-If** no tablet.
  - Com o dedo na tela, arrasta a barra da tarefa em questão:
    - O motor recalcula instantaneamente toda a cadeia de tarefas dependentes.
    - Exibe a **Linha de Base Original (Baseline)** pontilhada para comparação visual.
    - Exibe uma tag de impacto: `⚠️ Impacto no Go-Live: +10 dias úteis`.
  - Botões táteis de **Desfazer / Refazer (Undo/Redo)** ou **"Aplicar Cenário / Descartar"**.

### 2.5. Ergonomia Mobile & Tablet
- **Modo Task Deck (Mobile Cards):** Em smartphones, lista as tarefas em cards expansíveis ao alcance do polegar com sliders de progresso e botões táteis de status.
- **Modo Timeline Touch:** Gráfico de Gantt vetorial SVG com rolagem suave, gestos de pinça para zoom e barras largas de fácil toque (>44px de altura de alvo tátil).
- **Modo Split Screen:** Visualização dividida em tablets (iPad / Galaxy Tab) ou desktops com divisor ajustável.
- **Bottom-Sheet Drawer:** Painel de edição profunda que desliza pela parte inferior da tela, permitindo ajustar todos os parâmetros com uma mão só.

### 2.6. Biblioteca de Blueprints Prontos (1-Toque)
1. **Implantação Enterprise & IoT/Telemetria:** O projeto do Polo Logístico SP para a reunião de 21/09.
2. **Engenharia de Software Ágil (Sprints & Stories):** Épicos, Sprints 1 a 4, Stories e Marco de Release.
3. **Infraestrutura & Migração Cloud:** Assessment, Landing Zone, Migração e Cutover em Horas.
4. **Roadmap Estratégico Trimestral (Q1 a Q4):** Visão de alto nível para investidores e diretoria.
5. **Projeto em Branco:** Pronto para montar do zero com toques rápidos.

### 2.7. Interoperabilidade & Exportação Executiva
- **Exportação Bidirecional Mermaid:** Gera código Mermaid instantâneo para colocar em documentações ou permite colar Mermaid para gerar o gráfico visual.
- **Exportação PNG em Alta Definição (Escala 2x / 4x):** Imagem nítida para colar no PowerPoint ou Keynote.
- **Relatório PDF / Impressão A4 Paisagem:** Layout executivo pronto com capa, KPIs, tabela e gráfico.
- **Armazenamento Local Multi-Projetos:** Salva múltiplos projetos no navegador e permite exportar/importar arquivos `.json`.
- **100% Offline Standalone:** Único arquivo `.html` gerado via `vite-plugin-singlefile`, abrindo em qualquer dispositivo sem internet.
