"use client"

import { useState, useRef, ChangeEvent } from "react"
import { Button } from "./ui/button"
import { clsx } from "clsx"

interface PhotoUploadProps {
  maxPhotos?: number
  onPhotosChange?: (photos: File[]) => void
  existingPhotos?: string[]
}

export function PhotoUpload({ 
  maxPhotos = 5, 
  onPhotosChange,
  existingPhotos = []
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>(existingPhotos)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = maxPhotos - photos.length
    const newFiles = files.slice(0, remainingSlots)

    if (newFiles.length > 0) {
      const newPhotos = [...photos, ...newFiles]
      setPhotos(newPhotos)
      onPhotosChange?.(newPhotos)

      // Generate previews
      newFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    setPreviews(newPreviews)
    onPhotosChange?.(newPhotos)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group">
            <img
              src={preview}
              alt={`Photo ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {index + 1}/{maxPhotos}
            </div>
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              "h-32 border-2 border-dashed border-slate-300 rounded-lg",
              "flex flex-col items-center justify-center",
              "hover:border-blue-500 hover:bg-blue-50 transition-colors",
              "text-slate-600 hover:text-blue-600"
            )}
          >
            <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">Add Photo</span>
            <span className="text-xs text-slate-500 mt-1">
              {photos.length}/{maxPhotos}
            </span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-slate-500">
        Upload up to {maxPhotos} photos. Supported formats: JPG, PNG, GIF. Max 5MB per photo.
      </p>
    </div>
  )
}
