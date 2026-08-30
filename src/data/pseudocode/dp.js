/**
 * dp.js
 * Dynamic Programming algorithms pseudocode.
 */

export const dpPseudocode = {
  fibonacci: {
    javascript: [
      'function fib(n) {',
      '  let dp = [0, 1];',
      '  for (let i = 2; i <= n; i++) {',
      '    dp[i] = dp[i - 1] + dp[i - 2];',
      '  }',
      '  return dp[n];',
      '}',
    ],
  },
  lcs: {
    javascript: [
      'function LCS(X, Y) {',
      '  let m = X.length, n = Y.length;',
      '  let dp = Array(m+1).fill().map(() => Array(n+1).fill(0));',
      '  for (let i = 1; i <= m; i++) {',
      '    for (let j = 1; j <= n; j++) {',
      '      if (X[i-1] === Y[j-1]) {',
      '        dp[i][j] = dp[i-1][j-1] + 1;',
      '      } else {',
      '        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);',
      '      }',
      '    }',
      '  }',
      '  return dp[m][n];',
      '}',
    ],
  },
}
