export const trieComplexities = {
  best: 'O(k)',
  avg: 'O(k)',
  worst: 'O(k)',
  space: 'O(n * k)',
  explanation: 'Trie search and insertion depend on word length k rather than node count n. This makes lookup extremely fast and independent of the dictionary size. Space complexity can be high since nodes allocate character pointer slots.',
}
