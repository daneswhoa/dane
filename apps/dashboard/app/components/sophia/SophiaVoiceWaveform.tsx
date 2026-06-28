import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface SophiaVoiceWaveformProps {
  audioBase64: string;
  audioMimeType?: string;
  duration?: number;
}

export function SophiaVoiceWaveform({
  audioBase64,
  audioMimeType = 'audio/webm',
  duration = 0,
}: SophiaVoiceWaveformProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [waveHeights, setWaveHeights] = useState<number[]>([]);

  // Generate deterministic wave heights so it doesn't look flat or change randomly
  useEffect(() => {
    const barCount = 24;
    const heights: number[] = [];
    // Use a simple pseudo-random generator based on audioBase64 string length
    let seed = audioBase64.length;
    for (let i = 0; i < barCount; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const progress = seed / 233280;
      // Normal distribution-ish heights for a nice wave center
      const factor = Math.sin((i / (barCount - 1)) * Math.PI);
      heights.push(Math.round(20 + progress * 60 * factor));
    }
    setWaveHeights(heights);
  }, [audioBase64]);

  useEffect(() => {
    // Construct base64 source URL
    const src = `data:${audioMimeType};base64,${audioBase64}`;
    const audio = new Audio(src);
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioBase64, audioMimeType]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error('Audio play failed:', err));
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine active bar index based on progress
  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const activeBarCount = Math.floor(progressRatio * waveHeights.length);

  return (
    <div className="flex items-center gap-3 py-2 px-3 bg-paper-100/50 dark:bg-ink-900/50 border border-paper-200 dark:border-ink-800 rounded-xl max-w-xs my-1 shadow-sm">
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-coral-500 hover:bg-coral-650 text-white flex items-center justify-center flex-shrink-0 transition-all active:scale-95 shadow-sm shadow-coral-500/20"
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-end gap-[2px] h-6 px-1">
          {waveHeights.map((height, idx) => {
            const isActive = idx < activeBarCount || (isPlaying && idx === activeBarCount);
            return (
              <div
                key={idx}
                className={`w-[3px] rounded-full transition-all duration-150`}
                style={{
                  height: `${height}%`,
                  backgroundColor: isActive ? '#FF5A5F' : '#E2E8F0', // Coral or light gray
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-1 px-1 text-[9px] font-mono text-paper-400 dark:text-ink-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
