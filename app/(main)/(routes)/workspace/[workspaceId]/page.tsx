"use client"

import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, Calendar, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const WorkspacePage = () => {
    const params = useParams()
    const router = useRouter()
    const workspaceId = params.workspaceId as Id<"workspaces">
    
    const workspace = useQuery(api.workspaces.getById, { workspaceId })
    const documents = useQuery(api.documents.getByWorkspace, { workspaceId })
    const create = useMutation(api.documents.create)

    const handleCreateNote = () => {
        const promise = create({ 
            title: "Untitled",
            workspaceId: workspaceId
        }).then((documentId) => {
            router.push(`/workspace/${workspaceId}/document/${documentId}`)
        })
        
        toast.promise(promise, {
            loading: "Creating a new note...",
            success: "New note created!",
            error: "Failed to create a new note."
        })
    }

    const recentDocuments = documents?.filter(doc => !doc.isArchived)
        .sort((a, b) => b._creationTime - a._creationTime)
        .slice(0, 5)

    if (!workspace) {
        return null
    }

    return (
        <div className="h-full p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{workspace.icon || '📁'}</span>
                    <div>
                        <h1 className="text-3xl font-bold">{workspace.name}</h1>
                        {workspace.description && (
                            <p className="text-muted-foreground mt-1">{workspace.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created {formatDistanceToNow(new Date(workspace.createdAt), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {documents?.filter(doc => !doc.isArchived).length || 0} notes
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-theme-lightgreen" onClick={handleCreateNote}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Plus className="h-5 w-5 text-theme-green" />
                            Create New Note
                        </CardTitle>
                        <CardDescription>
                            Start writing a new document in this workspace
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Total Notes
                        </CardTitle>
                        <CardDescription>
                            <span className="text-2xl font-bold text-foreground">
                                {documents?.filter(doc => !doc.isArchived).length || 0}
                            </span>
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-600" />
                            Collaborators
                        </CardTitle>
                        <CardDescription>
                            <span className="text-2xl font-bold text-foreground">1</span>
                            <span className="text-sm text-muted-foreground ml-1">(You)</span>
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Recent Documents */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Notes</h2>
                    <Button variant="outline" onClick={handleCreateNote}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Note
                    </Button>
                </div>

                {recentDocuments && recentDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentDocuments.map((document) => (
                            <Card 
                                key={document._id}
                                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-theme-lightgreen"
                                onClick={() => router.push(`/workspace/${workspaceId}/document/${document._id}`)}
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2 truncate">
                                        {document.icon ? (
                                            <span>{document.icon}</span>
                                        ) : (
                                            <FileText className="h-4 w-4" />
                                        )}
                                        {document.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Updated {formatDistanceToNow(new Date(document._creationTime), { addSuffix: true })}
                                    </CardDescription>
                                </CardHeader>
                                {document.content && (
                                    <CardContent className="pt-0">
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {(() => {
                                                try {
                                                    const parsed = JSON.parse(document.content)
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    const firstBlock = parsed.find((block: any) => block.content)
                                                    
                                                    if (firstBlock?.content) {
                                                        // Handle case where content is an array of objects with text property
                                                        if (Array.isArray(firstBlock.content)) {
                                                            return firstBlock.content
                                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                                .map((item: any) => item.text || '')
                                                                .join('')
                                                                .trim() || "No content"
                                                        }
                                                        // Handle case where content is a string
                                                        if (typeof firstBlock.content === 'string') {
                                                            return firstBlock.content.trim() || "No content"
                                                        }
                                                    }
                                                    return "No content"
                                                } catch {
                                                    return "No content"
                                                }
                                            })()}
                                        </p>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-8 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Create your first note to get started with this workspace.
                        </p>
                        <Button onClick={handleCreateNote} className="bg-theme-green hover:bg-theme-lightgreen">
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Note
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default WorkspacePage