import { Cell, CellType, Position, GameConfig } from '../types/game';

export class MazeGenerator {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  generateMaze(): Cell[][] {
    const { gridSize } = this.config;
    const maze: Cell[][] = [];

    // Initialize maze with walls
    for (let y = 0; y < gridSize; y++) {
      maze[y] = [];
      for (let x = 0; x < gridSize; x++) {
        maze[y][x] = {
          type: CellType.WALL,
          position: { x, y }
        };
      }
    }

    // Set start and end positions
    maze[gridSize - 1][0] = {
      type: CellType.START,
      position: { x: 0, y: gridSize - 1 }
    };

    maze[0][gridSize - 1] = {
      type: CellType.END,
      position: { x: gridSize - 1, y: 0 }
    };

    // Generate maze using recursive pathfinding approach
    this.generateComplexMaze(maze);

    return maze;
  }

  private generateComplexMaze(maze: Cell[][]): void {
    const { gridSize, pathDensity } = this.config;
    const start = { x: 0, y: gridSize - 1 };
    const end = { x: gridSize - 1, y: 0 };

    // Create more random walks for larger grid (scale with grid size)
    const numWalks = Math.floor(gridSize / 8) + Math.floor(Math.random() * 3); // Scale with grid size
    this.createRandomWalks(maze, start, numWalks);
    
    // Very minimal random scattered paths
    this.addRandomPaths(maze, pathDensity * 0.4); // Much more restrictive
    
    // Create only one potential path strategy (not multiple)
    if (Math.random() < 0.5) {
      this.createAlternatePaths(maze, start, end);
    }
    
    // Ensure at least one path exists, but make it more interesting
    if (!this.hasPath(maze, start, end)) {
      this.createInterestingPath(maze, start, end);
    }
    
    // Add very few dead ends to avoid too many paths
    this.addLimitedDeadEnds(maze);
  }

  private createRandomWalks(maze: Cell[][], start: Position, numWalks: number): void {
    const { gridSize } = this.config;
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 1, y: 0 },  // right
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }  // left
    ];

    for (let walk = 0; walk < numWalks; walk++) {
      let current = { ...start };
      let steps = Math.floor(gridSize / 3) + Math.floor(Math.random() * (gridSize / 2)); // Scale walk length with grid size
      
      for (let step = 0; step < steps; step++) {
        // Lower chance to make current position a path
        if (Math.random() < 0.6 && maze[current.y][current.x].type === CellType.WALL) {
          maze[current.y][current.x] = {
            type: CellType.PATH,
            position: { x: current.x, y: current.y }
          };
        }
        
        // Choose random direction, but bias strongly towards the goal
        let possibleDirections = [...directions];
        
        // 60% chance to move towards goal (higher bias)
        if (Math.random() < 0.6) {
          if (current.x < gridSize - 1) possibleDirections = [{ x: 1, y: 0 }];
          else if (current.y > 0) possibleDirections = [{ x: 0, y: -1 }];
        }
        
        // Try to move in chosen direction
        const direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        const newX = current.x + direction.x;
        const newY = current.y + direction.y;
        
        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
          current = { x: newX, y: newY };
        }
      }
    }
  }

  private addRandomPaths(maze: Cell[][], density: number): void {
    const { gridSize } = this.config;
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        // Skip start and end positions
        if ((x === 0 && y === gridSize - 1) || (x === gridSize - 1 && y === 0)) {
          continue;
        }

        if (Math.random() < density) {
          maze[y][x] = {
            type: CellType.PATH,
            position: { x, y }
          };
        }
      }
    }
  }

  private createAlternatePaths(maze: Cell[][], start: Position, end: Position): void {
    // Create only ONE strategy randomly to keep paths minimal
    const strategies = ['up-first', 'diagonal', 'zigzag'];
    const chosenStrategy = strategies[Math.floor(Math.random() * strategies.length)];
    
    // Higher chance for alternate path in larger grid
    if (Math.random() < 0.7) {
      this.createPathStrategy(maze, start, end, chosenStrategy);
    }
  }

  private createPathStrategy(maze: Cell[][], start: Position, end: Position, strategy: string): void {
    const { gridSize } = this.config;
    let current = { ...start };
    
    switch (strategy) {
      case 'up-first': {
        // Go up first, then right
        current = { ...start };
        // Move up most of the way
        const upSteps = Math.floor((start.y - end.y) * (0.5 + Math.random() * 0.2));
        for (let i = 0; i < upSteps && current.y > end.y; i++) {
          if (Math.random() < 0.6) { // Reduced to 60% chance to create path
            current.y--;
            if (current.y >= 0 && maze[current.y][current.x].type === CellType.WALL) {
              maze[current.y][current.x] = { type: CellType.PATH, position: { x: current.x, y: current.y } };
            }
          }
        }
        // Then move right
        while (current.x < end.x) {
          if (Math.random() < 0.6) { // Reduced chance
            current.x++;
            if (current.x < gridSize && maze[current.y][current.x].type === CellType.WALL) {
              maze[current.y][current.x] = { type: CellType.PATH, position: { x: current.x, y: current.y } };
            }
          }
        }
        break;
      }
        
      case 'diagonal': {
        // Try to move diagonally towards goal
        current = { ...start };
        while (current.x < end.x || current.y > end.y) {
          if (current.x < end.x && current.y > end.y && Math.random() < 0.5) {
            // Move diagonally by alternating
            if (Math.random() < 0.5 && current.x < end.x) {
              current.x++;
            } else if (current.y > end.y) {
              current.y--;
            }
          } else if (current.x < end.x) {
            current.x++;
          } else if (current.y > end.y) {
            current.y--;
          }
          
          if (Math.random() < 0.5 && current.x >= 0 && current.x < gridSize && current.y >= 0 && current.y < gridSize) { // More restrictive
            if (maze[current.y][current.x].type === CellType.WALL) {
              maze[current.y][current.x] = { type: CellType.PATH, position: { x: current.x, y: current.y } };
            }
          }
        }
        break;
      }
        
      case 'zigzag': {
        // Create a zigzag pattern
        current = { ...start };
        let direction = 1; // 1 for right, -1 for left
        
        while (current.y > end.y) {
          // Move up
          if (Math.random() < 0.5) { // Much more restrictive for zigzag
            current.y--;
            if (current.y >= 0 && maze[current.y][current.x].type === CellType.WALL) {
              maze[current.y][current.x] = { type: CellType.PATH, position: { x: current.x, y: current.y } };
            }
          }
          
          // Move horizontally (zigzag)
          const steps = 1 + Math.floor(Math.random() * 3);
          for (let i = 0; i < steps; i++) {
            const newX = current.x + direction;
            if (newX >= 0 && newX < gridSize) {
              current.x = newX;
              if (Math.random() < 0.4 && maze[current.y][current.x].type === CellType.WALL) { // Very restrictive
                maze[current.y][current.x] = { type: CellType.PATH, position: { x: current.x, y: current.y } };
              }
            }
          }
          direction *= -1; // Change direction
        }
        
        // Finally move to the end
        while (current.x < end.x) {
          current.x++;
          if (current.x < gridSize && Math.random() < 0.5) { // More restrictive
            if (maze[current.y][current.x].type === CellType.WALL) {
              maze[current.y][current.x] = { type: CellType.PATH, position: { x: current.x, y: current.y } };
            }
          }
        }
        break;
      }
    }
  }

  private addLimitedDeadEnds(maze: Cell[][]): void {
    const { gridSize } = this.config;
    
    // Scale dead ends with grid size but keep them limited
    const numDeadEnds = Math.floor(gridSize / 12) + Math.floor(Math.random() * 3); // Scale with grid size
    
    for (let i = 0; i < numDeadEnds; i++) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      
      if (maze[y][x].type === CellType.PATH) {
        // Create a very small dead end (only 1 cell long)
        const directions = [
          { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
        ];
        
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const newX = x + direction.x;
        const newY = y + direction.y;
        
        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
          if (maze[newY][newX].type === CellType.WALL && Math.random() < 0.3) { // Only 30% chance
            maze[newY][newX] = { type: CellType.PATH, position: { x: newX, y: newY } };
          }
        }
      }
    }
  }

  private createInterestingPath(maze: Cell[][], start: Position, end: Position): void {
    // Fallback that creates a more interesting guaranteed path
    const pathTypes = ['up-first', 'diagonal', 'zigzag'];
    const chosenPath = pathTypes[Math.floor(Math.random() * pathTypes.length)];
    this.createPathStrategy(maze, start, end, chosenPath);
    
    // If still no path, create a simple but working path
    if (!this.hasPath(maze, start, end)) {
      let current = { ...start };
      
      // Create a working path with some randomness
      while (current.x < end.x || current.y > end.y) {
        if (current.x < end.x && current.y > end.y) {
          // Randomly choose direction
          if (Math.random() < 0.5) {
            current.x++;
          } else {
            current.y--;
          }
        } else if (current.x < end.x) {
          current.x++;
        } else if (current.y > end.y) {
          current.y--;
        }
        
        if (maze[current.y][current.x].type === CellType.WALL) {
          maze[current.y][current.x] = { type: CellType.PATH, position: { x: current.x, y: current.y } };
        }
      }
    }
  }

  private hasPath(maze: Cell[][], start: Position, end: Position): boolean {
    const { gridSize } = this.config;
    const visited = new Set<string>();
    const queue = [start];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (current.x === end.x && current.y === end.y) {
        return true;
      }

      // Check all 4 directions
      const directions = [
        { x: 0, y: -1 }, // up
        { x: 1, y: 0 },  // right
        { x: 0, y: 1 },  // down
        { x: -1, y: 0 }  // left
      ];

      for (const dir of directions) {
        const newX = current.x + dir.x;
        const newY = current.y + dir.y;

        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
          const cell = maze[newY][newX];
          if (cell.type !== CellType.WALL && !visited.has(`${newX},${newY}`)) {
            queue.push({ x: newX, y: newY });
          }
        }
      }
    }

    return false;
  }
}
