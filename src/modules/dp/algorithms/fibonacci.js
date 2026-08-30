/**
 * fibonacci.js
 * Fibonacci DP tabulation with frame recording.
 */

import {
  START,
  COMPARE,
  SWAP,
  DONE,
  STEP_LABEL,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

export function runFibonacci(n) {
  const recorder = new FrameRecorder({
    initialState: { array: [], compared: [], sorted: [] },
    reduce: (state, event) => {
      state.array = event.data.arrayClone || []
      state.compared = event.data.compared || []
      return state
    },
    getDescription: (event) => {
      const d = event.data
      switch (event.type) {
        case START: return `Initializing Fibonacci tabulation up to N = ${d.n}.`
        case STEP_LABEL: return d.label
        case DONE: return `Fibonacci calculation complete! Fib(${d.n}) = ${d.result}.`
        default: return event.type
      }
    },
    getHighlightedNodes: (event) => {
      return event.data?.compared || []
    },
    getCodeLineIndex: (event) => event.data?.codeLineIndex ?? -1,
  })

  recorder.record({
    type: START,
    data: { n, arrayClone: [0, 1], codeLineIndex: 0 },
  })

  const dp = [0, 1]

  recorder.record({
    type: STEP_LABEL,
    data: {
      label: 'Set base cases: dp[0] = 0, dp[1] = 1.',
      compared: [0, 1],
      arrayClone: [...dp],
      codeLineIndex: 1,
    },
  })

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]

    recorder.record({
      type: STEP_LABEL,
      data: {
        label: `Calculating dp[${i}] = dp[${i - 1}] (${dp[i - 1]}) + dp[${i - 2}] (${dp[i - 2]}) = ${dp[i]}.`,
        compared: [i - 1, i - 2, i],
        arrayClone: [...dp],
        codeLineIndex: 3,
      },
    })
  }

  recorder.record({
    type: DONE,
    data: {
      n,
      result: dp[n],
      arrayClone: [...dp],
      codeLineIndex: 5,
    },
  })

  return recorder.getFrames()
}
