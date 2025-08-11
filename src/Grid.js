import React from 'react';
class PriorityQueue {
  constructor() {
    this.nodes = [];
  }

  enqueue(node, priority) {
    this.nodes.push({ node, priority });
    this.nodes.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.nodes.shift().node;
  }

  isEmpty() {
    return this.nodes.length === 0;
  }
}


export function createGrid() {
  const grid = [];
  for (let row = 0; row < 26; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push({
        id: `${row}-${col}`,
        x: row,
        y: col,
        isWall: false,
        isVisited: false,
        isStart: row === 5 && col === 5,
        isEnd: row === 15 && col === 15,
      });
    }
    grid.push(currentRow);
  }
  return grid;
}

export async function bfs(startNode, endNode, grid, setGrid, delay) {
  const queue = [startNode];
  const visited = new Set();
  visited.add(startNode.id);

  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  let visitedCount = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    visitedCount++;

    if (current.id === endNode.id) {
      return visitedCount;
    }

    for (let [dx, dy] of directions) {
      const x = current.x + dx;
      const y = current.y + dy;

      if (
        x >= 0 &&
        x < grid.length &&
        y >= 0 &&
        y < grid[0].length &&
        !visited.has(grid[x][y].id) &&
        !grid[x][y].isWall
      ) {
        visited.add(grid[x][y].id);
        grid[x][y].isVisited = true;

        setGrid(grid.map(row => row.map(node => ({ ...node }))));
        await delay(50);

        queue.push(grid[x][y]);
      }
    }
  }

  return visitedCount; // if no path found, still return count
}

export async function dfs(startNode, endNode, grid, setGrid, delay, visited = new Set(), count = { value: 0 }) {
  const key = (node) => node.id;

  if (startNode.id === endNode.id) {
    count.value++;
    return count.value;
  }

  visited.add(key(startNode));
  startNode.isVisited = true;
  count.value++;

  setGrid(grid.map(row => row.map(node => ({ ...node }))));
  await delay(50);

  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  for (let [dx, dy] of directions) {
    const x = startNode.x + dx;
    const y = startNode.y + dy;

    if (
      x >= 0 &&
      x < grid.length &&
      y >= 0 &&
      y < grid[0].length &&
      !visited.has(grid[x][y].id) &&
      !grid[x][y].isWall
    ) {
      const result = await dfs(grid[x][y], endNode, grid, setGrid, delay, visited, count);
      if (typeof result === "number") {
        return result;
      }
    }
  }

  return false;
}

export async function dijkstra(startNode, endNode, grid, setGrid, delay, visitedCounter = { value: 0 }) {
  const visited = new Set();
  const cameFrom = {};
  const pq = new PriorityQueue();

  const updatedGrid = grid.map(row =>
    row.map(cell => ({ ...cell, distance: Infinity }))
  );

  const start = updatedGrid[startNode.x][startNode.y];
  const end = updatedGrid[endNode.x][endNode.y];
  start.distance = 0;
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue();
    if (!current || visited.has(current.id)) continue;
    visited.add(current.id);
    visitedCounter.value++;

    if (current.id === end.id) {
      return cameFrom;
    }

    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0],
    ];

    for (let [dx, dy] of directions) {
      const x = current.x + dx;
      const y = current.y + dy;

      if (
        x >= 0 && x < updatedGrid.length &&
        y >= 0 && y < updatedGrid[0].length
      ) {
        const neighbor = updatedGrid[x][y];
        if (neighbor.isWall || visited.has(neighbor.id)) continue;

        const newDist = current.distance + 1;
        if (newDist < neighbor.distance) {
          neighbor.distance = newDist;
          cameFrom[neighbor.id] = current;
          pq.enqueue(neighbor, newDist);
        }
      }
    }

    updatedGrid[current.x][current.y].isVisited = true;
    setGrid(updatedGrid.map(row => row.map(cell => ({ ...cell }))));
    await delay(20);
  }

  return cameFrom;
}



export async function highlightShortestPath(cameFrom, endNode, setGrid, delay, grid) {
  const path = [];
  let current = endNode;

  while (cameFrom[current.id]) {
    current = cameFrom[current.id];
    path.push(current);
  }

  // Reverse and animate
  for (let i = path.length - 1; i >= 0; i--) {
    const node = path[i];
    grid[node.x][node.y].isPath = true;
    setGrid(grid.map(row => row.map(cell => ({ ...cell }))));
    await delay(50);
  }
}



export default function Grid({ grid, onCellClick }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div>
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex' }}>
            {row.map((node, nodeIdx) => (
              <div
                key={nodeIdx}
                onClick={() => onCellClick(node.x, node.y)}
                style={{
                  width: 20,
                  height: 20,
                  border: '1.2px solid #ccc',
                  backgroundColor: node.isStart
                    ? 'green'
                    : node.isEnd
                    ? 'red'
                    : node.isWall
                    ? 'black'
                    : node.isPath
                    ? 'yellow'
                    : node.isVisited
                    ? 'lightblue'
                    : 'white',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}