// UnderstandingCheck.jsx
import React, { useState, useEffect } from 'react';
import { usePlayer } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button"; // Adjust the import path as necessary

const originalQuestions = [
  {
    question: "What is your goal in the game?",
    options: [
      "Collect as much water as possible",
      "Water as many saplings as possible",
      "Just explore the environment",
      "Look at the cute bunnies"
    ],
    correctAnswer: 1
  },
  {
    question: "How many players will there be?",
    options: [
      "Only 2 players",
      "Up to 4 players",
      "Up to 8 players",
      "It's a single-player game"
    ],
    correctAnswer: 2
  },
  {
    question: "How many rounds are there in the game?",
    options: [
      "2 rounds",
      "3 rounds",
      "4 rounds",
      "5 rounds"
    ],
    correctAnswer: 3
  },
  {
    question: "Where can you get water from?",
    options: [
      "Only from wells",
      "Only from ground water",
      "From wells or ground water",
      "From saplings"
    ],
    correctAnswer: 2
  },
  {
    question: "How many times can you water each sapling?",
    options: [
      "Only once",
      "Twice",
      "Three times",
      "As many times as you want"
    ],
    correctAnswer: 3
  },
  {
    question: "What is the bonus for watering each sapling?",
    options: [
      "There is no bonus",
      "1 dollar",
      "5 cents",
      "2 cents"
    ],
    correctAnswer: 3
  }
];

const renderWithInlineImages = (text) => {
  const imageMap = {
    'sapling': "assets/sapling.png",
    'well': "assets/Water well.png",
    'ground water': "assets/Water_1.png"
  };

  return Object.entries(imageMap).reduce((acc, [keyword, imageSrc]) => {
    if (typeof acc === 'string') {
      const regex = new RegExp(`(${keyword}s?)`, 'gi');
      return acc.split(regex).map((part, index) => {
        if (part.toLowerCase().startsWith(keyword.toLowerCase())) {
          return (
            <React.Fragment key={`${keyword}-${index}`}>
              {part}
              <img 
                src={imageSrc}
                alt={`${keyword} icon`}
                className="inline-block align-text-bottom w-4 h-4 ml-1"
              />
            </React.Fragment>
          );
        }
        return part;
      });
    } else {
      return acc.map((element, index) => {
        if (typeof element !== 'string') return element;
        const regex = new RegExp(`(${keyword}s?)`, 'gi');
        const parts = element.split(regex);
        if (parts.length === 1) return element;
        
        return parts.map((part, partIndex) => {
          if (part.toLowerCase().startsWith(keyword.toLowerCase())) {
            return (
              <React.Fragment key={`${keyword}-${index}-${partIndex}`}>
                {part}
                <img 
                  src={imageSrc}
                  alt={`${keyword} icon`}
                  className="inline-block align-text-bottom w-4 h-4 ml-1"
                />
              </React.Fragment>
            );
          }
          return part;
        });
      }).flat();
    }
  }, text);
};


function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  export function Checks({ previous, next}) {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [allCorrect, setAllCorrect] = useState(false);

    // save attempts at instruction checks
    const player = usePlayer();
    const attempts = player.get("instructionCheckAttempts") || 0;
  
    useEffect(() => {
      const shuffledQuestions = originalQuestions.map(q => {
        const shuffledOptions = shuffleArray(q.options);
        return {
          ...q,
          options: shuffledOptions,
          correctAnswer: shuffledOptions.indexOf(q.options[q.correctAnswer])
        };
      });
      setQuestions(shuffledQuestions);
      setAnswers(new Array(shuffledQuestions.length).fill(null));
    }, []);
  
    const handleAnswer = (questionIndex, answerIndex) => {
      const newAnswers = [...answers];
      newAnswers[questionIndex] = answerIndex;
      setAnswers(newAnswers);
    };
  
    const handleSubmit = () => {
      if (answers.some(answer => answer === null)) {
        alert("Please answer all questions before submitting.");
        return;
      }
  
      const score = questions.reduce((acc, q, index) => 
        acc + (answers[index] === q.correctAnswer ? 1 : 0), 0);
  
      setShowResults(true);
      setAllCorrect(score === questions.length);

      // Save attempts to player state
      player.set("instructionCheckAttempts", attempts + 1);     
    };
  
    if (questions.length === 0) {
        return (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        );
      }
    
    return (
      <div className="mt-3 sm:mt-5 p-20">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Understanding Check
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">
                {renderWithInlineImages(q.question)}
              </p>
              {q.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center mb-2">
                  <input
                    type="radio"
                    id={`q${qIndex}a${oIndex}`}
                    name={`question${qIndex}`}
                    checked={answers[qIndex] === oIndex}
                    onChange={() => handleAnswer(qIndex, oIndex)}
                    className="mr-2"
                  />
                  <label htmlFor={`q${qIndex}a${oIndex}`} className="text-sm text-gray-700">
                    {renderWithInlineImages(option)}
                  </label>
                </div>
              ))}
            {showResults && (
          <p className={`text-sm ${answers[qIndex] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
            {answers[qIndex] === q.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
          </p>
            )}
          </div>
        ))}
          </div>
          {!showResults && (
            <div className="mt-6">
              <Button handleClick={handleSubmit}>
                Submit
              </Button>
            </div>
          )}
          
          {showResults && !allCorrect && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
              <p className="text-sm text-red-600">
                Not quite right. Please review your answers and try again. 
                (Attempt {attempts})
              </p>
              <Button handleClick={() => {
                setShowResults(false);
                setAnswers(new Array(questions.length).fill(null));
              }} className="mt-2">
                Try Again
              </Button>
            </div>
          )}

          {showResults && allCorrect && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-lg">
          <p className="text-sm text-green-600">Well done! You answered all the questions correctly.</p>
          <Button handleClick={next} className="mt-2">
            Proceed to Multiplayer Game
          </Button>
        </div>
          )}
        </div>
      );
    }