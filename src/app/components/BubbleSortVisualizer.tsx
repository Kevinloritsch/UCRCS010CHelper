"use client";

import React, { useEffect, useState, useRef } from "react";
import { bubbleSort } from './BubbleSort';

const BubbleSortVisualizer = () => {
  const [value, setValue] = useState("");
  const [origArr, setOrigArr] = useState<number[]>([]);
  const [cpyArr, setCpyArr] = useState<number[]>([]);
  const [sortedArr, setSortedArr] = useState<number[]>([]);
  const isValidArray = (origArr.length > 0) && !(origArr.some((num) => isNaN(num)));
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  // const [currStep, setCurrStep] = useState(0);
  const [currIndexes, setCurrIndexes] = useState<{ i: number; j: number }>({
    i: -1,
    j: -1,
  });
  const [playSpeed, setPlaySpeed] = useState<number>(750);

  // ref to track states
  const isPausedRef = useRef(isPaused);
  const isSortingRef = useRef(isSorting);
  const playSpeedRef = useRef(playSpeed);

  useEffect(() => {
    isPausedRef.current = isPaused;
    isSortingRef.current = isSorting;
    playSpeedRef.current = playSpeed;
  }, [isPaused, isSorting, playSpeed]);

  const handleRandomizer = () => {
    // if currently sorting, stop sorting
    if (isSortingRef.current) {
      setIsSorting(false);
      isSortingRef.current = false;
    }
    
    const minLength = 5;
    const maxLength = 10;
    const randomLength = Math.floor(
      Math.random() * (maxLength - minLength + 1) + minLength,
    ); // random length from 5 to 10
    const randomNums = Array.from(
      { length: randomLength },
      () => Math.floor(Math.random() * 99) + 1,
    );

    setVar(randomNums);
  };

  const handleGenerate = () => {
    // if input empty send alert
    if (!value) {
      alert("You have not inputted any values");
      return;
    }

    // if currently sorting, stop sorting
    if (isSortingRef.current) {
      setIsSorting(false);
      isSortingRef.current = false;
    }

    const newArray = value
      .split(",")
      .map((num) => num.trim())
      .filter((num) => {
        const isValidNumber = /^-?\d+$/.test(num); // check if it has valid integers (ex. no "2a")
        if (!isValidNumber) {
          alert(`"${num}" is not a valid integer!`);
        }

        return isValidNumber;
      })
      .map((num) => parseInt(num, 10));

    setVar(newArray);
  };

  const handlePause = () => {
    setIsPaused(true);
    isPausedRef.current = true;
    setIsSorting(false);
    isSortingRef.current = false;
  };

  const handleResume = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    setIsSorting(true);
    isSortingRef.current = true;
    
    doBubbleSort([...cpyArr], currIndexes.i, currIndexes.j);
  };

  const handleReset = () => {
    if (isSortingRef.current) {
      setIsSorting(false);
    }
    
    setVar(origArr);
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

  const handleSpeedChange = (newSpeed: number) => {
    setPlaySpeed(newSpeed);
  };

  const setVar = (arrInp: number[]) => {
    setOrigArr(arrInp);
    setCpyArr(arrInp);
    setSortedArr(bubbleSort([...arrInp]));
    // setCurrStep(0);
    setCurrIndexes({ i: -1, j: -1 });
    setPlaySpeed(750);
    setIsPaused(false);
    setIsSorting(false);
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
      if (j < (arr.length - 1 - i) ) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          
          if (isPausedRef.current || !isSortingRef.current) return;

          setCpyArr([...arr]); // update arr post swap

          setTimeout(() => {
            // continue if not paused and still sorting
            if (!isPausedRef.current && isSortingRef.current) doBubbleSort(arr, i, j + 1);
          }, playSpeedRef.current);
        } else {
          // continue if not paused and still sorting
          if (!isPausedRef.current && isSortingRef.current) doBubbleSort(arr, i, j + 1); 
        }
      } else {
        // continue to next pass if not paused and still sorting
        if (!isPausedRef.current && isSortingRef.current) doBubbleSort(arr, i + 1, 0);
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

      <div className = "flex grid grid-cols-5 justify-items-start gap-2 w-3/5" >
        <button 
          onClick={handleRandomizer}
        >
          Randomize
        </button>

        <button
          onClick={handleGenerate}
        >
          Submit
        </button>

        <button
          onClick={handleBubbleSort}
          style={{
            color: !isValidArray || isSorting ? "grey" : "black", // grey out button when disabled
          }}
          disabled={!isValidArray || isSorting}
        >
          Bubble Sort
        </button>

        <button
          onClick={() => {
            if (!isPaused) handlePause();
            else handleResume();
          }}
          style={{
            color: !isSorting && !isPaused? "grey" : "black", // grey out button when disabled
          }}
          disabled={!isSorting && !isPaused}
        >
          {!isPaused? "Pause" : "Resume"}
        </button>

        <button
          onClick={handleReset}
        >
          Reset
        </button>

        <button
          onClick={() => handleSpeedChange(Math.max(250, playSpeed - 250))}
        >
          Speed Up
        </button>

        <button
          onClick={() => handleSpeedChange(Math.min(1250, playSpeed + 250))}
        >
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

      <div 
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
        }}
      >
        {cpyArr.map((num, index) => (
          <div //className = "flex"
            key={index}
            style={{
              width: "65px",
              //height: "65px",
              height: `${num * 5}px`, // scaled to value
              backgroundColor:
                index === currIndexes.j && isSorting
                  ? "red"
                  : index === currIndexes.j + 1 && isSorting
                    ? "lime"
                    : !isSorting
                      ? "grey"
                      : "black",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.15s ease",
            }}
          >
            {num}
          </div>
        ))}
      </div> 
    </div>
  );
};

export default BubbleSortVisualizer;
