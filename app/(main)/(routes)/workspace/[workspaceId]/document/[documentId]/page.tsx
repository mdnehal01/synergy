"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useState } from "react"
import Loader from "@/components/Loader"
import Cover from "@/components/cover"
import Toolbar from "@/app/(main)/_components/toolbar"
import Editor from "@/app/(main)/_components/Editor"
import EditModeToggle from "@/app/(main)/_components/edit-mode-toggle"
import { Button } from "@/components/ui/button"

const WorkspaceDocumentPage = () => {
    const params = useParams()
    const documentId = params.documentId as Id<"documents">
    const workspaceId = params.workspaceId as Id<"workspaces">
    
    const [isEditMode, setIsEditMode] = useState(false)
    
    const document = useQuery(api.documents.getById, { documentId })
    const workspace = useQuery(api.workspaces.getById, { workspaceId })
    const update = useMutation(api.documents.update)

    const router = useRouter();
    
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
                    <p className="text-muted-foreground">The document you&apos;re looking for doesn&apos;t exist.</p>
                </div>
            </div>
        )
    }

    if (workspace === null) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Workspace not found</h2>
                    <p className="text-muted-foreground">The workspace you&apos;re looking for doesn&apos;t exist.</p>
                </div>
            </div>
        )
    }

    // Verify document belongs to workspace
    if (document.workspaceId !== workspaceId) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="text-6xl">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Document not in workspace
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    This document doesn&apos;t belong to the current workspace.
                </p>
                <div className="flex gap-4 mt-6">
                    <Button
                        onClick={() => router.push(`/workspace/${workspaceId}`)}
                        className="bg-theme-green hover:bg-theme-lightgreen"
                    >
                        Go to Workspace
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="pb-40 relative">
            <EditModeToggle 
                isEditMode={isEditMode}
                onToggle={toggleEditMode}
                showFlowToggle={true}
                showFlowEditor={showFlowEditor}
                onFlowToggle={toggleFlowEditor}
            />
            
            <Cover url={document.coverImage} preview={!isEditMode} />
            
            <div className="md:max-w-5xl lg:max-w-6xl mx-auto w-full">
                <Toolbar initialData={document} preview={!isEditMode} />
                <Editor
                    onChange={onChange}
                    onFlowChange={onFlowChange}
                    initialContent={document.content}
                    initialFlowData={document.flowData}
                    editable={isEditMode}
                    showFlowEditor={showFlowEditor}
                />
            </div>
        </div>
    )
}

export default WorkspaceDocumentPage