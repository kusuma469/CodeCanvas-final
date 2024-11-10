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
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [roomLink, setRoomLink] = useState<string | null>(null);

  // Convex mutations and queries
  const createRoom = useApiMutation(api.textEditor.create);
  const saveFile = useMutation(api.files.save);
  const fileInfo = useQuery(api.files.get, { boardId: id });

  // Load data from database
  useEffect(() => {
    if (fileInfo) {
      setCurrentFileName(fileInfo.title || null);
      setFileData(fileInfo.content || null);
      setRoomLink(fileInfo.roomLink || null);
    }
  }, [fileInfo]);

  // Handle file change
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile || !organization || !user) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        
        // Save to database
        await saveFile({
          boardId: id,
          orgId: organization.id,
          title: selectedFile.name,
          content: content,
          roomLink: null,
          authorId: user.id,
        });

        setCurrentFileName(selectedFile.name);
        setFileData(content);
      };
      reader.readAsText(selectedFile);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file');
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
        title: currentFileName || "Untitled Room",
      });

      const newRoomLink = `/text/${roomId}`;
      
      // Update database with room link
      await saveFile({
        boardId: id,
        orgId: organization.id,
        title: currentFileName!,
        content: fileData!,
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
  }, [organization, user, createRoom, currentFileName, fileData, id, router, saveFile]);

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
      {currentFileName ? (
        <g>
          <text 
            x={10} 
            y={25} 
            fill="black" 
            fontSize={12}
            className="truncate"
            textAnchor="start"
          >
            {currentFileName}
          </text>
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
      ) : (
        <foreignObject x={10} y={10} width={130} height={30}>
          <input
            type="file"
            accept=".txt,.md,.js,.ts,.jsx,.tsx,.json,.csv"
            onChange={handleFileChange}
            className="w-full h-full bg-transparent border-none cursor-pointer"
          />
        </foreignObject>
      )}
    </g>
  );
}