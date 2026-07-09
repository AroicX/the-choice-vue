"use client";

import { useEffect, useRef, useState } from "react";
import { AppIcon } from "@/components/ui/icon";
import { MuteIcon, PauseIcon, PlayIcon, VolumeHighIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

type CivicVideoPlayerProps = {
  src: string;
  className?: string;
  autoPlay?: boolean;
};

export function CivicVideoPlayer({ src, className, autoPlay = false }: CivicVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (autoPlay) {
      void video.play().catch(() => setPlaying(false));
    }
  }, [autoPlay, src]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function seek(value: number) {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = (value / 100) * duration;
    setProgress(value);
  }

  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  }

  return (
    <div className={cn("group relative overflow-hidden rounded-xl bg-slate-950", className)}>
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-contain"
        playsInline
        onClick={togglePlay}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
        }}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      {!playing ? (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 grid place-items-center bg-slate-950/20"
          aria-label="Play video"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow">
            <AppIcon icon={PlayIcon} size={24} />
          </span>
        </button>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent px-3 pb-3 pt-8 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(event) => seek(Number(event.target.value))}
          className="mb-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-primary"
          aria-label="Seek"
        />
        <div className="flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2">
            <button type="button" onClick={togglePlay} className="grid h-8 w-8 place-items-center rounded-full bg-white/10" aria-label={playing ? "Pause" : "Play"}>
              <AppIcon icon={playing ? PauseIcon : PlayIcon} size={16} />
            </button>
            <button type="button" onClick={toggleMute} className="grid h-8 w-8 place-items-center rounded-full bg-white/10" aria-label={muted ? "Unmute" : "Mute"}>
              <AppIcon icon={muted ? MuteIcon : VolumeHighIcon} size={16} />
            </button>
            <span className="text-xs text-white/80">
              {formatTime((progress / 100) * duration)} / {formatTime(duration)}
            </span>
          </div>
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
            TheChoice9ja
          </span>
        </div>
      </div>
    </div>
  );
}
