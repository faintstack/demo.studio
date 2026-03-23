"use client"

import Link from "next/link"
import { Download } from "lucide-react"
import { useEffect, useState } from "react"

interface Slide {
  slide: number
  narration: string
  duration: number
}

interface ResultData {
  videoUrl: string
  slides: Slide[]
  repo: string
  background: string
}

// Mock data for demonstration
const mockData: ResultData = {
  videoUrl: "",
  slides: [
    { slide: 1, narration: "Welcome to Demofy, the easiest way to create stunning demo videos for your product.", duration: 5 },
    { slide: 2, narration: "Simply paste your GitHub repo URL and we'll analyze your codebase automatically.", duration: 4 },
    { slide: 3, narration: "Our AI generates a compelling script that highlights your product's key features.", duration: 5 },
    { slide: 4, narration: "Choose from multiple professional voices and background music options.", duration: 4 },
    { slide: 5, narration: "Download your video and share it on Product Hunt, Twitter, or in your pitch deck.", duration: 5 },
  ],
  repo: "github.com/example/demofy",
  background: "gradient"
}

export default function ResultPage() {
  const [data, setData] = useState<ResultData | null>(null)

  useEffect(() => {
    const videoUrl = sessionStorage.getItem("demofy_video_url") || ""
    const slides = JSON.parse(sessionStorage.getItem("demofy_slides") || "[]")
    const repo = sessionStorage.getItem("demofy_repo") || ""
    const background = sessionStorage.getItem("demofy_background") || ""
    setData({ videoUrl, slides, repo, background })
  }, [])

  const handleDownload = () => {
    if (!data?.videoUrl) return
    
    const link = document.createElement("a")
    link.href = data.videoUrl
    link.download = "demofy-output.mp4"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="h-16 border-b border-[#1e1e2e]">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
          <span className="text-lg font-bold tracking-tight text-[#fafafa]">
            Demofy
          </span>
          <Link 
            href="/" 
            className="text-sm text-[#71717a] transition-colors hover:text-[#fafafa]"
          >
            Generate another
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[800px] px-8 py-12">
        {/* Success Badge */}
        <div className="mb-6">
          <span className="inline-block rounded-full bg-[#0d2b1d] px-3 py-1 text-xs font-medium text-[#4ade80]">
            Video ready
          </span>
        </div>

        {/* Heading */}
        <h1 className="mb-2 text-[32px] font-semibold leading-tight text-[#fafafa]">
          Your demo video is ready
        </h1>

        {/* Subheading */}
        <p className="mb-8 text-base text-[#71717a]">
          Share it on Product Hunt, Twitter, or your pitch deck.
        </p>

        {/* Video Player Card */}
        <div className="overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#111117]">
          {/* Top Bar */}
          <div className="flex h-10 items-center justify-between border-b border-[#1e1e2e] px-4">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#71717a]/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#71717a]/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#71717a]/50" />
            </div>
            <span className="text-xs text-[#71717a]">demofy-output.mp4</span>
            <div className="w-[42px]" /> {/* Spacer for centering */}
          </div>
          
          {/* Video Element */}
          {data?.videoUrl ? (
            <video 
              className="w-full" 
              controls 
              autoPlay
              src={data.videoUrl}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-[#09090b]">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e1e2e]">
                  <svg className="h-6 w-6 text-[#71717a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-[#71717a]">Video preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Script Section */}
        <div className="mt-8">
          <label className="mb-3 block text-[13px] font-medium text-[#71717a]">
            Generated script
          </label>
          <div className="rounded-xl border border-[#1e1e2e] bg-[#111117] p-6">
            {data?.slides && data.slides.length > 0 ? (
              <ol className="space-y-4">
                {data.slides.map((slide) => (
                  <li key={slide.slide} className="flex gap-4">
                    <span className="flex-shrink-0 text-sm font-medium text-[#4f46e5]">
                      {slide.slide}.
                    </span>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed text-[#fafafa]">
                        {slide.narration}
                      </p>
                      <span className="mt-2 inline-block rounded bg-[#1e1e2e] px-2 py-0.5 text-xs text-[#71717a]">
                        {slide.duration}s
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[#71717a]">No script available</p>
            )}
          </div>
        </div>

        {/* Buttons Row */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={!data?.videoUrl}
            className="flex h-11 items-center gap-2 rounded-lg bg-[#4f46e5] px-6 text-sm font-medium text-white transition-colors hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download MP4
          </button>
          <Link
            href="/"
            className="flex h-11 items-center rounded-lg border border-[#1e1e2e] bg-transparent px-6 text-sm font-medium text-[#fafafa] transition-colors hover:bg-[#1e1e2e]"
          >
            Generate another
          </Link>
        </div>
      </main>
    </div>
  )
}
