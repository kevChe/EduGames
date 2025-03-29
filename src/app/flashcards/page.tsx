"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Definition {
  word: string;
  definition: string;
}

interface Categories {
  [key: string]: Definition[];
}

export default function Flashcards() {
  const [categories, setCategories] = useState<Categories>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const wordsPerPage = 10;

  useEffect(() => {
    fetch('/definitions.json')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch definitions');
        return response.json();
      })
      .then((data) => {
        setCategories(data);
        // Set the first category as selected
        const firstCategory = Object.keys(data)[0];
        if (firstCategory) {
          setSelectedCategory(firstCategory);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const currentWords = selectedCategory ? categories[selectedCategory] : [];
  const totalPages = Math.ceil(currentWords.length / wordsPerPage);
  const startIndex = currentPage * wordsPerPage;
  const currentPageWords = currentWords.slice(startIndex, startIndex + wordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setIsFlipped(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setIsFlipped(false);
    }
  };

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setCurrentPage(0);
    setIsFlipped(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-8 bg-gray-100">
      <Link href="/" className="mb-4 text-blue-500 hover:text-blue-700">
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-8 text-black">Flashcards</h1>
      
      {/* Category Selection */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {Object.keys(categories).map((categoryName) => (
          <button
            key={categoryName}
            onClick={() => handleCategoryChange(categoryName)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === categoryName
                ? 'bg-blue-500 text-white'
                : 'bg-white text-blue-500 hover:bg-blue-100'
            }`}
          >
            {categoryName}
          </button>
        ))}
      </div>

      {/* Flashcards Grid */}
      {currentPageWords.length > 0 && (
        <div className="w-full max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPageWords.map((word, index) => (
              <div key={index} className="relative h-48 cursor-pointer perspective-1000">
                <div
                  className={`absolute w-full h-full transition-transform duration-500 transform-style-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front of card */}
                  <div className="absolute w-full h-full backface-hidden bg-white rounded-lg shadow-xl p-4 flex items-center justify-center">
                    <h2 className="text-2xl font-bold text-black text-center">
                      {word.word}
                    </h2>
                  </div>
                  
                  {/* Back of card */}
                  <div className="absolute w-full h-full backface-hidden bg-white rounded-lg shadow-xl p-4 flex flex-col items-center justify-center rotate-y-180">
                    <h2 className="text-2xl font-bold text-black text-center mb-4">
                      {word.word}
                    </h2>
                    <p className="text-lg text-black text-center">
                      {word.definition}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className={`px-6 py-2 rounded-lg transition-colors ${
                currentPage === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Previous Page
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className={`px-6 py-2 rounded-lg transition-colors ${
                currentPage === totalPages - 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next Page
            </button>
          </div>

          {/* Progress indicator */}
          {selectedCategory && (
            <div className="mt-4 text-center text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 