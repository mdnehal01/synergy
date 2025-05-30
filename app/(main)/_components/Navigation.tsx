"use client"
import { cn } from '@/lib/utils';
import { ChevronsLeft, MenuIcon } from 'lucide-react'
import { usePathname } from 'next/navigation';
import React, { ElementRef, MouseEvent, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts';
import UserItem from './UserItem';

const Navigation = ()  => {
    const pathname = usePathname();

    const isMobile = useMediaQuery("(max-width: 768px)")

    const isResizingRef = useRef(false);
    const sidebarRef = useRef<ElementRef<"aside">>(null);
    const navbarRef = useRef<ElementRef<"div">>(null);
    const [isResetting, setIsResseting] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(isMobile); 

    useEffect(() => {
        if(isMobile){
            collapse()
        }else{
            resetWidth();
        }
    },[isMobile])

    useEffect(() => {
        if(isMobile){
            collapse()
        }
    },[isMobile, pathname ])

    const handleMouseMove = (e:MouseEvent) => {
        if(!isResizingRef.current) return;
        let newWidth = e.clientX;

        if(newWidth < 240) newWidth=240;
        if(newWidth > 480) newWidth=480;

        if(navbarRef.current && sidebarRef.current){
            sidebarRef.current.style.width=`${newWidth}px`;
            navbarRef.current.style.setProperty("left", `${newWidth}px`)
            navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`)
        }
    }

    const handleMouseUp = () => {   
        isResizingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    }

    const handleMouseDown = (e : React.MouseEvent<HTMLDivElement,MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();

        isResizingRef.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    } 

    const resetWidth = () => {
        if(navbarRef.current && sidebarRef.current){
            setIsCollapsed(false); 
            setIsResseting(true);

            sidebarRef.current.style.width = isMobile ? "100%" : "240px";
            navbarRef.current.style.setProperty(
                "width",
                isMobile ? "0" : "calc(100%-240px)"
            )
            
            navbarRef.current.style.setProperty(
                "left",
                isMobile ? "100%" : "240px "
            )

            setTimeout(() => setIsResseting(false), 300 )
        }
    }
    
    const collapse = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(true);
            setIsResseting(true);
            sidebarRef.current.style.width = "0";
            navbarRef.current.style. setProperty("width", "100%"); 
            navbarRef.current.style. setProperty("left", "0");
            setTimeout(() => setIsResseting(false), 300);
        }
    }

    return (
        <>
            <aside ref={sidebarRef } className={cn('group/sidebar h-full bg-theme-green overflow-y-auto relative flex w-60 flex-col z-[99999] text-white',
                isResetting && "transition-all duration-300 ease-in-out",
                isMobile && "w-0"
            )}>
                <div onClick={collapse } role='button' className={cn('group/boox text-muted-foreground h-6 w-6 rounded-sm hover:bg-theme-lightgreen absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100',
                isMobile && "opacity-100"
                )}>
                    <ChevronsLeft className='h-6 w-6 text-white group-hover/boox:text-black'/>
                </div>
                <div>
                    <UserItem/>
                </div>

                <div className='mt-4'>
                    <p>Documents</p>
                </div>

                {/* THAT SIDE one which can be used to Extend sidebar */}
                <div 
                    onMouseDown={handleMouseDown} 
                    className='opacity-0 
                        group-hover/sidebar:opacity-100 
                        transition cursor-ew-resize 
                        absolute h-full w-1 
                        bg-white/50 right-0 
                        top-0'
                    onClick={resetWidth}
                    ></div>
            </aside>

            <div className={cn('absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]', 
                isResetting && "transition-all ease-in-out duration-300",
                isMobile && "left-0 w-full"
            )} 
            ref={navbarRef}
            >
                <nav className='bg-transparent px-3 py-2 w-full'>
                    {isCollapsed && <MenuIcon onClick={resetWidth} role='button' className='h-6 w-6 text-black'/>}
                </nav>
            </div>
        </>
    )
}

export default Navigation