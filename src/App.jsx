/**
 * App.jsx
 *
 * Root application shell.
 * Phase 13: URL state — every page is shareable via /#/module-id
 * Phase 14: Keyboard shortcuts (? → help overlay, Escape → dashboard)
 * Phase 14: Help overlay with shortcut reference
 */

import { useState } from 'react'
import Sidebar    from './components/layout/Sidebar.jsx'
import TopBar     from './components/layout/TopBar.jsx'
import Dashboard  from './components/layout/Dashboard.jsx'
import HelpOverlay from './components/layout/HelpOverlay.jsx'
import useUrlState from './core/routing/useUrlState.js'
import useKeyboardShortcuts from './core/routing/useKeyboardShortcuts.js'
import './index.css'

// ── Module imports ───────────────────────────────────────────────────────────
import DatabaseModule         from './modules/database/DatabaseVisualizer.jsx'
import BSTVisualizer          from './modules/trees/bst/BSTVisualizer.jsx'
import AVLVisualizer          from './modules/trees/avl/AVLVisualizer.jsx'
import HeapVisualizer         from './modules/trees/heap/HeapVisualizer.jsx'
import TrieVisualizer         from './modules/trees/trie/TrieVisualizer.jsx'
import SortingVisualizer      from './modules/sorting/SortingVisualizer.jsx'
import GraphVisualizer        from './modules/graphs/GraphVisualizer.jsx'
import DPVisualizer           from './modules/dp/DPVisualizer.jsx'
import ListsVisualizer        from './modules/lists/ListsVisualizer.jsx'
import HashingVisualizer      from './modules/hashing/HashingVisualizer.jsx'
import BacktrackingVisualizer from './modules/backtracking/BacktrackingVisualizer.jsx'

// Placeholder for modules not yet built
function ComingSoon({ title, icon, description }) {
  return (
    <div className="coming-soon">
      <div style={{ fontSize: 52 }}>{icon}</div>
      <div className="coming-soon-badge">Coming Soon</div>
      <h2>{title}</h2>
      <p>{description || 'This module is currently being built. Check back soon!'}</p>
    </div>
  )
}

/** Map module IDs → their page components */
const MODULE_MAP = {
  // ── Trees ─────────────────────────────────────────────────────────────────
  bst:      (props) => <BSTVisualizer {...props} />,
  avl:      (props) => <AVLVisualizer {...props} />,
  heap:     (props) => <HeapVisualizer {...props} />,
  trie:     (props) => <TrieVisualizer {...props} />,
  database: (props) => <DatabaseModule {...props} />,

  // ── Sorting ───────────────────────────────────────────────────────────────
  bubble:    (props) => <SortingVisualizer {...props} initialAlgoId="bubble" />,
  selection: (props) => <SortingVisualizer {...props} initialAlgoId="selection" />,
  insertion: (props) => <SortingVisualizer {...props} initialAlgoId="insertion" />,
  merge:     (props) => <SortingVisualizer {...props} initialAlgoId="merge" />,
  quick:     (props) => <SortingVisualizer {...props} initialAlgoId="quick" />,
  heapsort:  (props) => <SortingVisualizer {...props} initialAlgoId="heapsort" />,

  // ── Graphs ────────────────────────────────────────────────────────────────
  bfs:      (props) => <GraphVisualizer {...props} />,
  dfs:      (props) => <GraphVisualizer {...props} />,
  dijkstra: (props) => <GraphVisualizer {...props} />,
  prim:     () => <ComingSoon icon="🌲" title="Prim's MST"     description="Growing minimum spanning tree edge by edge." />,
  kruskal:  () => <ComingSoon icon="🔗" title="Kruskal's MST"  description="Union-Find forest merging with edge weight sorting." />,

  // ── Dynamic Programming ───────────────────────────────────────────────────
  fibonacci:     (props) => <DPVisualizer {...props} />,
  lcs:           (props) => <DPVisualizer {...props} />,
  knapsack:      () => <ComingSoon icon="🎒" title="Knapsack"    description="Item selection decision tree + value table." />,
  'coin-change': () => <ComingSoon icon="🪙" title="Coin Change" description="Fewest coins computation with DP table and recursion." />,

  // ── Linked Structures ─────────────────────────────────────────────────────
  'linked-list': (props) => <ListsVisualizer {...props} />,
  stack:         (props) => <ListsVisualizer {...props} />,
  queue:         (props) => <ListsVisualizer {...props} />,

  // ── Hashing ───────────────────────────────────────────────────────────────
  'hash-chain': (props) => <HashingVisualizer {...props} />,
  'hash-open':  (props) => <HashingVisualizer {...props} />,

  // ── Backtracking ──────────────────────────────────────────────────────────
  nqueens: (props) => <BacktrackingVisualizer {...props} />,
  sudoku:  () => <ComingSoon icon="🔢" title="Sudoku Solver"   description="Backtracking through constraint-satisfied cell placements." />,
  maze:    () => <ComingSoon icon="🌀" title="Maze Pathfinder" description="Recursive maze exploration with backtrack path highlighted." />,
}

export default function App() {
  const [activeModule, navigate] = useUrlState()
  const [status,    setStatus]    = useState('ready')
  const [statusText, setStatusText] = useState('')
  const [showHelp,  setShowHelp]  = useState(false)

  const goHome = () => {
    navigate('dashboard')
    setStatus('ready')
    setStatusText('')
  }

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onDashboard:   goHome,
    onToggleHelp:  () => setShowHelp((v) => !v),
  })

  const handleNavigate = (moduleId) => {
    navigate(moduleId)
    setStatus('ready')
    setStatusText('')
  }

  const ModuleComponent = MODULE_MAP[activeModule]

  return (
    <div className="app-layout">
      <Sidebar activeModule={activeModule} onNavigate={handleNavigate} />
      <TopBar
        activeModule={activeModule}
        status={status}
        statusText={statusText}
        onNavigate={handleNavigate}
        onToggleHelp={() => setShowHelp((v) => !v)}
      />
      <main className="main-content" id="main-content" role="main">
        {activeModule === 'dashboard' ? (
          <Dashboard onNavigate={handleNavigate} />
        ) : ModuleComponent ? (
          <ModuleComponent
            onStatusChange={(s, t) => { setStatus(s); setStatusText(t || '') }}
          />
        ) : (
          <ComingSoon icon="🔧" title="Unknown Module" description="This module does not exist." />
        )}
      </main>

      {/* Help overlay (? key or ? button) */}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
    </div>
  )
}
