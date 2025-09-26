"use client";
import TreeVisualizer from "@/components/TreeVisualizer";
import { overrideAlerts } from "@/utils/toastAlert";
import { Toaster } from "sonner";
import { useEffect } from "react";

import { insertNode } from "@/utils/AVLFunctions/insertAVL";
import { removeNode } from "@/utils/AVLFunctions/removeAVL";
import { maxNode } from "@/utils/AVLFunctions/maxAVL";
import { minNode } from "@/utils/AVLFunctions/minAVL";
import { inOrderTraversal } from "@/utils/AVLFunctions/inOrderAVL";
import { preOrderTraversal } from "@/utils/AVLFunctions/preOrderAVL";
import { postOrderTraversal } from "@/utils/AVLFunctions/postOrderAVL";

export default function AVLVisualizer() {
  useEffect(() => {
    overrideAlerts();
  }, []);
  return (
    <>
      <TreeVisualizer
        title="AVL Tree Visualizer"
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
