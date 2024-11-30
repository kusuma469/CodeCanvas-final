
// CloudIcon.tsx
import { colorToCss } from "@/lib/utils";
import { HeartLayer } from "@/types/canvas";

interface HeartIconProps {
    id: string;
    layer: HeartLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const HeartIcon = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: HeartIconProps) => {
    const { x, y,  fill } = layer;

    return (
        <path
            className="drop-shadow-md"
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                transform: `translate(${x}px, ${y}px)`,
                position: "absolute",
            }}
            d="M50,80 L20,50 A20,20 0,0,1 50,20 A20,20 0,0,1 80,50 L50,80"
            strokeWidth={1}
            fill={fill ? colorToCss(fill) : "#000"}
            stroke={selectionColor || "transparent"}
            vectorEffect="non-scaling-stroke"
        />
    );
};