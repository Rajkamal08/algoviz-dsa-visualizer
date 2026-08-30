export const hashingPseudocode = {
  'hash-chain': {
    javascript: [
      'function hashChain(key, tableSize) {',
      '  let h = key % tableSize;',
      '  // Each bucket holds a linked list',
      '  if (table[h] exists) {',
      '    table[h].append(key);',
      '  } else {',
      '    table[h] = new LinkedList(key);',
      '  }',
      '}',
    ],
  },
  'hash-open': {
    javascript: [
      'function hashOpenLinear(key, tableSize) {',
      '  let h = key % tableSize;',
      '  let i = 0;',
      '  while (table[(h + i) % tableSize] !== null) {',
      '    i++; // Probe next slot',
      '  }',
      '  table[(h + i) % tableSize] = key;',
      '}',
    ],
  },
}
