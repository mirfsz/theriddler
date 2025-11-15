from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
from pdf_extractor import extract_text_from_pdf, clean_and_segment_text
from question_generator import generate_quiz, evaluate_saq_answer
from database import QuizHistory

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize database
quiz_history = QuizHistory()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'PDF-to-Quiz API is running'
    })


@app.route('/upload-notes', methods=['POST'])
def upload_notes():
    """
    Upload PDF file(s) or raw text
    Returns: extracted text, topics, and segments
    """
    try:
        # Handle PDF file upload
        if 'file' in request.files:
            file = request.files['file']
            
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            if not file.filename.endswith('.pdf'):
                return jsonify({'error': 'Only PDF files are supported'}), 400
            
            # Save file temporarily
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(filepath)
            
            # Extract text from PDF
            raw_text = extract_text_from_pdf(filepath)
            
            # Clean up file after extraction
            os.remove(filepath)
            
        # Handle raw text input
        elif request.json and 'text' in request.json:
            raw_text = request.json['text']
        else:
            return jsonify({'error': 'No file or text provided'}), 400
        
        # Clean and segment the text
        segments = clean_and_segment_text(raw_text)
        
        # Extract topics from segments
        topics = [seg['heading'] for seg in segments if seg['heading']]
        
        return jsonify({
            'success': True,
            'raw_text': raw_text[:500] + '...' if len(raw_text) > 500 else raw_text,
            'segments': segments,
            'topics': topics,
            'word_count': len(raw_text.split())
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/generate-quiz', methods=['POST'])
def generate_quiz_endpoint():
    """
    Generate quiz based on user preferences
    
    Expected input:
    {
        "text": "content...",
        "segments": [...],
        "preferences": {
            "question_type": "mixed",  // mcq, saq, mixed
            "num_questions": 10,
            "difficulty": "medium",  // easy, medium, hard
            "mcq_distractor_type": "exam-style",
            "saq_answer_style": "full",  // keywords, full
            "include_hints": true,
            "include_section_refs": true
        }
    }
    """
    try:
        data = request.json
        text = data.get('text', '')
        segments = data.get('segments', [])
        preferences = data.get('preferences', {})
        
        if not text and not segments:
            return jsonify({'error': 'No content provided'}), 400
        
        # Generate quiz using AI
        quiz_data = generate_quiz(text, segments, preferences)
        
        # Save to history
        quiz_id = quiz_history.save_quiz(quiz_data, preferences)
        quiz_data['quiz_id'] = quiz_id
        
        return jsonify({
            'success': True,
            'quiz': quiz_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/evaluate-answer', methods=['POST'])
def evaluate_answer():
    """
    Evaluate user's SAQ answer
    
    Expected input:
    {
        "user_answer": "...",
        "model_answer": "...",
        "keywords": [...]
    }
    """
    try:
        data = request.json
        user_answer = data.get('user_answer', '')
        model_answer = data.get('model_answer', '')
        keywords = data.get('keywords', [])
        
        evaluation = evaluate_saq_answer(user_answer, model_answer, keywords)
        
        return jsonify({
            'success': True,
            'evaluation': evaluation
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/history', methods=['GET'])
def get_history():
    """Get quiz history"""
    try:
        history = quiz_history.get_all()
        return jsonify({
            'success': True,
            'history': history
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/history/<quiz_id>', methods=['GET'])
def get_quiz_by_id(quiz_id):
    """Get specific quiz by ID"""
    try:
        quiz = quiz_history.get_by_id(quiz_id)
        if quiz:
            return jsonify({
                'success': True,
                'quiz': quiz
            })
        else:
            return jsonify({'error': 'Quiz not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/regenerate', methods=['POST'])
def regenerate_quiz():
    """
    Regenerate quiz with similar parameters
    
    Expected input:
    {
        "quiz_id": "..."
    }
    """
    try:
        data = request.json
        quiz_id = data.get('quiz_id')
        
        if not quiz_id:
            return jsonify({'error': 'Quiz ID required'}), 400
        
        # Get original quiz
        original_quiz = quiz_history.get_by_id(quiz_id)
        if not original_quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        # Regenerate with same parameters
        text = original_quiz.get('text', '')
        segments = original_quiz.get('segments', [])
        preferences = original_quiz.get('preferences', {})
        
        new_quiz = generate_quiz(text, segments, preferences)
        new_quiz_id = quiz_history.save_quiz(new_quiz, preferences)
        new_quiz['quiz_id'] = new_quiz_id
        
        return jsonify({
            'success': True,
            'quiz': new_quiz
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("🚀 PDF-to-Quiz Backend Starting...")
    print("📝 API will be available at: http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)
