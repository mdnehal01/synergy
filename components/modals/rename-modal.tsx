"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

interface RenameModalProps {
    isOpen: boolean
    onClose: () => void
    documentId: Id<"documents">
    currentTitle: string
}

export const RenameModal = ({ isOpen, onClose, documentId, currentTitle }: RenameModalProps) => {
    const [title, setTitle] = useState(currentTitle)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const update = useMutation(api.documents.update)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!title.trim()) {
            toast.error("Title cannot be empty")
            return
        }

        if (title.trim() === currentTitle) {
            onClose()
            return
        }

        try {
            setIsSubmitting(true)
            
            await update({
                id: documentId,
                title: title.trim()
            })

            toast.success("Document renamed successfully!")
            onClose()
            
        } catch (error) {
            console.error("Error renaming document:", error)
            toast.error("Failed to rename document")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            setTitle(currentTitle) // Reset to original title
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rename Document</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="document-title" className="text-sm font-medium">
                            Document Title
                        </label>
                        <Input
                            id="document-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter document title"
                            disabled={isSubmitting}
                            autoFocus
                            onFocus={(e) => e.target.select()}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !title.trim()}
                            className="bg-theme-green hover:bg-theme-lightgreen"
                        >
                            {isSubmitting ? "Renaming..." : "Rename"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}