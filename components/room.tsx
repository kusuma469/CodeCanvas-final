// components/room.tsx

"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LiveMap, LiveObject, LiveList } from "@liveblocks/client";
import { Layer } from "@/types/canvas";
// import { Storage, ChatMessage } from "@/types/storage";

interface RoomProps {
    children: ReactNode;
    roomId: string;
    fallback: NonNullable<ReactNode> | null;
    type?: "whiteboard" | "code";
}

export const Room = ({ children, roomId, fallback, type = "whiteboard" }: RoomProps) => {
  console.log("[Room] Initializing with:", { roomId, type });
  
  const getInitialPresence = () => {
    const basePresence = {
      cursor: null,
      selection: [],
      pencilDraft: null,
      pencilColor: null,
      codeSelection: null,
      codeLanguage: null,
      cursorAwareness: null
    };

    return type === "code" 
      ? {
          ...basePresence,
          codeSelection: null,
          codeLanguage: "typescript",
        }
      : basePresence;
  };

  const getInitialStorage = () => {
    const baseStorage = {
      layers: new LiveMap<string, LiveObject<Layer>>(),
      layerIds: new LiveList<string>([]),
      messages: new LiveList([]), // Initialize with empty array
      compilationState: new LiveObject({
        output: "",
        compiledBy: "",
        timestamp: Date.now(),
      })
    };

    return type === "code"
      ? {
          ...baseStorage,
          codeContent: new LiveObject({
            content: "",
            language: "typescript",
          }),
          compilationState: new LiveObject({
            output: "",
            compiledBy: "",
            timestamp: Date.now(),
          }),
          messages: new LiveList([])  // Adding messages support for code type
        }
      : baseStorage;
  };

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={getInitialPresence()}
        initialStorage={getInitialStorage()}
      >
        <ClientSideSuspense fallback={fallback}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};