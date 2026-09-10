import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  delayRender,
  continueRender,
  interpolate,
  Easing,
} from "remotion";

// 7 Serif fonts
import { loadFont as loadLora } from "@remotion/google-fonts/Lora";
import { loadFont as loadPlayfairDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadSourceSerif4 } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadMerriweather } from "@remotion/google-fonts/Merriweather";
import { loadFont as loadCrimsonPro } from "@remotion/google-fonts/CrimsonPro";
import { loadFont as loadLibreBaskerville } from "@remotion/google-fonts/LibreBaskerville";
import { loadFont as loadCormorantGaramond } from "@remotion/google-fonts/CormorantGaramond";

// 7 Sans fonts
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";

// 7 Mono fonts
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadFiraCode } from "@remotion/google-fonts/FiraCode";
import { loadFont as loadIBMPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";
import { loadFont as loadRobotoMono } from "@remotion/google-fonts/RobotoMono";
import { loadFont as loadSourceCodePro } from "@remotion/google-fonts/SourceCodePro";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";

// Pre-load all 21 fonts
const fontLoaders = [
  // 1-7 Serif
  loadLora(),
  loadPlayfairDisplay(),
  loadSourceSerif4(),
  loadMerriweather(),
  loadCrimsonPro(),
  loadLibreBaskerville(),
  loadCormorantGaramond(),
  // 8-14 Sans
  loadGeist(),
  loadInter(),
  loadSpaceGrotesk(),
  loadArchivo(),
  loadSora(),
  loadManrope(),
  loadDMSans(),
  // 15-21 Mono
  loadJetBrainsMono(),
  loadFiraCode(),
  loadIBMPlexMono(),
  loadSpaceMono(),
  loadRobotoMono(),
  loadSourceCodePro(),
  loadGeistMono(),
];

interface SegmentDef {
  name: string;
  duration: number;
  fontFamily: string;
  fallbackGeneric: "serif" | "sans-serif" | "monospace";
  fontWeight: number | string;
  letterSpacing?: string;
  bg: string;
  color: string;
  isFinal?: boolean;
}

const RAW_SEGMENTS: SegmentDef[] = [
  // --- SERIF (Segments 1-7) ---
  // 1. Lora, weight 600 — bg #87CEEB, text #141413 (6 frames)
  {
    name: "Lora",
    duration: 6,
    fontFamily: fontLoaders[0].fontFamily,
    fallbackGeneric: "serif",
    fontWeight: 600,
    bg: "#87CEEB",
    color: "#141413",
  },
  // 2. Playfair Display — bg #F5E3C7, text #141413 (6 frames)
  {
    name: "Playfair Display",
    duration: 6,
    fontFamily: fontLoaders[1].fontFamily,
    fallbackGeneric: "serif",
    fontWeight: 600,
    bg: "#F5E3C7",
    color: "#141413",
  },
  // 3. Source Serif Pro (Source Serif 4) — bg #E3DACC, text #141413 (6 frames)
  {
    name: "Source Serif 4",
    duration: 6,
    fontFamily: fontLoaders[2].fontFamily,
    fallbackGeneric: "serif",
    fontWeight: 600,
    bg: "#E3DACC",
    color: "#141413",
  },
  // 4. Merriweather — bg #D97757, text #FAF9F5 (4 frames)
  {
    name: "Merriweather",
    duration: 4,
    fontFamily: fontLoaders[3].fontFamily,
    fallbackGeneric: "serif",
    fontWeight: 700,
    bg: "#D97757",
    color: "#FAF9F5",
  },
  // 5. Crimson Pro — bg #3D3D3A, text #FAF9F5 (4 frames)
  {
    name: "Crimson Pro",
    duration: 4,
    fontFamily: fontLoaders[4].fontFamily,
    fallbackGeneric: "serif",
    fontWeight: 600,
    bg: "#3D3D3A",
    color: "#FAF9F5",
  },
  // 6. Libre Baskerville — bg #10B981, text #141413 (4 frames)
  {
    name: "Libre Baskerville",
    duration: 4,
    fontFamily: fontLoaders[5].fontFamily,
    fallbackGeneric: "serif",
    fontWeight: 700,
    bg: "#10B981",
    color: "#141413",
  },
  // 7. Cormorant Garamond — bg #B0AEA5, text #141413 (4 frames)
  {
    name: "Cormorant Garamond",
    duration: 4,
    fontFamily: fontLoaders[6].fontFamily,
    fallbackGeneric: "serif",
    fontWeight: 600,
    bg: "#B0AEA5",
    color: "#141413",
  },

  // --- SANS (Segments 8-14) ---
  // 8. Geist Sans, weight 700 — bg #FFFFFF, text #000000 (4 frames)
  {
    name: "Geist Sans",
    duration: 4,
    fontFamily: fontLoaders[7].fontFamily,
    fallbackGeneric: "sans-serif",
    fontWeight: 700,
    bg: "#FFFFFF",
    color: "#000000",
  },
  // 9. Inter — bg #EF4444, text #FFFFFF (4 frames)
  {
    name: "Inter",
    duration: 4,
    fontFamily: fontLoaders[8].fontFamily,
    fallbackGeneric: "sans-serif",
    fontWeight: 700,
    bg: "#EF4444",
    color: "#FFFFFF",
  },
  // 10. Space Grotesk — bg #3B82F6, text #FFFFFF (4 frames)
  {
    name: "Space Grotesk",
    duration: 4,
    fontFamily: fontLoaders[9].fontFamily,
    fallbackGeneric: "sans-serif",
    fontWeight: 700,
    bg: "#3B82F6",
    color: "#FFFFFF",
  },
  // 11. Archivo — bg #FACC15, text #141413 (4 frames)
  {
    name: "Archivo",
    duration: 4,
    fontFamily: fontLoaders[10].fontFamily,
    fallbackGeneric: "sans-serif",
    fontWeight: 700,
    bg: "#FACC15",
    color: "#141413",
  },
  // 12. Sora — bg #8B5CF6, text #FFFFFF (4 frames)
  {
    name: "Sora",
    duration: 4,
    fontFamily: fontLoaders[11].fontFamily,
    fallbackGeneric: "sans-serif",
    fontWeight: 700,
    bg: "#8B5CF6",
    color: "#FFFFFF",
  },
  // 13. Manrope — bg #F97316, text #141413 (4 frames)
  {
    name: "Manrope",
    duration: 4,
    fontFamily: fontLoaders[12].fontFamily,
    fallbackGeneric: "sans-serif",
    fontWeight: 700,
    bg: "#F97316",
    color: "#141413",
  },
  // 14. DM Sans — bg #EC4899, text #FFFFFF (4 frames)
  {
    name: "DM Sans",
    duration: 4,
    fontFamily: fontLoaders[13].fontFamily,
    fallbackGeneric: "sans-serif",
    fontWeight: 700,
    bg: "#EC4899",
    color: "#FFFFFF",
  },

  // --- MONO (Segments 15-21) ---
  // 15. JetBrains Mono — bg #F0EEE6, text #141413 (4 frames)
  {
    name: "JetBrains Mono",
    duration: 4,
    fontFamily: fontLoaders[14].fontFamily,
    fallbackGeneric: "monospace",
    fontWeight: 700,
    bg: "#F0EEE6",
    color: "#141413",
  },
  // 16. Fira Code — bg #1E293B, text #FAF9F5 (4 frames)
  {
    name: "Fira Code",
    duration: 4,
    fontFamily: fontLoaders[15].fontFamily,
    fallbackGeneric: "monospace",
    fontWeight: 700,
    bg: "#1E293B",
    color: "#FAF9F5",
  },
  // 17. IBM Plex Mono — bg #FDE68A, text #141413 (4 frames)
  {
    name: "IBM Plex Mono",
    duration: 4,
    fontFamily: fontLoaders[16].fontFamily,
    fallbackGeneric: "monospace",
    fontWeight: 700,
    bg: "#FDE68A",
    color: "#141413",
  },
  // 18. Space Mono — bg #059669, text #FFFFFF (6 frames)
  {
    name: "Space Mono",
    duration: 6,
    fontFamily: fontLoaders[17].fontFamily,
    fallbackGeneric: "monospace",
    fontWeight: 700,
    bg: "#059669",
    color: "#FFFFFF",
  },
  // 19. Roboto Mono — bg #7C3AED, text #FFFFFF (6 frames)
  {
    name: "Roboto Mono",
    duration: 6,
    fontFamily: fontLoaders[18].fontFamily,
    fallbackGeneric: "monospace",
    fontWeight: 700,
    bg: "#7C3AED",
    color: "#FFFFFF",
  },
  // 20. Source Code Pro — bg #DC2626, text #FFFFFF (6 frames)
  {
    name: "Source Code Pro",
    duration: 6,
    fontFamily: fontLoaders[19].fontFamily,
    fallbackGeneric: "monospace",
    fontWeight: 700,
    bg: "#DC2626",
    color: "#FFFFFF",
  },
  // 21. FINAL — Geist Mono, weight 700, tracking +0.05em — bg #000000, text #FFFFFF (28 frames)
  {
    name: "Geist Mono",
    duration: 28,
    fontFamily: fontLoaders[20].fontFamily,
    fallbackGeneric: "monospace",
    fontWeight: 700,
    letterSpacing: "0.05em",
    bg: "#000000",
    color: "#FFFFFF",
    isFinal: true,
  },
];

// Calculate starting frame ('from') for each sequence
export const SEGMENTS = (() => {
  let accumulated = 0;
  return RAW_SEGMENTS.map((seg) => {
    const from = accumulated;
    accumulated += seg.duration;
    return { ...seg, from };
  });
})();

export const TOTAL_FRAMES = SEGMENTS.reduce((sum, s) => sum + s.duration, 0); // Exactly 120

interface SegmentViewProps {
  segment: (typeof SEGMENTS)[0];
}

const SegmentView: React.FC<SegmentViewProps> = ({ segment }) => {
  const frame = useCurrentFrame();

  // Fluidity animation:
  // - Segments 1-20: scale-in from 0.85 -> 1.0 over 2-3 frames with sharp ease-out-expo snap
  // - Segment 21 (final): smoother ease-in over 4 frames for a deliberate landing
  const isFinal = !!segment.isFinal;
  const animDuration = isFinal ? 4 : 2.5;
  const easing = isFinal
    ? Easing.out(Easing.cubic)
    : Easing.bezier(0.16, 1, 0.3, 1);

  const scale = interpolate(frame, [0, animDuration], [0.85, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: segment.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      <div
        style={{
          fontFamily: `"${segment.fontFamily}", ${segment.fallbackGeneric}`,
          fontWeight: segment.fontWeight,
          letterSpacing: segment.letterSpacing || "normal",
          color: segment.color,
          fontSize: 200,
          lineHeight: 1,
          textAlign: "center",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        v1.8
      </div>
    </AbsoluteFill>
  );
};

export const TokenTrackerTrailer: React.FC = () => {
  const [handle] = useState(() => delayRender("Waiting for all 21 fonts to load"));

  useEffect(() => {
    Promise.all(fontLoaders.map((f) => f.waitUntilDone()))
      .then(() => {
        continueRender(handle);
      })
      .catch((err) => {
        console.error("Font loading error:", err);
        continueRender(handle);
      });
  }, [handle]);

  return (
    <AbsoluteFill>
      {SEGMENTS.map((seg, idx) => (
        <Sequence
          key={idx}
          from={seg.from}
          durationInFrames={seg.duration}
          layout="none"
        >
          <SegmentView segment={seg} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
