import {
  DataSet,
  Network,
} from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/components/BSTVisualizer";
import colors from "@/styles/colors";

export const maxNode = async (
  root: React.MutableRefObject<TreeNode | null>,
  nodes: React.MutableRefObject<DataSet<TreeNode>>,
  edges: React.MutableRefObject<
    DataSet<{ id?: number; from: number; to: number }>
  >,

  network: Network | null,
) => {
  const tempRoot = nodes.current.get(1) as TreeNode | null;
  const animationStates: {
    nodes: TreeNode[];
    edges: { id?: number; from: number; to: number }[];
  }[] = [];

  const snapshot = () => {
    const currentNodes = [...nodes.current.get()];
    const currentEdges = [...edges.current.get()];
    if (network) {
      network.stabilize();
      if (tempRoot) {
        network.selectNodes([tempRoot.id]);
        network.selectNodes([]);
        network.selectEdges([]);
      }
      network.setOptions({ physics: false });
    }
    animationStates.push({ nodes: currentNodes, edges: currentEdges });
  };

  snapshot();

  if (!tempRoot) {
    snapshot();

    return { animationStates, maxValue: null };
  }

  let currentNode = tempRoot;
  let maxValue = currentNode.value;

  while (currentNode) {
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

    maxValue = currentNode.value;

    if (currentNode.right === null) {
      nodes.current.update({
        id: currentNode.id,
        color: { background: colors.yellowSwap },
      });

      snapshot();

      nodes.current.update({
        id: currentNode.id,
        color: { background: colors.defaultBlue },
      });

      snapshot();

      return { animationStates, maxValue };
    }

    currentNode = nodes.current.get(currentNode.right) as TreeNode;
  }

  return { animationStates, maxValue };
};
