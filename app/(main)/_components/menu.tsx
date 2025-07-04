"use client"

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useUser } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { MoreHorizontal, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

interface MenuProps{
    documentId:Id<"documents">
}

const Menu:React.FC<MenuProps> = ({
    documentId
}) => {

    const router = useRouter();
    const {user} = useUser();
    const archive = useMutation(api.documents.archive)

    const onArchive = () => {
        const promise = archive({id: documentId})

        toast.promise(promise, {
            loading:"Moving to trash",
            success:"Note moved to trash",
            error:"Failed to archive note"
        })

        router.push("/documents")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button size="sm" variant="ghost">
                    <MoreHorizontal className='h-4 w-4'/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-60' align='end' alignOffset={8} forceMount >
                <DropdownMenuItem onClick={onArchive}>
                     <Trash className='h-4 w-4'/>
                     Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <div className='text-xs text-neutral-600 p-2 '>
                    Last edited by: {user?.fullName}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default Menu