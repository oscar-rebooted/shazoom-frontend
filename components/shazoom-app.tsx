"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AudioUploader from "@/components/audio-uploader"
import ExampleSamples from "@/components/example-samples"
import SongSearch from "@/components/song-search"
import InfoSection from "@/components/info-section"
import { SongDatabase } from "@/lib/song-database"
import type { Song } from "@/lib/types"
import { Progress } from "@/components/ui/progress"

export default function ShazoomApp() {
  const [identifiedSong, setIdentifiedSong] = useState<Song | null>(null)
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [confidenceScore, setConfidenceScore] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (isIdentifying && startTime !== null) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    } else {
      setElapsedTime(0)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isIdentifying, startTime])

  const handleAudioSubmit = (audioFile: File | string) => {
    setIsIdentifying(true)
    setStartTime(Date.now())

    if (typeof audioFile === "string") {
      setProcessingId(audioFile)
    } else {
      setProcessingId(null)
      setSelectedFile(audioFile)
    }

    // Simulate song identification with a delay
    setTimeout(() => {
      // For demo purposes, randomly select a song from the database
      const randomIndex = Math.floor(Math.random() * SongDatabase.length)
      setIdentifiedSong(SongDatabase[randomIndex])
      // Generate a random confidence score between 60 and 98
      setConfidenceScore(Math.floor(Math.random() * 39) + 60)
      setIsIdentifying(false)
      setProcessingId(null)
      setStartTime(null)
    }, 2000)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-800 mb-2">Shazoom</h1>
        <p className="text-lg text-gray-600">Identify songs from audio samples</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Identify a song</CardTitle>
              <CardDescription>Upload an audio file or use one of our examples to identify a song</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="upload">Upload audio</TabsTrigger>
                  <TabsTrigger value="examples">Example samples</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <AudioUploader
                    onAudioSubmit={handleAudioSubmit}
                    isProcessing={isIdentifying}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    elapsedTime={elapsedTime}
                  />
                </TabsContent>
                <TabsContent value="examples">
                  <ExampleSamples
                    onSampleSelect={handleAudioSubmit}
                    processingId={processingId}
                    elapsedTime={elapsedTime}
                  />
                </TabsContent>
              </Tabs>

              {identifiedSong && !isIdentifying && (
                <div className="mt-6 p-4 bg-purple-100 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Closest match in database:</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-200 rounded-md overflow-hidden">
                      <img
                        src={identifiedSong.albumCover || "/placeholder.svg"}
                        alt={`${identifiedSong.title} album cover`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg">{identifiedSong.title}</p>
                      <p className="text-gray-600">{identifiedSong.artist}</p>
                      <p className="text-sm text-gray-500">
                        {identifiedSong.album} ({identifiedSong.year})
                      </p>
                      <div className="mt-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Confidence: {confidenceScore}%</span>
                        </div>
                        <Progress value={confidenceScore} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg mt-6">
            <CardHeader>
              <CardTitle>Search songs</CardTitle>
              <CardDescription>Search for songs in our database</CardDescription>
            </CardHeader>
            <CardContent>
              <SongSearch songs={SongDatabase} />
            </CardContent>
          </Card>
        </div>

        <div>
          <InfoSection songs={SongDatabase} />
        </div>
      </div>
    </div>
  )
}
