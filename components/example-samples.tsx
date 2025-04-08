"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Loader2, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ExampleSamplesProps {
  onSampleSelect: (sampleId: string) => void
  processingId: string | null
  elapsedTime: number
}

const exampleSamples = [
  {
    id: "sample1",
    title: "Pop Song Sample",
    description: "A 10-second clip from a song in our database",
    duration: "0:10",
  },
  {
    id: "sample2",
    title: "Rock Song Sample",
    description: "A 15-second clip from a song not in our database",
    duration: "0:15",
  },
]

export default function ExampleSamples({ onSampleSelect, processingId, elapsedTime }: ExampleSamplesProps) {
  return (
    <div className="grid gap-4">
      {exampleSamples.map((sample) => (
        <Card key={sample.id} className="overflow-hidden">
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
              <Button
                onClick={() => onSampleSelect(sample.id)}
                disabled={processingId !== null}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {processingId === sample.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Identifying...
                  </>
                ) : (
                  "Use Sample"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {processingId !== null && (
        <Alert className="mt-2 bg-amber-50 border-amber-200">
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
