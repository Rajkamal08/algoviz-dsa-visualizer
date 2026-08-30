/**
 * TableRenderer/index.jsx
 *
 * Universal rendering engine for DP grids, memoization tables, or matrices.
 * Supports highlighting target cells (active, filled, cache hit).
 */

import { useMemo } from 'react'

/**
 * Checks if a specific cell matches any in the coordinates array
 */
function isCellInList(row, col, coords = []) {
  return coords.some(([r, c]) => r === row && c === col)
}

/**
 * @param {{
 *   data: Array<Array<string|number>>,
 *   rowHeaders?: string[],
 *   colHeaders?: string[],
 *   activeCells?: Array<[number, number]>,    // cells currently compared/inspected
 *   filledCells?: Array<[number, number]>,    // cells populated with resolved calculations
 *   cacheHitCells?: Array<[number, number]>   // cells triggering cached memo hits
 * }} props
 */
export default function TableRenderer({
  data = [],
  rowHeaders = [],
  colHeaders = [],
  activeCells = [],
  filledCells = [],
  cacheHitCells = [],
}) {
  const colLength = useMemo(() => {
    if (data.length === 0) return 0
    return data[0].length
  }, [data])

  if (data.length === 0) {
    return (
      <div className="table-renderer" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-muted)', margin: 'auto' }}>No table data loaded.</div>
      </div>
    )
  }

  return (
    <div className="table-renderer">
      <table className="dp-table" aria-label="Dynamic programming memoization table">
        {/* Column Headers */}
        {colHeaders && colHeaders.length > 0 && (
          <thead>
            <tr>
              {rowHeaders && rowHeaders.length > 0 && <th aria-label="Row / Column separator"></th>}
              {colHeaders.map((col, idx) => (
                <th key={idx} scope="col">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {data.map((rowArr, rIdx) => {
            const rowHeaderVal = rowHeaders && rowHeaders[rIdx]

            return (
              <tr key={rIdx}>
                {/* Row Header column */}
                {rowHeaderVal !== undefined && (
                  <th scope="row" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                    {rowHeaderVal}
                  </th>
                )}

                {/* Table Data Cells */}
                {rowArr.map((cellVal, cIdx) => {
                  const isActive = isCellInList(rIdx, cIdx, activeCells)
                  const isFilled = isCellInList(rIdx, cIdx, filledCells)
                  const isCacheHit = isCellInList(rIdx, cIdx, cacheHitCells)

                  let tdClass = ''
                  if (isActive) tdClass = 'active'
                  else if (isCacheHit) tdClass = 'cache-hit'
                  else if (isFilled) tdClass = 'filled'

                  return (
                    <td key={cIdx} className={tdClass} title={`Row ${rIdx}, Col ${cIdx}: ${cellVal}`}>
                      {cellVal !== undefined && cellVal !== null && cellVal !== '' ? String(cellVal) : '—'}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
