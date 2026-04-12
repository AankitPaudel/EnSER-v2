from openai import OpenAI
from fastapi import HTTPException
import os
import json

_server_api_key = os.getenv("OPENAI_API_KEY")


def generate_syllabus_and_rubric(
    project_title: str,
    project_description: str,
    student_name: str,
    user_api_key: str | None = None,
) -> dict:
    api_key = user_api_key or _server_api_key
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="No OpenAI API key provided. Please enter your API key in Settings.",
        )
    client = OpenAI(api_key=api_key)

    prompt = f"""
You are an academic advisor helping a professor create a structured learning plan.

Project: {project_title}
Description: {project_description}
Student: {student_name}

Generate:
1. A detailed project syllabus (learning objectives, weekly milestones, deliverables)
2. A grading rubric (criteria, point breakdown, descriptions for each grade level)

Format your response as JSON with keys: "syllabus" and "rubric"
The "syllabus" value should be a markdown-formatted string.
The "rubric" value should be a markdown-formatted string with a table.
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned an invalid response. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
