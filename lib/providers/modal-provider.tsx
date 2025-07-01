"use client"

import { CoverImageModal } from "@/components/modals/cover-image-modal"
import { RenameModal } from "@/components/modals/rename-modal"
import { useEffect, useState } from "react"

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true)
    }, []);

    if(!isMounted) return null;

    return <>
        <CoverImageModal/>
    </>
}