/**
 * dfs.js
 * Depth-First Search graph traversal with frame recording.
 */

import {
  START,
  PUSH,
  POP,
  VISIT_NODE,
  DONE,
  STEP_LABEL,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

export function runDFS(nodes, edges, startNodeId) {
  const recorder = new FrameRecorder({
    initialState: { nodes: [], edges: [], stack: [], visited: [], settled: [] },
    reduce: (state, event) => {
      state.nodes = nodes
      state.edges = edges
      if (event.type === START) {
        state.stack = [event.data.startNodeId]
      }
      if (event.type === PUSH) {
        state.stack = [...state.stack, event.data.node]
      }
      if (event.type === POP) {
        state.stack = state.stack.slice(0, -1)
      }
      if (event.type === VISIT_NODE) {
        if (!state.visited.includes(event.data.node)) {
          state.visited = [...state.visited, event.data.node]
        }
        if (!state.settled.includes(event.data.node)) {
          state.settled = [...state.settled, event.data.node]
        }
      }
      return state
    },
    getDescription: (event) => {
      const d = event.data
      switch (event.type) {
        case START: return `Initializing DFS from starting node "${d.startNodeId}".`
        case VISIT_NODE: return `Visiting node "${d.node}". Mark as visited.`
        case PUSH: return `Pushing neighbor "${d.node}" onto DFS stack.`
        case POP: return `Popping node "${d.node}" from stack.`
        case STEP_LABEL: return d.label
        case DONE: return 'DFS Traversal complete.'
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

  const stack = [startNodeId]
  const visited = new Set()

  while (stack.length > 0) {
    const curr = stack.pop()

    recorder.record({
      type: POP,
      data: { node: curr, codeLineIndex: 4 },
    })

    if (!visited.has(curr)) {
      visited.add(curr)
      recorder.record({
        type: VISIT_NODE,
        data: { node: curr, codeLineIndex: 6 },
      })

      const neighbors = adj[curr] || []
      // Push neighbors in reverse order to explore left-to-right (helps make rendering look cleaner)
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const neighbor = neighbors[i]

        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Inspecting neighbor "${neighbor}".`,
            node: neighbor,
            codeLineIndex: 7,
          },
        })

        if (!visited.has(neighbor)) {
          stack.push(neighbor)
          recorder.record({
            type: PUSH,
            data: { node: neighbor, codeLineIndex: 8 },
          })
        }
      }
    } else {
      recorder.record({
        type: STEP_LABEL,
        data: {
          label: `Node "${curr}" already visited. Skip.`,
          node: curr,
          codeLineIndex: 5,
        },
      })
    }
  }

  recorder.record({
    type: DONE,
    data: { codeLineIndex: 12 },
  })

  return recorder.getFrames()
}
