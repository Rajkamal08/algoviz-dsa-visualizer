export const dpComplexities = {
  fibonacci: {
    best: 'O(n)',
    avg: 'O(n)',
    worst: 'O(n)',
    space: 'O(n)',
    explanation: 'Fibonacci Tabulation runs in linear O(n) time by computing subproblems bottom-up and storing them in an array. This avoids the O(2ⁿ) exponential recursion tree.',
  },
  lcs: {
    best: 'O(m * n)',
    avg: 'O(m * n)',
    worst: 'O(m * n)',
    space: 'O(m * n)',
    explanation: 'Longest Common Subsequence of strings X (length m) and Y (length n) uses a 2D grid of size (m+1) x (n+1). Every cell is computed in O(1) based on its diagonal and side dependencies.',
  },
}
