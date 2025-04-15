"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AudioUploader from "@/components/audio-uploader"
import ExampleSamples from "@/components/example-samples"
import SongSearch from "@/components/song-search"
import InfoSection from "@/components/info-section"
import type { Song } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { warmupShazoomLambda } from "@/utils/api"
import { findSong } from "@/utils/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSongDatabase } from "@/lib/song-database-context"

export default function ShazoomApp() {
  const [identifiedSong, setIdentifiedSong] = useState<Song | null>(null)
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [confidenceScore, setConfidenceScore] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const { songs, isLoading, error } = useSongDatabase()

  // Warm up Shazoom lambda once on mount
  useEffect(() => {
    void (async () => {
      try {
        const response = await warmupShazoomLambda()
        console.log("Lambda warmed up successfully")
      } catch (err) {
        console.error("Lambda warmup failed:", err)
      }
    })()
  }, [])

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

  const handleAudioSubmit = async (fileKey: string) => {
    setIsIdentifying(true)
    setStartTime(Date.now())

    try {
      const result = await findSong(fileKey)
      console.log("API response:", result)

      if (result.track_metadata) {
        setIdentifiedSong({
          title: result.track_metadata.title || "n.a.",
          artist: result.track_metadata.artist || "n.a.",
          album: result.track_metadata.album || "n.a.",
          year: result.track_metadata.year || "n.a.",
          albumCover: result.track_metadata.albumCover || "/placeholder.svg",
        })
      }

      if (result.confidence) {
        const scorePercentage = Math.round(result.confidence * 100)
        setConfidenceScore(scorePercentage)
      }
    } catch (error) {
      console.log("Error identifying song:", error)
    } finally {
      setIsIdentifying(false)
      setStartTime(null)
    }
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
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Upload audio</h3>
                  <AudioUploader
                    onAudioSubmit={handleAudioSubmit}
                    isProcessing={isIdentifying}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    elapsedTime={elapsedTime}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Example samples</h3>
                  <p className="text-sm text-gray-500 mb-3">Drag and drop any sample into the upload area above</p>
                  <ExampleSamples
                    isProcessing={isIdentifying}
                    elapsedTime={elapsedTime}
                    onSampleSelect={handleAudioSubmit}
                  />
                </div>
              </div>
              {identifiedSong && !isIdentifying && (
                <div className="mt-6 p-4 bg-purple-100 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Most similar song in database:</h3>
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
                      <p className="text-sm text-gray-500">{identifiedSong.year}</p>
                      <div className="mt-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Confidence: {confidenceScore}%</span>
                        </div>
                        <Progress value={confidenceScore} className="h-2" />
                      </div>
                      {confidenceScore < 40 && (
                        <div className="mt-2">
                          <Alert className="bg-red-50 border-red-200">
                            <AlertDescription className="text-red-600 flex items-center gap-2">
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
                                className="lucide lucide-alert-triangle"
                              >
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <path d="M12 9v4" />
                                <path d="M12 17h.01" />
                              </svg>
                              Low confidence: likely not a match.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
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
              <SongSearch songs={songs} />
            </CardContent>
          </Card>
        </div>

        <div>
          <InfoSection songs={songs} />
        </div>
      </div>
    </div>
  )
}