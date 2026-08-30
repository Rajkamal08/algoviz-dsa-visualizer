const KEYWORDS = [
  'SELECT',
  'INSERT',
  'INTO',
  'VALUES',
  'DELETE',
  'UPDATE',
  'SET',
  'FROM',
  'WHERE',
  'BETWEEN',
  'AND',
  'OR',
  'COUNT',
  'MIN',
  'MAX',
  'SUM',
  'ORDER',
  'BY',
  'ASC',
  'DESC',
  'LIMIT'
]

function isAlpha(char) {
  return /[A-Za-z_]/.test(char)
}

function isDigit(char) {
  return /[0-9]/.test(char)
}

export function tokenize(input) {
  const tokens = []
  let index = 0

  while (index < input.length) {
    const char = input[index]

    if (/\s/.test(char)) {
      index++
      continue
    }

    if (char === '*') {
      tokens.push({ type: 'STAR', value: '*' })
      index++
      continue
    }

    if (char === ',') {
      tokens.push({ type: 'COMMA', value: ',' })
      index++
      continue
    }

    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' })
      index++
      continue
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' })
      index++
      continue
    }

    if (char === ';') {
      tokens.push({ type: 'SEMICOLON', value: ';' })
      index++
      continue
    }

    if (char === '>' || char === '<') {
      const nextChar = input[index + 1]
      if (nextChar === '=') {
        tokens.push({ type: 'OP', value: char + nextChar })
        index += 2
      } else {
        tokens.push({ type: 'OP', value: char })
        index++
      }
      continue
    }

    if (char === '=') {
      tokens.push({ type: 'OP', value: '=' })
      index++
      continue
    }

    if (char === "'") {
      let end = index + 1
      while (end < input.length && input[end] !== "'") end++
      if (end >= input.length) throw new Error('Unterminated string literal')
      tokens.push({ type: 'STRING', value: input.slice(index + 1, end) })
      index = end + 1
      continue
    }

    if (isAlpha(char)) {
      let end = index + 1
      while (end < input.length && /[A-Za-z0-9_]/.test(input[end])) end++
      const raw = input.slice(index, end)
      const upper = raw.toUpperCase()
      tokens.push({ type: KEYWORDS.includes(upper) ? upper : 'IDENT', value: raw })
      index = end
      continue
    }

    if (isDigit(char)) {
      let end = index + 1
      while (end < input.length && isDigit(input[end])) end++
      tokens.push({ type: 'NUMBER', value: parseInt(input.slice(index, end), 10) })
      index = end
      continue
    }

    throw new Error('Unexpected character: ' + char)
  }

  return tokens
}

export function parse(sql) {
  const tokens = tokenize(sql)
  let position = 0

  function peek(offset = 0) {
    return tokens[position + offset]
  }

  function consume(type) {
    const token = tokens[position]
    if (!token || token.type !== type) {
      throw new Error('Expected ' + type)
    }
    position++
    return token
  }

  function maybe(type) {
    if (peek()?.type === type) {
      position++
      return true
    }
    return false
  }

  function parseColumns() {
    if (maybe('STAR')) return [{ type: 'column', value: '*' }]
    const columns = []
    do {
      const type = peek()?.type
      if (['COUNT', 'MAX', 'MIN', 'SUM'].includes(type)) {
        const aggFunc = consume(type).type
        consume('LPAREN')
        const col = type === 'COUNT' && peek()?.type === 'STAR' ? consume('STAR').value : consume('IDENT').value
        consume('RPAREN')
        columns.push({ type: 'aggregation', func: aggFunc, value: col })
      } else {
        columns.push({ type: 'column', value: consume('IDENT').value })
      }
    } while (maybe('COMMA'))
    return columns
  }

  function parseLiteral() {
    const token = peek()
    if (!token) throw new Error('Expected value')
    if (token.type === 'NUMBER' || token.type === 'STRING') {
      position++
      return token.value
    }
    throw new Error('Expected number or string literal')
  }

  function parseCondition() {
    const column = consume('IDENT').value

    if (maybe('BETWEEN')) {
      const min = consume('NUMBER').value
      consume('AND')
      const max = consume('NUMBER').value
      return { type: 'between', column, min, max }
    }

    const operator = consume('OP').value
    const value = parseLiteral()
    return { type: 'comparison', column, operator, value }
  }

  function parseWhere() {
    if (!maybe('WHERE')) return null
    let condition = parseCondition()

    while (peek()?.type === 'AND' || peek()?.type === 'OR') {
      const logicOp = consume(peek().type).type
      const right = parseCondition()
      condition = { type: 'logical', operator: logicOp, left: condition, right }
    }
    
    return condition
  }

  function parseOrderBy() {
    if (!maybe('ORDER')) return null
    consume('BY')
    const column = consume('IDENT').value
    let direction = 'ASC'
    if (peek()?.type === 'ASC' || peek()?.type === 'DESC') {
      direction = consume(peek().type).type
    }
    return { column, direction }
  }

  function parseLimit() {
    if (!maybe('LIMIT')) return null
    return consume('NUMBER').value
  }

  function ensureComplete() {
    maybe('SEMICOLON')
    if (position !== tokens.length) {
      throw new Error('Unexpected trailing tokens')
    }
  }

  function parseSelect() {
    consume('SELECT')
    const columns = parseColumns()
    consume('FROM')
    const table = consume('IDENT').value
    const where = parseWhere()
    const orderBy = parseOrderBy()
    const limit = parseLimit()
    ensureComplete()

    return {
      type: 'SelectStatement',
      columns,
      table,
      where,
      orderBy,
      limit
    }
  }

  function parseInsert() {
    consume('INSERT')
    consume('INTO')
    const table = consume('IDENT').value
    consume('LPAREN')
    const columns = [consume('IDENT').value]
    while (maybe('COMMA')) columns.push(consume('IDENT').value)
    consume('RPAREN')
    consume('VALUES')
    consume('LPAREN')
    const values = [parseLiteral()]
    while (maybe('COMMA')) values.push(parseLiteral())
    consume('RPAREN')
    ensureComplete()

    return {
      type: 'InsertStatement',
      table,
      columns,
      values
    }
  }

  function parseDelete() {
    consume('DELETE')
    consume('FROM')
    const table = consume('IDENT').value
    const where = parseWhere()
    if (!where) throw new Error('DELETE requires a WHERE clause')
    ensureComplete()

    return {
      type: 'DeleteStatement',
      table,
      where
    }
  }

  function parseUpdate() {
    consume('UPDATE')
    const table = consume('IDENT').value
    consume('SET')
    const assignments = []
    do {
      const column = consume('IDENT').value
      consume('OP')
      const value = parseLiteral()
      assignments.push({ column, value })
    } while (maybe('COMMA'))
    const where = parseWhere()
    if (!where) throw new Error('UPDATE requires a WHERE clause')
    ensureComplete()

    return {
      type: 'UpdateStatement',
      table,
      assignments,
      where
    }
  }

  const first = peek()?.type
  if (first === 'SELECT') return parseSelect()
  if (first === 'INSERT') return parseInsert()
  if (first === 'DELETE') return parseDelete()
  if (first === 'UPDATE') return parseUpdate()
  throw new Error('Only SELECT, INSERT, UPDATE, and DELETE statements are supported')
}
