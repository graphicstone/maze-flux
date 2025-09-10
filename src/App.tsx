import React from 'react';
import Game from './components/Game';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Dynamic Maze Game</h1>
        <p>Navigate from bottom-left to top-right before the paths change!</p>
      </header>
      <Game />
    </div>
  );
}

export default App;
