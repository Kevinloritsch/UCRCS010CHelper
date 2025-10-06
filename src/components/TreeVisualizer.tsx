"use client";
import React, { useEffect, useRef, useState, KeyboardEvent } from "react";
import {
  DataSet,
  Network,
} from "vis-network/standalone/umd/vis-network.min.js";
import { Play, Pause, RefreshCcw, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";

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
  ) => Promise<{ animationStates: AnimationState[]; printValue: string }>;

  minNode?: (
    root: React.MutableRefObject<TreeNode | null>,
    nodes: React.MutableRefObject<DataSet<TreeNode>>,
    edges: React.MutableRefObject<
      DataSet<{ id?: number; from: number; to: number }>
    >,
    network: Network,
  ) => Promise<{ animationStates: AnimationState[]; printValue: string }>;

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
  const [speed, setSpeed] = useState(100);
  const [printValue, setPrintValue] = useState<string | null>(null);
  const [intOrLetter, setIntOrLetter] = useState(true);
  const [oldRootID, setOldRootID] = useState<number | null>(null);
  const [maxOrMin, setMaxOrMin] = useState(true); // true is max, false is min
  const [traversalValue, setTraversalValue] = useState("Pre Order");

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

  const [speedSlider, setSpeedSlider] = React.useState<number>(50);

  const handleSpeedChange = (event: Event, newValue: number) => {
    setSpeedSlider(newValue);
    // y=501.27485 * 0.973737^{x}
    setSpeed(501.27485 * Math.pow(0.973737, newValue));
  };

  const isClient = typeof window !== "undefined";
  const [isMd, setIsMd] = useState(
    isClient ? window.matchMedia("(min-width: 768px)").matches : false,
  );

  useEffect(() => {
    if (!isClient) return;

    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMd(event.matches);
    };

    setIsMd(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isClient]);

  return (
    <div className="">
      <div className="text-bold m-2 text-center text-4xl text-helper-blue-primary md:h-[6vh]">
        {title}
      </div>

      <div className="mx-auto flex w-11/12 flex-col justify-center bg-white pb-2 pt-6 md:h-[15vh] md:flex-row">
        <div className="mx-auto flex w-11/12 flex-col md:mx-0 md:w-1/2">
          <div className="mx-auto flex h-8 flex-row md:mx-0">
            <DropdownMenu>
              <div className="text-black">Variable:</div>
              <DropdownMenuTrigger className="ml-1 items-center rounded bg-helper-blue-primary px-1 py-1 text-white md:px-4">
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
                <div className="ml-1 text-black">Heap:</div>
                <DropdownMenuTrigger className="ml-1 items-center rounded bg-helper-blue-primary px-1 py-1 text-white md:px-4">
                  <div className="flex items-center">
                    {maxOrMin ? "Max Heap" : "Min Heap"}
                    <div className="ml-1 rounded p-1">
                      <ChevronDown color="white" size={16} />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Heap</DropdownMenuLabel>
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
          </div>
          <div>
            <input
              type="text"
              className="border-1 my-2 h-12 w-full rounded border border-black"
              value={value}
              onChange={(e) => {
                const newValue = e.target.value.toUpperCase(); // Auto-uppercase letters
                if (intOrLetter) {
                  const isValid = newValue
                    .split("")
                    .every((char: string, index) => {
                      const prevChar = newValue[index - 1];

                      if (char === "+" || char === "-") {
                        return (
                          index === 0 || prevChar === " " || prevChar === ","
                        );
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
                        return (
                          index === 0 || prevChar === "," || prevChar === " "
                        );
                      }
                      if (char === ",") {
                        return /[A-Z]/.test(prevChar);
                      }
                      if (char === " ") {
                        return (
                          prevChar === "," &&
                          capitalizedValue[index + 1] !== " "
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
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mx-auto flex h-8 flex-row px-4 md:mx-0">
            <Box sx={{ width: title != "Binary Heap Visualizer" ? 170 : 200 }}>
              <Stack
                spacing={2}
                direction="row"
                sx={{ alignItems: "center", mb: 1 }}
              >
                <Slider
                  aria-label="Volume"
                  value={speedSlider}
                  onChange={handleSpeedChange}
                />
              </Stack>
            </Box>
            <div className="z-10 flex flex-row">
              <button
                onClick={() => {
                  if (animationStates.length > 0) {
                    setIsPlaying(!isPlaying);
                  }
                }}
                className="mx-1 ml-4 flex h-8 flex-col items-center rounded bg-helper-blue-primary px-4 py-1 text-white"
              >
                {isPlaying ? (
                  <Pause color="white" fill="white" />
                ) : (
                  <Play color="white" fill="white" />
                )}
              </button>
            </div>
          </div>
          <div className="mx-auto flex flex-row px-2 md:mx-0">
            <button
              className={`relative mx-2 my-3 flex h-8 flex-col items-center rounded bg-helper-blue-primary px-4 py-1 text-white ${
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

                    newAnimationStates = newAnimationStates.concat(
                      states || [],
                    );

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
              className={`relative mx-2 my-3 flex h-8 flex-col items-center rounded bg-helper-blue-primary px-4 py-1 text-white ${
                isInserting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
              onClick={async () => {
                if (network) {
                  let newAnimationStates: AnimationState[] = [];

                  if (title === "Binary Heap Visualizer") {
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
                    const values = value
                      .split(",")
                      .map((v) => v.trim())
                      .filter((v) => v !== "")
                      .map((v) => {
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

                        newAnimationStates = newAnimationStates.concat(
                          states || [],
                        );

                        if (states && states.length > 0) {
                          const lastState = states[states.length - 1];
                          const { nodes: newNodes, edges: newEdges } =
                            lastState;
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
              disabled={
                isInserting ||
                (title !== "Binary Heap Visualizer" && value === "")
              }
            >
              {isInserting}
              {title === "Binary Heap Visualizer" ? "Extract Root" : "Remove"}
            </button>
            <button
              onClick={() => {
                if (animationStates.length > 0) {
                  setIsPlaying(true);
                  setIsInserting(true);
                  setCurrentStep(0);
                }
              }}
              className="mx-2 my-3 flex h-8 flex-col items-center rounded bg-helper-blue-primary px-4 py-1 text-white"
            >
              <RefreshCcw color="white" />
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-11/12 justify-center bg-white"></div>

      <div className={isMd ? "h-[60vh]" : "h-[80vh]"}>
        <div className="flex place-content-center">
          <div
            ref={networkContainer}
            style={{
              width: "91.6666667%",
              height: isMd ? "60vh" : "80vh",
            }}
            className="absolute w-11/12 bg-white"
          ></div>
        </div>
      </div>

      {title != "Binary Heap Visualizer" ? (
        <div className="relative z-10 mx-auto mb-4 min-h-min w-11/12 rounded bg-white px-2 md:h-[8vh]">
          <div className="flex justify-between">
            <div className="flex">
              <DropdownMenu>
                <DropdownMenuTrigger className="ml-1 flex h-8 items-center rounded bg-helper-blue-primary px-2 text-white">
                  <div className="flex items-center">
                    {traversalValue}
                    <div className="ml-2">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select Traversal</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {functions.preOrderTraversal && (
                    <DropdownMenuItem
                      onClick={() => setTraversalValue("Pre Order")}
                    >
                      Pre Order
                    </DropdownMenuItem>
                  )}
                  {functions.inOrderTraversal && (
                    <DropdownMenuItem
                      onClick={() => setTraversalValue("In Order")}
                    >
                      In Order
                    </DropdownMenuItem>
                  )}
                  {functions.postOrderTraversal && (
                    <DropdownMenuItem
                      onClick={() => setTraversalValue("Post Order")}
                    >
                      Post Order
                    </DropdownMenuItem>
                  )}
                  {functions.maxNode && (
                    <DropdownMenuItem
                      onClick={() => setTraversalValue("Largest")}
                    >
                      Largest
                    </DropdownMenuItem>
                  )}
                  {functions.minNode && (
                    <DropdownMenuItem
                      onClick={() => setTraversalValue("Smallest")}
                    >
                      Smallest
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {functions.minNode &&
                functions.maxNode &&
                functions.postOrderTraversal &&
                functions.inOrderTraversal &&
                functions.preOrderTraversal && (
                  <button
                    className={`relative mx-2 flex h-8 flex-col items-center rounded bg-helper-blue-primary px-4 py-1 text-white ${
                      isInserting
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                    onClick={async () => {
                      if (network && !isInserting) {
                        let result;

                        if (
                          functions.preOrderTraversal &&
                          traversalValue === "Pre Order"
                        ) {
                          result = await functions.preOrderTraversal(
                            1,
                            nodes,
                            edges,
                            network,
                          );
                          if (result.printValue) {
                            const trimmedValue = result.printValue.replace(
                              /,\s*$/,
                              "",
                            );
                            setPrintValue("Pre Order: " + trimmedValue);
                          }
                        } else if (
                          functions.inOrderTraversal &&
                          traversalValue === "In Order"
                        ) {
                          result = await functions.inOrderTraversal(
                            1,
                            nodes,
                            edges,
                            network,
                          );
                          if (result.printValue) {
                            const trimmedValue = result.printValue.replace(
                              /,\s*$/,
                              "",
                            );
                            setPrintValue("In Order: " + trimmedValue);
                          }
                        } else if (
                          functions.postOrderTraversal &&
                          traversalValue === "Post Order"
                        ) {
                          result = await functions.postOrderTraversal(
                            1,
                            nodes,
                            edges,
                            network,
                          );
                          if (result.printValue) {
                            const trimmedValue = result.printValue.replace(
                              /,\s*$/,
                              "",
                            );
                            setPrintValue("Post Order: " + trimmedValue);
                          }
                        } else if (
                          functions.maxNode &&
                          traversalValue === "Largest"
                        ) {
                          result = await functions.maxNode(
                            root,
                            nodes,
                            edges,
                            network,
                          );
                          if (result.printValue)
                            setPrintValue("Largest: " + result.printValue);
                        } else if (
                          functions.minNode &&
                          traversalValue === "Smallest"
                        ) {
                          result = await functions.minNode(
                            root,
                            nodes,
                            edges,
                            network,
                          );
                          if (result.printValue)
                            setPrintValue("Smallest: " + result.printValue);
                        }

                        if (result) {
                          setAnimationStates(result.animationStates || []);
                          setIsPlaying(true);
                          setIsInserting(true);
                          setCurrentStep(0);
                        }
                      }
                    }}
                    disabled={isInserting}
                  >
                    Print
                  </button>
                )}
            </div>
            <div>
              <button
                className={`relative mx-2 flex h-8 flex-col items-center rounded bg-helper-blue-primary px-4 py-1 text-white ${
                  isInserting
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
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
                    network.setData({
                      nodes: nodes.current,
                      edges: edges.current,
                    });
                    network.redraw();
                  }
                }}
              >
                Clear
              </button>
            </div>
          </div>
          <div className="h-3/4 overflow-auto rounded bg-white p-2">
            <div className="ml-2">
              {printValue !== null ? printValue : "Print Something Here!"}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 mx-auto mb-4 flex w-11/12 place-items-center rounded bg-white px-2 md:h-[8vh]">
          <button
            className={`relative mx-2 my-3 ml-auto flex h-8 flex-col items-center rounded bg-helper-blue-primary px-4 text-white ${
              isInserting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
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
                network.setData({
                  nodes: nodes.current,
                  edges: edges.current,
                });
                network.redraw();
              }
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default TreeVisualizer;
