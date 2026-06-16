import { Composition } from "remotion";
import { StudyHubReels, REELS_DURATION_IN_FRAMES } from "./compositions/StudyHubReels";
import { EsepBuhReel1, REEL1_FRAMES, EsepBuhReel2, REEL2_FRAMES } from "./compositions/EsepBuhReels";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="StudyHubReels"
        component={StudyHubReels}
        durationInFrames={REELS_DURATION_IN_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EsepBuhReel1"
        component={EsepBuhReel1}
        durationInFrames={REEL1_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EsepBuhReel2"
        component={EsepBuhReel2}
        durationInFrames={REEL2_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
