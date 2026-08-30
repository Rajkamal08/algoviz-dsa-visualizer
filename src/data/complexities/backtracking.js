export const backtrackingComplexities = {
  nqueens: {
    best: 'O(n!)',
    avg: 'O(n!)',
    worst: 'O(n!)',
    space: 'O(n)',
    explanation: 'N-Queens explores all permutations of queen placements. Backtracking prunes invalid branches early, but worst-case remains factorial. Space is O(n) for the recursion call stack.',
  },
}
