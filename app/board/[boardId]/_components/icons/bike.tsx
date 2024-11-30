// CloudIcon.tsx
import { colorToCss } from "@/lib/utils";
import { BikeLayer } from "@/types/canvas";

interface BikeIconProps {
    id: string;
    layer: BikeLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const BikeIcon = ({
    id,
    layer,
    onPointerDown,
    //selectionColor,
}: BikeIconProps) => {
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
            <circle cx={25} cy={75} r={20} fill="none" stroke={fill ? colorToCss(fill) : "#000"} />
            <circle cx={75} cy={75} r={20} fill="none" stroke={fill ? colorToCss(fill) : "#000"} />
            <path
                d="M25,75 L50,25 L75,75 L50,50 L25,75"
                fill="none"
                stroke={fill ? colorToCss(fill) : "#000"}
                strokeWidth={2}
            />
        </g>
    );
};