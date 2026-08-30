/**
 * heap.js
 * Heap Sort algorithm with frame recording.
 */

import {
  START,
  COMPARE,
  SWAP,
  DONE,
  MARK_SORTED,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

export function heapSort(arr) {
  const recorder = new FrameRecorder({
    initialState: { array: [], compared: [], sorted: [], pivot: null },
    reduce: (state, event) => {
      state.array = event.data.arrayClone || []
      state.compared = event.data.compared || []
      state.pivot = event.data.pivot !== undefined ? event.data.pivot : state.pivot
      if (event.type === MARK_SORTED) {
        state.sorted = [...state.sorted, ...event.data.sortedIndices]
      }
      return state
    },
    getDescription: (event) => {
      const d = event.data
      switch (event.type) {
        case START: return 'Starting Heap Sort (Building Max Heap).'
        case COMPARE: return `Comparing node ${d.largest} with child node ${d.child}.`
        case SWAP: return `Swapping elements at index ${d.i} and ${d.j}.`
        case MARK_SORTED: return `Extracted largest element placed at sorted index ${d.sortedIndices}.`
        case DONE: return 'Heap Sort complete!'
        default: return event.type
      }
    },
    getHighlightedNodes: (event) => {
      const d = event.data
      const arr = []
      if (d?.i !== undefined) arr.push(d.i)
      if (d?.j !== undefined) arr.push(d.j)
      if (d?.pivot !== undefined && d.pivot !== null) arr.push(d.pivot)
      return arr
    },
    getCodeLineIndex: (event) => event.data?.codeLineIndex ?? -1,
  })

  const array = [...arr]
  recorder.record({
    type: START,
    data: { arrayClone: [...array], codeLineIndex: 0 },
  })

  const heapify = (n, i) => {
    let largest = i
    const left = 2 * i + 1
    const right = 2 * i + 2

    if (left < n) {
      recorder.record({
        type: COMPARE,
        data: {
          largest,
          child: left,
          compared: [largest, left],
          arrayClone: [...array],
          codeLineIndex: 1, // heapify lines
        },
      })
      if (array[left] > array[largest]) {
        largest = left
      }
    }

    if (right < n) {
      recorder.record({
        type: COMPARE,
        data: {
          largest,
          child: right,
          compared: [largest, right],
          arrayClone: [...array],
          codeLineIndex: 1,
        },
      })
      if (array[right] > array[largest]) {
        largest = right
      }
    }

    if (largest !== i) {
      const swap = array[i]
      array[i] = array[largest]
      array[largest] = swap

      recorder.record({
        type: SWAP,
        data: {
          i,
          j: largest,
          compared: [i, largest],
          arrayClone: [...array],
          codeLineIndex: 1,
        },
      })

      heapify(n, largest)
    }
  }

  // Build heap (rearrange array)
  const n = array.length
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i)
  }

  // One by one extract an element from heap
  for (let i = n - 1; i > 0; i--) {
    // Move current root to end
    const temp = array[0]
    array[0] = array[i]
    array[i] = temp

    recorder.record({
      type: SWAP,
      data: {
        i: 0,
        j: i,
        compared: [0, i],
        arrayClone: [...array],
        codeLineIndex: 3,
      },
    })

    recorder.record({
      type: MARK_SORTED,
      data: {
        sortedIndices: [i],
        arrayClone: [...array],
        codeLineIndex: 3,
      },
    })

    // call max heapify on the reduced heap
    heapify(i, 0)
  }

  recorder.record({
    type: MARK_SORTED,
    data: {
      sortedIndices: [0],
      arrayClone: [...array],
      codeLineIndex: 5,
    },
  })

  recorder.record({
    type: DONE,
    data: { arrayClone: [...array], codeLineIndex: 6 },
  })

  return recorder.getFrames()
}
