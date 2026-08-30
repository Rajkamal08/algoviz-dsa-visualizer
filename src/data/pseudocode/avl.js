/**
 * avl.js
 * AVL tree rotations pseudocode.
 */

export const avlPseudocode = {
  insert: {
    javascript: [
      'function insert(node, key) {',
      '  if (!node) return new Node(key);',
      '  if (key < node.key) node.left = insert(node.left, key);',
      '  else if (key > node.key) node.right = insert(node.right, key);',
      '  else return node;',
      '  updateHeight(node);',
      '  let balance = getBalance(node);',
      '  if (balance > 1 && key < node.left.key) return rightRotate(node);',
      '  if (balance < -1 && key > node.right.key) return leftRotate(node);',
      '  if (balance > 1 && key > node.left.key) {',
      '    node.left = leftRotate(node.left);',
      '    return rightRotate(node);',
      '  }',
      '  if (balance < -1 && key < node.right.key) {',
      '    node.right = rightRotate(node.right);',
      '    return leftRotate(node);',
      '  }',
      '  return node;',
      '}',
    ],
  },
}
