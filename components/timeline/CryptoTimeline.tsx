/**
 * CryptoTimeline – Interactive Cipher Relationship Graph
 *
 * Renders a directed relationship graph of cryptographic algorithms using
 * pure SVG. Nodes are colour-coded by category, edges show evolution /
 * influence relationships, and the viewer can pan, zoom, search, and filter.
 *
 * Features
 * --------
 * - SVG-based force-directed-like layout (pre-computed positions)
 * - Category colour coding (classical, symmetric, hash, asymmetric)
 * - Security status badges on each node
 * - Hover tooltip with cipher details
 * - Click to focus on a node and highlight its connections
 * - Search bar to filter nodes by name
 * - Category filter tabs
 * - Pan and zoom via mouse drag / wheel
 * - Responsive — adapts to container width
 * - Framer Motion for entrance animations
 * - Keyboard and screen-reader accessible
 *
 * @see lib/timeline/timelineData.ts for data types and relationship definitions
 */

'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import {
  getGraphData,
  getCipherById,
  getRelatedEdges,
  getNeighbourIds,
  getCiphersByCategory,
  type CipherNode,
  type CipherEdge,
  type RelationshipType,
} from '@/lib/timeline/timelineData';
import { CIPHER_REGISTRY } from '@/lib/cipher/registry';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Category colour palette (applied to nodes) */
const CATEGORY_COLORS: Record<CipherNode['category'], { fill: string; stroke: string; text: string }> = {
  classical: { fill: '#f59e0b', stroke: '#d97706', text: '#78350f' },   // amber
  symmetric: { fill: '#06b6d4', stroke: '#0891b2', text: '#083344' },   // cyan
  hash:       { fill: '#8b5cf6', stroke: '#7c3aed', text: '#2e1065' },   // violet
  asymmetric: { fill: '#10b981', stroke: '#059669', text: '#064e3b' },   // emerald
};

/** Security status badge colour */
const STATUS_COLORS: Record<string, string> = {
  recommended: '#059669',
  secure: '#2563eb',
  experimental: '#d97706',
  legacy: '#7c3aed',
  deprecated: '#dc2626',
  broken: '#991b1b',
};

/** Edge colour by relationship type */
const EDGE_COLORS: Record<RelationshipType, string> = {
  evolved_from: '#6366f1',
  influenced_by: '#94a3b8',
  based_on: '#0ea5e9',
  variant_of: '#8b5cf6',
  predecessor_of: '#f59e0b',
  standardized_by: '#10b981',
  competes_with: '#f43f5e',
  broken_by: '#dc2626',
};

/** Pre-computed node positions (hierarchical layout by year / category) */
function computePositions(
  nodes: CipherNode[],
  width: number,
  height: number,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const padding = 80;
  const categories: CipherNode['category'][] = ['classical', 'symmetric', 'hash', 'asymmetric'];
  const categoryNodes = categories.map((cat) =>
    nodes.filter((n) => n.category === cat).sort((a, b) => a.year - b.year),
  );

  const maxCount = Math.max(...categoryNodes.map((arr) => arr.length), 1);
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const colWidth = usableWidth / categories.length;

  for (let ci = 0; ci < categories.length; ci++) {
    const group = categoryNodes[ci];
    const cx = padding + colWidth * ci + colWidth / 2;

    for (let ni = 0; ni < group.length; ni++) {
      const node = group[ni];
      // Distribute vertically by year (oldest at top)
      const minYear = group.length > 0 ? group[0].year : 0;
      const maxYear = group.length > 1 ? group[group.length - 1].year : minYear + 1;
      const yearRange = Math.max(maxYear - minYear, 1);
      const yearRatio = (node.year - minYear) / yearRange;
      const y = padding + usableHeight * 0.1 + yearRatio * usableHeight * 0.8;

      // Add slight horizontal jitter to prevent overlap
      const jitter = ((ni % 3) - 1) * 15;

      positions.set(node.id, { x: cx + jitter, y });
    }
  }

  return positions;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Small security status badge pill */
function StatusBadge({ status }: { status: string }) {
  const bg = STATUS_COLORS[status] || '#6b7280';
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
      style={{ backgroundColor: bg }}
    >
      {status}
    </span>
  );
}

/** Tooltip card shown on node hover */
function NodeTooltip({ node, style }: { node: CipherNode; style: React.CSSProperties }) {
  const colors = CATEGORY_COLORS[node.category];
  const cipherDef = CIPHER_REGISTRY.find((c) => c.id === node.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={style}
      className="pointer-events-none absolute z-50 w-64 rounded-xl border border-zinc-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-zinc-700/80 dark:bg-zinc-900/95"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: colors.fill }}
        >
          {node.category}
        </span>
        <StatusBadge status={node.status} />
      </div>
      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{node.name}</h4>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        {cipherDef?.description || node.description}
      </p>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-500">
        <span>Year: {node.year < 0 ? `${Math.abs(node.year)} BC` : node.year}</span>
        {cipherDef?.securityStatus && (
          <span>Status: {cipherDef.securityStatus}</span>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CryptoTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Viewport state for pan / zoom
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [viewportStart, setViewportStart] = useState({ x: 0, y: 0 });

  // Interaction state
  const [hoveredNode, setHoveredNode] = useState<CipherNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CipherNode['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [containerSize, setContainerSize] = useState({ width: 960, height: 600 });

  // Legend collapse state
  const [legendCollapsed, setLegendCollapsed] = useState(false);

  // Graph data
  const graphData = useMemo(() => getGraphData(), []);

  // Filtered nodes based on search + category
  const filteredNodes = useMemo(() => {
    let result = graphData.nodes;
    if (selectedCategory !== 'all') {
      result = getCiphersByCategory(result, selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (node) =>
          node.name.toLowerCase().includes(q) ||
          node.id.toLowerCase().includes(q) ||
          node.metadata.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [graphData.nodes, selectedCategory, searchQuery]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  // Edges where both source and target are visible
  const visibleEdges = useMemo(() => {
    if (searchQuery.trim() || selectedCategory !== 'all') {
      return graphData.edges.filter(
        (edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target),
      );
    }
    return graphData.edges;
  }, [graphData.edges, filteredNodeIds, searchQuery, selectedCategory]);

  // Node positions
  const positions = useMemo(
    () => computePositions(graphData.nodes, containerSize.width, containerSize.height),
    [graphData.nodes, containerSize.width, containerSize.height],
  );

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Focus neighbours when a node is clicked
  const focusedNeighbourIds = useMemo(() => {
    if (!focusedNodeId) return new Set<string>();
    return new Set(getNeighbourIds(graphData.edges, focusedNodeId));
  }, [focusedNodeId, graphData.edges]);

  const isNodeHighlighted = useCallback(
    (nodeId: string) => {
      if (!focusedNodeId) return true; // all highlighted when no focus
      return nodeId === focusedNodeId || focusedNeighbourIds.has(nodeId);
    },
    [focusedNodeId, focusedNeighbourIds],
  );

  const isEdgeHighlighted = useCallback(
    (edge: CipherEdge) => {
      if (!focusedNodeId) return true;
      return edge.source === focusedNodeId || edge.target === focusedNodeId;
    },
    [focusedNodeId],
  );

  // ---- Event handlers ----

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === svgRef.current || (e.target as SVGElement).classList.contains('graph-bg')) {
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
        setViewportStart({ x: viewport.x, y: viewport.y });
      }
    },
    [viewport.x, viewport.y],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        setViewport((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
          scale: prev.scale,
        }));
      }
    },
    [isPanning, panStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(viewport.scale * delta, 0.3), 3);
      setViewport((prev) => ({ ...prev, scale: newScale }));
    },
    [viewport.scale],
  );

  const handleNodeHover = useCallback(
    (node: CipherNode, e: React.MouseEvent) => {
      setHoveredNode(node);
      setTooltipPos({ x: e.clientX + 12, y: e.clientY - 10 });
    },
    [],
  );

  const handleNodeClick = useCallback((nodeId: string) => {
    setFocusedNodeId((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  const handleZoomIn = useCallback(() => {
    setViewport((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.3, 3) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewport((prev) => ({ ...prev, scale: Math.max(prev.scale * 0.7, 0.3) }));
  }, []);

  const handleResetView = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 });
    setFocusedNodeId(null);
  }, []);

  // Clear focus on background click
  const handleBackgroundClick = useCallback(() => {
    setFocusedNodeId(null);
    setHoveredNode(null);
  }, []);

  // ---- Categories for filter tabs ----
  const categories: { key: CipherNode['category'] | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'classical', label: 'Classical' },
    { key: 'symmetric', label: 'Symmetric' },
    { key: 'hash', label: 'Hash' },
    { key: 'asymmetric', label: 'Asymmetric' },
  ];

  // ---- Edge legend items ----
  const edgeLegendItems: { type: RelationshipType; label: string }[] = [
    { type: 'evolved_from', label: 'Evolved From' },
    { type: 'influenced_by', label: 'Influenced By' },
    { type: 'based_on', label: 'Based On' },
    { type: 'variant_of', label: 'Variant Of' },
    { type: 'competes_with', label: 'Competes With' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ---- Controls Bar ---- */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search ciphers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search ciphers by name"
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900">
          <button
            onClick={handleZoomIn}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-teal-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-teal-400"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-teal-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-teal-400"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetView}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-teal-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-teal-400"
            aria-label="Reset view"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Count indicator */}
        <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          {filteredNodes.length} / {graphData.nodes.length} ciphers
        </div>
      </div>

      {/* ---- Category Filter Tabs ---- */}
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter by category">
        {categories.map((cat) => (
          <button
            key={cat.key}
            role="tab"
            aria-selected={selectedCategory === cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              selectedCategory === cat.key
                ? 'bg-teal-500 text-black shadow-md shadow-teal-500/20'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ---- Graph Container ---- */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
        style={{ height: 600, cursor: isPanning ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width={containerSize.width}
          height={containerSize.height}
          className="graph-bg h-full w-full"
          onWheel={handleWheel}
          onClick={(e) => {
            if (e.target === svgRef.current || (e.target as SVGElement).classList.contains('graph-bg')) {
              handleBackgroundClick();
            }
          }}
          role="img"
          aria-label="Cipher relationship graph showing cryptographic algorithm evolution and dependencies"
        >
          {/* Transform group for pan / zoom */}
          <g
            transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.scale})`}
          >
            {/* Grid pattern (simplified) */}
            <defs>
              <pattern
                id="grid-pattern"
                width={30}
                height={30}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 30 0 L 0 0 0 30"
                  fill="none"
                  stroke="currentColor"
                  className="text-zinc-200 dark:text-zinc-800"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect
              className="graph-bg"
              width={containerSize.width}
              height={containerSize.height}
              fill="url(#grid-pattern)"
            />

            {/* ---- Edges ---- */}
            {visibleEdges.map((edge, idx) => {
              const sourcePos = positions.get(edge.source);
              const targetPos = positions.get(edge.target);
              if (!sourcePos || !targetPos) return null;

              const highlighted = isEdgeHighlighted(edge);
              const edgeColor = EDGE_COLORS[edge.type] || '#94a3b8';

              // Compute arrow
              const dx = targetPos.x - sourcePos.x;
              const dy = targetPos.y - sourcePos.y;
              const angle = Math.atan2(dy, dx);
              const nodeRadius = 22;
              const arrowLen = 10;

              // Start/end points adjusted for node radius
              const sx = sourcePos.x + Math.cos(angle) * nodeRadius;
              const sy = sourcePos.y + Math.sin(angle) * nodeRadius;
              const ex = targetPos.x - Math.cos(angle) * nodeRadius;
              const ey = targetPos.y - Math.sin(angle) * nodeRadius;

              // Arrowhead
              const ax1 = ex - arrowLen * Math.cos(angle - 0.4);
              const ay1 = ey - arrowLen * Math.sin(angle - 0.4);
              const ax2 = ex - arrowLen * Math.cos(angle + 0.4);
              const ay2 = ey - arrowLen * Math.sin(angle + 0.4);

              // Midpoint for edge label
              const mx = (sx + ex) / 2;
              const my = (sy + ey) / 2;
              const labelAngle = angle > Math.PI / 2 || angle < -Math.PI / 2 ? angle + Math.PI : angle;

              return (
                <g key={`edge-${idx}`} className="pointer-events-none">
                  {/* Edge line */}
                  <motion.line
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: highlighted ? 1 : 0.15,
                      strokeWidth: highlighted ? 2 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    x1={sx}
                    y1={sy}
                    x2={ex}
                    y2={ey}
                    stroke={edgeColor}
                    strokeWidth={highlighted ? 2 : 1}
                    strokeDasharray={
                      edge.type === 'influenced_by' || edge.type === 'competes_with'
                        ? '5,4'
                        : undefined
                    }
                  />
                  {/* Arrowhead */}
                  <motion.polygon
                    initial={{ opacity: 0 }}
                    animate={{ opacity: highlighted ? 1 : 0.15 }}
                    transition={{ duration: 0.3 }}
                    points={`${ex},${ey} ${ax1},${ay1} ${ax2},${ay2}`}
                    fill={edgeColor}
                  />
                  {/* Edge label (shown when highlighted) */}
                  {highlighted && focusedNodeId && (
                    <text
                      x={mx}
                      y={my - 8}
                      textAnchor="middle"
                      transform={`rotate(${(labelAngle * 180) / Math.PI}, ${mx}, ${my})`}
                      className="fill-zinc-500 text-[8px] dark:fill-zinc-400"
                      style={{ fontSize: '8px', fontFamily: 'monospace' }}
                    >
                      {edge.label.length > 25
                        ? edge.label.substring(0, 24) + '…'
                        : edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* ---- Nodes ---- */}
            {filteredNodes.map((node) => {
              const pos = positions.get(node.id);
              if (!pos) return null;

              const colors = CATEGORY_COLORS[node.category];
              const highlighted = isNodeHighlighted(node.id);
              const isFocused = focusedNodeId === node.id;
              const radius = isFocused ? 28 : 22;

              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseEnter={(e) => handleNodeHover(node, e)}
                  onMouseMove={(e) => setTooltipPos({ x: e.clientX + 12, y: e.clientY - 10 })}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node.id);
                  }}
                  role="button"
                  aria-label={`${node.name} — ${node.category} — ${node.status}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNodeClick(node.id);
                    }
                  }}
                >
                  {/* Glow for focused node */}
                  {isFocused && (
                    <motion.circle
                      initial={{ r: radius + 6, opacity: 0.5 }}
                      animate={{ r: radius + 10, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                      fill="none"
                      stroke={colors.fill}
                      strokeWidth={2}
                    />
                  )}

                  {/* Node circle */}
                  <motion.circle
                    initial={{ r: 0, opacity: 0 }}
                    animate={{
                      r: radius,
                      opacity: highlighted ? 1 : 0.3,
                      fill: highlighted ? colors.fill : colors.fill + '40',
                      stroke: isFocused ? colors.stroke : colors.stroke + '80',
                    }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
                    strokeWidth={isFocused ? 3 : 2}
                  />

                  {/* Status indicator ring */}
                  <circle
                    r={radius + 4}
                    fill="none"
                    stroke={STATUS_COLORS[node.status] || '#6b7280'}
                    strokeWidth={2}
                    opacity={highlighted ? 0.6 : 0.2}
                  />

                  {/* Icon (first letter) */}
                  <motion.text
                    initial={{ opacity: 0 }}
                    animate={{ opacity: highlighted ? 1 : 0.4 }}
                    transition={{ duration: 0.3 }}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-bold"
                    style={{
                      fontSize: radius > 24 ? '11px' : '9px',
                      fill: colors.text,
                      fontFamily: 'monospace',
                      pointerEvents: 'none',
                    }}
                  >
                    {node.name.charAt(0)}
                  </motion.text>

                  {/* Node label */}
                  <motion.text
                    initial={{ opacity: 0 }}
                    animate={{ opacity: highlighted ? 1 : 0.5 }}
                    transition={{ duration: 0.3 }}
                    x={0}
                    y={radius + 14}
                    textAnchor="middle"
                    className="pointer-events-none"
                    style={{
                      fontSize: '9px',
                      fill: highlighted
                        ? 'currentColor'
                        : 'var(--tw-zinc-400, #a1a1aa)',
                      fontFamily: 'monospace',
                      fontWeight: highlighted ? '700' : '500',
                    }}
                  >
                    {node.name.length > 14
                      ? node.name.substring(0, 13) + '…'
                      : node.name}
                  </motion.text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* ---- Hover Tooltip ---- */}
        <AnimatePresence>
          {hoveredNode && (
            <NodeTooltip
              node={hoveredNode}
              style={{ left: tooltipPos.x, top: tooltipPos.y, position: 'fixed' }}
            />
          )}
        </AnimatePresence>

        {/* ---- Legend (bottom-right overlay) ---- */}
        <div className="absolute bottom-3 right-3">
          <div className="rounded-xl border border-zinc-200 bg-white/90 p-3 shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/90">
            <button
              onClick={() => setLegendCollapsed(!legendCollapsed)}
              className="flex w-full items-center justify-between gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400"
              aria-expanded={!legendCollapsed}
            >
              <span>Legend</span>
              {legendCollapsed ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </button>

            {!legendCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-2"
              >
                {/* Category colours */}
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Categories</p>
                  {(Object.keys(CATEGORY_COLORS) as CipherNode['category'][]).map((cat) => (
                    <div key={cat} className="flex items-center gap-2 text-[10px] text-zinc-600 dark:text-zinc-400">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat].fill }}
                      />
                      <span className="capitalize">{cat}</span>
                    </div>
                  ))}
                </div>

                {/* Edge types */}
                <div className="space-y-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Relationships</p>
                  {edgeLegendItems.map((item) => (
                    <div key={item.type} className="flex items-center gap-2 text-[10px] text-zinc-600 dark:text-zinc-400">
                      <span
                        className="inline-block h-0.5 w-4"
                        style={{
                          backgroundColor: EDGE_COLORS[item.type],
                          borderTopStyle:
                            item.type === 'influenced_by' || item.type === 'competes_with'
                              ? 'dashed'
                              : 'solid',
                        }}
                      />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ---- No results overlay ---- */}
        {filteredNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                No ciphers match your search.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-bold text-teal-500 hover:underline"
              >
                Clear search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---- Focus details panel ---- */}
      <AnimatePresence>
        {focusedNodeId && (() => {
          const node = getCipherById(graphData.nodes, focusedNodeId);
          if (!node) return null;
          const relatedEdges = getRelatedEdges(graphData.edges, focusedNodeId);
          const neighbourIds = getNeighbourIds(graphData.edges, focusedNodeId);
          const neighbours = neighbourIds
            .map((id) => getCipherById(graphData.nodes, id))
            .filter(Boolean) as CipherNode[];

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: CATEGORY_COLORS[node.category].fill }}
                    >
                      {node.category}
                    </span>
                    <StatusBadge status={node.status} />
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {node.year < 0 ? `${Math.abs(node.year)} BC` : `c. ${node.year}`}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{node.name}</h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                    {node.description}
                  </p>
                </div>
                <button
                  onClick={() => setFocusedNodeId(null)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                  aria-label="Close focus"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Relationships list */}
              {relatedEdges.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Relationships ({relatedEdges.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {relatedEdges.map((edge, idx) => {
                      const isSource = edge.source === focusedNodeId;
                      const otherId = isSource ? edge.target : edge.source;
                      const otherNode = getCipherById(graphData.nodes, otherId);
                      if (!otherNode) return null;

                      const edgeColor = EDGE_COLORS[edge.type] || '#94a3b8';

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-800/50"
                        >
                          <span
                            className="inline-block h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: edgeColor }}
                          />
                          <span className="text-xs text-zinc-700 dark:text-zinc-300">
                            <span className="font-semibold">{otherNode.name}</span>
                            <span className="text-zinc-400 mx-1">—</span>
                            <span className="italic text-zinc-500">
                              {isSource ? `evolves into / ` : ''}
                              {edge.label}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

