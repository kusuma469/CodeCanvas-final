//app\board\[boardId]\_components\canvas.tsx

"use client";

import Info from "./info";
import { Participants } from "./participants";
import Toolbar from "./toolbar";
import React, {
    useCallback,
    useMemo,
    useState,
    useEffect,
    useRef,
} from "react";
import { nanoid } from "nanoid";
import {
    CanvasState,
    CanvasMode,
    Camera,
    Color,
    LayerType,
    Point,
    Side,
    XYWH,
    Layer,
    EllipseLayer,
    BikeLayer,
    CameraLayer,
    CarLayer,
    CloudLayer,
    ComputerLayer,
    HeartLayer,
    HouseLayer,
    MoonLayer,
    MusicLayer,
    PhoneLayer,
    RectangleLayer,
    StarLayer,
    SunLayer,
    TreeLayer,
   /* PencilDraft,
    Coordinates,
    BikeLayer,
    CameraLayer,
    CarLayer,
    CloudLayer,
    ComputerLayer,
    HeartLayer,
    HouseLayer,
    MoonLayer,
    MusicLayer,
    PhoneLayer,
    StarLayer,
    SunLayer,
    TreeLayer,*/
} from "@/types/canvas";
import {
    useHistory,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStorage,
    useOthersMapped,
    useSelf,
} from "@liveblocks/react/suspense";
import { CursorsPresence } from "./cursors-presence";
import {
    colorToCss,
    connectionIdToColor,
    findIntersectingLayersWithRectangle,
    penPointsToPathLayer,
    pointerEventToCanvasPoint,
    resizeBounds,
} from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Path } from "./path";
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce";
import { ResetCamera } from "./reset-camera";

import { toPng } from "html-to-image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import AutoDrawSuggestions from "./auto-draw-suggestions";



const MAX_LAYERS = 100;
const SELECTION_NET_THRESHOLD = 5;
const MOVE_OFFSET = 5;

interface CanvasProps {
    boardId: string;
}
/*
interface BaseLayer {
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    type: LayerType;
  }
  
  interface LayerData extends BaseLayer {
    [key: string]: any;  // For any additional properties specific to certain layer types
  }*/
export const Canvas = ({ boardId }: CanvasProps) => {
    const layerIds = useStorage((root) => root.layerIds);

    const pencilDraft = useSelf((me) => me.presence.pencilDraft);
    const [currentPoints, setCurrentPoints] = useState<number[][] | null>(null);
    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None,
    });
    const [isPencilDown, setIsPencilDown] = useState(false);
    const [lastFreehandId, setLastFreehandId] = useState<string | null>(null);
    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });

    const resetCamera = useCallback(() => {
        setCamera({ x: 0, y: 0 });
    }, []);

    const [lastUsedColor, setLastUsedColor] = useState<Color>({
        r: 255,
        g: 255,
        b: 255,
    });
    
    const [showGrid, setShowGrid] = useState(false);
    const [showDots, setShowDots] = useState(false);

    useDisableScrollBounce();
    const history = useHistory();
    const canUndo = useCanUndo();
    const canRedo = useCanRedo();

    const toggleGrid = () => {
        setShowGrid((prev) => !prev);
    };
    const toggleDots = () => {
        setShowDots((prev) => !prev);
    };
    
    const insertLayer = useMutation(
        (
            { storage, setMyPresence },
            layerType:
                | LayerType.Ellipse
                | LayerType.Rectangle
                | LayerType.Text
                | LayerType.File
                | LayerType.Note
                | LayerType.Bike
                | LayerType.Camera
                | LayerType.Car
                | LayerType.Cloud
                | LayerType.Computer
                | LayerType.Star
                | LayerType.Sun
                | LayerType.Heart
                | LayerType.House
                | LayerType.Moon
                | LayerType.Music
                | LayerType.Tree
                | LayerType.Phone,
            position: Point
        ) => {
            const liveLayers = storage.get("layers");
            if (liveLayers.size >= MAX_LAYERS) {
                return;
            }

            const liveLayerIds = storage.get("layerIds");
            const layerId = nanoid();
            const layer = new LiveObject({
                type: layerType,
                x: position.x,
                y: position.y,
                height: 100,
                width: 100,
                fill: lastUsedColor,
            });

            liveLayerIds.push(layerId);
            liveLayers.set(layerId, layer);

            setMyPresence({ selection: [layerId] }, { addToHistory: true });
            setCanvasState({ mode: CanvasMode.None });
        },
        [lastUsedColor]
    );

    const translateSelectedLayers = useMutation(
        ({ storage, self }, point: Point) => {
            if (canvasState.mode !== CanvasMode.Translating) {
                return;
            }

            const offset = {
                x: point.x - canvasState.current.x,
                y: point.y - canvasState.current.y,
            };

            const liveLayers = storage.get("layers");
            for (const id of self.presence.selection) {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({
                        x: layer.get("x") + offset.x,
                        y: layer.get("y") + offset.y,
                    });
                }
            }
            setCanvasState({ mode: CanvasMode.Translating, current: point });
        },
        [canvasState]
    );

    const unSelectLayers = useMutation(({ setMyPresence, self }) => {
        if (self.presence.selection.length > 0) {
            setMyPresence({ selection: [] }, { addToHistory: true });
        }
    }, []);

    const updateSelectionNet = useMutation(
        ({ storage, setMyPresence }, current: Point, origin: Point) => {
            const layers = storage.get("layers").toImmutable();
            setCanvasState({ mode: CanvasMode.SelectionNet, origin, current });

            const ids = findIntersectingLayersWithRectangle(
                layerIds,
                layers,
                origin,
                current
            );

            setMyPresence({ selection: ids });
        },
        [layerIds]
    );

    const startMultiSelection = useCallback((current: Point, origin: Point) => {
        if (
            Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) >
            SELECTION_NET_THRESHOLD
        ) {
            setCanvasState({ mode: CanvasMode.SelectionNet, origin, current });
        }
    }, []);

    // Update the continueDrawing mutation
    const continueDrawing = useMutation(
        ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
            const { pencilDraft } = self.presence;
            
            if (!pencilDraft || !isPencilDown) {
                return;
            }

            const newPoint: [number, number, number] = [
                point.x,
                point.y,
                e.pressure || 0.5,
            ];
            const newDraft = [...pencilDraft, newPoint];

            setMyPresence({
                cursor: point,
                pencilDraft: newDraft,
            });
        },
        [isPencilDown]
    );

    const startDrawing = useMutation(
        ({ setMyPresence }, point: Point, pressure: number) => {
            setMyPresence({
                pencilDraft: [[point.x, point.y, pressure]],
                pencilColor: lastUsedColor,
            });
        },
        [lastUsedColor]
    );
    /*
    const insertPath = useMutation(
        ({ storage, self, setMyPresence }) => {
            const liveLayers = storage.get("layers");
            const { pencilDraft } = self.presence;

            if (
                pencilDraft == null ||
                pencilDraft.length < 2 ||
                liveLayers.size >= MAX_LAYERS
            ) {
                setMyPresence({ pencilDraft: null });
                return;
            }

            const id = nanoid();
            liveLayers.set(
                id,
                new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor))
            );

            const liveLayerIds = storage.get("layerIds");
            liveLayerIds.push(id);

            setMyPresence({ pencilDraft: null });
            setCanvasState({
                mode: CanvasMode.Pencil,
            });
        },
        [lastUsedColor]
    );*/

    
    const handleShapeSelection = useMutation(
        ({ storage, self, setMyPresence }, shapeType: string) => {
            console.log(self)
            const liveLayers = storage.get("layers");
            const liveLayerIds = storage.get("layerIds");
            
            if (liveLayers.size >= MAX_LAYERS) {
                return;
            }

            // Remove the previous freehand drawing
            if (lastFreehandId) {
                const index = liveLayerIds.indexOf(lastFreehandId);
                if (index !== -1) {
                    liveLayerIds.delete(index);
                    liveLayers.delete(lastFreehandId);
                }
            }

            const points = currentPoints;
            if (!points || points.length < 2) return;

            // Calculate bounds
            const [minX, maxX, minY, maxY] = points.reduce(
                ([minX, maxX, minY, maxY], [x, y]) => [
                    Math.min(minX, x),
                    Math.max(maxX, x),
                    Math.min(minY, y),
                    Math.max(maxY, y),
                ],
                [Infinity, -Infinity, Infinity, -Infinity]
            );

            const width = maxX - minX;
            const height = maxY - minY;
            const centerX = minX + width / 2;
            const centerY = minY + height / 2;

            // Create the new shape layer
            const newLayerId = nanoid();
            let layerData: Layer;
            const baseProps = {
                type: LayerType.Rectangle, // default
                x: centerX - width / 2,
                y: centerY - height / 2,
                height: height,
                width: width,
                fill: lastUsedColor,
              };

            switch (shapeType) {
                case 'circle':
                    const circleSize = Math.max(width, height);
        layerData = {
          ...baseProps,
          type: LayerType.Ellipse,
          height: circleSize,
          width: circleSize,
        } as EllipseLayer;
        break;
        case 'square':
            case 'rectangle':
              layerData = {
                ...baseProps,
                type: LayerType.Rectangle,
                ...(shapeType === 'square' && {
                  height: Math.max(width, height),
                  width: Math.max(width, height),
                }),
              } as RectangleLayer;
              break;
      
            case 'bike':
              layerData = {
                ...baseProps,
                type: LayerType.Bike,
                width: Math.max(width, height),
                height: Math.max(width, height),
              } as BikeLayer;
              break;
      
            case 'camera':
              layerData = {
                ...baseProps,
                type: LayerType.Camera,
                width: Math.max(width, height),
                height: Math.max(width, height),
              } as CameraLayer;
              break;
      
            case 'car':
              layerData = {
                ...baseProps,
                type: LayerType.Car,
                width: Math.max(width, height),
                height: Math.max(width, height),
              } as CarLayer;
              break;
      
            case 'cloud':
              layerData = {
                ...baseProps,
                type: LayerType.Cloud,
                width: Math.max(width, height),
                height: Math.max(width, height),
              } as CloudLayer;
              break;
      
            case 'computer':
              layerData = {
                ...baseProps,
                type: LayerType.Computer,
                width: Math.max(width, height),
                height: Math.max(width, height),
              } as ComputerLayer;
              break;
      
            case 'heart':
              layerData = {
                ...baseProps,
                type: LayerType.Heart,
                width: Math.max(width, height),
                height: Math.max(width, height),
              } as HeartLayer;
              break;
      
            case 'house':
              layerData = {
                ...baseProps,
                type: LayerType.House,
                width: Math.max(width, height),
                height: Math.max(width, height),
              } as HouseLayer;
              break;
      
            case 'moon':
              layerData = {
                ...baseProps,
                type: LayerType.Moon,
                width: Math.max(width, height),
                height: Math.max(width, height),
              } as MoonLayer;
              break;
      
            case 'music':
              layerData = {
                ...baseProps,
                type: LayerType.Music,
                width: Math.max(width, height),
                height: Math.max(width, height),
              } as MusicLayer;
              break;
      
            case 'phone':
              layerData = {
                ...baseProps,
                type: LayerType.Phone,
                width: Math.max(width, height),
                height: Math.max(width, height),
              } as PhoneLayer;
              break;
      
            case 'star':
              layerData = {
                ...baseProps,
                type: LayerType.Star,
                width: Math.max(width, height),
                height: Math.max(width, height),
              } as StarLayer;
              break;
      
            case 'sun':
              layerData = {
                ...baseProps,
                type: LayerType.Sun,
                width: Math.max(width, height),
                height: Math.max(width, height),
              } as SunLayer;
              break;
      
            case 'tree':
              layerData = {
                ...baseProps,
                type: LayerType.Tree,
                width: Math.max(width, height),
                height: Math.max(width, height),
              } as TreeLayer;
              break;
      
            default:
              layerData = {
                ...baseProps,
                type: LayerType.Rectangle,
              } as RectangleLayer;
          }
    
            liveLayerIds.push(newLayerId);
            liveLayers.set(newLayerId, new LiveObject(layerData));

            setMyPresence({ 
                selection: [newLayerId],
                pencilDraft: null 
            }, { addToHistory: true });
            
            setCurrentPoints(null);
            setLastFreehandId(null);
            setCanvasState({ mode: CanvasMode.None });
        },
        [lastUsedColor, currentPoints, lastFreehandId]
    );

    /*
    const keepFreehandDrawing = useMutation(
        ({ storage, self, setMyPresence }) => {
            const { pencilDraft } = self.presence;
            if (!pencilDraft || pencilDraft.length < 2) {
                setMyPresence({ pencilDraft: null });
                setCurrentPoints(null);
                setCanvasState({ mode: CanvasMode.None });
                return;
            }
    
            const liveLayers = storage.get("layers");
            const liveLayerIds = storage.get("layerIds");
            
            if (liveLayers.size >= MAX_LAYERS) {
                return;
            }
    
            const id = nanoid();
            liveLayers.set(
                id,
                new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor))
            );
            liveLayerIds.push(id);
    
            setMyPresence({
                pencilDraft: null,
                selection: [id]
            }, { addToHistory: true });
            
            setCurrentPoints(null);
            setCanvasState({ mode: CanvasMode.None });
        },
        [lastUsedColor]
    );*/
    
    
    const resizeSelectedLayer = useMutation(
        ({ storage, self }, point: Point) => {
            if (canvasState.mode !== CanvasMode.Resizing) {
                return;
            }

            const bounds = resizeBounds(
                canvasState.initialBounds,
                canvasState.corner,
                point
            );

            const liveLayers = storage.get("layers");
            const layer = liveLayers.get(self.presence.selection[0]);

            if (layer) {
                layer.update(bounds);
            }
        },
        [canvasState]
    );

    const onResizeHandlePointerDown = useCallback(
        (corner: Side, initialBounds: XYWH) => {
            history.pause();
            setCanvasState({
                mode: CanvasMode.Resizing,
                initialBounds,
                corner,
            });
        },
        [history]
    );

    const onWheel = useCallback((e: React.WheelEvent) => {
        setCamera((camera) => {
            return {
                x: camera.x - e.deltaX,
                y: camera.y - e.deltaY,
            };
        });
    }, []);

    const onPointerMove = useMutation(
        ({ setMyPresence }, e: React.PointerEvent) => {
            e.preventDefault();
            const current = pointerEventToCanvasPoint(e, camera);
    
            // Handle drawing if in pencil mode and pointer is down
            if (canvasState.mode === CanvasMode.Pencil && isPencilDown) {
                continueDrawing(current, e);
                return;
            }
    
            // Handle other pointer events
            if (canvasState.mode === CanvasMode.Pressing) {
                startMultiSelection(current, canvasState.origin);
            } else if (canvasState.mode === CanvasMode.SelectionNet) {
                updateSelectionNet(current, canvasState.origin);
            } else if (canvasState.mode === CanvasMode.Translating) {
                translateSelectedLayers(current);
            } else if (canvasState.mode === CanvasMode.Resizing) {
                resizeSelectedLayer(current);
            }
    
            setMyPresence({ cursor: current });
        },
        [
            camera,
            canvasState.mode,
            isPencilDown,
            continueDrawing,
            startMultiSelection,
            updateSelectionNet,
            translateSelectedLayers,
            resizeSelectedLayer,
        ]
    );
    
    const onPointerLeave = useMutation(({ setMyPresence }) => {
        setMyPresence({ cursor: null });
    }, []);

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault();
            if (canvasState.mode === CanvasMode.Inserting) {
                return;
            }
    
            const point = pointerEventToCanvasPoint(e, camera);
    
            if (canvasState.mode === CanvasMode.Pencil) {
                setIsPencilDown(true);
                startDrawing(point, e.pressure || 0.5);
                return;
            }
    
            setCanvasState({ mode: CanvasMode.Pressing, origin: point });
        },
        [camera, canvasState.mode, setCanvasState, startDrawing]
    );
    const onPointerUp = useMutation(
        ({ storage, self, setMyPresence }, e: React.PointerEvent) => {
            e.preventDefault();
            const point = pointerEventToCanvasPoint(e, camera);
    
            if (canvasState.mode === CanvasMode.Pencil) {
                const { pencilDraft } = self.presence;
                setIsPencilDown(false);
    
                if (!pencilDraft || pencilDraft.length < 2) {
                    setMyPresence({ pencilDraft: null });
                    setCurrentPoints(null);
                    return;
                }
    
                try {
                    // Create the freehand drawing immediately
                    const id = nanoid();
                    const liveLayers = storage.get("layers");
                    const liveLayerIds = storage.get("layerIds");
    
                    if (liveLayers.size >= MAX_LAYERS) {
                        return;
                    }
    
                    liveLayers.set(
                        id,
                        new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor))
                    );
                    liveLayerIds.push(id);
    
                    setMyPresence(
                        {
                            selection: [id],
                            pencilDraft: null
                        },
                        { addToHistory: true }
                    );
    
                    if (pencilDraft.length > 5) {
                        const points = pencilDraft.map(([x, y]) => [x, y]);
                        setCurrentPoints(points);
                        setLastFreehandId(id);
                    } else {
                        setCurrentPoints(null);
                        setLastFreehandId(null);
                    }
                } catch (error) {
                    console.error("Error in pencil up:", error);
                    setMyPresence({ pencilDraft: null });
                    setCurrentPoints(null);
                    setLastFreehandId(null);
                }
            } else {
                if (canvasState.mode === CanvasMode.Pressing) {
                    unSelectLayers();
                } else if (canvasState.mode === CanvasMode.Inserting) {
                    insertLayer(canvasState.layerType, point);
                }
                
                // Move state reset outside of pencil condition
                setCanvasState({ mode: CanvasMode.None });
            }
    
            history.resume();
        },
        [
            camera,
            canvasState,
            history,
            insertLayer,
            unSelectLayers,
            lastUsedColor,
        ]
    );

    const selections = useOthersMapped((other) => other.presence.selection);

    const onLayerPointerDown = useMutation(
        ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
            if (
                canvasState.mode === CanvasMode.Pencil ||
                canvasState.mode === CanvasMode.Inserting
            ) {
                return;
            }

            history.pause();
            e.stopPropagation();

            const point = pointerEventToCanvasPoint(e, camera);

            if (!self.presence.selection.includes(layerId)) {
                setMyPresence({ selection: [layerId] }, { addToHistory: true });
            }

            setCanvasState({ mode: CanvasMode.Translating, current: point });
        },
        [setCanvasState, history, camera, canvasState.mode]
    );

    const layerIdsToColorSelection = useMemo(() => {
        const layerIdsToColorSelection: Record<string, string> = {};
        for (const user of selections) {
            const [connectionId, selection] = user;
            for (const layerId of selection) {
                layerIdsToColorSelection[layerId] =
                    connectionIdToColor(connectionId);
            }
        }
        return layerIdsToColorSelection;
    }, [selections]);

    const duplicateLayers = useMutation(({ storage, self, setMyPresence }) => {
        const liveLayers = storage.get("layers");
        const liveLayerIds = storage.get("layerIds");
        const newLayerIds: string[] = [];
        const layersIdsToCopy = self.presence.selection;

        if (liveLayerIds.length + layersIdsToCopy.length > MAX_LAYERS) {
            return;
        }

        if (layersIdsToCopy.length === 0) {
            return;
        }

        layersIdsToCopy.forEach((layerId) => {
            const newLayerId = nanoid();
            const layer = liveLayers.get(layerId);

            if (layer) {
                const newLayer = layer.clone();
                newLayer.set("x", newLayer.get("x") + 10);
                newLayer.set("y", newLayer.get("y") + 10);

                liveLayerIds.push(newLayerId);
                liveLayers.set(newLayerId, newLayer);

                newLayerIds.push(newLayerId);
            }
        });

        setMyPresence({ selection: [...newLayerIds] }, { addToHistory: true });
        setCanvasState({ mode: CanvasMode.None });
    }, []);

    const moveSelectedLayers = useMutation(
        ({ storage, self, setMyPresence }, offset: Point) => {
            const liveLayers = storage.get("layers");
            const selection = self.presence.selection;

            if (selection.length === 0) {
                return;
            }

            for (const id of selection) {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({
                        x: layer.get("x") + offset.x,
                        y: layer.get("y") + offset.y,
                    });
                }
            }

            setMyPresence({ selection }, { addToHistory: true });
        },
        [canvasState, history]
    );

    const svgRef = useRef<SVGSVGElement | null>(null);
    const data = useQuery(api.board.get, { id: boardId as Id<"boards"> });

    const exportAsPng = () => {
        if (svgRef.current) {
            const bbox = svgRef.current.getBBox();
            const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;

            svgClone.setAttribute("width", bbox.width.toString());
            svgClone.setAttribute("height", bbox.height.toString());
            svgClone.setAttribute(
                "viewBox",
                `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
            );

            document.body.appendChild(svgClone);

            toPng(svgClone as unknown as HTMLElement)
                .then((dataUrl) => {
                    const link = document.createElement("a");
                    link.href = dataUrl;
                    link.download = `${data?.title || "download"}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    document.body.removeChild(svgClone);
                })
                .catch((error) => {
                    console.error("Error exporting SVG to PNG", error);
                    document.body.removeChild(svgClone);
                });
        }
    };

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            let offset: Point = { x: 0, y: 0 };
            switch (e.key) {
                case "d": {
                    if (e.ctrlKey && canvasState.mode === CanvasMode.None) {
                        duplicateLayers();
                    }
                    break;
                }
                case "z": {
                    if (e.ctrlKey || e.metaKey) {
                        if (e.shiftKey) {
                            history.redo();
                        } else {
                            history.undo();
                        }
                        break;
                    }
                }
                case "ArrowUp":
                    offset = { x: 0, y: -MOVE_OFFSET };
                    moveSelectedLayers(offset);
                    break;
                case "ArrowDown":
                    offset = { x: 0, y: MOVE_OFFSET };
                    moveSelectedLayers(offset);
                    break;
                case "ArrowLeft":
                    offset = { x: -MOVE_OFFSET, y: 0 };
                    moveSelectedLayers(offset);
                    break;
                case "ArrowRight":
                    offset = { x: MOVE_OFFSET, y: 0 };
                    moveSelectedLayers(offset);
                    break;
                default:
                    break;
            }
        }

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [history]);

    return (
        <main className="h-full w-full relative bg-neutral-100 touch-none">
            <Info boardId={boardId} exportAsPng={exportAsPng} />
            <Participants />
            <Toolbar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                canUndo={canUndo}
                canRedo={canRedo}
                undo={history.undo}
                redo={history.redo}
                toggleGrid={toggleGrid}
                toggleDots={toggleDots} // Pass the new function
            />
            {camera.x != 0 && camera.y != 0 && (
                <ResetCamera resetCamera={resetCamera} />
            )}

{canvasState.mode === CanvasMode.Pencil && currentPoints && currentPoints.length > 5 && (
            <AutoDrawSuggestions
                points={currentPoints}
                onSelectShape={handleShapeSelection}
                camera={camera}
                onKeepFreehand={() => {
                    setCurrentPoints(null);
                    setLastFreehandId(null);
                }}
            />
        )}
            <SelectionTools
                onDuplicate={duplicateLayers}
                camera={camera}
                setLastUsedColor={setLastUsedColor}
                lastUsedColor={lastUsedColor}
            />
            
            <svg
                ref={svgRef}
                className="h-[100vh] w-[100vw]"
                onWheel={onWheel}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                onPointerUp={onPointerUp}
                onPointerDown={onPointerDown}
            style={{ touchAction: 'none' }}
            >
                <g style={{ transform: `translate(${camera.x}px, ${camera.y}px)` }}>
                    {/* Render grid if showGrid is true */}
                    {showGrid && (
                        <g className="grid-overlay">
                            {Array.from({ length: 200 }, (_, i) => (
                                <line
                                    key={`v-${i}`}
                                    x1={i * 50}
                                    y1={0}
                                    x2={i * 50}
                                    y2={5000}
                                    stroke="black"
                                    strokeWidth={0.5}
                                />
                            ))}
                            {Array.from({ length: 200 }, (_, i) => (
                                <line
                                    key={`h-${i}`}
                                    x1={0}
                                    y1={i * 50}
                                    x2={5000}
                                    y2={i * 50}
                                    stroke="black"
                                    strokeWidth={0.5}
                                />
                            ))}
                        </g>
                    )}
                    {showDots && ( // Conditional rendering for dots
    <g className="dots-overlay">
        {Array.from({ length: 200 }, (_, rowIndex) => (
            Array.from({ length: 200 }, (_, colIndex) => (
                <circle
                    key={`dot-${rowIndex}-${colIndex}`}
                    cx={colIndex * 50} // Adjust the spacing as needed
                    cy={rowIndex * 50} // Adjust the spacing as needed
                    r={2} // Radius of the dots
                    fill="black" // Color of the dots
                />
            ))
        ))}
    </g>
)}
                    {layerIds.map((layerId) => (
                        <LayerPreview
                            key={layerId}
                            id={layerId}
                            onLayerPointerDown={onLayerPointerDown}
                            selectionColor={layerIdsToColorSelection[layerId]}
                        />
                    ))}
                    <SelectionBox
                        onResizeHandlePointerDown={onResizeHandlePointerDown}
                    />
                    {canvasState.mode === CanvasMode.SelectionNet &&
                        canvasState.current && (
                            <rect
                                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                                x={Math.min(
                                    canvasState.origin.x,
                                    canvasState.current.x
                                )}
                                y={Math.min(
                                    canvasState.origin.y,
                                    canvasState.current.y
                                )}
                                width={Math.abs(
                                    canvasState.origin.x - canvasState.current.x
                                )}
                                height={Math.abs(
                                    canvasState.origin.y - canvasState.current.y
                                )}
                            />
                        )}
                    <CursorsPresence />
                    {pencilDraft && pencilDraft.length > 0 && (
                        <Path
                            points={pencilDraft}
                            fill={colorToCss(lastUsedColor)}
                            x={0}
                            y={0}
                        />
                    )}
                </g>
            </svg>
        </main>
                
    );
};
    