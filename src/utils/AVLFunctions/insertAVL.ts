import { DataSet } from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/components/AVLVisualizer";
import colors from "@/styles/colors";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getNodeHeight = (
  nodeId: number,
  nodes: React.MutableRefObject<DataSet<TreeNode>>
): number => {
  const node = nodes.current.get(nodeId) as TreeNode | undefined;
  if (!node) return -1;

  const getHeight = (currentNode: TreeNode | null): number => {
    if (!currentNode) return -1;

    const leftChild = currentNode.left ? nodes.current.get(currentNode.left) as TreeNode | null : null;
    const rightChild = currentNode.right ? nodes.current.get(currentNode.right) as TreeNode | null : null;

    const leftHeight = getHeight(leftChild);
    const rightHeight = getHeight(rightChild);

    return 1 + Math.max(leftHeight, rightHeight);
  };

  return getHeight(node);
};

const rotateLeft = (
  nodeId: number,
  nodes: React.MutableRefObject<DataSet<TreeNode>>,
  edges: React.MutableRefObject<DataSet<{ id?: number; from: number; to: number }>>
) => {
  const tempRoot = nodes.current.get(1) as TreeNode | null;
  if (!tempRoot) {
    console.error("Error: Root node (id: 1) is missing.");
    return;
  }

  const node = nodes.current.get(nodeId) as TreeNode | undefined;
  if (!node || node.right === null) return; // No right child, cannot rotate left

  const newRoot = nodes.current.get(node.right) as TreeNode | undefined;
  if (!newRoot) return;

  const parent = node.parent ? (nodes.current.get(node.parent) as TreeNode | null) : null;
  const isLeftChild = parent ? parent.left === nodeId : false;

  node.right = newRoot.left;
  if (newRoot.left !== null) {
    const leftChild = nodes.current.get(newRoot.left) as TreeNode | undefined;
    if (leftChild) leftChild.parent = node.id;
  }

  newRoot.left = nodeId;
  newRoot.parent = node.parent;
  node.parent = newRoot.id;

  if (parent) {
    if (isLeftChild) parent.left = newRoot.id;
    else parent.right = newRoot.id;
  }

  if (newRoot.id === 1) {
    newRoot.parent = null;
  }

  edges.current.remove({ from: nodeId, to: newRoot.id });
  edges.current.add({ from: newRoot.id, to: nodeId });

  if (node.right !== null) {
    edges.current.remove({ from: nodeId, to: node.right });
    edges.current.add({ from: nodeId, to: node.right });
  }

  // calc
  const depth = 0;
  const xOffset = 500 * Math.pow(2, -depth - 1);

  newRoot.x = node.x;
  newRoot.y = node.y;
  node.x = newRoot.x - xOffset;
  node.y = newRoot.y + 100;

  if (newRoot.right !== null) {
    const rightChild = nodes.current.get(newRoot.right) as TreeNode | undefined;
    if (rightChild) {
      rightChild.x = newRoot.x + xOffset;
      rightChild.y = newRoot.y + 100;
      nodes.current.update({ id: rightChild.id, x: rightChild.x, y: rightChild.y });
    }
  }

  nodes.current.update([
    { id: node.id, parent: node.parent, right: node.right, x: node.x, y: node.y },
    { id: newRoot.id, parent: newRoot.parent, left: newRoot.left, x: newRoot.x, y: newRoot.y }
  ]);
  

  console.log(`Performed left rotation on node ${nodeId}`);
};










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
    const newNode: TreeNode = {
      id: 1,
      value,
      parent: null,
      left: null,
      right: null,
      x: 0,
      y: 0,
      label: intOrLetter ? value.toString() : String.fromCharCode(value + 64),
    };

    root.current = newNode;
    nodes.current.add(newNode);
    ++maxNodeId.current;

    snapshot();
    return animationStates;
  }

  let currentNode = root.current;
  let parentId: number | null = null;
  let isLeftChild = false;
  let depth = 0;

  while (currentNode) {
    parentId = currentNode.id;
    depth++;

    nodes.current.update({
      id: currentNode.id,
      color: { background: colors.redAnimate },
    });

    snapshot();
    nodes.current.update({
      id: currentNode.id,
      color: { background: colors.defaultBlue },
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
      return animationStates;
    }
  }

  const xOffset = 500 * Math.pow(2, -depth);
  const newX = currentNode!.x + (isLeftChild ? -xOffset : xOffset);
  const newY = currentNode!.y + 100;

  const newId = ++maxNodeId.current;

  const newNode: TreeNode = {
    id: newId,
    value,
    parent: parentId,
    left: null,
    right: null,
    x: newX,
    y: newY,
    label: intOrLetter ? value.toString() : String.fromCharCode(value + 64),
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

  // Update balance factors and check for imbalance
  let parentNode = parentId !== null ? nodes.current.get(parentId) as TreeNode | undefined : undefined;
  while (parentNode) {
    const leftHeight = parentNode.left
      ? getNodeHeight(parentNode.left, nodes)
      : -1;
    const rightHeight = parentNode.right
      ? getNodeHeight(parentNode.right, nodes)
      : -1;
    const parentNodeBf = rightHeight - leftHeight;
    console.log(`Node ${parentNode.value} BF: ${parentNodeBf}`);

    nodes.current.update({ id: parentNode.id });

    // If the balance factor indicates a right-heavy imbalance, perform left rotation
    if (parentNodeBf > 1) {
      console.log(`Imbalance detected at node ${parentNode.value}, performing left rotation.`);
      rotateLeft(parentNode.id, nodes, edges);
      snapshot();
    }

    if (!parentNode.parent) break;
    parentNode = nodes.current.get(parentNode.parent) as TreeNode | undefined;
  }

  const initialState = animationStates[0];
  nodes.current.clear();
  edges.current.clear();

  // Restore nodes
  initialState.nodes.forEach((node) => {
    nodes.current.add(node);
  });

  // Restore edges
  initialState.edges.forEach((edge) => {
    edges.current.add(edge);
  });

  return animationStates;
};
