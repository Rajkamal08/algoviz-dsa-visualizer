/**
 * EventTypes.js
 *
 * All possible algorithm event type constants.
 * Every algorithm records its work as a sequence of these events.
 * The FrameRecorder converts events → rich visual frames.
 *
 * Convention: events are SCREAMING_SNAKE_CASE strings.
 */

// ─── Comparison & Search ───────────────────────────────────────────────────
export const COMPARE       = 'COMPARE'        // compare two values: { a, b, aIndex?, bIndex? }
export const FOUND         = 'FOUND'          // target found: { node?, index?, value }
export const NOT_FOUND     = 'NOT_FOUND'      // target not found: { value }

// ─── Array / Sorting ────────────────────────────────────────────────────────
export const SWAP          = 'SWAP'           // swap two positions: { i, j }
export const OVERWRITE     = 'OVERWRITE'      // write value at index: { index, value }
export const PIVOT_SELECT  = 'PIVOT_SELECT'   // select pivot: { index, value }
export const PARTITION     = 'PARTITION'      // partition range: { low, high }
export const MARK_SORTED   = 'MARK_SORTED'   // mark index(es) as sorted: { indices }
export const PASS_COMPLETE = 'PASS_COMPLETE'  // one full pass done: { pass }

// ─── Tree Nodes ─────────────────────────────────────────────────────────────
export const INSERT_NODE   = 'INSERT_NODE'    // insert a new node: { key, parent? }
export const DELETE_NODE   = 'DELETE_NODE'    // remove a node: { key }
export const VISIT_NODE    = 'VISIT_NODE'     // traverse to a node: { nodeId, key }
export const HIGHLIGHT_NODE = 'HIGHLIGHT_NODE' // highlight without traversal: { nodeIds }
export const MARK_ACTIVE   = 'MARK_ACTIVE'   // make a node the active focus: { nodeId }
export const MARK_VISITED  = 'MARK_VISITED'  // permanently mark visited: { nodeId }

// ─── Tree Edges ─────────────────────────────────────────────────────────────
export const HIGHLIGHT_EDGE = 'HIGHLIGHT_EDGE' // highlight edge(s): { edges: [{from, to}] }

// ─── Tree Rotations (AVL / Red-Black) ────────────────────────────────────────
export const ROTATE        = 'ROTATE'         // rotation event: { type: 'LL'|'RR'|'LR'|'RL', nodeId }
export const RECOLOR       = 'RECOLOR'        // recolor node (R-B tree): { nodeId, color }
export const REBALANCE     = 'REBALANCE'      // mark rebalance in progress: { nodeId }

// ─── Tree Splits / Merges (B+ Tree) ─────────────────────────────────────────
export const SPLIT_NODE    = 'SPLIT_NODE'     // split a node: { nodeId, separator }
export const MERGE_NODE    = 'MERGE_NODE'     // merge nodes: { leftId, rightId }

// ─── Graph Traversal ─────────────────────────────────────────────────────────
export const ENQUEUE       = 'ENQUEUE'        // add to queue/frontier: { node }
export const DEQUEUE       = 'DEQUEUE'        // remove from queue: { node }
export const PUSH          = 'PUSH'           // push to stack: { node }
export const POP           = 'POP'            // pop from stack: { node }
export const RELAX_EDGE    = 'RELAX_EDGE'     // Dijkstra edge relaxation: { from, to, oldDist, newDist }
export const UPDATE_DIST   = 'UPDATE_DIST'    // update distance entry: { node, dist }
export const FINALIZE_NODE = 'FINALIZE_NODE'  // node settled (Dijkstra): { node }

// ─── Dynamic Programming ─────────────────────────────────────────────────────
export const CACHE_HIT     = 'CACHE_HIT'      // memo table hit: { key, value }
export const CACHE_MISS    = 'CACHE_MISS'     // memo table miss (compute): { key }
export const CACHE_STORE   = 'CACHE_STORE'    // store result in cache: { key, value }
export const FILL_CELL     = 'FILL_CELL'      // fill a DP table cell: { row, col, value }
export const CALL          = 'CALL'           // recursive call: { args, depth }
export const RETURN        = 'RETURN'         // return from recursion: { value, depth }

// ─── Hashing ─────────────────────────────────────────────────────────────────
export const HASH_COMPUTE  = 'HASH_COMPUTE'   // compute hash: { key, hash }
export const BUCKET_ACCESS = 'BUCKET_ACCESS'  // access a bucket: { bucket }
export const COLLISION     = 'COLLISION'       // collision detected: { key, bucket }
export const PROBE         = 'PROBE'          // probe next slot: { slot, attempt }

// ─── Backtracking ─────────────────────────────────────────────────────────────
export const PLACE         = 'PLACE'          // place an element: { position, value }
export const REMOVE        = 'REMOVE'         // remove/undo placement: { position }
export const BACKTRACK     = 'BACKTRACK'      // backtrack step: { from }
export const PRUNE         = 'PRUNE'          // prune branch: { reason }
export const SOLUTION      = 'SOLUTION'       // solution found: { state }

// ─── Linked Structures ───────────────────────────────────────────────────────
export const NODE_CREATE   = 'NODE_CREATE'    // create a new node: { value }
export const POINTER_SET   = 'POINTER_SET'    // update a pointer: { from, to }
export const NODE_REMOVE   = 'NODE_REMOVE'    // unlink and remove: { value }

// ─── Lifecycle ────────────────────────────────────────────────────────────────
export const START         = 'START'          // algorithm begins: { label, input }
export const DONE          = 'DONE'           // algorithm complete: { result }
export const STEP_LABEL    = 'STEP_LABEL'     // custom annotation: { label, detail }

// ─── Convenience: all types as an array (useful for validation / docs) ────────
export const ALL_EVENT_TYPES = [
  COMPARE, FOUND, NOT_FOUND,
  SWAP, OVERWRITE, PIVOT_SELECT, PARTITION, MARK_SORTED, PASS_COMPLETE,
  INSERT_NODE, DELETE_NODE, VISIT_NODE, HIGHLIGHT_NODE, MARK_ACTIVE, MARK_VISITED,
  HIGHLIGHT_EDGE,
  ROTATE, RECOLOR, REBALANCE,
  SPLIT_NODE, MERGE_NODE,
  ENQUEUE, DEQUEUE, PUSH, POP, RELAX_EDGE, UPDATE_DIST, FINALIZE_NODE,
  CACHE_HIT, CACHE_MISS, CACHE_STORE, FILL_CELL, CALL, RETURN,
  HASH_COMPUTE, BUCKET_ACCESS, COLLISION, PROBE,
  PLACE, REMOVE, BACKTRACK, PRUNE, SOLUTION,
  NODE_CREATE, POINTER_SET, NODE_REMOVE,
  START, DONE, STEP_LABEL
]
