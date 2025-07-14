import { usePlayer } from "@empirica/core/player/classic/react";
import React, { useState } from "react";
import { Button } from "../components/Button";

export function ExitSurvey3({ next }) {
  const player = usePlayer();
  const [gelfandTightness, setGelfandTightness] = useState({
    socialNorms: "",
    clearExpectations: "",
    behaviorAgreement: "",
    behaviorFreedom: "",
    inappropriateBehavior: "",
    normCompliance: ""
  });
  const [showError, setShowError] = useState(false);

  const gelfandQuestions = [
    {
      id: "socialNorms",
      text: "There are many social norms that people are supposed to abide by in this country."
    },
    {
      id: "clearExpectations",
      text: "In this country, there are very clear expectations for how people should act in most situations."
    },
    {
      id: "behaviorAgreement",
      text: "People agree upon what behaviors are appropriate versus inappropriate in most situations this country."
    },
    {
      id: "behaviorFreedom",
      text: "People in this country have a great deal of freedom in deciding how they want to behave in most situations."
    },
    {
      id: "inappropriateBehavior",
      text: "In this country, if someone acts in an inappropriate way, others will strongly disapprove."
    },
    {
      id: "normCompliance",
      text: "People in this country almost always comply with social norms."
    }
  ];

  function handleSubmit(event) {
    event.preventDefault();

    // Check if all questions are answered
    const isComplete = Object.values(gelfandTightness).every(value => value !== "");
    
    if (!isComplete) {
      setShowError(true);
      return;
    }
    
    setShowError(false);
    player.set("exitSurvey3", { gelfandTightness });
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
                Please indicate how much you agree or disagree with each statement.
              </p>
            </div>

            {/* Scale labels - only above radio buttons */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div></div> {/* Empty space above question text */}
              <div className="grid grid-cols-6 gap-2">
                {[
                  ['Strongly', 'Disagree'],
                  ['Moderately', 'Disagree'],
                  ['Slightly', 'Disagree'],
                  ['Slightly', 'Agree'],
                  ['Moderately', 'Agree'],
                  ['Strongly', 'Agree']
                ].map(([line1, line2], i) => (
                  <div key={i} className="flex flex-col items-center space-y-0.5">
                    <span className="text-xs text-gray-500">{line1}</span>
                    <span className="text-xs text-gray-500">{line2}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {gelfandQuestions.map(({ id, text }) => (
                <div key={id} className={`grid grid-cols-2 gap-4 items-center ${showError && gelfandTightness[id] === "" ? "bg-red-50 p-2 rounded" : ""}`}>
                  <p className="text-sm text-gray-700">{text}</p>
                  <div className="grid grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <div key={num} className="flex justify-center">
                        <input
                          type="radio"
                          name={id}
                          value={num}
                          checked={gelfandTightness[id] === num.toString()}
                          onChange={(e) => {
                            setGelfandTightness(prev => ({
                              ...prev,
                              [id]: e.target.value
                            }));
                            setShowError(false);
                          }}
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {showError && (
              <div className="text-red-600 text-sm mt-2">
                Please answer all questions before continuing.
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