/**
 * queue.js
 * Queue operations (enqueue/dequeue) frame recorder.
 */

import {
  START,
  ENQUEUE,
  DEQUEUE,
  DONE,
  STEP_LABEL,
} from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

export default class QueueRec {
  constructor() {
    this.queue = []
  }

  _createRecorder() {
    return new FrameRecorder({
      initialState: { array: [], head: null, tail: null },
      reduce: (state, event) => {
        state.array = event.data.queueClone || []
        state.head = state.array.length > 0 ? 0 : null
        state.tail = state.array.length > 0 ? state.array.length - 1 : null
        return state
      },
      getDescription: (event) => {
        const d = event.data
        switch (event.type) {
          case START: return `Starting Queue ${d.operation}.`
          case ENQUEUE: return `Enqueued value ${d.val} at tail.`
          case DEQUEUE: return `Dequeued value ${d.val} from head.`
          case STEP_LABEL: return d.label
          case DONE: return 'Queue operation complete.'
          default: return event.type
        }
      },
      getHighlightedNodes: (event) => {
        const arr = []
        if (event.data?.headIdx !== undefined && event.data.headIdx !== null) arr.push(event.data.headIdx)
        if (event.data?.tailIdx !== undefined && event.data.tailIdx !== null) arr.push(event.data.tailIdx)
        return arr
      },
      getCodeLineIndex: (event) => event.data?.codeLineIndex ?? -1,
    })
  }

  enqueue(val) {
    const recorder = this._createRecorder()
    recorder.record({
      type: START,
      data: { operation: `enqueue of ${val}`, queueClone: [...this.queue], codeLineIndex: 0 },
    })

    this.queue.push(val)
    const tailIdx = this.queue.length - 1

    recorder.record({
      type: ENQUEUE,
      data: {
        val,
        tailIdx,
        queueClone: [...this.queue],
        codeLineIndex: 1,
      },
    })

    recorder.record({
      type: DONE,
      data: { queueClone: [...this.queue], codeLineIndex: 2 },
    })

    return recorder.getFrames()
  }

  dequeue() {
    const recorder = this._createRecorder()
    if (this.queue.length === 0) return []

    const headVal = this.queue[0]

    recorder.record({
      type: START,
      data: { operation: 'dequeue', queueClone: [...this.queue], headIdx: 0, codeLineIndex: 0 },
    })

    this.queue.shift()

    recorder.record({
      type: DEQUEUE,
      data: {
        val: headVal,
        headIdx: null,
        queueClone: [...this.queue],
        codeLineIndex: 2,
      },
    })

    recorder.record({
      type: DONE,
      data: { queueClone: [...this.queue], codeLineIndex: 3 },
    })

    return recorder.getFrames()
  }
}
