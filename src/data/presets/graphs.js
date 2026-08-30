export const graphsPresets = [
  {
    label: 'Standard Directed Network',
    value: 'A,B,C,D,E|A-B:4,A-C:2,B-C:1,B-D:5,C-D:8,C-E:10,D-E:2|directed',
  },
  {
    label: 'Undirected Cycle',
    value: '0,1,2,3,4|0-1:1,1-2:1,2-3:1,3-4:1,4-0:1|undirected',
  },
]
