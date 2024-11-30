// CloudIcon.tsx
import { colorToCss } from "@/lib/utils";
import { MusicLayer } from "@/types/canvas";

interface MusicIconProps {
    id: string;
    layer: MusicLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const MusicIcon = ({
    id,
    layer,
    onPointerDown,
    //selectionColor,
}: MusicIconProps) => {
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
            <circle 
                cx={20} 
                cy={70} 
                r={15} 
                fill={fill ? colorToCss(fill) : "#000"}
            />
            <circle 
                cx={70} 
                cy={60} 
                r={15} 
                fill={fill ? colorToCss(fill) : "#000"}
            />
            <path
                d="M35,70 L35,20 L85,10 L85,60"
                fill="none"
                stroke={fill ? colorToCss(fill) : "#000"}
                strokeWidth={3}
            />
        </g>
    );
};