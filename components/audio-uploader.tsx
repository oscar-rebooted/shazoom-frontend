"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Mic, Loader2, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPresignedUrl } from "@/utils/api" // Import the API function

interface AudioUploaderProps {
  onAudioSubmit: (fileKey: string) => void // Changed to accept fileKey instead of File
  isProcessing: boolean
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  elapsedTime: number
  isUploading?: boolean // Add new prop to track upload status
  setIsUploading?: (isUploading: boolean) => void // Add setter for upload status
}

export default function AudioUploader({
  onAudioSubmit,
  isProcessing,
  selectedFile,
  setSelectedFile,
  elapsedTime,
}: AudioUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [fileKey, setFileKey] = useState<string | null>(null)
  const [fileSizeError, setFileSizeError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB in bytes

  // Log presigned URL info when a file is selected, but don't upload yet
  useEffect(() => {
    const uploadToS3 = async () => {
      if (selectedFile) {
        try {
          setUploadError(null)
          setIsUploading(true)

          // Only get the presigned URL and log it, don't upload yet
          const presignedData = await getPresignedUrl()
          console.log("Presigned URL response:", presignedData)
          setFileKey(presignedData.fileKey);

          // Extract the URL and fields from the presigned POST data
          const { url, fields } = presignedData.uploadData;
          
          // Create a FormData object and append all the fields
          const formData = new FormData();
          Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value as string);
          });
          
          // Append the file last
          formData.append('file', selectedFile);
          
          // Upload to S3 using the presigned POST
          const uploadResponse = await fetch(url, {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed with status: ${uploadResponse.status}. Details: ${errorText}`);
          }

          console.log("File uploaded successfully to:", presignedData.uploadUrl)
          setIsUploading(false)
        } catch (error) {
          console.error('Error getting presigned URL:', error)
          setUploadError('Failed to prepare for upload. Please try again.')
          setIsUploading(false)
        }
      }
    }
    
    uploadToS3()
  }, [selectedFile])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.includes("audio/")) {
        if (file.size < MAX_FILE_SIZE) {
          setSelectedFile(file)
          setFileSizeError(null)
        } else {
          setSelectedFile(null)
          setFileSizeError("Max. file size 20MB");
        }
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size < MAX_FILE_SIZE){
        setSelectedFile(file)
        setFileSizeError(null);
      } else {
        setSelectedFile(null)
        setFileSizeError("Max. file size 20MB");
        if (fileInputRef.current) {
          fileInputRef.current.value = ''        
        }
      }
    }
  }

  const handleSubmit = () => {
    if (fileKey) {
      onAudioSubmit(fileKey)
    }
  }

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? "border-purple-500 bg-purple-50" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="p-3 rounded-full bg-purple-100">
            <Upload className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Drag and drop an audio file, or{" "}
              <span
                className="text-purple-600 cursor-pointer hover:underline"
                onClick={() => fileInputRef.current?.click()}
              >
                browse
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports MP3, WAV, FLAC, and other audio formats</p>
          </div>
          <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {fileSizeError && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-700 text-sm flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {fileSizeError}
          </p>
        </div>
      )}

      {uploadError && (
        <Alert className="mt-4 bg-red-50 border-red-200">
          <AlertDescription className="text-red-600">
            {uploadError}
          </AlertDescription>
        </Alert>
      )}

      {selectedFile && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</span>
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={isProcessing || !fileKey || isUploading} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Identifying...
              </>
            ) : (
              "Identify song"
            )}
          </Button>
        </div>
      )}

      {isProcessing && (
        <Alert className="mt-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="font-medium text-amber-700">Processing time: {elapsedTime} seconds</span>
          </div>
          <AlertDescription className="text-amber-600">
            Song identification can take up to 30 seconds depending on the audio quality and length.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}