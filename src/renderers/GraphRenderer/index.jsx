/**
 * GraphRenderer/index.jsx
 *
 * Visualizes networks, graph nodes, and connections.
 * Nodes can be dragged around, edges display weights and arrow markers,
 * and traversal states (visited, frontier, active, settled) are highlighted.
 */

import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * @param {{
 *   nodes: Array<{ id: string|number, label?: string, x?: number, y?: number }>,
 *   edges: Array<{ from: string|number, to: string|number, weight?: number|string, directed?: boolean }>,
 *   active?: string|number|Array<string|number>,
 *   visited?: Array<string|number>,
 *   frontier?: Array<string|number>,
 *   settled?: Array<string|number>
 * }} props
 */
export default function GraphRenderer({
  nodes = [],
  edges = [],
  active = [],
  visited = [],
  frontier = [],
  settled = [],
}) {
  const containerRef = useRef(null)
  const [positions, setPositions] = useState({})
  const [draggedNode, setDraggedNode] = useState(null)

  // Compute clean circular layout default positions if custom x,y are missing
  useEffect(() => {
    if (nodes.length === 0) return

    const container = containerRef.current
    const width = container ? container.clientWidth || 500 : 500
    const height = container ? container.clientHeight || 360 : 360

    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.35

    const nextPos = {}
    nodes.forEach((node, idx) => {
      // If node already has defined coordinates, use them
      if (node.x !== undefined && node.y !== undefined) {
        nextPos[node.id] = { x: node.x, y: node.y }
      } else {
        // Arrange in a circle
        const angle = (idx / nodes.length) * 2 * Math.PI - Math.PI / 2
        nextPos[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        }
      }
    })

    setPositions(nextPos)
  }, [nodes])

  // Dragging interaction logic
  const handleNodeMouseDown = (nodeId, e) => {
    e.stopPropagation()
    setDraggedNode(nodeId)
  }

  const handleMouseMove = (e) => {
    if (draggedNode === null || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setPositions((prev) => ({
      ...prev,
      [draggedNode]: { x, y },
    }))
  }

  const handleMouseUp = () => {
    setDraggedNode(null)
  }

  // Normalize active set
  const activeSet = useMemo(() => {
    if (Array.isArray(active)) return new Set(active)
    if (active !== undefined && active !== null) return new Set([active])
    return new Set()
  }, [active])

  const visitedSet = useMemo(() => new Set(visited), [visited])
  const frontierSet = useMemo(() => new Set(frontier), [frontier])
  const settledSet = useMemo(() => new Set(settled), [settled])

  if (nodes.length === 0) {
    return (
      <div ref={containerRef} className="tree-canvas-wrap" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-muted)', margin: 'auto' }}>No graph data loaded.</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="tree-canvas-wrap"
      style={{ overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Legend */}
      <div className="canvas-legend">
        <span><i className="legend-dot active"></i> Active</span>
        <span><i className="legend-dot visited"></i> Visited</span>
        <span><i className="legend-dot" style={{ background: '#38bdf8' }}></i> Frontier</span>
        <span><i className="legend-dot sorted"></i> Settled</span>
        <span><i className="legend-dot idle"></i> Unvisited</span>
      </div>

      <svg style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        {/* Definition for Arrow Marker */}
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="23" /* offset to touch node circle boundary */
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" />
          </marker>
        </defs>

        {/* Edges & Weight labels */}
        {edges.map((edge, idx) => {
          const fromPos = positions[edge.from]
          const toPos = positions[edge.to]
          if (!fromPos || !toPos) return null

          const midX = (fromPos.x + toPos.x) / 2
          const midY = (fromPos.y + toPos.y) / 2

          return (
            <g key={idx}>
              {/* Connection Line */}
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke="var(--border-default)"
                strokeWidth="2"
                markerEnd={edge.directed ? 'url(#arrow)' : undefined}
              />
              {/* Optional Connection Weight */}
              {edge.weight !== undefined && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-12"
                    y="-8"
                    width="24"
                    height="16"
                    rx="3"
                    fill="var(--bg-elevated)"
                    stroke="var(--border-subtle)"
                    strokeWidth="1"
                  />
                  <text
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                    fill="var(--text-code)"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {edge.weight}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {/* Nodes HTML Layer */}
      {nodes.map((node) => {
        const pos = positions[node.id]
        if (!pos) return null

        const isActive = activeSet.has(node.id)
        const isVisited = visitedSet.has(node.id)
        const isFrontier = frontierSet.has(node.id)
        const isSettled = settledSet.has(node.id)

        let nodeClass = 'graph-node'
        if (isActive) nodeClass += ' active'
        else if (isSettled) nodeClass += ' settled'
        else if (isVisited) nodeClass += ' visited'
        else if (isFrontier) nodeClass += ' frontier'

        return (
          <div
            key={node.id}
            className={nodeClass}
            style={{
              left: pos.x,
              top: pos.y,
            }}
            onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
          >
            {node.label || node.id}
          </div>
        )
      })}
    </div>
  )
}
