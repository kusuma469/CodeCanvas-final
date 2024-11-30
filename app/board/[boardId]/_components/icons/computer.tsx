// CloudIcon.tsx
import { colorToCss } from "@/lib/utils";
import { ComputerLayer } from "@/types/canvas";

interface ComputerIconProps {
    id: string;
    layer: ComputerLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const ComputerIcon = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: ComputerIconProps) => {
    const { x, y, width, height, fill } = layer;

    return (
        <g
            className="drop-shadow-md"
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                transform: `translate(${x}px, ${y}px)`,
                position: "absolute",
            }}
        >
            <rect
                x={width * 0.1}
                y={height * 0.2}
                width={width * 0.8}
                height={height * 0.5}
                fill={fill ? colorToCss(fill) : "#000"}
                stroke={selectionColor || "transparent"}
            />
            <rect
                x={width * 0.3}
                y={height * 0.7}
                width={width * 0.4}
                height={height * 0.1}
                fill={fill ? colorToCss(fill) : "#000"}
            />
            <rect
                x={width * 0.2}
                y={height * 0.8}
                width={width * 0.6}
                height={height * 0.05}
                fill={fill ? colorToCss(fill) : "#000"}
            />
        </g>
    );
};