import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DotNode, GameItem, ModeConfig } from '../types';
import { CANDY_COLORS } from '../utils/gameUtils';
import { sound } from '../utils/audio';
import { IllustrationCard } from './IllustrationCard';
import { triggerBackdropBurst } from './DynamicBackdrop';
import { SlotAuditStatus } from './SentenceTray';

interface GameBoardProps {
  item: GameItem;
  nodes: DotNode[];
  selectedNodeIds: string[];
  auditResults: SlotAuditStatus[] | null;
  modeConfig: ModeConfig;
  onToggleNode: (nodeId: string, clientX: number, clientY: number) => void;
  onMoveNode: (nodeId: string, xPct: number, yPct: number) => void;
  compact?: boolean;
  teamAccent?: 'blue' | 'coral';
  disabled?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  item,
  nodes,
  selectedNodeIds,
  auditResults,
  modeConfig,
  onToggleNode,
  onMoveNode,
  compact = false,
  teamAccent,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hintUsed, setHintUsed] = useState(false);

  // Track dragging state of any node
  const dragStateRef = useRef<{
    nodeId: string;
    pointerId: number;
    startX: number;
    startY: number;
    hasMoved: boolean;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [boardSize, setBoardSize] = useState({ width: 800, height: 500 });

  // Reset hint when puzzle changes
  useEffect(() => {
    setHintUsed(false);
  }, [item.id]);

  // Measure board for crisp SVG paths
  const measureBoard = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setBoardSize({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    measureBoard();
    window.addEventListener('resize', measureBoard);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(measureBoard);
      ro.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener('resize', measureBoard);
      ro?.disconnect();
    };
  }, [measureBoard]);

  const handlePointerDownNode = (node: DotNode, e: React.PointerEvent) => {
    e.stopPropagation();
    if (disabled) return;
    sound.unlock();

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nodePxX = (node.x / 100) * rect.width;
    const nodePxY = (node.y / 100) * rect.height;

    dragStateRef.current = {
      nodeId: node.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      hasMoved: false,
      offsetX: e.clientX - rect.left - nodePxX,
      offsetY: e.clientY - rect.top - nodePxY,
    };

    try {
      containerRef.current.setPointerCapture(e.pointerId);
    } catch {
      // Ignore unsupported environments
    }
  };

  const handlePointerMoveBoard = (e: React.PointerEvent) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !containerRef.current) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const dist = Math.hypot(dx, dy);

    if (!drag.hasMoved && dist > 7) {
      drag.hasMoved = true;
      setDraggingNodeId(drag.nodeId);
      sound.playPickup();
      triggerBackdropBurst(e.clientX, e.clientY, '#38BDF8', 8);
    }

    if (drag.hasMoved) {
      const rect = containerRef.current.getBoundingClientRect();
      const targetPxX = e.clientX - rect.left - drag.offsetX;
      const targetPxY = e.clientY - rect.top - drag.offsetY;

      const xPct = Math.max(8, Math.min(92, (targetPxX / rect.width) * 100));
      const yPct = Math.max(12, Math.min(88, (targetPxY / rect.height) * 100));

      onMoveNode(drag.nodeId, xPct, yPct);
    }
  };

  const handlePointerUpBoard = (e: React.PointerEvent) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    if (containerRef.current) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }

    if (drag.hasMoved) {
      sound.playDrop();
      const node = nodes.find(n => n.id === drag.nodeId);
      const color = node ? CANDY_COLORS[node.colorIndex].hex : '#F59E0B';
      triggerBackdropBurst(e.clientX, e.clientY, color, 10);
    } else {
      // Clean click/tap without drag -> connect/disconnect token!
      onToggleNode(drag.nodeId, e.clientX, e.clientY);
    }

    dragStateRef.current = null;
    setDraggingNodeId(null);
  };

  // Build lookup of node positions & selected order
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const selectedOrderMap = new Map<string, number>();
  selectedNodeIds.forEach((id, idx) => selectedOrderMap.set(id, idx));

  // Build glowing curved SVG paths connecting selected nodes in the player's chosen order
  const connectionSegments: {
    d: string;
    color: string;
    x2: number;
    y2: number;
  }[] = [];

  for (let i = 0; i < selectedNodeIds.length - 1; i++) {
    const n1 = nodeMap.get(selectedNodeIds[i]);
    const n2 = nodeMap.get(selectedNodeIds[i + 1]);
    if (!n1 || !n2) continue;

    const x1 = (n1.x / 100) * boardSize.width;
    const y1 = (n1.y / 100) * boardSize.height;
    const x2 = (n2.x / 100) * boardSize.width;
    const y2 = (n2.y / 100) * boardSize.height;

    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    // Slight playful arch curve perpendicular to line
    const dx = x2 - x1;
    const dy = y2 - y1;
    const cx = mx - dy * 0.12;
    const cy = my + dx * 0.12;

    connectionSegments.push({
      d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
      color: CANDY_COLORS[n1.colorIndex].hex,
      x2,
      y2,
    });
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMoveBoard}
      onPointerUp={handlePointerUpBoard}
      onPointerCancel={handlePointerUpBoard}
      className={`relative w-full h-full flex-1 overflow-hidden select-none touch-none rounded-3xl border-2 shadow-2xl ${
        compact ? 'min-h-[260px] sm:min-h-[300px]' : 'min-h-[420px]'
      } ${
        teamAccent === 'blue'
          ? 'border-sky-300/90 bg-sky-50/40'
          : teamAccent === 'coral'
          ? 'border-orange-300/90 bg-orange-50/40'
          : 'border-white/85 bg-white/40'
      }`}
    >
      {/* Complex inner lighting vignette & sunlit rim glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.45),transparent_60%)]" />

      {/* Clue illustration card at top-left */}
      <div className={compact ? 'absolute top-2.5 left-2.5 z-20 pointer-events-auto' : 'absolute top-3 left-3 sm:top-5 sm:left-5 z-20 pointer-events-auto'}>
        <IllustrationCard
          item={item}
          hintUsed={hintUsed}
          onUseHint={() => setHintUsed(prev => !prev)}
          compact={compact}
        />
      </div>

      {/* SVG Canvas for Glowing Curved Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {connectionSegments.map((seg, idx) => (
          <g key={idx}>
            {/* Soft under-glow ribbon without expensive feGaussianBlur */}
            <path
              d={seg.d}
              fill="none"
              stroke={seg.color}
              strokeWidth="18"
              strokeLinecap="round"
              opacity="0.24"
            />
            {/* Core colored ribbon */}
            <path
              d={seg.d}
              fill="none"
              stroke={seg.color}
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Animated flowing light dash */}
            <path
              d={seg.d}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 8"
              className="animate-dash-flow"
              opacity="0.9"
            />
            {/* Endpoint sparkle */}
            <circle cx={seg.x2} cy={seg.y2} r="5" fill="#FFFFFF" opacity="0.85" />
          </g>
        ))}
      </svg>

      {/* Interactive Draggable & Clickable Word / Letter Tiles */}
      {nodes.map(node => {
        const orderIdx = selectedOrderMap.get(node.id);
        const isSelected = orderIdx !== undefined;
        const isDragging = draggingNodeId === node.id;
        const color = CANDY_COLORS[node.colorIndex];

        // If user clicked Check Answer, reflect slot status on the connected node
        const slotAudit: SlotAuditStatus | undefined =
          isSelected && auditResults ? auditResults[orderIdx] : undefined;

        return (
          <div
            key={node.id}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
            }}
            onPointerDown={e => handlePointerDownNode(node, e)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 select-none cursor-grab active:cursor-grabbing transition-transform duration-150 ${
              isDragging
                ? 'z-40 scale-115 -rotate-2'
                : isSelected
                ? 'z-30 scale-105 hover:scale-110'
                : 'z-20 hover:scale-108 active:scale-95'
            }`}
          >
            {/* Main Big Tactile Tile */}
            <div
              style={{
                boxShadow: isDragging
                  ? `0 18px 30px -6px ${color.glow}, 0 0 0 6px ${color.glow}`
                  : isSelected
                  ? `0 10px 20px -4px ${color.glow}, 0 0 0 4px ${color.glow}`
                  : '0 8px 16px -4px rgba(15, 23, 42, 0.18)',
              }}
              className={`relative flex items-center justify-center font-display font-bold border-4 transition-colors duration-200 ${
                item.mode === 'sentence'
                  ? compact
                    ? 'px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl min-w-[64px] text-base sm:text-xl tracking-wide'
                    : 'px-5 sm:px-7 py-3 sm:py-3.5 rounded-3xl min-w-[92px] text-xl sm:text-3xl tracking-wide'
                  : compact
                  ? 'w-[54px] h-[54px] sm:w-[64px] sm:h-[64px] rounded-full text-2xl sm:text-3xl'
                  : 'w-[74px] h-[74px] sm:w-[88px] sm:h-[88px] rounded-full text-3xl sm:text-5xl'
              } ${
                slotAudit === 'correct'
                  ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-white text-white'
                  : slotAudit === 'wrong'
                  ? 'bg-gradient-to-b from-rose-400 to-rose-600 border-white text-white animate-shake'
                  : isSelected
                  ? `bg-gradient-to-b ${color.bg} border-white text-white`
                  : 'bg-white border-amber-200 text-slate-800 hover:border-sky-300'
              }`}
            >
              {/* Glossy top inner rim light */}
              <div className="absolute inset-x-3 top-1.5 h-2.5 rounded-full bg-white/35 pointer-events-none" />

              {/* Big readable text */}
              <span className="relative pointer-events-none leading-none">
                {node.text}
              </span>

              {/* Order badge ONLY showing user's chosen sequence order on already-selected dots */}
              {isSelected && (
                <div className="absolute -top-3 -right-2.5 w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs border-2 border-white shadow-md flex items-center justify-center pointer-events-none">
                  {orderIdx + 1}
                </div>
              )}

              {/* Optional manual number hints if user explicitly turned on Show Number Hints in Settings */}
              {!isSelected && modeConfig.showNumberHints && (
                <div className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-black text-xs border-2 border-white shadow flex items-center justify-center pointer-events-none">
                  {node.targetIndex + 1}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
