"use client"
import { cn } from '@/lib/utils';
import { ChevronsLeft, MenuIcon, Search, Settings } from 'lucide-react'
import { useParams, usePathname, useRouter } from 'next/navigation';
import React, { ElementRef, MouseEvent, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts';
import UserItem from './UserItem';
import { useMutation, useQuery } from 'convex/react';
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
import { Button } from '@/components/ui/button';
import { FolderPlus, ChevronDown, ChevronUp, Folder } from 'lucide-react';
import { useWorkspaceModal } from '@/hooks/use-workspace-modal';

const Navigation = ()  => {
    const pathname = usePathname();
    const router = useRouter();
    const isMobile = useMediaQuery("(max-width: 768px)")

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const documents = (api.documents.getsidebar);
    const create = useMutation(api.documents.create) 
    const workspaces = useQuery(api.workspaces.getAll);
    const workspaceModal = useWorkspaceModal();

    const isResizingRef = useRef(false);
    const sidebarRef = useRef<ElementRef<"aside">>(null);
    const navbarRef = useRef<ElementRef<"div">>(null);
    const [isResetting, setIsResseting] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false); 
    const [showAllWorkspaces, setShowAllWorkspaces] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const params = useParams();
    const search = useSearch()
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

    const onWorkspaceClick = (workspaceId: string) => {
        router.push(`/workspace/${workspaceId}`);
    }

    // Determine which workspaces to show
    const displayedWorkspaces = workspaces ? (
        showAllWorkspaces ? workspaces : workspaces.slice(0, 3)
    ) : [];

    const hasMoreWorkspaces = workspaces && workspaces.length > 3;

    return (
        <>
            <aside ref={sidebarRef } className={cn('group/sidebar h-full bg-theme-green overflow-y-auto relative flex w-60 flex-col z-[99999] text-white',
                isResetting && "transition-all duration-300 ease-in-out",
                isMounted && isMobile && "w-0"
            )}>
                <div onClick={collapse } role='button' className={cn('group/boox text-muted-foreground h-6 w-6 rounded-sm hover:bg-theme-lightgreen/20 hover:text-theme-lightgreen absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition-all',
                isMounted && isMobile && "opacity-100"
                )}>
                    <ChevronsLeft className='h-6 w-6 text-white group-hover/boox:text-theme-lightgreen transition-colors'/>
                </div>
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

                {/* Workspaces Section */}
                <div className='mt-4 border-t border-theme-lightgreen/20 pt-4'>
                    <div className="px-3 mb-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                                <FolderPlus className="h-4 w-4" />
                                Workspaces
                                {workspaces && workspaces.length > 0 && (
                                    <span className="text-xs text-white/60">({workspaces.length})</span>
                                )}
                            </h3>
                            
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={workspaceModal.onOpen}
                                className="opacity-0 group-hover/sidebar:opacity-100 text-white hover:bg-theme-lightgreen/20 hover:text-theme-lightgreen p-1 h-auto transition-all"
                            >
                                <GrAdd className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    {workspaces === undefined ? (
                        // Loading state
                        <div className="space-y-1 px-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-6 bg-theme-lightgreen/20 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : workspaces?.length === 0 ? (
                        // Empty state
                        <div className="text-center py-4 px-3">
                            <Folder className="h-6 w-6 text-white/40 mx-auto mb-2" />
                            <p className="text-xs text-white/60 mb-2">
                                No workspaces yet
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={workspaceModal.onOpen}
                                className="text-white/80 hover:text-white hover:bg-theme-lightgreen/20 text-xs"
                            >
                                Create workspace
                            </Button>
                        </div>
                    ) : (
                        // Workspaces list
                        <div className="space-y-1">
                            {displayedWorkspaces.map((workspace) => (
                                <Item
                                    key={workspace._id}
                                    onclick={() => onWorkspaceClick(workspace._id)}
                                    label={workspace.name}
                                    icon={<span className="text-sm mr-2">{workspace.icon || '📁'}</span>}
                                    level={0}
                                />
                            ))}
                            
                            {/* Show more/less button */}
                            {hasMoreWorkspaces && (
                                <div className="px-3 pt-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAllWorkspaces(!showAllWorkspaces)}
                                        className="w-full justify-start text-white/80 hover:text-white hover:bg-theme-lightgreen/20 text-xs h-6"
                                    >
                                        {showAllWorkspaces ? (
                                            <>
                                                <ChevronUp className="h-3 w-3 mr-2" />
                                                Show less
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-3 w-3 mr-2" />
                                                Show {workspaces.length - 3} more
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Documents Section */}
                <div className='mt-4 border-t border-theme-lightgreen/20 pt-4'>
                    <div className="px-3 mb-2">
                        <h3 className="text-sm font-medium text-white/80">Documents</h3>
                    </div>
                    
                    <DocumentList/>
                    <Item onclick={handleCreate} 
                        icon={<GrAdd  className='h-[18px] mr-2'/>}
                        label='Add a page'
                    />
                    <Popover>
                        <PopoverTrigger asChild className='mt-4 w-full'>
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
                isMounted && isMobile && "left-0 w-full"
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