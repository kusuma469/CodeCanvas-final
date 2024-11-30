// CloudIcon.tsx
import { colorToCss } from "@/lib/utils";
import { TreeLayer } from "@/types/canvas";

interface TreeIconProps {
    id: string;
    layer: TreeLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const TreeIcon = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: TreeIconProps) => {
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
                d="M50,10 L80,50 L65,50 L85,80 L15,80 L35,50 L20,50 Z"
                fill={fill ? colorToCss(fill) : "#000"}
                stroke={selectionColor || "transparent"}
            />
            <rect
                x={40}
                y={80}
                width={20}
                height={20}
                fill={fill ? colorToCss(fill) : "#000"}
            />
        </g>
    );
};