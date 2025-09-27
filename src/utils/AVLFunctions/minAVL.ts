import {
  DataSet,
  Network,
} from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/components/TreeVisualizer";
import colors from "@/styles/colors";

export const minNode = async (
  root: React.MutableRefObject<TreeNode | null>,
  nodes: React.MutableRefObject<DataSet<TreeNode>>,
  edges: React.MutableRefObject<
    DataSet<{ id?: number; from: number; to: number }>
  >,

  network: Network | null,
) => {
  let tempRoot = nodes.current.get(1) as TreeNode | null;
  while (tempRoot && tempRoot.parent) {
    tempRoot = nodes.current.get(tempRoot.parent) as TreeNode | null;
  }
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

    return { animationStates, minValue: null };
  }

  let currentNode = tempRoot;
  let minValue = currentNode.value;

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

    minValue = currentNode.value;

    if (currentNode.left === null) {
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

      return { animationStates, minValue };
    }

    currentNode = nodes.current.get(currentNode.left) as TreeNode;
  }

  return { animationStates, minValue };
};
