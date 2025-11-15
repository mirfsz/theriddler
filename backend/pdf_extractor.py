"""
PDF Text Extraction and Segmentation Module
Handles PDF parsing, text cleaning, and content segmentation
"""

import re
import pdfplumber
from PyPDF2 import PdfReader


def extract_text_from_pdf(filepath):
    """
    Extract text from PDF file using multiple methods for robustness
    
    Args:
        filepath: Path to PDF file
        
    Returns:
        Extracted text as string
    """
    text = ""
    
    try:
        # Primary method: pdfplumber (better formatting)
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
    except Exception as e:
        print(f"pdfplumber failed: {e}, trying PyPDF2...")
        
        # Fallback method: PyPDF2
        try:
            reader = PdfReader(filepath)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        except Exception as e2:
            raise Exception(f"Failed to extract text from PDF: {e2}")
    
    if not text.strip():
        raise Exception("No text could be extracted from PDF. The PDF might be image-based or corrupted.")
    
    return text


def clean_text(text):
    """
    Clean extracted text by removing artifacts and normalizing formatting
    
    Args:
        text: Raw extracted text
        
    Returns:
        Cleaned text
    """
    # Remove page numbers (common patterns)
    text = re.sub(r'\n\s*\d+\s*\n', '\n', text)
    text = re.sub(r'Page\s+\d+', '', text, flags=re.IGNORECASE)
    
    # Remove excessive whitespace
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    text = re.sub(r' +', ' ', text)
    
    # Remove common header/footer artifacts
    text = re.sub(r'\n[-_=]{3,}\n', '\n', text)
    
    # Normalize line breaks
    text = text.strip()
    
    return text


def detect_heading(line):
    """
    Detect if a line is likely a heading/title
    
    Args:
        line: Text line to analyze
        
    Returns:
        Boolean indicating if line is a heading
    """
    line = line.strip()
    
    if not line:
        return False
    
    # Patterns that suggest headings
    heading_patterns = [
        r'^[0-9]+\.',  # Numbered headings: "1. Introduction"
        r'^[0-9]+\.[0-9]+',  # Sub-numbered: "1.1 Overview"
        r'^[A-Z][A-Z\s]+$',  # ALL CAPS
        r'^Chapter\s+\d+',  # Chapter headings
        r'^Section\s+\d+',  # Section headings
        r'^[IVX]+\.',  # Roman numerals
    ]
    
    for pattern in heading_patterns:
        if re.match(pattern, line, re.IGNORECASE):
            return True
    
    # Short lines that are capitalized and end without punctuation
    if len(line) < 80 and line[0].isupper() and not line.endswith(('.', ',', ';')):
        words = line.split()
        # If most words are capitalized, likely a heading
        capitalized = sum(1 for w in words if w and w[0].isupper())
        if capitalized / len(words) > 0.5:
            return True
    
    return False


def clean_and_segment_text(raw_text):
    """
    Clean text and break it into meaningful segments (topics/sections)
    
    Args:
        raw_text: Raw extracted text
        
    Returns:
        List of segments with headings and content
    """
    # Clean the text first
    text = clean_text(raw_text)
    
    lines = text.split('\n')
    segments = []
    current_segment = {
        'heading': None,
        'content': [],
        'section_number': None
    }
    
    for line in lines:
        line = line.strip()
        
        if not line:
            continue
        
        # Check if line is a heading
        if detect_heading(line):
            # Save previous segment if it has content
            if current_segment['content']:
                current_segment['content'] = '\n'.join(current_segment['content'])
                segments.append(current_segment)
            
            # Start new segment
            section_match = re.match(r'^([0-9]+(?:\.[0-9]+)*)', line)
            current_segment = {
                'heading': line,
                'content': [],
                'section_number': section_match.group(1) if section_match else None
            }
        else:
            # Add to current segment content
            current_segment['content'].append(line)
    
    # Don't forget the last segment
    if current_segment['content']:
        current_segment['content'] = '\n'.join(current_segment['content'])
        segments.append(current_segment)
    
    # If no headings were detected, create one big segment
    if not segments:
        segments.append({
            'heading': 'Main Content',
            'content': text,
            'section_number': None
        })
    
    return segments


def extract_key_concepts(text, max_concepts=20):
    """
    Extract potential key concepts, definitions, and important terms
    
    Args:
        text: Text to analyze
        max_concepts: Maximum number of concepts to extract
        
    Returns:
        List of key concepts
    """
    concepts = []
    
    # Pattern: "X is defined as Y" or "X is Y"
    definition_pattern = r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|are|refers to|means|defined as)\s+(.+?)(?:\.|;|\n)'
    matches = re.finditer(definition_pattern, text)
    
    for match in matches:
        term = match.group(1).strip()
        definition = match.group(2).strip()
        concepts.append({
            'term': term,
            'definition': definition,
            'type': 'definition'
        })
    
    # Pattern: Bullet points or numbered lists (often contain key points)
    bullet_pattern = r'(?:^|\n)(?:[•\-\*]|\d+\.)\s+(.+?)(?:\n|$)'
    bullet_matches = re.finditer(bullet_pattern, text)
    
    for match in bullet_matches:
        point = match.group(1).strip()
        if len(point) > 20:  # Filter out very short items
            concepts.append({
                'term': point[:50] + '...' if len(point) > 50 else point,
                'definition': point,
                'type': 'key_point'
            })
    
    # Limit results
    return concepts[:max_concepts]


if __name__ == "__main__":
    # Test the module
    print("PDF Extractor Module - Ready")
    print("Functions available:")
    print("  - extract_text_from_pdf(filepath)")
    print("  - clean_and_segment_text(raw_text)")
    print("  - extract_key_concepts(text)")
