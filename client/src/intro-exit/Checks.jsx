// UnderstandingCheck.jsx
import React, { useState, useEffect } from 'react';
import { Button } from "../components/Button"; // Adjust the import path as necessary

const originalQuestions = [
  {
    question: "What is your goal in the game?",
    options: [
      "Collect as much water as possible",
      "Water as many plants as possible",
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
    correctAnswer: 2
  },
  {
    question: "Where can you get water from?",
    options: [
      "Only from wells",
      "Only from ground water",
      "From wells or ground water",
      "From plants"
    ],
    correctAnswer: 2
  },
  {
    question: "How many times can you water each plant?",
    options: [
      "Only once",
      "Twice",
      "Three times",
      "As many times as you want"
    ],
    correctAnswer: 3
  }
];

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  export function Checks({ previous, next }) {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [allCorrect, setAllCorrect] = useState(false);
  
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
    };
  
    if (questions.length === 0) {
      return <div>Loading questions...</div>;
    }
  
    return (
      <div className="mt-3 sm:mt-5 p-20">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Understanding Check
        </h3>
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="mb-6">
            <p className="text-sm font-medium text-gray-900 mb-2">{q.question}</p>
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
                  {option}
                </label>
              </div>
            ))}
            {showResults && (
              <p className={`text-sm ${answers[qIndex] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                {answers[qIndex] === q.correctAnswer ? 'Correct!' : 'Incorrect'}
              </p>
            )}
          </div>
        ))}
        {!showResults && (
          <Button handleClick={handleSubmit}>
            Submit
          </Button>
        )}
        {showResults && !allCorrect && (
          <div className="mt-4">
            <p className="text-sm text-red-600">You didn't answer all questions correctly. Please review the instructions and try again.</p>
            <Button handleClick={previous} className="mt-2">
              Back to Instructions
            </Button>
          </div>
        )}
        {showResults && allCorrect && (
          <div className="mt-4">
            <p className="text-sm text-green-600">Well done! You answered all the questions correctly.</p>
            <Button handleClick={next} className="mt-2">
              Proceed to Multiplayer Game
            </Button>
          </div>
        )}
      </div>
    );
  }