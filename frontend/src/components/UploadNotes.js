import React, { useState } from 'react';
import axios from 'axios';
import './UploadNotes.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function UploadNotes({ onComplete }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'text'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (selectedFile.size > 16 * 1024 * 1024) {
        setError('File size must be less than 16MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUploadFile = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload-notes`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        onComplete(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadText = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/upload-notes`, {
        text: text,
      });

      if (response.data.success) {
        onComplete(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (uploadMode === 'file') {
      handleUploadFile();
    } else {
      handleUploadText();
    }
  };

  return (
    <div className="upload-notes">
      <h2>📤 Upload Your Notes</h2>
      <p className="subtitle">Upload a PDF file or paste your notes as text</p>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          type="button"
          className={`mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
          onClick={() => setUploadMode('file')}
        >
          📄 Upload PDF
        </button>
        <button
          type="button"
          className={`mode-btn ${uploadMode === 'text' ? 'active' : ''}`}
          onClick={() => setUploadMode('text')}
        >
          ✏️ Paste Text
        </button>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        {uploadMode === 'file' ? (
          <div className="file-upload-section">
            <div className="file-dropzone">
              <input
                type="file"
                id="file-input"
                accept=".pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="file-input" className="file-label">
                {file ? (
                  <>
                    <span className="file-icon">📄</span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="upload-icon">☁️</span>
                    <span className="upload-text">
                      Click to upload or drag and drop
                    </span>
                    <span className="upload-hint">PDF files only (max 16MB)</span>
                  </>
                )}
              </label>
            </div>
          </div>
        ) : (
          <div className="text-upload-section">
            <textarea
              placeholder="Paste your notes here...&#10;&#10;You can include:&#10;• Definitions and key concepts&#10;• Important facts and figures&#10;• Topics with headings&#10;• Bullet points and lists"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="text-input"
              rows="12"
            />
            <div className="text-stats">
              <span>{text.length} characters</span>
              <span>{text.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>
        )}

        {error && <div className="error-message">⚠️ {error}</div>}

        <button
          type="submit"
          className="submit-btn"
          disabled={loading || (uploadMode === 'file' && !file) || (uploadMode === 'text' && !text.trim())}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            <>
              Continue →
            </>
          )}
        </button>
      </form>

      <div className="info-box">
        <h4>💡 Tips for better results:</h4>
        <ul>
          <li>Use well-structured notes with clear headings</li>
          <li>Include definitions, key concepts, and important facts</li>
          <li>Ensure text is readable (not scanned images)</li>
          <li>Notes with bullet points work great!</li>
        </ul>
      </div>
    </div>
  );
}

export default UploadNotes;
