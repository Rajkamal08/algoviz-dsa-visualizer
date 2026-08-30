/**
 * chaining.js — Hash table with Separate Chaining
 * Records each insert showing bucket selection and chain appends.
 */

import { START, COMPARE, INSERT_NODE, DONE, STEP_LABEL } from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

/** Build a table snapshot: array of buckets, each bucket is array of values */
function cloneTable(table) {
  return table.map((bucket) => [...bucket])
}

export function runHashChain(keys, tableSize) {
  const recorder = new FrameRecorder({
    initialState: { table: [], tableSize, hashFn: `key % ${tableSize}` },
    reduce: (state, event) => {
      state.table = event.data.tableClone || state.table
      return state
    },
    getDescription: (event) => {
      const d = event.data
      switch (event.type) {
        case START:     return `Initializing hash table with ${d.tableSize} buckets.`
        case COMPARE:   return `Computing hash: ${d.key} % ${d.tableSize} = ${d.bucket}.`
        case INSERT_NODE: return `Inserting key ${d.key} into bucket [${d.bucket}].`
        case STEP_LABEL: return d.label
        case DONE:      return 'All keys inserted into hash table.'
        default:        return event.type
      }
    },
    getHighlightedNodes: (event) => {
      return event.data?.bucket !== undefined ? [event.data.bucket] : []
    },
    getCodeLineIndex: (event) => event.data?.codeLineIndex ?? -1,
  })

  const table = Array.from({ length: tableSize }, () => [])

  recorder.record({
    type: START,
    data: { tableSize, tableClone: cloneTable(table), codeLineIndex: 0 },
  })

  for (const key of keys) {
    const bucket = key % tableSize

    recorder.record({
      type: COMPARE,
      data: { key, tableSize, bucket, tableClone: cloneTable(table), codeLineIndex: 1 },
    })

    table[bucket].push(key)

    recorder.record({
      type: INSERT_NODE,
      data: { key, bucket, tableClone: cloneTable(table), codeLineIndex: 3 },
    })

    if (table[bucket].length > 1) {
      recorder.record({
        type: STEP_LABEL,
        data: {
          label: `Collision at bucket [${bucket}]! Key ${key} appended to chain: [${table[bucket].join(' → ')}].`,
          bucket,
          tableClone: cloneTable(table),
          codeLineIndex: 4,
        },
      })
    }
  }

  recorder.record({
    type: DONE,
    data: { tableClone: cloneTable(table), codeLineIndex: 8 },
  })

  return recorder.getFrames()
}
