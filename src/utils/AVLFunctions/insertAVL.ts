import { DataSet } from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/components/AVLVisualizer";
import { rotateLeft } from "@/utils/AVLFunctions/rotateLeftAVL";
import { rotateRight } from "@/utils/AVLFunctions/rotateRightAVL";
import colors from "@/styles/colors";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getNodeHeight = (
  nodeId: number,
  nodes: React.MutableRefObject<DataSet<TreeNode>>,
): number => {
  const node = nodes.current.get(nodeId) as TreeNode | undefined;
  if (!node) return -1;

  const getHeight = (currentNode: TreeNode | null): number => {
    if (!currentNode) return -1;

    const leftChild = currentNode.left
      ? (nodes.current.get(currentNode.left) as TreeNode | null)
      : null;
    const rightChild = currentNode.right
      ? (nodes.current.get(currentNode.right) as TreeNode | null)
      : null;

    const leftHeight = getHeight(leftChild);
    const rightHeight = getHeight(rightChild);

    return 1 + Math.max(leftHeight, rightHeight);
  };

  return getHeight(node);
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
  let parentNode =
    parentId !== null
      ? (nodes.current.get(parentId) as TreeNode | undefined)
      : undefined;
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

    // Check for imbalance and perform appropriate rotation
    if (parentNodeBf > 1) {
      // Right heavy - need to check child's balance factor
      const rightChild = nodes.current.get(parentNode.right!) as TreeNode;
      const rightChildLeftHeight = rightChild.left
        ? getNodeHeight(rightChild.left, nodes)
        : -1;
      const rightChildRightHeight = rightChild.right
        ? getNodeHeight(rightChild.right, nodes)
        : -1;
      const rightChildBf = rightChildRightHeight - rightChildLeftHeight;

      if (rightChildBf < 0) {
        // Right-Left case
        console.log(`Right-Left case at node ${parentNode.value}`);
        rotateRight(parentNode.right!, depth, root, nodes, edges);
        snapshot();
        rotateLeft(parentNode.id, depth - 1, root, nodes, edges);
        snapshot();
      } else {
        // Right-Right case
        console.log(`Right-Right case at node ${parentNode.value}`);
        rotateLeft(parentNode.id, depth - 1, root, nodes, edges);
        snapshot();
      }
    } else if (parentNodeBf < -1) {
      // Left heavy - need to check child's balance factor
      const leftChild = nodes.current.get(parentNode.left!) as TreeNode;
      const leftChildLeftHeight = leftChild.left
        ? getNodeHeight(leftChild.left, nodes)
        : -1;
      const leftChildRightHeight = leftChild.right
        ? getNodeHeight(leftChild.right, nodes)
        : -1;
      const leftChildBf = leftChildRightHeight - leftChildLeftHeight;

      if (leftChildBf > 0) {
        // Left-Right case
        console.log(`Left-Right case at node ${parentNode.value}`);
        rotateLeft(parentNode.left!, depth, root, nodes, edges);
        snapshot();
        rotateRight(parentNode.id, depth - 1, root, nodes, edges);
        snapshot();
      } else {
        // Left-Left case
        console.log(`Left-Left case at node ${parentNode.value}`);
        rotateRight(parentNode.id, depth - 1, root, nodes, edges);
        snapshot();
      }
    }

    if (!parentNode.parent) break;
    parentNode = nodes.current.get(parentNode.parent) as TreeNode | undefined;
    depth--;
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
