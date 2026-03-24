export const runtime = "nodejs"
export const maxDuration = 300

import { NextRequest, NextResponse } from "next/server"
import { Octokit } from "octokit"
import Groq from "groq-sdk"
import ffmpeg from "fluent-ffmpeg"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import path from "path"
import fs from "fs"
import os from "os"

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
ffmpeg.setFfmpegPath(ffmpegInstaller.path)

function parseGithubUrl(url: string) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) return null
  return {
    owner: match[1],
    repo: match[2].replace(".git", "")
  }
}

const durationMap: Record<string, number> = {
  "30s": 30,
  "1 min": 60,
  "2 min": 120,
  "3 min": 180
}

// How many words per second a narrator speaks
const WORDS_PER_SECOND = 2.5

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { repoUrl, scriptMode, customScript, duration, background, voice } = body

    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repo URL is required" },
        { status: 400 }
      )
    }

    const parsed = parseGithubUrl(repoUrl)
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid GitHub URL" },
        { status: 400 }
      )
    }

    const { owner, repo } = parsed

    const treeResponse = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: "HEAD",
      recursive: "1"
    })

    const files = treeResponse.data.tree
      .filter(f => f.type === "blob")
      .map(f => f.path)
      .slice(0, 50)

    let readme = ""
    try {
      const readmeResponse = await octokit.rest.repos.getReadme({ owner, repo })
      readme = Buffer.from(readmeResponse.data.content, "base64")
        .toString("utf-8")
        .slice(0, 3000)
    } catch {
      readme = "No README found"
    }

    let packageJson = ""
    try {
      const pkgResponse = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: "package.json"
      })
      if ("content" in pkgResponse.data) {
        packageJson = Buffer.from(pkgResponse.data.content, "base64")
          .toString("utf-8")
          .slice(0, 1000)
      }
    } catch {
      packageJson = "No package.json found"
    }

    const durationSeconds = durationMap[duration] || 60
    // Calculate target word count so ElevenLabs audio fills the full duration
    const targetWords = Math.floor(durationSeconds * WORDS_PER_SECOND)
    const numSlides = 5

    let scriptPrompt = ""

    if (scriptMode === "manual" && customScript) {
      scriptPrompt = `
You are a video script formatter.
The user has written their own script for a demo video.
Format it into timed slides for a ${durationSeconds}-second video.

User script:
${customScript}

Return ONLY a JSON array, no other text:
[
  {
    "slide": 1,
    "narration": "exact narration text",
    "duration": 8
  }
]

Rules:
- Split into ${numSlides} slides
- Total duration must equal ${durationSeconds} seconds
- Total narration across all slides must be approximately ${targetWords} words
- Keep the user's exact words, expand if needed to fill time
- Short sentences only — this is spoken word
`
    } else {
      scriptPrompt = `
You are writing a spoken demo video script for a real software product.
Sound like a real person talking — not a marketer, not a salesperson.

Repository: ${owner}/${repo}

File structure:
${files.slice(0, 30).join("\n")}

README:
${readme}

Package.json:
${packageJson}

Return ONLY a JSON array, no other text:
[
  {
    "slide": 1,
    "narration": "narration text here",
    "duration": ${Math.floor(durationSeconds / numSlides)}
  }
]

STRICT RULES:
- Exactly ${numSlides} slides
- Each slide duration must sum to exactly ${durationSeconds} seconds total
- CRITICAL: Each narration must be long enough to fill its duration when spoken aloud
  at a natural pace. At 2.5 words per second, a ${Math.floor(durationSeconds / numSlides)}-second slide needs
  ~${Math.floor((durationSeconds / numSlides) * WORDS_PER_SECOND)} words of narration. DO NOT write short sentences for long slides.
- Total word count across ALL slides must be approximately ${targetWords} words
- Write in full, flowing sentences. Not bullet points.
- Sound natural when read aloud — like a friend explaining it
- NEVER name any technology, library, API, or framework — not even once
- NEVER say: Next.js, React, Groq, ElevenLabs, Anthropic, FFmpeg, Octokit, or any tech name
- NEVER say: game-changer, stunning, drive sales, sign up,
  visit our website, real results, seamlessly, leveraging,
  cutting-edge, robust, revolutionize, empower
- NEVER mention features that don't exist in the codebase
- Slide 1: ONLY the problem — what pain does a developer feel before this tool? (2-3 sentences, no solution yet)
- Slides 2-4: what the USER EXPERIENCES step by step — paste URL, what happens, what comes out (3-4 sentences each)
- Slide 5: honest, simple closing — who this is for and what it saves them (2-3 sentences)
`
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: scriptPrompt }],
      max_tokens: 2048
    })
    const rawScript = completion.choices[0].message.content || ""

    const jsonMatch = rawScript.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to generate script" },
        { status: 500 }
      )
    }

    const slides = JSON.parse(jsonMatch[0])

    const fullNarration = slides
      .map((s: { narration: string }) => s.narration)
      .join(" ")
      .slice(0, 4900)
            
    const voiceId = voice === "female"
      ? process.env.ELEVENLABS_VOICE_FEMALE!
      : process.env.ELEVENLABS_VOICE_MALE!

    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: fullNarration,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      }
    )

    if (!elevenResponse.ok) {
      const err = await elevenResponse.text()
      console.error("ElevenLabs error:", elevenResponse.status, elevenResponse.statusText, err)
      return NextResponse.json(
        { error: `Failed to generate voiceover: ${elevenResponse.status} ${err}` },
        { status: 500 }
      )
    }

    const audioBuffer = await elevenResponse.arrayBuffer()

    const timestamp = Date.now()
    const tempDir = os.tmpdir()
    const audioPath = path.join(tempDir, `audio-${timestamp}.mp3`)
    const outputPath = path.join(tempDir, `video-${timestamp}.mp4`)

    fs.writeFileSync(audioPath, Buffer.from(audioBuffer))

    // Use all available fallback screenshots
    const screenshotDir = path.join(process.cwd(), "public/screenshots")
    const screenshotFiles = fs.readdirSync(screenshotDir)
      .filter(f => f.match(/\.(png|jpg|jpeg)$/i))
      .sort()
      .map(f => path.join(screenshotDir, f))

    const screenshotPaths = screenshotFiles.length > 0
      ? screenshotFiles
      : [path.join(process.cwd(), "public/screenshots/s1.png")]

    // Use background image from public/backgrounds/ if it exists, else fall back to solid color
    const bgImagePath = path.join(process.cwd(), `public/backgrounds/${background}.png`)
    const hasBgImage = fs.existsSync(bgImagePath)

    const bgColors: Record<string, string> = {
      midnight: "1a0533",
      aurora:   "032830",
      ember:    "3d0a00",
      forest:   "032810",
      slate:    "0d0d2e",
      void:     "0a0014"
    }
    const bgColor = bgColors[background] || "0f0c29"
    const durationPerSlide = durationSeconds / screenshotPaths.length

    await new Promise<void>((resolve, reject) => {
      const cmd = ffmpeg()

      if (hasBgImage) {
        // Input background image once, loop it for full duration
        cmd.input(bgImagePath)
        cmd.inputOptions(["-loop 1", `-t ${durationSeconds}`])
      }

      screenshotPaths.forEach((p) => {
        cmd.input(p)
        cmd.inputOptions(["-loop 1", `-t ${durationPerSlide}`])
      })

      cmd.input(audioPath)

      const audioIndex = hasBgImage
        ? screenshotPaths.length + 1
        : screenshotPaths.length

      const screenshotStartIndex = hasBgImage ? 1 : 0

      let filterComplex: string[]

      if (hasBgImage) {
        // Scale background to 1280x720
        // Scale each screenshot to fit within 1100x620 (with padding around it)
        // Overlay each screenshot centered on background, one per time segment
        const bgScale = `[0:v]scale=1280:720,setsar=1,fps=30[bg]`

        const screenshotScales = screenshotPaths.map((_, i) => {
          const idx = i + screenshotStartIndex
          const start = i * durationPerSlide
          const end = start + durationPerSlide
          return `[${idx}:v]scale=1100:620:force_original_aspect_ratio=decrease,pad=1100:620:(ow-iw)/2:(oh-ih)/2:color=black@0,setsar=1,fps=30,trim=0:${durationPerSlide},setpts=PTS-STARTPTS[ss${i}]`
        })

        // Build overlay chain: overlay each screenshot onto bg at its time offset
        // We use enable='between(t,start,end)' to show each screenshot at the right time
        const overlays = screenshotPaths.map((_, i) => {
          const start = i * durationPerSlide
          const end = start + durationPerSlide
          const inLabel = i === 0 ? "[bg]" : `[ov${i - 1}]`
          const outLabel = i === screenshotPaths.length - 1 ? "[outv]" : `[ov${i}]`
          return `${inLabel}[ss${i}]overlay=(W-w)/2:(H-h)/2:enable='between(t,${start},${end})'${outLabel}`
        })

        filterComplex = [bgScale, ...screenshotScales, ...overlays]
      } else {
        filterComplex = [
          ...screenshotPaths.map((_, i) => {
            const idx = i + screenshotStartIndex
            return `[${idx}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=#${bgColor},setsar=1,fps=30[v${i}]`
          }),
          `${screenshotPaths.map((_, i) => `[v${i}]`).join("")}concat=n=${screenshotPaths.length}:v=1:a=0[outv]`
        ]
      }

      cmd
        .complexFilter(filterComplex)
        .outputOptions([
          "-map [outv]",
          `-map ${audioIndex}:a`,
          "-c:v libx264",
          "-c:a aac",
          "-shortest",
          "-pix_fmt yuv420p",
          "-r 30"
        ])
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run()
    })

    const videoBuffer = fs.readFileSync(outputPath)
    const videoBase64 = videoBuffer.toString("base64")

    fs.unlinkSync(audioPath)
    fs.unlinkSync(outputPath)

    return NextResponse.json({
      success: true,
      data: {
        owner,
        repo,
        slides,
        background,
        duration: durationSeconds,
        videoBase64
      }
    })

  } catch (error) {
    console.error("Generate error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}