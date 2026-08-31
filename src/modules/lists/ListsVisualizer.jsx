/**
 * ListsVisualizer.jsx
 *
 * Visualizer container for Lists, Stack, and Queue.
 */

import { useEffect, useState } from 'react'
import usePlayback from '../../core/playback/usePlayback.js'
import TreeRenderer from '../../renderers/TreeRenderer/index.jsx'
import ArrayRenderer from '../../renderers/ArrayRenderer/index.jsx'
import PlaybackControls from '../../components/playback/PlaybackControls.jsx'
import PseudocodePanel from '../../components/playback/PseudocodePanel.jsx'
import ComplexityCard from '../../components/playback/ComplexityCard.jsx'
import StateInspector from '../../components/playback/StateInspector.jsx'
import InputPanel from '../../components/common/InputPanel.jsx'
import { listsPseudocode } from '../../data/pseudocode/lists.js'
import { complexities } from '../../data/complexities/index.js'
import { presets } from '../../data/presets/index.js'

// Import algorithm/structure managers
import LinkedList from './algorithms/linkedList.js'
import StackRec from './algorithms/stack.js'
import QueueRec from './algorithms/queue.js'

const ALGOS = {
  linkedList: { label: 'Singly Linked List' },
  stack:      { label: 'Stack (LIFO)' },
  queue:      { label: 'Queue (FIFO)' },
}

export default function ListsVisualizer({ onStatusChange }) {
  const [algoId, setAlgoId] = useState('linkedList')
  const [inputValue, setInputValue] = useState('')
  const [opMode, setOpMode] = useState('insert') // 'insert' | 'delete' for list, push/pop, enqueue/dequeue
  const [frames, setFrames] = useState([])

  // Instantiated engines
  const [listEngine] = useState(() => new LinkedList())
  const [stackEngine] = useState(() => new StackRec())
  const [queueEngine] = useState(() => new QueueRec())

  const playback = usePlayback(frames)
  const { currentFrame, isPlaying } = playback

  useEffect(() => {
    handleLoadPreset(presets.lists[0].value)
  }, [algoId])

  useEffect(() => {
    if (isPlaying) {
      onStatusChange?.('running', `Executing ${ALGOS[algoId].label} operations...`)
    } else if (currentFrame?.action === 'DONE') {
      onStatusChange?.('done', currentFrame.description)
    } else {
      onStatusChange?.('ready', '')
    }
  }, [isPlaying, currentFrame, algoId])

  const handleLoadPreset = (valStr) => {
    // Reset engines
    listEngine.nodes = []
    stackEngine.stack = []
    queueEngine.queue = []

    const items = valStr
      .split(',')
      .map((k) => parseInt(k.trim(), 10))
      .filter((k) => !isNaN(k))

    let lastFrames = []
    if (algoId === 'linkedList') {
      for (const val of items) {
        lastFrames = listEngine.insert(val)
      }
    } else if (algoId === 'stack') {
      for (const val of items) {
        lastFrames = stackEngine.push(val)
      }
    } else if (algoId === 'queue') {
      for (const val of items) {
        lastFrames = queueEngine.enqueue(val)
      }
    }
    setFrames(lastFrames)
    setInputValue('')
  }

  const handleSubmit = () => {
    let nextFrames = []
    const val = parseInt(inputValue.trim(), 10)

    if (algoId === 'linkedList') {
      if (opMode === 'insert') {
        if (isNaN(val)) return
        nextFrames = listEngine.insert(val)
      } else {
        if (isNaN(val)) return
        nextFrames = listEngine.deleteVal(val)
      }
    } else if (algoId === 'stack') {
      if (opMode === 'push') {
        if (isNaN(val)) return
        nextFrames = stackEngine.push(val)
      } else {
        nextFrames = stackEngine.pop()
      }
    } else if (algoId === 'queue') {
      if (opMode === 'enqueue') {
        if (isNaN(val)) return
        nextFrames = queueEngine.enqueue(val)
      } else {
        nextFrames = queueEngine.dequeue()
      }
    }

    setFrames(nextFrames)
    setInputValue('')
  }

  const currentTreeRoot = currentFrame?.stateSnapshot?.root ?? null
  const currentArray = currentFrame?.stateSnapshot?.array || []
  const highlighted = currentFrame?.highlightedNodes || []
  const currentHead = currentFrame?.stateSnapshot?.head
  const currentTail = currentFrame?.stateSnapshot?.tail

  // Determine pseudocode block to show
  let activePseudocode = []
  if (algoId === 'linkedList') {
    activePseudocode = listsPseudocode.linkedList[opMode] || []
  } else if (algoId === 'stack') {
    activePseudocode = listsPseudocode.stack[opMode] || []
  } else if (algoId === 'queue') {
    activePseudocode = listsPseudocode.queue[opMode] || []
  }

  // Update tabs if sub-mode switches
  const getSubModeTabs = () => {
    if (algoId === 'linkedList') {
      return [
        { id: 'insert', label: 'Insert Node' },
        { id: 'delete', label: 'Delete Value' },
      ]
    } else if (algoId === 'stack') {
      return [
        { id: 'push', label: 'Push Value' },
        { id: 'pop', label: 'Pop Value' },
      ]
    } else if (algoId === 'queue') {
      return [
        { id: 'enqueue', label: 'Enqueue Value' },
        { id: 'dequeue', label: 'Dequeue Value' },
      ]
    }
    return []
  }

  // Set default sub-mode when category tab switches
  const handleCategorySwitch = (id) => {
    setAlgoId(id)
    if (id === 'linkedList') setOpMode('insert')
    if (id === 'stack') setOpMode('push')
    if (id === 'queue') setOpMode('enqueue')
  }

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-eyebrow">🚶 Lists & Queues</div>
        <h2 className="module-title">{ALGOS[algoId].label}</h2>
        <p className="module-desc">
          Step through element allocations, sequential lookups, stack frames LIFO updates, and queue queueing.
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
            onClick={() => handleCategorySwitch(id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Operations Sub-Tabs */}
      <div className="module-tabs sub-tabs" role="tablist" style={{ marginTop: 6, gap: 6 }}>
        {getSubModeTabs().map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={opMode === tab.id}
            className={`module-tab ${opMode === tab.id ? 'active' : ''}`}
            style={{ fontSize: 11, padding: '4px 12px' }}
            onClick={() => setOpMode(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="module-body">
        {/* ── LEFT: List Canvas & Playback ─────────────────── */}
        <div className="viz-canvas-area">
          <div className="viz-canvas-hero" style={{ position: 'relative' }}>
            {algoId === 'linkedList' ? (
              <TreeRenderer
                root={currentTreeRoot}
                highlighted={highlighted}
                activeId={highlighted.length > 0 ? highlighted[0] : null}
                foundId={null}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', width: '100%', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 16, border: '1px solid var(--border-subtle)' }}>
                <ArrayRenderer
                  values={currentArray}
                  highlighted={highlighted}
                  compared={
                    algoId === 'queue'
                      ? [currentHead, currentTail].filter((x) => x !== null)
                      : highlighted
                  }
                  sorted={[]}
                  pivot={null}
                />
              </div>
            )}
          </div>

          <div className="viz-playback-section">
            <PlaybackControls playback={playback} />
          </div>

          <div className="viz-step-section">
            {currentFrame ? (
              <>
                <div className="step-bar-desc">
                  {currentFrame.action === 'INSERT_NODE' && '➕ '}
                  {currentFrame.action === 'POP' && '📤 '}
                  {currentFrame.action === 'PUSH' && '📥 '}
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
            {['pop', 'dequeue'].includes(opMode) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={isPlaying || currentArray.length === 0}
                  style={{ width: '100%' }}
                >
                  🚀 Trigger Remove ({opMode.toUpperCase()})
                </button>
              </div>
            ) : (
              <InputPanel
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                placeholder="Enter element value (e.g. 15)"
                label="ELEMENT VALUE"
                buttonText={opMode.toUpperCase()}
                presets={presets.lists}
                disabled={isPlaying}
              />
            )}
          </div>

          <div className="viz-code-section">
            <div className="section-label">Pseudocode</div>
            <PseudocodePanel
              pseudocode={{ javascript: activePseudocode }}
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
