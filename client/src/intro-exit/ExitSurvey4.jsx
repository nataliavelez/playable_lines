import { usePlayer } from "@empirica/core/player/classic/react";
import React, { useState } from "react";
import { Button } from "../components/Button";

export function ExitSurvey4({ next }) {
  const labelClassName = "block text-sm font-medium text-gray-700 my-2";
  const inputClassName =
    "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-empirica-500 focus:border-empirica-500 sm:text-sm";
  
  const player = usePlayer();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [race, setRace] = useState("");
  const [education, setEducation] = useState("");
  const [showError, setShowError] = useState(false);


  function handleSubmit(event) {
    event.preventDefault();

    // Check if all fields are filled
    if (!age || !gender || !race || !education) {
      setShowError(true);
      return;
    }

    setShowError(false);
    player.set("exitSurvey4", {
      age,
      gender,
      race,
      education
    });
    next();
  }

  function handleEducationChange(e) {
    setEducation(e.target.value);
    setShowError(false);
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
                Finally, we’ll just ask you a few questions about yourself. 
              </p>
            </div>

            <div className="space-y-8 mt-6">
              <div className="flex flex-row">
                <div className={`${showError && !age ? "bg-red-50 p-2 rounded" : ""}`}>
                  <label htmlFor="email" className={labelClassName}>
                    Age
                  </label>
                  <div className="mt-1">
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min = "18"
                      max = "100"
                      autoComplete="off"
                      className={inputClassName}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                </div>
                <div className={`ml-5 ${showError && !gender ? "bg-red-50 p-2 rounded" : ""}`}>
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
                <div className={`ml-5 ${showError && !race ? "bg-red-50 p-2 rounded" : ""}`}>
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

              <div className={`mt-4 ${showError && !education ? "bg-red-50 p-2 rounded" : ""}`}>
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

              {showError && (
                <div className="text-red-600 text-sm mt-2">
                  Please answer all questions before continuing.
                </div>
              )}

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
