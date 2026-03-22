import { NextRequest, NextResponse } from "next/server"
import { Octokit } from "octokit"
import Groq from "groq-sdk"

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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
    const { repoUrl, scriptMode, customScript, duration, background } = body

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

    // Step 1: Get file tree
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

    // Step 2: Get README
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

    // Step 3: Get package.json
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

    // Step 4: Generate script with Claude
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
- Split into 4-6 slides
- Total duration must equal ${durationSeconds} seconds
- Keep the user's exact words as much as possible
`
    } else {
      scriptPrompt = `
You are a product demo video script writer.
Analyze this GitHub repository and write a compelling 
${durationSeconds}-second demo video script.

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
    "narration": "narration text for this slide",
    "duration": 8
  }
]

Rules:
- 4-6 slides total
- Total duration must equal exactly ${durationSeconds} seconds
- Tone: confident, clear, Product Hunt style
- Focus on what the product DOES and who it helps
- No technical jargon
- No tool names like React or Node unless essential
- First slide introduces the problem or product
- Last slide is a call to action
`
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: scriptPrompt }],
      max_tokens: 1024
    })
    const rawScript = completion.choices[0].message.content || ""


    // Parse JSON from Gemini response
    const jsonMatch = rawScript.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to generate script" },
        { status: 500 }
      )
    }

    const slides = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      data: {
        owner,
        repo,
        slides,
        background,
        duration: durationSeconds
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