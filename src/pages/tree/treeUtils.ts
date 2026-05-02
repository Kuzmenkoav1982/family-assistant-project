import type { TreeMember } from '@/hooks/useFamilyTree';

export const RELATION_OPTIONS = [
  'Я',
  'Прадед', 'Прабабушка',
  'Дедушка', 'Бабушка',
  'Отец', 'Мать',
  'Сын', 'Дочь',
  'Брат', 'Сестра',
  'Внук', 'Внучка',
  'Дядя', 'Тётя',
  'Племянник', 'Племянница',
  'Супруг', 'Супруга',
  'Другое'
];

export const AVATAR_OPTIONS = ['👤', '👨', '👩', '👴', '👵', '👦', '👧', '🧒', '👶', '🧓'];

export const MONTHS = [
  { value: '01', label: 'Январь' },
  { value: '02', label: 'Февраль' },
  { value: '03', label: 'Март' },
  { value: '04', label: 'Апрель' },
  { value: '05', label: 'Май' },
  { value: '06', label: 'Июнь' },
  { value: '07', label: 'Июль' },
  { value: '08', label: 'Август' },
  { value: '09', label: 'Сентябрь' },
  { value: '10', label: 'Октябрь' },
  { value: '11', label: 'Ноябрь' },
  { value: '12', label: 'Декабрь' },
];

export const GENERATION_MAP: Record<string, number> = {
  'Прадед': 0, 'Прабабушка': 0,
  'Дедушка': 1, 'Бабушка': 1,
  'Отец': 2, 'Мать': 2, 'Дядя': 2, 'Тётя': 2,
  'Я': 3, 'Брат': 3, 'Сестра': 3, 'Супруг': 3, 'Супруга': 3,
  'Сын': 4, 'Дочь': 4, 'Племянник': 4, 'Племянница': 4,
  'Внук': 5, 'Внучка': 5,
};

export function getGeneration(member: TreeMember, allMembers: TreeMember[]): number {
  if (member.relation && GENERATION_MAP[member.relation] !== undefined) {
    return GENERATION_MAP[member.relation];
  }
  if (member.parent_id || member.parent2_id) {
    const parent = allMembers.find(m => m.id === (member.parent_id || member.parent2_id));
    if (parent) return getGeneration(parent, allMembers) + 1;
  }
  return 3;
}

export interface FamilyUnit {
  primary: TreeMember;
  spouse: TreeMember | null;
  children: TreeMember[];
  spouseLeft?: boolean;
}

export function buildFamilyUnits(genMembers: TreeMember[], allMembers: TreeMember[], genMemberIds: Set<number>): { units: FamilyUnit[], singles: TreeMember[] } {
  const used = new Set<number>();
  const units: FamilyUnit[] = [];
  const singles: TreeMember[] = [];

  const sorted = [...genMembers].sort((a, b) => {
    if (a.relation === 'Я') return -1;
    if (b.relation === 'Я') return 1;
    return (a.birth_year || 9999) - (b.birth_year || 9999);
  });

  for (const member of sorted) {
    if (used.has(member.id)) continue;
    used.add(member.id);

    let spouse: TreeMember | null = null;
    if (member.spouse_id) {
      spouse = genMembers.find(m => m.id === member.spouse_id) || null;
      if (spouse) used.add(spouse.id);
    }
    if (!spouse) {
      const reverseSpouse = genMembers.find(m => m.spouse_id === member.id && !used.has(m.id));
      if (reverseSpouse) {
        spouse = reverseSpouse;
        used.add(reverseSpouse.id);
      }
    }

    const parentIds = new Set<number>();
    parentIds.add(member.id);
    if (spouse) parentIds.add(spouse.id);

    const children = allMembers.filter(m =>
      !genMemberIds.has(m.id) &&
      ((m.parent_id && parentIds.has(m.parent_id)) ||
      (m.parent2_id && parentIds.has(m.parent2_id)))
    );

    if (spouse || children.length > 0) {
      const SIBLING_RELS = new Set(['Брат', 'Сестра']);
      let finalPrimary = member;
      let finalSpouse = spouse;
      if (spouse && !SIBLING_RELS.has(member.relation || '') && !['Я'].includes(member.relation || '') && SIBLING_RELS.has(spouse.relation || '')) {
        finalPrimary = spouse;
        finalSpouse = member;
      }
      const isSpouseLeft = SIBLING_RELS.has(finalPrimary.relation || '') && finalSpouse !== null;
      units.push({ primary: finalPrimary, spouse: finalSpouse, children, spouseLeft: isSpouseLeft });
    } else {
      singles.push(member);
    }
  }

  return { units, singles };
}

export type TreeNode = { type: 'unit'; unit: FamilyUnit } | { type: 'single'; member: TreeMember };

export function getNodeMemberIds(node: TreeNode): number[] {
  if (node.type === 'unit') {
    const ids = [node.unit.primary.id];
    if (node.unit.spouse) ids.push(node.unit.spouse.id);
    return ids;
  }
  return [node.member.id];
}

export function getChildrenOfNode(node: TreeNode, nextGenNodes: TreeNode[]): TreeNode[] {
  const parentIds = new Set(getNodeMemberIds(node));
  return nextGenNodes.filter(child => {
    const m = child.type === 'unit' ? child.unit.primary : child.member;
    return (m.parent_id && parentIds.has(m.parent_id)) || (m.parent2_id && parentIds.has(m.parent2_id));
  });
}

// ─── Единый канвас с pan-скроллом и SVG-линиями связи ──────────────────────

export const CARD_W = 130;
export const CARD_H = 145;
export const COUPLE_GAP = 52; // ширина сердечка-линии между супругами
export const COL_GAP = 20;    // горизонтальный зазор между узлами
export const ROW_GAP = 80;    // вертикальный зазор между поколениями
export const LABEL_H = 28;    // высота подписи поколения

/** Ширина одного узла (карточка или пара) */
export function nodeWidth(node: TreeNode): number {
  if (node.type === 'unit' && node.unit.spouse) return CARD_W * 2 + COUPLE_GAP;
  return CARD_W;
}

export interface NodeLayout {
  node: TreeNode;
  x: number; // левый край
  y: number; // верхний край карточки (после лейбла поколения)
  cx: number; // центр X
}

export interface GenLayout {
  genIndex: number;
  y: number;
  nodes: NodeLayout[];
}

/** Все member-id внутри узла */
export function getAllNodeMemberIds(node: TreeNode): number[] {
  if (node.type === 'unit') {
    const ids = [node.unit.primary.id];
    if (node.unit.spouse) ids.push(node.unit.spouse.id);
    return ids;
  }
  return [node.member.id];
}

/** Находим родительский узел для дочернего — проверяем и primary, и spouse */
export function findParentNodeIndex(childNode: TreeNode, parentGenNodes: TreeNode[]): number {
  const members: TreeMember[] = [];
  if (childNode.type === 'unit') {
    members.push(childNode.unit.primary);
    if (childNode.unit.spouse) members.push(childNode.unit.spouse);
  } else {
    members.push(childNode.member);
  }
  const allPids: number[] = [];
  members.forEach(m => {
    if (m.parent_id) allPids.push(m.parent_id);
    if (m.parent2_id) allPids.push(m.parent2_id);
  });
  if (allPids.length === 0) return -1;
  return parentGenNodes.findIndex(pn => getAllNodeMemberIds(pn).some(id => allPids.includes(id)));
}

export function buildLayout(
  sortedGenerations: [number, TreeMember[]][],
  members: TreeMember[],
): { gens: GenLayout[]; totalW: number; totalH: number } {
  const allGenMemberIds = new Set<number>();
  sortedGenerations.forEach(([, gm]) => gm.forEach(m => allGenMemberIds.add(m.id)));

  // 1. Строим узлы (unit/single) по поколениям
  const genNodesMap = new Map<number, TreeNode[]>();
  sortedGenerations.forEach(([genIndex, genMembers]) => {
    const { units, singles } = buildFamilyUnits(genMembers, members, allGenMemberIds);
    genNodesMap.set(genIndex, [
      ...units.map(u => ({ type: 'unit' as const, unit: u })),
      ...singles.map(m => ({ type: 'single' as const, member: m })),
    ]);
  });

  // 2. Сортируем узлы каждого поколения: дети группируются под родителями
  for (let si = 1; si < sortedGenerations.length; si++) {
    const [genIndex] = sortedGenerations[si];
    const [prevGenIndex] = sortedGenerations[si - 1];
    const nodes = genNodesMap.get(genIndex) || [];
    const prevNodes = genNodesMap.get(prevGenIndex) || [];
    if (nodes.length === 0 || prevNodes.length === 0) continue;

    // Группируем по индексу родительского узла
    const groups = new Map<number, TreeNode[]>(); // parentIdx -> children
    const orphans: TreeNode[] = [];

    nodes.forEach(n => {
      const pIdx = findParentNodeIndex(n, prevNodes);
      if (pIdx >= 0) {
        if (!groups.has(pIdx)) groups.set(pIdx, []);
        groups.get(pIdx)!.push(n);
      } else {
        orphans.push(n);
      }
    });

    // Раскладываем в порядке родителей
    const sorted: TreeNode[] = [];
    prevNodes.forEach((_, pi) => {
      const kids = groups.get(pi);
      if (kids) sorted.push(...kids);
    });
    sorted.push(...orphans);
    genNodesMap.set(genIndex, sorted);
  }

  // 3. Двухпроходный layout: сначала снизу-вверх (ширина), потом сверху-вниз (позиции)
  // 3a. Посчитаем ширину каждого узла «поддерева»
  const subtreeWidth = new Map<string, number>(); // "genIdx:nodeIdx" → width
  const nodeKey = (gi: number, ni: number) => `${gi}:${ni}`;

  // Снизу вверх
  for (let si = sortedGenerations.length - 1; si >= 0; si--) {
    const [genIndex] = sortedGenerations[si];
    const nodes = genNodesMap.get(genIndex) || [];
    const nextGenIndex = si < sortedGenerations.length - 1 ? sortedGenerations[si + 1][0] : null;
    const nextNodes = nextGenIndex !== null ? (genNodesMap.get(nextGenIndex) || []) : [];

    nodes.forEach((node, ni) => {
      const ownW = nodeWidth(node);
      // Найти детей этого узла в следующем поколении
      const childIndices: number[] = [];
      if (nextNodes.length > 0) {
        nextNodes.forEach((cn, ci) => {
          if (findParentNodeIndex(cn, nodes) === ni) childIndices.push(ci);
        });
      }
      if (childIndices.length === 0) {
        subtreeWidth.set(nodeKey(genIndex, ni), ownW);
      } else {
        const childrenTotalW = childIndices.reduce((sum, ci, i) => {
          return sum + (subtreeWidth.get(nodeKey(nextGenIndex!, ci)) || nodeWidth(nextNodes[ci])) + (i > 0 ? COL_GAP : 0);
        }, 0);
        subtreeWidth.set(nodeKey(genIndex, ni), Math.max(ownW, childrenTotalW));
      }
    });
  }

  // 3b. Общая ширина — сумма поддеревьев верхнего поколения
  const topGenIndex = sortedGenerations[0][0];
  const topNodes = genNodesMap.get(topGenIndex) || [];
  const totalW = topNodes.reduce((sum, _, ni) => {
    return sum + (subtreeWidth.get(nodeKey(topGenIndex, ni)) || CARD_W) + (ni > 0 ? COL_GAP : 0);
  }, 0);

  // 3c. Сверху вниз: раскладываем X-позиции рекурсивно
  const nodePositions = new Map<string, { x: number; cx: number }>();

  function layoutGen(genIdx: number, startX: number, nodeIndices: number[]) {
    const nodes = genNodesMap.get(genIdx) || [];
    let x = startX;
    nodeIndices.forEach(ni => {
      const node = nodes[ni];
      const stW = subtreeWidth.get(nodeKey(genIdx, ni)) || nodeWidth(node);
      const ownW = nodeWidth(node);
      const nodeX = x + (stW - ownW) / 2;
      nodePositions.set(nodeKey(genIdx, ni), { x: nodeX, cx: nodeX + ownW / 2 });

      // Найти детей в следующем поколении и layout их
      const nextSI = sortedGenerations.findIndex(([gi]) => gi === genIdx);
      if (nextSI >= 0 && nextSI < sortedGenerations.length - 1) {
        const [nextGenIdx] = sortedGenerations[nextSI + 1];
        const nextNodes = genNodesMap.get(nextGenIdx) || [];
        const childIndices: number[] = [];
        nextNodes.forEach((cn, ci) => {
          if (findParentNodeIndex(cn, nodes) === ni) childIndices.push(ci);
        });
        if (childIndices.length > 0) {
          layoutGen(nextGenIdx, x, childIndices);
        }
      }

      x += stW + COL_GAP;
    });
  }

  layoutGen(topGenIndex, 0, topNodes.map((_, i) => i));

  // Также layout любые узлы без позиции (orphans в нижних поколениях)
  sortedGenerations.forEach(([genIndex]) => {
    const nodes = genNodesMap.get(genIndex) || [];
    let maxX = 0;
    nodes.forEach((_, ni) => {
      const pos = nodePositions.get(nodeKey(genIndex, ni));
      if (pos) maxX = Math.max(maxX, pos.x + nodeWidth(nodes[ni]) + COL_GAP);
    });
    nodes.forEach((node, ni) => {
      if (!nodePositions.has(nodeKey(genIndex, ni))) {
        const w = nodeWidth(node);
        nodePositions.set(nodeKey(genIndex, ni), { x: maxX, cx: maxX + w / 2 });
        maxX += w + COL_GAP;
      }
    });
  });

  // 4. Собираем GenLayout[]
  const gens: GenLayout[] = [];
  let curY = 0;

  sortedGenerations.forEach(([genIndex]) => {
    const nodes = genNodesMap.get(genIndex) || [];
    if (nodes.length === 0) return;

    const layouts: NodeLayout[] = nodes.map((node, ni) => {
      const pos = nodePositions.get(nodeKey(genIndex, ni))!;
      return { node, x: pos.x, y: curY + LABEL_H, cx: pos.cx };
    });

    gens.push({ genIndex, y: curY, nodes: layouts });
    curY += LABEL_H + CARD_H + ROW_GAP;
  });

  // Пересчитаем реальную ширину
  let realMaxW = 0;
  gens.forEach(g => g.nodes.forEach(nl => {
    realMaxW = Math.max(realMaxW, nl.x + nodeWidth(nl.node));
  }));

  return { gens, totalW: Math.max(totalW, realMaxW), totalH: curY };
}

// ── SVG-пути связи ───────────────────────────────────────────────────────────

export interface SvgPath {
  points: [number, number][];
  key: string;
  isSibling?: boolean;
  color?: string;
}

export const BRANCH_COLORS = [
  '#b45309', // amber-700
  '#7c3aed', // violet-600
  '#0891b2', // cyan-600
  '#16a34a', // green-600
  '#dc2626', // red-600
  '#2563eb', // blue-600
  '#d97706', // amber-600
  '#9333ea', // purple-600
  '#059669', // emerald-600
  '#e11d48', // rose-600
];

export type BranchColorMap = Map<string, string>; // parentKey → color

export interface LegendItem {
  color: string;
  parentNames: string;
  childNames: string[];
}

export function buildPaths(gens: GenLayout[]): { paths: SvgPath[]; branchColors: BranchColorMap; memberColors: Map<number, string>; legend: LegendItem[] } {
  const paths: SvgPath[] = [];
  const branchColors: BranchColorMap = new Map();
  const memberColors = new Map<number, string>();
  const legend: LegendItem[] = [];
  let colorIdx = 0;

  for (let gi = 1; gi < gens.length; gi++) {
    const curGen = gens[gi];
    const byParent = new Map<string, { parentNl: NodeLayout; childNls: NodeLayout[] }>();

    curGen.nodes.forEach((childNl) => {
      const membersToCheck: TreeMember[] = [];
      if (childNl.node.type === 'unit') {
        membersToCheck.push(childNl.node.unit.primary);
        if (childNl.node.unit.spouse) membersToCheck.push(childNl.node.unit.spouse);
      } else {
        membersToCheck.push(childNl.node.member);
      }

      membersToCheck.forEach(child => {
        const pids = [child.parent_id, child.parent2_id].filter(Boolean) as number[];
        if (pids.length === 0) return;

        let parentNl: NodeLayout | null = null;
        for (let pi = gi - 1; pi >= 0; pi--) {
          const found = gens[pi].nodes.find(pnl =>
            getAllNodeMemberIds(pnl.node).some(id => pids.includes(id))
          );
          if (found) { parentNl = found; break; }
        }
        if (!parentNl) return;

        const pKey = `${Math.round(parentNl.cx)}-${Math.round(parentNl.y)}`;
        if (!byParent.has(pKey)) byParent.set(pKey, { parentNl, childNls: [] });
        const existing = byParent.get(pKey)!.childNls;
        if (!existing.includes(childNl)) {
          existing.push(childNl);
        }
      });
    });

    const parentEntries = Array.from(byParent.entries());
    const BUS_OFFSET = 12;

    parentEntries.forEach(([pKey, { parentNl, childNls }], idx) => {
      if (!branchColors.has(pKey)) {
        branchColors.set(pKey, BRANCH_COLORS[colorIdx % BRANCH_COLORS.length]);
        colorIdx++;
      }
      const color = branchColors.get(pKey)!;

      getAllNodeMemberIds(parentNl.node).forEach(id => {
        if (!memberColors.has(id)) memberColors.set(id, color);
      });
      childNls.forEach(cl => {
        getAllNodeMemberIds(cl.node).forEach(id => {
          if (!memberColors.has(id)) memberColors.set(id, color);
        });
      });

      const getNodeName = (node: TreeNode): string => {
        if (node.type === 'unit') {
          const names = [node.unit.primary.name.split(' ')[0]];
          if (node.unit.spouse) names.push(node.unit.spouse.name.split(' ')[0]);
          return names.join(' и ');
        }
        return node.member.name.split(' ')[0];
      };
      const childNamesList = childNls.map(cl => {
        const allMembers: string[] = [];
        if (cl.node.type === 'unit') {
          allMembers.push(cl.node.unit.primary.name.split(' ')[0]);
          if (cl.node.unit.spouse) allMembers.push(cl.node.unit.spouse.name.split(' ')[0]);
        } else {
          allMembers.push(cl.node.member.name.split(' ')[0]);
        }
        return allMembers.join(', ');
      });
      legend.push({ color, parentNames: getNodeName(parentNl.node), childNames: childNamesList });

      const fromX = parentNl.cx;
      const fromY = parentNl.y + CARD_H;
      const toY   = childNls[0].y;
      const baseBusY = fromY + (toY - fromY) * 0.45;
      const busY = baseBusY + idx * BUS_OFFSET - ((parentEntries.length - 1) * BUS_OFFSET) / 2;

      paths.push({
        key: `stem-${pKey}`,
        points: [[fromX, fromY], [fromX, busY]],
        color,
      });

      const xs   = childNls.map(cl => cl.cx);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);

      if (childNls.length > 1) {
        paths.push({
          key: `bus-${pKey}`,
          points: [[minX, busY], [maxX, busY]],
          isSibling: true,
          color,
        });
      }

      childNls.forEach((cl, i) => {
        paths.push({
          key: `drop-${pKey}-${i}`,
          points: [[cl.cx, busY], [cl.cx, cl.y]],
          color,
        });
      });
    });
  }

  return { paths, branchColors, memberColors, legend };
}

export function pointsToD(pts: [number, number][], pad: number): string {
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x + pad} ${y + pad}`).join(' ');
}

export function calculateAge(member: TreeMember): number | null {
  const endDate = member.death_date ? new Date(member.death_date) :
                  member.death_year ? new Date(member.death_year, 11, 31) : new Date();

  if (member.birth_date) {
    const birth = new Date(member.birth_date);
    let age = endDate.getFullYear() - birth.getFullYear();
    const monthDiff = endDate.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
  if (member.birth_year) {
    return (member.death_year || new Date().getFullYear()) - member.birth_year;
  }
  return null;
}

export function getAgeText(age: number): string {
  if (age % 10 === 1 && age !== 11) return `${age} год`;
  if (age % 10 >= 2 && age % 10 <= 4 && (age < 10 || age > 20)) return `${age} года`;
  return `${age} лет`;
}

export function isImageUrl(avatar: string): boolean {
  return avatar?.startsWith('http') || avatar?.startsWith('/');
}
