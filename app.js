// app.js - Sorting visualizer in vanilla JS (no external libraries)
// Algorithms implemented from scratch. Visualization uses requestAnimationFrame/timers.

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const algorithmSelect = document.getElementById('algorithm');
const sizeInput = document.getElementById('size');
const speedInput = document.getElementById('speed');
const generateBtn = document.getElementById('generate');
const startBtn = document.getElementById('start');
const randomStartBtn = document.getElementById('randomStart');
const downloadBtn = document.getElementById('download');

let data = [];
let running = false;
let speed = Number(speedInput.value); // ms
let size = Number(sizeInput.value);

function resizeCanvas(){
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function generateData(){
  size = Number(sizeInput.value);
  data = [];
  for(let i=0;i<size;i++) data.push(Math.floor(Math.random()*400)+5);
  drawData(data);
}

function drawData(arr, highlightIndices=[]){
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // draw background
  ctx.fillStyle = 'rgba(0,0,0,0)'; // transparent
  ctx.fillRect(0,0,w,h);
  const n = arr.length;
  const barWidth = Math.max(2, w / (n));
  const maxVal = Math.max(...arr);
  for(let i=0;i<n;i++){
    const val = arr[i];
    const x = i * barWidth;
    const barH = (val / maxVal) * (h - 20);
    const y = h - barH;
    if (highlightIndices.includes(i)) ctx.fillStyle = '#f59e0b';
    else ctx.fillStyle = '#60a5fa';
    ctx.fillRect(x+1, y, barWidth-2, barH);
    if (n <= 40){
      ctx.fillStyle = '#e6eef8';
      ctx.font = '10px sans-serif';
      ctx.fillText(String(val), x+2, y-4);
    }
  }
}

// Utility: sleep ms
function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

// ---------------------------
// Sorting algorithm implementations that yield steps
// Each function returns an async generator that yields {arr, highlights}
// ---------------------------

async function* bubbleSort(a){
  const arr = a.slice();
  const n = arr.length;
  for(let i=0;i<n;i++){
    for(let j=0;j<n-i-1;j++){
      if(arr[j] > arr[j+1]){
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
        yield {arr: arr.slice(), highlights: [j, j+1]};
      }
    }
  }
  yield {arr: arr.slice(), highlights: []};
}

async function* selectionSort(a){
  const arr = a.slice();
  const n = arr.length;
  for(let i=0;i<n;i++){
    let minIdx = i;
    for(let j=i+1;j<n;j++){
      if(arr[j] < arr[minIdx]) minIdx = j;
    }
    if(minIdx !== i){
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      yield {arr: arr.slice(), highlights: [i, minIdx]};
    }
  }
  yield {arr: arr.slice(), highlights: []};
}

async function* insertionSort(a){
  const arr = a.slice();
  const n = arr.length;
  for(let i=1;i<n;i++){
    let key = arr[i];
    let j = i-1;
    while(j>=0 && arr[j] > key){
      arr[j+1] = arr[j];
      j--;
      yield {arr: arr.slice(), highlights: [j+1, j+2]};
    }
    arr[j+1] = key;
    yield {arr: arr.slice(), highlights: [j+1]};
  }
  yield {arr: arr.slice(), highlights: []};
}

async function* mergeSort(a){
  // iterative bottom-up merge with yields
  const arr = a.slice();
  const n = arr.length;
  let width = 1;
  while(width < n){
    for(let i=0;i<n;i+=2*width){
      const left = arr.slice(i, i+width);
      const right = arr.slice(i+width, i+2*width);
      let li=0, ri=0, k=i;
      while(li < left.length && ri < right.length){
        if(left[li] <= right[ri]) arr[k++] = left[li++];
        else arr[k++] = right[ri++];
      }
      while(li < left.length) arr[k++] = left[li++];
      while(ri < right.length) arr[k++] = right[ri++];
      yield {arr: arr.slice(), highlights: [i, Math.min(n-1, i+2*width-1)]};
    }
    width *= 2;
  }
  yield {arr: arr.slice(), highlights: []};
}

async function* quickSort(a){
  const arr = a.slice();
  // use iterative stack with Lomuto partition and yield on swaps
  const stack = [[0, arr.length - 1]];
  while(stack.length){
    const [lo, hi] = stack.pop();
    if(lo < hi){
      const pivot = arr[hi];
      let i = lo;
      for(let j=lo;j<hi;j++){
        if(arr[j] <= pivot){
          [arr[i], arr[j]] = [arr[j], arr[i]];
          yield {arr: arr.slice(), highlights: [i, j]};
          i++;
        }
      }
      [arr[i], arr[hi]] = [arr[hi], arr[i]];
      yield {arr: arr.slice(), highlights: [i, hi]};
      stack.push([lo, i-1]);
      stack.push([i+1, hi]);
    }
  }
  yield {arr: arr.slice(), highlights: []};
}

async function* heapSort(a){
  const arr = a.slice();
  const n = arr.length;
  function* heapifyGen(b, n, i){
    let largest = i;
    const l = 2*i + 1;
    const r = 2*i + 2;
    if(l < n && b[l] > b[largest]) largest = l;
    if(r < n && b[r] > b[largest]) largest = r;
    if(largest !== i){
      [b[i], b[largest]] = [b[largest], b[i]];
      yield {arr: b.slice(), highlights: [i, largest]};
      yield* heapifyGen(b, n, largest);
    }
  }
  // build heap
  for(let i=Math.floor(n/2)-1;i>=0;i--){
    for (const step of heapifyGen(arr, n, i)) yield step;
  }
  // extract
  for(let i=n-1;i>0;i--){
    [arr[0], arr[i]] = [arr[i], arr[0]];
    yield {arr: arr.slice(), highlights: [0,i]};
    for (const step of heapifyGen(arr, i, 0)) yield step;
  }
  yield {arr: arr.slice(), highlights: []};
}

// Map selection to generator function
function getAlgGenerator(name, arr){
  switch(name){
    case 'Bubble Sort': return bubbleSort(arr);
    case 'Selection Sort': return selectionSort(arr);
    case 'Insertion Sort': return insertionSort(arr);
    case 'Merge Sort': return mergeSort(arr);
    case 'Quick Sort': return quickSort(arr);
    case 'Heap Sort': return heapSort(arr);
    default: return bubbleSort(arr);
  }
}

// Run visualization: consume async generator
async function runVisualization(){
  if (running) return;
  running = true;
  const algName = algorithmSelect.value;
  const gen = getAlgGenerator(algName, data);
  const sp = Number(speedInput.value);
  try{
    for await (const step of gen){
      if(!running) break;
      drawData(step.arr, step.highlights || []);
      await sleep(sp);
    }
    drawData(data, []); // final
  } catch(e){
    console.error(e);
  } finally {
    running = false;
  }
}

generateBtn.addEventListener('click', ()=> { generateData(); });
startBtn.addEventListener('click', ()=> { if(!running) runVisualization(); });
randomStartBtn.addEventListener('click', ()=> { generateData(); if(!running) runVisualization(); });
speedInput.addEventListener('change', ()=> { speed = Number(speedInput.value); });
sizeInput.addEventListener('change', ()=> { generateData(); });

// Download ZIP button - triggers download of a packaged zip (created on server in original project).
downloadBtn.addEventListener('click', ()=>{
  // In this offline package we will offer to download the README as a text file as a fallback.
  const readme = `Sorting Algorithms Visualizer - Web Version
Implemented algorithms: Bubble, Selection, Insertion, Merge, Quick, Heap.
Run locally: open index.html in modern browser. No server required.
`;
  const blob = new Blob([readme], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'README-web.txt';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

// init
generateData();
drawData(data);