import { colorToCss } from "@/lib/utils";
import { SunLayer } from "@/types/canvas";

interface SunIconProps {
    id: string;
    layer: SunLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}


export const SunIcon = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: SunIconProps) => {
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
            <circle
                cx={width/2}
                cy={height/2}
                r={width/3}
                fill={fill ? colorToCss(fill) : "#000"}
                stroke={selectionColor || "transparent"}
            />
            {[...Array(8)].map((_, i) => (
                <line
                    key={i}
                    x1={width/2}
                    y1={height/2}
                    x2={width/2 + Math.cos(i * Math.PI/4) * width/2}
                    y2={height/2 + Math.sin(i * Math.PI/4) * height/2}
                    stroke={fill ? colorToCss(fill) : "#000"}
                    strokeWidth={2}
                />
            ))}
        </g>
    );
};