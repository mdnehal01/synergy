"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMediaQuery } from "usehooks-ts"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { 
    ChevronsLeft, 
    FileText, 
    Plus, 
    Search, 
    Settings,
    ArrowLeft,
    FolderOpen
} from "lucide-react"
import { toast } from "sonner"
import Item from "@/app/(main)/_components/Item"
import { DocumentList } from "@/app/(main)/_components/document-list"

interface WorkspaceNavigationProps {
    workspace: Doc<"workspaces">
}

const WorkspaceNavigation = ({ workspace }: WorkspaceNavigationProps) => {
    const params = useParams()
    const router = useRouter()
    const isMobile = useMediaQuery("(max-width: 768px)")
    
    const [isCollapsed, setIsCollapsed] = useState(isMobile)
    const [searchTerm, setSearchTerm] = useState("")
    
    const create = useMutation(api.documents.create)
    
    // Get documents for this workspace
    const documents = useQuery(api.documents.getByWorkspace, {
        workspaceId: workspace._id
    })

    useEffect(() => {
        if (isMobile) {
            setIsCollapsed(true)
        }
    }, [isMobile])

    const handleCreateNote = () => {
        const promise = create({ 
            title: "Untitled",
            workspaceId: workspace._id
        }).then((documentId) => {
            router.push(`/workspace/${workspace._id}/document/${documentId}`)
        })
        
        toast.promise(promise, {
            loading: "Creating a new note...",
            success: "New note created!",
            error: "Failed to create a new note."
        })
    }

    const handleDocumentClick = (documentId: string) => {
        router.push(`/workspace/${workspace._id}/document/${documentId}`)
    }

    const filteredDocuments = documents?.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) && !doc.isArchived
    )

    if (isCollapsed) {
        return (
            <div className="w-16 h-full bg-theme-green flex flex-col items-center py-4 border-r">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(false)}
                    className="text-white hover:bg-theme-lightgreen/20 mb-4"
                >
                    <FolderOpen className="h-5 w-5" />
                </Button>
                
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCreateNote}
                    className="text-white hover:bg-theme-lightgreen/20 mb-2"
                >
                    <Plus className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/documents')}
                    className="text-white hover:bg-theme-lightgreen/20"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <aside className={cn(
            "h-full bg-theme-green text-white flex flex-col border-r transition-all duration-300",
            "w-80"
        )}>
            {/* Header */}
            <div className="p-4 border-b border-theme-lightgreen/20">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xl">{workspace.icon || '📁'}</span>
                        <h2 className="font-semibold truncate">{workspace.name}</h2>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/documents')}
                            className="text-white hover:bg-theme-lightgreen/20 h-8 w-8"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(true)}
                            className="text-white hover:bg-theme-lightgreen/20 h-8 w-8"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {workspace.description && (
                    <p className="text-sm text-white/80 mb-3">{workspace.description}</p>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                    <Input
                        placeholder="Search notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-theme-lightgreen/10 border-theme-lightgreen/30 text-white placeholder:text-white/60 focus:border-theme-lightgreen"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-2">
                <Button
                    onClick={handleCreateNote}
                    className="w-full justify-start bg-theme-lightgreen hover:bg-white hover:text-theme-green text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                </Button>
            </div>

            <Separator className="bg-theme-lightgreen/20" />

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Notes ({filteredDocuments?.length || 0})
                    </h3>
                    
                    {documents === undefined ? (
                        // Loading state
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-8 bg-theme-lightgreen/20 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : filteredDocuments?.length === 0 ? (
                        // Empty state
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-white/40 mx-auto mb-3" />
                            <p className="text-sm text-white/60">
                                {searchTerm ? "No notes match your search" : "No notes in this workspace yet"}
                            </p>
                            {!searchTerm && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCreateNote}
                                    className="mt-2 text-white/80 hover:text-white hover:bg-theme-lightgreen/20"
                                >
                                    Create your first note
                                </Button>
                            )}
                        </div>
                    ) : (
                        // Documents list
                        <div className="space-y-1">
                            {filteredDocuments?.map((document) => (
                                <div
                                    key={document._id}
                                    onClick={() => handleDocumentClick(document._id)}
                                    className={cn(
                                        "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                                        "hover:bg-theme-lightgreen/20 hover:text-white",
                                        params.documentId === document._id && "bg-white text-theme-green"
                                    )}
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        {document.icon ? (
                                            <span className="text-sm">{document.icon}</span>
                                        ) : (
                                            <FileText className="h-4 w-4 shrink-0" />
                                        )}
                                        <span className="text-sm truncate">{document.title}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-theme-lightgreen/20">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-white/80 hover:text-white hover:bg-theme-lightgreen/20"
                >
                    <Settings className="h-4 w-4 mr-2" />
                    Workspace Settings
                </Button>
            </div>
        </aside>
    )
}

export default WorkspaceNavigation