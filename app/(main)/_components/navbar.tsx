import React from 'react'
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { BiMenu } from 'react-icons/bi';
import Title from './title';
import Banner from './banner';
import Menu from './menu';

interface NavbarProps{
    isCollapsed:boolean;
    onResetwidth:() => void;
}

const Navbar:React.FC<NavbarProps> = ({
    isCollapsed,
    onResetwidth
}) => {
    const params = useParams();
    const document = useQuery(api.documents.getById, {
        documentId:params.documentId as Id<"documents">
    });

    if(document === undefined){
        return (
            <nav className='bg-neutral-100 dark:bg-theme-lightgreen  px-3 py-2 w-full flex items-center'>
                {/* @ts-expect-error abc */}
                <Title.Skeleton/>
            </nav>
        )
    }

    if(document === null){
        return null;
    }

    return (
        <>
            <nav className='bg-neutral-100 dark:bg-theme-lightgreen  px-3 py-2 w-full flex items-center gap-x-4'>
                {isCollapsed && <BiMenu
                    role='button'
                    onClick={onResetwidth}
                    className='h-6 w-6 text-neutral-600'
                />}

                <div className='flex items-center justify-between w-full'>
                    <Title initialData={document} />
                    <div className='flex items-center gap-x-2'>
                        <Menu documentId={document._id}/>
                    </div>
                </div>
            </nav>

            {document.isArchived && (
                <Banner documentId={document._id}/>
            )}
        </>
    )
}

export default Navbar