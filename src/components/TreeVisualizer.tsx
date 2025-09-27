"use client";
import React, { useEffect, useRef, useState, KeyboardEvent } from "react";
import {
  DataSet,
  Network,
} from "vis-network/standalone/umd/vis-network.min.js";
import {
  Play,
  Pause,
  RefreshCcw,
  FastForward,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type TreeNode = {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  parent?: number | null;
  x: number;
  y: number;
  label: string;
  color?: { background: string };
};

export type AnimationState = {
  nodes: TreeNode[];
  edges: { id?: number; from: number; to: number }[];
};

export interface TreeVisualizerProps {
  title: string;
  functions: TreeFunctions;
}

export interface TreeFunctions {
  insertNode: (
    value: number,
    root: React.MutableRefObject<TreeNode | null>,
    nodes: React.MutableRefObject<DataSet<TreeNode>>,
    edges: React.MutableRefObject<
      DataSet<{ id?: number; from: number; to: number }>
    >,
    maxNodeId: React.MutableRefObject<number>,
    maxEdgeId: React.MutableRefObject<number>,
    intOrLetter: boolean,
    maxOrMin?: boolean,
  ) => Promise<AnimationState[]>;

  removeNode: (
    step: number,
    value: number,
    depth: number,
    root: React.MutableRefObject<TreeNode | null>,
    nodes: React.MutableRefObject<DataSet<TreeNode>>,
    edges: React.MutableRefObject<
      DataSet<{ id?: number; from: number; to: number }>
    >,
    network: Network,
    maxOrMin?: boolean,
  ) => Promise<AnimationState[]>;

  maxNode?: (
    root: React.MutableRefObject<TreeNode | null>,
    nodes: React.MutableRefObject<DataSet<TreeNode>>,
    edges: React.MutableRefObject<
      DataSet<{ id?: number; from: number; to: number }>
    >,
    network: Network,
  ) => Promise<{ animationStates: AnimationState[] }>;

  minNode?: (
    root: React.MutableRefObject<TreeNode | null>,
    nodes: React.MutableRefObject<DataSet<TreeNode>>,
    edges: React.MutableRefObject<
      DataSet<{ id?: number; from: number; to: number }>
    >,
    network: Network,
  ) => Promise<{ animationStates: AnimationState[] }>;

  inOrderTraversal?: (
    step: number,
    nodes: React.MutableRefObject<DataSet<TreeNode>>,
    edges: React.MutableRefObject<
      DataSet<{ id?: number; from: number; to: number }>
    >,
    network: Network,
  ) => Promise<{ animationStates: AnimationState[]; printValue: string }>;

  preOrderTraversal?: (
    step: number,
    nodes: React.MutableRefObject<DataSet<TreeNode>>,
    edges: React.MutableRefObject<
      DataSet<{ id?: number; from: number; to: number }>
    >,
    network: Network,
  ) => Promise<{ animationStates: AnimationState[]; printValue: string }>;

  postOrderTraversal?: (
    step: number,
    nodes: React.MutableRefObject<DataSet<TreeNode>>,
    edges: React.MutableRefObject<
      DataSet<{ id?: number; from: number; to: number }>
    >,
    network: Network,
  ) => Promise<{ animationStates: AnimationState[]; printValue: string }>;
}

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({
  title,
  functions,
}) => {
  const networkContainer = useRef(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const nodes = useRef<DataSet<TreeNode>>(new DataSet([]));
  const edges = useRef<DataSet<{ id?: number; from: number; to: number }>>(
    new DataSet([]),
  );
  const root = useRef<TreeNode | null>(null);
  const maxNodeId = useRef(0);
  const maxEdgeId = useRef(0);

  const [value, setValue] = useState("");
  const [animationStates, setAnimationStates] = useState<AnimationState[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [printValue, setPrintValue] = useState<string | null>(null);
  const [intOrLetter, setIntOrLetter] = useState(true);
  const [oldRootID, setOldRootID] = useState<number | null>(null);
  const [maxOrMin, setMaxOrMin] = useState(true); // true is max, false is min

  useEffect(() => {
    if (networkContainer.current) {
      setNetwork(
        new Network(
          networkContainer.current,
          { nodes: nodes.current, edges: edges.current },
          {
            nodes: {
              shape: "circle",
              color: { background: "#97C2FC", border: "#97C2FC" },
              size: 30,
              scaling: { min: 30, max: 30 },
              fixed: { x: true, y: true },
              chosen: false,
            },
            edges: { arrows: "to", chosen: false },
            physics: { enabled: false },
            interaction: {
              dragNodes: false,
              dragView: true,
              zoomView: true,
            },
          },
        ),
      );
    }
  }, []);

  useEffect(() => {
    if (animationStates && animationStates.length > 0) {
      const { nodes: newNodes, edges: newEdges } = animationStates[currentStep];
      nodes.current.clear();
      edges.current.clear();
      nodes.current.add(newNodes);
      edges.current.add(newEdges);

      // console.log(animationStates);

      if (
        network &&
        root.current &&
        animationStates[currentStep].nodes.length > 0
      ) {
        try {
          network.selectNodes([root.current.id]);
        } catch {
          if (oldRootID) network.selectNodes([oldRootID!]);
        }

        if (currentStep % 25 == 0) {
          network?.stabilize();
        }
      }
      if (
        currentStep == animationStates.length - 1 &&
        network &&
        animationStates[currentStep].nodes.length > 0
      ) {
        network.stabilize();
        network.setOptions({ physics: false });

        if (root.current) {
          network.selectNodes([root.current.id]);
          network.selectNodes([]);
        }
      }
    }
  }, [currentStep, animationStates]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isPlaying && animationStates.length > 0) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < animationStates.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            setIsInserting(false);
            return prev;
          }
        });
      }, speed);
    }

    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isPlaying, animationStates, speed]);

  const handleInsert = async () => {
    const valueToInsert =
      !intOrLetter && /^[A-Z]$/.test(value)
        ? value.charCodeAt(0) - 64
        : parseFloat(value);
    console.log(valueToInsert);
    if (network) {
      if (root.current) setOldRootID(root.current.id);
      let newAnimationStates: AnimationState[];

      if (title === "Binary Heap Visualizer") {
        newAnimationStates = await functions.insertNode(
          valueToInsert,
          root,
          nodes,
          edges,
          maxNodeId,
          maxEdgeId,
          intOrLetter,
          maxOrMin,
        );
      } else {
        newAnimationStates = await functions.insertNode(
          valueToInsert,
          root,
          nodes,
          edges,
          maxNodeId,
          maxEdgeId,
          intOrLetter,
        );
      }
      setAnimationStates(newAnimationStates || []);
      setIsPlaying(true);
      setIsInserting(true);
      setCurrentStep(0);
      setValue("");
    } else {
      console.error("Network is not available.");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isInserting && value !== "") {
      handleInsert();
    }
  };

  return (
    <div>
      <h1 className="m-2 text-center text-2xl text-black">{title}</h1>
      <div className="flex items-center">
        <DropdownMenu>
          <div className="ml-4 text-black">Select Variable Type:</div>
          <DropdownMenuTrigger className="ml-2 items-center rounded bg-helper-brown-100 px-4 py-1 text-white">
            <div className="flex items-center">
              {intOrLetter ? "Integer" : "String"}
              <div className="ml-1 rounded p-1">
                <ChevronDown color="white" size={16} />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Variable Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setIntOrLetter(true);
                nodes.current.clear();
                edges.current.clear();

                root.current = null;
                maxNodeId.current = 0;
                maxEdgeId.current = 0;

                setAnimationStates([]);
                setCurrentStep(0);
                setIsPlaying(false);
                setIsInserting(false);
                setPrintValue(null);
                setValue("");

                if (network) {
                  network.setData({
                    nodes: nodes.current,
                    edges: edges.current,
                  });
                  network.redraw();
                }
              }}
            >
              Integer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIntOrLetter(false);
                nodes.current.clear();
                edges.current.clear();

                root.current = null;
                maxNodeId.current = 0;
                maxEdgeId.current = 0;

                setAnimationStates([]);
                setCurrentStep(0);
                setIsPlaying(false);
                setIsInserting(false);
                setPrintValue(null);
                setValue("");

                if (network) {
                  network.setData({
                    nodes: nodes.current,
                    edges: edges.current,
                  });
                  network.redraw();
                }
              }}
            >
              String
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {title == "Binary Heap Visualizer" && (
          <DropdownMenu>
            <div className="ml-4 text-black">Select Heap Type:</div>
            <DropdownMenuTrigger className="ml-2 items-center rounded bg-helper-brown-100 px-4 py-1 text-white">
              <div className="flex items-center">
                {maxOrMin ? "Max Heap" : "Min Heap"}
                <div className="ml-1 rounded p-1">
                  <ChevronDown color="white" size={16} />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Heap Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setMaxOrMin(true);
                  nodes.current.clear();
                  edges.current.clear();

                  root.current = null;
                  maxNodeId.current = 0;
                  maxEdgeId.current = 0;

                  setAnimationStates([]);
                  setCurrentStep(0);
                  setIsPlaying(false);
                  setIsInserting(false);
                  setPrintValue(null);
                  setValue("");

                  if (network) {
                    network.setData({
                      nodes: nodes.current,
                      edges: edges.current,
                    });
                    network.redraw();
                  }
                }}
              >
                Max Heap
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setMaxOrMin(false);
                  nodes.current.clear();
                  edges.current.clear();

                  root.current = null;
                  maxNodeId.current = 0;
                  maxEdgeId.current = 0;

                  setAnimationStates([]);
                  setCurrentStep(0);
                  setIsPlaying(false);
                  setIsInserting(false);
                  setPrintValue(null);
                  setValue("");

                  if (network) {
                    network.setData({
                      nodes: nodes.current,
                      edges: edges.current,
                    });
                    network.redraw();
                  }
                }}
              >
                Min Heap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <button
          onClick={() => {
            nodes.current.clear();
            edges.current.clear();

            root.current = null;
            maxNodeId.current = 0;
            maxEdgeId.current = 0;

            setAnimationStates([]);
            setCurrentStep(0);
            setIsPlaying(false);
            setIsInserting(false);
            setPrintValue(null);
            setValue("");

            if (network) {
              network.setData({ nodes: nodes.current, edges: edges.current });
              network.redraw();
            }
          }}
          className="mx-3 md:hidden"
        >
          <Trash2 color="black" style={{ transform: "rotate(360deg)" }} />
        </button>
      </div>
      <div className="ml-2 flex">
        <input
          type="text"
          className="border-1 m-2 w-1/2 rounded border border-black pl-2"
          value={value}
          onChange={(e) => {
            const newValue = e.target.value.toUpperCase(); // Auto-uppercase letters
            if (intOrLetter) {
              const isValid = newValue
                .split("")
                .every((char: string, index) => {
                  const prevChar = newValue[index - 1];

                  if (char === "+" || char === "-") {
                    return index === 0 || prevChar === " " || prevChar === ",";
                  }
                  if (char === ",") {
                    return /\d/.test(prevChar);
                  }
                  if (char === " ") {
                    return prevChar === "," && newValue[index + 1] !== " ";
                  }
                  if (/\d/.test(char)) {
                    return true;
                  }
                  return false;
                });

              if (isValid) {
                setValue(newValue);
              }
            } else {
              const capitalizedValue = newValue.toUpperCase();

              const isValid = capitalizedValue
                .split("")
                .every((char, index) => {
                  const prevChar = capitalizedValue[index - 1];

                  if (/[A-Z]/.test(char)) {
                    return index === 0 || prevChar === "," || prevChar === " ";
                  }
                  if (char === ",") {
                    return /[A-Z]/.test(prevChar);
                  }
                  if (char === " ") {
                    return (
                      prevChar === "," && capitalizedValue[index + 1] !== " "
                    );
                  }
                  return false;
                });

              if (isValid) {
                setValue(capitalizedValue);
              }
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            intOrLetter
              ? "Enter integers, comma-separated"
              : "Enter letters A-Z, comma-separated"
          }
        />
        <button
          className={`relative m-3 flex flex-col items-center rounded border-[3px] border-helper-green-400 bg-white px-4 py-2 text-helper-green-400 ${
            isInserting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          onClick={async () => {
            const values = value
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v !== "")
              .map((v) => {
                return !intOrLetter && /^[A-Z]$/.test(v)
                  ? v.charCodeAt(0) - 64
                  : parseFloat(v);
              });

            console.log("Values to insert:", values);

            if (network && values.length > 0) {
              let newAnimationStates: AnimationState[] = [];

              for (const valueToInsert of values) {
                let states: AnimationState[];

                if (title === "Binary Heap Visualizer") {
                  states = await functions.insertNode(
                    valueToInsert,
                    root,
                    nodes,
                    edges,
                    maxNodeId,
                    maxEdgeId,
                    intOrLetter,
                    maxOrMin,
                  );
                } else {
                  states = await functions.insertNode(
                    valueToInsert,
                    root,
                    nodes,
                    edges,
                    maxNodeId,
                    maxEdgeId,
                    intOrLetter,
                  );
                }

                newAnimationStates = newAnimationStates.concat(states || []);

                if (states && states.length > 0) {
                  const lastState = states[states.length - 1];
                  const { nodes: newNodes, edges: newEdges } = lastState;
                  nodes.current.clear();
                  edges.current.clear();
                  nodes.current.add(newNodes);
                  edges.current.add(newEdges);
                }
              }

              setAnimationStates(newAnimationStates);
              setIsPlaying(true);
              setIsInserting(true);
              setCurrentStep(0);
              setValue("");
            } else if (!network) {
              console.error("Network is not available.");
            }
          }}
          disabled={isInserting || value === ""}
        >
          {isInserting}
          Insert
        </button>

        <button
          className={`relative m-3 flex flex-col items-center rounded border-[3px] border-helper-green-400 bg-helper-green-400 px-4 py-2 text-white ${
            isInserting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          onClick={async () => {
            if (network) {
              let newAnimationStates: AnimationState[] = [];

              if (title === "Binary Heap Visualizer") {
                // For binary heap, just remove once (doesn't need specific values)
                const states = await functions.removeNode(
                  1,
                  1,
                  1,
                  root,
                  nodes,
                  edges,
                  network,
                  maxOrMin,
                );
                newAnimationStates = states || [];
              } else {
                // For other structures, parse multiple values from input
                const values = value
                  .split(",")
                  .map((v) => v.trim()) // Remove spaces
                  .filter((v) => v !== "") // Remove empty strings
                  .map((v) => {
                    // Convert each value
                    return !intOrLetter && /^[A-Z]$/.test(v)
                      ? v.charCodeAt(0) - 64
                      : parseFloat(v);
                  });

                console.log("Values to remove:", values);

                if (values.length > 0) {
                  for (const valueToRemove of values) {
                    const states = await functions.removeNode(
                      1,
                      valueToRemove,
                      0,
                      root,
                      nodes,
                      edges,
                      network,
                    );

                    // Append new animation states
                    newAnimationStates = newAnimationStates.concat(
                      states || [],
                    );

                    // Update the current state for next iteration
                    if (states && states.length > 0) {
                      const lastState = states[states.length - 1];
                      const { nodes: newNodes, edges: newEdges } = lastState;
                      nodes.current.clear();
                      edges.current.clear();
                      nodes.current.add(newNodes);
                      edges.current.add(newEdges);
                    }
                  }
                }
              }

              setAnimationStates(newAnimationStates);
              setIsPlaying(true);
              setIsInserting(true);
              setCurrentStep(0);
              setValue("");
            } else {
              console.error("Network is not available.");
            }
          }}
          disabled={isInserting || value === ""}
        >
          {isInserting}
          Remove
        </button>

        <button
          onClick={() => {
            nodes.current.clear();
            edges.current.clear();

            root.current = null;
            maxNodeId.current = 0;
            maxEdgeId.current = 0;

            setAnimationStates([]);
            setCurrentStep(0);
            setIsPlaying(false);
            setIsInserting(false);
            setPrintValue(null);
            setValue("");

            if (network) {
              network.setData({ nodes: nodes.current, edges: edges.current });
              network.redraw();
            }
          }}
          className="mx-3 hidden md:inline"
        >
          <Trash2 color="black" style={{ transform: "rotate(360deg)" }} />
        </button>
      </div>

      <br />

      <div className="min-h-[500px]">
        <div className="flex place-content-center">
          <div
            ref={networkContainer}
            style={{
              width: "98%",
              height: "500px",
              border: "1px solid lightgray",
            }}
            className="absolute bg-white"
          ></div>
        </div>

        <div className="flex">
          <div className="z-10 my-2 mr-2 flex flex-grow justify-end md:mr-8">
            <div className="rounded bg-helper-green-400">
              <button
                onClick={() => {
                  if (animationStates.length > 0) {
                    setIsPlaying(!isPlaying);
                  }
                }}
                className="mx-3 my-2"
              >
                {isPlaying ? (
                  <Pause color="white" fill="white" />
                ) : (
                  <Play color="white" fill="white" />
                )}
              </button>
              <button
                onClick={() => {
                  if (animationStates.length > 0) {
                    setIsPlaying(true);
                    setIsInserting(true);
                    setCurrentStep(0);
                  }
                }}
                className="mx-3"
              >
                <RefreshCcw color="white" />
              </button>

              <button
                onClick={() => {
                  setSpeed((prevSpeed) => Math.min(prevSpeed * 2, 1000));
                }}
                className="mx-3"
              >
                <FastForward
                  color="white"
                  fill="white"
                  style={{ transform: "rotate(180deg)" }}
                />
              </button>

              <button
                onClick={() => {
                  setSpeed((prevSpeed) => Math.max(prevSpeed / 2, 30));
                }}
                className="mx-3"
              >
                <FastForward color="white" fill="white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {title != "Binary Heap Visualizer" && (
        <div
          className="mx-auto mb-4 h-auto min-h-min rounded border bg-helper-brown-100 px-2"
          style={{ width: "98%" }}
        >
          <div className="flex">
            <div className="my-auto text-xl text-white md:text-2xl">PRINT</div>
            {functions.preOrderTraversal && (
              <button
                className={`text-md relative m-3 flex flex-col items-center rounded border-[3px] border-helper-brown-300 bg-white px-2 py-2 font-medium md:px-4 ${
                  isInserting
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={async () => {
                  if (network) {
                    const { animationStates, printValue } =
                      await functions.preOrderTraversal!(
                        1,
                        nodes,
                        edges,
                        network,
                      );
                    setAnimationStates(animationStates || []);
                    if (printValue) {
                      const trimmedValue = printValue.replace(/,\s*$/, "");
                      setPrintValue("Pre Order: " + trimmedValue);
                    }
                    setIsPlaying(true);
                    setIsInserting(true);
                    setCurrentStep(0);
                  }
                }}
                disabled={isInserting}
              >
                {isInserting}
                Pre Order
              </button>
            )}
            {functions.inOrderTraversal && (
              <button
                className={`relative m-3 flex flex-col items-center rounded border-[3px] border-helper-brown-300 bg-white px-2 py-2 font-medium md:px-4 ${
                  isInserting
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={async () => {
                  if (network) {
                    const { animationStates, printValue } =
                      await functions.inOrderTraversal!(
                        1,
                        nodes,
                        edges,
                        network,
                      );
                    setAnimationStates(animationStates || []);
                    if (printValue) {
                      const trimmedValue = printValue.replace(/,\s*$/, "");
                      setPrintValue("In Order: " + trimmedValue);
                    }
                    setIsPlaying(true);
                    setIsInserting(true);
                    setCurrentStep(0);
                  }
                }}
                disabled={isInserting}
              >
                {isInserting && (
                  <div className="absolute flex h-6 w-6 items-center justify-center rounded-full" />
                )}
                In Order
              </button>
            )}
            {functions.postOrderTraversal && (
              <button
                className={`relative m-3 flex flex-col items-center rounded border-[3px] border-helper-brown-300 bg-white px-2 py-2 font-medium md:px-4 ${
                  isInserting
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={async () => {
                  if (network) {
                    const { animationStates, printValue } =
                      await functions.postOrderTraversal!(
                        1,
                        nodes,
                        edges,
                        network,
                      );
                    if (printValue) {
                      const trimmedValue = printValue.replace(/,\s*$/, "");
                      setPrintValue("Post Order: " + trimmedValue);
                    }
                    setAnimationStates(animationStates || []);
                    setIsPlaying(true);
                    setIsInserting(true);
                    setCurrentStep(0);
                  }
                }}
                disabled={isInserting}
              >
                {isInserting}
                Post Order
              </button>
            )}
            {functions.maxNode && (
              <button
                className={`text-md relative my-2 ml-2 flex flex-col items-center rounded bg-helper-brown-100 p-2 text-white md:ml-8 md:text-lg ${
                  isInserting
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={async () => {
                  if (network) {
                    const { animationStates } = await functions.maxNode!(
                      root,
                      nodes,
                      edges,
                      network,
                    );
                    setAnimationStates(animationStates || []);
                    setIsPlaying(true);
                    setIsInserting(true);
                    setCurrentStep(0);
                  }
                }}
                disabled={isInserting}
              >
                {isInserting}
                Largest
              </button>
            )}

            {functions.minNode && (
              <button
                className={`text-md relative my-2 ml-2 flex flex-col items-center rounded bg-helper-brown-100 p-2 text-white md:ml-4 md:text-lg ${
                  isInserting
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={async () => {
                  if (network) {
                    const { animationStates } = await functions.minNode!(
                      root,
                      nodes,
                      edges,
                      network,
                    );
                    setAnimationStates(animationStates || []);
                    setIsPlaying(true);
                    setIsInserting(true);
                    setCurrentStep(0);
                  }
                }}
                disabled={isInserting}
              >
                {isInserting}
                Smallest
              </button>
            )}
          </div>
          <div className="h-3/4 overflow-auto rounded bg-white p-2">
            <div className="font-medium">Traversal:</div>
            <div className="ml-2">{printValue !== null ? printValue : ""}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeVisualizer;
