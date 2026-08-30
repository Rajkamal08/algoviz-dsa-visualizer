import { bstComplexities } from './bst.js'
import { avlComplexities } from './avl.js'
import { heapComplexities } from './heap.js'
import { trieComplexities } from './trie.js'
import { sortingComplexities } from './sorting.js'
import { graphsComplexities } from './graphs.js'
import { dpComplexities } from './dp.js'
import { listsComplexities } from './lists.js'
import { hashingComplexities } from './hashing.js'
import { backtrackingComplexities } from './backtracking.js'

export const complexities = {
  bst: bstComplexities,
  avl: avlComplexities,
  heap: heapComplexities,
  trie: trieComplexities,
  ...sortingComplexities,
  ...graphsComplexities,
  ...dpComplexities,
  ...listsComplexities,
  ...hashingComplexities,
  ...backtrackingComplexities,
}
