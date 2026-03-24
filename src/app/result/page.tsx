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
    link.download = "demo-studio-output.mp4"
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
            demo.studio
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
      <main className="mx-auto max-w-[860px] px-8 py-12">
        {/* Success Badge */}
        <div className="mb-6">
          <span className="inline-block rounded-full bg-[#0d2b1d] px-3 py-1 text-xs font-medium text-[#4ade80]">
            ✓ Video ready
          </span>
        </div>

        <h1 className="mb-2 text-[32px] font-semibold leading-tight text-[#fafafa]">
          Your demo video is ready
        </h1>
        <p className="mb-10 text-base text-[#71717a]">
          Share it on Product Hunt, Twitter, or your pitch deck.
        </p>

        {/* Terminal-style video card */}
        <div
          className="overflow-hidden rounded-2xl border border-[#1e1e2e]"
          style={{
            background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
            boxShadow: "0 0 80px rgba(99,102,241,0.15), 0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          {/* Gradient backdrop */}
          <div className="p-6 pb-8">
            {/* Window chrome */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                <span className="h-3 w-3 rounded-full bg-[#eab308]" />
                <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
              </div>
              <span className="flex items-center gap-2 text-xs text-[#ffffff60]">
                <span className="animate-pulse text-[#ef4444]">●</span>
                demo-studio-output.mp4
              </span>
              <div className="w-14" />
            </div>

            {/* Video element — floats on gradient bg */}
            <div
              className="overflow-hidden rounded-xl border border-[#ffffff15]"
              style={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              {data?.videoUrl ? (
                <video
                  className="w-full block"
                  controls
                  autoPlay
                  src={data.videoUrl}
                  style={{ display: "block" }}
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-[#09090b]/80">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#6366f1]/20 border border-[#6366f1]/30">
                      <svg className="h-6 w-6 text-[#6366f1]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-sm text-[#71717a]">Video preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
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

        {/* Script Section */}
        <div className="mt-10">
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
      </main>
    </div>
  )
}