/**
 * complexities/bst.js
 *
 * Time and Space complexity metrics for BST.
 */

export const bstComplexities = {
  best: 'O(log n)',
  avg: 'O(log n)',
  worst: 'O(n)',
  space: 'O(n)',
  explanation: 'Time complexity is proportional to height. In a balanced BST, height is O(log n). If keys are inserted in sorted order, the tree becomes a linked list with worst-case O(n) height. Space complexity is O(n) to store nodes (recursive call stack takes maximum O(h) space).',
}
