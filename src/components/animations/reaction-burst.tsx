"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { PlayerRef } from "@remotion/player";
import { DISLIKE_REACTION_DURATION, DislikeReaction } from "@/remotion/dislike-reaction";
import { LIKE_REACTION_DURATION, LikeReaction } from "@/remotion/like-reaction";

const Player = dynamic(() => import("@remotion/player").then((module) => module.Player), { ssr: false });

type ReactionBurstProps = {
  type: "like" | "dislike";
  trigger: number;
};

export function ReactionBurst({ type, trigger }: ReactionBurstProps) {
  const playerRef = useRef<PlayerRef>(null);
  const [instance, setInstance] = useState(0);

  useEffect(() => {
    if (trigger <= 0) return;
    setInstance((value) => value + 1);
    const timer = window.setTimeout(() => {
      playerRef.current?.seekTo(0);
      playerRef.current?.play();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [trigger]);

  if (trigger <= 0) return null;

  const duration = type === "like" ? LIKE_REACTION_DURATION : DISLIKE_REACTION_DURATION;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-visible">
      <Player
        key={`${type}-${instance}`}
        ref={playerRef}
        component={type === "like" ? LikeReaction : DislikeReaction}
        durationInFrames={duration}
        compositionWidth={96}
        compositionHeight={96}
        fps={30}
        style={{ width: 96, height: 96 }}
        loop={false}
        controls={false}
        autoPlay={false}
      />
    </div>
  );
}
