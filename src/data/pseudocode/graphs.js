/**
 * graphs.js
 * Graph algorithms pseudocode.
 */

export const graphsPseudocode = {
  bfs: {
    javascript: [
      'function BFS(graph, start) {',
      '  let queue = [start];',
      '  let visited = new Set([start]);',
      '  while (queue.length > 0) {',
      '    let node = queue.shift();',
      '    for (let neighbor of graph[node]) {',
      '      if (!visited.has(neighbor)) {',
      '        visited.add(neighbor);',
      '        queue.push(neighbor);',
      '      }',
      '    }',
      '  }',
      '}',
    ],
  },
  dfs: {
    javascript: [
      'function DFS(graph, start) {',
      '  let stack = [start];',
      '  let visited = new Set();',
      '  while (stack.length > 0) {',
      '    let node = stack.pop();',
      '    if (!visited.has(node)) {',
      '      visited.add(node);',
      '      for (let neighbor of graph[node]) {',
      '        stack.push(neighbor);',
      '      }',
      '    }',
      '  }',
      '}',
    ],
  },
  dijkstra: {
    javascript: [
      'function dijkstra(graph, start) {',
      '  let dist = {};',
      '  let pq = new PriorityQueue();',
      '  for (let node of graph.nodes) dist[node] = Infinity;',
      '  dist[start] = 0; pq.enqueue(start, 0);',
      '  while (!pq.isEmpty()) {',
      '    let { node, d } = pq.dequeue();',
      '    if (d > dist[node]) continue;',
      '    for (let { neighbor, weight } of graph.edges[node]) {',
      '      let newDist = dist[node] + weight;',
      '      if (newDist < dist[neighbor]) {',
      '        dist[neighbor] = newDist;',
      '        pq.enqueue(neighbor, newDist);',
      '      }',
      '    }',
      '  }',
      '}',
    ],
  },
}
