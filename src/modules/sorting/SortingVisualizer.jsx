/**
 * SortingVisualizer.jsx
 *
 * Visualizer container for sorting algorithms.
 */

import { useEffect, useState } from 'react'
import usePlayback from '../../core/playback/usePlayback.js'
import ArrayRenderer from '../../renderers/ArrayRenderer/index.jsx'
import PlaybackControls from '../../components/playback/PlaybackControls.jsx'
import PseudocodePanel from '../../components/playback/PseudocodePanel.jsx'
import ComplexityCard from '../../components/playback/ComplexityCard.jsx'
import StateInspector from '../../components/playback/StateInspector.jsx'
import InputPanel from '../../components/common/InputPanel.jsx'
import { sortingPseudocode } from '../../data/pseudocode/sorting.js'
import { complexities } from '../../data/complexities/index.js'
import { presets } from '../../data/presets/index.js'
import ComparisonMode from './ComparisonMode.jsx'

// Import sorting algorithm execution routines
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

export default function SortingVisualizer({ onStatusChange, initialAlgoId = 'bubble' }) {
  const [algoId, setAlgoId] = useState(initialAlgoId)
  const [inputValue, setInputValue] = useState('')
  const [array, setArray] = useState([23, 78, 45, 8, 56, 89, 34, 12, 67, 50])
  const [frames, setFrames] = useState([])
  const [isComparisonMode, setIsComparisonMode] = useState(false)

  // Sync state if prop changes from sidebar navigation
  useEffect(() => {
    if (initialAlgoId && ALGOS[initialAlgoId]) {
      setAlgoId(initialAlgoId)
    }
  }, [initialAlgoId])

  const playback = usePlayback(frames)
  const { currentFrame, isPlaying } = playback

  useEffect(() => {
    handleRunSort(array, algoId)
  }, [algoId])

  useEffect(() => {
    if (isPlaying) {
      onStatusChange?.('running', `Sorting array via ${ALGOS[algoId].label}...`)
    } else if (currentFrame?.action === 'DONE') {
      onStatusChange?.('done', currentFrame.description)
    } else {
      onStatusChange?.('ready', '')
    }
  }, [isPlaying, currentFrame, algoId])

  const handleRunSort = (targetArr, currentAlgoId) => {
    const routine = ALGOS[currentAlgoId]?.sort
    if (!routine) return

    const nextFrames = routine(targetArr)
    setFrames(nextFrames)
  }

  const handleLoadPreset = (valStr) => {
    const nextArr = valStr
      .split(',')
      .map((k) => parseInt(k.trim(), 10))
      .filter((k) => !isNaN(k))

    setArray(nextArr)
    handleRunSort(nextArr, algoId)
    setInputValue('')
  }

  const handleSubmit = () => {
    const nextArr = inputValue
      .split(',')
      .map((k) => parseInt(k.trim(), 10))
      .filter((k) => !isNaN(k))

    if (nextArr.length === 0) return

    setArray(nextArr)
    handleRunSort(nextArr, algoId)
    setInputValue('')
  }

  const currentArray = currentFrame?.stateSnapshot?.array || array
  const highlighted = currentFrame?.highlightedNodes || []
  const compared = currentFrame?.stateSnapshot?.compared || []
  const sorted = currentFrame?.stateSnapshot?.sorted || []
  const pivot = currentFrame?.stateSnapshot?.pivot !== undefined ? currentFrame.stateSnapshot.pivot : null

  if (isComparisonMode) {
    return <ComparisonMode array={array} onBack={() => setIsComparisonMode(false)} />
  }

  return (
    <div className="module-page">
      <div className="module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="module-eyebrow">⚡ Sorting</div>
          <h2 className="module-title">{ALGOS[algoId].label}</h2>
          <p className="module-desc">
            Compare swaps, element partitions, and range sorting updates in real-time.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => setIsComparisonMode(true)}>
          ⚔️ Compare Sorts (Race)
        </button>
      </div>

      {/* Tabs */}
      <div className="module-tabs" role="tablist">
        {Object.entries(ALGOS).map(([id, item]) => (
          <button
            key={id}
            role="tab"
            aria-selected={algoId === id}
            className={`module-tab ${algoId === id ? 'active' : ''}`}
            onClick={() => setAlgoId(id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="module-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Main Array Canvas Panel */}
          <div className="panel" style={{ flex: 1, minHeight: 300, display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header">
              <span className="panel-title">Array State Visualizer</span>
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

          {currentFrame && (
            <div className="step-bar">
              <div className="step-bar-desc">
                {currentFrame.action === 'SWAP' && '🔄 '}
                {currentFrame.action === 'MARK_SORTED' && '✨ '}
                {currentFrame.description}
              </div>
              {currentFrame.explanation && (
                <div className="step-bar-explain">{currentFrame.explanation}</div>
              )}
            </div>
          )}

          <PlaybackControls playback={playback} />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Sorting Inputs</span>
            </div>
            <div className="panel-body">
              <InputPanel
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                placeholder="Enter comma-separated values (e.g. 12, 5, 8, 30)"
                label="ARRAY DATA"
                buttonText="RUN SORT"
                presets={presets.sorting}
                disabled={isPlaying}
              />
            </div>
          </div>

          <StateInspector
            metrics={currentFrame?.metrics}
            stateSnapshot={currentFrame?.stateSnapshot}
          />

          <PseudocodePanel
            pseudocode={sortingPseudocode[algoId]}
            codeLineIndex={currentFrame?.codeLineIndex ?? -1}
          />

          <ComplexityCard complexity={complexities[algoId]} />
        </div>
      </div>
    </div>
  )
}
