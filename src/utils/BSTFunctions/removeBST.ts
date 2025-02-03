import {
  DataSet,
  Network,
} from "vis-network/standalone/umd/vis-network.min.js";
import { TreeNode } from "@/app/components/BSTVizualizer";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
) => {
  if (!root.current) {
    alert("Tree is Empty");
    return;
  }

  let currentNode = nodes.current.get(nodeId) as TreeNode | null;
  let parentNode: TreeNode | null = null;
  if (parentID != 0) {
    parentNode = nodes.current.get(parentID) as TreeNode | null;
  }

  let isLeftChild = false;

  // console.log("Start " + currentNode.value)
  // console.log(currentNode.left)
  // console.log(currentNode.right)

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

    console.log("value " + value + " current node id " + currentNode);

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

  console.log("After initial iteration");
  console.log(currentNode);

  if (!currentNode) {
    alert("Value not in tree");
    return;
  }

  if (!currentNode.left && !currentNode.right) {
    console.log("Here rn");
    console.log(parentNode);
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

    nodes.current.remove(currentNode.id);
    edges.current.remove(
      edges.current.getIds({ filter: (edge) => edge.to === currentNode.id }),
    );
  }
  // else if (currentNode.left && currentNode.right) {
  //   alert("Uh oh, removing a node with two children is not supported yet.");
  //   return;
  // }
  else {
    let childNode: TreeNode | null = null;
    let more = false;

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

    console.log("Current Current Node");
    console.log(currentNode);
    console.log("Current child Node");
    console.log(childNode);

    if (childNode) {
      // make them both yellow and swap values visually
      const tempCurrentNodeID = currentNode.id;

      console.log(currentNode);
      console.log(childNode);
      console.log(nodes.current.get());

      if (!more) {
        if (currentNode.value > childNode.value) {
          nodes.current.update({
            id: currentNode.id,
            label: childNode.label,
            value: childNode.value,
            // right: childNode.right,
            left: childNode.id,
            color: { background: "#e6dd21" },
          });
        } else {
          nodes.current.update({
            id: currentNode.id,
            label: childNode.label,
            value: childNode.value,
            right: childNode.id,
            // left: childNode.id,
            color: { background: "#e6dd21" },
          });
        }
      } else {
        nodes.current.update({
          id: currentNode.id,
          label: childNode.label,
          value: childNode.value,
          color: { background: "#e6dd21" },
        });
      }

      // console.log(nodes.current.get());

      console.log(childNode.id);
      nodes.current.update({
        id: childNode.id,
        label: currentNode.label,
        value: currentNode.value,
        // right: null,
        // left: null,
        color: { background: "#e6dd21" },
      });

      console.log(nodes.current.get());

      // if(currentNode.label > childNode.label) {
      //   console.log("yay?")
      //   nodes.current.update({
      //     id: childNode.id,
      //     left: tempCurrentNodeID,
      //   });
      // }
      // else {
      //   nodes.current.update({
      //     id: childNode.id,
      //     right: tempCurrentNodeID,
      //   });
      // }

      console.log("Pre stuff current " + currentNode.left + "  " + currentNode);

      console.log(nodes.current.get());

      await sleep(500);

      nodes.current.update({
        id: childNode.id,
        color: { background: "#97C2FC" },
      });

      console.log("Post stuff child " + childNode.left + "  " + currentNode);

      nodes.current.update({
        id: currentNode.id,
        color: { background: "#97C2FC" },
      });

      // nodes.current.update({
      //   id: currentNode.id,
      //   label: currentNode.value.toString(),
      //   value: currentNode.value,
      // });

      console.log("About to remove...: ");
      console.log(childNode);

      console.log(tempCurrentNodeID + "  " + childNode.id);

      if (currentNode.left || currentNode.right) {
        console.log("should be the recursive case");
        console.log(nodes.current.get());
        console.log(currentNode.id + "  " + currentNode.value);
        // nodes.current.update(currentNode);
        // nodes.current.update(childNode);
        await sleep(1000);
        if (parentNode) {
          removeNode(
            childNode.id,
            currentNode.value,
            parentNode.id,
            root,
            nodes,
            edges,
            network,
          );
        }
        console.log(nodes.current.get());
        return;
      }

      console.log(nodes.current.get());
      await sleep(1000);

      console.log("Current Node " + currentNode.value);

      console.log("Child Node " + childNode.value);

      nodes.current.remove(currentNode.id);
      await sleep(1000);
      console.log(parentNode);
      if (parentNode) {
        if (parentNode.left === childNode.id) {
          parentNode.left = null;
        } else if (parentNode.right === childNode.id) {
          parentNode.right = null;
        }

        console.log(currentNode.left);

        childNode.left = currentNode.left;
        childNode.right = currentNode.right;
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
