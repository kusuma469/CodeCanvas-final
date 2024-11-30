"use client";

//import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface NewDocumentButtonProps {
    orgId: string;
    disabled?: boolean;
}

export const NewDocumentButton = ({
    orgId,
    disabled,
}: NewDocumentButtonProps) => {
    //const router = useRouter();
    const create = useMutation(api.codeDocument.create);

    const onCreate = async () => {
        try {
            const documentId = await create({
                orgId,
                title: "Untitled",
                language: "python",
            });
            console.log(documentId)
            // documentId is directly the ID string from Convex
            //router.push(`/code-editor/${documentId}`);
            toast.success("Code document created");
        } catch (error) {
            toast.error("Failed to create code document");
            console.log(error)
        }
    };

    return (
        <Button
            disabled={disabled}
            onClick={onCreate}
            className="col-span-1 aspect-[100/127] h-full w-full bg-blue-600 hover:bg-blue-800 flex flex-col items-center justify-center py-6"
        >
            <div className="flex flex-col items-center gap-y-1">
                <Plus className="h-10 w-10" />
                <p className="text-sm">New code document</p>
            </div>
        </Button>
    );
};