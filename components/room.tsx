"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";


interface RoomProps {
    children: ReactNode
    roomId: string
    fallback: NonNullable<ReactNode> | null
}

export const Room = ({ children,roomId,fallback }: RoomProps) => {
  return (
    <LiveblocksProvider publicApiKey={"pk_dev_T-lUtyvBXrSbjUKn_U7X2d8LFOTLr3Ywgk3RiLJNsPikYgtrqQB-Tsbk49Yp-bIN"}>
      <RoomProvider id={roomId}>
        <ClientSideSuspense fallback={fallback}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}