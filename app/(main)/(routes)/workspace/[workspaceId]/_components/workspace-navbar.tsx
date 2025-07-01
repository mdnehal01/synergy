"use client"

import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WorkspaceNavbarProps {
    isCollapsed: boolean
    onResetWidth: () => void
}

const WorkspaceNavbar = ({ isCollapsed, onResetWidth }: WorkspaceNavbarProps) => {
    const params = useParams()
    const workspaceId = params.workspaceId as Id<"workspaces">
    const documentId = params.documentId as Id<"documents"> | undefined
    
    const workspace = useQuery(api.workspaces.getById, { workspaceId })
    const document = documentId ? useQuery(api.documents.getById, { documentId }) : null

    if (!workspace) {
        return (
            <nav className='bg-neutral-100 dark:bg-theme-lightgreen px-3 py-2 w-full flex items-center'>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </nav>
        )
    }

    return (
        <nav className='bg-neutral-100 dark:bg-theme-lightgreen px-3 py-2 w-full flex items-center gap-x-4'>
            {isCollapsed && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onResetWidth}
                    className='h-6 w-6 text-neutral-600 hover:text-theme-green transition-colors'
                >
                    <MenuIcon className="h-6 w-6" />
                </Button>
            )}

            <div className='flex items-center gap-x-2'>
                <span className="text-lg">{workspace.icon || '📁'}</span>
                <span className="font-medium text-neutral-700">{workspace.name}</span>
                
                {document && (
                    <>
                        <span className="text-neutral-400">/</span>
                        <div className="flex items-center gap-x-1">
                            {document.icon && <span>{document.icon}</span>}
                            <span className="text-neutral-600">{document.title}</span>
                        </div>
                    </>
                )}
            </div>
        </nav>
    )
}

export default WorkspaceNavbar