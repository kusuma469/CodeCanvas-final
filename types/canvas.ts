// types/canvas.ts

export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Camera = {
  x: number;
  y: number;
};

export enum LayerType {
  Rectangle,
  Ellipse,
  Path,
  Text,
  Note,
  File,
  Bike,
  Camera,
  Car,
  Cloud,
  Computer,
  Heart,
  House,
  Moon,
  Music,
  Phone,
  Star,
  Sun,
  Tree

}

// Add these new type definitions
export type Coordinates = [x: number, y: number, pressure: number];
export type PencilDraft = Coordinates[];

export type Point = {
  x: number;
  y: number;
  pressure?: number;
};

// Rest of your existing types...
export type RectangleLayer = {
  type: LayerType.Rectangle;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type EllipseLayer = {
  type: LayerType.Ellipse;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type BikeLayer = {
  type: LayerType.Bike;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type CameraLayer = {
  type: LayerType.Camera;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type CloudLayer = {
  type: LayerType.Cloud;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type ComputerLayer = {
  type: LayerType.Computer;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type HeartLayer = {
  type: LayerType.Heart;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type HouseLayer = {
  type: LayerType.House;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type MoonLayer = {
  type: LayerType.Moon;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type MusicLayer = {
  type: LayerType.Music;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type PhoneLayer = {
  type: LayerType.Phone;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type StarLayer = {
  type: LayerType.Star;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type SunLayer = {
  type: LayerType.Sun;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type TreeLayer = {
  type: LayerType.Tree;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type CarLayer = {
  type: LayerType.Car;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};
export type FileLayer = {
  type: LayerType.File;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
  fileName?: string;
  fileUrl?: string;
};

export type PathLayer = {
  type: LayerType.Path;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  points: number[][];
  value?: string;
};

export type TextLayer = {
  type: LayerType.Text;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type NoteLayer = {
  type: LayerType.Note;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type XYWH = {
  x: number;
  y: number;
  height: number;
  width: number;
};

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
}

export type CanvasState =
  | {
        mode: CanvasMode.None;
    }
  | {
        mode: CanvasMode.SelectionNet;
        origin: Point;
        current?: Point;
    }
  | {
        mode: CanvasMode.Translating;
        current: Point;
    }
  | {
        mode: CanvasMode.Inserting;
        layerType:
            | LayerType.Ellipse
            | LayerType.Rectangle
            | LayerType.Text
            | LayerType.Note
            | LayerType.File
            | LayerType.Bike
            | LayerType.Camera
            | LayerType.Car
            | LayerType.Cloud
            | LayerType.Computer
            | LayerType.Star
            | LayerType.Sun
            | LayerType.Heart
            | LayerType.House
            | LayerType.Moon
            | LayerType.Music
            | LayerType.Tree
            | LayerType.Phone;
            fileLink?: string;
    }
  | {
        mode: CanvasMode.Pencil;
    }
  | {
        mode: CanvasMode.Pressing;
        origin: Point;
    }
  | {
        mode: CanvasMode.Resizing;
        initialBounds: XYWH;
        corner: Side;
    }
  

export enum CanvasMode {
  None = "None",
  Pressing = "Pressing",
  SelectionNet = "SelectionNet",
  Translating = "Translating",
  Inserting = "Inserting",
  Resizing = "Resizing",
  Pencil = "Pencil"
}

export type Layer =
  | RectangleLayer
  | EllipseLayer
  | PathLayer
  | TextLayer
  | NoteLayer
  | FileLayer
  | BikeLayer
  | CameraLayer
  | CarLayer
  | CloudLayer
  | ComputerLayer
  | HeartLayer
  | HouseLayer
  | MoonLayer
  | MusicLayer
  | PhoneLayer
  | StarLayer
  | SunLayer
  | TreeLayer;