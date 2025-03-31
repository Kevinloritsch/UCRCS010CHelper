"use client";

import React from "react";
import { SortProps } from "../SortProps";
import { SortVisualizer } from "../SortVisualizer";

const BubbleSortVisualizer = () => {
  const {
    value,
    setValue,
    origArr,
    cpyArr,
    setCpyArr,
    sortedArr,
    isValidArray,
    isSorting,
    setIsSorting,
    isPaused,
    setIsPaused,
    currIndexes,
    setCurrIndexes,
    playSpeed,
    playSpeedRef,
    isPausedRef,
    isSortingRef,
    handleRandomizer,
    handleGenerate,
    handlePause,
    handleReset,
    handleSpeedChange,
    setVar,
  } = SortProps();

  // each sort has to have their own handleResume func
  // since each sort has to call their own sort func
  const handleResume = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    setIsSorting(true);
    isSortingRef.current = true;

    doBubbleSort([...cpyArr], currIndexes.i, currIndexes.j);
  };


  const handleBubbleSort = () => {
    isPausedRef.current = isPaused;
    isSortingRef.current = isSorting;

    if (isSortingRef.current) return;

    setIsPaused(false);
    setIsSorting(true);

    // call recursive bubblesort func
    doBubbleSort([...cpyArr], 0, 0);
  };

  // recursive bubble helper
  const doBubbleSort = (arr: number[], i: number, j: number) => {
    // base case: return if sorting is complete
    if (i >= arr.length - 1) {
      setIsSorting(false); // sorting complete
      return;
    }

    setCurrIndexes({ i, j }); // current indexes being compared

    // stuck in recursion while paused
    if (isPausedRef.current) {
      setTimeout(() => doBubbleSort(arr, i, j), 100);
      return;
    }

    setTimeout(() => {
      if (j < arr.length - 1 - i) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

          if (isPausedRef.current || !isSortingRef.current) return;

          setCpyArr([...arr]); // update arr post swap

          setTimeout(() => {
            // continue if not paused and still sorting
            if (!isPausedRef.current && isSortingRef.current)
              doBubbleSort(arr, i, j + 1);
          }, playSpeedRef.current);
        } else {
          // continue if not paused and still sorting
          if (!isPausedRef.current && isSortingRef.current)
            doBubbleSort(arr, i, j + 1);
        }
      } else {
        // continue to next pass if not paused and still sorting
        if (!isPausedRef.current && isSortingRef.current)
          doBubbleSort(arr, i + 1, 0);
      }
    }, playSpeedRef.current);
  };

  return (
    <div>
      <h1>Bubble Sort Visualizer</h1>
      <input
        placeholder="Enter array value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <div className="grid w-3/5 grid-cols-5 justify-items-start gap-2">
        <button onClick={handleRandomizer}>Randomize</button>

        <button onClick={handleGenerate}>Submit</button>

        <button
          onClick={handleBubbleSort}
          style={{ color: !isValidArray || isSorting ? "grey" : "black" }} // grey out button when disabled
          disabled={!isValidArray || isSorting}
        >
          Bubble Sort
        </button>

        <button
          onClick={() => {
            if (!isPaused) handlePause();
            else handleResume();
          }}
          style={{ color: !isSorting && !isPaused ? "grey" : "black" }} // grey out button when disabled
          disabled={!isSorting && !isPaused}
        >
          {!isPaused ? "Pause" : "Resume"}
        </button>

        <button onClick={handleReset}>Reset</button>

        <button onClick={() => handleSpeedChange(Math.max(250, playSpeed - 250))}>
          Speed Up
        </button>

        <button onClick={() => handleSpeedChange(Math.min(1250, playSpeed + 250))}>
          Speed Down
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        <div>Current Speed: {playSpeed} ms delay </div>
        <div>
          <h3>Your Original Array: [{origArr.join(", ")}]</h3>
        </div>
        <div>
          <h3>Your Original Array Sorted: [{sortedArr.join(", ")}]</h3>
        </div>
      </div>

      <SortVisualizer
        array={cpyArr}
        currentIndexes={currIndexes}
        isSorting={isSorting}
      />
    </div>
  );
};

export default BubbleSortVisualizer;
