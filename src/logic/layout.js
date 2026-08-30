function nodeWidth(keysCount, unit, padding) {
  return keysCount * unit + padding
}

export function computeLayout(root, opts = {}) {
  const xGap = opts.xGap || 140
  const yGap = opts.yGap || 120
  const unit = opts.unit || 40
  const padding = opts.padding || 24
  const height = opts.height || 40
  if (!root) return { positions: {}, edges: [], size: { width: 0, height: 0 }, levels: 0, bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } }
  const leaves = []
  function collectLeaves(n) {
    if (n.isLeaf) {
      leaves.push(n)
      return
    }
    for (const c of n.children) collectLeaves(c)
  }
  collectLeaves(root)
  const leafIndex = new Map()
  for (let i = 0; i < leaves.length; i++) leafIndex.set(leaves[i].id, i)
  const positions = {}
  let maxDepth = 0
  function place(n, depth) {
    if (depth > maxDepth) maxDepth = depth
    if (n.isLeaf) {
      const idx = leafIndex.get(n.id)
      const x = idx * xGap
      const y = depth * yGap
      positions[n.id] = { x, y, w: nodeWidth(n.keys.length, unit, padding), h: height, depth }
      return x
    } else {
      const childXs = []
      for (const c of n.children) childXs.push(place(c, depth + 1))
      const x = childXs.reduce((a, b) => a + b, 0) / childXs.length
      const y = depth * yGap
      positions[n.id] = { x, y, w: nodeWidth(n.keys.length, unit, padding), h: height, depth }
      return x
    }
  }
  place(root, 0)
  const edges = []
  function connect(n) {
    if (!n.isLeaf) {
      for (const c of n.children) {
        edges.push({ from: n.id, to: c.id })
        connect(c)
      }
    }
  }
  connect(root)
  const width = (leaves.length - 1) * xGap + nodeWidth(leaves.length ? leaves[leaves.length - 1].keys.length : 1, unit, padding) + xGap
  const heightTotal = (maxDepth + 1) * yGap + height
  const xs = Object.values(positions).map((pos) => pos.x)
  const ys = Object.values(positions).map((pos) => pos.y)
  return {
    positions,
    edges,
    size: { width, height: heightTotal },
    levels: maxDepth + 1,
    bounds: {
      minX: Math.min(...xs, 0),
      maxX: Math.max(...xs, width),
      minY: Math.min(...ys, 0),
      maxY: Math.max(...ys, heightTotal)
    }
  }
}

export function edgePath(from, to, positions) {
  const pf = positions[from]
  const pt = positions[to]
  const x1 = pf.x + pf.w / 2
  const y1 = pf.y + pf.h
  const x2 = pt.x + pt.w / 2
  const y2 = pt.y
  const dy = Math.max(40, (y2 - y1) / 2)
  return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`
}
