/**
 * Sidebar.jsx
 *
 * Left navigation sidebar. Shows all DSA categories and their sub-modules.
 * Collapses to icon-only on small screens (<900px).
 */

import { useState } from 'react'

/** Full nav tree — categories → modules */
const NAV = [
  {
    category: 'Data Structures',
    items: [
      {
        id: 'trees',
        icon: '🌳',
        label: 'Trees & Indexes',
        color: 'var(--cat-trees)',
        badge: '5',
        children: [
          { id: 'bst',      label: 'Binary Search Tree' },
          { id: 'avl',      label: 'AVL Tree' },
          { id: 'heap',     label: 'Min / Max Heap' },
          { id: 'trie',     label: 'Trie' },
          { id: 'database', label: 'B+ Tree (SQL)' },
        ],
      },
      {
        id: 'lists',
        icon: '🔗',
        label: 'Linked Lists',
        color: 'var(--cat-lists)',
        badge: '3',
        children: [
          { id: 'linked-list', label: 'Singly / Doubly' },
          { id: 'stack',       label: 'Stack' },
          { id: 'queue',       label: 'Queue / Deque' },
        ],
      },
      {
        id: 'hashing',
        icon: '#️⃣',
        label: 'Hashing',
        color: 'var(--cat-hashing)',
        badge: '2',
        children: [
          { id: 'hash-chain',  label: 'Chaining' },
          { id: 'hash-open',   label: 'Open Addressing' },
        ],
      },
    ],
  },
  {
    category: 'Algorithms',
    items: [
      {
        id: 'sorting',
        icon: '⚡',
        label: 'Sorting',
        color: 'var(--cat-sorting)',
        badge: '6',
        children: [
          { id: 'bubble',    label: 'Bubble Sort' },
          { id: 'selection', label: 'Selection Sort' },
          { id: 'insertion', label: 'Insertion Sort' },
          { id: 'merge',     label: 'Merge Sort' },
          { id: 'quick',     label: 'Quick Sort' },
          { id: 'heapsort',  label: 'Heap Sort' },
        ],
      },
      {
        id: 'graphs',
        icon: '🕸️',
        label: 'Graph Algorithms',
        color: 'var(--cat-graphs)',
        badge: '5',
        children: [
          { id: 'bfs',       label: 'BFS' },
          { id: 'dfs',       label: 'DFS' },
          { id: 'dijkstra',  label: 'Dijkstra' },
          { id: 'prim',      label: "Prim's MST" },
          { id: 'kruskal',   label: "Kruskal's MST" },
        ],
      },
      {
        id: 'dp',
        icon: '🧩',
        label: 'Dynamic Programming',
        color: 'var(--cat-dp)',
        badge: '4',
        children: [
          { id: 'fibonacci',   label: 'Fibonacci' },
          { id: 'lcs',         label: 'Longest Common Subseq' },
          { id: 'knapsack',    label: 'Knapsack' },
          { id: 'coin-change', label: 'Coin Change' },
        ],
      },
      {
        id: 'backtracking',
        icon: '🔙',
        label: 'Backtracking',
        color: 'var(--cat-backtrack)',
        badge: '3',
        children: [
          { id: 'nqueens', label: 'N-Queens' },
          { id: 'sudoku',  label: 'Sudoku Solver' },
          { id: 'maze',    label: 'Maze Pathfinder' },
        ],
      },
    ],
  },
]

/**
 * @param {{ activeModule: string, onNavigate: (id: string) => void }} props
 */
export default function Sidebar({ activeModule, onNavigate }) {
  const [openGroups, setOpenGroups] = useState({ trees: true, sorting: true })
  const [search, setSearch] = useState('')

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const query = search.toLowerCase().trim()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <div className="sidebar-logo-icon">⚛</div>
          <div>
            <div className="sidebar-logo-text">AlgoViz</div>
            <div className="sidebar-logo-sub">DSA Visualizer</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search algorithms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search algorithms"
        />
      </div>

      {/* Home */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <div
          className={`sidebar-item ${activeModule === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('dashboard')}
          aria-current={activeModule === 'dashboard' ? 'page' : undefined}
        >
          <span className="sidebar-item-icon" style={{ fontSize: 16 }}>🏠</span>
          <span className="sidebar-item-label">Dashboard</span>
        </div>

        {/* Category groups */}
        {NAV.map(({ category, items }) => {
          // Filter items by search query
          const visibleItems = query
            ? items.filter(
                (item) =>
                  item.label.toLowerCase().includes(query) ||
                  item.children?.some((c) => c.label.toLowerCase().includes(query))
              )
            : items

          if (visibleItems.length === 0) return null

          return (
            <div key={category}>
              <div className="sidebar-category">{category}</div>

              {visibleItems.map((item) => {
                const isOpen = !!openGroups[item.id]
                const hasChildren = item.children && item.children.length > 0
                const isGroupActive = activeModule === item.id || item.children?.some((c) => c.id === activeModule)

                // Filter children by search
                const visibleChildren = query
                  ? item.children?.filter((c) => c.label.toLowerCase().includes(query))
                  : item.children

                return (
                  <div key={item.id}>
                    {/* Parent item */}
                    <div
                      className={`sidebar-item ${isGroupActive && !hasChildren ? 'active' : ''}`}
                      onClick={() => {
                        if (hasChildren) {
                          toggleGroup(item.id)
                        } else {
                          onNavigate(item.id)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && (hasChildren ? toggleGroup(item.id) : onNavigate(item.id))}
                      aria-expanded={hasChildren ? isOpen : undefined}
                    >
                      <span
                        className="sidebar-item-icon"
                        style={{ background: isGroupActive ? `${item.color}22` : undefined }}
                      >
                        {item.icon}
                      </span>
                      <span className="sidebar-item-label">{item.label}</span>
                      {item.badge && (
                        <span className="sidebar-item-badge" style={{ color: item.color, background: `${item.color}18` }}>
                          {item.badge}
                        </span>
                      )}
                      {hasChildren && (
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 2 }}>
                          {isOpen ? '▾' : '▸'}
                        </span>
                      )}
                    </div>

                    {/* Sub-items */}
                    {hasChildren && (
                      <div className={`sidebar-sub-items ${isOpen || query ? 'open' : ''}`}>
                        {visibleChildren?.map((child) => (
                          <div
                            key={child.id}
                            className={`sidebar-sub-item ${activeModule === child.id ? 'active' : ''}`}
                            onClick={() => onNavigate(child.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && onNavigate(child.id)}
                            aria-current={activeModule === child.id ? 'page' : undefined}
                            style={{ '--accent': item.color }}
                          >
                            {child.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
