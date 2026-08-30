/**
 * ComparisonMode.jsx
 *
 * Runs multiple sorting algorithms simultaneously on the same array input.
 * Displays synchronized visual bars side-by-side.
 */

import { useEffect, useState, useMemo } from 'react'
import usePlayback from '../../core/playback/usePlayback.js'
import ArrayRenderer from '../../renderers/ArrayRenderer/index.jsx'
import PlaybackControls from '../../components/playback/PlaybackControls.jsx'

// Import algorithms
import { bubbleSort } from './algorithms/bubble.js'
import { selectionSort } from './algorithms/selection.js'
import { insertionSort } from './algorithms/insertion.js'
import { mergeSort } from './algorithms/merge.js'
import { quickSort } from './algorithms/quick.js'
import { heapSort } from './algorithms/heap.js'

const ALGOS = {
  bubble:    { label: 'Bubble Sort',    sort: bubbleSort },
  selection: { label: 'Selection Sort', sort: selectionSort },
  insertion: { label: 'Insertion Sort', sort: insertionSort },
  merge:     { label: 'Merge Sort',     sort: mergeSort },
  quick:     { label: 'Quick Sort',     sort: quickSort },
  heapsort:  { label: 'Heap Sort',      sort: heapSort },
}

/**
 * @param {{
 *   array: number[],
 *   onBack: () => void
 * }} props
 */
export default function ComparisonMode({ array, onBack }) {
  const [selectedAlgos, setSelectedAlgos] = useState(['bubble', 'merge', 'quick'])
  const [runData, setRunData] = useState({})

  // Compute and store frame outputs for each selected algorithm
  useEffect(() => {
    const data = {}
    selectedAlgos.forEach((id) => {
      const routine = ALGOS[id]?.sort
      if (routine) {
        data[id] = routine(array)
      }
    })
    setRunData(data)
  }, [array, selectedAlgos])

  // We find the algorithm with the maximum frames count to set timeline bounds
  const maxFramesLength = Object.values(runData).reduce(
    (max, frames) => Math.max(max, frames.length),
    0
  )

  // We construct a mock frames array of length `maxFramesLength` so we can reuse our usePlayback hook
  const mockFrames = useMemo(() => Array.from({ length: maxFramesLength }, (_, idx) => ({ index: idx })), [maxFramesLength])
  const playback = usePlayback(mockFrames)
  const { frameIndex } = playback

  const toggleAlgo = (id) => {
    setSelectedAlgos((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev // Keep at least one
        return prev.filter((x) => x !== id)
      }
      return [...prev, id].slice(0, 3) // Cap at 3 for UI space
    })
  }

  return (
    <div className="module-page" style={{ height: '100%' }}>
      <div className="module-header" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="module-eyebrow">⚡ Sorting comparison</div>
            <h2 className="module-title">Multi-Algorithm Race</h2>
            <p className="module-desc">Compare up to 3 sorting algorithms on the same input simultaneously.</p>
          </div>
          <button className="btn btn-secondary" onClick={onBack}>
            ← Single Visualizer
          </button>
        </div>

        {/* Algorithm selection row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
          {Object.entries(ALGOS).map(([id, info]) => {
            const isSelected = selectedAlgos.includes(id)
            return (
              <button
                key={id}
                type="button"
                className={`preset-btn ${isSelected ? 'active' : ''}`}
                style={{
                  color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                  borderColor: isSelected ? 'var(--accent)' : undefined,
                  background: isSelected ? 'var(--accent-dim)' : undefined,
                }}
                onClick={() => toggleAlgo(id)}
              >
                {info.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="module-body full-width" style={{ padding: '0 28px 20px', gridTemplateRows: '1fr auto' }}>
        {/* Race columns grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedAlgos.length}, 1fr)`, gap: 16, flex: 1 }}>
          {selectedAlgos.map((id) => {
            const frames = runData[id] || []
            const frame = frames[Math.min(frameIndex, frames.length - 1)]

            const currentArray = frame?.stateSnapshot?.array || array
            const highlighted = frame?.highlightedNodes || []
            const compared = frame?.stateSnapshot?.compared || []
            const sorted = frame?.stateSnapshot?.sorted || []
            const pivot = frame?.stateSnapshot?.pivot !== undefined ? frame.stateSnapshot.pivot : null

            const isDone = frameIndex >= frames.length - 1

            return (
              <div key={id} className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header">
                  <span className="panel-title">{ALGOS[id].label}</span>
                  {isDone && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--status-done)',
                        background: 'rgba(134,239,172,0.12)',
                        padding: '2px 6px',
                        borderRadius: 99,
                      }}
                    >
                      Finished at step {frames.length}
                    </span>
                  )}
                </div>
                <div className="panel-body" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <ArrayRenderer
                    values={currentArray}
                    highlighted={highlighted}
                    compared={compared}
                    sorted={sorted}
                    pivot={pivot}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Playback Controls */}
        <div style={{ marginTop: 12 }}>
          <PlaybackControls playback={playback} />
        </div>
      </div>
    </div>
  )
}
