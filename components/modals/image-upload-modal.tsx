"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { ImageUpload } from "../ui/image-upload"
import { useState } from "react"
import { Button } from "../ui/button"

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onImageSelect: (url: string) => void
  title?: string
}

export function ImageUploadModal({
  isOpen,
  onClose,
  onImageSelect,
  title = "Upload Image"
}: ImageUploadModalProps) {
  const [imageUrl, setImageUrl] = useState<string>("")

  const handleImageChange = (url: string) => {
    setImageUrl(url)
  }

  const handleInsert = () => {
    if (imageUrl) {
      onImageSelect(imageUrl)
      setImageUrl("")
      onClose()
    }
  }

  const handleClose = () => {
    setImageUrl("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <ImageUpload
            value={imageUrl}
            onChange={handleImageChange}
            onRemove={() => setImageUrl("")}
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleInsert}
              disabled={!imageUrl}
              className="bg-theme-green hover:bg-theme-lightgreen"
            >
              Insert Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}