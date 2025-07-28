import React from "react";

export default function TickAnimation({message  = "Verified!"}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 bg-gray-100">
      {/* Tick animation */}
      <div className="flex items-center justify-center w-24 h-24 bg-green-500 rounded-full shadow-lg animate-scaleUp">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-12 h-12 opacity-0 animate-drawCheck"
        >
          <polyline points="4 12 9 17 20 6" />
        </svg>
      </div>

      {/* Verified Text Animation */}
      <div className="mt-4 text-2xl font-bold bg-gradient-to-r from-green-500 to-green-700 text-transparent bg-clip-text opacity-0 animate-fadeInUp">
        {message}
      </div>
    </div>
  );
}