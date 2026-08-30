/**
 * quick.js
 * Quick Sort algorithm with frame recording.
 */

import {
  START,
  COMPARE,
  SWAP,
  DONE,
  MARK_SORTED,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

export function quickSort(arr) {
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
        case START: return `Partitioning array range [${d.low}, ${d.high}] around pivot at index ${d.pivot}.`
        case COMPARE: return `Comparing element at index ${d.j} (val: ${d.val}) with pivot value ${d.pivotVal}.`
        case SWAP: return `Swapping elements at index ${d.i} and ${d.j}.`
        case MARK_SORTED: return `Pivot element placed at sorted index ${d.sortedIndices}.`
        case DONE: return 'Quick Sort complete!'
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
    data: { low: 0, high: array.length - 1, pivot: array.length - 1, arrayClone: [...array], codeLineIndex: 0 },
  })

  const partition = (low, high) => {
    const pivot = array[high]
    let i = low - 1

    recorder.record({
      type: START,
      data: { low, high, pivot: high, arrayClone: [...array], codeLineIndex: 9 },
    })

    for (let j = low; j < high; j++) {
      recorder.record({
        type: COMPARE,
        data: {
          j,
          val: array[j],
          pivot: high,
          pivotVal: pivot,
          compared: [j, high],
          arrayClone: [...array],
          codeLineIndex: 11,
        },
      })

      if (array[j] < pivot) {
        i++
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp

        recorder.record({
          type: SWAP,
          data: {
            i,
            j,
            pivot: high,
            compared: [i, j],
            arrayClone: [...array],
            codeLineIndex: 13,
          },
        })
      }
    }

    const temp = array[i + 1]
    array[i + 1] = array[high]
    array[high] = temp

    recorder.record({
      type: SWAP,
      data: {
        i: i + 1,
        j: high,
        pivot: i + 1,
        compared: [i + 1, high],
        arrayClone: [...array],
        codeLineIndex: 16,
      },
    })

    return i + 1
  }

  const quickSortHelper = (low, high) => {
    if (low < high) {
      const pi = partition(low, high)

      recorder.record({
        type: MARK_SORTED,
        data: {
          sortedIndices: [pi],
          arrayClone: [...array],
          codeLineIndex: 3,
        },
      })

      quickSortHelper(low, pi - 1)
      quickSortHelper(pi + 1, high)
    } else if (low === high) {
      recorder.record({
        type: MARK_SORTED,
        data: {
          sortedIndices: [low],
          arrayClone: [...array],
          codeLineIndex: 1,
        },
      })
    }
  }

  quickSortHelper(0, array.length - 1)

  recorder.record({
    type: DONE,
    data: { arrayClone: [...array], codeLineIndex: 5 },
  })

  return recorder.getFrames()
}
