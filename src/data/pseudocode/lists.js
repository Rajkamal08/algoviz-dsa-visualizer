/**
 * lists.js
 * LinkedList, Stack, and Queue operations pseudocode.
 */

export const listsPseudocode = {
  linkedList: {
    insert: [
      'function insertAtHead(value) {',
      '  let newNode = new Node(value);',
      '  newNode.next = head;',
      '  head = newNode;',
      '}',
    ],
    delete: [
      'function deleteNode(value) {',
      '  let curr = head, prev = null;',
      '  while (curr && curr.value !== value) {',
      '    prev = curr;',
      '    curr = curr.next;',
      '  }',
      '  if (curr) {',
      '    prev.next = curr.next;',
      '  }',
      '}',
    ],
  },
  stack: {
    push: [
      'function push(value) {',
      '  stack.push(value); // inserts at top',
      '}',
    ],
    pop: [
      'function pop() {',
      '  return stack.pop(); // removes from top',
      '}',
    ],
  },
  queue: {
    enqueue: [
      'function enqueue(value) {',
      '  queue.push(value); // inserts at tail',
      '}',
    ],
    dequeue: [
      'function dequeue() {',
      '  return queue.shift(); // removes from head',
      '}',
    ],
  },
}
