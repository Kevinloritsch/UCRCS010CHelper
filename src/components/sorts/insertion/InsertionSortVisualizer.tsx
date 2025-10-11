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

    doInsertionSort([...cpyArr], currIndexes.i, currIndexes.j, 0);
  };

  const handleInsertionSort = () => {
    isPausedRef.current = isPaused;
    isSortingRef.current = isSorting;

    if (isSortingRef.current) return;

    setIsPaused(false);
    setIsSorting(true);
    // setCurrIndexes((prev) => ({ ...prev}));

    doInsertionSort([...cpyArr], 0, 0, 0);
  };

  const doInsertionSort = (
    arr: number[],
    i: number,
    j: number,
    key: number,
  ) => {
    if (i >= arr.length - 1) {
      setIsSorting(false);
      setSortedUpTo(arr.length - 1);
      return;
    }

    setCurrIndexes({
      i,
      j,
    });

    if (isPausedRef.current) {
      setTimeout(() => doInsertionSort(arr, i, j, key), 100);
      return;
    }

    setTimeout(() => {
      if (j >= 0 && arr[j] > key) {
        arr[j + 1] = arr[j];
        setCpyArr([...arr]);

        if (!isPausedRef.current && isSortingRef.current) {
          doInsertionSort(arr, i, j - 1, key);
        }
      } else {
        arr[j + 1] = key;
        setCpyArr([...arr]);
        setSortedUpTo(i);

        if (i + 1 < arr.length) {
          const nextKey = arr[i + 1];
          if (!isPausedRef.current && isSortingRef.current) {
            doInsertionSort(arr, i + 1, i, nextKey);
          }
        } else {
          setIsSorting(false);
          setSortedUpTo(arr.length - 2);
          setCurrIndexes({ i: -1, j: -1 });
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
