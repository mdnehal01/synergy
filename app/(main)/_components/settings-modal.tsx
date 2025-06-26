"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="theme" className="text-sm font-medium">
                            Appearance
                        </Label>
                        <ThemeToggle />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default SettingsModal