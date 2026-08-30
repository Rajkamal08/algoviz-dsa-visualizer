let nodeSequence = 1

class BPlusNode {
  constructor(isLeaf) {
    this.id = nodeSequence++
    this.isLeaf = isLeaf
    this.keys = []
    this.parent = null
    if (isLeaf) {
      this.values = []
      this.next = null
    } else {
      this.children = []
    }
  }
}

export default class BPlusTree {
  constructor(maxLeafKeys = 4, maxInternalKeys = 4, unique = true, minValue = Number.NEGATIVE_INFINITY) {
    this.maxLeafKeys = maxLeafKeys
    this.maxInternalKeys = maxInternalKeys
    this.unique = unique
    this.minValue = minValue
    this.root = null
  }

  insert(key, value) {
    if (!this.root) {
      const root = new BPlusNode(true)
      root.keys.push(key)
      root.values.push(this.unique ? value : [value])
      this.root = root
      return
    }

    const { leaf } = this._findLeafPath(key)
    const insertAt = this._lowerBound(leaf.keys, key)
    if (leaf.keys[insertAt] === key) {
      if (this.unique) {
        leaf.values[insertAt] = value
      } else {
        leaf.values[insertAt].push(value)
      }
    } else {
      leaf.keys.splice(insertAt, 0, key)
      leaf.values.splice(insertAt, 0, this.unique ? value : [value])
    }

    if (leaf.keys.length > this.maxLeafKeys) {
      this._splitLeaf(leaf)
    }
  }

  search(key) {
    return this.searchExact(key)
  }

  searchExact(key) {
    if (!this.root) {
      return { found: false, key, value: null, rows: [], path: [], leaf: null, leafIndex: -1, scannedLeaves: [] }
    }

    const { path, leaf } = this._findLeafPath(key)
    const leafIndex = this._lowerBound(leaf.keys, key)
    const found = leafIndex < leaf.keys.length && leaf.keys[leafIndex] === key
    const value = found ? leaf.values[leafIndex] : null

    let rows = []
    if (found) {
      rows = this.unique ? [value] : [...value]
    }

    return {
      found,
      key,
      value,
      rows,
      path,
      leaf,
      leafIndex,
      scannedLeaves: leaf ? [leaf] : []
    }
  }

  searchRange(filter) {
    if (!this.root) {
      return { rows: [], path: [], scannedLeaves: [], startLeaf: null }
    }

    if (!filter) {
      const path = this._findLeafPath(this.minValue).path
      const rows = this.getAllRecords()
      return { rows, path, scannedLeaves: this.getLeafChain(), startLeaf: this.getFirstLeaf() }
    }

    if (filter.type === 'comparison' && filter.operator === '=') {
      const exact = this.searchExact(filter.value)
      return { rows: exact.rows, path: exact.path, scannedLeaves: exact.scannedLeaves, startLeaf: exact.leaf }
    }

    if (filter.type === 'between') {
      const start = this._findLeafPath(filter.min)
      return this._scanLeaves(start.path, start.leaf, start.leaf ? this._lowerBound(start.leaf.keys, filter.min) : 0, (key) => key >= filter.min && key <= filter.max, (key) => key > filter.max)
    }

    if (filter.type === 'comparison') {
      if (filter.operator === '>' || filter.operator === '>=') {
        const start = this._findLeafPath(filter.value)
        const leafIndex = start.leaf ? this._lowerBound(start.leaf.keys, filter.value) : 0
        const startIndex = filter.operator === '>' && start.leaf && start.leaf.keys[leafIndex] === filter.value ? leafIndex + 1 : leafIndex
        return this._scanLeaves(start.path, start.leaf, startIndex, (key) => filter.operator === '>' ? key > filter.value : key >= filter.value)
      }

      if (filter.operator === '<' || filter.operator === '<=') {
        const start = this._findLeafPath(this.minValue)
        return this._scanLeaves(start.path, start.leaf, 0, (key) => filter.operator === '<' ? key < filter.value : key <= filter.value, (key) => filter.operator === '<' ? key >= filter.value : key > filter.value)
      }
    }

    throw new Error('Unsupported range filter')
  }

  getFirstLeaf() {
    if (!this.root) return null
    let node = this.root
    while (node && !node.isLeaf) node = node.children[0]
    return node
  }

  getLeafChain() {
    const leaves = []
    let node = this.getFirstLeaf()
    while (node) {
      leaves.push(node)
      node = node.next
    }
    return leaves
  }

  getAllRecords() {
    const rows = []
    let leaf = this.getFirstLeaf()
    while (leaf) {
      for (const row of leaf.values) {
        if (this.unique) rows.push(row)
        else rows.push(...row)
      }
      leaf = leaf.next
    }
    return rows
  }

  getStats() {
    if (!this.root) {
      return { height: 0, internalNodes: 0, leafNodes: 0, totalNodes: 0, totalRecords: 0, averageFillFactor: 0 }
    }

    let internalNodes = 0
    let leafNodes = 0
    let usedKeys = 0
    let totalCapacity = 0
    const queue = [this.root]
    while (queue.length) {
      const node = queue.shift()
      usedKeys += node.keys.length
      if (node.isLeaf) {
        leafNodes++
        totalCapacity += this.maxLeafKeys
      } else {
        internalNodes++
        totalCapacity += this.maxInternalKeys
        for (const child of node.children) queue.push(child)
      }
    }

    return {
      height: this._height(this.root),
      internalNodes,
      leafNodes,
      totalNodes: internalNodes + leafNodes,
      totalRecords: this.getAllRecords().length,
      averageFillFactor: totalCapacity === 0 ? 0 : Math.round((usedKeys / totalCapacity) * 100)
    }
  }

  toJSON() {
    const items = []
    const queue = this.root ? [this.root] : []
    while (queue.length) {
      const node = queue.shift()
      items.push(this._nodeSnapshot(node))
      if (!node.isLeaf) {
        for (const child of node.children) queue.push(child)
      }
    }
    return items
  }

  _findLeafPath(key) {
    const path = []
    let node = this.root
    while (node && !node.isLeaf) {
      path.push(node)
      node = node.children[this._findChildIndex(node.keys, key)]
    }
    if (node) path.push(node)
    return { path, leaf: node }
  }

  _scanLeaves(path, startLeaf, startIndex, includePredicate, stopPredicate = null) {
    const rows = []
    const scannedLeaves = []
    let leaf = startLeaf
    let index = startIndex

    while (leaf) {
      scannedLeaves.push(leaf)
      for (let i = index; i < leaf.keys.length; i++) {
        const key = leaf.keys[i]
        if (stopPredicate && stopPredicate(key)) {
          return { rows, path, scannedLeaves, startLeaf }
        }
        if (includePredicate(key)) {
          if (this.unique) rows.push(leaf.values[i])
          else rows.push(...leaf.values[i])
        }
      }
      leaf = leaf.next
      index = 0
    }

    return { rows, path, scannedLeaves, startLeaf }
  }

  _lowerBound(items, target) {
    let low = 0
    let high = items.length
    while (low < high) {
      const mid = (low + high) >> 1
      if (items[mid] < target) low = mid + 1
      else high = mid
    }
    return low
  }

  _findChildIndex(keys, key) {
    let index = 0
    while (index < keys.length && key >= keys[index]) index++
    return index
  }

  _splitLeaf(leaf) {
    const right = new BPlusNode(true)
    const splitIndex = Math.ceil(leaf.keys.length / 2)

    right.keys = leaf.keys.slice(splitIndex)
    right.values = leaf.values.slice(splitIndex)
    right.parent = leaf.parent
    right.next = leaf.next

    leaf.keys = leaf.keys.slice(0, splitIndex)
    leaf.values = leaf.values.slice(0, splitIndex)
    leaf.next = right

    this._insertIntoParent(leaf, right.keys[0], right)
  }

  _insertIntoParent(leftNode, separator, rightNode) {
    const parent = leftNode.parent

    if (!parent) {
      const newRoot = new BPlusNode(false)
      newRoot.keys = [separator]
      newRoot.children = [leftNode, rightNode]
      leftNode.parent = newRoot
      rightNode.parent = newRoot
      this.root = newRoot
      return
    }

    const leftIndex = parent.children.indexOf(leftNode)
    parent.keys.splice(leftIndex, 0, separator)
    parent.children.splice(leftIndex + 1, 0, rightNode)
    rightNode.parent = parent

    if (parent.keys.length > this.maxInternalKeys) {
      this._splitInternal(parent)
    }
  }

  _splitInternal(node) {
    const middleIndex = Math.floor(node.keys.length / 2)
    const separator = node.keys[middleIndex]
    const rightNode = new BPlusNode(false)

    rightNode.keys = node.keys.slice(middleIndex + 1)
    rightNode.children = node.children.slice(middleIndex + 1)
    rightNode.parent = node.parent

    node.keys = node.keys.slice(0, middleIndex)
    node.children = node.children.slice(0, middleIndex + 1)

    for (const child of node.children) child.parent = node
    for (const child of rightNode.children) child.parent = rightNode

    this._insertIntoParent(node, separator, rightNode)
  }

  _height(node) {
    let height = 0
    let current = node
    while (current) {
      height++
      current = current.isLeaf ? null : current.children[0]
    }
    return height
  }

  _nodeSnapshot(node) {
    if (node.isLeaf) {
      return { id: node.id, isLeaf: true, keys: [...node.keys] }
    }

    return {
      id: node.id,
      isLeaf: false,
      keys: [...node.keys],
      children: node.children.map((child) => child.id)
    }
  }
}
