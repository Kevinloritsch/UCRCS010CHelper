import {
  DataSet,
  Network,
} from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/components/AVLVisualizer";
import colors from "@/styles/colors";

export const postOrderTraversal = async (
  nodeId: number,
  nodes: React.MutableRefObject<DataSet<TreeNode>>,
  edges: React.MutableRefObject<
    DataSet<{ id?: number; from: number; to: number }>
  >,

  network: Network | null,
) => {
  const tempRoot = nodes.current.get(nodeId) as TreeNode | null;
  let animationStates: {
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
    return { animationStates, printValue: null };
  }

  const currentNode = tempRoot;
  let printValue = "";

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

  if (currentNode.left !== null) {
    const recursiveStates = await postOrderTraversal(
      currentNode.left,
      nodes,
      edges,
      network,
    );
    console.log(recursiveStates.animationStates);
    animationStates = animationStates.concat(recursiveStates.animationStates);
    printValue += recursiveStates.printValue;
  }

  if (currentNode.right !== null) {
    const recursiveStates = await postOrderTraversal(
      currentNode.right,
      nodes,
      edges,
      network,
    );

    animationStates = animationStates.concat(recursiveStates.animationStates);

    printValue += recursiveStates.printValue;
  }

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

  printValue += currentNode.label + ", ";

  return { animationStates, printValue };
};
