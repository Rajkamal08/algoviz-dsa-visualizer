/**
 * insertion.js
 * Insertion Sort algorithm with frame recording.
 */

import {
  START,
  COMPARE,
  SWAP,
  DONE,
  MARK_SORTED,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

export function insertionSort(arr) {
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
        case START: return 'Starting Insertion Sort.'
        case COMPARE: return `Inspecting element at index ${d.j} against key ${d.key}.`
        case SWAP: return `Shifting value ${d.val} to the right.`
        case MARK_SORTED: return `Inserted key at index ${d.insertIdx}.`
        case DONE: return 'Insertion Sort complete!'
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
  // Index 0 is considered sorted initially
  recorder.record({
    type: MARK_SORTED,
    data: { sortedIndices: [0], arrayClone: [...array], codeLineIndex: 1 },
  })

  for (let i = 1; i < n; i++) {
    const key = array[i]
    let j = i - 1

    recorder.record({
      type: COMPARE,
      data: {
        i,
        pivot: i,
        arrayClone: [...array],
        codeLineIndex: 2,
      },
    })

    while (j >= 0) {
      recorder.record({
        type: COMPARE,
        data: {
          i: j,
          j,
          key,
          pivot: i,
          compared: [j, j + 1],
          arrayClone: [...array],
          codeLineIndex: 4,
        },
      })

      if (array[j] > key) {
        array[j + 1] = array[j]

        recorder.record({
          type: SWAP,
          data: {
            i: j,
            j: j + 1,
            val: array[j],
            pivot: i,
            compared: [j, j + 1],
            arrayClone: [...array],
            codeLineIndex: 5,
          },
        })
        j--
      } else {
        break
      }
    }

    array[j + 1] = key

    // Re-mark all indices from 0 to i as sorted
    const sortedIndices = Array.from({ length: i + 1 }, (_, idx) => idx)
    recorder.record({
      type: MARK_SORTED,
      data: {
        sortedIndices,
        insertIdx: j + 1,
        arrayClone: [...array],
        pivot: null,
        codeLineIndex: 8,
      },
    })
  }

  recorder.record({
    type: DONE,
    data: { arrayClone: [...array], codeLineIndex: 9 },
  })

  return recorder.getFrames()
}
