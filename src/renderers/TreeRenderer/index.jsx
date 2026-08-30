/**
 * TreeRenderer/index.jsx
 *
 * Universal tree rendering engine. Supports drag-to-pan, scroll-to-zoom,
 * responsive centering, and customizable highlighting classes (visited, active, found).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { computeLayout, edgePath } from '../../logic/layout.js'

/**
 * Builds a fast lookup node mapping.
 */
function buildNodeMap(root) {
  const map = new Map()
  if (!root) return map
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()
    map.set(node.id, node)
    if (!node.isLeaf && node.children) {
      for (const child of node.children) queue.push(child)
    }
  }
  return map
}

/**
 * @param {{
 *   root: Object | null,
 *   highlighted?: number[],
 *   activeId?: number | null,
 *   foundId?: number | null,
 *   sortedIds?: number[]
 * }} props
 */
export default function TreeRenderer({
  root,
  highlighted = [],
  activeId = null,
  foundId = null,
  sortedIds = [],
}) {
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0 })
  const containerRef = useRef(null)

  const layout = useMemo(
    () => computeLayout(root, { xGap: 150, yGap: 120, unit: 42, padding: 36, height: 54 }),
    [root]
  )
  const nodeMap = useMemo(() => buildNodeMap(root), [root])

  // Center tree layout on load or root changes
  useEffect(() => {
    if (!containerRef.current || !root) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.width / 2 - (layout.bounds.minX + layout.bounds.maxX) / 2
    const topPadding = 48
    setPan({ x: centerX, y: topPadding - layout.bounds.minY })
    setZoom(1)
  }, [layout.bounds.maxX, layout.bounds.maxY, layout.bounds.minX, layout.bounds.minY, root])

  // Mouse pan/zoom events
  const onMouseDown = (e) => {
    dragRef.current.dragging = true
    dragRef.current.startX = e.clientX - pan.x
    dragRef.current.startY = e.clientY - pan.y
  }

  const onMouseMove = (e) => {
    if (!dragRef.current.dragging) return
    setPan({ x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY })
  }

  const onMouseUp = () => {
    dragRef.current.dragging = false
  }

  const onMouseLeave = () => {
    dragRef.current.dragging = false
  }

  const onWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.1 : -0.1
    setZoom((val) => Math.min(1.8, Math.max(0.45, +(val + delta).toFixed(2))))
  }

  if (!root) {
    return (
      <div className="tree-canvas-wrap" style={{ display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
        <div style={{ color: 'var(--text-muted)', margin: 'auto' }}>No tree structure loaded.</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="tree-canvas-wrap"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onWheel={onWheel}
    >
      {/* Zoom / Pan Toolbar */}
      <div className="canvas-toolbar">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setZoom((val) => Math.min(1.8, +(val + 0.1).toFixed(2)))}
        >
          ＋
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setZoom((val) => Math.max(0.45, +(val - 0.1).toFixed(2)))}
        >
          －
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setPan({ x: 40, y: 40 })}
        >
          Reset Pan
        </button>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-code)', marginLeft: 4 }}>
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Legend */}
      <div className="canvas-legend">
        <span><i className="legend-dot active"></i> Active</span>
        <span><i className="legend-dot visited"></i> Visited</span>
        {foundId !== null && <span><i className="legend-dot found"></i> Found</span>}
        {sortedIds.length > 0 && <span><i className="legend-dot sorted"></i> Sorted</span>}
        <span><i className="legend-dot idle"></i> Idle</span>
      </div>

      {/* SVG Connections Layer */}
      <svg className="tree-svg">
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {layout.edges.map((edge, idx) => (
            <path
              key={idx}
              d={edgePath(edge.from, edge.to, layout.positions)}
              stroke="var(--border-default)"
              fill="none"
              strokeWidth="2"
            />
          ))}
        </g>
      </svg>

      {/* HTML Nodes Layer */}
      <div
        className="tree-html-layer"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        {Object.entries(layout.positions).map(([idStr, pos]) => {
          const id = parseInt(idStr, 10)
          const isActive = activeId === id
          const isVisited = highlighted.includes(id)
          const isFound = foundId === id
          const isSorted = sortedIds.includes(id)

          const node = nodeMap.get(id)
          const keysStr = node ? node.keys.join(' | ') : ''

          let nodeClass = 'tree-node'
          if (isActive) nodeClass += ' active'
          else if (isFound) nodeClass += ' found'
          else if (isVisited) nodeClass += ' visited'
          else if (isSorted) nodeClass += ' sorted'

          return (
            <div
              key={id}
              className={nodeClass}
              style={{
                left: pos.x,
                top: pos.y,
                width: pos.w,
                minHeight: pos.h,
              }}
            >
              {node?.kind && <div className="tree-node-kind">{node.kind}</div>}
              <div className="tree-node-keys">{keysStr}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
