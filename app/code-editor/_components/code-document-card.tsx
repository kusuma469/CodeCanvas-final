"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import {  MoreHorizontal } from "lucide-react";
import { CodeActions } from "@/components/code-actions";
import { Overlay } from "./overlay";

interface CodeDocumentCardProps {
    id: string;
    title: string;
    authorName?: string;
    authorId: string;
    createdAt: number;
    language: string;
    imageUrl: string;
    orgId: string;
}

export const CodeDocumentCard = ({
    id,
    title,
    authorId,
    authorName,
    createdAt,
    language,
    imageUrl,
    //orgId,
}: CodeDocumentCardProps) => {
    const { userId } = useAuth();
    const authorLabel = userId === authorId ? "You" : (authorName || "Unknown User");
    const createdAtLabel = formatDistanceToNow(createdAt, {
        addSuffix: true,
    });

    return (
        <Link href={`/editor/${id}`}>
            <div className="group aspect-[100/127] border rounded-lg flex flex-col justify-between overflow-hidden">
                <div className="relative flex-1 bg-neutral-100">
                    <Image
                        src={imageUrl}
                        alt={`${language} icon`}
                        fill
                        className="object-contain p-5"
                    />
                    <Overlay />
                    <CodeActions
                        id={id}
                        title={title}
                        side="right"
                    >
                        <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 outline-none">
                            <MoreHorizontal
                                className="text-white opacity-75 hover:opacity-100 transition-opacity"
                                size={24}
                            />
                        </button>
                    </CodeActions>
                </div>
                <div className="relative bg-white p-3">
                    <p className="text-[13px] truncate max-w-[calc(100%-20px)]">
                        {title}
                    </p>
                    <p className="opacity-50 text-[11px] text-muted-foreground truncate">
                        {authorLabel}, {createdAtLabel}
                    </p>
                </div>
            </div>
        </Link>
    );
};

// Add Skeleton component
CodeDocumentCard.Skeleton = function CodeDocumentCardSkeleton() {
    return (
        <div className="aspect-[100/127] rounded-lg overflow-hidden">
            <div className="w-full h-full bg-muted animate-pulse" />
        </div>
    );
};