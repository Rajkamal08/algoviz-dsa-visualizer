export const graphsComplexities = {
  bfs: {
    best: 'O(V + E)',
    avg: 'O(V + E)',
    worst: 'O(V + E)',
    space: 'O(V)',
    explanation: 'Breadth-First Search visits every vertex V and inspects every edge E once. Space complexity is O(V) to hold visited nodes and queue contents.',
  },
  dfs: {
    best: 'O(V + E)',
    avg: 'O(V + E)',
    worst: 'O(V + E)',
    space: 'O(V)',
    explanation: 'Depth-First Search visits every vertex V and traverses every edge E. Recursive call stack or explicit stack takes maximum O(V) space.',
  },
  dijkstra: {
    best: 'O((V + E) log V)',
    avg: 'O((V + E) log V)',
    worst: 'O((V + E) log V)',
    space: 'O(V)',
    explanation: 'Dijkstra shortest path search uses a Min-Priority Queue to extract minimum distance nodes. Inserting and extracting takes O(log V), running in total O((V + E) log V) time.',
  },
}
