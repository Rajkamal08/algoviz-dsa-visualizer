/**
 * selection.js
 * Selection Sort algorithm with frame recording.
 */

import {
  START,
  COMPARE,
  SWAP,
  DONE,
  MARK_SORTED,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

export function selectionSort(arr) {
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
        case START: return 'Starting Selection Sort.'
        case COMPARE: return `Comparing element at index ${d.j} with current minimum at index ${d.pivot}.`
        case SWAP: return `Swapping minimum element at index ${d.pivot} with index ${d.i}.`
        case MARK_SORTED: return `Index ${d.sortedIndices} is now sorted.`
        case DONE: return 'Selection Sort complete!'
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

  const n = array.length
  for (let i = 0; i < n; i++) {
    let minIdx = i
    recorder.record({
      type: COMPARE,
      data: {
        i,
        pivot: minIdx,
        arrayClone: [...array],
        codeLineIndex: 2,
      },
    })

    for (let j = i + 1; j < n; j++) {
      recorder.record({
        type: COMPARE,
        data: {
          i: j,
          j,
          pivot: minIdx,
          compared: [j, minIdx],
          arrayClone: [...array],
          codeLineIndex: 3,
        },
      })

      if (array[j] < array[minIdx]) {
        minIdx = j
        recorder.record({
          type: COMPARE,
          data: {
            pivot: minIdx,
            arrayClone: [...array],
            codeLineIndex: 4,
          },
        })
      }
    }

    if (minIdx !== i) {
      const temp = array[i]
      array[i] = array[minIdx]
      array[minIdx] = temp

      recorder.record({
        type: SWAP,
        data: {
          i,
          j: minIdx,
          pivot: minIdx,
          arrayClone: [...array],
          codeLineIndex: 6,
        },
      })
    }

    recorder.record({
      type: MARK_SORTED,
      data: {
        sortedIndices: [i],
        arrayClone: [...array],
        pivot: null,
        codeLineIndex: 1,
      },
    })
  }

  recorder.record({
    type: DONE,
    data: { arrayClone: [...array], codeLineIndex: 8 },
  })

  return recorder.getFrames()
}
