"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

interface WordDefinition {
  word: string;
  definition: string;
}

interface WordCategory {
  [key: string]: WordDefinition[];
}

interface SkippedWord {
  word: WordDefinition;
  category: string;
}

const DEFAULT_TIME_LIMIT = 120; // 2 minutes in seconds
const MIN_TIME_LIMIT = 30;
const MAX_TIME_LIMIT = 300;

export default function WordGuessing() {
  const [timeLimit, setTimeLimit] = useState(DEFAULT_TIME_LIMIT);
  const [currentTime, setCurrentTime] = useState(timeLimit);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState<WordDefinition | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [skippedWords, setSkippedWords] = useState<SkippedWord[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [wordCategories, setWordCategories] = useState<WordCategory>({});

  // Memoize available categories
  const availableCategories = useMemo(() => Object.keys(wordCategories), [wordCategories]);

  // Memoize the word selection logic
  const getRandomWord = useCallback(() => {
    if (availableCategories.length === 0) {
      endGame();
      return null;
    }

    const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const wordsInCategory = wordCategories[randomCategory];
    
    const availableWords = wordsInCategory.filter(word => 
      !currentWord || (word.word !== currentWord.word && !skippedWords.some(w => w.word.word === word.word))
    );

    if (availableWords.length === 0) {
      const remainingCategories = availableCategories.filter(cat => cat !== randomCategory);
      if (remainingCategories.length === 0) {
        endGame();
        return null;
      }
      return getRandomWord();
    }

    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentCategory(randomCategory);
    return randomWord;
  }, [availableCategories, wordCategories, currentWord, skippedWords]);

  // Memoize handlers
  const handleCorrect = useCallback(() => {
    setCorrectGuesses(prev => prev + 1);
    const nextWord = getRandomWord();
    if (nextWord) {
      setCurrentWord(nextWord);
    }
  }, [getRandomWord]);

  const handleSkip = useCallback(() => {
    if (currentWord) {
      setSkippedWords(prev => [...prev, { word: currentWord, category: currentCategory }]);
      const nextWord = getRandomWord();
      if (nextWord) {
        setCurrentWord(nextWord);
      }
    }
  }, [currentWord, currentCategory, getRandomWord]);

  // Memoize time formatting
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Load words on mount
  useEffect(() => {
    fetch('/definitions.json')
      .then(response => response.json())
      .then(data => setWordCategories(data))
      .catch(error => console.error('Error loading words:', error));
  }, []);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentTime > 0) {
      timer = setInterval(() => {
        setCurrentTime(prev => prev - 1);
      }, 1000);
    } else if (currentTime === 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTime]);

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setShowResults(true);
  }, []);

  const startGame = useCallback(() => {
    setCurrentTime(timeLimit);
    setIsPlaying(true);
    setCorrectGuesses(0);
    setSkippedWords([]);
    setShowResults(false);
    setCurrentWord(getRandomWord());
  }, [timeLimit, getRandomWord]);

  // Memoize the game controls component
  const GameControls = useMemo(() => (
    <div className="flex gap-4">
      <button
        onClick={handleCorrect}
        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg"
      >
        Correct!
      </button>
      <button
        onClick={handleSkip}
        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-lg"
      >
        Skip Word
      </button>
    </div>
  ), [handleCorrect, handleSkip]);

  // Memoize the skipped words grid
  const SkippedWordsGrid = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {skippedWords.map((item, index) => (
        <div key={index} className="bg-white p-4 rounded shadow">
          <div className="font-bold text-lg">{item.word.word}</div>
          <div className="text-gray-600">{item.word.definition}</div>
          <div className="text-sm text-gray-500">Category: {item.category}</div>
        </div>
      ))}
    </div>
  ), [skippedWords]);

  return (
    <div className="flex flex-col items-center min-h-screen py-8 bg-gray-100">
      <Link href="/" className="mb-4 text-blue-500 hover:text-blue-700">
        ← Back to Home
      </Link>
      
      <h1 className="text-3xl font-bold mb-8 text-black">Word Guessing Game</h1>
      
      {!isPlaying && !showResults && (
        <div className="mb-8">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Time Limit (seconds):
          </label>
          <input
            type="number"
            min={MIN_TIME_LIMIT}
            max={MAX_TIME_LIMIT}
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <button
            onClick={startGame}
            className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg"
          >
            Start Game
          </button>
        </div>
      )}

      {isPlaying && currentWord && (
        <div className="text-center">
          <div className="text-4xl font-bold mb-8 text-blue-600">
            {formatTime(currentTime)}
          </div>
          <div className="text-2xl font-bold mb-4 text-black">
            Correct Guesses: {correctGuesses}
          </div>
          <div className="text-4xl font-bold mb-4 text-black">
            {currentWord.word}
          </div>
          <div className="text-xl text-gray-600 mb-8">
            Category: {currentCategory}
          </div>
          {GameControls}
        </div>
      )}

      {showResults && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-black">Game Over!</h2>
          <p className="text-xl mb-4 text-black">
            You correctly guessed {correctGuesses} words!
          </p>
          {skippedWords.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2 text-black">Skipped Words:</h3>
              {SkippedWordsGrid}
            </div>
          )}
          <button
            onClick={startGame}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
} 