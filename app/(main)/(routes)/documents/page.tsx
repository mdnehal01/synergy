"use client";
import Image from 'next/image';
import React, { useState } from 'react'
import EMPTY from "@/public/images/empty.webp"
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { GrAddCircle } from 'react-icons/gr';
import { useMutation, useQuery } from 'convex/react';
import { api  } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { WorkspaceModal } from '@/components/modals/workspace-modal';
import { useWorkspaceModal } from '@/hooks/use-workspace-modal';
import { FolderPlus, FileText, Calendar, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

const DocumentsPage = () => {
    const {user} = useUser(); 
    const create = useMutation(api.documents.create);
    const archiveWorkspace = useMutation(api.workspaces.archive);
    const router = useRouter();
    const workspaceModal = useWorkspaceModal();
    const [showAllWorkspaces, setShowAllWorkspaces] = useState(false);
    
    // Fetch workspaces
    const workspaces = useQuery(api.workspaces.getAll);

    const onCreate = () => {
        const promise = create({ title:"Untitled" })
            .then((documentId) => router.push(`/documents/${documentId}`))
        toast.promise(promise, {
            loading: "Creating a new note...",
            success: "New note created!",
            error: "Failed to create a new note."
        })
    }

    const onArchiveWorkspace = (workspaceId: string) => {
        const promise = archiveWorkspace({ id: workspaceId as any });
        toast.promise(promise, {
            loading: "Archiving workspace...",
            success: "Workspace archived!",
            error: "Failed to archive workspace."
        });
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
            <div className='h-full p-6'>
                {/* Header with action buttons */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Welcome back, {user?.firstName}!
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your workspaces and documents
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button 
                                onClick={onCreate} 
                                className='bg-theme-green hover:bg-theme-lightgreen border-2 hover:text-black rounded-sm hover:rounded-full border-theme-green'
                            >
                                <GrAddCircle className='mr-2 h-4 w-4'/>
                                Create a note 
                            </Button>
                            
                            <Button 
                                onClick={workspaceModal.onOpen}
                                variant="outline"
                                className='border-2 border-theme-green text-theme-green hover:bg-theme-green hover:text-white rounded-sm hover:rounded-full'
                            >
                                <FolderPlus className='mr-2 h-4 w-4'/>
                                Create a workspace
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Workspaces Section */}
                {workspaces === undefined ? (
                    // Loading state
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <FolderPlus className="h-5 w-5 text-theme-green" />
                                Your Workspaces
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardHeader>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : workspaces.length === 0 ? (
                    // Empty state
                    <div className='flex flex-col items-center justify-center space-y-4 mt-12'>
                        <Image
                            src={EMPTY}
                            alt='No workspaces'
                            height={200}
                            width={200}
                        />
                        <h2 className='text-lg font-medium text-center'>No workspaces yet</h2>
                        <p className='text-muted-foreground text-center max-w-md'>
                            Create your first workspace to organize your documents and collaborate with your team.
                        </p>
                    </div>
                ) : (
                    // Workspaces grid
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <FolderPlus className="h-5 w-5 text-theme-green" />
                                Your Workspaces
                                <span className="text-sm font-normal text-muted-foreground ml-2">
                                    ({workspaces.length} total)
                                </span>
                            </h2>
                            
                            {hasMoreWorkspaces && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAllWorkspaces(!showAllWorkspaces)}
                                    className="text-theme-green hover:bg-theme-lightgreen/10 hover:text-theme-green"
                                >
                                    {showAllWorkspaces ? (
                                        <>
                                            <ChevronUp className="h-4 w-4 mr-1" />
                                            Show less
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-4 w-4 mr-1" />
                                            Show more ({workspaces.length - 3} more)
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedWorkspaces.map((workspace) => (
                                <Card 
                                    key={workspace._id} 
                                    className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-theme-lightgreen group"
                                    onClick={() => onWorkspaceClick(workspace._id)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">
                                                    {workspace.icon || '📁'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg font-semibold truncate group-hover:text-theme-green transition-colors">
                                                        {workspace.name}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Created {formatDistanceToNow(new Date(workspace.createdAt), { addSuffix: true })}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <DropdownMenu>
                                                <DropdownMenuTrigger 
                                                    asChild
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onArchiveWorkspace(workspace._id);
                                                        }}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        Archive Workspace
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="pt-0">
                                        {workspace.description ? (
                                            <CardDescription className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                {workspace.description}
                                            </CardDescription>
                                        ) : (
                                            <CardDescription className="text-sm text-muted-foreground italic mb-3">
                                                No description provided
                                            </CardDescription>
                                        )}
                                        
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                <span>0 documents</span>
                                            </div>
                                            <div className="px-2 py-1 bg-theme-lightgreen/10 text-theme-green rounded-full text-xs font-medium">
                                                Active
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Show more/less section for mobile or when expanded */}
                        {hasMoreWorkspaces && showAllWorkspaces && (
                            <div className="mt-6 text-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAllWorkspaces(false)}
                                    className="border-theme-green text-theme-green hover:bg-theme-green hover:text-white"
                                >
                                    <ChevronUp className="h-4 w-4 mr-2" />
                                    Show less workspaces
                                </Button>
                            </div>
                        )}

                        {/* Quick stats section */}
                        {workspaces.length > 0 && (
                            <div className="mt-8 p-4 bg-theme-lightgreen/5 rounded-lg border border-theme-lightgreen/20">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <FolderPlus className="h-4 w-4 text-theme-green" />
                                            <span className="font-medium">Total Workspaces:</span>
                                            <span className="text-theme-green font-semibold">{workspaces.length}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-theme-green" />
                                            <span className="font-medium">Active:</span>
                                            <span className="text-theme-green font-semibold">{workspaces.length}</span>
                                        </div>
                                    </div>
                                    
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={workspaceModal.onOpen}
                                        className="text-theme-green hover:bg-theme-green hover:text-white"
                                    >
                                        <FolderPlus className="h-4 w-4 mr-1" />
                                        New Workspace
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <WorkspaceModal 
                isOpen={workspaceModal.isOpen}
                onClose={workspaceModal.onClose}
            />
        </>
    )
}

export default DocumentsPage