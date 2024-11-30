import { colorToCss } from "@/lib/utils";
import { HouseLayer } from "@/types/canvas";

interface HouseIconProps {
    id: string;
    layer: HouseLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const HouseIcon = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: HouseIconProps) => {
    const { x, y, fill } = layer;

    return (
        <g
            className="drop-shadow-md"
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                transform: `translate(${x}px, ${y}px)`,
                position: "absolute",
            }}
        >
            <path
                d="M10,50 L50,10 L90,50 L80,50 L80,90 L20,90 L20,50 Z"
                fill={fill ? colorToCss(fill) : "#000"}
                stroke={selectionColor || "transparent"}
            />
            <rect
                x={40}
                y={60}
                width={20}
                height={30}
                fill={selectionColor || "transparent"}
                stroke={fill ? colorToCss(fill) : "#000"}
            />
        </g>
    );
};