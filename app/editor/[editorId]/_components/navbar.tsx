// app/editor/[editorId]/_components/navbar.tsx
"use client";

import { useQuery } from "convex/react";
import { Menu } from "lucide-react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { EditorView } from "@codemirror/view";
import * as Y from "yjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Hint } from "@/components/hint";
import { CodeActions } from "@/components/code-actions";
import { useCodeRenameModal } from "@/store/use-code-rename-modal";
//import { Participants } from "./participants";
import { Avatar } from "@/components/ui/avatar";
import { Toolbar } from "./Toolbar";

interface NavbarProps {
  documentId: string;
  editorInstance?: EditorView;
  yUndoManager?: Y.UndoManager;
}

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

const TabSeparator = () => {
  return <div className="text-neutral-300 px-1.5">|</div>;
};

export const Navbar = ({ documentId, yUndoManager }: NavbarProps) => {
  const { onOpen } = useCodeRenameModal();
  const document = useQuery(api.codeDocument.get, { 
    id: documentId as Id<"codeDocuments">
  });

  if (!document) return <NavbarSkeleton />;

  return (
    <nav className="h-14 w-full border-b border-neutral-700 bg-neutral-900 px-4 flex items-center justify-between">
      <div className="flex items-center gap-x-4">
        <Hint label="Go to documents" side="bottom" sideOffset={10}>
          <Button asChild className="px-2" variant="ghost">
            <Link href="/code-editor">
              <Image
                src="/logo.svg"
                alt="Code Editor"
                height={40}
                width={40}
              />
              <span className={`font-semibold text-xl ml-2 text-white ${font.className}`}>
                Code
              </span>
            </Link>
          </Button>
        </Hint>
        <TabSeparator />
        <Hint label="Edit title" side="bottom" sideOffset={10}>
          <Button
            variant="ghost"
            className="text-base font-normal px-2 text-white"
            onClick={() => onOpen(document._id, document.title)}
          >
            {document.title}
          </Button>
        </Hint>
        <TabSeparator />
        <CodeActions
          id={document._id}
          title={document.title}
          side="bottom"
          sideOffset={10}
        >
          <div>
            <Hint label="Main menu" side="bottom" sideOffset={10}>
              <Button size="icon" variant="board">
                <Menu className="text-white" />
              </Button>
            </Hint>
          </div>
        </CodeActions>
      </div>
      <div className="flex items-center gap-x-4">
        {yUndoManager && <Toolbar yUndoManager={yUndoManager} />}
        
        <Avatar />
      </div>
    </nav>
  );
};

export const NavbarSkeleton = () => {
  return (
    <nav className="h-14 w-full border-b border-neutral-700 bg-neutral-900 px-4">
      <div className="animate-shimmer bg-gradient-to-r from-neutral-700 via-neutral-600 to-neutral-700 bg-[length:200%_100%] h-full rounded-md" />
    </nav>
  );
};