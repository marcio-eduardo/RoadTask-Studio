# Walkthrough: Vanguard Gantt Studio — Estúdio Executivo Mobile-First & Touch-First

## Visão Geral da Entrega
Construção completa e validação do **Vanguard Gantt Studio**, um estúdio de engenharia e roadmaps projetado sob a ótica **Touch-First e Zero Código**, permitindo montar cronogramas executivos complexos tocando apenas em blocos visuais em tablets e smartphones.

---

## 1. O Que Foi Construído

### 1.1. Construtor Visual Tátil ("Tap-and-Build")
- **Seletores de Entidade (1 Toque):** `Fase/Épico`, `Sprint`, `Story/Tarefa` e `Marco (Milestone)`.
- **Nomes com Auto-Sugestão Inteligente:** Sugere nomes ordenados sequencialmente com um toque.
- **Chips de Duração Rápida:** `+1d`, `+3d`, `+5d (1 sem)`, `+10d (2 sem)`, `+20d (1 mês)` e botões `[-]` / `[+]` touch.
- **Auto-Encadeamento:** Conecta automaticamente o início da nova tarefa ao término da anterior (relação Término-Início / FS).

### 1.2. Motor Matemático de Rigor Técnico
- **Cálculo Estrito de Dias Úteis:** Exclusão automática de sábados e domingos + calendário de feriados nacionais brasileiros (fixos e móveis).
- **Propagação em Cascata (FS, SS, FF):** Recalcula prazos instantaneamente sem loops circulares (Topological Sort).
- **Caminho Crítico (CPM):** Identifica tarefas com folga zero e realça gargalos em vermelho/carmim neon.

### 1.3. Apresentação Executiva & Simulação
- **Modo Pitch C-Level:** Oculta menus técnicos e apresenta a timeline limpa com os Scorecards de KPIs e marcos destacados.
- **Simulador "What-If":** Teste ao vivo de impactos de prazos com comparação contra a Linha de Base (Baseline) pontilhada e tag de desvio em dias úteis.
- **4 Blueprints Executivos:** Implantação SGFrotas SP (pronto para 21/09), Engenharia de Software Ágil, Migração Cloud e Projeto em Branco.

### 1.4. Portabilidade 100% Offline (Single-File)
- Compilado via `vite-plugin-singlefile` gerando um único arquivo `editor_cronograma.html` de **278 KB** que abre instantaneamente com duplo clique em qualquer máquina sem servidor, Node.js ou internet.

---

## 2. Telas & Evidências de Teste

### Visão Inicial do Estúdio (Gantt Executivo + Scorecards + Toolbar)
![Visão Inicial do Estúdio](C:\Users\marci\.gemini\antigravity-ide\brain\d7a76b9f-325e-4242-8b73-643969c21c0b\initial_load_1789695990312.png)

### Inserção Rápida de Tarefa via Tap-and-Build
![Inserção de Sprint](C:\Users\marci\.gemini\antigravity-ide\brain\d7a76b9f-325e-4242-8b73-643969c21c0b\sprint_inserted_1789696038577.png)

### Visão Mobile Cards (Task Deck)
![Visão Cards](C:\Users\marci\.gemini\antigravity-ide\brain\d7a76b9f-325e-4242-8b73-643969c21c0b\cards_view_1789696064322.png)

### Visão Tabela WBS Hierárquica
![Visão WBS Tabela](C:\Users\marci\.gemini\antigravity-ide\brain\d7a76b9f-325e-4242-8b73-643969c21c0b\wbs_view_1789696097413.png)

### Visão Dividida (Split Screen)
![Visão Split](C:\Users\marci\.gemini\antigravity-ide\brain\d7a76b9f-325e-4242-8b73-643969c21c0b\split_view_1789696118750.png)

### Seletor de Blueprints & Modelos de Engenharia
![Modal de Modelos](C:\Users\marci\.gemini\antigravity-ide\brain\d7a76b9f-325e-4242-8b73-643969c21c0b\modelos_modal_1789696176198.png)

---

## 3. Como Executar

### Opção 1: Executável Standalone Offline (Sem Terminal)
Dê um duplo clique direto no arquivo:
`editor_cronograma.html` (ou `dist/index.html`) no seu computador ou envie para o tablet.

### Opção 2: Servidor de Desenvolvimento Local
```powershell
npm.cmd run dev
```
ou para preview do build:
```powershell
npm.cmd run preview
```
Acesse `http://localhost:4173/` ou o IP na sua rede local para abrir direto no iPad/smartphone.
