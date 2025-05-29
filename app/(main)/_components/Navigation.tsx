import { ChevronsLeft } from 'lucide-react'
import React, { ElementRef, useRef } from 'react'

const Navigation = () => {
    const isResizingRef = useRef(false);
    const sidebarRef = useRef<ElementRef<"aside">>(null);
    const navbarRed = useRef<ElementRef<"div">>(null);
    return (
        <>
            <aside className='group/sidebar h-full bg-theme-green overflow-y-auto relative flex w-60
                flex-col z-[99999] text-white
            '>
                <div role='button' className='group/boox text-muted-foreground h-6 w-6 rounded-sm hover:bg-theme-lightgreen absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100'>
                    <ChevronsLeft className='h-6 w-6 text-white group-hover/boox:text-black'/>
                </div>
                <div>
                    <p>Action items</p>
                </div>

                <div className='mt-4'>
                    <p>Documents</p>
                </div>

                <div className='opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-white/50 right-0 top-0'>
                    KYA RE DALLEnts
                </div>
            </aside>
        </>
    )
}

export default Navigation