/**
 * sorting.js
 * Pseudocodes for all sorting algorithms.
 */

export const sortingPseudocode = {
  bubble: {
    javascript: [
      'function bubbleSort(arr) {',
      '  for (let i = 0; i < arr.length; i++) {',
      '    for (let j = 0; j < arr.length - i - 1; j++) {',
      '      if (arr[j] > arr[j + 1]) {',
      '        swap(arr, j, j + 1);',
      '      }',
      '    }',
      '  }',
      '}',
    ],
  },
  selection: {
    javascript: [
      'function selectionSort(arr) {',
      '  for (let i = 0; i < arr.length; i++) {',
      '    let minIdx = i;',
      '    for (let j = i + 1; j < arr.length; j++) {',
      '      if (arr[j] < arr[minIdx]) minIdx = j;',
      '    }',
      '    swap(arr, i, minIdx);',
      '  }',
      '}',
    ],
  },
  insertion: {
    javascript: [
      'function insertionSort(arr) {',
      '  for (let i = 1; i < arr.length; i++) {',
      '    let key = arr[i];',
      '    let j = i - 1;',
      '    while (j >= 0 && arr[j] > key) {',
      '      arr[j + 1] = arr[j];',
      '      j--;',
      '    }',
      '    arr[j + 1] = key;',
      '  }',
      '}',
    ],
  },
  merge: {
    javascript: [
      'function mergeSort(arr, l, r) {',
      '  if (l >= r) return;',
      '  let m = l + Math.floor((r - l) / 2);',
      '  mergeSort(arr, l, m);',
      '  mergeSort(arr, m + 1, r);',
      '  merge(arr, l, m, r);',
      '}',
    ],
  },
  quick: {
    javascript: [
      'function quickSort(arr, low, high) {',
      '  if (low < high) {',
      '    let pi = partition(arr, low, high);',
      '    quickSort(arr, low, pi - 1);',
      '    quickSort(arr, pi + 1, high);',
      '  }',
      '}',
      'function partition(arr, low, high) {',
      '  let pivot = arr[high];',
      '  let i = low - 1;',
      '  for (let j = low; j < high; j++) {',
      '    if (arr[j] < pivot) {',
      '      i++; swap(arr, i, j);',
      '    }',
      '  }',
      '  swap(arr, i + 1, high);',
      '  return i + 1;',
      '}',
    ],
  },
  heapsort: {
    javascript: [
      'function heapSort(arr) {',
      '  buildMaxHeap(arr);',
      '  for (let i = arr.length - 1; i > 0; i--) {',
      '    swap(arr, 0, i);',
      '    heapify(arr, 0, i);',
      '  }',
      '}',
    ],
  },
}
