"use client";

import EnhancedEditor from '@/app/(main)/_components/enhanced-editor';
import Toolbar from '@/app/(main)/_components/toolbar';
import EditModeToggle from '@/app/(main)/_components/edit-mode-toggle';
import Cover from '@/components/cover';
import Loader from '@/components/Loader';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
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
        return <div>Not found</div>
    }

    return (
        <div className='pb-40 relative'>
            <EditModeToggle 
                isEditMode={isEditMode}
                onToggle={toggleEditMode}
            />
            
            <Cover url={document.coverImage} preview={!isEditMode}/>
            <div className='md:max-w-5xl lg:max-w-6xl mx-auto w-full'>
                <Toolbar initialData={document} preview={!isEditMode}/>
                <EnhancedEditor
                    onChange={onChange}
                    initialContent={document.content}
                    editable={isEditMode}
                />
            </div>
        </div>
    )
}

export default DocumentId