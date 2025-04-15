"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { Song } from "@/lib/types"

// Type definitions for our context
type SongDatabaseContextType = {
  songs: Song[]
  isLoading: boolean
  error: Error | null
}

// Create the context with default values
const SongDatabaseContext = createContext<SongDatabaseContextType>({
  songs: [],
  isLoading: false,
  error: null,
})

// Type for the TracksMetadata structure
type TracksMetadataItem = {
  original_filename: string
  youtube?: {
    youtube_title_v1?: string
    youtube_title_v2?: string
    youtube_title_v3?: string
    youtube_artist?: string
  }
  spotify?: {
    title?: string
    artist?: string
    album?: string
    year?: number
    albumCover?: string
  }
}

type TracksMetadataCollection = {
  [key: string]: TracksMetadataItem
}

// Props for our provider component
type SongDatabaseProviderProps = {
  children: ReactNode
}

export function SongDatabaseProvider({ children }: SongDatabaseProviderProps) {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        // Fetch the tracks metadata JSON
        const response = await fetch('/tracks_metadata.json')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tracks metadata: ${response.status} ${response.statusText}`)
        }
        
        const data: TracksMetadataCollection = await response.json()
        
        // Transform the data to match our Song type
        const transformedSongs = Object.keys(data).map((key) => {
          const track = data[key]
          const spotifyData = track.spotify || {}
          const youtubeData = track.youtube || {}
          
          return {
            id: `song${key}`,
            title: spotifyData.title || youtubeData.youtube_title_v3 || "Unknown",
            artist: spotifyData.artist || youtubeData.youtube_artist || "Unknown Artist",
            album: spotifyData.album || "Unknown Album",
            year: spotifyData.year || "N/A",
            genre: "Unknown", // Not present in your tracks_metadata.json
            albumCover: spotifyData.albumCover || "/placeholder.svg?height=200&width=200",
          }
        })
        
        setSongs(transformedSongs)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
        console.error("Error loading song database:", err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSongs()
  }, [])

  return (
    <SongDatabaseContext.Provider value={{ songs, isLoading, error }}>
      {children}
    </SongDatabaseContext.Provider>
  )
}

// Custom hook to use the song database context
export function useSongDatabase() {
  const context = useContext(SongDatabaseContext)
  
  if (context === undefined) {
    throw new Error("useSongDatabase must be used within a SongDatabaseProvider")
  }
  
  return context
}