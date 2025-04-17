"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProcessingAlert from "@/components/processing-alert"
import { useRef, useState } from "react"

interface ExampleSamplesProps {
  isProcessing: boolean
  elapsedTime: number
  onSampleSelect: (fileKey: string) => void
}

const exampleSamples = [
  {
    id: "sample1",
    title: "2010s Pop Sample",
    description: "Clip from song in database",
    duration: "0:10",
    fileKey: "clips/Uptown_Funk_10secs.mp3",
    audioPath: "/clips/Uptown_Funk_10secs.mp3"
  },
  {
    id: "sample2",
    title: "1960s Rock Sample",
    description: "Clip from song not in database",
    duration: "0:24",
    fileKey: "clips/Hey_Jude_24_secs.mp3", 
    audioPath: "/clips/Hey_Jude_24_secs.mp3"
  },
]

export default function ExampleSamples({ isProcessing, elapsedTime, onSampleSelect }: ExampleSamplesProps) {
  const [playingSample, setPlayingSample] = useState<string | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({})
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

  const togglePlay = (sampleId: string) => {
    const audioElement = audioRefs.current[sampleId]

    if (!audioElement) return

    if (playingSample === sampleId) {
      // Currently playing this sample, so pause it
      audioElement.pause()
      setPlayingSample(null)
    } else {
      // Pause any currently playing sample
      if (playingSample && audioRefs.current[playingSample]) {
        audioRefs.current[playingSample]?.pause()
      }

      // Play the new sample
      audioElement.play()
      setPlayingSample(sampleId)
    }
  }

  const handleAudioEnded = (sampleId: string) => {
    if (playingSample === sampleId) {
      setPlayingSample(null)
    }
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 bg-purple-200 rounded-md flex items-center justify-center mr-4 hover:bg-purple-300"
                  onClick={() => togglePlay(sample.id)}
                >
                  {playingSample === sample.id ? (
                    <Pause className="h-6 w-6 text-purple-600" />
                  ) : (
                  <Play className="h-6 w-6 text-purple-600" />
                )}
                </Button>
                <audio
                  ref={el => {
                    if (audioRefs.current) {
                      audioRefs.current[sample.id] = el;
                    }
                  }}
                  src={sample.audioPath}
                  onEnded={() => handleAudioEnded(sample.id)}
                />
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
