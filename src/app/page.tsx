"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"

function Header() {
  return (
    <header className="h-16 border-b border-[#1e1e2e] bg-[#09090b]">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-8">
        <span className="text-lg font-bold text-[#fafafa]">demo.studio</span>
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

// Fake "slides" that cycle in the mock player
const DEMO_SLIDES = [
  { label: "Paste your GitHub URL", color: "#6366f1" },
  { label: "AI writes the script", color: "#8b5cf6" },
  { label: "Voice is recorded", color: "#06b6d4" },
  { label: "Video is rendered", color: "#10b981" },
]

function VideoPlayerMock() {
  const [progress, setProgress] = useState(0)
  const [timestamp, setTimestamp] = useState(0)
  const [slideIndex, setSlideIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const totalDuration = 60 // fake 60s video
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    // Continuously animate progress 0→100 and loop
    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now
      const elapsed = (now - startRef.current) / 1000 // seconds
      const loopDuration = 8 // loop every 8 seconds for demo
      const looped = elapsed % loopDuration
      const pct = (looped / loopDuration) * 100
      setProgress(pct)
      setTimestamp(Math.floor((pct / 100) * totalDuration))

      // Change slide every 2 seconds
      const newSlide = Math.floor((looped / loopDuration) * DEMO_SLIDES.length)
      setSlideIndex((prev) => {
        if (prev !== newSlide) {
          setFadeIn(false)
          setTimeout(() => setFadeIn(true), 150)
          return newSlide
        }
        return prev
      })

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const formatTime = (s: number) => `0:${s.toString().padStart(2, "0")}`
  const slide = DEMO_SLIDES[slideIndex % DEMO_SLIDES.length]

  return (
    <div className="overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#111117] shadow-2xl">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-[#1e1e2e] px-4 py-3">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
          <span className="h-3 w-3 rounded-full bg-[#eab308]" />
          <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
        </div>
        <span className="flex items-center gap-2 text-sm text-[#71717a]">
          <span className="animate-pulse text-[#ef4444]">●</span>
          demo-output.mp4
        </span>
        <div className="w-14" />
      </div>

      {/* Animated slide preview area */}
      <div
        className="relative flex flex-col items-center justify-center bg-[#09090b] py-16 px-6"
        style={{
          background: `radial-gradient(ellipse at 60% 40%, ${slide.color}22 0%, #09090b 70%)`,
          transition: "background 0.6s ease",
          minHeight: "200px",
        }}
      >
        {/* Slide content */}
        <div
          style={{
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
          className="flex flex-col items-center gap-4"
        >
          {/* Slide number badge */}
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: slide.color + "33", color: slide.color }}
          >
            0{slideIndex + 1}
          </span>

          {/* Fake screenshot card */}
          <div
            className="w-full max-w-[280px] rounded-lg border p-4 text-center"
            style={{ borderColor: slide.color + "44", background: slide.color + "11" }}
          >
            <p className="text-sm font-medium text-[#fafafa]">{slide.label}</p>
            {/* Fake content bars */}
            <div className="mt-3 space-y-2">
              <div className="h-2 rounded-full bg-[#1e1e2e]" style={{ width: "80%" }} />
              <div className="h-2 rounded-full bg-[#1e1e2e]" style={{ width: "60%" }} />
              <div className="h-2 rounded-full bg-[#1e1e2e]" style={{ width: "70%" }} />
            </div>
          </div>

          {/* Waveform / voice indicator */}
          <div className="flex items-center gap-1">
            {[3, 6, 4, 8, 5, 7, 3, 6, 4, 5].map((h, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: "3px",
                  height: `${h * 2}px`,
                  background: slide.color,
                  opacity: 0.7,
                  animation: `waveBar 0.8s ease-in-out ${i * 0.08}s infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-4 border-t border-[#1e1e2e] px-4 py-3">
        <svg className="h-4 w-4 text-[#6366f1]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#1e1e2e]">
          <div
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%`, background: slide.color }}
          />
        </div>
        <span className="text-xs text-[#71717a]">{formatTime(timestamp)} / 1:00</span>
      </div>

      <style jsx>{`
        @keyframes waveBar {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] bg-[#09090b]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, #fafafa 1px, transparent 1px), linear-gradient(to bottom, #fafafa 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          opacity: 0.03,
        }}
      />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-16 px-8 py-24 md:grid-cols-2">
        {/* Left Column */}
        <div className="flex flex-col">
          <span className="mb-4 w-fit rounded-full bg-[#1e1e3f] px-3 py-1 text-xs font-medium text-[#818cf8]">
            AI-powered video generation
          </span>
          <h1
            className="max-w-[540px] text-[#fafafa]"
            style={{ fontSize: "56px", fontWeight: 600, lineHeight: 1.1 }}
          >
            Turn your GitHub repo into a demo video.
          </h1>
          <p
            className="mt-4 max-w-[480px] text-[#71717a]"
            style={{ fontSize: "16px", fontWeight: 400, lineHeight: 1.6 }}
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
            <Link
              href="#how-it-works"
              className="flex h-11 items-center rounded-lg border border-[#1e1e2e] bg-transparent px-6 text-base font-medium text-[#fafafa] transition-opacity hover:opacity-80"
            >
              How it works
            </Link>
          </div>
        </div>

        {/* Right Column */}
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
      description: "AI reads your codebase and writes a script that actually makes sense.",
    },
    {
      number: "03",
      title: "Voice is recorded",
      description: "A professional voice narrates your product. No microphone needed.",
    },
    {
      number: "04",
      title: "Video is rendered",
      description: "Your video renders in under 2 minutes, ready for Product Hunt, Twitter, or your pitch deck.",
    },
  ]

  return (
    <section id="how-it-works" className="bg-[#09090b] px-8 py-24">
      <div className="mx-auto max-w-[1200px]">
        <span className="mb-4 block text-xs font-medium uppercase tracking-widest text-[#6366f1]">
          How it works
        </span>
        <h2 className="mb-12 text-[#fafafa]" style={{ fontSize: "36px", fontWeight: 600 }}>
          Four steps. Two minutes. One polished video.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="rounded-xl border border-[#1e1e2e] bg-[#111117] p-6">
              <span className="mb-3 block text-xs font-medium text-[#6366f1]">{step.number}</span>
              <h3 className="text-[15px] font-medium text-[#fafafa]">{step.title}</h3>
              <p className="mt-2 text-[#71717a]" style={{ fontSize: "14px", lineHeight: 1.5 }}>
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
        <span className="text-sm text-[#71717a]">demo.studio</span>
        <span className="text-sm text-[#71717a]">Made for developers who ship fast.</span>
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