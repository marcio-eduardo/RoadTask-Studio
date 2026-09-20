# Tarefas de Implementação: Vanguard Gantt Studio (Tap-and-Build)

## Fase 1: Setup & Motores Matemáticos de Engenharia
- [x] Inicializar projeto Vite + React 18 + TypeScript + Tailwind CSS + Lucide Icons
- [x] Configurar `vite-plugin-singlefile` para gerar bundle único autônomo
- [x] Implementar `src/types/gantt.ts` com tipos de entidades (Fases, Sprints, Stories, Marcos), unidades temporais (Horas, Dias, Semanas, Meses) e simulação
- [x] Implementar `src/engine/calendar.ts` (dias úteis, feriados nacionais, exclusão de fins de semana e suporte a horas)
- [x] Implementar `src/engine/dependencies.ts` (ordenação topológica, encadeamento automático com anterior, propagação FS/SS/FF e detecção de ciclos)
- [x] Implementar `src/engine/criticalPath.ts` (CPM - Early/Late Start/Finish, Folga Total, marcação visual de gargalos)
- [x] Implementar `src/engine/mermaidEngine.ts` (exportador e importador bidirecional Mermaid)

## Fase 2: Gestão de Estado, Armazenamento Local & Blueprints
- [x] Criar store com gerenciamento de tarefas, seleção, zoom, histórico Undo/Redo e modo Simulação
- [x] Implementar persistência local (múltiplos projetos no `localStorage`)
- [x] Criar blueprints executivos em `src/data/blueprints.ts` (SGFrotas SP, Software Ágil Sprints, Infra/Cloud Cutover, Roadmap Q1-Q4)

## Fase 3: Construtor Visual Touch-First & Componentes Mobile
- [x] Criar `ExecutiveHeader.tsx` (ações executivas, Pitch Mode, Undo/Redo e Temas)
- [x] Criar `ExecutiveKpiBar.tsx` (cards de métricas de alto impacto para C-Level)
- [x] Criar `TapAndBuildToolbar.tsx` (barra visual tátil: seletor de entidade Fase/Sprint/Story/Marco, chips de duração, unidades temporais e botão encadear)
- [x] Criar `MobileBottomNav.tsx` (navegação móvel ergonômica)
- [x] Criar `TaskDeckView.tsx` (visão mobile em cards táteis com slider de progresso)
- [x] Criar `TaskTableView.tsx` (tabela hierárquica WBS)
- [x] Criar `GanttTimelineView.tsx` e `GanttTaskBar.tsx` (renderizador SVG com arraste tátil de barras, resize, caminho crítico e marcos)
- [x] Criar `TaskDrawer.tsx` (Bottom-Sheet móvel para ajuste fino com uma mão só)

## Fase 4: Recursos Executivos Avançados
- [x] Implementar Modo Pitch C-Level em tela cheia com animações refinadas
- [x] Implementar Simulador What-If com comparação de Baseline e tag de impacto
- [x] Implementar modal de exportação (Mermaid interativo, PNG 2x/4x, JSON e Estilo de Impressão PDF)
- [x] Implementar modal de seleção de Blueprints e criação de projetos novos

## Fase 5: Compilação Standalone, Verificação e Validação
- [x] Gerar build standalone com `npm run build` (`editor_cronograma.html` de 278KB)
- [x] Validar funcionamento do executável `.html` offline
- [x] Testar no navegador em resoluções mobile (375px/414px) e tablet/desktop
- [x] Registrar walkthrough em `walkthrough/`

## Fase 6: Manutenção & Compatibilidade de Tooling
- [x] Corrigir tipagem do Vite 6 em `vite.config.ts` (substituição de `brotliSize` por `reportCompressedSize`)
- [x] Validar compilação sem erros no TypeScript e geração limpa do bundle singlefile (278.09 kB)

## Fase 7: Melhorias de UI/UX (Layout.excalidraw)
- [x] Centralizar perfeitamente o título do projeto e subtítulo da diretoria no cabeçalho executivo (`ExecutiveHeader.tsx`)
- [x] Implementar menu retrátil expansível de visualizações (`ViewSelectorDropdown.tsx`) substituindo o segmented control estático
- [x] Implementar menu de ajuda executiva (`HelpMenu.tsx`) com atalhos de teclado e guia de conceitos
- [x] Implementar motor de "Acesso Guiado" (`GuidedAccessContext.tsx`, `GuidedTooltip.tsx`) com indicador luminoso ativo
- [x] Criar micro-animações explicativas em SVG/CSS puro (`GuidedMicroAnimation.tsx`) para CPM, encadeamento FS, tap-and-build, what-if, marcos e go-live
- [x] Integrar `GuidedTarget` nos cards de KPIs e nos botões da barra de ferramentas Tap-and-Build
- [x] Validar compilação TypeScript (0 erros), compilação standalone Vite e testar interações no navegador

## Fase 8: Refinamento de Cabeçalho em Duas Camadas & Opacidade dos Menus
- [x] Estruturar cabeçalho em duas camadas (estilo Microsoft Word / Office 365): Barra de Título superior centralizada e Barra de Ferramentas / Menus inferior
- [x] Eliminar translucidez e tornar fundos de dropdown 100% sólidos e opacos (`bg-[#0B1120]`) com sombras de alto contraste e elevação `z-50`
- [x] Implementar evento `onMouseLeave` no `GuidedTarget` para que as dicas de ajuda fechem instantaneamente ao mover o cursor para fora
- [x] Validar compilação estática (`tsc`), build de produção único e verificar interações visuais no navegador

## Fase 9: Agrupamento de Botões & Interface Limpa (Clean Executive UI)
- [x] Unificar botões dispersos do cabeçalho (`Modelos`, `Exportar`, `Ajuda` e `Glossário`) no novo menu consolidado `[ 📁 Projeto ▾ ]` (`ProjectMenu.tsx`)
- [x] Garantir popover 100% opaco (`bg-[#0B1120]`), sólido, com anel de destaque e elevação `z-50`
- [x] Manter na ribbon executiva apenas comandos estratégicos principais (`[ 📁 Projeto ▾ ]`, `[ 🎚️ What-If ]`, `[ 📽️ Pitch ]`)
- [x] Refatorar `TapAndBuildToolbar.tsx` de 3 linhas pesadas para uma barra executiva unificada em linha única
- [x] Implementar seletor compacto de entidade em dropdown estilizado (`Story`, `Sprint`, `Fase`, `Marco`) com ícones e cores temáticas
- [x] Integrar seletor de duração com stepper e popover de predefinições rápidas (1d, 3d, 1 sem, 2 sem, 1 mês) e alternância de unidade
- [x] Otimizar posicionamento e evento do Acesso Guiado para não sobrepor ou bloquear menus popovers abertos
- [x] Validar compilação TypeScript (`tsc --noEmit`), build standalone Vite (`dist/index.html` de 314.38 kB) e copiar para `editor_cronograma.html`
- [x] Testar e registrar walkthrough com screenshots e gravação de tela

## Fase 11: Identidade Visual Definitiva "RoadTask Studio"
- [x] Pesquisa e validação de disponibilidade de marca (zero conflito de mercado para RoadTask Studio)
- [x] Gerar brandmark oficial em alta resolução baseado no conceito das 3 barras azuis escalonadas em fundo obsidian
- [x] Desenvolver componente vetorial `RoadTaskLogo.tsx` em SVG/CSS com animação sequencial em cascata de pulso de luz entre as 3 faixas
- [x] Atualizar insígnia na barra de título (`ExecutiveHeader.tsx`), metadados e favicon SVG personalizado com as 3 barras em `index.html`
- [x] Validar compilação TypeScript (0 erros), compilar build de produção e sincronizar com `editor_cronograma.html` (320.83 kB)
- [x] Criar manual de marca e brand showcase no Canvas (`roadtask_brand_showcase.md`)
- [x] Alinhar todos os menus e botões da faixa de comandos à esquerda (`justify-start`), eliminando vazios e dispersão horizontal em telas ultrawide

## Fase 12: Correção de Visibilidade e Recorte dos Menus Popover
- [x] Diagnosticar causa de ocultação dos menus retráteis (`overflow-x-auto` na Ribbon causava `overflow-y: auto/hidden` implícito pelo CSS, recortando popovers absolutos)
- [x] Ajustar container de comandos em `ExecutiveHeader.tsx` removendo o corte de overflow e aplicando elevação de contexto `relative z-30`
- [x] Validar compilação TypeScript (`tsc --noEmit`) sem erros
- [x] Validar compilação Vite do bundle único autônomo (`editor_cronograma.html`)
- [x] Executar verificação visual via navegador automatizado com abertura e captura de screenshots de `[ 📁 Projeto ▾ ]` e `[ 📅 Gantt ▾ ]`

## Fase 13: Experiência e Retorno do Modo Pitch C-Level
- [x] Diagnosticar ausência de rota de saída no Pitch em desktop (ocultação total do header somada à classe `md:hidden` no nav mobile deixava a tela sem botão de retorno)
- [x] Criar `PitchHeader.tsx` com insígnia RoadTask Studio, título do projeto, projeção C-Level, controle de tela cheia e botão de alto contraste `[ ⬅ Retornar ao Editor ESC ]`
- [x] Integrar ouvinte de atalho global da tecla `Escape` no `GanttContext.tsx` para saída instantânea
- [x] Validar compilação TypeScript (0 erros), compilar build de produção autônomo único (`editor_cronograma.html` de 326.40 kB)
- [x] Testar e comprovar via navegador tanto o clique no botão quanto o acionamento da tecla ESC

## Fase 14: Correção Estrutural da Barra e Preenchimento Progressivo de Tarefas
- [x] Diagnosticar causa do esmagamento da barra em tarefas com nomes longos (etiqueta externa com `whitespace-nowrap` disputava a largura fixa do container flexível)
- [x] Desvincular etiqueta externa do fluxo flexbox da barra utilizando posicionamento flutuante `absolute left-full ml-3 top-1/2 -translate-y-1/2`
- [x] Garantir `w-full h-9` na barra de tarefas para ocupar rigorosamente 100% da duração planejada no calendário
- [x] Implementar novo design de "Trilho Vazio Planejado": em 0% de progresso, a barra exibe fundo obsidian escuro `#0B1120` com contorno temático
- [x] Implementar preenchimento visual progressivo dinâmico da esquerda para a direita de 1% a 100% com a cor da entidade
- [x] Validar compilação TypeScript (`tsc --noEmit`), build Vite e sincronizar `editor_cronograma.html` (327.17 kB)
- [x] Comprovar visualmente no navegador os estados de 0%, 50% e 100% com capturas de tela

## Fase 15: Limpeza Visual Estrita & Interação por Duplo Clique
- [x] Eliminar poluição visual removendo etiquetas externas flutuantes, mantendo todas as informações estritamente dentro da barra
- [x] Remover abertura de modal no clique aleatório da linha/canvas (`onClick` da linha disparava o modal em qualquer área vazia da tela)
- [x] Configurar clique único na barra apenas para seleção visual (`setSelectedTaskId`) sem disparar modais indesejados
- [x] Configurar abertura do modal de detalhes/edição (`TaskDrawer`) exclusivamente ao executar duplo clique (`onDoubleClick`) diretamente na barra ou marco
- [x] Adicionar tooltip nativo descritivo com dicas de atalho no hover da barra
- [x] Validar compilação TypeScript (`tsc --noEmit`), build de produção único sincronizado em `editor_cronograma.html` (327.09 kB)
- [x] Comprovar no navegador a linha do tempo limpa, o clique único de seleção e o duplo clique exclusivo para o modal

