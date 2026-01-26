"""
Code extraction utilities for parsing LLM responses.
"""
import re


def extract_code(text: str) -> str:
    """Extract Python code from LLM response."""
    # Try to find Python code blocks first
    code_match = re.search(r'```python\n(.*?)```', text, re.DOTALL)
    if code_match:
        return code_match.group(1).strip()
    
    # Try generic code blocks
    code_match = re.search(r'```\n(.*?)```', text, re.DOTALL)
    if code_match:
        return code_match.group(1).strip()
    
    # If no code blocks found, try to extract the code section
    lines = text.split('\n')
    code_lines = []
    in_code = False
    
    for line in lines:
        if line.strip().startswith('from ') or line.strip().startswith('class GeneratedScene'):
            in_code = True
        if in_code:
            code_lines.append(line)
    
    if code_lines:
        return '\n'.join(code_lines).strip()
    
    # Fallback to entire text
    return text.strip()


def strip_markdown_fences(code: str) -> str:
    """Remove any lingering markdown code fences or language hints."""
    if not code:
        return code
    # Remove triple backtick blocks and any language spec after ```
    code = re.sub(r"```+\w*", "", code)
    code = code.replace("```", "")
    return code.strip()
