# Sorting Algorithms Visualizer (Web Version)

## Overview
This is a web-based visualizer for sorting algorithms implemented from scratch in JavaScript.
No external libraries required — just open `index.html` in a browser.

## Files
- `index.html` — UI and canvas.
- `styles.css` — Styling.
- `app.js` — Algorithm implementations and visualization logic.
- `README.md` — This file.

## Implemented Algorithms
- Bubble Sort — O(n^2)
- Selection Sort — O(n^2)
- Insertion Sort — O(n^2)
- Merge Sort (iterative bottom-up) — O(n log n)
- Quick Sort (Lomuto-style partition, iterative stack) — Average O(n log n), worst O(n^2)
- Heap Sort — O(n log n)

## Pseudocode & Complexity
See previous README in original Python/Tkinter project for detailed pseudocode and complexity analysis.
This web version follows the same algorithmic implementations but uses async generator-style yields to animate steps.

## How to run
1. Unzip the project.
2. Open `index.html` in a modern browser (Chrome/Firefox/Edge).
3. Use controls to select algorithm, size, speed, and start visualization.

## Notes
- The visualizer aims to be educational; it's optimized for clarity not maximum performance.
- For large sizes, rendering may slow depending on the browser and device.