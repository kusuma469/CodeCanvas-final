// app/editor/[editorId]/page.tsx
import { Room } from "@/components/room";
import { Loading } from "./_components/loading";
import { EditorWithNav } from "./_components/editor-with-nav";

interface EditorPageProps {
  params: {
    editorId: string;
  };
}

const EditorPage = ({ params }: EditorPageProps) => {
  return (
    <div className="h-screen w-screen">
      <Room 
        roomId={params.editorId}
        fallback={<Loading />}
        type="code"
      >
        <EditorWithNav documentId={params.editorId} />
      </Room>
    </div>
  );
};

export default EditorPage;