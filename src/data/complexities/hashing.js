export const hashingComplexities = {
  'hash-chain': {
    best: 'O(1)',
    avg: 'O(1 + n/k)',
    worst: 'O(n)',
    space: 'O(n + k)',
    explanation: 'Separate Chaining stores collision elements in linked lists within each bucket. With a good hash function and load factor α = n/k, average lookup is O(1 + α). Worst case (all keys hash to same bucket) degrades to O(n).',
  },
  'hash-open': {
    best: 'O(1)',
    avg: 'O(1 / (1 - α))',
    worst: 'O(n)',
    space: 'O(n)',
    explanation: 'Open Addressing resolves collisions by probing for the next open slot. Performance degrades as load factor α approaches 1. Linear probing suffers primary clustering; double hashing distributes probes better.',
  },
}
