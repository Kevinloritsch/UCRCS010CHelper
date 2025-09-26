"use client";
import TreeVisualizer from "@/components/TreeVisualizer";
import { overrideAlerts } from "@/utils/toastAlert";
import { Toaster } from "sonner";
import { useEffect } from "react";

import { insertNode } from "@/utils/BSTFunctions/insertBST";
import { removeNode } from "@/utils/BSTFunctions/removeBST";
import { maxNode } from "@/utils/BSTFunctions/maxBST";
import { minNode } from "@/utils/BSTFunctions/minBST";
import { inOrderTraversal } from "@/utils/BSTFunctions/inOrderBST";
import { preOrderTraversal } from "@/utils/BSTFunctions/preOrderBST";
import { postOrderTraversal } from "@/utils/BSTFunctions/postOrderBST";

export default function BSTVisualizer() {
  useEffect(() => {
    overrideAlerts();
  }, []);
  return (
    <>
      <TreeVisualizer
        title="Binary Search Tree Visualizer"
        functions={{
          insertNode,
          removeNode,
          maxNode,
          minNode,
          inOrderTraversal,
          preOrderTraversal,
          postOrderTraversal,
        }}
      />
      <Toaster richColors position="top-right" />
    </>
  );
}
