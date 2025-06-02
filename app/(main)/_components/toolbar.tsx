// import { CoverImageModal } from '@/components/modals/cover-image-modal';
import { CoverImageModal } from '@/components/modals/cover-image-modal';
import { Button } from '@/components/ui/button';
import { IconPicker } from '@/components/ui/icon-picker';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useCoverImage } from '@/hooks/use-cover-image';
import { useMutation } from 'convex/react';
import { ImageIcon, Smile } from 'lucide-react';
import React, { ElementRef, useRef, useState } from 'react'
import { GrClose } from 'react-icons/gr';
import TextareaAutosize from "react-textarea-autosize"

interface ToolbarProps{
    initialData:Doc<"documents">;
    preview?:boolean;
}

const Toolbar:React.FC<ToolbarProps> = ({
    initialData, preview
}) => {
    const inputRef = useRef<ElementRef<"textarea">>(null);
    const update = useMutation(api.documents.update);
    const removeicon = useMutation(api.documents.removeIcon);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialData.title);

    const coverImage = useCoverImage();

    const enableInput = () => {
        if(preview) return;
        setIsEditing(true);
        setTimeout(()=>{
            setValue(initialData.title)
            inputRef.current?.focus();
        },0)
    }
    
    const disableInput = () => {
        setIsEditing(false);
    }
    
    const onInput = (
        value:string
    ) => {
        setValue(value);
        update({
            id:initialData._id,
            title:value || "Untitled",
        })
    }
    
    const onKeyDown = (event:React.KeyboardEvent<HTMLInputElement>) => {
        if(event.key === 'Enter'){
            event.preventDefault()
            disableInput()
        }
    }

    const onIconSelect = (icon:string) => {
        update({
            id: initialData._id,
            icon
        })
    }

    const onRemoveIcon = () => {
        removeicon({
            id:initialData._id
        })
    }

    return (
        <div className='group pl-[54px] relative'>
            <CoverImageModal/>
            {!!initialData.icon && !preview && (
                <div className='flex items-center group/icon pt-6 gap-x-2'>
                    <IconPicker onChange={onIconSelect}>
                        <p className='text-6xl hover:opacity-75 transition'>
                            {initialData.icon}
                        </p>
                    </IconPicker>
                    <Button onClick={onRemoveIcon } className='rounded-full opacity-0 group-hover/icon:opacity-100 transition text-neutral-800' variant="outline" size="icon">
                        <GrClose className='h-4 w-4'/>
                    </Button>
                </div>
            )}

            {!!initialData.icon && preview && (
                <p className='text-6xl pt-6'>
                    {initialData.icon}
                </p>
            )}

            <div className='opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4'>
                {!initialData.icon && !preview && (
                    <IconPicker asChild onChange={onIconSelect}>
                        <Button className='text-neutral-700 text-xs' variant="outline" size="sm">
                            <Smile className='h-4 w-4 mr-2'/>
                            Add icon
                        </Button>
                    </IconPicker>
                )}

                {!initialData.coverImage && !preview && (
                    <Button className='text-neutral-700'  variant="outline" size="sm" onClick={coverImage.onOpen}>
                        <ImageIcon className='h-4 w-4 mr-2'/>
                        Add cover
                    </Button>
                )}
            </div>
            {isEditing && !preview ? (
                <TextareaAutosize ref={inputRef} onBlur={disableInput} onKeyDown={() => onKeyDown}
                    onChange={(e) => onInput(e.target.value)}
                value={value} className='text-5xl bg-transparent font-bold break-words outline-none text-theme-blue dark:text-neutral-200 resize-none'>

                </TextareaAutosize>
            ): 
            (
                <div onClick={enableInput} className='pb-[11.5px] text-5xl font-bold break-words outline-none text-theme-blue'>
                    {initialData.title}
                </div>
            )}
        </div>
    )
}

export default Toolbar