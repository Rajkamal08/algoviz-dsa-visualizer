/**
 * Heap.js
 *
 * Max-Heap array-backed binary tree with bubble-up and bubble-down heapify tracking.
 */

import {
  START,
  COMPARE,
  SWAP,
  DONE,
  STEP_LABEL,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

/** Helper to serialize the heap array as a tree node structure */
function serializeHeapTree(arr, index = 0) {
  if (index >= arr.length) return null

  const leftChild = serializeHeapTree(arr, 2 * index + 1)
  const rightChild = serializeHeapTree(arr, 2 * index + 2)
  const children = []
  if (leftChild) children.push(leftChild)
  if (rightChild) children.push(rightChild)

  return {
    id: index, // Match node ID to array index!
    key: arr[index],
    keys: [`[${index}] val: ${arr[index]}`],
    isLeaf: 2 * index + 1 >= arr.length,
    children: children,
    left: leftChild,
    right: rightChild,
  }
}

export default class Heap {
  constructor() {
    this.array = []
  }

  _createRecorder() {
    return new FrameRecorder({
      initialState: { array: [], root: null },
      reduce: (state, event) => {
        state.array = event.data.arrayClone || []
        state.root = serializeHeapTree(state.array)
        return state
      },
      getDescription: (event) => {
        const d = event.data
        switch (event.type) {
          case START:
            return `Starting Heap ${d.operation}.`
          case COMPARE:
            return `Comparing parent value ${d.parentVal} with child value ${d.childVal}.`
          case SWAP:
            return `Swapping index ${d.i} (val: ${d.valI}) with index ${d.j} (val: ${d.valJ}).`
          case STEP_LABEL:
            return d.label
          case DONE:
            return `Heap operation complete.`
          default:
            return event.type
        }
      },
      getExplanation: (event) => {
        const d = event.data
        switch (event.type) {
          case START:
            return `We perform the initial array update before heapifying.`
          case COMPARE:
            return `Max-Heap property requires parent >= child. Comparing index ${d.parentIdx} with index ${d.childIdx}.`
          case SWAP:
            return `Indices out of order. Swapping values to satisfy Max-Heap property.`
          case STEP_LABEL:
            return d.detail || ''
          case DONE:
            return `Heap balance property holds successfully.`
          default:
            return ''
        }
      },
      getHighlightedNodes: (event) => {
        // Return indices/IDs to highlight
        const d = event.data
        const arr = []
        if (d?.i !== undefined) arr.push(d.i)
        if (d?.j !== undefined) arr.push(d.j)
        if (d?.activeNodeId !== undefined) arr.push(d.activeNodeId)
        return arr
      },
      getCodeLineIndex: (event) => {
        return event.data?.codeLineIndex ?? -1
      },
    })
  }

  insert(val) {
    const recorder = this._createRecorder()
    this.array.push(val)

    recorder.record({
      type: START,
      data: {
        operation: `Insertion of ${val}`,
        arrayClone: [...this.array],
        activeNodeId: this.array.length - 1,
        codeLineIndex: 1,
      },
    })

    const heapifyUp = (index) => {
      if (index === 0) return

      const parentIdx = Math.floor((index - 1) / 2)
      const parentVal = this.array[parentIdx]
      const childVal = this.array[index]

      recorder.record({
        type: COMPARE,
        data: {
          parentIdx,
          parentVal,
          childIdx: index,
          childVal,
          a: parentVal,
          b: childVal,
          i: parentIdx,
          j: index,
          arrayClone: [...this.array],
          codeLineIndex: 5,
        },
      })

      if (childVal > parentVal) {
        // Swap values
        this.array[parentIdx] = childVal
        this.array[index] = parentVal

        recorder.record({
          type: SWAP,
          data: {
            i: parentIdx,
            j: index,
            valI: childVal,
            valJ: parentVal,
            arrayClone: [...this.array],
            codeLineIndex: 7,
          },
        })

        heapifyUp(parentIdx)
      }
    }

    heapifyUp(this.array.length - 1)

    recorder.record({
      type: DONE,
      data: {
        arrayClone: [...this.array],
        codeLineIndex: 10,
      },
    })

    return recorder.getFrames()
  }

  extractMax() {
    if (this.array.length === 0) return []
    const recorder = this._createRecorder()

    const maxVal = this.array[0]
    const lastVal = this.array.pop()

    if (this.array.length > 0) {
      // Move last item to root
      this.array[0] = lastVal

      recorder.record({
        type: START,
        data: {
          operation: `Extraction of root max value ${maxVal}`,
          arrayClone: [...this.array],
          activeNodeId: 0,
          codeLineIndex: 2,
        },
      })

      const heapifyDown = (index) => {
        let largestIdx = index
        const leftIdx = 2 * index + 1
        const rightIdx = 2 * index + 2

        if (leftIdx < this.array.length) {
          recorder.record({
            type: COMPARE,
            data: {
              parentIdx: largestIdx,
              parentVal: this.array[largestIdx],
              childIdx: leftIdx,
              childVal: this.array[leftIdx],
              a: this.array[largestIdx],
              b: this.array[leftIdx],
              i: largestIdx,
              j: leftIdx,
              arrayClone: [...this.array],
              codeLineIndex: 10,
            },
          })

          if (this.array[leftIdx] > this.array[largestIdx]) {
            largestIdx = leftIdx
          }
        }

        if (rightIdx < this.array.length) {
          recorder.record({
            type: COMPARE,
            data: {
              parentIdx: largestIdx,
              parentVal: this.array[largestIdx],
              childIdx: rightIdx,
              childVal: this.array[rightIdx],
              a: this.array[largestIdx],
              b: this.array[rightIdx],
              i: largestIdx,
              j: rightIdx,
              arrayClone: [...this.array],
              codeLineIndex: 11,
            },
          })

          if (this.array[rightIdx] > this.array[largestIdx]) {
            largestIdx = rightIdx
          }
        }

        if (largestIdx !== index) {
          const tempVal = this.array[index]
          this.array[index] = this.array[largestIdx]
          this.array[largestIdx] = tempVal

          recorder.record({
            type: SWAP,
            data: {
              i: index,
              j: largestIdx,
              valI: this.array[index],
              valJ: tempVal,
              arrayClone: [...this.array],
              codeLineIndex: 13,
            },
          })

          heapifyDown(largestIdx)
        }
      }

      heapifyDown(0)
    } else {
      // Array becomes empty
      recorder.record({
        type: START,
        data: {
          operation: `Extraction of root max value ${maxVal} (Heap is now empty)`,
          arrayClone: [],
          codeLineIndex: 4,
        },
      })
    }

    recorder.record({
      type: DONE,
      data: {
        arrayClone: [...this.array],
        codeLineIndex: 16,
      },
    })

    return recorder.getFrames()
  }
}
