import {
  DataSet,
  Network,
} from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/components/TreeVisualizer";
import colors from "@/styles/colors";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const removeNode = async (
  step: number,
  value: number,
  depth: number,
  root: React.MutableRefObject<TreeNode | null>,
  nodes: React.MutableRefObject<DataSet<TreeNode>>,
  edges: React.MutableRefObject<
    DataSet<{ id?: number; from: number; to: number }>
  >,
  network: Network | null,
  maxOrMin?: boolean, // true is max, false is min
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

  console.log(root);

  // initial state
  snapshot();

  // error if root missing
  if (!root.current) {
    alert("No root.");
    return animationStates;
  }

  // iterate over tree w bfs
  let lastNodeId: number | null = null;
  const queue: number[] = [root.current.id];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.current.get(nodeId) as TreeNode;

    // highlight nodes as we look at them
    // highlighted every node as it kinda makes more sense than doing the tree traversal?
    // obviously it adds a O(n) to a O(log n) algo but it shows where we pick it from
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

  // here for error checking below to not be needed :D
  if (!lastNode) throw Error("no last node");

  // edge case delete the root
  if (lastNode.id === root.current.id) {
    // clear all nodes & edges
    nodes.current.remove(lastNode.id);
    edges.current.clear();

    // we have no root now
    root.current = null;

    snapshot();

    nodes.current.clear();
    edges.current.clear();

    root.current = null;
    return animationStates;
  }

  // otherwise swap root with lastNode, then remove lastNode
  else {
    let rootNode = nodes.current.get(root.current.id) as TreeNode;
    // save parent so we can properly delete the node
    const parentNode = lastNode.parent
      ? (nodes.current.get(lastNode.parent) as TreeNode)
      : null;

    // swap
    const tmpValue = rootNode.value;
    const tmpLabel = rootNode.label;

    snapshot();

    // highlight what we want to swap
    nodes.current.update({
      id: rootNode.id,
      color: { background: colors.yellowSwap },
    });
    nodes.current.update({
      id: lastNode.id,
      color: { background: colors.yellowSwap },
    });

    snapshot();

    nodes.current.update({
      id: rootNode.id,
      color: { background: colors.defaultBlue },
    });
    nodes.current.update({
      id: lastNode.id,
      color: { background: colors.defaultBlue },
    });

    snapshot();

    // highlight after swapping for emphasis
    nodes.current.update({
      id: rootNode.id,
      value: lastNode.value,
      label: lastNode.label,
      color: { background: colors.yellowSwap },
    });
    nodes.current.update({
      id: lastNode.id,
      value: tmpValue,
      label: tmpLabel,
      color: { background: colors.yellowSwap },
    });

    rootNode = nodes.current.get(rootNode.id) as TreeNode;

    snapshot();

    // look normal again
    nodes.current.update({
      id: rootNode.id,
      color: { background: colors.defaultBlue },
    });
    nodes.current.update({
      id: lastNode.id,
      color: { background: colors.defaultBlue },
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

  // now percolate root down
  let iteratorNode = nodes.current.get(root.current.id) as TreeNode;

  while (iteratorNode) {
    // grab left and right, we have to compare both
    const left = iteratorNode.left
      ? (nodes.current.get(iteratorNode.left) as TreeNode)
      : null;
    const right = iteratorNode.right
      ? (nodes.current.get(iteratorNode.right) as TreeNode)
      : null;

    let largest = iteratorNode;

    // maxOrMin = true means max heap, = false means min heap
    // adjust perc down accordingly
    if (
      (maxOrMin && left && left.value > largest.value) ||
      (!maxOrMin && left && left.value < largest.value)
    )
      largest = left;

    // largest value is currently the largest between iterator and left, so if right is largest this will be true
    if (
      (maxOrMin && right && right.value > largest.value) ||
      (!maxOrMin && right && right.value < largest.value)
    )
      largest = right;

    // stop if correct
    if (largest.id === iteratorNode.id) break;

    // swap color
    nodes.current.update({
      id: iteratorNode.id,
      color: { background: colors.yellowSwap },
    });
    nodes.current.update({
      id: largest.id,
      color: { background: colors.yellowSwap },
    });
    snapshot();

    // swap value
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

    // fix color
    nodes.current.update({
      id: iteratorNode.id,
      color: { background: colors.defaultBlue },
    });
    nodes.current.update({
      id: largest.id,
      color: { background: colors.defaultBlue },
    });
    snapshot();

    // continue percolate
    iteratorNode = nodes.current.get(largest.id) as TreeNode;
  }

  // update the root since it definetly changed
  root.current = nodes.current.get(root.current.id) as TreeNode;

  const initial = animationStates[0];
  nodes.current.clear();
  edges.current.clear();
  initial.nodes.forEach((n) => nodes.current.add(n));
  initial.edges.forEach((e) => edges.current.add(e));

  return animationStates;
};
