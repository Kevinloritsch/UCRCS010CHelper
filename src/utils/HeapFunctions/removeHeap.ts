import { DataSet } from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/components/HeapVisualizer";
import colors from "@/styles/colors";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const removeNode = async (
  value: number,
  root: React.MutableRefObject<TreeNode | null>,
  nodes: React.MutableRefObject<DataSet<TreeNode>>,
  edges: React.MutableRefObject<
    DataSet<{ id?: number; from: number; to: number }>
  >,
  // maxNodeId: React.MutableRefObject<number>,
  // maxEdgeId: React.MutableRefObject<number>,
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

  // error if root missing
  if (!root.current) {
    alert("No root.");
    return animationStates;
  }

  // level-order traversal using fresh data from DataSet
  let lastNodeId: number | null = null;
  const queue: number[] = [root.current.id];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.current.get(nodeId) as TreeNode;
    // depth = node.y / 100;

    // highlight as you traverse
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

    // update last seen node
    lastNodeId = nodeId;

    // enqueue children if they exist
    if (node.left !== null) queue.push(node.left);
    if (node.right !== null) queue.push(node.right);
  }

  // at the end, lastNodeId is the bottom-rightmost node
  const lastNode = lastNodeId
    ? (nodes.current.get(lastNodeId) as TreeNode)
    : null;

  console.log(lastNode);

  if (!lastNode) throw Error("no last node");

  if (lastNode.id === root.current.id) {
    // clear all nodes + edges
    nodes.current.remove(lastNode.id);
    edges.current.clear();

    snapshot();

    // rewind for animation
    // const initial = animationStates[0];
    nodes.current.clear();
    edges.current.clear();

    root.current = null;
    return animationStates;
  }

  // otherwise, swap root with lastNode, then remove lastNode
  else {
    const rootNode = root.current;
    const parentNode = lastNode.parent
      ? (nodes.current.get(lastNode.parent) as TreeNode)
      : null;

    // swap value + label between root and last
    const tmpValue = rootNode.value;
    const tmpLabel = rootNode.label;

    nodes.current.update({
      id: rootNode.id,
      value: lastNode.value,
      label: lastNode.label,
    });
    nodes.current.update({
      id: lastNode.id,
      value: tmpValue,
      label: tmpLabel,
    });

    snapshot();

    // remove lastNode from parent's child pointer
    if (parentNode) {
      if (parentNode.left === lastNode.id) {
        nodes.current.update({ id: parentNode.id, left: null });
      } else if (parentNode.right === lastNode.id) {
        nodes.current.update({ id: parentNode.id, right: null });
      }
    }

    // remove edge pointing to lastNode
    const edgeToRemove = (
      edges.current.get() as { id?: number; from: number; to: number }[]
    ).find((e) => e.to === lastNode.id);
    if (edgeToRemove?.id !== undefined) {
      edges.current.remove(edgeToRemove.id);
    }

    // remove lastNode
    nodes.current.remove(lastNode.id);

    snapshot();
  }

  // after swap + delete code

  // now percolate root down
  let iteratorNode = nodes.current.get(root.current.id) as TreeNode;

  while (iteratorNode) {
    const left = iteratorNode.left
      ? (nodes.current.get(iteratorNode.left) as TreeNode)
      : null;
    const right = iteratorNode.right
      ? (nodes.current.get(iteratorNode.right) as TreeNode)
      : null;

    let largest = iteratorNode;
    if (left && left.value > largest.value) largest = left;
    if (right && right.value > largest.value) largest = right;

    // stop if heap property satisfied
    if (largest.id === iteratorNode.id) break;

    // highlight swap
    nodes.current.update({
      id: iteratorNode.id,
      color: { background: colors.yellowSwap },
    });
    nodes.current.update({
      id: largest.id,
      color: { background: colors.yellowSwap },
    });
    snapshot();

    // swap value + label
    const tmpValue = iteratorNode.value;
    const tmpLabel = iteratorNode.label;

    nodes.current.update({
      id: iteratorNode.id,
      value: largest.value,
      label: largest.label,
    });
    nodes.current.update({
      id: largest.id,
      value: tmpValue,
      label: tmpLabel,
    });

    // reset colors
    nodes.current.update({
      id: iteratorNode.id,
      color: { background: colors.defaultBlue },
    });
    nodes.current.update({
      id: largest.id,
      color: { background: colors.defaultBlue },
    });
    snapshot();

    // continue downwards
    iteratorNode = nodes.current.get(largest.id) as TreeNode;
  }

  // rewind for animation
  const initial = animationStates[0];
  nodes.current.clear();
  edges.current.clear();
  initial.nodes.forEach((n) => nodes.current.add(n));
  initial.edges.forEach((e) => edges.current.add(e));

  return animationStates;
};
