"use client"

import { create } from 'zustand'

type AIGenerationStore = {
    isOpen: boolean
    isGenerating: boolean
    onOpen: () => void
    onClose: () => void
    setGenerating: (generating: boolean) => void
    onContentGenerate?: (content: string) => void
    setOnContentGenerate: (callback: (content: string) => void) => void
}

export const useAIGeneration = create<AIGenerationStore>((set) => ({
    isOpen: false,
    isGenerating: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
    setGenerating: (generating) => set({ isGenerating: generating }),
    onContentGenerate: undefined,
    setOnContentGenerate: (callback) => set({ onContentGenerate: callback })
}))