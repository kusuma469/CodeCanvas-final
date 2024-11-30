//import { Canvas } from "./_components/canvas"
import { Room } from "@/components/room"
import { Loading } from "@/components/auth/loading"
//import { teardownHeapProfiler } from "next/dist/build/swc"
import Editor from "./_components/editor"
interface TextEditorPageProps {
    params: {
        roomId: string
    }
}

const TextEditorPage = ({
    params,
}: TextEditorPageProps) => {
    console.log(params.roomId)
    return (
        <div className="h-screen w-screen">
            <Room roomId="j57bfp99v64qj8n95sv3t7t9x1737w0c" fallback={<Loading />}>
                <Editor />
            </Room>
            
        </div>
        
    )
}

export default TextEditorPage