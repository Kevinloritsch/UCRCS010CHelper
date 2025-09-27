"use client";
import TreeVisualizer from "@/components/TreeVisualizer";
import { overrideAlerts } from "@/utils/toastAlert";
import { Toaster } from "sonner";
import { useEffect } from "react";

import { insertNode } from "@/utils/HeapFunctions/insertMaxHeap";
import { removeNode } from "@/utils/HeapFunctions/removeMaxHeap";

export default function BSTVisualizer() {
  useEffect(() => {
    overrideAlerts();
  }, []);
  return (
    <>
      <TreeVisualizer
        title="Binary Heap Visualizer"
        functions={{
          insertNode,
          removeNode,
        }}
      />
      <Toaster richColors position="top-right" />
    </>
  );
}
