import { DataSet } from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/components/AVLVisualizer";
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

const rotateLeft = (
  nodeId: number,
  depth: number,
  root: React.MutableRefObject<TreeNode | null>,
  nodes: React.MutableRefObject<DataSet<TreeNode>>,
  edges: React.MutableRefObject<
    DataSet<{ id?: number; from: number; to: number }>
  >,
) => {
  const node = nodes.current.get(nodeId) as TreeNode | undefined;
  if (!node || !node.right) return;

  const rightChild = nodes.current.get(node.right) as TreeNode | undefined;
  if (!rightChild) return;

  let rightChildLeft: TreeNode | undefined;
  if (rightChild.left != null) {
    rightChildLeft = nodes.current.get(rightChild.left) as TreeNode | undefined;
  } else {
    rightChildLeft = undefined;
  }

  const hasRightChildLeft = rightChildLeft !== undefined;

  const wasRoot = root.current?.id === nodeId;
  const parentNode = node.parent
    ? (nodes.current.get(node.parent) as TreeNode | undefined)
    : null;

  if (wasRoot) {
    root.current = rightChild;
  } else if (parentNode) {
    // Update the parent's reference to point to the new subtree root
    if (parentNode.left === nodeId) {
      parentNode.left = rightChild.id;
    } else if (parentNode.right === nodeId) {
      parentNode.right = rightChild.id;
    }
    nodes.current.update({ id: parentNode.id });
    console.log("parent " + parentNode.id);
  }

  // Store old right child's left subtree
  const rightLeftSubtree = rightChild.left;

  // Move `nodeId` down to the left
  const newX = node.x - 500 * Math.pow(2, -depth - 1);
  const newY = node.y + 100;

  edges.current.remove(
    edges.current.getIds().filter((id) => {
      const edge = edges.current.get(id);
      return (
        (edge?.from === nodeId && edge?.to === node.right) ||
        (parentNode && edge?.from === parentNode.id && edge?.to === nodeId) ||
        (hasRightChildLeft &&
          edge?.from === rightChild.id &&
          edge?.to === rightChildLeft?.id)
      );
    }),
  );

  // Update node positions and relationships
  nodes.current.update([
    {
      id: nodeId,
      x: newX,
      y: newY,
      parent: rightChild.id,
      right: rightLeftSubtree,
    }, // Update node
    {
      id: rightChild.id,
      x: node.x,
      y: node.y,
      parent: node.parent,
      left: nodeId,
    }, // Update rightChild
  ]);

  // Add new edges
  edges.current.add([
    { from: rightChild.id, to: nodeId }, // New edge from rightChild to node
  ]);

  if (parentNode) {
    edges.current.add([
      { from: parentNode.id, to: rightChild.id }, // New edge from rightChild to node
    ]);
  }

  if (hasRightChildLeft && rightChildLeft) {
    edges.current.add([
      { from: nodeId, to: rightChildLeft.id }, // New edge from rightChild to node
    ]);

    nodes.current.update({
      id: rightChildLeft.id,
      parent: nodeId,
    });
  }

  const updateSubtreePositions = (
    nodeId: number | null,
    nodes: React.MutableRefObject<DataSet<TreeNode>>,
    currentDepth: number,
  ) => {
    if (!nodeId) return;

    const node = nodes.current.get(nodeId) as TreeNode | undefined;
    if (!node) return;

    const parentNode = node.parent
      ? (nodes.current.get(node.parent) as TreeNode | undefined)
      : null;

    // Calculate new position based on parent and depth
    const xOffset = 500 * Math.pow(2, -currentDepth + 1);
    let newX, newY;

    if (parentNode) {
      const isLeftChild = node.value < parentNode.value;
      newX = parentNode.x + (isLeftChild ? -xOffset : xOffset);
      newY = parentNode.y + 100; // Fixed vertical spacing
    } else {
      // For root node (shouldn't happen in subtree updates)
      newX = node.x;
      newY = node.y;
    }

    // Only update if position changed
    if (node.x !== newX || node.y !== newY) {
      nodes.current.update({
        id: nodeId,
        x: newX,
        y: newY,
      });
    }

    // Recursively update children
    updateSubtreePositions(node.left, nodes, currentDepth + 1);
    updateSubtreePositions(node.right, nodes, currentDepth + 1);
  };

  updateSubtreePositions(node.left, nodes, depth + 1);
  updateSubtreePositions(node.right, nodes, depth + 1);

  const flipSubtreeX = (
    rootId: number | null,
    nodes: React.MutableRefObject<DataSet<TreeNode>>,
    currentDepth: number,
  ) => {
    if (!rootId) return;

    const node = nodes.current.get(rootId) as TreeNode | undefined;
    if (!node) return;

    const parentNode = node.parent
      ? (nodes.current.get(node.parent) as TreeNode | undefined)
      : null;

    // Calculate new position based on parent and depth
    const xOffset = 500 * Math.pow(2, -currentDepth - 1);
    let newX;

    if (parentNode) {
      const isLeftChild = node.value < parentNode.value;
      newX = parentNode.x + (isLeftChild ? -xOffset : xOffset);
    } else {
      // For root node
      newX = -node.x;
    }

    // Update the node's position
    nodes.current.update({
      id: rootId,
      x: newX,
    });

    // Recursively flip children with proper parameters
    if (node.left) flipSubtreeX(node.left, nodes, currentDepth + 1);
    if (node.right) flipSubtreeX(node.right, nodes, currentDepth + 1);
  };
  if (hasRightChildLeft && rightChildLeft)
    flipSubtreeX(rightChildLeft.id, nodes, depth + 1);

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

    // If the balance factor indicates a right-heavy imbalance, perform left rotation
    if (parentNodeBf > 1) {
      console.log(
        `Imbalance detected at node ${parentNode.value}, performing left rotation.`,
      );
      rotateLeft(parentNode.id, depth - 1, root, nodes, edges);
      snapshot();
    }

    if (!parentNode.parent) break;
    parentNode = nodes.current.get(parentNode.parent) as TreeNode | undefined;
    depth = depth - 1;
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
