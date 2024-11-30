import Editor from "./_components/editor"
import { Room } from "@/components/room"
import { Loading } from "@/components/auth/loading"
//import { useRouter } from "next/navigation"

interface TextPageProps {
    params: {
        textId: string
    }
}

const TextPage = ({
    params,
}: TextPageProps) => {
     
    console.log(params.textId)
  
    console.log('params.boardId',params.textId)
    return (
        <div className="h-screen w-screen">
            <Room roomId={params.textId} fallback={<Loading />}>
                <Editor />
            </Room>
            
        </div>
        
    )
}

export default TextPage