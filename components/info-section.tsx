import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Song } from "@/lib/types"
import { Info, Music } from "lucide-react"

interface InfoSectionProps {
  songs: Song[]
}

export default function InfoSection({ songs }: InfoSectionProps) {
  // Only show the first 5 songs
  const displayedSongs = songs.slice(0, 5)

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About Shazoom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <p>
              <strong>Shazoom</strong> is a song recognition application similar to Shazam. It allows you to identify
              songs from audio samples.
            </p>
            <p>Upload your own audio file or use one of our example samples to test the application's functionality.</p>
            <p className="text-purple-700 font-medium">
              Note: This application can only identify songs that are present in its internal database.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Available Songs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">Popular songs in our database:</p>
          <ul className="space-y-2 text-sm">
            {displayedSongs.map((song) => (
              <li key={song.id} className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded-md">
                <div className="w-8 h-8 bg-purple-200 rounded-md overflow-hidden">
                  <img
                    src={song.albumCover || "/placeholder.svg"}
                    alt={`${song.title} album cover`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{song.title}</p>
                  <p className="text-xs text-gray-600">{song.artist}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
