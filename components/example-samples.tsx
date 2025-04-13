"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Play } from "lucide-react"
import ProcessingAlert from "@/components/processing-alert"

interface ExampleSamplesProps {
  isProcessing: boolean
  elapsedTime: number
  onSampleSelect: (fileKey: string) => void
}

const exampleSamples = [
  {
    id: "sample1",
    title: "Brazilian Pop Sample",
    description: "Clip from song in database",
    duration: "0:10",
    fileKey: "clips/Menina_10secs.mp3",
  },
  {
    id: "sample2",
    title: "1960s Pop Sample",
    description: "Clip from song not in database",
    duration: "0:24",
    fileKey: "clips/Hey_Jude_24_secs.webm", 
  },
]

export default function ExampleSamples({ isProcessing, elapsedTime, onSampleSelect }: ExampleSamplesProps) {
  const handleDragStart = (e: React.DragEvent, sample: (typeof exampleSamples)[0]) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: sample.id,
        title: sample.title,
        fileKey: sample.fileKey,
      }),
    )
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exampleSamples.map((sample) => (
          <Card
            key={sample.id}
            className="overflow-hidden cursor-grab hover:shadow-md transition-shadow"
            draggable
            onDragStart={(e) => handleDragStart(e, sample)}
          >
            <CardContent className="p-0">
              <div className="flex items-center p-4">
                <div className="w-12 h-12 bg-purple-200 rounded-md flex items-center justify-center mr-4">
                  <Play className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{sample.title}</h3>
                  <p className="text-sm text-gray-500">{sample.description}</p>
                  <p className="text-xs text-gray-400">Duration: {sample.duration}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {isProcessing && <ProcessingAlert isVisible={isProcessing} elapsedTime={elapsedTime} />}
    </div>
  )
}
