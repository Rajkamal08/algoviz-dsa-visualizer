/**
 * BSTVisualizer.jsx
 *
 * Binary Search Tree visualizer container.
 * Connects usePlayback state and render engines to the BST algorithm instance.
 */

import { useEffect, useState } from 'react'
import usePlayback from '../../../core/playback/usePlayback.js'
import TreeRenderer from '../../../renderers/TreeRenderer/index.jsx'
import PlaybackControls from '../../../components/playback/PlaybackControls.jsx'
import PseudocodePanel from '../../../components/playback/PseudocodePanel.jsx'
import ComplexityCard from '../../../components/playback/ComplexityCard.jsx'
import StateInspector from '../../../components/playback/StateInspector.jsx'
import InputPanel from '../../../components/common/InputPanel.jsx'
import { bstPseudocode } from '../../../data/pseudocode/bst.js'
import { bstComplexities } from '../../../data/complexities/bst.js'
import { bstPresets } from '../../../data/presets/bst.js'
import BST from './BST.js'

export default function BSTVisualizer({ onStatusChange }) {
  const [bst] = useState(() => new BST())
  const [inputValue, setInputValue] = useState('')
  const [opMode, setOpMode] = useState('insert') // 'insert' | 'search' | 'delete'
  const [frames, setFrames] = useState([])

  const playback = usePlayback(frames)
  const { currentFrame, isPlaying } = playback

  // Load a balanced tree on initial render so screen isn't empty
  useEffect(() => {
    handleLoadPreset(bstPresets[0].value)
  }, [])

  // Sync state machine status to the header bar
  useEffect(() => {
    if (isPlaying) {
      onStatusChange?.('running', `Visualizing BST ${opMode}...`)
    } else if (currentFrame?.action === 'DONE') {
      onStatusChange?.('done', currentFrame.description)
    } else {
      onStatusChange?.('ready', '')
    }
  }, [isPlaying, currentFrame, opMode])

  const handleLoadPreset = (valStr) => {
    // Re-instantiate clean tree
    bst.root = null
    const keys = valStr
      .split(',')
      .map((k) => parseInt(k.trim(), 10))
      .filter((k) => !isNaN(k))

    let lastFrames = []
    for (const key of keys) {
      lastFrames = bst.insert(key)
    }
    setFrames(lastFrames)
    setInputValue('')
  }

  const handleSubmit = () => {
    const key = parseInt(inputValue.trim(), 10)
    if (isNaN(key)) return

    let nextFrames = []
    if (opMode === 'insert') {
      nextFrames = bst.insert(key)
    } else if (opMode === 'search') {
      nextFrames = bst.search(key)
    } else if (opMode === 'delete') {
      nextFrames = bst.deleteNode(key)
    }

    setFrames(nextFrames)
    setInputValue('')
  }

  const currentTreeRoot = currentFrame?.stateSnapshot?.root ?? bst.root
  const activeNodeId = currentFrame?.highlightedNodes?.[0] ?? null
  const isFound = currentFrame?.action === 'FOUND'
  const isNotFound = currentFrame?.action === 'NOT_FOUND'

  return (
    <div className="module-page">
      {/* Title Header */}
      <div className="module-header">
        <div className="module-eyebrow">🌳 Trees & Indexes</div>
        <h2 className="module-title">Binary Search Tree (BST)</h2>
        <p className="module-desc">
          A node-based binary tree where the left subtree contains keys smaller than the node, and the right subtree contains keys greater.
        </p>
      </div>

      {/* Operation Tabs */}
      <div className="module-tabs" role="tablist">
        {[
          { id: 'insert', label: 'Insert Node' },
          { id: 'search', label: 'Search Key' },
          { id: 'delete', label: 'Delete Node' },
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

      {/* Main Layout Grid */}
      <div className="module-body">

        {/* ── LEFT: Visualization Canvas ─────────────────────────── */}
        <div className="viz-canvas-area">
          {/* Canvas hero */}
          <div className="viz-canvas-hero">
            <TreeRenderer
              root={currentTreeRoot}
              highlighted={currentFrame?.highlightedNodes || []}
              activeId={activeNodeId}
              foundId={isFound ? activeNodeId : null}
            />
          </div>

          {/* Playback docked below canvas */}
          <div className="viz-playback-section">
            <PlaybackControls playback={playback} />
          </div>

          {/* Step explanation docked below playback */}
          <div className="viz-step-section">
            {currentFrame ? (
              <>
                <div className="step-bar-desc">
                  {isFound && '✨ '}
                  {isNotFound && '⚠️ '}
                  {currentFrame.description}
                </div>
                {currentFrame.explanation && (
                  <div className="step-bar-explain">{currentFrame.explanation}</div>
                )}
              </>
            ) : (
              <div className="step-bar-explain" style={{ color: 'var(--text-muted)' }}>
                Enter a value and run an operation to begin.
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Info Panel ──────────────────────────────────── */}
        <div className="viz-info-panel">

          {/* 1. Execution Controls — always at top */}
          <div className="viz-controls-section">
            <div className="section-label">Execution Controls</div>
            <InputPanel
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSubmit}
              placeholder={
                opMode === 'insert'
                  ? 'Enter key to insert (e.g. 45)'
                  : opMode === 'search'
                  ? 'Enter key to search (e.g. 70)'
                  : 'Enter key to delete (e.g. 30)'
              }
              label={opMode.toUpperCase()}
              buttonText={opMode.toUpperCase()}
              presets={opMode === 'insert' ? bstPresets : []}
              disabled={isPlaying}
            />
          </div>

          {/* 2. Pseudocode — fills remaining space */}
          <div className="viz-code-section">
            <div className="section-label">Pseudocode</div>
            <PseudocodePanel
              pseudocode={bstPseudocode[opMode]}
              codeLineIndex={currentFrame?.codeLineIndex ?? -1}
            />
          </div>

          {/* 3. State Inspector — compact */}
          <div className="viz-state-section">
            <div className="section-label">State</div>
            <StateInspector
              metrics={currentFrame?.metrics}
              stateSnapshot={currentFrame?.stateSnapshot}
            />
          </div>

          {/* 4. Complexity — one compact row */}
          <div className="viz-complexity-section">
            <div className="section-label">Complexity</div>
            <div className="complexity-compact-row">
              <div className="complexity-chip" title="Best case time complexity">
                <span className="complexity-chip-label">Best</span>
                <span className="complexity-chip-value best">{bstComplexities.best}</span>
              </div>
              <div className="complexity-chip" title="Average case time complexity">
                <span className="complexity-chip-label">Avg</span>
                <span className="complexity-chip-value avg">{bstComplexities.avg}</span>
              </div>
              <div className="complexity-chip" title="Worst case time complexity">
                <span className="complexity-chip-label">Worst</span>
                <span className="complexity-chip-value worst">{bstComplexities.worst}</span>
              </div>
              <div className="complexity-chip" title="Space complexity">
                <span className="complexity-chip-label">Space</span>
                <span className="complexity-chip-value space">{bstComplexities.space}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
