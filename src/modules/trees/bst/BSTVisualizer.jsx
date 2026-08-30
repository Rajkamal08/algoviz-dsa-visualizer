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
        {/* Visual Canvas Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <span className="panel-title">Tree Canvas</span>
            </div>
            <div className="panel-body" style={{ padding: 0, position: 'relative' }}>
              <TreeRenderer
                root={currentTreeRoot}
                highlighted={currentFrame?.highlightedNodes || []}
                activeId={activeNodeId}
                foundId={isFound ? activeNodeId : null}
              />
            </div>
          </div>

          {/* Action Explainer bar */}
          {currentFrame && (
            <div className="step-bar">
              <div className="step-bar-desc">
                {isFound && '✨ '}
                {isNotFound && '⚠️ '}
                {currentFrame.description}
              </div>
              {currentFrame.explanation && (
                <div className="step-bar-explain">{currentFrame.explanation}</div>
              )}
            </div>
          )}

          {/* Media Playback bar */}
          <PlaybackControls playback={playback} />
        </div>

        {/* Info & Code Sidebar Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
          {/* Inputs */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Execution Controls</span>
            </div>
            <div className="panel-body">
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
          </div>

          {/* State Variables Inspector */}
          <StateInspector
            metrics={currentFrame?.metrics}
            stateSnapshot={currentFrame?.stateSnapshot}
          />

          {/* Code panel */}
          <PseudocodePanel
            pseudocode={bstPseudocode[opMode]}
            codeLineIndex={currentFrame?.codeLineIndex ?? -1}
          />

          {/* Complexity Cards */}
          <ComplexityCard complexity={bstComplexities} />
        </div>
      </div>
    </div>
  )
}
