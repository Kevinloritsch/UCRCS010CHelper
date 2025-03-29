"use client";
import React, { useEffect, useRef, useState } from "react";
import { insertNode } from "@/utils/HeapFunctions/insertHeap";
import { removeNode } from "@/utils/BSTFunctions/removeBST";

import { Play, Pause, RefreshCcw, FastForward, Trash2 } from "lucide-react";

import {
  DataSet,
  Network,
} from "vis-network/standalone/umd/vis-network.min.js";

export type TreeNode = {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  x: number;
  y: number;
  label: string;
  color?: {
    background: string;
  };
};

export type AnimationState = {
  nodes: TreeNode[];
  edges: { id?: number; from: number; to: number }[];
};

const HeapVisualizer = () => {
  const networkContainer = useRef(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const nodes = useRef<DataSet<TreeNode>>(new DataSet([]));
  const edges = useRef<DataSet<{ id?: number; from: number; to: number }>>(
    new DataSet([]),
  );
  const root = useRef<TreeNode | null>(null);
  const maxNodeId = useRef(0);
  const maxEdgeId = useRef(0);
  const [value, setValue] = useState("");
  const [animationStates, setAnimationStates] = useState<AnimationState[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [printValue, setPrintValue] = useState<string | null>(null);
  const [intOrLetter, setIntOrLetter] = useState(true);

  useEffect(() => {
    if (networkContainer.current) {
      setNetwork(
        new Network(
          networkContainer.current,
          { nodes: nodes.current, edges: edges.current },
          {
            nodes: {
              shape: "circle",
              color: { background: "#97C2FC", border: "#97C2FC" },
              size: 30,
              scaling: { min: 30, max: 30 },
              fixed: { x: true, y: true },
              chosen: false,
            },
            edges: { arrows: "to", chosen: false },
            physics: { enabled: false },
            interaction: {
              dragNodes: false,
              dragView: true,
              zoomView: true,
            },
          },
        ),
      );
    }
  }, []);

  useEffect(() => {
    if (animationStates && animationStates.length > 0) {
      const { nodes: newNodes, edges: newEdges } = animationStates[currentStep];
      nodes.current.clear();
      edges.current.clear();
      nodes.current.add(newNodes);
      edges.current.add(newEdges);

      console.log(animationStates);

      if (
        network &&
        root.current &&
        animationStates[currentStep].nodes.length > 0
      )
        network.selectNodes([root.current.id]);

      if (currentStep % 25 == 0) network?.stabilize();

      if (
        currentStep == animationStates.length - 1 &&
        network &&
        animationStates[currentStep].nodes.length > 0
      ) {
        network.stabilize();
        network.setOptions({ physics: false });

        if (root.current) {
          network.selectNodes([root.current.id]);
          network.selectNodes([]);
        }
      }
    }
  }, [currentStep, animationStates]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isPlaying && animationStates.length > 0) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < animationStates.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            setIsInserting(false);
            return prev;
          }
        });
      }, speed);
    }

    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isPlaying, animationStates, speed]);

  return (
    <div>
      <h1 className="m-2 text-center text-2xl">Heap Visualizer</h1>
      <div className="flex">
        <input
          type={intOrLetter ? "number" : "text"} // Toggle between 'number' and 'text'
          className="border-1 m-2 border border-black"
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;

            if (intOrLetter) {
              // Allow only integers when intOrLetter is true
              if (/^\d*\.?\d*$/.test(newValue)) {
                setValue(newValue);
              }
            } else {
              // Allow only a single letter when intOrLetter is false
              if (newValue.length <= 1 && /^[a-zA-Z]*$/.test(newValue)) {
                setValue(newValue.toUpperCase()); // Auto capitalize
              }
            }
          }}
          placeholder={
            intOrLetter ? "Enter Integer Here" : "Enter Single Letter Here"
          }
        />

        <button
          className={`relative m-3 flex flex-col items-center rounded border px-4 py-2 ${
            isInserting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          onClick={async () => {
            const arr = [];
            while (arr.length < 10) {
              if (intOrLetter) {
                const r = Math.floor(Math.random() * 300) - 149;
                if (arr.indexOf(r) === -1) arr.push(r);
              } else {
                const r = Math.floor(Math.random() * 25) + 1;
                if (arr.indexOf(r) === -1) arr.push(r);
              }
            }
            let counter = 0;
            let newAnimationStates: {
              nodes: TreeNode[];
              edges: { id?: number; from: number; to: number }[];
            }[] = [];
            while (counter < arr.length) {
              const states = await insertNode(
                arr[counter],
                root,
                nodes,
                edges,
                maxNodeId,
                maxEdgeId,
                intOrLetter,
              );
              newAnimationStates = newAnimationStates.concat(states);
              const lastValue =
                newAnimationStates[newAnimationStates.length - 1];

              const { nodes: newNodes, edges: newEdges } = lastValue;
              nodes.current.clear();
              edges.current.clear();
              nodes.current.add(newNodes);
              edges.current.add(newEdges);

              counter = counter + 1;
            }

            setAnimationStates(newAnimationStates || []);
            setIsPlaying(true);
            setIsInserting(true);
            setCurrentStep(0);
            setValue("");
          }}
          disabled={isInserting}
        >
          {isInserting && (
            <div className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
              <span className="font-bold text-white">|</span>
            </div>
          )}
          Insert Many
        </button>

        <button
          onClick={async () => {
            setIntOrLetter(!intOrLetter);

            nodes.current.clear();
            edges.current.clear();

            root.current = null;
            maxNodeId.current = 0;
            maxEdgeId.current = 0;

            setAnimationStates([]);
            setCurrentStep(0);
            setIsPlaying(false);
            setIsInserting(false);
            setPrintValue(null);
            setValue("");

            if (network) {
              network.setData({ nodes: nodes.current, edges: edges.current });
              network.redraw();
            }
            console.log("clicked");
            // Any async tasks can go here
          }}
        >
          Toggle Input Type
        </button>

        <button
          onClick={() => {
            nodes.current.clear();
            edges.current.clear();

            root.current = null;
            maxNodeId.current = 0;
            maxEdgeId.current = 0;

            setAnimationStates([]);
            setCurrentStep(0);
            setIsPlaying(false);
            setIsInserting(false);
            setPrintValue(null);
            setValue("");

            if (network) {
              network.setData({ nodes: nodes.current, edges: edges.current });
              network.redraw();
            }
          }}
          className="mx-3"
        >
          <Trash2 color="black" style={{ transform: "rotate(360deg)" }} />
        </button>
      </div>
      <div className="flex">
        <button
          className={`relative m-3 flex flex-col items-center rounded border px-4 py-2 ${
            isInserting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          onClick={async () => {
            const valueToInsert =
              !intOrLetter && /^[A-Z]$/.test(value)
                ? value.charCodeAt(0) - 64
                : parseFloat(value);
            console.log(valueToInsert);
            if (network) {
              // console.log()
              const newAnimationStates = await insertNode(
                valueToInsert,
                root,
                nodes,
                edges,
                maxNodeId,
                maxEdgeId,
                intOrLetter,
              );
              setAnimationStates(newAnimationStates || []);
              setIsPlaying(true);
              setIsInserting(true);
              setCurrentStep(0);
              setValue("");
            } else {
              console.error("Network is not available.");
            }
          }}
          disabled={isInserting || value === ""}
        >
          {isInserting && (
            <div className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
              <span className="font-bold text-white">|</span>
            </div>
          )}
          Insert
        </button>

        <button
          className={`relative m-3 flex flex-col items-center rounded border px-4 py-2 ${
            isInserting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          onClick={async () => {
            if (network) {
              const newAnimationStates = await removeNode(
                1,
                parseFloat(value),
                0,
                root,
                nodes,
                edges,
                network,
              );
              setAnimationStates(newAnimationStates || []);
              setIsPlaying(true);
              setIsInserting(true);
              setCurrentStep(0);
              setValue("");
            }
          }}
          disabled={isInserting}
        >
          {isInserting && (
            <div className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
              <span className="font-bold text-white">|</span>
            </div>
          )}
          Remove
        </button>
      </div>

      <br />

      <div className="min-h-[500px]">
        <div className="flex place-content-center">
          <div
            ref={networkContainer}
            style={{
              width: "98%",
              height: "500px",
              border: "1px solid lightgray",
            }}
            className="absolute"
          ></div>
        </div>

        <div className="flex">
          <div className="my-2 mr-8 flex flex-grow justify-end">
            <div className="rounded bg-green-600">
              <button
                onClick={() => {
                  if (animationStates.length > 0) {
                    setIsPlaying(!isPlaying);
                  }
                }}
                className="mx-3"
              >
                {isPlaying ? (
                  <Pause
                    color="white"
                    fill="white"
                    style={{ transform: "rotate(360deg)" }}
                  />
                ) : (
                  <Play
                    color="white"
                    fill="white"
                    style={{ transform: "rotate(360deg)" }}
                  />
                )}
              </button>
              <button
                onClick={() => {
                  if (animationStates.length > 0) {
                    setIsPlaying(true);
                    setIsInserting(true);
                    setCurrentStep(0);
                  }
                }}
                className="mx-3"
              >
                <RefreshCcw
                  color="white"
                  style={{ transform: "rotate(360deg)" }}
                />
              </button>

              <button
                onClick={() => {
                  setSpeed((prevSpeed) => Math.min(prevSpeed * 2, 1000));
                }}
                className="mx-3"
              >
                <FastForward
                  color="white"
                  fill="white"
                  style={{ transform: "rotate(180deg)" }}
                />
              </button>

              <button
                onClick={() => {
                  setSpeed((prevSpeed) => Math.max(prevSpeed / 2, 30));
                }}
                className="mx-3"
              >
                <FastForward
                  color="white"
                  fill="white"
                  style={{ transform: "rotate(360deg)" }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto rounded border px-2" style={{ width: "98%" }}>
        <div className="flex">
          <div>PRINT</div>
        </div>
        <div> Traversal: {printValue !== null ? printValue : ""}</div>
      </div>
    </div>
  );
};

export default HeapVisualizer;
