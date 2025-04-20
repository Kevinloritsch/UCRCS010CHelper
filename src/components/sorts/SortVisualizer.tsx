"use client";

import React from "react";

interface SortVisualizerProps {
  title: string;
  array: number[];
  currentIndexes: { i: number; j: number, minIndex?: number };
  isSorting: boolean;
  value: string;
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRandomize: () => void;
  onSubmit: () => void;
  onSort: () => void;
  onPauseResume: () => void;
  onReset: () => void;
  onSpeedUp: () => void;
  onSpeedDown: () => void;
  isValidArray: boolean;
  isPaused: boolean;
  sortedUpTo: number;
  playSpeed: number;
  origArr: number[];
  sortedArr: number[];
  sortButtonText: string;
}

export const SortVisualizer = ({
  title,
  array,
  currentIndexes,
  isSorting,
  value,
  onValueChange,
  onRandomize,
  onSubmit,
  onSort,
  onPauseResume,
  onReset,
  onSpeedUp,
  onSpeedDown,
  isValidArray,
  sortedUpTo,
  isPaused,
  playSpeed,
  origArr,
  sortedArr,
  sortButtonText,
}: SortVisualizerProps) => {
  return (
    <div>
      <h1>{title}</h1>
      <input
        placeholder="Enter array value"
        value={value}
        onChange={onValueChange}
      />

      <div className="grid w-3/5 grid-cols-5 justify-items-start gap-2">
        <button onClick={onRandomize}>Randomize</button>
        <button onClick={onSubmit}>Submit</button>

        <button
          onClick={onSort}
          style={{ color: !isValidArray || isSorting ? "grey" : "black" }}
          disabled={!isValidArray || isSorting}
        >
          {sortButtonText}
        </button>

        <button
          onClick={onPauseResume}
          style={{ color: !isSorting && !isPaused ? "grey" : "black" }}
          disabled={!isSorting && !isPaused}
        >
          {!isPaused ? "Pause" : "Resume"}
        </button>

        <button onClick={onReset}>Reset</button>
        <button onClick={onSpeedUp}>Speed Up</button>
        <button onClick={onSpeedDown}>Speed Down</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <div>Current Speed: {playSpeed} ms delay</div>
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
        {array.map((num, index) => (
          <div
            key={index}
            style={{
              width: "65px",
              height: `${num * 5}px`,
              backgroundColor:
                index <= sortedUpTo && isSorting
                    ? "grey"
                    : index === currentIndexes.j + 1 && isSorting
                    ? "red"
                    : index === currentIndexes.j && isSorting
                    ? "lime"
                    : index === currentIndexes.minIndex && isSorting
                    ? "yellow" 
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

