import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameConfig, Position, CellType } from '../types/game';
import { MazeGenerator } from '../utils/mazeGenerator';
import GameBoard from './GameBoard';
import GameInfo from './GameInfo';
import VictoryModal from './VictoryModal';
import './Game.css';

const defaultConfig: GameConfig = {
  gridSize: 25,  // Increased from 8 to 25
  intervalTime: 5, // Default - will be overridden by user setting
  pathDensity: 0.18  // Much more restrictive - only 18% paths
};

// Countdown scoring system - you start with 100 and lose points over time
const STARTING_SCORE = 100;
const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    maze: [],
    playerPosition: { x: 0, y: defaultConfig.gridSize - 1 },
    isGameWon: false,
    isGameLost: false,
    timeLeft: defaultConfig.intervalTime,
    score: STARTING_SCORE // Start with 100 points
  });

  const [isChanging, setIsChanging] = useState(false);
  const [, setTickCounter] = useState(0); // Used in timer effect for score calculation
  const [intervalTime, setIntervalTime] = useState(5); // User-configurable interval
  const [isPlaying, setIsPlaying] = useState(false); // Game play/pause state

  const [mazeGenerator] = useState(new MazeGenerator(defaultConfig));

  const increaseInterval = () => {
    setIntervalTime(prev => Math.min(10, prev + 1)); // Max 10 seconds
  };

  const decreaseInterval = () => {
    setIntervalTime(prev => Math.max(2, prev - 1)); // Min 2 seconds
  };

  const togglePlay = () => {
    if (isPlaying) {
      // Stop the game and reset everything
      setIsPlaying(false);
      setTickCounter(0);
      const maze = mazeGenerator.generateMaze();
      setGameState(prevState => ({
        ...prevState,
        maze,
        playerPosition: { x: 0, y: defaultConfig.gridSize - 1 },
        timeLeft: intervalTime,
        score: STARTING_SCORE,
        isGameWon: false,
        isGameLost: false
      }));
    } else {
      // Start the game
      setIsPlaying(true);
    }
  };

  const initializeGame = useCallback(() => {
    const maze = mazeGenerator.generateMaze();
    setTickCounter(0); // Reset tick counter
    setIsPlaying(false); // Stop the game when initializing
    setGameState(prevState => ({
      ...prevState,
      maze,
      playerPosition: { x: 0, y: defaultConfig.gridSize - 1 },
      isGameWon: false,
      isGameLost: false,
      timeLeft: intervalTime, // Use user-configurable interval
      score: STARTING_SCORE // Reset to 100 points
    }));
  }, [mazeGenerator, intervalTime]);

  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.isGameWon || gameState.isGameLost || !isPlaying) return; // Only allow movement when game is playing

    const { playerPosition, maze } = gameState;
    let newPosition: Position = { ...playerPosition };

    switch (direction) {
      case 'up':
        newPosition.y = Math.max(0, playerPosition.y - 1);
        break;
      case 'down':
        newPosition.y = Math.min(defaultConfig.gridSize - 1, playerPosition.y + 1);
        break;
      case 'left':
        newPosition.x = Math.max(0, playerPosition.x - 1);
        break;
      case 'right':
        newPosition.x = Math.min(defaultConfig.gridSize - 1, playerPosition.x + 1);
        break;
    }

    // Check if the new position is valid (not a wall)
    const targetCell = maze[newPosition.y][newPosition.x];
    if (targetCell.type === CellType.WALL) {
      return; // Can't move to a wall
    }

    // Check if player reached the end
    const isWin = newPosition.x === defaultConfig.gridSize - 1 && newPosition.y === 0;

    setGameState(prevState => ({
      ...prevState,
      playerPosition: newPosition,
      isGameWon: isWin
      // Score stays as is when you win - whatever you have left is your final score!
    }));
  }, [gameState, isPlaying]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer('right');
          break;
        case 'r':
        case 'R':
          if (gameState.isGameWon || gameState.isGameLost) {
            initializeGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer, gameState.isGameWon, gameState.isGameLost, initializeGame, isPlaying]);

  // Timer effect
  useEffect(() => {
    if (gameState.isGameWon || gameState.isGameLost || !isPlaying) return;

    const timer = setInterval(() => {
      setTickCounter(prevCounter => {
        const newCounter = prevCounter + 1;
        
        setGameState(prevState => {
          const newTimeLeft = prevState.timeLeft - 0.1;
          // Lose 1 point every 5 ticks (0.5 seconds) - this gives us 2 points per second
          const shouldLosePoint = newCounter % 5 === 0;
          const newScore = shouldLosePoint ? prevState.score - 1 : prevState.score;
          
          if (newTimeLeft <= 0) {
            // Time's up - generate new maze directly here
            const newMaze = mazeGenerator.generateMaze();
            console.log('🔄 Maze regenerated!', new Date().toLocaleTimeString());
            setIsChanging(true);
            setTimeout(() => setIsChanging(false), 300); // Brief flash effect
            
            return {
              ...prevState,
              maze: newMaze,
              timeLeft: intervalTime, // Use user-configurable interval
              score: newScore // Continue losing points
              // Player position stays the same - this is the core challenge!
            };
          }
          
          return {
            ...prevState,
            timeLeft: newTimeLeft,
            score: newScore // Continuously lose points over time
          };
        });
        
        return newCounter;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState.isGameWon, gameState.isGameLost, mazeGenerator, isPlaying]);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <div className="game-container">
      <GameInfo 
        timeLeft={gameState.timeLeft}
        score={gameState.score}
        isGameWon={gameState.isGameWon}
        isGameLost={gameState.isGameLost}
        onRestart={initializeGame}
        intervalTime={intervalTime}
        onIncreaseInterval={increaseInterval}
        onDecreaseInterval={decreaseInterval}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
      />
      <GameBoard 
        maze={gameState.maze}
        playerPosition={gameState.playerPosition}
        gridSize={defaultConfig.gridSize}
        isChanging={isChanging}
      />
      <div className="game-controls">
        <p>Use WASD or arrow keys to move</p>
        {(gameState.isGameWon || gameState.isGameLost) && (
          <p>Press R to restart</p>
        )}
      </div>
      
      <VictoryModal 
        isVisible={gameState.isGameWon}
        score={gameState.score}
        onRestart={initializeGame}
        intervalTime={intervalTime}
      />
    </div>
  );
};

export default Game;
