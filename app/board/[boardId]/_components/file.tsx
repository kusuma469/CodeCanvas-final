"use client";

import { useState, useEffect, useCallback } from "react";
import { FileLayer } from "@/types/canvas";
import { useOrganization, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

export interface FileProps {
  id: string;
  layer: FileLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const File = ({ id, layer, onPointerDown, selectionColor }: FileProps) => {
  const { x, y } = layer;
  const router = useRouter();
  const { organization } = useOrganization();
  const { user } = useUser();
  
  // State
  const [isEditing, setIsEditing] = useState(false);
  const [fileName, setFileName] = useState<string>("Untitled");
  const [roomLink, setRoomLink] = useState<string | null>(null);

  // Convex mutations and queries
  const createRoom = useApiMutation(api.textEditor.create);
  const saveFile = useMutation(api.files.save);
  const fileInfo = useQuery(api.files.get, { boardId: id });

  // Load data from database
  useEffect(() => {
    if (fileInfo) {
      setFileName(fileInfo.title || "Untitled");
      setRoomLink(fileInfo.roomLink || null);
    }
  }, [fileInfo]);

  // Handle file rename
  const handleRename = useCallback(async (newName: string) => {
    if (!organization || !user) return;

    try {
      await saveFile({
        boardId: id,
        orgId: organization.id,
        title: newName,
        content: "",  // Initialize with empty content
        roomLink: null,
        authorId: user.id,
      });

      setFileName(newName);
      setIsEditing(false);
      toast.success("File renamed");
    } catch (error) {
      console.error('Error renaming file:', error);
      toast.error("Failed to rename file");
    }
  }, [id, organization, user, saveFile]);

  // Create room
  const onCreateRoomClick = useCallback(async () => {
    if (!organization || !user) {
      toast.error("Organization or user not found");
      return;
    }

    try {
      const roomId = await createRoom.mutate({
        orgId: organization.id,
        title: fileName,
      });

      const newRoomLink = `/text/${roomId}`;
      
      // Update database with room link
      await saveFile({
        boardId: id,
        orgId: organization.id,
        title: fileName,
        content: "",
        roomLink: newRoomLink,
        authorId: user.id,
      });

      setRoomLink(newRoomLink);
      toast.success("Room created");
      router.push(newRoomLink);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error("Failed to create room");
    }
  }, [organization, user, createRoom, fileName, id, router, saveFile]);

  // Handle key press for rename input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = e.target as HTMLInputElement;
      const newName = input.value.trim();
      if (newName) {
        handleRename(newName);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <g
      className="drop-shadow-md cursor-pointer"
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <rect
        x={0}
        y={0}
        width={150}
        height={50}
        fill="#f4f4f4"
        strokeWidth={1}
        stroke={selectionColor || "transparent"}
        rx={4}
        ry={4}
      />
      <g>
        <foreignObject x={10} y={8} width={130} height={24}>
          {isEditing ? (
            <input
              type="text"
              defaultValue={fileName}
              autoFocus
              onBlur={(e) => {
                const newName = e.target.value.trim();
                if (newName) {
                  handleRename(newName);
                }
                setIsEditing(false);
              }}
              onKeyDown={handleKeyPress}
              className="w-full px-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full text-left text-sm truncate px-1 hover:bg-gray-100 rounded"
            >
              {fileName}
            </button>
          )}
        </foreignObject>
        <foreignObject x={10} y={30} width={130} height={20}>
          {roomLink ? (
            <a 
              href={roomLink}
              className="block w-full h-full bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors text-center leading-[20px]"
            >
              Open File
            </a>
          ) : (
            <button
              onClick={onCreateRoomClick}
              disabled={createRoom.pending}
              className="w-full h-full bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors disabled:opacity-50"
            >
              {createRoom.pending ? 'Creating...' : 'Create Room'}
            </button>
          )}
        </foreignObject>
      </g>
    </g>
  );
};