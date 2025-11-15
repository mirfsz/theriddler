import React from 'react';
import './Results.css';

function Results({ quizData, userAnswers, onStartOver, onRegenerate }) {
  // Calculate overall statistics
  const totalQuestions = userAnswers.length;
  const mcqAnswers = userAnswers.filter(a => a.type === 'mcq');
  const saqAnswers = userAnswers.filter(a => a.type === 'saq');
  
  const mcqCorrect = mcqAnswers.filter(a => a.isCorrect).length;
  const mcqScore = mcqAnswers.length > 0 ? Math.round((mcqCorrect / mcqAnswers.length) * 100) : 0;
  
  const saqTotalScore = saqAnswers.reduce((sum, a) => sum + (a.evaluation?.overall_score || 0), 0);
  const saqMaxScore = saqAnswers.length * 10;
  const saqScore = saqMaxScore > 0 ? Math.round((saqTotalScore / saqMaxScore) * 100) : 0;
  
  const overallScore = totalQuestions > 0
    ? Math.round(((mcqCorrect + (saqTotalScore / 10)) / totalQuestions) * 100)
    : 0;

  const getGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: '#10b981', message: 'Excellent!' };
    if (score >= 80) return { grade: 'A', color: '#10b981', message: 'Great job!' };
    if (score >= 70) return { grade: 'B', color: '#3b82f6', message: 'Good work!' };
    if (score >= 60) return { grade: 'C', color: '#f59e0b', message: 'Keep practicing!' };
    return { grade: 'D', color: '#ef4444', message: 'Need improvement' };
  };

  const gradeInfo = getGrade(overallScore);

  return (
    <div className="results">
      <h2>🎯 Quiz Results</h2>
      <p className="subtitle">Here's how you performed</p>

      {/* Overall Score Card */}
      <div className="score-card" style={{ borderColor: gradeInfo.color }}>
        <div className="score-circle" style={{ borderColor: gradeInfo.color }}>
          <div className="score-number" style={{ color: gradeInfo.color }}>
            {overallScore}%
          </div>
          <div className="score-grade" style={{ color: gradeInfo.color }}>
            {gradeInfo.grade}
          </div>
        </div>
        <div className="score-message">
          <h3 style={{ color: gradeInfo.color }}>{gradeInfo.message}</h3>
          <p>You answered {totalQuestions} questions</p>
        </div>
      </div>

      {/* Breakdown Stats */}
      <div className="stats-grid">
        {mcqAnswers.length > 0 && (
          <div className="stat-card">
            <div className="stat-icon">🔘</div>
            <div className="stat-content">
              <div className="stat-label">MCQ Score</div>
              <div className="stat-value">{mcqScore}%</div>
              <div className="stat-detail">
                {mcqCorrect} / {mcqAnswers.length} correct
              </div>
            </div>
          </div>
        )}

        {saqAnswers.length > 0 && (
          <div className="stat-card">
            <div className="stat-icon">✍️</div>
            <div className="stat-content">
              <div className="stat-label">SAQ Score</div>
              <div className="stat-value">{saqScore}%</div>
              <div className="stat-detail">
                {saqTotalScore.toFixed(1)} / {saqMaxScore} points
              </div>
            </div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Overall</div>
            <div className="stat-value">{overallScore}%</div>
            <div className="stat-detail">{totalQuestions} questions</div>
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="review-section">
        <h3>📋 Question Review</h3>
        <div className="review-list">
          {userAnswers.map((answer, index) => (
            <div
              key={index}
              className={`review-item ${answer.type === 'mcq' ? (answer.isCorrect ? 'correct' : 'incorrect') : 'saq'}`}
            >
              <div className="review-header">
                <div className="review-number">
                  <span className="question-num">Q{index + 1}</span>
                  <span className="question-type-badge-small">
                    {answer.type === 'mcq' ? 'MCQ' : 'SAQ'}
                  </span>
                </div>
                <div className="review-status">
                  {answer.type === 'mcq' ? (
                    answer.isCorrect ? (
                      <span className="status-badge correct">✓ Correct</span>
                    ) : (
                      <span className="status-badge incorrect">✗ Incorrect</span>
                    )
                  ) : (
                    <span className="status-badge saq">
                      {answer.evaluation?.overall_score || 0}/10
                    </span>
                  )}
                </div>
              </div>

              <div className="review-question">{answer.question}</div>

              {answer.type === 'mcq' ? (
                <div className="review-answer-mcq">
                  <div className="answer-row">
                    <span className="answer-label">Your Answer:</span>
                    <span className={answer.isCorrect ? 'answer-correct' : 'answer-wrong'}>
                      {quizData.questions[answer.questionIndex].options[answer.userAnswer]}
                    </span>
                  </div>
                  {!answer.isCorrect && (
                    <div className="answer-row">
                      <span className="answer-label">Correct Answer:</span>
                      <span className="answer-correct">
                        {quizData.questions[answer.questionIndex].options[answer.correctAnswer]}
                      </span>
                    </div>
                  )}
                  <div className="review-explanation">
                    <strong>Explanation:</strong> {answer.explanation}
                  </div>
                </div>
              ) : (
                <div className="review-answer-saq">
                  <div className="saq-your-answer">
                    <strong>Your Answer:</strong>
                    <p>{answer.userAnswer}</p>
                  </div>
                  {answer.evaluation && (
                    <>
                      <div className="saq-keywords">
                        <div className="keywords-row">
                          <span className="keywords-label">✓ Keywords Found:</span>
                          <div className="keywords-list">
                            {answer.evaluation.keywords_found.map((kw, i) => (
                              <span key={i} className="keyword found">{kw}</span>
                            ))}
                          </div>
                        </div>
                        {answer.evaluation.keywords_missing.length > 0 && (
                          <div className="keywords-row">
                            <span className="keywords-label">✗ Keywords Missing:</span>
                            <div className="keywords-list">
                              {answer.evaluation.keywords_missing.map((kw, i) => (
                                <span key={i} className="keyword missing">{kw}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="saq-feedback">
                        <strong>Feedback:</strong> {answer.evaluation.feedback}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="results-actions">
        <button className="regenerate-btn" onClick={onRegenerate}>
          🔄 Try Different Questions
        </button>
        <button className="start-over-btn" onClick={onStartOver}>
          📤 Upload New Notes
        </button>
      </div>

      {/* Tips Section */}
      <div className="tips-box">
        <h4>💡 Study Tips</h4>
        <ul>
          {overallScore < 70 && (
            <li>Review the explanations and model answers above</li>
          )}
          {saqScore < 70 && saqAnswers.length > 0 && (
            <li>Focus on including all key keywords in your SAQ answers</li>
          )}
          <li>Try generating a new quiz with different difficulty settings</li>
          <li>Practice makes perfect - keep quizzing yourself regularly!</li>
        </ul>
      </div>
    </div>
  );
}

export default Results;
