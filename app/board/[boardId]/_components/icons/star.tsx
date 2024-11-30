import { colorToCss } from "@/lib/utils";
import { StarLayer } from "@/types/canvas";

interface StarProps {
    id: string;
    layer: StarLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const StarIcon = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: StarProps) => {
    const { x, y, width, height, fill } = layer;

    // Calculate points for a 5-pointed star
    const generateStarPoints = () => {
        const centerX = width / 2;
        const centerY = height / 2;
        const outerRadius = Math.min(width, height) / 2;
        const innerRadius = outerRadius * 0.4; // Inner radius is 40% of outer radius
        const points = [];
        
        for (let i = 0; i < 10; i++) {
            // Angle for each point (in radians)
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            // Use outer radius for points and inner radius for indents
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const pointX = centerX + radius * Math.cos(angle);
            const pointY = centerY + radius * Math.sin(angle);
            points.push(`${pointX},${pointY}`);
        }
        
        return points.join(' ');
    };

    return (
        <polygon
            className="drop-shadow-md"
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                transform: `translate(${x}px, ${y}px)`,
                position: "absolute",
            }}
            points={generateStarPoints()}
            strokeWidth={1}
            fill={fill ? colorToCss(fill) : "#000"}
            stroke={selectionColor || "transparent"}
        />
    );
};