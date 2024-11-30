// CloudIcon.tsx
import { colorToCss } from "@/lib/utils";
import { CloudLayer } from "@/types/canvas";

interface IconProps {
    id: string;
    layer: CloudLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const CloudIcon = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: IconProps) => {
    const { x, y, fill } = layer;

    return (
        <path
            className="drop-shadow-md"
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                transform: `translate(${x}px, ${y}px)`,
                position: "absolute",
            }}
            d="M25,45 C12,45 2,35 2,23 C2,11 12,1 25,1 C31,1 36,3 40,7 C42,3 46,1 51,1 C58,1 64,7 64,14 C64,15 64,16 64,17 C67,15 71,14 75,14 C86,14 95,23 95,34 C95,45 86,54 75,54 L25,45z"
            strokeWidth={1}
            fill={fill ? colorToCss(fill) : "#000"}
            stroke={selectionColor || "transparent"}
            vectorEffect="non-scaling-stroke"
        />
    );
};