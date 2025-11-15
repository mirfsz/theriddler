import React, { useState } from 'react';
import './App.css';
import UploadNotes from './components/UploadNotes';
import QuizPreferences from './components/QuizPreferences';
import QuizInterface from './components/QuizInterface';
import Results from './components/Results';

function App() {
  const [currentStep, setCurrentStep] = useState('upload'); // upload, preferences, quiz, results
  const [uploadedData, setUploadedData] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);

  const handleUploadComplete = (data) => {
    setUploadedData(data);
    setCurrentStep('preferences');
  };

  const handleQuizGenerated = (quiz) => {
    setQuizData(quiz);
    setCurrentStep('quiz');
  };

  const handleQuizComplete = (answers) => {
    setUserAnswers(answers);
    setCurrentStep('results');
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setUploadedData(null);
    setQuizData(null);
    setUserAnswers([]);
  };

  const handleRegenerateQuiz = () => {
    setCurrentStep('preferences');
    setQuizData(null);
    setUserAnswers([]);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <h1>📚 PDF Quiz Generator</h1>
          <p>Transform your notes into interactive quizzes</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {/* Progress Indicator */}
          <div className="progress-indicator">
            <div className={`step ${currentStep === 'upload' ? 'active' : currentStep !== 'upload' ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Upload</div>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${currentStep === 'preferences' ? 'active' : ['quiz', 'results'].includes(currentStep) ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Preferences</div>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${currentStep === 'quiz' ? 'active' : currentStep === 'results' ? 'completed' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Quiz</div>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${currentStep === 'results' ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-label">Results</div>
            </div>
          </div>

          {/* Current Step Component */}
          <div className="step-content fade-in">
            {currentStep === 'upload' && (
              <UploadNotes onComplete={handleUploadComplete} />
            )}

            {currentStep === 'preferences' && (
              <QuizPreferences
                uploadedData={uploadedData}
                onGenerate={handleQuizGenerated}
                onBack={() => setCurrentStep('upload')}
              />
            )}

            {currentStep === 'quiz' && (
              <QuizInterface
                quizData={quizData}
                onComplete={handleQuizComplete}
              />
            )}

            {currentStep === 'results' && (
              <Results
                quizData={quizData}
                userAnswers={userAnswers}
                onStartOver={handleStartOver}
                onRegenerate={handleRegenerateQuiz}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>Built with ❤️ using React & Flask | AI-Powered Quiz Generation</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
