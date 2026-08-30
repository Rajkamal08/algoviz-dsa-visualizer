/**
 * TrieVisualizer.jsx
 *
 * Trie prefix tree visualizer view.
 */

import { useEffect, useState } from 'react'
import usePlayback from '../../../core/playback/usePlayback.js'
import TreeRenderer from '../../../renderers/TreeRenderer/index.jsx'
import PlaybackControls from '../../../components/playback/PlaybackControls.jsx'
import PseudocodePanel from '../../../components/playback/PseudocodePanel.jsx'
import ComplexityCard from '../../../components/playback/ComplexityCard.jsx'
import StateInspector from '../../../components/playback/StateInspector.jsx'
import InputPanel from '../../../components/common/InputPanel.jsx'
import { triePseudocode } from '../../../data/pseudocode/trie.js'
import { trieComplexities } from '../../../data/complexities/trie.js'
import { triePresets } from '../../../data/presets/trie.js'
import Trie from './Trie.js'

export default function TrieVisualizer({ onStatusChange }) {
  const [trie] = useState(() => new Trie())
  const [inputValue, setInputValue] = useState('')
  const [opMode, setOpMode] = useState('insert') // 'insert' | 'search'
  const [frames, setFrames] = useState([])

  const playback = usePlayback(frames)
  const { currentFrame, isPlaying } = playback

  useEffect(() => {
    handleLoadPreset(triePresets[0].value) // Default to preset words list
  }, [])

  useEffect(() => {
    if (isPlaying) {
      onStatusChange?.('running', `Visualizing Trie ${opMode}...`)
    } else if (currentFrame?.action === 'DONE') {
      onStatusChange?.('done', currentFrame.description)
    } else {
      onStatusChange?.('ready', '')
    }
  }, [isPlaying, currentFrame, opMode])

  const handleLoadPreset = (valStr) => {
    trie.root = new trie.root.constructor() // Re-instantiate root
    const words = valStr
      .split(',')
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0)

    let lastFrames = []
    for (const w of words) {
      lastFrames = trie.insert(w)
    }
    setFrames(lastFrames)
    setInputValue('')
  }

  const handleSubmit = () => {
    const word = inputValue.trim().toLowerCase()
    if (!word) return

    let nextFrames = []
    if (opMode === 'insert') {
      nextFrames = trie.insert(word)
    } else if (opMode === 'search') {
      nextFrames = trie.search(word)
    }

    setFrames(nextFrames)
    setInputValue('')
  }

  const currentTreeRoot = currentFrame?.stateSnapshot?.root ?? null
  const activeNodeId = currentFrame?.highlightedNodes?.[0] ?? null
  const isFound = currentFrame?.action === 'FOUND'
  const isNotFound = currentFrame?.action === 'NOT_FOUND'

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-eyebrow">🌳 Trees & Indexes</div>
        <h2 className="module-title">Trie (Prefix Tree)</h2>
        <p className="module-desc">
          An ordered search tree used to store associative arrays where keys are usually strings. Nodes share common prefixes.
        </p>
      </div>

      {/* Operation Tabs */}
      <div className="module-tabs" role="tablist">
        {[
          { id: 'insert', label: 'Insert Word' },
          { id: 'search', label: 'Search Word / Prefix' },
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
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <span className="panel-title">Trie Tree Canvas</span>
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

          <PlaybackControls playback={playback} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Trie Controls</span>
            </div>
            <div className="panel-body">
              <InputPanel
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                placeholder={
                  opMode === 'insert'
                    ? 'Enter word to insert (e.g. apple)'
                    : 'Enter word to search (e.g. car)'
                }
                label="WORD VALUE"
                buttonText={opMode.toUpperCase()}
                presets={opMode === 'insert' ? triePresets : []}
                disabled={isPlaying}
              />
            </div>
          </div>

          <StateInspector
            metrics={currentFrame?.metrics}
            stateSnapshot={currentFrame?.stateSnapshot}
          />

          <PseudocodePanel
            pseudocode={triePseudocode[opMode]}
            codeLineIndex={currentFrame?.codeLineIndex ?? -1}
          />

          <ComplexityCard complexity={trieComplexities} />
        </div>
      </div>
    </div>
  )
}
