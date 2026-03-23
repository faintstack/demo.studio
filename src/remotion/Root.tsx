import { Composition } from "remotion"
import { DemofyVideo } from "./DemofyVideo"

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DemofyVideo"
      component={DemofyVideo}
      durationInFrames={60 * 30}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        slides: [
          {
            slide: 1,
            narration: "Welcome to Demofy",
            duration: 5,
          },
        ],
        background: "midnight",
        audioBase64: "",
        screenshots: ["/screenshots/slide1.png"],
      }}
    />
  )
}