/**
 * linkedList.js
 * LinkedList operations with frame recording.
 */

import {
  START,
  VISIT_NODE,
  INSERT_NODE,
  DONE,
  STEP_LABEL,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

let nodeSequence = 4000

function serializeListTree(nodesList) {
  if (nodesList.length === 0) return null
  const [first, ...rest] = nodesList
  const child = serializeListTree(rest)
  return {
    id: first.id,
    key: first.val,
    keys: [`${first.val}`],
    isLeaf: !child,
    children: child ? [child] : [],
  }
}

export default class LinkedList {
  constructor() {
    this.nodes = [] // array of { id, val }
  }

  _createRecorder() {
    return new FrameRecorder({
      initialState: { root: null, list: [] },
      reduce: (state, event) => {
        state.list = event.data.listClone || []
        state.root = serializeListTree(state.list)
        return state
      },
      getDescription: (event) => {
        const d = event.data
        switch (event.type) {
          case START: return `Starting LinkedList ${d.operation}.`
          case VISIT_NODE: return `Traversing list node (val: ${d.val}).`
          case INSERT_NODE: return `Created new node (val: ${d.val}).`
          case STEP_LABEL: return d.label
          case DONE: return 'LinkedList operation complete.'
          default: return event.type
        }
      },
      getHighlightedNodes: (event) => {
        return event.data?.activeNodeId ? [event.data.activeNodeId] : []
      },
      getCodeLineIndex: (event) => event.data?.codeLineIndex ?? -1,
    })
  }

  insert(val) {
    const recorder = this._createRecorder()
    const newNode = { id: nodeSequence++, val }

    recorder.record({
      type: START,
      data: { operation: `insert of ${val}`, listClone: [...this.nodes], codeLineIndex: 0 },
    })

    recorder.record({
      type: INSERT_NODE,
      data: { val, activeNodeId: newNode.id, listClone: [...this.nodes], codeLineIndex: 1 },
    })

    // Insert at tail
    const nextList = [...this.nodes, newNode]

    recorder.record({
      type: STEP_LABEL,
      data: {
        label: `Linking node ${newNode.val} at the end of the list.`,
        activeNodeId: newNode.id,
        listClone: nextList,
        codeLineIndex: 2,
      },
    })

    this.nodes = nextList

    recorder.record({
      type: DONE,
      data: { listClone: [...this.nodes], codeLineIndex: 4 },
    })

    return recorder.getFrames()
  }

  deleteVal(val) {
    const recorder = this._createRecorder()
    recorder.record({
      type: START,
      data: { operation: `delete of ${val}`, listClone: [...this.nodes], codeLineIndex: 0 },
    })

    let activeNodeId = null
    const nextList = []
    let found = false

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i]
      activeNodeId = node.id

      if (node.val === val && !found) {
        found = true
        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Found node containing value ${val}. Removing connection.`,
            activeNodeId,
            listClone: [...this.nodes],
            codeLineIndex: 6,
          },
        })
      } else {
        nextList.push(node)
        recorder.record({
          type: VISIT_NODE,
          data: {
            val: node.val,
            activeNodeId,
            listClone: [...this.nodes],
            codeLineIndex: 2,
          },
        })
      }
    }

    this.nodes = nextList

    recorder.record({
      type: DONE,
      data: { listClone: [...this.nodes], codeLineIndex: 8 },
    })

    return recorder.getFrames()
  }
}
