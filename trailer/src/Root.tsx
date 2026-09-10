import "./index.css";
import { Composition } from "remotion";
import { TokenTrackerTrailer } from "./TokenTrackerTrailer";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TokenTrackerTrailer"
        component={TokenTrackerTrailer}
        durationInFrames={195}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
