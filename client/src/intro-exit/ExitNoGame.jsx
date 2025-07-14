import { usePlayer } from "@empirica/core/player/classic/react";
import React, { useState } from "react";
import { Button } from "../components/Button";

export function ExitNoGame({ next }) {
  const labelClassName = "block text-sm font-medium text-gray-700 my-2";
  const inputClassName = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-empirica-500 focus:border-empirica-500 sm:text-sm";
  
  const player = usePlayer();
  const [feedback, setFeedback] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    player.set("exitNoGame", {
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
                Thank You for Your Participation
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                We apologize, but we weren't able to start the study session today. 
              </p>
              <p className="mt-2 text-sm text-gray-500">
               This likely happened because we couldn't find enough other players in time for your session. We're sorry you didn't get to play the game.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                But don't worry, <b>you will still be paid for your participation!</b>
              </p>
            </div>

            <div className="space-y-8 mt-6">
              <div>
                <label className={labelClassName}>
                  However, if there was a technical issue, please tell us what happened during your session. This will help us improve our study and remove any possible bugs.
                </label>
                <textarea
                  required
                  rows={5}
                  className={inputClassName}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Describe any technical issues or bugs that occurred during your session..."
                />
              </div>

              <div className="mb-12">
                <Button type="submit">Submit</Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 