//import { Canvas } from "./_components/canvas"
import { Room } from "@/components/room"
import { Loading } from "@/components/auth/loading"
import { teardownHeapProfiler } from "next/dist/build/swc"

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
            <Room roomId="j578vavw2g6cegqd0ejdjc925h736ac1" fallback={<Loading />}>
                <h1>hi</h1>
            </Room>
            
        </div>
        
    )
}

export default TextEditorPage