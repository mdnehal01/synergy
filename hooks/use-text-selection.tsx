"use client"

import { create } from 'zustand'

interface TextSelectionStore {
    isOpen: boolean
    selectedText: string
    position: { x: number; y: number }
    onOpen: (text: string, position: { x: number; y: number }) => void
    onClose: () => void
}

export const useTextSelection = create<TextSelectionStore>((set) => ({
    isOpen: false,
    selectedText: "",
    position: { x: 0, y: 0 },
    onOpen: (text: string, position: { x: number; y: number }) => set({ isOpen: true, selectedText: text, position }),
    onClose: () => set({ isOpen: false, selectedText: "", position: { x: 0, y: 0 } })
}))