import React, { useState, useEffect } from 'react';
import { 
    Circle, Square, Triangle, Star, Heart, 
    ArrowRight, Cloud, Sun, Moon, 
     Computer, Smartphone,
    Car, Bike, Trees, Home,
    Music, Camera
} from 'lucide-react';

interface ShapeDefinition {
    id: string;
    name: string;
    icon: React.ReactNode;
    matcher: (metrics: ShapeMetrics) => number;
}

interface ShapeMetrics {
    aspectRatio: number;
    turns: number;
    sharpCorners: number;
    totalDistance: number;
    isClosedShape: boolean;
    boundingBoxArea: number;
    pointSpread: number;
    startEndDistance: number;
    centerDistance: number;
    angleHistogram: number[];
}

const shapeLibrary: ShapeDefinition[] = [
    { 
        id: 'circle', 
        name: 'Circle', 
        icon: <Circle />,
        matcher: (metrics) => {
            const circleScore = 
                (Math.abs(metrics.aspectRatio - 1) < 0.2 ? 1 : 0) * 0.3 +
                (metrics.sharpCorners < 2 ? 1 : 0) * 0.3 +
                (metrics.isClosedShape ? 0.2 : 0) +
                (Math.abs(metrics.pointSpread - metrics.boundingBoxArea) < 0.1 ? 0.2 : 0);
            return circleScore;
        }
    },
    { 
        id: 'square', 
        name: 'Square', 
        icon: <Square />,
        matcher: (metrics) => {
            const squareScore = 
                (Math.abs(metrics.aspectRatio - 1) < 0.2 ? 1 : 0) * 0.3 +
                (metrics.sharpCorners === 4 ? 1 : 0) * 0.4 +
                (metrics.isClosedShape ? 0.3 : 0);
            return squareScore;
        }
    },
    {
        id: 'star',
        name: 'Star',
        icon: <Star />,
        matcher: (metrics) => {
            const starScore = 
                (metrics.sharpCorners >= 5 && metrics.sharpCorners <= 10 ? 1 : 0) * 0.4 +
                (metrics.turns >= 4 && metrics.turns <= 6 ? 1 : 0) * 0.3 +
                (metrics.isClosedShape ? 0.2 : 0) +
                (Math.abs(metrics.aspectRatio - 1) < 0.3 ? 0.1 : 0);
            return starScore;
        }
    },
    { 
        id: 'triangle', 
        name: 'Triangle', 
        icon: <Triangle />,
        matcher: (metrics) => {
            const triangleScore = 
                (metrics.sharpCorners === 3 ? 1 : 0) * 0.5 +
                (metrics.isClosedShape ? 0.3 : 0) +
                (metrics.turns === 2 ? 0.2 : 0);
            return triangleScore;
        }
    },
    { 
        id: 'heart', 
        name: 'Heart', 
        icon: <Heart />,
        matcher: (metrics) => {
            const heartScore = 
                (metrics.turns >= 2 && metrics.turns <= 4 ? 1 : 0) * 0.3 +
                (metrics.sharpCorners === 1 ? 1 : 0) * 0.3 +
                (metrics.isClosedShape ? 0.2 : 0) +
                (metrics.aspectRatio >= 0.8 && metrics.aspectRatio <= 1.2 ? 0.2 : 0);
            return heartScore;
        }
    },
    { 
        id: 'arrow', 
        name: 'Arrow', 
        icon: <ArrowRight />,
        matcher: (metrics) => {
            const arrowScore = 
                (metrics.sharpCorners >= 2 && metrics.sharpCorners <= 4 ? 1 : 0) * 0.4 +
                (!metrics.isClosedShape ? 0.3 : 0) +
                (metrics.aspectRatio > 1.5 ? 0.3 : 0);
            return arrowScore;
        }
    },
    {
        id: 'cloud',
        name: 'Cloud',
        icon: <Cloud />,
        matcher: (metrics) => {
            const cloudScore = 
                (metrics.sharpCorners < 2 ? 1 : 0) * 0.3 +
                (metrics.turns >= 2 && metrics.turns <= 5 ? 1 : 0) * 0.3 +
                (metrics.isClosedShape ? 0.2 : 0) +
                (metrics.aspectRatio >= 1.2 && metrics.aspectRatio <= 2 ? 0.2 : 0);
            return cloudScore;
        }
    },
    {
        id: 'sun',
        name: 'Sun',
        icon: <Sun />,
        matcher: (metrics) => {
            const sunScore = 
                (Math.abs(metrics.aspectRatio - 1) < 0.2 ? 1 : 0) * 0.3 +
                (metrics.sharpCorners >= 8 && metrics.sharpCorners <= 12 ? 1 : 0) * 0.3 +
                (metrics.isClosedShape ? 0.2 : 0) +
                (metrics.turns >= 7 && metrics.turns <= 11 ? 0.2 : 0);
            return sunScore;
        }
    },
    {
        id: 'moon',
        name: 'Moon',
        icon: <Moon />,
        matcher: (metrics) => {
            const moonScore = 
                (metrics.turns === 2 ? 1 : 0) * 0.4 +
                (metrics.sharpCorners === 0 ? 1 : 0) * 0.3 +
                (metrics.isClosedShape ? 0.2 : 0) +
                (metrics.aspectRatio >= 0.8 && metrics.aspectRatio <= 1.2 ? 0.1 : 0);
            return moonScore;
        }
    },
    {
        id: 'computer',
        name: 'Computer',
        icon: <Computer />,
        matcher: (metrics) => {
            const computerScore = 
                (metrics.sharpCorners >= 4 && metrics.sharpCorners <= 6 ? 1 : 0) * 0.4 +
                (metrics.isClosedShape ? 0.3 : 0) +
                (metrics.aspectRatio >= 1.2 && metrics.aspectRatio <= 1.8 ? 0.3 : 0);
            return computerScore;
        }
    },
    {
        id: 'phone',
        name: 'Phone',
        icon: <Smartphone />,
        matcher: (metrics) => {
            const phoneScore = 
                (metrics.sharpCorners === 4 ? 1 : 0) * 0.4 +
                (metrics.isClosedShape ? 0.3 : 0) +
                (metrics.aspectRatio >= 0.4 && metrics.aspectRatio <= 0.7 ? 0.3 : 0);
            return phoneScore;
        }
    },
    {
        id: 'car',
        name: 'Car',
        icon: <Car />,
        matcher: (metrics) => {
            const carScore = 
                (metrics.sharpCorners >= 4 && metrics.sharpCorners <= 8 ? 1 : 0) * 0.3 +
                (metrics.turns >= 4 && metrics.turns <= 8 ? 1 : 0) * 0.3 +
                (metrics.isClosedShape ? 0.2 : 0) +
                (metrics.aspectRatio >= 1.8 && metrics.aspectRatio <= 3 ? 0.2 : 0);
            return carScore;
        }
    },
    {
        id: 'bike',
        name: 'Bicycle',
        icon: <Bike />,
        matcher: (metrics) => {
            const bikeScore = 
                (metrics.sharpCorners >= 6 && metrics.sharpCorners <= 12 ? 1 : 0) * 0.3 +
                (!metrics.isClosedShape ? 0.3 : 0) +
                (metrics.turns >= 4 && metrics.turns <= 8 ? 0.2 : 0) +
                (metrics.aspectRatio >= 0.8 && metrics.aspectRatio <= 1.5 ? 0.2 : 0);
            return bikeScore;
        }
    },
    {
        id: 'tree',
        name: 'Tree',
        icon: <Trees />,
        matcher: (metrics) => {
            const treeScore = 
                (metrics.sharpCorners >= 3 && metrics.sharpCorners <= 7 ? 1 : 0) * 0.3 +
                (metrics.turns >= 4 && metrics.turns <= 8 ? 1 : 0) * 0.3 +
                (metrics.aspectRatio >= 0.4 && metrics.aspectRatio <= 0.8 ? 0.2 : 0) +
                (metrics.pointSpread > metrics.boundingBoxArea * 0.2 ? 0.2 : 0);
            return treeScore;
        }
    },
    {
        id: 'house',
        name: 'House',
        icon: <Home />,
        matcher: (metrics) => {
            const houseScore = 
                (metrics.sharpCorners >= 5 && metrics.sharpCorners <= 7 ? 1 : 0) * 0.4 +
                (metrics.isClosedShape ? 0.3 : 0) +
                (metrics.aspectRatio >= 0.8 && metrics.aspectRatio <= 1.2 ? 0.3 : 0);
            return houseScore;
        }
    },
    {
        id: 'music',
        name: 'Music',
        icon: <Music />,
        matcher: (metrics) => {
            const musicScore = 
                (metrics.sharpCorners >= 2 && metrics.sharpCorners <= 4 ? 1 : 0) * 0.3 +
                (!metrics.isClosedShape ? 0.3 : 0) +
                (metrics.turns >= 2 && metrics.turns <= 4 ? 0.2 : 0) +
                (metrics.aspectRatio >= 0.5 && metrics.aspectRatio <= 1 ? 0.2 : 0);
            return musicScore;
        }
    },
    {
        id: 'camera',
        name: 'Camera',
        icon: <Camera />,
        matcher: (metrics) => {
            const cameraScore = 
                (metrics.sharpCorners >= 4 && metrics.sharpCorners <= 8 ? 1 : 0) * 0.3 +
                (metrics.isClosedShape ? 0.3 : 0) +
                (metrics.turns >= 3 && metrics.turns <= 6 ? 0.2 : 0) +
                (metrics.aspectRatio >= 1.2 && metrics.aspectRatio <= 1.6 ? 0.2 : 0);
            return cameraScore;
        }
    }
];

const calculateShapeMetrics = (points: number[][]): ShapeMetrics => {
    // Calculate bounding box
    const [minX, maxX, minY, maxY] = points.reduce(
        ([minX, maxX, minY, maxY], [x, y]) => [
            Math.min(minX, x),
            Math.max(maxX, x),
            Math.min(minY, y),
            Math.max(maxY, y),
        ],
        [Infinity, -Infinity, Infinity, -Infinity]
    );

    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (maxX + minX) / 2;
    const centerY = (maxY + minY) / 2;

    // Calculate metrics
    let turns = 0;
    let sharpCorners = 0;
    let totalDistance = 0;
    const angleHistogram = new Array(8).fill(0);

    for (let i = 2; i < points.length; i++) {
        // Calculate angles between consecutive points
        const prev = points[i - 2];
        const curr = points[i - 1];
        const next = points[i];

        const angle1 = Math.atan2(curr[1] - prev[1], curr[0] - prev[0]);
        const angle2 = Math.atan2(next[1] - curr[1], next[0] - curr[0]);
        const angleDiff = Math.abs(angle2 - angle1);

        // Count sharp turns
        if (angleDiff > Math.PI / 4) {
            turns++;
            if (angleDiff > Math.PI / 2) {
                sharpCorners++;
            }
        }

        // Add to angle histogram
        const histogramIndex = Math.floor((angle2 + Math.PI) / (Math.PI / 4));
        angleHistogram[histogramIndex % 8]++;

        // Calculate distance
        const dist = Math.sqrt(
            Math.pow(next[0] - curr[0], 2) + Math.pow(next[1] - curr[1], 2)
        );
        totalDistance += dist;
    }

    // Calculate if shape is closed
    const startEndDistance = Math.sqrt(
        Math.pow(points[0][0] - points[points.length - 1][0], 2) +
        Math.pow(points[0][1] - points[points.length - 1][1], 2)
    );
    const isClosedShape = startEndDistance < totalDistance * 0.1;

    // Calculate point spread relative to center
    let pointSpread = 0;
    points.forEach(([x, y]) => {
        const distToCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        pointSpread += distToCenter;
    });
    pointSpread /= points.length;

    return {
        aspectRatio: width / height,
        turns,
        sharpCorners,
        totalDistance,
        isClosedShape,
        boundingBoxArea: width * height,
        pointSpread,
        startEndDistance,
        centerDistance: Math.sqrt(centerX * centerX + centerY * centerY),
        angleHistogram
    };
};

interface AutoDrawSuggestionsProps {
    points: number[][];
    onSelectShape: (shapeType: string) => void;
    camera: { x: number; y: number };
    onKeepFreehand: () => void;
}

const AutoDrawSuggestions = ({ 
    points,
    onSelectShape,
   // camera,
    onKeepFreehand
}: AutoDrawSuggestionsProps) => {
    const [suggestions, setSuggestions] = useState<Array<{ type: string; score: number }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (points && points.length > 5) {
            const metrics = calculateShapeMetrics(points);
            
            // Calculate scores for each shape
            const scores = shapeLibrary.map(shape => ({
                type: shape.id,
                score: shape.matcher(metrics)
            }));

            // Filter and sort by score
            const validSuggestions = scores
                .filter(result => result.score > 0.6)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

            setSuggestions(validSuggestions);
            setShowSuggestions(validSuggestions.length > 0);
        }
    }, [points]);

    if (!showSuggestions) return null;

    return (
        <div className="absolute top-[80px] left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 z-50">
            <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-gray-700 px-2">
                    Suggestions
                </div>
                <div className="flex flex-wrap gap-2 max-w-md">
                    {suggestions.map((shape, index) => {
                        const shapeInfo = shapeLibrary.find(s => s.id === shape.type);
                        return (
                            <button
                                key={index}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
                                onClick={() => onSelectShape(shape.type)}
                                style={{ pointerEvents: 'auto' }}
                                title={shapeInfo?.name}
                            >
                                <div className="w-6 h-6">
                                    {shapeInfo?.icon}
                                </div>
                                <span className="text-xs text-gray-600">
                                    {Math.round(shape.score * 100)}%
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                        onClick={() => {
                            onKeepFreehand();
                            setShowSuggestions(false);
                        }}
                        className="w-full text-sm text-gray-600 hover:bg-gray-100 py-1 rounded"
                        style={{ pointerEvents: 'auto' }}
                    >
                        Keep Freehand Drawing
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutoDrawSuggestions;