"use client";

import React from "react";

interface SortVisualizerProps {
    array: number[];
    currentIndexes: { i: number; j: number };
    isSorting: boolean; 
}

export const SortVisualizer = ({
    array,
    currentIndexes,
    isSorting,
}: SortVisualizerProps) => {
    return (
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
                    index === currentIndexes.j && isSorting
                    ? "red"
                    : index === currentIndexes.j + 1 && isSorting
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
    );
}