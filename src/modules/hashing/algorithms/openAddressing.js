/**
 * openAddressing.js — Hash table with Linear Probing (Open Addressing)
 * Records each insert showing initial hash slot, probe sequence, and final placement.
 */

import { START, COMPARE, INSERT_NODE, DONE, STEP_LABEL } from '../../../core/events/EventTypes.js'
import FrameRecorder from '../../../core/frames/FrameRecorder.js'

const EMPTY = null
const DELETED = 'DEL'

function cloneTable(table) { return [...table] }

export function runOpenAddressing(keys, tableSize) {
  const recorder = new FrameRecorder({
    initialState: { table: [], tableSize, highlightSlot: null },
    reduce: (state, event) => {
      state.table = event.data.tableClone || state.table
      state.highlightSlot = event.data.slot !== undefined ? event.data.slot : null
      return state
    },
    getDescription: (event) => {
      const d = event.data
      switch (event.type) {
        case START:      return `Initializing open-address table with ${d.tableSize} slots.`
        case COMPARE:    return `Checking slot [${d.slot}]: ${d.occupied ? `occupied by ${d.val}. Probe next.` : 'empty!'}`
        case INSERT_NODE: return `Placing key ${d.key} at slot [${d.slot}].`
        case STEP_LABEL: return d.label
        case DONE:       return 'All keys inserted via linear probing.'
        default:         return event.type
      }
    },
    getHighlightedNodes: (event) => {
      return event.data?.slot !== undefined ? [event.data.slot] : []
    },
    getCodeLineIndex: (event) => event.data?.codeLineIndex ?? -1,
  })

  const table = Array(tableSize).fill(EMPTY)

  recorder.record({
    type: START,
    data: { tableSize, tableClone: cloneTable(table), codeLineIndex: 0 },
  })

  for (const key of keys) {
    const home = key % tableSize
    let i = 0
    let probes = 0

    recorder.record({
      type: STEP_LABEL,
      data: {
        label: `Inserting key ${key}: home slot = ${key} % ${tableSize} = ${home}.`,
        slot: home,
        tableClone: cloneTable(table),
        codeLineIndex: 1,
      },
    })

    while (true) {
      const slot = (home + i) % tableSize

      recorder.record({
        type: COMPARE,
        data: {
          key, slot,
          occupied: table[slot] !== EMPTY,
          val: table[slot],
          tableClone: cloneTable(table),
          codeLineIndex: 3,
        },
      })

      if (table[slot] === EMPTY || table[slot] === DELETED) {
        table[slot] = key
        recorder.record({
          type: INSERT_NODE,
          data: { key, slot, probes, tableClone: cloneTable(table), codeLineIndex: 6 },
        })
        break
      }
      i++
      probes++
      if (i >= tableSize) break // Table full
    }
  }

  recorder.record({
    type: DONE,
    data: { tableClone: cloneTable(table), codeLineIndex: 7 },
  })

  return recorder.getFrames()
}
