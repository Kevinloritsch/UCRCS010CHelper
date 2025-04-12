import { DataSet } from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/components/HeapVisualizer";
import colors from "@/styles/colors";

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
  intOrLetter: boolean,
) => {
  const animationStates: {
    nodes: TreeNode[];
    edges: { id?: number; from: number; to: number }[];
  }[] = [];

  const snapshot = () => {
    const currentNodes = [...nodes.current.get()];
    const currentEdges = [...edges.current.get()];
    animationStates.push({ nodes: currentNodes, edges: currentEdges });
  };

  snapshot();

  if (!root.current) {
    root.current = {
      id: 1,
      value,
      left: null,
      right: null,
      x: 0,
      y: 0,
      label: "",
    };
  }

  const heap: TreeNode[] = nodes.current.get();
  const newId = ++maxNodeId.current;
  const newIndex = heap.length;

  // Create the new node but do not set x and y yet
  const newNode: TreeNode = {
    id: newId,
    value,
    left: null,
    right: null,
    x: 0, // Temporary value
    y: 0, // Temporary value
    label: intOrLetter ? value.toString() : String.fromCharCode(value + 64),
  };

  heap.push(newNode);
  nodes.current.add(newNode);

  let currentIndex = newIndex;
  let parentIndex = Math.floor((currentIndex - 1) / 2);

  // Determine if the node is a left or right child
  const isLeftChild = currentIndex % 2 === 1; // Left child if odd index

  // Calculate the depth (level) and position in the level
  const depth = Math.floor(Math.log2(newIndex + 1));
  const positionInLevel = newIndex - (Math.pow(2, depth) - 1);
  const xOffset = 500 * Math.pow(2, -depth);

  // Set the x and y positions for the node after determining left/right position
  const parentX = heap[parentIndex] ? heap[parentIndex].x : 0; // Use parent's x if exists
  const newX = parentX + (isLeftChild ? -xOffset : xOffset);
  const newY = depth * 100; // Vertical spacing

  // Update the node with the calculated positions
  newNode.x = newX;
  newNode.y = newY;
  nodes.current.update({ id: newNode.id, x: newNode.x, y: newNode.y });

  // Create edge between parent and new node
  if (parentIndex >= 0) {
    const edgeId = ++maxEdgeId.current;
    edges.current.add({
      id: edgeId,
      from: heap[parentIndex].id,
      to: newNode.id,
    });

    if (isLeftChild) {
      heap[parentIndex].left = newNode.id;
    } else {
      heap[parentIndex].right = newNode.id;
    }
  }

  snapshot();

  // Heapify-up process (adjust the tree for heap properties)
  while (
    currentIndex > 0 &&
    heap[parentIndex].value < heap[currentIndex].value
  ) {
    // Swap nodes in the heap
    let temp = heap[parentIndex];
    heap[parentIndex] = heap[currentIndex];
    heap[currentIndex] = temp;

    // After swapping, update the positions to reflect the new parent-child relationship
    const tempX = heap[parentIndex].x;
    const tempY = heap[parentIndex].y;

    // Swap their positions
    heap[parentIndex].x = heap[currentIndex].x;
    heap[parentIndex].y = heap[currentIndex].y;

    heap[currentIndex].x = tempX;
    heap[currentIndex].y = tempY;

    // **Update parent-child relationship after swap**
    // Ensure the `left` and `right` child assignments are correct 
    // THIS NEEDS FIXING
    if (currentIndex === 2 * parentIndex + 1) {
      heap[parentIndex].left = heap[currentIndex].id;
      heap[parentIndex].right = null;
    } else if (currentIndex === 2 * parentIndex + 2) {
      heap[parentIndex].right = heap[currentIndex].id;
      heap[parentIndex].left = null;
    }

    // Update the nodes' positions on the tree visualization 
    // I THINK THIS ALSO NEEDS FIXING
    nodes.current.update({
      id: heap[parentIndex].id,
      x: heap[parentIndex].x,
      y: heap[parentIndex].y,
    });
    nodes.current.update({
      id: heap[currentIndex].id,
      x: heap[currentIndex].x,
      y: heap[currentIndex].y,
    });

    // **Recreate edges after each swap to maintain correct visualization**
    edges.current.clear(); // Clear the existing edges

    // Recreate edges for the heap
    for (let i = 0; i < heap.length; i++) {
      const leftChildIndex = 2 * i + 1;
      const rightChildIndex = 2 * i + 2;

      if (leftChildIndex < heap.length) {
        edges.current.add({
          id: ++maxEdgeId.current,
          from: heap[i].id,
          to: heap[leftChildIndex].id,
        });
      }

      if (rightChildIndex < heap.length) {
        edges.current.add({
          id: ++maxEdgeId.current,
          from: heap[i].id,
          to: heap[rightChildIndex].id,
        });
      }
    }

    snapshot();

    currentIndex = parentIndex;
    parentIndex = Math.floor((currentIndex - 1) / 2);
  }

  snapshot();
  return animationStates;
};
