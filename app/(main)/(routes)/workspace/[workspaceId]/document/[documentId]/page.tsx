"use client"

import { useParams } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useState } from "react"
import Loader from "@/components/Loader"
import Cover from "@/components/cover"
import Toolbar from "@/app/(main)/_components/toolbar"
import Editor from "@/app/(main)/_components/Editor"
import EditModeToggle from "@/app/(main)/_components/edit-mode-toggle"

const WorkspaceDocumentPage = () => {
    const params = useParams()
    const documentId = params.documentId as Id<"documents">
    const workspaceId = params.workspaceId as Id<"workspaces">
    
    const [isEditMode, setIsEditMode] = useState(false)
    
    const document = useQuery(api.documents.getById, { documentId })
    const workspace = useQuery(api.workspaces.getById, { workspaceId })
    const update = useMutation(api.documents.update)
    
    const onChange = (content: string) => {
        if (!isEditMode) return
        
        update({
            id: documentId,
            content
        })
    }

    const toggleEditMode = () => {
        setIsEditMode(prev => !prev)
    }

    if (document === undefined || workspace === undefined) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    if (document === null) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Document not found</h2>
                    <p className="text-muted-foreground">The document you're looking for doesn't exist.</p>
                </div>
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

    // Verify document belongs to workspace
    if (document.workspaceId !== workspaceId) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Document not in workspace</h2>
                    <p className="text-muted-foreground">This document doesn't belong to the current workspace.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="pb-40 relative">
            <EditModeToggle 
                isEditMode={isEditMode}
                onToggle={toggleEditMode}
            />
            
            <Cover url={document.coverImage} preview={!isEditMode} />
            
            <div className="md:max-w-5xl lg:max-w-6xl mx-auto w-full">
                <Toolbar initialData={document} preview={!isEditMode} />
                <Editor
                    onChange={onChange}
                    initialContent={document.content}
                    editable={isEditMode}
                />
            </div>
        </div>
    )
}

export default WorkspaceDocumentPage