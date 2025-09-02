import { DataSet } from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/components/HeapVisualizer";
import colors from "@/styles/colors";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// counters for unique ids
let nodeIdCounter = 0;
let edgeIdCounter = 0;

export const insertNode = async (
  value: number,
  root: React.MutableRefObject<TreeNode | null>,
  nodes: React.MutableRefObject<DataSet<TreeNode>>,
  edges: React.MutableRefObject<
    DataSet<{ id?: number; from: number; to: number }>
  >,
  intOrLetter: boolean,
  maxOrMin: boolean, // true is max, false is min
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
    const newId = ++nodeIdCounter;
    const newNode: TreeNode = {
      id: newId,
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

  // bfs ! find the next open spot
  const queue: number[] = [root.current.id];
  let parentId: number | null = null;
  let isLeftChild = false;
  // needed for x distance on insertion
  let depth = 0;

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.current.get(nodeId) as TreeNode;
    depth++;

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

    // check if have nodes
    // no need to continue searching if we find a hole
    if (node.left === null) {
      parentId = nodeId;
      isLeftChild = true;
      break;
    }
    // if not left, then it has to be right
    if (node.right === null) {
      parentId = nodeId;
      isLeftChild = false;
      break;
    }

    // enqueue children
    queue.push(node.left, node.right);
  }

  // make typescript happy
  if (parentId === null) {
    throw new Error("No available slot for new node");
  }

  // find x y offsets
  let parentNode = nodes.current.get(parentId) as TreeNode | undefined;
  const xOffset = 500 * Math.pow(2, -(depth + 1));
  const newX = parentNode!.x + (isLeftChild ? -xOffset : xOffset);
  const newY = parentNode!.y + 100;

  // increment global id for uniqueness between ids
  const newId = ++nodeIdCounter;

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

  // update parent pointer
  if (isLeftChild) {
    nodes.current.update({ id: parentId, left: newId });
  } else {
    nodes.current.update({ id: parentId, right: newId });
  }

  // increment global edge counter
  const edgeId = ++edgeIdCounter;

  edges.current.add({ id: edgeId, from: parentId, to: newId });

  snapshot();

  // perc up
  let iteratorNode = nodes.current.get(newNode.id) as TreeNode | undefined;

  while (parentNode) {
    // change color for the comparison, we guarentee to at least swap color
    nodes.current.update({
      id: parentNode.id,
      color: { background: colors.yellowSwap },
    });

    nodes.current.update({
      id: iteratorNode!.id,
      color: { background: colors.yellowSwap },
    });

    snapshot();

    // we break if everything is in the right spot
    let breakFlag = false;

    // maxOrMin = true means max heap, = false means min heap
    if (
      (maxOrMin && parentNode.value < iteratorNode!.value) ||
      (!maxOrMin && parentNode.value > iteratorNode!.value)
    ) {
      // make the swap if we need to

      // back to blue first for emphasi

      nodes.current.update({
        id: parentNode.id,
        color: { background: colors.defaultBlue },
      });

      nodes.current.update({
        id: iteratorNode!.id,
        color: { background: colors.defaultBlue },
      });

      snapshot();

      // swap and make yellow

      const tempParentLabel = parentNode.label;
      const tempParentValue = parentNode.value;

      nodes.current.update({
        id: parentNode.id,
        label: iteratorNode!.label,
        value: iteratorNode!.value,
        color: { background: colors.yellowSwap },
      });
      nodes.current.update({
        id: iteratorNode!.id,
        label: tempParentLabel,
        value: tempParentValue,
        color: { background: colors.yellowSwap },
      });
      snapshot();
    } else breakFlag = true;

    // make to blue regardless

    nodes.current.update({
      id: parentNode.id,
      color: { background: colors.defaultBlue },
    });

    nodes.current.update({
      id: iteratorNode!.id,
      color: { background: colors.defaultBlue },
    });

    snapshot();

    // break if needed, or if we reached root
    // otherwise move up the tree
    if (!breakFlag) {
      if (!parentNode.parent) break;
      parentNode = nodes.current.get(parentNode.parent) as TreeNode | undefined;
      if (iteratorNode!.parent)
        iteratorNode = nodes.current.get(iteratorNode!.parent) as
          | TreeNode
          | undefined;
    } else break;
  }

  const initial = animationStates[0];
  nodes.current.clear();
  edges.current.clear();
  initial.nodes.forEach((n) => nodes.current.add(n));
  initial.edges.forEach((e) => edges.current.add(e));

  // refresh root to make sure it didn't get swapped around
  root.current = nodes.current.get(root.current.id) as TreeNode;

  return animationStates;
};
