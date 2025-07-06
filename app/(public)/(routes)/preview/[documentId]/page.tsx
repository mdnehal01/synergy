"use client";

import Editor from '@/app/(main)/_components/Editor';
import Toolbar from '@/app/(main)/_components/toolbar';
import Cover from '@/components/cover';
import Loader from '@/components/Loader';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from '@/components/ui/button';
import React from 'react'

interface DocumentIdProps{
    params: {
        documentId: Id<"documents"> 
    }
}

const DocumentId = ({params}:DocumentIdProps) => {
    const document = useQuery(api.documents.getById, {
        documentId:params.documentId
    })

    const update = useMutation(api.documents.update)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onChange = (content:string) => {
        update({
            id:params.documentId,
            content
        });
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
        <div className='pb-40'>
            <Cover preview url={document.coverImage}/>
            <div className='md:max-w-3xl lg:max-w-4xl mx-auto'>
                <Toolbar preview initialData={document}/>
                <Editor
                    onChange={() => {}}
                    editable={false}
                    initialContent={document.content }
                />
            </div>
        </div>
    )
}

export default DocumentId