export interface Position {
  x: number;
  y: number;
}

export enum CellType {
  WALL = 'wall',
  PATH = 'path',
  START = 'start',
  END = 'end',
  PLAYER = 'player'
}

export interface Cell {
  type: CellType;
  position: Position;
}

export interface GameState {
  maze: Cell[][];
  playerPosition: Position;
  isGameWon: boolean;
  isGameLost: boolean;
  timeLeft: number;
  score: number;
}

export interface GameConfig {
  gridSize: number;
  intervalTime: number; // in seconds
  pathDensity: number; // 0-1, higher means more paths
}
