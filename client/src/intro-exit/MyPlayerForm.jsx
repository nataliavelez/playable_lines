import React, { useState, useEffect } from "react";

export function MyPlayerForm({ onPlayerID, connecting }) {
  const [workerId, setWorkerId] = useState("");
  const [nickname, setNickname] = useState("");
  const [isAutodetected, setIsAutodetected] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log("URL search params:", urlParams.toString());
    const workerId = urlParams.get("workerId");
    console.log("Found workerId:", workerId);
    
    if (workerId) {
      setWorkerId(workerId);
      setIsAutodetected(true);
      console.log("Set workerId and isAutodetected to true");
    }
  }, []);

  const handleSubmit = (evt) => {
    evt.preventDefault();
    if ((!workerId.trim() && !isAutodetected) || !nickname.trim()) {
      return;
    }
    onPlayerID(JSON.stringify({ workerId, nickname }));
  };

  return (
    <div className="min-h-screen bg-opacity-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl p-5 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome</h1>
          {!isAutodetected && (
            <p className="mt-2 text-gray-600">Please enter your Prolific ID and choose a short nickname to use for the game</p>
          )}
          {isAutodetected && (
            <p className="mt-2 text-gray-600">We have automatically logged your Prolific Worker ID. <br></br>Please now choose a short nickname for the game</p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset disabled={connecting} className="space-y-6">
            {!isAutodetected && (
              <div>
                <label htmlFor="workerId" className="block text-sm font-medium text-gray-700">
                  Prolific Worker ID
                </label>
                <input
                  id="workerId"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-empirica-500 focus:border-empirica-500"
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                />
              </div>
            )}

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                Nickname
              </label>
              <input
                id="nickname"
                type="text"
                required
                autoFocus
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-empirica-500 focus:border-empirica-500"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-empirica-600 hover:bg-empirica-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-empirica-500"
            >
              Enter
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}