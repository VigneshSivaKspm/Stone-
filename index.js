// index.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Game = require('./models/Game');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/stone-paper-scissors', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.post('/play', async (req, res) => {
  const { player1, player2, round } = req.body;

  // Logic to determine the winner
  const winner = // Determine the winner based on player choices

  // Update score
  let player1Score = // Calculate player1 score
  let player2Score = // Calculate player2 score

  // Save game data to database
  const game = new Game({
    player1,
    player2,
    round,
    winner
  });
  await game.save();

  // Retrieve all game data
  const gameData = await Game.find();

  res.json({ winner, player1Score, player2Score, gameData });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
