"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ThemeSelector } from "@/components/theme-selector"

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
                <div className="grid gap-6 py-4">
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">
                            Appearance
                        </Label>
                        <ThemeSelector />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default SettingsModal