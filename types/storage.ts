import { LiveMap, LiveObject, LiveList, JsonObject } from "@liveblocks/client";
import { Layer } from "@/types/canvas";

export interface ChatMessage extends JsonObject {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

export interface CompilationState extends JsonObject {
  output: string;
  compiledBy: string;
  timestamp: number;
}

export type Storage = {
  layers: LiveMap<string, LiveObject<Layer>>;
  layerIds: LiveList<string>;
  messages: LiveList<ChatMessage>;
  codeContent?: LiveObject<{
    content: string;
    language: string;
  }>;
  compilationState?: LiveObject<{
    output: string;
    compiledBy: string;
    timestamp: number;
  }>;
};