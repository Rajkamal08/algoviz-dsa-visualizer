/**
 * AVL.js
 *
 * Height-balanced AVL search tree with rotation events recording.
 */

import {
  START,
  VISIT_NODE,
  COMPARE,
  INSERT_NODE,
  ROTATE,
  DONE,
  STEP_LABEL,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

let nodeSequence = 2000

class AVLNode {
  constructor(key) {
    this.id = nodeSequence++
    this.key = key
    this.left = null
    this.right = null
    this.height = 1
  }
}

function getHeight(node) {
  return node ? node.height : 0
}

function getBalance(node) {
  return node ? getHeight(node.left) - getHeight(node.right) : 0
}

/** Recursively serialize AVL node structure for playback tracking and balance factors */
function cloneTree(node) {
  if (!node) return null
  const leftCloned = cloneTree(node.left)
  const rightCloned = cloneTree(node.right)
  const children = []
  if (leftCloned) children.push(leftCloned)
  if (rightCloned) children.push(rightCloned)

  const bf = getHeight(node.left) - getHeight(node.right)

  return {
    id: node.id,
    key: node.key,
    keys: [`${node.key} (bf: ${bf})`], // Show key and balance factor!
    isLeaf: !node.left && !node.right,
    children: children,
    left: leftCloned,
    right: rightCloned,
  }
}

export default class AVL {
  constructor() {
    this.root = null
  }

  _createRecorder() {
    return new FrameRecorder({
      initialState: { root: null, targetKey: null, operation: '' },
      reduce: (state, event) => {
        if (event.type === START) {
          state.targetKey = event.data.key
          state.operation = event.data.operation
        }
        state.root = event.data.rootClone
        return state
      },
      getDescription: (event) => {
        const d = event.data
        switch (event.type) {
          case START:
            return `Starting AVL insertion of key ${d.key}.`
          case VISIT_NODE:
            return `Checking node ${d.nodeKey}.`
          case COMPARE:
            return `Comparing search key ${d.key} with node ${d.nodeKey}.`
          case INSERT_NODE:
            return `Inserting key ${d.key} as a leaf node.`
          case ROTATE:
            return `Performing ${d.rotationType} rotation at node ${d.nodeKey}.`
          case STEP_LABEL:
            return d.label
          case DONE:
            return `AVL insertion complete.`
          default:
            return event.type
        }
      },
      getExplanation: (event) => {
        const d = event.data
        switch (event.type) {
          case START:
            return `We begin insertion search from the root node.`
          case VISIT_NODE:
            return `Inspecting node values.`
          case COMPARE:
            return `Key ${d.key} is compared with ${d.nodeKey} to decide branch path.`
          case INSERT_NODE:
            return `Attached new node. Height updates will bubble up to rebalance if required.`
          case ROTATE:
            return `Rotation performed to correct subtree imbalance. Subtree balance factor is restored to [-1, 0, 1].`
          case STEP_LABEL:
            return d.detail || ''
          case DONE:
            return `Balance factors verified.`
          default:
            return ''
        }
      },
      getHighlightedNodes: (event) => {
        return event.data?.activeNodeId ? [event.data.activeNodeId] : []
      },
      getCodeLineIndex: (event) => {
        return event.data?.codeLineIndex ?? -1
      },
    })
  }

  insert(key) {
    const recorder = this._createRecorder()
    recorder.record({
      type: START,
      data: { key, operation: 'Insertion', rootClone: cloneTree(this.root), codeLineIndex: 0 },
    })

    const rightRotate = (y) => {
      const x = y.left
      const T2 = x.right

      x.right = y
      y.left = T2

      y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1
      x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1

      return x
    }

    const leftRotate = (x) => {
      const y = x.right
      const T2 = y.left

      y.left = x
      x.right = T2

      x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1
      y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1

      return y
    }

    const insertHelper = (node, k) => {
      if (!node) {
        const newNode = new AVLNode(k)
        recorder.record({
          type: INSERT_NODE,
          data: {
            key: k,
            activeNodeId: newNode.id,
            rootClone: cloneTree(newNode),
            codeLineIndex: 1,
          },
        })
        return newNode
      }

      recorder.record({
        type: VISIT_NODE,
        data: {
          nodeKey: node.key,
          activeNodeId: node.id,
          rootClone: cloneTree(this.root),
          codeLineIndex: 0,
        },
      })

      recorder.record({
        type: COMPARE,
        data: {
          key: k,
          nodeKey: node.key,
          a: k,
          b: node.key,
          activeNodeId: node.id,
          rootClone: cloneTree(this.root),
          codeLineIndex: 2,
        },
      })

      if (k < node.key) {
        node.left = insertHelper(node.left, k)
      } else if (k > node.key) {
        node.right = insertHelper(node.right, k)
      } else {
        return node // Duplicate keys not supported
      }

      // Height updates and balance checks bubble up
      node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1
      const balance = getBalance(node)

      recorder.record({
        type: STEP_LABEL,
        data: {
          label: `Checking balance factor of node ${node.key}.`,
          detail: `Node height is ${node.height}, balance factor is ${balance}.`,
          activeNodeId: node.id,
          rootClone: cloneTree(this.root),
          codeLineIndex: 5,
        },
      })

      // LL Case (Left Left) - Single Right Rotation
      if (balance > 1 && k < node.left.key) {
        recorder.record({
          type: ROTATE,
          data: {
            nodeKey: node.key,
            rotationType: 'Right (LL)',
            activeNodeId: node.id,
            rootClone: cloneTree(this.root),
            codeLineIndex: 7,
          },
        })
        return rightRotate(node)
      }

      // RR Case (Right Right) - Single Left Rotation
      if (balance < -1 && k > node.right.key) {
        recorder.record({
          type: ROTATE,
          data: {
            nodeKey: node.key,
            rotationType: 'Left (RR)',
            activeNodeId: node.id,
            rootClone: cloneTree(this.root),
            codeLineIndex: 8,
          },
        })
        return leftRotate(node)
      }

      // LR Case (Left Right) - Left Rotation then Right Rotation
      if (balance > 1 && k > node.left.key) {
        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Double rotation needed (LR) at node ${node.key}.`,
            detail: `Performing Left Rotation first on left child ${node.left.key}.`,
            activeNodeId: node.left.id,
            rootClone: cloneTree(this.root),
            codeLineIndex: 9,
          },
        })
        node.left = leftRotate(node.left)
        recorder.record({
          type: ROTATE,
          data: {
            nodeKey: node.key,
            rotationType: 'Right (LR)',
            activeNodeId: node.id,
            rootClone: cloneTree(this.root),
            codeLineIndex: 11,
          },
        })
        return rightRotate(node)
      }

      // RL Case (Right Left) - Right Rotation then Left Rotation
      if (balance < -1 && k < node.right.key) {
        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Double rotation needed (RL) at node ${node.key}.`,
            detail: `Performing Right Rotation first on right child ${node.right.key}.`,
            activeNodeId: node.right.id,
            rootClone: cloneTree(this.root),
            codeLineIndex: 13,
          },
        })
        node.right = rightRotate(node.right)
        recorder.record({
          type: ROTATE,
          data: {
            nodeKey: node.key,
            rotationType: 'Left (RL)',
            activeNodeId: node.id,
            rootClone: cloneTree(this.root),
            codeLineIndex: 15,
          },
        })
        return leftRotate(node)
      }

      return node
    }

    this.root = insertHelper(this.root, key)

    recorder.record({
      type: DONE,
      data: { rootClone: cloneTree(this.root), codeLineIndex: 18 },
    })

    return recorder.getFrames()
  }
}
