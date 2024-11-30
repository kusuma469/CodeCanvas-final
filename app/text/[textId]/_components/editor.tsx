"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  FloatingComposer,
  AnchoredThreads,
  liveblocksConfig,
  LiveblocksPlugin,
  useEditorStatus,
  FloatingThreads,
} from "@liveblocks/react-lexical";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { LinkNode } from "@lexical/link";
import EnhancedToolbar from './toolbar';
import FloatingToolbar from "./floating-toolbar";
import SpellCheckPlugin from "./spellcheck-plugin";
//import NotificationsPopover from "../notifications-popover";
import Loading from "../loading";
//import VersionHistoryDialog from "../version-history-dialog";
import { useThreads } from "@liveblocks/react/suspense";
import { useIsMobile } from "./use-is-mobile";
//import { MentionsPlugin } from "./mentions-plugin";
import { useState, useCallback } from 'react';
import { FormEvent } from 'react';

// Simulated mention detection function
function detectMentions(text: string) {
  const mentionPattern = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionPattern.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}

const initialConfig = liveblocksConfig({
  namespace: "Demo",
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    TableNode,
    TableRowNode,
    TableCellNode
  ],
  theme: {
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
      strikethrough: 'line-through',
      code: 'font-mono bg-gray-100 rounded-md px-1',
    },
    heading: {
      h1: 'text-3xl font-bold',
      h2: 'text-2xl font-bold',
      h3: 'text-xl font-bold',
    },
  },
  onError: (error) => {
    console.error(error);
  },
});
//import { Participants } from "@/app/board/[boardId]/_components/participants";
export default function Editor() {
  const [content, setContent] = useState('');
  console.log(content)
  const status = useEditorStatus();
  //const { threads } = useThreads();

  const handleChange = useCallback((e: FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const newContent = target.innerText;
    setContent(newContent);

    const mentions = detectMentions(newContent);
    if (mentions.length > 0) {
      mentions.forEach(mention => {
        console.log(`User ${mention} was mentioned.`);
        // Add logic to create notifications here
      });
    }
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col">
      <LexicalComposer initialConfig={initialConfig}>
        <LiveblocksPlugin>
          {status === "not-loaded" || status === "loading" ? (
            <Loading />
          ) : (
            <div className="relative flex flex-col h-full">
    
              <div className="h-auto border-b border-border/80 bg-background">
                <EnhancedToolbar />
              </div>

              <div className="relative flex flex-row justify-between w-full py-16 xl:pl-[250px] pl-[100px] gap-[50px]">
                <div className="relative flex flex-1">
                  <RichTextPlugin
                    contentEditable={
                      <ContentEditable
                        className="outline-none flex-1 transition-all"
                        onInput={handleChange}
                      />
                    }
                    placeholder={
                      <p className="pointer-events-none absolute top-0 left-0 text-muted-foreground w-full h-full">
                        Start typing...
                      </p>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                  />

                  <FloatingComposer className="w-[350px]" />
                  <FloatingToolbar />
                  <SpellCheckPlugin />
                </div>

                <div className="xl:[&:not(:has(.lb-lexical-anchored-threads))]:pr-[200px] [&:not(:has(.lb-lexical-anchored-threads))]:pr-[50px]">
                  <Threads />
                </div>
              </div>

              {/* Core Plugins */}
              <HistoryPlugin />
              <TablePlugin />
              <LinkPlugin />
              <ListPlugin />
            </div>
          )}
          
        </LiveblocksPlugin>
      </LexicalComposer>
    </div>
  );
}

function Threads() {
  const { threads } = useThreads();
  const isMobile = useIsMobile();

  return isMobile ? (
    <FloatingThreads threads={threads} />
  ) : (
    <AnchoredThreads
      threads={threads}
      className="w-[350px] xl:mr-[100px] mr-[50px]"
    />
  );
}