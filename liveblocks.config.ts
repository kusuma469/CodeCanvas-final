import {
  createClient,
  LiveList,
  LiveMap,
  LiveObject,
  JsonObject,
} from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { Layer, Color } from "./types/canvas";

export interface UserAwareness {
  user: {
    name: string;
    color: string;
    id: string;
    picture?: string;
  };
}

export type AwarenessList = [number, UserAwareness][];

export const client = createClient({
  throttle: 16,
  authEndpoint: "/api/liveblocks-auth",
});

// Define CompilationState as a valid LSON object
interface CompilationState extends JsonObject {
  output: string;
  compiledBy: string;
  timestamp: number;
}

type Presence = {
  cursor: { x: number; y: number } | null;
  selection: string[];
  pencilDraft: [x: number, y: number, pressure: number][] | null;
  pencilColor: Color | null;
  codeSelection: {
    start: number;
    end: number;
  } | null;
  codeLanguage: string | null;
  cursorAwareness: {
    name: string;
    color: string;
    id: string;
    picture?: string;
  } | null;
};

type Storage = {
  layers: LiveMap<string, LiveObject<Layer>>;
  layerIds: LiveList<string>;
  codeContent?: LiveObject<{
    content: string;
    language: string;
  }>;
  compilationState: LiveObject<CompilationState>;
};

type UserMeta = {
  id: string;
  info: {
    name: string;
    picture?: string;
  };
};

type RoomEvent = {
  type: "CODE_CHANGE" | "LANGUAGE_CHANGE" | "COMPILATION_UPDATE";
  content?: string;
  language?: string;
  compilationState?: CompilationState;
};

declare global {
  interface Liveblocks {
    Presence: Presence;
    Storage: Storage;
    UserMeta: UserMeta;
    RoomEvent: RoomEvent;
    ThreadMetadata: Record<string, never>;
    RoomInfo: Record<string, never>;
  }
}

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useStorage,
  useMutation,
  useHistory,
  useCanUndo,
  useCanRedo,
} = createRoomContext(client);

export type { Room } from "@liveblocks/client";