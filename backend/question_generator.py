"""
Question Generation Module
Handles AI-powered quiz question generation using OpenAI
"""

import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))


def generate_quiz(text, segments, preferences):
    """
    Generate quiz questions based on text content and user preferences
    
    Args:
        text: Full text content
        segments: List of content segments with headings
        preferences: Dictionary with quiz preferences
        
    Returns:
        Dictionary containing quiz data with questions
    """
    # Extract preferences with defaults
    question_type = preferences.get('question_type', 'mixed')
    num_questions = preferences.get('num_questions', 10)
    difficulty = preferences.get('difficulty', 'medium')
    mcq_distractor_type = preferences.get('mcq_distractor_type', 'exam-style')
    saq_answer_style = preferences.get('saq_answer_style', 'full')
    include_hints = preferences.get('include_hints', True)
    include_section_refs = preferences.get('include_section_refs', True)
    
    # Determine question distribution
    if question_type == 'mcq':
        num_mcq = num_questions
        num_saq = 0
    elif question_type == 'saq':
        num_mcq = 0
        num_saq = num_questions
    else:  # mixed
        num_mcq = num_questions // 2
        num_saq = num_questions - num_mcq
    
    questions = []
    
    # Generate MCQs
    if num_mcq > 0:
        mcqs = generate_mcqs(text, segments, num_mcq, difficulty, mcq_distractor_type, include_hints, include_section_refs)
        questions.extend(mcqs)
    
    # Generate SAQs
    if num_saq > 0:
        saqs = generate_saqs(text, segments, num_saq, difficulty, saq_answer_style, include_hints, include_section_refs)
        questions.extend(saqs)
    
    return {
        'questions': questions,
        'total_questions': len(questions),
        'preferences': preferences,
        'text': text,
        'segments': segments
    }


def generate_mcqs(text, segments, num_questions, difficulty, distractor_type, include_hints, include_section_refs):
    """Generate Multiple Choice Questions using AI"""
    
    # Build prompt for OpenAI
    prompt = f"""You are an expert quiz generator. Based on the following educational content, create {num_questions} multiple-choice questions (MCQs).

CONTENT:
{text[:4000]}  # Limit to avoid token issues

REQUIREMENTS:
- Difficulty level: {difficulty}
- Distractor type: {distractor_type}
- Each question should have 1 correct answer and 3 distractors (wrong answers)
- {'Include a hint for each question' if include_hints else 'Do not include hints'}
- {'Include section references if applicable' if include_section_refs else 'Do not include section references'}
- If distractor_type is 'exam-style' or 'traps', include plausible wrong answers that test common misconceptions

OUTPUT FORMAT (JSON):
{{
  "questions": [
    {{
      "type": "mcq",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,  // index of correct option (0-3)
      "explanation": "Brief explanation of why this is correct",
      "hint": "Optional hint",
      "section_reference": "Section number or topic",
      "difficulty": "{difficulty}"
    }}
  ]
}}

Generate {num_questions} questions in this exact format."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert educational content creator specializing in quiz generation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get('questions', [])
        
    except Exception as e:
        print(f"Error generating MCQs: {e}")
        # Return fallback questions if API fails
        return generate_fallback_mcqs(text, num_questions, segments)


def generate_saqs(text, segments, num_questions, difficulty, answer_style, include_hints, include_section_refs):
    """Generate Short Answer Questions using AI"""
    
    prompt = f"""You are an expert quiz generator. Based on the following educational content, create {num_questions} short answer questions (SAQs).

CONTENT:
{text[:4000]}

REQUIREMENTS:
- Difficulty level: {difficulty}
- Answer style: {answer_style} ({'provide full model answers' if answer_style == 'full' else 'provide keywords only'})
- Each question should test understanding, not just memorization
- {'Include a hint for each question' if include_hints else 'Do not include hints'}
- {'Include section references if applicable' if include_section_refs else 'Do not include section references'}
- Identify 3-7 key keywords that must appear in a correct answer
- Provide marking points

OUTPUT FORMAT (JSON):
{{
  "questions": [
    {{
      "type": "saq",
      "question": "Question text?",
      "model_answer": "Complete model answer with all key points",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "marking_points": ["Point 1", "Point 2", "Point 3"],
      "hint": "Optional hint",
      "section_reference": "Section number or topic",
      "difficulty": "{difficulty}",
      "max_marks": 5
    }}
  ]
}}

Generate {num_questions} questions in this exact format."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert educational content creator specializing in quiz generation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get('questions', [])
        
    except Exception as e:
        print(f"Error generating SAQs: {e}")
        # Return fallback questions if API fails
        return generate_fallback_saqs(text, num_questions, segments)


def evaluate_saq_answer(user_answer, model_answer, keywords):
    """
    Evaluate user's SAQ answer by comparing with model answer and keywords
    
    Args:
        user_answer: User's submitted answer
        model_answer: Correct model answer
        keywords: List of essential keywords
        
    Returns:
        Dictionary with evaluation results
    """
    user_answer_lower = user_answer.lower()
    
    # Check which keywords are present
    keywords_found = []
    keywords_missing = []
    
    for keyword in keywords:
        if keyword.lower() in user_answer_lower:
            keywords_found.append(keyword)
        else:
            keywords_missing.append(keyword)
    
    # Calculate score
    total_keywords = len(keywords)
    score = len(keywords_found) / total_keywords if total_keywords > 0 else 0
    score_percentage = int(score * 100)
    
    # Use AI for more nuanced evaluation
    try:
        prompt = f"""Evaluate this student's answer compared to the model answer.

MODEL ANSWER:
{model_answer}

STUDENT'S ANSWER:
{user_answer}

KEYWORDS REQUIRED: {', '.join(keywords)}

Provide:
1. A score out of 10
2. Brief feedback on what was good
3. What was missing or could be improved
4. Whether the answer demonstrates understanding

Respond in JSON format:
{{
  "score_out_of_10": 8,
  "feedback": "Good understanding shown...",
  "strengths": ["Point 1", "Point 2"],
  "improvements": ["Missing X", "Could elaborate on Y"],
  "demonstrates_understanding": true
}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert teacher evaluating student answers."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        ai_evaluation = json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"Error in AI evaluation: {e}")
        ai_evaluation = {
            "score_out_of_10": int(score * 10),
            "feedback": "Basic keyword matching performed.",
            "strengths": [f"Included: {', '.join(keywords_found)}"] if keywords_found else [],
            "improvements": [f"Missing: {', '.join(keywords_missing)}"] if keywords_missing else [],
            "demonstrates_understanding": score > 0.6
        }
    
    return {
        'keywords_found': keywords_found,
        'keywords_missing': keywords_missing,
        'keyword_score_percentage': score_percentage,
        'ai_evaluation': ai_evaluation,
        'overall_score': ai_evaluation.get('score_out_of_10', 0),
        'feedback': ai_evaluation.get('feedback', ''),
        'demonstrates_understanding': ai_evaluation.get('demonstrates_understanding', False)
    }


def generate_fallback_mcqs(text, num_questions, segments):
    """Generate basic MCQs without AI (fallback)"""
    questions = []
    
    # Extract sentences that look like definitions or important facts
    sentences = re.split(r'[.!?]+', text)
    important_sentences = [s.strip() for s in sentences if len(s.strip()) > 40 and len(s.strip()) < 200]
    
    for i, sentence in enumerate(important_sentences[:num_questions]):
        # Create a simple fill-in-the-blank style question
        words = sentence.split()
        if len(words) > 5:
            # Remove a key word to create the question
            blank_position = len(words) // 2
            answer = words[blank_position]
            question_words = words[:blank_position] + ['______'] + words[blank_position + 1:]
            
            questions.append({
                'type': 'mcq',
                'question': ' '.join(question_words),
                'options': [answer, 'Option B', 'Option C', 'Option D'],
                'correct_answer': 0,
                'explanation': f'The correct word is "{answer}"',
                'hint': 'Think about the context',
                'section_reference': segments[0]['heading'] if segments else 'Main Content',
                'difficulty': 'medium'
            })
    
    return questions


def generate_fallback_saqs(text, num_questions, segments):
    """Generate basic SAQs without AI (fallback)"""
    questions = []
    
    for i, segment in enumerate(segments[:num_questions]):
        questions.append({
            'type': 'saq',
            'question': f"Explain the key concepts covered in: {segment.get('heading', 'this section')}",
            'model_answer': segment.get('content', '')[:300],
            'keywords': ['concept', 'definition', 'example'],
            'marking_points': ['Explanation', 'Understanding', 'Application'],
            'hint': 'Consider the main ideas discussed',
            'section_reference': segment.get('heading', ''),
            'difficulty': 'medium',
            'max_marks': 5
        })
    
    return questions


if __name__ == "__main__":
    print("Question Generator Module - Ready")
    print("Note: Requires OPENAI_API_KEY in .env file")
    print("Functions available:")
    print("  - generate_quiz(text, segments, preferences)")
    print("  - evaluate_saq_answer(user_answer, model_answer, keywords)")
