/**
 * bfs.js
 * Breadth-First Search graph traversal with frame recording.
 */

import {
  START,
  ENQUEUE,
  DEQUEUE,
  VISIT_NODE,
  MARK_VISITED,
  DONE,
  STEP_LABEL,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

export function runBFS(nodes, edges, startNodeId) {
  const recorder = new FrameRecorder({
    initialState: { nodes: [], edges: [], queue: [], visited: [], settled: [] },
    reduce: (state, event) => {
      state.nodes = nodes
      state.edges = edges
      if (event.type === START) {
        state.queue = [event.data.startNodeId]
        state.visited = [event.data.startNodeId]
      }
      if (event.type === ENQUEUE) {
        state.queue = [...state.queue, event.data.node]
        if (!state.visited.includes(event.data.node)) {
          state.visited = [...state.visited, event.data.node]
        }
      }
      if (event.type === DEQUEUE) {
        state.queue = state.queue.filter((x) => x !== event.data.node)
        if (!state.settled.includes(event.data.node)) {
          state.settled = [...state.settled, event.data.node]
        }
      }
      return state
    },
    getDescription: (event) => {
      const d = event.data
      switch (event.type) {
        case START: return `Initializing BFS from starting node "${d.startNodeId}".`
        case VISIT_NODE: return `Visiting node "${d.node}".`
        case ENQUEUE: return `Enqueue neighbor "${d.node}" and mark as visited.`
        case DEQUEUE: return `Dequeue node "${d.node}" to explore neighbors.`
        case STEP_LABEL: return d.label
        case DONE: return 'BFS Traversal complete.'
        default: return event.type
      }
    },
    getHighlightedNodes: (event) => {
      return event.data?.node ? [event.data.node] : []
    },
    getCodeLineIndex: (event) => event.data?.codeLineIndex ?? -1,
  })

  // Adjacency list construction
  const adj = {}
  nodes.forEach((n) => (adj[n.id] = []))
  edges.forEach((e) => {
    adj[e.from].push(e.to)
    if (!e.directed) {
      adj[e.to].push(e.from)
    }
  })

  recorder.record({
    type: START,
    data: { startNodeId, codeLineIndex: 0 },
  })

  const queue = [startNodeId]
  const visited = new Set([startNodeId])

  while (queue.length > 0) {
    const curr = queue.shift()

    recorder.record({
      type: DEQUEUE,
      data: { node: curr, codeLineIndex: 4 },
    })

    recorder.record({
      type: VISIT_NODE,
      data: { node: curr, codeLineIndex: 4 },
    })

    const neighbors = adj[curr] || []
    for (const neighbor of neighbors) {
      recorder.record({
        type: STEP_LABEL,
        data: {
          label: `Checking edge from "${curr}" to neighbor "${neighbor}".`,
          node: neighbor,
          codeLineIndex: 5,
        },
      })

      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)

        recorder.record({
          type: ENQUEUE,
          data: { node: neighbor, codeLineIndex: 8 },
        })
      } else {
        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Neighbor "${neighbor}" already visited. Skip.`,
            node: neighbor,
            codeLineIndex: 6,
          },
        })
      }
    }
  }

  recorder.record({
    type: DONE,
    data: { codeLineIndex: 12 },
  })

  return recorder.getFrames()
}
