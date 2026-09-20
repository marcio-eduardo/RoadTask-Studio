# RoadTask Studio

> **Executive Timeline & Gantt Engine**  
> *Projete roadmaps em segundos, simule impactos ao vivo, sincronize na nuvem ou salve nativamente no Windows.*

---

## 🌟 Visão Geral

O **RoadTask Studio** é um estúdio de engenharia e gestão de projetos projetado para arquitetos de soluções, engenheiros de software e gestores técnicos. Desenvolvido com foco em **agilidade, touch-first e alta fidelidade visual**, ele transforma a criação de cronogramas e roadmaps executivos em uma experiência fluida e moderna.

O sistema opera no modelo **Offline-First**, podendo ser utilizado como um único arquivo autônomo de **~360 KB** (`editor_cronograma.html`) sem necessidade de conexão com a internet, ou conectado a um ecossistema completo de **persistência híbrida** (salvamento nativo no Windows via File System Access API ou sincronização na nuvem com backend Python FastAPI e NoSQL).

---

## 🚀 Principais Diferenciais

### 📊 1. Layout Executivo com Raias de Fases (Swimlanes)
- **Raias Verticais de Fases:** Coluna fixa à esquerda destacando claramente as fases (`Fase 1`, `Fase 2`, `Marcos`) e agrupando as atividades em blocos lógicos.
- **Faixas Sombreadas Alternadas:** Shading suave nas raias para facilitar o rastreamento visual horizontal.
- **Rótulos Inteligentes e Adaptativos:** Tarefas de curta duração (ex.: *Brainstorm 2d*) exibem o nome externamente à direita da barra, evitando sobreposição e cortes de texto; tarefas mais longas exibem o título internamente.
- **Linha de Referência Temporal:** Marcador vertical vermelho indicando a data de corte/início do cronograma integrado.

### 💾 2. Persistência Híbrida Inteligente
- **Salvamento Direto no Windows (`File System Access API`):**
  - Salva arquivos nativos `.roadtask.json` diretamente na pasta de sua escolha no Windows.
  - Suporte ao atalho universal **`Ctrl+S`**: edite e salve instantaneamente no mesmo arquivo em disco, sem download repetido e sem caixas de diálogo adicionais.
  - Indicador de status do arquivo vinculado no cabeçalho executivo com opção de desvincular em 1 clique.
- **Backend Python FastAPI + NoSQL (MongoDB / JSON Store):**
  - Modelagem NoSQL ideal para grafos hierárquicos de cronograma.
  - Fallback automático inteligente: se o MongoDB não estiver rodando, a API grava e lê automaticamente de `backend/data/projects.json`.
  - Containerização completa com **Docker & Docker Compose**.
- **Deploy Serverless no Vercel:**
  - Adaptador `api/index.py` pronto para o Vercel Python Runtime conectado ao MongoDB Atlas ou Supabase.

### 🖐️ 3. Construtor Visual Tátil ("Tap-and-Build")
- **Zero Sintaxe / Zero Código:** Sem fórmulas manuais ou digitação repetitiva.
- **Entidades com 1 Toque:** `Fase/Épico`, `Sprint`, `Story/Tarefa` e `Marco (Milestone)`.
- **Auto-Sugestão Inteligente:** Sugere sequências de sprints (`Sprint 1`, `Sprint 2`...) e marcos estratégicos (`Go-Live`, `Homologação`, `Aceite`).
- **Chips de Duração Rápida:** Botões ergonômicos (`+1d`, `+3d`, `+5d`, `+10d`, `+20d` e steppers `[-]` / `[+]`).
- **Auto-Encadeamento:** Botão `[🔗 Encadeia com Anterior]` liga a nova tarefa ao término da anterior (relação Término-Início / FS) instantaneamente.

### 🧮 4. Motor Matemático Rigoroso
- **Calendário de Dias Úteis:** Exclusão automática de finais de semana com cálculo dinâmico de feriados nacionais brasileiros (fixos e móveis como Carnaval, Páscoa e Corpus Christi).
- **Propagação em Cascata (FS, SS, FF):** Recálculo instantâneo de prazos com validação topológica contra ciclos de dependência.
- **Caminho Crítico (CPM):** Algoritmo Critical Path Method que calcula a folga total (*Total Float*) e destaca atividades críticas em carmim neon.

### 🎭 5. Modo Pitch C-Level ("Sala de Guerra")
- **1 Toque para Tela Cheia:** Oculta controles de edição para projeção limpa em reuniões com diretorias e clientes.
- **Scorecards Executivos (KPIs):**
  - **Go-Live Previsto** com indicador de folga ou atraso.
  - **Duração Total** em dias úteis reais.
  - **Progresso Global (%)** ponderado.
  - **Gargalos no Caminho Crítico** (alertas de tarefas sem folga).
  - **Marcos Estratégicos** destacados em diamante dourado.

### 🔮 6. Simulador "What-If" em Tempo Real
- Simule atrasos ou adiantamentos arrastando qualquer barra no gráfico:
  - Renderiza a **Linha de Base Original (Baseline)** pontilhada para comparação.
  - Exibe o impacto líquido no Go-Live em tempo real (`Ex: ⚠️ Impacto no Go-Live: +10 dias úteis`).
  - Suporte completo a **Desfazer/Refazer (Undo/Redo)**.

### 📱 7. Múltiplos Modos de Visualização
1. **Gantt Timeline:** Linha do tempo vetorial SVG com rolagem suave, raias de fases, curvas Bézier e arraste interativo.
2. **Task Deck (Cards Mobile):** Cartões táteis com slider de progresso ao alcance do polegar para smartphones.
3. **WBS Tabela:** Visão hierárquica tabular detalhada.
4. **Split Screen:** Visualização dividida lado a lado (Tabela + Gráfico Gantt).

### 🔄 8. Interoperabilidade & Exportações
- **Mermaid.js Bidirecional:** Exporta código Mermaid com 1 clique para colar no Notion/GitHub e importa código Mermaid existente para renderização imediata.
- **JSON Completo:** Backup, compartilhamento e restauração de projetos.
- **Impressão / PDF A4:** Estilos de impressão `@media print` otimizados para modo paisagem (Landscape).

---

## 💻 Como Utilizar

### Modo 1: Executável Standalone Offline (Sem Instalação)
Basta abrir diretamente com duplo clique no navegador:
```
editor_cronograma.html
```
*(Funciona 100% offline em Chrome, Edge, Safari, Firefox, tablets e smartphones).*

---

### Modo 2: Ambiente de Desenvolvimento (Frontend)

```powershell
# 1. Instalar as dependências do frontend
npm install

# 2. Iniciar o servidor de desenvolvimento Vite
npm run dev

# 3. Gerar novo executável único standalone atualizado
npm run build
```

---

### Modo 3: Backend Python & Docker (Opcional)

Para rodar a API localmente com Docker e banco de dados NoSQL:

```powershell
# Iniciar o backend FastAPI e o MongoDB
docker compose up -d
```
- **API FastAPI:** `http://localhost:8000`
- **Documentação Swagger Interativa:** `http://localhost:8000/docs`
- **MongoDB:** `localhost:27017`

*(Para executar sem Docker, basta entrar na pasta `backend`, executar `pip install -r requirements.txt` e iniciar com `uvicorn backend.main:app --reload --port 8000`).*

---

## 🏗️ Estrutura do Projeto

```
RoadTask-Studio/
├── editor_cronograma.html        # Executável único standalone 100% offline
├── docker-compose.yml            # Orquestração do Backend Python + MongoDB
├── package.json                  # Dependências do frontend React + Vite
├── vite.config.ts                # Configuração do bundler e singlefile plugin
├── tailwind.config.js            # Design tokens (Obsidian, Safira, Carmim, Ouro)
├── tsconfig.json                 # Configuração TypeScript
│
├── api/                          # Serverless entrypoint
│   └── index.py                  # Adaptador ASGI para Vercel Python Runtime
│
├── backend/                      # Backend Python FastAPI
│   ├── Dockerfile                # Imagem Docker Python 3.11-slim
│   ├── requirements.txt          # Dependências (FastAPI, Motor, Uvicorn, Pydantic)
│   ├── main.py                   # Rotas REST da API (/api/projects, /api/health)
│   ├── models.py                 # Schemas Pydantic (Project, Task, Dependency)
│   └── database.py               # Conexão MongoDB assíncrona com fallback JSON
│
└── src/                          # Código-fonte Frontend (React 18 + TS)
    ├── main.tsx                  # Ponto de entrada React
    ├── App.tsx                   # Componente raiz da aplicação
    ├── index.css                 # Estilos globais e fontes executivas
    ├── types/
    │   └── gantt.ts              # Interfaces TypeScript estritas
    ├── engine/
    │   ├── calendar.ts           # Cálculo de dias úteis e feriados brasileiros
    │   ├── dependencies.ts       # Validação de dependências e ordenação topológica
    │   ├── criticalPath.ts       # Algoritmo CPM e cálculo de folga total
    │   └── mermaidEngine.ts      # Parser e gerador bidirecional de Mermaid
    ├── services/
    │   ├── apiClient.ts          # Cliente HTTP para a API Python / Vercel
    │   └── windowsFileSystem.ts  # File System Access API para salvar no Windows (Ctrl+S)
    ├── context/
    │   ├── GanttContext.tsx      # Estado global, histórico Undo/Redo e atalhos
    │   └── GuidedAccessContext.tsx # Contexto de acessibilidade e tutoriais
    ├── data/
    │   ├── blueprints.ts         # Modelos pré-configurados (SGFrotas, Cloud, Ágil)
    │   └── holidaysBR.ts         # Base de feriados móveis e nacionais
    └── components/
        ├── brand/
        │   └── RoadTaskLogo.tsx  # Logotipo vetorial oficial
        ├── layout/
        │   ├── ExecutiveHeader.tsx   # Topbar executiva, status de arquivo e zoom
        │   ├── ExecutiveKpiBar.tsx   # Painel de métricas C-Level
        │   ├── TapAndBuildToolbar.tsx# Barra de inserção tátil de tarefas
        │   ├── ProjectMenu.tsx       # Menu de gerenciamento de projetos
        │   └── MobileBottomNav.tsx   # Barra de navegação móvel
        ├── views/
        │   ├── GanttTimelineView.tsx # Renderizador SVG com raias de fases (Swimlanes)
        │   ├── TaskDeckView.tsx      # Visualização móvel em cards
        │   └── TaskTableView.tsx     # Visualização tabular WBS
        └── modals/
            ├── StorageModal.tsx      # Central de Armazenamento (Windows & Nuvem)
            ├── TaskDrawer.tsx        # Painel lateral de edição de tarefas
            ├── ExportModal.tsx       # Exportação Mermaid, JSON e Impressão
            └── BlueprintSelectorModal.tsx # Catálogo de templates
```

---

## 📄 Licença

Projeto desenvolvido para gestão executiva de roadmaps, cronogramas integrados de engenharia e implantações de soluções de tecnologia.
