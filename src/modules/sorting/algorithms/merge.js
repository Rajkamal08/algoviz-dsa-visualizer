/**
 * merge.js
 * Merge Sort algorithm with frame recording.
 */

import {
  START,
  COMPARE,
  OVERWRITE,
  DONE,
  MARK_SORTED,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

export function mergeSort(arr) {
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
        case START: return `Starting Merge Sort. Subarray range: [${d.l}, ${d.r}].`
        case COMPARE: return `Comparing left sub-element ${d.valL} with right sub-element ${d.valR}.`
        case OVERWRITE: return `Writing value ${d.val} back to index ${d.idx}.`
        case DONE: return 'Merge Sort complete!'
        default: return event.type
      }
    },
    getHighlightedNodes: (event) => {
      const d = event.data
      const arr = []
      if (d?.i !== undefined) arr.push(d.i)
      if (d?.j !== undefined) arr.push(d.j)
      if (d?.idx !== undefined) arr.push(d.idx)
      return arr
    },
    getCodeLineIndex: (event) => event.data?.codeLineIndex ?? -1,
  })

  const array = [...arr]
  recorder.record({
    type: START,
    data: { l: 0, r: array.length - 1, arrayClone: [...array], codeLineIndex: 0 },
  })

  const merge = (l, m, r) => {
    const leftArr = []
    const rightArr = []
    const n1 = m - l + 1
    const n2 = r - m

    for (let i = 0; i < n1; i++) leftArr.push(array[l + i])
    for (let j = 0; j < n2; j++) rightArr.push(array[m + 1 + j])

    let i = 0
    let j = 0
    let k = l

    while (i < n1 && j < n2) {
      recorder.record({
        type: COMPARE,
        data: {
          i: l + i,
          j: m + 1 + j,
          valL: leftArr[i],
          valR: rightArr[j],
          compared: [l + i, m + 1 + j],
          arrayClone: [...array],
          codeLineIndex: 5,
        },
      })

      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i]
        recorder.record({
          type: OVERWRITE,
          data: {
            idx: k,
            val: leftArr[i],
            i: l + i,
            arrayClone: [...array],
            codeLineIndex: 5,
          },
        })
        i++
      } else {
        array[k] = rightArr[j]
        recorder.record({
          type: OVERWRITE,
          data: {
            idx: k,
            val: rightArr[j],
            j: m + 1 + j,
            arrayClone: [...array],
            codeLineIndex: 5,
          },
        })
        j++
      }
      k++
    }

    while (i < n1) {
      array[k] = leftArr[i]
      recorder.record({
        type: OVERWRITE,
        data: {
          idx: k,
          val: leftArr[i],
          i: l + i,
          arrayClone: [...array],
          codeLineIndex: 5,
        },
      })
      i++
      k++
    }

    while (j < n2) {
      array[k] = rightArr[j]
      recorder.record({
        type: OVERWRITE,
        data: {
          idx: k,
          val: rightArr[j],
          j: m + 1 + j,
          arrayClone: [...array],
          codeLineIndex: 5,
        },
      })
      j++
      k++
    }
  }

  const mergeSortHelper = (l, r) => {
    if (l >= r) return
    const m = l + Math.floor((r - l) / 2)

    recorder.record({
      type: START,
      data: { l, r: m, arrayClone: [...array], codeLineIndex: 3 },
    })
    mergeSortHelper(l, m)

    recorder.record({
      type: START,
      data: { l: m + 1, r, arrayClone: [...array], codeLineIndex: 4 },
    })
    mergeSortHelper(m + 1, r)

    merge(l, m, r)

    // Mark sorted ranges at recursion resolve
    const range = Array.from({ length: r - l + 1 }, (_, idx) => l + idx)
    // If it merged the entire array, mark sorted
    if (l === 0 && r === array.length - 1) {
      recorder.record({
        type: MARK_SORTED,
        data: {
          sortedIndices: range,
          arrayClone: [...array],
          codeLineIndex: 5,
        },
      })
    }
  }

  mergeSortHelper(0, array.length - 1)

  recorder.record({
    type: DONE,
    data: { arrayClone: [...array], codeLineIndex: 6 },
  })

  return recorder.getFrames()
}
