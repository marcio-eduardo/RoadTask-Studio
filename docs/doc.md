# Documentação do Projeto: Vanguard Gantt Studio

## 1. Descrição do Produto
O **Vanguard Gantt Studio** é um estúdio visual de modelagem de cronogramas, roadmaps e diagramas de Gantt voltado para engenheiros de soluções, arquitetos de sistemas e executivos. O foco central é unir **rigor matemático** (cálculo de dias úteis, CPM - Caminho Crítico, detecção de loops em dependências) com **impacto visual de nível executivo** e **usabilidade touch-first para tablets e smartphones (Zero Código / Zero Sintaxe)**.

## 2. Tecnologias Utilizadas
- **Core:** React 18, TypeScript, Vite
- **Estilização:** Tailwind CSS (Tokens Obsidian Executive, Safira, Esmeralda, Carmim, Ouro)
- **Ícones:** Lucide React (sem dependência de emojis de interface)
- **Distribuição:** `vite-plugin-singlefile` gerando um único `.html` standalone (~350KB), 100% autônomo e utilizável sem conexão à internet.
- **Motor de Engenharia:** Algoritmos puros em TypeScript para cálculo de dias úteis, exclusão de feriados brasileiros, ordenação topológica e Critical Path Method (CPM).

## 3. Principais Módulos
1. **Tap-and-Build Toolbar:** Barra de montagem tátil onde o usuário seleciona Tipo (Fase/Épico, Sprint, Story, Marco), Duração (Chips de 1d, 3d, 1sem, 2sem, 1mês ou Stepper), Unidade (Horas, Dias, Semanas, Meses) e opção "Encadear com Anterior" com 1 toque.
2. **Blueprints Executivos:** Presets de alto nível (Implantação SGFrotas SP, Engenharia de Software Ágil, Infraestrutura/Cutover e Roadmap Estratégico Q1-Q4).
3. **Modo Pitch C-Level:** Visualização em tela cheia voltada para projetores e reuniões com diretores, destacando KPIs e Marcos em diamante.
4. **Simulador "What-If":** Permite testar atrasos e adiantamentos ao vivo com comparação contra a Linha de Base (Baseline).
5. **Mobile View Engine & Menu de Visualizações:** Alternância entre Task Cards ergonômicos, Timeline Touch, Tabela WBS e Split View via menu expansível dinâmico (`ViewSelectorDropdown`).
6. **Interoperabilidade:** Exportação/Importação Mermaid, PNG em alta resolução, JSON e PDF para impressão.
7. **Central de Ajuda & Acesso Guiado Interativo:** Camada de assistência visual para gestores e leigos. Quando o "Acesso Guiado" é ligado, elementos do sistema (KPIs de Go-Live, Caminho Crítico CPM, Marcos, Barra Tap-and-Build, Simulador What-If) exibem tooltips flutuantes com micro-animações em SVG/CSS e explicações didáticas sem jargões.
