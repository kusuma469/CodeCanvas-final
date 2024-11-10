"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LiveMap, LiveObject, LiveList } from "@liveblocks/client";
import { Layer } from "@/types/canvas";


interface RoomProps {
    children: ReactNode
    roomId: string
    fallback: NonNullable<ReactNode> | null
}

export const Room = ({ children,roomId,fallback }: RoomProps) => {

  const initialPresence = {
  cursor: null,
  selection: [] as never[],
  pencilDraft: null,
  pencilColor: null,
  codeSelection: null,      
  codeLanguage: "javascript",  
  cursorAwareness: null,     
};
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={roomId} initialPresence={{cursor: null,
  selection: [] as never[],
  pencilDraft: null,
  pencilColor: null,
  codeSelection: null,      
  codeLanguage: "javascript",  
  cursorAwareness: null,}} initialStorage={{
                layers: new LiveMap<string, LiveObject<Layer>>(),
                layerIds: new LiveList<string>([]),
                
            }}>
        <ClientSideSuspense fallback={fallback}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}