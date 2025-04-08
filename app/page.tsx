import type { Metadata } from "next/types"
import ShazoomApp from "@/components/shazoom-app"

export const metadata: Metadata = {
  title: "Shazoom - Audio Recognition",
  description: "Identify songs from audio samples",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-4 md:p-8">
      <ShazoomApp />
    </main>
  )
}
