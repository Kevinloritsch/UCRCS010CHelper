import {
  DataSet,
  Network,
} from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/app/components/BSTVizualizer";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const removeNode = async (
  value: number,
  root: React.MutableRefObject<TreeNode | null>,
  nodes: React.MutableRefObject<DataSet<TreeNode>>,
  edges: React.MutableRefObject<
    DataSet<{ id?: number; from: number; to: number }>
  >,
  network: Network | null,
) => {
  if (!root.current) {
    alert("Tree is Empty");
    return;
  }

  let currentNode: TreeNode | null = root.current;
  let parentNode: TreeNode | null = null;
  let isLeftChild = false;

  while (currentNode) {
    nodes.current.update({
      id: currentNode.id,
      color: { background: "red" },
    });
    await sleep(500);
    nodes.current.update({
      id: currentNode.id,
      color: { background: "#97C2FC" },
    });

    currentNode = nodes.current.get(currentNode.id) as TreeNode;

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
  }

  if (!currentNode) {
    alert("Value not in tree");
    return;
  }

  if (!currentNode.left && !currentNode.right) {
    if (parentNode) {
      if (isLeftChild) {
        parentNode.left = null;
      } else {
        parentNode.right = null;
      }
      nodes.current.update(parentNode);
    } else {
      root.current = null;
    }

    nodes.current.remove(currentNode.id);
    edges.current.remove(
      edges.current.getIds({ filter: (edge) => edge.to === currentNode.id }),
    );
  } else if (currentNode.left && currentNode.right) {
    alert("Uh oh, removing a node with two children is not supported yet.");
    return;
  } else {
    let childNode: TreeNode | null = null;

    if (currentNode.left !== null) {
      let leftChild = nodes.current.get(currentNode.left) as TreeNode;
      while (leftChild.right !== null) {
        leftChild = nodes.current.get(leftChild.right) as TreeNode;
      }
      childNode = leftChild;
    } else if (currentNode.right !== null) {
      let rightChild = nodes.current.get(currentNode.right) as TreeNode;
      while (rightChild.left !== null) {
        rightChild = nodes.current.get(rightChild.left) as TreeNode;
      }
      childNode = rightChild;
    }

    if (childNode) {
      nodes.current.update({
        id: childNode.id,
        label: currentNode.label,
        color: { background: "#e6dd21" },
      });
      nodes.current.update({
        id: currentNode.id,
        label: childNode.label,
        color: { background: "#e6dd21" },
      });

      currentNode.value = childNode.value;
      currentNode.label = childNode.label;
      currentNode.left = childNode.left;
      currentNode.right = childNode.right;

      await sleep(500);

      nodes.current.update({
        id: childNode.id,
        color: { background: "#97C2FC" },
      });

      nodes.current.update({
        id: currentNode.id,
        color: { background: "#97C2FC" },
      });

      nodes.current.update({
        id: currentNode.id,
        label: currentNode.value.toString(),
        value: currentNode.value,
      });

      nodes.current.remove(childNode.id);

      if (currentNode.left === childNode.id) {
        currentNode.left = null;
      } else if (currentNode.right === childNode.id) {
        currentNode.right = null;
      }

      nodes.current.update(currentNode);

      const childEdgeIds = edges.current.getIds({
        filter: (edge) => edge.to === childNode.id,
      });
      edges.current.remove(childEdgeIds);
    }
  }

  console.log(nodes.current.get());

  if (network) {
    network.stabilize();
    network.setOptions({ physics: false });
  }
};
