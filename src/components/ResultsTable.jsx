function columnsFromRows(rows) {
  const first = rows[0]
  return first ? Object.keys(first) : []
}

export default function ResultsTable({ rows = [] }) {
  const columns = columnsFromRows(rows)

  return (
    <div className="card results-card">
      <div className="card-title">Result Set</div>
      {rows.length === 0 ? (
        <div className="empty-copy">No rows returned for the current query.</div>
      ) : (
        <div className="results-table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column}>{String(row[column])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
