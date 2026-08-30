/**
 * stack.js
 * Stack operations (push/pop) frame recorder.
 */

import {
  START,
  PUSH,
  POP,
  DONE,
  STEP_LABEL,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

export default class StackRec {
  constructor() {
    this.stack = []
  }

  _createRecorder() {
    return new FrameRecorder({
      initialState: { array: [], pivot: null },
      reduce: (state, event) => {
        state.array = event.data.stackClone || []
        state.pivot = event.data.topIdx !== undefined ? event.data.topIdx : null
        return state
      },
      getDescription: (event) => {
        const d = event.data
        switch (event.type) {
          case START: return `Starting Stack ${d.operation}.`
          case PUSH: return `Pushed value ${d.val} onto stack.`
          case POP: return `Popped value ${d.val} from stack.`
          case STEP_LABEL: return d.label
          case DONE: return 'Stack operation complete.'
          default: return event.type
        }
      },
      getHighlightedNodes: (event) => {
        return event.data?.topIdx !== undefined ? [event.data.topIdx] : []
      },
      getCodeLineIndex: (event) => event.data?.codeLineIndex ?? -1,
    })
  }

  push(val) {
    const recorder = this._createRecorder()
    recorder.record({
      type: START,
      data: { operation: `push of ${val}`, stackClone: [...this.stack], codeLineIndex: 0 },
    })

    this.stack.push(val)
    const topIdx = this.stack.length - 1

    recorder.record({
      type: PUSH,
      data: {
        val,
        topIdx,
        stackClone: [...this.stack],
        codeLineIndex: 1,
      },
    })

    recorder.record({
      type: DONE,
      data: { stackClone: [...this.stack], codeLineIndex: 2 },
    })

    return recorder.getFrames()
  }

  pop() {
    const recorder = this._createRecorder()
    if (this.stack.length === 0) return []

    const topVal = this.stack[this.stack.length - 1]
    const topIdx = this.stack.length - 1

    recorder.record({
      type: START,
      data: { operation: 'pop', stackClone: [...this.stack], topIdx, codeLineIndex: 0 },
    })

    this.stack.pop()

    recorder.record({
      type: POP,
      data: {
        val: topVal,
        topIdx: null,
        stackClone: [...this.stack],
        codeLineIndex: 2,
      },
    })

    recorder.record({
      type: DONE,
      data: { stackClone: [...this.stack], codeLineIndex: 3 },
    })

    return recorder.getFrames()
  }
}
