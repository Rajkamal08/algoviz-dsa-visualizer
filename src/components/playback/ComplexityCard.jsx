/**
 * ComplexityCard.jsx
 *
 * Displays Time & Space complexity Big-O notations along with educational details.
 */

/**
 * @param {{
 *   complexity: {
 *     best: string,
 *     avg: string,
 *     worst: string,
 *     space: string,
 *     explanation: string
 *   }
 * }} props
 */
export default function ComplexityCard({ complexity }) {
  if (!complexity) {
    return null
  }

  const { best, avg, worst, space, explanation } = complexity

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Complexity Analysis</span>
      </div>
      <div className="panel-body">
        {/* Big-O Grid */}
        <div className="complexity-grid">
          <div className="complexity-item" title="Best case execution time complexity">
            <div className="complexity-label">Best Time</div>
            <div className="complexity-value best">{best || '—'}</div>
          </div>
          <div className="complexity-item" title="Average case execution time complexity">
            <div className="complexity-label">Avg Time</div>
            <div className="complexity-value avg">{avg || '—'}</div>
          </div>
          <div className="complexity-item" title="Worst case execution time complexity">
            <div className="complexity-label">Worst Time</div>
            <div className="complexity-value worst">{worst || '—'}</div>
          </div>
          <div className="complexity-item" title="Auxiliary space complexity complexity">
            <div className="complexity-label">Space</div>
            <div className="complexity-value space">{space || '—'}</div>
          </div>
        </div>

        {/* Text Explanation */}
        {explanation && (
          <div className="complexity-explanation">
            {explanation}
          </div>
        )}
      </div>
    </div>
  )
}
