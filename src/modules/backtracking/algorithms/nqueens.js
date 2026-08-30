/**
 * nqueens.js — N-Queens backtracking frame recorder
 * Records each queen placement attempt, safe/unsafe checks, and backtracks.
 */

import { START, VISIT_NODE, INSERT_NODE, DONE, STEP_LABEL, FOUND, NOT_FOUND } from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

function cloneBoard(board) {
  return board.map((row) => [...row])
}

function isSafe(board, row, col, n) {
  // Check column
  for (let i = 0; i < row; i++) {
    if (board[i][col] === 'Q') return false
  }
  // Check upper-left diagonal
  for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
    if (board[i][j] === 'Q') return false
  }
  // Check upper-right diagonal
  for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
    if (board[i][j] === 'Q') return false
  }
  return true
}

export function runNQueens(n) {
  const recorder = new FrameRecorder({
    initialState: { board: [], n, solutions: 0, activeCells: [], badCells: [] },
    reduce: (state, event) => {
      state.board = event.data.boardClone || state.board
      state.activeCells = event.data.activeCells || []
      state.badCells = event.data.badCells || []
      if (event.type === FOUND) state.solutions = (state.solutions || 0) + 1
      return state
    },
    getDescription: (event) => {
      const d = event.data
      switch (event.type) {
        case START:      return `Starting N-Queens for N=${d.n}. Placing queens row by row.`
        case VISIT_NODE: return `Trying queen at row ${d.row}, column ${d.col}.`
        case INSERT_NODE: return `✅ Queen placed at [${d.row}, ${d.col}] — no conflicts.`
        case NOT_FOUND:  return `⚠️ Conflict at [${d.row}, ${d.col}]! Skipping.`
        case STEP_LABEL: return d.label
        case FOUND:      return `🎉 Solution found! All ${d.n} queens placed successfully.`
        case DONE:       return `N-Queens complete. Found ${d.solutions} solution(s).`
        default:         return event.type
      }
    },
    getHighlightedNodes: () => [],
    getCodeLineIndex: (event) => event.data?.codeLineIndex ?? -1,
  })

  const board = Array.from({ length: n }, () => Array(n).fill('.'))
  let solutions = 0

  recorder.record({
    type: START,
    data: { n, boardClone: cloneBoard(board), activeCells: [], badCells: [], codeLineIndex: 0 },
  })

  function solve(row) {
    if (row === n) {
      solutions++
      recorder.record({
        type: FOUND,
        data: {
          n, solutions,
          boardClone: cloneBoard(board),
          activeCells: board.reduce((acc, r, ri) => {
            r.forEach((cell, ci) => { if (cell === 'Q') acc.push([ri, ci]) })
            return acc
          }, []),
          badCells: [],
          codeLineIndex: 1,
        },
      })
      return
    }

    for (let col = 0; col < n; col++) {
      recorder.record({
        type: VISIT_NODE,
        data: {
          row, col,
          boardClone: cloneBoard(board),
          activeCells: [[row, col]],
          badCells: [],
          codeLineIndex: 3,
        },
      })

      if (isSafe(board, row, col, n)) {
        board[row][col] = 'Q'

        recorder.record({
          type: INSERT_NODE,
          data: {
            row, col,
            boardClone: cloneBoard(board),
            activeCells: [[row, col]],
            badCells: [],
            codeLineIndex: 4,
          },
        })

        solve(row + 1)

        // Backtrack
        board[row][col] = '.'

        recorder.record({
          type: STEP_LABEL,
          data: {
            label: `Backtracking: removed queen from [${row}, ${col}].`,
            boardClone: cloneBoard(board),
            activeCells: [],
            badCells: [[row, col]],
            codeLineIndex: 6,
          },
        })
      } else {
        recorder.record({
          type: NOT_FOUND,
          data: {
            row, col,
            boardClone: cloneBoard(board),
            activeCells: [],
            badCells: [[row, col]],
            codeLineIndex: 3,
          },
        })
      }
    }
  }

  solve(0)

  recorder.record({
    type: DONE,
    data: {
      solutions,
      boardClone: cloneBoard(board),
      activeCells: [],
      badCells: [],
      codeLineIndex: 8,
    },
  })

  return recorder.getFrames()
}
