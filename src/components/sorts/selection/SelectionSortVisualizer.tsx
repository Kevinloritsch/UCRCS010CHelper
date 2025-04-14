"use client";

import { useState } from "react";
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

  // variable to keep track of index of minimum value
  const [minIndex, setMinIndex] = useState(-1);

  // each sort has to have their own handleResume func
  // since each sort has to call their own sort func
  const handleResume = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    setIsSorting(true);
    isSortingRef.current = true;

    doSelectionSort([...cpyArr], currIndexes.i, currIndexes.j, minIndex);
  };

  const handleSelectionSort = () => {
    isPausedRef.current = isPaused;
    isSortingRef.current = isSorting;

    if (isSortingRef.current) return;

    setIsPaused(false);
    setIsSorting(true);
    setMinIndex(0);

    // call recursive bubblesort func
    doSelectionSort([...cpyArr], 0, 0, 0);
  };

  const doSelectionSort = (
    arr: number[],
    i: number,
    j: number,
    currMinIndex: number,
  ) => {
    // base case: return if sorting is complete
    if (i >= arr.length - 1) {
        setIsSorting(false);
        return;
    }

    setCurrIndexes({ i, j }); // current indexes being compared
    setMinIndex(currMinIndex); // track current minIndex

    // stay stuck in recursion while paused
    if (isPausedRef.current) {
        setTimeout(() => doSelectionSort(arr, i, j, currMinIndex), 100);
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
            doSelectionSort(arr, i, j + 1, currMinIndex);
            }
            
        // reached end of unsorted portion, perform swap
        } else {
            if (currMinIndex !== i) {
            [arr[i], arr[currMinIndex]] = [arr[currMinIndex], arr[i]];
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
        currentIndexes={{ ...currIndexes, minIndex: minIndex }}
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
