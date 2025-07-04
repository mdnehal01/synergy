"use client"

import { useState, useEffect, useRef, ElementRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMediaQuery } from "usehooks-ts"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
    ChevronsLeft, 
    FileText, 
    Search, 
    Settings,
    ArrowLeft,
    FolderOpen
} from "lucide-react"
import { toast } from "sonner"
import { GrAdd, GrAddCircle } from 'react-icons/gr'
import { BiTrash } from 'react-icons/bi'
import Item from "@/app/(main)/_components/Item"
import TrashBox from "@/app/(main)/_components/trash-box"
import { useSearch } from "@/hooks/use-search"

interface WorkspaceNavigationProps {
    workspace: Doc<"workspaces">
}

interface WorkspaceDocumentListProps {
    parentDocumentId?: Id<"documents">
    level?: number
    workspaceId: Id<"workspaces">
}

const WorkspaceDocumentList = ({ parentDocumentId, level = 0, workspaceId }: WorkspaceDocumentListProps) => {
    const params = useParams()
    const router = useRouter()
    const reorderDocuments = useMutation(api.documents.reorderDocuments)
    
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})
    
    const onExpand = (documentId: string) => {
        setExpanded(prevExpanded => ({
            ...prevExpanded,
            [documentId]: !prevExpanded[documentId]
        }))
    }

    // Get all documents for this workspace
    const allDocuments = useQuery(api.documents.getByWorkspace, { workspaceId })
    
    // Filter documents by parent
    const documents = allDocuments?.filter(doc => 
        doc.parentDocument === parentDocumentId && !doc.isArchived
    ) || []

    const onRedirect = (documentId: string) => {
        router.push(`/workspace/${workspaceId}/document/${documentId}`)
    }

    const handleReorder = async (
        documentId: Id<"documents">, 
        targetId: Id<"documents">, 
        position: "before" | "after"
    ) => {
        try {
            await reorderDocuments({
                documentId,
                targetDocumentId: targetId,
                position
            })
            toast.success("Document reordered successfully!")
        } catch (error) {
            toast.error("Failed to reorder document")
            console.error("Reorder error:", error)
        }
    }

    // Helper function to check if a document has children
    const hasChildren = (documentId: Id<"documents">) => {
        return allDocuments?.some(doc => 
            doc.parentDocument === documentId && !doc.isArchived
        ) || false
    }

    if (allDocuments === undefined) {
        return (
            <>
                <Item.Skeleton level={level}/>
                {level === 0 && (
                    <>
                        <Item.Skeleton level={level}/>
                        <Item.Skeleton level={level}/>
                    </>
                )}
            </>
        )
    }

    return (
        <>
            <p 
                style={{ paddingLeft: level ? `${(level * 12) + 25}px` : undefined }}
                className={cn(
                    "hidden text-sm font-medium text-white/80",
                    expanded && "last:block",
                    level === 0 && 'hidden'
                )}
            >
                No pages inside
            </p>
            {documents.map((document) => (
                <div key={document._id}>
                    <Item
                        id={document._id}
                        onclick={() => onRedirect(document._id)}
                        label={document.title}
                        icon={<FileText size={12} className="mr-2"/>}
                        documentIcon={document.icon}
                        isActive={params.documentId === document._id}
                        level={level}
                        onExpand={() => onExpand(document._id)}
                        expanded={expanded[document._id]}
                        parentDocument={parentDocumentId}
                        workspaceId={workspaceId}
                        onReorder={handleReorder}
                    />
                    {expanded[document._id] && hasChildren(document._id) && (
                        <WorkspaceDocumentList
                            parentDocumentId={document._id}
                            level={level + 1}
                            workspaceId={workspaceId}
                        />
                    )}
                </div>
            ))}
        </>
    )
}

const WorkspaceNavigation = ({ workspace }: WorkspaceNavigationProps) => {
    const params = useParams()
    const router = useRouter()
    const isMobile = useMediaQuery("(max-width: 768px)")
    
    const isResizingRef = useRef(false)
    const sidebarRef = useRef<ElementRef<"aside">>(null)
    const navbarRef = useRef<ElementRef<"div">>(null)
    const [isResetting, setIsResetting] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(isMobile)
    
    const create = useMutation(api.documents.create)
    const search = useSearch()

    useEffect(() => {
        if (isMobile) {
            collapse()
        } else {
            resetWidth()
        }
    }, [isMobile])

    useEffect(() => {
        if (isMobile) {
            collapse()
        }
    }, [isMobile])

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizingRef.current) return
        let newWidth = e.clientX

        if (newWidth < 240) newWidth = 240
        if (newWidth > 480) newWidth = 480

        if (navbarRef.current && sidebarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`
            navbarRef.current.style.setProperty("left", `${newWidth}px`)
            navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`)
        }
    }

    const handleMouseUp = () => {
        isResizingRef.current = false
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()

        isResizingRef.current = true
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    const resetWidth = () => {
        if (navbarRef.current && sidebarRef.current) {
            setIsCollapsed(false)
            setIsResetting(true)

            sidebarRef.current.style.width = isMobile ? "100%" : "240px"
            navbarRef.current.style.setProperty(
                "width",
                isMobile ? "0" : "calc(100%-240px)"
            )
            
            navbarRef.current.style.setProperty(
                "left",
                isMobile ? "100%" : "240px"
            )

            setTimeout(() => setIsResetting(false), 300)
        }
    }
    
    const collapse = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(true)
            setIsResetting(true)
            sidebarRef.current.style.width = "0"
            navbarRef.current.style.setProperty("width", "100%")
            navbarRef.current.style.setProperty("left", "0")
            setTimeout(() => setIsResetting(false), 300)
        }
    }

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

    return (
        <>
            <aside 
                ref={sidebarRef} 
                className={cn(
                    'group/sidebar h-full bg-theme-green overflow-y-auto relative flex w-60 flex-col z-[99999] text-white',
                    isResetting && "transition-all duration-300 ease-in-out",
                    isMobile && "w-0"
                )}
            >
                <div 
                    onClick={collapse} 
                    role='button' 
                    className={cn(
                        'group/boox text-muted-foreground h-6 w-6 rounded-sm hover:bg-theme-lightgreen/20 hover:text-theme-lightgreen absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition-all',
                        isMobile && "opacity-100"
                    )}
                >
                    <ChevronsLeft className='h-6 w-6 text-white group-hover/boox:text-theme-lightgreen transition-colors'/>
                </div>

                <div>
                    {/* Workspace Header */}
                    <div className="px-3 py-2 border-b border-theme-lightgreen/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/documents')}
                                className="text-white hover:bg-theme-lightgreen/20 hover:text-theme-lightgreen p-1 h-auto"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back to Dashboard
                            </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{workspace.icon || '📁'}</span>
                            <h2 className="font-semibold truncate text-white">{workspace.name}</h2>
                        </div>
                        
                        {workspace.description && (
                            <p className="text-xs text-white/80 mb-2">{workspace.description}</p>
                        )}
                    </div>
                    
                    <Item
                        label='Search'
                        icon={<Search size={15} className='mr-2'/>}
                        isSearch
                        onclick={search.onOpen} 
                    />

                    <Item
                        label='Settings'
                        icon={<Settings size={15} className='mr-2'/>}
                        onclick={() => {}} 
                    />

                    <Item
                        onclick={handleCreateNote} 
                        label="New Page"
                        icon={<GrAddCircle className='shrink-0 h-[18px] mr-2'/>}
                    />
                </div>

                {/* Workspace Documents Section */}
                <div className='mt-4 border-t border-theme-lightgreen/20 pt-4'>
                    <div className="px-3 mb-2">
                        <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Workspace Notes
                        </h3>
                    </div>
                    
                    <WorkspaceDocumentList workspaceId={workspace._id} />
                    
                    <Item 
                        onclick={handleCreateNote} 
                        icon={<GrAdd className='h-[18px] mr-2'/>}
                        label='Add a page'
                    />

                    <Popover>
                        <PopoverTrigger className='mt-4 w-full'>
                            <Item 
                                label='Trash'
                                icon={<BiTrash className='h-[18px] mr-2'/>}
                            />
                        </PopoverTrigger>
                        <PopoverContent 
                            side={isMobile ? "bottom" : "right"}
                            className='p-0 w-72'
                        >
                            <TrashBox/>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Resize handle */}
                <div 
                    onMouseDown={handleMouseDown} 
                    className='opacity-0 
                        group-hover/sidebar:opacity-100 
                        transition cursor-ew-resize 
                        absolute h-full w-1 
                        bg-theme-lightgreen/50 hover:bg-theme-lightgreen right-0 
                        top-0'
                    onClick={resetWidth}
                />
            </aside>

            <div 
                className={cn(
                    'absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]', 
                    isResetting && "transition-all ease-in-out duration-300",
                    isMobile && "left-0 w-full"
                )} 
                ref={navbarRef}
            >
                {/* You can add a navbar here if needed */}
            </div>
        </>
    )
}

export default WorkspaceNavigation