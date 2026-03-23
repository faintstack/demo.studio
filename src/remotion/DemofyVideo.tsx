import { AbsoluteFill, Audio, Img, Sequence, staticFile, useVideoConfig } from "remotion"

export type Slide = {
  slide: number
  narration: string
  duration: number
}

export type DemofyVideoProps = {
  slides: Slide[]
  background: string
  audioBase64: string
  screenshots: string[]
}

const backgrounds: Record<string, string> = {
  midnight: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
  aurora: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
  ember: "linear-gradient(135deg, #1a0000, #3d0000, #7f0000)",
  forest: "linear-gradient(135deg, #000000, #0f3443, #1a4a2e)",
  slate: "linear-gradient(135deg, #1c1c2e, #2d2d44, #1a1a2e)",
  void: "linear-gradient(135deg, #000000, #0a0a0a, #111111)",
}

export const DemofyVideo: React.FC<DemofyVideoProps> = ({
  slides,
  background,
  audioBase64,
  screenshots,
}) => {
  const { fps } = useVideoConfig()

  const bgStyle = backgrounds[background] || backgrounds.midnight

  let currentFrame = 0

  return (
    <AbsoluteFill style={{ background: bgStyle }}>
      {/* Audio track */}
      <Audio src={`data:audio/mp3;base64,${audioBase64}`} />

      {/* Slides */}
      {slides.map((slide, index) => {
        const startFrame = currentFrame
        const durationFrames = slide.duration * fps
        currentFrame += durationFrames

        const screenshotIndex = index % screenshots.length
        const screenshot = screenshots[screenshotIndex]

        return (
          <Sequence
            key={slide.slide}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <AbsoluteFill
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px",
              }}
            >
              {/* Screenshot */}
              <div
                style={{
                  width: "75%",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                  marginBottom: "32px",
                }}
              >
                <Img
                  src={screenshot}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>

              {/* Caption */}
              <div
                style={{
                  background: "rgba(0,0,0,0.6)",
                  borderRadius: "8px",
                  padding: "16px 24px",
                  maxWidth: "70%",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    color: "#fafafa",
                    fontSize: "24px",
                    fontWeight: 500,
                    lineHeight: 1.4,
                    margin: 0,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {slide.narration}
                </p>
              </div>
            </AbsoluteFill>
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}