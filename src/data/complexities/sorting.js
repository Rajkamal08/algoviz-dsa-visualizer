export const sortingComplexities = {
  bubble: {
    best: 'O(n)',
    avg: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    explanation: 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. An optimized version can achieve O(n) best-case time if the array is already sorted.',
  },
  selection: {
    best: 'O(n²)',
    avg: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    explanation: 'Selection Sort divides the array into sorted and unsorted parts. It repeatedly finds the minimum element from the unsorted part and swaps it with the first element of the unsorted part. Runs in O(n²) regardless of initial order.',
  },
  insertion: {
    best: 'O(n)',
    avg: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    explanation: 'Insertion Sort builds the final sorted array one item at a time. It is highly efficient for small datasets or arrays that are already mostly sorted, where it runs in O(n) time.',
  },
  merge: {
    best: 'O(n log n)',
    avg: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
    explanation: 'Merge Sort is a divide-and-conquer algorithm. It divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves. Requires auxiliary O(n) space.',
  },
  quick: {
    best: 'O(n log n)',
    avg: 'O(n log n)',
    worst: 'O(n²)',
    space: 'O(log n)',
    explanation: 'Quick Sort picks an element as a pivot and partitions the array around it. While its average case is O(n log n), if the pivot selection is poor (e.g. sorted array without random pivot), it degrades to O(n²).',
  },
  heapsort: {
    best: 'O(n log n)',
    avg: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(1)',
    explanation: 'Heap Sort builds a max-heap from the input data, then repeatedly extracts the maximum element and restores the heap property. Combines O(n log n) worst-case time with in-place O(1) space.',
  },
}
