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
      const readmeResponse = await octokit.rest.repos.getReadme({
        owner,
        repo
      })
      readme = Buffer.from(
        readmeResponse.data.content,
        "base64"
      ).toString("utf-8").slice(0, 3000)
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
        packageJson = Buffer.from(
          pkgResponse.data.content,
          "base64"
        ).toString("utf-8").slice(0, 1000)
      }
    } catch {
      packageJson = "No package.json found"
    }

    const durationSeconds = durationMap[duration] || 60

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
- Split into 4-5 slides
- Total duration must equal ${durationSeconds} seconds
- Keep the user's exact words
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
    "narration": "narration text",
    "duration": 8
  }
]

STRICT RULES:
- ${durationSeconds} seconds total, exactly 4-5 slides
- Short sentences. Spoken word only. No long paragraphs.
- Be specific about what THIS product does based on the code
- Sound natural when read aloud — like a friend explaining it
- NEVER say: game-changer, stunning, drive sales, sign up,
  visit our website, real results, seamlessly, leveraging,
  cutting-edge, robust, revolutionize, empower
- NEVER mention features that don't exist in the codebase
- NEVER add calls to action for things that don't exist
- Slide 1: one sentence stating the problem this solves
- Slides 2-4: specifically how it works, step by step
- Slide 5: one honest, simple closing line
- Total narration should take exactly ${durationSeconds} seconds to read aloud
`
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: scriptPrompt }],
      max_tokens: 1024
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
          model_id: "eleven_turbo_v2_5",
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
      console.error("ElevenLabs error:", err)
      return NextResponse.json(
        { error: "Failed to generate voiceover" },
        { status: 500 }
      )
    }

    const audioBuffer = await elevenResponse.arrayBuffer()

    const timestamp = Date.now()
    const tempDir = os.tmpdir()
    const audioPath = path.join(tempDir, `audio-${timestamp}.mp3`)
    const outputPath = path.join(tempDir, `video-${timestamp}.mp4`)

    fs.writeFileSync(audioPath, Buffer.from(audioBuffer))

    const screenshotPaths = [
      path.join(process.cwd(), "public/screenshots/s1.png"),
      path.join(process.cwd(), "public/screenshots/s2.png"),
      path.join(process.cwd(), "public/screenshots/s3.png"),
      path.join(process.cwd(), "public/screenshots/s4.png"),
    ]

    const bgColors: Record<string, string> = {
      midnight: "0f0c29",
      aurora: "0f2027",
      ember: "1a0000",
      forest: "000000",
      slate: "1c1c2e",
      void: "000000"
    }

    const bgColor = bgColors[background] || "0f0c29"
    const durationPerSlide = Math.floor(durationSeconds / screenshotPaths.length)

    await new Promise<void>((resolve, reject) => {
      const cmd = ffmpeg()

      screenshotPaths.forEach((p) => {
        cmd.input(p)
        cmd.inputOptions(["-loop 1", `-t ${durationPerSlide}`])
      })

      cmd.input(audioPath)

      cmd
        .complexFilter([
          ...screenshotPaths.map((_, i) =>
            `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=#${bgColor},setsar=1,fps=30[v${i}]`
          ),
          `${screenshotPaths.map((_, i) => `[v${i}]`).join("")}concat=n=${screenshotPaths.length}:v=1:a=0[outv]`
        ])
        .outputOptions([
          "-map [outv]",
          `-map ${screenshotPaths.length}:a`,
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