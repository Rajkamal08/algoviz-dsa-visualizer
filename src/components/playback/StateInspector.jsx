/**
 * StateInspector.jsx
 *
 * Dynamically inspects the current visualizer's variables and performance metrics.
 * Supports rendering custom arrays, maps, sets, and key-value fields.
 */

/**
 * Helper to render value depending on type
 */
function renderSnapshotValue(value) {
  if (value instanceof Set) {
    return Array.from(value);
  }
  if (value instanceof Map) {
    return Array.from(value.entries());
  }
  return value;
}

/**
 * @param {{
 *   metrics: {
 *     comparisons: number,
 *     swaps: number,
 *     visited: number,
 *     cacheHits: number,
 *     backtracks: number,
 *     operations: number
 *   },
 *   stateSnapshot: Object
 * }} props
 */
export default function StateInspector({ metrics, stateSnapshot }) {
  const metricEntries = metrics ? Object.entries(metrics) : []

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">State Inspector</span>
      </div>
      <div className="panel-body">
        {/* Performance Metrics Section */}
        {metricEntries.length > 0 && (
          <div className="inspector-section">
            <div className="inspector-label">Performance Metrics</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {metricEntries.map(([key, val]) => {
                if (val === 0 && key !== 'operations') return null; // Hide empty/irrelevant metrics
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())

                return (
                  <div key={key} className="inspector-metric">
                    <span className="inspector-metric-key">{label}</span>
                    <span className="inspector-metric-value">{val}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Algorithm State Variables Section */}
        {stateSnapshot && Object.keys(stateSnapshot).length > 0 && (
          <div className="inspector-section" style={{ marginTop: 18 }}>
            <div className="inspector-label">Variables</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(stateSnapshot).map(([key, val]) => {
                if (val === undefined || val === null) return null
                if (['root', 'nodes', 'edges', 'data'].includes(key)) return null

                const cleanedValue = renderSnapshotValue(val)
                const isArray = Array.isArray(cleanedValue)

                return (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {key}
                    </span>

                    {/* Array/List Visualization */}
                    {isArray ? (
                      cleanedValue.length === 0 ? (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>empty</span>
                      ) : (
                        <div className="inspector-array">
                          {cleanedValue.map((item, idx) => {
                            // Map entries
                            if (Array.isArray(item) && item.length === 2) {
                              return (
                                <div key={idx} className="inspector-token">
                                  {String(item[0])}: {String(item[1])}
                                </div>
                              )
                            }
                            return (
                              <div key={idx} className="inspector-token">
                                {String(item)}
                              </div>
                            )
                          })}
                        </div>
                      )
                    ) : typeof cleanedValue === 'object' ? (
                      /* Object key-value rendering */
                      Object.keys(cleanedValue).length === 0 ? (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>empty</span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {Object.entries(cleanedValue).map(([subKey, subVal]) => (
                            <div key={subKey} className="inspector-token">
                              {subKey}: {String(subVal)}
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      /* Primitive value rendering */
                      <div className="inspector-token" style={{ alignSelf: 'flex-start' }}>
                        {String(cleanedValue)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {(!metrics && (!stateSnapshot || Object.keys(stateSnapshot).length === 0)) && (
          <div className="empty-copy">Inspector will load when algorithm starts.</div>
        )}
      </div>
    </div>
  )
}
