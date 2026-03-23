import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "fluent-ffmpeg",
    "@ffmpeg-installer/ffmpeg",
    "@remotion/bundler",
    "@remotion/renderer"
  ]
}

export default nextConfig