import React, { useState, useEffect, useRef } from 'react';
import TripMap from './TripMap';
import RunSelector from './RunSelector';
import TickNavigator from './TickNavigator';
import RunSelectionScreen from './RunSelectionScreen';
import TimelineView from './TimelineView';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Map, Calendar, Info } from 'lucide-react';
import TimelinePlaybackControls from './timeline/TimelinePlaybackControls';
import { buildApiUrl, MAPBOX_TOKEN } from '@/config/api';
import { Trip } from '@/types/trip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TickStateView from './TickStateView';
import { Tick } from '@/types/tick';

const TripMapContainer = () => {
  const [selectedRun, setSelectedRun] = useState<number | null>(null);
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [selectedTickIdx, setSelectedTickIdx] = useState(0); // index in ticks array
  const [tickState, setTickState] = useState<Tick | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoadingTicks, setIsLoadingTicks] = useState(false);
  const [isLoadingTickState, setIsLoadingTickState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'timeline' | 'tickstate'>('map');

  // Playback controls (play/pause, speed)
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x default

  // Reference to playback interval
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch ticks for selected run
  useEffect(() => {
    if (!selectedRun) return;
    setIsLoadingTicks(true);
    setError(null);
    fetch(buildApiUrl(`/runs/${selectedRun}/ticks`))
      .then(res => res.json())
      .then((data: Tick[]) => {
        setTicks(data);
        setSelectedTickIdx(0);
      })
      .catch(() => setError('Failed to load ticks'))
      .finally(() => setIsLoadingTicks(false));
  }, [selectedRun]);

  // Fetch tick state and trips for selected tick
  useEffect(() => {
    if (!ticks.length) return;
    const tick = ticks[selectedTickIdx];
    if (!tick) return;
    setIsLoadingTickState(true);
    setError(null);
    Promise.all([
      fetch(buildApiUrl(`/ticks/${tick.id}`)).then(res => res.json()),
      fetch(buildApiUrl(`/ticks/${tick.id}/trips`)).then(res => res.json())
    ])
      .then(([tickData, tripsData]) => {
        setTickState(tickData);
        setTrips(tripsData);
      })
      .catch(() => setError('Failed to load tick state or trips'))
      .finally(() => setIsLoadingTickState(false));
  }, [ticks, selectedTickIdx]);

  // --- Playback effect: auto-advance ticks when playing ---
  useEffect(() => {
    // If not playing or already on last tick, stop and cleanup interval
    if (!playing || selectedTickIdx >= ticks.length - 1) {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      return;
    }
    // If current tick has no trips, pause playback (informational)
    if (trips.length === 0) {
      setPlaying(false);
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      return;
    }
    // Advance ticks at variable speed
    const interval = setInterval(() => {
      setSelectedTickIdx((prevIdx) => {
        if (prevIdx < ticks.length - 1) {
          return prevIdx + 1;
        } else {
          setPlaying(false);
          if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current);
            playbackIntervalRef.current = null;
          }
          return prevIdx;
        }
      });
    }, 1000 / playbackSpeed);
    playbackIntervalRef.current = interval;
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, playbackSpeed, selectedTickIdx, ticks.length]);

  // --- Keyboard controls for playback (optional) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'map' || isLoadingTicks || isLoadingTickState) return;
      if (e.code === 'Space') {
        setPlaying((p) => !p);
      }
      if (e.code === 'ArrowRight') {
        setSelectedTickIdx((idx) => Math.min(idx + 1, ticks.length - 1));
      }
      if (e.code === 'ArrowLeft') {
        setSelectedTickIdx((idx) => Math.max(0, idx - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isLoadingTicks, isLoadingTickState, ticks.length]);

  // Handlers
  const handleRunChange = (runId: number) => {
    setSelectedRun(runId);
    setTicks([]);
    setSelectedTickIdx(0);
    setTickState(null);
    setTrips([]);
  };
  const handleTickChange = (idx: number) => setSelectedTickIdx(idx);

  // --- Playback controls handlers ---
  const handlePlay = () => {
    // Only play if there are trips at this tick & not at last tick
    if (trips.length > 0 && selectedTickIdx < ticks.length - 1) setPlaying(true);
  };
  const handlePause = () => setPlaying(false);
  const handleRewind = () => {
    setSelectedTickIdx((idx) => Math.max(0, idx - 1));
    setPlaying(false);
  };
  const handleFastForward = () => {
    setSelectedTickIdx((idx) => Math.min(ticks.length - 1, idx + 1));
    setPlaying(false);
  };
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  // Trip fallback: does this tick have any trips?
  const tickHasTrips = trips.length > 0;

  // UI
  if (!selectedRun) {
    return <RunSelectionScreen selectedRun={selectedRun} onRunChange={handleRunChange} />;
  }
  if (isLoadingTicks) {
    return <div className="flex items-center justify-center h-screen">Loading ticks...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }
  const tick = ticks[selectedTickIdx];
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Trip Run</h2>
        </div>
        <div className="p-4 space-y-4">
          <RunSelector selectedRun={selectedRun} onRunChange={handleRunChange} />
              {/* Redesigned Tick Switcher with Primary Brand Colors */}
          <Card className="p-5 rounded-xl border border-primary-brand bg-primary-brand/5 shadow-sm">
            <div className="flex flex-col gap-3 items-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-primary-brand font-semibold text-base tracking-wide">Tick</span>
                <span className="bg-primary-brand text-white rounded px-2 py-0.5 text-xs font-bold border border-primary-brand">
                  {selectedTickIdx + 1} / {ticks.length}
                </span>
              </div>
              {tick && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Current Time:</span>
                  <span className="bg-primary-brand text-white rounded px-2 py-0.5 text-xs font-mono shadow">
                    {new Date(tick.current_time).toLocaleString('en-US', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 w-full justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleTickChange(Math.max(selectedTickIdx - 1, 0))}
                  disabled={selectedTickIdx === 0}
                  className="transition hover:bg-primary-brand/10 focus-ring-primary-brand border-primary-brand"
                  aria-label="Previous Tick"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                </Button>
                <input
                  type="range"
                  min={0}
                  max={ticks.length - 1}
                  value={selectedTickIdx}
                  onChange={e => handleTickChange(Number(e.target.value))}
                  className="w-40 accent-primary-brand cursor-pointer border-primary-brand"
                  style={{ background: 'linear-gradient(90deg, #AA0082 0%, #E754A6 100%)' }}
                  aria-label="Tick Slider"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleTickChange(Math.min(selectedTickIdx + 1, ticks.length - 1))}
                  disabled={selectedTickIdx === ticks.length - 1}
                  className="transition hover:bg-primary-brand/10 focus-ring-primary-brand border-primary-brand"
                  aria-label="Next Tick"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                </Button>
              </div>
              <div className="text-xs text-gray-400 mt-1">Use slider or arrows to navigate ticks</div>
            </div>
          </Card>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="flex flex-row gap-2 p-2 bg-gray-100">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="tickstate">Tick State</TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="flex-1 overflow-hidden">
            <TripMap trips={trips} mapboxToken={MAPBOX_TOKEN} />
          </TabsContent>
          <TabsContent value="timeline" className="flex-1 overflow-hidden">
            <TimelineView trips={trips} currentTick={selectedTickIdx + 1} />
          </TabsContent>
          <TabsContent value="tickstate" className="flex-1 overflow-y-auto">
            <TickStateView tick={tickState} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TripMapContainer;
