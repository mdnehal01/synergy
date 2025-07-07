"use client"

import { create } from 'zustand'

interface TextSelectionStore {
    isOpen: boolean
    selectedText: string
    onOpen: (text: string) => void
    onClose: () => void
}

export const useTextSelection = create<TextSelectionStore>((set) => ({
    isOpen: false,
    selectedText: "",
    onOpen: (text: string) => set({ isOpen: true, selectedText: text }),
    onClose: () => set({ isOpen: false, selectedText: "" })
}))