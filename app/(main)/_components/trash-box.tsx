"use client"

import Loader from '@/components/Loader';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { BiSearch } from 'react-icons/bi';
import { Input } from '@/components/ui/input';
import { Trash, Undo } from 'lucide-react';
import ConfirmModel from '@/components/modals/confirm-modals';

const TrashBox = () => {
    const router = useRouter();
    const params = useParams();
    const documents = useQuery(api.documents.getTrash);
    const restore = useMutation(api.documents.restore);
    const remove = useMutation(api.documents.remove);
    const [search, setSearch] = useState("");
    const filteredDocuments = documents?.filter((document) => { return document.title.toLowerCase().includes (search.toLowerCase()); });

    const onClick = (documentId: string) => {
        router.push(`/documents/${documentId}`)
    }

    const onRestore = (event:React.MouseEvent<HTMLDivElement, MouseEvent>, documentId: Id<"documents">)=>{
        event.stopPropagation();
        const promise = restore({id: documentId});

        toast.promise(promise, {
            loading: "Restoring note...",
            success: "Note restored successfully",
            error: "Failed to restore. "
        })
    }

    const onRemove = (documentId: Id<"documents">)=>{
        const promise = remove({id: documentId});

        toast.promise(promise, {
            loading: "Deleting note...",
            success: "Note deleted successfully",
            error: "Failed to delete . "
        })

        if(params.documentId === documentId){
            router.push("/documents")
        }
    }

    if(documents === undefined){
        return (
            <div className='bg-theme-blue flex items-center justify-center'>
                <Loader/>
            </div>
        )   
    }
    
    return (
        <div className='text-sm'>
            <div className='flex items-center gap-x-1 p-2'>
                <BiSearch/>
                <Input value={search} onChange={(e) => setSearch(e.target.value)}
                    className='h-7 focus-visible:ring-transparent bg-slate-100'
                    placeholder='Filter by title'
                />
            </div>

            <div className='mt-2 px-1 pb-1'>
                <p className='hidden last:block text-xs text-center pb-2 '>No documents found</p>
                {filteredDocuments?.map((document) => (
                    <div 
                        key={document._id}
                        role='button'
                        onClick={() => onClick(document._id)}
                        className='flex items-center justify-between text-sm rounded-sm w-full hover:bg-slate-300'
                    >
                        <span className='truncate pl-2'>{document.title}</span>
                        <div className='flex items-center'>
                            <div
                                role='button'
                                className='rounded-sm p-2 hover:bg-neutral-200' 
                                onClick={(e) => onRestore(e,document._id)}>
                                    <Undo className='h-4 w-4'/>
                            </div>
                            
                            <ConfirmModel onConfirm={() => onRemove(document._id)}>
                            <div
                                role='button'
                                className='rounded-sm p-2 hover:bg-neutral-200' 
                            >
                                <Trash className='h-4 w-4'/>
                            </div>
                            </ConfirmModel>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TrashBox