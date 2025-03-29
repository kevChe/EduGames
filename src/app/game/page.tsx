"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Game() {
  const rows = 9;
  const cols = 10;
  const initialBoard = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));
  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winningDiscs, setWinningDiscs] = useState<string[]>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const [resetButton, setResetButton] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [playerNames, setPlayerNames] = useState([
    { id: 1, color: "red", name: "Red" },
    { id: 2, color: "blue", name: "Blue" },
    { id: 3, color: "yellow", name: "Yellow" },
    { id: 4, color: "green", name: "Green" },
  ]);
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);

  useEffect(() => {
    fetch('/questions.json')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch questions');
        return response.json();
      })
      .then((data) => {
        setQuestions(data);
        setAvailableQuestions([...data]);
      })
      .catch((error) => {
        console.error(error);
        setQuestions([]);
        setAvailableQuestions([]);
      });
  }, []);

  const handleDiscDrop = (col: number) => {
    if (winner || questions.length === 0) return;
    setSelectedColumn(col);
    setShowQuiz(true);
    setIsFlipped(false);
    
    if (availableQuestions.length === 0) {
      setAvailableQuestions([...questions]);
    }
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    setCurrentQuestionIndex(randomIndex);
  };

  const dropDisc = (col: number) => {
    const newBoard = board.map((row) => [...row]);
    for (let row = rows - 1; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = currentPlayer;
        if (row - 1 >= 0 && newBoard[row - 1][col] && newBoard[row - 1][col] !== currentPlayer) {
          newBoard[row - 1][col] = currentPlayer;
        }
        if (!winner) {
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
      [0, 1], [1, 0], [1, 1], [1, -1],
    ];
    const player = board[row][col];
    let foundWin = false;
    const winningPositions: string[] = [];

    for (let [dr, dc] of directions) {
      let count = 1;
      const currentWinning = [`${row},${col}`];

      for (let i = 1; i < 4; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === player) {
          count++;
          currentWinning.push(`${r},${c}`);
        } else break;
      }
      for (let i = 1; i < 4; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === player) {
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
      setWinningDiscs(winningPositions);
      setWinner(player);
      setResetButton(true);
    }
  };

  const resetGame = () => {
    setBoard([...initialBoard.map(row => [...row])]);
    setCurrentPlayer(1);
    setWinningDiscs([]);
    setWinner(null);
    setAvailableQuestions([...questions]);
    setCurrentQuestionIndex(null);
  };

  useEffect(() => {
    if (winner !== null) {
      setTimeout(() => {
        alert(`Player ${playerNames[winner - 1].name} wins!`);
      }, 100);
    }
  }, [winner]);

  const handleQuizResponse = (correct: boolean) => {
    if (correct && selectedColumn !== null) {
      dropDisc(selectedColumn);
    } else {
      setCurrentPlayer((currentPlayer % 4) + 1);
    }
    
    if (currentQuestionIndex !== null) {
      setAvailableQuestions(prev => {
        const newAvailable = [...prev];
        newAvailable.splice(currentQuestionIndex, 1);
        return newAvailable;
      });
    }

    setShowQuiz(false);
    setSelectedColumn(null);
    setCurrentQuestionIndex(null);
  };

  const handleNameChange = (id: number, newName: string) => {
    setPlayerNames(prev => 
      prev.map(player => 
        player.id === id ? { ...player, name: newName } : player
      )
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    if (e.key === 'Enter') {
      setEditingPlayer(null);
    }
  };

  const QuizCard = () => {
    if (questions.length === 0 || currentQuestionIndex === null) return null;
    const q = availableQuestions[currentQuestionIndex];

    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (img.requestFullscreen) {
        img.requestFullscreen();
      }
      else if ((img as any).webkitRequestFullscreen) {
        (img as any).webkitRequestFullscreen();
      }
      else if ((img as any).msRequestFullscreen) {
        (img as any).msRequestFullscreen();
      }
    };

    useEffect(() => {
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          // setIsFlipped(false);
        }
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div 
          className="bg-white p-6 rounded-lg shadow-xl w-3/4 h-3/4 cursor-pointer transform transition-transform duration-500"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="relative w-full h-full flex flex-col">
            {!isFlipped ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl mb-6 text-black">{q.question}</p>
                {q.image && (
                  <img 
                    src={`/image/${q.image}`} 
                    alt="Question" 
                    className="max-h-60 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(e);
                    }}
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                )}
                <div className="mt-6 flex justify-between w-full px-6">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleQuizResponse(true); }}
                    className="px-6 py-3 bg-green-500 text-black rounded hover:bg-green-600 text-lg"
                  >
                    Correct
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleQuizResponse(false); }}
                    className="px-6 py-3 bg-red-500 text-black rounded hover:bg-red-600 text-lg"
                    >
                    Wrong
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <p className="text-2xl mb-6 text-black">{q.answer}</p>
                {q.answer_image && (
                  <img 
                    src={`/image/${q.answer_image}`} 
                    alt="Answer" 
                    className="max-h-60 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(e);
                    }}
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                )}
                <div className="mt-6 flex justify-between w-full px-6">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleQuizResponse(true); }}
                    className="px-6 py-3 bg-green-500 text-black rounded hover:bg-green-600 text-lg"
                  >
                    Correct
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleQuizResponse(false); }}
                    className="px-6 py-3 bg-red-500 text-black rounded hover:bg-red-600 text-lg"
                    >
                    Wrong
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-8 bg-gray-100">
      <Link href="/" className="mb-4 text-blue-500 hover:text-blue-700">
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-8 text-black">Connect 4 Game</h1>
      <div className="mb-4 flex items-center">
        <span className="text-black mr-2">Current Player:</span>
        <div 
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: playerNames[currentPlayer - 1].color }}
        ></div>
      </div>
      <div className="grid gap-1 bg-blue-500 p-2 rounded shadow-lg">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((cell, colIndex) => {
              const isWinningDisc = winningDiscs.includes(`${rowIndex},${colIndex}`);
              return (
                <div
                  key={colIndex}
                  onClick={() => handleDiscDrop(colIndex)}
                  className={`w-12 h-12 rounded-full cursor-pointer border ${
                    isWinningDisc ? "border-4 border-black" : "border-gray-300"
                  } hover:scale-105 transition-transform`}
                  style={{
                    backgroundColor: cell
                      ? playerNames[cell - 1].color
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
          className="mt-4 px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600 hover:scale-105 transition-transform"
        >
          Reset Game
        </button> : <div/>
      }
      {showQuiz && <QuizCard />}
      <div className="flex-1 w-3/4">
        <div className="flex flex-col gap-4">
          {playerNames.map(player => (
            <div key={player.id} className="flex items-center m-5">
              <div 
                className="w-6 h-6 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: player.color }}
              ></div>
              {editingPlayer === player.id ? (
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => handleNameChange(player.id, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, player.id)}
                  className="text-black border rounded px-2 py-1"
                  autoFocus
                />
              ) : (
                <span 
                  className="text-black cursor-pointer hover:underline"
                  onClick={() => setEditingPlayer(player.id)}
                >
                  {player.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 