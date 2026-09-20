# Vanguard Gantt Studio

> **Estúdio Executivo & Touch-First de Roadmaps e Cronogramas de Engenharia**  
> *Projete roadmaps em segundos, simule impactos ao vivo e encante clientes C-Level em reuniões presenciais.*

---

## 🌟 Visão Geral

O **Vanguard Gantt Studio** foi concebido para libertar engenheiros de soluções, arquitetos de sistemas e gestores técnicos da burocracia de planilhas cinzas e formulários lentos. Desenvolvido sob a ótica **Touch-First e Zero Código**, ele permite modelar e calibrar projetos complexos diretamente em tablets ou smartphones em menos de um minuto — apenas tocando em blocos e chips pré-calibrados.

Além disso, a aplicação foi empacotada com o bundler `vite-plugin-singlefile`, gerando um único arquivo autônomo de **278 KB** (`editor_cronograma.html`) que funciona **100% offline**, sem necessidade de internet, servidor ou instalação de Node.js na máquina final.

---

## 🚀 Principais Diferenciais

### 🖐️ 1. Construtor Visual Tátil ("Tap-and-Build")
- **Zero Sintaxe / Zero Código:** Sem fórmulas ou digitação de colchetes no tablet.
- **Entidades com 1 Toque:** `Fase/Épico`, `Sprint`, `Story/Tarefa` e `Marco (Milestone)`.
- **Auto-Sugestão Inteligente de Nomes:** Ao tocar em *Sprint*, sugere automaticamente sequências (`Sprint 1`, `Sprint 2`...); ao tocar em *Marco*, sugere marcos executivos (`Go-Live`, `Homologação`, `Aceite`).
- **Chips de Duração Rápida:** Botões táteis com alvos de toque largos (`+1d`, `+3d`, `+5d (1 sem)`, `+10d (2 sem)`, `+20d (1 mês)` e steppers `[-]` / `[+]`).
- **Auto-Encadeamento:** Botão `[🔗 Encadeia com Anterior]` conecta a nova tarefa diretamente ao término da anterior (FS) com zero cliques adicionais.

### 🧮 2. Motor Matemático Rigoroso
- **Calendário de Dias Úteis:** Exclusão automática de sábados e domingos com calendário dinâmico embutido de feriados nacionais brasileiros (fixos e móveis como Páscoa, Carnaval e Corpus Christi).
- **Propagação em Cascata (FS, SS, FF):** Recalcula prazos instantaneamente em cadeia com detecção de ciclo via ordenação topológica.
- **Caminho Crítico (CPM):** Algoritmo Critical Path Method que calcula folga total (*Total Float*) e destaca gargalos ativos em carmim neon brilhante.

### 🎭 3. Modo Pitch C-Level ("Sala de Guerra")
- **1 Toque para Tela Cheia:** Oculta menus técnicos e controles de edição, maximizando a linha do tempo para projeção em salas de reunião.
- **Scorecards de KPIs Executivos:**
  - **Go-Live Previsto** com indicador de folga ou atraso em relação à meta.
  - **Duração Total** em dias úteis reais.
  - **Progresso Global (%)** com barra de preenchimento suave.
  - **Gargalos no Caminho Crítico** (alertas de atividades com folga zero).
  - **Marcos Estratégicos** destacados em diamante dourado.

### 🔮 4. Simulador "What-If" em Tempo Real
- Na reunião com a diretoria do cliente: *"E se o fornecedor de hardware atrasar 2 semanas?"*
- Ative o modo **What-If**, arraste a barra com o dedo e veja o impacto instantâneo:
  - A interface renderiza a **Linha de Base Original (Baseline)** pontilhada para comparação visual.
  - Exibe um badge em tempo real: `⚠️ Impacto no Go-Live: +10 dias úteis`.
  - Permite efetivar as alterações ou descartar e voltar ao plano original, com suporte a **Desfazer/Refazer (Undo/Redo)**.

### 📱 5. Quatro Modos de Visualização
1. **Gantt Timeline:** Linha do tempo vetorial SVG com rolagem suave, conexões Bézier de dependência, marcador de *Hoje* e barras táteis interativas.
2. **Task Deck (Cards Mobile):** Cartões ergonômicos desenhados para smartphone com slider tátil de progresso (0% a 100%) ao alcance do polegar.
3. **WBS Tabela:** Visão hierárquica tabular para planejamento corporativo minucioso.
4. **Split Screen:** Visualização dividida lado a lado (Tabela + Linha do Tempo) para tablets e desktops.

### 📁 6. Blueprints de Engenharia Integrados
- **Implantação Piloto SGFrotas (Polo Logístico SP):** Cronograma completo para a reunião de 21/09 (diagnóstico, telemetria em 40 veículos, integração de portal e go-live).
- **Engenharia de Software Ágil:** Estruturado em Sprints de 2 semanas com histórias, testes e release.
- **Infraestrutura & Migração Cloud:** Assessment, Landing Zone, replicação de bancos e cutover.
- **Projeto em Branco:** Canvas limpo para criar novos cronogramas do zero.

### 🔄 7. Interoperabilidade & Exportações
- **Mermaid.js Bidirecional:** Exporta código Mermaid com 1 clique para colar no Notion, GitHub ou markdown, além de permitir colar código Mermaid para gerar o gráfico visual.
- **JSON Completo:** Backup e restauração de projetos locais.
- **Relatório para Impressão / PDF A4:** Estilos de impressão `@media print` calibrados para modo paisagem (Landscape).

---

## 💻 Como Utilizar

### Modo 1: Executável Standalone Offline (Sem Instalação)
Basta abrir diretamente com duplo clique o arquivo:
```
editor_cronograma.html
```
*(ou `dist/index.html`)*  
Ele abre em qualquer navegador (Chrome, Edge, Safari, Firefox), smartphone ou tablet sem precisar de internet ou servidor.

---

### Modo 2: Ambiente de Desenvolvimento Local

#### Pré-requisitos
- Node.js 18+ instalado.

#### Instalação e Execução
```powershell
# 1. Instalar as dependências
npm run install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Testar a visualização em rede local (para abrir no iPad/smartphone)
npm run preview -- --host
```

#### Compilar Novo Arquivo Único Standalone
Para regerar o executável `.html` com eventuais customizações:
```powershell
npm run build
```
O arquivo unificado será gerado automaticamente em `dist/index.html` (~278 KB).

---

## 🏗️ Estrutura do Projeto

```
EditorGantt/
├── editor_cronograma.html     # Executável único standalone 100% offline
├── package.json
├── vite.config.ts             # Plugin vite-plugin-singlefile configurado
├── tailwind.config.js         # Tokens Obsidian, Safira, Esmeralda, Carmim e Ouro
├── tsconfig.json
├── docs/                      # Documentação contínua de engenharia
│   ├── doc.md                 # Especificação técnica dos módulos
│   ├── tasks.md               # Checklist de entregas e progresso
│   └── implementation_plan.md # Plano de arquitetura aprovado
├── walkthrough/               # Histórico de validação e testes visuais
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types/
    │   └── gantt.ts           # Tipos de tarefas, dependências, KPIs e simulação
    ├── engine/
    │   ├── calendar.ts        # Cálculo matemático de dias úteis e feriados nacionais BR
    │   ├── dependencies.ts    # Propagação em cascata e detecção de ciclos
    │   ├── criticalPath.ts    # Algoritmo CPM e folga total
    │   └── mermaidEngine.ts   # Exportador e importador bidirecional Mermaid
    ├── context/
    │   └── GanttContext.tsx   # Estado reativo, histórico Undo/Redo e modo What-If
    ├── data/
    │   ├── blueprints.ts      # Modelos executivos (SGFrotas, Cloud, Software, Novo)
    │   └── holidaysBR.ts      # Motor de feriados oficiais do Brasil
    └── components/
        ├── layout/
        │   ├── ExecutiveHeader.tsx    # Barra de topo com Pitch Mode, Undo/Redo e Zoom
        │   ├── ExecutiveKpiBar.tsx    # Scorecards executivos C-Level
        │   ├── TapAndBuildToolbar.tsx # Esteira de montagem tátil (Zero Código)
        │   └── MobileBottomNav.tsx    # Navegação inferior ergonômica para smartphones
        ├── views/
        │   ├── TaskDeckView.tsx       # Visão Mobile: Cards com slider de progresso
        │   ├── TaskTableView.tsx      # Visão Tablet/Desktop: WBS tabular
        │   └── GanttTimelineView.tsx  # Visão Gantt: Renderizador SVG com drag e touch
        └── modals/
            ├── TaskDrawer.tsx         # Bottom Sheet móvel para edição de tarefas
            ├── BlueprintSelectorModal.tsx # Seletor de modelos de engenharia
            ├── ExportModal.tsx        # Exportador Mermaid, JSON e Impressão PDF
            └── SimulationBanner.tsx   # Faixa do simulador What-If
```

---

## 🎯 Integração Futura com o SGFrotas (Portal do Gestor)

Todo o código foi construído em **React 18 modular e TypeScript estrito**. Quando o desenvolvimento do Portal do Gestor do SGFrotas alcançar a fase de implantação de cronogramas, os componentes da pasta `src/engine/` e `src/components/` podem ser transplantados diretamente para o repositório principal como o módulo nativo de **"Gestão de Prazos, Manutenções e Implantação de Frotas"**, garantindo reaproveitamento de 100% da inteligência desenvolvida.

---

## 📄 Licença

Uso exclusivo e confidencial para projetos executivos e engenharia de soluções.
