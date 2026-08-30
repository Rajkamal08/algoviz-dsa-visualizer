/**
 * trie.js
 * Trie prefix tree operations pseudocode.
 */

export const triePseudocode = {
  insert: {
    javascript: [
      'function insert(word) {',
      '  let current = root;',
      '  for (let char of word) {',
      '    if (!current.children[char]) {',
      '      current.children[char] = new Node();',
      '    }',
      '    current = current.children[char];',
      '  }',
      '  current.isEndOfWord = true;',
      '}',
    ],
  },
  search: {
    javascript: [
      'function search(word) {',
      '  let current = root;',
      '  for (let char of word) {',
      '    if (!current.children[char]) return false;',
      '    current = current.children[char];',
      '  }',
      '  return current.isEndOfWord;',
      '}',
    ],
  },
}
