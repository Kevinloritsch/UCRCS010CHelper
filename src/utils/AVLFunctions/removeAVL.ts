import {
  DataSet,
  Network,
} from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/components/TreeVisualizer";
import { rotateLeft } from "@/utils/AVLFunctions/rotateLeftAVL";
import { rotateRight } from "@/utils/AVLFunctions/rotateRightAVL";
import colors from "@/styles/colors";

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

export const updateRoot = (
  root: React.MutableRefObject<TreeNode | null>,
  nodes: React.MutableRefObject<DataSet<TreeNode>>,
) => {
  if (!root.current) return;
  let node = root.current;
  while (node.parent) {
    const parent = nodes.current.get(node.parent) as TreeNode | null;
    if (!parent) break;
    node = parent;
  }
  root.current = node;
};

// custom defines "pause" buffer
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

type AnimationState = {
  nodes: TreeNode[];
  edges: { id?: number; from: number; to: number }[];
};

export const removeNode = async (
  nodeId: number,
  value: number,
  parentID: number,
  root: React.MutableRefObject<TreeNode | null>,
  nodes: React.MutableRefObject<DataSet<TreeNode>>,
  edges: React.MutableRefObject<
    DataSet<{ id?: number; from: number; to: number }>
  >,
  network: Network | null,
  isInitialCall: boolean = true,
): Promise<AnimationState[]> => {
  updateRoot(root, nodes);
  const allNodes = nodes.current.get() as TreeNode[];
  const visualRoot = allNodes.find((n) => n.x === 0);
  if (visualRoot) {
    root.current = visualRoot;
  }
  const tempRoot = root.current;
  const animationStates: {
    nodes: TreeNode[];
    edges: { id?: number; from: number; to: number }[];
  }[] = [];

  const snapshot = () => {
    const currentNodes = [...nodes.current.get()];
    const currentEdges = [...edges.current.get()];
    if (network) {
      network.stabilize();
      if (root.current && tempRoot) {
        network.selectNodes([root.current.id]);
        network.selectNodes([]);
        network.selectEdges([]);

        network.redraw();
      }
      network.setOptions({ physics: false });
    }
    animationStates.push({ nodes: currentNodes, edges: currentEdges });
  };

  snapshot();
  // can't remove from an empty tree
  if (!root.current) {
    alert("The tree is empty.");

    return animationStates;
  }

  // iterator
  let currentNode: TreeNode | null;
  if (isInitialCall) {
    currentNode = root.current;
  } else {
    currentNode = nodes.current.get(nodeId) as TreeNode | null;
  }
  let parentNodeTemp: TreeNode | null = null;

  // this is for the recursive cases, itll be passed in as 0 for the default case
  if (parentID != 0) {
    parentNodeTemp = nodes.current.get(parentID) as TreeNode | null;
  }

  let isLeftChild = false;

  while (currentNode) {
    // identify the node we want to remove
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

    // standard bst logic
    if (value < currentNode.value) {
      if (currentNode.left) {
        parentNodeTemp = currentNode;
        currentNode = nodes.current.get(currentNode.left) as TreeNode;
        isLeftChild = true;
      } else {
        currentNode = null;
      }
    } else if (value > currentNode.value) {
      if (currentNode.right) {
        parentNodeTemp = currentNode;
        currentNode = nodes.current.get(currentNode.right) as TreeNode;
        isLeftChild = false;
      } else {
        currentNode = null;
      }
    } else {
      break;
    }

    // reset values
    if (network) {
      network.stabilize();
      network.selectNodes([root.current.id]);
      network.selectNodes([]);
      network.setOptions({ physics: false });
    }
  }

  // if it was never found... throw an error
  if (!currentNode) {
    alert(`Value ${value} does not exist in the tree.`);
    return animationStates;
  }

  // if it has no children case
  if (!currentNode.left && !currentNode.right) {
    // make sure parents point accordingly
    if (parentNodeTemp) {
      if (isLeftChild || parentNodeTemp.left == currentNode.id) {
        parentNodeTemp.left = null;
      } else {
        parentNodeTemp.right = null;
      }
      nodes.current.update(parentNodeTemp);
    } else {
      root.current = null;
    }

    // display a different color as visual indicator of being deleted
    nodes.current.update({
      id: currentNode.id,
      color: { background: colors.greenFinal },
    });

    // reset values
    if (network) {
      network.stabilize();
      if (root.current) {
        network.selectNodes([root.current.id]);
        network.selectNodes([]);
      }
      network.setOptions({ physics: false });
    }

    snapshot();
    nodes.current.update({
      id: currentNode.id,
      color: { background: colors.defaultBlue },
    });
    snapshot();

    // bye bye!
    nodes.current.remove(currentNode.id);
    edges.current.remove(
      edges.current.getIds({ filter: (edge) => edge.to === currentNode!.id }),
    );

    let depth = 0;
    let parentNode: TreeNode | null = null;
    let tempNode = currentNode;

    while (tempNode?.parent != null) {
      parentNode = nodes.current.get(tempNode.parent) || null;
      if (!parentNode) break;
      depth++;
      tempNode = parentNode;
    }

    snapshot();

    while (parentNode) {
      const leftHeight = parentNode.left
        ? getNodeHeight(parentNode.left, nodes)
        : -1;
      const rightHeight = parentNode.right
        ? getNodeHeight(parentNode.right, nodes)
        : -1;
      const parentNodeBf = rightHeight - leftHeight;

      nodes.current.update({ id: parentNode.id });

      snapshot();
      nodes.current.update({
        id: parentNode!.id,
        color: { background: colors.yellowSwap },
      });

      snapshot();
      nodes.current.update({
        id: parentNode!.id,
        color: { background: colors.defaultBlue },
      });
      snapshot();

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
          nodes.current.update({
            id: parentNode.right ?? undefined,
            color: { background: colors.greenFinal },
          });

          snapshot();
          nodes.current.update({
            id: parentNode.right ?? undefined,
            color: { background: colors.defaultBlue },
          });
          snapshot();

          rotateRight(parentNode.right!, depth, root, nodes, edges);
          snapshot();

          nodes.current.update({
            id: parentNode.id ?? undefined,
            color: { background: colors.greenFinal },
          });

          snapshot();
          nodes.current.update({
            id: parentNode.id ?? undefined,
            color: { background: colors.defaultBlue },
          });
          snapshot();
          rotateLeft(parentNode.id, depth - 1, root, nodes, edges);
          updateRoot(root, nodes);
          snapshot();
        } else {
          nodes.current.update({
            id: parentNode.id ?? undefined,
            color: { background: colors.greenFinal },
          });

          snapshot();
          nodes.current.update({
            id: parentNode.id ?? undefined,
            color: { background: colors.defaultBlue },
          });
          snapshot();
          rotateLeft(parentNode.id, depth - 1, root, nodes, edges);
          snapshot();
        }
      } else if (parentNodeBf < -1) {
        const leftChild = nodes.current.get(parentNode.left!) as TreeNode;
        const leftChildLeftHeight = leftChild.left
          ? getNodeHeight(leftChild.left, nodes)
          : -1;
        const leftChildRightHeight = leftChild.right
          ? getNodeHeight(leftChild.right, nodes)
          : -1;
        const leftChildBf = leftChildRightHeight - leftChildLeftHeight;

        if (leftChildBf > 0) {
          nodes.current.update({
            id: parentNode.left ?? undefined,
            color: { background: colors.greenFinal },
          });

          snapshot();
          nodes.current.update({
            id: parentNode.left ?? undefined,
            color: { background: colors.defaultBlue },
          });
          snapshot();
          rotateLeft(parentNode.left!, depth, root, nodes, edges);
          snapshot();
          nodes.current.update({
            id: parentNode.id ?? undefined,
            color: { background: colors.greenFinal },
          });

          snapshot();
          nodes.current.update({
            id: parentNode.id ?? undefined,
            color: { background: colors.defaultBlue },
          });
          snapshot();
          rotateRight(parentNode.id, depth - 1, root, nodes, edges);
          updateRoot(root, nodes);
          snapshot();
        } else {
          nodes.current.update({
            id: parentNode.id ?? undefined,
            color: { background: colors.greenFinal },
          });

          snapshot();
          nodes.current.update({
            id: parentNode.id ?? undefined,
            color: { background: colors.defaultBlue },
          });
          snapshot();
          rotateRight(parentNode.id, depth - 1, root, nodes, edges);
          snapshot();
        }
      }

      if (parentNode.parent == null) break;
      const nextParent = nodes.current.get(parentNode.parent) || null;
      parentNode = nextParent;
      depth--;
    }
  }

  // case with children
  else {
    let childNode: TreeNode | null = null;

    let more = false;

    // main thing here is finding the predecessor (if there is one), or sucessor otherwise
    // the "more" flag is if we go "more" than one step away from a given node, as that affects pointer logic later on
    if (currentNode.left !== null) {
      parentNodeTemp = currentNode;
      let leftChild = nodes.current.get(currentNode.left) as TreeNode;
      console.log(leftChild);
      while (leftChild.right !== null) {
        more = true;
        parentNodeTemp = leftChild;
        leftChild = nodes.current.get(leftChild.right) as TreeNode;
      }
      childNode = leftChild;
    } else if (currentNode.right !== null) {
      parentNodeTemp = currentNode;
      let rightChild = nodes.current.get(currentNode.right) as TreeNode;
      while (rightChild.left !== null) {
        more = true;
        parentNodeTemp = rightChild;
        rightChild = nodes.current.get(rightChild.left) as TreeNode;
      }
      childNode = rightChild;
    } else {
      alert(`Value ${value} does not exist in the tree.`);
      return animationStates;
    }

    if (childNode) {
      // make them both yellow and swap values visually

      // bunch of pointer logic to ensure this works!
      if (!more) {
        if (currentNode.value > childNode.value) {
          nodes.current.update({
            id: currentNode.id,
            label: childNode.label,
            value: childNode.value,
            left: childNode.id,
            color: { background: colors.yellowSwap },
          });
        } else {
          nodes.current.update({
            id: currentNode.id,
            label: childNode.label,
            value: childNode.value,
            right: childNode.id,
            color: { background: colors.yellowSwap },
          });
        }
      } else {
        nodes.current.update({
          id: currentNode.id,
          label: childNode.label,
          value: childNode.value,
          color: { background: colors.yellowSwap },
        });
      }

      nodes.current.update({
        id: childNode.id,
        label: currentNode.label,
        value: currentNode.value,

        color: { background: colors.yellowSwap },
      });

      const currentParentId = currentNode.parent;
      const childParentId = childNode.parent;

      nodes.current.update({
        id: currentNode.id,
        parent: currentParentId,
      });

      nodes.current.update({
        id: childNode.id,
        parent: childParentId,
      });

      // reset values
      if (network) {
        network.stabilize();
        if (root) {
          network.selectNodes([root.current.id]);
          network.selectNodes([]);
        }
        network.setOptions({ physics: false });
      }

      snapshot();

      // bring back to blue

      nodes.current.update({
        id: childNode.id,
        color: { background: colors.defaultBlue },
      });

      nodes.current.update({
        id: currentNode.id,
        color: { background: colors.defaultBlue },
      });
      snapshot();

      // if the node has any child, we have to do a recursive call
      if (currentNode.left || currentNode.right) {
        // call the function with the new values
        if (parentNodeTemp) {
          const recursiveStates = await removeNode(
            childNode.id,
            value,
            parentNodeTemp.id,
            root,
            nodes,
            edges,
            network,
            false,
          );
          return animationStates.concat(recursiveStates);
        }
      }

      // otherwise, lets just delete the node
      nodes.current.remove(currentNode.id);

      // adjust parents accordingly
      if (parentNodeTemp) {
        if (parentNodeTemp.left === childNode.id) {
          parentNodeTemp.left = null;
        } else if (parentNodeTemp.right === childNode.id) {
          parentNodeTemp.right = null;
        }
      }

      nodes.current.update(currentNode);
      if (network) {
        network.stabilize();
        network.setOptions({ physics: false });
      }

      const childEdgeIds = edges.current.getIds({
        filter: (edge) => edge.to === childNode.id,
      });
      edges.current.remove(childEdgeIds);
    }
  }

  // checker to make sure points do not look ugly
  if (network) {
    network.stabilize();
    if (root.current) {
      network.selectNodes([root.current.id]);
      network.selectNodes([]);
    }
    network.setOptions({ physics: false });
  }

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
