"use client";

import { useStorage } from "@liveblocks/react/suspense";
import { LayerType } from "@/types/canvas";
import { memo } from "react";
import { Rectangle } from "./rectangle";
import { Ellipse } from "./ellipse";
import { Text } from "./text";
import { Note } from "./note";
import { Path } from "./path";
import { colorToCss } from "@/lib/utils";
import { File } from "./file";
import { BikeIcon } from "./icons/bike";
import { CameraIcon } from "./icons/camera";
import { CarIcon } from "./icons/car";
import { CloudIcon } from "./icons/cloud";
import { ComputerIcon } from "./icons/computer";
import { HeartIcon } from "./icons/heart";
import { HouseIcon } from "./icons/house";
import { MoonIcon } from "./icons/moon";
import { MusicIcon } from "./icons/music";
import { PhoneIcon } from "./icons/Phone";
import { StarIcon } from "./icons/star";
import { SunIcon } from "./icons/sun";
import { TreeIcon } from "./icons/tree";
interface LayerPreviewProps {
    id: string;
    onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
    selectionColor?: string;
}

export const LayerPreview = memo(
    ({ id, onLayerPointerDown, selectionColor }: LayerPreviewProps) => {
        const layer = useStorage((root) => root.layers.get(id));
        if (!layer) return null;

        switch (layer.type) {
            case LayerType.Path:
                return (
                    <Path
                        points={layer.points}
                        onPointerDown={(e) => onLayerPointerDown(e, id)}
                        x={layer.x}
                        y={layer.y}
                        fill={layer.fill ? colorToCss(layer.fill) : "#000"}
                        stroke={selectionColor}
                    />
                );
            case LayerType.Note:
                return (
                    <Note
                        id={id}
                        layer={layer}
                        onPointerDown={onLayerPointerDown}
                        selectionColor={selectionColor}
                    />
                );
            case LayerType.Text:
                return (
                    <Text
                        id={id}
                        layer={layer}
                        onPointerDown={onLayerPointerDown}
                        selectionColor={selectionColor}
                    />
                );
            case LayerType.Ellipse:
                return (
                    <Ellipse
                        id={id}
                        layer={layer}
                        onPointerDown={onLayerPointerDown}
                        selectionColor={selectionColor}
                    />
                );
            case LayerType.Rectangle:
                return (
                    <Rectangle
                        id={id}
                        layer={layer}
                        onPointerDown={onLayerPointerDown}
                        selectionColor={selectionColor}
                    />
                );
            case LayerType.File:
                return (
                        <File
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                );
                case LayerType.Bike:
                    return (
                        <BikeIcon
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                    );
                
                case LayerType.Camera:
                    return (
                        <CameraIcon
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                    );
                
                case LayerType.Car:
                    return (
                        <CarIcon
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                    );
                
                case LayerType.Cloud:
                    return (
                        <CloudIcon
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                    );
                
                case LayerType.Computer:
                    return (
                        <ComputerIcon
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                    );
                
                case LayerType.Heart:
                    return (
                        <HeartIcon
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                    );
                
                case LayerType.House:
                    return (
                        <HouseIcon
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                    );
                
                case LayerType.Moon:
                    return (
                        <MoonIcon
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                    );
                
                case LayerType.Music:
                    return (
                        <MusicIcon
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                    );
                
                case LayerType.Phone:
                    return (
                        <PhoneIcon
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                    );
                
                case LayerType.Star:
                    return (
                        <StarIcon
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                    );
                
                case LayerType.Sun:
                    return (
                        <SunIcon
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                    );
                
                case LayerType.Tree:
                    return (
                        <TreeIcon
                            id={id}
                            layer={layer}
                            onPointerDown={onLayerPointerDown}
                            selectionColor={selectionColor}
                        />
                    );
                
            default:
                console.log(layer);
                console.warn("Unsupported layer type");
        }
    }
);

LayerPreview.displayName = "LayerPreview";