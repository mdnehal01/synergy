"use client";

import Editor from '@/app/(main)/_components/Editor';
import Toolbar from '@/app/(main)/_components/toolbar';
import EditModeToggle from '@/app/(main)/_components/edit-mode-toggle';
import Cover from '@/components/cover';
import Loader from '@/components/Loader';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react'

interface DocumentIdProps{
    params: {
        documentId: Id<"documents"> 
    }
}

const DocumentId = ({params}:DocumentIdProps) => {
    const [isEditMode, setIsEditMode] = useState(false);
    
    const document = useQuery(api.documents.getById, {
        documentId:params.documentId
    })

    const update = useMutation(api.documents.update)
    const router = useRouter();
    
    const onChange = (content:string) => {
        if (!isEditMode) return; // Prevent changes in view mode
        
        update({
            id:params.documentId,
            content
        });
    }

    const toggleEditMode = () => {
        setIsEditMode(prev => !prev);
    }

    if(document === undefined){
        return <>
            <Loader/>
        </>
    }

    if(document === null){
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="text-6xl">📄</div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Oh! There is no document related to this URL
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    The document you&apos;re looking for doesn&apos;t exist or may have been deleted.
                </p>
                <div className="flex gap-4 mt-6">
                    <Button 
                        onClick={() => router.push('/documents')}
                        className="bg-theme-green hover:bg-theme-lightgreen"
                    >
                        Go to Documents
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
        <div className='pb-40 relative'>
            <EditModeToggle 
                isEditMode={isEditMode}
                onToggle={toggleEditMode}
                showFlowToggle={true}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />
            
            <Cover url={document.coverImage} preview={!isEditMode}/>
            <div className='md:max-w-5xl lg:max-w-6xl mx-auto w-full'>
                <Toolbar initialData={document} preview={!isEditMode}/>
                <Editor
                    onChange={onChange}
                    onFlowChange={onFlowChange}
                    initialContent={document.content}
                    initialFlowData={document.flowData}
                    editable={isEditMode}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
            </div>
        </div>
    )
}

export default DocumentId;      