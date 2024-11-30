import { currentUser } from "@clerk/nextjs/server";
import {Liveblocks} from "@liveblocks/node"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"; 
import { auth } from "@clerk/nextjs/server"; 
import { Id } from "@/convex/_generated/dataModel";


const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!
 })


 export async function POST(request: Request) {
    try {
        const authorization = await auth();
        const user = await currentUser();

        if (!authorization || !user) {
            return new Response("Unauthorized", { status: 403 });
        }

        const { room } = await request.json();
        let isAuthorized = false;

        // Try to validate both board and code document access
        try {
            const board = await convex.query(api.board.get, {
                id: room as Id<"boards">
            });
            if (board?.orgId === authorization.orgId) {
                isAuthorized = true;
            }
        } catch {
            // If not a board, check if it's a code document
            try {
                const document = await convex.query(api.codeDocument.get, {
                    id: room as Id<"codeDocuments">
                });
                if (document?.orgId === authorization.orgId) {
                    isAuthorized = true;
                }
            } catch {
                try {
                    const document = await convex.query(api.textEditor.get, {
                        id: room as Id<"textEditor">
                    });
                    if (document?.orgId === authorization.orgId) {
                        isAuthorized = true;
                    }
            }   catch {}
        }}

        if (!isAuthorized) {
            return new Response("Unauthorized", { status: 403 });
        }

        const userInfo = {
            name: user.firstName || "Teammate",
            picture: user.imageUrl,
        };

        const session = liveblocks.prepareSession(
            user.id,
            { userInfo }
        );

        session.allow(room, session.FULL_ACCESS);

        const { status, body } = await session.authorize();
        return new Response(body, { status });

    } catch (error) {
        console.error("Auth error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}


