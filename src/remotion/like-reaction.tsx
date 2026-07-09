import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const LIKE_REACTION_DURATION = 30;

export function LikeReaction() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 11, stiffness: 220, mass: 0.5 } });
  const fade = interpolate(frame, [16, LIKE_REACTION_DURATION], [1, 0], { extrapolateRight: "clamp" });
  const ring = interpolate(frame, [0, 18], [0.4, 1.8], { extrapolateRight: "clamp" });
  const ringOpacity = interpolate(frame, [0, 8, 22], [0, 0.45, 0], { extrapolateRight: "clamp" });

  const particles = Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2;
    const distance = interpolate(frame, [2, 22], [0, 34], { extrapolateRight: "clamp" });
    const particleOpacity = interpolate(frame, [4, 24], [1, 0], { extrapolateRight: "clamp" });
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: particleOpacity * fade
    };
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 44,
          height: 44,
          borderRadius: "9999px",
          border: "2px solid rgba(239,68,68,0.55)",
          transform: `scale(${ring})`,
          opacity: ringOpacity
        }}
      />
      {particles.map((particle, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            width: 7,
            height: 7,
            borderRadius: "9999px",
            background: index % 2 === 0 ? "#ef4444" : "#fb7185",
            transform: `translate(${particle.x}px, ${particle.y}px)`,
            opacity: particle.opacity
          }}
        />
      ))}
      <div
        style={{
          transform: `scale(${pop})`,
          opacity: fade,
          width: 36,
          height: 36,
          borderRadius: "9999px",
          background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
          boxShadow: "0 10px 30px rgba(239,68,68,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 18,
          fontWeight: 700
        }}
      >
        ♥
      </div>
    </AbsoluteFill>
  );
}
