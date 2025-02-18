import { usePlayer } from "@empirica/core/player/classic/react";
import React, { useState } from "react";
import { Button } from "../components/Button";

export function ExitSurvey1({ next }) {
  const labelClassName = "block text-sm font-medium text-gray-700 my-2";
  const inputClassName = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-empirica-500 focus:border-empirica-500 sm:text-sm";
  
  const player = usePlayer();
  const [strategySelf, setStrategySelf] = useState("");
  const [strategyOthers, setStrategyOthers] = useState("");
  const [feedback, setFeedback] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    player.set("exitSurvey1", {
      strategySelf,
      strategyOthers,
      feedback
    });
    next();
  }

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <form className="mt-12 space-y-8 divide-y divide-gray-200" onSubmit={handleSubmit}>
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Exit Survey
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                First, we'd like to know about your experience playing the game.
              </p>
            </div>

            <div className="space-y-8 mt-6">
              <div>
                <label className={labelClassName}>
                Tell us a bit about your strategy for playing the game.  Did you cooperate/coordinate with the other players in some way?
                </label>
                <textarea
                  rows={3}
                  className={inputClassName}
                  value={strategySelf}
                  onChange={(e) => setStrategySelf(e.target.value)}
                  placeholder="Describe your strategy..."
                />
              </div>

              <div>
                <label className={labelClassName}>
                How about the other players? Did they cooperate/coordinate?
                </label>
                <textarea
                  rows={3}
                  className={inputClassName}
                  value={strategyOthers}
                  onChange={(e) => setStrategyOthers(e.target.value)}
                  placeholder="Describe others' strategies..."
                />
              </div>

              <div>
                <label className={labelClassName}>
                Did you encounter any problems or bugs while playing this game?
                Is there anything else you’d like to tell us about your experience in the experiment?
                </label>
                <textarea
                  rows={3}
                  className={inputClassName}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share any bugs or additional thoughts..."
                />
              </div>

              <div className="mb-12">
                <Button type="submit">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}