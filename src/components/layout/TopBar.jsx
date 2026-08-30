/**
 * TopBar.jsx
 * Global top bar — breadcrumb, status pill, Share, and Help buttons.
 * Phase 13: Share button copies the current page URL to clipboard.
 * Phase 14: Added keyboard shortcut hint (? key).
 */

import { useState, useCallback } from 'react'

const MODULE_LABELS = {
  dashboard:   { label: 'Dashboard',              category: null },
  bst:         { label: 'Binary Search Tree',     category: 'Trees & Indexes' },
  avl:         { label: 'AVL Tree',               category: 'Trees & Indexes' },
  heap:        { label: 'Min / Max Heap',         category: 'Trees & Indexes' },
  trie:        { label: 'Trie',                   category: 'Trees & Indexes' },
  database:    { label: 'B+ Tree (SQL)',           category: 'Database Internals' },
  bubble:      { label: 'Bubble Sort',            category: 'Sorting' },
  selection:   { label: 'Selection Sort',         category: 'Sorting' },
  insertion:   { label: 'Insertion Sort',         category: 'Sorting' },
  merge:       { label: 'Merge Sort',             category: 'Sorting' },
  quick:       { label: 'Quick Sort',             category: 'Sorting' },
  heapsort:    { label: 'Heap Sort',              category: 'Sorting' },
  bfs:         { label: 'BFS',                    category: 'Graph Algorithms' },
  dfs:         { label: 'DFS',                    category: 'Graph Algorithms' },
  dijkstra:    { label: 'Dijkstra',               category: 'Graph Algorithms' },
  prim:        { label: "Prim's MST",             category: 'Graph Algorithms' },
  kruskal:     { label: "Kruskal's MST",          category: 'Graph Algorithms' },
  fibonacci:   { label: 'Fibonacci',              category: 'Dynamic Programming' },
  lcs:         { label: 'Longest Common Subseq',  category: 'Dynamic Programming' },
  knapsack:    { label: 'Knapsack',               category: 'Dynamic Programming' },
  'coin-change': { label: 'Coin Change',          category: 'Dynamic Programming' },
  'linked-list': { label: 'Linked List',          category: 'Linked Structures' },
  stack:       { label: 'Stack',                  category: 'Linked Structures' },
  queue:       { label: 'Queue / Deque',          category: 'Linked Structures' },
  'hash-chain': { label: 'Hash Chaining',         category: 'Hashing' },
  'hash-open':  { label: 'Open Addressing',       category: 'Hashing' },
  nqueens:     { label: 'N-Queens',               category: 'Backtracking' },
  sudoku:      { label: 'Sudoku Solver',           category: 'Backtracking' },
  maze:        { label: 'Maze Pathfinder',        category: 'Backtracking' },
}

/**
 * @param {{
 *   activeModule: string,
 *   status: 'ready'|'running'|'done'|'error',
 *   statusText?: string,
 *   onNavigate: (id: string) => void,
 *   onToggleHelp: () => void
 * }} props
 */
export default function TopBar({ activeModule, status = 'ready', statusText = '', onNavigate, onToggleHelp }) {
  const info = MODULE_LABELS[activeModule] || { label: activeModule, category: null }
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(() => {
    const url = window.location.href
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    } else {
      // Fallback for older browsers
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [])

  return (
    <header className="topbar" role="banner">
      <div className="topbar-left">
        <nav className="topbar-breadcrumb" aria-label="Breadcrumb">
          <span
            style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
            onClick={() => onNavigate('dashboard')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('dashboard')}
          >
            AlgoViz
          </span>

          {info.category && (
            <>
              <span className="crumb-sep">›</span>
              <span style={{ color: 'var(--text-secondary)' }}>{info.category}</span>
            </>
          )}

          {activeModule !== 'dashboard' && (
            <>
              <span className="crumb-sep">›</span>
              <span className="crumb-active">{info.label}</span>
            </>
          )}
        </nav>
      </div>

      <div className="topbar-right">
        {statusText && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {statusText}
          </span>
        )}

        <span className={`status-pill ${status}`} aria-live="polite" aria-label={`Status: ${status}`}>
          {status === 'ready'   ? 'Ready'   : null}
          {status === 'running' ? 'Running' : null}
          {status === 'done'    ? 'Done'    : null}
          {status === 'error'   ? 'Error'   : null}
        </span>

        {/* Share button — only on non-dashboard pages */}
        {activeModule !== 'dashboard' && (
          <button
            id="share-link-btn"
            onClick={handleShare}
            aria-label="Copy shareable link"
            title="Copy link to this page"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: '1px solid var(--border-default)',
              background: copied ? 'var(--accent-dim)' : 'var(--bg-elevated)',
              color: copied ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? '✅ Copied!' : '🔗 Share'}
          </button>
        )}

        {/* Help button */}
        <button
          id="help-btn"
          onClick={onToggleHelp}
          aria-label="Keyboard shortcuts (press ?)"
          title="Keyboard shortcuts — press ?"
          style={{
            width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, border: '1px solid var(--border-default)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-muted)', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >?</button>
      </div>
    </header>
  )
}
