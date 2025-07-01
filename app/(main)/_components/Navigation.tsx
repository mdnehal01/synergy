"use client"
import { cn } from '@/lib/utils';
import { ChevronsLeft, MenuIcon, Search, Settings } from 'lucide-react'
import { useParams, usePathname, useRouter } from 'next/navigation';
import React, { ElementRef, MouseEvent, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts';
import UserItem from './UserItem';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { GrAdd, GrAddCircle } from 'react-icons/gr';
import Item from './Item';
import { toast } from 'sonner';
import { DocumentList } from './document-list';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BiTrash } from 'react-icons/bi';
import TrashBox from './trash-box';
import { useSearch } from '@/hooks/use-search';
import Navbar from './navbar';
import SettingsModal from './settings-modal';
import { Id } from '@/convex/_generated/dataModel';

const Navigation = ()  => {
    const pathname = usePathname();
    const router = useRouter();
    const isMobile = useMediaQuery("(max-width: 768px)")

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const documents = (api.documents.getsidebar);
    const create = useMutation(api.documents.create) 
    const moveDocument = useMutation(api.documents.moveDocument)

    const isResizingRef = useRef(false);
    const sidebarRef = useRef<ElementRef<"aside">>(null);
    const navbarRef = useRef<ElementRef<"div">>(null);
    const [isResetting, setIsResseting] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(isMobile); 
    const [dragOver, setDragOver] = useState(false)
    const params = useParams();
    const search = useSearch()
    const [showSettings, setShowSettings] = useState(false);

    
    useEffect(() => {
        if(isMobile){
            collapse()
        }else{
            resetWidth();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[isMobile])

    useEffect(() => {
        if(isMobile){
            collapse()
        }
    },[isMobile, pathname ])

    const handleMouseMove = (e:MouseEvent) => {
        if(!isResizingRef.current) return;
        let newWidth = e.clientX;

        if(newWidth < 240) newWidth=240;
        if(newWidth > 480) newWidth=480;

        if(navbarRef.current && sidebarRef.current){
            sidebarRef.current.style.width=`${newWidth}px`;
            navbarRef.current.style.setProperty("left", `${newWidth}px`)
            navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`)
        }
    }

    const handleMouseUp = () => {   
        isResizingRef.current = false;
        // @ts-expect-error err
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    }

    const handleMouseDown = (e : React.MouseEvent<HTMLDivElement,MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();

        isResizingRef.current = true;
        // @ts-expect-error err
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    } 

    const resetWidth = () => {
        if(navbarRef.current && sidebarRef.current){
            setIsCollapsed(false); 
            setIsResseting(true);

            sidebarRef.current.style.width = isMobile ? "100%" : "240px";
            navbarRef.current.style.setProperty(
                "width",
                isMobile ? "0" : "calc(100%-240px)"
            )
            
            navbarRef.current.style.setProperty(
                "left",
                isMobile ? "100%" : "240px "
            )

            setTimeout(() => setIsResseting(false), 300 )
        }
    }
    
    const collapse = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(true);
            setIsResseting(true);
            sidebarRef.current.style.width = "0";
            navbarRef.current.style. setProperty("width", "100%"); 
            navbarRef.current.style. setProperty("left", "0");
            setTimeout(() => setIsResseting(false), 300);
        }
    }

    const handleCreate = () => {
        const promise = create({ title:"Untitled" })
        .then((documentId) => router.push(`/documents/${documentId}`))
        toast.promise(promise, {
            loading: "Creating a new note...",
            success: "New note created!",
            error: "Failed to create a new note."
        })
    }

    // Handle drag and drop from workspace to main sidebar
    const handleMainSidebarDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        setDragOver(true)
    }

    const handleMainSidebarDragLeave = (e: React.DragEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const x = e.clientX
        const y = e.clientY
        
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOver(false)
        }
    }

    const handleMainSidebarDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragOver(false)
        
        const draggedId = e.dataTransfer.getData("text/plain") as Id<"documents">
        if (!draggedId) return

        try {
            let dragData
            try {
                dragData = JSON.parse(e.dataTransfer.getData("application/json"))
            } catch {
                dragData = { documentId: draggedId }
            }

            // Move document to main documents (remove from workspace)
            const promise = moveDocument({
                id: draggedId,
                targetParentId: undefined, // Make it top-level
                targetWorkspaceId: undefined // Remove from workspace
            })
            
            toast.promise(promise, {
                loading: "Moving document to main documents...",
                success: "Document moved to main documents successfully!",
                error: "Failed to move document to main documents"
            })
        } catch (error) {
            console.error("Main sidebar drop operation failed:", error)
            toast.error("Failed to move document to main documents")
        }
    }

    return (
        <>
            <aside 
                ref={sidebarRef} 
                className={cn(
                    'group/sidebar h-full bg-theme-green overflow-y-auto relative flex w-60 flex-col z-[99999] text-white',
                    isResetting && "transition-all duration-300 ease-in-out",
                    isMobile && "w-0",
                    dragOver && "bg-theme-lightgreen/20 border-r-4 border-theme-lightgreen"
                )}
                onDragOver={handleMainSidebarDragOver}
                onDragLeave={handleMainSidebarDragLeave}
                onDrop={handleMainSidebarDrop}
            >
                <div onClick={collapse } role='button' className={cn('group/boox text-muted-foreground h-6 w-6 rounded-sm hover:bg-theme-lightgreen/20 hover:text-theme-lightgreen absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition-all',
                isMobile && "opacity-100"
                )}>
                    <ChevronsLeft className='h-6 w-6 text-white group-hover/boox:text-theme-lightgreen transition-colors'/>
                </div>

                {/* Drop indicator */}
                {dragOver && (
                    <div className="absolute inset-0 bg-theme-lightgreen/10 border-2 border-dashed border-theme-lightgreen flex items-center justify-center z-50">
                        <div className="bg-theme-green text-white px-4 py-2 rounded-lg shadow-lg">
                            <p className="text-sm font-medium">Drop to move to main documents</p>
                        </div>
                    </div>
                )}

                <div>
                    <UserItem/>
                    
                    <Item
                        label='Search'
                        icon={<Search size={15} className='mr-2'/>}
                        isSearch
                        onclick={search.onOpen} 
                    />

                    <Item
                        label='Settings'
                        icon={<Settings size={15} className='mr-2'/>}
                        onclick={() => setShowSettings(true)} 
                    />

                    <Item
                        onclick={handleCreate} 
                        label="New Page"
                        icon={<GrAddCircle className='shrink-0 h-[18px] mr-2'/>}
                    />
                </div>

                <div className='mt-4'>
                    <DocumentList/>
                    <Item onclick={handleCreate} 
                        icon={<GrAdd  className='h-[18px] mr-2'/>}
                        label='Add a page'
                    />
                    <Popover>
                        <PopoverTrigger className='mt-4 w-full'>
                            <Item label='Trash'
                                icon={<BiTrash className='h-[18px] mr-2'/>}
                            />
                        </PopoverTrigger>
                        <PopoverContent side={isMobile ? "bottom" : "right"}
                            className='p-0 w-72'
                        >
                            {/* COMPONENT */}
                            <TrashBox/>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* THAT SIDE one which can be used to Extend sidebar */}
                <div 
                    // @ts-expect-error err
                    onMouseDown={handleMouseDown} 
                    className='opacity-0 
                        group-hover/sidebar:opacity-100 
                        transition cursor-ew-resize 
                        absolute h-full w-1 
                        bg-theme-lightgreen/50 hover:bg-theme-lightgreen right-0 
                        top-0'
                    onClick={resetWidth}
                    ></div>
            </aside>

            <div className={cn('absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]', 
                isResetting && "transition-all ease-in-out duration-300",
                isMobile && "left-0 w-full"
            )} 
            ref={navbarRef}
            >
                {!!params.documentId ? (
                    <Navbar
                        isCollapsed={isCollapsed}
                        onResetwidth={resetWidth}
                    />
                ): (
                <nav className='bg-transparent px-3 py-2 w-full'>
                    {isCollapsed && <MenuIcon onClick={resetWidth} role='button' className='h-6 w-6 text-black hover:text-theme-green transition-colors'/>}
                </nav>
                )}
            </div>

            <SettingsModal 
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </>
    )
}

export default Navigation