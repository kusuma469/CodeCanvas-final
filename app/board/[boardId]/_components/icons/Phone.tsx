// CloudIcon.tsx
import { colorToCss } from "@/lib/utils";
import { PhoneLayer } from "@/types/canvas";

interface PhoneIconProps {
    id: string;
    layer: PhoneLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const PhoneIcon = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: PhoneIconProps) => {
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
                x={width * 0.2}
                y={height * 0.1}
                width={width * 0.6}
                height={height * 0.8}
                rx={width * 0.1}
                fill={fill ? colorToCss(fill) : "#000"}
                stroke={selectionColor || "transparent"}
            />
            <circle
                cx={width * 0.5}
                cy={height * 0.8}
                r={width * 0.08}
                fill={selectionColor || "transparent"}
                stroke={fill ? colorToCss(fill) : "#000"}
            />
        </g>
    );
};