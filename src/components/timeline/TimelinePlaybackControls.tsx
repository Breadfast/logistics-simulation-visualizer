
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, FastForward, Rewind } from "lucide-react";

interface TimelinePlaybackControlsProps {
  currentTick: number;
  maxTick: number;
  minTick?: number;
  playing: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  onTickChange: (tick: number) => void;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

const speedOptions = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "2x", value: 2 },
  { label: "4x", value: 4 },
];

const TimelinePlaybackControls: React.FC<TimelinePlaybackControlsProps> = ({
  currentTick,
  maxTick,
  minTick = 1,
  playing,
  speed,
  onPlay,
  onPause,
  onRewind,
  onFastForward,
  onTickChange,
  onSpeedChange,
  disabled = false,
}) => {
  // Keyboard controls (space to play/pause, left/right for navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.code === "Space") {
        playing ? onPause() : onPlay();
      }
      if (e.code === "ArrowRight") {
        onFastForward();
      }
      if (e.code === "ArrowLeft") {
        onRewind();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playing, onPause, onPlay, onRewind, onFastForward, disabled]);

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-4 bg-white rounded-lg p-2 shadow animate-fade-in">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Rewind"
          onClick={onRewind}
          disabled={currentTick <= minTick || disabled}
        >
          <Rewind className="h-5 w-5" />
        </Button>
        {playing ? (
          <Button
            size="icon"
            aria-label="Pause"
            onClick={onPause}
            disabled={disabled}
          >
            <Pause className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            aria-label="Play"
            onClick={onPlay}
            disabled={currentTick >= maxTick || disabled}
          >
            <Play className="h-5 w-5" />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          aria-label="Fast Forward"
          onClick={onFastForward}
          disabled={currentTick >= maxTick || disabled}
        >
          <FastForward className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Tick slider */}
        <Slider
          value={[currentTick]}
          onValueChange={(v) => onTickChange(v[0])}
          min={minTick}
          max={maxTick}
          step={1}
          disabled={disabled}
          className="flex-1"
        />
        <span className="ml-4 text-xs text-gray-600 whitespace-nowrap">
          Tick {currentTick}/{maxTick}
        </span>
      </div>
      {/* Speed controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Speed:</span>
        <select
          className="border rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          disabled={disabled}
        >
          {speedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TimelinePlaybackControls;

