// App.js
import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [winner, setWinner] = useState('');
  const [gameData, setGameData] = useState([]);

  const choices = ['stone', 'paper', 'scissors'];

  const playRound = async (choice1, choice2) => {
    try {
      const response = await axios.post('http://localhost:5000/play', {
        player1: { name: player1, choice: choice1 },
        player2: { name: player2, choice: choice2 },
        round: round
      });
      const { winner, player1Score, player2Score, gameData } = response.data;
      setWinner(winner);
      setScore({ player1: player1Score, player2: player2Score });
      setGameData(gameData);
      setRound(round + 1);
    } catch (error) {
      console.error('Error playing round:', error);
    }
  };

  const handlePlay = (choice) => {
    const choice2 = choices[Math.floor(Math.random() * choices.length)];
    playRound(choice, choice2);
  };

  return (
    <div>
      <h1>Stone Paper Scissors</h1>
      <label>Player 1 Name: </label>
      <input type="text" value={player1} onChange={(e) => setPlayer1(e.target.value)} />
      <label>Player 2 Name: </label>
      <input type="text" value={player2} onChange={(e) => setPlayer2(e.target.value)} />
      <div>
        {choices.map((choice) => (
          <button key={choice} onClick={() => handlePlay(choice)}>
            {choice}
          </button>
        ))}
      </div>
      <h2>Round: {round}</h2>
      <h2>Score: {player1} - {score.player1} / {player2} - {score.player2}</h2>
      {winner && <h2>Winner: {winner}</h2>}
      <div>
        <h2>Game Data</h2>
        <ul>
          {gameData.map((data, index) => (
            <li key={index}>
              Round {data.round}: {data.player1.name} - {data.player1.choice}, {data.player2.name} - {data.player2.choice} => Winner: {data.winner}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
                                                    
