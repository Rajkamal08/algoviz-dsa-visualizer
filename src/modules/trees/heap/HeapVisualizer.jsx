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
        {/* ── LEFT: Canvas & Playback ────────────────────────── */}
        <div className="viz-canvas-area">
          <div className="viz-canvas-hero" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ position: 'relative', height: '100%', minHeight: 0 }}>
              <TreeRenderer
                root={currentTreeRoot}
                highlighted={highlighted}
                activeId={highlighted.length > 0 ? highlighted[0] : null}
                foundId={currentFrame?.action === 'SWAP' ? highlighted[1] : null}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100%', minHeight: 0, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <ArrayRenderer
                values={currentArray}
                highlighted={highlighted}
                compared={currentFrame?.action === 'COMPARE' ? highlighted : []}
                sorted={[]}
                pivot={null}
              />
            </div>
          </div>

          <div className="viz-playback-section">
            <PlaybackControls playback={playback} />
          </div>

          <div className="viz-step-section">
            {currentFrame ? (
              <>
                <div className="step-bar-desc">
                  {currentFrame.action === 'SWAP' && '🔄 '}
                  {currentFrame.description}
                </div>
                {currentFrame.explanation && (
                  <div className="step-bar-explain">{currentFrame.explanation}</div>
                )}
              </>
            ) : (
              <div className="step-bar-explain" style={{ color: 'var(--text-muted)' }}>
                Select an operation and click to begin.
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Info Panel ──────────────────────────────── */}
        <div className="viz-info-panel">
          <div className="viz-controls-section">
            <div className="section-label">Execution Controls</div>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={isPlaying || currentArray.length === 0}
                  style={{ width: '100%' }}
                >
                  👑 Extract Max Value
                </button>
              </div>
            )}
          </div>

          <div className="viz-code-section">
            <div className="section-label">Pseudocode</div>
            <PseudocodePanel
              pseudocode={heapPseudocode[opMode]}
              codeLineIndex={currentFrame?.codeLineIndex ?? -1}
            />
          </div>

          <div className="viz-state-section">
            <div className="section-label">State</div>
            <StateInspector
              metrics={currentFrame?.metrics}
              stateSnapshot={currentFrame?.stateSnapshot}
            />
          </div>

          <div className="viz-complexity-section">
            <div className="section-label">Complexity</div>
            <ComplexityCard complexity={heapComplexities} />
          </div>
        </div>
      </div>
    </div>
  )
}
