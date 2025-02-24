"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const rows = 8;
  const cols = 9;
  const initialBoard = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));
  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState(1); // Player 1 starts
  const [winningDiscs, setWinningDiscs] = useState<string[]>([]); // Change to array
  const [winner, setWinner] = useState<number | null>(null);
  const [resetButton, setResetButton] = useState(false)

  const players = [
    { id: 1, color: "red" },
    { id: 2, color: "blue" },
    { id: 3, color: "yellow" },
    { id: 4, color: "green" },
  ];

  const dropDisc = (col: number) => {
    const newBoard = board.map((row) => [...row]);
    for (let row = rows - 1; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = currentPlayer;
        if (row - 1 >= 0 && newBoard[row - 1][col] && newBoard[row - 1][col] !== currentPlayer) {
          newBoard[row - 1][col] = currentPlayer;
        }
        if(!winner)
        {
          setBoard(newBoard);
          setCurrentPlayer((currentPlayer % 4) + 1);
        }
        checkWinner(newBoard, row, col);
        break;
      }
    }
  };

  const checkWinner = (board: (number | null)[][], row: number, col: number) => {
    const directions = [
      [0, 1], // right
      [1, 0], // down
      [1, 1], // down-right
      [1, -1], // down-left
    ];
    const player = board[row][col];
    let foundWin = false;
    const winningPositions: string[] = []; // Change to array

    for (let [dr, dc] of directions) {
      let count = 1;
      const currentWinning = [ `${row},${col}` ]; // Start with array

      for (let i = 1; i < 4; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (
          r >= 0 &&
          r < rows &&
          c >= 0 &&
          c < cols &&
          board[r][c] === player
        ) {
          count++;
          currentWinning.push(`${r},${c}`);
        } else break;
      }
      for (let i = 1; i < 4; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (
          r >= 0 &&
          r < rows &&
          c >= 0 &&
          c < cols &&
          board[r][c] === player
        ) {
          count++;
          currentWinning.push(`${r},${c}`);
        } else break;
      }
      if (count >= 4) {
        foundWin = true;
        winningPositions.push(...currentWinning);
        break;
      }
    }

    if (foundWin) {
      setWinningDiscs(winningPositions); // Set as array
      setWinner(player);
      setResetButton(true)
    }
  };

  const resetGame = () => {
    setBoard([...initialBoard.map(row => [...row])]); // Deep copy
    setCurrentPlayer(1);
    setWinningDiscs([]); // Reset to empty array
    setWinner(null);
  };

  useEffect(() => {
    if (winner !== null) {
      setTimeout(() => {
        alert(`Player ${winner} wins!`);
      }, 100);
    }
  }, [winner]);

  return (
    <div className="flex flex-col items-center min-h-screen py-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Twisted Connect 4</h1>
      <p className="mb-4">Current Player: {players[currentPlayer - 1].color}</p>
      <div className="grid gap-1 bg-blue-500 p-2 rounded">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((cell, colIndex) => {
              const isWinningDisc = winningDiscs.includes(`${rowIndex},${colIndex}`);
              return (
                <div
                  key={colIndex}
                  onClick={() => dropDisc(colIndex)}
                  className={`w-12 h-12 rounded-full cursor-pointer border ${
                    isWinningDisc ? "border-4 border-black" : "border-gray-300"
                  }`}
                  style={{
                    backgroundColor: cell
                      ? players[cell - 1].color
                      : "white",
                    }}
                />
              );
            })}
          </div>
        ))}
      </div>
      {resetButton ? 
      <button
        onClick={resetGame}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Reset Game
      </button> : <div/>
      }
    </div>
  );
}