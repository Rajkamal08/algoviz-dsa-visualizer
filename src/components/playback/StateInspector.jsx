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
  const metricEntries = metrics ? Object.entries(metrics).filter(([key, val]) => val !== 0 || key === 'operations') : []
  const stateKeys = stateSnapshot ? Object.keys(stateSnapshot).filter(k => !['root', 'nodes', 'edges', 'data'].includes(k) && stateSnapshot[k] !== undefined && stateSnapshot[k] !== null) : []

  if (metricEntries.length === 0 && stateKeys.length === 0) {
    return <div className="empty-copy" style={{ fontSize: 11 }}>Waiting for algorithm execution…</div>
  }

  return (
    <div className="state-inspector-content">
      {/* Metrics Row */}
      {metricEntries.length > 0 && (
        <div className="inspector-metrics-compact">
          {metricEntries.map(([key, val]) => {
            const label = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase())

            return (
              <div key={key} className="inspector-metric-chip">
                <span className="inspector-metric-chip-key">{label}</span>
                <span className="inspector-metric-chip-val">{val}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Variables */}
      {stateKeys.length > 0 && (
        <div className="inspector-vars-compact">
          {stateKeys.map((key) => {
            const val = stateSnapshot[key]
            const cleanedValue = renderSnapshotValue(val)
            const isArray = Array.isArray(cleanedValue)

            return (
              <div key={key} className="inspector-var-compact-row">
                <span className="inspector-var-key">{key}:</span>
                {isArray ? (
                  cleanedValue.length === 0 ? (
                    <span className="inspector-token-empty">[]</span>
                  ) : (
                    <div className="inspector-token-list">
                      {cleanedValue.map((item, idx) => (
                        <span key={idx} className="inspector-token">
                          {Array.isArray(item) ? `${item[0]}: ${item[1]}` : String(item)}
                        </span>
                      ))}
                    </div>
                  )
                ) : typeof cleanedValue === 'object' ? (
                  <div className="inspector-token-list">
                    {Object.entries(cleanedValue).map(([subKey, subVal]) => (
                      <span key={subKey} className="inspector-token">
                        {subKey}: {String(subVal)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="inspector-var-single-val">{String(cleanedValue)}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
