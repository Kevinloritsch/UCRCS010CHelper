import { DataSet } from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/components/AVLVisualizer";

export const rotateLeft = (
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
    if (parentNode.left === nodeId) {
      parentNode.left = rightChild.id;
    } else if (parentNode.right === nodeId) {
      parentNode.right = rightChild.id;
    }
    nodes.current.update({ id: parentNode.id });
  }

  const rightLeftSubtree = rightChild.left;

  const baseOffset =
    typeof window !== "undefined" && window.innerWidth < 400 ? 250 : 500;

  const newX = node.x - baseOffset * Math.pow(2, -depth - 1);
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

  nodes.current.update([
    {
      id: nodeId,
      x: newX,
      y: newY,
      parent: rightChild.id,
      right: rightLeftSubtree,
    },
    {
      id: rightChild.id,
      x: node.x,
      y: node.y,
      parent: node.parent,
      left: nodeId,
    },
  ]);

  edges.current.add([{ from: rightChild.id, to: nodeId }]);

  if (parentNode) {
    edges.current.add([{ from: parentNode.id, to: rightChild.id }]);
  }

  if (hasRightChildLeft && rightChildLeft) {
    edges.current.add([{ from: nodeId, to: rightChildLeft.id }]);

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

    const baseOffset =
      typeof window !== "undefined" && window.innerWidth < 400 ? 250 : 500;
    const xOffset = baseOffset * Math.pow(2, -currentDepth + 1);
    let newX, newY;

    if (parentNode) {
      const isLeftChild = node.value < parentNode.value;
      newX = parentNode.x + (isLeftChild ? -xOffset : xOffset);
      newY = parentNode.y + 100;
    } else {
      newX = node.x;
      newY = node.y;
    }

    if (node.x !== newX || node.y !== newY) {
      nodes.current.update({
        id: nodeId,
        x: newX,
        y: newY,
      });
    }

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

    const baseOffset =
      typeof window !== "undefined" && window.innerWidth < 400 ? 250 : 500;
    const xOffset = baseOffset * Math.pow(2, -currentDepth - 1);
    let newX;

    if (parentNode) {
      const isLeftChild = node.value < parentNode.value;
      newX = parentNode.x + (isLeftChild ? -xOffset : xOffset);
    } else {
      newX = -node.x;
    }

    nodes.current.update({
      id: rootId,
      x: newX,
    });

    if (node.left) flipSubtreeX(node.left, nodes, currentDepth + 1);
    if (node.right) flipSubtreeX(node.right, nodes, currentDepth + 1);
  };
  if (hasRightChildLeft && rightChildLeft)
    flipSubtreeX(rightChildLeft.id, nodes, depth + 1);
};
