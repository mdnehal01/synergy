"use client";
import Image from 'next/image';
import React from 'react'
import EMPTY from "@/public/images/empty.webp"
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { GrAddCircle } from 'react-icons/gr';
import { useMutation } from 'convex/react';
import { api  } from '@/convex/_generated/api';
import { toast } from 'sonner';

const DocumentsPage = () => {
    const {user} = useUser(); 
    const create = useMutation(api.documents.create);

    const onCreate = () => {
        const promise = create({ title:"Untitled" })
        toast.promise(promise, {
            loading: "Creating a new note...",
            success: "New note created!",
            error: "Failed to create a new note."
        })
    }

    return (
        <div className='h-full flex flex-col items-center justify-center space-y-4'>
            <Image
                src={EMPTY}
                alt='EMPTY'
                height={300}
                width={300}
            />

            <h2 className='text-lg font-medium'>Welcome to {user?.firstName}&apos;s synergie.</h2>
            <Button onClick={onCreate} className='bg-theme-green hover:bg-theme-lightgreen border-2 hover:text-black rounded-sm hover:rounded-full border-theme-green'>
                <GrAddCircle className='mr-1'/>
                Create a note 
            </Button>
        </div>
    )
}

export default DocumentsPage