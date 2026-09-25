# RoadTask Studio

<div align="center">

![RoadTask Studio](https://img.shields.io/badge/RoadTask%20Studio-Executive%20Timeline-0284c7?style=for-the-badge&logo=codewars&logoColor=white)
![React 18](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Offline First](https://img.shields.io/badge/SingleFile-468%20kB%20Standalone-10b981?style=for-the-badge&logo=html5&logoColor=white)

**Executive Timeline & Gantt Engine**  
*Projete cronogramas ágeis em segundos, simule impactos ao vivo, exporte para Mermaid, SVG ou PDF A4 executivo, sincronize na nuvem ou salve nativamente no Windows com um único atalho (Ctrl+S).*

</div>

---

## 🌟 Visão Geral

O **RoadTask Studio** é um estúdio visual de modelagem de cronogramas, roadmaps e diagramas de Gantt voltado para arquitetos de soluções, engenheiros de software, gerentes de produto e diretores técnicos. 

Ele une **rigor matemático de engenharia** (cálculo real de dias úteis, exclusão de feriados brasileiros, Critical Path Method - CPM, detecção de loops em dependências) com **impacto visual de nível executivo** e **usabilidade touch-first para tablets e smartphones (Zero Código / Zero Sintaxe)**.

A aplicação adota a arquitetura **Offline-First**:
- **Executável Único Autônomo (`editor_cronograma.html`):** Um arquivo `.html` único de ~468 kB que roda 100% offline em qualquer navegador moderno, sem dependências ou instalação prévia.
- **Persistência Híbrida:** Salva diretamente na pasta local do Windows via *File System Access API* (`Ctrl+S`) ou sincroniza na nuvem com backend *Python FastAPI* e *PostgreSQL JSONB (Supabase)*.

---

## ⚡ Início Rápido (< 2 minutos)

### Opção 1: Executável Autônomo Offline (Zero Instalação)
Basta abrir o arquivo com um duplo-clique no seu navegador favorito (Chrome, Edge, Safari, Firefox):
```
editor_cronograma.html
```
*Funciona imediatamente sem internet, ideal para apresentações e clientes.*

---

### Opção 2: Ambiente de Desenvolvimento (Frontend)

Requisitos: Node.js 18+ instalado.

```powershell
# 1. Instalar dependências
npm.cmd install

# 2. Iniciar o servidor de desenvolvimento Vite
npm.cmd run dev

# 3. Compilar TypeScript e gerar novo bundle autônomo (dist/index.html)
npm.cmd run build
```
O servidor de desenvolvimento estará disponível em: `http://localhost:5173/`

---

### Opção 3: Backend Python & Persistência em Nuvem (Opcional)

Requisitos: Docker ou Python 3.11+.

```powershell
# Iniciar via Docker Compose
docker compose up -d

# Ou iniciar manualmente via Python
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- **API FastAPI:** `http://localhost:8000`
- **Swagger / OpenAPI:** `http://localhost:8000/docs`

---

## 🚀 Principais Módulos & Recursos

### 🎯 1. Arquitetura Scrum Oficial (Scrum Guide 2020)
- **Épicos como Swimlanes:** Coluna fixa à esquerda agrupando histórias e marcos em raias horizontais contínuas.
  - **Épicos Vazios com 0 Histórias:** Renderizados imediatamente com o badge `0 itens` e um botão placeholder interativo `+ Adicionar História em {nome}` para criar a primeira história diretamente na raia com 1 clique.
  - **Modal Dedicado de Épicos (`EpicModal`):** Permite configurar Nome, Subtítulo/Objetivo Estratégico, paleta cromática de 7 cores executivas (Índigo, Safira, Esmeralda, Âmbar, Violeta, Carmim, Ciano), datas e prazos.
  - **Exclusão Segura em 2 Etapas:** Painel inline de confirmação sem popups nativos bloqueáveis, com opção de desvincular histórias filhas ou excluí-las em cascata.
- **Linha do Tempo de Sprints no Cabeçalho:**
  - *Camada 1 (Superior):* Barra de Meses com rastreamento suave da data atual (`HOJE`).
  - *Camada 2 (Intermediária):* Linha de Sprints posicionada horizontalmente sobre os dias correspondentes (`Sprint 0`, `Sprint 1`, etc.), com barra de progresso alimentada pelo avanço das histórias filhas e abertura do drawer de Sprint com 1 clique.
  - *Camada 3 (Inferior):* Régua diária com numeração e dias da semana.
- **Histórias de Usuário vs. Tarefas Técnicas dos Desenvolvedores (`subtasks`):**
  - As histórias são as unidades de valor exibidas na timeline.
  - O duplo-clique na barra da história abre o painel ágil com a lista interativa de tarefas técnicas dos desenvolvedores, permitindo concluir (`[x]`), reabrir, adiar (+1d/+2d) e recalcular o progresso de 0% a 100% em tempo real.
- **Scrum View & Geração de Diagramas SVG:**
  - Alternância entre **Modo Cards Ágeis** (Sprint Backlog + Product Backlog por Épicos) e **Modo Diagrama SVG** em tela cheia com geração vetorial automática (`scrumSvgEngine.ts`) e botão de download vetorial com 1 clique.

---

### 🖐️ 2. Construtor Visual Tátil ("Tap-and-Build")
- **Barra Executiva em Linha Única:** Sem poluição visual, alinhada à esquerda com comandos agrupados.
- **Entidades com 1 Toque:** Seletor intuitivo de `Épico`, `Sprint`, `Story` e `Marco (Milestone)`.
- **Predefinições Rápidas de Duração:** Chips táteis (`1d`, `3d`, `1 sem`, `2 sem`, `1 mês`) e controle por steppers numéricos.
- **Unidades Temporais Flexíveis:** Suporte nativo a *Horas*, *Dias*, *Semanas* e *Meses*.
- **Auto-Encadeamento:** Botão `[ 🔗 Encadear ]` que conecta automaticamente o início da nova tarefa ao término da atividade anterior (relação Término-Início / FS).

---

### 🧮 3. Motor Matemático de Engenharia
- **Calendário com Feriados Nacionais Brasileiros:** Cálculo preciso de dias úteis reais, desconsiderando finais de semana e feriados nacionais fixos e móveis (Carnaval, Sexta-feira Santa, Páscoa, Corpus Christi, etc.).
- **Ordenação Topológica & Prevenção de Ciclos:** Algoritmo que detecta referências circulares em tempo real antes de criar qualquer dependência.
- **Caminho Crítico (CPM):** Calcula datas mais cedo (*Early Start/Finish*), datas mais tarde (*Late Start/Finish*) e a Folga Total (*Total Float*), sinalizando visualmente as tarefas sem folga.

---

### 📋 4. Gestão Operacional & Diário de Bordo da Atividade (`TaskDrawer`)
- **Tela Única sem Abas Burocráticas:** Edição direta de título, situação, datas e responsável.
- **Situação Operacional:** Chips táteis para *Não Iniciada*, *Em Andamento*, *Em Revisão*, *Concluída*, *Bloqueada* e *Pausada*.
- **Semáforo RAG Executivo:** Indicador de saúde visual (🟢 *No Prazo*, 🟡 *Em Risco*, 🔴 *Atrasada*, 🟣 *Bloqueada*).
- **Diário de Bordo & Ocorrências:** Acordeão colapsado por padrão para registrar apontamentos cronológicos da tarefa, acompanhado de chips rápidos de 1 toque (`+ Alinhado em reunião`, `+ Criado API`, etc.).

---

### 🎨 5. Design System Dual & Paleta Low-Glare
- **Modo Escuro ("Obsidiana & Ciano Cirúrgico"):** Fundo obsidiana puro (`#090a0d`), cartões em grafite módulo (`#12151d`), conectores em ciano e indicador de data atual em rubro.
- **Modo Claro ("Suíço Monocromo & Cimento Polido / Ônix"):** Estética arquitetural Low-Glare em cimento escovado (`#eaedf1`), superfícies em placas de cimento polido (`#f6f8fa`), juntas em aço escovado (`#d1d7de`) e tipografia em preto ônix de alto contraste (`#0f141c`), eliminando reflexos cansativos.
- **Fonte Única da Verdade:** Cores e bordas centralizadas dinamicamente no `tailwind.config.js` via plugin nativo `addBase`, garantindo sincronia perfeita com as variáveis CSS `--gantt-*`.
- **Identidade Visual RoadTask:** Insígnia vetorial com 3 barras escalonadas e animação sequencial em cascata de pulso de luz (`RoadTaskLogo`).

---

### 📄 6. Relatório Executivo Oficial em PDF A4 Paisagem
- **Componente `.print-only` Dedicado (`ExecutivePrintReport`):** Renderizado exclusivamente ao acionar a impressão ou exportação para PDF.
- **Layout A4 Paisagem (Landscape):**
  - Cabeçalho corporativo com metadados do projeto, cliente e data de emissão.
  - 5 scorecards executivos de KPIs (Go-Live Previsto, Duração Total, Progresso Ponderado, Total de Histórias/Marcos e Gargalos no Caminho Crítico).
  - Roadmap visual proporcional formatado para a largura da página sem barras de rolagem.
  - Tabela EAP/WBS hierárquica completa com quebras de página limpas (`break-inside: avoid`).
  - Quadro de Marcos Estratégicos com campos formais de assinatura/aprovação de patrocinadores.

---

### 💾 7. Persistência Híbrida & Nuvem
- **Salvamento Direto no Windows (`File System Access API`):**
  - Grava arquivos `.roadtask.json` diretamente no diretório escolhido pelo usuário.
  - Atalho universal **`Ctrl+S`** salva instantaneamente no arquivo vinculado em disco sem abrir telas de download.
- **Nuvem (FastAPI + Supabase):**
  - Armazenamento flexível em PostgreSQL JSONB com resiliência total contra variações de schema (`model_config = ConfigDict(extra='allow')`).
  - Modal reformulado em duas abas objetivas: **"Pasta Local"** e **"Nuvem"**, com opções explícitas de **Salvar**, **Carregar** e **Excluir** projetos remotos.

---

### 🔄 8. Interoperabilidade & Exportações
| Formato | Descrição |
|---|---|
| **Mermaid (.md / .mmd)** | Download direto com 1 clique de arquivo Mermaid pronto para GitHub, Notion ou Obsidian. |
| **SVG Puro** | Exportação vetorial do Diagrama Arquitetural Scrum de alta resolução. |
| **PDF A4 Formal** | Relatório executivo completo diagramado para impressão e assinaturas. |
| **JSON Completo** | Backup integral de tarefas, calendário, baseline e metadados. |
| **PNG em Alta Resolução** | Captura visual do cronograma para apresentações executivas. |

---

## 📁 Estrutura do Repositório

```
EditorGantt/
├── editor_cronograma.html        # Executável autônomo standalone 100% offline (~468 kB)
├── docker-compose.yml            # Orquestração do Backend Python FastAPI
├── package.json                  # Dependências React 18, Vite e Tailwind CSS
├── vite.config.ts                # Configuração do Vite com vite-plugin-singlefile
├── tailwind.config.js            # Design tokens e plugin de injeção CSS dinâmico
├── tsconfig.json                 # Tipagem estrita TypeScript
│
├── api/                          # Entrada serverless Vercel
│   ├── index.py                  # Adaptador Python para Vercel Runtime
│   └── requirements.txt          # Dependências mínimas de deploy
│
├── backend/                      # Backend Python FastAPI
│   ├── main.py                   # Endpoints REST (/api/projects, /api/health)
│   ├── models.py                 # Schemas Pydantic (Task, Project, Calendar)
│   ├── database.py               # Persistência Supabase JSONB / Fallback local
│   └── requirements.txt          # Dependências Python
│
├── docs/                         # Documentação e especificações
│   ├── doc.md                    # Documentação técnica e arquitetural consolidada
│   ├── tasks.md                  # Rastreamento das fases de desenvolvimento (Fases 1 a 35)
│   ├── Gantt/                    # Especificações de cronogramas e diagramas
│   └── Scratch/                  # Esboços Excalidraw e Obsidian Canvases
│
├── walkthrough/                  # Histórico de walkthroughs das implementações (001 a 017)
│
└── src/                          # Código-fonte da aplicação React
    ├── main.tsx                  # Ponto de entrada
    ├── App.tsx                   # Roteamento de visualizações e relatórios
    ├── index.css                 # Estilos globais e regras de impressão (@media print)
    ├── types/
    │   └── gantt.ts              # Interfaces de domínio (Task, Project, SubTask, RAG)
    ├── engine/
    │   ├── calendar.ts           # Dias úteis, feriados nacionais e cálculos de datas
    │   ├── dependencies.ts       # Ordenação topológica, propagação FS/SS/FF e ciclos
    │   ├── criticalPath.ts       # Algoritmo CPM e folga total
    │   ├── mermaidEngine.ts      # Parser e exportador Mermaid Markdown
    │   └── scrumSvgEngine.ts     # Gerador vetorial SVG dinâmico do diagrama Scrum
    ├── services/
    │   ├── apiClient.ts          # Comunicação com a API FastAPI / Supabase
    │   └── windowsFileSystem.ts  # File System Access API do Windows (Ctrl+S)
    ├── context/
    │   ├── GanttContext.tsx      # Gerenciamento de estado global, Undo/Redo e ações
    │   └── GuidedAccessContext.tsx # Sistema de Acesso Guiado com micro-animações
    ├── data/
    │   ├── blueprints.ts         # Catálogo de modelos pré-configurados (Frotas V2, etc.)
    │   └── holidaysBR.ts         # Base de feriados nacionais brasileiros
    └── components/
        ├── brand/
        │   └── RoadTaskLogo.tsx  # Logotipo oficial animado em SVG
        ├── layout/
        │   ├── ExecutiveHeader.tsx    # Cabeçalho executivo em linha única
        │   ├── ExecutiveKpiBar.tsx    # Scorecards executivos C-Level
        │   ├── TapAndBuildToolbar.tsx # Construtor tátil Tap-and-Build
        │   ├── ProjectMenu.tsx        # Menu de projetos e nuvem
        │   └── ViewSelectorDropdown.tsx# Seletor dinâmico de visualizações
        ├── gantt/
        │   └── GanttTimelineView.tsx  # Linha do tempo em 3 camadas com Swimlanes
        ├── views/
        │   ├── ScrumView.tsx          # Visão Scrum (Cards Ágeis + Diagrama SVG)
        │   ├── TaskTableView.tsx      # Tabela EAP/WBS detalhada
        │   └── TaskDeckView.tsx       # Visão mobile em cards táteis
        ├── modals/
        │   ├── EpicModal.tsx          # Modal de criação, edição e exclusão de Épicos
        │   ├── TaskDrawer.tsx         # Gaveta ágil de edição de histórias e tarefas
        │   ├── ExportModal.tsx        # Central de exportação (Mermaid, SVG, PDF, JSON)
        │   ├── StorageModal.tsx       # Gerenciamento de pasta local e nuvem
        │   └── BlueprintSelectorModal.tsx # Catálogo de templates executivos
        └── print/
            └── ExecutivePrintReport.tsx # Relatório formal A4 Paisagem para impressão/PDF
```

---

## 📚 Modelos Estratégicos Inclusos (Blueprints)

1. **Gestão de Frotas V2 (Scrum Completo - SGFrotas 2026):**
   - 7 Sprints (Sprint 0 a 6) cobrindo desde a imersão presencial e fundação tecnológica (FastAPI, PostgreSQL, React) até o piloto com 50 carros em campo e homologação do PWA offline.
   - 3 Épicos estruturados: *Imersão & Fundação Técnica*, *Fase 1: Gestão de Frotas (Gestor)* e *Fase 2: Gestão do Técnico (Campo)*.
   - 3 Marcos de entrega formais: M1 (Setup Base), M2 (Módulo Gestor em Produção) e M3 (Go-Live Geral).
2. **Gestão de Frotas (Scrum por Personas):** Divisão por Personas de Negócio (Gestor de Frotas vs. Técnico de Campo).
3. **Engenharia de Software Ágil:** Setup, sprint backlog, refatoração e cutover de produção.
4. **Infraestrutura / Cloud Cutover:** Planejamento crítico de migração de datacenters com CPM acentuado.
5. **Roadmap Estratégico Q1-Q4:** Visão macro anual para conselhos executivos e diretoria.
6. **Novo Projeto em Branco:** Inicialização limpa por padrão (ou forçada via URL com `?new`, `?blank` ou `?novo`).

---

## 📖 Documentação Adicional

- [Documentação Técnica Detalhada](docs/doc.md) — Visão de arquitetura, tokens CSS e fluxos de engenharia.
- [Histórico de Tarefas & Fases](docs/tasks.md) — Rastreamento detalhado das Fases 1 a 35.
- [Especificação Scrum do SGFrotas V2](docs/Gantt/FrotasV2_Scrum.md) — Critérios de aceite, metas de sprint e personas de negócio.
- [Walkthroughs de Implementação](walkthrough/) — Guias ilustrados passo a passo de todas as evoluções do estúdio.

---

## 📄 Licença

Projeto desenvolvido para planejamento, gestão executiva e modelagem ágil de cronogramas corporativos e projetos de engenharia de software de alta complexidade.
