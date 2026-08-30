import { useEffect, useMemo, useRef, useState } from 'react'
import { computeLayout, edgePath } from '../logic/layout.js'

export default function TreeCanvas({ root, highlighted = [], activeId = null }) {
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0 })
  const containerRef = useRef(null)
  const layout = useMemo(() => computeLayout(root, { xGap: 150, yGap: 120, unit: 42, padding: 36, height: 54 }), [root])
  const nodeMap = useMemo(() => buildNodeMap(root), [root])

  useEffect(() => {
    if (!containerRef.current || !root) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.width / 2 - (layout.bounds.minX + layout.bounds.maxX) / 2
    const topPadding = 48
    setPan({ x: centerX, y: topPadding - layout.bounds.minY })
    setZoom(1)
  }, [layout.bounds.maxX, layout.bounds.maxY, layout.bounds.minX, layout.bounds.minY, root])

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
    setZoom((value) => Math.min(1.8, Math.max(0.45, +(value + delta).toFixed(2))))
  }

  return (
    <div ref={containerRef} className="tree-canvas" onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave} onWheel={onWheel}>
      <div className="canvas-toolbar">
        <button type="button" onClick={() => setZoom((value) => Math.min(1.8, +(value + 0.1).toFixed(2)))}>Zoom In</button>
        <button type="button" onClick={() => setZoom((value) => Math.max(0.45, +(value - 0.1).toFixed(2)))}>Zoom Out</button>
        <button type="button" onClick={() => setPan({ x: 40, y: 40 })}>Reset Pan</button>
        <span className="canvas-zoom-label">{Math.round(zoom * 100)}%</span>
      </div>
      <div className="canvas-legend">
        <span><i className="legend-dot active"></i> Active</span>
        <span><i className="legend-dot visited"></i> Visited</span>
        <span><i className="legend-dot idle"></i> Idle</span>
      </div>
      <svg className="tree-svg">
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {layout.edges.map((e, i) => (
            <path key={i} d={edgePath(e.from, e.to, layout.positions)} stroke="#7aa2f7" fill="none" strokeWidth="2" />
          ))}
        </g>
      </svg>
      <div className="tree-html-layer" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
        {Object.entries(layout.positions).map(([idStr, pos]) => {
          const id = parseInt(idStr, 10)
          const isActive = activeId === id
          const isVisited = highlighted.includes(id)
          const node = nodeMap.get(id)
          return (
            <div
              key={id}
              className={`tree-node ${isActive ? 'active' : ''} ${isVisited ? 'visited' : ''}`}
              style={{ left: pos.x, top: pos.y, width: pos.w, minHeight: pos.h }}
            >
              <div className="tree-node-kind">{node?.isLeaf ? 'Leaf' : 'Internal'}</div>
              <div className="tree-node-keys">{node ? node.keys.join(' | ') : ''}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function buildNodeMap(root) {
  const map = new Map()
  if (!root) return map
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()
    map.set(node.id, node)
    if (!node.isLeaf) {
      for (const child of node.children) queue.push(child)
    }
  }
  return map
}
