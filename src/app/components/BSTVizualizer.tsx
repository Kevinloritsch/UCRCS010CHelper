"use client";
import React, { useEffect, useRef, useState } from "react";
import { insertNode } from "@/utils/BSTFunctions/insertBST";
import { removeNode } from "@/utils/BSTFunctions/removeBST";
import { maxNode } from "@/utils/BSTFunctions/maxBST";
import { minNode } from "@/utils/BSTFunctions/minBST";
import { inOrderTraversal } from "@/utils/BSTFunctions/inOrderBST";
import { Play, Pause, RefreshCcw, FastForward } from "lucide-react";

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

const BSTVisualizer = () => {
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
  const [maxValue, setMaxValue] = useState<number | null>(null);
  const [minValue, setMinValue] = useState<number | null>(null);
  const [inOrder, setInOrder] = useState<number | null>(null);

  useEffect(() => {
    if (networkContainer.current) {
      setNetwork(
        new Network(
          networkContainer.current,
          { nodes: nodes.current, edges: edges.current },
          {
            nodes: { shape: "circle", color: "#97C2FC" },
            edges: { arrows: "to" },
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

      if (network && animationStates[currentStep].nodes.length > 0) {
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
      <h1 className="m-2 text-center text-2xl">
        Binary Search Tree Visualizer
      </h1>
      <input
        type="number"
        className="border-1 m-2 border border-black"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter Value Here"
      />
      <div className="flex">
        <button
          className={`relative m-3 flex flex-col items-center rounded border px-4 py-2 ${
            isInserting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          onClick={async () => {
            if (network) {
              const newAnimationStates = await insertNode(
                parseInt(value),
                root,
                nodes,
                edges,
                maxNodeId,
                maxEdgeId,
                network,
              );
              setAnimationStates(newAnimationStates || []);
              setIsPlaying(true);
              setIsInserting(true);
              setCurrentStep(0);
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
                parseInt(value),
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

      <div className="min-h-[400px]">
        <div className="flex place-content-center">
          <div
            ref={networkContainer}
            style={{
              width: "98%",
              height: "400px",
              border: "1px solid lightgray",
            }}
            className="absolute"
          ></div>
        </div>

        <div className="flex">
          <button
            className={`relative my-2 ml-8 mr-3 flex flex-col items-center rounded bg-amber-900 px-4 py-0 text-white ${
              isInserting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
            onClick={async () => {
              if (network) {
                const { animationStates, maxValue } = await maxNode(
                  root,
                  nodes,
                  edges,
                  network,
                );
                setAnimationStates(animationStates || []);
                setMaxValue(maxValue);
                setIsPlaying(true);
                setIsInserting(true);
                setCurrentStep(0);
              }
            }}
            disabled={isInserting}
          >
            {isInserting && (
              <div className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                <span className="font-bold text-white">|</span>
              </div>
            )}
            Largest
          </button>

          <button
            className={`relative mx-3 my-2 flex flex-col items-center rounded border bg-amber-900 px-4 py-0 text-white ${
              isInserting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
            onClick={async () => {
              if (network) {
                const { animationStates, minValue } = await minNode(
                  root,
                  nodes,
                  edges,
                  network,
                );
                setAnimationStates(animationStates || []);
                setMinValue(minValue);
                setIsPlaying(true);
                setIsInserting(true);
                setCurrentStep(0);
              }
            }}
            disabled={isInserting}
          >
            {isInserting && (
              <div className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                <span className="font-bold text-white">|</span>
              </div>
            )}
            Smallest
          </button>

          <div className="flex flex-grow justify-end mr-8 my-2">
            <div className="bg-green-600 rounded">
            <button onClick={() => setIsPlaying(!isPlaying)} className="mx-3">
              {isPlaying ? <Pause color="white" fill="white" /> : <Play color="white" fill="white" />}
            </button>
            <button
              onClick={() => {
                setIsPlaying(true);
                setIsInserting(true);
                setCurrentStep(0);
              }}
              className="mx-3"
            >
              <RefreshCcw color="white" />
            </button>

            <button
              onClick={() => {
                setSpeed((prevSpeed) => Math.min(prevSpeed * 2, 1000));
              }}
              className="mx-3"
            >
              <FastForward color="white" fill="white" style={{ transform: "rotate(180deg)" }} />
            </button>

            <button
              onClick={() => {
                setSpeed((prevSpeed) => Math.max(prevSpeed / 2, 30));
              }}
              className="mx-3"
            >
              <FastForward color="white" fill="white" />
            </button>
            </div>

            
          </div>
        </div>
      </div>

      <div className="mx-3 rounded border px-2 w-[98%]">
        <div className="flex">
          <div>PRINT</div>
        <button
          className={`relative m-3 flex flex-col items-center rounded border px-4 py-2 ${
            isInserting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          onClick={async () => {
            if (network) {
              const { animationStates, inOrder } = await inOrderTraversal(
                root,
                nodes,
                edges,
                network,
              );
              setAnimationStates(animationStates || []);
              setInOrder(inOrder);
              setIsPlaying(true);
              setIsInserting(true);
              setCurrentStep(0);
            }
          }}
          disabled={isInserting}
        >
          {isInserting && (
            <div className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
              <span className="font-bold text-white">|</span>
            </div>
          )}
          In Order Traversal
        </button>

        </div>
        <div> In Order Traversal: {inOrder !== null ? inOrder : "None"}</div>
      </div>
    </div>
  );
};

export default BSTVisualizer;
