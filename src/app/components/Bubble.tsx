"use client";

import React, { useEffect, useState } from "react";

const BubbleSortVisualizer = () => {
  const [value, setValue] = useState("");
  const [array, setArray] = useState<number[]>([]);
  const [isSorting, setIsSorting] = useState(false);
  const [currStep, setCurrStep] = useState(0);
  const [currIndexes, setCurrIndexes] = useState<{ i: number; j: number }>({
    i: -1,
    j: -1,
  });

  useEffect(() => {}, []);

  const handleRandomizer = () => {
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

  const isValidArray = array.length > 0 && !array.some((num) => isNaN(num));

  const handleBubbleSort = () => {
    setIsSorting(true);
    const arr = [...array];
    let i = 0;
    let j = 0;

    const intervalId = setInterval(() => {
      if (i < arr.length) {
        if (j < arr.length - 1 - i) {
          setCurrIndexes({ i, j }); // to highlight current indexes being compared

          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          }

          setArray([...arr]); // update array
          j++;
        } else {
          j = 0;
          i++;
        }
        setCurrStep(currStep + 1);
      } else {
        clearInterval(intervalId); // stop sorting when done
        setIsSorting(false);
      }
    }, 750);
  };

  return (
    <div>
      <h1>Bubble Sort Visualizer</h1>
      <input
        placeholder="Enter array value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button
        onClick={handleRandomizer}
        style={{
          margin: "25px",
        }}
      >
        {" "}
        Randomize
      </button>

      <button
        onClick={handleGenerate}
        style={{
          margin: "25px",
        }}
      >
        {" "}
        Submit
      </button>

      <button
        onClick={handleBubbleSort}
        style={{
          margin: "25px",
          color: !isValidArray || isSorting ? "grey" : "black", // grey out button when disabled
        }}
        disabled={!isValidArray || isSorting}
      >
        {" "}
        Bubble Sort
      </button>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
        }}
      >
        {array.map((num, index) => (
          <div
            key={index}
            style={{
              width: "65px",
              //height: "65px",
              height: `${num * 5}px`, // scaled to value
              backgroundColor:
                index === currIndexes.j && isSorting
                  ? "orange"
                  : index === currIndexes.j + 1 && isSorting
                    ? "brown"
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
