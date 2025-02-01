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
      ++maxNodeId.current;
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
    const newId = ++maxNodeId.current;
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
    const edgeId = ++maxEdgeId.current;
    edges.current.add({ id: edgeId, from: parentId!, to: newId });

    if (network) {
      network.stabilize();
      network.setOptions({ physics: false });
      network.moveNode(newId, newX, newY);

      // Simulate clicking on the root node and then clicking off
      network.selectNodes([root.current.id]);
      network.selectNodes([]); // deselect the node
    }
  };

  const removeNode = async (value: number) => {
    if (!root.current) {
      alert("Tree is Empty");
      return;
    }

    let currentNode = root.current;
    let parentNode: TreeNode | null = null;
    let isLeftChild = false;

    // Traverse to find the node to delete
    while (currentNode) {
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
        if (currentNode.left) {
          parentNode = currentNode;
          currentNode = nodes.current.get(currentNode.left) as TreeNode;
          isLeftChild = true;
        } else {
          currentNode = null; // Value not found
        }
      } else if (value > currentNode.value) {
        if (currentNode.right) {
          parentNode = currentNode;
          currentNode = nodes.current.get(currentNode.right) as TreeNode;
          isLeftChild = false;
        } else {
          currentNode = null; // Value not found
        }
      } else {
        alert("Value exists in the tree.");
        break;
      }
    }

    if (!currentNode) {
      alert("Value not in tree");
      return;
    }

    // Handle node deletion based on its children
    if (!currentNode.left && !currentNode.right) {
      // Case 1: Node is a leaf node
      if (parentNode) {
        if (isLeftChild) {
          parentNode.left = null;
        } else {
          parentNode.right = null;
        }
        nodes.current.update(parentNode);
      } else {
        // Case 2: Node is the root and has no children
        root.current = null;
      }
      nodes.current.remove(currentNode.id);
      edges.current.remove(
        edges.current.get({ filter: (edge) => edge.to === currentNode.id }),
      );

      alert(`Node ${value} removed successfully.`);
      return;
    } else if (currentNode.left && currentNode.right) {
      // Case 3: Node has two children
      let predecessor = nodes.current.get(currentNode.left) as TreeNode;
      while (predecessor.right) {
        predecessor = nodes.current.get(predecessor.right) as TreeNode;
      }

      // Swap values between current node and predecessor
      const predecessorValue = predecessor.value;
      currentNode.value = predecessorValue;

      nodes.current.update({
        id: currentNode.id,
        label: currentNode.value.toString(),
      });
      nodes.current.update({
        id: predecessor.id,
        label: predecessorValue.toString(),
      });

      // Remove predecessor node (it is now a leaf or has one child)
      removeNode(predecessorValue);
    } else {
      // Case 4: Node has one child
      const childNode = currentNode.left ? currentNode.left : currentNode.right;
      if (parentNode) {
        if (isLeftChild) {
          parentNode.left = childNode;
        } else {
          parentNode.right = childNode;
        }
        nodes.current.update(parentNode);
      } else {
        // Case 5: Root node has one child
        root.current = nodes.current.get(childNode) as TreeNode;
      }
      nodes.current.remove(currentNode.id);
      edges.current.remove(
        edges.current.get({ filter: (edge) => edge.to === currentNode.id }),
      );

      alert(`Node ${value} removed successfully.`);
      return;
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
      <button
        className="border-2 border-black px-5"
        onClick={() => insertNode(parseInt(value))}
      >
        Insert
      </button>
      <button
        className="mx-5 border-2 border-black px-5"
        onClick={() => removeNode(parseInt(value))}
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
