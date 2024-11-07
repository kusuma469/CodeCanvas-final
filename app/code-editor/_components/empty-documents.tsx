import Image from "next/image";

export const EmptyDocuments = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <Image
                src="/empty.svg"
                height={200}
                width={200}
                alt="Empty"
            />
            <h2 className="text-2xl font-semibold mt-6">
                No code documents found!
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
                Create your first code document to get started
            </p>
        </div>
    );
};