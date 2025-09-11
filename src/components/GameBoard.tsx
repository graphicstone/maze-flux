import React from 'react';
import { Cell, CellType, Position } from '../types/game';
import './GameBoard.css';

interface GameBoardProps {
  maze: Cell[][];
  playerPosition: Position;
  gridSize: number;
  isChanging?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ maze, playerPosition, gridSize, isChanging = false }) => {
  const getCellClassName = (cell: Cell, isPlayerHere: boolean) => {
    const baseClass = 'cell';
    
    if (isPlayerHere) {
      return `${baseClass} cell-player`;
    }
    
    switch (cell.type) {
      case CellType.WALL:
        return `${baseClass} cell-wall`;
      case CellType.PATH:
        return `${baseClass} cell-path`;
      case CellType.START:
        return `${baseClass} cell-start`;
      case CellType.END:
        return `${baseClass} cell-end`;
      default:
        return baseClass;
    }
  };

  const getCellContent = (cell: Cell, isPlayerHere: boolean) => {
    if (isPlayerHere) return '🏎️';
    
    switch (cell.type) {
      case CellType.START:
        return '🏁';
      case CellType.END:
        return '🎯';
      default:
        return '';
    }
  };

  if (!maze.length) {
    return <div className="game-board loading">Loading...</div>;
  }

  return (
    <div 
      className={`game-board ${isChanging ? 'changing' : ''}`}
      style={{ 
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`
      }}
    >
      {maze.map((row, y) =>
        row.map((cell, x) => {
          const isPlayerHere = playerPosition.x === x && playerPosition.y === y;
          return (
            <div
              key={`${x}-${y}`}
              className={getCellClassName(cell, isPlayerHere)}
              data-x={x}
              data-y={y}
            >
              {getCellContent(cell, isPlayerHere)}
            </div>
          );
        })
      )}
    </div>
  );
};

export default GameBoard;
