"use client";

import React, { useEffect, useState, useRef } from "react";
import { bubbleSort } from "./bubble/BubbleSort";

export const SortProps = (initialArr: number[] = []) => {
  const [value, setValue] = useState("");
  const [origArr, setOrigArr] = useState<number[]>(initialArr);
  const [cpyArr, setCpyArr] = useState<number[]>(initialArr);
  const [sortedArr, setSortedArr] = useState<number[]>([]);
  const isValidArray = origArr.length > 0 && !origArr.some((num) => isNaN(num));
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

  // const handleResume = () => {
  //   setIsPaused(false);
  //   isPausedRef.current = false;
  //   setIsSorting(true);
  //   isSortingRef.current = true;

  //   // doBubbleSort([...cpyArr], currIndexes.i, currIndexes.j);
  // };

  // const handleReset = () => {
  //   if (isSortingRef.current) {
  //     setIsSorting(false);
  //   }

  //   setVar(origArr);
  // };

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

  return {
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
    // handleResume,
    // handleReset,
    handleSpeedChange,
    setVar,
  };
};

export default SortProps;