"use client";

import React from "react";
import { SortProps } from "../SortProps";
import { SortVisualizer } from "../SortVisualizer";

const SelectionSortVisualizer = () => {
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
  } = SortProps();

  // each sort has to have their own handleResume func
  // since each sort has to call their own sort func
  const handleResume = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    setIsSorting(true);
    isSortingRef.current = true;

    doSelectionSort([...cpyArr], currIndexes.i, currIndexes.j, 0);
  };

  const handleSelectionSort = () => {
    isPausedRef.current = isPaused;
    isSortingRef.current = isSorting;

    if (isSortingRef.current) return;

    setIsPaused(false);
    setIsSorting(true);

    // call recursive bubblesort func
    doSelectionSort([...cpyArr], 0, 0, 0);
  };

  const doSelectionSort = (
    arr: number[],
    i: number,
    j: number,
    minIndex: number,
  ) => {
    // base case: return if sorting is complete
    if (i >= arr.length - 1) {
      setIsSorting(false);
      return;
    }

    setCurrIndexes({ i, j }); // current indexes being compared

    // stay stuck in recursion while paused
    if (isPausedRef.current) {
      setTimeout(() => doSelectionSort(arr, i, j, minIndex), 100);
      return;
    }

    setTimeout(() => {
      if (j < arr.length) {
        if (arr[j] < arr[minIndex]) {
          minIndex = j;
        }

        if (!isPausedRef.current && isSortingRef.current) {
          doSelectionSort(arr, i, j + 1, minIndex);
        }
      } else {
        if (minIndex !== i) {
          [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
          setCpyArr([...arr]);
        }
        if (!isPausedRef.current && isSortingRef.current) {
          doSelectionSort(arr, i + 1, i + 1, i + 1);
        }
      }
    }, playSpeedRef.current);
  };

  return (
    <div>
      <SortVisualizer
        title="Selection Sort Visualizer"
        array={cpyArr}
        currentIndexes={currIndexes}
        isSorting={isSorting}
        value={value}
        onValueChange={(e) => setValue(e.target.value)}
        onRandomize={handleRandomizer}
        onSubmit={handleGenerate}
        onSort={handleSelectionSort}
        onPauseResume={() => (!isPaused ? handlePause() : handleResume())}
        onReset={handleReset}
        onSpeedUp={() => handleSpeedChange(Math.max(250, playSpeed - 250))}
        onSpeedDown={() => handleSpeedChange(Math.min(1250, playSpeed + 250))}
        isValidArray={isValidArray}
        isPaused={isPaused}
        playSpeed={playSpeed}
        origArr={origArr}
        sortedArr={sortedArr}
        sortButtonText="Selection Sort"
      />
    </div>
  );
};

export default SelectionSortVisualizer;

// fix selection & make new variable to keep track of, min
