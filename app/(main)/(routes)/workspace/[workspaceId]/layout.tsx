"use client"

import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import Loader from "@/components/Loader"
import WorkspaceNavigation from "./_components/workspace-navigation"

interface WorkspaceLayoutProps {
    children: React.ReactNode
}

const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
    const params = useParams()
    const workspaceId = params.workspaceId as Id<"workspaces">
    
    const workspace = useQuery(api.workspaces.getById, {
        workspaceId
    })

    if (workspace === undefined) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    if (workspace === null) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Workspace not found</h2>
                    <p className="text-muted-foreground">The workspace you're looking for doesn't exist.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex">
            <WorkspaceNavigation workspace={workspace} />
            <main className="flex-1 h-full overflow-y-auto">
                {children}
            </main>
        </div>
    )
}

export default WorkspaceLayout