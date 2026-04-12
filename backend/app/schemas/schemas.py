from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


# ── Projects ──────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    title: str
    description: str
    department: str
    proposed_by: Optional[UUID] = None


class ProjectOut(BaseModel):
    id: int
    title: str
    description: str
    department: str
    proposed_by: Optional[UUID]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Applications ──────────────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    project_id: int
    student_id: UUID
    professor_id: UUID


class ApplicationOut(BaseModel):
    id: int
    project_id: int
    student_id: UUID
    professor_id: UUID
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Syllabus ──────────────────────────────────────────────────────────────────

class SyllabusOut(BaseModel):
    id: int
    application_id: int
    content: str
    rubric: str
    generated_at: datetime

    model_config = {"from_attributes": True}


# ── Submissions ───────────────────────────────────────────────────────────────

class SubmissionCreate(BaseModel):
    application_id: int
    file_url: str


class SubmissionOut(BaseModel):
    id: int
    application_id: int
    file_url: str
    submitted_at: datetime

    model_config = {"from_attributes": True}


# ── Grades ────────────────────────────────────────────────────────────────────

class GradeCreate(BaseModel):
    submission_id: int
    score: int
    feedback: Optional[str] = None


class GradeOut(BaseModel):
    id: int
    submission_id: int
    score: int
    feedback: Optional[str]
    graded_at: datetime

    model_config = {"from_attributes": True}
