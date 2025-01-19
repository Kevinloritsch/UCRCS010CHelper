"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  DataSet,
  Network,
} from "vis-network/standalone/umd/vis-network.min.js";

type TreeNode = {
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const BSTVisualizer = () => {
  const networkContainer = useRef<HTMLDivElement | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const nodes = useRef(new DataSet<TreeNode>([]));
  const edges = useRef(new DataSet<{ id?: number; from: number; to: number }>([]));
  const root = useRef<TreeNode | null>(null);
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
          enabled: true,
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


  /*
    the function below is the bulk of my code rn
    its still kinda a bit sketch, but from how im aware it still works

    main things that need improvement rn:

    the size of each node is not consistent and changes
        (input 500 then 700 as example)

    distance between nodes... rn its kinda inconsistent

    when its a duplicate it just calls an alert rn

    UI is ugly


  */

  const insertNode = async (value: number) => {
    if (!root.current) {
      const newNode: TreeNode = {
        id: 1,
        value,
        left: null,
        right: null,
        x: 0,
        y: 0,
        label: value.toString(),
      };
      root.current = newNode;
      nodes.current.add(newNode);
      return;
    }

    let currentNode = root.current;
    let parentId: number | null = null;
    let isLeftChild = false;
    let depth = 0;

    while (currentNode) {
      parentId = currentNode.id;
      depth++;


      // "animation"
      nodes.current.update({
        id: currentNode.id,
        color: { background: "red" },
      });
      await sleep(500);
      nodes.current.update({
        id: currentNode.id,
        color: { background: "#97C2FC" },
      });


      currentNode = nodes.current.get(currentNode.id) as TreeNode;

      if (value < currentNode.value) {
        if (currentNode.left === null) {
          isLeftChild = true;
          break;
        }
        currentNode = nodes.current.get(currentNode.left) as TreeNode;
      } else if (value > currentNode.value) {
        if (currentNode.right === null) {
          isLeftChild = false;
          break;
        }
        currentNode = nodes.current.get(currentNode.right) as TreeNode;
      } else {
        alert("Value already exists in the tree.");
        return;
      }
    }

    const xOffset = 500 * Math.pow(2, -depth);
    // ! checks to ensure currentNode is not null
    const newX = currentNode!.x + (isLeftChild ? -xOffset : xOffset);
    const newY = currentNode!.y + 100;


    // declare the tree
    const newId = nodes.current.getIds().length + 1;
    const newNode: TreeNode = {
      id: newId,
      value,
      left: null,
      right: null,
      x: newX,
      y: newY,
      label: value.toString(),
    };

    // add to list of all the nodes
    nodes.current.add(newNode);

    // set appropriate child pointer
    if (isLeftChild) {
      currentNode!.left = newId;
    } else {
      currentNode!.right = newId;
    }

    // add to list of all the edges
    const edgeId = edges.current.getIds().length + 1;
    edges.current.add({ id: edgeId, from: parentId!, to: newId });

    if (network) {
      network.stabilize();
      network.setOptions({ physics: false });
      network.moveNode(newId, newX, newY);
    }
  };

  return (
    <div>
      <h1>Binary Search Tree Visualizer</h1>
      <input
        type="number"
        placeholder="Enter node value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={() => insertNode(parseInt(value))}>Insert</button>
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
