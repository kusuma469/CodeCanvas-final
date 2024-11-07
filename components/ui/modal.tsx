// components/editor-modal.tsx
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

interface EditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const EditorModal = ({
    isOpen,
    onClose,
    children
}: EditorModalProps) => {
    const onChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onChange}>
            <DialogContent className="max-w-[80vw] w-[80vw] h-[80vh]">
                {children}
            </DialogContent>
        </Dialog>
    );
};