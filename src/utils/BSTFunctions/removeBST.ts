import {
  DataSet,
  Network,
} from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/app/components/BSTVizualizer";
import colors from "@/styles/colors";

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
): Promise<AnimationState[]> => {
  const animationStates: {
    nodes: TreeNode[];
    edges: { id?: number; from: number; to: number }[];
  }[] = [];

  const snapshot = () => {
    const currentNodes = [...nodes.current.get()];
    const currentEdges = [...edges.current.get()];
    if (network) {
      network.stabilize();
      if (root.current) {
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
    alert("Tree is Empty");
    snapshot();

    return animationStates;
  }

  // iterator
  let currentNode = nodes.current.get(nodeId) as TreeNode | null;
  let parentNode: TreeNode | null = null;

  // this is for the recursive cases, itll be passed in as 0 for the default case
  if (parentID != 0) {
    parentNode = nodes.current.get(parentID) as TreeNode | null;
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
        parentNode = currentNode;
        currentNode = nodes.current.get(currentNode.left) as TreeNode;
        isLeftChild = true;
      } else {
        currentNode = null;
      }
    } else if (value > currentNode.value) {
      if (currentNode.right) {
        parentNode = currentNode;
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
    alert("Value not in tree");
    return animationStates;
  }

  // if it has no children case
  if (!currentNode.left && !currentNode.right) {
    // make sure parents point accordingly
    if (parentNode) {
      if (isLeftChild || parentNode.left == currentNode.id) {
        parentNode.left = null;
      } else {
        parentNode.right = null;
      }
      nodes.current.update(parentNode);
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
      edges.current.getIds({ filter: (edge) => edge.to === currentNode.id }),
    );
  }

  // case with children
  else {
    let childNode: TreeNode | null = null;

    let more = false;

    // main thing here is finding the predecessor (if there is one), or sucessor otherwise
    // the "more" flag is if we go "more" than one step away from a given node, as that affects pointer logic later on
    if (currentNode.left !== null) {
      parentNode = currentNode;
      let leftChild = nodes.current.get(currentNode.left) as TreeNode;
      console.log(leftChild);
      while (leftChild.right !== null) {
        more = true;
        parentNode = leftChild;
        leftChild = nodes.current.get(leftChild.right) as TreeNode;
      }
      childNode = leftChild;
    } else if (currentNode.right !== null) {
      parentNode = currentNode;
      let rightChild = nodes.current.get(currentNode.right) as TreeNode;
      while (rightChild.left !== null) {
        more = true;
        parentNode = rightChild;
        rightChild = nodes.current.get(rightChild.left) as TreeNode;
      }
      childNode = rightChild;
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
        if (parentNode) {
          snapshot();
          return removeNode(
            childNode.id,
            currentNode.value,
            parentNode.id,
            root,
            nodes,
            edges,
            network,
          );
        }
      }

      // otherwise, lets just delete the node
      nodes.current.remove(currentNode.id);

      // adjust parents accordingly
      if (parentNode) {
        if (parentNode.left === childNode.id) {
          parentNode.left = null;
        } else if (parentNode.right === childNode.id) {
          parentNode.right = null;
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
