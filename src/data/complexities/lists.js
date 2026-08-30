export const listsComplexities = {
  linkedList: {
    best: 'O(1) [Insert/Delete at Head]',
    avg: 'O(n) [Search/Delete]',
    worst: 'O(n) [Search/Delete]',
    space: 'O(n)',
    explanation: 'Singly Linked Lists hold elements in sequence using pointers. Inserting or deleting at the head takes O(1) time. Searching or deleting a specific element in the middle requires traversing the list, taking O(n) worst-case time.',
  },
  stack: {
    best: 'O(1)',
    avg: 'O(1)',
    worst: 'O(1)',
    space: 'O(n)',
    explanation: 'Stacks operate under LIFO (Last-In, First-Out). Elements are pushed and popped from the top of the stack, which are O(1) time operations.',
  },
  queue: {
    best: 'O(1)',
    avg: 'O(1)',
    worst: 'O(1)',
    space: 'O(n)',
    explanation: 'Queues operate under FIFO (First-In, First-Out). Elements are enqueued at the tail and dequeued from the head, taking O(1) constant time.',
  },
}
