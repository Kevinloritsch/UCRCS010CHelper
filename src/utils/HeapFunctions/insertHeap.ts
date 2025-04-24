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
    animationStates.push({
      nodes: [...nodes.current.get()],
      edges: [...edges.current.get()],
    });
  };

  // initial state
  snapshot();

  // create root if missing
  if (!root.current) {
    const id = ++maxNodeId.current;
    const newNode: TreeNode = {
      id,
      value,
      left: null,
      right: null,
      parent: null,
      x: 0,
      y: 0,
      label: intOrLetter ? value.toString() : String.fromCharCode(value + 64),
    };
    nodes.current.add(newNode);
    root.current = newNode;
    snapshot();
    return animationStates;
  }

  // level-order traversal using fresh data from DataSet
  const queue: number[] = [root.current.id];
  let parentId: number | null = null;
  let isLeftChild = false;
  let depth = 0;

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.current.get(nodeId) as TreeNode;
    depth = node.y / 100;

    // highlight
    nodes.current.update({
      id: nodeId,
      color: { background: colors.redAnimate },
    });
    snapshot();
    nodes.current.update({
      id: nodeId,
      color: { background: colors.defaultBlue },
    });
    snapshot();

    if (node.left === null) {
      parentId = nodeId;
      isLeftChild = true;
      break;
    }
    if (node.right === null) {
      parentId = nodeId;
      isLeftChild = false;
      break;
    }

    // enqueue children IDs
    queue.push(node.left, node.right);
  }

  if (parentId === null) {
    throw new Error("No available slot for new node");
  }

  // compute new coordinates
  let parentNode =
    parentId !== null
      ? (nodes.current.get(parentId) as TreeNode | undefined)
      : undefined;
  const xOffset = 500 * Math.pow(2, -(depth + 1));
  const newX = parentNode!.x + (isLeftChild ? -xOffset : xOffset);
  const newY = parentNode!.y + 100;
  const newId = ++maxNodeId.current;

  // create new node
  const newNode: TreeNode = {
    id: newId,
    value,
    left: null,
    right: null,
    parent: parentId,
    x: newX,
    y: newY,
    label: intOrLetter ? value.toString() : String.fromCharCode(value + 64),
  };

  nodes.current.add(newNode);

  // update parent pointers in dataset
  if (isLeftChild) {
    nodes.current.update({ id: parentId, left: newId });
  } else {
    nodes.current.update({ id: parentId, right: newId });
  }

  // add edge
  const edgeId = ++maxEdgeId.current;
  edges.current.add({ id: edgeId, from: parentId, to: newId });

  snapshot();

  // heapify up
  let iteratorNode = nodes.current.get(newNode.id) as TreeNode | undefined;

  while (parentNode) {
    if (parentNode.value < iteratorNode!.value) {
      console.log("swapping", parentNode.value, iteratorNode!.value);
      const tempParentLabel = parentNode.label;
      const tempParentValue = parentNode.value;

      nodes.current.update({
        id: parentNode.id,
        color: { background: colors.yellowSwap },
      });

      nodes.current.update({
        id: iteratorNode!.id,
        color: { background: colors.yellowSwap },
      });

      snapshot();

      nodes.current.update({
        id: parentNode.id,
        label: iteratorNode!.label,
        value: iteratorNode!.value,
      });
      nodes.current.update({
        id: iteratorNode!.id,
        label: tempParentLabel,
        value: tempParentValue,
      });

      nodes.current.update({
        id: parentNode.id,
        color: { background: colors.defaultBlue },
      });

      nodes.current.update({
        id: iteratorNode!.id,
        color: { background: colors.defaultBlue },
      });

      snapshot();

      if (!parentNode.parent) break;
      parentNode = nodes.current.get(parentNode.parent) as TreeNode | undefined;
      if (iteratorNode!.parent)
        iteratorNode = nodes.current.get(iteratorNode!.parent) as
          | TreeNode
          | undefined;
    } else break;
  }

  // rewind for animation
  const initial = animationStates[0];
  nodes.current.clear();
  edges.current.clear();
  initial.nodes.forEach((n) => nodes.current.add(n));
  initial.edges.forEach((e) => edges.current.add(e));

  // update root to fresh object
  root.current = nodes.current.get(root.current.id) as TreeNode;

  return animationStates;
};
