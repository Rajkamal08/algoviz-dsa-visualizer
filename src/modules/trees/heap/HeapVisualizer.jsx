/**
 * HeapVisualizer.jsx
 *
 * Max-Heap visualizer showing both Tree and Array representations side-by-side.
 */

import { useEffect, useState } from 'react'
import usePlayback from '../../../core/playback/usePlayback.js'
import TreeRenderer from '../../../renderers/TreeRenderer/index.jsx'
import ArrayRenderer from '../../../renderers/ArrayRenderer/index.jsx'
import PlaybackControls from '../../../components/playback/PlaybackControls.jsx'
import PseudocodePanel from '../../../components/playback/PseudocodePanel.jsx'
import ComplexityCard from '../../../components/playback/ComplexityCard.jsx'
import StateInspector from '../../../components/playback/StateInspector.jsx'
import InputPanel from '../../../components/common/InputPanel.jsx'
import { heapPseudocode } from '../../../data/pseudocode/heap.js'
import { heapComplexities } from '../../../data/complexities/heap.js'
import { heapPresets } from '../../../data/presets/heap.js'
import Heap from './Heap.js'

export default function HeapVisualizer({ onStatusChange }) {
  const [heap] = useState(() => new Heap())
  const [inputValue, setInputValue] = useState('')
  const [opMode, setOpMode] = useState('insert') // 'insert' | 'extract'
  const [frames, setFrames] = useState([])

  const playback = usePlayback(frames)
  const { currentFrame, isPlaying } = playback

  useEffect(() => {
    handleLoadPreset(heapPresets[0].value) // Default to Min-Heap Demo
  }, [])

  useEffect(() => {
    if (isPlaying) {
      onStatusChange?.('running', `Visualizing Heap ${opMode}...`)
    } else if (currentFrame?.action === 'DONE') {
      onStatusChange?.('done', currentFrame.description)
    } else {
      onStatusChange?.('ready', '')
    }
  }, [isPlaying, currentFrame, opMode])

  const handleLoadPreset = (valStr) => {
    heap.array = []
    const keys = valStr
      .split(',')
      .map((k) => parseInt(k.trim(), 10))
      .filter((k) => !isNaN(k))

    let lastFrames = []
    for (const key of keys) {
      lastFrames = heap.insert(key)
    }
    setFrames(lastFrames)
    setInputValue('')
  }

  const handleSubmit = () => {
    let nextFrames = []
    if (opMode === 'insert') {
      const key = parseInt(inputValue.trim(), 10)
      if (isNaN(key)) return
      nextFrames = heap.insert(key)
    } else if (opMode === 'extract') {
      nextFrames = heap.extractMax()
    }

    setFrames(nextFrames)
    setInputValue('')
  }

  const currentTreeRoot = currentFrame?.stateSnapshot?.root ?? null
  const currentArray = currentFrame?.stateSnapshot?.array ?? heap.array
  const highlighted = currentFrame?.highlightedNodes ?? []

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-eyebrow">🌳 Trees & Indexes</div>
        <h2 className="module-title">Min / Max Heap (Binary Heap)</h2>
        <p className="module-desc">
          A complete binary tree stored in an array where parent nodes satisfy the heap property (Max-Heap: parent &gt;= children).
        </p>
      </div>

      {/* Operation Tabs */}
      <div className="module-tabs" role="tablist">
        {[
          { id: 'insert', label: 'Insert Element' },
          { id: 'extract', label: 'Extract Max' },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={opMode === tab.id}
            className={`module-tab ${opMode === tab.id ? 'active' : ''}`}
            onClick={() => setOpMode(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="module-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Tree and Array side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
            {/* Tree representation */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Tree Representation</span>
              </div>
              <div className="panel-body" style={{ padding: 0, position: 'relative' }}>
                <TreeRenderer
                  root={currentTreeRoot}
                  highlighted={highlighted}
                  activeId={highlighted.length > 0 ? highlighted[0] : null}
                  foundId={currentFrame?.action === 'SWAP' ? highlighted[1] : null}
                />
              </div>
            </div>

            {/* Array representation */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Array Representation</span>
              </div>
              <div className="panel-body" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <ArrayRenderer
                  values={currentArray}
                  highlighted={highlighted}
                  compared={currentFrame?.action === 'COMPARE' ? highlighted : []}
                  sorted={[]}
                  pivot={null}
                />
              </div>
            </div>
          </div>

          {currentFrame && (
            <div className="step-bar">
              <div className="step-bar-desc">
                {currentFrame.action === 'SWAP' && '🔄 '}
                {currentFrame.description}
              </div>
              {currentFrame.explanation && (
                <div className="step-bar-explain">{currentFrame.explanation}</div>
              )}
            </div>
          )}

          <PlaybackControls playback={playback} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Operation Controls</span>
            </div>
            <div className="panel-body">
              {opMode === 'insert' ? (
                <InputPanel
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={handleSubmit}
                  placeholder="Enter value to insert (e.g. 25)"
                  label="INSERT VALUE"
                  buttonText="INSERT"
                  presets={heapPresets}
                  disabled={isPlaying}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="input-label">Extract Max (Root Node)</div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isPlaying || currentArray.length === 0}
                  >
                    👑 Extract Max Value
                  </button>
                </div>
              )}
            </div>
          </div>

          <StateInspector
            metrics={currentFrame?.metrics}
            stateSnapshot={currentFrame?.stateSnapshot}
          />

          <PseudocodePanel
            pseudocode={heapPseudocode[opMode]}
            codeLineIndex={currentFrame?.codeLineIndex ?? -1}
          />

          <ComplexityCard complexity={heapComplexities} />
        </div>
      </div>
    </div>
  )
}
