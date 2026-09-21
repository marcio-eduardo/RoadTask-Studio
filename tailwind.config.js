import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
    // Ativa o modo escuro via classe CSS ('dark' no elemento <html> ou container do Gantt)
    darkMode: 'class',

    // Caminhos onde o Tailwind deve procurar pelas classes utilitárias
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx,vue,html}'
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
            },

            colors: {
                // =====================================================================
                // PALETA CRUA: TEMA CLARO — LOW-GLARE / CIMENTO POLIDO & ÔNIX
                // =====================================================================
                swiss: {
                    snow: '#eaedf1',       // Fundo Cimento Arquitetural (Low-Glare, descanso visual)
                    surface: '#f6f8fa',    // Placas de Cimento Polido (Cards e Cabeçalho elevados)
                    hairline: '#d1d7de',   // Juntas e divisores técnicos (Aço escovado)
                    border: '#d1d7de',     // Bordas estruturais definidas
                    charcoal: '#0f141c',   // Preto Ônix Profundo (Tipografia de alta nitidez)
                    slate: '#242c38',      // Ardósia Ônix (Títulos e ênfases)
                    lead: '#3b4452',       // Grafite Mineral (Textos secundários)
                    muted: '#57606e',      // Muted de alto contraste (> 5:1)
                    red: '#dc2626',        // Rubro Cirúrgico (Alerta & Linha Hoje)
                    weekend: 'rgba(15, 20, 28, 0.035)', // Fundo de fins de semana
                    'weekend-stripe': 'rgba(15, 20, 28, 0.08)', // Hachura técnica de fins de semana
                },

                // =====================================================================
                // PALETA CRUA: TEMA ESCURO 5 — OBSIDIANA & CIANO CIRÚRGICO
                // =====================================================================
                obsidian: {
                    void: '#090a0d',       // Preto Obsidiana profundo
                    panel: '#0e1015',      // Cabeçalhos e barras de topo
                    card: '#12151d',       // Superfície dos cartões de KPI
                    column: '#0d0f14',     // Coluna de Fases
                    border: '#242936',     // Divisores suaves e atenuados
                    'border-dark': '#242936', // Bordas estruturais igualmente suaves (eliminado o strong)
                    bar: '#2c3444',        // Barras de tarefa neutras
                    'bar-dark': '#1f242e', // Barras secundárias
                    'bar-hover': '#364052',// Hover de tarefas
                    cyan: '#0891b2',       // Ciano Cirúrgico (Foco & Conexões)
                    'cyan-bright': '#06b6d4', // Marcos e badges
                    'cyan-dark': '#0e7490',// Barra em destaque
                    red: '#dc2626',        // Alerta e Linha Hoje
                    weekend: 'rgba(255, 255, 255, 0.025)', // Fundo de fins de semana (Escuro)
                    'weekend-stripe': 'rgba(255, 255, 255, 0.08)', // Hachura de fins de semana (Escuro)
                    // Escala Obsidian legada
                    950: '#060911',
                    900: '#0A0F1D',
                    850: '#0E172A',
                    800: '#141E36',
                    750: '#1A2644',
                    700: '#202E52',
                    600: '#31426E',
                    500: '#4A5E96',
                },

                // Cores de Ação e Entidades (Safira, Esmeralda, Carmim, Ouro)
                safira: {
                    50: '#F0F9FF',
                    100: '#E0F2FE',
                    200: '#BAE6FD',
                    300: '#7DD3FC',
                    400: '#38BDF8',
                    500: '#0EA5E9',
                    600: '#0284C7',
                    700: '#0369A1',
                    800: '#075985',
                    900: '#0C4A6E',
                },
                esmeralda: {
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                },
                carmim: {
                    400: '#FB7185',
                    500: '#F43F5E',
                    600: '#E11D48',
                },
                ouro: {
                    400: '#FBBF24',
                    500: '#F59E0B',
                    600: '#D97706',
                },

                // =====================================================================
                // TOKENS SEMÂNTICOS DE GANTT (Injetados dinamicamente via plugin addBase)
                // =====================================================================
                gantt: {
                    canvas: 'var(--gantt-bg-canvas)',
                    surface: 'var(--gantt-bg-surface)',
                    card: 'var(--gantt-bg-card)',
                    'card-hover': 'var(--gantt-bg-card-hover)',
                    header: 'var(--gantt-bg-header)',
                    column: 'var(--gantt-bg-column)',

                    border: 'var(--gantt-border)',
                    'border-subtle': 'var(--gantt-border-subtle)',
                    'border-strong': 'var(--gantt-border-strong)',
                    grid: 'var(--gantt-grid-line)',

                    primary: 'var(--gantt-text-primary)',
                    muted: 'var(--gantt-text-muted)',
                    accent: 'var(--gantt-accent-focus)',
                    text: {
                        primary: 'var(--gantt-text-primary)',
                        secondary: 'var(--gantt-text-secondary)',
                        muted: 'var(--gantt-text-muted)',
                    },

                    'accent-focus': 'var(--gantt-accent-focus)',
                    'accent-hover': 'var(--gantt-accent-hover)',
                    'accent-subtle': 'var(--gantt-accent-subtle)',

                    today: 'var(--gantt-today-line)',
                    critical: 'var(--gantt-critical-alert)',
                    milestone: 'var(--gantt-milestone-marker)',

                    bar: {
                        empty: 'var(--gantt-bar-empty-bg)',
                        'empty-border': 'var(--gantt-bar-empty-border)',
                        primary: 'var(--gantt-bar-primary-bg)',
                        'primary-border': 'var(--gantt-bar-primary-border)',
                        secondary: 'var(--gantt-bar-secondary-bg)',
                        'secondary-border': 'var(--gantt-bar-secondary-border)',
                        active: 'var(--gantt-bar-active-bg)',
                        'active-border': 'var(--gantt-bar-active-border)',
                        tag: 'var(--gantt-bar-tag-bg)',
                    },
                    connector: 'var(--gantt-connector-color)',
                    weekend: 'var(--gantt-weekend-bg)',
                    'weekend-stripe': 'var(--gantt-weekend-stripe)',
                },
            },

            boxShadow: {
                'gantt-card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
                'cyan-glow': '0 0 15px -3px rgba(6, 182, 212, 0.35)',
                'glow-safira': '0 0 10px -2px rgba(2, 132, 199, 0.15)',
                'glow-carmim': '0 0 10px -2px rgba(244, 63, 94, 0.15)',
                'glow-ouro': '0 0 10px -2px rgba(245, 158, 11, 0.15)',
                'glow-esmeralda': '0 0 10px -2px rgba(16, 185, 129, 0.15)',
            },
            borderRadius: {
                'gantt': '0.625rem',
            }
        },
    },

    plugins: [
        plugin(function ({ addBase, theme }) {
            const swiss = theme('colors.swiss');
            const obsidian = theme('colors.obsidian');
            addBase({
                ':root': {
                    '--gantt-bg-canvas': swiss.snow,
                    '--gantt-bg-surface': swiss.surface,
                    '--gantt-bg-card': swiss.surface,
                    '--gantt-bg-card-hover': '#edf1f5',
                    '--gantt-bg-header': swiss.surface,
                    '--gantt-bg-column': swiss.snow,

                    '--gantt-border-subtle': swiss.hairline,
                    '--gantt-border': swiss.hairline,
                    '--gantt-border-strong': swiss.border || swiss.hairline,
                    '--gantt-grid-line': 'rgba(15, 20, 28, 0.05)',
                    '--gantt-grid': 'rgba(15, 20, 28, 0.05)',
                    '--gantt-grid-lines': 'rgba(15, 20, 28, 0.05)',

                    '--gantt-text-primary': swiss.charcoal,
                    '--gantt-text-secondary': swiss.lead,
                    '--gantt-text-muted': swiss.muted,

                    '--gantt-accent-focus': '#0284c7',
                    '--gantt-accent-hover': '#0369a1',
                    '--gantt-accent-subtle': 'rgba(2, 132, 199, 0.08)',

                    '--gantt-today-line': swiss.red,
                    '--gantt-today-indicator': swiss.red,
                    '--gantt-accent-today': swiss.red,
                    '--gantt-critical-alert': swiss.red,
                    '--gantt-milestone-marker': swiss.charcoal,
                    '--gantt-milestone-flag': swiss.charcoal,

                    '--gantt-bar-empty-bg': '#e2e7ec',
                    '--gantt-bar-empty-border': '#cbd2d9',
                    '--gantt-bar-primary-bg': 'transparent',
                    '--gantt-bar-primary-border': '#cbd2d9',
                    '--gantt-bar-secondary-bg': 'transparent',
                    '--gantt-bar-secondary-border': swiss.hairline,
                    '--gantt-bar-active-bg': 'transparent',
                    '--gantt-bar-active-border': swiss.charcoal,
                    '--gantt-bar-tag-bg': 'rgba(15, 20, 28, 0.04)',
                    '--gantt-connector-color': '#475569',
                    '--gantt-connector': '#475569',
                    '--gantt-dependency-line': '#475569',

                    '--gantt-brand-accent': '#0284c7',
                    '--gantt-btn-primary': swiss.charcoal,
                    '--gantt-btn-pitch': swiss.charcoal,
                    '--gantt-phase-1-accent': swiss.charcoal,
                    '--gantt-phase-2-accent': swiss.muted,
                    '--gantt-bar-normal-bg': 'transparent',
                    '--gantt-bar-normal-brd': swiss.hairline,
                    '--gantt-bar-focus-bg': 'transparent',
                    '--gantt-bar-focus-brd': swiss.charcoal,

                    '--gantt-row-even': 'rgba(15, 20, 28, 0.02)',
                    '--gantt-row-odd': 'transparent',

                    '--gantt-weekend-bg': swiss.weekend || 'rgba(15, 20, 28, 0.035)',
                    '--gantt-weekend-stripe': swiss['weekend-stripe'] || 'rgba(15, 20, 28, 0.08)',
                },
                '.dark': {
                    '--gantt-bg-canvas': obsidian.void,
                    '--gantt-bg-surface': obsidian.card,
                    '--gantt-bg-card': obsidian.card,
                    '--gantt-bg-card-hover': obsidian['bar-dark'] || '#161b26',
                    '--gantt-bg-header': obsidian.panel,
                    '--gantt-bg-column': obsidian.column,

                    '--gantt-border-subtle': obsidian.border,
                    '--gantt-border': obsidian.border,
                    '--gantt-border-strong': obsidian['border-dark'] || obsidian.border,
                    '--gantt-grid-line': 'rgba(255, 255, 255, 0.02)',
                    '--gantt-grid': 'rgba(255, 255, 255, 0.02)',
                    '--gantt-grid-lines': 'rgba(255, 255, 255, 0.02)',

                    '--gantt-text-primary': '#f8fafc',
                    '--gantt-text-secondary': '#94a3b8',
                    '--gantt-text-muted': '#64748b',

                    '--gantt-accent-focus': obsidian.cyan,
                    '--gantt-accent-hover': obsidian['cyan-bright'],
                    '--gantt-accent-subtle': 'rgba(6, 182, 212, 0.12)',

                    '--gantt-today-line': obsidian.red,
                    '--gantt-today-indicator': obsidian.red,
                    '--gantt-accent-today': obsidian.red,
                    '--gantt-critical-alert': obsidian.red,
                    '--gantt-milestone-marker': obsidian['cyan-bright'],
                    '--gantt-milestone-flag': obsidian['cyan-bright'],

                    '--gantt-bar-empty-bg': 'rgba(255, 255, 255, 0.03)',
                    '--gantt-bar-empty-border': obsidian.border,
                    '--gantt-bar-primary-bg': 'transparent',
                    '--gantt-bar-primary-border': obsidian.border,
                    '--gantt-bar-secondary-bg': 'transparent',
                    '--gantt-bar-secondary-border': obsidian.border,
                    '--gantt-bar-active-bg': 'transparent',
                    '--gantt-bar-active-border': obsidian.cyan,
                    '--gantt-bar-tag-bg': 'rgba(255, 255, 255, 0.04)',
                    '--gantt-connector-color': 'rgba(6, 182, 212, 0.65)',
                    '--gantt-connector': 'rgba(6, 182, 212, 0.65)',
                    '--gantt-dependency-line': 'rgba(6, 182, 212, 0.65)',

                    '--gantt-brand-accent': obsidian.cyan,
                    '--gantt-btn-primary': obsidian.cyan,
                    '--gantt-btn-pitch': '#1b2029',
                    '--gantt-phase-1-accent': obsidian.cyan,
                    '--gantt-phase-2-accent': '#475569',
                    '--gantt-bar-normal-bg': 'transparent',
                    '--gantt-bar-normal-brd': obsidian.border,
                    '--gantt-bar-active-brd': obsidian['border-dark'] || obsidian.border,
                    '--gantt-bar-focus-bg': 'transparent',
                    '--gantt-bar-focus-brd': obsidian.cyan,

                    '--gantt-row-even': 'rgba(255, 255, 255, 0.008)',
                    '--gantt-row-odd': 'transparent',

                    '--gantt-weekend-bg': obsidian.weekend || 'rgba(255, 255, 255, 0.025)',
                    '--gantt-weekend-stripe': obsidian['weekend-stripe'] || 'rgba(255, 255, 255, 0.08)',
                }
            });
        }),
    ],
};