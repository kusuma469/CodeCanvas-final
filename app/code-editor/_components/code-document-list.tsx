"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NewDocumentButton } from "./new-document-button";
import { CodeDocumentCard } from "./code-document-card";
import { Id } from "@/convex/_generated/dataModel";

interface CodeDocument {
    _id: Id<"codeDocuments">;
    _creationTime: number;
    title: string;
    orgId: string;
    authorId: string;
    authorName?: string;
    language: string;
    imageUrl: string;
    lastModified: number;
    content?: string;
}

interface CodeDocumentListProps {
    orgId: string;
    query: {
        search?: string;
    };
}

const languageImages = {
    javascript: "/placeholders/1.svg",
    typescript: "/placeholders/1.svg",
    python: "/placeholders/1.svg",
    java: "/placeholders/1.svg",
    cpp: "/placeholders/1.svg",
    html: "/placeholders/1.svg",
    css: "/placeholders/1.svg",
    default: "/placeholders/1.svg",
};

export const CodeDocumentList = ({
    orgId,
    query,
}: CodeDocumentListProps) => {
    const data = useQuery(api.codeDocuments.get, { orgId });

    if (data === undefined) {
        return (
            <div>
                <h2 className="text-2xl">Code Documents</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
                    <NewDocumentButton orgId={orgId} disabled />
                    {[...Array(9)].map((_, index) => (
                        <CodeDocumentCard.Skeleton key={index} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-3xl">Code Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
                <NewDocumentButton orgId={orgId} disabled={false} />
                {data.map((doc) => (
                    <CodeDocumentCard
                        key={doc._id}
                        id={doc._id}
                        title={doc.title}
                        authorId={doc.authorId}
                        authorName={doc.authorName}
                        createdAt={doc._creationTime}
                        language={doc.language}
                        imageUrl={doc.imageUrl || languageImages[doc.language as keyof typeof languageImages] || languageImages.default}
                        orgId={doc.orgId}
                    />
                ))}
            </div>
        </div>
    );
};