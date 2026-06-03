import { useLocation } from 'react-router-dom';
import { getPageContext, PageContext } from '../registry/pageRegistry';
import { getIncompleteScenarios, SCENARIO_REGISTRY } from '../registry/scenarioRegistry';
import { MODULE_MAP } from '../registry/platformMap';

export interface DomovoyPageState {
  pathname: string;
  pageContext: PageContext | null;
  currentModuleId: string | null;
  incompleteFlows: Array<{
    scenarioId: string;
    stepIndex: number;
    title: string;
    emoji: string;
  }>;
}

export function useDomovoyPage(): DomovoyPageState {
  const location = useLocation();
  const pathname = location.pathname;

  const pageContext = getPageContext(pathname);

  // Определяем текущий модуль по pathname
  const currentModuleId = pageContext
    ? (Object.keys(MODULE_MAP).find(key => MODULE_MAP[key].href === pathname) ?? null)
    : null;

  // Незавершённые сценарии
  const rawIncomplete = getIncompleteScenarios();
  const incompleteFlows = rawIncomplete
    .map(({ scenarioId, stepIndex }) => {
      const scenario = SCENARIO_REGISTRY[scenarioId];
      if (!scenario) return null;
      return { scenarioId, stepIndex, title: scenario.title, emoji: scenario.emoji };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return { pathname, pageContext, currentModuleId, incompleteFlows };
}
