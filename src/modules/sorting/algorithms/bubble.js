/**
 * bubble.js
 * Bubble Sort algorithm with frame recording.
 */

import {
  START,
  COMPARE,
  SWAP,
  DONE,
  MARK_SORTED,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

export function bubbleSort(arr) {
  const recorder = new FrameRecorder({
    initialState: { array: [], compared: [], sorted: [] },
    reduce: (state, event) => {
      state.array = event.data.arrayClone || []
      state.compared = event.data.compared || []
      if (event.type === MARK_SORTED) {
        state.sorted = [...state.sorted, ...event.data.sortedIndices]
      }
      return state
    },
    getDescription: (event) => {
      const d = event.data
      switch (event.type) {
        case START: return 'Starting Bubble Sort.'
        case COMPARE: return `Comparing elements at index ${d.i} (val: ${d.valI}) and index ${d.j} (val: ${d.valJ}).`
        case SWAP: return `Swapping values: ${d.valI} > ${d.valJ}.`
        case MARK_SORTED: return `Index ${d.sortedIndices} is now in its final sorted position.`
        case DONE: return 'Bubble Sort complete!'
        default: return event.type
      }
    },
    getHighlightedNodes: (event) => {
      const d = event.data
      if (d?.i !== undefined && d?.j !== undefined) return [d.i, d.j]
      if (d?.sortedIndices !== undefined) return d.sortedIndices
      return []
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
    let swapped = false
    for (let j = 0; j < n - i - 1; j++) {
      recorder.record({
        type: COMPARE,
        data: {
          i: j,
          j: j + 1,
          valI: array[j],
          valJ: array[j + 1],
          compared: [j, j + 1],
          arrayClone: [...array],
          codeLineIndex: 3,
        },
      })

      if (array[j] > array[j + 1]) {
        const temp = array[j]
        array[j] = array[j + 1]
        array[j + 1] = temp
        swapped = true

        recorder.record({
          type: SWAP,
          data: {
            i: j,
            j: j + 1,
            valI: array[j],
            valJ: array[j + 1],
            compared: [j, j + 1],
            arrayClone: [...array],
            codeLineIndex: 4,
          },
        })
      }
    }

    recorder.record({
      type: MARK_SORTED,
      data: {
        sortedIndices: [n - i - 1],
        arrayClone: [...array],
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
