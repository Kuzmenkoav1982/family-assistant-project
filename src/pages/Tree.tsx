import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useFamilyTree, type TreeMember, type NewTreeMember } from '@/hooks/useFamilyTree';
import { useClanTree } from '@/hooks/useClanTree';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

const RELATION_OPTIONS = [
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

const AVATAR_OPTIONS = ['👤', '👨', '👩', '👴', '👵', '👦', '👧', '🧒', '👶', '🧓'];

const MONTHS = [
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

const GENERATION_MAP: Record<string, number> = {
  'Прадед': 0, 'Прабабушка': 0,
  'Дедушка': 1, 'Бабушка': 1,
  'Отец': 2, 'Мать': 2, 'Дядя': 2, 'Тётя': 2,
  'Я': 3, 'Брат': 3, 'Сестра': 3, 'Супруг': 3, 'Супруга': 3,
  'Сын': 4, 'Дочь': 4, 'Племянник': 4, 'Племянница': 4,
  'Внук': 5, 'Внучка': 5,
};

function getGeneration(member: TreeMember, allMembers: TreeMember[]): number {
  if (member.relation && GENERATION_MAP[member.relation] !== undefined) {
    return GENERATION_MAP[member.relation];
  }
  if (member.parent_id || member.parent2_id) {
    const parent = allMembers.find(m => m.id === (member.parent_id || member.parent2_id));
    if (parent) return getGeneration(parent, allMembers) + 1;
  }
  return 3;
}

interface FamilyUnit {
  primary: TreeMember;
  spouse: TreeMember | null;
  children: TreeMember[];
  spouseLeft?: boolean;
}

function buildFamilyUnits(genMembers: TreeMember[], allMembers: TreeMember[], genMemberIds: Set<number>): { units: FamilyUnit[], singles: TreeMember[] } {
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

function MemberCard({ member, onClick, isHighlighted }: { member: TreeMember; onClick: () => void; isHighlighted?: boolean }) {
  const isImageUrl = (avatar: string) => avatar?.startsWith('http') || avatar?.startsWith('/');
  const calculateAge = (m: TreeMember) => {
    const endDate = m.death_date ? new Date(m.death_date) :
                    m.death_year ? new Date(m.death_year, 11, 31) : new Date();

    if (m.birth_date) {
      const birth = new Date(m.birth_date);
      let age = endDate.getFullYear() - birth.getFullYear();
      const monthDiff = endDate.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    }
    if (m.birth_year) {
      return (m.death_year || new Date().getFullYear()) - m.birth_year;
    }
    return null;
  };
  const getAgeText = (age: number) => {
    if (age % 10 === 1 && age !== 11) return `${age} год`;
    if (age % 10 >= 2 && age % 10 <= 4 && (age < 10 || age > 20)) return `${age} года`;
    return `${age} лет`;
  };
  const age = calculateAge(member);
  const isMe = member.relation === 'Я';

  return (
    <Card
      className={`w-[130px] cursor-pointer hover:shadow-lg transition-all hover:scale-105 relative overflow-hidden ${
        isMe
          ? 'border-amber-500 bg-gradient-to-br from-amber-100 to-yellow-100 ring-2 ring-amber-400/50'
          : isHighlighted
            ? 'border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50'
            : 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50'
      }`}
      onClick={onClick}
    >
      {member.death_year && (
        <div className="absolute top-1 right-1 z-10">
          <Badge className="bg-gray-600 text-white text-[10px] px-1 py-0">&#10013;</Badge>
        </div>
      )}
      {isMe && (
        <div className="absolute top-1 left-1 z-10">
          <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">Я</Badge>
        </div>
      )}
      <CardContent className="p-3 text-center">
        {member.photo_url && isImageUrl(member.photo_url) ? (
          <img
            src={member.photo_url}
            alt={member.name}
            className={`w-14 h-14 rounded-full object-cover border-2 mx-auto mb-2 ${isMe ? 'border-amber-500' : 'border-amber-300'}`}
          />
        ) : (
          <div className="text-3xl mb-2">{member.avatar || '👤'}</div>
        )}
        <p className="font-semibold text-sm text-amber-900 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
          {member.name.split(' ')[0]}
        </p>
        {member.relation && member.relation !== 'Я' && (
          <p className="text-[10px] text-amber-600 mt-0.5">{member.relation}</p>
        )}
        {(member.birth_date || member.birth_year) && (
          <p className="text-[10px] text-amber-500 mt-0.5">
            {(() => {
              const birthStr = member.birth_date
                ? new Date(member.birth_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
                : `${member.birth_year} г.р.`;
              if (member.death_date) {
                const deathStr = new Date(member.death_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
                return `${birthStr} — ${deathStr}`;
              }
              if (member.death_year) {
                return `${member.birth_year} — ${member.death_year}`;
              }
              return birthStr;
            })()}
          </p>
        )}
        {age !== null && (
          <Badge variant="outline" className="mt-1 text-[10px] border-amber-300 text-amber-700 px-1.5 py-0">
            {getAgeText(age)}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function CoupleBlock({ unit, onSelect }: { unit: FamilyUnit; onSelect: (m: TreeMember) => void }) {
  const left = unit.spouseLeft && unit.spouse ? unit.spouse : unit.primary;
  const right = unit.spouseLeft && unit.spouse ? unit.primary : unit.spouse;
  return (
    <div className="flex items-center gap-0">
      <MemberCard member={left} onClick={() => onSelect(left)} />
      {right && (
        <>
          <div className="flex items-center mx-[-4px] z-10">
            <div className="w-6 h-0.5 bg-pink-400" />
            <span className="text-pink-500 text-xs">&#10084;</span>
            <div className="w-6 h-0.5 bg-pink-400" />
          </div>
          <MemberCard member={right} onClick={() => onSelect(right)} isHighlighted />
        </>
      )}
    </div>
  );
}

type TreeNode = { type: 'unit'; unit: FamilyUnit } | { type: 'single'; member: TreeMember };

function getNodeMemberIds(node: TreeNode): number[] {
  if (node.type === 'unit') {
    const ids = [node.unit.primary.id];
    if (node.unit.spouse) ids.push(node.unit.spouse.id);
    return ids;
  }
  return [node.member.id];
}

function getChildrenOfNode(node: TreeNode, nextGenNodes: TreeNode[]): TreeNode[] {
  const parentIds = new Set(getNodeMemberIds(node));
  return nextGenNodes.filter(child => {
    const m = child.type === 'unit' ? child.unit.primary : child.member;
    return (m.parent_id && parentIds.has(m.parent_id)) || (m.parent2_id && parentIds.has(m.parent2_id));
  });
}



// ─── Единый канвас с pan-скроллом и SVG-линиями связи ──────────────────────

const CARD_W = 130;
const CARD_H = 145;
const COUPLE_GAP = 52; // ширина сердечка-линии между супругами
const COL_GAP = 20;    // горизонтальный зазор между узлами
const ROW_GAP = 80;    // вертикальный зазор между поколениями
const LABEL_H = 28;    // высота подписи поколения

/** Ширина одного узла (карточка или пара) */
function nodeWidth(node: TreeNode): number {
  if (node.type === 'unit' && node.unit.spouse) return CARD_W * 2 + COUPLE_GAP;
  return CARD_W;
}

interface NodeLayout {
  node: TreeNode;
  x: number; // левый край
  y: number; // верхний край карточки (после лейбла поколения)
  cx: number; // центр X
}

interface GenLayout {
  genIndex: number;
  y: number;
  nodes: NodeLayout[];
}

/** Все member-id внутри узла */
function getAllNodeMemberIds(node: TreeNode): number[] {
  if (node.type === 'unit') {
    const ids = [node.unit.primary.id];
    if (node.unit.spouse) ids.push(node.unit.spouse.id);
    return ids;
  }
  return [node.member.id];
}

/** Находим родительский узел для дочернего — проверяем и primary, и spouse */
function findParentNodeIndex(childNode: TreeNode, parentGenNodes: TreeNode[]): number {
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

function buildLayout(
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

interface SvgPath {
  points: [number, number][];
  key: string;
  isSibling?: boolean;
}

/**
 * Строит SVG-пути между поколениями:
 * 1. Находит все дочерние узлы для каждого родительского узла
 * 2. Рисует ствол от центра родителя вниз
 * 3. Рисует горизонтальную шину, объединяющую братьев/сестёр
 * 4. Рисует отростки от шины вниз к каждому ребёнку
 */
function buildPaths(gens: GenLayout[]): SvgPath[] {
  const paths: SvgPath[] = [];

  // Для каждого поколения (кроме первого) группируем дочерние узлы по их родительскому layout-узлу
  for (let gi = 1; gi < gens.length; gi++) {
    const curGen = gens[gi];

    // parentLayoutKey → { parentNl, childNls }
    const byParent = new Map<string, { parentNl: NodeLayout; childNls: NodeLayout[] }>();

    curGen.nodes.forEach((childNl) => {
      // Собираем всех членов узла — для unit это и primary, и spouse
      const membersToCheck: TreeMember[] = [];
      if (childNl.node.type === 'unit') {
        membersToCheck.push(childNl.node.unit.primary);
        if (childNl.node.unit.spouse) membersToCheck.push(childNl.node.unit.spouse);
      } else {
        membersToCheck.push(childNl.node.member);
      }

      // Для каждого члена узла ищем его родительский layout
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
        // Не дублируем один и тот же дочерний узел
        const existing = byParent.get(pKey)!.childNls;
        if (!existing.includes(childNl)) {
          existing.push(childNl);
        }
      });
    });

    byParent.forEach(({ parentNl, childNls }, pKey) => {
      const fromX = parentNl.cx;
      const fromY = parentNl.y + CARD_H;
      const toY   = childNls[0].y;
      const busY  = fromY + (toY - fromY) * 0.45;

      // Ствол: вертикаль вниз от родителя до шины
      paths.push({
        key: `stem-${pKey}`,
        points: [[fromX, fromY], [fromX, busY]],
      });

      const xs   = childNls.map(cl => cl.cx);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);

      if (childNls.length > 1) {
        // Горизонтальная шина — братья/сёстры
        paths.push({
          key: `bus-${pKey}`,
          points: [[minX, busY], [maxX, busY]],
          isSibling: true,
        });
      }

      // Отростки: от шины вниз к каждому ребёнку
      childNls.forEach((cl, i) => {
        paths.push({
          key: `drop-${pKey}-${i}`,
          points: [[cl.cx, busY], [cl.cx, cl.y]],
        });
      });
    });
  }

  return paths;
}

function pointsToD(pts: [number, number][], pad: number): string {
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x + pad} ${y + pad}`).join(' ');
}

// ── Canvas компонент ─────────────────────────────────────────────────────────

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.12;

function FamilyTreeCanvas({
  members,
  sortedGenerations,
  genLabels,
  onSelectMember,
}: {
  members: TreeMember[];
  sortedGenerations: [number, TreeMember[]][];
  genLabels: Record<number, string>;
  onSelectMember: (m: TreeMember) => void;
}) {
  const { gens, totalW, totalH } = useMemo(
    () => buildLayout(sortedGenerations, members),
    [sortedGenerations, members],
  );
  const paths = useMemo(() => buildPaths(gens), [gens]);

  const PADDING = 32;
  const canvasW = totalW + PADDING * 2;
  const canvasH = totalH + PADDING * 2;

  const containerRef  = useRef<HTMLDivElement>(null);
  const isPanning     = useRef(false);
  const startPos      = useRef({ x: 0, y: 0 });
  const scrollPos     = useRef({ left: 0, top: 0 });
  const [zoom, setZoom] = useState(1);
  // pinch state
  const lastPinchDist = useRef<number | null>(null);

  // ── mouse pan ────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isPanning.current = true;
    startPos.current  = { x: e.clientX, y: e.clientY };
    scrollPos.current = {
      left: containerRef.current?.scrollLeft || 0,
      top:  containerRef.current?.scrollTop  || 0,
    };
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current || !containerRef.current) return;
    containerRef.current.scrollLeft = scrollPos.current.left - (e.clientX - startPos.current.x);
    containerRef.current.scrollTop  = scrollPos.current.top  - (e.clientY - startPos.current.y);
  }, []);

  const onMouseUp = useCallback(() => {
    isPanning.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  }, []);

  // ── wheel zoom ───────────────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP))));
  }, []);

  // ── pinch zoom (touch) ───────────────────────────────────────────────────
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastPinchDist.current !== null) {
        const delta = dist - lastPinchDist.current;
        setZoom(z => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta * 0.005)));
      }
      lastPinchDist.current = dist;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    lastPinchDist.current = null;
  }, []);

  // ── центрируем на «Я» при первом рендере ────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || gens.length === 0) return;
    const me = members.find(m => m.relation === 'Я');
    if (!me) return;
    let meLayout: NodeLayout | null = null;
    for (const gen of gens) {
      const found = gen.nodes.find(nl =>
        nl.node.type === 'unit'
          ? nl.node.unit.primary.id === me.id || nl.node.unit.spouse?.id === me.id
          : nl.node.member.id === me.id
      );
      if (found) { meLayout = found; break; }
    }
    if (!meLayout) return;
    const c = containerRef.current;
    c.scrollLeft = Math.max(0, (meLayout.cx + PADDING) * zoom - c.clientWidth  / 2);
    c.scrollTop  = Math.max(0, (meLayout.y  + PADDING) * zoom - c.clientHeight / 2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.length]);

  return (
    <div className="space-y-2">
      {/* Кнопки масштаба */}
      <div className="flex items-center gap-2 justify-end pr-1">
        <button
          className="w-7 h-7 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-bold transition-colors"
          onClick={() => setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
          title="Уменьшить"
        >−</button>
        <span className="text-xs text-amber-600 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button
          className="w-7 h-7 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-bold transition-colors"
          onClick={() => setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
          title="Увеличить"
        >+</button>
        <button
          className="text-xs text-amber-500 hover:text-amber-700 border border-amber-200 rounded px-2 py-0.5 hover:bg-amber-50 transition-colors"
          onClick={() => setZoom(1)}
          title="Сбросить"
        >100%</button>
      </div>

      {/* Канвас */}
      <div
        ref={containerRef}
        className="overflow-auto rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 select-none"
        style={{ maxHeight: '72vh', cursor: 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Масштабируемый внутренний слой */}
        <div
          style={{
            transformOrigin: '0 0',
            transform: `scale(${zoom})`,
            width: canvasW,
            height: canvasH,
            position: 'relative',
          }}
        >
          {/* SVG линии связи */}
          <svg
            style={{ position: 'absolute', top: 0, left: 0, width: canvasW, height: canvasH, pointerEvents: 'none', overflow: 'visible' }}
          >
            <defs>
              <marker id="dot" markerWidth="4" markerHeight="4" refX="2" refY="2">
                <circle cx="2" cy="2" r="1.5" fill="#d97706" fillOpacity="0.6" />
              </marker>
            </defs>
            {paths.map(p => (
              <path
                key={p.key}
                d={pointsToD(p.points, PADDING)}
                stroke={p.isSibling ? '#f59e0b' : '#d97706'}
                strokeWidth={p.isSibling ? 2.5 : 1.8}
                strokeOpacity={p.isSibling ? 0.75 : 0.6}
                fill="none"
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Поколения + карточки */}
          {gens.map(({ genIndex, y, nodes }) => (
            <div key={genIndex}>
              {/* Лейбл поколения */}
              <div
                style={{
                  position: 'absolute',
                  top: y + PADDING,
                  left: PADDING,
                  width: totalW,
                  height: LABEL_H,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, height: 1, background: '#fcd34d' }} />
                <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest whitespace-nowrap px-2">
                  {genLabels[genIndex] || `Поколение ${genIndex + 1}`}
                </span>
                <div style={{ flex: 1, height: 1, background: '#fcd34d' }} />
              </div>

              {/* Карточки */}
              {nodes.map((nl, ni) => (
                <div
                  key={ni}
                  style={{
                    position: 'absolute',
                    top:  nl.y + PADDING,
                    left: nl.x + PADDING,
                  }}
                >
                  {nl.node.type === 'unit' ? (
                    <CoupleBlock unit={nl.node.unit} onSelect={onSelectMember} />
                  ) : (
                    <MemberCard member={nl.node.member} onClick={() => onSelectMember(nl.node.member)} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export default function Tree() {
  const { toast } = useToast();
  const { members, loading, error, addMember, updateMember, deleteMember, addPhoto, deletePhoto, fetchTree } = useFamilyTree();
  const clanHook = useClanTree();
  const { upload: uploadFile, uploading: uploadingPhoto } = useFileUpload();
  const [selectedMember, setSelectedMember] = useState<TreeMember | null>(null);
  const [addFromMemberId, setAddFromMemberId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showClanPanel, setShowClanPanel] = useState(false);
  const [clanName, setClanName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingGalleryPhoto, setUploadingGalleryPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewTreeMember>({
    name: '',
    relation: '',
    avatar: '👤'
  });
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [deathDay, setDeathDay] = useState('');
  const [deathMonth, setDeathMonth] = useState('');

  useEffect(() => {
    if (selectedMember) {
      const updated = members.find(m => m.id === selectedMember.id);
      if (updated && updated !== selectedMember) {
        setSelectedMember(updated);
      }
    }
  }, [members, selectedMember]);

  const generations = new Map<number, TreeMember[]>();
  members.forEach(member => {
    const gen = getGeneration(member, members);
    if (!generations.has(gen)) generations.set(gen, []);
    generations.get(gen)!.push(member);
  });
  const sortedGenerations = Array.from(generations.entries()).sort(([a], [b]) => a - b);

  const genLabels: Record<number, string> = {
    0: 'Прадеды',
    1: 'Дедушки и бабушки',
    2: 'Родители',
    3: 'Наше поколение',
    4: 'Дети',
    5: 'Внуки',
  };

  const calculateAge = (member: TreeMember) => {
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
  };

  const getAgeText = (age: number) => {
    if (age % 10 === 1 && age !== 11) return `${age} год`;
    if (age % 10 >= 2 && age % 10 <= 4 && (age < 10 || age > 20)) return `${age} года`;
    return `${age} лет`;
  };

  const isImageUrl = (avatar: string) => avatar?.startsWith('http') || avatar?.startsWith('/');

  const resetForm = () => {
    setFormData({ name: '', relation: '', avatar: '👤' });
    setPhotoPreview(null);
    setAddFromMemberId(null);
    setBirthDay('');
    setBirthMonth('');
    setDeathDay('');
    setDeathMonth('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const localPreview = URL.createObjectURL(file);
      setPhotoPreview(localPreview);
      const url = await uploadFile(file, 'family-tree');
      setFormData(prev => ({ ...prev, photo_url: url }));
      toast({ title: 'Фото загружено' });
    } catch (err) {
      setPhotoPreview(null);
      toast({ title: err instanceof Error ? err.message : 'Ошибка загрузки', variant: 'destructive' });
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Укажите имя', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const dataToSend = { ...formData };
    if (birthDay && birthMonth && dataToSend.birth_year) {
      dataToSend.birth_date = `${dataToSend.birth_year}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    }
    if (deathDay && deathMonth && dataToSend.death_year) {
      dataToSend.death_date = `${dataToSend.death_year}-${deathMonth.padStart(2, '0')}-${deathDay.padStart(2, '0')}`;
    }
    const result = await addMember(dataToSend);
    setSaving(false);
    if (result) {
      toast({ title: `${formData.name} добавлен(а) в древо` });
      setShowAddForm(false);
      resetForm();
    } else {
      toast({ title: 'Ошибка добавления', variant: 'destructive' });
    }
  };

  const handleEdit = async () => {
    if (!selectedMember || !formData.name.trim()) return;
    setSaving(true);
    const dataToSend = { ...formData };
    if (birthDay && birthMonth && dataToSend.birth_year) {
      dataToSend.birth_date = `${dataToSend.birth_year}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    } else {
      dataToSend.birth_date = undefined;
    }
    if (deathDay && deathMonth && dataToSend.death_year) {
      dataToSend.death_date = `${dataToSend.death_year}-${deathMonth.padStart(2, '0')}-${deathDay.padStart(2, '0')}`;
    } else {
      dataToSend.death_date = undefined;
    }
    const success = await updateMember(selectedMember.id, dataToSend);
    setSaving(false);
    if (success) {
      toast({ title: 'Данные обновлены' });
      setShowEditForm(false);
      setSelectedMember(null);
    } else {
      toast({ title: 'Ошибка обновления', variant: 'destructive' });
    }
  };

  const handleDelete = async (member: TreeMember) => {
    if (!confirm(`Удалить ${member.name} из древа?`)) return;
    const success = await deleteMember(member.id);
    if (success) {
      toast({ title: `${member.name} удалён(а) из древа` });
      setSelectedMember(null);
    }
  };

  const openEditForm = (member: TreeMember) => {
    setFormData({
      name: member.name,
      relation: member.relation || '',
      birth_year: member.birth_year || undefined,
      death_year: member.death_year || undefined,
      birth_date: member.birth_date || undefined,
      death_date: member.death_date || undefined,
      occupation: member.occupation || undefined,
      bio: member.bio || undefined,
      avatar: member.avatar || '👤',
      photo_url: member.photo_url || undefined,
      parent_id: member.parent_id || undefined,
      parent2_id: member.parent2_id || undefined,
      spouse_id: member.spouse_id || undefined,
      gender: member.gender || undefined,
    });
    if (member.birth_date) {
      const parts = member.birth_date.split('-');
      setBirthMonth(parts[1] || '');
      setBirthDay(parts[2] ? String(parseInt(parts[2])) : '');
    } else {
      setBirthDay('');
      setBirthMonth('');
    }
    if (member.death_date) {
      const parts = member.death_date.split('-');
      setDeathMonth(parts[1] || '');
      setDeathDay(parts[2] ? String(parseInt(parts[2])) : '');
    } else {
      setDeathDay('');
      setDeathMonth('');
    }
    setPhotoPreview(member.photo_url || null);
    setShowEditForm(true);
  };

  const handleGalleryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, memberId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGalleryPhoto(true);
    try {
      const url = await uploadFile(file, 'family-tree');
      await addPhoto(memberId, url);
      toast({ title: 'Фото добавлено в галерею' });
    } catch {
      toast({ title: 'Ошибка загрузки фото', variant: 'destructive' });
    } finally {
      setUploadingGalleryPhoto(false);
    }
  };

  const handleDeletePhoto = async (memberId: number, photoId: number) => {
    const success = await deletePhoto(memberId, photoId);
    if (success) {
      toast({ title: 'Фото удалено' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="TreePine" size={48} className="text-amber-400 mx-auto mb-3 animate-pulse" />
          <p className="text-amber-700">Загрузка древа...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 pb-24">
      <div className="p-4">
        <SectionHero
          title="Семейное древо"
          subtitle={`${members.length} чел. · История вашего рода`}
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/31fb406a-b2d5-4056-9fea-d86fc4d06f58.jpg"
          backPath="/family"
        />
      </div>

      <div className="px-4 space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm text-amber-700 font-medium">{members.length > 0 ? `В древе ${members.length} чел.` : 'Начните строить историю рода'}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-700"
              onClick={() => setShowClanPanel(!showClanPanel)}
            >
              <Icon name="Users" className="mr-1" size={16} />
              Род
            </Button>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => { resetForm(); setShowAddForm(true); }}
            >
              <Icon name="Plus" className="mr-1" size={16} />
              Добавить
            </Button>
          </div>
        </div>

        {clanHook.invites.length > 0 && !showClanPanel && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Mail" size={16} className="text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Вас приглашают в род «{clanHook.invites[0].clan_name}»
                    {clanHook.invites[0].invited_by_name && ` от ${clanHook.invites[0].invited_by_name}`}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-7 text-xs" onClick={async () => {
                    const ok = await clanHook.acceptInvite(clanHook.invites[0].id);
                    if (ok) { toast({ title: 'Вы присоединились к роду!' }); fetchTree(); }
                  }}>Принять</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={async () => {
                    await clanHook.declineInvite(clanHook.invites[0].id);
                    toast({ title: 'Приглашение отклонено' });
                  }}>Нет</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showClanPanel && (
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                  <Icon name="Crown" size={18} className="text-amber-600" />
                  {clanHook.clan ? clanHook.clan.name : 'Общий род'}
                </h3>
                <button onClick={() => setShowClanPanel(false)} className="text-amber-400 hover:text-amber-600">
                  <Icon name="X" size={18} />
                </button>
              </div>

              {!clanHook.clan ? (
                <div className="space-y-3">
                  <p className="text-sm text-amber-700">Создайте общий род, чтобы родственники из других семей видели и дополняли одно древо.</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Название рода (напр. Кузьменко)"
                      value={clanName}
                      onChange={e => setClanName(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      className="bg-amber-600 hover:bg-amber-700"
                      disabled={!clanName.trim() || saving}
                      onClick={async () => {
                        setSaving(true);
                        const result = await clanHook.createClan(clanName.trim());
                        setSaving(false);
                        if (result.success) {
                          toast({ title: `Род «${clanName}» создан!` });
                          setClanName('');
                          fetchTree();
                        } else {
                          toast({ title: result.error || 'Ошибка создания', variant: 'destructive' });
                        }
                      }}
                    >
                      {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : 'Создать'}
                    </Button>
                  </div>

                  {clanHook.invites.length > 0 && (
                    <div className="space-y-2 border-t border-amber-200 pt-3">
                      <p className="text-sm font-medium text-amber-800">Приглашения:</p>
                      {clanHook.invites.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between bg-white rounded-lg p-2 border border-amber-100">
                          <div>
                            <p className="text-sm font-medium">{inv.clan_name}</p>
                            {inv.invited_by_name && <p className="text-xs text-muted-foreground">от {inv.invited_by_name}</p>}
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-7 text-xs" onClick={async () => {
                              const ok = await clanHook.acceptInvite(inv.id);
                              if (ok) { toast({ title: 'Вы в роду!' }); fetchTree(); }
                            }}>Принять</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={async () => {
                              await clanHook.declineInvite(inv.id);
                            }}>Отклонить</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300">{clanHook.clan.role === 'owner' ? 'Создатель' : 'Участник'}</Badge>
                    <span className="text-sm text-amber-700">
                      {clanHook.families.filter(f => f.status === 'active').length} {
                        (() => {
                          const n = clanHook.families.filter(f => f.status === 'active').length;
                          if (n === 1) return 'семья';
                          if (n >= 2 && n <= 4) return 'семьи';
                          return 'семей';
                        })()
                      } в роду
                    </span>
                  </div>

                  <div className="space-y-1">
                    {clanHook.families.filter(f => f.status === 'active').map(f => (
                      <div key={f.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-amber-100">
                        <Icon name="Home" size={14} className="text-amber-500" />
                        <span className="text-sm">{f.user_name || f.user_email || 'Семья'}</span>
                        {f.role === 'owner' && <Badge className="bg-amber-500 text-white text-[10px] px-1 py-0 ml-auto">Создатель</Badge>}
                      </div>
                    ))}
                    {clanHook.families.filter(f => f.status === 'pending').map(f => (
                      <div key={f.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 opacity-60">
                        <Icon name="Clock" size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{f.user_name || f.user_email || 'Семья'}</span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0 ml-auto">Ожидает</Badge>
                      </div>
                    ))}
                  </div>

                  {clanHook.clan.role === 'owner' && (
                    <div className="border-t border-amber-200 pt-3">
                      <p className="text-sm font-medium text-amber-800 mb-2">Пригласить родственника</p>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="Email родственника"
                          value={inviteEmail}
                          onChange={e => setInviteEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          className="bg-amber-600 hover:bg-amber-700"
                          disabled={!inviteEmail.trim() || saving}
                          onClick={async () => {
                            setSaving(true);
                            const result = await clanHook.inviteByEmail(inviteEmail.trim().toLowerCase());
                            setSaving(false);
                            if (result.success) {
                              toast({ title: 'Приглашение отправлено!' });
                              setInviteEmail('');
                            } else {
                              toast({ title: result.error || 'Ошибка', variant: 'destructive' });
                            }
                          }}
                        >
                          <Icon name="Send" size={16} />
                        </Button>
                      </div>
                      <p className="text-[10px] text-amber-600 mt-1">Родственник должен быть зарегистрирован в приложении</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 mb-4">
            <CardContent className="py-3 text-center text-red-700 text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        {members.length > 0 ? (
          <FamilyTreeCanvas
            members={members}
            sortedGenerations={sortedGenerations}
            genLabels={genLabels}
            onSelectMember={setSelectedMember}
          />
        ) : (
          <Card className="border-dashed border-amber-300 bg-amber-50/50">
            <CardContent className="py-12 text-center">
              <Icon name="TreePine" size={48} className="text-amber-300 mx-auto mb-3" />
              <p className="text-amber-700 font-medium mb-1">Древо пока пустое</p>
              <p className="text-amber-500 text-sm mb-4">Добавьте первого члена семьи, чтобы начать строить историю рода</p>
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => { resetForm(); setShowAddForm(true); }}
              >
                <Icon name="Plus" className="mr-2" size={16} />
                Добавить первого
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedMember && !showEditForm && (
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedMember.photo_url && isImageUrl(selectedMember.photo_url) ? (
                    <img src={selectedMember.photo_url} alt={selectedMember.name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-300" />
                  ) : (
                    <span className="text-3xl">{selectedMember.avatar || '👤'}</span>
                  )}
                  <div>
                    <p className="text-lg">{selectedMember.name}</p>
                    {selectedMember.relation && <p className="text-sm text-muted-foreground font-normal">{selectedMember.relation}</p>}
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                {(selectedMember.birth_date || selectedMember.birth_year) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Calendar" size={16} className="text-amber-600" />
                    <span>
                      {(() => {
                        const birthStr = selectedMember.birth_date
                          ? new Date(selectedMember.birth_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
                          : `Год рождения: ${selectedMember.birth_year}`;
                        if (selectedMember.death_date) {
                          const deathStr = new Date(selectedMember.death_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
                          return `${birthStr} — ${deathStr}`;
                        }
                        if (selectedMember.death_year) {
                          if (selectedMember.birth_date) {
                            return `${birthStr} — ${selectedMember.death_year}`;
                          }
                          return `${selectedMember.birth_year} — ${selectedMember.death_year}`;
                        }
                        return birthStr;
                      })()}
                    </span>
                  </div>
                )}

                {calculateAge(selectedMember) !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Clock" size={16} className="text-amber-600" />
                    <span>Возраст: {getAgeText(calculateAge(selectedMember)!)}</span>
                  </div>
                )}

                {selectedMember.occupation && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Briefcase" size={16} className="text-amber-600" />
                    <span>{selectedMember.occupation}</span>
                  </div>
                )}

                {(selectedMember.parent_id || selectedMember.parent2_id) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Users" size={16} className="text-amber-600" />
                    <span>
                      Родители: {[
                        selectedMember.parent_id && members.find(m => m.id === selectedMember.parent_id)?.name,
                        selectedMember.parent2_id && members.find(m => m.id === selectedMember.parent2_id)?.name,
                      ].filter(Boolean).join(' и ') || 'Не указаны'}
                    </span>
                  </div>
                )}

                {selectedMember.spouse_id && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="Heart" size={16} className="text-pink-500" />
                      <span>Супруг(а): {members.find(m => m.id === selectedMember.spouse_id)?.name}</span>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      onClick={async () => {
                        if (!confirm('Расторгнуть брак? Связь будет убрана у обоих.')) return;
                        const success = await updateMember(selectedMember.id, { spouse_id: null });
                        if (success) {
                          toast({ title: 'Брак расторгнут' });
                          setSelectedMember(null);
                          fetchTree();
                        }
                      }}
                    >
                      <Icon name="HeartOff" size={14} />
                    </button>
                  </div>
                )}

                {selectedMember.bio && (
                  <div className="text-sm text-muted-foreground border-t pt-3 mt-3">
                    {selectedMember.bio}
                  </div>
                )}

                {selectedMember.photos && selectedMember.photos.length > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Icon name="Images" size={14} className="text-amber-600" />
                      Фотографии ({selectedMember.photos.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedMember.photos.map(photo => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={photo.photo_url}
                            alt={photo.caption || ''}
                            className="w-full aspect-square object-cover rounded-lg border border-amber-200"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 text-white rounded-full items-center justify-center text-xs hidden group-hover:flex"
                            onClick={(e) => { e.stopPropagation(); handleDeletePhoto(selectedMember.id, photo.id); }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(() => {
                  const children = members.filter(m => m.parent_id === selectedMember.id || m.parent2_id === selectedMember.id);
                  if (children.length === 0) return null;
                  return (
                    <div className="flex items-start gap-2 text-sm">
                      <Icon name="Users" size={16} className="text-blue-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Дети:</span>
                        <ul className="ml-2 mt-1 space-y-0.5">
                          {children.map(child => <li key={child.id}>&#8226; {child.name}</li>)}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                <Button
                  size="sm"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 min-w-[140px]"
                  onClick={() => {
                    const fromMember = selectedMember;
                    setSelectedMember(null);
                    resetForm();
                    setAddFromMemberId(fromMember.id);
                    setShowAddForm(true);
                  }}
                >
                  <Icon name="UserPlus" className="mr-1" size={14} />
                  Добавить родственника
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditForm(selectedMember)}>
                  <Icon name="Pencil" className="mr-1" size={14} />
                  Редактировать
                </Button>
                <label className="cursor-pointer flex-1">
                  <div className="flex items-center justify-center gap-1 px-3 py-2 rounded-md border text-sm hover:bg-amber-50 transition-colors">
                    <Icon name={uploadingGalleryPhoto ? 'Loader2' : 'ImagePlus'} size={14} className={uploadingGalleryPhoto ? 'animate-spin' : ''} />
                    {uploadingGalleryPhoto ? '...' : 'Фото'}
                  </div>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleGalleryPhotoUpload(e, selectedMember.id)} disabled={uploadingGalleryPhoto} />
                </label>
                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(selectedMember)}>
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={showAddForm || showEditForm} onOpenChange={() => { setShowAddForm(false); setShowEditForm(false); resetForm(); }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{showEditForm ? 'Редактировать' : 'Добавить в древо'}</DialogTitle>
            </DialogHeader>

            {!showEditForm && addFromMemberId && (() => {
              const fromMember = members.find(m => m.id === addFromMemberId);
              return fromMember ? (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">
                  <Icon name="Link" size={14} className="text-amber-600 shrink-0" />
                  <span>Добавляется как родственник: <strong>{fromMember.name}</strong></span>
                </div>
              ) : null;
            })()}

            <div className="space-y-4">
              <div>
                <Label>Имя *</Label>
                <Input
                  placeholder="Иван Петрович Иванов"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {(() => {
                const fromMember = addFromMemberId ? members.find(m => m.id === addFromMemberId) : null;
                if (fromMember && !showEditForm) {
                  const contextOptions: { label: string; relation: string; auto: Partial<typeof formData> }[] = [];
                  const rel = fromMember.relation || '';

                  contextOptions.push({ label: `Супруг(а) — ${fromMember.name}`, relation: 'Супруг', auto: { spouse_id: fromMember.id } });

                  if (['Я', 'Брат', 'Сестра', 'Супруг', 'Супруга'].includes(rel)) {
                    contextOptions.push({ label: `Сын — ${fromMember.name}`, relation: 'Сын', auto: { parent_id: fromMember.id } });
                    contextOptions.push({ label: `Дочь — ${fromMember.name}`, relation: 'Дочь', auto: { parent_id: fromMember.id } });
                    contextOptions.push({ label: `Брат / Сестра`, relation: 'Брат', auto: { parent_id: fromMember.parent_id || undefined, parent2_id: fromMember.parent2_id || undefined } });
                  }

                  if (['Отец', 'Мать'].includes(rel)) {
                    contextOptions.push({ label: `Сын / Дочь (ребёнок)`, relation: 'Сын', auto: { parent_id: fromMember.id } });
                    contextOptions.push({ label: `Брат / Сестра (${fromMember.name})`, relation: 'Брат', auto: {} });
                  }

                  if (['Дедушка', 'Бабушка'].includes(rel)) {
                    contextOptions.push({ label: `Сын / Дочь (ребёнок)`, relation: rel === 'Дедушка' ? 'Отец' : 'Мать', auto: { parent_id: fromMember.id } });
                  }

                  if (['Сын', 'Дочь'].includes(rel)) {
                    contextOptions.push({ label: `Брат / Сестра (${fromMember.name})`, relation: 'Сын', auto: { parent_id: fromMember.parent_id || undefined, parent2_id: fromMember.parent2_id || undefined } });
                    contextOptions.push({ label: `Внук / Внучка`, relation: 'Внук', auto: { parent_id: fromMember.id } });
                  }

                  contextOptions.push({ label: `Отец — ${fromMember.name}`, relation: 'Отец', auto: {} });
                  contextOptions.push({ label: `Мать — ${fromMember.name}`, relation: 'Мать', auto: {} });

                  return (
                    <div>
                      <Label>Кем приходится для {fromMember.name}</Label>
                      <div className="grid gap-2 mt-1">
                        {contextOptions.map(o => (
                          <button
                            key={o.label}
                            type="button"
                            className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                              formData.relation === o.relation ? 'bg-amber-100 border-amber-400 text-amber-900' : 'border-gray-200 hover:bg-amber-50 hover:border-amber-300'
                            }`}
                            onClick={() => setFormData(prev => ({ ...prev, relation: o.relation, ...o.auto }))}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div>
                    <Label>Кем приходится</Label>
                    <Select value={formData.relation || ''} onValueChange={v => setFormData(prev => ({ ...prev, relation: v }))}>
                      <SelectTrigger><SelectValue placeholder="Выберите родство" /></SelectTrigger>
                      <SelectContent>
                        {RELATION_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })()}

              <div className="space-y-3">
                <div>
                  <Label>Дата рождения</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      placeholder="Д"
                      min={1}
                      max={31}
                      className="w-16"
                      value={birthDay}
                      onChange={e => setBirthDay(e.target.value)}
                    />
                    <Select value={birthMonth || 'none'} onValueChange={v => setBirthMonth(v === 'none' ? '' : v)}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Месяц" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {MONTHS.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Год"
                      className="flex-1"
                      value={formData.birth_year || ''}
                      onChange={e => setFormData(prev => ({ ...prev, birth_year: e.target.value ? parseInt(e.target.value) : undefined }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Дата смерти</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      placeholder="Д"
                      min={1}
                      max={31}
                      className="w-16"
                      value={deathDay}
                      onChange={e => setDeathDay(e.target.value)}
                    />
                    <Select value={deathMonth || 'none'} onValueChange={v => setDeathMonth(v === 'none' ? '' : v)}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Месяц" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {MONTHS.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Если нет в живых"
                      className="flex-1"
                      value={formData.death_year || ''}
                      onChange={e => setFormData(prev => ({ ...prev, death_year: e.target.value ? parseInt(e.target.value) : undefined }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Род занятий</Label>
                <Input
                  placeholder="Учитель, инженер..."
                  value={formData.occupation || ''}
                  onChange={e => setFormData(prev => ({ ...prev, occupation: e.target.value || undefined }))}
                />
              </div>

              {members.length > 0 && (() => {
                const hasContextLinks = !showEditForm && addFromMemberId && (formData.parent_id || formData.parent2_id || formData.spouse_id);
                if (hasContextLinks) {
                  const links: string[] = [];
                  if (formData.spouse_id) {
                    const s = members.find(m => m.id === formData.spouse_id);
                    if (s) links.push(`Супруг(а): ${s.name}`);
                  }
                  if (formData.parent_id) {
                    const p = members.find(m => m.id === formData.parent_id);
                    if (p) links.push(`Родитель: ${p.name}`);
                  }
                  if (formData.parent2_id) {
                    const p2 = members.find(m => m.id === formData.parent2_id);
                    if (p2) links.push(`Родитель: ${p2.name}`);
                  }
                  return links.length > 0 ? (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">
                      <Icon name="Check" size={14} className="text-green-600 shrink-0" />
                      <span>Связи заполнены: {links.join(', ')}</span>
                    </div>
                  ) : null;
                }
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Отец</Label>
                        <Select
                          value={formData.parent_id?.toString() || 'none'}
                          onValueChange={v => setFormData(prev => ({ ...prev, parent_id: v === 'none' ? undefined : parseInt(v) }))}
                        >
                          <SelectTrigger><SelectValue placeholder="Не указан" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Не указан</SelectItem>
                            {members.filter(m => !showEditForm || m.id !== selectedMember?.id).map(m => (
                              <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Мать</Label>
                        <Select
                          value={formData.parent2_id?.toString() || 'none'}
                          onValueChange={v => setFormData(prev => ({ ...prev, parent2_id: v === 'none' ? undefined : parseInt(v) }))}
                        >
                          <SelectTrigger><SelectValue placeholder="Не указана" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Не указана</SelectItem>
                            {members.filter(m => !showEditForm || m.id !== selectedMember?.id).map(m => (
                              <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Супруг(а)</Label>
                      <Select
                        value={formData.spouse_id?.toString() || 'none'}
                        onValueChange={v => setFormData(prev => ({ ...prev, spouse_id: v === 'none' ? undefined : parseInt(v) }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Не указан(а)" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Не указан(а)</SelectItem>
                          {members.filter(m => !showEditForm || m.id !== selectedMember?.id).map(m => (
                            <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                );
              })()}

              <div>
                <Label>Фото</Label>
                <div className="flex items-center gap-3 mt-1">
                  {(photoPreview || formData.photo_url) ? (
                    <div className="relative">
                      <img
                        src={photoPreview || formData.photo_url}
                        alt="Фото"
                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-300"
                      />
                      <button
                        type="button"
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                        onClick={() => { setPhotoPreview(null); setFormData(prev => ({ ...prev, photo_url: undefined })); }}
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-dashed border-amber-300 flex items-center justify-center text-2xl">
                      {formData.avatar || '👤'}
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors text-sm ${uploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Icon name={uploadingPhoto ? 'Loader2' : 'Camera'} size={16} className={uploadingPhoto ? 'animate-spin text-amber-600' : 'text-amber-600'} />
                        {uploadingPhoto ? 'Загрузка...' : 'Загрузить фото'}
                      </div>
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                    </label>
                    <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WebP до 10 МБ</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Иконка (если без фото)</Label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {AVATAR_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className={`text-2xl p-1 rounded-lg border-2 transition-all ${formData.avatar === emoji ? 'border-amber-500 bg-amber-50 scale-110' : 'border-transparent hover:border-amber-200'}`}
                      onClick={() => setFormData(prev => ({ ...prev, avatar: emoji }))}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>О человеке</Label>
                <Textarea
                  placeholder="Краткая биография, интересные факты..."
                  value={formData.bio || ''}
                  onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value || undefined }))}
                  rows={3}
                />
              </div>

              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={showEditForm ? handleEdit : handleAdd}
                disabled={saving || uploadingPhoto}
              >
                {saving ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                    Сохранение...
                  </>
                ) : showEditForm ? 'Сохранить' : 'Добавить в древо'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}