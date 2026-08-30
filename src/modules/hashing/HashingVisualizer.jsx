/**
 * HashingVisualizer.jsx
 * 
 * Visualizer for Separate Chaining and Open Addressing hash tables.
 * Renders a custom hash table grid — each bucket is a horizontal row of cells.
 */

import { useEffect, useState } from 'react'
import usePlayback from '../../core/playback/usePlayback.js'
import PlaybackControls from '../../components/playback/PlaybackControls.jsx'
import PseudocodePanel from '../../components/playback/PseudocodePanel.jsx'
import ComplexityCard from '../../components/playback/ComplexityCard.jsx'
import StateInspector from '../../components/playback/StateInspector.jsx'
import { hashingPseudocode } from '../../data/pseudocode/hashing.js'
import { complexities } from '../../data/complexities/index.js'
import { presets } from '../../data/presets/index.js'
import { runHashChain } from './algorithms/chaining.js'
import { runOpenAddressing } from './algorithms/openAddressing.js'

const ALGOS = {
  'hash-chain': { label: 'Separate Chaining' },
  'hash-open':  { label: 'Open Addressing (Linear Probe)' },
}

/** Renders a single hash table bucket row */
function BucketRow({ index, cells, isChain, highlighted }) {
  const isActive = highlighted === index
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      {/* Bucket index label */}
      <div style={{
        minWidth: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-tertiary)', borderRadius: 6,
        fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
        border: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'all 0.2s',
      }}>
        [{index}]
      </div>

      {/* Cells */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {isChain ? (
          // Chaining: show linked list of values
          cells.length === 0 ? (
            <div style={{
              minWidth: 48, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-secondary)', borderRadius: 6,
              border: '1.5px dashed var(--border-default)', color: 'var(--text-muted)', fontSize: 11,
            }}>empty</div>
          ) : (
            cells.map((val, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{
                  minWidth: 48, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                  border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border-default)'}`,
                  borderRadius: 6, fontWeight: 700, fontSize: 13,
                  color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                  transition: 'all 0.2s',
                }}>
                  {val}
                </div>
                {i < cells.length - 1 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</div>
                )}
              </div>
            ))
          )
        ) : (
          // Open addressing: single cell per slot
          <div style={{
            minWidth: 58, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: cells === null
              ? 'var(--bg-secondary)'
              : isActive
                ? 'var(--accent-dim)'
                : 'var(--bg-tertiary)',
            border: `1.5px solid ${
              cells === null
                ? 'var(--border-default)'
                : isActive
                  ? 'var(--accent)'
                  : 'var(--border-muted, var(--border-default))'
            }`,
            borderRadius: 6, fontWeight: 700, fontSize: 13,
            color: cells === null
              ? 'var(--text-muted)'
              : isActive
                ? 'var(--accent)'
                : 'var(--text-primary)',
            transition: 'all 0.2s',
          }}>
            {cells === null ? '—' : cells === 'DEL' ? '✗' : cells}
          </div>
        )}
      </div>
    </div>
  )
}

export default function HashingVisualizer({ onStatusChange }) {
  const [algoId, setAlgoId] = useState('hash-chain')
  const [inputValue, setInputValue] = useState('')
  const [tableSizeInput, setTableSizeInput] = useState('7')
  const [frames, setFrames] = useState([])
  const [defaultKeys, setDefaultKeys] = useState([5, 14, 21, 8, 3, 28, 12])
  const [defaultSize, setDefaultSize] = useState(7)

  const playback = usePlayback(frames)
  const { currentFrame, isPlaying } = playback

  useEffect(() => {
    handleRunHash(defaultKeys, defaultSize, algoId)
  }, [algoId])

  useEffect(() => {
    if (isPlaying) {
      onStatusChange?.('running', `Building ${ALGOS[algoId].label} hash table...`)
    } else if (currentFrame?.action === 'DONE') {
      onStatusChange?.('done', currentFrame.description)
    } else {
      onStatusChange?.('ready', '')
    }
  }, [isPlaying, currentFrame, algoId])

  const handleRunHash = (keys, size, currentAlgoId) => {
    const fn = currentAlgoId === 'hash-chain' ? runHashChain : runOpenAddressing
    const nextFrames = fn(keys, size)
    setFrames(nextFrames)
  }

  const handleLoadPreset = (valStr) => {
    const sections = valStr.split('|')
    const keys = sections[0].split(',').map((k) => parseInt(k.trim(), 10)).filter((k) => !isNaN(k))
    const size = parseInt(sections[1]?.trim() || '7', 10)
    setDefaultKeys(keys)
    setDefaultSize(size)
    setTableSizeInput(String(size))
    handleRunHash(keys, size, algoId)
    setInputValue('')
  }

  const handleSubmit = () => {
    const keys = inputValue.split(',').map((k) => parseInt(k.trim(), 10)).filter((k) => !isNaN(k))
    const size = parseInt(tableSizeInput.trim(), 10) || 7
    if (keys.length === 0) return
    setDefaultKeys(keys)
    setDefaultSize(size)
    handleRunHash(keys, size, algoId)
    setInputValue('')
  }

  const isChain = algoId === 'hash-chain'
  const currentTable = currentFrame?.stateSnapshot?.table || (isChain ? [] : [])
  const highlighted  = currentFrame?.highlightedNodes?.[0] ?? null

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-eyebrow">#️⃣ Hashing</div>
        <h2 className="module-title">{ALGOS[algoId].label}</h2>
        <p className="module-desc">
          Watch hash function collisions get resolved through chaining or slot probing.
        </p>
      </div>

      {/* Tabs */}
      <div className="module-tabs" role="tablist">
        {Object.entries(ALGOS).map(([id, item]) => (
          <button key={id} role="tab" aria-selected={algoId === id}
            className={`module-tab ${algoId === id ? 'active' : ''}`}
            onClick={() => setAlgoId(id)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="module-body">
        {/* Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <span className="panel-title">Hash Table (size {currentFrame?.stateSnapshot?.tableSize ?? defaultSize})</span>
            </div>
            <div className="panel-body" style={{ overflowY: 'auto', maxHeight: 420 }}>
              {isChain
                ? currentTable.map((bucket, idx) => (
                    <BucketRow key={idx} index={idx} cells={bucket} isChain highlighted={highlighted} />
                  ))
                : currentTable.map((val, idx) => (
                    <BucketRow key={idx} index={idx} cells={val} isChain={false} highlighted={highlighted} />
                  ))
              }
            </div>
          </div>

          {currentFrame && (
            <div className="step-bar">
              <div className="step-bar-desc">
                {currentFrame.action === 'INSERT_NODE' && '📌 '}
                {currentFrame.action === 'COMPARE'     && '🔍 '}
                {currentFrame.description}
              </div>
            </div>
          )}

          <PlaybackControls playback={playback} />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Inputs</span></div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div className="input-label">KEYS (comma-separated)</div>
                <input className="input-field" type="text" value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. 5, 14, 21, 8" disabled={isPlaying} />
              </div>
              <div>
                <div className="input-label">TABLE SIZE</div>
                <input className="input-field" type="number" value={tableSizeInput}
                  onChange={(e) => setTableSizeInput(e.target.value)}
                  placeholder="e.g. 7" disabled={isPlaying} />
              </div>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={isPlaying}>
                BUILD HASH TABLE
              </button>
              <div>
                <div className="input-label">PRESETS</div>
                <div className="preset-row">
                  {presets.hashing.map((p) => (
                    <button key={p.label} type="button" className="preset-btn"
                      onClick={() => handleLoadPreset(p.value)} disabled={isPlaying}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <StateInspector metrics={currentFrame?.metrics} stateSnapshot={currentFrame?.stateSnapshot} />

          <PseudocodePanel pseudocode={hashingPseudocode[algoId]} codeLineIndex={currentFrame?.codeLineIndex ?? -1} />

          <ComplexityCard complexity={complexities[algoId]} />
        </div>
      </div>
    </div>
  )
}
