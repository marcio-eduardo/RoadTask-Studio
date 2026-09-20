import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type GuidedAnimationType =
  | 'critical-path'
  | 'chain'
  | 'tap-build'
  | 'whatif'
  | 'milestone'
  | 'view-switch'
  | 'golive'
  | 'pitch';

export interface GuidedTopic {
  id: string;
  category: 'Engenharia de Gantt' | 'Navegação' | 'Tap-and-Build' | 'Gestão Executiva';
  title: string;
  concept: string;
  howToUse: string;
  animationType: GuidedAnimationType;
}

export const GUIDED_TOPICS: Record<string, GuidedTopic> = {
  // KPIs
  golive_kpi: {
    id: 'golive_kpi',
    category: 'Engenharia de Gantt',
    title: 'Data Prevista de Go-Live',
    concept: 'Calculada com base na data de término da última tarefa do projeto, considerando apenas dias úteis e feriados nacionais.',
    howToUse: 'Altera automaticamente sempre que qualquer tarefa do Caminho Crítico for redimensionada ou movida.',
    animationType: 'golive',
  },
  duration_kpi: {
    id: 'duration_kpi',
    category: 'Engenharia de Gantt',
    title: 'Duração Total do Projeto',
    concept: 'Total acumulado em dias úteis do primeiro ao último dia de trabalho, sem contar sábados, domingos ou folgas.',
    howToUse: 'Dá ao C-Level a métrica real de esforço cronológico sem distorções de fins de semana.',
    animationType: 'tap-build',
  },
  cpm_kpi: {
    id: 'cpm_kpi',
    category: 'Engenharia de Gantt',
    title: 'Caminho Crítico (CPM) & Folga Zero',
    concept: 'A sequência inadiável de tarefas. Se qualquer uma atrasar 1 dia, a entrega final (Go-Live) atrasará 1 dia.',
    howToUse: 'Tarefas marcadas em vermelho/carmim exigem atenção prioritária da liderança para mitigar gargalos.',
    animationType: 'critical-path',
  },
  milestones_kpi: {
    id: 'milestones_kpi',
    category: 'Engenharia de Gantt',
    title: 'Marcos de Entrega (Milestones)',
    concept: 'Eventos de duração zero (dia exato) que representam aprovações, cortes operacionais ou viradas de fase.',
    howToUse: 'Representados por diamantes dourados na linha do tempo para reuniões de acompanhamento executivo.',
    animationType: 'milestone',
  },

  // Views Dropdown
  view_dropdown: {
    id: 'view_dropdown',
    category: 'Navegação',
    title: 'Menu de Visualizações do Projeto',
    concept: 'Permite alternar entre o Gráfico de Gantt SVG, os Cards ágeis mobile, a Tabela WBS hierárquica ou a Tela Dividida.',
    howToUse: 'Clique para abrir o menu e escolher a melhor perspectiva para seu tipo de reunião ou dispositivo.',
    animationType: 'view-switch',
  },

  // Tap-and-Build Toolbar
  tap_build_types: {
    id: 'tap_build_types',
    category: 'Tap-and-Build',
    title: 'Seleção Rápida de Entidade',
    concept: 'Hierarquia WBS: Fases agrupam Sprints, Sprints contêm Stories/Tarefas, e Marcos definem pontos de entrega.',
    howToUse: 'Toque no tipo desejado para criar instantaneamente uma nova linha com estilo e ícone adequados.',
    animationType: 'tap-build',
  },
  tap_build_chain: {
    id: 'tap_build_chain',
    category: 'Engenharia de Gantt',
    title: 'Encadear com Anterior (FS)',
    concept: 'Cria uma dependência Finish-to-Start (FS): a nova tarefa iniciará exatamente no próximo dia útil após o fim da anterior.',
    howToUse: 'Deixe ativo para montar cronogramas em cascata rapidamente sem precisar ligar setas manualmente.',
    animationType: 'chain',
  },
  tap_build_duration: {
    id: 'tap_build_duration',
    category: 'Tap-and-Build',
    title: 'Chips de Duração Expressa',
    concept: 'Predefinições de prazos corporativos comuns: 1 dia, 3 dias, 1 semana (5d), 2 semanas (10d) e 1 mês (20d).',
    howToUse: 'Basta um toque no chip para configurar a duração exata da tarefa em segundos.',
    animationType: 'tap-build',
  },

  // Actions
  whatif_simulation: {
    id: 'whatif_simulation',
    category: 'Gestão Executiva',
    title: 'Simulador "What-If" ao Vivo',
    concept: 'Congela a Linha de Base (Baseline) e permite testar cenários hipotéticos de atraso ou adiantamento.',
    howToUse: 'Clique em "What-If", arraste as tarefas e veja o impacto projetado antes de aprovar ou descartar as mudanças.',
    animationType: 'whatif',
  },
  pitch_mode: {
    id: 'pitch_mode',
    category: 'Gestão Executiva',
    title: 'Modo Pitch C-Level',
    concept: 'Interface limpa em tela cheia projetada especialmente para apresentações executivas e reuniões de diretoria.',
    howToUse: 'Oculta controles de edição e amplia os marcos, KPIs e a linha do tempo para máxima legibilidade.',
    animationType: 'pitch',
  },
};

interface GuidedAccessContextType {
  isGuidedMode: boolean;
  toggleGuidedMode: () => void;
  setGuidedMode: (enabled: boolean) => void;
  activeTopic: GuidedTopic | null;
  activeTopicTargetRect: DOMRect | null;
  showTopic: (topicId: string, targetEl: HTMLElement) => void;
  hideTopic: () => void;
}

const GuidedAccessContext = createContext<GuidedAccessContextType | undefined>(undefined);

const GUIDED_STORAGE_KEY = 'vanguard_gantt_guided_mode_v1';

export const GuidedAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGuidedMode, setIsGuidedModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUIDED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [activeTopic, setActiveTopic] = useState<GuidedTopic | null>(null);
  const [activeTopicTargetRect, setActiveTopicTargetRect] = useState<DOMRect | null>(null);

  const setGuidedMode = useCallback((enabled: boolean) => {
    setIsGuidedModeState(enabled);
    try {
      localStorage.setItem(GUIDED_STORAGE_KEY, String(enabled));
    } catch {
      // Ignorar erros de storage
    }
    if (!enabled) {
      setActiveTopic(null);
      setActiveTopicTargetRect(null);
    }
  }, []);

  const toggleGuidedMode = useCallback(() => {
    setGuidedMode(!isGuidedMode);
  }, [isGuidedMode, setGuidedMode]);

  const showTopic = useCallback(
    (topicId: string, targetEl: HTMLElement) => {
      if (!isGuidedMode) return;
      const topic = GUIDED_TOPICS[topicId];
      if (topic) {
        setActiveTopic(topic);
        setActiveTopicTargetRect(targetEl.getBoundingClientRect());
      }
    },
    [isGuidedMode]
  );

  const hideTopic = useCallback(() => {
    setActiveTopic(null);
    setActiveTopicTargetRect(null);
  }, []);

  // Fechar tooltip ao fazer scroll na página para manter consistência
  useEffect(() => {
    const handleScroll = () => {
      if (activeTopic) {
        hideTopic();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTopic, hideTopic]);

  return (
    <GuidedAccessContext.Provider
      value={{
        isGuidedMode,
        toggleGuidedMode,
        setGuidedMode,
        activeTopic,
        activeTopicTargetRect,
        showTopic,
        hideTopic,
      }}
    >
      {children}
    </GuidedAccessContext.Provider>
  );
};

export const useGuidedAccess = (): GuidedAccessContextType => {
  const ctx = useContext(GuidedAccessContext);
  if (!ctx) {
    throw new Error('useGuidedAccess deve ser utilizado dentro de um GuidedAccessProvider');
  }
  return ctx;
};
