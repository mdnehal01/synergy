"use client"

import { Button } from '@/components/ui/button'
import { Edit, Eye } from 'lucide-react'
import React from 'react'

interface EditModeToggleProps {
    isEditMode: boolean
    onToggle: () => void
}

const EditModeToggle: React.FC<EditModeToggleProps> = ({
    isEditMode,
    onToggle
}) => {
    return (
        <div className="fixed top-20 right-6 z-50">
            <Button
                onClick={onToggle}
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2 shadow-lg"
            >
                {isEditMode ? (
                    <>
                        <Edit className="h-4 w-4" />
                        Edit Mode
                    </>
                ) : (
                    <>
                        <Eye className="h-4 w-4" />
                        View Mode
                    </>
                )}
            </Button>
        </div>
    )
}

export default EditModeToggle