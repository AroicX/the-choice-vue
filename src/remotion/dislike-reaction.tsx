import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const DISLIKE_REACTION_DURATION = 28;

export function DislikeReaction() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame, fps, config: { damping: 14, stiffness: 260, mass: 0.55 } });
  const shake = Math.sin(frame / 2.2) * interpolate(frame, [0, 10, 20], [6, 4, 0], { extrapolateRight: "clamp" });
  const fade = interpolate(frame, [14, DISLIKE_REACTION_DURATION], [1, 0], { extrapolateRight: "clamp" });
  const flash = interpolate(frame, [0, 6, 14], [0, 0.35, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 56,
          height: 56,
          borderRadius: "9999px",
          background: "rgba(59,130,246,0.18)",
          opacity: flash
        }}
      />
      <div
        style={{
          transform: `translateY(${interpolate(drop, [0, 1], [18, 0])}px) translateX(${shake}px) scale(${drop})`,
          opacity: fade,
          width: 36,
          height: 36,
          borderRadius: 12,
          background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
          boxShadow: "0 10px 24px rgba(59,130,246,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 17,
          fontWeight: 700
        }}
      >
        ↓
      </div>
    </AbsoluteFill>
  );
}
