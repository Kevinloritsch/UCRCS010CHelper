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

    doInsertionSort([...cpyArr], 0, 1, 0);
  };

const doInsertionSort = (
    arr: number[],
    i: number,
    j: number,
    temp: number, 
  ) => {
    if (i >= arr.length) {
      setIsSorting(false);
      setSortedUpTo(arr.length - 1);
      setCurrIndexes({ i: -1, j: -1, minIndex: -1 });
      return;
    }
  
    setCurrIndexes({
      i: Math.max(j, -1),
      j: Math.max(j + 1, -1),
      minIndex: -1,
    });
  
    if (isPausedRef.current) {
      setTimeout(() => doInsertionSort(arr, i, j, temp), 100);
      return;
    }
  
    setTimeout(() => {
      if (j >= 0 && arr[j] > temp) {
        arr[j + 1] = arr[j];
        setCpyArr([...arr]);
  
        if (!isPausedRef.current && isSortingRef.current) {
          doInsertionSort(arr, i, j - 1, temp);
        }
      } else {
        arr[j + 1] = temp;
        setCpyArr([...arr]);
        setSortedUpTo(i);
  
        const nextI = i + 1;
        if (nextI < arr.length) {
          const nextTemp = arr[nextI];
          if (!isPausedRef.current && isSortingRef.current) {
            doInsertionSort(arr, nextI, nextI - 1, nextTemp);
          }
        } else {
          setIsSorting(false);
          setSortedUpTo(arr.length - 1);
          setCurrIndexes({ i: -1, j: -1, minIndex: -1 });
        }
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