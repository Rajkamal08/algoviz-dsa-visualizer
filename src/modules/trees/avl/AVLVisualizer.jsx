/**
 * AVLVisualizer.jsx
 *
 * Self-balancing AVL tree visualizer view.
 */

import { useEffect, useState } from 'react'
import usePlayback from '../../../core/playback/usePlayback.js'
import TreeRenderer from '../../../renderers/TreeRenderer/index.jsx'
import PlaybackControls from '../../../components/playback/PlaybackControls.jsx'
import PseudocodePanel from '../../../components/playback/PseudocodePanel.jsx'
import ComplexityCard from '../../../components/playback/ComplexityCard.jsx'
import StateInspector from '../../../components/playback/StateInspector.jsx'
import InputPanel from '../../../components/common/InputPanel.jsx'
import { avlPseudocode } from '../../../data/pseudocode/avl.js'
import { avlComplexities } from '../../../data/complexities/avl.js'
import { avlPresets } from '../../../data/presets/avl.js'
import AVL from './AVL.js'

export default function AVLVisualizer({ onStatusChange }) {
  const [avl] = useState(() => new AVL())
  const [inputValue, setInputValue] = useState('')
  const [frames, setFrames] = useState([])

  const playback = usePlayback(frames)
  const { currentFrame, isPlaying } = playback

  useEffect(() => {
    handleLoadPreset(avlPresets[0].value) // Default to RR/LL rotate sequence
  }, [])

  useEffect(() => {
    if (isPlaying) {
      onStatusChange?.('running', 'Visualizing AVL balancing...')
    } else if (currentFrame?.action === 'DONE') {
      onStatusChange?.('done', currentFrame.description)
    } else {
      onStatusChange?.('ready', '')
    }
  }, [isPlaying, currentFrame])

  const handleLoadPreset = (valStr) => {
    avl.root = null
    const keys = valStr
      .split(',')
      .map((k) => parseInt(k.trim(), 10))
      .filter((k) => !isNaN(k))

    let lastFrames = []
    for (const key of keys) {
      lastFrames = avl.insert(key)
    }
    setFrames(lastFrames)
    setInputValue('')
  }

  const handleSubmit = () => {
    const key = parseInt(inputValue.trim(), 10)
    if (isNaN(key)) return
    const nextFrames = avl.insert(key)
    setFrames(nextFrames)
    setInputValue('')
  }

  const currentTreeRoot = currentFrame?.stateSnapshot?.root ?? avl.root
  const activeNodeId = currentFrame?.highlightedNodes?.[0] ?? null

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-eyebrow">🌳 Trees & Indexes</div>
        <h2 className="module-title">AVL Tree (Balanced BST)</h2>
        <p className="module-desc">
          A self-balancing Binary Search Tree where the height difference (balance factor) between left and right subtrees cannot exceed 1.
        </p>
      </div>

      <div className="module-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <span className="panel-title">AVL Tree Canvas</span>
            </div>
            <div className="panel-body" style={{ padding: 0, position: 'relative' }}>
              <TreeRenderer
                root={currentTreeRoot}
                highlighted={currentFrame?.highlightedNodes || []}
                activeId={activeNodeId}
                foundId={currentFrame?.action === 'ROTATE' ? activeNodeId : null}
              />
            </div>
          </div>

          {currentFrame && (
            <div className="step-bar">
              <div className="step-bar-desc">
                {currentFrame.action === 'ROTATE' && '⚙️ '}
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
              <span className="panel-title">Insert Element</span>
            </div>
            <div className="panel-body">
              <InputPanel
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                placeholder="Enter key to insert (e.g. 15)"
                label="INSERT KEY"
                buttonText="INSERT"
                presets={avlPresets}
                disabled={isPlaying}
              />
            </div>
          </div>

          <StateInspector
            metrics={currentFrame?.metrics}
            stateSnapshot={currentFrame?.stateSnapshot}
          />

          <PseudocodePanel
            pseudocode={avlPseudocode.insert}
            codeLineIndex={currentFrame?.codeLineIndex ?? -1}
          />

          <ComplexityCard complexity={avlComplexities} />
        </div>
      </div>
    </div>
  )
}
