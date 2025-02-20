"use client";
import React, { useEffect, useRef, useState } from "react";
import { insertNode } from "@/utils/BSTFunctions/insertBST";
// import { removeNode } from "@/utils/BSTFunctions/removeBST";
import { Play, Pause, RefreshCcw } from "lucide-react";

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
          },
        ),
      );
    }
  }, []);

  useEffect(() => {
    if (animationStates && animationStates.length > 0) {
      // Update the nodes and edges based on the current step
      const { nodes: newNodes, edges: newEdges } = animationStates[currentStep];
      nodes.current.clear();
      edges.current.clear();
      nodes.current.add(newNodes);
      edges.current.add(newEdges);
    }
  }, [currentStep, animationStates]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isPlaying && animationStates && animationStates.length > 0) {
      interval = setInterval(() => {
        setCurrentStep((prev) =>
          prev < animationStates.length - 1 ? prev + 1 : prev,
        );
      }, 500);
    }

    return () => {
      if (interval !== null) clearInterval(interval); // ✅ Ensure `interval` is not null before clearing
    };
  }, [isPlaying, animationStates]);

  return (
    <div>
      <h1>Binary Search Tree Visualizer</h1>
      <input
        type="number"
        className="border-1 border border-black"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
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
            // Ensure newAnimationStates is not undefined by providing a fallback empty array
            setAnimationStates(newAnimationStates || []);
          } else {
            console.error("Network is not available.");
          }
        }}
      >
        Insert
      </button>

      <br />
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? <Pause /> : <Play />}
      </button>
      <button onClick={() => setCurrentStep(0)}>
        <RefreshCcw />
      </button>
      <div
        ref={networkContainer}
        style={{
          width: "100%",
          height: "600px",
          border: "1px solid lightgray",
        }}
      ></div>
    </div>
  );
};

export default BSTVisualizer;
