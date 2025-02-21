import {
  DataSet,
  Network,
} from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/app/components/BSTVizualizer";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const insertNode = async (
  value: number,
  root: React.MutableRefObject<TreeNode | null>,
  nodes: React.MutableRefObject<DataSet<TreeNode>>,
  edges: React.MutableRefObject<
    DataSet<{ id?: number; from: number; to: number }>
  >,
  maxNodeId: React.MutableRefObject<number>,
  maxEdgeId: React.MutableRefObject<number>,
  network: Network | null,
) => {
  const animationStates: {
    nodes: TreeNode[];
    edges: { id?: number; from: number; to: number }[];
  }[] = [];

  const snapshot = () => {
    const currentNodes = [...nodes.current.get()]; // Get the current nodes
    const currentEdges = [...edges.current.get()]; // Get the current edges
    // console.log(currentNodes)
    animationStates.push({ nodes: currentNodes, edges: currentEdges }); // Store both nodes and edges
  };

  // console.log(nodes.current.get())
  snapshot();

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
    // reset values
    if (network) {
      network.stabilize();
      if (root) {
        network.selectNodes([root.current.id]);
        network.selectNodes([]);
      }
      network.setOptions({ physics: false });
    }
    snapshot();

    console.log(animationStates);
    return animationStates;
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
    // await sleep(500);
    snapshot();
    nodes.current.update({
      id: currentNode.id,
      color: { background: "#97C2FC" },
    });
    snapshot();

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
      // reset values
      if (network) {
        network.stabilize();
        if (root) {
          network.selectNodes([root.current.id]);
          network.selectNodes([]);
        }
        network.setOptions({ physics: false });
      }
      return;
    }
  }

  const xOffset = 500 * Math.pow(2, -depth);
  const newX = currentNode!.x + (isLeftChild ? -xOffset : xOffset);
  const newY = currentNode!.y + 100;

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

  nodes.current.add(newNode);

  if (isLeftChild) {
    currentNode!.left = newId;
  } else {
    currentNode!.right = newId;
  }

  const edgeId = ++maxEdgeId.current;
  edges.current.add({ id: edgeId, from: parentId!, to: newId });
  snapshot();

  if (network) {
    network.stabilize();
    network.setOptions({ physics: false });
    network.moveNode(newId, newX, newY);
    network.selectNodes([root.current.id]);
    network.selectNodes([]);
    console.log(nodes.current.get());
  }

  const initialState = animationStates[0]; // The initial state captured at the start
  nodes.current.clear(); // Clear all nodes
  edges.current.clear(); // Clear all edges

  // Restore nodes
  initialState.nodes.forEach((node) => {
    nodes.current.add(node); // Add all the nodes from the initial state
  });

  // Restore edges
  initialState.edges.forEach((edge) => {
    edges.current.add(edge); // Add all the edges from the initial state
  });

  // Optionally reset node positions or any other properties
  if (network) {
    network.stabilize();
    network.setOptions({ physics: false });
    network.selectNodes([root.current.id]);
    network.selectNodes([]);
  }

  return animationStates;
};
