/**
 * lcs.js
 * Longest Common Subsequence DP grid tabulation with frame recording.
 */

import {
  START,
  COMPARE,
  DONE,
  STEP_LABEL,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

export function runLCS(X, Y) {
  const m = X.length
  const n = Y.length

  const recorder = new FrameRecorder({
    initialState: {
      data: [],
      rowHeaders: [],
      colHeaders: [],
      activeCells: [],
      filledCells: [],
      cacheHitCells: [],
    },
    reduce: (state, event) => {
      state.rowHeaders = ['-', ...X.split('')]
      state.colHeaders = ['-', ...Y.split('')]
      state.data = event.data.dataClone || []
      state.activeCells = event.data.activeCells || []
      state.filledCells = event.data.filledCells || []
      state.cacheHitCells = event.data.cacheHitCells || []
      return state
    },
    getDescription: (event) => {
      const d = event.data
      switch (event.type) {
        case START: return `Initializing LCS grid of size ${m+1} x ${n+1}.`
        case COMPARE: return `Checking character match: X[${d.i-1}] ('${d.charX}') vs Y[${d.j-1}] ('${d.charY}').`
        case STEP_LABEL: return d.label
        case DONE: return `LCS calculation complete! LCS Length = ${d.result}.`
        default: return event.type
      }
    },
    getHighlightedNodes: () => [],
    getCodeLineIndex: (event) => event.data?.codeLineIndex ?? -1,
  })

  // Initialize matrix with "-" or empty strings so they show empty during playback
  const matrix = Array.from({ length: m + 1 }, () => Array(n + 1).fill(''))
  const filled = []

  recorder.record({
    type: START,
    data: { dataClone: matrix.map((r) => [...r]), activeCells: [], filledCells: [], codeLineIndex: 0 },
  })

  // Base cases row 0 and col 0 = 0
  for (let i = 0; i <= m; i++) {
    matrix[i][0] = 0
    filled.push([i, 0])
  }
  for (let j = 0; j <= n; j++) {
    matrix[0][j] = 0
    if (!filled.some(([r, c]) => r === 0 && c === j)) {
      filled.push([0, j])
    }
  }

  recorder.record({
    type: STEP_LABEL,
    data: {
      label: 'Set base case cells to 0 (representing empty prefixes).',
      dataClone: matrix.map((r) => [...r]),
      activeCells: [],
      filledCells: [...filled],
      codeLineIndex: 2,
    },
  })

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const charX = X[i - 1]
      const charY = Y[j - 1]

      recorder.record({
        type: COMPARE,
        data: {
          i,
          j,
          charX,
          charY,
          dataClone: matrix.map((r) => [...r]),
          activeCells: [[i, j]],
          filledCells: [...filled],
          codeLineIndex: 4,
        },
      })

      if (charX === charY) {
        matrix[i][j] = (matrix[i - 1][j - 1] === '' ? 0 : matrix[i - 1][j - 1]) + 1
        filled.push([i, j])

        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Characters match ('${charX}'). Cell value = diagonal + 1 = ${matrix[i][j]}.`,
            dataClone: matrix.map((r) => [...r]),
            activeCells: [[i, j]],
            cacheHitCells: [[i - 1, j - 1]], // Highlight diagonal dependency
            filledCells: [...filled],
            codeLineIndex: 5,
          },
        })
      } else {
        const topVal = matrix[i - 1][j] === '' ? 0 : matrix[i - 1][j]
        const leftVal = matrix[i][j - 1] === '' ? 0 : matrix[i][j - 1]
        matrix[i][j] = Math.max(topVal, leftVal)
        filled.push([i, j])

        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Characters mismatch. Cell value = Max(top: ${topVal}, left: ${leftVal}) = ${matrix[i][j]}.`,
            dataClone: matrix.map((r) => [...r]),
            activeCells: [[i, j]],
            cacheHitCells: [[i - 1, j], [i, j - 1]], // Highlight top and left dependencies
            filledCells: [...filled],
            codeLineIndex: 7,
          },
        })
      }
    }
  }

  recorder.record({
    type: DONE,
    data: {
      result: matrix[m][n],
      dataClone: matrix.map((r) => [...r]),
      activeCells: [[m, n]],
      filledCells: [...filled],
      codeLineIndex: 12,
    },
  })

  return recorder.getFrames()
}
