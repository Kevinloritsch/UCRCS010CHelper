import { DataSet } from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/components/TreeVisualizer";
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
    const newNode: TreeNode = {
      id: 1,
      value,
      left: null,
      right: null,
      x: 0,
      y: 0,
      label: "",
    };
    if (!intOrLetter) {
      newNode.label = String.fromCharCode(value + 64);
    } else {
      newNode.label = value.toString();
    }
    root.current = newNode;
    nodes.current.add(newNode);
    ++maxNodeId.current;
    // reset values

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
      alert(`Value ${value} already exists in the tree.`);
      return animationStates;
    }
  }

  const baseOffset =
    typeof window !== "undefined" && window.innerWidth < 400 ? 250 : 500;

  const xOffset = baseOffset * Math.pow(2, -depth);

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
    label: "",
  };

  if (!intOrLetter) {
    newNode.label = String.fromCharCode(value + 64);
  } else {
    newNode.label = value.toString();
  }

  nodes.current.add(newNode);

  if (isLeftChild) {
    currentNode!.left = newId;
  } else {
    currentNode!.right = newId;
  }

  const edgeId = ++maxEdgeId.current;
  edges.current.add({ id: edgeId, from: parentId!, to: newId });

  snapshot();

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
