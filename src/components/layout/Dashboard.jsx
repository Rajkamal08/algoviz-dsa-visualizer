/**
 * Dashboard.jsx
 * Home screen — animated category cards grid.
 */

const CATEGORIES = [
  {
    id: 'trees',
    icon: '🌳',
    title: 'Trees & Indexes',
    desc: 'BST, AVL rotations, Min/Max Heap, Trie prefix search, and B+ Tree for SQL queries.',
    color: 'var(--cat-trees)',
    rgb: '59 130 246',
    count: 5,
    tags: ['BST', 'AVL', 'Heap', 'Trie', 'B+ Tree'],
    firstChild: 'bst',
  },
  {
    id: 'sorting',
    icon: '⚡',
    title: 'Sorting Algorithms',
    desc: 'Watch Bubble, Merge, Quick, and Heap sort animate step-by-step with recursion trees.',
    color: 'var(--cat-sorting)',
    rgb: '139 92 246',
    count: 6,
    tags: ['Bubble', 'Merge', 'Quick', 'Heap', 'Insertion'],
    firstChild: 'bubble',
  },
  {
    id: 'graphs',
    icon: '🕸️',
    title: 'Graph Algorithms',
    desc: 'BFS queue, DFS stack, Dijkstra distances, Prim and Kruskal MST — all animated.',
    color: 'var(--cat-graphs)',
    rgb: '6 182 212',
    count: 5,
    tags: ['BFS', 'DFS', 'Dijkstra', 'Prim', 'Kruskal'],
    firstChild: 'bfs',
  },
  {
    id: 'dp',
    icon: '🧩',
    title: 'Dynamic Programming',
    desc: 'Recursion call tree + memoization table side by side. Overlapping subproblems highlighted.',
    color: 'var(--cat-dp)',
    rgb: '245 158 11',
    count: 4,
    tags: ['Fibonacci', 'LCS', 'Knapsack', 'Coin Change'],
    firstChild: 'fibonacci',
  },
  {
    id: 'lists',
    icon: '🔗',
    title: 'Linked Structures',
    desc: 'Singly and doubly linked lists, Stack push/pop, Queue enqueue/dequeue with pointer animation.',
    color: 'var(--cat-lists)',
    rgb: '16 185 129',
    count: 3,
    tags: ['Linked List', 'Stack', 'Queue'],
    firstChild: 'linked-list',
  },
  {
    id: 'hashing',
    icon: '#️⃣',
    title: 'Hashing',
    desc: 'Hash table with separate chaining and open addressing — visualize collisions and probes.',
    color: 'var(--cat-hashing)',
    rgb: '249 115 22',
    count: 2,
    tags: ['Chaining', 'Linear Probe', 'Quadratic'],
    firstChild: 'hash-chain',
  },
  {
    id: 'backtracking',
    icon: '🔙',
    title: 'Backtracking',
    desc: 'Decision trees being pruned in real time — N-Queens, Sudoku, and Maze pathfinding.',
    color: 'var(--cat-backtrack)',
    rgb: '236 72 153',
    count: 3,
    tags: ['N-Queens', 'Sudoku', 'Maze'],
    firstChild: 'nqueens',
  },
  {
    id: 'database',
    icon: '🗄️',
    title: 'Database Internals',
    desc: 'B+ Tree traversal with live SQL query execution, secondary index, and hash index.',
    color: 'var(--cat-db)',
    rgb: '100 116 139',
    count: 2,
    tags: ['B+ Tree', 'SQL', 'Hash Index'],
    firstChild: 'database',
  },
]

const TOTAL_ALGORITHMS = CATEGORIES.reduce((sum, c) => sum + c.count, 0)

/**
 * @param {{ onNavigate: (id: string) => void }} props
 */
export default function Dashboard({ onNavigate }) {
  return (
    <div className="dashboard">
      {/* Hero */}
      <div className="dashboard-hero">
        <div className="dashboard-eyebrow">Universal DSA Visualizer</div>
        <h1 className="dashboard-title">
          See Every Algorithm.<br />
          Understand Every Step.
        </h1>
        <p className="dashboard-subtitle">
          From Binary Search Trees to Dijkstra's shortest path — every data structure and
          algorithm broken into clear, animated, step-by-step visual diagrams.
        </p>
        <div className="dashboard-stats">
          <div className="dashboard-stat">
            <strong>{TOTAL_ALGORITHMS}</strong>
            <span>Algorithms</span>
          </div>
          <div className="dashboard-stat">
            <strong>{CATEGORIES.length}</strong>
            <span>Categories</span>
          </div>
          <div className="dashboard-stat">
            <strong>∞</strong>
            <span>Custom Inputs</span>
          </div>
          <div className="dashboard-stat">
            <strong>0</strong>
            <span>Dependencies</span>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="dashboard-section-title">Choose a Category</div>
      <div className="dashboard-grid">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="cat-card"
            style={{ '--cat-color': cat.color, '--cat-rgb': cat.rgb }}
            onClick={() => onNavigate(cat.firstChild)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate(cat.firstChild)}
            aria-label={`Open ${cat.title}`}
          >
            <div className="cat-card-header">
              <div className="cat-card-icon">{cat.icon}</div>
              <span className="cat-card-count">{cat.count} modules</span>
            </div>
            <div className="cat-card-title">{cat.title}</div>
            <div className="cat-card-desc">{cat.desc}</div>
            <div className="cat-card-tags">
              {cat.tags.map((tag) => (
                <span key={tag} className="cat-tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline explainer */}
      <div className="dashboard-section-title" style={{ marginTop: 8 }}>How It Works</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {[
          { step: '01', icon: '✏️', label: 'Input',     desc: 'Type an array, tree values, graph edges, or pick a preset.' },
          { step: '02', icon: '⚙️', label: 'Algorithm', desc: 'The algorithm runs and records every decision as an event.' },
          { step: '03', icon: '🎬', label: 'Frames',    desc: 'Events become rich animation frames with descriptions.' },
          { step: '04', icon: '▶️', label: 'Playback',  desc: 'Step through frames, read pseudocode, inspect state.' },
        ].map(({ step, icon, label, desc }) => (
          <div
            key={step}
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
                color: 'var(--accent)', background: 'var(--accent-dim)',
                padding: '2px 7px', borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(59,130,246,0.2)'
              }}>{step}</span>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
