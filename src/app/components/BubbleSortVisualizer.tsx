"use client";

import React, { useEffect, useState } from "react";

const BubbleSortVisualizer = () => {
  const [value, setValue] = useState("");
  const [array, setArray] = useState<number[]>([]);
  const isValidArray = (array.length > 0) && !(array.some((num) => isNaN(num)));
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currStep, setCurrStep] = useState(0);
  const [currIndexes, setCurrIndexes] = useState<{ i: number; j: number }>({
    i: -1,
    j: -1,
  });

  useEffect(() => {}, []);

  const handleRandomizer = () => {
    //if currently sorting, stop sorting
    if (isSorting) {
      setIsSorting(false);
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
    setArray(randomNums);
    setCurrStep(0); // reset currStep every time a new array is generated
    setCurrIndexes({ i: -1, j: -1 }); // reset indices
  };

  const handleGenerate = () => {
    if (!value) {
      alert("You have not inputted any values");
      return;
    } else {
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

      setArray(newArray);
      setCurrStep(0); // reset currStep every time a new array is generated
      setCurrIndexes({ i: -1, j: -1 }); // reset indices
    }
  };

  const handleBubbleSort = () => {
    setIsSorting(true);
    const arr = [...array];

    // recursive func to do bubble sort w delays between swaps
    const doBubbleSort = (i: number, j: number) => {
      if (i >= (arr.length - 1) ) {
        setIsSorting(false); // sorting complete
        return;
      }

      setCurrIndexes({ i, j }); // highlight current indexes being compared

      // delay before swap
      setTimeout(() => {
        if (j < (arr.length - 1 - i) ) {
          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            setArray([...arr]); // update arr post swap

            // add delay after swap so users can comprehend process
            setTimeout(() => {
              doBubbleSort(i, j + 1);
            }, 750);
          } else {
            doBubbleSort(i, j + 1); // move to next comparison
          }
        } else {
          // move to next pass
          doBubbleSort(i + 1, 0);
        }
      }, 750);
    };

    doBubbleSort(0, 0);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  return (
    <div>
      <h1>Bubble Sort Visualizer</h1>
      <input
        placeholder="Enter array value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <div className = "flex grid grid-cols-4 justify-items-start gap-2 w-3/5" >
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
          onClick={handlePause}
          style={{
            color: !isSorting? "grey" : "black", // grey out button when disabled
          }}
          disabled={!isSorting}
        >
          Pause
        </button>
      </div>

      <div 
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
        }}
      >
        {array.map((num, index) => (
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

// bug: if already sorting, randomizing or trying to generate a new array does not stop sorting
// make pause button