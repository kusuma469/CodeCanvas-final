// CloudIcon.tsx
import { colorToCss } from "@/lib/utils";
import { MoonLayer } from "@/types/canvas";

interface MoonIconProps {
    id: string;
    layer: MoonLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const MoonIcon = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: MoonIconProps) => {
    const { x, y,  fill } = layer;

    return (
        <path
            className="drop-shadow-md"
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                transform: `translate(${x}px, ${y}px)`,
                position: "absolute",
            }}
            d="M50 10 A40 40 0 1 1 50 90 A30 30 0 1 0 50 10"
            strokeWidth={1}
            fill={fill ? colorToCss(fill) : "#000"}
            stroke={selectionColor || "transparent"}
            vectorEffect="non-scaling-stroke"
        />
    );
};