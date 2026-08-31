/**
 * BacktrackingVisualizer.jsx
 *
 * Visualizer for N-Queens backtracking.
 * Renders a chess board grid with queens, conflict highlights, and backtrack trails.
 */

import { useEffect, useState } from 'react'
import usePlayback from '../../core/playback/usePlayback.js'
import PlaybackControls from '../../components/playback/PlaybackControls.jsx'
import PseudocodePanel from '../../components/playback/PseudocodePanel.jsx'
import ComplexityCard from '../../components/playback/ComplexityCard.jsx'
import StateInspector from '../../components/playback/StateInspector.jsx'
import { backtrackingPseudocode } from '../../data/pseudocode/backtracking.js'
import { complexities } from '../../data/complexities/index.js'
import { presets } from '../../data/presets/index.js'
import { runNQueens } from './algorithms/nqueens.js'

/** Chessboard tile */
function QueenCell({ row, col, n, value, isActive, isBad }) {
  const isLight = (row + col) % 2 === 0
  let bg = isLight ? '#2d2d44' : '#1a1a2e'
  if (isActive) bg = 'rgba(99, 179, 237, 0.4)'
  if (isBad)    bg = 'rgba(245, 101, 101, 0.3)'
  if (value === 'Q') bg = isActive ? 'rgba(99, 179, 237, 0.6)' : 'rgba(72, 199, 142, 0.4)'

  const size = Math.max(36, Math.min(72, Math.floor(480 / n)))

  return (
    <div style={{
      width: size, height: size,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5,
      border: isActive
        ? '2px solid rgba(99, 179, 237, 0.8)'
        : isBad
          ? '2px solid rgba(245, 101, 101, 0.6)'
          : '1px solid rgba(255,255,255,0.06)',
      borderRadius: 4,
      transition: 'all 0.15s ease',
      cursor: 'default',
      userSelect: 'none',
    }}>
      {value === 'Q' ? '♛' : ''}
    </div>
  )
}

export default function BacktrackingVisualizer({ onStatusChange }) {
  const [n, setN] = useState(5)
  const [inputN, setInputN] = useState('5')
  const [frames, setFrames] = useState([])

  const playback = usePlayback(frames)
  const { currentFrame, isPlaying } = playback

  useEffect(() => { handleRun(n) }, [])

  useEffect(() => {
    if (isPlaying) {
      onStatusChange?.('running', 'Running N-Queens backtracking...')
    } else if (currentFrame?.action === 'DONE') {
      onStatusChange?.('done', currentFrame.description)
    } else {
      onStatusChange?.('ready', '')
    }
  }, [isPlaying, currentFrame])

  const handleRun = (size) => {
    const nextFrames = runNQueens(size)
    setFrames(nextFrames)
  }

  const board = currentFrame?.stateSnapshot?.board || Array.from({ length: n }, () => Array(n).fill('.'))
  const activeCells = currentFrame?.stateSnapshot?.activeCells || []
  const badCells    = currentFrame?.stateSnapshot?.badCells    || []

  const isActiveCell = (r, c) => activeCells.some(([ar, ac]) => ar === r && ac === c)
  const isBadCell    = (r, c) => badCells.some(([br, bc]) => br === r && bc === c)

  const queensPlaced = board.reduce((acc, row) => acc + row.filter((c) => c === 'Q').length, 0)
  const solutions = currentFrame?.stateSnapshot?.solutions ?? 0

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-eyebrow">♛ Backtracking</div>
        <h2 className="module-title">N-Queens Problem</h2>
        <p className="module-desc">
          Place {n} queens on a {n}×{n} chessboard so no two queens threaten each other.
          Watch the algorithm try, fail, and backtrack.
        </p>
      </div>

      <div className="module-body">
        {/* ── LEFT: Board Canvas & Playback ───────────────── */}
        <div className="viz-canvas-area">
          <div className="viz-canvas-hero" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {board.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: 2 }}>
                  {row.map((cell, ci) => (
                    <QueenCell
                      key={ci}
                      row={ri} col={ci} n={n}
                      value={cell}
                      isActive={isActiveCell(ri, ci)}
                      isBad={isBadCell(ri, ci)}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, padding: '0 4px', flexWrap: 'wrap' }}>
              {[
                { color: 'rgba(72, 199, 142, 0.5)',  label: '♛ Queen placed' },
                { color: 'rgba(99, 179, 237, 0.4)',  label: '🔍 Trying' },
                { color: 'rgba(245, 101, 101, 0.3)', label: '⚠️ Conflict / Backtrack' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                  <div style={{ width: 12, height: 12, background: color, borderRadius: 2 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="viz-playback-section">
            <PlaybackControls playback={playback} />
          </div>

          <div className="viz-step-section">
            {currentFrame ? (
              <div className="step-bar-desc">
                {currentFrame.action === 'FOUND'      && '🎉 '}
                {currentFrame.action === 'NOT_FOUND'  && '⚠️ '}
                {currentFrame.action === 'INSERT_NODE' && '✅ '}
                {currentFrame.action === 'STEP_LABEL' && '↩️ '}
                {currentFrame.description}
              </div>
            ) : (
              <div className="step-bar-explain" style={{ color: 'var(--text-muted)' }}>
                Set N and click Solve N-Queens to begin.
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Info Panel ──────────────────────────────── */}
        <div className="viz-info-panel">
          <div className="viz-controls-section">
            <div className="section-label">Execution Controls</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>BOARD SIZE (N)</span>
                  <input className="input-field" type="number" min="1" max="10"
                    style={{ padding: '6px 10px', fontSize: 13, marginTop: 2 }}
                    value={inputN}
                    onChange={(e) => setInputN(e.target.value)}
                    placeholder="e.g. 5" disabled={isPlaying} />
                </div>
                <button className="btn btn-primary btn-sm"
                  style={{ marginTop: 14 }}
                  onClick={() => { const size = parseInt(inputN, 10) || 5; setN(size); handleRun(size) }}
                  disabled={isPlaying}>
                  SOLVE
                </button>
              </div>
              <div className="preset-row">
                {presets.backtracking.map((p) => (
                  <button key={p.label} type="button" className="preset-btn"
                    onClick={() => { const s = parseInt(p.value, 10); setN(s); setInputN(p.value); handleRun(s) }}
                    disabled={isPlaying}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="viz-code-section">
            <div className="section-label">Pseudocode</div>
            <PseudocodePanel pseudocode={backtrackingPseudocode.nqueens} codeLineIndex={currentFrame?.codeLineIndex ?? -1} />
          </div>

          <div className="viz-state-section">
            <div className="section-label">State</div>
            <StateInspector
              metrics={currentFrame?.metrics}
              stateSnapshot={currentFrame ? { n, queensPlaced, solutions } : null}
            />
          </div>

          <div className="viz-complexity-section">
            <div className="section-label">Complexity</div>
            <ComplexityCard complexity={complexities.nqueens} />
          </div>
        </div>
      </div>
    </div>
  )
}
