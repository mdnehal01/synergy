"use client"
import ConfirmModel from '@/components/modals/confirm-modals'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

interface BannerProps{
    documentId:Id<"documents">
}

const Banner:React.FC<BannerProps> = ({
    documentId
}) => {
    const router = useRouter();
    const remove = useMutation(api.documents.remove);
    const restore = useMutation(api.documents.restore);

    const onremove = () => {
        const promise =  remove({id:documentId})
        toast.promise(promise, {
            loading:"Deleting note...",
            success:"Notes deleted!",
            error:"Something went wrong. "
        })
        router.push("/documents")
    }

        const onrestore = () => {
        const promise =  restore({id:documentId});

        toast.promise(promise, {
            loading:"Restoring note...",
            success:"Notes restored!",
            error:"Something went wrong."
        })

    }

    return (
        <div className='w-full bg-rose-500 text-center text-sm p-2 flex text-white items-center gap-x-2 justify-center'>
            <p>This page is in the Trash</p>
            <Button size="sm" onClick={onrestore} variant="outline" className='border-white bg-transparent hover:bg-rose-400/5 text-white hover:text-white p-1 px-2 h-auto font-normal'>
                Restore page
            </Button> 
            <ConfirmModel onConfirm={onremove}>
                <Button size="sm" variant="outline" className='border-white bg-transparent hover:bg-rose-400/5 text-white hover:text-white p-1 px-2 h-auto font-normal'>
                    Delete forever
                </Button>
            </ConfirmModel>    
        </div>
    )
}

export default Banner