// CloudIcon.tsx
import { colorToCss } from "@/lib/utils";
import { CarLayer } from "@/types/canvas";

interface CarIconProps {
    id: string;
    layer: CarLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const CarIcon = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: CarIconProps) => {
    const { x, y,  fill } = layer;

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
                d="M10,50 L20,30 L80,30 L90,50 L90,70 L10,70 Z"
                fill={fill ? colorToCss(fill) : "#000"}
                stroke={selectionColor || "transparent"}
            />
            <circle cx={30} cy={70} r={10} fill={fill ? colorToCss(fill) : "#000"} />
            <circle cx={70} cy={70} r={10} fill={fill ? colorToCss(fill) : "#000"} />
        </g>
    );
};