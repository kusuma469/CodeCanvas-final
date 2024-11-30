/*import { useLexicalComposerContext, } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect } from "react";
import { TextNode, $getSelection, $isRangeSelection } from "lexical";
import { useRoom } from "@liveblocks/react";
//import type { ThreadMetada } from "@liveblocks/client";

interface MentionMetadata extends ThreadMetadata {
  type: 'mention';
  text: string;
  actor?: {
    name: string;
    avatar?: string;
  };
  mentionedUser: string;
}

export function MentionsPlugin() {
  const [editor] = useLexicalComposerContext();
  const room = useRoom();

  const handleMention = useCallback(
    async (text: string) => {
      const mentions = text.match(/@(\w+)/g);
      if (!mentions) return;

      const self = room.getSelf();
      
      for (const mention of mentions) {
        const username = mention.slice(1);
        const metadata: MentionMetadata = {
          type: 'mention',
          text: text,
          actor: self?.info ? {
            name: self.info.name || 'Anonymous',
            
          } : undefined,
          mentionedUser: username,
        };

        try {
          await room.createThread({ metadata });
        } catch (error) {
          console.error('Failed to create mention thread:', error);
        }
      }
    },
    [room]
  );

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const node = selection.anchor.getNode();
        if (node instanceof TextNode) {
          const text = node.getTextContent();
          handleMention(text);
        }
      });
    });
  }, [editor, handleMention]);

  return null;
}*/