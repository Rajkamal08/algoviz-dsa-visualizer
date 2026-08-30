/**
 * GraphVisualizer.jsx
 *
 * Visualizer container for graph algorithms.
 * Connects usePlayback and decoupled GraphRenderer to BFS, DFS, and Dijkstra.
 */

import { useEffect, useState } from 'react'
import usePlayback from '../../core/playback/usePlayback.js'
import GraphRenderer from '../../renderers/GraphRenderer/index.jsx'
import PlaybackControls from '../../components/playback/PlaybackControls.jsx'
import PseudocodePanel from '../../components/playback/PseudocodePanel.jsx'
import ComplexityCard from '../../components/playback/ComplexityCard.jsx'
import StateInspector from '../../components/playback/StateInspector.jsx'
import { graphsPseudocode } from '../../data/pseudocode/graphs.js'
import { complexities } from '../../data/complexities/index.js'
import { presets } from '../../data/presets/index.js'

// Import graph traversal routines
import { runBFS } from './algorithms/bfs.js'
import { runDFS } from './algorithms/dfs.js'
import { runDijkstra } from './algorithms/dijkstra.js'

const ALGOS = {
  bfs:      { label: 'Breadth-First Search (BFS)', sort: runBFS },
  dfs:      { label: 'Depth-First Search (DFS)',   sort: runDFS },
  dijkstra: { label: "Dijkstra's Shortest Path",   sort: runDijkstra },
}

export default function GraphVisualizer({ onStatusChange }) {
  const [algoId, setAlgoId] = useState('bfs')
  const [inputValue, setInputValue] = useState('')
  const [nodes, setNodes] = useState([
    { id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }
  ])
  const [edges, setEdges] = useState([
    { from: 'A', to: 'B', weight: 4, directed: true },
    { from: 'A', to: 'C', weight: 2, directed: true },
    { from: 'B', to: 'C', weight: 1, directed: true },
    { from: 'B', to: 'D', weight: 5, directed: true },
    { from: 'C', to: 'D', weight: 8, directed: true },
    { from: 'C', to: 'E', weight: 10, directed: true },
    { from: 'D', to: 'E', weight: 2, directed: true },
  ])
  const [startNodeId, setStartNodeId] = useState('A')
  const [frames, setFrames] = useState([])

  // Simple form states for quick node/edge additions
  const [newNodeId, setNewNodeId] = useState('')
  const [newEdgeFrom, setNewEdgeFrom] = useState('')
  const [newEdgeTo, setNewEdgeTo] = useState('')
  const [newEdgeWeight, setNewEdgeWeight] = useState('')
  const [newEdgeDirected, setNewEdgeDirected] = useState(true)

  const playback = usePlayback(frames)
  const { currentFrame, isPlaying } = playback

  useEffect(() => {
    handleRunTraversal(nodes, edges, startNodeId, algoId)
  }, [algoId])

  useEffect(() => {
    if (isPlaying) {
      onStatusChange?.('running', `Exploring graph via ${ALGOS[algoId].label}...`)
    } else if (currentFrame?.action === 'DONE') {
      onStatusChange?.('done', currentFrame.description)
    } else {
      onStatusChange?.('ready', '')
    }
  }, [isPlaying, currentFrame, algoId])

  const handleRunTraversal = (tNodes, tEdges, startId, currentAlgoId) => {
    const routine = ALGOS[currentAlgoId]?.sort
    if (!routine) return

    const nextFrames = routine(tNodes, tEdges, startId)
    setFrames(nextFrames)
  }

  // Parse preset format: A,B,C|A-B:4,B-C:1|directed
  const handleLoadPreset = (valStr) => {
    const sections = valStr.split('|')
    if (sections.length < 2) return

    const nodesArr = sections[0].split(',').map((id) => ({ id: id.trim() }))
    const edgesArr = sections[1].split(',').map((eStr) => {
      const parts = eStr.split(':')
      const ends = parts[0].split('-')
      const weight = parts[1] ? parseFloat(parts[1]) : 1
      return {
        from: ends[0].trim(),
        to: ends[1].trim(),
        weight,
        directed: sections[2] === 'directed',
      }
    })

    setNodes(nodesArr)
    setEdges(edgesArr)
    setStartNodeId(nodesArr[0]?.id || '')
    handleRunTraversal(nodesArr, edgesArr, nodesArr[0]?.id || '', algoId)
    setInputValue('')
  }

  const handleAddNode = () => {
    const id = newNodeId.trim().toUpperCase()
    if (!id || nodes.some((n) => n.id === id)) return
    const nextNodes = [...nodes, { id }]
    setNodes(nextNodes)
    handleRunTraversal(nextNodes, edges, startNodeId, algoId)
    setNewNodeId('')
  }

  const handleAddEdge = () => {
    const from = newEdgeFrom.trim().toUpperCase()
    const to = newEdgeTo.trim().toUpperCase()
    const weight = parseFloat(newEdgeWeight) || 1
    if (!from || !to) return
    if (!nodes.some((n) => n.id === from) || !nodes.some((n) => n.id === to)) return

    const nextEdges = [...edges, { from, to, weight, directed: newEdgeDirected }]
    setEdges(nextEdges)
    handleRunTraversal(nodes, nextEdges, startNodeId, algoId)
    setNewEdgeFrom('')
    setNewEdgeTo('')
    setNewEdgeWeight('')
  }

  const currentNodes = currentFrame?.stateSnapshot?.nodes || nodes
  const currentEdges = currentFrame?.stateSnapshot?.edges || edges
  const active = currentFrame?.highlightedNodes || []
  const visited = currentFrame?.stateSnapshot?.visited || []
  const frontier = currentFrame?.stateSnapshot?.queue || currentFrame?.stateSnapshot?.stack || []
  const settled = currentFrame?.stateSnapshot?.settled || []

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-eyebrow">🕸️ Graphs</div>
        <h2 className="module-title">{ALGOS[algoId].label}</h2>
        <p className="module-desc">
          Visualize traversal queues, priority stacks, and distance calculations on network vertices.
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Main Graph Canvas Panel */}
          <div className="panel" style={{ flex: 1, minHeight: 360, display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header">
              <span className="panel-title">Interactive Graph Renderer</span>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Drag nodes to rearrange</div>
            </div>
            <div className="panel-body" style={{ padding: 0, position: 'relative' }}>
              <GraphRenderer
                nodes={currentNodes}
                edges={currentEdges}
                active={active}
                visited={visited}
                frontier={frontier}
                settled={settled}
              />
            </div>
          </div>

          {currentFrame && (
            <div className="step-bar">
              <div className="step-bar-desc">
                {currentFrame.action === 'VISIT_NODE' && '📍 '}
                {currentFrame.action === 'UPDATE_DIST' && '✨ '}
                {currentFrame.description}
              </div>
              {currentFrame.explanation && (
                <div className="step-bar-explain">{currentFrame.explanation}</div>
              )}
            </div>
          )}

          <PlaybackControls playback={playback} />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
          {/* Quick presets & Start Node Selection */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Traversal Config</span>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div className="input-label">Start Vertex</div>
                <select
                  className="input-field"
                  value={startNodeId}
                  onChange={(e) => {
                    setStartNodeId(e.target.value)
                    handleRunTraversal(nodes, edges, e.target.value, algoId)
                  }}
                  disabled={isPlaying}
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="input-label">Load Presets</div>
                <div className="preset-row">
                  {presets.graphs.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      className="preset-btn"
                      onClick={() => handleLoadPreset(p.value)}
                      disabled={isPlaying}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Graph Builder */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Add Node or Edge</span>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Add node */}
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="input-field"
                  style={{ flex: 1, textTransform: 'uppercase' }}
                  type="text"
                  placeholder="Node label (e.g. F)"
                  value={newNodeId}
                  onChange={(e) => setNewNodeId(e.target.value)}
                  disabled={isPlaying}
                />
                <button className="btn btn-secondary btn-sm" onClick={handleAddNode} disabled={isPlaying}>
                  + Node
                </button>
              </div>

              {/* Add edge */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <input
                    className="input-field"
                    style={{ flex: 1, textTransform: 'uppercase' }}
                    type="text"
                    placeholder="From"
                    value={newEdgeFrom}
                    onChange={(e) => setNewEdgeFrom(e.target.value)}
                    disabled={isPlaying}
                  />
                  <input
                    className="input-field"
                    style={{ flex: 1, textTransform: 'uppercase' }}
                    type="text"
                    placeholder="To"
                    value={newEdgeTo}
                    onChange={(e) => setNewEdgeTo(e.target.value)}
                    disabled={isPlaying}
                  />
                  <input
                    className="input-field"
                    style={{ flex: 1 }}
                    type="number"
                    placeholder="W"
                    value={newEdgeWeight}
                    onChange={(e) => setNewEdgeWeight(e.target.value)}
                    disabled={isPlaying}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="checkbox"
                      checked={newEdgeDirected}
                      onChange={(e) => setNewEdgeDirected(e.target.checked)}
                      disabled={isPlaying}
                    />
                    Directed Connection
                  </label>
                  <button className="btn btn-primary btn-sm" onClick={handleAddEdge} disabled={isPlaying}>
                    + Edge
                  </button>
                </div>
              </div>
            </div>
          </div>

          <StateInspector
            metrics={currentFrame?.metrics}
            stateSnapshot={currentFrame?.stateSnapshot}
          />

          <PseudocodePanel
            pseudocode={graphsPseudocode[algoId]}
            codeLineIndex={currentFrame?.codeLineIndex ?? -1}
          />

          <ComplexityCard complexity={complexities[algoId]} />
        </div>
      </div>
    </div>
  )
}
