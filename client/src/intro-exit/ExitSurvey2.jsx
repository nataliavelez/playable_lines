import { usePlayer } from "@empirica/core/player/classic/react";
import React, { useState } from "react";
import { Button } from "../components/Button";

export function ExitSurvey2({ next }) {
  const [showError, setShowError] = useState(false);
  const labelClassName = "block text-sm font-medium text-gray-700 my-2";
  const inputClassName =
    "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-empirica-500 focus:border-empirica-500 sm:text-sm";
  
  const player = usePlayer();
  const roundsData = player.get("roundsData") || [];
  const mapNames = roundsData.map(round => round.mapName);
  
  const [mapFeedback, setMapFeedback] = useState(
    Object.fromEntries(mapNames.map(name => [name, ""]))
  );

  const [lineFormation, setLineFormation] = useState(
    Object.fromEntries(mapNames.map(name => [name, null]))
  );

  const [orderlyFashion, setOrderlyFashion] = useState(
    Object.fromEntries(mapNames.map(name => [name, null]))
  );

  function handleSubmit(event) {
    event.preventDefault();

    // Validate all questions are answered
    const unansweredMaps = mapNames.filter(
      name => lineFormation[name] === null || orderlyFashion[name] === null
    );
    
    if (unansweredMaps.length > 0) {
      setShowError(true);
      return;
    }

    setShowError(false);
    player.set("exitSurvey2", { 
      mapFeedback,
      lineFormation,
      orderlyFashion
     });
    next();
  }

  const LIKERT_OPTIONS = [
    "Not at all",
    "A little",
    "Somewhat",
    "A lot",
    "Completely"
  ];

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
                For each round, tell us a bit about how you played. Did any particular problems or opportunities arise?
              </p>
            </div>
            
          <div className="grid grid-cols-3 gap-6 mt-6">
            {mapNames.map((mapName, index) => (
              <div key={mapName} className="space-y-3">
                <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                  <label className={`${labelClassName} block`}>
                    <b>Round {index + 1}</b>
                  </label>
                  <img
                    src={`/assets/maps/${mapName}.png`}
                    alt={`Map: ${mapName}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <textarea
                    rows={3}
                    className={inputClassName}
                    value={mapFeedback[mapName]}
                    onChange={(e) => setMapFeedback(prev => ({
                      ...prev,
                      [mapName]: e.target.value
                    }))}
                    placeholder="Share your thoughts about this round..."
                  />
                  <div className={`mt-2 ${
                    showError && orderlyFashion[mapName] === null 
                      ? "bg-red-50 p-2 rounded" 
                      : ""
                  }`}>
                    <p className="text-sm text-gray-600 mb-3">To what extent did people collect water in an orderly fashion?</p>
                    <div className="flex justify-between items-center gap-2">
                      {LIKERT_OPTIONS.map((label, index) => (
                        <label key={index} className="flex flex-col items-center">
                          <input
                            type="radio"
                            name={`orderly-${mapName}`}
                            value={index}
                            checked={orderlyFashion[mapName] === index}
                            onChange={(e) => {
                              setOrderlyFashion(prev => ({
                                ...prev,
                                [mapName]: parseInt(e.target.value)
                              }));
                              setShowError(false);
                            }}
                            className="mb-1 scale-75"
                          />
                          <span className="text-xs text-gray-500 text-center">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={`mt-2 ${
                    showError && lineFormation[mapName] === null 
                      ? "bg-red-50 p-2 rounded" 
                      : ""
                  }`}>
                    <p className="text-sm text-gray-600 mb-3">Did players form a line in this round?</p>
                    <div className="flex justify-between items-center gap-2">
                      {LIKERT_OPTIONS.map((label, index) => (
                        <label key={index} className="flex flex-col items-center">
                          <input
                            type="radio"
                            name={`line-${mapName}`}
                            value={index}
                            checked={lineFormation[mapName] === index}
                            onChange={(e) => {
                              setLineFormation(prev => ({
                                ...prev,
                                [mapName]: parseInt(e.target.value)
                              }));
                              setShowError(false);
                            }}
                            className="mb-1 scale-75"
                          />
                          <span className="text-xs text-gray-500 text-center">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

            {showError && (
              <div className="text-red-600 text-sm mt-2">
                Please answer all Likert scale questions before continuing.
              </div>
            )}

            <div className="mt-8">
              <Button type="submit">Next</Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}