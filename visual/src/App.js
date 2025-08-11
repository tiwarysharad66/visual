import React, { useState, useRef, useEffect } from 'react';

import Grid, { createGrid, bfs, dfs, dijkstra, highlightShortestPath} from './Grid';
import SortStatsChart from './SortStatsChart';


const START_ROW = 5, START_COL = 5;
const END_ROW   = 15, END_COL   = 15;

function App() {
  function generateRandomArray() {
    let arr = [];
    for (let i = 0; i < 30; i++) {
      arr.push(Math.floor(Math.random() * 200) + 10);
    }
    return arr;
  }

  const [startNode, setStartNode] = useState({ row: START_ROW, col: START_COL });
  const [endNode, setEndNode] = useState({ row: END_ROW, col: END_COL });
  const [selecting, setSelecting] = useState('start'); // 'start' or 'end'

  const [grid, setGrid] = useState(createGrid());
  const [isRunning, setIsRunning] = useState(false);
  const [array, setArray] = useState(generateRandomArray());
  const [isSorting, setIsSorting] = useState(false);
  const [highlighted, setHighlighted] = useState([]);
  const [speed, setSpeed] = useState(100);
  const [sorted, setSorted] = useState([]);
  const [currentAlgo, setCurrentAlgo] = useState('');
  const [sortStats, setSortStats] = useState([]);
  const [originalArray, setOriginalArray] = useState(array);
  const [pathStats, setPathStats] = useState({ visited: 0, time: 0 });
  const [isPaused, setIsPaused] = useState(false);

  const isPausedRef = useRef(false);

useEffect(() => {
  isPausedRef.current = isPaused;
}, [isPaused]);

  function resetArray() {
  if (isSorting) return;
  const newArr = generateRandomArray();
  setArray(newArr);
  setOriginalArray(newArr.slice()); // save original for later
  setHighlighted([]);
  setSorted([]);
}


  const delay = async (ms) => {
  while (isPausedRef.current) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  return new Promise(resolve => setTimeout(resolve, ms));
};

  // Bubble Sort
  async function bubbleSort() {
    setCurrentAlgo('Bubble Sort');
    setIsSorting(true);
    setSorted([]);
    let arr = originalArray.slice();
    setArray(arr.slice());
    let swaps = 0;
    const startTime = performance.now();


    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        setHighlighted([j, j + 1]);
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swaps++;
          setArray(arr.slice());
        }
        await delay(speed);
      }
      setSorted(prev => [...prev, arr.length - i - 1]);
    }
    const endTime = performance.now();
    setSorted([...Array(arr.length).keys()]);
    setHighlighted([]);
    setIsSorting(false);
    setSortStats(prev => [...prev, {
    algo: 'Bubble Sort',
    time: Math.round(endTime - startTime),
    swaps
  }]);
  }

  // Merge Sort
async function mergeSort() {
  setCurrentAlgo('Merge Sort');
  setIsSorting(true);
  setSorted([]);
  let arr = originalArray.slice();
  setArray(arr.slice());
  let copies = 0;
  const startTime = performance.now();

  await mergeSortHelper(arr, 0, arr.length - 1);

  const endTime = performance.now();
  setArray(arr.slice());
  setSorted([...Array(arr.length).keys()]);
  setHighlighted([]);
  setIsSorting(false);

  // Add stats for this run
  setSortStats(prev => [...prev, {
    algo: 'Merge Sort',
    time: Math.round(endTime - startTime),
    swaps: copies  // Using 'swaps' to mean copies here
  }]);

  // Helper functions updated to access copies variable
  async function mergeSortHelper(arr, left, right) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    await mergeSortHelper(arr, left, mid);
    await mergeSortHelper(arr, mid + 1, right);
    await merge(arr, left, mid, right);
  }

  async function merge(arr, left, mid, right) {
    let temp = [];
    let i = left;
    let j = mid + 1;

    while (i <= mid && j <= right) {
      setHighlighted([i, j]);
      await delay(speed);
      if (arr[i] <= arr[j]) {
        temp.push(arr[i++]);
      } else {
        temp.push(arr[j++]);
      }
    }

    while (i <= mid) {
      temp.push(arr[i++]);
      await delay(speed);
    }

    while (j <= right) {
      temp.push(arr[j++]);
      await delay(speed);
    }

    for (let k = left; k <= right; k++) {
      arr[k] = temp[k - left];
      copies++;             // increment on each placement
      setArray(arr.slice());
      await delay(speed);
    }
  }
}


  // Quick Sort
  async function quickSort() {
  setCurrentAlgo('Quick Sort');
  setIsSorting(true);
  setSorted([]);
  let arr = originalArray.slice();
  setArray(arr.slice());
  let swaps = 0;
  const startTime = performance.now();

  async function quickSortHelper(arr, low, high) {
    if (low < high) {
      const pi = await partition(arr, low, high);
      await quickSortHelper(arr, low, pi - 1);
      await quickSortHelper(arr, pi + 1, high);
    }
  }

  async function partition(arr, low, high) {
    let pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      setHighlighted([j, high]);
      await delay(speed);
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        swaps++;  // count this swap
        setArray(arr.slice());
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    swaps++;    // count the final swap
    setArray(arr.slice());
    setHighlighted([i + 1]);
    await delay(speed);
    return i + 1;
  }

  await quickSortHelper(arr, 0, arr.length - 1);

  const endTime = performance.now();

  setArray(arr.slice());
  setSorted([...Array(arr.length).keys()]);
  setHighlighted([]);
  setIsSorting(false);

  setSortStats(prev => [...prev, {
    algo: 'Quick Sort',
    time: Math.round(endTime - startTime),
    swaps: swaps,
  }]);
}

  async function insertionSort() {
  setCurrentAlgo('Insertion Sort');
  setIsSorting(true);
  setSorted([]);
  let arr = originalArray.slice();
  setArray(arr.slice());
  let swaps = 0;
  const startTime = performance.now();

  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;

    while (j >= 0 && arr[j] > key) {
      setHighlighted([j, j + 1]);
      arr[j + 1] = arr[j];
      swaps++;  // count this move as a swap
      setArray(arr.slice());
      await delay(speed);
      j--;
    }

    arr[j + 1] = key;
    setArray(arr.slice());
    await delay(speed);
  }

  const endTime = performance.now();

  setSorted([...Array(arr.length).keys()]);
  setHighlighted([]);
  setIsSorting(false);

  setSortStats(prev => [...prev, {
    algo: 'Insertion Sort',
    time: Math.round(endTime - startTime),
    swaps: swaps,
  }]);
}


  async function selectionSort() {
  setCurrentAlgo('Selection Sort');
  setIsSorting(true);
  setSorted([]);
  let arr = originalArray.slice();
  setArray(arr.slice());
  let swaps = 0;
  const startTime = performance.now();

  for (let i = 0; i < arr.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      setHighlighted([minIdx, j]);
      await delay(speed);
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swaps++;
      setArray(arr.slice());
      await delay(speed);
    }
    setSorted(prev => [...prev, i]);
  }

  const endTime = performance.now();

  setSorted([...Array(arr.length).keys()]);
  setHighlighted([]);
  setIsSorting(false);

  setSortStats(prev => [...prev, {
    algo: 'Selection Sort',
    time: Math.round(endTime - startTime),
    swaps: swaps,
  }]);
}

  async function heapSort() {
  setCurrentAlgo('Heap Sort');
  setIsSorting(true);
  setSorted([]);
  let arr = originalArray.slice();
  setArray(arr.slice());
  let n = arr.length;
  let swaps = 0;
  const startTime = performance.now();

  const heapify = async (n, i) => {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;

    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;

    if (largest !== i) {
      setHighlighted([i, largest]);
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      swaps++;
      setArray(arr.slice());
      await delay(speed);
      await heapify(n, largest);
    }
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    swaps++;
    setArray(arr.slice());
    setSorted(prev => [...prev, i]);
    await delay(speed);
    await heapify(i, 0);
  }

  const endTime = performance.now();

  setSorted([...Array(arr.length).keys()]);
  setHighlighted([]);
  setIsSorting(false);

  setSortStats(prev => [...prev, {
    algo: 'Heap Sort',
    time: Math.round(endTime - startTime),
    swaps: swaps,
  }]);
}

  
  const handleBFS = async () => {
  setIsRunning(true);
  const start = grid[startNode.row][startNode.col];
  const end = grid[endNode.row][endNode.col];
  
  const startTime = performance.now();
  const visitedCount = await bfs(start, end, grid, setGrid, delay);
  const endTime = performance.now();

  setPathStats({
    visited: visitedCount,
    time: Math.round(endTime - startTime),
  });

  setIsRunning(false);
};

const handleDFS = async () => {
  setIsRunning(true);

  const newGrid = grid.map(row =>
    row.map(node => ({
      ...node,
      isVisited: false,
    }))
  );
  setGrid(newGrid);

  const start = newGrid[startNode.row][startNode.col];
  const end = newGrid[endNode.row][endNode.col];

  const visitedCounter = { value: 0 };
  const startTime = performance.now();

  const visitedCount = await dfs(start, end, newGrid, setGrid, delay, new Set(), visitedCounter);

  const endTime = performance.now();
  const timeTaken = (endTime - startTime).toFixed(2); // in ms

  setPathStats({
    algorithm: "DFS",
    visited: visitedCount || visitedCounter.value,
    time: timeTaken,
  });

  setIsRunning(false);
};


const handleDijkstra = async () => {
  setIsRunning(true);

  const newGrid = grid.map(row =>
    row.map(cell => ({
      ...cell,
      isVisited: false,
      isPath: false,
      distance: Infinity,
    }))
  );
  setGrid(newGrid);

  const start = newGrid[startNode.row][startNode.col];
  const end = newGrid[endNode.row][endNode.col];

  const visitedCounter = { value: 0 };
  const startTime = performance.now();

  const cameFrom = await dijkstra(start, end, newGrid, setGrid, delay, visitedCounter);
  await highlightShortestPath(cameFrom, end, setGrid, delay, newGrid);

  const endTime = performance.now();
  const timeTaken = (endTime - startTime).toFixed(2);

  setPathStats({
    algorithm: "Dijkstra",
    visited: visitedCounter.value,
    time: timeTaken,
  });

  setIsRunning(false);
};




const onCellClick = (row, col) => {
  const newGrid = grid.map(r => r.map(cell => ({ ...cell })));

  if (selecting === 'start') {
    // Clear previous start
    newGrid[startNode.row][startNode.col].isStart = false;
    newGrid[row][col].isStart = true;
    setStartNode({ row, col });
  } else if (selecting === 'end') {
    // Clear previous end
    newGrid[endNode.row][endNode.col].isEnd = false;
    newGrid[row][col].isEnd = true;
    setEndNode({ row, col });
  } else {
    newGrid[row][col].isWall = !newGrid[row][col].isWall;
  }

  setGrid(newGrid);
};

const resetGrid = () => {
  const newGrid = grid.map(row =>
    row.map(cell => ({
      ...cell,
      isWall: false,
      isVisited: false,
      isPath: false, // reset path highlight
      distance: undefined, // reset distance property
      isStart: cell.x === startNode.row && cell.y === startNode.col,
      isEnd: cell.x === endNode.row && cell.y === endNode.col,
    }))
  );

  setGrid(newGrid);
};



  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Sorting Visualizer</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>Animation Speed: </label>
        <input
          type="range"
          min="10"
          max="1000"
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
        />
        <span> {speed} ms</span>
      </div>

      <div style={{ marginBottom: 20 }}>
      <label>Array Size: </label>
      <input
        type="range"
        min="10"
        max="100"
        value={array.length}
        onChange={e => {
          if (isSorting) return;
          const size = Number(e.target.value);
          const newArr = Array.from({ length: size }, () =>
            Math.floor(Math.random() * 200) + 10
          );
          setArray(newArr);
          setOriginalArray(newArr.slice());  // <-- add here
          setSorted([]);
          setHighlighted([]);
        }}
      />

      <span> {array.length}</span>
    </div>
    

      <button
        onClick={resetArray}
        disabled={isSorting}
        style={{ marginRight: 10, opacity: isSorting ? 0.5 : 1 }}
      >
        Generate New Array
      </button>

      <button
        onClick={bubbleSort}
        disabled={isSorting}
        style={{ marginRight: 10, opacity: isSorting ? 0.5 : 1 }}
      >
        Bubble Sort
      </button>

      <button
        onClick={mergeSort}
        disabled={isSorting}
        style={{ marginRight: 10, opacity: isSorting ? 0.5 : 1 }}
      >
        Merge Sort
      </button>

      <button
        onClick={quickSort}
        disabled={isSorting}
        style={{ marginLeft: 10, opacity: isSorting ? 0.5 : 1 }}
      >
        Quick Sort
      </button>

      <button
        onClick={insertionSort}
        disabled={isSorting}
        style={{ marginLeft: 10, opacity: isSorting ? 0.5 : 1 }}
      >
        Insertion Sort
      </button>

      <button
        onClick={selectionSort}
        disabled={isSorting}
        style={{ marginLeft: 10, opacity: isSorting ? 0.5 : 1 }}
    >
      Selection Sort
    </button>

    <button
      onClick={heapSort}
      disabled={isSorting}
      style={{ marginLeft: 10, opacity: isSorting ? 0.5 : 1 }}
    >
      Heap Sort
    </button>

    <button
      onClick={() => setIsPaused(p => !p)}
      disabled={!isSorting}
      style={{ marginLeft: 10, opacity: isSorting ? 1 : 0.5 }}
    >
      {isPaused ? 'Resume' : 'Pause'}
    </button>
      
    <div style={{ marginTop: 20 }}>
      <h3>Complexity</h3>
      {currentAlgo === 'Bubble Sort' && (
        <p>Time: O(n²), Space: O(1)</p>
      )}
      {currentAlgo === 'Selection Sort' && (
        <p>Time: O(n²), Space: O(1)</p>
      )}
      {currentAlgo === 'Insertion Sort' && (
        <p>Time: O(n²), Space: O(1)</p>
      )}
      {currentAlgo === 'Merge Sort' && (
        <p>Time: O(n log n), Space: O(n)</p>
      )}
      {currentAlgo === 'Quick Sort' && (
        <p>Time: Average O(n log n), Worst O(n²), Space: O(log n)</p>
      )}
      {currentAlgo === 'Heap Sort' && (
        <p>Time: O(n log n), Space: O(1)</p>
      )}
  </div>

      <div
  style={{
    display: 'flex',
    alignItems: 'flex-end',
    height: '220px',
    marginTop: 20,
    justifyContent: 'center',
  }}
>
  {array.map((value, idx) => (
    <div
      key={idx}
      style={{
        margin: '0 1.1px', // a bit more space to fit the label nicely
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Show the value on top */}
      <div style={{ marginBottom: 4, fontSize: 12, color: '#333' }}>{value}</div>

      {/* The bar itself */}
      <div
        style={{
          backgroundColor: sorted.includes(idx)
            ? 'green'
            : highlighted.includes(idx)
            ? 'red'
            : 'turquoise',
          width: '10px',
          height: `${value}px`,
          transition: 'height 0.2s ease',
        }}
      />
    </div>
  ))}
</div>

      <div style={{ marginTop: 30 }}>
      <h3>Sorting Stats</h3>
      <SortStatsChart stats={sortStats} />

    </div>
    
        <h1 style={{ marginTop: '80px' }}>Pathfinding Visualizer</h1>
      <button onClick={handleBFS} disabled={isRunning}
      style={{ marginTop: 20, opacity: isRunning ? 0.5 : 1 }}>
        BFS
      </button>
      <button disabled={isRunning} onClick={handleDFS}
      style={{ marginTop: 20, marginLeft: 20, opacity: isRunning ? 0.5 : 1 }}>
        DFS</button>
      <button onClick={handleDijkstra} disabled={isRunning}
      style={{ marginTop: 20, marginLeft: 20, opacity: isRunning ? 0.5 : 1 }}>
      Visualize Dijkstra
        </button>


      <div style={{ marginTop: 20 }}>
  <button
    onClick={() => setSelecting('start')}
    disabled={selecting === 'start'}
    style={{ marginRight: 10, marginBottom: 10 }}
  >
    Select Start Node
  </button>
  <button
    onClick={() => setSelecting('end')}
    disabled={selecting === 'end'}
    style={{ marginRight: 10, marginBotttom: 10 }}
  >
    Select End Node
  </button>
  <button
    onClick={() => setSelecting('wall')}
    disabled={selecting === 'wall'}
    style={{ marginRight: 10, marginBottom: 10 }}
  >
    Toggle Wall Mode
  </button>
  <button onClick={resetGrid} disabled={isRunning}
      style={{ marginRight: 10, marginBottom: 10 }}>
  Reset Grid
</button>

</div>
{/* Add it somewhere visible, e.g., below the sorting buttons or below the array bars */}

      
<Grid
  grid={grid}
  setGrid={setGrid}
  startNode={startNode}
  setStartNode={setStartNode}
  endNode={endNode}
  setEndNode={setEndNode}
  onCellClick={onCellClick}
/>
<div style={{ marginTop: 10 }}>
  <h3>Pathfinding Stats</h3>
  <p>Cells Visited: {pathStats.visited}</p>
  <p>Time Taken: {pathStats.time} ms</p>
</div>




    </div>
  );
}


export default App;