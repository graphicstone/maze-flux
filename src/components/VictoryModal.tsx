import React from 'react';
import './VictoryModal.css';

interface VictoryModalProps {
  isVisible: boolean;
  score: number;
  onRestart: () => void;
  intervalTime: number; // The maze change interval (2-10 seconds)
}

const VictoryModal: React.FC<VictoryModalProps> = ({ 
  isVisible, 
  score, 
  onRestart, 
  intervalTime 
}) => {

  if (!isVisible) return null;

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "🔥 AMAZING! Lightning fast!";
    if (score >= 60) return "🎯 EXCELLENT! Great speed!";
    if (score >= 40) return "👍 GOOD! Nice work!";
    if (score >= 20) return "😊 NOT BAD! Keep practicing!";
    if (score >= 0) return "😅 BARELY MADE IT! But you did it!";
    return "💀 TERRIBLE TIME! But hey, you finished!";
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return '#2ecc71';
    if (score >= 20) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="modal-overlay">
      <div className="victory-modal">
        <div className="victory-header">
          <h2>🎉 Congratulations! 🎉</h2>
          <div className="victory-message">
            {getScoreMessage(score)}
          </div>
        </div>
        
        <div className="score-section">
          <div className="score-label">Final Score:</div>
          <div 
            className="score-value" 
            style={{ color: getScoreColor(score) }}
          >
            {Math.round(score)}
          </div>
        </div>
        
        <div className="game-settings">
          <div className="setting-label">Game Settings:</div>
          <div className="interval-info">
            <span className="interval-label">Maze Change Interval:</span>
            <span className="interval-value">{intervalTime}s</span>
          </div>
        </div>
        
        <button 
          className="restart-btn"
          onClick={onRestart}
        >
          🏎️ Play Again
        </button>
      </div>
    </div>
  );
};

export default VictoryModal;
