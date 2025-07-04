"use client"
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { useOrigin } from '@/hooks/use-origin'
import { useMutation } from 'convex/react'
import { Check, Copy, Globe, Globe2 } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

interface PublishProps{
    initialData:Doc<"documents">
}

const Publish = ({initialData}:PublishProps) => {
    const origin = useOrigin();
    const update = useMutation(api.documents.update);

    const [copied, setCopied] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const url = `${origin}/preview/${initialData._id}`;
    
    const onPublish = () => {
        setIsSubmitting(true); 
        const promise = update({
            id:initialData._id,
            isPublished: true
        }).finally(() => setIsSubmitting(false));

        toast.promise(promise, {
            loading:"Publishing...",
            success:"Published successfully.",
            error: "Failed to publish "
        })
    }

        const unPublush = () => {
        setIsSubmitting(true); 
        const promise = update({
            id:initialData._id,
            isPublished: false
        }).finally(() => setIsSubmitting(false));

        toast.promise(promise, {
            loading:"Unpublishing...",
            success:"Unpublished successfully.",
            error: "Failed to unpublish "
        })
    }

    const onCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true)
        toast.success("Notes Url Copied")
        setTimeout(()=>{setCopied(false)}, 1000)
    }

    return (
        <Popover>
            <PopoverTrigger>
                <Button size="sm" variant="ghost">
                    Publish
                    {initialData.isPublished && (
                        <Globe className='text-sky-700 w-4 h-4 mr-2'/>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-72' align='end' alignOffset={8} forceMount>
                {initialData.isPublished ? (
                    <div className='space-y-4'>
                        <div className='flex items-center gap-x-2'>
                            <Globe2 className='text-sky-600 animate-pulse h-4 w-4'/>
                            <p className='text-xs font-medium text-sky-600'>This note is live on web</p>
                        </div>

                        <div className="flex items-center">
                            <input className='flex-1 px-2 text-xs border rounded-l-md h-8 bg-neutral-100 truncate' value={url} disabled />
                            <Button
                                onClick={onCopy}
                                disabled={copied}
                                className='h-8 rounded-l-none'
                            >
                                {copied ? <Check size={20}/> : <Copy size={20}/>}
                            </Button>
                        </div>
                        <Button
                            className='text-sm w-full'
                            size="sm"
                            disabled={isSubmitting}
                            onClick={unPublush}
                        >
                            Unpublish
                        </Button>
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center'>
                        <Globe className='h-8 w-8 text-neutral-600 mb-2'/>
                        <p className='text-sm font-medium mb-2'>Publish this note</p>
                        <span className='text-xs text-neutral-600 mb-4'>
                            Share your work with others
                        </span>

                        <Button
                            className='text-sm w-full'
                            size="sm"
                            disabled={isSubmitting}
                            onClick={onPublish}
                        >
                            Publish
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}

export default Publish