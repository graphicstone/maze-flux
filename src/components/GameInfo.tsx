import React from 'react';
import './GameInfo.css';

interface GameInfoProps {
  timeLeft: number;
  score: number;
  isGameWon: boolean;
  isGameLost: boolean;
  onRestart: () => void;
  intervalTime: number;
  onIncreaseInterval: () => void;
  onDecreaseInterval: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({ 
  timeLeft, 
  score, 
  isGameWon, 
  isGameLost, 
  onRestart,
  intervalTime,
  onIncreaseInterval,
  onDecreaseInterval,
  isPlaying,
  onTogglePlay
}) => {
  const formatTime = (time: number) => {
    return Math.max(0, time).toFixed(1);
  };

  const getTimeBarWidth = () => {
    return Math.max(0, (timeLeft / intervalTime) * 100);
  };

  const getTimeBarColor = () => {
    const percentage = getTimeBarWidth();
    if (percentage > 60) return '#2ecc71'; // Green
    if (percentage > 30) return '#f39c12'; // Orange
    return '#e74c3c'; // Red
  };

  return (
    <div className="game-info">
      <div className="info-row">
        <div className="score-display">
          <span className="label">Score:</span>
          <span className="value" style={{ color: score < 0 ? '#e74c3c' : score < 50 ? '#f39c12' : '#2ecc71' }}>
            {Math.round(score)}
          </span>
        </div>
        
        <div className="timer-display">
          <span className="label">Next Change:</span>
          <span className="value">{formatTime(timeLeft)}s</span>
        </div>
      </div>
      
      <div className="compact-controls">
        <button 
          className={`play-pause-btn ${isPlaying ? 'playing' : 'paused'}`}
          onClick={onTogglePlay}
          disabled={isGameWon || isGameLost}
        >
          {isPlaying ? '⏹️' : '▶️'}
        </button>
        
        <div className="interval-controls">
          <span className="control-label">Interval:</span>
          <div className="control-buttons">
            <button 
              className="control-btn decrease" 
              onClick={onDecreaseInterval}
              disabled={intervalTime <= 2 || isPlaying}
              aria-label="Decrease interval"
            >
              −
            </button>
            <span className="interval-display">{intervalTime}s</span>
            <button 
              className="control-btn increase" 
              onClick={onIncreaseInterval}
              disabled={intervalTime >= 10 || isPlaying}
              aria-label="Increase interval"
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      <div className="timer-bar-container">
        <div 
          className="timer-bar"
          style={{ 
            width: `${getTimeBarWidth()}%`,
            backgroundColor: getTimeBarColor()
          }}
        />
      </div>

      {isGameLost && (
        <div className="game-status game-lost">
          <h2>💀 Game Over 💀</h2>
          <p>Final Score: {Math.round(score)}</p>
          <button onClick={onRestart} className="restart-button">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GameInfo;
