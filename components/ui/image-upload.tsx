"use client"

import { useState } from "react"
import { useEdgeStore } from "@/lib/edgestore"
import { Button } from "./button"
import { ImageIcon, X, Upload } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { edgestore } = useEdgeStore()

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true)
      const response = await edgestore.publicFiles.upload({
        file
      })
      onChange(response.url)
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {value ? (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
          </div>
          {onRemove && !disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
        </div>
      )}
      
      {!value && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isUploading}
            onClick={() => document.querySelector('input[type="file"]')?.click()}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      )}
    </div>
  )
}