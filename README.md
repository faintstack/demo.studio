# demo.studio

Turn your GitHub repo into a demo video in under 2 minutes.

![Project Landing Page](./images/landing-pg.png)

Paste a URL. AI reads your code, writes the script, 
records the voiceover, and renders a polished MP4 — 
ready for Product Hunt, Twitter, or your pitch deck.

[Live Demo](https://demo-studio-mu.vercel.app/)

---

## The problem
Most developers ship without a demo video. Recording, 
scripting, editing, voiceover, it honestly takes hours most 
people don't have time. So, they write a README and hope 
someone reads it.

## What demo.studio does
You give it a GitHub URL. It gives you back a video.

## How it works
1. **Paste your repo URL** — any public GitHub repo works
2. **AI reads your code** — analyzes the file structure, 
   README, and dependencies to understand what you built
3. **Script is written** — a natural, conversational 
   narration is generated automatically
4. **Voice is recorded** — ElevenLabs turns the script 
   into a professional voiceover
5. **Video is rendered** — your screenshots, voice, 
   and background are assembled into an MP4

## Tech Stack

- **Next.js 14** - frontend and API routes
- **v0.dev** - entire UI generated with v0
- **Groq** (Llama 3.3 70B) - script generation
- **ElevenLabs** - AI voiceover
- **FFmpeg** - video assembly
- **GitHub API** - repo analysis
- **Vercel** - deployment

---

## Running locally

Clone the repo:
```bash
git clone https://github.com/faintstack/Demofy
cd Demofy
npm install
```

Create a `.env.local` file:
```env
GITHUB_TOKEN=your_github_token
GROQ_API_KEY=your_groq_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_FEMALE=your_female_voice_id
ELEVENLABS_VOICE_MALE=your_male_voice_id
```

Run the dev server:
```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).

---

## Getting API keys

| Service | Free tier | Link |
|---|---|---|
| GitHub Token | Yes | github.com/settings/tokens |
| Groq | Yes | console.groq.com |
| ElevenLabs | Yes (limited) | elevenlabs.io |

---

## What's next

- Live app URL → auto screenshots via Puppeteer
- More voice styles and accents
- Animated backgrounds
- Chrome extension — "Generate demo" button on 
  every GitHub repo page
- API access for CI/CD pipelines

---