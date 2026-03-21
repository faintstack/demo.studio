"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

function Header() {
  return (
    <header className="h-16 border-b border-[#1e1e2e] bg-[#09090b]">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-8">
        <span className="text-lg font-bold text-[#fafafa]">Demofy</span>
        <div className="flex items-center gap-6">
          <Link
            href="#how-it-works"
            className="text-sm text-[#71717a] transition-opacity hover:opacity-80"
          >
            How it works
          </Link>
          <Link
            href="/generate"
            className="flex h-9 items-center rounded-lg bg-[#4f46e5] px-4 text-sm font-medium text-white transition-opacity hover:opacity-80"
          >
            Generate
          </Link>
        </div>
      </div>
    </header>
  )
}

function VideoPlayerMock() {
  const [progress, setProgress] = useState(0)
  const [timestamp, setTimestamp] = useState(0)

  useEffect(() => {
    // Animate progress from 0 to 40 over 3 seconds
    const duration = 3000
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progressValue = Math.min((elapsed / duration) * 40, 40)
      setProgress(progressValue)

      // Update timestamp (0 to 24 seconds over 3 seconds)
      const timestampValue = Math.min((elapsed / duration) * 24, 24)
      setTimestamp(Math.floor(timestampValue))

      if (elapsed < duration) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [])

  const formatTime = (seconds: number) => {
    return `0:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#111117]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-[#1e1e2e] px-4 py-3">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
          <span className="h-3 w-3 rounded-full bg-[#eab308]" />
          <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
        </div>
        <span className="flex items-center gap-2 text-sm text-[#71717a]">
          <span className="animate-pulse text-[#ef4444]">●</span>
          demofy-output.mp4
        </span>
        <div className="w-14" />
      </div>

      {/* Main area */}
      <div className="flex flex-col items-center justify-center bg-[#09090b] py-24">
        <button
          type="button"
          className="flex h-16 w-16 animate-[pulse-scale_2s_ease-in-out_infinite] items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80"
          aria-label="Play video"
        >
          <svg
            className="ml-1 h-6 w-6 text-[#6366f1]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <span className="mt-4 text-sm text-[#71717a]">Your demo video</span>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-4 border-t border-[#1e1e2e] px-4 py-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#1e1e2e]">
          <div
            className="h-full rounded-full bg-[#6366f1] transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-[#71717a]">{formatTime(timestamp)} / 1:00</span>
      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] bg-[#09090b]">
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, #fafafa 1px, transparent 1px), linear-gradient(to bottom, #fafafa 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          opacity: 0.03,
        }}
      />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-16 px-8 py-24 md:grid-cols-2 md:py-24">
        {/* Left Column */}
        <div className="flex flex-col">
          <span className="mb-4 w-fit rounded-full bg-[#1e1e3f] px-3 py-1 text-xs font-medium text-[#818cf8]">
            AI-powered video generation
          </span>
          <h1
            className="max-w-[540px] text-[#fafafa]"
            style={{
              fontSize: "56px",
              fontWeight: 600,
              lineHeight: 1.1,
            }}
          >
            Turn your GitHub repo into a demo video.
          </h1>
          <p
            className="mt-4 max-w-[480px] text-[#71717a]"
            style={{
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Paste your repo URL. AI reads your code, writes the script, records
            a professional voiceover, and renders a polished video. Ready in
            under 2 minutes.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/generate"
              className="flex h-11 items-center rounded-lg bg-[#6366f1] px-6 text-base font-medium text-white transition-opacity hover:opacity-80"
            >
              Generate my demo
            </Link>
            <button
              type="button"
              className="flex h-11 items-center rounded-lg border border-[#1e1e2e] bg-transparent px-6 text-base font-medium text-[#fafafa] transition-opacity hover:opacity-80"
            >
              See an example
            </button>
          </div>
        </div>

        {/* Right Column - Video Player Mock */}
        <VideoPlayerMock />
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Paste your repo",
      description: "Drop in any public GitHub URL. No setup, no configuration.",
    },
    {
      number: "02",
      title: "AI writes the script",
      description:
        "AI reads your codebase and writes a script that actually makes sense.",
    },
    {
      number: "03",
      title: "Voice is recorded",
      description:
        "A professional voice narrates your product. No microphone needed.",
    },
    {
      number: "04",
      title: "Video is rendered",
      description:
        "Your video renders in under 2 minutes, ready for Product Hunt, Twitter, or your pitch deck.",
    },
  ]

  return (
    <section id="how-it-works" className="bg-[#09090b] px-8 py-24">
      <div className="mx-auto max-w-[1200px]">
        <span className="mb-4 block text-xs font-medium uppercase tracking-widest text-[#6366f1]">
          How it works
        </span>
        <h2
          className="mb-12 text-[#fafafa]"
          style={{
            fontSize: "36px",
            fontWeight: 600,
          }}
        >
          Four steps. Two minutes. One polished video.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border border-[#1e1e2e] bg-[#111117] p-6"
            >
              <span className="mb-3 block text-xs font-medium text-[#6366f1]">
                {step.number}
              </span>
              <h3 className="text-[15px] font-medium text-[#fafafa]">
                {step.title}
              </h3>
              <p
                className="mt-2 text-[#71717a]"
                style={{
                  fontSize: "14px",
                  lineHeight: 1.5,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#1e1e2e] bg-[#09090b] px-8 py-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 sm:flex-row">
        <span className="text-sm text-[#71717a]">Demofy</span>
        <span className="text-sm text-[#71717a]">
          Made for developers who ship fast.
        </span>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b]">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <Footer />
    </main>
  )
}
