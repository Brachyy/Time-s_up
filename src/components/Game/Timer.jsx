import React, { useEffect, useState, useRef } from 'react';
import { soundManager } from '../../utils/SoundManager';

const Timer = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const endTimeRef = useRef(Date.now() + duration * 1000);
  
  useEffect(() => {
    endTimeRef.current = Date.now() + duration * 1000;
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    const updateTime = () => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      
      if (remaining <= 0) {
        setTimeLeft(0);
        soundManager.playTimeUp();
        onTimeUp();
        return true; // ended
      }
      
      setTimeLeft(prev => {
        if (remaining <= 10 && remaining !== prev) {
          soundManager.playTick();
        }
        return remaining;
      });
      return false; 
    };

    const intervalId = setInterval(() => {
      const ended = updateTime();
      if (ended) clearInterval(intervalId);
    }, 100);

    return () => clearInterval(intervalId);
  }, [onTimeUp]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  
  // We use key={duration} to force reset animation if duration restarts
  return (
    <div className="relative flex items-center justify-center mb-8">
      <svg width="160" height="160" className="transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="12"
          fill="transparent"
        />
        <circle
          key={endTimeRef.current} // Reset animation when timer restarts
          cx="80"
          cy="80"
          r={radius}
          stroke={timeLeft <= 10 ? '#ef4444' : '#22c55e'}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          style={{
            animation: `countdown ${duration}s linear forwards`
          }}
        />
        <style>{`
          @keyframes countdown {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: ${circumference}; }
          }
        `}</style>
      </svg>

      <div className={`absolute text-5xl font-black font-mono drop-shadow-sm ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-800'}`}>
        {timeLeft}
      </div>
    </div>
  );
};

export default Timer;
