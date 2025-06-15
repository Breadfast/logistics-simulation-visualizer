
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Clock } from 'lucide-react';
import { Trip } from '@/types/trip';
import TimelineHeader from './timeline/TimelineHeader';
import TimelineAxis from './timeline/TimelineAxis';
import DriverLane from './timeline/DriverLane';
import TimelineLegend from './timeline/TimelineLegend';
import { 
  getAllEvents, 
  getDrivers, 
  getExpandedTimeRange
} from './timeline/timelineUtils';
import TimelinePlaybackControls from './timeline/TimelinePlaybackControls';

interface TimelineViewProps {
  trips: Trip[];
  currentTick: number;
  onTickChange?: (tick: number) => void; // Make this optional for legacy compatibility
}

const TimelineView: React.FC<TimelineViewProps> = ({ trips, currentTick, onTickChange }) => {
  const events = getAllEvents(trips);
  const drivers = getDrivers(trips);

  // --- Playback feature state ---
  // Only enable playback if parent passes onTickChange (we'll handle both controlled and uncontrolled use cases)
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x by default

  // Find the maxTick from the timeline events for robustness (fallback to 10 if empty)
  const { minTime, maxTime } = getExpandedTimeRange(events);

  // Prefer to infer maxTick from trips as before unless events are empty
  const derivedMaxTick = trips && trips.length > 0
    ? Math.max(...trips.map(t => t.tick ?? 1))
    : 10;

  const maxTick = Math.max(derivedMaxTick, currentTick || 1);

  // Playback effect: advance tick on interval when playing
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (playing && onTickChange) {
      intervalRef.current = window.setInterval(() => {
        onTickChange(Math.min(currentTick + 1, maxTick));
      }, 800 / playbackSpeed); // speed: 1x=0.8s, 2x=0.4s, etc
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playing, currentTick, playbackSpeed, onTickChange, maxTick]);

  // Pause if we're at the last tick
  useEffect(() => {
    if (playing && currentTick >= maxTick) {
      setPlaying(false);
    }
  }, [playing, currentTick, maxTick]);

  // Callbacks for TimelinePlaybackControls
  const handlePlay = useCallback(() => {
    setPlaying(true);
  }, []);
  const handlePause = useCallback(() => setPlaying(false), []);
  const handleRewind = useCallback(() => {
    if (onTickChange) onTickChange(Math.max(currentTick - 1, 1));
  }, [currentTick, onTickChange]);
  const handleFastForward = useCallback(() => {
    if (onTickChange) onTickChange(Math.min(currentTick + 1, maxTick));
  }, [currentTick, maxTick, onTickChange]);
  const handleSpeedChange = useCallback((spd: number) => {
    setPlaybackSpeed(spd);
  }, []);
  const handleTickSlider = useCallback((tick: number) => {
    if (onTickChange) onTickChange(tick);
  }, [onTickChange]);

  if (events.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600">No events to display in timeline</p>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="p-6">
        <div className="space-y-4">
          <TimelineHeader eventCount={events.length} />

          {/* --- Playback Controls --- */}
          {onTickChange && (
            <TimelinePlaybackControls
              currentTick={currentTick}
              minTick={1}
              maxTick={maxTick}
              playing={playing}
              speed={playbackSpeed}
              onPlay={handlePlay}
              onPause={handlePause}
              onRewind={handleRewind}
              onFastForward={handleFastForward}
              onTickChange={handleTickSlider}
              onSpeedChange={handleSpeedChange}
              disabled={false}
            />
          )}

          <TimelineAxis
            minTime={minTime}
            maxTime={maxTime}
            currentTick={currentTick}
          />

          <div className="space-y-6">
            {drivers.map((driverId) => {
              const driverEvents = events.filter(event => event.driverId === driverId);
              
              return (
                <DriverLane
                  key={driverId}
                  driverId={driverId}
                  events={driverEvents}
                  minTime={minTime}
                  maxTime={maxTime}
                />
              );
            })}
          </div>

          <TimelineLegend currentTick={currentTick} />
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default TimelineView;
