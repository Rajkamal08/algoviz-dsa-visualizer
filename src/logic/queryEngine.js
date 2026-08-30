import { parse } from './SQLParser.js'

const USER_COLUMNS = ['id', 'name', 'email', 'department', 'tier']

function uniqueNodes(nodes) {
  const seen = new Set()
  return nodes.filter((node) => {
    if (!node || seen.has(node.id)) return false
    seen.add(node.id)
    return true
  })
}

function fail(message) {
  const error = new Error(message)
  error.userFacing = true
  throw error
}

function friendlyParseError(error) {
  const message = error?.message || 'Unknown parser error'
  if (message.includes('Unterminated string')) {
    return "Invalid SQL. Close all text values with single quotes, for example 'User 101'."
  }
  return 'Invalid SQL. Use one of the supported query examples shown in the app.'
}

function nodeLabel(node, index, total) {
  if (index === 0) return 'Root'
  if (index === total - 1) return node.isLeaf ? 'Target Leaf' : 'Target Node'
  return node.isLeaf ? 'Leaf' : 'Internal'
}

function previewNodes(path, scannedLeaves = []) {
  const preview = path.map((node, index) => ({
    id: node.id,
    label: nodeLabel(node, index, path.length),
    kind: node.isLeaf ? 'Leaf' : 'Internal',
    keys: [...node.keys]
  }))
  if (scannedLeaves.length > 1) {
    preview.push({
      id: `scan-${scannedLeaves.length}`,
      label: 'Leaf Scan',
      kind: 'Range',
      keys: [`${scannedLeaves.length} linked leaves`]
    })
  }
  return preview
}

function applyAggregations(rows, columns) {
  const isAgg = columns.some((c) => c.type === 'aggregation')
  if (!isAgg) {
    return rows.map((row) => {
      const next = {}
      for (const col of columns) {
        if (col.value === '*') return row
        next[col.value] = row[col.value]
      }
      return next
    })
  }

  const resultRow = {}
  for (const col of columns) {
    if (col.type === 'aggregation') {
      const key = `${col.func}(${col.value})`
      if (col.func === 'COUNT') resultRow[key] = rows.length
      else if (col.func === 'MAX') resultRow[key] = Math.max(...rows.map((r) => r[col.value]))
      else if (col.func === 'MIN') resultRow[key] = Math.min(...rows.map((r) => r[col.value]))
      else if (col.func === 'SUM') resultRow[key] = rows.reduce((acc, r) => acc + (r[col.value] || 0), 0)
    } else {
      resultRow[col.value] = rows.length > 0 ? rows[0][col.value] : null
    }
  }
  return [resultRow]
}

function sortRows(rows, orderBy) {
  if (!orderBy) return rows
  const direction = orderBy.direction === 'DESC' ? -1 : 1
  return [...rows].sort((a, b) => {
    if (a[orderBy.column] < b[orderBy.column]) return -1 * direction
    if (a[orderBy.column] > b[orderBy.column]) return 1 * direction
    return 0
  })
}

function validateTable(table) {
  if (table.toLowerCase() !== 'users') {
    fail('Only the users table is available in this demo.')
  }
}

function validateSelectedColumns(columns) {
  for (const colDef of columns) {
    if (colDef.value === '*') continue
    if (!USER_COLUMNS.includes(colDef.value)) {
      fail(`Unknown column "${colDef.value}". Try one of: ${USER_COLUMNS.join(', ')}.`)
    }
  }
}

function extractIndexCondition(where) {
  if (!where) return { indexCondition: null, secIndexCondition: null, memoryCondition: null }
  
  if (where.type === 'logical') {
    if (where.operator === 'AND') {
      const left = extractIndexCondition(where.left)
      const right = extractIndexCondition(where.right)
      
      let indexCondition = left.indexCondition || right.indexCondition
      let secIndexCondition = left.secIndexCondition || right.secIndexCondition
      
      let memConditions = []
      if (left.memoryCondition) memConditions.push(left.memoryCondition)
      if (right.memoryCondition) memConditions.push(right.memoryCondition)
      if (left.indexCondition && right.indexCondition) {
        memConditions.push(right.indexCondition)
      }
      if (left.secIndexCondition && right.secIndexCondition) {
        memConditions.push(right.secIndexCondition)
      }
      
      if (indexCondition && secIndexCondition) {
        if (secIndexCondition !== indexCondition) {
          memConditions.push(secIndexCondition)
        }
        secIndexCondition = null
      }
      
      let memoryCondition = null
      if (memConditions.length > 0) {
        memoryCondition = memConditions.reduce((acc, curr) => ({ type: 'logical', operator: 'AND', left: acc, right: curr }))
      }
      
      return { indexCondition, secIndexCondition, memoryCondition }
    } else {
      return { indexCondition: null, secIndexCondition: null, memoryCondition: where }
    }
  }
  
  if (where.column.toLowerCase() === 'id') {
    return { indexCondition: where, secIndexCondition: null, memoryCondition: null }
  }
  
  if (where.column.toLowerCase() === 'department') {
    return { indexCondition: null, secIndexCondition: where, memoryCondition: null }
  }
  
  return { indexCondition: null, secIndexCondition: null, memoryCondition: where }
}

function evaluateCondition(row, condition) {
  if (!condition) return true
  
  if (condition.type === 'logical') {
    const left = evaluateCondition(row, condition.left)
    const right = evaluateCondition(row, condition.right)
    return condition.operator === 'AND' ? (left && right) : (left || right)
  }
  
  const val = row[condition.column]
  if (condition.type === 'between') {
    return val >= condition.min && val <= condition.max
  }
  
  if (condition.type === 'comparison') {
    switch (condition.operator) {
      case '=': return val === condition.value
      case '>': return val > condition.value
      case '>=': return val >= condition.value
      case '<': return val < condition.value
      case '<=': return val <= condition.value
    }
  }
  return false
}

function buildSelectPlan(ast, rows, rangeResult, memoryCondition, secResult = null) {
  const steps = []
  const colNames = ast.columns.map(c => c.type === 'aggregation' ? `${c.func}(${c.value})` : c.value).join(', ')

  steps.push({ label: 'Parse SQL', detail: 'Tokenize and validate the SELECT statement.' })
  steps.push({ label: 'Validate Query', detail: 'Ensure only the users table and valid columns are used.' })
  
  if (secResult) {
    steps.push({ label: 'Index Scan (Secondary)', detail: `Traverse Department Index to find matching primary IDs.` })
    steps.push({ label: 'Bookmark Lookup', detail: `Look up ${secResult.rows.length} row(s) in the Primary Index.` })
  } else {
    steps.push({ label: 'Index Scan (Primary)', detail: `Traverse ${rangeResult.path.length} node(s) toward the starting leaf.` })
    if (rangeResult.scannedLeaves.length > 1) {
      steps.push({ label: 'Leaf Scan', detail: `Scan ${rangeResult.scannedLeaves.length} linked leaf node(s).` })
    } else {
      steps.push({ label: 'Leaf Probe', detail: 'Inspect the target leaf node.' })
    }
  }

  if (memoryCondition) {
    steps.push({ label: 'Filter Rows', detail: `Apply in-memory filter to narrow down results.` })
  }
  if (ast.columns.some(c => c.type === 'aggregation')) {
    steps.push({ label: 'Aggregate', detail: `Calculate aggregations for final output.` })
  }
  steps.push({ label: 'Project Rows', detail: `Return ${rows.length} row(s) for columns ${colNames}.` })
  return steps
}

function buildMutationPlan(kind, affectedRows, pathLength) {
  return [
    { label: 'Parse SQL', detail: `Read the ${kind.toUpperCase()} statement and validate its syntax.` },
    { label: 'Validate Query', detail: 'Ensure the users table and indexed id column are used safely.' },
    { label: 'Descend Index', detail: `Traverse ${pathLength} node(s) to reach the target leaf.` },
    { label: kind === 'insert' ? 'Insert Row' : 'Delete Row', detail: `${kind === 'insert' ? 'Insert' : 'Remove'} ${affectedRows} row(s) from the in-memory dataset.` },
    { label: 'Rebuild Index', detail: 'Rebuild the B+ Tree so the visual index stays in sync with the dataset.' }
  ]
}

function buildAnimationFrames(path, scannedLeaves = [], treeName = 'primary') {
  const animationNodes = uniqueNodes([...path, ...scannedLeaves])
  const pathIds = new Set(path.map((node) => node.id))
  return animationNodes.map((node) => ({
    node,
    treeName,
    phase: pathIds.has(node.id) ? 'descend' : 'scan'
  }))
}

function executeSelect(ast, tree, secTree) {
  validateTable(ast.table)
  validateSelectedColumns(ast.columns)

  const { indexCondition, secIndexCondition, memoryCondition } = extractIndexCondition(ast.where)

  if (ast.orderBy && ast.orderBy.column.toLowerCase() !== 'id') {
    fail('Only ORDER BY id is supported in this demo.')
  }

  let matchedRows = []
  let animationFrames = []
  let planSteps = []
  let scanStats = {}

  if (indexCondition || !secIndexCondition) {
    const rangeResult = tree.searchRange(indexCondition)
    matchedRows = rangeResult.rows.filter(r => evaluateCondition(r, memoryCondition))
    animationFrames = buildAnimationFrames(rangeResult.path, rangeResult.scannedLeaves, 'primary')
    planSteps = buildSelectPlan(ast, [], rangeResult, memoryCondition, null)
    scanStats = { pathDepth: rangeResult.path.length, scannedLeaves: rangeResult.scannedLeaves.length }
  } else if (secIndexCondition && secTree) {
    const secResult = secTree.searchRange(secIndexCondition)
    animationFrames = buildAnimationFrames(secResult.path, secResult.scannedLeaves, 'secondary')
    
    const primaryLookups = []
    for (const id of secResult.rows) {
      const lookup = tree.searchExact(id)
      primaryLookups.push(lookup)
      animationFrames = animationFrames.concat(buildAnimationFrames(lookup.path, lookup.scannedLeaves, 'primary'))
    }
    
    matchedRows = primaryLookups.map(l => l.value).filter(Boolean).filter(r => evaluateCondition(r, memoryCondition))
    planSteps = buildSelectPlan(ast, [], null, memoryCondition, secResult)
    scanStats = { pathDepth: secResult.path.length, scannedLeaves: secResult.scannedLeaves.length, lookups: primaryLookups.length }
  }

  matchedRows = sortRows(matchedRows, ast.orderBy)
  if (typeof ast.limit === 'number') matchedRows = matchedRows.slice(0, ast.limit)

  let finalRows = applyAggregations(matchedRows, ast.columns)
  planSteps[planSteps.length - 1].detail = `Return ${finalRows.length} row(s) for columns ${ast.columns.map(c => c.type === 'aggregation' ? `${c.func}(${c.value})` : c.value).join(', ')}.`

  return {
    kind: 'select',
    rows: finalRows,
    animationFrames,
    planSteps,
    summary: `Returned ${finalRows.length} row(s) using ${secIndexCondition ? 'Secondary' : 'Primary'} Index.`,
    scan: scanStats
  }
}

function buildInsertRow(ast, records) {
  validateTable(ast.table)
  if (ast.columns.length !== ast.values.length) {
    fail('INSERT columns and values must have the same length.')
  }

  const row = {
    id: null,
    name: '',
    email: '',
    department: 'Engineering',
    tier: 'Bronze'
  }

  for (let index = 0; index < ast.columns.length; index++) {
    const colDef = ast.columns[index]
    if (colDef.type === 'aggregation') fail('Cannot use aggregation in INSERT.')
    const column = colDef.value
    if (!USER_COLUMNS.includes(column)) {
      fail(`Unknown column "${column}" in INSERT statement.`)
    }
    row[column] = ast.values[index]
  }

  if (typeof row.id !== 'number') {
    fail('INSERT requires a numeric id value.')
  }
  if (records.some((record) => record.id === row.id)) {
    fail(`A user with id ${row.id} already exists.`)
  }

  row.name = String(row.name || `User ${row.id}`)
  row.email = String(row.email || `user${row.id}@example.com`)
  row.department = String(row.department || 'Engineering')
  row.tier = String(row.tier || 'Bronze')

  return row
}

function executeInsert(ast, tree, records) {
  const row = buildInsertRow(ast, records)
  const lookup = tree.searchExact(row.id)
  const nextRecords = [...records, row].sort((a, b) => a.id - b.id)

  return {
    kind: 'insert',
    rows: [row],
    nextRecords,
    animationFrames: buildAnimationFrames(lookup.path, lookup.scannedLeaves),
    previewNodes: previewNodes(lookup.path, lookup.scannedLeaves),
    planSteps: buildMutationPlan('insert', 1, lookup.path.length),
    summary: `Inserted user ${row.id} into the dataset and rebuilt the B+ Tree index.`,
    scan: {
      pathDepth: lookup.path.length,
      scannedLeaves: lookup.scannedLeaves.length
    }
  }
}

function executeDelete(ast, tree, records) {
  validateTable(ast.table)
  if (ast.where.column.toLowerCase() !== 'id') {
    fail('DELETE only supports filters on the indexed id column.')
  }

  const rangeResult = tree.searchRange(ast.where)
  if (rangeResult.rows.length === 0) {
    fail('No matching rows were found to delete.')
  }

  const deletedIds = new Set(rangeResult.rows.map((row) => row.id))
  const nextRecords = records.filter((row) => !deletedIds.has(row.id))

  return {
    kind: 'delete',
    rows: rangeResult.rows,
    nextRecords,
    animationFrames: buildAnimationFrames(rangeResult.path, rangeResult.scannedLeaves),
    previewNodes: previewNodes(rangeResult.path, rangeResult.scannedLeaves),
    planSteps: buildMutationPlan('delete', rangeResult.rows.length, rangeResult.path.length),
    summary: `Deleted ${rangeResult.rows.length} row(s) and rebuilt the B+ Tree index.`,
    scan: {
      pathDepth: rangeResult.path.length,
      scannedLeaves: rangeResult.scannedLeaves.length
    }
  }
}

function executeUpdate(ast, tree, records) {
  validateTable(ast.table)
  if (ast.where.column.toLowerCase() !== 'id') {
    fail('UPDATE only supports filters on the indexed id column.')
  }

  for (const assignment of ast.assignments) {
    if (!USER_COLUMNS.includes(assignment.column)) {
      fail(`Unknown column "${assignment.column}" in UPDATE statement.`)
    }
    if (assignment.column === 'id') {
      fail('Updating the id column is not supported in this demo.')
    }
  }

  const rangeResult = tree.searchRange(ast.where)
  if (rangeResult.rows.length === 0) {
    fail('No matching rows were found to update.')
  }

  const updatedIds = new Set(rangeResult.rows.map((row) => row.id))
  const nextRecords = records.map((record) => {
    if (!updatedIds.has(record.id)) return record
    const next = { ...record }
    for (const assignment of ast.assignments) {
      next[assignment.column] = assignment.value
    }
    return next
  })

  return {
    kind: 'update',
    rows: nextRecords.filter((record) => updatedIds.has(record.id)),
    nextRecords,
    animationFrames: buildAnimationFrames(rangeResult.path, rangeResult.scannedLeaves),
    previewNodes: previewNodes(rangeResult.path, rangeResult.scannedLeaves),
    planSteps: buildMutationPlan('update', rangeResult.rows.length, rangeResult.path.length),
    summary: `Updated ${rangeResult.rows.length} row(s) and rebuilt the B+ Tree index.`,
    scan: {
      pathDepth: rangeResult.path.length,
      scannedLeaves: rangeResult.scannedLeaves.length
    }
  }
}

export function executeQuery(sql, context) {
  const { tree, secTree, records } = context

  let ast
  try {
    ast = parse(sql)
  } catch (error) {
    fail(friendlyParseError(error))
  }

  if (ast.type === 'SelectStatement') return executeSelect(ast, tree, secTree)
  if (ast.type === 'InsertStatement') return executeInsert(ast, tree, records)
  if (ast.type === 'DeleteStatement') return executeDelete(ast, tree, records)
  fail('Unsupported SQL statement.')
}
