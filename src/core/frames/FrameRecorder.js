/**
 * FrameRecorder.js
 *
 * Converts a stream of algorithm events into rich visual frames.
 *
 * DESIGN PRINCIPLES:
 *  1. Algorithm logic calls recorder.record(event) — that's all it needs to know.
 *  2. FrameRecorder is extensible: you pass in algorithm-specific state management
 *     via the `options` object. Different algorithms need different state shapes.
 *  3. The universal frame contract stays the same. Only `stateSnapshot` varies.
 *
 * USAGE:
 *   const recorder = new FrameRecorder({
 *     initialState: { nodes: {}, visited: new Set() },
 *     reduce: (state, event) => { ... return nextState },
 *     getDescription: (event, state) => "Human readable step description",
 *     getExplanation: (event, state) => "Why this step happens (educational)",
 *     getHighlightedNodes: (event, state) => [id1, id2],
 *     getHighlightedEdges: (event, state) => [{from, to}],
 *     getCodeLineIndex: (event, state) => 4,
 *   })
 *
 *   recorder.record({ type: COMPARE, data: { a: 10, b: 20 } })
 *   const frames = recorder.getFrames()
 */

import { COMPARE, SWAP, VISIT_NODE, MARK_VISITED, CACHE_HIT, BACKTRACK } from '../events/EventTypes.js'

/**
 * @typedef {Object} Frame
 * @property {number}   index             - Frame index (0-based)
 * @property {string}   action            - The event type that produced this frame
 * @property {any[]}    target            - Primary values being acted on
 * @property {any[]}    highlightedNodes  - Node IDs to highlight in the renderer
 * @property {Object[]} highlightedEdges  - Edges to highlight: [{from, to}]
 * @property {number}   codeLineIndex     - Pseudocode line to highlight (-1 = none)
 * @property {string}   description       - Short human-readable step label
 * @property {string}   explanation       - Educational "why" explanation
 * @property {Object}   metrics           - Running counters (comparisons, swaps, etc.)
 * @property {Object}   stateSnapshot     - Algorithm-specific state at this frame
 */

const DEFAULT_METRICS = () => ({
  comparisons: 0,
  swaps:       0,
  visited:     0,
  cacheHits:   0,
  backtracks:  0,
  operations:  0,
})

export default class FrameRecorder {
  /**
   * @param {Object} options
   * @param {Object}   options.initialState         - Starting state for this algorithm
   * @param {Function} options.reduce               - (state, event) => nextState
   * @param {Function} options.getDescription       - (event, state) => string
   * @param {Function} options.getExplanation       - (event, state) => string
   * @param {Function} options.getHighlightedNodes  - (event, state) => any[]
   * @param {Function} options.getHighlightedEdges  - (event, state) => Object[]
   * @param {Function} options.getCodeLineIndex     - (event, state) => number
   */
  constructor(options = {}) {
    this._reduce              = options.reduce              || ((state) => state)
    this._getDescription      = options.getDescription      || ((event) => event.type)
    this._getExplanation      = options.getExplanation      || (() => '')
    this._getHighlightedNodes = options.getHighlightedNodes || ((event) => event.data?.highlightedNodes || [])
    this._getHighlightedEdges = options.getHighlightedEdges || ((event) => event.data?.highlightedEdges || [])
    this._getCodeLineIndex    = options.getCodeLineIndex    || ((event) => event.data?.codeLineIndex ?? -1)

    this._initialState = this._deepCopy(options.initialState || {})
    this._state        = this._deepCopy(this._initialState)
    this._metrics      = DEFAULT_METRICS()
    this._frames       = []
  }

  /**
   * Record a single algorithm event. Immediately produces and stores a frame.
   * @param {{ type: string, data?: Object }} event
   * @returns {Frame} The frame produced by this event
   */
  record(event) {
    if (!event || !event.type) {
      throw new Error('FrameRecorder.record: event must have a { type } field')
    }

    // 1. Update metrics based on event type
    this._updateMetrics(event)

    // 2. Derive next state (algorithm-specific)
    this._state = this._reduce(this._deepCopy(this._state), event)

    // 3. Build the universal frame
    const frame = {
      index:            this._frames.length,
      action:           event.type,
      target:           this._extractTarget(event),
      highlightedNodes: this._getHighlightedNodes(event, this._state),
      highlightedEdges: this._getHighlightedEdges(event, this._state),
      codeLineIndex:    this._getCodeLineIndex(event, this._state),
      description:      this._getDescription(event, this._state),
      explanation:      this._getExplanation(event, this._state),
      metrics:          { ...this._metrics },
      stateSnapshot:    this._deepCopy(this._state),
    }

    this._frames.push(frame)
    return frame
  }

  /**
   * Returns a copy of all recorded frames.
   * @returns {Frame[]}
   */
  getFrames() {
    return this._frames.slice()
  }

  /**
   * Returns the current number of recorded frames.
   */
  get frameCount() {
    return this._frames.length
  }

  /**
   * Resets the recorder to its initial state. Use when re-running an algorithm.
   */
  reset() {
    this._state   = this._deepCopy(this._initialState)
    this._metrics = DEFAULT_METRICS()
    this._frames  = []
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  _updateMetrics(event) {
    this._metrics.operations++
    switch (event.type) {
      case COMPARE:     this._metrics.comparisons++;  break
      case SWAP:        this._metrics.swaps++;         break
      case VISIT_NODE:  this._metrics.visited++;       break
      case MARK_VISITED: this._metrics.visited++;      break
      case CACHE_HIT:   this._metrics.cacheHits++;     break
      case BACKTRACK:   this._metrics.backtracks++;    break
      default: break
    }
  }

  _extractTarget(event) {
    const d = event.data
    if (!d) return []
    // Extract meaningful "target" values depending on event shape
    if (d.a !== undefined && d.b !== undefined) return [d.a, d.b]  // COMPARE
    if (d.i !== undefined && d.j !== undefined) return [d.i, d.j]  // SWAP
    if (d.key !== undefined)   return [d.key]
    if (d.value !== undefined) return [d.value]
    if (d.node !== undefined)  return [d.node]
    if (d.nodeId !== undefined) return [d.nodeId]
    return []
  }

  /** Simple deep copy for plain objects / arrays (no circular refs) */
  _deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Set) return new Set(obj)
    if (obj instanceof Map) return new Map(obj)
    if (Array.isArray(obj)) return obj.map((item) => this._deepCopy(item))
    const copy = {}
    for (const key of Object.keys(obj)) {
      copy[key] = this._deepCopy(obj[key])
    }
    return copy
  }
}
