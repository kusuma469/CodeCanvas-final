// CloudIcon.tsx
import { colorToCss } from "@/lib/utils";
import { CameraLayer } from "@/types/canvas";

interface CameraIconProps {
    id: string;
    layer: CameraLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const CameraIcon = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: CameraIconProps) => {
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
            <rect
                x={10}
                y={20}
                width={80}
                height={60}
                rx={5}
                fill={fill ? colorToCss(fill) : "#000"}
                stroke={selectionColor || "transparent"}
            />
            <circle
                cx={50}
                cy={50}
                r={20}
                fill="none"
                stroke={selectionColor || "transparent"}
            />
            <rect
                x={30}
                y={20}
                width={40}
                height={10}
                fill={fill ? colorToCss(fill) : "#000"}
            />
        </g>
    );
};
