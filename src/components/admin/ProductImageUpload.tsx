import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X } from 'lucide-react'

interface ProductImageUploadProps {
  currentImage?: string
  onImageChange: (url: string) => void
}

export default function ProductImageUpload({ currentImage, onImageChange }: ProductImageUploadProps) {
  const [preview, setPreview] = useState(currentImage || '')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    // In a real app, you would upload to a storage service
    // For now, we'll use a local preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
      onImageChange(reader.result as string)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview('')
    onImageChange('')
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Product preview"
                className="w-full h-48 object-cover rounded"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg h-48 flex items-center justify-center bg-muted">
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No image selected
                </p>
              </div>
            </div>
          )}
          <div>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="image-upload">
              <Button variant="outline" className="w-full" asChild>
                <span>{uploading ? 'Uploading...' : 'Choose Image'}</span>
              </Button>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}