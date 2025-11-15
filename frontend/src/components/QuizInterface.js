import React, { useState } from 'react';
import axios from 'axios';
import './QuizInterface.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function QuizInterface({ quizData, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [saqAnswer, setSaqAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

  const handleMCQSubmit = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correct_answer;
    const answer = {
      questionIndex: currentQuestionIndex,
      type: 'mcq',
      question: currentQuestion.question,
      userAnswer: selectedOption,
      correctAnswer: currentQuestion.correct_answer,
      isCorrect: isCorrect,
      explanation: currentQuestion.explanation,
    };

    setUserAnswers([...userAnswers, answer]);
    setFeedback({
      isCorrect,
      message: isCorrect ? '✓ Correct!' : '✗ Incorrect',
      explanation: currentQuestion.explanation,
    });
    setShowFeedback(true);
  };

  const handleSAQSubmit = async () => {
    if (!saqAnswer.trim()) return;

    try {
      const response = await axios.post(`${API_URL}/evaluate-answer`, {
        user_answer: saqAnswer,
        model_answer: currentQuestion.model_answer,
        keywords: currentQuestion.keywords,
      });

      const evaluation = response.data.evaluation;
      const answer = {
        questionIndex: currentQuestionIndex,
        type: 'saq',
        question: currentQuestion.question,
        userAnswer: saqAnswer,
        modelAnswer: currentQuestion.model_answer,
        evaluation: evaluation,
      };

      setUserAnswers([...userAnswers, answer]);
      setFeedback({
        evaluation,
        message: `Score: ${evaluation.overall_score}/10`,
      });
      setShowFeedback(true);
    } catch (err) {
      console.error('Error evaluating SAQ:', err);
      // Fallback evaluation
      const answer = {
        questionIndex: currentQuestionIndex,
        type: 'saq',
        question: currentQuestion.question,
        userAnswer: saqAnswer,
        modelAnswer: currentQuestion.model_answer,
        evaluation: { overall_score: 0, feedback: 'Error evaluating answer' },
      };
      setUserAnswers([...userAnswers, answer]);
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(userAnswers);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setSaqAnswer('');
      setShowHint(false);
      setShowFeedback(false);
      setFeedback(null);
    }
  };

  const handleSubmit = () => {
    if (currentQuestion.type === 'mcq') {
      handleMCQSubmit();
    } else {
      handleSAQSubmit();
    }
  };

  return (
    <div className="quiz-interface">
      {/* Progress Bar */}
      <div className="quiz-progress">
        <div className="progress-info">
          <span className="progress-text">
            Question {currentQuestionIndex + 1} of {quizData.questions.length}
          </span>
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="question-card">
        {/* Question Header */}
        <div className="question-header">
          <span className="question-type-badge">
            {currentQuestion.type === 'mcq' ? '🔘 MCQ' : '✍️ SAQ'}
          </span>
          {currentQuestion.difficulty && (
            <span className={`difficulty-badge ${currentQuestion.difficulty}`}>
              {currentQuestion.difficulty}
            </span>
          )}
        </div>

        {/* Question Text */}
        <div className="question-text">
          <h3>{currentQuestion.question}</h3>
          {currentQuestion.section_reference && (
            <div className="section-ref">
              📍 Section: {currentQuestion.section_reference}
            </div>
          )}
        </div>

        {/* Answer Section */}
        {!showFeedback ? (
          <div className="answer-section">
            {currentQuestion.type === 'mcq' ? (
              <div className="mcq-options">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`option-label ${selectedOption === index ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="mcq-option"
                      value={index}
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="saq-input">
                <textarea
                  placeholder="Type your answer here..."
                  value={saqAnswer}
                  onChange={(e) => setSaqAnswer(e.target.value)}
                  rows="6"
                  className="answer-textarea"
                />
                <div className="saq-stats">
                  <span>{saqAnswer.split(/\s+/).filter(Boolean).length} words</span>
                  {currentQuestion.keywords && (
                    <span className="keywords-hint">
                      💡 Include {currentQuestion.keywords.length} key points
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Hint Button */}
            {currentQuestion.hint && (
              <div className="hint-section">
                <button
                  className="hint-btn"
                  onClick={() => setShowHint(!showHint)}
                >
                  {showHint ? '🔼 Hide Hint' : '💡 Show Hint'}
                </button>
                {showHint && (
                  <div className="hint-content">{currentQuestion.hint}</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="feedback-section">
            {currentQuestion.type === 'mcq' ? (
              <div className={`feedback-card ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="feedback-header">
                  <span className="feedback-icon">
                    {feedback.isCorrect ? '✓' : '✗'}
                  </span>
                  <span className="feedback-message">{feedback.message}</span>
                </div>
                <div className="feedback-explanation">
                  <strong>Explanation:</strong> {feedback.explanation}
                </div>
                <div className="correct-answer-info">
                  <strong>Correct Answer:</strong>{' '}
                  {currentQuestion.options[currentQuestion.correct_answer]}
                </div>
              </div>
            ) : (
              <div className="feedback-card saq-feedback">
                <div className="feedback-header">
                  <span className="feedback-icon">📊</span>
                  <span className="feedback-message">{feedback.message}</span>
                </div>
                
                {feedback.evaluation && (
                  <>
                    <div className="keyword-analysis">
                      <h4>Keyword Analysis:</h4>
                      <div className="keywords-grid">
                        <div className="keywords-found">
                          <span className="keywords-label">✓ Found:</span>
                          {feedback.evaluation.keywords_found.map((kw, i) => (
                            <span key={i} className="keyword found">{kw}</span>
                          ))}
                        </div>
                        {feedback.evaluation.keywords_missing.length > 0 && (
                          <div className="keywords-missing">
                            <span className="keywords-label">✗ Missing:</span>
                            {feedback.evaluation.keywords_missing.map((kw, i) => (
                              <span key={i} className="keyword missing">{kw}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ai-feedback">
                      <h4>AI Feedback:</h4>
                      <p>{feedback.evaluation.feedback}</p>
                    </div>

                    <div className="model-answer">
                      <h4>Model Answer:</h4>
                      <p>{currentQuestion.model_answer}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="question-actions">
          {!showFeedback ? (
            <button
              className="submit-answer-btn"
              onClick={handleSubmit}
              disabled={
                (currentQuestion.type === 'mcq' && selectedOption === null) ||
                (currentQuestion.type === 'saq' && !saqAnswer.trim())
              }
            >
              Submit Answer
            </button>
          ) : (
            <button className="next-btn" onClick={handleNext}>
              {isLastQuestion ? 'View Results 🎯' : 'Next Question →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizInterface;
