import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { TreeMember } from '@/hooks/useFamilyTree';
import { MemberCard, CoupleBlock } from './TreeMemberCard';
import {
  buildLayout,
  buildPaths,
  pointsToD,
  CARD_H,
  LABEL_H,
  type NodeLayout,
} from './treeUtils';

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.12;

export function FamilyTreeCanvas({
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
  const { paths, memberColors, legend } = useMemo(() => buildPaths(gens), [gens]);

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

      {legend.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-2 py-1.5 bg-white/60 rounded-lg border border-amber-100">
          <span className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider self-center">Ветки:</span>
          {legend.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] text-gray-700">
                {item.parentNames} → {item.childNames.join(', ')}
              </span>
            </div>
          ))}
        </div>
      )}

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
                stroke={p.color || '#d97706'}
                strokeWidth={p.isSibling ? 2.8 : 2}
                strokeOpacity={0.75}
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
                    <CoupleBlock unit={nl.node.unit} onSelect={onSelectMember} memberColors={memberColors} />
                  ) : (
                    <MemberCard member={nl.node.member} onClick={() => onSelectMember(nl.node.member)} branchColor={memberColors.get(nl.node.member.id)} />
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

export default FamilyTreeCanvas;
