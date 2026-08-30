/**
 * ArrayRenderer/index.jsx
 *
 * Visualizes arrays as vertical bar charts.
 * Supports highlighting compared indices, active markers, sorted ranges, and pivot nodes.
 */

import { useMemo } from 'react'

/**
 * @param {{
 *   values: number[],
 *   highlighted?: number[], // active pointers
 *   compared?: number[],    // currently compared items
 *   sorted?: number[],      // indices marked as sorted
 *   pivot?: number | null   // pivot element index
 * }} props
 */
export default function ArrayRenderer({
  values = [],
  highlighted = [],
  compared = [],
  sorted = [],
  pivot = null,
}) {
  const maxValue = useMemo(() => {
    if (values.length === 0) return 1
    const max = Math.max(...values)
    return max <= 0 ? 1 : max
  }, [values])

  if (!values || values.length === 0) {
    return (
      <div className="array-renderer" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-muted)', margin: 'auto' }}>No array loaded.</div>
      </div>
    )
  }

  return (
    <div className="array-renderer" role="list" aria-label="Array values visualization">
      {values.map((val, idx) => {
        const heightPercent = Math.max(5, (val / maxValue) * 100) // At least 5% height

        const isHighlighted = highlighted.includes(idx)
        const isCompared = compared.includes(idx)
        const isSorted = sorted.includes(idx)
        const isPivot = pivot === idx

        let barClass = 'array-bar'
        if (isHighlighted) barClass += ' active'
        else if (isPivot) barClass += ' pivot'
        else if (isCompared) barClass += ' compared'
        else if (isSorted) barClass += ' sorted'

        return (
          <div key={idx} className="array-bar-wrap" role="listitem">
            {/* Value Label above bar */}
            <span className="array-bar-value">{val}</span>

            {/* Scaled Bar */}
            <div
              className={barClass}
              style={{ height: `${heightPercent}%` }}
              title={`Index ${idx}: ${val}`}
            />

            {/* Index Label below bar */}
            <span className="array-bar-index">{idx}</span>
          </div>
        )
      })}
    </div>
  )
}
