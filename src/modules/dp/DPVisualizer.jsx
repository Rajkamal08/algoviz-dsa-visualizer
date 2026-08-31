/**
 * DPVisualizer.jsx
 *
 * Dynamic programming visualizer page.
 * Renders ArrayRenderer for 1D tabulation (Fibonacci) and TableRenderer for 2D tabulation (LCS).
 */

import { useEffect, useState } from 'react'
import usePlayback from '../../core/playback/usePlayback.js'
import ArrayRenderer from '../../renderers/ArrayRenderer/index.jsx'
import TableRenderer from '../../renderers/TableRenderer/index.jsx'
import PlaybackControls from '../../components/playback/PlaybackControls.jsx'
import PseudocodePanel from '../../components/playback/PseudocodePanel.jsx'
import ComplexityCard from '../../components/playback/ComplexityCard.jsx'
import StateInspector from '../../components/playback/StateInspector.jsx'
import InputPanel from '../../components/common/InputPanel.jsx'
import { dpPseudocode } from '../../data/pseudocode/dp.js'
import { complexities } from '../../data/complexities/index.js'
import { presets } from '../../data/presets/index.js'

// Import DP algorithms
import { runFibonacci } from './algorithms/fibonacci.js'
import { runLCS } from './algorithms/lcs.js'

const ALGOS = {
  fibonacci: { label: 'Fibonacci Tabulation', sort: runFibonacci },
  lcs:       { label: 'Longest Common Subsequence (LCS)', sort: runLCS },
}

export default function DPVisualizer({ onStatusChange }) {
  const [algoId, setAlgoId] = useState('fibonacci')
  const [inputValue, setInputValue] = useState('')
  const [frames, setFrames] = useState([])

  // Default values
  const [fibN, setFibN] = useState(8)
  const [lcsStrings, setLcsStrings] = useState({ x: 'abcde', y: 'ace' })

  const playback = usePlayback(frames)
  const { currentFrame, isPlaying } = playback

  useEffect(() => {
    handleRunDP(algoId)
  }, [algoId, fibN, lcsStrings])

  useEffect(() => {
    if (isPlaying) {
      onStatusChange?.('running', `Tabulating ${ALGOS[algoId].label}...`)
    } else if (currentFrame?.action === 'DONE') {
      onStatusChange?.('done', currentFrame.description)
    } else {
      onStatusChange?.('ready', '')
    }
  }, [isPlaying, currentFrame, algoId])

  const handleRunDP = (currentAlgoId) => {
    let nextFrames = []
    if (currentAlgoId === 'fibonacci') {
      nextFrames = runFibonacci(fibN)
    } else if (currentAlgoId === 'lcs') {
      nextFrames = runLCS(lcsStrings.x, lcsStrings.y)
    }
    setFrames(nextFrames)
  }

  const handleLoadPreset = (valStr) => {
    if (algoId === 'fibonacci') {
      const n = parseInt(valStr.trim(), 10)
      if (!isNaN(n)) setFibN(n)
    } else if (algoId === 'lcs') {
      const parts = valStr.split(',')
      if (parts.length >= 2) {
        setLcsStrings({ x: parts[0].trim(), y: parts[1].trim() })
      }
    }
    setInputValue('')
  }

  const handleSubmit = () => {
    if (algoId === 'fibonacci') {
      const n = parseInt(inputValue.trim(), 10)
      if (!isNaN(n)) setFibN(n)
    } else if (algoId === 'lcs') {
      const parts = inputValue.split(',')
      if (parts.length >= 2) {
        setLcsStrings({ x: parts[0].trim(), y: parts[1].trim() })
      }
    }
    setInputValue('')
  }

  // Snapshot extracts
  const currentArray = currentFrame?.stateSnapshot?.array || []
  const currentTable = currentFrame?.stateSnapshot?.data || []
  const rowHeaders = currentFrame?.stateSnapshot?.rowHeaders || []
  const colHeaders = currentFrame?.stateSnapshot?.colHeaders || []
  const activeCells = currentFrame?.stateSnapshot?.activeCells || []
  const cacheHitCells = currentFrame?.stateSnapshot?.cacheHitCells || []
  const filledCells = currentFrame?.stateSnapshot?.filledCells || []

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-eyebrow">🐚 Dynamic Programming</div>
        <h2 className="module-title">{ALGOS[algoId].label}</h2>
        <p className="module-desc">
          Visualize subproblem tabulation caches where computed results are stored in arrays or grid matrices.
        </p>
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
        {/* ── LEFT: DP Canvas & Playback ───────────────────── */}
        <div className="viz-canvas-area">
          <div className="viz-canvas-hero" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {algoId === 'fibonacci' ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', width: '100%', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 16, border: '1px solid var(--border-subtle)' }}>
                <ArrayRenderer
                  values={currentArray}
                  highlighted={currentFrame?.highlightedNodes || []}
                  compared={currentFrame?.highlightedNodes || []}
                  sorted={[]}
                  pivot={null}
                />
              </div>
            ) : (
              <TableRenderer
                data={currentTable}
                rowHeaders={rowHeaders}
                colHeaders={colHeaders}
                activeCells={activeCells}
                cacheHitCells={cacheHitCells}
                filledCells={filledCells}
              />
            )}
          </div>

          <div className="viz-playback-section">
            <PlaybackControls playback={playback} />
          </div>

          <div className="viz-step-section">
            {currentFrame ? (
              <>
                <div className="step-bar-desc">
                  {currentFrame.action === 'COMPARE' && '🔍 '}
                  {currentFrame.description}
                </div>
                {currentFrame.explanation && (
                  <div className="step-bar-explain">{currentFrame.explanation}</div>
                )}
              </>
            ) : (
              <div className="step-bar-explain" style={{ color: 'var(--text-muted)' }}>
                Enter DP parameters or choose a preset to begin.
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Info Panel ──────────────────────────────── */}
        <div className="viz-info-panel">
          <div className="viz-controls-section">
            <div className="section-label">DP Parameters</div>
            <InputPanel
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSubmit}
              placeholder={
                algoId === 'fibonacci'
                  ? 'Enter N index (e.g. 10)'
                  : 'Enter comma-separated words (e.g. apple, ape)'
              }
              label="DP PARAMETERS"
              buttonText="LOAD VALUES"
              presets={presets.dp.filter((p) => {
                if (algoId === 'fibonacci') return p.label.includes('Fibonacci')
                return p.label.includes('LCS')
              })}
              disabled={isPlaying}
            />
          </div>

          <div className="viz-code-section">
            <div className="section-label">Pseudocode</div>
            <PseudocodePanel
              pseudocode={dpPseudocode[algoId]}
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
            <ComplexityCard complexity={complexities[algoId]} />
          </div>
        </div>
      </div>
    </div>
  )
}
