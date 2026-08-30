/**
 * Trie.js
 *
 * Trie (Prefix Tree) logic with step recording for word insertions and lookups.
 */

import {
  START,
  VISIT_NODE,
  INSERT_NODE,
  DONE,
  STEP_LABEL,
  FOUND,
  NOT_FOUND,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

let nodeSequence = 3000

class TrieNode {
  constructor(char = '') {
    this.id = nodeSequence++
    this.char = char
    this.children = {} // char -> TrieNode
    this.isEndOfWord = false
  }
}

/** Recursively serialize Trie nodes to plain object structures */
function serializeTrieTree(node) {
  if (!node) return null

  const childrenKeys = Object.keys(node.children)
  const childrenCloned = childrenKeys.map((k) => serializeTrieTree(node.children[k]))

  return {
    id: node.id,
    key: node.char || 'root',
    keys: [node.char ? `${node.char}${node.isEndOfWord ? ' (end)' : ''}` : 'root'],
    isLeaf: childrenKeys.length === 0,
    children: childrenCloned,
  }
}

export default class Trie {
  constructor() {
    this.root = new TrieNode()
  }

  _createRecorder() {
    return new FrameRecorder({
      initialState: { root: null, targetWord: '', operation: '' },
      reduce: (state, event) => {
        if (event.type === START) {
          state.targetWord = event.data.word
          state.operation = event.data.operation
        }
        state.root = event.data.rootClone
        return state
      },
      getDescription: (event) => {
        const d = event.data
        switch (event.type) {
          case START:
            return `Starting Trie ${d.operation} for word "${d.word}".`
          case VISIT_NODE:
            return `Inspecting node for character '${d.char}'.`
          case INSERT_NODE:
            return `Creating new node for character '${d.char}'.`
          case STEP_LABEL:
            return d.label
          case FOUND:
            return `Word "${d.word}" found.`
          case NOT_FOUND:
            return `Character path broken. Word or prefix does not exist.`
          case DONE:
            return `Trie operation complete.`
          default:
            return event.type
        }
      },
      getExplanation: (event) => {
        const d = event.data
        switch (event.type) {
          case START:
            return `We split the word into characters and descend from the root.`
          case VISIT_NODE:
            return `Character '${d.char}' exists. We follow the connection down.`
          case INSERT_NODE:
            return `Character '${d.char}' does not exist at this level. We insert a new node.`
          case STEP_LABEL:
            return d.detail || ''
          case FOUND:
            return `Successfully matched all characters and end-of-word marker.`
          case NOT_FOUND:
            return `Character does not exist at this level of prefix tree.`
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

  insert(word) {
    const recorder = this._createRecorder()
    recorder.record({
      type: START,
      data: { word, operation: 'Insertion', rootClone: serializeTrieTree(this.root), codeLineIndex: 0 },
    })

    let current = this.root
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      const char = word[charIndex]

      recorder.record({
        type: STEP_LABEL,
        data: {
          label: `Processing character '${char}' at index ${charIndex}.`,
          detail: `Inspecting if child node exists under parent character '${current.char || 'root'}'.`,
          activeNodeId: current.id,
          rootClone: serializeTrieTree(this.root),
          codeLineIndex: 2,
        },
      })

      if (!current.children[char]) {
        const newNode = new TrieNode(char)
        current.children[char] = newNode

        recorder.record({
          type: INSERT_NODE,
          data: {
            char,
            activeNodeId: newNode.id,
            rootClone: serializeTrieTree(this.root),
            codeLineIndex: 4,
          },
        })
      } else {
        recorder.record({
          type: VISIT_NODE,
          data: {
            char,
            activeNodeId: current.children[char].id,
            rootClone: serializeTrieTree(this.root),
            codeLineIndex: 3,
          },
        })
      }

      current = current.children[char]
    }

    current.isEndOfWord = true
    recorder.record({
      type: STEP_LABEL,
      data: {
        label: `Marked node '${current.char}' as end of word.`,
        detail: `The word "${word}" is now fully indexed.`,
        activeNodeId: current.id,
        rootClone: serializeTrieTree(this.root),
        codeLineIndex: 8,
      },
    })

    recorder.record({
      type: DONE,
      data: {
        rootClone: serializeTrieTree(this.root),
        codeLineIndex: 9,
      },
    })

    return recorder.getFrames()
  }

  search(word) {
    const recorder = this._createRecorder()
    recorder.record({
      type: START,
      data: { word, operation: 'Search', rootClone: serializeTrieTree(this.root), codeLineIndex: 0 },
    })

    let current = this.root
    let found = true

    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      const char = word[charIndex]

      recorder.record({
        type: COMPARE,
        data: {
          char,
          activeNodeId: current.id,
          rootClone: serializeTrieTree(this.root),
          codeLineIndex: 2,
        },
      })

      if (!current.children[char]) {
        found = false
        recorder.record({
          type: NOT_FOUND,
          data: {
            word,
            char,
            rootClone: serializeTrieTree(this.root),
            codeLineIndex: 3,
          },
        })
        break
      }

      current = current.children[char]

      recorder.record({
        type: VISIT_NODE,
        data: {
          char,
          activeNodeId: current.id,
          rootClone: serializeTrieTree(this.root),
          codeLineIndex: 4,
        },
      })
    }

    if (found) {
      if (current.isEndOfWord) {
        recorder.record({
          type: FOUND,
          data: {
            word,
            activeNodeId: current.id,
            rootClone: serializeTrieTree(this.root),
            codeLineIndex: 6,
          },
        })
      } else {
        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Prefix matches but end-of-word indicator not set.`,
            detail: `The prefix exists, but word "${word}" does not exist in the dictionary.`,
            activeNodeId: current.id,
            rootClone: serializeTrieTree(this.root),
            codeLineIndex: 6,
          },
        })
      }
    }

    recorder.record({
      type: DONE,
      data: {
        rootClone: serializeTrieTree(this.root),
        codeLineIndex: 7,
      },
    })

    return recorder.getFrames()
  }
}
