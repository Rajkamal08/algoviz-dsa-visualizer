export const heapComplexities = {
  best: 'O(1) [Peek]',
  avg: 'O(log n) [Insert/Extract]',
  worst: 'O(log n) [Insert/Extract]',
  space: 'O(n)',
  explanation: 'Heaps are binary trees stored in arrays. Accessing/peeking at the root (min or max element) is O(1). Inserting a new key or extracting the root requires bubble-up (heapifyUp) or trickle-down (heapifyDown) recursion, taking maximum O(log n) height operations.',
}
