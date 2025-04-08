"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Mic, Loader2, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AudioUploaderProps {
  onAudioSubmit: (file: File) => void
  isProcessing: boolean
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  elapsedTime: number
}

export default function AudioUploader({
  onAudioSubmit,
  isProcessing,
  selectedFile,
  setSelectedFile,
  elapsedTime,
}: AudioUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        setSelectedFile(file)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = () => {
    if (selectedFile) {
      onAudioSubmit(selectedFile)
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
            <p className="text-xs text-gray-500 mt-1">Supports MP3, WAV, and other audio formats</p>
          </div>
          <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {selectedFile && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</span>
          </div>
          <Button onClick={handleSubmit} disabled={isProcessing} className="bg-purple-600 hover:bg-purple-700">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Identifying...
              </>
            ) : (
              "Identify Song"
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
