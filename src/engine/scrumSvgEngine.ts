import { Project, Task, isEpic, getTaskEpicId } from '../types/gantt';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Motor dinâmico de geração de Diagramas Scrum em SVG vetorial.
 * Gera o SVG estruturado com Product Backlog (Épicos & Histórias) e Sprint Backlog (Tarefas & Meta).
 */
export function generateScrumSvg(project: Project): string {
  const epics = project.tasks.filter(isEpic);
  const sprints = project.tasks.filter(t => t.type === 'sprint');
  const activeSprint = sprints.find(s => s.status === 'in_progress') || sprints[0];

  // Identificar histórias de cada épico
  const epicColumns = (epics.length > 0 ? epics : [
    {
      id: 'default_epic',
      name: 'Épico Principal: Backlog do Produto',
      type: 'epic',
      startDate: project.createdAt,
      duration: 10,
      endDate: project.createdAt,
      progress: 0,
      dependencies: []
    } as Task
  ]).map((epic, index) => {
    const stories = project.tasks.filter(
      t => (t.type === 'story' || t.type === 'milestone') && (getTaskEpicId(t) === epic.id || epics.length === 1)
    );
    const tasks = project.tasks.filter(
      t => t.type !== 'epic' && t.type !== 'phase' && t.type !== 'sprint' && getTaskEpicId(t) === epic.id
    );

    // Paleta alternada para personas/épicos (Gestor = Safira/Azul, Técnico = Esmeralda/Verde, etc)
    const colorThemes = [
      { stroke: '#0284c7', bg: '#f0f9ff', headerGrad1: '#0284c7', headerGrad2: '#0369a1', text: '#0369a1' },
      { stroke: '#16a34a', bg: '#f0fdf4', headerGrad1: '#16a34a', headerGrad2: '#15803d', text: '#15803d' },
      { stroke: '#d97706', bg: '#fffbeb', headerGrad1: '#d97706', headerGrad2: '#b45309', text: '#b45309' },
      { stroke: '#9333ea', bg: '#faf5ff', headerGrad1: '#9333ea', headerGrad2: '#7e22ce', text: '#7e22ce' }
    ];
    const theme = colorThemes[index % colorThemes.length];

    return {
      epic,
      stories,
      tasks,
      theme
    };
  });

  // Dimensões do layout
  const colWidth = 380;
  const colGap = 24;
  const productBacklogWidth = Math.max(820, epicColumns.length * colWidth + (epicColumns.length - 1) * colGap + 60);
  const sprintWidth = 360;
  const totalSvgWidth = sprintWidth + 60 + productBacklogWidth + 60;
  const totalSvgHeight = 840;

  // Sprint Data
  const sprintName = activeSprint?.name || 'Sprint 1: Cautela & Checklist';
  const sprintProgress = activeSprint?.progress || 0;
  const sprintStories = activeSprint
    ? project.tasks.filter(t => (t.type === 'story' || t.type === 'milestone') && getTaskEpicId(t) === activeSprint.id)
    : [];

  const sprintTasks = project.tasks.filter(
    t => t.type !== 'epic' && t.type !== 'phase' && t.type !== 'sprint' && (t.phaseId === activeSprint?.id || t.epicId === activeSprint?.id)
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSvgWidth} ${totalSvgHeight}" width="${totalSvgWidth}" height="${totalSvgHeight}" style="background:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.07"/>
    </filter>
    <linearGradient id="gradSprint" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#6d28d9" />
    </linearGradient>
  </defs>

  <!-- Cabeçalho Executivo -->
  <text x="${totalSvgWidth / 2}" y="50" font-size="26" font-weight="800" fill="#0f172a" text-anchor="middle">🎯 Arquitetura Scrum por Épicos &amp; Personas: ${escapeXml(project.name)}</text>
  <text x="${totalSvgWidth / 2}" y="78" font-size="14" fill="#64748b" text-anchor="middle">Cliente / Contexto: ${escapeXml(project.clientName || 'RoadTask Studio')} • Gerado automaticamente do Cronograma</text>

  <!-- ======================== SPRINT BACKLOG (ESQUERDA) ======================== -->
  <g transform="translate(40, 110)">
    <rect width="${sprintWidth}" height="580" rx="16" fill="#ffffff" stroke="#7c3aed" stroke-width="2" filter="url(#shadow)"/>
    <rect width="${sprintWidth}" height="56" rx="16" fill="url(#gradSprint)"/>
    <rect y="40" width="${sprintWidth}" height="16" fill="url(#gradSprint)"/>
    <text x="20" y="36" font-size="17" font-weight="700" fill="#ffffff">⚡ Sprint Backlog (Execução)</text>

    <!-- Meta da Sprint -->
    <rect x="18" y="70" width="${sprintWidth - 36}" height="70" rx="10" fill="#fdf4ff" stroke="#e9d5ff" stroke-width="1.5"/>
    <text x="30" y="92" font-size="12" font-weight="700" fill="#701a75">🎯 SPRINT ATIVA &amp; META:</text>
    <text x="30" y="112" font-size="12" font-weight="600" fill="#3b0764">${escapeXml(sprintName.slice(0, 42))}</text>
    <text x="30" y="128" font-size="11" fill="#86198f">Progresso da Sprint: ${sprintProgress}% concluído</text>

    <!-- História Selecionada -->
    <rect x="18" y="152" width="${sprintWidth - 36}" height="110" rx="10" fill="#faf5ff" stroke="#d8b4fe" stroke-width="1.5"/>
    <text x="30" y="176" font-size="12" font-weight="700" fill="#581c87">📖 História Puxada na Planning:</text>
    <text x="30" y="198" font-size="12" fill="#3b0764">${escapeXml(sprintStories[0]?.name || 'História de entrega de valor para a Persona')}</text>
    <text x="30" y="222" font-size="11" font-weight="600" fill="#7e22ce">Critério de Aceite: Validado em Homologação</text>
    <text x="30" y="242" font-size="11" fill="#6b21a8">Status: ${escapeXml(activeSprint?.status || 'in_progress')}</text>

    <!-- Tasks dos Developers -->
    <rect x="18" y="274" width="${sprintWidth - 36}" height="286" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="30" y="298" font-size="13" font-weight="700" fill="#0f172a">🛠️ Tasks Técnicas dos Developers:</text>

    ${
      (sprintTasks.length > 0 ? sprintTasks.slice(0, 5) : [
        { name: 'API REST: Endpoints de dados e regras de negócio', progress: 100 },
        { name: 'Frontend / Mobile: Interface e telas da persona', progress: 50 },
        { name: 'Push & Notificações: Mensageria e regras de alerta', progress: 0 },
        { name: 'QA & Testes: Automação e critérios de aceite', progress: 0 }
      ]).map((t, i) => `
    <g transform="translate(28, ${320 + i * 44})">
      <circle cx="10" cy="12" r="5" fill="#7c3aed"/>
      <text x="24" y="12" font-size="12" font-weight="600" fill="#1e293b">${escapeXml(t.name.slice(0, 34))}</text>
      <text x="24" y="26" font-size="10.5" fill="#64748b">Progresso: ${t.progress || 0}% • Duração estimada</text>
    </g>`).join('')
    }
  </g>

  <!-- ======================== PRODUCT BACKLOG (DIREITA) ======================== -->
  <g transform="translate(${sprintWidth + 70}, 110)">
    <rect width="${productBacklogWidth}" height="580" rx="16" fill="#f8fafc" stroke="#334155" stroke-width="2" filter="url(#shadow)"/>
    <rect width="${productBacklogWidth}" height="56" rx="16" fill="#1e293b"/>
    <rect y="40" width="${productBacklogWidth}" height="16" fill="#1e293b"/>
    <text x="24" y="36" font-size="18" font-weight="700" fill="#ffffff">📦 Product Backlog: Arquitetura por Épicos &amp; Personas</text>
    <text x="${productBacklogWidth - 280}" y="36" font-size="12" fill="#94a3b8">Reflete a Jornada do Negócio (User Journeys)</text>

    <!-- COLUNAS DOS ÉPICOS -->
    ${epicColumns.map((col, idx) => {
      const colX = 24 + idx * (colWidth + colGap);
      const { epic, stories, tasks, theme } = col;

      return `
      <g transform="translate(${colX}, 74)">
        <rect width="${colWidth}" height="486" rx="12" fill="#ffffff" stroke="${theme.stroke}" stroke-width="2"/>
        
        <!-- Header do Épico -->
        <path d="M 0 12 Q 0 0 12 0 L ${colWidth - 12} 0 Q ${colWidth} 0 ${colWidth} 12 L ${colWidth} 50 L 0 50 Z" fill="${theme.headerGrad1}"/>
        <text x="16" y="24" font-size="15" font-weight="700" fill="#ffffff">${escapeXml(epic.name.slice(0, 36))}</text>
        <text x="16" y="42" font-size="11.5" fill="#e0f2fe">Progresso: ${epic.progress}% • ${stories.length} Histórias mapeadas</text>

        <!-- Bloco de Histórias -->
        <rect x="14" y="62" width="${colWidth - 28}" height="220" rx="8" fill="${theme.bg}" stroke="${theme.stroke}" stroke-width="1.2"/>
        <text x="24" y="84" font-size="12.5" font-weight="700" fill="${theme.text}">📋 Histórias de Usuário (Valor de Negócio):</text>
        
        ${
          (stories.length > 0 ? stories.slice(0, 4) : [
            { name: 'Visão Geral & Painel Operacional da Persona', progress: 100 },
            { name: 'Gestão de Alocação e Ações Diárias', progress: 40 },
            { name: 'Relatórios e Indicadores Consolidados', progress: 0 }
          ]).map((st, sIdx) => `
        <g transform="translate(24, ${104 + sIdx * 38})">
          <text x="0" y="0" font-size="11.5" font-weight="600" fill="#0f172a">• ${escapeXml(st.name.slice(0, 38))}</text>
          <text x="10" y="14" font-size="10.5" fill="#475569">Status: ${escapeXml((st as any).status || 'planejado')} (${(st as any).progress || 0}%)</text>
        </g>`).join('')
        }

        <!-- Bloco de Tasks Técnicas do Épico -->
        <rect x="14" y="294" width="${colWidth - 28}" height="178" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
        <text x="24" y="316" font-size="12" font-weight="700" fill="#334155">🛠️ Construções &amp; Entregáveis Técnicos:</text>
        ${
          (tasks.length > 0 ? tasks.slice(0, 4) : [
            { name: 'APIs e Backend de persistência de dados' },
            { name: 'Interface Web e Mobile-first responsiva' },
            { name: 'Integrações de serviços e mensageria' },
            { name: 'Testes de segurança e validações de banco' }
          ]).map((tk, tIdx) => `
        <text x="24" y="${338 + tIdx * 24}" font-size="11" fill="#475569">• ${escapeXml(tk.name.slice(0, 40))}</text>`).join('')
        }
      </g>`;
    }).join('')}
  </g>

  <!-- PLANNING CONNECTOR ARROW -->
  <g transform="translate(${sprintWidth + 40}, 270)">
    <path d="M 28 0 L 10 0 L 10 18 L -15 18" fill="none" stroke="#7c3aed" stroke-width="3" stroke-dasharray="5,3"/>
    <polygon points="-15,12 -28,18 -15,24" fill="#7c3aed"/>
    <rect x="-8" y="-9" width="48" height="18" rx="4" fill="#7c3aed"/>
    <text x="16" y="4" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">PLANNING</text>
  </g>

  <!-- Rodapé Metodológico Scrum Guide -->
  <g transform="translate(40, 715)">
    <rect width="${totalSvgWidth - 80}" height="76" rx="12" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" filter="url(#shadow)"/>
    <text x="24" y="26" font-size="13" font-weight="700" fill="#1d4ed8">💡 CONFORMIDADE COM O FRAMEWORK SCRUM:</text>
    <text x="24" y="46" font-size="11.5" fill="#1e40af">1. <tspan font-weight="700">Épicos e Personas:</tspan> Organizar o Product Backlog por Épicos de negócio reflete jornadas reais de usuários e garante entregas contínuas de valor.</text>
    <text x="24" y="64" font-size="11.5" fill="#1e40af">2. <tspan font-weight="700">Sprint Backlog:</tspan> O time técnico desdobra as histórias selecionadas em tarefas específicas (Backend, Mobile, QA) durante o Sprint Planning.</text>
  </g>
</svg>
`;
}

/**
 * Dispara o download imediato do SVG gerado no navegador.
 */
export function downloadScrumSvg(project: Project, filename?: string): void {
  const svg = generateScrumSvg(project);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (filename || `${project.name}_Scrum_Diagram`).toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.href = url;
  a.download = `${safeName}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copia o código SVG para a área de transferência.
 */
export async function copyScrumSvg(project: Project): Promise<void> {
  const svg = generateScrumSvg(project);
  await navigator.clipboard.writeText(svg);
}
