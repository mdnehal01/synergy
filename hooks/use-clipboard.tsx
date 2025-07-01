"use client"

import { create } from 'zustand'
import { Id } from '@/convex/_generated/dataModel'

export type ClipboardOperation = 'copy' | 'cut'

interface ClipboardItem {
  documentId: Id<"documents">
  title: string
  operation: ClipboardOperation
  sourceParentId?: Id<"documents">
  workspaceId?: Id<"workspaces">
}

interface ClipboardStore {
  item: ClipboardItem | null
  setItem: (item: ClipboardItem) => void
  clearItem: () => void
  hasItem: () => boolean
  canPaste: (targetParentId?: Id<"documents">, targetWorkspaceId?: Id<"workspaces">) => boolean
}

export const useClipboard = create<ClipboardStore>((set, get) => ({
  item: null,
  setItem: (item: ClipboardItem) => set({ item }),
  clearItem: () => set({ item: null }),
  hasItem: () => get().item !== null,
  canPaste: (targetParentId?: Id<"documents">, targetWorkspaceId?: Id<"workspaces">) => {
    const { item } = get()
    if (!item) return false
    
    // Can't paste into itself
    if (item.documentId === targetParentId) return false
    
    // Must be in the same workspace context
    return item.workspaceId === targetWorkspaceId
  }
}))