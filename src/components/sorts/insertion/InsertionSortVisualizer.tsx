"use client";

import React from "react";
import { SortProps } from "../SortProps";
import { SortVisualizer } from "../SortVisualizer";

const InsertionSortVisualizer = () => {
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
    sortedUpTo,
    setSortedUpTo,
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

  const handleResume = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    setIsSorting(true);
    isSortingRef.current = true;

    doInsertionSort(
      [...cpyArr],
      currIndexes.i,
      currIndexes.j,
      currIndexes.minIndex ?? -1,
    );
  };

  const handleInsertionSort = () => {
    isPausedRef.current = isPaused;
    isSortingRef.current = isSorting;

    if (isSortingRef.current) return;

    setIsPaused(false);
    setIsSorting(true);
    setCurrIndexes((prev) => ({ ...prev, minIndex: 0 }));

    // call recursive bubblesort func
    doInsertionSort([...cpyArr], 0, 1, 0);
  };

  const doInsertionSort = (
    arr: number[],
    i: number,
    j: number,
    currMinIndex: number,
  ) => {
    // base case: return if sorting is complete
    if (i >= arr.length - 1) {
      setIsSorting(false);
      setSortedUpTo(arr.length - 1);
      setCurrIndexes({ i: -1, j: -1, minIndex: -1 });
      setCurrIndexes((prev) => ({ ...prev, minIndex: -1 }));
      return;
    }

    setCurrIndexes({
      // current indexes being compared
      i,
      j,
      minIndex: currMinIndex,
    });

    // stay stuck in recursion while paused
    if (isPausedRef.current) {
      setTimeout(() => doInsertionSort(arr, i, j, currMinIndex), 100);
      return;
    }

    setTimeout(() => {
      // find minVal in unsorted section
      if (j < arr.length) {
        // if curr element < currMin, swap values
        if (arr[j] < arr[currMinIndex]) {
          currMinIndex = j;
        }

        if (!isPausedRef.current && isSortingRef.current) {
            doInsertionSort(arr, i, j + 1, currMinIndex);
        }

        // reached end of unsorted portion, perform swap
      } else {
        if (currMinIndex !== i) {
          [arr[i], arr[currMinIndex]] = [arr[currMinIndex], arr[i]];
          setCpyArr([...arr]);
        }

        setSortedUpTo(i); // update sorted section

        if (!isPausedRef.current && isSortingRef.current) {
            doInsertionSort(arr, i + 1, i + 2, i + 1);
        }
        setSortedUpTo(i); // updated sorted section
      }
    }, playSpeedRef.current);
  };

  return (
    <div>
      <SortVisualizer
        title="Insertion Sort Visualizer"
        array={cpyArr}
        currentIndexes={currIndexes}
        isSorting={isSorting}
        value={value}
        onValueChange={(e) => setValue(e.target.value)}
        onRandomize={handleRandomizer}
        onSubmit={handleGenerate}
        onSort={handleInsertionSort}
        onPauseResume={() => (!isPaused ? handlePause() : handleResume())}
        onReset={handleReset}
        onSpeedUp={() => handleSpeedChange(Math.max(250, playSpeed - 250))}
        onSpeedDown={() => handleSpeedChange(Math.min(1250, playSpeed + 250))}
        isValidArray={isValidArray}
        isPaused={isPaused}
        playSpeed={playSpeed}
        origArr={origArr}
        sortedArr={sortedArr}
        sortedUpTo={sortedUpTo}
        sortButtonText="Insertion Sort"
      />
    </div>
  );
};

export default InsertionSortVisualizer;