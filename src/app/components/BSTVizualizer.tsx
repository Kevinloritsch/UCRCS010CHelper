"use client";
import React, { useEffect, useRef, useState } from "react";
import { insertNode } from "@/utils/BSTFunctions/insertBST";
import { removeNode } from "@/utils/BSTFunctions/removeBST";
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

const BSTVisualizer = () => {
  const networkContainer = useRef<HTMLDivElement | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const nodes = useRef(new DataSet<TreeNode>([]));
  const edges = useRef(
    new DataSet<{ id?: number; from: number; to: number }>([]),
  );
  const root = useRef<TreeNode | null>(null);
  const maxNodeId = useRef(0);
  const maxEdgeId = useRef(0);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (networkContainer.current) {
      const data = { nodes: nodes.current, edges: edges.current };
      const options = {
        nodes: {
          shape: "circle",
          color: "#97C2FC",
          font: { size: 20, color: "#000" },
        },
        edges: {
          arrows: "to",
        },
        physics: {
          enabled: false,
        },
        interaction: {
          dragNodes: false,
          dragView: true,
          zoomView: true,
        },
      };
      setNetwork(new Network(networkContainer.current, data, options));
    }
  }, []);

  return (
    <div>
      <h1>Binary Search Tree Visualizer</h1>
      <input
        type="number"
        placeholder="Enter node value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        className="border-2 border-black px-5"
        onClick={() =>
          insertNode(
            parseInt(value),
            root,
            nodes,
            edges,
            maxNodeId,
            maxEdgeId,
            network,
          )
        }
      >
        Insert
      </button>
      <button
        className="mx-5 border-2 border-black px-5"
        onClick={() =>
          removeNode(1, parseInt(value), 0, root, nodes, edges, network)
        }
      >
        Remove
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
