"use client"

import { create } from 'zustand'

type ImageUploadStore = {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
    onImageSelect?: (url: string) => void
    setOnImageSelect: (callback: (url: string) => void) => void
}

export const useImageUpload = create<ImageUploadStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
    onImageSelect: undefined,
    setOnImageSelect: (callback) => set({ onImageSelect: callback })
}))