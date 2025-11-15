import React, { useState } from 'react';
import axios from 'axios';
import './QuizPreferences.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function QuizPreferences({ uploadedData, onGenerate, onBack }) {
  const [preferences, setPreferences] = useState({
    question_type: 'mixed',
    num_questions: 10,
    difficulty: 'medium',
    mcq_distractor_type: 'exam-style',
    saq_answer_style: 'full',
    include_hints: true,
    include_section_refs: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/generate-quiz`, {
        text: uploadedData.raw_text,
        segments: uploadedData.segments,
        preferences: preferences,
      });

      if (response.data.success) {
        onGenerate(response.data.quiz);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-preferences">
      <h2>⚙️ Customize Your Quiz</h2>
      <p className="subtitle">Adjust settings to match your study needs</p>

      {/* Document Info */}
      <div className="doc-info">
        <div className="info-item">
          <span className="info-label">Topics Found:</span>
          <span className="info-value">{uploadedData.topics?.length || 0}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Word Count:</span>
          <span className="info-value">{uploadedData.word_count || 0}</span>
        </div>
      </div>

      <div className="preferences-form">
        {/* Question Type */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📝</span>
            Question Type
          </label>
          <div className="radio-group">
            <label className={`radio-option ${preferences.question_type === 'mcq' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="question_type"
                value="mcq"
                checked={preferences.question_type === 'mcq'}
                onChange={(e) => handleChange('question_type', e.target.value)}
              />
              <div className="option-content">
                <div className="option-title">MCQ Only</div>
                <div className="option-desc">Multiple choice questions</div>
              </div>
            </label>
            <label className={`radio-option ${preferences.question_type === 'saq' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="question_type"
                value="saq"
                checked={preferences.question_type === 'saq'}
                onChange={(e) => handleChange('question_type', e.target.value)}
              />
              <div className="option-content">
                <div className="option-title">SAQ Only</div>
                <div className="option-desc">Short answer questions</div>
              </div>
            </label>
            <label className={`radio-option ${preferences.question_type === 'mixed' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="question_type"
                value="mixed"
                checked={preferences.question_type === 'mixed'}
                onChange={(e) => handleChange('question_type', e.target.value)}
              />
              <div className="option-content">
                <div className="option-title">Mixed</div>
                <div className="option-desc">Both MCQ and SAQ</div>
              </div>
            </label>
          </div>
        </div>

        {/* Number of Questions */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🔢</span>
            Number of Questions: <strong>{preferences.num_questions}</strong>
          </label>
          <input
            type="range"
            min="5"
            max="30"
            step="5"
            value={preferences.num_questions}
            onChange={(e) => handleChange('num_questions', parseInt(e.target.value))}
            className="slider"
          />
          <div className="slider-labels">
            <span>5</span>
            <span>15</span>
            <span>30</span>
          </div>
        </div>

        {/* Difficulty */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📊</span>
            Difficulty Level
          </label>
          <div className="button-group">
            <button
              type="button"
              className={`group-btn ${preferences.difficulty === 'easy' ? 'active' : ''}`}
              onClick={() => handleChange('difficulty', 'easy')}
            >
              Easy
            </button>
            <button
              type="button"
              className={`group-btn ${preferences.difficulty === 'medium' ? 'active' : ''}`}
              onClick={() => handleChange('difficulty', 'medium')}
            >
              Medium
            </button>
            <button
              type="button"
              className={`group-btn ${preferences.difficulty === 'hard' ? 'active' : ''}`}
              onClick={() => handleChange('difficulty', 'hard')}
            >
              Hard
            </button>
          </div>
        </div>

        {/* MCQ Settings (if applicable) */}
        {preferences.question_type !== 'saq' && (
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🎯</span>
              MCQ Distractor Type
            </label>
            <select
              value={preferences.mcq_distractor_type}
              onChange={(e) => handleChange('mcq_distractor_type', e.target.value)}
              className="select-input"
            >
              <option value="simple">Simple - Basic wrong answers</option>
              <option value="exam-style">Exam Style - Realistic distractors</option>
              <option value="traps">Traps - Test common misconceptions</option>
            </select>
          </div>
        )}

        {/* SAQ Settings (if applicable) */}
        {preferences.question_type !== 'mcq' && (
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">✍️</span>
              SAQ Answer Style
            </label>
            <select
              value={preferences.saq_answer_style}
              onChange={(e) => handleChange('saq_answer_style', e.target.value)}
              className="select-input"
            >
              <option value="keywords">Keywords Only - Show key points</option>
              <option value="full">Full Answer - Complete model answer</option>
            </select>
          </div>
        )}

        {/* Additional Options */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">💡</span>
            Additional Options
          </label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.include_hints}
                onChange={(e) => handleChange('include_hints', e.target.checked)}
              />
              <span>Include hints for each question</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.include_section_refs}
                onChange={(e) => handleChange('include_section_refs', e.target.checked)}
              />
              <span>Show section references</span>
            </label>
          </div>
        </div>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      <div className="action-buttons">
        <button className="back-btn" onClick={onBack} disabled={loading}>
          ← Back
        </button>
        <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Generating Quiz...
            </>
          ) : (
            <>
              Generate Quiz 🚀
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default QuizPreferences;
