/**
 * useUrlState.js
 *
 * Syncs the active module to the URL hash so every page is shareable/bookmarkable.
 *
 * URL format: /#/module-id
 * Examples:
 *   /#/bst
 *   /#/nqueens
 *   /#/bubble
 *   /#/           → dashboard
 *
 * Usage:
 *   const [module, navigate] = useUrlState()
 */

import { useState, useEffect, useCallback } from 'react'

const VALID_MODULES = new Set([
  'bst', 'avl', 'heap', 'trie', 'database',
  'bubble', 'selection', 'insertion', 'merge', 'quick', 'heapsort',
  'bfs', 'dfs', 'dijkstra', 'prim', 'kruskal',
  'fibonacci', 'lcs', 'knapsack', 'coin-change',
  'linked-list', 'stack', 'queue',
  'hash-chain', 'hash-open',
  'nqueens', 'sudoku', 'maze',
])

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '').trim()
  if (!hash || hash === '') return 'dashboard'
  return VALID_MODULES.has(hash) ? hash : 'dashboard'
}

export default function useUrlState() {
  const [activeModule, setActiveModule] = useState(() => parseHash())

  // Listen for browser back/forward navigation
  useEffect(() => {
    const onHashChange = () => setActiveModule(parseHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((moduleId) => {
    const hash = moduleId === 'dashboard' ? '' : moduleId
    window.location.hash = hash ? `/${hash}` : '/'
    setActiveModule(moduleId)
  }, [])

  return [activeModule, navigate]
}
