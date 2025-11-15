# 📚 PDF Quiz Generator

A modern, AI-powered web application that transforms your PDF notes or text into interactive quizzes with MCQ (Multiple Choice Questions) and SAQ (Short Answer Questions).

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Flask](https://img.shields.io/badge/Flask-3.0.0-black)
![Python](https://img.shields.io/badge/Python-3.8+-green)

## ✨ Features

- 📄 **PDF Upload**: Upload PDF notes or paste text directly
- 🤖 **AI-Powered Questions**: Generate intelligent questions using OpenAI GPT-4
- 🎯 **Customizable Quizzes**: Choose question types, difficulty, and number of questions
- ✍️ **SAQ Evaluation**: AI evaluates short answer questions with keyword matching
- 📊 **Detailed Analytics**: Get instant feedback with score breakdowns
- 🎨 **Modern UI**: Clean, responsive design with smooth animations
- 💾 **Quiz History**: Save and track your quiz attempts

## 🏗️ Architecture

**Frontend**: React.js  
**Backend**: Python Flask  
**AI/NLP**: OpenAI API (GPT-4o-mini)  
**Database**: JSON file storage (easily upgradeable to SQLite/PostgreSQL)  
**PDF Processing**: PyPDF2 & pdfplumber

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
cd /path/to/pdf-quiz-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=your_api_key_here
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python app.py
```
Backend will run on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on: `http://localhost:3000`

### 5. Open the App

Open your browser and navigate to `http://localhost:3000`

## 📖 Usage Guide

### Step 1: Upload Notes
- Click "Upload PDF" to select a PDF file (max 16MB)
- Or click "Paste Text" to directly paste your notes

### Step 2: Customize Quiz
- **Question Type**: MCQ only, SAQ only, or Mixed
- **Number of Questions**: 5-30 questions
- **Difficulty**: Easy, Medium, or Hard
- **MCQ Distractor Type**: Simple, Exam-style, or Traps
- **SAQ Answer Style**: Keywords only or Full answers
- **Additional Options**: Hints and section references

### Step 3: Take the Quiz
- Answer questions one by one
- Get instant feedback for MCQs
- AI evaluates your SAQ answers with keyword analysis
- Use hints if available

### Step 4: View Results
- See your overall score and grade
- Review all questions with explanations
- Check which keywords you included/missed
- Try different questions or upload new notes

## 🔧 Configuration

### Backend Configuration (`.env`)

```env
OPENAI_API_KEY=your_openai_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

### Frontend Configuration

To change the API URL, update `src/components/UploadNotes.js`, `QuizPreferences.js`, and `QuizInterface.js`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

Or create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

## 📁 Project Structure

```
pdf-quiz-app/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── pdf_extractor.py       # PDF text extraction
│   ├── question_generator.py  # AI question generation
│   ├── database.py            # Data storage
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variables template
│   └── uploads/              # Temporary file storage
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadNotes.js
│   │   │   ├── QuizPreferences.js
│   │   │   ├── QuizInterface.js
│   │   │   └── Results.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## 🚢 Deployment

### Frontend Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Set environment variable:
```bash
vercel env add REACT_APP_API_URL
```

### Backend Deployment Options

#### PythonAnywhere (Easiest)
1. Create account at [pythonanywhere.com](https://www.pythonanywhere.com)
2. Upload backend files
3. Set up virtual environment
4. Configure WSGI file
5. Add OpenAI API key to environment

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
cd backend
railway login
railway init
railway up
```

#### DigitalOcean/AWS/Heroku
- Use provided Dockerfile or deploy as Python app
- Set environment variables
- Ensure all dependencies are installed

## 🔮 Future Enhancements

- [ ] User authentication and accounts
- [ ] Multi-user support with separate histories
- [ ] PostgreSQL database integration
- [ ] Spaced repetition algorithm
- [ ] Mobile app (React Native)
- [ ] Offline mode with PWA
- [ ] Export quizzes to PDF/Word
- [ ] Topic-based filtering
- [ ] Collaborative study groups
- [ ] Performance analytics dashboard

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Module not found errors
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt
```

**Problem**: OpenAI API errors
- Check your API key in `.env`
- Verify you have credits in your OpenAI account
- Check API key permissions

**Problem**: CORS errors
- Ensure `flask-cors` is installed: `pip install flask-cors`
- CORS is already configured in `app.py`

### Frontend Issues

**Problem**: Cannot connect to backend
- Ensure backend is running on port 5000
- Check `API_URL` configuration
- Verify proxy setting in `package.json`

**Problem**: Build errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/upload-notes` | POST | Upload PDF or text |
| `/generate-quiz` | POST | Generate quiz questions |
| `/evaluate-answer` | POST | Evaluate SAQ answer |
| `/history` | GET | Get quiz history |
| `/history/<id>` | GET | Get specific quiz |
| `/regenerate` | POST | Regenerate similar quiz |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 💡 Credits

Built with:
- React.js
- Flask
- OpenAI GPT-4
- Material Design principles
- Love and coffee ☕

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for students and lifelong learners**
