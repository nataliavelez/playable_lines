import { usePlayer, useGame } from "@empirica/core/player/classic/react";
import React, { useState } from "react";
import { Button } from "../components/Button";

export function ExitSurvey({ next }) {
  const labelClassName = "block text-sm font-medium text-gray-700 my-2";
  const inputClassName =
    "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-empirica-500 focus:border-empirica-500 sm:text-sm";
  const player = usePlayer();
  const roundsData = player.get("roundsData") || [];
  const mapNames = roundsData.map(round => round.mapName);

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [race, setRace] = useState("");
  const [performanceSelf, setPerformanceSelf] = useState("");
  const [performanceOthers, setPerformanceOthers] = useState("");
  const [feedback, setFeedback] = useState("");
  const [education, setEducation] = useState("");
  const [mapFeedback, setMapFeedback] = useState(
    Object.fromEntries(mapNames.map(name => [name, ""]))
  );
  const [gelfandTightness, setGelfandTightness] = useState({
    socialNorms: "",
    clearExpectations: "",
    behaviorAgreement: "",
    behaviorFreedom: "",
    inappropriateBehavior: "",
    normCompliance: ""
  });

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
    player.set("exitSurvey", {
      age,
      gender,
      race,
      performanceSelf,
      performanceOthers,
      feedback,
      education,
      mapFeedback,
      gelfandTightness
    });
    next();
  }

  function handleEducationChange(e) {
    setEducation(e.target.value);
  }

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <form
        className="mt-12 space-y-8 divide-y divide-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Exit Survey
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                <b>You have finished the game!</b> Now, we’ll ask you to reflect on how you played and what happened.
              </p>
            </div>
          
          <div className="space-y-8 mt-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Map Feedback</h3>
              <p className="mt-1 text-sm text-gray-500">
                For each round, tell us a bit about how you played. Did any particular problems or opportunities arise?
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {mapNames.map((mapName, index) => (
                <div key={mapName} className="space-y-2">
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
                  </div>
                </div>
              ))}
            </div>
          </div>    

          <div className="space-y-8 mt-6">
  <div>
    <h3 className="text-lg font-medium text-gray-900">Social Norms Assessment</h3>
    
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
        <div key={id} className="grid grid-cols-2 gap-4 items-center">
          <p className="text-sm text-gray-700">{text}</p>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="flex justify-center">
                <input
                  type="radio"
                  name={id}
                  value={num}
                  checked={gelfandTightness[id] === num.toString()}
                  onChange={(e) => setGelfandTightness(prev => ({
                    ...prev,
                    [id]: e.target.value
                  }))}
                  className="h-4 w-4"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

            <div className="space-y-8 mt-6">
              <div className="flex flex-row">
                <div>
                  <label htmlFor="email" className={labelClassName}>
                    Age
                  </label>
                  <div className="mt-1">
                    <input
                      id="age"
                      name="age"
                      type="number"
                      autoComplete="off"
                      className={inputClassName}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                </div>
                <div className="ml-5">
                  <label htmlFor="email" className={labelClassName}>
                    Gender
                  </label>
                  <div className="mt-1">
                    <input
                      id="gender"
                      name="gender"
                      autoComplete="off"
                      className={inputClassName}
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    />
                  </div>
                </div>
                <div className="ml-5">
                  <label htmlFor="email" className={labelClassName}>
                    Race/Ethnicity
                  </label>
                  <div className="mt-1">
                    <input
                      id="race-ethnicity"
                      name="race-ethnicity"
                      autoComplete="off"
                      className={inputClassName}
                      value={race}
                      onChange={(e) => setRace(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClassName}>
                  Highest Education Qualification
                </label>
                <div className="grid gap-2">
                  <Radio
                    selected={education}
                    name="education"
                    value="high-school"
                    label="High School"
                    onChange={handleEducationChange}
                  />
                  <Radio
                    selected={education}
                    name="education"
                    value="bachelor"
                    label="Bachelor's Degree"
                    onChange={handleEducationChange}
                  />
                  <Radio
                    selected={education}
                    name="education"
                    value="master"
                    label="Master's or higher"
                    onChange={handleEducationChange}
                  />
                  <Radio
                    selected={education}
                    name="education"
                    value="other"
                    label="Other"
                    onChange={handleEducationChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                <label className={labelClassName}>
                  How did you perform in the game? Did you cooperate/coordinate with the other players?
                </label>

                <label className={labelClassName}>
                  How about the other players? Did they cooperate/coordinate? 
                </label>

                <label className={labelClassName}>
                  Feedback, including problems or bugs you encountered.
                </label>

                <textarea
                  className={inputClassName}
                  dir="auto"
                  id="performanceSelf"
                  name="performanceSelf"
                  rows={4}
                  value={performanceSelf}
                  onChange={(e) => setPerformanceSelf(e.target.value)}
                />

                <textarea
                  className={inputClassName}
                  dir="auto"
                  id="performanceOthers"
                  name="performanceOthers"
                  rows={4}
                  value={performanceOthers}
                  onChange={(e) => setPerformanceOthers(e.target.value)}
                />

                <textarea
                  className={inputClassName}
                  dir="auto"
                  id="feedback"
                  name="feedback"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
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

export function Radio({ selected, name, value, label, onChange }) {
  return (
    <label className="text-sm font-medium text-gray-700">
      <input
        className="mr-2 shadow-sm sm:text-sm"
        type="radio"
        name={name}
        value={value}
        checked={selected === value}
        onChange={onChange}
      />
      {label}
    </label>
  );
}

// Add RadioGroup component
export function RadioGroup({ name, value, onChange }) {
  return (
    <div className="flex justify-between mt-2 space-x-2">
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <label key={num} className="flex flex-col items-center">
          <input
            type="radio"
            name={name}
            value={num}
            checked={value === num}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="form-radio h-4 w-4"
          />
          <span className="text-xs text-gray-500 mt-1">{num}</span>
        </label>
      ))}
    </div>
  );
}