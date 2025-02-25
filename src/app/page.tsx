"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const rows = 8;
  const cols = 9;
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
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]); // Track remaining questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);

  const players = [
    { id: 1, color: "red" },
    { id: 2, color: "blue" },
    { id: 3, color: "yellow" },
    { id: 4, color: "green" },
  ];

  // Load questions and initialize available questions
  useEffect(() => {
    fetch('/questions.json')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch questions');
        return response.json();
      })
      .then((data) => {
        setQuestions(data);
        setAvailableQuestions([...data]); // Copy all questions to available pool
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
    
    // Select random question from available pool
    if (availableQuestions.length === 0) {
      setAvailableQuestions([...questions]); // Reset if all questions used
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
      [0, 1], // right
      [1, 0], // down
      [1, 1], // down-right
      [1, -1], // down-left
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
    setAvailableQuestions([...questions]); // Reset available questions
    setCurrentQuestionIndex(null);
  };

  useEffect(() => {
    if (winner !== null) {
      setTimeout(() => {
        alert(`Player ${winner} wins!`);
      }, 100);
    }
  }, [winner]);

  const handleQuizResponse = (correct: boolean) => {
    if (correct && selectedColumn !== null) {
      dropDisc(selectedColumn);
    } else {
      // Wrong answer advances to next player
      setCurrentPlayer((currentPlayer % 4) + 1);
    }
    
    // Remove used question from available pool
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
          // Optional: Reset flip state when exiting fullscreen
          // setIsFlipped(false);
        }
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div 
          className="bg-white p-6 rounded-lg shadow-xl w-3/4 h-3/4 cursor-pointer transform transition-transform duration-500" // Changed to 3/4 size
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="relative w-full h-full flex flex-col"> {/* Adjusted for full height */}
            {!isFlipped ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl mb-6">{q.question}</p> {/* Increased text size */}
                {q.image && (
                  <img 
                    src={`/image/${q.image}`} 
                    alt="Question" 
                    className="max-h-60 object-contain cursor-pointer hover:opacity-80 transition-opacity" // Increased max height
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(e);
                    }}
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                )}
                <div className="mt-6 flex justify-between w-full px-6"> {/* Increased spacing */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleQuizResponse(true); }}
                    className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 text-lg" // Larger button
                  >
                    Correct
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleQuizResponse(false); }}
                    className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 text-lg" // Larger button
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
                <p className="text-2xl mb-6">{q.answer}</p> {/* Increased text size */}
                {q.answer_image && (
                  <img 
                    src={`/image/${q.answer_image}`} 
                    alt="Answer" 
                    className="max-h-60 object-contain cursor-pointer hover:opacity-80 transition-opacity" // Increased max height
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(e);
                    }}
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                )}
                <div className="mt-6 flex justify-between w-full px-6"> {/* Increased spacing */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleQuizResponse(true); }}
                    className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 text-lg" // Larger button
                  >
                    Correct
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleQuizResponse(false); }}
                    className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 text-lg" // Larger button
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
      <h1 className="text-3xl font-bold mb-4">Twisted Connect 4</h1>
      <p className="mb-4">Current Player: {players[currentPlayer - 1].color}</p>
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
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:scale-105 transition-transform"
        >
          Reset Game
        </button> : <div/>
      }
      {showQuiz && <QuizCard />}
      <div className="flex-1">
        <div className="flex flex-1 flex-row justify-between ">
          <h1 className="flex-1 m-5">Red</h1>
          <h1 className="flex-1 m-5">Blue</h1>
        </div>
        <div className="flex flex-1 flex-row justify-between ">
          <h1 className="flex-1 m-5">Yellow</h1>
          <h1 className="flex-1 m-5">Green</h1>
        </div>
      </div>
    </div>
  );
}