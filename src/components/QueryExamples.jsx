const EXAMPLES = [
  "SELECT * FROM users WHERE department = 'Sales'",
  'SELECT * FROM users WHERE id = 42',
  "SELECT * FROM users WHERE id > 20 AND tier = 'Gold'",
  'SELECT COUNT(*), MAX(id) FROM users WHERE id BETWEEN 10 AND 50',
  'SELECT id, name FROM users WHERE id >= 80 ORDER BY id DESC LIMIT 8',
  "INSERT INTO users (id, name, department) VALUES (101, 'User 101', 'Research')",
  'DELETE FROM users WHERE id = 42'
]

export default function QueryExamples({ onPick }) {
  return (
    <div className="card">
      <div className="card-title">Example Queries</div>
      <div className="example-list">
        {EXAMPLES.map((sql) => (
          <button key={sql} className="example-button" onClick={() => onPick(sql)}>
            {sql}
          </button>
        ))}
      </div>
    </div>
  )
}
