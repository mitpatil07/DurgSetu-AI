
import React from "react";
import { Construction } from "lucide-react";
import { useNavigate } from "react-router-dom"; 

function Stage_1Dash_Component() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md">
        <Construction className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />

        <h1 className="text-3xl font-bold text-gray-800 mt-4">
          Under Working 🚧
        </h1>
        <p className="text-gray-600 mt-2">
          This page is currently under development. Please check back soon!
        </p>

        <div className="mt-6">
          <button
            onClick={() => navigate(-1)} // ✅ Go back one step
            className="px-5 py-2 rounded-xl bg-yellow-500 text-white font-semibold shadow-md hover:bg-yellow-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Stage_1Dash_Component;
