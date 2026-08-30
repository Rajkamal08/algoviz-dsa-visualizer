/**
 * heap.js
 * Heap insertion / extraction heapify pseudocode.
 */

export const heapPseudocode = {
  insert: {
    javascript: [
      'function insert(value) {',
      '  heap.push(value);',
      '  heapifyUp(heap.length - 1);',
      '}',
      'function heapifyUp(index) {',
      '  let parent = Math.floor((index - 1) / 2);',
      '  if (parent >= 0 && heap[index] > heap[parent]) {',
      '    swap(index, parent);',
      '    heapifyUp(parent);',
      '  }',
      '}',
    ],
  },
  extract: {
    javascript: [
      'function extractMax() {',
      '  let max = heap[0];',
      '  heap[0] = heap.pop();',
      '  heapifyDown(0);',
      '  return max;',
      '}',
      'function heapifyDown(index) {',
      '  let largest = index;',
      '  let left = 2 * index + 1;',
      '  let right = 2 * index + 2;',
      '  if (left < heap.length && heap[left] > heap[largest]) largest = left;',
      '  if (right < heap.length && heap[right] > heap[largest]) largest = right;',
      '  if (largest !== index) {',
      '    swap(index, largest);',
      '    heapifyDown(largest);',
      '  }',
      '}',
    ],
  },
}
