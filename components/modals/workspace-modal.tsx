"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { IconPicker } from "../ui/icon-picker"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface WorkspaceModalProps {
    isOpen: boolean
    onClose: () => void
}

export const WorkspaceModal = ({ isOpen, onClose }: WorkspaceModalProps) => {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [icon, setIcon] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const create = useMutation(api.workspaces.create)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!name.trim()) {
            toast.error("Workspace name is required")
            return
        }

        try {
            setIsSubmitting(true)
            
            const workspaceId = await create({
                name: name.trim(),
                description: description.trim() || undefined,
                icon: icon || undefined
            })

            toast.success("Workspace created successfully!")
            
            // Reset form
            setName("")
            setDescription("")
            setIcon("")
            
            onClose()
            
            // Navigate to the workspace (you can implement workspace routing later)
            router.push(`/workspace/${workspaceId}`)
            
        } catch (error) {
            console.error("Error creating workspace:", error)
            toast.error("Failed to create workspace")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            setName("")
            setDescription("")
            setIcon("")
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="workspace-name" className="text-sm font-medium">
                            Workspace Name *
                        </label>
                        <Input
                            id="workspace-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter workspace name"
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="workspace-description" className="text-sm font-medium">
                            Description (Optional)
                        </label>
                        <Textarea
                            id="workspace-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your workspace"
                            disabled={isSubmitting}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Icon (Optional)
                        </label>
                        <div className="flex items-center gap-2">
                            <IconPicker onChange={setIcon}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isSubmitting}
                                    className="h-10 w-10 p-0"
                                >
                                    {icon ? (
                                        <span className="text-lg">{icon}</span>
                                    ) : (
                                        <span className="text-xs">📁</span>
                                    )}
                                </Button>
                            </IconPicker>
                            {icon && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIcon("")}
                                    disabled={isSubmitting}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
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
                            disabled={isSubmitting || !name.trim()}
                            className="bg-theme-green hover:bg-theme-lightgreen"
                        >
                            {isSubmitting ? "Creating..." : "Create Workspace"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}