/**
 * BST.js
 *
 * Core Binary Search Tree logic with frame step recording.
 *
 * Emits events to FrameRecorder:
 *  - START
 *  - VISIT_NODE
 *  - COMPARE
 *  - INSERT_NODE
 *  - DELETE_NODE
 *  - FOUND
 *  - NOT_FOUND
 *  - DONE
 */

import {
  START,
  VISIT_NODE,
  COMPARE,
  INSERT_NODE,
  DELETE_NODE,
  FOUND,
  NOT_FOUND,
  DONE,
  STEP_LABEL,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

let nodeSequence = 1000 // Offset to prevent ID collisions with other structures

class BSTNode {
  constructor(key) {
    this.id = nodeSequence++
    this.key = key
    this.left = null
    this.right = null
  }

  get isLeaf() {
    return !this.left && !this.right
  }

  get children() {
    const arr = []
    if (this.left) arr.push(this.left)
    if (this.right) arr.push(this.right)
    return arr
  }

  get keys() {
    return [this.key]
  }
}

/** Recursively serialize tree nodes to plain objects so they survive FrameRecorder's deepCopy */
function cloneTree(node) {
  if (!node) return null
  const leftCloned = cloneTree(node.left)
  const rightCloned = cloneTree(node.right)
  const children = []
  if (leftCloned) children.push(leftCloned)
  if (rightCloned) children.push(rightCloned)

  return {
    id: node.id,
    key: node.key,
    keys: [node.key],
    isLeaf: !node.left && !node.right,
    children: children,
    left: leftCloned,
    right: rightCloned
  }
}

export default class BST {
  constructor() {
    this.root = null
  }

  /**
   * Universal helper to instantiate a FrameRecorder configured for BST operations.
   */
  _createRecorder() {
    return new FrameRecorder({
      initialState: { root: null, targetKey: null, operation: '' },
      reduce: (state, event) => {
        // Reducer keeps the tree root clone and tracks current target
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
            return `Starting BST ${d.operation} for key ${d.key}.`
          case VISIT_NODE:
            return `Navigated to node ${d.nodeKey}.`
          case COMPARE:
            return `Comparing search key ${d.key} with node ${d.nodeKey}.`
          case INSERT_NODE:
            return `Inserting new node with key ${d.key}.`
          case DELETE_NODE:
            return `Deleting node with key ${d.key}.`
          case FOUND:
            return `Key ${d.key} found.`
          case NOT_FOUND:
            return `Key ${d.key} not found.`
          case STEP_LABEL:
            return d.label
          case DONE:
            return `BST operation complete.`
          default:
            return event.type
        }
      },
      getExplanation: (event) => {
        const d = event.data
        switch (event.type) {
          case START:
            return `We begin the BST ${d.operation} from the root node.`
          case VISIT_NODE:
            return `The current node is inspected.`
          case COMPARE:
            if (d.key < d.nodeKey) {
              return `Since ${d.key} < ${d.nodeKey}, we must search the left subtree.`
            } else if (d.key > d.nodeKey) {
              return `Since ${d.key} > ${d.nodeKey}, we must search the right subtree.`
            }
            return `Key matches node value.`
          case INSERT_NODE:
            return `A new leaf node with key ${d.key} is created and attached.`
          case DELETE_NODE:
            return `Node containing ${d.key} is detached from the tree structure.`
          case FOUND:
            return `The search is successful.`
          case NOT_FOUND:
            return `We reached a null leaf pointer. The key does not exist in this tree.`
          case STEP_LABEL:
            return d.detail || ''
          case DONE:
            return `All updates complete.`
          default:
            return ''
        }
      },
      getHighlightedNodes: (event) => {
        // Return matching nodes to blink active state
        if (event.data?.activeNodeId) {
          return [event.data.activeNodeId]
        }
        return []
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

    const insertHelper = (node, k) => {
      if (!node) {
        const newNode = new BSTNode(k)
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
        // Duplicate key case - override/no-op
        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Key ${k} already exists.`,
            detail: `Duplicates are not inserted in this BST demo.`,
            activeNodeId: node.id,
            rootClone: cloneTree(this.root),
            codeLineIndex: 5,
          },
        })
      }

      return node
    }

    this.root = insertHelper(this.root, key)

    recorder.record({
      type: DONE,
      data: { rootClone: cloneTree(this.root), codeLineIndex: 7 },
    })

    return recorder.getFrames()
  }

  search(key) {
    const recorder = this._createRecorder()
    recorder.record({
      type: START,
      data: { key, operation: 'Search', rootClone: cloneTree(this.root), codeLineIndex: 0 },
    })

    let current = this.root
    let found = false

    while (current) {
      recorder.record({
        type: VISIT_NODE,
        data: {
          nodeKey: current.key,
          activeNodeId: current.id,
          rootClone: cloneTree(this.root),
          codeLineIndex: 1,
        },
      })

      recorder.record({
        type: COMPARE,
        data: {
          key: key,
          nodeKey: current.key,
          a: key,
          b: current.key,
          activeNodeId: current.id,
          rootClone: cloneTree(this.root),
          codeLineIndex: 1,
        },
      })

      if (key === current.key) {
        found = true
        recorder.record({
          type: FOUND,
          data: {
            key: key,
            activeNodeId: current.id,
            rootClone: cloneTree(this.root),
            codeLineIndex: 1,
          },
        })
        break
      }

      recorder.record({
        type: COMPARE,
        data: {
          key: key,
          nodeKey: current.key,
          a: key,
          b: current.key,
          activeNodeId: current.id,
          rootClone: cloneTree(this.root),
          codeLineIndex: 2,
        },
      })

      if (key < current.key) {
        current = current.left
      } else {
        current = current.right
      }
    }

    if (!found) {
      recorder.record({
        type: NOT_FOUND,
        data: { key: key, rootClone: cloneTree(this.root), codeLineIndex: 1 },
      })
    }

    recorder.record({
      type: DONE,
      data: { rootClone: cloneTree(this.root), codeLineIndex: 6 },
    })

    return recorder.getFrames()
  }

  deleteNode(key) {
    const recorder = this._createRecorder()
    recorder.record({
      type: START,
      data: { key, operation: 'Deletion', rootClone: cloneTree(this.root), codeLineIndex: 0 },
    })

    const findMin = (node) => {
      while (node.left) node = node.left
      return node
    }

    const deleteHelper = (node, k) => {
      if (!node) {
        recorder.record({
          type: NOT_FOUND,
          data: { key: k, rootClone: cloneTree(this.root), codeLineIndex: 1 },
        })
        return null
      }

      recorder.record({
        type: VISIT_NODE,
        data: {
          nodeKey: node.key,
          activeNodeId: node.id,
          rootClone: cloneTree(this.root),
          codeLineIndex: 2,
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
        node.left = deleteHelper(node.left, k)
      } else if (k > node.key) {
        node.right = deleteHelper(node.right, k)
      } else {
        // Key match found! Handles deletion cases.
        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Found node containing ${k}.`,
            detail: `Evaluating child count to determine removal strategy.`,
            activeNodeId: node.id,
            rootClone: cloneTree(this.root),
            codeLineIndex: 6,
          },
        })

        // Case 1: No left child
        if (!node.left) {
          recorder.record({
            type: DELETE_NODE,
            data: {
              key: k,
              activeNodeId: node.id,
              rootClone: cloneTree(node.right),
              codeLineIndex: 7,
            },
          })
          return node.right
        }

        // Case 2: No right child
        if (!node.right) {
          recorder.record({
            type: DELETE_NODE,
            data: {
              key: k,
              activeNodeId: node.id,
              rootClone: cloneTree(node.left),
              codeLineIndex: 8,
            },
          })
          return node.left
        }

        // Case 3: Two children nodes. Find successor (minimum in right subtree)
        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Node has two children. Finding minimum in right subtree.`,
            detail: `We search for the in-order successor to replace this node.`,
            activeNodeId: node.id,
            rootClone: cloneTree(this.root),
            codeLineIndex: 9,
          },
        })

        const successor = findMin(node.right)
        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Successor found: key ${successor.key}.`,
            detail: `Copying successor key ${successor.key} to target node.`,
            activeNodeId: successor.id,
            rootClone: cloneTree(this.root),
            codeLineIndex: 10,
          },
        })

        node.key = successor.key

        // Delete the successor from right subtree
        node.right = deleteHelper(node.right, successor.key)
      }

      return node
    }

    this.root = deleteHelper(this.root, key)

    recorder.record({
      type: DONE,
      data: { rootClone: cloneTree(this.root), codeLineIndex: 13 },
    })

    return recorder.getFrames()
  }
}
