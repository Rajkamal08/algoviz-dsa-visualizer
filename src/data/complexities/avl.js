export const avlComplexities = {
  best: 'O(log n)',
  avg: 'O(log n)',
  worst: 'O(log n)',
  space: 'O(n)',
  explanation: 'AVL trees are strictly height-balanced BSTs. The balance factor (height diff of left/right subtrees) is kept at -1, 0, or 1. This guarantees height is always O(log n), so even in the worst case, insertion, search, and deletion run in O(log n) time.',
}
