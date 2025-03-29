"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-black">Welcome to EduConnect4</h1>
      <p className="text-xl mb-8 text-gray-700">A fun educational game that combines Connect 4 with learning!</p>
      <div className="flex gap-4">
        <Link 
          href="/game" 
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg"
        >
          Play Connect 4
        </Link>
        <Link 
          href="/word-guessing" 
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg"
        >
          Play Word Guessing
        </Link>
        <Link 
          href="/flashcards" 
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-lg"
        >
          View Flashcards
        </Link>
      </div>
    </div>
  );
}