import { Room } from "@/components/room";
import { CollaborativeEditor } from "@/app/code-editor/j57bcxz2w9v55dvvqnpva44xb973cd6v/_components/CollaborativeEditor";
import Loading from "@/app/text-editor/j57bfp99v64qj8n95sv3t7t9x1737w0c/loading";
export default function Home() {
  return (
    <main>
      <Room roomId="j57bcxz2w9v55dvvqnpva44xb973cd6v" fallback = {<Loading />}>
        <CollaborativeEditor />
      </Room>
    </main>
  );
}
