"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Song } from "@/lib/types"

interface SongSearchProps {
  songs: Song[]
}

interface SongWithScore extends Song {
  score: number
}

export default function SongSearch({ songs }: SongSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SongWithScore[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const calculateRelevance = (song: Song, query: string): number => {
    const queryLower = query.toLowerCase()
    const titleLower = song.title.toLowerCase()
    const artistLower = song.artist.toLowerCase()
    const albumLower = song.album.toLowerCase()

    let score = 0

    // Exact matches get highest scores
    if (titleLower === queryLower) score += 100
    if (artistLower === queryLower) score += 80
    if (albumLower === queryLower) score += 60

    // Contains matches get medium scores
    if (titleLower.includes(queryLower)) score += 50
    if (artistLower.includes(queryLower)) score += 40
    if (albumLower.includes(queryLower)) score += 30

    // Partial word matches get lower scores
    const words = queryLower.split(" ")
    for (const word of words) {
      if (word.length > 2) {
        // Only consider words with 3+ characters
        if (titleLower.includes(word)) score += 25
        if (artistLower.includes(word)) score += 20
        if (albumLower.includes(word)) score += 15
      }
    }

    // Fuzzy matching for typos (simple implementation)
    // Check if query is at least 70% similar to any field
    if (calculateSimilarity(titleLower, queryLower) > 0.7) score += 10
    if (calculateSimilarity(artistLower, queryLower) > 0.7) score += 8
    if (calculateSimilarity(albumLower, queryLower) > 0.7) score += 6

    return score
  }

  const calculateSimilarity = (str1: string, str2: string): number => {
    // Simple implementation of string similarity
    // Returns a value between 0 and 1, where 1 is an exact match
    if (str1 === str2) return 1
    if (str1.length === 0 || str2.length === 0) return 0

    // Count matching characters
    let matches = 0
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) {
        matches++
      }
    }

    return matches / longer.length
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (searchQuery.trim() === "") {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    const query = searchQuery.toLowerCase()

    // Calculate relevance score for each song
    const scoredResults: SongWithScore[] = songs.map((song) => ({
      ...song,
      score: calculateRelevance(song, query),
    }))

    // Filter out songs with zero relevance and sort by score
    const filteredResults = scoredResults.filter((song) => song.score > 0).sort((a, b) => b.score - a.score)

    setSearchResults(filteredResults)
    setHasSearched(true)
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by song title, artist, or album..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </form>

      <div className="mt-4">
        {hasSearched && (
          <p className="text-sm text-gray-500 mb-2">
            {searchResults.length === 0
              ? "No songs found matching your search."
              : `Found ${searchResults.length} song${searchResults.length === 1 ? "" : "s"}.`}
          </p>
        )}

        <div className="space-y-3">
          {searchResults.map((song) => (
            <div key={`${song.artist}-${song.title}`} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-200 rounded-md overflow-hidden">
                <img
                  src={song.albumCover || "/placeholder.svg"}
                  alt={`${song.title} album cover`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{song.title}</p>
                <p className="text-sm text-gray-600">{song.artist}</p>
                <p className="text-xs text-gray-500">{song.year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
