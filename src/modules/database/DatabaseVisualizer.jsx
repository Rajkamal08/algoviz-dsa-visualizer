/**
 * DatabaseVisualizer.jsx  (Phase 12 upgrade)
 *
 * Now features two tabs:
 *   1. SQL Query Playground — original B+ Tree animated query executor
 *   2. Index Internals      — visual breakdown of the B+ Tree structure stats,
 *                             leaf chain, and key distribution
 *
 * All original logic is preserved.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import BPlusTree from '../../logic/BPlusTree.js'
import { executeQuery } from '../../logic/queryEngine.js'
import { generateUsers } from '../../data/users.js'
import TreeCanvas from '../../components/TreeCanvas.jsx'
import QueryExamples from '../../components/QueryExamples.jsx'
import ResultsTable from '../../components/ResultsTable.jsx'
import ExecutionPlan from '../../components/ExecutionPlan.jsx'

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

function buildTree(records) {
  const t = new BPlusTree(4, 4)
  for (const u of records) t.insert(u.id, u)
  return t
}

function buildSecTree(records) {
  const t = new BPlusTree(4, 4, false, '')
  for (const u of records) t.insert(u.department, u.id)
  return t
}

function pushHistory(prev, sql) {
  return [sql, ...prev.filter((x) => x !== sql)].slice(0, 10)
}

/** Collect leaf nodes in linked-list order from B+ Tree */
function collectLeafChain(tree) {
  if (!tree?.root) return []
  const leaves = []
  let node = tree.root
  // Walk down to leftmost leaf
  while (node && !node.isLeaf) {
    node = node.children?.[0]
  }
  while (node) {
    leaves.push(node)
    node = node.next
  }
  return leaves
}

// ─── Sub-page: SQL Query Playground ──────────────────────────────────────────

function SQLPlayground({ tree, secTree, records, setRecords, onStatusChange }) {
  const [query,          setQuery]          = useState('SELECT * FROM users WHERE id = 42')
  const [rows,           setRows]           = useState([])
  const [summary,        setSummary]        = useState('Type a query, run it, and watch the B+ Tree search step by step.')
  const [history,        setHistory]        = useState([])
  const [planSteps,      setPlanSteps]      = useState([])
  const [activePlanStep, setActivePlanStep] = useState(-1)
  const [highlighted,    setHighlighted]    = useState([])
  const [activeId,       setActiveId]       = useState(null)
  const [activeTree,     setActiveTree]     = useState('primary')
  const [insertId,       setInsertId]       = useState('')
  const [insertDept,     setInsertDept]     = useState('')
  const [deleteId,       setDeleteId]       = useState('')
  const runToken = useRef(0)

  const stats = useMemo(
    () => (activeTree === 'primary' ? tree?.getStats() : secTree?.getStats()),
    [tree, secTree, activeTree]
  )

  const onRun = async (incoming = query) => {
    const token = ++runToken.current
    setQuery(incoming)
    onStatusChange?.('running', 'Executing query…')
    setRows([]); setHighlighted([]); setActiveId(null); setActivePlanStep(-1)
    setSummary('Planning query execution…')

    try {
      const exec = executeQuery(incoming, { tree, secTree, records })
      if (runToken.current !== token) return
      setPlanSteps(exec.planSteps)
      setSummary(exec.summary)
      setActivePlanStep(0)
      await sleep(250); if (runToken.current !== token) return
      setActivePlanStep(1)
      await sleep(250); if (runToken.current !== token) return

      for (const frame of exec.animationFrames) {
        setActiveTree(frame.treeName)
        setActiveId(frame.node.id)
        setHighlighted((p) => p.includes(frame.node.id) ? p : [...p, frame.node.id])
        setActivePlanStep(frame.phase === 'scan' ? 3 : 2)
        await sleep(500); if (runToken.current !== token) return
      }

      setActiveId(null)
      setRows(exec.rows)
      setActivePlanStep(4)
      if (exec.nextRecords) setRecords(exec.nextRecords)
      onStatusChange?.('done', exec.summary)
      setSummary(exec.summary)
      setHistory((p) => pushHistory(p, incoming))
    } catch (err) {
      if (runToken.current !== token) return
      onStatusChange?.('error', err.message)
      setSummary(err.message)
      setRows([]); setPlanSteps([]); setActivePlanStep(-1)
    }
  }

  const currentStep = activePlanStep >= 0 ? planSteps[activePlanStep] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <p className="module-desc">{summary}</p>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {[
          { label: 'Records',        value: stats?.totalRecords ?? 0 },
          { label: 'Tree Height',    value: stats?.height ?? 0 },
          { label: 'Internal Nodes', value: stats?.internalNodes ?? 0 },
          { label: 'Leaf Nodes',     value: stats?.leafNodes ?? 0 },
          { label: 'Current Step',   value: currentStep ? currentStep.label : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="inspector-metric" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <span className="inspector-metric-key">{label}</span>
            <span className="inspector-metric-value" style={{ fontSize: 17 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Query editor */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">SQL Query Editor</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => onRun(query)}>▶ Run Query</button>
            <button className="btn btn-secondary btn-sm" onClick={() => onRun('SELECT * FROM users LIMIT 12')}>Full Scan</button>
          </div>
        </div>
        <div className="panel-body">
          <textarea
            className="input-field"
            style={{ minHeight: 80 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onRun(query) }}
            placeholder="SELECT * FROM users WHERE id = 42"
            spellCheck={false}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 24px', marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>Tip: Ctrl+Enter to run</span>
            <span>Supported: SELECT / INSERT / DELETE / UPDATE</span>
          </div>
        </div>
      </div>

      {/* Main visualizer area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        {/* Tree canvas */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Tree View</span>
            <div className="tree-toggle" style={{ display: 'flex', gap: 4, background: 'var(--bg-input)', padding: 4, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              {['primary', 'secondary'].map((t) => (
                <button key={t} onClick={() => setActiveTree(t)}
                  style={{
                    padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: activeTree === t ? 'var(--accent)' : 'transparent',
                    color: activeTree === t ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}>
                  {t === 'primary' ? 'Primary (ID)' : 'Secondary (Dept)'}
                </button>
              ))}
            </div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <TreeCanvas
              root={activeTree === 'primary' ? tree?.root : secTree?.root}
              highlighted={highlighted}
              activeId={activeId}
            />
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Execution Plan</span></div>
            <div className="panel-body" style={{ padding: '8px 0' }}>
              <ExecutionPlan steps={planSteps} activeStep={activePlanStep} />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><span className="panel-title">Manual Operations</span></div>
            <div className="panel-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="input-field" style={{ flex: 1 }} type="number" placeholder="ID" value={insertId} onChange={(e) => setInsertId(e.target.value)} />
                  <input className="input-field" style={{ flex: 2 }} type="text" placeholder="Department" value={insertDept} onChange={(e) => setInsertDept(e.target.value)} />
                  <button className="btn btn-primary btn-sm" onClick={() => { if (insertId) onRun(`INSERT INTO users (id, department) VALUES (${insertId}, '${insertDept || 'Engineering'}')`) }}>Insert</button>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="input-field" style={{ flex: 1 }} type="number" placeholder="ID to delete" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} />
                  <button className="btn btn-secondary btn-sm" onClick={() => { if (deleteId) onRun(`DELETE FROM users WHERE id = ${deleteId}`) }}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Examples, History, Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Query Examples</span></div>
          <div className="panel-body"><QueryExamples onPick={(sql) => { setQuery(sql); onRun(sql) }} /></div>
        </div>
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Recent Queries</span></div>
          <div className="panel-body">
            {history.length === 0
              ? <div className="empty-state" style={{ minHeight: 80 }}><span style={{ fontSize: 12 }}>Your last 10 queries appear here.</span></div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {history.map((h) => (
                    <button key={h} onClick={() => onRun(h)}
                      style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'background 0.15s' }}
                    >{h}</button>
                  ))}
                </div>
            }
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><span className="panel-title">Query Results</span></div>
        <div className="panel-body" style={{ padding: 0 }}>
          <ResultsTable rows={rows} />
        </div>
      </div>
    </div>
  )
}

// ─── Sub-page: Index Internals ────────────────────────────────────────────────

function IndexInternals({ tree, secTree }) {
  const [activeTree, setActiveTree] = useState('primary')
  const currentTree = activeTree === 'primary' ? tree : secTree
  const stats = currentTree?.getStats?.() || {}
  const leaves = useMemo(() => collectLeafChain(currentTree), [currentTree])

  const fillRatio = stats.totalRecords
    ? ((stats.totalRecords / (stats.leafNodes * 4)) * 100).toFixed(1)
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tree Selector */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['primary', 'secondary'].map((t) => (
          <button key={t} onClick={() => setActiveTree(t)}
            className={`module-tab ${activeTree === t ? 'active' : ''}`}>
            {t === 'primary' ? '🔑 Primary Index (ID)' : '🏷️ Secondary Index (Dept)'}
          </button>
        ))}
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Total Records',  value: stats.totalRecords ?? 0, icon: '📦' },
          { label: 'Tree Height',    value: stats.height ?? 0,       icon: '📏' },
          { label: 'Internal Nodes', value: stats.internalNodes ?? 0, icon: '🌿' },
          { label: 'Leaf Nodes',     value: stats.leafNodes ?? 0,    icon: '🍃' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{value}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Fill ratio bar */}
      <div className="panel">
        <div className="panel-header"><span className="panel-title">Leaf Fill Ratio</span></div>
        <div className="panel-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 14, background: 'var(--bg-tertiary)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                width: `${fillRatio}%`, height: '100%', borderRadius: 99,
                background: `linear-gradient(90deg, var(--accent), #a78bfa)`,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', minWidth: 48 }}>{fillRatio}%</span>
          </div>
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            Average leaf node utilization (keys used / max capacity). B+ Tree order = 4.
          </p>
        </div>
      </div>

      {/* Leaf chain visualization */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Leaf Node Chain</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{leaves.length} leaf nodes linked in sorted order →</span>
        </div>
        <div className="panel-body" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 6, paddingBottom: 8 }}>
            {leaves.map((leaf, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  background: 'var(--bg-elevated)', border: '1.5px solid var(--border-default)',
                  borderRadius: 8, padding: '8px 10px', minWidth: 64,
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>LEAF {idx + 1}</div>
                  {(leaf.keys || []).filter(Boolean).map((k, ki) => (
                    <div key={ki} style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{String(k)}</div>
                  ))}
                </div>
                {idx < leaves.length - 1 && (
                  <div style={{ color: 'var(--accent)', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complexity card for B+ Tree */}
      <div className="panel">
        <div className="panel-header"><span className="panel-title">B+ Tree Complexity</span></div>
        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {[
              { label: 'Search (best)',  value: 'O(log n)' },
              { label: 'Insert',        value: 'O(log n)' },
              { label: 'Range Scan',    value: 'O(log n + k)' },
              { label: 'Space',         value: 'O(n)' },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Root export ───────────────────────────────────────────────────────────────

export default function DatabaseVisualizer({ onStatusChange }) {
  const [records, setRecords] = useState([])
  const [activeTab, setActiveTab] = useState('sql')

  useEffect(() => { setRecords(generateUsers(100)) }, [])

  const tree    = useMemo(() => buildTree(records), [records])
  const secTree = useMemo(() => buildSecTree(records), [records])

  return (
    <div className="module-page" style={{ display: 'block', padding: '20px 28px' }}>
      <div className="module-header">
        <div className="module-eyebrow">🗄️ Database Internals</div>
        <h2 className="module-title">B+ Tree SQL Engine</h2>
        <p className="module-desc">
          Execute real SQL queries against a live B+ Tree index and explore index internals.
        </p>
      </div>

      {/* Tabs */}
      <div className="module-tabs" role="tablist" style={{ marginBottom: 20 }}>
        <button role="tab" aria-selected={activeTab === 'sql'}
          className={`module-tab ${activeTab === 'sql' ? 'active' : ''}`}
          onClick={() => setActiveTab('sql')}>
          💬 SQL Playground
        </button>
        <button role="tab" aria-selected={activeTab === 'internals'}
          className={`module-tab ${activeTab === 'internals' ? 'active' : ''}`}
          onClick={() => setActiveTab('internals')}>
          🔬 Index Internals
        </button>
      </div>

      {activeTab === 'sql' ? (
        <SQLPlayground
          tree={tree}
          secTree={secTree}
          records={records}
          setRecords={setRecords}
          onStatusChange={onStatusChange}
        />
      ) : (
        <IndexInternals tree={tree} secTree={secTree} />
      )}
    </div>
  )
}
