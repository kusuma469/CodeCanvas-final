"use client";

import { useOrganization } from "@clerk/nextjs";
import { CodeDocumentList } from "./_components/code-document-list";
import { EmptyOrg } from "./_components/empty-org";

interface CodeEditorPageProps {
    searchParams: {
        search?: string;
    };
}

const CodeEditorPage = ({
    searchParams,
}: CodeEditorPageProps) => {
    const { organization } = useOrganization();
    
    return (
        <div className="flex-1 h-[calc(100%-80px)] p-6">
            {!organization ? (
                <EmptyOrg />
            ) : (
                <CodeDocumentList 
                    orgId={organization.id}
                    query={searchParams}
                />
            )}
        </div>
    );
};

export default CodeEditorPage;