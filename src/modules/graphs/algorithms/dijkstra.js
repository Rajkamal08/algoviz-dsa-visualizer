/**
 * dijkstra.js
 * Dijkstra's shortest path algorithm with frame recording.
 */

import {
  START,
  VISIT_NODE,
  RELAX_EDGE,
  UPDATE_DIST,
  FINALIZE_NODE,
  DONE,
  STEP_LABEL,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

export function runDijkstra(nodes, edges, startNodeId) {
  const recorder = new FrameRecorder({
    initialState: { nodes: [], edges: [], pq: [], distances: {}, settled: [] },
    reduce: (state, event) => {
      state.nodes = nodes
      state.edges = edges
      if (event.type === START) {
        state.distances = {}
        nodes.forEach((n) => {
          state.distances[n.id] = n.id === startNodeId ? 0 : '∞'
        })
        state.pq = [[startNodeId, 0]]
      }
      if (event.type === UPDATE_DIST) {
        state.distances = { ...state.distances, [event.data.node]: event.data.dist }
        // Remove old entry and push new sorted entry
        const cleanedPQ = state.pq.filter((x) => x[0] !== event.data.node)
        state.pq = [...cleanedPQ, [event.data.node, event.data.dist]].sort((a, b) => a[1] - b[1])
      }
      if (event.type === FINALIZE_NODE) {
        state.pq = state.pq.filter((x) => x[0] !== event.data.node)
        if (!state.settled.includes(event.data.node)) {
          state.settled = [...state.settled, event.data.node]
        }
      }
      return state
    },
    getDescription: (event) => {
      const d = event.data
      switch (event.type) {
        case START: return `Initializing distances. Starting node "${d.startNodeId}" distance = 0.`
        case VISIT_NODE: return `Inspecting node "${d.node}" from Priority Queue with current distance = ${d.dist}.`
        case RELAX_EDGE: return `Checking connection from "${d.from}" to "${d.to}" (weight: ${d.weight}).`
        case UPDATE_DIST: return `Shortest path updated! "${d.node}" distance is now ${d.dist}.`
        case FINALIZE_NODE: return `Finalized shortest path to node "${d.node}".`
        case STEP_LABEL: return d.label
        case DONE: return 'Dijkstra search complete.'
        default: return event.type
      }
    },
    getHighlightedNodes: (event) => {
      const d = event.data
      const arr = []
      if (d?.node) arr.push(d.node)
      if (d?.from) arr.push(d.from)
      if (d?.to) arr.push(d.to)
      return arr
    },
    getCodeLineIndex: (event) => event.data?.codeLineIndex ?? -1,
  })

  // Adjacency edge construction
  const adj = {}
  nodes.forEach((n) => (adj[n.id] = []))
  edges.forEach((e) => {
    const w = parseFloat(e.weight) || 1
    adj[e.from].push({ to: e.to, weight: w })
    if (!e.directed) {
      adj[e.to].push({ to: e.from, weight: w })
    }
  })

  recorder.record({
    type: START,
    data: { startNodeId, codeLineIndex: 0 },
  })

  const distances = {}
  nodes.forEach((n) => (distances[n.id] = n.id === startNodeId ? 0 : Infinity))

  const pq = [[startNodeId, 0]] // priority queue entries: [nodeId, distance]

  while (pq.length > 0) {
    // Extract min distance node
    pq.sort((a, b) => a[1] - b[1])
    const [curr, currDist] = pq.shift()

    recorder.record({
      type: VISIT_NODE,
      data: { node: curr, dist: currDist, codeLineIndex: 6 },
    })

    if (currDist > distances[curr]) continue

    const neighbors = adj[curr] || []
    for (const { to, weight } of neighbors) {
      recorder.record({
        type: RELAX_EDGE,
        data: { from: curr, to, weight, codeLineIndex: 9 },
      })

      const newDist = currDist + weight
      if (newDist < distances[to]) {
        distances[to] = newDist
        pq.push([to, newDist])

        recorder.record({
          type: UPDATE_DIST,
          data: { node: to, dist: newDist, codeLineIndex: 10 },
        })
      } else {
        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Path via "${curr}" is longer than existing (${newDist} >= ${distances[to]}). Skip.`,
            from: curr,
            to,
            codeLineIndex: 9,
          },
        })
      }
    }

    recorder.record({
      type: FINALIZE_NODE,
      data: { node: curr, codeLineIndex: 6 },
    })
  }

  recorder.record({
    type: DONE,
    data: { codeLineIndex: 16 },
  })

  return recorder.getFrames()
}
