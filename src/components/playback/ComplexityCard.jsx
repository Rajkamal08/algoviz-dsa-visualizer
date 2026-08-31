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

  const { best, avg, worst, space } = complexity

  return (
    <div className="complexity-compact-row">
      <div className="complexity-chip" title="Best case time complexity">
        <span className="complexity-chip-label">Best</span>
        <span className="complexity-chip-value best">{best || '—'}</span>
      </div>
      <div className="complexity-chip" title="Average case time complexity">
        <span className="complexity-chip-label">Avg</span>
        <span className="complexity-chip-value avg">{avg || '—'}</span>
      </div>
      <div className="complexity-chip" title="Worst case time complexity">
        <span className="complexity-chip-label">Worst</span>
        <span className="complexity-chip-value worst">{worst || '—'}</span>
      </div>
      <div className="complexity-chip" title="Space complexity">
        <span className="complexity-chip-label">Space</span>
        <span className="complexity-chip-value space">{space || '—'}</span>
      </div>
    </div>
  )
}
