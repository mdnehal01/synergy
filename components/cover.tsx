import { cn } from '@/lib/utils';
import Image from 'next/image'
import React from 'react'
import { Button } from './ui/button';
import { ImageIcon, X } from 'lucide-react';
import { useCoverImage } from '@/hooks/use-cover-image';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';

interface CoverProps{
    url?:string;
    preview?:boolean;
}

const Cover = ({url, preview}:CoverProps) => {
    const coverImage = useCoverImage();
    const params = useParams();
    const removeCover = useMutation(api.documents.removeCover)

    const onRemove = () => {
        removeCover({
            id:params.documentId as Id<"documents">
        })
    }

    return (
        <div className={cn(`relative w-full h-[35vh] group`, !url && "h-[12vh]", url && "bg-neutral-100")}>
            {!!url && <Image
                src={url}
                alt='CoverImage'
                fill
                className='object-cover'
            />}
            {url && !preview && (
                <div className='opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2'>
                    <Button variant="outline" className='text-neutral-700 text-xs' size="sm" onClick={coverImage.onOpen }>
                        <ImageIcon className='h-4 w-4 mr-2'/>
                        Change cover
                    </Button>
                    
                    <Button variant="outline" className='text-neutral-700 text-xs' size="sm" onClick={onRemove }>
                        <X className='h-4 w-4 mr-2'/>
                        Remove
                    </Button>
                </div>
            )}
        </div>
    )
}

export default Cover